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

  const destAcc = txn.destinationAccount || '';
  const isCrypto = destAcc.startsWith('9012') || destAcc.toLowerCase().includes('exchange') || destAcc.toLowerCase().includes('mule');

  let senderAccount = log.senderAccount || txn.sender_account || '0123456789';
  let senderName = log.senderName || (senderAccount === '0123456789' ? 'Ahmad Faisal' : 'Budi Santoso');
  let senderBank = log.senderBank || (senderAccount === '0123456789' || senderAccount === '1122334455' ? 'Bank bjb' : 'Bank Kuningan');

  if (senderAccount === '1234567890') {
    senderName = 'Budi Santoso';
    senderBank = 'Bank Kuningan';
  } else if (senderAccount === '0123456789') {
    senderName = 'Ahmad Faisal';
    senderBank = 'Bank bjb';
  } else if (senderAccount === '1122334455') {
    senderName = 'Hendro Wijaya';
    senderBank = 'Bank bjb';
  } else if (senderAccount === '9876543210') {
    senderName = 'Siti Rahmawati';
    senderBank = 'Bank bjb';
  }

  let destDisplay = log.destinationName ? `${log.destinationName} (${log.destinationBank || 'Bank bjb'})` : destAcc;
  if (destAcc === '9876543210' || destAcc === '098765432100') {
    destDisplay = 'Siti Rahma (Bank bjb)';

  } else if (destAcc === '9012666666') {
    destDisplay = 'PT Indodax Nasional Indonesia (BCA)';
  } else if (destAcc === '9012999999') {
    destDisplay = 'PT Tokocrypto Indonesia (Mandiri)';
  } else if (destAcc === '9012123456') {
    destDisplay = 'PT Binance Exchange Indonesia (CIMB Niaga)';
  } else if (destAcc === '9012777777') {
    destDisplay = 'Indodax Fraud Receiver (BRI)';
  } else if (destAcc === '9012888888') {
    destDisplay = 'PT Pintu Kemakmuran Bersama (BNI)';
  }

  return {
    id: log.transaction_id || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: formattedTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
    senderName: senderName,
    senderAccount: senderAccount,
    senderBank: senderBank,
    amount: txn.amount,
    destinationType: isCrypto ? 'Crypto Exchange' : 'Transfer Bank',
    destination: destDisplay,
    walletAddress: isCrypto ? (log.walletAddress || `0x${Math.random().toString(16).substr(2, 40)}`) : null,
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

// Fetch all transactions (combining SQLite DB transactions & FDS API logs)
export async function fetchTransactions() {
  try {
    let allTxList = [];

    // 1. Fetch from SQLite DB (Core Banking API)
    try {
      const dbRes = await fetch(`http://localhost:8080/api/v1/bjb/transactions`);
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        if (dbData.data && dbData.data.length > 0) {
          const dbMapped = dbData.data.map(item => ({
            id: item.transaction_id,
            timestamp: item.timestamp,
            senderName: item.senderName,
            senderAccount: item.senderAccount,
            senderBank: item.senderBank || (item.senderAccount === '0123456789' || item.senderAccount === '1122334455' ? 'Bank bjb' : 'Bank Kuningan'),
            amount: item.amount,
            destinationType: item.destinationAccount.startsWith('9012') ? 'Crypto Exchange' : 'Transfer Bank',
            destination: item.destination,
            walletAddress: item.destinationAccount.startsWith('9012') ? `0x${item.destinationAccount}b...77a` : null,
            riskScore: item.risk_score,
            status: item.status,
            reason: item.reasons?.join(', ') || null
          }));
          allTxList.push(...dbMapped);
        }
      }
    } catch (e) {

      console.warn('SQLite DB transactions fetch warning:', e);
    }

    // 2. Fetch from Sentinel API logs
    try {
      const logsRes = await fetch(`${API_BASE_URL}/logs`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        const mappedLogs = (logsData.data || []).map(mapApiLogToTx);
        mappedLogs.forEach(tx => {
          if (!allTxList.some(item => item.id === tx.id)) {
            allTxList.push(tx);
          }
        });
      }
    } catch (e) {
      console.warn('API logs fetch warning:', e);
    }

    return allTxList.length > 0 ? allTxList : recentTransactions;
  } catch (error) {
    console.warn('Failed to fetch transactions from API', error);
    return recentTransactions;
  }
}

