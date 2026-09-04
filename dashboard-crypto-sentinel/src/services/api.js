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
  const txn = log.transaction || {
    amount: log.amount || 0,
    destinationAccount: log.destinationAccount || log.receiver_account || '',
    sender_account: log.senderAccount || log.sender_account || '',
  };
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

  const senderAccount = log.senderAccount || txn.sender_account || '0123456789';
  const senderName = log.senderName || log.sender_name || 'Nasabah Uji';
  const senderBank = log.senderBank || log.sender_bank || 'Bank Kuningan';

  let destDisplay = log.destinationName
    ? `${log.destinationName} (${log.destinationBank || log.destination_bank || 'Bank bjb'})`
    : (log.receiver_name ? `${log.receiver_name} (${log.receiver_bank || 'Bank'})` : destAcc);
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

// Fetch the authoritative CRA profile from Core Banking (NeonDB-backed API).
export async function fetchAccountInfo(accountId) {
  if (!accountId) throw new Error('accountId is required');
  const response = await fetchWithTimeout(
    `${CORE_API_BASE_URL}/api/v1/bri/account/${encodeURIComponent(accountId)}`,
    { timeout: 4000 }
  );
  if (!response.ok) throw new Error(`Account request failed (${response.status})`);
  return response.json();
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

export async function resolveAlertApi(alertId, reason = 'Hasil investigasi manual', actor = 'MLRO', role = 'compliance_officer') {
  const formData = new URLSearchParams();
  formData.append('reason', reason);
  const response = await fetchWithTimeout(
    `${CORE_API_BASE_URL}/api/v1/sentinel/alerts/resolve/${alertId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-User-ID': actor, 'X-User-Role': role },
      body: formData.toString(),
      timeout: 4000
    }
  );
  if (!response.ok) throw new Error(`Alert resolution failed (${response.status})`);

  const storedResolved = JSON.parse(localStorage.getItem('resolved_alert_ids') || '[]');
  if (!storedResolved.includes(alertId)) {
    storedResolved.push(alertId);
    localStorage.setItem('resolved_alert_ids', JSON.stringify(storedResolved));
  }
  return { persisted: true, dataSource: DATA_SOURCES.LIVE_CORE };
}

export async function trigger150AttackSimulation() {
  const response = await fetchWithTimeout(`${API_BASE_URL}/api/v1/sentinel/simulate-attack-150`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  });
  if (!response.ok) {
    throw new Error(`Attack simulation failed (${response.status})`);
  }
  const payload = await response.json();
  const transactions = (payload.transactions || []).map(tx => ({
    ...tx,
    id: tx.id || tx.transaction_id,
    timestamp: tx.timestamp,
    senderName: tx.sender_name,
    senderAccount: tx.sender_account,
    senderBank: tx.sender_bank,
    destination: tx.receiver_name || tx.destinationAccount,
    destinationAccount: tx.destinationAccount,
    destinationBank: tx.receiver_bank,
    destinationType: String(tx.destinationAccount || '').startsWith('9012') ? 'Crypto Exchange' : 'Transfer Bank',
    riskScore: tx.risk_score,
    status: tx.status,
    reason: tx.description,
    flaggedRules: tx.is_fraud ? [tx.metric_name, tx.metric_code] : []
  }));

  const fraudAlerts = transactions
    .filter(tx => tx.is_fraud)
    .map(tx => ({
      id: tx.id,
      transaction_id: tx.id,
      type: tx.decision === 'BLOCK' ? 'critical' : 'warning',
      title: tx.decision === 'BLOCK' ? 'Pencegahan Otomatis' : 'Transaksi Ditandai',
      description: `${tx.senderName} (${tx.senderBank}) mengirim ke ${tx.destination}. Alasan: ${tx.reason}`,
      time: tx.timestamp,
      rawTimestamp: tx.timestamp,
      riskScore: tx.riskScore,
      metricCode: tx.metric_code,
      metricName: tx.metric_name,
      dataSource: DATA_SOURCES.LIVE_SENTINEL,
      sourceMeta: createDataMeta(DATA_SOURCES.LIVE_SENTINEL)
    }));

  return { ...payload, transactions, alerts: fraudAlerts };
}

/**
 * Subscribe to streaming attack simulation via SSE.
 * Transactions arrive one-by-one every 2.5 seconds.
 * @param {Function} onTransaction - Called for each transaction
 * @param {Function} onComplete - Called when stream finishes
 * @param {Function} onError - Called on error
 * @returns {Function} Cleanup function to close the connection
 */
export function subscribeToAttackStream(onTransaction, onComplete, onError) {
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/v1/sentinel/simulate-attack-stream`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'stream-complete') {
        onComplete(data.total);
        eventSource.close();
        return;
      }

      // Map transaction to frontend format
      const tx = {
        ...data,
        id: data.id || data.transaction_id,
        timestamp: data.timestamp,
        senderName: data.sender_name,
        senderAccount: data.sender_account,
        senderBank: data.sender_bank,
        destination: data.receiver_name || data.destinationAccount,
        destinationAccount: data.destinationAccount,
        destinationBank: data.receiver_bank,
        destinationType: String(data.destinationAccount || '').startsWith('9012') ? 'Crypto Exchange' : 'Transfer Bank',
        riskScore: data.risk_score,
        status: data.status,
        reason: data.description,
        flaggedRules: data.is_fraud ? [data.metric_name, data.metric_code] : []
      };

      onTransaction(tx);
    } catch (e) {
      console.error('Failed to parse SSE event:', e);
    }
  };

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  };
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
      totalTransactions: data.total_transactions_analyzed || dashboardStats.totalTransactions || 308250,
      totalTransactionsChange: data.total_transactions_change || 12.5,
      blockedTransactions: data.decision_summary?.BLOCK || dashboardStats.blockedTransactions || 198,
      blockedTransactionsChange: data.blocked_transactions_change || 23.8,
      flaggedTransactions: data.decision_summary?.REVIEW || dashboardStats.flaggedTransactions || 45,
      flaggedTransactionsChange: data.flagged_transactions_change || -5.2,
      totalValueBlocked: data.total_value_blocked || dashboardStats.totalValueBlocked || 15200000000,
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

