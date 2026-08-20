import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  FileCheck2,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Move,
  Activity,
  Layers,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Server,
  Smartphone,
  Coins,
  FileText
} from 'lucide-react';
import { formatCurrency } from '../data/mockData';

// ============================================================================
// 1. DATA TOPOLOGI PERBANKAN & FORENSIK AML STANDAR INDUSTRI (OJK / PPATK)
// ============================================================================

const SCENARIOS = {
  smurfing_crypto: {
    id: 'smurfing_crypto',
    name: 'Kasus 1: Pola Smurfing & Pelarian Dana ke Kripto (High Risk)',
    caseId: 'AML-CS-2026-0891',
    timestamp: '21 Agustus 2026, 09:19 WIB',
    riskScore: 92,
    riskLevel: 'HIGH',
    classification: 'SMURFING + REKENING MULE BERANTAI + PELARIAN KRIPTO',
    decision: 'CIRCUIT BREAKER: BLOCKED & STR REPORT GENERATED',
    summary: 'Terdeteksi 1 akun sumber (BPR Bank Kuningan) memecah dana Rp 150.000.000 menjadi 5 transaksi seragam (@ Rp 10.000.000) ke 5 rekening perantara (Mule L1), lalu diagregasi ke 3 rekening transit (Layer 2), dan dialirkan ke 4 bursa kripto (Indodax, Binance, Tokocrypto, Cold Storage) dalam tempo 14 menit.',
    metrics: {
      gnnScore: 88,
      rfScore: 91,
      ruleScore: 95,
      hybridScore: 92,
      pageRank: '0.0482 (Top 1% Hub)',
      betweenness: '0.842 (Critical Node)',
      communityId: 'CLUSTER-SMURF-99',
      hopDistance: '3-Hop Direct Chain',
      datasetSize: '308.213 transaksi (PaySim + SMOTE Retrained)',
      modelAUC: '0.9781 (Validation ROC-AUC)'
    },
    stages: [
      { id: 1, title: 'Stage 1: Akun Sumber', subtitle: 'Dana Masuk Awal (Rp 150 Jt)', count: 1 },
      { id: 2, title: 'Stage 2: Layer 1 Smurfing', subtitle: '5 Rekening Mule (@ Rp 10 Jt)', count: 5 },
      { id: 3, title: 'Stage 3: Layer 2 Agregasi', subtitle: '3 Rekening Transit / VA', count: 3 },
      { id: 4, title: 'Stage 4: Outflow Kripto', subtitle: '4 Bursa & Cold Wallet', count: 4 }
    ],
    nodes: [
      // Stage 1: Akun Sumber
      {
        id: 'A1',
        stage: 1,
        code: 'SRC-01',
        type: 'source',
        label: 'Rifki Firmansyah',
        account: '0123456789',
        bank: 'BPR Bank Kuningan',
        balance: 150000000,
        riskScore: 92,
        riskLevel: 'high',
        role: 'Akun Sumber (Originator)',
        ip: '182.16.2.90 (Kuningan Datacenter)',
        deviceId: 'DEV-ANDROID-S24-ULTRA',
        nik: '3171092802092102',
        x: 120,
        y: 270,
        description: 'Rekening asal dana Rp 150 Juta, melakukan 5 transfer pecahan seragam dalam 5 menit.'
      },
      // Stage 2: Layer 1 Mule
      {
        id: 'B1',
        stage: 2,
        code: 'MLE-01',
        type: 'mule',
        label: 'Budi Santoso',
        account: '8012000005',
        bank: 'Bank Central Asia (BCA)',
        balance: 10000000,
        riskScore: 88,
        riskLevel: 'high',
        role: 'Akun Mule Layer 1',
        ip: '192.168.1.10 (Shared IP)',
        deviceId: 'DEV-XIAOMI-13',
        nik: '3208012304950001',
        x: 360,
        y: 110,
        description: 'Penerima transfer Rp 10.000.000, diteruskan ke Virtual Account Transit M1.'
      },
      {
        id: 'B2',
        stage: 2,
        code: 'MLE-02',
        type: 'mule',
        label: 'Ahmad Faisal',
        account: '1370000000001',
        bank: 'Bank Mandiri',
        balance: 10000000,
        riskScore: 89,
        riskLevel: 'high',
        role: 'Akun Mule Layer 1',
        ip: '192.168.1.10 (Shared IP)',
        deviceId: 'DEV-XIAOMI-13',
        nik: '3208012304950002',
        x: 360,
        y: 190,
        description: 'Alamat IP sama persis dengan Mule B1 (192.168.1.10) pada saat transaksi bersamaan.'
      },
      {
        id: 'B3',
        stage: 2,
        code: 'MLE-03',
        type: 'mule',
        label: 'Desta Erlangga',
        account: '0912000002',
        bank: 'Bank Negara Indonesia (BNI)',
        balance: 10000000,
        riskScore: 86,
        riskLevel: 'high',
        role: 'Akun Mule Layer 1',
        ip: '192.168.1.11 (Shared IP)',
        deviceId: 'DEV-SAMSUNG-A54',
        nik: '3208012304950003',
        x: 360,
        y: 270,
        description: 'Split transfer pecahan Rp 5.100.000 dan Rp 4.900.000 ke transit M2.'
      },
      {
        id: 'B4',
        stage: 2,
        code: 'MLE-04',
        type: 'mule',
        label: 'Siti Rahma',
        account: '888801000000003',
        bank: 'Bank Rakyat Indonesia (BRI)',
        balance: 10000000,
        riskScore: 85,
        riskLevel: 'high',
        role: 'Akun Mule Layer 1',
        ip: '192.168.1.11 (Shared IP)',
        deviceId: 'DEV-SAMSUNG-A54',
        nik: '3208012304950004',
        x: 360,
        y: 350,
        description: 'Akun dormant 45 hari tanpa mutasi, mendadak aktif menerima & mentransfer dana.'
      },
      {
        id: 'B5',
        stage: 2,
        code: 'MLE-05',
        type: 'mule',
        label: 'Hendri Gunawan',
        account: '705400000004',
        bank: 'CIMB Niaga',
        balance: 10000000,
        riskScore: 87,
        riskLevel: 'high',
        role: 'Akun Mule Layer 1',
        ip: '192.168.1.12 (Shared IP)',
        deviceId: 'DEV-VIVO-Y20',
        nik: '3208012304950005',
        x: 360,
        y: 430,
        description: 'Transaksi transfer pada jam anomali malam 02:40 WIB tanpa profil riwayat normal.'
      },
      // Stage 3: Layer 2 Transit / Merchant
      {
        id: 'M1',
        stage: 3,
        code: 'TRN-01',
        type: 'transit',
        label: 'Payment Gateway Transit A',
        account: 'VA-9088219001',
        bank: 'BCA Virtual Account',
        balance: 29800000,
        riskScore: 91,
        riskLevel: 'high',
        role: 'Akun Agregasi Transit L2',
        ip: '103.152.88.1',
        deviceId: 'SRV-GATEWAY-01',
        nik: 'CORP-ID-991',
        x: 620,
        y: 150,
        description: 'Menghimpun dana dari Mule B1 & B2 untuk deposit cepat ke Indodax.'
      },
      {
        id: 'M2',
        stage: 3,
        code: 'TRN-02',
        type: 'transit',
        label: 'P2P Escrow Merchant B',
        account: 'VA-9088219002',
        bank: 'Mandiri Merchant VA',
        balance: 29400000,
        riskScore: 93,
        riskLevel: 'high',
        role: 'P2P Escrow Transit L2',
        ip: '103.152.88.2',
        deviceId: 'SRV-GATEWAY-02',
        nik: 'CORP-ID-992',
        x: 620,
        y: 270,
        description: 'Menghimpun dana dari Mule B3 & B4 untuk deposit ke Binance Exchange.'
      },
      {
        id: 'M3',
        stage: 3,
        code: 'TRN-03',
        type: 'transit',
        label: 'Aggregator Transit Pool C',
        account: 'VA-9088219003',
        bank: 'BNI Corporate Pool',
        balance: 29700000,
        riskScore: 90,
        riskLevel: 'high',
        role: 'Pool Transit Account L2',
        ip: '103.152.88.3',
        deviceId: 'SRV-GATEWAY-03',
        nik: 'CORP-ID-993',
        x: 620,
        y: 390,
        description: 'Menghimpun dana dari B5 untuk dialirkan ke Tokocrypto dan dompet unhosted.'
      },
      // Stage 4: Outflow Kripto
      {
        id: 'C1',
        stage: 4,
        code: 'CRP-01',
        type: 'crypto',
        label: 'PT Indodax Nasional Indonesia',
        account: '9012666666 (Deposit Vault)',
        bank: 'BCA Escrow Indodax',
        balance: 45000000,
        riskScore: 95,
        riskLevel: 'high',
        role: 'Bursa Kripto Terdaftar Bappebti',
        ip: 'API Gateway Jakarta',
        deviceId: 'VA-INDODAX-HOT',
        nik: 'BAP-INDODAX-01',
        x: 880,
        y: 130,
        description: 'Deposit rupiah instan untuk konversi ke aset kripto USDT/Bitcoin.'
      },
      {
        id: 'C2',
        stage: 4,
        code: 'CRP-02',
        type: 'crypto',
        label: 'PT Binance Exchange Global',
        account: '9012123456 (Offshore Channel)',
        bank: 'CIMB Escrow Binance',
        balance: 44100000,
        riskScore: 98,
        riskLevel: 'high',
        role: 'Bursa Kripto Internasional',
        ip: 'Offshore Proxy Routing',
        deviceId: 'BINANCE-PEER-SET',
        nik: 'OFFSHORE-EXCHANGE',
        x: 880,
        y: 230,
        description: 'Aliran dana devisa lintas batas tanpa pelaporan resmi transaksi devisa bank.'
      },
      {
        id: 'C3',
        stage: 4,
        code: 'CRP-03',
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
        nik: 'BAP-TOKOCRYPTO',
        x: 880,
        y: 330,
        description: 'Tujuan konversi rupiah ke token digital secara instan via BI-FAST.'
      },
      {
        id: 'C4',
        stage: 4,
        code: 'CRP-04',
        type: 'crypto',
        label: 'Cold Wallet (Unhosted Ledger)',
        account: '0x71c5991823ab...e49f',
        bank: 'Ethereum Blockchain (ERC-20)',
        balance: 15000000,
        riskScore: 99,
        riskLevel: 'high',
        role: 'Unhosted Self-Custody Wallet',
        ip: 'On-Chain Anonymized',
        deviceId: 'HARDWARE-LEDGER-X',
        nik: 'ANONYMOUS-ONCHAIN',
        x: 880,
        y: 430,
        description: 'Dompet mandiri on-chain dengan relasi historis mixing/layering lanjutan.'
      },
      // Perangkat / Shared IP Links (Bawah)
      {
        id: 'D1',
        stage: 5,
        code: 'IP-01',
        type: 'device',
        label: 'IP: 192.168.1.10 (Shared)',
        account: 'Perangkat Bersama (Mule B1 & B2)',
        bank: 'ISP Indihome Kuningan',
        balance: 0,
        riskScore: 90,
        riskLevel: 'high',
        role: 'Infrastruktur IP Bersama',
        ip: '192.168.1.10',
        deviceId: 'MAC-A4:B2:99:11:00',
        nik: 'INFRA-DEVICE-LINK',
        x: 300,
        y: 560,
        description: '1 IP yang sama digunakan secara simultan oleh rekening Budi (B1) dan Ahmad (B2).'
      },
      {
        id: 'D2',
        stage: 5,
        code: 'IP-02',
        type: 'device',
        label: 'IP: 192.168.1.11 (Shared)',
        account: 'Perangkat Bersama (Mule B3 & B4)',
        bank: 'ISP Telkomsel Flash',
        balance: 0,
        riskScore: 89,
        riskLevel: 'high',
        role: 'Infrastruktur IP Bersama',
        ip: '192.168.1.11',
        deviceId: 'MAC-C8:11:44:88:12',
        nik: 'INFRA-DEVICE-LINK',
        x: 520,
        y: 560,
        description: 'Hardware ID yang sama mengoperasikan mutasi transfer rekening B3 dan B4.'
      },
      {
        id: 'D3',
        stage: 5,
        code: 'VPN-01',
        type: 'device',
        label: 'VPN: 182.16.2.90 (Proxy)',
        account: 'Datacenter Originator',
        bank: 'Datacenter Proxy Gateway',
        balance: 0,
        riskScore: 94,
        riskLevel: 'high',
        role: 'Anonymizer VPN Proxy',
        ip: '182.16.2.90',
        deviceId: 'PROXY-CIRCUIT-99',
        nik: 'VPN-DATACENTER',
        x: 740,
        y: 560,
        description: 'Asal IP transaksi dari subnet datacenter VPN yang menyamarkan lokasi fisik pelaku.'
      }
    ],
    edges: [
      { from: 'A1', to: 'B1', amount: 10000000, time: '09:01', type: 'transfer', risk: 'high' },
      { from: 'A1', to: 'B2', amount: 10000000, time: '09:02', type: 'transfer', risk: 'high' },
      { from: 'A1', to: 'B3', amount: 10000000, time: '09:03', type: 'transfer', risk: 'high' },
      { from: 'A1', to: 'B4', amount: 10000000, time: '09:04', type: 'transfer', risk: 'high' },
      { from: 'A1', to: 'B5', amount: 10000000, time: '09:05', type: 'transfer', risk: 'high' },
      { from: 'B1', to: 'M1', amount: 5000000, time: '09:06', type: 'transit', risk: 'high' },
      { from: 'B1', to: 'M1', amount: 4800000, time: '09:07', type: 'transit', risk: 'high' },
      { from: 'B2', to: 'M1', amount: 5000000, time: '09:08', type: 'transit', risk: 'high' },
      { from: 'B2', to: 'M2', amount: 4900000, time: '09:09', type: 'transit', risk: 'high' },
      { from: 'B3', to: 'M2', amount: 5100000, time: '09:10', type: 'transit', risk: 'high' },
      { from: 'B3', to: 'M2', amount: 4700000, time: '09:11', type: 'transit', risk: 'high' },
      { from: 'B4', to: 'M2', amount: 5200000, time: '09:12', type: 'transit', risk: 'high' },
      { from: 'B4', to: 'M3', amount: 4600000, time: '09:13', type: 'transit', risk: 'high' },
      { from: 'B5', to: 'M3', amount: 5000000, time: '09:14', type: 'transit', risk: 'high' },
      { from: 'B5', to: 'M3', amount: 4900000, time: '09:15', type: 'transit', risk: 'high' },
      { from: 'M1', to: 'C1', amount: 14700000, time: '09:16', type: 'crypto', risk: 'critical' },
      { from: 'M2', to: 'C2', amount: 15000000, time: '09:17', type: 'crypto', risk: 'critical' },
      { from: 'M3', to: 'C3', amount: 14500000, time: '09:18', type: 'crypto', risk: 'critical' },
      { from: 'M3', to: 'C4', amount: 15000000, time: '09:19', type: 'crypto', risk: 'critical' },
      { from: 'B1', to: 'D1', amount: 0, time: 'Shared IP', type: 'device', risk: 'medium' },
      { from: 'B2', to: 'D1', amount: 0, time: 'Shared IP', type: 'device', risk: 'medium' },
      { from: 'B3', to: 'D2', amount: 0, time: 'Shared HW', type: 'device', risk: 'medium' },
      { from: 'B4', to: 'D2', amount: 0, time: 'Shared HW', type: 'device', risk: 'medium' },
      { from: 'A1', to: 'D3', amount: 0, time: 'VPN Proxy', type: 'device', risk: 'high' },
      { from: 'B5', to: 'D3', amount: 0, time: 'VPN Proxy', type: 'device', risk: 'high' }
    ]
  },
  mule_ring: {
    id: 'mule_ring',
    name: 'Kasus 2: Sindikat Rekening Penampung Berantai (Circular Mule Ring)',
    caseId: 'AML-CS-2026-0742',
    timestamp: '21 Agustus 2026, 14:25 WIB',
    riskScore: 86,
    riskLevel: 'HIGH',
    classification: 'CIRCULAR LAYERING MULE RING (3-HOP CLOSED LOOP)',
    decision: 'TRANSACTION REVIEW: MANUAL VERIFICATION REQUIRED',
    summary: 'Pola perputaran dana tertutup antar 4 rekening penampung untuk mengaburkan audit trail sebelum ditransfer keluar ekosistem perbankan.',
    metrics: {
      gnnScore: 84,
      rfScore: 88,
      ruleScore: 86,
      hybridScore: 86,
      pageRank: '0.0391 (Top 5%)',
      betweenness: '0.710 (Circular Loop)',
      communityId: 'CLUSTER-RING-04',
      hopDistance: 'Circular 4-Node Ring',
      datasetSize: '308.213 transaksi (PaySim + SMOTE Retrained)',
      modelAUC: '0.9781 (Validation ROC-AUC)'
    },
    stages: [
      { id: 1, title: 'Stage 1: Akun Rekrutan', subtitle: 'Penerima Awal (Rp 80 Jt)', count: 1 },
      { id: 2, title: 'Stage 2: Ring Perputaran', subtitle: '2 Rekening Mule Perantara', count: 2 },
      { id: 3, title: 'Stage 3: Aggregator Pool', subtitle: 'Titik Temu Dana', count: 1 },
      { id: 4, title: 'Stage 4: Likuidasi Kripto', subtitle: 'Indodax Exchange', count: 1 }
    ],
    nodes: [
      { id: 'R1', stage: 1, code: 'SRC-01', type: 'source', label: 'Rekening Rekrutan A', account: '1122334455', bank: 'Bank Kuningan', balance: 80000000, riskScore: 84, riskLevel: 'high', role: 'Inflow Account', ip: '36.85.12.1', deviceId: 'DEV-OPPO-A15', nik: '3208012304950011', x: 140, y: 280, description: 'Rekening penerima aliran dana judi online awal.' },
      { id: 'R2', stage: 2, code: 'MLE-01', type: 'mule', label: 'Mule Ring Node 1', account: '4521880292', bank: 'Bank Central Asia (BCA)', balance: 75000000, riskScore: 88, riskLevel: 'high', role: 'Ring Member 1', ip: '36.85.12.1', deviceId: 'DEV-OPPO-A15', nik: '3208012304950012', x: 400, y: 160, description: 'Menerima dana dan memutar sebagian ke Ring Node 2.' },
      { id: 'R3', stage: 2, code: 'MLE-02', type: 'mule', label: 'Mule Ring Node 2', account: '7819002231', bank: 'Bank Mandiri', balance: 72000000, riskScore: 89, riskLevel: 'high', role: 'Ring Member 2', ip: '36.85.12.2', deviceId: 'DEV-OPPO-A15', nik: '3208012304950013', x: 400, y: 400, description: 'Menerima dari R2 dan melempar kembali ke R4.' },
      { id: 'R4', stage: 3, code: 'TRN-01', type: 'transit', label: 'Mule Aggregator Pool', account: '9901238472', bank: 'Bank Negara Indonesia (BNI)', balance: 69000000, riskScore: 92, riskLevel: 'high', role: 'Ring Exit Gate', ip: '103.44.12.9', deviceId: 'DEV-SERVER-01', nik: '3208012304950014', x: 660, y: 280, description: 'Titik temu aliran dana sebelum eksekusi transfer ke exchange kripto.' },
      { id: 'R5', stage: 4, code: 'CRP-01', type: 'crypto', label: 'PT Indodax Nasional Indonesia', account: '9012666666', bank: 'BCA Escrow Indodax', balance: 65000000, riskScore: 96, riskLevel: 'high', role: 'Bursa Kripto', ip: 'API Gateway', deviceId: 'INDODAX-HOT', nik: 'BAP-INDODAX', x: 880, y: 280, description: 'Likuidasi akhir dana ring menjadi aset kripto.' }
    ],
    edges: [
      { from: 'R1', to: 'R2', amount: 40000000, time: '14:02', type: 'transfer', risk: 'high' },
      { from: 'R1', to: 'R3', amount: 40000000, time: '14:03', type: 'transfer', risk: 'high' },
      { from: 'R2', to: 'R3', amount: 20000000, time: '14:08', type: 'transit', risk: 'high' },
      { from: 'R3', to: 'R4', amount: 35000000, time: '14:15', type: 'transit', risk: 'high' },
      { from: 'R2', to: 'R4', amount: 34000000, time: '14:16', type: 'transit', risk: 'high' },
      { from: 'R4', to: 'R5', amount: 65000000, time: '14:25', type: 'crypto', risk: 'critical' }
    ]
  },
  normal_payroll: {
    id: 'normal_payroll',
    name: 'Kasus 3: Distribusi Payroll ASN Pemda Kuningan (Legitimate)',
    caseId: 'TXN-KNG-2026-0012',
    timestamp: '21 Agustus 2026, 07:35 WIB',
    riskScore: 12,
    riskLevel: 'LOW',
    classification: 'NORMAL BPR DISBURSEMENT (AUTOMATIC ALLOW)',
    decision: 'TRANSACTION APPROVED (INSTANT SETTLEMENT)',
    summary: 'Penyaluran rutin gaji & sertifikasi guru ASN Pemda Kuningan via giro BPR Bank Kuningan. Terverifikasi ISO 20022 tujuan resmi tanpa pola fan-out anomali.',
    metrics: {
      gnnScore: 8,
      rfScore: 14,
      ruleScore: 10,
      hybridScore: 12,
      pageRank: '0.0012 (Normal)',
      betweenness: '0.045 (Regular Tree)',
      communityId: 'CLUSTER-PAYROLL-KNG',
      hopDistance: '1-Hop Star Tree',
      datasetSize: '308.213 transaksi (PaySim + SMOTE Retrained)',
      modelAUC: '0.9781 (Validation ROC-AUC)'
    },
    stages: [
      { id: 1, title: 'Stage 1: Kas Daerah', subtitle: 'Giro BPKAD Kuningan', count: 1 },
      { id: 2, title: 'Stage 2: Rekening ASN', subtitle: '3 Rekening Guru & Staf', count: 3 },
      { id: 3, title: 'Stage 3: Kliring APEX', subtitle: 'Bank bjb (APEX BPR)', count: 1 },
      { id: 4, title: 'Stage 4: Settlement', subtitle: 'Penyelesaian Kliring', count: 1 }
    ],
    nodes: [
      { id: 'N1', stage: 1, code: 'KAS-01', type: 'source', label: 'Kasda BPKAD Kuningan', account: '001002003004', bank: 'BPR Bank Kuningan', balance: 850000000, riskScore: 5, riskLevel: 'low', role: 'Rekening Kas Daerah', ip: '10.12.1.5 (Intranet Pemda)', deviceId: 'SETDA-FINANCE-01', nik: 'PEMDA-KUNINGAN-01', x: 150, y: 280, description: 'Rekening resmi pencairan gaji rutin Pemkab Kuningan.' },
      { id: 'N2', stage: 2, code: 'ASN-01', type: 'mule', label: 'Drs. H. Maman Suherman', account: '0123991823', bank: 'BPR Bank Kuningan', balance: 8500000, riskScore: 8, riskLevel: 'low', role: 'ASN Guru SMPN 1', ip: '180.252.12.1', deviceId: 'GURU-PHONE-01', nik: '3208010101700001', x: 450, y: 160, description: 'Penerima transfer gaji pokok bulan berjalan.' },
      { id: 'N3', stage: 2, code: 'ASN-02', type: 'mule', label: 'Hj. Neneng Rohaeti, M.Pd', account: '0123991824', bank: 'BPR Bank Kuningan', balance: 9200000, riskScore: 7, riskLevel: 'low', role: 'Kepala Sekolah SDN', ip: '180.252.12.2', deviceId: 'GURU-PHONE-02', nik: '3208010101720002', x: 450, y: 280, description: 'Penerima tunjangan sertifikasi pendidik.' },
      { id: 'N4', stage: 2, code: 'ASN-03', type: 'mule', label: 'Asep Saepudin, S.Kom', account: '0123991825', bank: 'BPR Bank Kuningan', balance: 6500000, riskScore: 10, riskLevel: 'low', role: 'Staf TU Disdikbud', ip: '180.252.12.3', deviceId: 'GURU-PHONE-03', nik: '3208010101850003', x: 450, y: 400, description: 'Penerima gaji tenaga operasional sekolah.' },
      { id: 'N5', stage: 3, code: 'APX-01', type: 'transit', label: 'Kliring APEX Bank bjb', account: 'APEX-BJB-KNG', bank: 'Bank bjb (Pengayom BPR)', balance: 0, riskScore: 5, riskLevel: 'low', role: 'Settlement Engine', ip: 'Core Banking API', deviceId: 'CORE-BKG-01', nik: 'BI-FAST-SETTLE', x: 800, y: 280, description: 'Penyelesaian kliring resmi kluster BPR Jawa Barat.' }
    ],
    edges: [
      { from: 'N1', to: 'N2', amount: 8500000, time: '07:30', type: 'transfer', risk: 'low' },
      { from: 'N1', to: 'N3', amount: 9200000, time: '07:30', type: 'transfer', risk: 'low' },
      { from: 'N1', to: 'N4', amount: 6500000, time: '07:30', type: 'transfer', risk: 'low' },
      { from: 'N2', to: 'N5', amount: 8500000, time: '07:35', type: 'transfer', risk: 'low' },
      { from: 'N3', to: 'N5', amount: 9200000, time: '07:35', type: 'transfer', risk: 'low' },
      { from: 'N4', to: 'N5', amount: 6500000, time: '07:35', type: 'transfer', risk: 'low' }
    ]
  }
};

