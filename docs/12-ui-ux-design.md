# 12 - UI/UX Design System & Micro-Interactions

## 1. Core Color Palette & Design Tokens

```css
:root {
  /* Brand Primary & Glassmorphism Colors */
  --bg-dark-primary: #030712;       /* Slate 950 */
  --bg-card: rgba(15, 23, 42, 0.75); /* Slate 900 Glass */
  --accent-primary: #06b6d4;        /* Cyan 500 */
  --accent-secondary: #8b5cf6;      /* Violet 500 */
  
  /* Status Indicator Tokens */
  --status-success: #10b981;        /* Emerald 500 (ALLOW) */
  --status-warning: #f59e0b;        /* Amber 500 (REVIEW) */
  --status-danger: #ef4444;         /* Red 500 (BLOCK) */
  
  /* Typography Tokens */
  --font-family: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

## 2. Struktur Hierarki UI Dasbor Kepatuhan (React Vite)

```
+-----------------------------------------------------------------------------------+
| HEADER BAR: Logo Crypto-Sentinel | Status System (ONLINE) | Clock | Notifications  |
+-----------------------------------------------------------------------------------+
| SIDEBAR NAV       | MAIN CONTENT AREA                                             |
| ----------------- | ------------------------------------------------------------- |
| 📊 Dashboard Overview | [ KARTU RINGKASAN METRIK ]                                   |
| 📡 Live Monitoring   | Total Transaksi | Transaksi Blokir | Nilai Tercegah | Accuracy  |
| 🛡️ Alerts Center     | ------------------------------------------------------------- |
| 🕸️ GNN Network       | [ TABEL MONITORING UTAMA ]                                   |
| 👥 Mule Analysis     | Filter: [ 🕒 1 Hari ] [ 📅 7 Hari ] [ 🌐 Semua ]               |
| 📜 STR Exporter      | Data: TXID | Pengirim | Tujuan | Nominal | Risk Score | Status   |
| ⚙️ Rules Config      | ------------------------------------------------------------- |
|                   | [ KONSOL SCANNER TERMINAL ]                                   |
|                   | > SANDBOX_SCANNER_CONSOLE.log                                 |
+-----------------------------------------------------------------------------------+
```

## 3. Aplikasi Mobile Banking (Flutter App UI)
* **Warna Tema**: Deep Navy (`#0A192F`) & Gold Accent.
* **Komponen Resi**:
  * Resi Berhasil (`ALLOW`): Latar Hijau Emerald + Centang Emas.
  * Resi Ditangguhkan (`REVIEW`): Latar Kuning Amber + Jam Pasir + Teks "Transfer Ditangguhkan".
  * Dialog Pemblokiran (`BLOCK`): Pop-up Modal Merah + Perisai Bahaya + CS Hotlink.
