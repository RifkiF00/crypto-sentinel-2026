import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Workflow
} from 'lucide-react';
import { formatCurrency } from '../data/mockData';

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
        label: 'Rifki Firmansyah',
        account: '0123456789',
        bank: 'BPR Bank Kuningan',
        balance: 150000000,
        riskScore: 92,
        riskLevel: 'high',
        role: 'Akun Sumber (Originator)',
        ip: '182.16.2.90 (Kuningan)',
        deviceId: 'DEV-ANDROID-S24-ULTRA',
        nik: '3171092802092102',
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

export default function GNNVisualization({ addToast }) {
  // Scenario State
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('smurfing_crypto');
  const scenario = SCENARIOS[selectedScenarioKey];

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
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(true);
  const [isAutoLayout, setIsAutoLayout] = useState(true);
  const [showMetricsDrawer, setShowMetricsDrawer] = useState(true);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(true);

  const containerRef = useRef(null);
  const svgRef = useRef(null);

  // Initialize node positions based on scenario
  useEffect(() => {
    const initialPos = {};
    scenario.nodes.forEach(node => {
      initialPos[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initialPos);
    setSelectedNode(scenario.nodes[0]); // Select source node by default
    setPan({ x: 0, y: 0 });
    setZoom(0.95);
  }, [selectedScenarioKey]);

  // Reset positions to default layout
  const handleResetLayout = () => {
    const initialPos = {};
    scenario.nodes.forEach(node => {
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

    const nodeObj = scenario.nodes.find(n => n.id === nodeId);
    if (nodeObj) setSelectedNode(nodeObj);
  };

  // Filter Nodes & Edges
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return scenario.nodes;
    if (activeFilter === 'crypto') return scenario.nodes.filter(n => n.type === 'crypto' || n.type === 'transit' || n.id === 'A1');
    if (activeFilter === 'mule') return scenario.nodes.filter(n => n.type === 'mule' || n.type === 'source');
    if (activeFilter === 'device') return scenario.nodes.filter(n => n.type === 'device' || n.type === 'mule' || n.type === 'source');
    return scenario.nodes;
  }, [scenario, activeFilter]);

  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return scenario.edges.filter(edge => {
      const isVisible = visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to);
      if (!isVisible) return false;
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

  return (
    <div className="gnn-professional-monitor" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
              border: '1.5px solid rgba(99, 102, 241, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}>
              <Brain size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                  GNN Forensic Topology & Smurfing Flow Monitor
                </h2>
                <span className="badge badge-blocked" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                  SOC LEVEL 4
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Pemetaan Topologi Graf Relasional Otomatis untuk Analis AML, Satgas TPPU OJK & PPATK RI
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
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.5)' : 'none',
                      background: isSelected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(129, 140, 248, 0.15) 100%)' : 'transparent',
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
                    {key === 'smurfing_crypto' ? '🔥 Smurfing Kripto' : key === 'mule_ring' ? '⭕ Mule Ring Loop' : '✅ Payroll BPR'}
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
              Semua Stage ({scenario.nodes.length} Node)
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'crypto' ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('crypto')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6, color: activeFilter === 'crypto' ? 'white' : '#ef4444' }}
            >
              🚨 Jalur Pelarian Kripto (Red Path)
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'mule' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('mule')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6 }}
            >
              👥 Mule Layering Network
            </button>
            <button
              className={`btn btn-sm ${activeFilter === 'device' ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => setActiveFilter('device')}
              style={{ fontSize: '0.74rem', height: 28, padding: '0 10px', borderRadius: 6 }}
            >
              📱 Device & IP Linkage
            </button>
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
        gridTemplateColumns: `repeat(${scenario.stages.length}, 1fr)`,
        gap: 8,
        padding: '0 4px'
      }}>
        {scenario.stages.map((stg, idx) => (
          <div
            key={stg.id}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              background: 'var(--bg-card)',
              border: `1px dashed ${stg.color}50`,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: `${stg.color}20`,
              border: `1px solid ${stg.color}`,
              color: stg.color,
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
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: stg.color, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {stg.title}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
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
          background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.98) 0%, rgba(9, 13, 26, 1) 100%)',
          borderRadius: 20,
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 12px 36px rgba(0,0,0,0.4)'
        }}
      >
        {/* Subtle Cyber Blueprint Background Grid */}
        <div
          className="canvas-bg"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            pointerEvents: 'none'
          }}
        />

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
            background: 'rgba(8, 14, 30, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 12,
            padding: '12px 14px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
            color: 'white',
            cursor: 'default'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldAlert size={15} color="#ef4444" />
              <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#f8fafc' }}>Criminal activities</span>
            </div>
            <span style={{
              background: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: 4
            }}>
              {scenario.metrics.criminalActivities}%
            </span>
          </div>

          {/* Metric Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: 3, color: '#cbd5e1' }}>
                <span>Familiar Behavior</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{scenario.metrics.familiarBehavior}%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${scenario.metrics.familiarBehavior}%`, height: '100%', background: '#38bdf8', borderRadius: 2 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: 3, color: '#cbd5e1' }}>
                <span>Suspicious patterns</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{scenario.metrics.suspiciousPatterns}%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${scenario.metrics.suspiciousPatterns}%`, height: '100%', background: '#f59e0b', borderRadius: 2 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', marginBottom: 3, color: '#cbd5e1' }}>
                <span>Historical data</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{scenario.metrics.historicalData}%</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${scenario.metrics.historicalData}%`, height: '100%', background: '#10b981', borderRadius: 2 }} />
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
            background: 'rgba(8, 14, 30, 0.94)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${scenario.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(16, 185, 129, 0.45)'}`,
            borderRadius: 14,
            padding: '12px 14px',
            boxShadow: '0 16px 32px rgba(0,0,0,0.6)',
            color: 'white',
            cursor: 'default'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: 0.8, color: '#94a3b8' }}>
              GNN RISK SCORE
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: 4,
              background: scenario.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: scenario.riskLevel === 'HIGH' ? '#ef4444' : '#10b981',
              border: `1px solid ${scenario.riskLevel === 'HIGH' ? '#ef4444' : '#10b981'}`
            }}>
              {scenario.riskLevel === 'HIGH' ? 'RISIKO TINGGI' : 'RISIKO RENDAH'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0 6px' }}>
            <span style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              fontFamily: 'var(--font-mono)',
              color: scenario.riskLevel === 'HIGH' ? '#ef4444' : '#10b981',
              lineHeight: 1
            }}>
              {scenario.riskScore}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b' }}>/ 100</span>
          </div>

          <div style={{
            fontSize: '0.65rem',
            padding: '5px 8px',
            borderRadius: 6,
            background: scenario.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: scenario.riskLevel === 'HIGH' ? '#fca5a5' : '#86efac',
            fontWeight: 800,
            marginBottom: 6
          }}>
            {scenario.classification}
          </div>

          <ul style={{ margin: 0, paddingLeft: 14, fontSize: '0.65rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            <li>Banyak akun perantara (fan-out)</li>
            <li>Nominal pecahan seragam (structuring)</li>
            <li>Waktu singkat &lt; 5 menit</li>
            <li>Alur bermuara ke bursa kripto</li>
          </ul>
        </motion.div>

        {/* ------------------------------------------------------------------
            FLOATING WIDGET 3: LEGENDA (Kiri Atas - Compact & High Contrast)
        ------------------------------------------------------------------ */}
        <div style={{
          position: 'absolute',
          left: 16,
          top: 16,
          zIndex: 10,
          background: 'rgba(8, 14, 30, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 12,
          padding: '10px 12px',
          boxShadow: '0 16px 32px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          minWidth: 195,
          pointerEvents: 'auto'
        }}>
          <div style={{
            fontWeight: 900,
            color: '#93c5fd',
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            marginBottom: 2
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8' }} />
            LEGENDA ENTITAS &amp; ALIRAN
          </div>

          {/* Node Category Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#38bdf8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.67rem', color: '#ffffff', fontWeight: 700 }}>Akun Sumber (Originator)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
              <span style={{ fontSize: '0.67rem', color: '#ffffff', fontWeight: 700 }}>Akun Mule / Perantara (L1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
              <span style={{ fontSize: '0.67rem', color: '#ffffff', fontWeight: 700 }}>Merchant / Transit (L2)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: '0.67rem', color: '#ffffff', fontWeight: 700 }}>Bursa Kripto / Cold Wallet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.67rem', color: '#ffffff', fontWeight: 700 }}>Perangkat / Shared IP</span>
            </div>
          </div>

          {/* Edge Stream Legend */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 5, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 2.5, background: '#38bdf8', borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 600 }}>Transfer Pecahan (Smurfing)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 2.5, background: '#f59e0b', borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: '#e2e8f0', fontWeight: 600 }}>Agregasi Transit (Layering)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 2.5, background: '#ef4444', borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 700 }}>🚨 Outflow Kripto</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 14, height: 0, borderTop: '1.5px dotted #06b6d4', flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: '#67e8f9', fontWeight: 600 }}>Relasi IP / Perangkat</span>
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
          background: 'rgba(8, 14, 30, 0.92)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: 10,
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: '0 12px 24px rgba(0,0,0,0.6)'
        }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            style={{ padding: 4, height: 26, width: 26, color: '#f8fafc' }}
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
              color: '#38bdf8',
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
            style={{ padding: 4, height: 26, width: 26, color: '#f8fafc' }}
          >
            <ZoomIn size={14} />
          </button>

          <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleFitView}
            title="Paskan Tampilan (Fit View)"
            style={{ padding: 4, height: 26, width: 26, color: '#86efac' }}
          >
            <Maximize2 size={14} />
          </button>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleResetLayout}
            title="Reset Posisi Node"
            style={{ padding: 4, height: 26, width: 26, color: '#fca5a5' }}
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
              <path d="M0,1 L7,4 L0,7 Z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-amber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7 Z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-red" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
              <path d="M0,1 L8,4.5 L0,8 Z" fill="#ef4444" />
            </marker>
            <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,1 L5,3 L0,5 Z" fill="#06b6d4" />
            </marker>
            <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7 Z" fill="#10b981" />
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
              const markerId = edge.type === 'crypto' ? 'url(#arrow-red)' : edge.type === 'device' ? 'url(#arrow-cyan)' : edge.flow === 'transit' ? 'url(#arrow-amber)' : edge.flow === 'payroll' ? 'url(#arrow-green)' : 'url(#arrow-blue)';

              return (
                <g key={`edge-${edge.from}-${edge.to}-${idx}`}>
                  {/* Outer Glow Line */}
                  <path
                    d={`M ${srcPos.x} ${srcPos.y} Q ${midX} ${midY} ${tgtPos.x} ${tgtPos.y}`}
                    stroke={edgeStyle.glow}
                    strokeWidth={edgeStyle.width + 4}
                    fill="none"
                    opacity={isHighlighted ? 0.8 : 0.3}
                  />

                  {/* Main Dashed Flow Line */}
                  <path
                    d={`M ${srcPos.x} ${srcPos.y} Q ${midX} ${midY} ${tgtPos.x} ${tgtPos.y}`}
                    stroke={edgeStyle.stroke}
                    strokeWidth={isHighlighted ? edgeStyle.width + 1.5 : edgeStyle.width}
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
                        fill="rgba(15, 23, 42, 0.9)"
                        stroke={edgeStyle.stroke}
                        strokeWidth="1"
                        opacity="0.9"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill="white"
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
              const col = getNodeColor(node.type, node.riskScore);
              const nodeRadius = node.type === 'source' ? 26 : node.type === 'crypto' ? 24 : node.type === 'transit' ? 22 : 20;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Pulse wave for high-risk or selected node */}
                  {(node.riskScore >= 85 || isSelected) && (
                    <circle r={nodeRadius + 8} fill="none" stroke={col.border} strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values={`${nodeRadius + 4};${nodeRadius + 16};${nodeRadius + 4}`} dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Node Background Body */}
                  <circle
                    r={nodeRadius}
                    fill={col.bg}
                    stroke={col.border}
                    strokeWidth={isSelected ? 3.5 : 2.2}
                    filter={isSelected ? 'url(#glow-red)' : 'none'}
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
                      fill="rgba(8, 14, 30, 0.94)"
                      stroke={isSelected ? col.border : 'rgba(148, 163, 184, 0.35)'}
                      strokeWidth={isSelected ? 1.5 : 1}
                    />
                    {/* Primary Name */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#ffffff"
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
                      fill="#93c5fd"
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
          background: 'rgba(8, 14, 30, 0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.25)',
          borderRadius: 20,
          padding: '7px 18px',
          fontSize: '0.74rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          pointerEvents: 'none'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#93c5fd', fontWeight: 600 }}>
            <Move size={13} color="#38bdf8" /> Geser Touchpad 2 Jari untuk Pan Peta
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: '#86efac', fontWeight: 600 }}>
            🤏 Pinch Touchpad 2 Jari untuk Zoom In / Out
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span style={{ color: '#fca5a5', fontWeight: 600 }}>
            🖱️ Klik &amp; Tarik Node untuk Reposisi
          </span>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          FORENSIC AML NODE INSPECTOR (DRAWER DETAIL SAAT NODE DIKLIK)
      ---------------------------------------------------------------------- */}
      {selectedNode && (
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SKOR ANOMALI GNN</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: selectedNode.riskScore >= 80 ? '#ef4444' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                  {selectedNode.riskScore}%
                </div>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  if (addToast) addToast(`Perintah Circuit Breaker dikirim: Akun ${selectedNode.account} dibekukan otomatis.`, 'warning');
                }}
                style={{ fontSize: '0.78rem', height: 36, gap: 6, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none' }}
              >
                <Lock size={14} /> Bekukan Akun Ini
              </button>
            </div>
          </div>

          {/* Detailed Forensic Meta Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>SALDO TERAKHIR</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {formatCurrency(selectedNode.balance)}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>PERANGKAT & DEVICE ID</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {selectedNode.deviceId}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>ALAMAT IP ASAL (GEOLOKASI)</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {selectedNode.ip}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card-subtle)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-color)' }}>
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
      {scenario.metrics.subIndicators && (
        <div style={{ padding: 20, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: '#1e293b',
                border: '1.5px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8'
              }}>
                <Brain size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  4 Indikator Utama + 15 Sub-Indikator AML
                </h3>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '2px 0 0' }}>
                  Sumber: <strong style={{ color: '#38bdf8' }}>Random Forest 29 fitur (308K data)</strong> · <strong style={{ color: '#a855f7' }}>GraphSAGE GNN (32-dim)</strong> · <strong style={{ color: '#10b981' }}>Rule Engine 13 aturan OJK/PPATK</strong>
                </p>
              </div>
            </div>

            {/* Hybrid Score Breakdown */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: '8px 14px', flexWrap: 'wrap' }}>
              {[
                { label: 'GNN Score', value: scenario.metrics.gnnScore, color: '#a855f7', sub: 'GraphSAGE' },
                { label: 'RF Score', value: scenario.metrics.rfScore, color: '#3b82f6', sub: 'Random Forest' },
                { label: 'Rule Score', value: scenario.metrics.ruleScore, color: '#10b981', sub: '13 Aturan' },
                { label: 'HYBRID FINAL', value: scenario.metrics.hybridScore, color: '#ef4444', sub: '0.6×GNN + 0.4×Rule' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', paddingRight: i < 3 ? 10 : 0, borderRight: i < 3 ? '1px solid #1e293b' : 'none' }}>
                  <div style={{ fontSize: i === 3 ? '1.35rem' : '1.1rem', fontWeight: 900, color: item.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 800, color: item.color, marginTop: 2 }}>{item.label}</div>
                  <div style={{ fontSize: '0.58rem', color: '#64748b' }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Indicator Groups */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 14 }}>
            {Object.entries(scenario.metrics.subIndicators).map(([key, indicator], groupIdx) => (
              <div key={key} style={{
                border: '1px solid #1e293b',
                borderRadius: 12,
                background: '#090d16',
                overflow: 'hidden'
              }}>
                {/* Indicator Group Header */}
                <div style={{
                  padding: '10px 14px',
                  background: '#1e293b',
                  borderBottom: '1px solid #334155',
                  borderLeft: `4px solid ${indicator.color}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                      {indicator.label}
                    </div>
                    <div style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: 2 }}>
                      {indicator.source}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: indicator.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                      {indicator.score}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#64748b' }}>Risk Score</div>
                  </div>
                </div>

                {/* Sub-Indicators */}
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {indicator.subs.map((sub, subIdx) => {
                    const statusColor = sub.status === 'critical' ? '#ef4444' : sub.status === 'high' ? '#f59e0b' : '#10b981';
                    const statusLabel = sub.status === 'critical' ? 'KRITIS' : sub.status === 'high' ? 'TINGGI' : 'SEDANG';
                    return (
                      <div key={sub.id} style={{
                        background: '#0f172a',
                        border: '1px solid #1e293b',
                        borderLeft: `3px solid ${statusColor}`,
                        borderRadius: 8,
                        padding: '9px 12px'
                      }}>
                        {/* Sub-indicator header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <span style={{
                                fontSize: '0.62rem', fontWeight: 800, padding: '1px 5px', borderRadius: 3,
                                background: `${statusColor}25`, color: statusColor, border: `1px solid ${statusColor}50`
                              }}>
                                {statusLabel}
                              </span>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#f8fafc' }}>
                                Sub-{groupIdx + 1}.{subIdx + 1} — {sub.name}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.66rem', color: '#64748b' }}>{sub.source}</div>
                          </div>
                          {/* Score with bar */}
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: statusColor, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                              {sub.score}
                            </div>
                            <div style={{ width: 44, height: 3.5, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${sub.score}%`, height: '100%', background: statusColor, borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>

                        {/* Value badge */}
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '3px 8px', borderRadius: 4,
                          background: '#020617', border: '1px solid #1e293b',
                          fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          color: '#f8fafc', marginBottom: 5
                        }}>
                          <span style={{ color: '#64748b' }}>Nilai Aktual:</span>
                          <span style={{ color: statusColor }}>{sub.value}</span>
                        </div>

                        {/* Detail explanation */}
                        <div style={{
                          fontSize: '0.68rem', color: '#94a3b8', lineHeight: 1.5,
                          padding: '5px 8px', borderRadius: 4,
                          background: '#020617'
                        }}>
                          {sub.detail}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom: Model Technical Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid #1e293b' }}>
            {[
              { label: 'Model Klasifikasi', value: 'Random Forest Classifier', icon: '🌲' },
              { label: 'Jumlah Fitur RF', value: '29 fitur tabular', icon: '📊' },
              { label: 'Dataset Training', value: scenario.metrics.datasetSize, icon: '🗃️' },
              { label: 'GNN Embedding Dim', value: `${scenario.metrics.embeddingDim} dimensi (GraphSAGE)`, icon: '🕸️' },
              { label: 'Formula Hybrid', value: '0.6×GNN + 0.4×Rule Engine', icon: '⚖️' },
              { label: 'Validasi AUC-ROC', value: `${scenario.metrics.modelAUC} (Near-Perfect)`, icon: '🎯' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#020617', padding: '7px 10px', borderRadius: 6, border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          FOOTER EXPLANATION CARD (PENJELASAN POLA GRAF SMURFING PPATK & OJK)
      ---------------------------------------------------------------------- */}
      <div className="card" style={{ padding: 20, background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Workflow size={18} color="#818cf8" />
          Penjelasan Pola Graf (Smurfing, Layering &amp; Pelarian Dana ke Kripto)
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
          fontSize: '0.78rem',
          lineHeight: 1.6,
          color: 'var(--text-muted)'
        }}>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: 4 }}>1. Fan-Out Tinggi (Penyebaran):</strong>
            1 akun sumber utama menyebarkan dana dalam jumlah besar ke banyak rekening perantara sekaligus untuk menghindari threshold pelaporan transaksi tunai/kliring.
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#10b981', display: 'block', marginBottom: 4 }}>2. Structuring &amp; Smurfing:</strong>
            Nominal transaksi dipecah menjadi pecahan kecil dan seragam (misal Rp 4,9jt s/d Rp 10jt) secara berurutan dalam waktu singkat (&lt; 5 menit).
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#f59e0b', display: 'block', marginBottom: 4 }}>3. Layering &amp; Transit Aggregator:</strong>
            Dana yang telah dipecah dikumpulkan kembali melalui payment gateway / escrow transit untuk memutuskan hubungan langsung dengan rekening sumber.
          </div>
          <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#ef4444', display: 'block', marginBottom: 4 }}>4. Integration ke Bursa Kripto:</strong>
            Dana transit dilarikan ke bursa kripto (Indodax, Binance, Tokocrypto) untuk dikonversi menjadi stablecoin (USDT) dan dipindahkan ke cold storage on-chain.
          </div>
        </div>
      </div>
    </div>
  );
}

