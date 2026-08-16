"""
gnn_scorer.py — Lightweight GNN Inference Module for Crypto-Sentinel API
Loads pre-computed GraphSAGE node embeddings and computes fraud similarity score.

KEY DESIGN: No PyTorch required at runtime!
- Training happens in Colab (PyTorch + PyG)
- Inference here uses only numpy + sklearn (fast, CPU-only, deployable anywhere)

Files required (place in app/):
  - gnn_embeddings.pkl       : {account_id: embedding_vector} lookup dict
  - gnn_hybrid_model.joblib  : Gradient Boosting classifier

Usage in main.py:
    from app.gnn_scorer import gnn_scorer
    gnn_scorer.load()
    score = gnn_scorer.score(sender_account, dest_account, features_dict)
"""

import os
import pickle
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger("gnn_scorer")

BASE_DIR = Path(__file__).resolve().parent.parent


class GNNScorer:
    """
    Lightweight GNN inference engine.
    Loads pre-computed GraphSAGE node embeddings + Hybrid classifier.
    Computes fraud probability without requiring PyTorch at runtime.
    """

    def __init__(self):
        self.embeddings: dict = {}          # account_id -> np.ndarray (32-dim)
        self.hybrid_model = None            # sklearn GradientBoosting classifier
        self.scaler = None                  # StandardScaler from training
        self.fraud_centroid: np.ndarray = None  # Mean embedding of fraud nodes
        self.tabular_cols: list = []
        self.metadata: dict = {}
        self.loaded: bool = False
        self.embedding_dim: int = 32
        self.gnn_weight: float = 0.6        # Weight for GNN score in hybrid formula
        self.rule_weight: float = 0.4       # Weight for Rule Engine score in hybrid formula

    def load(self) -> bool:
        """
        Load embedding lookup dict and hybrid model from app/ directory.
        Returns True if both files loaded successfully.
        """
        emb_path   = BASE_DIR / "app" / "gnn_embeddings.pkl"
        model_path = BASE_DIR / "app" / "gnn_hybrid_model.joblib"

        if not emb_path.exists():
            logger.warning(f"[GNN] gnn_embeddings.pkl not found at {emb_path}")
            logger.warning("[GNN] Fallback: API will use RF-only scoring")
            return False

        if not model_path.exists():
            logger.warning(f"[GNN] gnn_hybrid_model.joblib not found at {model_path}")
            return False

        try:
            import joblib

            # Load embeddings
            with open(emb_path, "rb") as f:
                payload = pickle.load(f)

            # Support both formats: raw dict or {embeddings: ..., metadata: ...}
            if isinstance(payload, dict) and "embeddings" in payload:
                raw_embeddings = payload["embeddings"]
                self.metadata  = payload.get("metadata", {})
            else:
                raw_embeddings = payload
                self.metadata  = {}

            # Convert lists to numpy arrays
            self.embeddings = {
                acc: np.array(vec, dtype=np.float32)
                for acc, vec in raw_embeddings.items()
            }

            # Update config from metadata
            self.embedding_dim = self.metadata.get("embedding_dim", 32)
            hybrid_weights = self.metadata.get("hybrid_weights", {})
            self.gnn_weight  = hybrid_weights.get("gnn", 0.6)
            self.rule_weight = hybrid_weights.get("rule_engine", 0.4)

            # Compute fraud centroid from metadata or embeddings
            centroid_raw = self.metadata.get("fraud_centroid")
            if centroid_raw:
                self.fraud_centroid = np.array(centroid_raw, dtype=np.float32)

            # Load hybrid model bundle
            model_bundle = joblib.load(model_path)
            if isinstance(model_bundle, dict):
                self.hybrid_model  = model_bundle.get("model")
                self.scaler        = model_bundle.get("scaler")
                self.tabular_cols  = model_bundle.get("tabular_cols", [])
            else:
                # Raw model (fallback)
                self.hybrid_model = model_bundle

            self.loaded = True
            n_accounts = len(self.embeddings)
            logger.info(f"[GNN] Loaded {n_accounts:,} node embeddings (dim={self.embedding_dim})")
            logger.info(f"[GNN] Hybrid weights: GNN={self.gnn_weight:.0%}, Rule={self.rule_weight:.0%}")
            print(f"[FDS API] GNN Scorer loaded: {n_accounts:,} accounts, dim={self.embedding_dim}, "
                  f"weights=GNN{self.gnn_weight:.0%}/Rule{self.rule_weight:.0%}")
            return True

        except Exception as e:
            logger.error(f"[GNN] Failed to load: {e}")
            print(f"[FDS API Warning] GNN Scorer load failed: {e} — using RF fallback")
            return False

    def get_embedding(self, account_id: str) -> np.ndarray:
        """
        Return 32-dim embedding for an account.
        Returns zero vector for unknown accounts (new nodes — inductive property).
        """
        return self.embeddings.get(str(account_id), np.zeros(self.embedding_dim, dtype=np.float32))

    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Cosine similarity between two vectors [-1, 1] -> normalized to [0, 1]"""
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a == 0 or norm_b == 0:
            return 0.0
        sim = np.dot(a, b) / (norm_a * norm_b)
        return float((sim + 1.0) / 2.0)  # Normalize to [0, 1]

    def score(
        self,
        sender_account: str,
        dest_account: str,
        tabular_features: dict = None
    ) -> float:
        """
        Compute GNN-based fraud probability for a transaction.

        Args:
            sender_account: Account ID of the sender
            dest_account: Account ID of the receiver
            tabular_features: Dict of additional features (amount_ratio, etc.)

        Returns:
            float: Fraud probability [0.0, 1.0]
                   0.0 = definitely normal
                   1.0 = definitely fraud
        """
        if not self.loaded:
            return 0.0

        try:
            sender_emb = self.get_embedding(sender_account)
            recv_emb   = self.get_embedding(dest_account)

            # ── Scoring Method 1: Hybrid model (if loaded) ────────────────
            if self.hybrid_model is not None and tabular_features:
                # Build tabular feature vector
                tab_cols = self.tabular_cols or [
                    "amount_ratio", "is_balance_drained", "is_transfer_or_cashout",
                    "is_high_amount", "dest_balance_err", "amount", "oldbalanceOrg", "newbalanceOrig"
                ]
                tab_vec = np.array(
                    [float(tabular_features.get(c, 0.0)) for c in tab_cols],
                    dtype=np.float32
                )

                # Concatenate: [sender(32) | recv(32) | tabular(8)] = 72 dims
                combined = np.concatenate([sender_emb, recv_emb, tab_vec]).reshape(1, -1)

                prob = float(self.hybrid_model.predict_proba(combined)[0][1])
                return min(max(prob, 0.0), 1.0)

            # ── Scoring Method 2: Fraud centroid similarity (fallback) ────
            # If no hybrid model, use similarity to known fraud centroid
            if self.fraud_centroid is not None:
                # Higher similarity to fraud centroid = higher fraud probability
                sender_fraud_sim = self._cosine_similarity(sender_emb, self.fraud_centroid)
                recv_fraud_sim   = self._cosine_similarity(recv_emb, self.fraud_centroid)

                # Weighted: sender is more important
                fraud_score = 0.7 * sender_fraud_sim + 0.3 * recv_fraud_sim
                return float(min(max(fraud_score, 0.0), 1.0))

            # ── Scoring Method 3: Sender is unknown node ──────────────────
            # Both accounts are new/unknown → low base risk from GNN perspective
            return 0.1

        except Exception as e:
            logger.error(f"[GNN] Score computation failed: {e}")
            return 0.0

    def compute_hybrid_final_score(
        self,
        rule_engine_score: int,
        sender_account: str,
        dest_account: str,
        tabular_features: dict = None
    ) -> dict:
        """
        Compute the final hybrid score combining GNN + Rule Engine.

        Formula: final_score = (gnn_weight × gnn_score) + (rule_weight × rule_score)

        Returns dict with:
            - gnn_score: int (0-100)
            - rule_score: int (0-100)
            - hybrid_score: int (0-100)
            - gnn_loaded: bool
        """
        if not self.loaded:
            # GNN not available — fallback to rule engine score
            return {
                "gnn_score": 0,
                "rule_score": rule_engine_score,
                "hybrid_score": rule_engine_score,
                "gnn_loaded": False,
            }

        gnn_prob  = self.score(sender_account, dest_account, tabular_features)
        gnn_score = int(gnn_prob * 100)

        hybrid_score = int(
            self.gnn_weight * gnn_score +
            self.rule_weight * rule_engine_score
        )
        hybrid_score = min(max(hybrid_score, 0), 100)

        return {
            "gnn_score": gnn_score,
            "rule_score": rule_engine_score,
            "hybrid_score": hybrid_score,
            "gnn_loaded": True,
        }

    @property
    def status(self) -> dict:
        """Return GNN scorer status for API /validation-metrics endpoint"""
        return {
            "gnn_loaded": self.loaded,
            "n_accounts_indexed": len(self.embeddings),
            "embedding_dim": self.embedding_dim,
            "hybrid_weights": {
                "gnn": self.gnn_weight,
                "rule_engine": self.rule_weight,
            },
            "model_version": self.metadata.get("version", "unknown"),
            "val_auc": self.metadata.get("val_auc", None),
        }


# ── Singleton instance (loaded once at API startup) ──────────────────────────
gnn_scorer = GNNScorer()
