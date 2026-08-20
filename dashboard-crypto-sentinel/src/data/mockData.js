// Mock data for CryptoSentinel Dashboard
// Angka fallback ini konsisten dengan dataset PaySim 308.213 transaksi + SMOTE augmentation

export const dashboardStats = {
  totalTransactions: 308213,      // Total baris dataset PaySim + SMOTE aktual
  totalTransactionsChange: 12.5,
  blockedTransactions: 8642,      // Fraud cases dari PaySim full dataset (isFraud=1)
  blockedTransactionsChange: 23.8,
  flaggedTransactions: 14391,     // Estimasi transaksi REVIEW (risk 50-84%)
  flaggedTransactionsChange: -5.2,
  totalValueBlocked: 512800000000, // ~Rp 512.8 Miliar (estimasi nilai fraud terblokir)
  totalValueBlockedChange: 18.3,
};


export const recentTransactions = [
  {
    id: 'TXN-2026-00891',
    timestamp: '2026-05-29 07:45:23',
    senderName: 'Ahmad Faisal',
    senderAccount: '****4521',
    senderBank: 'BCA',
    amount: 750000000,
    destinationType: 'Crypto Exchange',
    destination: 'Binance',
    walletAddress: '0x1a2b3c4d5e6f7890abcdef1234567890abcd1234',
    riskScore: 92,
    status: 'blocked',
    reason: 'Pola transaksi mencurigakan - Structuring',
    flaggedRules: ['Rapid Transaction', 'High Amount', 'New Crypto Wallet'],
  },
  {
    id: 'TXN-2026-00890',
    timestamp: '2026-05-29 07:32:11',
    senderName: 'Budi Santoso',
    senderAccount: '****8734',
    senderBank: 'Mandiri',
    amount: 150000000,
    destinationType: 'Crypto Exchange',
    destination: 'Indodax',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcd5678',
    riskScore: 76,
    status: 'flagged',
    reason: 'Transfer besar ke exchange crypto',
    flaggedRules: ['High Amount', 'First-time Crypto'],
  },
  {
    id: 'TXN-2026-00889',
    timestamp: '2026-05-29 07:28:05',
    senderName: 'Dewi Cahyani',
    senderAccount: '****2198',
    senderBank: 'BNI',
    amount: 25000000,
    destinationType: 'E-Wallet',
    destination: 'OVO',
    walletAddress: null,
    riskScore: 15,
    status: 'approved',
    reason: null,
    flaggedRules: [],
  },
  {
    id: 'TXN-2026-00888',
    timestamp: '2026-05-29 07:15:44',
    senderName: 'Rizky Hidayat',
    senderAccount: '****6543',
    senderBank: 'BRI',
    amount: 500000000,
    destinationType: 'Crypto Exchange',
    destination: 'Tokocrypto',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432',
    riskScore: 88,
    status: 'blocked',
    reason: 'Melebihi batas harian transfer ke crypto',
    flaggedRules: ['Daily Limit Exceeded', 'Rapid Transaction', 'High Amount'],
  },
  {
    id: 'TXN-2026-00887',
    timestamp: '2026-05-29 07:05:12',
    senderName: 'Siti Nurhaliza',
    senderAccount: '****1122',
    senderBank: 'BCA',
    amount: 85000000,
    destinationType: 'Crypto Exchange',
    destination: 'Binance',
    walletAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
    riskScore: 65,
    status: 'flagged',
    reason: 'Transfer ke exchange internasional',
    flaggedRules: ['International Exchange', 'Medium Amount'],
  },
  {
    id: 'TXN-2026-00886',
    timestamp: '2026-05-29 06:55:33',
    senderName: 'Joko Widodo',
    senderAccount: '****3344',
    senderBank: 'Mandiri',
    amount: 10000000,
    destinationType: 'Transfer Bank',
    destination: 'BCA',
    walletAddress: null,
    riskScore: 8,
    status: 'approved',
    reason: null,
    flaggedRules: [],
  },
  {
    id: 'TXN-2026-00885',
    timestamp: '2026-05-29 06:42:18',
    senderName: 'Maria Kusuma',
    senderAccount: '****5566',
    senderBank: 'CIMB',
    amount: 350000000,
    destinationType: 'Crypto Exchange',
    destination: 'Luno',
    walletAddress: '0x1234abcd5678efgh9012ijkl3456mnop7890qrst',
    riskScore: 84,
    status: 'blocked',
    reason: 'Akun baru dengan transaksi besar ke crypto',
    flaggedRules: ['New Account', 'High Amount', 'International Exchange'],
  },
  {
    id: 'TXN-2026-00884',
    timestamp: '2026-05-29 06:30:55',
    senderName: 'Andi Prasetyo',
    senderAccount: '****7788',
    senderBank: 'BCA',
    amount: 200000000,
    destinationType: 'Crypto Exchange',
    destination: 'Pintu',
    walletAddress: '0xabcd1234efgh5678ijkl9012mnop3456qrst7890',
    riskScore: 58,
    status: 'pending',
    reason: 'Menunggu verifikasi manual',
    flaggedRules: ['Medium Amount'],
  },
];

