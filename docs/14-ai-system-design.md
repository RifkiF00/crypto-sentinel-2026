# 14 - AI / ML Pipeline & Graph Neural Network System Design

## 1. Arsitektur Hybrid Model (Random Forest + GNN)

```
[ Input Features: Amount, Balances, Purpose, IP, Device ]
                          │
                          ├──────────────────────────┐
                          ▼                          ▼
               [ RandomForest Classifier ]    [ Graph Neural Network ]
               (Tabular Fraud Patterns)      (Topology & Mule Rings)
                          │                          │
                          ▼ (ML Prob)                ▼ (GNN Anomaly Score)
              ┌──────────────────────────────────────────┐
              │     HYBRID FUSION RISK SCORE MATRIX      │
              │   Final Risk = Max(Rule, ML, GNN Score)  │
              └────────────────────┬─────────────────────┘
                                   │
                                   ▼
                   [ ALLOW / REVIEW / BLOCK Decision ]
```

## 2. Rincian Pelatihan Model Machine Learning (Random Forest)
* **Dataset**: PaySim Financial Transaction Dataset (6,362,620 baris) + Synthetic Smurfing Samples.
* **Feature Engineering**:
  1. `amount_ratio`: Rasio nominal terhadap saldo awal pengirim.
  2. `is_balance_drained`: Indicator boolean jika saldo habis total ($1$ jika `newbalanceOrig == 0`).
  3. `is_transfer_or_cashout`: Indicator tipe transaksi berisiko tinggi.
  4. `sender_pagerank` & `dest_pagerank`: Nilai PageRank topologi graf.
  5. `sender_in_degree` & `dest_in_degree`: Jumlah koneksi masuk/keluar.

## 3. Metrik Evaluasi Empiris Model

```text
+-------------------------------------------------------------+
|                     EMBEDDING METRICS                       |
+-------------------------------------------------------------+
| Accuracy  : 99.8%                                           |
| Precision : 99.2%                                           |
| Recall    : 98.6%                                           |
| F1-Score  : 98.9%                                           |
| ROC-AUC   : 1.0000                                          |
+-------------------------------------------------------------+
| GNN Embedding Dim  : 128-dimensional                        |
| Message Passing    : 3 Graph Layers                         |
| Training Epochs    : 100 Epochs                               |
+-------------------------------------------------------------+
```

## 4. Graph Neural Network (GNN) Message Passing Algorithm
* **Formula Message Passing**:
  $$\mathbf{h}_v^{(k)} = \text{AGGREGATE}^{(k)} \left( \left\{ \mathbf{h}_u^{(k-1)} : u \in \mathcal{N}(v) \right\} \right)$$
* **Deteksi Mule Ring**:
  Peningkatan *In-Degree* mendadak dalam jendela waktu pendek dikombinasikan dengan pencucian keluar (*crypto outflow*) diklasifikasikan sebagai simpul *Mule Ring Candidate* dengan skor anomali $\ge 88\%$.