// ===================================================================
// NEON POSTGRESQL DIRECT API INTEGRATION HELPERS
// ===================================================================

// Fetch all CRA accounts from NeonDB via Core Banking API
export async function fetchAccountsList(limit = 150) {
  try {
    const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/bjb/accounts?limit=${limit}`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Accounts request failed (${res.status})`);
    const data = await res.json();
    return data.map(acc => ({
      ...acc,
      dataSource: DATA_SOURCES.LIVE_CORE,
      sourceMeta: createDataMeta(DATA_SOURCES.LIVE_CORE)
    }));
  } catch (error) {
    console.warn('Failed to fetch accounts list from Neon DB:', error);
    return [];
  }
}

// Fetch ledger transactions for a specific account from NeonDB
export async function fetchAccountTransactions(accountId) {
  if (!accountId) return [];
  try {
    const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/bri/transactions/${encodeURIComponent(accountId)}`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Account txs request failed (${res.status})`);
    const data = await res.json();
    return (data || []).map(tx => ({
      ...tx,
      dataSource: DATA_SOURCES.LIVE_CORE
    }));
  } catch (error) {
    console.warn(`Failed to fetch transactions for account ${accountId} from Neon DB:`, error);
    return [];
  }
}

// Fetch Immutable Audit Trail logs from NeonDB
export async function logPiiUnmask({ accountId, reason, actor = 'Unknown_User', role = 'unknown' }) {
  const formData = new URLSearchParams();
  formData.append('action', 'PII_UNMASK');
  formData.append('target_id', accountId);
  formData.append('reason', reason);
  const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/audit-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-User-ID': actor,
      'X-User-Role': role
    },
    body: formData.toString(),
    timeout: 4000
  });
  if (!res.ok) throw new Error(`PII audit request failed (${res.status})`);
  return await res.json();
}

export async function fetchAuditLogs(limit = 50) {
  try {
    const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/audit-logs?limit=${limit}`, { timeout: 4000 });
    if (!res.ok) throw new Error(`Audit logs request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch audit logs from Neon DB:', error);
    return [];
  }
}

// Fetch Cases from Case Management System (NeonDB)
export async function createCaseApi({ caseId, alertId, transactionId, accountId, priority = 'HIGH', note = '', graphSnapshot = {}, actor = 'Analyst', role = 'analyst', tenantId = 'all' }) {
  const formData = new URLSearchParams();
  formData.append('case_id', caseId);
  formData.append('alert_id', alertId || '');
  formData.append('transaction_id', transactionId);
  formData.append('account_id', accountId);
  formData.append('priority', priority);
  formData.append('note', note);
  formData.append('graph_snapshot', JSON.stringify({ ...graphSnapshot, tenantId }));

  const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/cases/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-User-ID': actor,
      'X-User-Role': role
    },
    body: formData.toString(),
    timeout: 4000
  });
  if (!res.ok) throw new Error(`Create case request failed (${res.status})`);
  return res.json();
}

