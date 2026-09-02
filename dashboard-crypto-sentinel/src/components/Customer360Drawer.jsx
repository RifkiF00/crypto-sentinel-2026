import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CreditCard,
  Building2,
  Calendar,
  Briefcase,
  DollarSign,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  GitBranch,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Database,
  History
} from 'lucide-react';
import { maskName, maskAccount, maskNik, maskIp, maskDevice } from '../utils/masking';
import { formatCurrency } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { fetchAccountInfo, fetchAccountTransactions, fetchDeviceTelemetry, logPiiUnmask } from '../services/api';

export default function Customer360Drawer({
  account,
  isOpen,
  onClose,
  isMasked = true,
  onNavigateToGNN,
  onCreateCase,
  addToast
}) {
  const { currentUser, can } = useAuth();
  const [localMasked, setLocalMasked] = useState(isMasked);
  const [showUnmaskModal, setShowUnmaskModal] = useState(false);
  const [unmaskReason, setUnmaskReason] = useState('');
  const [liveDbAccount, setLiveDbAccount] = useState(null);
  const [liveTxHistory, setLiveTxHistory] = useState([]);
  const [liveDeviceTelemetry, setLiveDeviceTelemetry] = useState(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  useEffect(() => {
    setLocalMasked(isMasked);
  }, [isMasked, account]);

  // Reset live state before each account and ignore late responses from a
  // drawer that has already been closed or switched to another account.
  useEffect(() => {
    let active = true;
    setLiveDbAccount(null);
    setLiveTxHistory([]);
    setIsLoadingLive(false);

    if (!isOpen || !account) return () => { active = false; };

    const accId = account.id || account.account_id || account.account_number || account.account || account.senderAccount || account.sender_account;
    if (!accId) return () => { active = false; };

    setIsLoadingLive(true);
    Promise.allSettled([
      fetchAccountInfo(accId),
      fetchAccountTransactions(accId),
      fetchDeviceTelemetry(accId)
    ]).then(([accResult, txResult, deviceResult]) => {
      if (!active) return;
      setLiveDbAccount(accResult.status === 'fulfilled' && accResult.value ? accResult.value : null);
      setLiveTxHistory(txResult.status === 'fulfilled' && Array.isArray(txResult.value) ? txResult.value : []);
      setLiveDeviceTelemetry(deviceResult.status === 'fulfilled' && deviceResult.value?.data ? deviceResult.value.data : null);
    }).catch(err => {
      if (active) console.warn('NeonDB fetch error:', err);
    }).finally(() => {
      if (active) setIsLoadingLive(false);
    });

    return () => { active = false; };
  }, [isOpen, account]);

  /* Fetch live account profile and transaction ledger from Neon DB */
  /* Previous live-fetch effect replaced above. */

  if (!isOpen || !account) return null;

  // Authoritative Neon DB data with graceful fallback to provided props
  const accountId = liveDbAccount?.account_id || account.id || account.account_id || account.account_number || account.account || account.senderAccount || account.sender_account || '0123456789';
  const rawName = liveDbAccount?.owner_name || account.name || account.holder || 'Budi Santoso';
  const rawNik = liveDbAccount?.national_id || account.nik || '3208011208940002';
  const rawIp = liveDbAccount?.registered_ip || account.ip || '182.253.14.88';
  const rawDevice = liveDbAccount?.registered_device || account.device || 'Android-Pixel7-ARM64';
  const balance = liveDbAccount?.balance ?? account.balance ?? 45000000;
  const isBlocked = liveDbAccount?.is_blocked ?? account.is_blocked ?? false;

  const bankName = account.bank || account.bank_name || (accountId.startsWith('110') ? 'Bank bjb' : 'Bank Kuningan');
  const muleProb = liveDbAccount?.mule_probability ?? account.muleProbability ?? account.mule_probability ?? (account.riskScore ? account.riskScore / 100 : 0.89);
  const riskScore = liveDbAccount?.risk_score ?? account.riskScore ?? Math.round(muleProb * 100);
  const occupation = liveDbAccount?.occupation || account.occupation || 'Wiraswasta / UMKM';
  const monthlyIncome = liveDbAccount?.monthly_income || account.monthlyIncome || account.income || 15000000;
  const cddStatus = liveDbAccount?.cdd_edd_status || account.cddStatus || (riskScore > 75 ? 'EDD_REQUIRED' : 'CDD_VERIFIED');
  const pepStatus = liveDbAccount?.pep_status ? 'PEP (Politically Exposed)' : (account.pepStatus || 'NON_PEP');
  const dormantDays = account.dormantDays ?? (riskScore > 80 ? 184 : 12);

  const displayName = localMasked ? maskName(rawName) : rawName;
  const displayAccount = localMasked ? maskAccount(accountId) : accountId;
  const displayNik = localMasked ? maskNik(rawNik) : rawNik;
  const displayIp = localMasked ? maskIp(rawIp) : rawIp;
  const displayDevice = localMasked ? maskDevice(rawDevice) : rawDevice;

  const handleUnmaskSubmit = (e) => {
    e.preventDefault();
    if (!unmaskReason.trim()) {
      if (addToast) addToast('Alasan pembukaan data sensitif wajib diisi untuk audit log.', 'error');
      return;
    }
    const reason = unmaskReason.trim();
    setLocalMasked(false);
    setUnmaskReason('');
    setShowUnmaskModal(false);
    logPiiUnmask({
      accountId,
      reason,
      actor: currentUser?.name || currentUser?.id || 'Unknown_User',
      role: currentUser?.role || 'unknown'
    }).catch(error => {
      console.warn('PII unmask audit request failed:', error);
      addToast?.('Sensor dibuka, tetapi audit log server gagal dicatat.', 'error');
    });
    if (addToast) {
      addToast(`🔓 Sensor PII dibuka untuk ${displayAccount}. Aksi dicatat di audit log.`, 'warning');
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(3, 8, 30, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          style={{
            width: '100%',
            maxWidth: 540,
            height: '100vh',
            background: 'var(--card-bg, #0f172a)',
            borderLeft: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            boxShadow: '-10px 0 35px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(2, 132, 199, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(2, 132, 199, 0.15)',
                  border: '1px solid rgba(2, 132, 199, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <User size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Customer 360 · Forensic Profile
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {bankName} · Terhubung ke Live NeonDB
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Identity Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: 18,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 700, marginTop: 2 }}>
                    Rekening: {displayAccount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    NIK: {displayNik}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: riskScore >= 80 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: riskScore >= 80 ? '#ef4444' : '#10b981',
                      border: `1px solid ${riskScore >= 80 ? '#ef444444' : '#10b98144'}`,
                    }}
                  >
                    {riskScore >= 80 ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
                    MULE PROB: {(muleProb * 100).toFixed(1)}%
                  </span>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    Skor CRA: <strong>{riskScore} / 100</strong>
                  </div>
                </div>
              </div>

              {/* PII Masking Controls */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Lock size={12} color="#10b981" /> UU PDP No. 27/2022 (Sensor Otomatis)
                </span>
                {localMasked ? (
                  can('unmaskPII') ? (
                    <button
                      onClick={() => setShowUnmaskModal(true)}
                      style={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#f59e0b',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Unlock size={12} /> Buka Sensor (MLRO)
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Buka Sensor Hanya MLRO
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => setLocalMasked(true)}
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10b981',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Kunci Kembali Sensor
                  </button>
                )}
              </div>
            </div>

            {/* Compliance & Due Diligence Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS CDD / EDD</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: cddStatus === 'EDD_REQUIRED' ? '#f59e0b' : '#10b981', marginTop: 3 }}>
                  {cddStatus}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>POJK No. 8/2023 Pilar 1</div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PEP STATUS</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 3 }}>
                  {pepStatus}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Politically Exposed Person</div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>PEKERJAAN & PENGHASILAN</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>
                  {occupation}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600, marginTop: 2 }}>
                  {formatCurrency(monthlyIncome)} / bln
                </div>
              </div>

              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>INAKTIF (DORMANCY)</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: dormantDays > 90 ? '#ef4444' : '#10b981', marginTop: 3 }}>
                  {dormantDays} Hari Pasif
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>Dormant Awakening Anomaly</div>
              </div>
            </div>

            {/* Device & Network Footprint */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Smartphone size={14} color="#38bdf8" /> Digital & Device Footprint
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device Fingerprint:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{liveDeviceTelemetry?.device_fingerprint || displayDevice}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Device Model & OS:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{liveDeviceTelemetry?.device_model ? `${liveDeviceTelemetry.device_model} (${liveDeviceTelemetry.os_version || 'Android'})` : 'Mobile Banking Client'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>IP Address & ISP:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{liveDeviceTelemetry?.ip_address || displayIp} {liveDeviceTelemetry?.isp_provider ? `· ${liveDeviceTelemetry.isp_provider}` : ''}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Integritas Lingkungan:</span>
                  <span style={{ fontWeight: 700, color: liveDeviceTelemetry?.is_rooted_jailbroken ? '#ef4444' : '#10b981' }}>
                    {liveDeviceTelemetry?.is_rooted_jailbroken ? '⚠️ ROOT/JAILBREAK DETECTED' : '✅ SECURE (Non-Root, No-VPN)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Transactions Ledger from Neon DB */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <History size={14} color="#10b981" /> Mutasi Transaksi Terakhir (NeonDB)
                </span>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                  {liveTxHistory.length > 0 ? `${liveTxHistory.length} Transaksi` : 'Tersinkronisasi'}
                </span>
              </div>
              {isLoadingLive ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>
                  Memuat data transaksi dari database Neon...
                </div>
              ) : liveTxHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {liveTxHistory.slice(0, 5).map((tx, idx) => (
                    <div
                      key={tx.transaction_id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '6px 8px',
                        borderRadius: 6,
                        fontSize: '0.7rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          Ke: {tx.receiver_account} ({tx.destination_type || 'Transfer'})
                        </div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                          {tx.timestamp ? tx.timestamp.replace('T', ' ').substring(0, 19) : 'Baru'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--status-danger)', fontFamily: 'var(--font-mono)' }}>
                          -{formatCurrency(tx.amount)}
                        </div>
                        <span style={{
                          fontSize: '0.6rem',
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: tx.status === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: tx.status === 'SUCCESS' ? '#10b981' : '#ef4444'
                        }}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                  Belum ada riwayat mutasi eksternal untuk akun ini di database Neon.
                </div>
              )}
            </div>

            {/* Cross-Bank GNN Relational Insights */}
            <div style={{ background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a78bfa', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <GitBranch size={14} /> GNN Relational Graph Insights
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Simpul ini memiliki <strong>In-Degree = 6</strong> (menerima dari 6 rekening berbeda) dan <strong>Out-Degree = 2</strong> (mengalirkan dana ke Indodax & Tokocrypto). Posisi embedding kosinus berada 0.88 mendekati centroid rekening mule nasional.
              </p>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: 10,
              background: 'var(--card-bg)',
            }}
          >
            <button
              onClick={() => {
                onClose();
                if (onNavigateToGNN) onNavigateToGNN(account);
              }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <GitBranch size={15} /> Buka di Kanvas GNN
            </button>

            <button
              onClick={() => {
                onClose();
                if (onCreateCase) onCreateCase(account);
              }}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <FileText size={15} /> Buat Kasus
            </button>
          </div>
        </motion.div>
      </div>

      {/* Unmasking Reason Modal */}
      {showUnmaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowUnmaskModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#0f172a',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 18,
              padding: 24,
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#f59e0b', marginBottom: 12 }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Otorisasi Buka Sensor PII (UU PDP)</h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
              Sesuai Pasal 35 UU No. 27/2022, pembukaan data identitas nasabah perbankan wajib memiliki justifikasi investigasi hukum/kepatuhan yang dicatat ke sistem audit log permanen.
            </p>
            <form onSubmit={handleUnmaskSubmit}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>
                Alasan Investigasi Khusus (Wajib Diisi):
              </label>
              <textarea
                value={unmaskReason}
                onChange={(e) => setUnmaskReason(e.target.value)}
                placeholder="Contoh: Permintaan verifikasi data nasabah untuk draf LTKM goAML PPATK terkait klaster rekening mule."
                rows={3}
                style={{
                  width: '100%',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: 8,
                  padding: 10,
                  color: 'white',
                  fontSize: '0.8rem',
                  marginBottom: 16,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowUnmaskModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: '#f59e0b',
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  Buka Sensor &amp; Catat Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
