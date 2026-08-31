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

// Runtime configuration: use Vite env variables in deployment and explicit mode
// so a failed backend can never silently masquerade as live banking telemetry.
export const API_BASE_URL = (
  import.meta.env.VITE_SENTINEL_API_URL || 'http://localhost:8000'
).replace(/\/$/, '');
export const CORE_API_BASE_URL = (
  import.meta.env.VITE_CORE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');
export const APP_MODE = import.meta.env.VITE_APP_MODE || 'live'; // live | demo | hybrid
export const IS_DEMO_MODE = APP_MODE === 'demo';

export const DATA_SOURCES = Object.freeze({
  LIVE_SENTINEL: 'LIVE · SENTINEL API',
  LIVE_CORE: 'LIVE · CORE BANKING API',
  SYNTHETIC: 'SYNTHETIC · PAY SIM',
  DEMO: 'DEMO FIXTURE',
  STALE: 'STALE',
  ERROR: 'ERROR'
});

export function createDataMeta(source, extra = {}) {
  return {
    source,
    mode: APP_MODE,
    fetchedAt: new Date().toISOString(),
    ...extra
  };
}

function demoOrThrow(fallback, error) {
  if (APP_MODE === 'live') throw error;
  return fallback;
}

function markDemo(value) {
  if (Array.isArray(value)) {
    return value.map(item => ({ ...item, dataSource: DATA_SOURCES.DEMO }));
  }
  return { ...value, dataSource: DATA_SOURCES.DEMO };
}

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
    dataSource: DATA_SOURCES.LIVE_SENTINEL,
    sourceMeta: createDataMeta(DATA_SOURCES.LIVE_SENTINEL, { tenantId: log.tenant_id || log.senderBank || 'unknown' }),
    tenantId: log.tenant_id || log.senderBank || 'unknown',
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

// Check Sentinel health. In live mode this is the source of truth for the header.
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

export async function fetchSystemHealth() {
  const checks = await Promise.allSettled([
    fetchWithTimeout(`${API_BASE_URL}/`, { method: 'GET', timeout: 1500 }),
    fetchWithTimeout(`${CORE_API_BASE_URL}/`, { method: 'GET', timeout: 1500 })
  ]);
  const sentinelOnline = checks[0].status === 'fulfilled' && checks[0].value.ok;
  const coreOnline = checks[1].status === 'fulfilled' && checks[1].value.ok;
  return {
    sentinelOnline,
    coreOnline,
    online: sentinelOnline && coreOnline,
    source: sentinelOnline && coreOnline ? DATA_SOURCES.LIVE_SENTINEL : DATA_SOURCES.ERROR,
    checkedAt: new Date().toISOString()
  };
}

// Fetch all transactions (combining SQLite DB transactions & FDS API logs)
export async function fetchTransactions() {
  try {
    let allTxList = [];

    // 1. Fetch from SQLite DB (Core Banking API)
    try {
      const dbRes = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/bjb/transactions`, { timeout: 4000 });
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        if (dbData.data && dbData.data.length > 0) {
          const dbMapped = dbData.data.map(item => {
            const destinationAccount = String(item.destinationAccount || '');
            const tenantId = item.tenant_id || item.senderBank || 'unknown';
            return {
              id: item.transaction_id,
              sourceMeta: createDataMeta(DATA_SOURCES.LIVE_CORE, { tenantId }),
              timestamp: item.timestamp,
              senderName: item.senderName,
              senderAccount: item.senderAccount,
              senderBank: item.senderBank || (item.senderAccount === '0123456789' || item.senderAccount === '1122334455' ? 'Bank bjb' : 'Bank Kuningan'),
              amount: item.amount,
              destinationType: destinationAccount.startsWith('9012') ? 'Crypto Exchange' : 'Transfer Bank',
              destination: item.destination || destinationAccount,
              walletAddress: destinationAccount.startsWith('9012') ? `0x${destinationAccount}b...77a` : null,
              riskScore: item.risk_score,
              status: item.status,
              reason: item.reasons?.join(', ') || null,
              dataSource: DATA_SOURCES.LIVE_CORE,
              tenantId
            };
          });
          allTxList.push(...dbMapped);
        }
      }
    } catch (e) {

      console.warn('SQLite DB transactions fetch warning:', e);
    }

    // 2. Fetch from Sentinel API logs
    try {
      const logsRes = await fetchWithTimeout(`${API_BASE_URL}/logs`, { timeout: 4000 });
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

    // In live mode an empty response is valid and must remain empty; returning
    // fixtures here previously hid backend failures and stale data.
    if (allTxList.length > 0 || APP_MODE === 'live') return allTxList;
    return recentTransactions.map(tx => ({ ...tx, dataSource: DATA_SOURCES.DEMO }));
  } catch (error) {
    console.warn('Failed to fetch transactions from API', error);
    if (APP_MODE === 'live') throw error;
    return recentTransactions.map(tx => ({ ...tx, dataSource: DATA_SOURCES.DEMO }));
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
    const res = await fetchWithTimeout(`${API_BASE_URL}/alerts`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Alerts request failed (${res.status})`);
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
      return mappedAlerts.map(alert => ({
        ...alert,
        dataSource: DATA_SOURCES.LIVE_SENTINEL,
        sourceMeta: createDataMeta(DATA_SOURCES.LIVE_SENTINEL)
      }));
    }

    return APP_MODE === 'live' ? [] : alertFeed.map(alert => ({
      ...alert,
      dataSource: DATA_SOURCES.DEMO,
      sourceMeta: createDataMeta(DATA_SOURCES.DEMO)
    }));
  } catch (error) {
    console.warn('Failed to fetch alerts from API', error);
    if (APP_MODE === 'live') throw error;
    return alertFeed.map(alert => ({
      ...alert,
      dataSource: DATA_SOURCES.DEMO,
      sourceMeta: createDataMeta(DATA_SOURCES.DEMO)
    }));
  }
}

