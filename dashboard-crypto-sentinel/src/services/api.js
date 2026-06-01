import {
  recentTransactions,
  alertFeed,
  dashboardStats,
  gnnGraphData,
  transactionTrend,
  hourlyActivity,
  bankDistribution,
  topBlockedPatterns,
  cryptoExchangeData,
  muleAccountsData
} from '../data/mockData';

export const API_BASE_URL = 'http://localhost:8000';

// Simple fetch helper with timeout
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 2500 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Convert API logs to Dashboard transaction format
export function mapApiLogToTx(log) {
  const txn = log.transaction;
  const isBlocked = log.decision === 'BLOCK';
  const isFlagged = log.decision === 'REVIEW';
  const status = isBlocked ? 'blocked' : isFlagged ? 'flagged' : 'approved';

  // Format timestamp to YYYY-MM-DD HH:MM:SS
  let formattedTime = log.timestamp;
  if (formattedTime && formattedTime.includes('T')) {
    formattedTime = formattedTime.replace('T', ' ').substring(0, 19);
  }

  return {
    id: log.transaction_id || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: formattedTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
    senderName: log.senderName || 'Nasabah Uji',
    senderAccount: log.senderAccount || `****${Math.floor(1000 + Math.random() * 9000)}`,
    senderBank: log.senderBank || ['BCA', 'Mandiri', 'BNI', 'BRI'][Math.floor(Math.random() * 4)],
    amount: txn.amount,
    destinationType: 'Crypto Exchange',
    destination: txn.destinationAccount,
    walletAddress: log.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`,
    riskScore: log.risk_score,
    status: status,
    reason: log.reasons && log.reasons.length > 0 ? log.reasons.join(', ') : null,
    flaggedRules: log.reasons || []
  };
}

// Check if the FastAPI server is online
export async function checkHealth() {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/`, { method: 'GET', timeout: 1500 });
    if (response.ok) {
      const data = await response.json();
      return data.status === 'OK';
    }
    return false;
  } catch (e) {
    return false;
  }
}

// Fetch all transactions (combines logs and sample database from API)
export async function fetchTransactions() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return recentTransactions;

    // 1. Fetch custom logs from backend
    const logsRes = await fetch(`${API_BASE_URL}/logs`);
    const logsData = await logsRes.json();

    // 2. Fetch sample transactions from backend
    const txsRes = await fetch(`${API_BASE_URL}/transactions?limit=20`);
    const txsData = await txsRes.json();

    const mappedLogs = (logsData.data || []).map(mapApiLogToTx);

    // Map sample database transactions to dashboard format
    const mappedTxs = (txsData.data || []).map((t, idx) => {
      const isFraud = t.isFraud === 1;
      return {
        id: `TXN-API-${10000 + idx}`,
        timestamp: new Date(Date.now() - idx * 10 * 60000).toISOString().replace('T', ' ').substring(0, 19),
        senderName: `User ${t.nameOrig.substring(0, 7)}`,
        senderAccount: `****${t.nameOrig.substring(t.nameOrig.length - 4)}`,
        senderBank: ['BCA', 'Mandiri', 'BNI', 'BRI'][idx % 4],
        amount: t.amount,
        destinationType: t.type === 'TRANSFER' ? 'Crypto Exchange' : 'Transfer Bank',
        destination: t.nameDest.startsWith('M') ? 'Indodax' : t.nameDest,
        walletAddress: t.type === 'TRANSFER' ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
        riskScore: isFraud ? 95 : Math.floor(Math.random() * 35),
        status: isFraud ? 'blocked' : 'approved',
        reason: isFraud ? 'Indikasi Fraud Keras (Paysim Database)' : null,
        flaggedRules: isFraud ? ['Database Match', 'High Risk Flow'] : []
      };
    });

    // Combine them, logs at the top
    return [...mappedLogs, ...mappedTxs, ...recentTransactions];
  } catch (error) {
    console.warn('Failed to fetch transactions from API, using offline mock data.', error);
    return recentTransactions;
  }
}

