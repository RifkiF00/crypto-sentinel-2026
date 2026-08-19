"""Modul Generator Laporan Transaksi Keuangan Mencurigakan (LTKM / STR)
Sesuai standar PPATK goAML & UU No. 8 Tahun 2010 tentang Pencegahan dan Pemberantasan Tindak Pidana Pencucian Uang (TPPU).
Didesain khusus untuk Unit Kepatuhan / APU-PPT Bank Kuningan (PT BPR Kuningan Perseroda).
"""

from __future__ import annotations
from datetime import datetime, timezone, timedelta
import uuid


def generate_str_draft(
    transaction_id: str,
    sender_account: str,
    destination_account: str,
    amount: float,
    risk_score: int,
    reasons: list[str],
    sender_name: str = "Nasabah Terlapor",
    destination_name: str = "Rekening Penerima / Bursa Kripto",
    bank_name: str = "PT BPR KUNINGAN (PERSERODA)",
    compliance_officer: str = "Pejabat Kepatuhan & APU-PPT",
) -> dict:
    now_wib = datetime.now(timezone(timedelta(hours=7)))
    date_str = now_wib.strftime("%Y%m%d")
    short_uuid = str(uuid.uuid4())[:8].upper()
    report_id = f"LTKM-BKG-{date_str}-{short_uuid}"

    reasons_text = "; ".join(reasons) if reasons else "Indikasi transaksi anomali melebihi ambang batas risiko."

    narrative = (
        f"Berdasarkan hasil pemantauan sistem intelijen anti-fraud Crypto-Sentinel pada tanggal {now_wib.strftime('%d/%m/%Y pukul %H:%M WIB')}, "
        f"telah terdeteksi transaksi mencurigakan dengan skor risiko {risk_score}/100 (Kategori Kritis/Tinggi). "
        f"Transaksi atas nama {sender_name} (Rekening: {sender_account}) senilai Rp {amount:,.0f} menuju {destination_name} (Rekening: {destination_account}) "
        f"memenuhi indikator Transaksi Keuangan Mencurigakan (TKM) dengan temuan: {reasons_text}. "
        f"Sesuai POJK No. 12/2024 dan UU No. 8 Tahun 2010 Pasal 23, transaksi telah ditahan sementara (Circuit Breaker) "
        f"dan direkomendasikan untuk pembekuan rekening serta pelaporan resmi ke Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK)."
    )

    return {
        "report_id": report_id,
        "created_at": now_wib.isoformat(),
        "created_at_formatted": now_wib.strftime("%d %B %Y, %H:%M WIB"),
        "status": "DRAFT",
        "regulatory_basis": "UU No. 8 Tahun 2010 Pasal 23 & POJK No. 12/2024",
        "reporting_institution": {
            "name": bank_name,
            "entity_type": "Bank Perekonomian Rakyat (BPR)",
            "address": "Jl. Jenderal Sudirman No. 128, Kuningan, Jawa Barat",
            "compliance_unit": "Satuan Kerja Kepatuhan & APU-PPT",
            "officer": compliance_officer,
        },
        "subject_info": {
            "name": sender_name,
            "account_number": sender_account,
            "customer_type": "Perseorangan",
            "identification_masked": "3208************",
        },
        "transaction_details": {
            "transaction_id": transaction_id,
            "amount": amount,
            "amount_formatted": f"Rp {amount:,.0f}",
            "destination_account": destination_account,
            "destination_name": destination_name,
            "risk_score": risk_score,
            "decision": "BLOCK" if risk_score >= 85 else "REVIEW",
            "anomaly_reasons": reasons,
        },
        "suspicion_narrative": narrative,
        "action_taken": "Transaksi dibekukan seketika (Pre-Authorization Circuit Breaker) untuk mencegah pelarian dana ke bursa aset kripto/jaringan mule.",
    }


