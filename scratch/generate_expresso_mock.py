import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

output_dir = r'd:\Crypto-Sentinel 2026\assets_ai_charts'
os.makedirs(output_dir, exist_ok=True)

fig, ax = plt.subplots(figsize=(10, 6.2), facecolor='#0f172a')
ax.set_facecolor('#0f172a')
ax.axis('off')

# Outer Window Container
rect_win = patches.FancyBboxPatch((0.02, 0.02), 0.96, 0.96, boxstyle="round,pad=0.02",
                                  facecolor='#1e293b', edgecolor='#3b82f6', linewidth=2, transform=ax.transAxes)
ax.add_patch(rect_win)

# Window Title Bar
rect_bar = patches.Rectangle((0.02, 0.90), 0.96, 0.08, facecolor='#0f172a', edgecolor='#334155', transform=ax.transAxes)
ax.add_patch(rect_bar)

# Window Control Buttons
ax.add_patch(plt.Circle((0.05, 0.94), 0.012, color='#ef4444', transform=ax.transAxes))
ax.add_patch(plt.Circle((0.08, 0.94), 0.012, color='#eab308', transform=ax.transAxes))
ax.add_patch(plt.Circle((0.11, 0.94), 0.012, color='#22c55e', transform=ax.transAxes))

ax.text(0.50, 0.94, 'Core Banking Server Expresso API (Port 8080) — Live SNAP BI & FDS Audit Log',
        ha='center', va='center', fontsize=10, fontweight='bold', color='#f8fafc', transform=ax.transAxes)

# Terminal Console Area
rect_term = patches.Rectangle((0.04, 0.05), 0.92, 0.82, facecolor='#020617', edgecolor='#1e293b', transform=ax.transAxes)
ax.add_patch(rect_term)

# Terminal Log Content
log_lines = [
    ("INFO:",    "#3b82f6", " Started server process [PID 1920] - FastAPI v1.0.0 (Port 8080)"),
    ("INFO:",    "#3b82f6", " Database SQLite 'expresso.db' connected. 111 accounts active."),
    ("LOG:",     "#64748b", " ===================================================================="),
    ("LOG:",     "#64748b", " [SIMULASI SMURFING & FDS REAL-TIME INTERCEPTION LOG]"),
    ("ALLOW:",   "#22c55e", " [1/6] Tx 0123456789 -> 8012000005 | Rp 60.000.000 | [ALLOW] (Risk: 15.0%)"),
    ("REVIEW:",  "#eab308", " [2/6] Tx 0123456789 -> 1370000000001 | Rp 60.000.000 | [REVIEW] (Risk: 65.0%)"),
    ("REVIEW:",  "#eab308", "    └─► Action: Tangguhkan Saldo & Push Yellow Alert to OJK Dashboard"),
    ("BLOCK:",   "#ef4444", " [6/6] Tx 0123456789 -> 0x1a2b3c4d5e6f7g8h9i0j | Rp 60.000.000 | [BLOCK] (Risk: 96.0%)"),
    ("BLOCK:",   "#ef4444", "    └─► Action: Rollback Mutasi DB & Trigger Circuit Breaker (18ms)"),
    ("INFO:",    "#3b82f6", " 127.0.0.1 - \"POST /api/v1/bri/simulate-smurfing HTTP/1.1\" 200 OK")
]

y_pos = 0.81
for tag, tag_col, msg in log_lines:
    ax.text(0.06, y_pos, tag, fontsize=9.5, fontweight='bold', color=tag_col, transform=ax.transAxes, family='monospace')
    ax.text(0.12, y_pos, msg, fontsize=9.5, color='#cbd5e1', transform=ax.transAxes, family='monospace')
    y_pos -= 0.075

plt.tight_layout()
chart_path = os.path.join(output_dir, '12_core_banking_expresso_server.png')
plt.savefig(chart_path, dpi=300, facecolor='#0f172a', bbox_inches='tight')
plt.close()
print(f"Successfully generated: {chart_path}")
