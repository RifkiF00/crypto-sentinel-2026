import { useState, useMemo } from 'react';
import {
    Activity,
    GitBranch,
    ShieldAlert,
    Search,
    CheckCircle2,
    AlertTriangle,
    FileText,
    UserCheck,
    Zap,
    Info,
    Sliders,
    TrendingUp,
    Cpu,
    ArrowRight,
    RefreshCw,
    Network,
    Terminal,
    Globe,
    Clock,
    Smartphone,
    Layers,
    DollarSign,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// 15 CORE AML & GNN INDICATORS DATASET ALIGNED WITH BLUEPRINT & BANK BJB TESTING
// 4 Signal Groups:
// Group 1: Behavioral Signals (Sinyal Perilaku)
// Group 2: Relational Graph Intelligence (Jantung GNN - Fraud Ring)
// Group 3: Purpose Mismatch & Nominal (Konteks ISO 20022 & Nominal)
// Group 4: Technical Signals (Jejak Digital & Telemetri)
// ============================================================================
export const CORE_15_INDICATORS = [
    // ══════════════════════════════════════════════════════════════════════════
    // GROUP 1: BEHAVIORAL SIGNALS (4 Indikator)
    // ══════════════════════════════════════════════════════════════════════════
    {
        id: 'ind_01',
        num: '01',
        code: 'transaction_velocity_burst',
        name: 'Transaction Velocity (Frekuensi Tinggi)',
        group: 'Group 1: Behavioral Signals',
        groupId: 'behavioral',
        categoryType: 'konvensional', // 'konvensional' | 'gnn'
        methodology: 'Rule Engine & Temporal Window',
        weight: 'Bobot 0.08 (15% Rule Score)',
        score: 84,
        level: 'HIGH',
        formula: 'Velocity_15m = Count(Tx) ≥ 10 dalam window ≤ 15 menit',
        triggerSample: '12 transaksi transfer interbank berturut-turut dalam kurun waktu 8 menit',
        threshold: '≥ 10 transaksi per 15 menit ke rekening berbeda',
        xaiShap: '+0.185 (Dorongan Frekuensi Tidak Wajar)',
        regulation: 'POJK No. 8/2023 Pasal 19 & Standar FDS BI Fast — Pemantauan Lonjakan Frekuensi',
        description: 'Mendeteksi frekuensi transaksi abnormal yang melampaui kebiasaan normal nasabah ritel dalam jendela waktu sangat sempit.',
        conventionalLimitation: 'Rule kaku hanya menghitung jumlah transaksi per jam, mudah diakali sindikat dengan memberi jeda waktu sedikit di atas ambang batas.',
        gnnAdvantage: 'GNN menggabungkan burst frekuensi dengan topologi simpul penerima untuk mengidentifikasi apakah tujuan merupakan klaster penampung terkoordinasi.',
        canvas: {
            title: 'Topologi Bursts Velocity (12 Transaksi / 8 Menit)',
            badge: 'Pola Semburan Transaksi Cepat',
            nodes: [
                { id: 'src_acc', label: 'Rekening Sumber (BJB)', sub: 'Ahmad Fauzi · 11029384', type: 'source', x: 80, y: 190, risk: 85 },
                { id: 'v_1', label: 'Tujuan #1 (BRI)', sub: 'Rp 4.500.000 · +30s', type: 'mule', x: 280, y: 60, risk: 78 },
                { id: 'v_2', label: 'Tujuan #2 (BCA)', sub: 'Rp 4.800.000 · +75s', type: 'mule', x: 280, y: 125, risk: 80 },
                { id: 'v_3', label: 'Tujuan #3 (BPR KNG)', sub: 'Rp 4.900.000 · +130s', type: 'mule', x: 280, y: 190, risk: 88 },
                { id: 'v_4', label: 'Tujuan #4 (Mandiri)', sub: 'Rp 4.750.000 · +180s', type: 'mule', x: 280, y: 255, risk: 82 },
                { id: 'v_5', label: 'Tujuan #5 (BNI)', sub: 'Rp 4.600.000 · +240s', type: 'mule', x: 280, y: 320, risk: 79 },
                { id: 'agg', label: 'Collector Wallet', sub: 'Pool Konsolidasi', type: 'transit', x: 480, y: 190, risk: 91 }
            ],
            edges: [
                { from: 'src_acc', to: 'v_1', label: 'Tx #1 (00:30)', type: 'mule' },
                { from: 'src_acc', to: 'v_2', label: 'Tx #2 (01:15)', type: 'mule' },
                { from: 'src_acc', to: 'v_3', label: 'Tx #3 (02:10)', type: 'mule' },
                { from: 'src_acc', to: 'v_4', label: 'Tx #4 (03:00)', type: 'mule' },
                { from: 'src_acc', to: 'v_5', label: 'Tx #5 (04:00)', type: 'mule' },
                { from: 'v_1', to: 'agg', label: 'Sweep 5m', type: 'transit' },
                { from: 'v_2', to: 'agg', label: 'Sweep 5m', type: 'transit' },
                { from: 'v_3', to: 'agg', label: 'Sweep 5m', type: 'transit' },
                { from: 'v_4', to: 'agg', label: 'Sweep 5m', type: 'transit' },
                { from: 'v_5', to: 'agg', label: 'Sweep 5m', type: 'transit' }
            ]
        }
    },
    {
        id: 'ind_02',
        num: '02',
        code: 'odd_hour_activity',
        name: 'Odd-Hour Activity (Jam Tidak Wajar 01:00–04:00)',
        group: 'Group 1: Behavioral Signals',
        groupId: 'behavioral',
        categoryType: 'konvensional',
        methodology: 'Temporal Behavioral Window Scorer',
        weight: 'Bobot 0.05 (Rule #9)',
        score: 79,
        level: 'HIGH',
        formula: 'Tx_Time ∈ [01:00 - 04:30 WIB] && Amount > Rp 25.000.000',
        triggerSample: 'Transfer Rp 75.000.000 dieksekusi pada pukul 02:43:18 WIB',
        threshold: 'Nominal tinggi di luar jendela operasional normal (01:00 - 04:30 WIB)',
        xaiShap: '+0.112 (Penyimpangan Temporal Malam Hari)',
        regulation: 'SE OJK No. 32/2023 & SOP APU-PPT Bank bjb — Jam Operasional Kritis',
        description: 'Transaksi bernilai signifikan yang dilakukan di waktu malam atau dini hari (jam tidur) yang secara historis sering dipakai sindikat untuk menghindari monitoring manual teller.',
        conventionalLimitation: 'Sering memicu false positive untuk nasabah yang berbelanja online atau transfer antar akun pribadi di malam hari.',
        gnnAdvantage: 'Dipadukan dengan embedding penerima: bila penerima belum pernah berinteraksi sebelumnya dan berkedekatan tinggi dengan mule cluster, skor langsung dinaikkan ke level kritis.',
        canvas: {
            title: 'Visualisasi Anomali Waktu (Nocturnal Transfer 02:43 WIB)',
            badge: 'Penyimpangan Jam Transaksi',
            nodes: [
                { id: 'clock_node', label: 'Audit Jam Malam', sub: '02:43:18 WIB (Nocturnal)', type: 'device', x: 80, y: 110, risk: 75 },
                { id: 'src_night', label: 'Rekening Pengirim', sub: 'BJB Giro 4410982', type: 'source', x: 80, y: 240, risk: 82 },
                { id: 'bridge_night', label: 'Rekening Transit Dini Hari', sub: 'Bank Kuningan 88201', type: 'transit', x: 300, y: 240, risk: 89 },
                { id: 'dest_crypto', label: 'Off-ramp P2P Kripto', sub: 'Indodax Gateway IDR', type: 'crypto', x: 500, y: 240, risk: 93 }
            ],
            edges: [
                { from: 'clock_node', to: 'src_night', label: 'Trigger Jam 02:43', type: 'device' },
                { from: 'src_night', to: 'bridge_night', label: 'Rp 75.000.000 (02:43 WIB)', type: 'transit' },
                { from: 'bridge_night', to: 'dest_crypto', label: 'Instan Outflow (02:47 WIB)', type: 'crypto' }
            ]
        }
    },
    {
        id: 'ind_03',
        num: '03',
        code: 'dormant_account_activation',
        name: 'Dormant Account Activation (Bangkitnya Rekening Pasif)',
        group: 'Group 1: Behavioral Signals',
        groupId: 'behavioral',
        categoryType: 'konvensional',
        methodology: 'Core Banking Inactivity Log + Rule #5',
        weight: 'Bobot 0.07 (+30 Poin Rule)',
        score: 92,
        level: 'CRITICAL',
        formula: 'dormant_days > 180 && sudden_inflow > Rp 50.000.000',
        triggerSample: 'Rekening pasif 240 hari mendadak menerima Rp 150.000.000 dan langsung lunas ditransfer keluar',
        threshold: 'Inaktif > 180 hari kemudian mendadak ada mutasi besar',
        xaiShap: '+0.270 (Karakteristik Kuat Jual-Beli Rekening / Mule Jual Putus)',
        regulation: 'POJK No. 8/2023 Pasal 27 — Penanganan Rekening Dormant & Pembaruan CDD',
        description: 'Rekening bank yang tidak memiliki aktivitas mutasi selama lebih dari 6 bulan tiba-tiba aktif menerima dana besar dan langsung mengurasnya habis dalam hitungan menit.',
        conventionalLimitation: 'Sistem konvensional hanya menandai rekening dormant saat transaksi terjadi, namun tidak dapat mendeteksi apakah penerima dana berikutnya merupakan simpul pencucian uang.',
        gnnAdvantage: 'GNN langsung memetakan rantai penyaluran dana pasca-reaktivasi ke jaringan penerima multi-hop.',
        canvas: {
            title: 'Topologi Reaktivasi Dormant & Pengurasan Instan',
            badge: 'Rekening Pasif Bangkit Mendadak',
            nodes: [
                { id: 'dorm_inact', label: 'Status Dormant', sub: 'Inaktif 240 Hari (Saldo Rp 50rb)', type: 'device', x: 80, y: 190, risk: 60 },
                { id: 'dorm_acc', label: 'Rekening Bangkit (BJB)', sub: 'Siti Rahma · 8840192', type: 'source', x: 260, y: 190, risk: 93 },
                { id: 'mule_out_1', label: 'Penerima Instan A', sub: 'Bank Jago · Rp 75 Juta', type: 'mule', x: 460, y: 110, risk: 88 },
                { id: 'mule_out_2', label: 'Penerima Instan B', sub: 'BCA · Rp 75 Juta', type: 'mule', x: 460, y: 270, risk: 90 }
            ],
            edges: [
                { from: 'dorm_inact', to: 'dorm_acc', label: 'Setoran Masuk Rp 150M', type: 'device' },
                { from: 'dorm_acc', to: 'mule_out_1', label: 'Outflow dlm 2m', type: 'mule' },
                { from: 'dorm_acc', to: 'mule_out_2', label: 'Outflow dlm 3m', type: 'mule' }
            ]
        }
    },
    {
        id: 'ind_04',
        num: '04',
        code: 'customer_profile_anomaly',
        name: 'Anomali Profil Nasabah (CRA Mismatch)',
        group: 'Group 1: Behavioral Signals',
        groupId: 'behavioral',
        categoryType: 'konvensional',
        methodology: 'Tabular Random Forest (RF Feature #3 & #4) + CDD Data',
        weight: 'Bobot 0.10 (RF 12.12%)',
        score: 88,
        level: 'HIGH',
        formula: 'Tx_Amount > (Profil_Pendapatan_Bulanan × 15.0)',
        triggerSample: 'Profil Mahasiswa (Pendapatan < Rp 3 Juta/bln) melakukan transfer Rp 180.000.000',
        threshold: 'Nominal transaksi > 15× profil penghasilan KYC terdaftar',
        xaiShap: '+0.210 (Penyimpangan Ekstrem dari Profil Risiko Nasabah)',
        regulation: 'POJK No. 8/2023 Pasal 14 & 18 — Customer Due Diligence (CDD) Berkelanjutan',
        description: 'Perbandingan antara nilai transaksi yang dieksekusi dengan profil latar belakang sosial-ekonomi, pekerjaan, dan penghasilan nasabah yang tersimpan pada database Core Banking.',
        conventionalLimitation: 'Hanya mencocokkan angka kaku batas KYC statis saat pembukaan rekening, tanpa memperhitungkan relasi jaringan sosial ekonomi nasabah.',
        gnnAdvantage: 'GNN mengevaluasi apakah profil nasabah ini dimanfaatkan oleh jaringan keledai yang dikendalikan oleh dalang yang sama.',
        canvas: {
            title: 'Profil CRA vs Nilai Transaksi Ekstrem',
            badge: 'Ketidaksesuaian Profil KYC',
            nodes: [
                { id: 'kyc_prof', label: 'Data KYC / CDD', sub: 'Pekerjaan: Mahasiswa (Rp 2.5 Jt/bln)', type: 'device', x: 80, y: 190, risk: 40 },
                { id: 'acc_student', label: 'Rekening Nasabah', sub: 'Rian Pratama · 10928491', type: 'source', x: 260, y: 190, risk: 89 },
                { id: 'dest_hub', label: 'Rekening Penampung Bisnis', sub: 'CV Sumber Makmur (Fiktif)', type: 'transit', x: 480, y: 190, risk: 92 }
            ],
            edges: [
                { from: 'kyc_prof', to: 'acc_student', label: 'Batas Normal: Rp 10 Jt', type: 'device' },
                { from: 'acc_student', to: 'dest_hub', label: 'Transfer Rp 180.000.000 (72× Gaji)', type: 'transit' }
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // GROUP 2: RELATIONAL GRAPH INTELLIGENCE — GNN (6 Indikator)
    // ══════════════════════════════════════════════════════════════════════════
    {
        id: 'ind_05',
        num: '05',
        code: 'mule_rings_spider_web',
        name: 'Mule Rings / Spider Web (Pola Bintang Sindikat)',
        group: 'Group 2: Relational Graph Intelligence',
        groupId: 'relational_gnn',
        categoryType: 'gnn',
        methodology: 'GraphSAGE GNN + In-Degree High Centrality Hub',
        weight: 'Bobot 0.25 (GNN Engine 60% Weight)',
        score: 98,
        level: 'CRITICAL',
        formula: 'InDegree(Node_Target) ≥ 5 && Entropy(Amount_In) < 0.25',
        triggerSample: '6 rekening berbeda serentak mentransfer Rp 10.000.000 ke 1 rekening aggregator dalam 10 menit',
        threshold: '≥ 5 rekening sumber mengirim dana simultan ke 1 simpul terpusat',
        xaiShap: '+0.412 (Pola Topologi Bintang Sindikat Mule Teridentifikasi)',
        regulation: 'POJK No. 8/2023 Pasal 21 — Penanganan Jaringan Terstruktur Pencucian Uang',
        description: 'Mendeteksi topologi jaringan di mana banyak rekening keledai mengirimkan pecahan dana ke satu rekening penampung transit (collector hub) sebelum dikirim ke bursa kripto.',
        conventionalLimitation: 'Sistem konvensional berbasis baris per transaksi (row-by-row) buta terhadap korelasi topologi banyak-ke-satu (many-to-one aggregation).',
        gnnAdvantage: 'GNN melakukan message-passing melintasi simpul tetangga untuk mengenali pola spider-web secara holistik.',
        canvas: {
            title: 'Topologi Spider-Web Sindikat (Many-to-One Mule Ring)',
            badge: 'GNN GraphSAGE Hero Detection',
            nodes: [
                { id: 'mule_src_1', label: 'Mule #1 (Budi)', sub: 'BJB Kuningan', type: 'mule', x: 80, y: 70, risk: 91 },
                { id: 'mule_src_2', label: 'Mule #2 (Siti)', sub: 'BCA KCP Cirebon', type: 'mule', x: 80, y: 150, risk: 89 },
                { id: 'mule_src_3', label: 'Mule #3 (Andi)', sub: 'BRI Kuningan', type: 'mule', x: 80, y: 230, risk: 93 },
                { id: 'mule_src_4', label: 'Mule #4 (Eko)', sub: 'Mandiri Bandung', type: 'mule', x: 80, y: 310, risk: 88 },
                { id: 'central_hub', label: 'AGGREGATOR CENTRAL HUB', sub: 'Rekening Penampung Sindikat', type: 'transit', x: 300, y: 190, risk: 98 },
                { id: 'crypto_esc', label: 'Bursa Kripto VASP P2P', sub: 'Pintu/Indodax IDR Gateway', type: 'crypto', x: 500, y: 190, risk: 95 }
            ],
            edges: [
                { from: 'mule_src_1', to: 'central_hub', label: 'Rp 10 Juta', type: 'transit' },
                { from: 'mule_src_2', to: 'central_hub', label: 'Rp 10 Juta', type: 'transit' },
                { from: 'mule_src_3', to: 'central_hub', label: 'Rp 10 Juta', type: 'transit' },
                { from: 'mule_src_4', to: 'central_hub', label: 'Rp 10 Juta', type: 'transit' },
                { from: 'central_hub', to: 'crypto_esc', label: 'Pelarian Rp 40 Juta dlm 3m', type: 'crypto' }
            ]
        }
    },
    {
        id: 'ind_06',
        num: '06',
        code: 'layering_multi_hop_chain',
        name: 'Layering / Chain Transactions (>3 Lapis Rekening)',
        group: 'Group 2: Relational Graph Intelligence',
        groupId: 'relational_gnn',
        categoryType: 'gnn',
        methodology: 'GraphSAGE Multi-Hop Neighborhood Sampling (k=3)',
        weight: 'Bobot 0.20 (GNN Multi-Hop)',
        score: 96,
        level: 'CRITICAL',
        formula: 'HopCount(A → B → C → D) ≥ 3 && Total_Time < 300 detik',
        triggerSample: 'Dana Rp 100M berpindah melewati 4 rekening perbankan berbeda dalam waktu 3 menit 40 detik',
        threshold: 'Aliran dana estafet ≥ 3 hop rekening dengan retensi < 2 menit per hop',
        xaiShap: '+0.368 (Indikasi Penyamaran Asal Usul Harta / Layering AML)',
        regulation: 'UU No. 8/2010 Pasal 3 & 4 — Tindak Pidana Pencucian Uang Tahap Layering',
        description: 'Teknik penyamaran jejak di mana uang hasil kejahatan dipindahkan secara estafet dari rekening satu ke rekening lain secara cepat sebelum ditarik ke aset digital.',
        conventionalLimitation: 'Bank hanya melihat transaksi 1-hop (pengirim ke penerima langsung) dan kehilangan jejak saat dana keluar ke bank lain.',
        gnnAdvantage: 'GraphSAGE melacak hingga 3-hop lintas entitas perbankan dengan embedding representasi jaringan.',
        canvas: {
            title: 'Topologi Layering Estafet Multi-Hop (4 Tahap dlm 3 Menit)',
            badge: 'Pelacakan Rantai Multi-Hop GNN',
            nodes: [
                { id: 'hop_0', label: 'Sumber Dana Gelap', sub: 'Rekening Asal (BJB)', type: 'source', x: 60, y: 190, risk: 95 },
                { id: 'hop_1', label: 'Layer 1 (BPR KNG)', sub: 'Transit Hop #1 · +45s', type: 'mule', x: 190, y: 190, risk: 88 },
                { id: 'hop_2', label: 'Layer 2 (Bank Jago)', sub: 'Transit Hop #2 · +90s', type: 'mule', x: 320, y: 190, risk: 90 },
                { id: 'hop_3', label: 'Layer 3 (BNI)', sub: 'Transit Hop #3 · +150s', type: 'transit', x: 440, y: 190, risk: 92 },
                { id: 'hop_vasp', label: 'VASP Gateway', sub: 'Off-ramp USDT', type: 'crypto', x: 560, y: 190, risk: 97 }
            ],
            edges: [
                { from: 'hop_0', to: 'hop_1', label: 'Hop 1 (Rp 100M)', type: 'mule' },
                { from: 'hop_1', to: 'hop_2', label: 'Hop 2 (Rp 99.5M)', type: 'mule' },
                { from: 'hop_2', to: 'hop_3', label: 'Hop 3 (Rp 99M)', type: 'transit' },
                { from: 'hop_3', to: 'hop_vasp', label: 'Hop 4 (Beli Kripto)', type: 'crypto' }
            ]
        }
    },
    {
        id: 'ind_07',
        num: '07',
        code: 'cyclic_flow_circular_loop',
        name: 'Cyclic Flow / Circular Trading Loop (Aliran Berputar A→B→C→A)',
        group: 'Group 2: Relational Graph Intelligence',
        groupId: 'relational_gnn',
        categoryType: 'gnn',
        methodology: 'Graph Cycle Detector & Leiden Community Topology',
        weight: 'Bobot 0.18 (+40 Poin GNN)',
        score: 94,
        level: 'CRITICAL',
        formula: 'CycleExists(A → B → C → ... → A) && NetFlow ≈ 0',
        triggerSample: 'Aliran dana Rp 50M berputar dari Akun A ke B ke C lalu kembali ke A dalam 1 hari',
        threshold: 'Graf tertutup dengan aliran dana kembali ke simpul awal atau afiliasinya',
        xaiShap: '+0.334 (Pola Pencucian Uang Round-Tripping / Wash Flow)',
        regulation: 'POJK No. 8/2023 Pasal 20 — Transaksi yang Tidak Memiliki Tujuan Ekonomi Jelas',
        description: 'Mendeteksi topologi graf tertutup di mana dana ditransfer berputar melintasi beberapa rekening untuk memanipulasi mutasi rekening atau menyamarkan kepemilikan dana.',
        conventionalLimitation: 'Tidak mungkin terdeteksi oleh rule tabular konvensional karena setiap transaksi individual tampak normal.',
        gnnAdvantage: 'GNN mengekstrak topologi siklis dalam adjacency matrix dan mengenali komunitas rekening terafiliasi.',
        canvas: {
            title: 'Topologi Cyclic Flow (Circular Round-Tripping Loop)',
            badge: 'Deteksi Siklus Tertutup GNN',
            nodes: [
                { id: 'c_a', label: 'Akun A (BJB Utama)', sub: 'Inisiator Siklus', type: 'source', x: 140, y: 90, risk: 92 },
                { id: 'c_b', label: 'Akun B (BPR Mitra)', sub: 'Simpul Rotasi 1', type: 'mule', x: 420, y: 90, risk: 87 },
                { id: 'c_c', label: 'Akun C (Bank BCA)', sub: 'Simpul Rotasi 2', type: 'transit', x: 420, y: 290, risk: 89 },
                { id: 'c_d', label: 'Akun D (Bank Mandiri)', sub: 'Simpul Rotasi 3', type: 'mule', x: 140, y: 290, risk: 90 }
            ],
            edges: [
                { from: 'c_a', to: 'c_b', label: 'Rp 50.000.000', type: 'mule' },
                { from: 'c_b', to: 'c_c', label: 'Rp 49.800.000', type: 'transit' },
                { from: 'c_c', to: 'c_d', label: 'Rp 49.600.000', type: 'mule' },
                { from: 'c_d', to: 'c_a', label: 'Rp 49.400.000 (Looping Back)', type: 'source' }
            ]
        }
    },
    {
        id: 'ind_08',
        num: '08',
        code: 'mule_cluster_proximity_cosine',
        name: 'Mule Cluster Proximity (GraphSAGE 32-dim Embedding)',
        group: 'Group 2: Relational Graph Intelligence',
        groupId: 'relational_gnn',
        categoryType: 'gnn',
        methodology: 'GraphSAGE 32-dimensional Embeddings & Cosine Distance',
        weight: 'Bobot 0.22 (Inti GNN 60% Weight)',
        score: 95,
        level: 'CRITICAL',
        formula: 'CosineSim(Embedding(Dest), Mule_Cluster_Centroid) ≥ 0.85',
        triggerSample: 'Rekening penerima memiliki kemiripan vektor 0.94 dengan klaster sindikat keledai Jawa Barat',
        threshold: 'Cosine similarity ≥ 0.85 terhadap centroid klaster rekening fraud',
        xaiShap: '+0.380 (Kedekatan Vektor Relasi dengan Database Sindikat)',
        regulation: 'Pedoman Penilaian Risiko TPPU/TPPT Nasional (NRA Indonesia)',
        description: 'Mengukur kedekatan representasi neural 32-dimensi rekening tujuan terhadap centroid klaster sindikat rekening mule yang telah dilatih secara offline pada 562 ribu simpul transaksi.',
        conventionalLimitation: 'Pencarian manual nama atau nomor rekening gagal jika sindikat menggunakan rekening baru yang belum masuk daftar hitam (Zero-Day Mule).',
        gnnAdvantage: 'GraphSAGE menangkap kesamaan perilaku struktural jaringan bahkan untuk rekening yang baru dibuka kemarin.',
        canvas: {
            title: 'Visualisasi Kedekatan Vektor Embedding 32-Dimensi',
            badge: 'GraphSAGE 32-Dim Vektor Similarity',
            nodes: [
                { id: 'target_node', label: 'REKENING TUJUAN TARGET', sub: 'Rekening Baru · Sim 0.94', type: 'source', x: 280, y: 190, risk: 95 },
                { id: 'cent_mule', label: 'Centroid Klaster Sindikat', sub: 'Cluster Mule Kuningan-Bdg', type: 'transit', x: 440, y: 120, risk: 98 },
                { id: 'mule_known_1', label: 'Blacklisted Mule #1', sub: 'Sindikat Terkonfirmasi', type: 'mule', x: 480, y: 220, risk: 99 },
                { id: 'mule_known_2', label: 'Blacklisted Mule #2', sub: 'Sindikat Terkonfirmasi', type: 'mule', x: 400, y: 290, risk: 97 },
                { id: 'normal_cluster', label: 'Klaster Nasabah Normal', sub: 'Payroll & Usaha Mikro (Jauh)', type: 'device', x: 100, y: 190, risk: 15 }
            ],
            edges: [
                { from: 'target_node', to: 'cent_mule', label: 'Cosine Sim = 0.942 (CRITICAL)', type: 'transit' },
                { from: 'cent_mule', to: 'mule_known_1', label: 'Relasi Vektor', type: 'mule' },
                { from: 'cent_mule', to: 'mule_known_2', label: 'Relasi Vektor', type: 'mule' },
                { from: 'normal_cluster', to: 'target_node', label: 'Distance = 0.88 (Terpisah Jauh)', type: 'device' }
            ]
        }
    },
    {
        id: 'ind_09',
        num: '09',
        code: 'pagerank_centrality_hub',
        name: 'Destination PageRank Centrality & In-Degree Velocity',
        group: 'Group 2: Relational Graph Intelligence',
        groupId: 'relational_gnn',
        categoryType: 'gnn',
        methodology: 'Graph Centrality Scorer & High-Degree Aggregator',
        weight: 'Bobot 0.12 (Graph Topology Metric)',
        score: 89,
        level: 'HIGH',
        formula: 'PageRank(Node_Dest) > 0.035 (Normal < 0.002)',
        triggerSample: 'PageRank simpul tujuan = 0.048 (terhubung ke 42 rekening sumber dalam 24 jam)',
        threshold: 'PageRank > 0.035 dan in-degree > 15 simpul masuk per hari',
        xaiShap: '+0.230 (Titik Simpul Pengumpul Dana Skala Besar)',
        regulation: 'POJK No. 8/2023 Lampiran II — Parameter Analisis Profil Jaringan',
        description: 'Menilai tingkat kepentingan dan sentralitas simpul rekening tujuan dalam graf perbankan berdasarkan algoritma PageRank dan laju akumulasi in-degree.',
        conventionalLimitation: 'Tidak memperhitungkan bobot reputasi dari rekening-rekening yang mengirim dana ke simpul tujuan.',
        gnnAdvantage: 'PageRank secara matematis membuktikan bahwa rekening tersebut merupakan pusat gravitasi transaksi pencucian uang.',
        canvas: {
            title: 'Topologi PageRank Centrality Hub (In-Degree = 42 Simpul)',
            badge: 'Sentralitas Simpul Graf Tinggi',
            nodes: [
                { id: 'in_1', label: 'Akun Pengirim Cabang 1', sub: 'BJB Cirebon', type: 'mule', x: 80, y: 70, risk: 75 },
                { id: 'in_2', label: 'Akun Pengirim Cabang 2', sub: 'BPR Kuningan', type: 'mule', x: 80, y: 150, risk: 78 },
                { id: 'in_3', label: 'Akun Pengirim Cabang 3', sub: 'BJB Indramayu', type: 'mule', x: 80, y: 230, risk: 80 },
                { id: 'in_4', label: 'Akun Pengirim Cabang 4', sub: 'BCA Bandung', type: 'mule', x: 80, y: 310, risk: 76 },
                { id: 'pr_hub', label: 'HIGH PAGERANK HUB', sub: 'Centrality = 0.048 (Aggregator)', type: 'transit', x: 300, y: 190, risk: 94 },
                { id: 'pr_out', label: 'Konsolidasi Akhir', sub: 'Escrow Rekening Khusus', type: 'crypto', x: 500, y: 190, risk: 96 }
            ],
            edges: [
                { from: 'in_1', to: 'pr_hub', label: 'In-flow #1', type: 'transit' },
                { from: 'in_2', to: 'pr_hub', label: 'In-flow #2', type: 'transit' },
                { from: 'in_3', to: 'pr_hub', label: 'In-flow #3', type: 'transit' },
                { from: 'in_4', to: 'pr_hub', label: 'In-flow #4', type: 'transit' },
                { from: 'pr_hub', to: 'pr_out', label: 'Total Inflow Rp 420M', type: 'crypto' }
            ]
        }
    },
    {
        id: 'ind_10',
        num: '10',
        code: 'blacklisted_crypto_wallet_linkage',
        name: 'Blacklisted Wallet Linkage (Tautan Dompet Hitam Kripto)',
        group: 'Group 2: Relational Graph Intelligence',
        groupId: 'relational_gnn',
        categoryType: 'gnn',
        methodology: 'GNN Hop Extender + Threat Intelligence Blacklist',
        weight: 'Bobot 0.15 (+50 Poin Kritis)',
        score: 99,
        level: 'CRITICAL',
        formula: 'ShortestPath(Dest, Blacklist_Address) ≤ 2 Hops',
        triggerSample: 'Rekening penerima terafiliasi dengan alamat dompet Cold Wallet OFAC/PPATK 0x3f9a...88b2',
        threshold: 'Terhubung dalam radius ≤ 2 hop ke wallet terdaftar dalam blacklist regulator',
        xaiShap: '+0.460 (Sanksi Regulator / Tautan Langsung ke Entitas Terlarang)',
        regulation: 'Daftar Terduga Teroris & Organisasi Terlarang (DTTOT) PPATK & Sanksi Bappebti',
        description: 'Mendeteksi interaksi langsung maupun tidak langsung antara rekening bank dengan entitas bursa kripto gelap atau alamat wallet kripto yang masuk dalam blacklist penegak hukum.',
        conventionalLimitation: 'Bank hanya memeriksa nama pemilik rekening bank, tidak memiliki data konversi fiat-ke-kripto.',
        gnnAdvantage: 'Crypto-Sentinel mengintegrasikan threat intelligence on-chain dan off-chain ke dalam graf terpadu.',
        canvas: {
            title: 'Topologi Tautan ke Blacklisted Cold Wallet',
            badge: 'Threat Intelligence Blacklist Match',
            nodes: [
                { id: 'bank_src', label: 'Rekening Bank Pengirim', sub: 'BJB Kuningan 11029384', type: 'source', x: 80, y: 190, risk: 90 },
                { id: 'vasp_bridge', label: 'VASP Deposit Gateway', sub: 'Binance P2P Merchant IDR', type: 'transit', x: 280, y: 190, risk: 94 },
                { id: 'black_wallet', label: 'BLACKLISTED COLD WALLET', sub: 'OFAC / PPATK Flagged · 0x3f9a...88b2', type: 'crypto', x: 480, y: 190, risk: 99 }
            ],
            edges: [
                { from: 'bank_src', to: 'vasp_bridge', label: 'Transfer Rp 50.000.000', type: 'transit' },
                { from: 'vasp_bridge', to: 'black_wallet', label: 'On-chain Outflow (1 Hop)', type: 'crypto' }
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // GROUP 3: PURPOSE MISMATCH & NOMINAL SIGNALS (3 Indikator)
    // ══════════════════════════════════════════════════════════════════════════
    {
        id: 'ind_11',
        num: '11',
        code: 'purpose_vs_destination_mismatch',
        name: 'Purpose vs Destination Mismatch (ISO 20022 NLP)',
        group: 'Group 3: Purpose Mismatch & Nominal',
        groupId: 'purpose_nominal',
        categoryType: 'konvensional',
        methodology: 'Rule Engine NLP & VASP Registry Matcher (Rule #8)',
        weight: 'Bobot 0.15 (+35 Poin Rule)',
        score: 87,
        level: 'HIGH',
        formula: 'IsVASP(Dest) && Purpose_Category ∈ [FAMILY, EDUCATION, LOAN_PAYMENT]',
        triggerSample: 'Berita transfer "Bayar SPP Kuliah / Hutang" namun penerima adalah Akun Escrow P2P Exchange',
        threshold: 'Berita acara kategori pribadi/sosial dikirimkan ke rekening institusi bursa kripto',
        xaiShap: '+0.198 (Ketidaksesuaian Substansi Transaksi ISO 20022)',
        regulation: 'POJK No. 8/2023 Pasal 17 — Verifikasi Informasi dan Dokumen Pendukung Transaksi',
        description: 'Mendeteksi manipulasi kolom berita transfer pada format ISO 20022 di mana nasabah mencantumkan alasan pembayaran normal untuk menyamarkan pembelian aset digital ilegal.',
        conventionalLimitation: 'Sistem perbankan konvensional hanya menyimpan teks berita tanpa menganalisis klasifikasi bisnis rekening tujuan secara otomatis.',
        gnnAdvantage: 'Dipadukan dengan klasifikasi entitas penerima untuk mendeteksi kontradiksi semantik.',
        canvas: {
            title: 'Pemeriksaan Kontradiksi Berita ISO 20022 vs Penerima',
            badge: 'Ketidaksesuaian Berita Transfer',
            nodes: [
                { id: 'iso_msg', label: 'Berita Transfer ISO 20022', sub: '"Bayar SPP Semester 6 / Hutang"', type: 'device', x: 80, y: 190, risk: 30 },
                { id: 'acc_sender', label: 'Rekening Pengirim', sub: 'Nasabah BJB 4410982', type: 'source', x: 260, y: 190, risk: 85 },
                { id: 'vasp_target', label: 'VASP Crypto Exchange', sub: 'Indodax / Tokocrypto Deposit Pool', type: 'crypto', x: 480, y: 190, risk: 93 }
            ],
            edges: [
                { from: 'iso_msg', to: 'acc_sender', label: 'Alasan: Pendidikan', type: 'device' },
                { from: 'acc_sender', to: 'vasp_target', label: 'Tujuan Nyata: Bursa Kripto (MISMATCH)', type: 'crypto' }
            ]
        }
    },
    {
        id: 'ind_12',
        num: '12',
        code: 'structuring_split_uniform',
        name: 'Pola Pemecahan Dana Seragam (Structuring Split)',
        group: 'Group 3: Purpose Mismatch & Nominal',
        groupId: 'purpose_nominal',
        categoryType: 'konvensional',
        methodology: 'Rule Engine Structuring Detector & Variance Checker (Rule #12)',
        weight: 'Bobot 0.14 (+45 Poin Kritis)',
        score: 95,
        level: 'CRITICAL',
        formula: 'Count(amount_i ≈ amount_j) ≥ 3 && Variance(amount) < 0.05 dalam interval < 15 menit',
        triggerSample: '5× transaksi bernilai Rp 10.000.000 identik ke 5 rekening berbeda dalam 10 menit',
        threshold: '≥ 3 transfer bernilai persis sama dalam window 1 jam untuk menghindari limit pelaporan',
        xaiShap: '+0.320 (Indikasi Penghindaran Batas Pelaporan Tunai / LTKM)',
        regulation: 'UU No. 8/2010 Pasal 23 & SE OJK No. 32/2023 — Pemecahan Transaksi untuk Menghindari Pelaporan',
        description: 'Pola smurfing di mana dana bernilai besar dipecah menjadi beberapa tiket nominal seragam tepat di bawah ambang batas pelaporan transaksi keuangan tunai/elektronik.',
        conventionalLimitation: 'Jika tiap transaksi berdiri sendiri di bawah Rp 100M, rule konvensional tidak akan memicu flag pelaporan CTR.',
        gnnAdvantage: 'Crypto-Sentinel mengagregasi seluruh sub-transaksi dan memetakan penerimanya dalam satu kanvas investigasi terintegrasi.',
        canvas: {
            title: 'Topologi Structuring (Pemecahan 5x Rp 10 Juta Seragam)',
            badge: 'Smurfing & Structuring Detector',
            nodes: [
                { id: 'src_struct', label: 'Sumber Dana (Rp 50 Juta)', sub: 'BJB Kuningan · 11029384', type: 'source', x: 80, y: 190, risk: 94 },
                { id: 'st_1', label: 'Pecahan #1', sub: 'Rp 10.000.000 (Mule 1)', type: 'mule', x: 300, y: 70, risk: 88 },
                { id: 'st_2', label: 'Pecahan #2', sub: 'Rp 10.000.000 (Mule 2)', type: 'mule', x: 300, y: 130, risk: 88 },
                { id: 'st_3', label: 'Pecahan #3', sub: 'Rp 10.000.000 (Mule 3)', type: 'mule', x: 300, y: 190, risk: 88 },
                { id: 'st_4', label: 'Pecahan #4', sub: 'Rp 10.000.000 (Mule 4)', type: 'mule', x: 300, y: 250, risk: 88 },
                { id: 'st_5', label: 'Pecahan #5', sub: 'Rp 10.000.000 (Mule 5)', type: 'mule', x: 300, y: 310, risk: 88 },
                { id: 'st_pool', label: 'Pool Penampung Akhir', sub: 'Aggregator Kuningan', type: 'transit', x: 500, y: 190, risk: 96 }
            ],
            edges: [
                { from: 'src_struct', to: 'st_1', label: 'Split 1', type: 'mule' },
                { from: 'src_struct', to: 'st_2', label: 'Split 2', type: 'mule' },
                { from: 'src_struct', to: 'st_3', label: 'Split 3', type: 'mule' },
                { from: 'src_struct', to: 'st_4', label: 'Split 4', type: 'mule' },
                { from: 'src_struct', to: 'st_5', label: 'Split 5', type: 'mule' },
                { from: 'st_1', to: 'st_pool', label: 'Sweep', type: 'transit' },
                { from: 'st_2', to: 'st_pool', label: 'Sweep', type: 'transit' },
                { from: 'st_3', to: 'st_pool', label: 'Sweep', type: 'transit' },
                { from: 'st_4', to: 'st_pool', label: 'Sweep', type: 'transit' },
                { from: 'st_5', to: 'st_pool', label: 'Sweep', type: 'transit' }
            ]
        }
    },
    {
        id: 'ind_13',
        num: '13',
        code: 'balance_drain_ratio_to_zero',
        name: 'Rasio Saldo Terkuras (Drain-to-Zero Ratio = 1.00)',
        group: 'Group 3: Purpose Mismatch & Nominal',
        groupId: 'purpose_nominal',
        categoryType: 'konvensional',
        methodology: 'Random Forest Feature #1 (30.04%) & Feature #5 (9.96%)',
        weight: 'Bobot 0.18 (RF Top Feature 40%)',
        score: 97,
        level: 'CRITICAL',
        formula: 'amount_ratio = amount ÷ oldbalanceOrg = 1.000 && newbalanceOrig = 0',
        triggerSample: 'Saldo Rp 150.000.000 ditarik persis Rp 150.000.000 menyisakan saldo Rp 0',
        threshold: 'Penarikan ≥ 95% dari total saldo rekening dalam 1 tiket transaksi',
        xaiShap: '+0.342 (Kontribusi Fitur Terbesar Model Random Forest)',
        regulation: 'POJK No. 8/2023 Pasal 19 — Penarikan Seluruh Saldo Tidak Sesuai Profil',
        description: 'Mengukur proporsi dana yang ditransfer terhadap saldo rekening awal. Penarikan 100% hingga saldo menjadi nol merupakan ciri khas utama akun rekening keledai atau korban pembajakan.',
        conventionalLimitation: 'Hanya melihat selisih matematika saldo, tanpa memvalidasi apakah uang langsung lari ke bursa kripto atau penampung sindikat.',
        gnnAdvantage: 'Dipadukan dengan analisis graf untuk membuktikan apakah pengurasan saldo ini terkoordinasi dengan rekening penampung transit.',
        canvas: {
            title: 'Topologi Pengurasan Total (Drain-to-Zero 100%)',
            badge: 'RF Feature #1 (30.04% Importance)',
            nodes: [
                { id: 'bal_old', label: 'Saldo Awal Rekening', sub: 'Rp 150.000.000 (100% Saldo)', type: 'device', x: 80, y: 190, risk: 30 },
                { id: 'acc_drain', label: 'Rekening Sumber (BJB)', sub: 'Sisa Saldo: Rp 0 (KURAS TOTAL)', type: 'source', x: 280, y: 190, risk: 97 },
                { id: 'drain_dest', label: 'Rekening Penampung Cepat', sub: 'Bank Jago / Mandiri Transit', type: 'transit', x: 480, y: 190, risk: 93 }
            ],
            edges: [
                { from: 'bal_old', to: 'acc_drain', label: 'Kuras 100% Saldo', type: 'device' },
                { from: 'acc_drain', to: 'drain_dest', label: 'Transfer Rp 150.000.000 (Ratio = 1.000)', type: 'transit' }
            ]
        }
    },

    // ══════════════════════════════════════════════════════════════════════════
    // GROUP 4: TECHNICAL & TELEMETRY SIGNALS (2 Indikator)
    // ══════════════════════════════════════════════════════════════════════════
    {
        id: 'ind_14',
        num: '14',
        code: 'impossible_travel_geolocation',
        name: 'Impossible Travel & Geolocation Anomaly (Jarak Geografis Mustahil)',
        group: 'Group 4: Technical Signals',
        groupId: 'technical',
        categoryType: 'konvensional',
        methodology: 'Haversine Great-Circle Telemetry & GeoIP Sensor',
        weight: 'Bobot 0.10 (+30 Poin Rule)',
        score: 91,
        level: 'CRITICAL',
        formula: 'Speed = Haversine(Loc_A, Loc_B) ÷ ΔTime > 800 km/jam',
        triggerSample: 'Login di Jakarta (WIB), 10 menit kemudian transaksi dieksekusi dari IP Amsterdam (11.450 km / 68.700 km/jam)',
        threshold: 'Kecepatan perpindahan lokasi > 800 km/jam antara 2 sesi berturutan',
        xaiShap: '+0.285 (Indikasi Pengambilalihan Akun / Account Takeover)',
        regulation: 'Surat Edaran BI No. 24/2022 — Keamanan Transaksi Elektronik & Deteksi ATO',
        description: 'Mendeteksi transaksi yang dieksekusi dari lokasi geografis yang secara fisik tidak mungkin dijangkau nasabah dalam interval waktu antara dua sesi login atau transaksi berturut-turut.',
        conventionalLimitation: 'Data IP sering tidak akurat jika database GeoIP offline kadaluarsa atau provider seluler menggunakan Dynamic CGNAT.',
        gnnAdvantage: 'Crypto-Sentinel mengombinasikan data telemetri IP dengan device fingerprint dan grafik relasi tujuan transfer.',
        canvas: {
            title: 'Topologi Impossible Travel (Jakarta ➔ Amsterdam dlm 10 Menit)',
            badge: 'Anomali Jarak & Kecepatan Geografis',
            nodes: [
                { id: 'loc_jkt', label: 'Sesi Login Asal (Jakarta)', sub: 'IP 182.1.22.4 · 14:10 WIB (Wajar)', type: 'source', x: 80, y: 190, risk: 20 },
                { id: 'telemetry_mid', label: 'Analisis Kecepatan Haversine', sub: 'Jarak: 11.450 km · Waktu: 10 Menit', type: 'device', x: 280, y: 190, risk: 91 },
                { id: 'loc_ams', label: 'Eksekusi Transaksi (Amsterdam)', sub: 'IP 185.220.101.5 · 14:20 WIB (ANOMALI)', type: 'transit', x: 480, y: 190, risk: 96 }
            ],
            edges: [
                { from: 'loc_jkt', to: 'telemetry_mid', label: 'Sesi 1 (14:10 WIB)', type: 'source' },
                { from: 'telemetry_mid', to: 'loc_ams', label: 'Speed: 68.700 km/h (MUSTAHIL)', type: 'transit' }
            ]
        }
    },
    {
        id: 'ind_15',
        num: '15',
        code: 'device_integrity_vpn_emulator',
        name: 'Device Integrity, VPN Proxy & Root Detection',
        group: 'Group 4: Technical Signals',
        groupId: 'technical',
        categoryType: 'konvensional',
        methodology: 'Mobile Telemetry & Threat Sensor (Rule #7)',
        weight: 'Bobot 0.08 (+25 Poin Rule)',
        score: 86,
        level: 'HIGH',
        formula: 'is_vpn == true || is_emulator == true || is_rooted == true',
        triggerSample: 'Transaksi dikirimkan dari perangkat Android yang di-root melalui VPN Tor Exit Node (182.16.2.90)',
        threshold: 'Deteksi penggunaan proxy komersial, Tor node, emulator, atau perangkat modifikasi root/jailbreak',
        xaiShap: '+0.215 (Upaya Pengaburan Identitas Jaringan & Integritas Perangkat)',
        regulation: 'Standar Keamanan Siber BSSN & POJK No. 11/2022 — Penyelenggaraan Teknologi Informasi Bank',
        description: 'Mendeteksi penggunaan perantara jaringan seperti VPN, Proxy anonim, Tor Browser, atau perangkat Android/iOS yang telah di-root untuk menyembunyikan identitas fisik pelaku kejahatan.',
        conventionalLimitation: 'Banyak nasabah umum menggunakan VPN untuk privasi sehingga menimbulkan false positive jika tidak diverifikasi dengan graf rekening.',
        gnnAdvantage: 'Jika perangkat VPN ini terhubung dengan banyak rekening yang berbeda (device-sharing fraud ring), GNN langsung mengunci status risiko kritis.',
        canvas: {
            title: 'Topologi Device Sharing & VPN Proxy Interception',
            badge: 'Integritas Perangkat & Proksi Gelap',
            nodes: [
                { id: 'dev_root', label: 'Perangkat Root / Emulator', sub: 'Android Modded · IMEI Spoofed', type: 'device', x: 80, y: 110, risk: 85 },
                { id: 'vpn_node', label: 'VPN Proxy / Tor Exit Node', sub: 'IP 182.16.2.90 (Anonymizer)', type: 'device', x: 80, y: 270, risk: 88 },
                { id: 'bank_gateway', label: 'APEX BJB API Gateway', sub: 'Intersepsi Request SNAP BI', type: 'source', x: 300, y: 190, risk: 90 },
                { id: 'dest_compromised', label: 'Rekening Sindikat Tujuan', sub: 'Penampung Kripto Gateway', type: 'crypto', x: 500, y: 190, risk: 95 }
            ],
            edges: [
                { from: 'dev_root', to: 'bank_gateway', label: 'Root Flag = TRUE', type: 'device' },
                { from: 'vpn_node', to: 'bank_gateway', label: 'Proxy Detected', type: 'device' },
                { from: 'bank_gateway', to: 'dest_compromised', label: 'Pre-Auth Block Intersepsi', type: 'crypto' }
            ]
        }
    }
];

// ============================================================================
// MAIN COMPONENT: GNN METRICS CATALOG VIEW
// ============================================================================
export default function GNNMetricsCatalogView({ addToast, onOpenCustomer360, onCreateCase }) {
    const [selectedIndicatorId, setSelectedIndicatorId] = useState('ind_05'); // Default to Hero GNN metric
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGroupFilter, setActiveGroupFilter] = useState('all');
    const [activeMethodologyFilter, setActiveMethodologyFilter] = useState('all'); // 'all' | 'konvensional' | 'gnn'
    const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'xai_shap' | 'regulatory'

    // Selected indicator details
    const currentIndicator = useMemo(() => {
        return CORE_15_INDICATORS.find(ind => ind.id === selectedIndicatorId) || CORE_15_INDICATORS[0];
    }, [selectedIndicatorId]);

    // Filtered indicators based on search, group, and methodology (Konvensional vs GNN)
    const filteredIndicators = useMemo(() => {
        return CORE_15_INDICATORS.filter(ind => {
            const matchSearch = ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ind.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ind.methodology.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ind.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ind.group.toLowerCase().includes(searchQuery.toLowerCase());
            const matchGroup = activeGroupFilter === 'all' || ind.groupId === activeGroupFilter;
            const matchMethod = activeMethodologyFilter === 'all' || ind.categoryType === activeMethodologyFilter;
            return matchSearch && matchGroup && matchMethod;
        });
    }, [searchQuery, activeGroupFilter, activeMethodologyFilter]);

    // Summary counts
    const gnnCount = CORE_15_INDICATORS.filter(i => i.categoryType === 'gnn').length;
    const konvensionalCount = CORE_15_INDICATORS.filter(i => i.categoryType === 'konvensional').length;

    return (
        <div className="gnn-metrics-catalog-view" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* ── TOP BANNER ── */}
            <div className="card" style={{ padding: '20px 24px', border: '1px solid #bfdbfe', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            background: '#2563eb',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Network size={24} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: '#dbeafe', color: '#1d4ed8' }}>
                                    STANDAR BLUEPRINT 4 SIGNAL GROUPS
                                </span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                                    6 GNN GRAPH SAGE · 9 KONVENSIONAL
                                </span>
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '4px 0 2px', color: 'var(--text-primary)' }}>
                                Katalog 15 Sub-Indikator Deteksi AML &amp; Canvas Topologi GNN
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                                Eksplorasi interaktif 15 metrik deteksi hasil pengujian Bank bjb &amp; PaySim: bandingkan deteksi konvensional berbasis aturan dengan kecerdasan relasional Graph Neural Network (GraphSAGE).
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ padding: '8px 14px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1e40af' }}>TOTAL INDIKATOR</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d4ed8' }}>15 METRIK</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MAIN WORKBENCH: 2-COLUMN LAYOUT (LEFT: LIST, RIGHT: DYNAMIC CANVAS & XAI) ── */}
            <div className="catalog-grid-layout">

                {/* ────────────────────────────────────────────────────────────
                    LEFT COLUMN: SEARCH, GROUP FILTERS & 15 INDICATORS LIST
                ──────────────────────────────────────────────────────────── */}
                <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sliders size={16} color="#2563eb" />
                            Daftar 15 Indikator
                        </h3>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                            {filteredIndicators.length} dari 15
                        </span>
                    </div>

                    {/* Search bar */}
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Cari kode, nama, atau rumus..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '9px 12px 9px 36px',
                                fontSize: '0.8rem',
                                borderRadius: 8,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-primary)',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Filter Methodology: All vs Konvensional vs GNN */}
                    <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                            KLASIFIKASI ENGINE AI / DETEKSI:
                        </div>
                        <div className="catalog-methodology-grid">
                            <button
                                type="button"
                                onClick={() => setActiveMethodologyFilter('all')}
                                style={{
                                    padding: '6px 8px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    border: activeMethodologyFilter === 'all' ? '1px solid #2563eb' : '1px solid var(--border-color)',
                                    background: activeMethodologyFilter === 'all' ? '#2563eb' : 'var(--bg-card)',
                                    color: activeMethodologyFilter === 'all' ? '#ffffff' : 'var(--text-secondary)'
                                }}
                            >
                                Semua (15)
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveMethodologyFilter('gnn')}
                                style={{
                                    padding: '6px 8px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    border: activeMethodologyFilter === 'gnn' ? '1px solid #1d4ed8' : '1px solid var(--border-color)',
                                    background: activeMethodologyFilter === 'gnn' ? '#1d4ed8' : 'var(--bg-card)',
                                    color: activeMethodologyFilter === 'gnn' ? '#ffffff' : 'var(--text-secondary)'
                                }}
                            >
                                Graph AI ({gnnCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveMethodologyFilter('konvensional')}
                                style={{
                                    padding: '6px 8px',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    border: activeMethodologyFilter === 'konvensional' ? '1px solid #2563eb' : '1px solid var(--border-color)',
                                    background: activeMethodologyFilter === 'konvensional' ? '#2563eb' : 'var(--bg-card)',
                                    color: activeMethodologyFilter === 'konvensional' ? '#ffffff' : 'var(--text-secondary)'
                                }}
                            >
                                Aturan ({konvensionalCount})
                            </button>
                        </div>
                    </div>

                    {/* Filter 4 Signal Groups */}
                    <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                            4 SIGNAL GROUPS (BLUEPRINT):
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {[
                                { id: 'all', label: 'Semua 4 Signal Groups', count: 15 },
                                { id: 'behavioral', label: 'Group 1: Behavioral Signals', count: 4 },
                                { id: 'relational_gnn', label: 'Group 2: Relational Graph (GNN)', count: 6 },
                                { id: 'purpose_nominal', label: 'Group 3: Purpose & Nominal', count: 3 },
                                { id: 'technical', label: 'Group 4: Technical & Telemetry', count: 2 }
                            ].map(g => (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => setActiveGroupFilter(g.id)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '6px 10px',
                                        borderRadius: 6,
                                        fontSize: '0.73rem',
                                        fontWeight: activeGroupFilter === g.id ? 800 : 600,
                                        border: activeGroupFilter === g.id ? '1px solid #93c5fd' : '1px solid transparent',
                                        background: activeGroupFilter === g.id ? '#eff6ff' : 'transparent',
                                        color: activeGroupFilter === g.id ? '#1d4ed8' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span>{g.label}</span>
                                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({g.count})</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />

                    {/* Scrollable Indicator Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '580px', overflowY: 'auto', paddingRight: 4 }}>
                        {filteredIndicators.map((ind) => {
                            const isSelected = ind.id === selectedIndicatorId;
                            const isGnn = ind.categoryType === 'gnn';

                            return (
                                <div
                                    key={ind.id}
                                    onClick={() => setSelectedIndicatorId(ind.id)}
                                    style={{
                                        padding: '11px 13px',
                                        borderRadius: 8,
                                        border: isSelected
                                            ? '2px solid #2563eb'
                                            : '1px solid var(--border-color)',
                                        background: isSelected
                                            ? '#eff6ff'
                                            : 'var(--bg-card)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 6
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{
                                                fontSize: '0.62rem',
                                                fontWeight: 800,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                background: '#2563eb',
                                                color: '#ffffff'
                                            }}>
                                                #{ind.num}
                                            </span>
                                            <span style={{
                                                fontSize: '0.62rem',
                                                fontWeight: 800,
                                                padding: '2px 6px',
                                                borderRadius: 4,
                                                background: '#dbeafe',
                                                color: '#1e40af'
                                            }}>
                                                {isGnn ? 'GRAPH AI (GNN)' : 'KONVENSIONAL'}
                                            </span>
                                        </div>

                                        <span style={{
                                            fontSize: '0.62rem',
                                            fontWeight: 800,
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            background: ind.level === 'CRITICAL' ? '#fee2e2' : '#fef3c7',
                                            color: ind.level === 'CRITICAL' ? '#b91c1c' : '#b45309'
                                        }}>
                                            {ind.level}
                                        </span>
                                    </div>

                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                                            {ind.name}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                                            {ind.code}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                        <span>{ind.weight}</span>
                                        <span style={{ fontWeight: 700, color: isSelected ? '#1d4ed8' : 'inherit' }}>
                                            Buka Topologi &rarr;
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredIndicators.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                Tidak ada indikator yang cocok dengan pencarian.
                            </div>
                        )}
                    </div>
                </div>

                {/* ────────────────────────────────────────────────────────────
                    RIGHT COLUMN: DEDICATED CONTEXTUAL GNN CANVAS & XAI DECOMPOSITION
                ──────────────────────────────────────────────────────────── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* ── HEADER DETAILS OF CURRENT SELECTED INDICATOR ── */}
                    <div className="card" style={{
                        padding: '18px 22px',
                        border: '1px solid #bfdbfe',
                        background: 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        padding: '3px 8px',
                                        borderRadius: 4,
                                        background: '#2563eb',
                                        color: '#ffffff'
                                    }}>
                                        INDIKATOR #{currentIndicator.num} · {currentIndicator.categoryType === 'gnn' ? 'GRAPH NEURAL NETWORK (GNN)' : 'ATURAN & TABULAR KONVENSIONAL'}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e40af' }}>
                                        {currentIndicator.group}
                                    </span>
                                </div>

                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '2px 0 6px', color: 'var(--text-primary)' }}>
                                    {currentIndicator.name}
                                </h3>

                                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45, maxWidth: '100%' }}>
                                    {currentIndicator.description}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ padding: '8px 14px', borderRadius: 8, background: '#ffffff', border: '1px solid var(--border-color)', textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>RISK CONTRIBUTION</div>
                                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: currentIndicator.level === 'CRITICAL' ? '#dc2626' : '#d97706' }}>
                                        {currentIndicator.score}/100
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Comparison Bar: Konvensional vs GNN */}
                        <div className="catalog-compare-grid">
                            <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #fed7aa' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <AlertTriangle size={12} /> Keterbatasan Deteksi Konvensional (Rule Kaku):
                                </span>
                                <p style={{ fontSize: '0.76rem', color: '#7c2d12', margin: '4px 0 0', lineHeight: 1.4 }}>
                                    {currentIndicator.conventionalLimitation}
                                </p>
                            </div>

                            <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <Zap size={12} color="#2563eb" /> Keunggulan Deteksi Crypto-Sentinel (GNN / Hybrid):
                                </span>
                                <p style={{ fontSize: '0.76rem', color: '#1e3a8a', margin: '4px 0 0', lineHeight: 1.4 }}>
                                    {currentIndicator.gnnAdvantage}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── TABS: DEDICATED CANVAS vs XAI DECOMPOSITION vs REGULATORY ── */}
                    <div className="catalog-tabs-bar">
                        <button
                            type="button"
                            onClick={() => setActiveTab('canvas')}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: activeTab === 'canvas' ? '#2563eb' : 'transparent',
                                color: activeTab === 'canvas' ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            <Network size={15} />
                            Canvas Topologi Graf Khusus Indikator #{currentIndicator.num}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('xai_shap')}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: activeTab === 'xai_shap' ? '#2563eb' : 'transparent',
                                color: activeTab === 'xai_shap' ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            <Cpu size={15} />
                            Dekomposisi XAI &amp; Formula SHAP
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('regulatory')}
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                borderRadius: 6,
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                background: activeTab === 'regulatory' ? '#2563eb' : 'transparent',
                                color: activeTab === 'regulatory' ? '#ffffff' : 'var(--text-secondary)'
                            }}
                        >
                            <FileText size={15} />
                            Rujukan Regulasi POJK &amp; UU TPPU
                        </button>
                    </div>

                    {/* ── TAB 1: UNIQUE CONTEXTUAL GNN CANVAS ACCORDING TO THE METRIC ── */}
                    {activeTab === 'canvas' && (
                        <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                                        {currentIndicator.canvas?.badge || 'Topologi Khusus'}
                                    </div>
                                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '2px 0 0', color: 'var(--text-primary)' }}>
                                        {currentIndicator.canvas?.title || currentIndicator.name}
                                    </h4>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                        Simpul Aktif: <strong>{currentIndicator.canvas?.nodes?.length || 0} Entitas</strong>
                                    </span>
                                </div>
                            </div>

                            {/* SVG Subgraph Canvas */}
                            <div style={{
                                width: '100%',
                                height: '390px',
                                background: '#0a0f1d',
                                borderRadius: 10,
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid #1e293b'
                            }}>
                                <svg width="100%" height="100%" viewBox="0 0 640 390" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                                    {/* Background Grid Pattern */}
                                    <defs>
                                        <pattern id="grid-pattern-cat" width="30" height="30" patternUnits="userSpaceOnUse">
                                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                                        </pattern>
                                        <marker id="arrow-blue" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
                                        </marker>
                                        <marker id="arrow-red" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                                        </marker>
                                        <marker id="arrow-purple" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                                            <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
                                        </marker>
                                    </defs>

                                    <rect width="100%" height="100%" fill="url(#grid-pattern-cat)" />

                                    {/* Render Dynamic Edges */}
                                    {currentIndicator.canvas?.edges?.map((edge, idx) => {
                                        const fromNode = currentIndicator.canvas?.nodes?.find(n => n.id === edge.from);
                                        const toNode = currentIndicator.canvas?.nodes?.find(n => n.id === edge.to);
                                        if (!fromNode || !toNode) return null;

                                        const midX = (fromNode.x + toNode.x) / 2;
                                        const midY = (fromNode.y + toNode.y) / 2;
                                        const isCritical = edge.type === 'crypto' || edge.type === 'transit';
                                        const strokeColor = edge.type === 'crypto' ? '#ef4444' : edge.type === 'transit' ? '#f59e0b' : edge.type === 'device' ? '#94a3b8' : '#38bdf8';
                                        const markerId = edge.type === 'crypto' ? 'url(#arrow-red)' : edge.type === 'transit' ? 'url(#arrow-purple)' : 'url(#arrow-blue)';

                                        return (
                                            <g key={`edge-${idx}`}>
                                                <line
                                                    x1={fromNode.x}
                                                    y1={fromNode.y}
                                                    x2={toNode.x}
                                                    y2={toNode.y}
                                                    stroke={strokeColor}
                                                    strokeWidth={isCritical ? 2.5 : 1.8}
                                                    strokeDasharray={edge.type === 'device' ? '4 3' : 'none'}
                                                    markerEnd={markerId}
                                                    opacity={0.85}
                                                />
                                                {edge.label && (
                                                    <g transform={`translate(${midX}, ${midY - 8})`}>
                                                        <rect
                                                            x="-55"
                                                            y="-8"
                                                            width="110"
                                                            height="16"
                                                            rx="3"
                                                            fill="#0f172a"
                                                            stroke={strokeColor}
                                                            strokeWidth="0.8"
                                                            opacity="0.9"
                                                        />
                                                        <text
                                                            fill="#f1f5f9"
                                                            fontSize="8"
                                                            fontWeight="700"
                                                            textAnchor="middle"
                                                            dy="3"
                                                        >
                                                            {edge.label}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    })}

                                    {/* Render Dynamic Nodes */}
                                    {currentIndicator.canvas?.nodes?.map((node) => {
                                        const isSource = node.type === 'source';
                                        const isMule = node.type === 'mule';
                                        const isTransit = node.type === 'transit';
                                        const isCrypto = node.type === 'crypto';
                                        const isDevice = node.type === 'device';

                                        const nodeColor = isCrypto ? '#ef4444' : isTransit ? '#f59e0b' : isMule ? '#10b981' : isDevice ? '#64748b' : '#3b82f6';
                                        const nodeRadius = isSource || isTransit || isCrypto ? 20 : 16;

                                        return (
                                            <g
                                                key={node.id}
                                                transform={`translate(${node.x}, ${node.y})`}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    if (onOpenCustomer360) {
                                                        onOpenCustomer360({
                                                            account: node.id,
                                                            name: node.label,
                                                            bank: node.sub || 'Bank bjb',
                                                            riskScore: node.risk || 85,
                                                            type: node.type
                                                        });
                                                    }
                                                }}
                                            >
                                                {/* Pulse halo for source/critical */}
                                                {(isSource || isCrypto || isTransit) && (
                                                    <circle
                                                        r={nodeRadius + 7}
                                                        fill="none"
                                                        stroke={nodeColor}
                                                        strokeWidth="1.5"
                                                        strokeDasharray="4 2"
                                                        opacity="0.6"
                                                    />
                                                )}

                                                <circle
                                                    r={nodeRadius}
                                                    fill="#0f172a"
                                                    stroke={nodeColor}
                                                    strokeWidth="3"
                                                />

                                                {/* Center icon / symbol */}
                                                <circle
                                                    r={nodeRadius - 6}
                                                    fill={nodeColor}
                                                    opacity="0.3"
                                                />

                                                {/* Label and Sub */}
                                                <text
                                                    x="0"
                                                    y={nodeRadius + 14}
                                                    fill="#f8fafc"
                                                    fontSize="9.5"
                                                    fontWeight="800"
                                                    textAnchor="middle"
                                                >
                                                    {node.label}
                                                </text>

                                                <text
                                                    x="0"
                                                    y={nodeRadius + 25}
                                                    fill="#94a3b8"
                                                    fontSize="7.5"
                                                    fontWeight="600"
                                                    textAnchor="middle"
                                                >
                                                    {node.sub}
                                                </text>
                                            </g>
                                        );
                                    })}
                                </svg>

                                {/* Legend Bar at Bottom */}
                                <div className="catalog-legend-bar">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> Rekening Asal
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#34d399' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} /> Mule / Penerima
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#fbbf24' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} /> Transit Hub
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#f87171' }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} /> VASP / Kripto
                                        </span>
                                    </div>
                                    <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                                        Klik node untuk membuka profil Customer 360
                                    </span>
                                </div>
                            </div>

                            {/* Canvas Insight Footer */}
                            <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Sampel Skenario Pemicu di Core Banking APEX:</span>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                                        {currentIndicator.triggerSample}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onCreateCase) {
                                                onCreateCase({
                                                    caseId: `CASE-${currentIndicator.code.toUpperCase()}-${Date.now().toString().slice(-4)}`,
                                                    account: {
                                                        account: currentIndicator.canvas?.nodes?.[0]?.id || '11029384',
                                                        label: currentIndicator.name,
                                                        riskScore: currentIndicator.score
                                                    },
                                                    note: `Eskalasi kasus berdasarkan indikator #${currentIndicator.num}: ${currentIndicator.name}`
                                                });
                                            }
                                        }}
                                        style={{
                                            padding: '7px 12px',
                                            fontSize: '0.73rem',
                                            fontWeight: 700,
                                            borderRadius: 6,
                                            border: 'none',
                                            background: '#2563eb',
                                            color: '#ffffff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Buat Kasus Investigasi
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: XAI & SHAP EXPLANATION ── */}
                    {activeTab === 'xai_shap' && (
                        <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                Dekomposisi Model XAI &amp; Nilai Kontribusi SHAP
                            </h4>

                            <div className="catalog-shap-grid">
                                <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>FORMULA PERHITUNGAN:</span>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, fontFamily: 'monospace', color: '#1d4ed8', marginTop: 4 }}>
                                        {currentIndicator.formula}
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-input)', padding: 14, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>AMBANG BATAS RISIKO (THRESHOLD):</span>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>
                                        {currentIndicator.threshold}
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#334155' }}>
                                        Kontribusi SHAP (Explainable AI):
                                    </span>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                                        {currentIndicator.xaiShap}
                                    </span>
                                </div>
                                <div style={{ width: '100%', height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${Math.min(currentIndicator.score, 100)}%`,
                                            height: '100%',
                                            background: '#2563eb'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 3: REGULATORY COMPLIANCE ── */}
                    {activeTab === 'regulatory' && (
                        <div className="card" style={{ padding: 18, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                Landasan Regulasi OJK &amp; UU TPPU
                            </h4>

                            <div style={{ background: '#eff6ff', padding: 14, borderRadius: 8, border: '1px solid #bfdbfe' }}>
                                <span style={{ fontSize: '0.7rem', color: '#1e40af', fontWeight: 700 }}>KETENTUAN HUKUM BERLAKU:</span>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>
                                    {currentIndicator.regulation}
                                </div>
                            </div>

                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Sesuai ketentuan <strong>POJK No. 8/2023</strong> tentang Penerapan Program Anti Pencucian Uang dan Pencegahan Pendanaan Terorisme di Sektor Jasa Keuangan, setiap alert yang dipicu oleh indikator ini wajib terdokumentasikan dalam jejak audit forensik serta dievaluasi oleh Pejabat Kepatuhan (MLRO) sebelum penerbitan Laporan Transaksi Keuangan Mencurigakan (LTKM) ke goAML PPATK.
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