export const alertFeed = [
  {
    id: 1,
    type: 'critical',
    title: 'Structuring Terdeteksi',
    description: 'Nasabah N-8841 (BCA ****4816) melakukan 5 transaksi pecahan ke Binance dalam 1 jam terakhir. Total: Rp 2,5M',
    time: '2 menit lalu',
  },
  {
    id: 2,
    type: 'critical',
    title: 'Batas Harian Terlampaui',
    description: 'Nasabah N-6612 (BNI ****6798) mencoba transfer Rp 500jt ke Tokocrypto, melebihi batas harian Rp 100jt',
    time: '15 menit lalu',
  },
  {
    id: 3,
    type: 'warning',
    title: 'Wallet Baru Terdeteksi',
    description: 'Nasabah N-9012 (BRI ****5878) mengirim ke wallet crypto yang baru dibuat 2 hari lalu',
    time: '28 menit lalu',
  },
  {
    id: 4,
    type: 'warning',
    title: 'Pola Transfer Tidak Biasa',
    description: 'Nasabah N-4412 (CIMB ****4887) mengubah pola transfer dari domestik ke internasional crypto exchange',
    time: '45 menit lalu',
  },
  {
    id: 5,
    type: 'info',
    title: 'Akun Baru dengan Aktivitas Tinggi',
    description: 'Nasabah N-1092 (BCA ****1212) (akun 3 hari) melakukan 8 transaksi besar dalam 24 jam terakhir',
    time: '1 jam lalu',
  },
  {
    id: 6,
    type: 'warning',
    title: 'Transfer Lintas Negara',
    description: 'Transaksi mencurigakan ke exchange yang berlokasi di yurisdiksi non-kooperatif',
    time: '1.5 jam lalu',
  },
];

export const cryptoExchangeData = [
  { name: 'Binance', transactions: 156, amount: 12500000000, percentage: 35, risk: 'high' },
  { name: 'Indodax', transactions: 89, amount: 4200000000, percentage: 22, risk: 'medium' },
  { name: 'Tokocrypto', transactions: 67, amount: 3100000000, percentage: 18, risk: 'medium' },
  { name: 'Pintu', transactions: 45, amount: 1800000000, percentage: 12, risk: 'low' },
  { name: 'Luno', transactions: 32, amount: 2100000000, percentage: 8, risk: 'high' },
  { name: 'Zipmex', transactions: 18, amount: 950000000, percentage: 5, risk: 'low' },
];

export const transactionTrend = [
  { date: '01 May', total: 380, blocked: 12, flagged: 28, approved: 340 },
  { date: '03 May', total: 420, blocked: 18, flagged: 35, approved: 367 },
  { date: '05 May', total: 395, blocked: 8, flagged: 22, approved: 365 },
  { date: '07 May', total: 510, blocked: 25, flagged: 42, approved: 443 },
  { date: '09 May', total: 470, blocked: 15, flagged: 38, approved: 417 },
  { date: '11 May', total: 530, blocked: 22, flagged: 45, approved: 463 },
  { date: '13 May', total: 485, blocked: 19, flagged: 31, approved: 435 },
  { date: '15 May', total: 560, blocked: 28, flagged: 48, approved: 484 },
  { date: '17 May', total: 610, blocked: 35, flagged: 52, approved: 523 },
  { date: '19 May', total: 575, blocked: 21, flagged: 40, approved: 514 },
  { date: '21 May', total: 640, blocked: 32, flagged: 55, approved: 553 },
  { date: '23 May', total: 590, blocked: 24, flagged: 38, approved: 528 },
  { date: '25 May', total: 680, blocked: 38, flagged: 62, approved: 580 },
  { date: '27 May', total: 710, blocked: 42, flagged: 68, approved: 600 },
  { date: '29 May', total: 520, blocked: 30, flagged: 45, approved: 445 },
];