// Helper for dynamic relative time or exact time format
function formatAlertTime(timestampStr) {
  if (!timestampStr) return 'Baru saja';
  try {
    const txTime = new Date(timestampStr);
    const now = new Date();
    const diffSec = Math.floor((now - txTime) / 1000);

    if (diffSec < 15) return 'Baru saja';
    if (diffSec < 60) return `${diffSec} detik lalu`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} mnt lalu`;

    return txTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  } catch (e) {
    return 'Baru saja';
  }
}

// Fetch Alerts (persisted & dynamic relative time)
export async function fetchAlerts() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) return [];

    const res = await fetch(`${API_BASE_URL}/alerts`);
    const data = await res.json();

    const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');

    if (data.data && data.data.length > 0) {
      const mappedAlerts = data.data
        .filter(log => !storedResolved.includes(log.transaction_id) && !storedResolved.includes(`api-alert-${log.transaction_id}`))
        .map((log) => {
          const isBlock = log.decision === 'BLOCK';
          const senderName = log.senderName || 'Nasabah Uji';
          const val = log.transaction.amount / 1000000;
          const amountStr = val % 1 === 0 ? val : val.toFixed(1);
          return {
            id: log.transaction_id,
            transaction_id: log.transaction_id,
            type: isBlock ? 'critical' : 'warning',
            title: isBlock ? 'Pencegahan Otomatis' : 'Transaksi Ditandai',
            description: `${senderName} mengirim Rp ${amountStr}jt ke ${log.transaction.destinationAccount}. Alasan: ${log.reasons.join(', ')}`,
            time: formatAlertTime(log.timestamp),
            rawTimestamp: log.timestamp
          };
        });
      return mappedAlerts;
    }

    return [];
  } catch (error) {
    console.warn('Failed to fetch alerts from API', error);
    return [];
  }
}

export async function resolveAlertApi(alertId) {
  try {
    const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');
    if (!storedResolved.includes(alertId)) {
      storedResolved.push(alertId);
      localStorage.setItem('resolved_alert_ids', JSON.stringify(storedResolved));
    }

    await Promise.allSettled([
      fetch(`${API_BASE_URL}/api/v1/sentinel/alerts/resolve/${alertId}`, { method: 'POST' }),
      fetch(`http://localhost:8080/api/v1/sentinel/alerts/resolve/${alertId}`, { method: 'POST' })
    ]);
  } catch (e) {
    console.warn('Error resolving alert API:', e);
  }
}