// ============================================================================
// 2. MATRIKS 15 SUB-INDIKATOR COMPLIANCE (FORMAT AUDIT OJK / PPATK)
// ============================================================================

const AML_REGULATORY_MATRIX = [
  {
    ref: 'IND-01.1',
    category: 'Pola Nominal',
    param: 'Rasio Nilai Transaksi vs Saldo Awal (amount_ratio)',
    source: 'Random Forest Feature #1 (Bobot: 30.04%)',
    actualValue: '150.000.000 / 150.000.000 = 1.000',
    baseline: 'Normal: < 0.35 saldo',
    score: 99,
    status: 'KRITIS',
    rationale: 'Pengurasan saldo 100% secara instan mengindikasikan akun mule penampung yang segera dikosongkan.'
  },
  {
    ref: 'IND-01.2',
    category: 'Pola Nominal',
    param: 'Nominal Transaksi Absolut (amount)',
    source: 'Random Forest Feature #4 (Bobot: 10.14%)',
    actualValue: 'Rp 150.000.000',
    baseline: 'Threshold: Rp 15.000.000',
    score: 87,
    status: 'TINGGI',
    rationale: 'Nominal mutasi melampaui batas kewajaran profil nasabah retail perbankan.'
  },
  {
    ref: 'IND-01.3',
    category: 'Pola Nominal',
    param: 'Pecahan Seragam Berulang (Structuring / Smurfing)',
    source: 'Rule Engine Indicator #12 (+45 pts)',
    actualValue: '5 transaksi identik (@ Rp 10.000.000) dalam 5 menit',
    baseline: 'Maks 1 transaksi / jam',
    score: 95,
    status: 'KRITIS',
    rationale: 'Pola pemecahan dana (smurfing) untuk menghindari threshold pelaporan tunai/kliring perbankan.'
  },
  {
    ref: 'IND-02.1',
    category: 'Pola Saldo',
    param: 'Saldo Pengirim Dikosongkan Total (is_balance_drained)',
    source: 'Random Forest Feature #5 (Bobot: 9.96%) + Rule #3 (+35 pts)',
    actualValue: 'Saldo Akhir = Rp 0',
    baseline: 'Saldo mengendap normal > Rp 500.000',
    score: 98,
    status: 'KRITIS',
    rationale: 'Drain-to-zero adalah ciri khas akun transit pencucian uang sebelum dibekukan sistem.'
  },
  {
    ref: 'IND-02.2',
    category: 'Pola Saldo',
    param: 'Saldo Awal Signifikan (oldbalanceOrg)',
    source: 'Random Forest Feature #3 (Bobot: 12.12%)',
    actualValue: 'Rp 150.000.000 (Inflow mendadak)',
    baseline: 'Historis rata-rata: Rp 4.500.000',
    score: 85,
    status: 'TINGGI',
    rationale: 'Inflow dana besar yang langsung ditransfer keluar dalam hitungan menit tanpa masa pengendapan.'
  },
  {
    ref: 'IND-02.3',
    category: 'Pola Saldo',
    param: 'Inkonsistensi Saldo Rekening Tujuan (dest_balance_err)',
    source: 'Random Forest Feature #11 (Bobot: 1.73%)',
    actualValue: 'Discrepancy +Rp 50.000.000 (Multi-Inflow Transit)',
    baseline: 'Discrepancy = Rp 0',
    score: 76,
    status: 'SEDANG',
    rationale: 'Rekening penerima menampung dana paralel dari beberapa sumber rekening sekaligus.'
  },
  {
    ref: 'IND-03.1',
    category: 'Topologi GNN',
    param: 'Kedekatan Embedding ke Cluster Fraud (GraphSAGE Cosine)',
    source: 'GNN GraphSAGE Embeddings 32-dim (Bobot: 60%)',
    actualValue: 'Cosine Similarity = 0.88 terhadap Centroid Mule Ring',
    baseline: 'Normal: < 0.20',
    score: 88,
    status: 'TINGGI',
    rationale: 'Representasi graf struktural akun menempati koordinat berdekatan dengan sindikat mule terkonfirmasi.'
  },
  {
    ref: 'IND-03.2',
    category: 'Topologi GNN',
    param: 'PageRank Hub Rekening Tujuan (dest_pagerank)',
    source: 'Random Forest Feature #16 (GNN Centrality Metric)',
    actualValue: 'PageRank = 0.0482 (Top 1% graf perbankan)',
    baseline: 'Rata-rata: 0.0005',
    score: 72,
    status: 'SEDANG',
    rationale: 'Rekening tujuan bertindak sebagai simpul sentral agregasi penampung dana ilegal.'
  },
  {
    ref: 'IND-03.3',
    category: 'Topologi GNN',
    param: 'Derajat Percabangan Keluar Cepat (sender_out_degree)',
    source: 'Random Forest Feature #12 (Fan-Out Topology Metric)',
    actualValue: 'Out-Degree = 5 tujuan unik dalam 5 menit',
    baseline: 'Normal: 1-2 tujuan / hari',
    score: 94,
    status: 'KRITIS',
    rationale: 'Pola fan-out radial tinggi mengonfirmasi eksekusi skrip otomatisasi pemecahan dana.'
  },
  {
    ref: 'IND-04.1',
    category: 'Konteks Teknikal',
    param: 'Geolokasi & Subnet Proxy Datacenter (Technical Proxy)',
    source: 'Rule Engine Indicator #7 (+20 pts)',
    actualValue: 'IP: 182.16.2.90 (Known Datacenter VPN Subnet)',
    baseline: 'Residential ISP ISP Kuningan',
    score: 90,
    status: 'TINGGI',
    rationale: 'Transaksi diinisiasi melalui jaringan proxy datacenter untuk menyamarkan identitas fisik operator.'
  },
  {
    ref: 'IND-04.2',
    category: 'Konteks Teknikal',
    param: 'Tujuan Akhir Kripto & Purpose Mismatch (ISO 20022)',
    source: 'Random Forest Feature #26 + Rule #8 (+20 pts)',
    actualValue: 'Tujuan: Bursa Kripto (Indodax/Binance) • Kode: GENERAL',
    baseline: 'Kesesuaian kode transaksi devisa/perdagangan',
    score: 85,
    status: 'TINGGI',
    rationale: 'Ketidaksesuaian kode peruntukan transfer dengan entitas penerima bursa aset kripto berisiko tinggi.'
  },
  {
    ref: 'IND-04.3',
    category: 'Konteks Teknikal',
    param: 'Jam Operasional Anomali Nokturnal (hour_of_day)',
    source: 'Random Forest Feature #17 + Rule #4 (+25 pts)',
    actualValue: '02:40 WIB (Jendela Waktu Nokturnal 00:00 - 04:00)',
    baseline: 'Jam kerja normal 08:00 - 20:00 WIB',
    score: 78,
    status: 'SEDANG',
    rationale: 'Eksekusi transaksi di luar jam operasional normal nasabah perbankan umum.'
  }
];