export const riskDistribution = [
  { name: 'Tinggi (>80)', value: 342, color: '#ef4444' },
  { name: 'Sedang (40-80)', value: 549, color: '#f59e0b' },
  { name: 'Rendah (<40)', value: 11956, color: '#10b981' },
];

export const hourlyActivity = [
  { hour: '00', count: 45 },
  { hour: '01', count: 28 },
  { hour: '02', count: 15 },
  { hour: '03', count: 8 },
  { hour: '04', count: 12 },
  { hour: '05', count: 35 },
  { hour: '06', count: 82 },
  { hour: '07', count: 156 },
  { hour: '08', count: 245 },
  { hour: '09', count: 320 },
  { hour: '10', count: 410 },
  { hour: '11', count: 380 },
  { hour: '12', count: 290 },
  { hour: '13', count: 350 },
  { hour: '14', count: 420 },
  { hour: '15', count: 395 },
  { hour: '16', count: 360 },
  { hour: '17', count: 310 },
  { hour: '18', count: 280 },
  { hour: '19', count: 220 },
  { hour: '20', count: 180 },
  { hour: '21', count: 130 },
  { hour: '22', count: 85 },
  { hour: '23', count: 58 },
];

export const topBlockedPatterns = [
  { pattern: 'Structuring (Smurfing)', count: 89, percentage: 26 },
  { pattern: 'Batas Harian Terlampaui', count: 72, percentage: 21 },
  { pattern: 'Transfer ke Wallet Baru', count: 58, percentage: 17 },
  { pattern: 'Exchange Internasional', count: 51, percentage: 15 },
  { pattern: 'Akun Baru + High Volume', count: 42, percentage: 12 },
  { pattern: 'Pola Waktu Tidak Normal', count: 30, percentage: 9 },
];

export const bankDistribution = [
  { bank: 'BCA', total: 3820, blocked: 98, flagged: 245, color: '#3b82f6' },
  { bank: 'Mandiri', total: 3210, blocked: 82, flagged: 198, color: '#f59e0b' },
  { bank: 'BRI', total: 2890, blocked: 67, flagged: 172, color: '#06d6a0' },
  { bank: 'BNI', total: 1650, blocked: 45, flagged: 134, color: '#ec4899' },
  { bank: 'CIMB', total: 890, blocked: 32, flagged: 89, color: '#a855f7' },
  { bank: 'Lainnya', total: 387, blocked: 18, flagged: 53, color: '#64748b' },
];

export const timelineData = [
  {
    type: 'blocked',
    title: 'Transaksi Diblokir - Rp 750jt',
    desc: 'Nasabah N-8841 → Binance | Structuring terdeteksi',
    time: '07:45',
  },
  {
    type: 'flagged',
    title: 'Transaksi Ditandai - Rp 150jt',
    desc: 'Nasabah N-9012 → Indodax | Transfer besar ke exchange',
    time: '07:32',
  },
  {
    type: 'approved',
    title: 'Transaksi Disetujui - Rp 25jt',
    desc: 'Nasabah N-1092 → OVO | Transfer normal',
    time: '07:28',
  },
  {
    type: 'blocked',
    title: 'Transaksi Diblokir - Rp 500jt',
    desc: 'Nasabah N-6612 → Tokocrypto | Batas harian terlampaui',
    time: '07:15',
  },
  {
    type: 'flagged',
    title: 'Transaksi Ditandai - Rp 85jt',
    desc: 'Nasabah N-4412 → Binance | Exchange internasional',
    time: '07:05',
  },
  {
    type: 'blocked',
    title: 'Transaksi Diblokir - Rp 350jt',
    desc: 'Nasabah N-3312 → Luno | Akun baru + High Volume',
    time: '06:42',
  },
  {
    type: 'info',
    title: 'Verifikasi Manual Diperlukan',
    desc: 'Nasabah N-7788 → Pintu | Menunggu analisis',
    time: '06:30',
  },
];