export async function generateInvestigationLtkm({ caseId = null, transactionId, senderAccount, destinationAccount, amount = 0, riskScore = 0, reasons = [], senderName = 'Nasabah Terlapor', destinationName = 'Rekening Penerima / Bursa Kripto', bankName = 'PT BPR KUNINGAN (PERSERODA)', complianceOfficer = 'Pejabat Kepatuhan & APU-PPT', graphSnapshot = {}, masked = true, actor = 'Unknown_User', role = 'analyst' }) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/str/generate-investigation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-User-ID': actor, 'X-User-Role': role },
    body: JSON.stringify({ case_id: caseId, transaction_id: transactionId, sender_account: senderAccount, destination_account: destinationAccount, amount, risk_score: riskScore, reasons, sender_name: senderName, destination_name: destinationName, bank_name: bankName, compliance_officer: complianceOfficer, graph_snapshot: graphSnapshot, masked }),
    timeout: 6000
  });
  if (!response.ok) throw new Error(`LTKM generation failed (${response.status})`);
  return response.json();
}

export async function exportMaskedEvidence(reportOrTxId) {
  const response = await fetchWithTimeout(`${API_BASE_URL}/str/evidence/export/${encodeURIComponent(reportOrTxId)}`, { timeout: 6000 });
  if (!response.ok) throw new Error(`Masked evidence export failed (${response.status})`);
  const payload = await response.json();
  return `<html><body><h2>Masked Evidence Export — ${payload.report_id}</h2><p>Case: ${payload.case_id || 'N/A'} · Transaction: ${payload.transaction_id}</p><p>Privacy: ${payload.privacy}</p><pre>${JSON.stringify(payload.evidence, null, 2)}</pre></body></html>`;
}

export async function fetchCases(status = null, limit = 50) {
  try {
    const url = status
      ? `${CORE_API_BASE_URL}/api/v1/cases?status=${encodeURIComponent(status)}&limit=${limit}`
      : `${CORE_API_BASE_URL}/api/v1/cases?limit=${limit}`;
    const res = await fetchWithTimeout(url, { timeout: 4000 });
    if (!res.ok) throw new Error(`Cases request failed (${res.status})`);
    return await res.json();
  } catch (error) {
    console.warn('Failed to fetch cases from Neon DB:', error);
    return [];
  }
}

// Update Case Status & Lifecycle in NeonDB
export async function updateCaseStatusApi({ caseId, newStatus, note, actor = 'Analyst', role = 'compliance_officer' }) {
  const formData = new URLSearchParams();
  formData.append('case_id', caseId);
  formData.append('new_status', newStatus);
  formData.append('note', note || `Status updated to ${newStatus}`);

  const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/cases/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-User-ID': actor,
      'X-User-Role': role
    },
    body: formData.toString(),
    timeout: 4000
  });
  if (!res.ok) throw new Error(`Update case request failed (${res.status})`);
  return await res.json();
}

// Block Account in NeonDB (Upstream Circuit Breaker with Audit Log)
export async function blockAccountInNeon(accountId, reason = 'Disuspek terafiliasi Mule / Fraud', actor = 'MLRO', role = 'compliance_officer') {
  const formData = new URLSearchParams();
  formData.append('reason', reason);

  const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/bri/account/block/${encodeURIComponent(accountId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-User-ID': actor,
      'X-User-Role': role
    },
    body: formData.toString(),
    timeout: 4000
  });
  if (!res.ok) throw new Error(`Block account request failed (${res.status})`);
  return await res.json();
}

// Regulatory Watchlists API
export async function fetchRegulatoryWatchlists(category = 'all') {
  try {
    const url = `${CORE_API_BASE_URL}/api/v1/regulatory-watchlists?category=${category}`;
    const res = await fetchWithTimeout(url, { timeout: 4000 });
    if (!res.ok) throw new Error(`Watchlists request failed (${res.status})`);
    const data = await res.json();
    return { data, dataSource: DATA_SOURCES.LIVE_CORE, sourceMeta: createDataMeta(DATA_SOURCES.LIVE_CORE) };
  } catch (error) {
    return demoOrThrow({ data: [], dataSource: DATA_SOURCES.DEMO, sourceMeta: createDataMeta(DATA_SOURCES.DEMO) }, error);
  }
}