// Fetch Alerts
export async function fetchAlerts() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return alertFeed;

    const res = await fetch(`${API_BASE_URL}/alerts`);
    const data = await res.json();

    if (data.data && data.data.length > 0) {
      // Map API alerts to Dashboard alerts format
      const mappedAlerts = data.data.map((log, idx) => {
        const isBlock = log.decision === 'BLOCK';
        const senderName = log.senderName || 'Nasabah Uji';
        const amountStr = (log.transaction.amount / 1000000).toFixed(0);
        return {
          id: `api-alert-${idx}`,
          type: isBlock ? 'critical' : 'warning',
          title: isBlock ? 'Pencegahan Otomatis' : 'Transaksi Ditandai',
          description: `${senderName} mengirim Rp ${amountStr}jt ke ${log.transaction.destinationAccount}. Alasan: ${log.reasons.join(', ')}`,
          time: 'Baru saja'
        };
      });
      return [...mappedAlerts, ...alertFeed];
    }

    return alertFeed;
  } catch (error) {
    console.warn('Failed to fetch alerts from API, using offline mock data.', error);
    return alertFeed;
  }
}

// Fetch Statistics
export async function fetchStatistics() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return dashboardStats;

    const res = await fetch(`${API_BASE_URL}/statistics`);
    const data = await res.json();

    return {
      totalTransactions: data.total_transactions_analyzed,
      totalTransactionsChange: data.total_transactions_change || 12.5,
      blockedTransactions: data.decision_summary?.BLOCK || 0,
      blockedTransactionsChange: data.blocked_transactions_change || 23.8,
      flaggedTransactions: data.decision_summary?.REVIEW || 0,
      flaggedTransactionsChange: data.flagged_transactions_change || -5.2,
      totalValueBlocked: data.total_value_blocked || 0,
      totalValueBlockedChange: data.total_value_blocked_change || 18.3,
    };
  } catch (error) {
    return dashboardStats;
  }
}

// Fetch transaction trend
export async function fetchTransactionTrend() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return transactionTrend;

    const res = await fetch(`${API_BASE_URL}/transaction-trend`);
    return await res.json();
  } catch (error) {
    return transactionTrend;
  }
}

// Fetch hourly activity
export async function fetchHourlyActivity() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return hourlyActivity;

    const res = await fetch(`${API_BASE_URL}/hourly-activity`);
    return await res.json();
  } catch (error) {
    return hourlyActivity;
  }
}

// Fetch bank distribution
export async function fetchBankDistribution() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return bankDistribution;

    const res = await fetch(`${API_BASE_URL}/bank-distribution`);
    return await res.json();
  } catch (error) {
    return bankDistribution;
  }
}

// Fetch blocked patterns
export async function fetchBlockedPatterns() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return topBlockedPatterns;

    const res = await fetch(`${API_BASE_URL}/blocked-patterns`);
    return await res.json();
  } catch (error) {
    return topBlockedPatterns;
  }
}

// Fetch crypto exchanges list
export async function fetchCryptoExchanges() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return cryptoExchangeData;

    const res = await fetch(`${API_BASE_URL}/crypto-exchanges`);
    return await res.json();
  } catch (error) {
    return cryptoExchangeData;
  }
}

// Fetch mule accounts
export async function fetchMuleAccounts() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return muleAccountsData;

    const res = await fetch(`${API_BASE_URL}/mule-accounts`);
    return await res.json();
  } catch (error) {
    return muleAccountsData;
  }
}