export const weeklyComparison = {
  thisWeek: { total: 4256, blocked: 198, flagged: 412, valueBlocked: 15200000000 },
  lastWeek: { total: 3890, blocked: 162, flagged: 378, valueBlocked: 12800000000 },
};

// ==========================================
// Mule Account Detection Data
// ==========================================
export const muleAccountsData = [
  {
    id: 'MULE-001',
    name: 'Rekening Mule L1-A',
    account: '7820194532',
    bank: 'BCA',
    role: 'Penampung Utama',
    riskScore: 96,
    connectedAccounts: 8,
    totalInflow: 4850000000,
    totalOutflow: 4720000000,
    txCount: 47,
    status: 'frozen',
    detectedDate: '2026-05-22',
    linkedCryptoWallets: ['0x1a2b...cd34', '0x5e6f...gh78']
  },
  {
    id: 'MULE-002',
    name: 'Rekening Mule L1-B',
    account: '3310287654',
    bank: 'Mandiri',
    role: 'Relay',
    riskScore: 89,
    connectedAccounts: 5,
    totalInflow: 2100000000,
    totalOutflow: 2050000000,
    txCount: 32,
    status: 'active',
    detectedDate: '2026-05-25',
    linkedCryptoWallets: ['0x9abc...de12']
  },
  {
    id: 'MULE-003',
    name: 'Rekening Mule L2-A',
    account: '5540198732',
    bank: 'BRI',
    role: 'Kolektor',
    riskScore: 91,
    connectedAccounts: 12,
    totalInflow: 6200000000,
    totalOutflow: 6100000000,
    txCount: 68,
    status: 'frozen',
    detectedDate: '2026-05-20',
    linkedCryptoWallets: ['0x3456...ef78', '0x7890...ab12', '0xbcde...fg34']
  },
  {
    id: 'MULE-004',
    name: 'Rekening Mule L2-B',
    account: '8870654321',
    bank: 'BNI',
    role: 'Relay',
    riskScore: 78,
    connectedAccounts: 4,
    totalInflow: 950000000,
    totalOutflow: 920000000,
    txCount: 19,
    status: 'monitored',
    detectedDate: '2026-05-27',
    linkedCryptoWallets: ['0xcdef...gh56']
  },
  {
    id: 'MULE-005',
    name: 'Rekening Mule L1-C',
    account: '2210987654',
    bank: 'CIMB',
    role: 'Penampung Utama',
    riskScore: 94,
    connectedAccounts: 9,
    totalInflow: 5400000000,
    totalOutflow: 5280000000,
    txCount: 54,
    status: 'active',
    detectedDate: '2026-05-23',
    linkedCryptoWallets: ['0xefgh...ij90', '0xklmn...op12']
  },
  {
    id: 'MULE-006',
    name: 'Rekening Mule L2-C',
    account: '6650321987',
    bank: 'BCA',
    role: 'Kolektor',
    riskScore: 85,
    connectedAccounts: 6,
    totalInflow: 1800000000,
    totalOutflow: 1750000000,
    txCount: 28,
    status: 'monitored',
    detectedDate: '2026-05-26',
    linkedCryptoWallets: ['0xqrst...uv34']
  },
  {
    id: 'MULE-007',
    name: 'Rekening Mule L1-D',
    account: '4430567891',
    bank: 'Mandiri',
    role: 'Relay',
    riskScore: 82,
    connectedAccounts: 3,
    totalInflow: 780000000,
    totalOutflow: 760000000,
    txCount: 15,
    status: 'active',
    detectedDate: '2026-05-28',
    linkedCryptoWallets: ['0xwxyz...ab56']
  }
];

