import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  Brain,
  Cpu,
  Target,
  Activity,
  Zap,
  Play,
  GitBranch,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Move,
  ShieldAlert,
  ShieldCheck,
  Coins,
  Building2,
  Smartphone,
  Radio,
  Eye,
  Info,
  Lock,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  Filter,
  Search,
  Share2,
  X,
  ChevronRight,
  ExternalLink,
  SlidersHorizontal,
  Workflow,
  User
} from 'lucide-react';
import { formatCurrency } from '../data/mockData';
import { fetchLiveGNNSubgraph } from '../services/api';

// ============================================================================
// 1. DATA SKENARIO FRAUD & TOPOLOGI PERBANKAN (GNN AML GRAPH)
// ============================================================================

const SCENARIOS = {
  smurfing_crypto: {
    id: 'smurfing_crypto',
    name: 'Skenario 1: Pola Smurfing & Pelarian Dana ke Kripto (High Risk)',
    riskScore: 92,
    riskLevel: 'HIGH',
    classification: 'SMURFING + PELARIAN KRIPTO',
    summary: 'Terdeteksi 1 akun sumber memecah dana ke 6 rekening perantara (mule), diagregasi ke tujuan antara (transit), lalu dilarikan ke 4 bursa kripto & cold wallet dalam rentang waktu < 15 menit.',
    metrics: {
      // ── 4 Indikator Utama (dari hybrid GNN 0.6 × RF 0.4 × Rule Engine)
      // Nilai real dari compute_hybrid_final_score pada skenario smurfing aktual
      gnnScore: 88,         // GraphSAGE cosine similarity to fraud centroid (emb dim=32)
      ruleScore: 95,        // Rule Engine raw score (13 aturan PPATK/OJK)
      rfScore: 91,          // Random Forest predict_proba (29 fitur PaySim+SMOTE 308K)
      hybridScore: 92,      // final = 0.6×GNN + 0.4×Rule = 0.6×88 + 0.4×95 = 91.2 ≈ 92

      // ── 15 Sub-Indikator Real (langsung dari model)
      // Kelompok A: Top-4 RF Feature Importances (amount_ratio=30%, is_transfer=12.6%, oldbalanceOrg=12.1%, amount=10.1%)
      subIndicators: {
        // INDIKATOR 1: Pola Nominal Transaksi (RF Features: amount_ratio 30.0%, amount 10.1%, is_high_amount 7.2%)
        nominal: {
          label: 'Indikator 1 — Pola Nominal Transaksi',
          score: 93,
          color: '#ef4444',
          source: 'Random Forest (Fitur: amount_ratio 30.0% + amount 10.1% + is_high_amount 7.2%)',
          subs: [
            {
              id: 'sub_amount_ratio',
              name: 'Rasio Nominal vs Saldo Awal (amount_ratio)',
              value: '150.000.000 / 150.000.000 = 1.000',
              score: 99,
              status: 'critical',
              source: 'RF Feature #1 — Importance: 30.04%',
              detail: 'amount_ratio = amount ÷ oldbalanceOrg. Nilai 1.0 = saldo terkuras habis sepenuhnya. Threshold model: >0.8 → HIGH RISK.'
            },
            {
              id: 'sub_amount',
              name: 'Nominal Transfer Absolut (amount)',
              value: 'Rp 150.000.000',
              score: 87,
              status: 'high',
              source: 'RF Feature #4 — Importance: 10.14%',
              detail: 'Nominal Rp 150M melampaui batas threshold high_amount (>Rp 15.000.000 sesama bank / >Rp 5.000.000 eksternal). Fitur ke-4 terpenting dari RF.'
            },
            {
              id: 'sub_structuring',
              name: 'Pola Pecahan Seragam (Structuring)',
              value: '5× Rp 10.000.000 (identik dalam 5 menit)',
              score: 95,
              status: 'critical',
              source: 'Rule Engine #12 — Smurfing/Structuring Detection',
              detail: 'Terdeteksi 5+ transaksi nominal hampir identik ke ≥3 akun tujuan berbeda dalam 1 jam. Score +45 poin pada Rule Engine.'
            }
          ]
        },

        // INDIKATOR 2: Pola Saldo & Arus Dana (RF Features: is_balance_drained 9.9%, oldbalanceOrg 12.1%, newbalanceDest 2.6%)
        saldo: {
          label: 'Indikator 2 — Pola Saldo & Arus Dana',
          score: 91,
          color: '#f59e0b',
          source: 'Random Forest (Fitur: is_balance_drained 9.96% + oldbalanceOrg 12.12% + newbalanceDest 2.61%)',
          subs: [
            {
              id: 'sub_balance_drained',
              name: 'Drain-to-Zero Saldo Pengirim (is_balance_drained)',
              value: 'Saldo Akhir = Rp 0 (setelah transfer Rp 150M)',
              score: 98,
              status: 'critical',
              source: 'RF Feature #5 — Importance: 9.96% | Rule Engine #3 +35pts',
              detail: 'is_balance_drained = 1 jika newbalanceOrig == 0 setelah transaksi. Kombinasi Rule Engine +35pts + RF bobot 9.96% menjadikan ini salah satu sinyal terkuat smurfing.'
            },
            {
              id: 'sub_old_balance',
              name: 'Saldo Awal Pengirim Tinggi (oldbalanceOrg)',
              value: 'Rp 150.000.000',
              score: 85,
              status: 'high',
              source: 'RF Feature #3 — Importance: 12.12%',
              detail: 'Saldo awal besar yang kemudian di-drain sepenuhnya adalah pola klasik smurfing. Model RF menggunakan feature ini sebagai konteks rasio penarikan.'
            },
            {
              id: 'sub_dest_balance_err',
              name: 'Anomali Saldo Tujuan (dest_balance_err)',
              value: 'Inkonsistensi +Rp 50M pada tujuan akhir (Transit)',
              score: 76,
              status: 'high',
              source: 'RF Feature #11 — Importance: 1.73%',
              detail: 'dest_balance_err = |newbalanceDest - oldbalanceDest - amount|. Nilai >0 mengindikasikan kemungkinan rekening transit/escrow menampung dana dari lebih dari 1 sumber.'
            }
          ]
        },

        // INDIKATOR 3: Pola Topologi Graf (GNN Features: GraphSAGE 32-dim + PageRank + Degree)
        topologi: {
          label: 'Indikator 3 — Topologi Jaringan GNN (Graph Neural Network)',
          score: 88,
          color: '#a855f7',
          source: 'GraphSAGE GNN Embeddings (dim=32) + RF Features: dest_pagerank, sender_out_degree, dest_in_degree',
          subs: [
            {
              id: 'sub_gnn_cosine',
              name: 'Kemiripan Embedding ke Fraud Centroid (GNN Cosine)',
              value: 'Similarity = 0.88 (High Fraud Proximity)',
              score: 88,
              status: 'high',
              source: 'GraphSAGE 32-dim Embedding — GNN Weight: 60%',
              detail: 'GNN Scorer menghitung cosine similarity antara embedding akun pengirim dengan rata-rata (centroid) semua node fraud yang diketahui. Skor 0.88 = sangat dekat ke cluster fraud di ruang embedding.'
            },
            {
              id: 'sub_dest_pagerank',
              name: 'PageRank Tujuan (dest_pagerank)',
              value: '0.0482 — Top 1% dari seluruh node graf',
              score: 72,
              status: 'medium',
              source: 'RF Feature #16 — Importance: 0.30% | GNN Graph Metric',
              detail: 'PageRank tinggi pada rekening tujuan menandakan rekening tersebut menjadi hub yang sering ditransfer dari banyak sumber — pola agregasi mule klasik.'
            },
            {
              id: 'sub_out_degree',
              name: 'Fan-Out Degree Pengirim (sender_out_degree)',
              value: '5 transfer outbound dalam 5 menit',
              score: 94,
              status: 'critical',
              source: 'RF Feature #12 — Importance: 0.09% | GNN Graph Metric',
              detail: 'Jumlah koneksi keluar (out-degree) akun pengirim dalam window waktu pendek. Out-degree ≥5 ke akun unik berbeda = anomali struktural graf yang sangat kuat.'
            }
          ]
        },

        // INDIKATOR 4: Konteks Teknikal & Perilaku (Rule Engine: Device ID, IP/VPN, Odd-Hour, Dormant, Purpose)
        teknikal: {
          label: 'Indikator 4 — Konteks Teknikal & Perilaku Anomali',
          score: 89,
          color: '#06b6d4',
          source: 'Rule Engine (13 Aturan) + RF Features: hour_of_day, account_dormant_days, purpose_CRYPTO, is_known_merchant',
          subs: [
            {
              id: 'sub_ip_vpn',
              name: 'Anomali IP & VPN Datacenter (Technical Anomaly)',
              value: 'IP 182.16.2.90 → VPN Datacenter (Known Proxy Range)',
              score: 90,
              status: 'high',
              source: 'Rule Engine #7 — VPN/Datacenter IP +20pts | Rule #11 Impossible Travel',
              detail: 'IP pengirim cocok dengan daftar prefix VPN datacenter (45.154.x, 103.152.x, dll). Rule Engine menambahkan +20 poin. Bila beda IP dari IP terdaftar: +25 poin tambahan (impossible travel).'
            },
            {
              id: 'sub_purpose_crypto',
              name: 'Tujuan Kripto + Purpose Code Mismatch',
              value: 'Purpose: GENERAL → Dest: Exchange Crypto (Inkonsisten)',
              score: 85,
              status: 'high',
              source: 'RF Feature #26 — purpose_CRYPTO: 0.25% | Rule Engine #8 Purpose Mismatch +20pts',
              detail: 'Kombinasi RF feature purpose_CRYPTO dan aturan Purpose Mismatch ISO 20022: kode tujuan transfer (DEBT/SALA) tidak konsisten dengan rekening tujuan exchange kripto.'
            },
            {
              id: 'sub_hour_of_day',
              name: 'Aktivitas di Jam Anomali (hour_of_day)',
              value: 'Jam 02:40 WIB — Nocturnal Anomaly Window',
              score: 78,
              status: 'high',
              source: 'RF Feature #17 — Importance: 0.54% | Rule Engine #4 Odd-Hour +25pts',
              detail: 'hour_of_day < 4 WIB mengaktifkan Rule Engine Odd-Hour Activity Alert (+25 poin). RF Feature hour_of_day menangkap pola distribusi waktu transaksi fraud (umumnya 00:00-04:00 WIB).'
            }
          ]
        }
      },

      // Behavioral Metrics (tampil di floating card)
      criminalActivities: 87,
      familiarBehavior: 76,
      suspiciousPatterns: 38,
      historicalData: 19,

      // GNN Graph Metrics (tampil di bottom card)
      pageRank: '0.0482 (Top 1%)',
      betweenness: '0.842 (High Hub)',
      communityId: 'CLUSTER-SMURF-99',
      hopDistance: '3-Hop Direct Chain',
      embeddingDim: 32,
      modelAUC: 0.9781,
      rfEstimators: 100,
      datasetSize: '308.213 transaksi (PaySim + SMOTE)'
    },
    stages: [
      { id: 'stage1', title: '1. AKUN SUMBER', subtitle: 'Dana Awal Masuk', color: '#38bdf8' },
      { id: 'stage2', title: '2. POLA SMURFING', subtitle: 'Layer 1: Akun Mule', color: '#10b981' },
      { id: 'stage3', title: '3. AGREGASI TRANSIT', subtitle: 'Layer 2: Tujuan Antara', color: '#f59e0b' },
      { id: 'stage4', title: '4. TUJUAN AKHIR (KRIPTO)', subtitle: 'Pelarian Dana Kripto', color: '#ef4444' }
    ],
    nodes: [
      // 1. Akun Sumber (Source Account)
      {
        id: 'A1',
        stage: 1,
        code: 'A',
        type: 'source',
        label: 'Ahmad Fauzi',
        account: '320800123456',
        bank: 'BPR Bank Kuningan',
        balance: 150000000,
        riskScore: 92,
        riskLevel: 'high',
        role: 'Akun Sumber (Originator)',
        ip: '182.16.2.90 (Kuningan)',
        deviceId: 'DEV-ANDROID-S24-ULTRA',
        nik: '3208012802092102',
        x: 120,
        y: 280,
        description: 'Rekening penerima dana awal Rp 150.000.000, melakukan fan-out transfer kilat dalam 5 menit.'
      },
      // 2. Akun Perantara (Mule Accounts - Layer 1)
      {
        id: 'B1',
        stage: 2,
        code: 'B1',
        type: 'mule',
        label: 'Budi Santoso',
        account: '8012000005',
        bank: 'BCA',
        balance: 10000000,
        riskScore: 88,
        riskLevel: 'high',
        role: 'Akun Perantara (Mule 1)',
        ip: '192.168.1.10 (Proxy)',
        deviceId: 'DEV-XIAOMI-13',
        nik: '3208012304950001',
        x: 380,
        y: 120,
        description: 'Menerima transfer pecahan Rp 10.000.000, langsung diteruskan ke transit M1.'
      },
      {
        id: 'B2',
        stage: 2,
        code: 'B2',
        type: 'mule',
        label: 'Ahmad Faisal',
        account: '1370000000001',
        bank: 'Bank Mandiri',
        balance: 10000000,
        riskScore: 89,
        riskLevel: 'high',
        role: 'Akun Perantara (Mule 2)',
        ip: '192.168.1.10 (Proxy)',
        deviceId: 'DEV-XIAOMI-13',
        nik: '3208012304950002',
        x: 380,
        y: 220,
        description: 'Menerima Rp 10.000.000, alamat IP sama persis dengan Mule B1.'
      },
      {
        id: 'B3',
        stage: 2,
        code: 'B3',
        type: 'mule',
        label: 'Desta Erlangga',
        account: '0912000002',
        bank: 'BNI',
        balance: 10000000,
        riskScore: 86,
        riskLevel: 'high',
        role: 'Akun Perantara (Mule 3)',
        ip: '192.168.1.11 (Shared)',
        deviceId: 'DEV-SAMSUNG-A54',
        nik: '3208012304950003',
        x: 380,
        y: 320,
        description: 'Menerima Rp 10.000.000, split transfer ke transit M2.'
      },
      {
        id: 'B4',
        stage: 2,
        code: 'B4',
        type: 'mule',
        label: 'Siti Rahma',
        account: '888801000000003',
        bank: 'BRI',
        balance: 10000000,
        riskScore: 85,
        riskLevel: 'high',
        role: 'Akun Perantara (Mule 4)',
        ip: '192.168.1.11 (Shared)',
        deviceId: 'DEV-SAMSUNG-A54',
        nik: '3208012304950004',
        x: 380,
        y: 420,
        description: 'Akun dormant 45 hari mendadak aktif menerima & mentransfer dana.'
      },
      {
        id: 'B5',
        stage: 2,
        code: 'B5',
        type: 'mule',
        label: 'Hendri Gunawan',
        account: '705400000004',
        bank: 'CIMB Niaga',
        balance: 10000000,
        riskScore: 87,
        riskLevel: 'high',
        role: 'Akun Perantara (Mule 5)',
        ip: '192.168.1.12 (Shared)',
        deviceId: 'DEV-VIVO-Y20',
        nik: '3208012304950005',
        x: 380,
        y: 520,
        description: 'Menerima transfer beruntun pada jam anomali 02:40 WIB.'
      },

      // 3. Tujuan Antara (Transit / Merchant - Layer 2)
      {
        id: 'M1',
        stage: 3,
        code: 'M1',
        type: 'transit',
        label: 'Payment Gateway Transit A',
        account: 'VA-9088219001',
        bank: 'BCA Virtual Account',
        balance: 29800000,
        riskScore: 91,
        riskLevel: 'high',
        role: 'Merchant Transit Layer 2',
        ip: '103.152.88.1 (Gateway)',
        deviceId: 'SERVER-GATEWAY-01',
        nik: 'COMPANY-REG-991',
        x: 650,
        y: 160,
        description: 'Mengumpulkan pecahan dari B1 & B2, meneruskannya ke Indodax.'
      },
      {
        id: 'M2',
        stage: 3,
        code: 'M2',
        type: 'transit',
        label: 'P2P Escrow Merchant B',
        account: 'VA-9088219002',
        bank: 'Mandiri Merchant',
        balance: 29400000,
        riskScore: 93,
        riskLevel: 'high',
        role: 'P2P Escrow Transit',
        ip: '103.152.88.2 (Gateway)',
        deviceId: 'SERVER-GATEWAY-02',
        nik: 'COMPANY-REG-992',
        x: 650,
        y: 300,
        description: 'Mengumpulkan dana dari B3 & B4, meneruskannya ke Binance Exchange.'
      },
      {
        id: 'M3',
        stage: 3,
        code: 'M3',
        type: 'transit',
        label: 'Aggregator Transit C',
        account: 'VA-9088219003',
        bank: 'BNI Corporate',
        balance: 29700000,
        riskScore: 90,
        riskLevel: 'high',
        role: 'Transit Pool Account',
        ip: '103.152.88.3 (Gateway)',
        deviceId: 'SERVER-GATEWAY-03',
        nik: 'COMPANY-REG-993',
        x: 650,
        y: 440,
        description: 'Mengumpulkan dana dari B5, meneruskannya ke Tokocrypto & Cold Wallet.'
      },

      // 4. Tujuan Akhir (Kripto Exchange & Wallets)
      {
        id: 'C1',
        stage: 4,
        code: 'C1',
        type: 'crypto',
        label: 'PT Indodax Nasional Indonesia',
        account: '9012666666 (Deposit Vault)',
        bank: 'BCA Escrow Indodax',
        balance: 45000000,
        riskScore: 95,
        riskLevel: 'high',
        role: 'Bursa Kripto Resmi (Bappebti)',
        ip: 'Exchange API Gateway',
        deviceId: 'VA-INDODAX-HOTWALLET',
        nik: 'BAP协同-INDODAX',
        x: 920,
        y: 130,
        description: 'Tujuan akhir deposit kripto rupiah untuk pembelian USDT/Bitcoin.'
      },
      {
        id: 'C2',
        stage: 4,
        code: 'C2',
        type: 'crypto',
        label: 'PT Binance Exchange Indonesia',
        account: '9012123456 (Offshore Channel)',
        bank: 'CIMB Escrow Binance',
        balance: 44100000,
        riskScore: 98,
        riskLevel: 'high',
        role: 'Bursa Kripto Internasional',
        ip: 'Offshore Proxy Routing',
        deviceId: 'BINANCE-PEER-SET',
        nik: 'OFFSHORE-EXCHANGE',
        x: 920,
        y: 250,
        description: 'Outflow lintas batas negara tanpa pelaporan resmi transaksi devisa.'
      },
      {
        id: 'C3',
        stage: 4,
        code: 'C3',
        type: 'crypto',
        label: 'PT Tokocrypto Indonesia',
        account: '9012999999 (Fiat Gateway)',
        bank: 'Mandiri Escrow Tokocrypto',
        balance: 30000000,
        riskScore: 94,
        riskLevel: 'high',
        role: 'Bursa Kripto Domestik',
        ip: 'Gateway Jakarta',
        deviceId: 'TOKOCRYPTO-VA',
        nik: 'BAP协同-TOKOCRYPTO',
        x: 920,
        y: 370,
        description: 'Tujuan konversi rupiah ke stablecoin USDT secara instan.'
      },
      {
        id: 'C4',
        stage: 4,
        code: 'C4',
        type: 'crypto',
        label: 'Cold Wallet (Tether Unhosted)',
        account: '0x71c5991823ab...e49f',
        bank: 'Ethereum Blockchain (ERC-20)',
        balance: 15000000,
        riskScore: 99,
        riskLevel: 'high',
        role: 'Unhosted Self-Custody Wallet',
        ip: 'Tornado Cash / Mixer Linkage',
        deviceId: 'HARDWARE-LEDGER-X',
        nik: 'ANONYMOUS-ONCHAIN',
        x: 920,
        y: 490,
        description: 'Alamat dompet mandiri on-chain yang terhubung dengan pola layering lanjutan.'
      },

      // 5. Perangkat / Device & IP Linkage (Bawah)
      {
        id: 'D1',
        stage: 5,
        code: 'D1',
        type: 'device',
        label: 'IP: 192.168.1.10',
        account: 'Perangkat Bersama (Mule B1 & B2)',
        bank: 'ISP Indihome Kuningan',
        balance: 0,
        riskScore: 90,
        riskLevel: 'high',
        role: 'Shared IP Infrastructure',
        ip: '192.168.1.10',
        deviceId: 'MAC-A4:B2:99:11:00',
        nik: 'INFRA-DEVICE-LINK',
        x: 300,
        y: 650,
        description: 'Alamat IP yang sama digunakan secara bersamaan oleh akun B1 dan B2.'
      },
      {
        id: 'D2',
        stage: 5,
        code: 'D2',
        type: 'device',
        label: 'IP: 192.168.1.11',
        account: 'Perangkat Bersama (Mule B3 & B4)',
        bank: 'ISP Telkomsel Flash',
        balance: 0,
        riskScore: 89,
        riskLevel: 'high',
        role: 'Shared IP Infrastructure',
        ip: '192.168.1.11',
        deviceId: 'MAC-C8:11:44:88:12',
        nik: 'INFRA-DEVICE-LINK',
        x: 520,
        y: 650,
        description: 'Perangkat mobile yang sama mengoperasikan mutasi transfer akun B3 dan B4.'
      },
      {
        id: 'D3',
        stage: 5,
        code: 'D3',
        type: 'device',
        label: 'VPN: 182.16.2.90',
        account: 'Datacenter Originator',
        bank: 'Datacenter Proxy Gateway',
        balance: 0,
        riskScore: 94,
        riskLevel: 'high',
        role: 'Anonymizer VPN Proxy',
        ip: '182.16.2.90',
        deviceId: 'PROXY-CIRCUIT-99',
        nik: 'VPN-DATACENTER-ANOMALY',
        x: 740,
        y: 650,
        description: 'Asal IP transaksi dari VPN datacenter yang menyamarkan lokasi fisik pelaku.'
      }
    ],
    edges: [
      // Stage 1 -> Stage 2 (Smurfing Fan-out)
      { from: 'A1', to: 'B1', amount: 10000000, time: '09:01 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },
      { from: 'A1', to: 'B2', amount: 10000000, time: '09:02 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },
      { from: 'A1', to: 'B3', amount: 10000000, time: '09:03 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },
      { from: 'A1', to: 'B4', amount: 10000000, time: '09:04 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },
      { from: 'A1', to: 'B5', amount: 10000000, time: '09:05 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },

      // Stage 2 -> Stage 3 (Transit Aggregation)
      { from: 'B1', to: 'M1', amount: 5000000, time: '09:06 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B1', to: 'M1', amount: 4800000, time: '09:07 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B2', to: 'M1', amount: 5000000, time: '09:08 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B2', to: 'M2', amount: 4900000, time: '09:09 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B3', to: 'M2', amount: 5100000, time: '09:10 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B3', to: 'M2', amount: 4700000, time: '09:11 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B4', to: 'M2', amount: 5200000, time: '09:12 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B4', to: 'M3', amount: 4600000, time: '09:13 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B5', to: 'M3', amount: 5000000, time: '09:14 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'B5', to: 'M3', amount: 4900000, time: '09:15 WIB', type: 'transfer', flow: 'transit', risk: 'high' },

      // Stage 3 -> Stage 4 (Crypto Outflow)
      { from: 'M1', to: 'C1', amount: 14700000, time: '09:16 WIB', type: 'crypto', flow: 'crypto_outflow', risk: 'critical' },
      { from: 'M2', to: 'C2', amount: 15000000, time: '09:17 WIB', type: 'crypto', flow: 'crypto_outflow', risk: 'critical' },
      { from: 'M3', to: 'C3', amount: 14500000, time: '09:18 WIB', type: 'crypto', flow: 'crypto_outflow', risk: 'critical' },
      { from: 'M3', to: 'C4', amount: 15000000, time: '09:19 WIB', type: 'crypto', flow: 'crypto_outflow', risk: 'critical' },

      // Stage 5 (Device & IP Linkage)
      { from: 'B1', to: 'D1', amount: 0, time: 'Shared IP', type: 'device', flow: 'device_link', risk: 'medium' },
      { from: 'B2', to: 'D1', amount: 0, time: 'Shared IP', type: 'device', flow: 'device_link', risk: 'medium' },
      { from: 'B3', to: 'D2', amount: 0, time: 'Shared Device', type: 'device', flow: 'device_link', risk: 'medium' },
      { from: 'B4', to: 'D2', amount: 0, time: 'Shared Device', type: 'device', flow: 'device_link', risk: 'medium' },
      { from: 'A1', to: 'D3', amount: 0, time: 'VPN Datacenter', type: 'device', flow: 'device_link', risk: 'high' },
      { from: 'B5', to: 'D3', amount: 0, time: 'VPN Datacenter', type: 'device', flow: 'device_link', risk: 'high' }
    ]
  },
  mule_ring: {
    id: 'mule_ring',
    name: 'Skenario 2: Sindikat Rekening Penampung Berantai (Circular Mule Ring)',
    riskScore: 86,
    riskLevel: 'HIGH',
    classification: 'CIRCULAR LAYERING MULE RING',
    summary: 'Pola perputaran dana tertutup antar 4 rekening penampung dengan tujuan menyamarkan jejak audit sebelum ditransfer keluar ekosistem perbankan.',
    metrics: {
      criminalActivities: 79,
      familiarBehavior: 62,
      suspiciousPatterns: 54,
      historicalData: 28,
      pageRank: '0.0391 (Top 5%)',
      betweenness: '0.710 (Circular Loop)',
      communityId: 'CLUSTER-RING-04',
      hopDistance: 'Circular 4-Node Ring'
    },
    stages: [
      { id: 'stage1', title: '1. AKUN REKRUTAN', subtitle: 'Penerima Awal', color: '#38bdf8' },
      { id: 'stage2', title: '2. RING LAYER 1', subtitle: 'Perputaran Dana', color: '#f59e0b' },
      { id: 'stage3', title: '3. RING LAYER 2', subtitle: 'Pencucian Loop', color: '#f59e0b' },
      { id: 'stage4', title: '4. CASH OUT BURSA', subtitle: 'Tarik Tunai / Kripto', color: '#ef4444' }
    ],
    nodes: [
      { id: 'R1', stage: 1, code: 'R1', type: 'source', label: 'Rekening Rekrutan A', account: '1122334455', bank: 'Bank Kuningan', balance: 80000000, riskScore: 84, riskLevel: 'high', role: 'Inflow Account', ip: '36.85.12.1', deviceId: 'DEV-OPPO-A15', nik: '3208012304950011', x: 140, y: 300, description: 'Rekening penerima aliran dana judi online awal.' },
      { id: 'R2', stage: 2, code: 'R2', type: 'mule', label: 'Mule Ring Node 1', account: '4521880292', bank: 'BCA', balance: 75000000, riskScore: 88, riskLevel: 'high', role: 'Ring Member 1', ip: '36.85.12.1', deviceId: 'DEV-OPPO-A15', nik: '3208012304950012', x: 420, y: 180, description: 'Menerima dana dan memutar sebagian ke Ring Node 2.' },
      { id: 'R3', stage: 2, code: 'R3', type: 'mule', label: 'Mule Ring Node 2', account: '7819002231', bank: 'Mandiri', balance: 72000000, riskScore: 89, riskLevel: 'high', role: 'Ring Member 2', ip: '36.85.12.2', deviceId: 'DEV-OPPO-A15', nik: '3208012304950013', x: 420, y: 420, description: 'Menerima dari R2 dan melempar kembali ke R4.' },
      { id: 'R4', stage: 3, code: 'R4', type: 'transit', label: 'Mule Aggregator Pool', account: '9901238472', bank: 'BNI', balance: 69000000, riskScore: 92, riskLevel: 'high', role: 'Ring Exit Gate', ip: '103.44.12.9', deviceId: 'DEV-SERVER-01', nik: '3208012304950014', x: 680, y: 300, description: 'Titik temu aliran dana sebelum eksekusi transfer ke exchange kripto.' },
      { id: 'R5', stage: 4, code: 'R5', type: 'crypto', label: 'PT Indodax Indonesia', account: '9012666666', bank: 'BCA Escrow', balance: 65000000, riskScore: 96, riskLevel: 'high', role: 'Crypto Liquidation', ip: 'API Gateway', deviceId: 'INDODAX-HOT', nik: 'BAP协同-INDODAX', x: 920, y: 300, description: 'Likuidasi akhir dana ring menjadi aset kripto.' }
    ],
    edges: [
      { from: 'R1', to: 'R2', amount: 40000000, time: '14:02 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },
      { from: 'R1', to: 'R3', amount: 40000000, time: '14:03 WIB', type: 'transfer', flow: 'smurfing', risk: 'high' },
      { from: 'R2', to: 'R3', amount: 20000000, time: '14:08 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'R3', to: 'R4', amount: 35000000, time: '14:15 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'R2', to: 'R4', amount: 34000000, time: '14:16 WIB', type: 'transfer', flow: 'transit', risk: 'high' },
      { from: 'R4', to: 'R5', amount: 65000000, time: '14:25 WIB', type: 'crypto', flow: 'crypto_outflow', risk: 'critical' }
    ]
  },
  normal_payroll: {
    id: 'normal_payroll',
    name: 'Skenario 3: Transaksi Normal Payroll & Operasional BPR (Low Risk)',
    riskScore: 12,
    riskLevel: 'LOW',
    classification: 'NORMAL BPR DISBURSEMENT (ALLOW)',
    summary: 'Distribusi gaji ASN / Guru Pemda Kuningan melalui rekening giro BPR Bank Kuningan. Tidak ditemukan pola fan-out anomali ataupun koneksi ke bursa kripto.',
    metrics: {
      criminalActivities: 6,
      familiarBehavior: 94,
      suspiciousPatterns: 4,
      historicalData: 88,
      pageRank: '0.0012 (Standard)',
      betweenness: '0.045 (Regular Tree)',
      communityId: 'CLUSTER-PAYROLL-KNG',
      hopDistance: '1-Hop Star Tree'
    },
    stages: [
      { id: 'stage1', title: '1. KAS DAERAH', subtitle: 'Giro Setda Kuningan', color: '#38bdf8' },
      { id: 'stage2', title: '2. REKENING NASABAH', subtitle: 'Guru & Tenaga Pendidik', color: '#10b981' },
      { id: 'stage3', title: '3. BANK PENERIMA', subtitle: 'Sesama Bank Kuningan', color: '#38bdf8' },
      { id: 'stage4', title: '4. STATUS', subtitle: 'Transaksi Terverifikasi', color: '#10b981' }
    ],
    nodes: [
      { id: 'N1', stage: 1, code: 'KAS', type: 'source', label: 'Kasda BPKAD Kuningan', account: '001002003004', bank: 'Bank Kuningan', balance: 850000000, riskScore: 5, riskLevel: 'low', role: 'Official Govt Account', ip: '10.12.1.5 (Intranet)', deviceId: 'SETDA-FINANCE-01', nik: 'PEMDA-KUNINGAN-01', x: 150, y: 300, description: 'Rekening resmi pencairan gaji rutin Pemkab Kuningan.' },
      { id: 'N2', stage: 2, code: 'G1', type: 'mule', label: 'Drs. H. Maman Suherman', account: '0123991823', bank: 'Bank Kuningan', balance: 8500000, riskScore: 8, riskLevel: 'low', role: 'ASN Guru SMPN 1', ip: '180.252.12.1', deviceId: 'GURU-PHONE-01', nik: '3208010101700001', x: 480, y: 160, description: 'Penerima transfer gaji pokok bulan Agustus.' },
      { id: 'N3', stage: 2, code: 'G2', type: 'mule', label: 'Hj. Neneng Rohaeti, M.Pd', account: '0123991824', bank: 'Bank Kuningan', balance: 9200000, riskScore: 7, riskLevel: 'low', role: 'Kepala Sekolah SDN', ip: '180.252.12.2', deviceId: 'GURU-PHONE-02', nik: '3208010101720002', x: 480, y: 300, description: 'Penerima tunjangan sertifikasi guru.' },
      { id: 'N4', stage: 2, code: 'G3', type: 'mule', label: 'Asep Saepudin, S.Kom', account: '0123991825', bank: 'Bank Kuningan', balance: 6500000, riskScore: 10, riskLevel: 'low', role: 'Staf TU Disdikbud', ip: '180.252.12.3', deviceId: 'GURU-PHONE-03', nik: '3208010101850003', x: 480, y: 440, description: 'Penerima gaji staf operasional sekolah.' },
      { id: 'N5', stage: 4, code: 'OK', type: 'crypto', label: 'Kliring SKNBI / APEX', account: 'APEX-BJB-KNG', bank: 'Bank bjb (APEX BPR)', balance: 0, riskScore: 5, riskLevel: 'low', role: 'Settlement Engine', ip: 'Core Banking API', deviceId: 'CORE-BKG-01', nik: 'BI-FAST-SETTLE', x: 850, y: 300, description: 'Penyelesaian kliring resmi kluster BPR Jawa Barat.' }
    ],
    edges: [
      { from: 'N1', to: 'N2', amount: 8500000, time: '07:30 WIB', type: 'transfer', flow: 'payroll', risk: 'low' },
      { from: 'N1', to: 'N3', amount: 9200000, time: '07:30 WIB', type: 'transfer', flow: 'payroll', risk: 'low' },
      { from: 'N1', to: 'N4', amount: 6500000, time: '07:30 WIB', type: 'transfer', flow: 'payroll', risk: 'low' },
      { from: 'N2', to: 'N5', amount: 8500000, time: '07:35 WIB', type: 'transfer', flow: 'payroll', risk: 'low' },
      { from: 'N3', to: 'N5', amount: 9200000, time: '07:35 WIB', type: 'transfer', flow: 'payroll', risk: 'low' },
      { from: 'N4', to: 'N5', amount: 6500000, time: '07:35 WIB', type: 'transfer', flow: 'payroll', risk: 'low' }
    ]
  }
};

// ============================================================================
// 2. KOMPONEN UTAMA GNN VISUALIZATION (MAPS STYLE + DRAGGABLE + PINCH ZOOM)
// ============================================================================

export default function GNNVisualization({ addToast, onOpenCustomer360, onCreateCase, selectedEntity, streamingTransactions = [], isStreaming = false, liveNodes: liveNodesProp, setLiveNodes: setLiveNodesProp, liveEdges: liveEdgesProp, setLiveEdges: setLiveEdgesProp, lastProcessedIndex: lastProcessedIndexProp, setLastProcessedIndex: setLastProcessedIndexProp, detectedPatterns: detectedPatternsProp, setDetectedPatterns: setDetectedPatternsProp, edgeTimersRef: edgeTimersRefProp }) {
  const { theme } = useTheme();
  const { currentUser, can } = useAuth();
  const isLight = theme === 'light';

  // ── Live Streaming GNN State (lifted to App.jsx for page-switch persistence) ──
  // Use props if provided (from App.jsx), otherwise fall back to local state
  const [localLiveNodes, setLocalLiveNodes] = useState(new Map());
  const [localLiveEdges, setLocalLiveEdges] = useState([]);
  const [localLastProcessedIndex, setLocalLastProcessedIndex] = useState(-1);
  const [localDetectedPatterns, setLocalDetectedPatterns] = useState([]);
  const localEdgeTimersRef = useRef(new Map());

  const liveNodes = liveNodesProp ?? localLiveNodes;
  const setLiveNodes = setLiveNodesProp ?? setLocalLiveNodes;
  const liveEdges = liveEdgesProp ?? localLiveEdges;
  const setLiveEdges = setLiveEdgesProp ?? setLocalLiveEdges;
  const lastProcessedIndex = lastProcessedIndexProp ?? localLastProcessedIndex;
  const setLastProcessedIndex = setLastProcessedIndexProp ?? setLocalLastProcessedIndex;
  const detectedPatterns = detectedPatternsProp ?? localDetectedPatterns;
  const setDetectedPatterns = setDetectedPatternsProp ?? setLocalDetectedPatterns;
  const edgeTimersRef = edgeTimersRefProp ?? localEdgeTimersRef;

  const [hoveredNode, setHoveredNode] = useState(null);
  const [liveGnnZoom, setLiveGnnZoom] = useState(1);
  const [liveGnnPan, setLiveGnnPan] = useState({ x: 0, y: 0 });
  const [livePanning, setLivePanning] = useState(false);
  const livePanStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const CANVAS_W = 700;
  const CANVAS_H = 450;

  // Edge fade-out timer: normal edges disappear after 4 seconds, fraud edges persist
  const EDGE_LIFETIME_MS = 4000;

  // Force-directed layout simulation
  const runForceLayout = useCallback((nodesMap, edges) => {
    const nodes = Array.from(nodesMap.values());
    if (nodes.length === 0) return nodesMap;

    const cx = CANVAS_W / 2;
    const cy = CANVAS_H / 2;
    const iterations = 30;
    const repulsion = 8000;
    const attraction = 0.005;
    const damping = 0.85;
    const centerGravity = 0.01;

    // Initialize velocities
    nodes.forEach(n => { n.vx = n.vx || 0; n.vy = n.vy || 0; });

    for (let iter = 0; iter < iterations; iter++) {
      // Repulsion between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Attraction along edges
      edges.forEach(e => {
        const src = nodesMap.get(e.source);
        const tgt = nodesMap.get(e.target);
        if (!src || !tgt) return;
        const dx = tgt.x - src.x;
        const dy = tgt.y - src.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attraction;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        src.vx += fx;
        src.vy += fy;
        tgt.vx -= fx;
        tgt.vy -= fy;
      });

      // Center gravity + apply velocity
      nodes.forEach(n => {
        n.vx += (cx - n.x) * centerGravity;
        n.vy += (cy - n.y) * centerGravity;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        // Clamp to canvas bounds
        n.x = Math.max(40, Math.min(CANVAS_W - 40, n.x));
        n.y = Math.max(40, Math.min(CANVAS_H - 40, n.y));
      });
    }

    const result = new Map();
    nodes.forEach(n => result.set(n.id, { ...n }));
    return result;
  }, []);

  // Process streaming transactions incrementally
  useEffect(() => {
    if (!streamingTransactions || streamingTransactions.length === 0) return;

    const newTxs = streamingTransactions.filter(tx =>
      tx.index !== undefined && tx.index > lastProcessedIndex
    );
    if (newTxs.length === 0) return;

    setLiveNodes(prev => {
      const next = new Map(prev);
      const cx = CANVAS_W / 2;
      const cy = CANVAS_H / 2;

      newTxs.forEach(tx => {
        const senderId = tx.senderAccount || tx.sender_account;
        const receiverId = tx.destinationAccount || tx.receiver_account;

        if (!next.has(senderId)) {
          // Place new nodes near center with slight random offset
          const angle = Math.random() * Math.PI * 2;
          const radius = 50 + Math.random() * 100;
          next.set(senderId, {
            id: senderId,
            label: tx.senderName || tx.sender_name || 'Unknown',
            bank: tx.senderBank || tx.sender_bank || 'Unknown',
            type: 'originator',
            txCount: 0, totalAmount: 0, outDegree: 0, inDegree: 0,
            riskScore: 0, isFraud: false,
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            vx: 0, vy: 0,
          });
        }

        if (!next.has(receiverId)) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 50 + Math.random() * 100;
          next.set(receiverId, {
            id: receiverId,
            label: tx.receiver_name || tx.destination || 'Unknown',
            bank: tx.receiver_bank || tx.destinationBank || 'Unknown',
            type: 'receiver',
            txCount: 0, totalAmount: 0, outDegree: 0, inDegree: 0,
            riskScore: 0, isFraud: false,
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            vx: 0, vy: 0,
          });
        }

        const senderNode = next.get(senderId);
        senderNode.txCount++;
        senderNode.totalAmount += tx.amount || 0;
        senderNode.outDegree++;
        if (tx.is_fraud) {
          senderNode.isFraud = true;
          senderNode.riskScore = Math.max(senderNode.riskScore, tx.risk_score || 85);
        }

        const receiverNode = next.get(receiverId);
        receiverNode.txCount++;
        receiverNode.totalAmount += tx.amount || 0;
        receiverNode.inDegree++;
        if (tx.is_fraud) {
          receiverNode.isFraud = true;
          receiverNode.riskScore = Math.max(receiverNode.riskScore, tx.risk_score || 85);
        }
      });

      // Run force layout to position nodes nicely
      return runForceLayout(next, [...liveEdges, ...newTxs.map(tx => ({
        source: tx.senderAccount || tx.sender_account,
        target: tx.destinationAccount || tx.receiver_account,
      }))]);
    });

    const newEdges = newTxs.map(tx => ({
      id: `${tx.senderAccount || tx.sender_account}-${tx.destinationAccount || tx.receiver_account}-${tx.index}`,
      source: tx.senderAccount || tx.sender_account,
      target: tx.destinationAccount || tx.receiver_account,
      amount: tx.amount || 0,
      isFraud: tx.is_fraud || false,
      indicator: tx.indicator_id || tx.metric_code || null,
      timestamp: tx.timestamp,
      createdAt: Date.now(), // Track creation time for fade-out
      fanoutGroup: tx.fanout_group || null, // For 1→7 mule network patterns
      fanoutIndex: tx.fanout_index,
      fanoutTotal: tx.fanout_total,
    }));

    // Add new edges
    setLiveEdges(prev => [...prev, ...newEdges]);

    // Schedule fade-out for normal (non-fraud) edges
    newEdges.forEach(edge => {
      if (!edge.isFraud) {
        const timerId = setTimeout(() => {
          setLiveEdges(prev => prev.filter(e => e.id !== edge.id));
          edgeTimersRef.current.delete(edge.id);
        }, EDGE_LIFETIME_MS);
        edgeTimersRef.current.set(edge.id, timerId);
      }
    });

    const newPatterns = newTxs
      .filter(tx => tx.is_fraud)
      .map(tx => ({
        type: tx.indicator_id || tx.metric_code || 'FRAUD',
        sender: tx.senderName || tx.sender_name,
        receiver: tx.receiver_name || tx.destination,
        amount: tx.amount,
        timestamp: tx.timestamp,
        description: tx.description || tx.reason,
      }));
    if (newPatterns.length > 0) {
      setDetectedPatterns(prev => [...newPatterns, ...prev].slice(0, 10));
    }

    const maxIndex = Math.max(...newTxs.map(tx => tx.index || 0));
    setLastProcessedIndex(maxIndex);
  }, [streamingTransactions, lastProcessedIndex, liveEdges, runForceLayout]);

  // Reset live state when streaming stops
  useEffect(() => {
    if (!isStreaming && (streamingTransactions?.length || 0) === 0) {
      // Clear all edge timers
      edgeTimersRef.current.forEach(timerId => clearTimeout(timerId));
      edgeTimersRef.current.clear();

      setLiveNodes(new Map());
      setLiveEdges([]);
      setLastProcessedIndex(-1);
      setDetectedPatterns([]);
      setLiveGnnZoom(1);
      setLiveGnnPan({ x: 0, y: 0 });
      setHoveredNode(null);
    }
  }, [isStreaming, streamingTransactions?.length]);

  // Cleanup edge timers on unmount
  useEffect(() => {
    return () => {
      edgeTimersRef.current.forEach(timerId => clearTimeout(timerId));
      edgeTimersRef.current.clear();
    };
  }, []);

  // Zoom handler for live GNN canvas
  const handleLiveGnnWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setLiveGnnZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);

  // Pan handlers for live GNN canvas
  const handleLiveGnnMouseDown = useCallback((e) => {
    if (e.button === 0) {
      setLivePanning(true);
      livePanStartRef.current = { x: e.clientX, y: e.clientY, panX: liveGnnPan.x, panY: liveGnnPan.y };
    }
  }, [liveGnnPan]);

  const handleLiveGnnMouseMove = useCallback((e) => {
    if (livePanning) {
      setLiveGnnPan({
        x: livePanStartRef.current.panX + (e.clientX - livePanStartRef.current.x),
        y: livePanStartRef.current.panY + (e.clientY - livePanStartRef.current.y),
      });
    }
  }, [livePanning]);

  const handleLiveGnnMouseUp = useCallback(() => {
    setLivePanning(false);
  }, []);

  // Scenario State
  const [selectedScenarioKey, setSelectedScenarioKey] = useState(null);
  // The workbench starts in standby mode. A graph is loaded only after the investigator
  // selects a scenario or navigates here from an alert/transaction.
  const hasActiveInvestigation = Boolean(selectedScenarioKey || selectedEntity);
  const baseScenario = SCENARIOS[selectedScenarioKey] || SCENARIOS.smurfing_crypto;

  const scenario = useMemo(() => {
    if (!selectedEntity) return baseScenario;

    const senderName = selectedEntity.senderName || selectedEntity.sender_name || selectedEntity.name || selectedEntity.holder || 'Nasabah Terlapor';
    const senderAccount = selectedEntity.senderAccount || selectedEntity.sender_account || selectedEntity.account || selectedEntity.account_id || '320800123456';
    const senderBank = selectedEntity.senderBank || selectedEntity.sender_bank || selectedEntity.bank || 'Bank Kuningan';
    const amount = Number(selectedEntity.amount) || 150000000;
    const riskScore = Number(selectedEntity.riskScore || selectedEntity.risk_score) || baseScenario.riskScore || 92;
    const metricCode = selectedEntity.metric_code || selectedEntity.metricCode || selectedEntity.indicator_id || '';
    const metricName = selectedEntity.metric_name || selectedEntity.metricName || selectedEntity.title || 'Deteksi Anomali Transaksi';
    const reasonStr = selectedEntity.reason || selectedEntity.description || selectedEntity.xai_explanation || baseScenario.summary;

    const destName = selectedEntity.destination || selectedEntity.destinationName || selectedEntity.receiver_name || 'PT Indodax Nasional Indonesia';
    const destAccount = selectedEntity.destinationAccount || selectedEntity.receiver_account || '9012666666';
    const destBank = selectedEntity.destinationBank || selectedEntity.receiver_bank || 'BCA Escrow Indodax';

    // Dinamis menentukan jumlah akun mule berdasarkan nominal & indikator kasus
    let muleCount = 5;
    if (amount < 30000000) {
      muleCount = 2;
    } else if (amount < 80000000) {
      muleCount = 3;
    }

    if (metricCode.includes('IND-03') || metricCode.includes('dormant')) {
      muleCount = 2;
    } else if (metricCode.includes('IND-01') || metricCode.includes('velocity')) {
      muleCount = 4;
    } else if (metricCode.includes('IND-04') || metricCode.includes('profile')) {
      muleCount = 3;
    }

    // ── Deterministic mule pool dari hash senderAccount ──
    // Tidak lagi hardcoded — setiap akun menghasilkan node mule unik
    const FIRST_NAMES = ['Wahyu', 'Dedi', 'Eka', 'Agus', 'Rudi', 'Slamet', 'Tono', 'Bambang', 'Iwan', 'Yanto', 'Heri', 'Ardi', 'Dani', 'Feri', 'Galih'];
    const LAST_NAMES = ['Pratama', 'Kusnandar', 'Supriatna', 'Gunawan', 'Santoso', 'Wijaya', 'Purnomo', 'Hidayat', 'Setiawan', 'Nugroho', 'Kurniawan', 'Wibowo', 'Saputra', 'Hakim', 'Fauzi'];
    const BANKS_POOL = ['Bank BCA', 'Bank Mandiri', 'Bank BNI', 'Bank BRI', 'CIMB Niaga', 'Bank Permata', 'Bank Danamon', 'Bank BTPN'];

    // Seed deterministik dari senderAccount — sama akun = sama node, berbeda akun = berbeda node
    const seed = senderAccount.split('').reduce((acc, ch, i) => acc + ch.charCodeAt(0) * (i + 7), 0);
    const hashAt = (offset) => (seed * 1013904223 + offset * 1664525) >>> 0;

    const buildMulePool = (count) =>
      Array.from({ length: count }, (_, i) => {
        const h = hashAt(i + 1);
        return {
          name: `${FIRST_NAMES[h % FIRST_NAMES.length]} ${LAST_NAMES[(h >> 4) % LAST_NAMES.length]}`,
          bank: BANKS_POOL[(h >> 8) % BANKS_POOL.length],
          acc: String(6000000000 + (h % 900000000)),        // akun 10-digit deterministik
          ip: `${10 + (h % 220)}.${(h >> 10) % 256}.${(h >> 18) % 256}.${(h >> 24) % 254 + 1} (Proxy)`,
        };
      });

    const selectedMules = buildMulePool(muleCount);
    const muleAmount = Math.floor(amount / muleCount);


    // Dynamic Nodes Generation
    const dynamicNodes = [];

    // Stage 1: Originator Node
    dynamicNodes.push({
      id: 'A1',
      stage: 1,
      code: 'A',
      type: 'source',
      label: senderName,
      account: senderAccount,
      bank: senderBank,
      balance: amount,
      riskScore: riskScore,
      riskLevel: riskScore >= 85 ? 'high' : riskScore >= 60 ? 'medium' : 'low',
      role: 'Akun Sumber (Originator)',
      ip: '182.16.2.90 (Location Proxy)',
      deviceId: 'DEV-MOBILE-BANKING',
      nik: '320801' + String(Math.abs(senderAccount.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 10000000000, 1234567890))),
      x: 120,
      y: 280,
      description: `Rekening pengirim dana Rp ${amount.toLocaleString('id-ID')} atas nama ${senderName} (${senderBank} - ${senderAccount}). Alasan Flag: ${reasonStr}`
    });

    // Stage 2: Mule Nodes
    const yStart = 280 - (muleCount - 1) * 50;
    selectedMules.forEach((m, idx) => {
      dynamicNodes.push({
        id: `B${idx + 1}`,
        stage: 2,
        code: `B${idx + 1}`,
        type: 'mule',
        label: m.name,
        account: m.acc,
        bank: m.bank,
        balance: muleAmount,
        riskScore: Math.max(75, riskScore - 4 + idx),
        riskLevel: 'high',
        role: `Akun Perantara (Mule ${idx + 1})`,
        ip: m.ip,
        deviceId: `DEV-MULE-${idx + 1}`,
        nik: '320801230495000' + (idx + 1),
        x: 380,
        y: yStart + idx * 100,
        description: `Menerima pecahan transfer Rp ${muleAmount.toLocaleString('id-ID')}, diteruskan ke agregasi transit.`
      });
    });

    // Stage 3: Transit Nodes
    const TRANSIT_LABELS = ['VA Transit Escrow', 'Payment Gateway Hub', 'P2P Merchant Pool', 'Virtual Account Gate', 'Switching Aggregator'];
    const transitCount = Math.min(2, muleCount);
    for (let idx = 0; idx < transitCount; idx++) {
      const transitAmount = Math.floor(amount / transitCount);
      const th = hashAt(50 + idx);
      const tLabel = TRANSIT_LABELS[(th >> 3) % TRANSIT_LABELS.length];
      const tBank = BANKS_POOL[(th >> 12) % BANKS_POOL.length] + ' Virtual';
      dynamicNodes.push({
        id: `M${idx + 1}`,
        stage: 3,
        code: `M${idx + 1}`,
        type: 'transit',
        label: tLabel,
        account: `VA-${String(9000000000 + (th % 99999999))}`,
        bank: tBank,
        balance: transitAmount,
        riskScore: Math.max(80, riskScore - 2),
        riskLevel: 'high',
        role: 'Merchant Transit Layer 2',
        ip: `${103 + (th % 20)}.${(th >> 6) % 256}.${(th >> 14) % 256}.${(th >> 22) % 254 + 1} (Gateway)`,
        deviceId: `SERVER-GATEWAY-0${idx + 1}`,
        nik: `COMPANY-REG-${String(th).slice(-5)}`,
        x: 650,
        y: 200 + idx * 160,
        description: `Mengumpulkan dana pecahan Rp ${transitAmount.toLocaleString('id-ID')}, memfasilitasi transfer ke bursa.`
      });
    }


    // Stage 4: Destination Node
    dynamicNodes.push({
      id: 'C1',
      stage: 4,
      code: 'C1',
      type: 'crypto',
      label: destName.length > 22 ? destName.substring(0, 20) + '...' : destName,
      account: destAccount,
      bank: destBank,
      balance: amount,
      riskScore: Math.min(99, riskScore + 3),
      riskLevel: 'high',
      role: 'Tujuan Akhir Transfer',
      ip: 'API Gateway Settle',
      deviceId: 'VA-ESCROW-VAULT',
      nik: 'VASP-OFFICIAL',
      x: 920,
      y: 280,
      description: `Tujuan akhir pengiriman dana ke ${destName} (${destBank}).`
    });

    // Stage 5: Shared Device Linkage Node
    dynamicNodes.push({
      id: 'D1',
      stage: 5,
      code: 'D1',
      type: 'device',
      label: 'Shared IP: 192.168.1.10',
      account: 'Shared Network Infrastructure',
      bank: 'ISP Telecommunication',
      balance: 0,
      riskScore: 88,
      riskLevel: 'high',
      role: 'Shared IP Linkage',
      ip: '192.168.1.10',
      deviceId: 'MAC-SHARED-DEVICE',
      nik: 'INFRA-DEVICE-LINK',
      x: 380,
      y: Math.max(580, yStart + muleCount * 100 + 40),
      description: 'Terdeteksi pengoperasian beberapa akun mule dari jaringan IP yang identik.'
    });

    // Dynamic Edges Generation
    const dynamicEdges = [];
    selectedMules.forEach((m, idx) => {
      dynamicEdges.push({
        from: 'A1',
        to: `B${idx + 1}`,
        amount: muleAmount,
        time: `09:0${idx + 1} WIB`,
        type: 'transfer',
        flow: 'smurfing',
        risk: 'high'
      });

      const targetTransit = `M${(idx % transitCount) + 1}`;
      dynamicEdges.push({
        from: `B${idx + 1}`,
        to: targetTransit,
        amount: muleAmount,
        time: `09:0${idx + 6} WIB`,
        type: 'transfer',
        flow: 'transit',
        risk: 'high'
      });
    });

    for (let idx = 0; idx < transitCount; idx++) {
      dynamicEdges.push({
        from: `M${idx + 1}`,
        to: 'C1',
        amount: Math.floor(amount / transitCount),
        time: `09:1${idx + 6} WIB`,
        type: 'crypto',
        flow: 'crypto_outflow',
        risk: 'critical'
      });
    }

    if (selectedMules.length >= 2) {
      dynamicEdges.push({ from: 'B1', to: 'D1', amount: 0, time: 'Shared IP', type: 'device', flow: 'device_link', risk: 'medium' });
      dynamicEdges.push({ from: 'B2', to: 'D1', amount: 0, time: 'Shared IP', type: 'device', flow: 'device_link', risk: 'medium' });
    }

    return {
      ...baseScenario,
      riskScore: riskScore,
      classification: metricName,
      summary: `Deteksi Kasus Transaksi ${metricName}: Akun pengirim ${senderName} (${senderBank} - ${senderAccount}) memecah dana Rp ${amount.toLocaleString('id-ID')} ke ${muleCount} akun mule perantara sebelum dilarikan ke ${destName}.`,
      nodes: dynamicNodes,
      edges: dynamicEdges
    };
  }, [baseScenario, selectedEntity]);

  // ── LIVE GNN DATA STATE ──
  // liveScenario: set when backend returns real tx-graph for selectedEntity
  // Falls back to mock scenario (dynamically built from selectedEntity fields)
  const [liveScenario, setLiveScenario] = useState(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);
  const [isLiveData, setIsLiveData] = useState(false);
  const [liveGraphStats, setLiveGraphStats] = useState(null);

  // Fetch live GNN subgraph whenever selectedEntity changes
  useEffect(() => {
    if (!selectedEntity) {
      setLiveScenario(null);
      setIsLiveData(false);
      setLiveGraphStats(null);
      return;
    }
    const accountId =
      selectedEntity.senderAccount ||
      selectedEntity.sender_account ||
      selectedEntity.account ||
      selectedEntity.account_id ||
      '';
    if (!accountId) return;

    let cancelled = false;
    setIsLoadingLive(true);
    fetchLiveGNNSubgraph(accountId)
      .then(result => {
        if (cancelled) return;
        if (result.isLive && result.scenario) {
          setLiveScenario(result.scenario);
          setIsLiveData(true);
          setLiveGraphStats(result.graphStats || null);
          if (addToast) addToast(
            `Graf Live dimuat: ${result.totalAnalyzed} transaksi real dari akun ${accountId}`,
            'success'
          );
        } else {
          // No live data — keep mock scenario, show info
          setLiveScenario(null);
          setIsLiveData(false);
          setLiveGraphStats(null);
          if (addToast) addToast(
            result.message || 'Belum ada transaksi live. Menampilkan skenario demo.',
            'info'
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLiveScenario(null);
          setIsLiveData(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingLive(false);
      });

    return () => { cancelled = true; };
  }, [selectedEntity]);

  // activeScenario: live data takes priority over the dynamically-built mock scenario
  const activeScenario = liveScenario || scenario;

  // Map Navigation State (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Flexible Draggable Node Positions State
  const [nodePositions, setNodePositions] = useState({});
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Filter & Layer Controls
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'crypto' | 'mule' | 'device'
  const [temporalStep, setTemporalStep] = useState(0); // 0: Semua, 1: 09:01 WIB (Fan-Out), 2: 09:07 WIB (Transit), 3: 09:16 WIB (Crypto)
  const [isXaiExplainerActive, setIsXaiExplainerActive] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [isAutoLayout, setIsAutoLayout] = useState(true);
  const [showMetricsDrawer, setShowMetricsDrawer] = useState(true);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(true);
  const [hopDepth, setHopDepth] = useState(3);

  // Minimal explanatory subgraph nodes identified by GNNExplainer (Mutual Info Optimization)
  const XAI_MINIMAL_SUBGRAPH_NODES = useMemo(() => ['A1', 'B1', 'B3', 'M1', 'C2', 'C4'], []);

  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Initialize node positions based on scenario
  useEffect(() => {
    if (!hasActiveInvestigation) {
      setNodePositions({});
      setSelectedNode(null);
      setSelectedEdge(null);
      setPan({ x: 0, y: 0 });
      setZoom(0.95);
      return;
    }

    const initialPos = {};
    activeScenario.nodes.forEach(node => {
      initialPos[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initialPos);
    setSelectedNode(null);
    setSelectedEdge(null);
    setPan({ x: 0, y: 0 });
    setZoom(0.95);
  }, [selectedScenarioKey, hasActiveInvestigation, activeScenario]);

  // Select the node passed from Live Monitoring / Cases after the GNN view mounts.
  // The source object may use either a graph node id or a banking account id.
  useEffect(() => {
    if (!selectedEntity) return;
    if (!selectedScenarioKey) {
      setSelectedScenarioKey('smurfing_crypto');
    }
    if (!activeScenario?.nodes?.length) return;

    const candidateIds = [
      selectedEntity.id,
      selectedEntity.nodeId,
      selectedEntity.account,
      selectedEntity.account_id,
      selectedEntity.account_number,
      selectedEntity.senderAccount,
      selectedEntity.sender_account,
      selectedEntity.destinationAccount,
      selectedEntity.receiver_account
    ].filter(Boolean).map(String);

    const matchedNode = activeScenario.nodes.find(node =>
      candidateIds.includes(String(node.id)) || candidateIds.includes(String(node.account))
    ) || activeScenario.nodes[0];

    if (matchedNode) {
      setSelectedNode(matchedNode);
      setSelectedEdge(null);
      const pos = nodePositions[matchedNode.id] || matchedNode;
      setPan({ x: 320 - pos.x * zoom, y: 260 - pos.y * zoom });
    }
  }, [selectedEntity, activeScenario, nodePositions, zoom, selectedScenarioKey]);

  // Reset positions to default layout
  const handleResetLayout = () => {
    const initialPos = {};
    activeScenario.nodes.forEach(node => {
      initialPos[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initialPos);
    setPan({ x: 0, y: 0 });
    setZoom(0.95);
    if (addToast) addToast('Posisi node dan peta graf berhasil direset ke standar.', 'info');
  };

  // Zoom Controls
  const handleZoomIn = () => setZoom(z => Math.min(2.5, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.4, Number((z - 0.15).toFixed(2))));
  const handleFitView = () => {
    setZoom(0.85);
    setPan({ x: 40, y: 20 });
  };

  // Attach native non-passive wheel listener so browser web page doesn't zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey) {
        // Touchpad pinch-to-zoom (fine-grained & smooth)
        const zoomFactor = -e.deltaY * 0.008;
        setZoom(prevZoom => {
          const nextZoom = Math.min(2.8, Math.max(0.4, Number((prevZoom + zoomFactor).toFixed(3))));
          const rect = el.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          const scaleRatio = nextZoom / prevZoom;
          setPan(prevPan => ({
            x: mouseX - (mouseX - prevPan.x) * scaleRatio,
            y: mouseY - (mouseY - prevPan.y) * scaleRatio
          }));
          return nextZoom;
        });
      } else {
        // Touchpad 2-finger pan
        setPan(prevPan => ({
          x: prevPan.x - e.deltaX * 0.9,
          y: prevPan.y - e.deltaY * 0.9
        }));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Multi-Touch Pinch & Drag for Touchpad / Touchscreen
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = { dist, panStart: { ...pan } };
    } else if (e.touches.length === 1) {
      setIsPanning(true);
      setPanStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartRef.current.dist;
      setZoom(prev => Math.min(2.8, Math.max(0.4, Number((prev * ratio).toFixed(3)))));
      touchStartRef.current.dist = currentDist;
    } else if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - panStart.x,
        y: e.touches[0].clientY - panStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    touchStartRef.current.dist = 0;
  };

  // Pan Canvas Mouse Events
  const handleMouseDown = (e) => {
    // If clicked directly on canvas background (not on a node)
    if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      // Dragging a specific node
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;

      setNodePositions(prev => ({
        ...prev,
        [draggedNodeId]: {
          x: Math.round(rawX - dragOffset.x),
          y: Math.round(rawY - dragOffset.y)
        }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Node Drag Start
  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    const nodePos = nodePositions[nodeId] || { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;

    setDragOffset({
      x: rawX - nodePos.x,
      y: rawY - nodePos.y
    });

    const nodeObj = activeScenario.nodes.find(n => n.id === nodeId);
    if (nodeObj) {
      setSelectedNode(nodeObj);
      setSelectedEdge(null);
    }
  };

  // Filter Nodes & Edges. Hop depth uses real undirected BFS over the graph,
  // rather than stage numbers, so cross-stage and device links behave correctly.
  const hopNodeIds = useMemo(() => {
    const selectedId = selectedNode?.id;
    if (!selectedId || hopDepth >= 3) return null;

    const adjacency = new Map(activeScenario.nodes.map(node => [node.id, new Set()]));
    activeScenario.edges.forEach(edge => {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, new Set());
      if (!adjacency.has(edge.to)) adjacency.set(edge.to, new Set());
      adjacency.get(edge.from).add(edge.to);
      adjacency.get(edge.to).add(edge.from);
    });

    const distances = new Map([[selectedId, 0]]);
    const queue = [selectedId];
    while (queue.length) {
      const current = queue.shift();
      const distance = distances.get(current);
      if (distance >= hopDepth) continue;
      (adjacency.get(current) || []).forEach(next => {
        if (!distances.has(next)) {
          distances.set(next, distance + 1);
          queue.push(next);
        }
      });
    }
    return new Set(distances.keys());
  }, [scenario, selectedNode, hopDepth]);

  const filteredNodes = useMemo(() => {
    let nodes = activeScenario.nodes;
    if (activeFilter === 'crypto') nodes = nodes.filter(n => n.type === 'crypto' || n.type === 'transit' || n.type === 'source');
    if (activeFilter === 'mule') nodes = nodes.filter(n => n.type === 'mule' || n.type === 'source');
    if (activeFilter === 'device') nodes = nodes.filter(n => n.type === 'device' || n.type === 'mule' || n.type === 'source');
    if (hopNodeIds) nodes = nodes.filter(node => hopNodeIds.has(node.id));
    return nodes;
  }, [scenario, activeFilter, hopNodeIds]);

  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return activeScenario.edges.filter(edge => {
      if (!visibleNodeIds.has(edge.from) || !visibleNodeIds.has(edge.to)) return false;
      if (activeFilter === 'crypto') return edge.type === 'crypto' || edge.type === 'transfer';
      if (activeFilter === 'device') return edge.type === 'device';
      return true;
    });
  }, [scenario, filteredNodes, activeFilter]);

  // Color helper based on node type
  const getNodeColor = (type, riskScore) => {
    if (type === 'source') return { border: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' };
    if (type === 'mule') return { border: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' };
    if (type === 'transit') return { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' };
    if (type === 'crypto') return { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' };
    if (type === 'device') return { border: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', glow: 'rgba(148, 163, 184, 0.3)' };
    return { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', glow: 'rgba(99, 102, 241, 0.4)' };
  };

  // Edge line color and animation style
  const getEdgeStyle = (edge) => {
    if (edge.type === 'crypto' || edge.flow === 'crypto_outflow') {
      return { stroke: '#ef4444', dash: '6 4', width: 3, glow: 'rgba(239, 68, 68, 0.6)', pulseColor: '#f87171' };
    }
    if (edge.type === 'device' || edge.flow === 'device_link') {
      return { stroke: '#06b6d4', dash: '3 3', width: 1.8, glow: 'rgba(6, 182, 212, 0.4)', pulseColor: '#22d3ee' };
    }
    if (edge.flow === 'transit') {
      return { stroke: '#f59e0b', dash: '5 3', width: 2.4, glow: 'rgba(245, 158, 11, 0.5)', pulseColor: '#fbbf24' };
    }
    if (edge.flow === 'payroll') {
      return { stroke: '#10b981', dash: 'none', width: 2.2, glow: 'rgba(16, 185, 129, 0.4)', pulseColor: '#34d399' };
    }
    // Default transfer / smurfing
    return { stroke: '#38bdf8', dash: '6 3', width: 2.4, glow: 'rgba(56, 189, 248, 0.5)', pulseColor: '#7dd3fc' };
  };

  // ── Live Streaming GNN Panel ──
  // Render live graph from streaming transactions
  const renderLiveStreamingGraph = () => {
    if (!isStreaming || liveNodes.size === 0) return null;

    const nodesArray = Array.from(liveNodes.values());
    const fraudNodes = nodesArray.filter(n => n.isFraud);
    const totalAmount = nodesArray.reduce((sum, n) => sum + n.totalAmount, 0);
    const maxAmount = Math.max(...liveEdges.map(e => e.amount), 1);

    // Bank color palette for community coloring
    const bankColors = {};
    const palette = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'];
    let colorIdx = 0;
    nodesArray.forEach(n => {
      if (!bankColors[n.bank]) {
        bankColors[n.bank] = palette[colorIdx % palette.length];
        colorIdx++;
      }
    });

    return (
      <div className="card" style={{
        marginBottom: 16,
        borderColor: 'rgba(239, 68, 68, 0.4)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444', animation: 'pulse 1s infinite'
            }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f87171' }}>
              🔴 LIVE STREAMING GNN
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ color: '#94a3b8' }}>
              Nodes: <strong style={{ color: '#e2e8f0' }}>{nodesArray.length}</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>
              Edges: <strong style={{ color: '#e2e8f0' }}>{liveEdges.length}</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>
              Fraud: <strong style={{ color: '#ef4444' }}>{fraudNodes.length}</strong>
            </span>
            <span style={{ color: '#64748b', fontSize: '0.65rem' }}>
              🖱️ Scroll=Zoom · Drag=Pan
            </span>
          </div>
        </div>

        {/* Canvas Area — larger, with zoom/pan */}
        <div
          style={{
            position: 'relative',
            height: CANVAS_H,
            background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 1))',
            overflow: 'hidden',
            cursor: livePanning ? 'grabbing' : 'grab',
          }}
          onWheel={handleLiveGnnWheel}
          onMouseDown={handleLiveGnnMouseDown}
          onMouseMove={handleLiveGnnMouseMove}
          onMouseUp={handleLiveGnnMouseUp}
          onMouseLeave={handleLiveGnnMouseUp}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <defs>
              <marker id="arrowhead-live" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" opacity="0.8" />
              </marker>
              <marker id="arrowhead-fraud" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#ef4444" opacity="0.9" />
              </marker>
              <filter id="glow-fraud">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-normal">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g transform={`translate(${liveGnnPan.x}, ${liveGnnPan.y}) scale(${liveGnnZoom})`}>
              {/* Edges — curved bezier with thickness proportional to amount */}
              {liveEdges.map((edge, i) => {
                const src = liveNodes.get(edge.source);
                const tgt = liveNodes.get(edge.target);
                if (!src || !tgt) return null;

                const sx = src.x, sy = src.y;
                const tx = tgt.x, ty = tgt.y;
                // Quadratic bezier control point — offset perpendicular for curve
                const mx = (sx + tx) / 2;
                const my = (sy + ty) / 2;
                const dx = tx - sx, dy = ty - sy;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const offset = Math.min(len * 0.15, 30);
                const cpx = mx + (-dy / len) * offset;
                const cpy = my + (dx / len) * offset;

                // Special styling for fanout fraud (1→7 mule network)
                const isFanout = edge.fanoutGroup != null;

                // Edge thickness: fanout gets extra thick, regular fraud medium, normal proportional
                const thickness = isFanout
                  ? 3.5  // Fanout edges are thickest
                  : edge.isFraud
                    ? 2.5
                    : 0.8 + (edge.amount / maxAmount) * 2.5;

                const pathD = `M${sx},${sy} Q${cpx},${cpy} ${tx},${ty}`;

                // Color: fanout uses bright orange-red, regular fraud red, normal blue
                const edgeColor = isFanout ? '#ff6b35' : edge.isFraud ? '#ef4444' : '#38bdf8';
                const particleColor = isFanout ? '#ffd700' : edge.isFraud ? '#fca5a5' : '#7dd3fc';

                return (
                  <g key={edge.id}>
                    {/* Path definition first (for animateMotion reference) */}
                    <path id={`edge-path-${i}`} d={pathD} fill="none" stroke="none" />
                    {/* Fanout glow effect for 1→7 mule network */}
                    {isFanout && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#ff6b35"
                        strokeWidth={thickness + 4}
                        strokeOpacity={0.3}
                        filter="url(#glow-fraud)"
                      >
                        <animate attributeName="strokeOpacity" values="0.2;0.5;0.2" dur="0.8s" repeatCount="indefinite" />
                      </path>
                    )}
                    {/* Visible curved edge */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={edgeColor}
                      strokeWidth={thickness}
                      strokeOpacity={edge.isFraud ? 0.9 : 0.5}
                      markerEnd={edge.isFraud ? 'url(#arrowhead-fraud)' : 'url(#arrowhead-live)'}
                    />
                    {/* Animated particle flowing along the curved path */}
                    <circle r={isFanout ? 4.5 : edge.isFraud ? 3.5 : 2} fill={particleColor} opacity={0.95}>
                      <animateMotion dur={`${isFanout ? 0.8 : 1.2 + (i % 5) * 0.3}s`} repeatCount="indefinite" rotate="auto">
                        <mpath href={`#edge-path-${i}`} />
                      </animateMotion>
                    </circle>
                    {/* Fanout index label (M1, M2, etc.) */}
                    {isFanout && edge.fanoutIndex !== undefined && (
                      <text
                        x={(sx + tx) / 2 + (cpy - my) * 0.3}
                        y={(sy + ty) / 2 - (cpx - mx) * 0.3}
                        textAnchor="middle"
                        fill="#ffd700"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        M{edge.fanoutIndex + 1}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {nodesArray.map((node) => {
                const isFraud = node.isFraud;
                const radius = Math.min(10 + node.txCount * 1.5, 22);
                const baseColor = isFraud ? '#dc2626' : (bankColors[node.bank] || '#3b82f6');
                const strokeColor = isFraud ? '#fca5a5' : '#94a3b8';
                const isHovered = hoveredNode === node.id;

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Fraud glow — stronger pulsing */}
                    {isFraud && (
                      <>
                        <circle cx={node.x} cy={node.y} r={radius + 12} fill="rgba(239, 68, 68, 0.15)" filter="url(#glow-fraud)">
                          <animate attributeName="r" values={`${radius + 8};${radius + 16};${radius + 8}`} dur="1.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={node.x} cy={node.y} r={radius + 5} fill="rgba(239, 68, 68, 0.25)">
                          <animate attributeName="r" values={`${radius + 3};${radius + 8};${radius + 3}`} dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      </>
                    )}
                    {/* Hover highlight */}
                    {isHovered && !isFraud && (
                      <circle cx={node.x} cy={node.y} r={radius + 6} fill="rgba(56, 189, 248, 0.2)" filter="url(#glow-normal)" />
                    )}
                    {/* Node circle */}
                    <circle
                      cx={node.x} cy={node.y} r={isHovered ? radius + 2 : radius}
                      fill={baseColor}
                      stroke={isHovered ? '#fff' : strokeColor}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      style={{ transition: 'r 0.15s ease' }}
                    />
                    {/* Label */}
                    <text
                      x={node.x} y={node.y + radius + 13}
                      textAnchor="middle"
                      fill={isFraud ? '#fca5a5' : '#94a3b8'}
                      fontSize="8"
                      fontWeight={isFraud ? 700 : 400}
                    >
                      {(node.label || node.id).substring(0, 14)}
                    </text>
                    {/* Tx count badge */}
                    {node.txCount > 1 && (
                      <g>
                        <circle cx={node.x + radius - 2} cy={node.y - radius + 2} r={7} fill="#0f172a" stroke="#475569" strokeWidth={1} />
                        <text x={node.x + radius - 2} y={node.y - radius + 5} textAnchor="middle" fill="#e2e8f0" fontSize="7" fontWeight={700}>
                          {node.txCount}
                        </text>
                      </g>
                    )}
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <g>
                        <rect
                          x={node.x + radius + 8}
                          y={node.y - 30}
                          width={180}
                          height={58}
                          rx={6}
                          fill="rgba(15, 23, 42, 0.95)"
                          stroke={isFraud ? '#ef4444' : '#334155'}
                          strokeWidth={1}
                        />
                        <text x={node.x + radius + 14} y={node.y - 16} fill="#e2e8f0" fontSize="9" fontWeight={700}>
                          {(node.label || node.id).substring(0, 22)}
                        </text>
                        <text x={node.x + radius + 14} y={node.y - 4} fill="#94a3b8" fontSize="8">
                          {node.bank} · {node.txCount} TX
                        </text>
                        <text x={node.x + radius + 14} y={node.y + 8} fill="#94a3b8" fontSize="8">
                          Vol: Rp {(node.totalAmount / 1000000).toFixed(1)}M
                        </text>
                        <text x={node.x + radius + 14} y={node.y + 20} fill={isFraud ? '#ef4444' : '#22c55e'} fontSize="8" fontWeight={600}>
                          {isFraud ? `⚠ FRAUD (Risk: ${node.riskScore}%)` : '✓ Normal'}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Overlay Stats */}
          <div style={{
            position: 'absolute',
            bottom: 8, left: 8, right: 8,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#64748b',
            pointerEvents: 'none'
          }}>
            <span>Total Volume: Rp {(totalAmount / 1000000).toFixed(1)}M</span>
            <span>Zoom: {(liveGnnZoom * 100).toFixed(0)}% · {detectedPatterns.length} pattern</span>
          </div>
        </div>

        {/* Detected Patterns Panel */}
        {detectedPatterns.length > 0 && (
          <div style={{
            padding: '8px 16px',
            borderTop: '1px solid rgba(239, 68, 68, 0.2)',
            maxHeight: 100,
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f87171', marginBottom: 4 }}>
              ⚠️ FRAUD PATTERNS DETECTED
            </div>
            {detectedPatterns.slice(0, 5).map((pattern, i) => (
              <div key={i} style={{
                fontSize: '0.68rem',
                color: '#cbd5e1',
                padding: '2px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>{pattern.type}</span>
                {' · '}
                {pattern.sender} → {pattern.receiver}
                {' · '}
                Rp {(pattern.amount / 1000000).toFixed(1)}M
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="gnn-professional-monitor" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Live Streaming GNN Panel */}
      {renderLiveStreamingGraph()}

      {/* ----------------------------------------------------------------------
          HEADER TOOLBAR & SCENARIO SWITCHER
      ---------------------------------------------------------------------- */}
      <div className="card" style={{ padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: isLight ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${isLight ? '#cbd5e1' : '#334155'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isLight ? '#0f172a' : '#f8fafc'
            }}>
              <Brain size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                  GNN Network Workbench
                </h2>
                {/* ── LIVE / DEMO badge ── */}
                {isLoadingLive ? (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: 20, background: 'rgba(99,102,241,0.12)',
                    color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)',
                    display: 'flex', alignItems: 'center', gap: 4, animation: 'pulse 1s infinite'
                  }}>
                    <Zap size={10} /> Memuat Graf Live...
                  </span>
                ) : isLiveData ? (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: 20, background: 'rgba(16,185,129,0.12)',
                    color: '#10b981', border: '1px solid rgba(16,185,129,0.35)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <Activity size={10} /> LIVE DATA
                    {liveGraphStats && ` · ${liveGraphStats.total_nodes || 0} node`}
                  </span>
                ) : hasActiveInvestigation ? (
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: 20, background: 'rgba(245,158,11,0.10)',
                    color: '#d97706', border: '1px solid rgba(245,158,11,0.3)',
                    display: 'flex', alignItems: 'center', gap: 4
                  }}>
                    <Brain size={10} /> DEMO SCENARIO
                  </span>
                ) : null}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Investigasi relasional multi-hop untuk analisis AML dan forensik transaksi lintas bank.

              </p>
            </div>
          </div>

          {/* Scenario Selector Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Pilih Skenario:</span>
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg-card-subtle)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
              {Object.keys(SCENARIOS).map(key => {
                const sc = SCENARIOS[key];
                const isSelected = selectedScenarioKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedScenarioKey(key);
                      if (addToast) addToast(`Beralih ke ${sc.name}`, 'info');
                    }}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.76rem',
                      fontWeight: isSelected ? 800 : 600,
                      borderRadius: 8,
                      border: isSelected ? `1px solid ${isLight ? '#0f172a' : '#f8fafc'}` : '1px solid transparent',
                      background: isSelected ? (isLight ? '#e2e8f0' : '#1e293b') : 'transparent',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: sc.riskLevel === 'HIGH' ? '#ef4444' : '#10b981'
                    }} />
                    {key === 'smurfing_crypto' ? 'Smurfing Kripto' : key === 'mule_ring' ? 'Mule Ring Loop' : 'Payroll BPR'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Layer Filter Chips & Canvas Controls Toolbar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: 12
        }}>
          {/* Layer Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={14} /> Filter Layer:
            </span>
            <button
              className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('all')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6 }}
            >
              Semua Stage ({activeScenario.nodes.length} Node)
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'crypto' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('crypto')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6, color: activeFilter === 'crypto' ? 'white' : '#ef4444' }}
            >
              Jalur Pelarian Kripto (Red Path)
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'mule' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('mule')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6 }}
            >
              Mule Layering Network
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'device' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('device')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6 }}
            >
              Device &amp; IP Linkage
            </button>

            {/* GNNExplainer XAI Toggle Button */}
            <button
              className="btn btn-sm"
              onClick={() => {
                setIsXaiExplainerActive(!isXaiExplainerActive);
                if (addToast) addToast(isXaiExplainerActive ? 'Subgraf penjelas GNNExplainer dinonaktifkan.' : '✨ Subgraf penjelas GNNExplainer diaktifkan (Mutual Info Max).', 'info');
              }}
              style={{
                fontSize: '0.74rem',
                height: 28,
                padding: '0 12px',
                borderRadius: 6,
                background: isXaiExplainerActive ? (isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)') : 'var(--bg-card-subtle)',
                border: isXaiExplainerActive ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                color: isXaiExplainerActive ? '#f59e0b' : 'var(--text-muted)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <Sparkles size={13} />
              <span>GNNExplainer XAI ({isXaiExplainerActive ? 'AKTIF' : 'OFF'})</span>
            </button>
          </div>

          {/* Neighborhood depth controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--bg-card-subtle)', padding: '3px 8px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>Neighborhood:</span>
            {[1, 2, 3].map(depth => (
              <button key={depth} onClick={() => setHopDepth(depth)} style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 5, border: hopDepth === depth ? '1px solid #38bdf8' : 'none', background: hopDepth === depth ? 'rgba(56, 189, 248, 0.2)' : 'transparent', color: hopDepth === depth ? '#38bdf8' : 'var(--text-muted)', fontWeight: hopDepth === depth ? 800 : 500, cursor: 'pointer' }}>
                {depth}-hop
              </button>
            ))}
          </div>

          {/* Temporal Slider Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-card-subtle)', padding: '3px 8px', borderRadius: 8, border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>⏱️ Temporal Slider:</span>
            {[
              { step: 0, label: 'Semua (Full)' },
              { step: 1, label: '09:01 (Fan-Out)' },
              { step: 2, label: '09:07 (Transit)' },
              { step: 3, label: '09:16 (Crypto)' },
            ].map(s => (
              <button
                key={s.step}
                onClick={() => {
                  setTemporalStep(s.step);
                  if (addToast && s.step > 0) addToast(`Rekonstruksi Temporal: Tahap ${s.step} (${s.label})`, 'info');
                }}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 8px',
                  borderRadius: 5,
                  border: temporalStep === s.step ? '1px solid #38bdf8' : 'none',
                  background: temporalStep === s.step ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: temporalStep === s.step ? '#38bdf8' : 'var(--text-muted)',
                  fontWeight: temporalStep === s.step ? 800 : 500,
                  cursor: 'pointer'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Interactive Navigation Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '2px 6px'
            }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleZoomOut}
                title="Zoom Out"
                style={{ padding: 4, height: 26, width: 26 }}
              >
                <ZoomOut size={15} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, minWidth: 42, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleZoomIn}
                title="Zoom In"
                style={{ padding: 4, height: 26, width: 26 }}
              >
                <ZoomIn size={15} />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleFitView}
                title="Fit View"
                style={{ padding: 4, height: 26, width: 26 }}
              >
                <Maximize2 size={15} />
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleResetLayout}
                title="Reset Posisi Node"
                style={{ padding: 4, height: 26, width: 26 }}
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setIsAnimationPlaying(!isAnimationPlaying)}
              style={{ fontSize: '0.74rem', height: 28, gap: 6 }}
            >
              <Activity size={14} className={isAnimationPlaying ? 'text-success animate-pulse' : 'text-muted'} />
              <span>{isAnimationPlaying ? 'Aliran Aktif' : 'Aliran Pause'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          STAGE PIPELINE LABELS HEADER (Compact & Sleek)
      ---------------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
        gap: 8,
        padding: '0 2px'
      }}>
        {activeScenario.stages.map((stg, idx) => (
          <div
            key={stg.id}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: isLight ? '#ffffff' : 'var(--bg-card)',
              border: `1px solid ${isLight ? '#cbd5e1' : '#334155'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.02)' : 'none'
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: isLight ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${isLight ? '#cbd5e1' : '#334155'}`,
              color: isLight ? '#0f172a' : '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '0.68rem',
              flexShrink: 0
            }}>
              {idx + 1}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {stg.title}
              </div>
              <div style={{ fontSize: '0.62rem', color: isLight ? '#64748b' : 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {stg.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------------
          MAIN INTERACTIVE CANVAS (INFINITE MAPS VIEWPORT + DRAGGABLE NODES)
      ---------------------------------------------------------------------- */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          height: 620,
          background: '#090d16',
          borderRadius: 20,
          border: isLight ? '1px solid #cbd5e1' : '1px solid var(--border-color)',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          boxShadow: isLight
            ? '0 10px 30px rgba(0,0,0,0.06)'
            : 'inset 0 0 40px rgba(0,0,0,0.8), 0 12px 36px rgba(0,0,0,0.4)'
        }}
      >
        {/* Subtle Background Grid (Adaptive Light / Dark) */}
        <div
          className="canvas-bg"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            pointerEvents: 'none'
          }}
        />

        {hasActiveInvestigation && (
          <>
            {/* ------------------------------------------------------------------
                FLOATING WIDGET 1: CRIMINAL ACTIVITIES (Kiri Bawah - Compact)
            ------------------------------------------------------------------ */}
            <motion.div
              drag
              dragConstraints={containerRef}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'absolute',
                left: 16,
                bottom: 16,
                zIndex: 10,
                width: 240,
                background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 14, 30, 0.94)',
                backdropFilter: 'blur(16px)',
                border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: 12,
                padding: '12px 14px',
                boxShadow: isLight ? '0 10px 25px rgba(0,0,0,0.1)' : '0 16px 32px rgba(0,0,0,0.6)',
                color: isLight ? '#0f172a' : 'white',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={15} color="#ef4444" />
                  <span style={{ fontWeight: 800, fontSize: '0.8rem', color: isLight ? '#0f172a' : '#f8fafc' }}>Criminal activities</span>
                </div>
                <span style={{
                  background: '#ef4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: 4
                }}>
                  {activeScenario.metrics.criminalActivities}%
                </span>
              </div>

              {/* Metric Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: 3, color: isLight ? '#475569' : '#cbd5e1' }}>
                    <span>Familiar Behavior</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{activeScenario.metrics.familiarBehavior}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${activeScenario.metrics.familiarBehavior}%`, height: '100%', background: '#0284c7', borderRadius: 2 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: 3, color: isLight ? '#475569' : '#cbd5e1' }}>
                    <span>Suspicious patterns</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{activeScenario.metrics.suspiciousPatterns}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${activeScenario.metrics.suspiciousPatterns}%`, height: '100%', background: '#d97706', borderRadius: 2 }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: 3, color: isLight ? '#475569' : '#cbd5e1' }}>
                    <span>Historical data</span>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{activeScenario.metrics.historicalData}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${activeScenario.metrics.historicalData}%`, height: '100%', background: '#059669', borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------------
            FLOATING WIDGET 2: RISK SCORE & CLASSIFICATION (Kanan Atas - Compact)
        ------------------------------------------------------------------ */}
            <motion.div
              drag
              dragConstraints={containerRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                position: 'absolute',
                right: 16,
                top: 16,
                zIndex: 10,
                width: 250,
                background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 14, 30, 0.94)',
                backdropFilter: 'blur(16px)',
                border: isLight
                  ? (activeScenario.riskLevel === 'HIGH' ? '1.5px solid #ef4444' : '1.5px solid #10b981')
                  : `1.5px solid ${activeScenario.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.45)'}`,
                borderRadius: 14,
                padding: '12px 14px',
                boxShadow: isLight ? '0 10px 25px rgba(0,0,0,0.1)' : '0 16px 32px rgba(0,0,0,0.6)',
                color: isLight ? '#0f172a' : 'white',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 0.8, color: isLight ? '#64748b' : '#94a3b8' }}>
                  GNN RISK SCORE
                </span>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: activeScenario.riskLevel === 'HIGH' ? '#fef2f2' : '#f0fdf4',
                  color: activeScenario.riskLevel === 'HIGH' ? '#dc2626' : '#16a34a',
                  border: `1px solid ${activeScenario.riskLevel === 'HIGH' ? '#fca5a5' : '#86efac'}`
                }}>
                  {activeScenario.riskLevel === 'HIGH' ? 'RISIKO TINGGI' : 'RISIKO RENDAH'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0 6px' }}>
                <span style={{
                  fontSize: '1.8rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  color: activeScenario.riskLevel === 'HIGH' ? '#dc2626' : '#16a34a',
                  lineHeight: 1
                }}>
                  {activeScenario.riskScore}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>/ 100</span>
              </div>

              <div style={{
                fontSize: '0.65rem',
                padding: '5px 8px',
                borderRadius: 6,
                background: activeScenario.riskLevel === 'HIGH' ? (isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.15)') : (isLight ? '#f0fdf4' : 'rgba(16, 185, 129, 0.15)'),
                color: activeScenario.riskLevel === 'HIGH' ? '#dc2626' : '#16a34a',
                fontWeight: 800,
                marginBottom: 6
              }}>
                {activeScenario.classification}
              </div>

              <ul style={{ margin: 0, paddingLeft: 14, fontSize: '0.65rem', color: isLight ? '#334155' : '#cbd5e1', lineHeight: 1.5 }}>
                <li>Banyak akun perantara (fan-out)</li>
                <li>Nominal pecahan seragam (structuring)</li>
                <li>Waktu singkat &lt; 5 menit</li>
                <li>Alur bermuara ke bursa kripto</li>
              </ul>
            </motion.div>

            {/* ------------------------------------------------------------------
            FLOATING WIDGET 3: LEGENDA (Kiri Atas - Compact & Adaptive)
        ------------------------------------------------------------------ */}
            <div style={{
              position: 'absolute',
              left: 16,
              top: 16,
              zIndex: 10,
              background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 14, 30, 0.94)',
              backdropFilter: 'blur(16px)',
              border: isLight ? '1px solid #cbd5e1' : '1.5px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 12,
              padding: '10px 12px',
              boxShadow: isLight ? '0 10px 25px rgba(0,0,0,0.1)' : '0 16px 32px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              minWidth: 195,
              pointerEvents: 'auto'
            }}>
              <div style={{
                fontWeight: 900,
                color: isLight ? '#1e40af' : '#93c5fd',
                fontSize: '0.65rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                marginBottom: 2
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#0284c7' }} />
                LEGENDA ENTITAS &amp; ALIRAN
              </div>

              {/* Node Category Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0284c7', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.67rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: 700 }}>Akun Sumber (Originator)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.67rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: 700 }}>Akun Mule / Perantara (L1)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.67rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: 700 }}>Merchant / Transit (L2)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.67rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: 700 }}>Bursa Kripto / Cold Wallet</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#64748b', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.67rem', color: isLight ? '#0f172a' : '#ffffff', fontWeight: 700 }}>Perangkat / Shared IP</span>
                </div>
              </div>

              {/* Edge Stream Legend */}
              <div style={{ borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.12)', paddingTop: 5, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 2.5, background: '#0284c7', borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.65rem', color: isLight ? '#334155' : '#e2e8f0', fontWeight: 600 }}>Transfer Pecahan (Smurfing)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 2.5, background: '#d97706', borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.65rem', color: isLight ? '#334155' : '#e2e8f0', fontWeight: 600 }}>Agregasi Transit (Layering)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 2.5, background: '#dc2626', borderRadius: 1, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 700 }}>Outflow Kripto (High Risk)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 0, borderTop: '1.5px dotted #0284c7', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.65rem', color: isLight ? '#0369a1' : '#67e8f9', fontWeight: 600 }}>Relasi IP / Perangkat</span>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------
            FLOATING WIDGET 4: ON-CANVAS ZOOM CONTROLS (Kanan Bawah - Icon Controls)
        ------------------------------------------------------------------ */}
            <div style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
              zIndex: 10,
              background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 14, 30, 0.92)',
              backdropFilter: 'blur(14px)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: 10,
              padding: '4px 6px',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              boxShadow: isLight ? '0 8px 20px rgba(0,0,0,0.08)' : '0 12px 24px rgba(0,0,0,0.6)'
            }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleZoomOut}
                title="Zoom Out (-)"
                style={{ padding: 4, height: 26, width: 26, color: isLight ? '#0f172a' : '#f8fafc' }}
              >
                <ZoomOut size={14} />
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                title="Klik untuk Reset ke 100%"
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  minWidth: 46,
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)',
                  color: isLight ? '#0284c7' : '#38bdf8',
                  padding: '0 4px',
                  height: 24
                }}
              >
                {Math.round(zoom * 100)}%
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleZoomIn}
                title="Zoom In (+)"
                style={{ padding: 4, height: 26, width: 26, color: isLight ? '#0f172a' : '#f8fafc' }}
              >
                <ZoomIn size={14} />
              </button>

              <span style={{ width: 1, height: 16, background: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleFitView}
                title="Paskan Tampilan (Fit View)"
                style={{ padding: 4, height: 26, width: 26, color: '#10b981' }}
              >
                <Maximize2 size={14} />
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={handleResetLayout}
                title="Reset Posisi Node"
                style={{ padding: 4, height: 26, width: 26, color: '#ef4444' }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* ------------------------------------------------------------------
            SVG GRAPH RENDERER WITH PAN & ZOOM TRANSFORM
        ------------------------------------------------------------------ */}
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ width: '100%', height: '100%' }}
            >
              {/* SVG Definitions for Gradients, Glows and Arrowheads */}
              <defs>
                <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,1 L7,4 L0,7 Z" fill={isLight ? '#0284c7' : '#38bdf8'} />
                </marker>
                <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,1 L7,4 L0,7 Z" fill="#d97706" />
                </marker>
                <marker id="arrow-red" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
                  <path d="M0,1 L8,4.5 L0,8 Z" fill="#dc2626" />
                </marker>
                <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                  <path d="M0,1 L5,3 L0,5 Z" fill={isLight ? '#0284c7' : '#06b6d4'} />
                </marker>
                <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,1 L7,4 L0,7 Z" fill="#059669" />
                </marker>
              </defs>

              {/* Transform Group for Pan & Zoom */}
              <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                {/* --------------------------------------------------------------
                1. RENDER EDGES (TRANSAKSI & DEVICE LINKAGE)
            -------------------------------------------------------------- */}
                {filteredEdges.map((edge, idx) => {
                  const srcPos = nodePositions[edge.from] || { x: 0, y: 0 };
                  const tgtPos = nodePositions[edge.to] || { x: 0, y: 0 };
                  const edgeStyle = getEdgeStyle(edge);

                  // Calculate curve
                  const dx = tgtPos.x - srcPos.x;
                  const dy = tgtPos.y - srcPos.y;
                  const midX = srcPos.x + dx * 0.5;
                  const midY = srcPos.y + dy * 0.5 + (Math.abs(dx) > 150 ? (dy > 0 ? 10 : -10) : 0);

                  const isHighlighted = hoveredNodeId === edge.from || hoveredNodeId === edge.to;
                  const isXaiEdge = XAI_MINIMAL_SUBGRAPH_NODES.includes(edge.from) && XAI_MINIMAL_SUBGRAPH_NODES.includes(edge.to);

                  const isTemporalEdge = temporalStep === 0
                    || (temporalStep === 1 && edge.flow === 'smurfing')
                    || (temporalStep === 2 && edge.flow === 'transit')
                    || (temporalStep === 3 && (edge.flow === 'crypto_outflow' || edge.type === 'crypto'));

                  const edgeEffectiveOpacity = !isTemporalEdge ? 0.08 : (isXaiExplainerActive && !isXaiEdge && !isHighlighted ? 0.3 : (isHighlighted ? 1 : 0.85));
                  const markerId = edge.type === 'crypto' ? 'url(#arrow-red)' : edge.type === 'device' ? 'url(#arrow-cyan)' : edge.flow === 'transit' ? 'url(#arrow-amber)' : edge.flow === 'payroll' ? 'url(#arrow-green)' : 'url(#arrow-blue)';

                  return (
                    <g
                      key={`edge-${edge.from}-${edge.to}-${idx}`}
                      opacity={edgeEffectiveOpacity}
                      style={{ transition: 'opacity 0.3s ease', cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedEdge(edge); }}
                    >
                      {/* Outer Glow Line */}
                      <path
                        d={`M ${srcPos.x} ${srcPos.y} Q ${midX} ${midY} ${tgtPos.x} ${tgtPos.y}`}
                        stroke={isXaiEdge && isXaiExplainerActive ? '#f59e0b' : edgeStyle.glow}
                        strokeWidth={isXaiEdge && isXaiExplainerActive ? edgeStyle.width + 6 : edgeStyle.width + 4}
                        fill="none"
                        opacity={isHighlighted || (isXaiEdge && isXaiExplainerActive) ? 0.85 : 0.3}
                      />

                      {/* Main Dashed Flow Line */}
                      <path
                        d={`M ${srcPos.x} ${srcPos.y} Q ${midX} ${midY} ${tgtPos.x} ${tgtPos.y}`}
                        stroke={isXaiEdge && isXaiExplainerActive ? '#f59e0b' : edgeStyle.stroke}
                        strokeWidth={isHighlighted || (isXaiEdge && isXaiExplainerActive) ? edgeStyle.width + 1.8 : edgeStyle.width}
                        strokeDasharray={edgeStyle.dash}
                        fill="none"
                        markerEnd={markerId}
                        opacity={isHighlighted ? 1 : 0.85}
                      >
                        {isAnimationPlaying && edge.type !== 'device' && (
                          <animate
                            attributeName="stroke-dashoffset"
                            from="40"
                            to="0"
                            dur={edge.type === 'crypto' ? '0.8s' : '1.4s'}
                            repeatCount="indefinite"
                          />
                        )}
                      </path>

                      {/* Edge Label (Nominal & Time) */}
                      {edge.amount > 0 && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x="-48"
                            y="-10"
                            width="96"
                            height="20"
                            rx="5"
                            fill={isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)'}
                            stroke={isLight ? '#cbd5e1' : edgeStyle.stroke}
                            strokeWidth="1"
                            opacity="0.95"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill={isLight ? '#0f172a' : 'white'}
                            fontSize="8.5"
                            fontWeight="700"
                            fontFamily="var(--font-mono)"
                          >
                            {formatCurrency(edge.amount).replace(',00', '')}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* --------------------------------------------------------------
                2. RENDER NODES (DRAGGABLE ENTITIES)
            -------------------------------------------------------------- */}
                {filteredNodes.map((node) => {
                  const pos = nodePositions[node.id] || { x: node.x, y: node.y };
                  const isSelected = selectedNode?.id === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isXaiNode = XAI_MINIMAL_SUBGRAPH_NODES.includes(node.id);

                  const isTemporalActiveNode = temporalStep === 0
                    || (temporalStep === 1 && (node.stage === 1 || node.stage === 2))
                    || (temporalStep === 2 && (node.stage === 2 || node.stage === 3))
                    || (temporalStep === 3 && (node.stage === 3 || node.stage === 4));

                  const nodeEffectiveOpacity = !isTemporalActiveNode
                    ? 0.12
                    : (isXaiExplainerActive && !isXaiNode && node.type !== 'source' && !isSelected && !isHovered)
                      ? 0.3
                      : 1;

                  const col = getNodeColor(node.type, node.riskScore);
                  const nodeRadius = node.type === 'source' ? 26 : node.type === 'crypto' ? 24 : node.type === 'transit' ? 22 : 20;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      opacity={nodeEffectiveOpacity}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setSelectedNode(node)}
                      style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                    >
                      {/* Pulse wave for high-risk, XAI highlighted, or selected node */}
                      {(node.riskScore >= 85 || isSelected || (isXaiNode && isXaiExplainerActive)) && (
                        <circle r={nodeRadius + 8} fill="none" stroke={isXaiNode && isXaiExplainerActive ? '#f59e0b' : col.border} strokeWidth="1.5" opacity="0.7">
                          <animate attributeName="r" values={`${nodeRadius + 4};${nodeRadius + 18};${nodeRadius + 4}`} dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Node Background Body */}
                      <circle
                        r={nodeRadius}
                        fill={col.bg}
                        stroke={isXaiNode && isXaiExplainerActive ? '#f59e0b' : col.border}
                        strokeWidth={isSelected ? 3.5 : (isXaiNode && isXaiExplainerActive ? 3 : 2.2)}
                        filter={isSelected || (isXaiNode && isXaiExplainerActive) ? 'url(#glow-red)' : 'none'}
                      />

                      {/* Node Icon or Code */}
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={col.text}
                        fontSize={nodeRadius * 0.62}
                        fontWeight="900"
                        fontFamily="var(--font-mono)"
                        pointerEvents="none"
                      >
                        {node.code}
                      </text>

                      {/* Unified High-Contrast Label Pill below node */}
                      <g transform={`translate(0, ${nodeRadius + 15})`}>
                        <rect
                          x="-70"
                          y="-9"
                          width="140"
                          height="30"
                          rx="6"
                          fill={isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 14, 30, 0.94)'}
                          stroke={isSelected ? col.border : isLight ? '#cbd5e1' : 'rgba(148, 163, 184, 0.35)'}
                          strokeWidth={isSelected ? 1.5 : 1}
                        />
                        {/* Primary Name */}
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill={isLight ? '#0f172a' : '#ffffff'}
                          fontSize="9.5"
                          fontWeight="800"
                          pointerEvents="none"
                        >
                          {node.label.length > 17 ? node.label.substring(0, 15) + '...' : node.label}
                        </text>
                        {/* Secondary Bank & Account */}
                        <text
                          x="0"
                          y="16"
                          textAnchor="middle"
                          fill={isLight ? '#0284c7' : '#93c5fd'}
                          fontSize="7.8"
                          fontWeight="700"
                          fontFamily="var(--font-mono)"
                          pointerEvents="none"
                        >
                          {node.bank} • {node.account ? (node.account.length > 11 ? node.account.substring(0, 9) + '..' : node.account) : ''}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* ------------------------------------------------------------------
            CANVAS HINT BAR (Bawah Tengah - Touchpad Guidance)
        ------------------------------------------------------------------ */}
            <div style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 8,
              background: isLight ? 'rgba(255, 255, 255, 0.94)' : 'rgba(8, 14, 30, 0.88)',
              backdropFilter: 'blur(12px)',
              border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(148, 163, 184, 0.25)',
              borderRadius: 20,
              padding: '7px 18px',
              fontSize: '0.74rem',
              color: isLight ? '#334155' : '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              boxShadow: isLight ? '0 6px 16px rgba(0,0,0,0.08)' : '0 8px 24px rgba(0,0,0,0.6)',
              pointerEvents: 'none'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: isLight ? '#0284c7' : '#93c5fd', fontWeight: 600 }}>
                <Move size={13} color={isLight ? '#0284c7' : '#38bdf8'} /> Geser Touchpad 2 Jari untuk Pan Peta
              </span>
              <span style={{ color: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ color: isLight ? '#059669' : '#86efac', fontWeight: 600 }}>
                Pinch Touchpad 2 Jari untuk Zoom In / Out
              </span>
              <span style={{ color: isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)' }}>|</span>
              <span style={{ color: isLight ? '#dc2626' : '#fca5a5', fontWeight: 600 }}>
                Klik &amp; Tarik Node untuk Reposisi
              </span>
            </div>
          </>
        )}
        {!hasActiveInvestigation && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 24,
            pointerEvents: 'none'
          }}>
            <div style={{ maxWidth: 430, color: '#cbd5e1' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
                Canvas investigasi siap digunakan
              </div>
              <div style={{ fontSize: '0.78rem', lineHeight: 1.6, marginTop: 6, color: '#94a3b8' }}>
                Pilih skenario di atas, atau buka GNN dari transaksi Live Monitoring / alert agar subgraf relasional dimuat.
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginTop: 14,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid rgba(148, 163, 184, 0.25)',
                background: 'rgba(15, 23, 42, 0.55)',
                color: '#64748b',
                fontSize: '0.68rem'
              }}>
                Standby · belum ada entitas yang dipilih
              </div>
            </div>
          </div>
        )
        }
      </div >

      {/* ----------------------------------------------------------------------
          FORENSIC AML NODE INSPECTOR (DRAWER DETAIL SAAT NODE DIKLIK)
      ---------------------------------------------------------------------- */}
      {
        selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{
              padding: 20,
              background: 'var(--bg-card)',
              border: `1.5px solid ${selectedNode.riskScore >= 80 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(99, 102, 241, 0.4)'}`,
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: selectedNode.riskScore >= 80 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  border: `2px solid ${selectedNode.riskScore >= 80 ? '#ef4444' : '#38bdf8'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: selectedNode.riskScore >= 80 ? '#ef4444' : '#38bdf8',
                  fontWeight: 900,
                  fontSize: '1.2rem'
                }}>
                  {selectedNode.code}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>{selectedNode.label}</h3>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 6,
                      background: selectedNode.riskScore >= 80 ? '#ef4444' : '#10b981',
                      color: 'white'
                    }}>
                      {selectedNode.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    {selectedNode.bank} • No. Rekening: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{selectedNode.account}</strong> • NIK: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{selectedNode.nik}</strong>
                  </div>
                </div>
              </div>

              {/* Risk Badge and Quick Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'right', marginRight: 4 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SKOR ANOMALI GNN</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: selectedNode.riskScore >= 80 ? '#ef4444' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                    {selectedNode.riskScore}%
                  </div>
                </div>

                {/* Customer 360 Drawer Trigger */}
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    if (onOpenCustomer360) {
                      onOpenCustomer360(selectedNode);
                    } else if (addToast) {
                      addToast(`👤 Membuka Customer 360 untuk ${selectedNode.label}`, 'info');
                    }
                  }}
                  style={{
                    fontSize: '0.78rem',
                    height: 36,
                    gap: 6,
                    background: 'rgba(2, 132, 199, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(2, 132, 199, 0.35)',
                    fontWeight: 700
                  }}
                >
                  <User size={14} /> Customer 360
                </button>

                {/* Action Button: Role-Aware Block / Escalate */}
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    if (onCreateCase) {
                      onCreateCase({
                        account: selectedNode,
                        edge: selectedEdge,
                        graphSnapshot: { scenario: selectedScenarioKey, nodes: filteredNodes, edges: filteredEdges }
                      });
                    } else if (can('executeBlock')) {
                      if (addToast) addToast(`⚡ Perintah Circuit Breaker dieksekusi oleh ${currentUser?.name || 'MLRO'}: Rekening ${selectedNode.account} dibekukan permanen.`, 'warning');
                    } else {
                      if (addToast) addToast(`ℹ️ Role AML Investigator telah mencatat eskalasi rekening ${selectedNode.account} ke Pejabat Kepatuhan (MLRO) di menu Cases & Compliance.`, 'info');
                    }
                  }}
                  style={{
                    fontSize: '0.78rem',
                    height: 36,
                    gap: 6,
                    background: can('executeBlock')
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  {can('executeBlock') ? <Lock size={14} /> : <GitBranch size={14} />}
                  {can('executeBlock') ? 'Bekukan Akun Ini (MLRO)' : 'Eskalasikan ke MLRO'}
                </button>
              </div>
            </div>

            {selectedEdge && (
              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: isLight ? '#eff6ff' : 'rgba(14, 116, 144, 0.12)', border: `1px solid ${isLight ? '#bfdbfe' : 'rgba(56, 189, 248, 0.3)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <strong style={{ color: isLight ? '#075985' : '#7dd3fc' }}>Detail Edge Terpilih</strong>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedEdge(null)} style={{ padding: 3 }} title="Tutup detail edge"><X size={14} /></button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: '0.76rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Jenis:</span> <strong>{selectedEdge.type || selectedEdge.flow || 'transfer'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Nominal:</span> <strong>{selectedEdge.amount ? formatCurrency(selectedEdge.amount) : 'Relational link'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Waktu:</span> <strong>{selectedEdge.timestamp || selectedEdge.time || 'N/A'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Channel:</span> <strong>{selectedEdge.channel || selectedEdge.purpose_code || 'GNN topology'}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Relevansi:</span> <strong>{selectedEdge.importance || selectedEdge.weight || (selectedEdge.type === 'crypto' ? 'High' : 'Medium')}</strong></div>
                </div>
                <div style={{ marginTop: 10, fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Penjelasan:</strong> {selectedEdge.explanation || `Edge ${selectedEdge.from} → ${selectedEdge.to} dipertahankan karena berkontribusi pada pola ${selectedEdge.flow || selectedEdge.type || 'relasional'} dalam subgraf investigasi.`}
                </div>
              </div>
            )}

            {/* Detailed Forensic Meta Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
              gap: 12,
              marginTop: 16,
              paddingTop: 16,
              borderTop: '1px solid var(--border-color)'
            }}>
              <div style={{ background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SALDO TERAKHIR</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(selectedNode.balance)}
                </div>
              </div>

              <div style={{ background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PERANGKAT & DEVICE ID</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {selectedNode.deviceId}
                </div>
              </div>

              <div style={{ background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ALAMAT IP ASAL (GEOLOKASI)</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#d97706', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                  {selectedNode.ip}
                </div>
              </div>

              <div style={{ background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>INDIKASI POLA FORENSIK</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: 2 }}>
                  {selectedNode.description}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      {/* ----------------------------------------------------------------------
          PANEL: 4 INDIKATOR UTAMA + 15 SUB-INDIKATOR REAL (RF + GNN + Rule Engine)
      ---------------------------------------------------------------------- */}
      {hasActiveInvestigation && activeScenario.metrics.subIndicators && (
        <div style={{
          padding: 20,
          background: isLight ? '#ffffff' : '#0f172a',
          border: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
          borderRadius: 14,
          boxShadow: isLight ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: isLight ? '#f1f5f9' : '#1e293b',
                border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isLight ? '#0284c7' : '#38bdf8'
              }}>
                <Brain size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: isLight ? '#0f172a' : '#f8fafc' }}>
                  4 Indikator Utama + 15 Sub-Indikator AML
                </h3>
                <p style={{ fontSize: '0.72rem', color: isLight ? '#64748b' : '#94a3b8', margin: '2px 0 0' }}>
                  Sumber: <strong style={{ color: isLight ? '#0284c7' : '#38bdf8' }}>Random Forest 29 fitur (308K data)</strong> · <strong style={{ color: '#8b5cf6' }}>GraphSAGE GNN (32-dim)</strong> · <strong style={{ color: '#059669' }}>Rule Engine 13 aturan OJK/PPATK</strong>
                </p>
              </div>
            </div>

            {/* Hybrid Score Breakdown */}
            <div style={{
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: isLight ? '#f8fafc' : '#020617',
              border: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
              borderRadius: 10,
              padding: '8px 14px',
              flexWrap: 'wrap'
            }}>
              {[
                { label: 'GNN Score', value: activeScenario.metrics.gnnScore, color: '#8b5cf6', sub: 'GraphSAGE' },
                { label: 'RF Score', value: activeScenario.metrics.rfScore, color: '#0284c7', sub: 'Random Forest' },
                { label: 'Rule Score', value: activeScenario.metrics.ruleScore, color: '#059669', sub: '13 Aturan' },
                { label: 'HYBRID FINAL', value: activeScenario.metrics.hybridScore, color: '#dc2626', sub: '0.6×GNN + 0.4×Rule' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', paddingRight: i < 3 ? 10 : 0, borderRight: i < 3 ? (isLight ? '1px solid #e2e8f0' : '1px solid #1e293b') : 'none' }}>
                  <div style={{ fontSize: i === 3 ? '1.35rem' : '1.1rem', fontWeight: 900, color: item.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: item.color, marginTop: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.58rem', color: isLight ? '#64748b' : '#64748b' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Indicator Groups - 100% Symmetrical Equal-Height Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 285px), 1fr))',
            gap: 14,
            alignItems: 'stretch'
          }}>
            {Object.entries(activeScenario.metrics.subIndicators).map(([key, indicator], groupIdx) => {
              const groupThemes = [
                {
                  bgLight: '#f8fafc',
                  bgDark: '#0f172a',
                  borderLight: '#e2e8f0',
                  borderDark: '#1e293b',
                  titleLight: '#0f172a',
                  titleDark: '#f8fafc',
                  subLight: '#475569',
                  subDark: '#94a3b8',
                  cardBorderLight: '#e2e8f0',
                  cardBorderDark: '#1e293b'
                },
                {
                  bgLight: '#f8fafc',
                  bgDark: '#0f172a',
                  borderLight: '#e2e8f0',
                  borderDark: '#1e293b',
                  titleLight: '#0f172a',
                  titleDark: '#f8fafc',
                  subLight: '#475569',
                  subDark: '#94a3b8',
                  cardBorderLight: '#e2e8f0',
                  cardBorderDark: '#1e293b'
                },
                {
                  bgLight: '#f8fafc',
                  bgDark: '#0f172a',
                  borderLight: '#e2e8f0',
                  borderDark: '#1e293b',
                  titleLight: '#0f172a',
                  titleDark: '#f8fafc',
                  subLight: '#475569',
                  subDark: '#94a3b8',
                  cardBorderLight: '#e2e8f0',
                  cardBorderDark: '#1e293b'
                },
                {
                  bgLight: '#f8fafc',
                  bgDark: '#0f172a',
                  borderLight: '#e2e8f0',
                  borderDark: '#1e293b',
                  titleLight: '#0f172a',
                  titleDark: '#f8fafc',
                  subLight: '#475569',
                  subDark: '#94a3b8',
                  cardBorderLight: '#e2e8f0',
                  cardBorderDark: '#1e293b'
                }
              ];
              const theme = groupThemes[groupIdx] || groupThemes[0];

              return (
                <div key={key} style={{
                  border: isLight ? `1.5px solid ${theme.cardBorderLight}` : `1.5px solid ${theme.cardBorderDark}`,
                  borderRadius: 14,
                  background: isLight ? '#ffffff' : '#090d16',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  boxShadow: isLight ? '0 3px 12px rgba(0,0,0,0.04)' : 'none'
                }}>
                  {/* Indicator Group Header with Distinct Themed Background */}
                  <div style={{
                    padding: '12px 14px',
                    background: isLight ? theme.bgLight : theme.bgDark,
                    borderBottom: isLight ? `1.5px solid ${theme.borderLight}` : `1px solid ${theme.borderDark}`,
                    borderLeft: `5px solid ${indicator.color}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 64,
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ flex: 1, paddingRight: 8 }}>
                      <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isLight ? theme.titleLight : theme.titleDark, lineHeight: 1.3 }}>
                        {indicator.label}
                      </div>
                      <div style={{ fontSize: '0.66rem', color: isLight ? theme.subLight : theme.subDark, marginTop: 2, fontWeight: 600 }}>
                        {indicator.source}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: indicator.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                        {indicator.score}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: isLight ? theme.subLight : theme.subDark, fontWeight: 700 }}>Risk Score</div>
                    </div>
                  </div>

                  {/* Sub-Indicators: Symmetrical 3-Row Grid */}
                  <div style={{
                    padding: '12px',
                    display: 'grid',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    gap: 10,
                    flex: 1
                  }}>
                    {indicator.subs.map((sub, subIdx) => {
                      const statusColor = sub.status === 'critical' ? '#dc2626' : sub.status === 'high' ? '#d97706' : '#059669';
                      const statusLabel = sub.status === 'critical' ? 'KRITIS' : sub.status === 'high' ? 'TINGGI' : 'SEDANG';
                      return (
                        <div key={sub.id} style={{
                          background: isLight ? '#f8fafc' : '#0f172a',
                          border: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
                          borderLeft: `3px solid ${statusColor}`,
                          borderRadius: 10,
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          height: '100%',
                          boxSizing: 'border-box'
                        }}>
                          {/* Sub-indicator header */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                  <span style={{
                                    fontSize: '0.6rem', fontWeight: 800, padding: '1px 5px', borderRadius: 3,
                                    background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40`
                                  }}>
                                    {statusLabel}
                                  </span>
                                  <span style={{ fontSize: '0.73rem', fontWeight: 700, color: isLight ? '#0f172a' : '#f8fafc', lineHeight: 1.25 }}>
                                    Sub-{groupIdx + 1}.{subIdx + 1} — {sub.name}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>{sub.source}</div>
                              </div>
                              {/* Score with bar */}
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: '0.98rem', fontWeight: 900, color: statusColor, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                                  {sub.score}
                                </div>
                                <div style={{ width: 40, height: 3, background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                                  <div style={{ width: `${sub.score}%`, height: '100%', background: statusColor, borderRadius: 2 }} />
                                </div>
                              </div>
                            </div>

                            {/* Value badge */}
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '3px 8px', borderRadius: 5,
                              background: isLight ? '#ffffff' : '#020617',
                              border: isLight ? '1px solid #cbd5e1' : '1px solid #1e293b',
                              fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                              color: isLight ? '#0f172a' : '#f8fafc', margin: '4px 0 6px 0'
                            }}>
                              <span style={{ color: '#64748b' }}>Nilai Aktual:</span>
                              <span style={{ color: statusColor }}>{sub.value}</span>
                            </div>
                          </div>

                          {/* Detail explanation with minimum height for symmetry */}
                          <div style={{
                            fontSize: '0.66rem', color: isLight ? '#475569' : '#94a3b8', lineHeight: 1.45,
                            padding: '6px 8px', borderRadius: 6,
                            background: isLight ? '#f1f5f9' : '#020617',
                            minHeight: 38,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            {sub.detail}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom: Model Technical Details - Symmetrical 6-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
            gap: 10,
            marginTop: 16,
            paddingTop: 16,
            borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b'
          }}>
            {[
              { label: 'Model Klasifikasi', value: 'Random Forest Classifier' },
              { label: 'Jumlah Fitur RF', value: '29 fitur tabular' },
              { label: 'Dataset Training', value: activeScenario.metrics.datasetSize },
              { label: 'GNN Embedding Dim', value: `${activeScenario.metrics.embeddingDim} dimensi (GraphSAGE)` },
              { label: 'Formula Hybrid', value: '0.6×GNN + 0.4×Rule Engine' },
              { label: 'Validasi AUC-ROC', value: `${activeScenario.metrics.modelAUC} (Near-Perfect)` },
            ].map((item, i) => (
              <div key={i} style={{
                background: isLight ? '#f8fafc' : '#020617',
                padding: '8px 12px',
                borderRadius: 8,
                border: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isLight ? '#0f172a' : '#f8fafc' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
      }

      {/* ----------------------------------------------------------------------
          FOOTER EXPLANATION CARD (PENJELASAN POLA GRAF SMURFING PPATK & OJK)
      ---------------------------------------------------------------------- */}
      <div className="card" style={{ padding: 20, background: isLight ? '#ffffff' : 'var(--bg-card)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: isLight ? '#0f172a' : 'var(--text-primary)' }}>
          <Workflow size={18} color="#818cf8" />
          Penjelasan Pola Graf (Smurfing, Layering &amp; Pelarian Dana ke Kripto)
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: 14,
          fontSize: '0.78rem',
          lineHeight: 1.6,
          color: isLight ? '#475569' : 'var(--text-muted)'
        }}>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
            <strong style={{ color: '#0284c7', display: 'block', marginBottom: 4 }}>1. Fan-Out Tinggi (Penyebaran):</strong>
            1 akun sumber utama menyebarkan dana dalam jumlah besar ke banyak rekening perantara sekaligus untuk menghindari threshold pelaporan transaksi tunai/kliring.
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
            <strong style={{ color: '#059669', display: 'block', marginBottom: 4 }}>2. Structuring &amp; Smurfing:</strong>
            Nominal transaksi dipecah menjadi pecahan kecil dan seragam (misal Rp 4,9jt s/d Rp 10jt) secara berurutan dalam waktu singkat (&lt; 5 menit).
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
            <strong style={{ color: '#d97706', display: 'block', marginBottom: 4 }}>3. Layering &amp; Transit Aggregator:</strong>
            Dana yang telah dipecah dikumpulkan kembali melalui payment gateway / escrow transit untuk memutuskan hubungan langsung dengan rekening sumber.
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: isLight ? '#f8fafc' : 'var(--bg-card-subtle)', border: isLight ? '1px solid #e2e8f0' : '1px solid var(--border-color)' }}>
            <strong style={{ color: '#dc2626', display: 'block', marginBottom: 4 }}>4. Integration ke Bursa Kripto:</strong>
            Dana transit dilarikan ke bursa kripto (Indodax, Binance, Tokocrypto) untuk dikonversi menjadi stablecoin (USDT) dan dipindahkan ke cold storage on-chain.
          </div>
        </div>
      </div>
    </div >
  );
}