// ============================================================================
// 3. KOMPONEN UTAMA MONITOR GNN FORENSIK PERBANKAN (ENTERPRISE BANKING STYLE)
// ============================================================================

export default function GNNVisualization({ addToast }) {
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('smurfing_crypto');
  const scenario = SCENARIOS[selectedScenarioKey];

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [nodePositions, setNodePositions] = useState({});
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const containerRef = useRef(null);
  const touchStartRef = useRef({ dist: 0, panStart: { x: 0, y: 0 } });

  // Inisialisasi posisi node
  useEffect(() => {
    const initialPos = {};
    scenario.nodes.forEach(node => {
      initialPos[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initialPos);
    setSelectedNode(scenario.nodes[0]);
    setPan({ x: 10, y: 10 });
    setZoom(0.95);
  }, [selectedScenarioKey]);

  // Non-passive wheel event listener untuk mencegah zoom halaman web pada touchpad pinch
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey) {
        const zoomFactor = -e.deltaY * 0.006;
        setZoom(prevZoom => {
          const nextZoom = Math.min(2.5, Math.max(0.45, Number((prevZoom + zoomFactor).toFixed(3))));
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
        setPan(prevPan => ({
          x: prevPan.x - e.deltaX * 0.85,
          y: prevPan.y - e.deltaY * 0.85
        }));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Touch Handlers
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
      setZoom(prev => Math.min(2.5, Math.max(0.45, Number((prev * ratio).toFixed(3)))));
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

  // Drag Node & Pan Canvas
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggedNodeId) {
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

  const handleResetLayout = () => {
    const initialPos = {};
    scenario.nodes.forEach(node => {
      initialPos[node.id] = { x: node.x, y: node.y };
    });
    setNodePositions(initialPos);
    setPan({ x: 10, y: 10 });
    setZoom(0.95);
    if (addToast) addToast('Posisi topologi graf berhasil direset ke tata letak default.', 'info');
  };

  // Filter Node & Edge
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ----------------------------------------------------------------------
          1. INSTITUTIONAL AUDIT HEADER & CONTROLS
      ---------------------------------------------------------------------- */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '14px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        {/* Top Case ID Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#1e293b',
              border: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                  BPR Bank Kuningan — Anti-Money Laundering &amp; Fraud Surveillance System
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: scenario.riskLevel === 'HIGH' ? '#7f1d1d' : '#064e3b',
                  color: scenario.riskLevel === 'HIGH' ? '#fecaca' : '#a7f3d0',
                  border: `1px solid ${scenario.riskLevel === 'HIGH' ? '#b91c1c' : '#059669'}`
                }}>
                  {scenario.caseId}
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                Waktu Audit: <strong style={{ color: '#cbd5e1' }}>{scenario.timestamp}</strong> • Arsitektur APEX: <strong style={{ color: '#38bdf8' }}>Bank bjb (Settlement Hub)</strong>
              </div>
            </div>
          </div>

          {/* Scenario Selector Tabs */}
          <div style={{ display: 'flex', gap: 6, background: '#020617', padding: 3, borderRadius: 8, border: '1px solid #1e293b' }}>
            {Object.keys(SCENARIOS).map(key => {
              const sc = SCENARIOS[key];
              const isSelected = selectedScenarioKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedScenarioKey(key);
                    if (addToast) addToast(`Memuat ${sc.name}`, 'info');
                  }}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 6,
                    border: isSelected ? '1px solid #475569' : '1px solid transparent',
                    background: isSelected ? '#1e293b' : 'transparent',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: sc.riskLevel === 'HIGH' ? '#ef4444' : '#10b981'
                  }} />
                  {key === 'smurfing_crypto' ? 'Kasus 1: Smurfing Kripto' : key === 'mule_ring' ? 'Kasus 2: Mule Ring' : 'Kasus 3: Payroll Normal'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Stage Overview Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #1e293b',
          paddingTop: 10,
          flexWrap: 'wrap',
          gap: 8
        }}>
          {/* Layer Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Filter Lapisan:
            </span>
            {[
              { id: 'all', label: `Semua Entitas (${scenario.nodes.length})` },
              { id: 'crypto', label: '🚨 Jalur Outflow Kripto' },
              { id: 'mule', label: '👥 Jaringan Rekening Mule' },
              { id: 'device', label: '📱 Linkage Perangkat / IP' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '3px 9px',
                  fontSize: '0.7rem',
                  fontWeight: activeFilter === f.id ? 700 : 500,
                  borderRadius: 5,
                  border: activeFilter === f.id ? '1px solid #64748b' : '1px solid #1e293b',
                  background: activeFilter === f.id ? '#334155' : '#020617',
                  color: activeFilter === f.id ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Stepper summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Status Sistem:</span>
            <span style={{
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 4,
              background: scenario.riskLevel === 'HIGH' ? '#dc2626' : '#16a34a',
              color: '#ffffff'
            }}>
              {scenario.decision}
            </span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          2. STAGE STEPPER PIPELINE (SOP INVESTIGASI STANDAR PERBANKAN)
      ---------------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8
      }}>
        {scenario.stages.map((stg) => (
          <div
            key={stg.id}
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderLeft: `3px solid ${stg.id === 4 && scenario.riskLevel === 'HIGH' ? '#dc2626' : '#38bdf8'}`,
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            <div style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.68rem',
              flexShrink: 0
            }}>
              {stg.id}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {stg.title}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {stg.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ----------------------------------------------------------------------
          3. ENTERPRISE CANVAS VIEWPORT (CLEAN TOPOLOGY GRAPH)
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
          height: 560,
          background: '#090d16',
          borderRadius: 12,
          border: '1px solid #1e293b',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}
      >
        {/* Clean Cartesian Dot Grid */}
        <div
          className="canvas-bg"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(#334155 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            pointerEvents: 'none',
            opacity: 0.4
          }}
        />

        {/* ── Compact Institutional Legend (Kiri Atas) ─────────────────────── */}
        <div style={{
          position: 'absolute',
          left: 14,
          top: 14,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '10px 12px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          minWidth: 200,
          pointerEvents: 'auto'
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Klasifikasi Node &amp; Alur Dana
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#0284c7', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 600 }}>Akun Sumber (Originator)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#059669', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 600 }}>Rekening Mule Perantara (L1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#d97706', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 600 }}>Rekening Transit / Escrow (L2)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 700 }}>Bursa Kripto / Cold Wallet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: '#64748b', flexShrink: 0 }} />
              <span style={{ fontSize: '0.68rem', color: '#f8fafc', fontWeight: 600 }}>Shared Device / Subnet IP</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #334155', paddingTop: 6, marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 14, height: 2, background: '#dc2626', flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 700 }}>Outflow Kripto (High Risk)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 14, height: 0, borderTop: '1.5px dotted #94a3b8', flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: '#cbd5e1' }}>Korelasi Perangkat Bersama</span>
            </div>
          </div>
        </div>

        {/* ── Compact Risk Summary Badge (Kanan Atas) ──────────────────────── */}
        <div style={{
          position: 'absolute',
          right: 14,
          top: 14,
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.94)',
          border: `1px solid ${scenario.riskLevel === 'HIGH' ? '#dc2626' : '#16a34a'}`,
          borderRadius: 8,
          padding: '10px 14px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          width: 220,
          pointerEvents: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em' }}>
              SKOR RISIKO HYBRID
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: 3,
              background: scenario.riskLevel === 'HIGH' ? '#7f1d1d' : '#064e3b',
              color: scenario.riskLevel === 'HIGH' ? '#fca5a5' : '#86efac'
            }}>
              {scenario.riskLevel === 'HIGH' ? 'HIGH RISK' : 'LOW RISK'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '2px 0 4px' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: scenario.riskLevel === 'HIGH' ? '#ef4444' : '#10b981', fontFamily: 'monospace' }}>
              {scenario.riskScore}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>/ 100</span>
          </div>

          <div style={{ fontSize: '0.65rem', color: '#cbd5e1', lineHeight: 1.4 }}>
            Klasifikasi: <strong style={{ color: '#f8fafc' }}>{scenario.classification}</strong>
          </div>
        </div>

        {/* ── Floating Zoom Controls (Kanan Bawah) ─────────────────────────── */}
        <div style={{
          position: 'absolute',
          right: 14,
          bottom: 14,
          zIndex: 10,
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 6,
          padding: '3px 5px',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <button
            onClick={() => setZoom(z => Math.max(0.45, Number((z - 0.15).toFixed(2))))}
            title="Zoom Out (-)"
            style={{ padding: 4, height: 24, width: 24, background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
          >
            <ZoomOut size={13} />
          </button>
          
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            title="Reset ke 100%"
            style={{ fontSize: '0.7rem', fontWeight: 800, minWidth: 42, color: '#38bdf8', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            onClick={() => setZoom(z => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
            title="Zoom In (+)"
            style={{ padding: 4, height: 24, width: 24, background: 'transparent', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
          >
            <ZoomIn size={13} />
          </button>

          <span style={{ width: 1, height: 14, background: '#334155', margin: '0 2px' }} />

          <button
            onClick={() => { setZoom(0.85); setPan({ x: 30, y: 15 }); }}
            title="Paskan Layar (Fit View)"
            style={{ padding: 4, height: 24, width: 24, background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer' }}
          >
            <Maximize2 size={13} />
          </button>

          <button
            onClick={handleResetLayout}
            title="Reset Posisi Node"
            style={{ padding: 4, height: 24, width: 24, background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* ── SVG Graph Topology Renderer ──────────────────────────────────── */}
        <svg width="100%" height="100%">
          <defs>
            <marker id="arr-std" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,1 L5,3 L0,5 Z" fill="#64748b" />
            </marker>
            <marker id="arr-crit" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
              <path d="M0,1 L6,3.5 L0,6 Z" fill="#dc2626" />
            </marker>
            <marker id="arr-dev" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
              <path d="M0,1 L4,2.5 L0,4 Z" fill="#94a3b8" />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            
            {/* 1. EDGES */}
            {filteredEdges.map((edge, idx) => {
              const src = nodePositions[edge.from] || { x: 0, y: 0 };
              const tgt = nodePositions[edge.to] || { x: 0, y: 0 };
              const isCrit = edge.type === 'crypto' || edge.risk === 'critical';
              const isDevice = edge.type === 'device';
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const midX = src.x + dx * 0.5;
              const midY = src.y + dy * 0.5;

              return (
                <g key={`edge-${idx}`}>
                  <path
                    d={`M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`}
                    stroke={isCrit ? '#dc2626' : isDevice ? '#64748b' : '#475569'}
                    strokeWidth={isCrit ? 2.5 : isDevice ? 1.2 : 1.6}
                    strokeDasharray={isDevice ? '3 3' : isCrit ? '5 3' : 'none'}
                    fill="none"
                    markerEnd={isCrit ? 'url(#arr-crit)' : isDevice ? 'url(#arr-dev)' : 'url(#arr-std)'}
                  />

                  {/* Transaction Nominal Pill */}
                  {edge.amount > 0 && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-38"
                        y="-8"
                        width="76"
                        height="16"
                        rx="3"
                        fill="#020617"
                        stroke={isCrit ? '#dc2626' : '#334155'}
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fill={isCrit ? '#fca5a5' : '#ffffff'}
                        fontSize="7.5"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {formatCurrency(edge.amount).replace(',00', '')}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* 2. NODES */}
            {filteredNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: node.x, y: node.y };
              const isSelected = selectedNode?.id === node.id;
              const isHigh = node.riskScore >= 80;

              // Warna badge kategori node
              const badgeColor = node.type === 'source' ? '#0284c7' : node.type === 'mule' ? '#059669' : node.type === 'transit' ? '#d97706' : node.type === 'crypto' ? '#dc2626' : '#64748b';

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={() => setSelectedNode(node)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Institutional Node Box Card */}
                  <rect
                    x="-68"
                    y="-22"
                    width="136"
                    height="44"
                    rx="6"
                    fill="#0f172a"
                    stroke={isSelected ? '#38bdf8' : isHigh ? '#b91c1c' : '#334155'}
                    strokeWidth={isSelected ? 2 : 1}
                  />

                  {/* Top Category Tag */}
                  <rect
                    x="-68"
                    y="-22"
                    width="136"
                    height="14"
                    rx="5"
                    fill={badgeColor}
                  />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="800"
                    letterSpacing="0.04em"
                    pointerEvents="none"
                  >
                    {node.code} • {node.type === 'source' ? 'AKUN SUMBER' : node.type === 'mule' ? 'REKENING MULE' : node.type === 'transit' ? 'TRANSIT VA' : node.type === 'crypto' ? 'BURSA KRIPTO' : 'IP INFRA'}
                  </text>

                  {/* Primary Name */}
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="8.5"
                    fontWeight="700"
                    pointerEvents="none"
                  >
                    {node.label.length > 17 ? node.label.substring(0, 15) + '..' : node.label}
                  </text>

                  {/* Secondary Account / Bank */}
                  <text
                    x="0"
                    y="14"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="7"
                    fontFamily="monospace"
                    pointerEvents="none"
                  >
                    {node.bank.substring(0, 14)} • {node.account ? node.account.substring(0, 8) : ''}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ── Touchpad & Mouse Guidance (Bawah Tengah) ─────────────────────── */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 8,
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid #334155',
          borderRadius: 16,
          padding: '5px 14px',
          fontSize: '0.68rem',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          pointerEvents: 'none'
        }}>
          <span>🖐️ Geser Touchpad 2 Jari untuk Pan</span>
          <span>•</span>
          <span>🤏 Pinch 2 Jari untuk Zoom</span>
          <span>•</span>
          <span>🖱️ Klik &amp; Tarik Node untuk Reposisi</span>
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          4. FORENSIC AML ENTITY INSPECTOR (DRAWER DETAIL SAAT NODE DIKLIK)
      ---------------------------------------------------------------------- */}
      {selectedNode && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 12,
          padding: 16
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: selectedNode.riskScore >= 80 ? '#7f1d1d' : '#064e3b',
                border: `1px solid ${selectedNode.riskScore >= 80 ? '#dc2626' : '#059669'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.85rem'
              }}>
                {selectedNode.code}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                    {selectedNode.label}
                  </h3>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#1e293b',
                    color: '#38bdf8',
                    border: '1px solid #334155'
                  }}>
                    {selectedNode.role}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 3 }}>
                  Institusi: <strong style={{ color: '#cbd5e1' }}>{selectedNode.bank}</strong> • No. Rekening: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{selectedNode.account}</strong> • NIK: <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>{selectedNode.nik}</strong>
                </div>
              </div>
            </div>

            {/* Action Buttons for Banking Audit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => {
                  if (addToast) addToast(`Perintah Circuit Breaker: Rekening ${selectedNode.account} (${selectedNode.label}) telah dibekukan otomatis.`, 'warning');
                }}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Lock size={13} /> Eksekusi Blokir Rekening
              </button>
              <button
                onClick={() => {
                  if (addToast) addToast(`Draft Laporan Transaksi Keuangan Mencurigakan (LTKM PPATK) untuk entitas ${selectedNode.account} berhasil diekspor.`, 'info');
                }}
                style={{
                  padding: '7px 12px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  border: '1px solid #334155',
                  background: '#1e293b',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <FileText size={13} /> Export Draft LTKM
              </button>
            </div>
          </div>

          {/* Grid Meta Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10,
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid #1e293b'
          }}>
            <div style={{ background: '#020617', padding: '8px 12px', borderRadius: 6, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>SALDO TERAKHIR</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace', marginTop: 2 }}>
                {formatCurrency(selectedNode.balance)}
              </div>
            </div>
            <div style={{ background: '#020617', padding: '8px 12px', borderRadius: 6, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>PERANGKAT &amp; HARDWARE ID</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', marginTop: 2 }}>
                {selectedNode.deviceId}
              </div>
            </div>
            <div style={{ background: '#020617', padding: '8px 12px', borderRadius: 6, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>ALAMAT IP &amp; SUBNET</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', marginTop: 2 }}>
                {selectedNode.ip}
              </div>
            </div>
            <div style={{ background: '#020617', padding: '8px 12px', borderRadius: 6, border: '1px solid #1e293b' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>INDIKASI AUDIT AML</div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 2 }}>
                {selectedNode.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------------
          5. MATRIKS 15 SUB-INDIKATOR COMPLIANCE (FORMAT AUDIT RESMI OJK / PPATK)
      ---------------------------------------------------------------------- */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: 18
      }}>
        {/* Table Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
              Matriks 15 Sub-Indikator Fraud &amp; AML Compliance
            </h3>
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0' }}>
              Format Verifikasi Pengawasan Satgas Anti-Money Laundering &amp; IASC OJK
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'block' }}>GNN EMBEDDINGS</span>
              <strong style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>88 / 100</strong>
            </div>
            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'block' }}>RANDOM FOREST 29-FITUR</span>
              <strong style={{ fontSize: '0.85rem', color: '#3b82f6', fontFamily: 'monospace' }}>91 / 100</strong>
            </div>
            <div style={{ background: '#020617', border: '1px solid #334155', borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: '#94a3b8', display: 'block' }}>13 RULE ENGINE PPATK</span>
              <strong style={{ fontSize: '0.85rem', color: '#10b981', fontFamily: 'monospace' }}>95 / 100</strong>
            </div>
            <div style={{ background: '#7f1d1d', border: '1px solid #dc2626', borderRadius: 6, padding: '4px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.62rem', color: '#fecaca', display: 'block' }}>HYBRID SCORE</span>
              <strong style={{ fontSize: '0.95rem', color: '#ffffff', fontFamily: 'monospace' }}>92 / 100</strong>
            </div>
          </div>
        </div>

        {/* Tabular Compliance Matrix */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', color: '#f8fafc' }}>
            <thead>
              <tr style={{ background: '#020617', borderBottom: '1px solid #334155' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Kode Ref</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Kategori</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Parameter &amp; Fitur AI</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Nilai Temuan Lapangan</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Baseline Wajar</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', color: '#94a3b8', fontWeight: 700 }}>Tingkat Risiko</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', color: '#94a3b8', fontWeight: 700 }}>Dasar Analisis Audit</th>
              </tr>
            </thead>
            <tbody>
              {AML_REGULATORY_MATRIX.map((row, i) => {
                const isCrit = row.status === 'KRITIS';
                const isHigh = row.status === 'TINGGI';
                return (
                  <tr
                    key={row.ref}
                    style={{
                      borderBottom: '1px solid #1e293b',
                      background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
                      {row.ref}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {row.category}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <strong style={{ color: '#f8fafc', display: 'block' }}>{row.param}</strong>
                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{row.source}</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: isCrit ? '#f87171' : isHigh ? '#fbbf24' : '#f8fafc' }}>
                      {row.actualValue}
                    </td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8' }}>
                      {row.baseline}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 3,
                        background: isCrit ? '#7f1d1d' : isHigh ? '#78350f' : '#1e293b',
                        color: isCrit ? '#fecaca' : isHigh ? '#fde68a' : '#94a3b8',
                        border: `1px solid ${isCrit ? '#dc2626' : isHigh ? '#d97706' : '#334155'}`
                      }}>
                        {row.status} ({row.score})
                      </span>
                    </td>
                    <td style={{ padding: '8px 10px', color: '#94a3b8', lineHeight: 1.4, maxWidth: 280 }}>
                      {row.rationale}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