// ==========================================
// GNN Graph Network Data
// ==========================================
export const gnnGraphData = {
  nodes: [
    // Bank accounts (source)
    { id: 'N1', label: 'Rekening Sumber A', type: 'bank', bank: 'BCA', riskScore: 92, x: 65, y: 110 },
    { id: 'N2', label: 'Rekening Sumber B', type: 'bank', bank: 'Mandiri', riskScore: 76, x: 65, y: 230 },
    { id: 'N3', label: 'Rekening Sumber C', type: 'bank', bank: 'BRI', riskScore: 88, x: 65, y: 350 },
    // Mule accounts (intermediary)
    { id: 'N4', label: 'Rekening Mule L1-A', type: 'mule', bank: 'BCA', riskScore: 96, x: 230, y: 70 },
    { id: 'N5', label: 'Rekening Mule L1-B', type: 'mule', bank: 'Mandiri', riskScore: 89, x: 230, y: 180 },
    { id: 'N6', label: 'Rekening Mule L2-A', type: 'mule', bank: 'BRI', riskScore: 91, x: 230, y: 290 },
    { id: 'N7', label: 'Rekening Mule L2-B', type: 'mule', bank: 'CIMB', riskScore: 94, x: 230, y: 400 },
    // Crypto wallets
    { id: 'N8', label: '0x1a2b...cd34', type: 'wallet', riskScore: 88, x: 410, y: 90 },
    { id: 'N9', label: '0x9abc...de12', type: 'wallet', riskScore: 72, x: 410, y: 230 },
    { id: 'N10', label: '0x3456...ef78', type: 'wallet', riskScore: 90, x: 410, y: 370 },
    // Exchanges (destination)
    { id: 'N11', label: 'Binance', type: 'exchange', riskScore: 85, x: 585, y: 160 },
    { id: 'N12', label: 'Indodax', type: 'exchange', riskScore: 45, x: 585, y: 310 },
  ],
  edges: [
    // Source → Mule
    { source: 'N1', target: 'N4', amount: 750000000, riskLevel: 'high', timestamp: '07:45' },
    { source: 'N1', target: 'N5', amount: 250000000, riskLevel: 'high', timestamp: '07:32' },
    { source: 'N2', target: 'N5', amount: 150000000, riskLevel: 'medium', timestamp: '07:28' },
    { source: 'N2', target: 'N6', amount: 200000000, riskLevel: 'medium', timestamp: '07:15' },
    { source: 'N3', target: 'N6', amount: 500000000, riskLevel: 'high', timestamp: '07:05' },
    { source: 'N3', target: 'N7', amount: 350000000, riskLevel: 'high', timestamp: '06:55' },
    // Mule → Wallet
    { source: 'N4', target: 'N8', amount: 720000000, riskLevel: 'high', timestamp: '08:10' },
    { source: 'N5', target: 'N8', amount: 180000000, riskLevel: 'medium', timestamp: '08:22' },
    { source: 'N5', target: 'N9', amount: 210000000, riskLevel: 'medium', timestamp: '08:35' },
    { source: 'N6', target: 'N9', amount: 300000000, riskLevel: 'high', timestamp: '08:48' },
    { source: 'N6', target: 'N10', amount: 380000000, riskLevel: 'high', timestamp: '09:02' },
    { source: 'N7', target: 'N10', amount: 330000000, riskLevel: 'high', timestamp: '09:15' },
    // Wallet → Exchange
    { source: 'N8', target: 'N11', amount: 880000000, riskLevel: 'high', timestamp: '09:30' },
    { source: 'N9', target: 'N11', amount: 490000000, riskLevel: 'medium', timestamp: '09:45' },
    { source: 'N9', target: 'N12', amount: 120000000, riskLevel: 'low', timestamp: '10:00' },
    { source: 'N10', target: 'N12', amount: 690000000, riskLevel: 'high', timestamp: '10:15' },
  ]
};

export const gnnModelMetrics = {
  accuracy: 99.8,
  precision: 99.2,
  recall: 98.6,
  f1Score: 98.9,
  nodesAnalyzed: 12847,
  edgesProcessed: 34521,
  anomaliesDetected: 525,
  embeddingDimension: 128,
  messagePasses: 3,
  trainingEpochs: 100,
  lastUpdated: '2026-07-24 01:00:00'
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'Rp 0';
  if (amount >= 1000000000000) {
    const val = amount / 1000000000000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)}T`;
  }
  if (amount >= 1000000000) {
    const val = amount / 1000000000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)}M`;
  }
  if (amount >= 1000000) {
    const val = amount / 1000000;
    return `Rp ${val % 1 === 0 ? val : val.toFixed(1)}jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatNumber = (num) => {
  return num.toLocaleString('id-ID');
};