// Device Telemetry API
export async function fetchDeviceTelemetry(accountId) {
  try {
    const url = `${CORE_API_BASE_URL}/api/v1/device-telemetry/${encodeURIComponent(accountId)}`;
    const res = await fetchWithTimeout(url, { timeout: 4000 });
    if (!res.ok) throw new Error(`Device telemetry request failed (${res.status})`);
    const data = await res.json();
    return { data, dataSource: DATA_SOURCES.LIVE_CORE };
  } catch (error) {
    return demoOrThrow({
      data: {
        account_id: accountId,
        device_fingerprint: "FP-DEV-IPHONE15-PRO-MAX",
        device_model: "iPhone 15 Pro Max",
        os_version: "iOS 17.5.1",
        ip_address: "182.16.2.89",
        isp_provider: "Telkomsel Mobile",
        is_rooted_jailbroken: false,
        is_mock_location_active: false,
        is_vpn_proxy: false,
        associated_accounts_count: 1
      },
      dataSource: DATA_SOURCES.DEMO
    }, error);
  }
}

// Mule Graph Communities API
export async function fetchMuleCommunities() {
  try {
    const url = `${CORE_API_BASE_URL}/api/v1/mule-communities`;
    const res = await fetchWithTimeout(url, { timeout: 4000 });
    if (!res.ok) throw new Error(`Mule communities request failed (${res.status})`);
    const data = await res.json();
    return { data, dataSource: DATA_SOURCES.LIVE_CORE, sourceMeta: createDataMeta(DATA_SOURCES.LIVE_CORE) };
  } catch (error) {
    return demoOrThrow({ data: [], dataSource: DATA_SOURCES.DEMO, sourceMeta: createDataMeta(DATA_SOURCES.DEMO) }, error);
  }
}