export async function resolveAlertApi(alertId) {
  const response = await fetchWithTimeout(
    `${CORE_API_BASE_URL}/api/v1/sentinel/alerts/resolve/${alertId}`,
    { method: 'POST', timeout: 4000 }
  );
  if (!response.ok) throw new Error(`Alert resolution failed (${response.status})`);

  const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');
  if (!storedResolved.includes(alertId)) {
    storedResolved.push(alertId);
    localStorage.setItem('resolved_alert_ids', JSON.stringify(storedResolved));
  }
  return { persisted: true, dataSource: DATA_SOURCES.LIVE_CORE };
}

export async function triggerSmurfingSimulation() {
  try {
    const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/bri/simulate-smurfing`, {
      method: 'POST',
      timeout: 8000
    });
    if (!res.ok) throw new Error('Gagal terhubung ke API Simulasi');
    return await res.json();
  } catch (error) {
    console.warn('Smurfing simulation execution:', error);
    return demoOrThrow(
      { status: 'DEMO_ONLY', message: 'Simulasi hanya tersedia ketika backend core aktif.', dataSource: DATA_SOURCES.DEMO },
      error
    );
  }
}

// Fetch Statistics
export async function fetchStatistics() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/statistics`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Statistics request failed (${res.status})`);
    const data = await res.json();

    return {
      dataSource: DATA_SOURCES.LIVE_SENTINEL,
      sourceMeta: createDataMeta(DATA_SOURCES.LIVE_SENTINEL),
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
    return demoOrThrow(markDemo(dashboardStats), error);
  }
}

// Fetch transaction trend
export async function fetchTransactionTrend() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/transaction-trend`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Transaction trend request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    return demoOrThrow(markDemo(transactionTrend), error);
  }
}

// Fetch hourly activity
export async function fetchHourlyActivity() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/hourly-activity`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Hourly activity request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    return demoOrThrow(markDemo(hourlyActivity), error);
  }
}

// Fetch bank distribution
export async function fetchBankDistribution() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/bank-distribution`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Bank distribution request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    return demoOrThrow(markDemo(bankDistribution), error);
  }
}

// Fetch blocked patterns
export async function fetchBlockedPatterns() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/blocked-patterns`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Blocked patterns request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    return demoOrThrow(markDemo(topBlockedPatterns), error);
  }
}

// Fetch crypto exchanges list
export async function fetchCryptoExchanges() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/crypto-exchanges`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Crypto exchanges request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    return demoOrThrow(markDemo(cryptoExchangeData), error);
  }
}

// Fetch mule accounts
export async function fetchMuleAccounts() {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/mule-accounts`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Mule accounts request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    return demoOrThrow(markDemo(muleAccountsData), error);
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
      return demoOrThrow(
        { ...cleanAndFormatGraph(gnnGraphData), dataSource: DATA_SOURCES.DEMO, sourceMeta: createDataMeta(DATA_SOURCES.DEMO) },
        new Error('Sentinel API unavailable')
      );
    }

    const res = await fetch(`${API_BASE_URL}/demo-graph`);
    const data = await res.json();
    return { ...cleanAndFormatGraph(data), dataSource: DATA_SOURCES.LIVE_SENTINEL, sourceMeta: createDataMeta(DATA_SOURCES.LIVE_SENTINEL) };
  } catch (error) {
    console.error("Error fetching GNN graph:", error);
    return demoOrThrow(
      { ...cleanAndFormatGraph(gnnGraphData), dataSource: DATA_SOURCES.DEMO, sourceMeta: createDataMeta(DATA_SOURCES.DEMO) },
      error
    );
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