def generate_str_html(str_data: dict) -> str:
    """Menghasilkan dokumen resmi cetak hitam-putih formal standar PPATK goAML."""
    reasons_li = "".join(f"<li>{r}</li>" for r in str_data["transaction_details"]["anomaly_reasons"])
    
    html = f"""<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>{str_data['report_id']} - Laporan Transaksi Keuangan Mencurigakan</title>
    <style>
        body {{
            font-family: "Times New Roman", Times, serif;
            color: #000;
            background: #fff;
            margin: 40px auto;
            max-width: 800px;
            font-size: 13pt;
            line-height: 1.4;
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }}
        .header h1 {{
            font-size: 15pt;
            margin: 0;
            font-weight: bold;
            text-transform: uppercase;
        }}
        .header h2 {{
            font-size: 13pt;
            margin: 4px 0;
            font-weight: normal;
        }}
        .header p {{
            font-size: 10pt;
            margin: 2px 0;
            color: #333;
        }}
        .confidential-badge {{
            text-align: right;
            font-weight: bold;
            font-size: 11pt;
            color: #900;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .report-meta {{
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }}
        .report-meta td {{
            padding: 4px 0;
            vertical-align: top;
            font-size: 12pt;
        }}
        .section-title {{
            font-weight: bold;
            text-decoration: underline;
            margin-top: 20px;
            margin-bottom: 8px;
            text-transform: uppercase;
            font-size: 12pt;
        }}
        table.data-table {{
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }}
        table.data-table th, table.data-table td {{
            border: 1px solid #000;
            padding: 6px 10px;
            font-size: 11pt;
            text-align: left;
        }}
        table.data-table th {{
            background-color: #f2f2f2;
        }}
        .narrative-box {{
            border: 1px solid #000;
            padding: 12px;
            margin: 10px 0;
            text-align: justify;
            font-size: 11.5pt;
            line-height: 1.5;
            background-color: #fafafa;
        }}
        .signatures {{
            margin-top: 40px;
            width: 100%;
            display: flex;
            justify-content: space-between;
        }}
        .sig-box {{
            width: 45%;
            text-align: center;
        }}
        .sig-space {{
            height: 70px;
        }}
        .footer {{
            margin-top: 50px;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            font-size: 9pt;
            color: #555;
            text-align: center;
        }}
        .btn-print {{
            display: block;
            width: 140px;
            margin: 30px auto 0 auto;
            padding: 10px 16px;
            text-align: center;
            background-color: #1e3a8a;
            color: white;
            border: none;
            border-radius: 6px;
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            font-weight: bold;
            cursor: pointer;
            letter-spacing: 0.5px;
        }}
        @media print {{
            .btn-print {{ display: none; }}
            body {{ margin: 20px; }}
        }}
    </style>
</head>
<body>

    <div class="confidential-badge">
        [ RAHASIA — DOKUMEN INTELIJEN KEUANGAN ]
    </div>

    <div class="header">
        <h1>{str_data['reporting_institution']['name']}</h1>
        <h2>SATUAN KERJA KEPATUHAN, HUKUM & APU-PPT</h2>
        <p>{str_data['reporting_institution']['address']} | Telepon: (0232) 871128</p>
    </div>

    <table class="report-meta">
        <tr>
            <td style="width: 25%;"><strong>Nomor Laporan</strong></td>
            <td style="width: 2%;">:</td>
            <td><strong>{str_data['report_id']}</strong></td>
        </tr>
        <tr>
            <td><strong>Tanggal Diterbitkan</strong></td>
            <td>:</td>
            <td>{str_data['created_at_formatted']}</td>
        </tr>
        <tr>
            <td><strong>Dasar Hukum Pelaporan</strong></td>
            <td>:</td>
            <td>{str_data['regulatory_basis']}</td>
        </tr>
        <tr>
            <td><strong>Perihal</strong></td>
            <td>:</td>
            <td>Laporan Transaksi Keuangan Mencurigakan (LTKM) Otomatis — Pencegahan Fraud Kripto/Mule</td>
        </tr>
    </table>

    <div class="section-title">I. IDENTITAS NASABAH / TERLAPOR</div>
    <table class="data-table">
        <tr>
            <th style="width: 30%;">Nama Lengkap Nasabah</th>
            <td>{str_data['subject_info']['name']}</td>
        </tr>
        <tr>
            <th>Nomor Rekening Sumber</th>
            <td><strong>{str_data['subject_info']['account_number']}</strong> ({str_data['reporting_institution']['name']})</td>
        </tr>
        <tr>
            <th>Nomor Induk Kependudukan (NIK)</th>
            <td>{str_data['subject_info']['identification_masked']}</td>
        </tr>
        <tr>
            <th>Kategori Nasabah</th>
            <td>{str_data['subject_info']['customer_type']}</td>
        </tr>
    </table>

    <div class="section-title">II. RINCIAN TRANSAKSI MENCURIGAKAN</div>
    <table class="data-table">
        <tr>
            <th style="width: 30%;">ID Transaksi Sistem</th>
            <td>{str_data['transaction_details']['transaction_id']}</td>
        </tr>
        <tr>
            <th>Nominal Transaksi</th>
            <td><strong style="font-size: 13pt;">{str_data['transaction_details']['amount_formatted']}</strong></td>
        </tr>
        <tr>
            <th>Rekening & Pihak Tujuan</th>
            <td>{str_data['transaction_details']['destination_account']} ({str_data['transaction_details']['destination_name']})</td>
        </tr>
        <tr>
            <th>Skor Risiko AI (Crypto-Sentinel)</th>
            <td><strong style="color: #900;">{str_data['transaction_details']['risk_score']} / 100 ({str_data['transaction_details']['decision']})</strong></td>
        </tr>
        <tr>
            <th>Tindakan Sistem (Circuit Breaker)</th>
            <td><strong>{str_data['action_taken']}</strong></td>
        </tr>
    </table>

    <div class="section-title">III. URAIAN ANOMALI & INDIKASI KECURIGAAN</div>
    <div class="narrative-box">
        {str_data['suspicion_narrative']}
    </div>

    <div style="margin-top: 10px;">
        <strong>Daftar Sub-Indikator APU-PPT Terpicu:</strong>
        <ul style="margin: 6px 0 15px 20px;">
            {reasons_li}
        </ul>
    </div>

    <div class="section-title">IV. REKOMENDASI TINDAKAN & PENGESAHAN</div>
    <p style="font-size: 11pt; margin-bottom: 25px;">
        Dokumen ini diterbitkan secara otomatis oleh modul kepatuhan <em>Crypto-Sentinel FDS</em> untuk diverifikasi oleh Pejabat Kepatuhan sebelum disampaikan melalui sistem pelaporan <strong>PPATK goAML</strong>.
    </p>

    <table style="width: 100%; border: none; margin-top: 30px;">
        <tr>
            <td style="width: 50%; text-align: center; vertical-align: top;">
                <p>Mengetahui / Menyetujui,<br><strong>Direktur Kepatuhan</strong></p>
                <div style="height: 65px;"></div>
                <p><strong><u>DENI HERYANA, S.Sos., M.M.</u></strong><br>Direktur yang Membawahkan Fungsi Kepatuhan</p>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: top;">
                <p>Kuningan, {str_data['created_at_formatted'].split(',')[0]}<br><strong>Petugas Kepatuhan / Analis APU-PPT</strong></p>
                <div style="height: 65px;"></div>
                <p><strong><u>{str_data['reporting_institution']['officer']}</u></strong><br>Unit Kerja Kepatuhan & Manajemen Risiko</p>
            </td>
        </tr>
    </table>

    <button class="btn-print" onclick="window.print()">Cetak / Print PDF</button>

    <div class="footer">
        Dokumen Rahasia Negara — Dilarang menggandakan atau menyebarluaskan tanpa izin tertulis dari Pejabat Kepatuhan Perbankan & PPATK.<br>
        Sistem Deteksi: Crypto-Sentinel Middleware Security Layer v0.5.0 — PIDI Capstone 2026.
    </div>

</body>
</html>
"""
    return html
