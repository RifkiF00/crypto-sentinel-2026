import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

output_dir = r'd:\Crypto-Sentinel 2026\assets_ai_charts'
os.makedirs(output_dir, exist_ok=True)

fig, ax = plt.subplots(figsize=(10, 6), facecolor='#0f172a')
ax.set_facecolor('#0f172a')
ax.axis('off')

# Title
ax.text(0.5, 0.95, 'Crypto-Sentinel 2026: Hybrid Fusion AI Model Architecture',
        ha='center', va='center', fontsize=14, fontweight='bold', color='#f8fafc', transform=ax.transAxes)

# 1. Top Box: Input Features
rect_in = patches.FancyBboxPatch((0.15, 0.78), 0.70, 0.10, boxstyle="round,pad=0.02",
                                facecolor='#1e293b', edgecolor='#38bdf8', linewidth=2, transform=ax.transAxes)
ax.add_patch(rect_in)
ax.text(0.5, 0.83, 'INPUT FEATURES\nAmount, Balances, Purpose, IP, Device, Velocity, PageRank',
        ha='center', va='center', fontsize=10, fontweight='bold', color='#38bdf8', transform=ax.transAxes)

# Arrows from Input to Models
ax.annotate('', xy=(0.30, 0.64), xytext=(0.35, 0.78),
            arrowprops=dict(arrowstyle="->", color='#94a3b8', lw=2.5))
ax.annotate('', xy=(0.70, 0.64), xytext=(0.65, 0.78),
            arrowprops=dict(arrowstyle="->", color='#94a3b8', lw=2.5))

# 2. Middle Left Box: Random Forest
rect_rf = patches.FancyBboxPatch((0.12, 0.50), 0.36, 0.14, boxstyle="round,pad=0.02",
                                 facecolor='#1e1b4b', edgecolor='#818cf8', linewidth=2, transform=ax.transAxes)
ax.add_patch(rect_rf)
ax.text(0.30, 0.57, 'Random Forest Classifier\n(Tabular Fraud Patterns)',
        ha='center', va='center', fontsize=10, fontweight='bold', color='#818cf8', transform=ax.transAxes)

# 3. Middle Right Box: GNN Engine
rect_gnn = patches.FancyBboxPatch((0.52, 0.50), 0.36, 0.14, boxstyle="round,pad=0.02",
                                  facecolor='#3b0764', edgecolor='#c084fc', linewidth=2, transform=ax.transAxes)
ax.add_patch(rect_gnn)
ax.text(0.70, 0.57, 'Graph Neural Network (GNN)\n(Topology & Mule Rings)',
        ha='center', va='center', fontsize=10, fontweight='bold', color='#c084fc', transform=ax.transAxes)

# Arrows from Models to Fusion Matrix
ax.annotate('ML Prob Score', xy=(0.35, 0.34), xytext=(0.30, 0.50),
            arrowprops=dict(arrowstyle="->", color='#818cf8', lw=2.5),
            ha='center', fontsize=9, fontweight='bold', color='#a5b4fc')

ax.annotate('GNN Anomaly Score', xy=(0.65, 0.34), xytext=(0.70, 0.50),
            arrowprops=dict(arrowstyle="->", color='#c084fc', lw=2.5),
            ha='center', fontsize=9, fontweight='bold', color='#e9d5ff')

# 4. Center Fusion Box: Hybrid Fusion Matrix
rect_fuse = patches.FancyBboxPatch((0.15, 0.20), 0.70, 0.14, boxstyle="round,pad=0.02",
                                   facecolor='#064e3b', edgecolor='#34d399', linewidth=2.5, transform=ax.transAxes)
ax.add_patch(rect_fuse)
ax.text(0.5, 0.27, 'HYBRID FUSION RISK SCORE MATRIX\nFinal Risk = Max(Rule_Score, ML_Score, GNN_Score)',
        ha='center', va='center', fontsize=11, fontweight='bold', color='#6ee7b7', transform=ax.transAxes)

# Arrow from Fusion to Decision
ax.annotate('', xy=(0.5, 0.09), xytext=(0.5, 0.20),
            arrowprops=dict(arrowstyle="->", color='#f43f5e', lw=3))

# 5. Bottom Box: Decision Output
rect_out = patches.FancyBboxPatch((0.25, 0.01), 0.50, 0.08, boxstyle="round,pad=0.02",
                                  facecolor='#881337', edgecolor='#fb7185', linewidth=2, transform=ax.transAxes)
ax.add_patch(rect_out)
ax.text(0.5, 0.05, 'DECISION: ALLOW / REVIEW / BLOCK (18ms)',
        ha='center', va='center', fontsize=10, fontweight='bold', color='#ffe4e6', transform=ax.transAxes)

plt.tight_layout()
chart_path = os.path.join(output_dir, '6_hybrid_fusion_architecture.png')
plt.savefig(chart_path, dpi=300, facecolor='#0f172a', bbox_inches='tight')
plt.close()
print(f"Successfully generated: {chart_path}")