// Analyze transaction using rules engine
export async function analyzeTransaction(senderName, amount, exchange) {
  const payload = {
    type: 'TRANSFER',
    amount: parseFloat(amount),
    oldbalanceOrg: parseFloat(amount),
    newbalanceOrig: 0.0,
    destinationAccount: exchange
  };

  const response = await fetch(`${API_BASE_URL}/analyze-transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Gagal menganalisis transaksi di API backend.');
  }

  const data = await response.json();

  // Inject metadata for frontend mapping
  data.senderName = senderName;
  data.senderAccount = `****${Math.floor(1000 + Math.random() * 9000)}`;
  data.senderBank = ['BCA', 'Mandiri', 'BNI', 'BRI'][Math.floor(Math.random() * 4)];
  data.walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

  return data;
}

// Fetch GNN network graph
export async function fetchGnnGraph() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return gnnGraphData;

    const res = await fetch(`${API_BASE_URL}/demo-graph`);
    const data = await res.json();

    // Dynamically calculate coordinates for nodes based on their types
    const bankNodes = data.nodes.filter(n => n.type === 'bank');
    const muleNodes = data.nodes.filter(n => n.type === 'mule');
    const walletNodes = data.nodes.filter(n => n.type === 'wallet');
    const exchangeNodes = data.nodes.filter(n => n.type === 'exchange');

    const mappedNodes = data.nodes.map(n => {
      let x = 300;
      let y = 250;
      
      if (n.type === 'bank') {
        const idx = bankNodes.findIndex(node => node.id === n.id);
        x = 80;
        y = bankNodes.length > 1 ? 80 + (idx * 340) / (bankNodes.length - 1) : 250;
      } else if (n.type === 'mule') {
        const idx = muleNodes.findIndex(node => node.id === n.id);
        x = 300;
        y = muleNodes.length > 1 ? 80 + (idx * 360) / (muleNodes.length - 1) : 250;
      } else if (n.type === 'wallet') {
        const idx = walletNodes.findIndex(node => node.id === n.id);
        x = 530;
        y = walletNodes.length > 1 ? 100 + (idx * 300) / (walletNodes.length - 1) : 250;
      } else if (n.type === 'exchange') {
        const idx = exchangeNodes.findIndex(node => node.id === n.id);
        x = 730;
        y = exchangeNodes.length > 1 ? 170 + (idx * 170) / (exchangeNodes.length - 1) : 250;
      }

      // Assign realistic risk score based on degree and role
      let riskScore = 45;
      if (n.type === 'mule') {
        riskScore = 88 + (n.degree * 2);
      } else if (n.type === 'bank') {
        riskScore = 70 + (n.degree * 4);
      } else if (n.type === 'wallet') {
        riskScore = 72 + (n.degree * 3);
      } else if (n.type === 'exchange') {
        riskScore = n.label === 'Binance' || n.label === 'Indodax' ? 85 : 45;
      }
      riskScore = Math.min(99, Math.max(10, riskScore));

      return {
        id: n.id,
        label: n.label,
        type: n.type,
        riskScore: riskScore,
        degree: n.degree,
        x: x,
        y: y
      };
    });

    // Map backend edges
    const mappedEdges = data.edges.map(e => {
      const sourceNode = mappedNodes.find(n => n.id === e.source);
      const targetNode = mappedNodes.find(n => n.id === e.target);
      const maxRisk = Math.max(sourceNode?.riskScore || 0, targetNode?.riskScore || 0);
      const riskLevel = maxRisk >= 85 ? 'high' : maxRisk >= 75 ? 'medium' : 'low';

      return {
        source: e.source,
        target: e.target,
        amount: e.amount,
        riskLevel: riskLevel,
        scenario: e.scenario
      };
    });

    return {
      nodes: mappedNodes,
      edges: mappedEdges
    };
  } catch (error) {
    console.error("Error fetching GNN graph:", error);
    return gnnGraphData;
  }
}

// Simulate laundering scenario on backend
export async function simulateBackendDemo() {
  const response = await fetch(`${API_BASE_URL}/simulate-demo`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Gagal menjalankan simulasi demo di backend.');
  }
  return await response.json();
}

// GNN Inference - Real analysis from API
export async function gnnInference() {
  try {
    const response = await fetch(`${API_BASE_URL}/gnn-inference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) {
      throw new Error('GNN Inference failed');
    }
    return await response.json();
  } catch (error) {
    console.error('GNN Inference error:', error);
    throw error;
  }
}