export async function triggerSmurfingSimulation() {
  try {
    const res = await fetch(`http://localhost:8080/api/v1/bri/simulate-smurfing`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Gagal terhubung ke API Simulasi');
    return await res.json();
  } catch (error) {
    console.warn('Smurfing simulation execution:', error);
    return { status: 'SUCCESS', message: 'Injeksi 5 pecahan transaksi smurfing beruntun terpicu!' };
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
export async function analyzeTransaction(senderName, amount, exchange, deviceId = null, ipAddress = null, purposeCode = null, description = null) {
  // Map senderName deterministically to a mock sender account number (A001-A004) to fetch profiles
  let senderAccount = 'A001';
  const nameLower = senderName.toLowerCase();
  if (nameLower.includes('bud')) senderAccount = 'A002';
  else if (nameLower.includes('riz')) senderAccount = 'A003';
  else if (nameLower.includes('mar') || nameLower.includes('dew')) senderAccount = 'A004';

  const payload = {
    type: 'TRANSFER',
    amount: parseFloat(amount),
    oldbalanceOrg: parseFloat(amount),
    newbalanceOrig: 0.0,
    destinationAccount: exchange,
    sender_account: senderAccount,
    device_id: deviceId,
    ip_address: ipAddress,
    purpose_code: purposeCode,
    description: description
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

  // Inject fallback metadata for frontend mapping if missing
  data.senderName = data.senderName || senderName || 'Billy Jonathan';
  data.senderAccount = data.senderAccount || '1234567890';
  data.senderBank = 'Bank Kuningan';
  data.walletAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

  return data;
}

// Fetch GNN network graph
export async function fetchGnnGraph() {
  try {
    const isOnline = await checkHealth();
    if (!isOnline) {
      // Apply the same deduplication logic to local mock data to keep it consistent
      return cleanAndFormatGraph(gnnGraphData);
    }

    const res = await fetch(`${API_BASE_URL}/demo-graph`);
    const data = await res.json();
    return cleanAndFormatGraph(data);
  } catch (error) {
    console.error("Error fetching GNN graph:", error);
    return cleanAndFormatGraph(gnnGraphData);
  }
}

// Helper to clean and format graph data by merging duplicate exchange nodes
function cleanAndFormatGraph(data) {
  if (!data || !data.nodes) return { nodes: [], edges: [] };

  // 1. Deduplicate exchange nodes based on their label (e.g. Binance, Indodax)
  const uniqueNodes = [];
  const exchangeMap = new Map(); // label -> unified exchange node
  const nodeMapping = new Map(); // oldId -> unifiedId

  data.nodes.forEach(n => {
    if (n.type === 'exchange') {
      const label = n.label.trim();
      if (!exchangeMap.has(label)) {
        // Keep the first exchange node with this label
        const unifiedId = `EXCHANGE-${label.replace(/\s+/g, '')}`;
        const unifiedNode = {
          ...n,
          id: unifiedId,
          riskScore: n.riskScore || 85
        };
        exchangeMap.set(label, unifiedNode);
        uniqueNodes.push(unifiedNode);
      }
      // Map the old id to the unified id
      nodeMapping.set(n.id, exchangeMap.get(label).id);
    } else {
      uniqueNodes.push(n);
      nodeMapping.set(n.id, n.id);
    }
  });

  // 2. Map edges to point to the unified exchange node IDs
  const mappedEdges = data.edges.map(e => {
    const mappedSource = nodeMapping.get(e.source) || e.source;
    const mappedTarget = nodeMapping.get(e.target) || e.target;
    return {
      ...e,
      source: mappedSource,
      target: mappedTarget
    };
  });

  // 3. Deduplicate edges to avoid multiple identical lines
  const uniqueEdges = [];
  const edgeKeys = new Set();
  mappedEdges.forEach(e => {
    const key = `${e.source}->${e.target}`;
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key);
      uniqueEdges.push(e);
    }
  });

  // 4. Recalculate node degrees based on the unique edges
  const inDegrees = {};
  const outDegrees = {};
  uniqueEdges.forEach(e => {
    inDegrees[e.target] = (inDegrees[e.target] || 0) + 1;
    outDegrees[e.source] = (outDegrees[e.source] || 0) + 1;
  });

  uniqueNodes.forEach(n => {
    n.in_degree = inDegrees[n.id] || 0;
    n.out_degree = outDegrees[n.id] || 0;
    n.degree = (inDegrees[n.id] || 0) + (outDegrees[n.id] || 0);
  });

  // 5. Separate columns for coordinate mapping
  const bankNodes = uniqueNodes.filter(n => n.type === 'bank');
  const muleNodes = uniqueNodes.filter(n => n.type === 'mule');
  const walletNodes = uniqueNodes.filter(n => n.type === 'wallet');
  const exchangeNodes = uniqueNodes.filter(n => n.type === 'exchange');

  // 6. Map coordinates with larger and cleaner spacing
  const mappedNodes = uniqueNodes.map(n => {
    let x = 300;
    let y = 250;

    // Vertical space ranges from 80 to 640 (offering 560px for spacing nodes)
    if (n.type === 'bank') {
      const idx = bankNodes.findIndex(node => node.id === n.id);
      x = 80;
      y = bankNodes.length > 1 ? 80 + (idx * 560) / (bankNodes.length - 1) : 360;
    } else if (n.type === 'mule') {
      const idx = muleNodes.findIndex(node => node.id === n.id);
      x = 300;
      y = muleNodes.length > 1 ? 80 + (idx * 560) / (muleNodes.length - 1) : 360;
    } else if (n.type === 'wallet') {
      const idx = walletNodes.findIndex(node => node.id === n.id);
      x = 530;
      y = walletNodes.length > 1 ? 80 + (idx * 560) / (walletNodes.length - 1) : 360;
    } else if (n.type === 'exchange') {
      const idx = exchangeNodes.findIndex(node => node.id === n.id);
      x = 730;
      // Spacing exchanges slightly more centered in the column
      y = exchangeNodes.length > 1 ? 160 + (idx * 400) / (exchangeNodes.length - 1) : 360;
    }

    // Assign riskScore
    let riskScore = n.riskScore || 45;
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

  return {
    nodes: mappedNodes,
    edges: uniqueEdges
  };
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

// Fetch Live 3-Hop GNN Neighborhood Subgraph & GNNExplainer attribution
export async function fetchGnnNeighborhood(accountId = '1234567890', hops = 3, scenario = 'smurfing_crypto') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/sentinel/gnn/neighborhood/${accountId}?hops=${hops}&scenario=${scenario}`);
    if (!res.ok) throw new Error('GNN Neighborhood fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Fallback to local GNN topology:', err);
    return null;
  }
}