// APOLO Regulatory Filings API
export async function fetchApoloFilings() {
  try {
    const url = `${CORE_API_BASE_URL}/api/v1/apolo-filings`;
    const res = await fetchWithTimeout(url, { timeout: 4000 });
    if (!res.ok) throw new Error(`Apolo filings request failed (${res.status})`);
    const data = await res.json();
    return { data, dataSource: DATA_SOURCES.LIVE_CORE, sourceMeta: createDataMeta(DATA_SOURCES.LIVE_CORE) };
  } catch (error) {
    return demoOrThrow({ data: [], dataSource: DATA_SOURCES.DEMO, sourceMeta: createDataMeta(DATA_SOURCES.DEMO) }, error);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// LIVE GNN SUBGRAPH — Real transaction-based graph from backend transaction_logs
// ──────────────────────────────────────────────────────────────────────────────
/**
 * Fetch a real GNN subgraph for an account from the live backend.
 * The backend builds the graph from in-memory `transaction_logs` (real FDS analyzed txs).
 *
 * @param {string} accountId - The account/entity to investigate
 * @returns {{ isLive: boolean, scenario: object|null, graphStats: object }}
 *   - isLive: true if real data found, false means backend has no data for this account
 *   - scenario: GNNVisualization-compatible scenario object (nodes, edges, summary, etc.)
 *   - graphStats: metadata (total nodes, edges, mule count, etc.)
 */
export async function fetchLiveGNNSubgraph(accountId) {
  if (!accountId) return { isLive: false, scenario: null, graphStats: {} };

  try {
    const url = `${API_BASE_URL}/api/v1/sentinel/gnn/live-subgraph/${encodeURIComponent(accountId)}`;
    const res = await fetchWithTimeout(url, { timeout: 8000 });
    if (!res.ok) throw new Error(`GNN live subgraph failed (${res.status})`);

    const data = await res.json();

    // Backend returned no data for this account
    if (!data.is_live || !data.nodes || data.nodes.length === 0) {
      return {
        isLive: false,
        scenario: null,
        message: data.message || 'Belum ada transaksi live untuk akun ini.',
        graphStats: {},
      };
    }

    // Normalize into GNNVisualization scenario shape
    const scenario = {
      id: `live_${accountId}`,
      name: `Investigasi Live: ${data.account_id}`,
      riskScore: data.riskScore || 0,
      riskLevel: data.riskLevel || 'LOW',
      classification: data.classification || 'LIVE INVESTIGATION',
      summary: data.summary || '',
      isLive: true,
      metrics: {
        criminalActivities: data.riskScore || 0,
        familiarBehavior: Math.max(0, 100 - (data.riskScore || 0)),
        suspiciousPatterns: Math.min(99, (data.riskScore || 0) + 5),
        historicalData: 45,
        pageRank: String(data.graph_stats?.pagerank_score || '0.000000'),
        betweenness: `${data.graph_stats?.mule_accounts || 0} Mule Connections`,
        communityId: `LIVE-${accountId.slice(-6).toUpperCase()}`,
        hopDistance: `${data.graph_stats?.total_edges || 0} Edge Hops`,
      },
      stages: [
        { id: 'stage1', title: '1. AKUN SUMBER', subtitle: 'Terlapor', color: '#38bdf8' },
        { id: 'stage2', title: '2. PERANTARA', subtitle: 'Mule / Transit', color: '#f59e0b' },
        { id: 'stage3', title: '3. TUJUAN', subtitle: 'Bursa Kripto', color: '#ef4444' },
      ],
      // Nodes & edges come directly from backend (already in compatible format)
      nodes: (data.nodes || []).map(n => ({
        ...n,
        // Ensure required fields exist
        riskLevel: n.riskLevel || (n.riskScore >= 75 ? 'high' : n.riskScore >= 50 ? 'medium' : 'low'),
        role: n.role || 'Rekening Terkait',
        ip: n.ip || '—',
        deviceId: n.deviceId || '—',
        nik: n.nik || '—',
        description: n.description || `Akun ${n.account} (${n.bank})`,
        _live: true,
      })),
      edges: (data.edges || []).map(e => ({
        ...e,
        _live: true,
      })),
      temporal_timeline: data.temporal_timeline || [],
      top_reasons: data.top_reasons || [],
    };

    return {
      isLive: true,
      scenario,
      graphStats: data.graph_stats || {},
      totalAnalyzed: data.total_transactions_analyzed || 0,
    };

  } catch (err) {
    console.warn('[GNN Live Subgraph] Error fetching live data:', err.message);
    return { isLive: false, scenario: null, graphStats: {}, error: err.message };
  }
}

// ===================================================================
// ACCOUNT CRUD — UPDATE / CREATE / DELETE (Customer 360 CRUD)
// ===================================================================

/**
 * Update an account's fields in the Core Banking DB.
 * Only non-null fields in `fields` are sent (PATCH-like semantics via PUT).
 */
export async function updateAccountInDb(accountId, fields = {}, actor = 'Analyst', role = 'compliance_officer') {
  const formData = new URLSearchParams();
  const EDITABLE = [
    'owner_name', 'national_id', 'balance', 'risk_profile', 'risk_score',
    'occupation', 'monthly_income', 'registered_device', 'registered_ip',
    'pep_status', 'cdd_edd_status', 'is_active', 'is_blocked'
  ];
  EDITABLE.forEach(key => {
    if (fields[key] !== undefined && fields[key] !== null) {
      formData.append(key, String(fields[key]));
    }
  });

  const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/accounts/${encodeURIComponent(accountId)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-User-ID': actor,
      'X-User-Role': role,
    },
    body: formData.toString(),
    timeout: 5000,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Update account failed (${res.status})`);
  }
  return res.json();
}

/**
 * Create a new account in the Core Banking DB.
 */
export async function createAccountInDb(fields = {}, actor = 'Analyst', role = 'compliance_officer') {
  const formData = new URLSearchParams();
  const REQUIRED = ['account_id', 'national_id', 'owner_name'];
  REQUIRED.forEach(key => {
    if (!fields[key]) throw new Error(`Field wajib tidak boleh kosong: ${key}`);
    formData.append(key, String(fields[key]));
  });
  const OPTIONAL = [
    'balance', 'risk_profile', 'occupation', 'monthly_income',
    'registered_device', 'registered_ip', 'pep_status', 'cdd_edd_status'
  ];
  OPTIONAL.forEach(key => {
    if (fields[key] !== undefined && fields[key] !== null) {
      formData.append(key, String(fields[key]));
    }
  });

  const res = await fetchWithTimeout(`${CORE_API_BASE_URL}/api/v1/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-User-ID': actor,
      'X-User-Role': role,
    },
    body: formData.toString(),
    timeout: 5000,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Create account failed (${res.status})`);
  }
  return res.json();
}

/**
 * Delete an account from the Core Banking DB.
 * Protected accounts (seed accounts) cannot be deleted.
 */
export async function deleteAccountInDb(accountId, reason = 'Permintaan penghapusan akun', actor = 'Admin_User', role = 'admin_regulator') {
  const res = await fetchWithTimeout(
    `${CORE_API_BASE_URL}/api/v1/accounts/${encodeURIComponent(accountId)}?reason=${encodeURIComponent(reason)}`,
    {
      method: 'DELETE',
      headers: {
        'X-User-ID': actor,
        'X-User-Role': role,
      },
      timeout: 5000,
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }));
    throw new Error(err.detail || `Delete account failed (${res.status})`);
  }
  return res.json();
}
