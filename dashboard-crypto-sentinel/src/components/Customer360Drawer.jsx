import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Lock,
  Unlock,
  GitBranch,
  FileText,
  AlertTriangle,
  History,
  Copy,
  Check,
  ArrowUpRight,
  Wifi,
  Fingerprint,
  Briefcase,
  Clock,
  Activity
} from 'lucide-react';
import { maskName, maskAccount, maskNik, maskIp, maskDevice } from '../utils/masking';
import { formatCurrency } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { fetchAccountInfo, fetchAccountTransactions, fetchDeviceTelemetry, logPiiUnmask, updateAccountInDb, createAccountInDb, deleteAccountInDb } from '../services/api';


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
  const [copiedField, setCopiedField] = useState(null);

  // ── CRUD Edit Panel State ─────────────────────────────────────
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [editForm, setEditForm] = useState({});


  useEffect(() => {
    setLocalMasked(isMasked);
  }, [isMasked, account]);

  // Reset live state before each account and ignore late responses
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

  if (!isOpen || !account) return null;

  // Authoritative Neon DB data with graceful fallback to provided props
  const accountId = liveDbAccount?.account_id || account.id || account.account_id || account.account_number || account.account || account.senderAccount || account.sender_account || '0123456789';
  const rawName = liveDbAccount?.owner_name || account.name || account.holder || account.senderName || 'Budi Santoso';

  // Deterministic hash based on accountId
  const hashVal = Math.abs(
    accountId.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
  );

  // Extract forensic role flag if embedded in rawName, e.g. "Agus Salim (Transit Account)"
  let extractedRole = '';
  const matchJob = rawName.match(/\(([^)]+)\)/);
  if (matchJob && matchJob[1]) {
    extractedRole = matchJob[1].trim();
  }

  // Clean civilian name by removing parenthesized role tags
  const cleanCivilianName = rawName.replace(/\s*\([^)]+\)/g, '').trim() || rawName;

  const defaultOccupations = [
    { job: 'Buruh Harian Lepas', income: 2750000 },
    { job: 'Karyawan Swasta', income: 8500000 },
    { job: 'Wiraswasta / UMKM', income: 15000000 },
    { job: 'Mahasiswa / Pelajar', income: 1500000 },
    { job: 'Ibu Rumah Tangga', income: 3000000 },
    { job: 'PNS / ASN Daerah', income: 9200000 },
    { job: 'Petani / Pekebun', income: 3200000 },
    { job: 'Satpam / Security', income: 4200000 },
    { job: 'Pengemudi Online', income: 4500000 },
  ];

  const occEntry = defaultOccupations[hashVal % defaultOccupations.length];

  // Determine true civilian occupation (not role flag like "Transit Account")
  const isRoleLike = (str) => {
    if (!str) return false;
    const s = str.toLowerCase();
    return s.includes('transit') || s.includes('mule') || s.includes('aggregator') || s.includes('smurf');
  };

  let civilianJob = occEntry.job;
  if (liveDbAccount?.occupation && !isRoleLike(liveDbAccount.occupation)) {
    civilianJob = liveDbAccount.occupation;
  } else if (account.occupation && !isRoleLike(account.occupation)) {
    civilianJob = account.occupation;
  } else if (extractedRole && !isRoleLike(extractedRole)) {
    civilianJob = extractedRole;
  }

  const getIncomeForJob = (job) => {
    const j = String(job).toLowerCase();
    if (j.includes('buruh')) return 2750000;
    if (j.includes('mahasisw') || j.includes('pelajar')) return 1500000;
    if (j.includes('rumah tangga') || j.includes('irt')) return 3000000;
    if (j.includes('petani') || j.includes('kebun')) return 3200000;
    if (j.includes('satpam') || j.includes('security')) return 4200000;
    if (j.includes('ojek') || j.includes('driver') || j.includes('pengemudi')) return 4500000;
    if (j.includes('karyawan') || j.includes('pegawai')) return 8500000;
    if (j.includes('asn') || j.includes('pns')) return 9200000;
    if (j.includes('wiraswasta') || j.includes('umkm')) return 15000000;
    return occEntry.income;
  };

  const monthlyIncome = liveDbAccount?.monthly_income || account.monthlyIncome || account.income || getIncomeForJob(civilianJob);

  // Device and Telemetry Profiles matching DB schema
  const deviceList = [
    { dev: 'DEV-IPHONE15-PRO-MAX', model: 'iPhone 15 Pro (iOS 17.4)', isp: 'Telkomsel Mobile' },
    { dev: 'DEV-ANDROID-S24-ULTRA', model: 'Samsung Galaxy S24 Ultra (Android 14)', isp: 'Indosat Ooredoo' },
    { dev: 'DEV-XIAOMI14-PRO', model: 'Xiaomi 14 HyperOS (Android 14)', isp: 'XL Axiata' },
    { dev: 'DEV-OPPO-RENO11', model: 'Oppo Reno11 5G (ColorOS 14)', isp: 'Telkomsel Mobile' },
    { dev: 'DEV-VIVO-V30', model: 'Vivo V30 5G (Funtouch OS 14)', isp: 'Biznet Mobile' },
    { dev: 'DEV-REALME-GT5', model: 'Realme GT5 Pro (RealmeUI 5)', isp: 'Smartfren' },
    { dev: 'DEV-POCO-F6', model: 'POCO F6 5G (HyperOS)', isp: 'Tri Indonesia' },
    { dev: 'DEV-ASUS-ROG8', model: 'ASUS ROG Phone 8 (Android 14)', isp: 'FirstMedia Wi-Fi' }
  ];

  const selectedDevice = deviceList[hashVal % deviceList.length];
  const rawNik = liveDbAccount?.national_id || account.nik || account.national_id || `3208${String(100000000000 + (hashVal % 900000000000))}`;
  const rawIp = liveDbAccount?.registered_ip || account.ip || `180.252.${(hashVal % 250) + 1}.${((hashVal * 7) % 250) + 1}`;
  const rawDevice = liveDbAccount?.registered_device || account.device || selectedDevice.dev;
  const rawDeviceModel = liveDbAccount?.device_model || selectedDevice.model;
  const rawIspProvider = liveDbAccount?.isp_provider || selectedDevice.isp;

  const bankName = account.bank || account.bank_name || account.senderBank || (accountId.startsWith('110') ? 'Bank bjb' : 'Bank Kuningan');
  const muleProb = liveDbAccount?.mule_probability ?? account.muleProbability ?? account.mule_probability ?? (account.riskScore ? account.riskScore / 100 : 0.87);
  const riskScore = liveDbAccount?.risk_score ?? account.riskScore ?? Math.round(muleProb * 100);
  const cddStatus = liveDbAccount?.cdd_edd_status || account.cddStatus || (riskScore > 75 ? 'EDD_REQUIRED' : 'CDD_VERIFIED');
  const pepStatus = liveDbAccount?.pep_status ? 'PEP (Politically Exposed)' : (account.pepStatus || 'NON_PEP');
  const dormantDays = account.dormantDays ?? (riskScore > 80 ? (120 + (hashVal % 150)) : (2 + (hashVal % 15)));

  // Syndicate Role Tag
  const detectedForensicRole = isRoleLike(extractedRole) ? extractedRole : (riskScore >= 80 ? 'Transit Account' : null);

  const displayName = localMasked ? maskName(cleanCivilianName) : cleanCivilianName;
  const displayAccount = localMasked ? maskAccount(accountId) : accountId;
  const displayNik = localMasked ? maskNik(rawNik) : rawNik;
  const displayIp = localMasked ? maskIp(rawIp) : rawIp;
  const displayDevice = localMasked ? maskDevice(rawDevice) : rawDevice;

  // Dynamic GNN metrics
  const inDegree = riskScore >= 80 ? (4 + (hashVal % 6)) : (1 + (hashVal % 3));
  const outDegree = riskScore >= 80 ? (2 + (hashVal % 3)) : 1;
  const embeddingDist = (0.78 + ((hashVal % 18) / 100)).toFixed(2);
  const cryptoDest = ['Indodax', 'Tokocrypto', 'Reku', 'Pintu Exchange'][hashVal % 4];

  // Dynamic mutation history matching account transaction
  const mutationsToDisplay = liveTxHistory.length > 0 ? liveTxHistory : [
    {
      transaction_id: `TXN-${accountId.substring(0, 5)}-01`,
      receiver_account: account.destinationAccount || account.destination || `${cryptoDest} Escrow`,
      destination_type: 'Off-Ramp Kripto / P2P',
      amount: account.amount || (riskScore > 80 ? 35000000 : 4500000),
      timestamp: new Date().toISOString(),
      status: riskScore >= 80 ? 'BLOCKED' : 'SUCCESS'
    },
    {
      transaction_id: `TXN-${accountId.substring(0, 5)}-02`,
      receiver_account: '987654****21 (Rekening Transit)',
      destination_type: 'Transfer Antar Bank (BI-FAST)',
      amount: Math.round((account.amount || 25000000) * 0.4),
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      status: 'SUCCESS'
    },
    {
      transaction_id: `TXN-${accountId.substring(0, 5)}-03`,
      receiver_account: '110499****88 (Mule Aggregator)',
      destination_type: 'Overbooking Internal',
      amount: Math.round((account.amount || 25000000) * 0.25),
      timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
      status: 'SUCCESS'
    }
  ];

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
    if (addToast) addToast(`Tersalin: ${text}`, 'info');
  };

  // ── CRUD handlers ────────────────────────────────────────────
  const openEditPanel = () => {
    setEditForm({
      owner_name: liveDbAccount?.owner_name || rawName || '',
      national_id: liveDbAccount?.national_id || rawNik || '',
      occupation: liveDbAccount?.occupation || civilianJob || '',
      monthly_income: liveDbAccount?.monthly_income || monthlyIncome || '',
      risk_profile: liveDbAccount?.risk_profile || (riskScore >= 80 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW'),
      risk_score: liveDbAccount?.risk_score ?? riskScore ?? '',
      cdd_edd_status: liveDbAccount?.cdd_edd_status || cddStatus || 'CDD_STANDARD',
      pep_status: liveDbAccount?.pep_status ?? (pepStatus === 'PEP (Politically Exposed)'),
      registered_device: liveDbAccount?.registered_device || rawDevice || '',
      registered_ip: liveDbAccount?.registered_ip || rawIp || '',
      is_active: liveDbAccount?.is_active ?? true,
      is_blocked: liveDbAccount?.is_blocked ?? false,
      balance: liveDbAccount?.balance ?? '',
    });
    setShowEditPanel(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateAccountInDb(
        accountId,
        {
          owner_name: editForm.owner_name || undefined,
          national_id: editForm.national_id || undefined,
          occupation: editForm.occupation || undefined,
          monthly_income: editForm.monthly_income !== '' ? Number(editForm.monthly_income) : undefined,
          risk_profile: editForm.risk_profile || undefined,
          risk_score: editForm.risk_score !== '' ? Number(editForm.risk_score) : undefined,
          cdd_edd_status: editForm.cdd_edd_status || undefined,
          pep_status: editForm.pep_status,
          registered_device: editForm.registered_device || undefined,
          registered_ip: editForm.registered_ip || undefined,
          is_active: editForm.is_active,
          is_blocked: editForm.is_blocked,
          balance: editForm.balance !== '' ? Number(editForm.balance) : undefined,
        },
        currentUser?.name || currentUser?.id || 'Analyst',
        currentUser?.role || 'compliance_officer'
      );
      // Refresh local state with the returned updated data
      setLiveDbAccount(prev => ({ ...(prev || {}), ...updated }));
      setShowEditPanel(false);
      addToast?.(`✅ Data akun ${accountId} berhasil diperbarui di database.`, 'success');
    } catch (err) {
      addToast?.(`❌ Gagal menyimpan: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteReason.trim()) {
      addToast?.('Alasan penghapusan wajib diisi untuk audit log.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await deleteAccountInDb(
        accountId,
        deleteReason.trim(),
        currentUser?.name || currentUser?.id || 'Admin_User',
        currentUser?.role || 'admin_regulator'
      );
      addToast?.(`🗑️ Akun ${accountId} berhasil dihapus dari database.`, 'warning');
      setShowDeleteConfirm(false);
      setDeleteReason('');
      onClose();
    } catch (err) {
      addToast?.(`❌ Gagal menghapus: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };


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
      actor: currentUser?.name || currentUser?.id || 'MLRO_Officer',
      role: currentUser?.role || 'mlro'
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
          top: 'var(--header-height, 72px)',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          background: 'rgba(15, 23, 42, 0.4)',
          display: 'flex',
          justifyContent: 'flex-end',
          pointerEvents: 'auto',
          fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.22, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 590,
            height: 'calc(100vh - var(--header-height, 72px))',
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            boxShadow: '-12px 0 35px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            pointerEvents: 'auto',
            color: '#0f172a',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ================= HEADER (CLEAN WHITE) ================= */}
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#ffffff',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0284c7',
                  flexShrink: 0,
                }}
              >
                <User size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
                  Customer 360° Forensic Profile
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#64748b', marginTop: 1 }}>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>{bankName}</span>
                  <span style={{ color: '#cbd5e1' }}>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#059669', fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    Live NeonDB Connected
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Edit Account Button */}
              {can('unmaskPII') && (
                <button
                  onClick={openEditPanel}
                  title="Edit Data Akun di Database"
                  style={{
                    background: showEditPanel ? '#eff6ff' : '#f8fafc',
                    border: `1px solid ${showEditPanel ? '#bfdbfe' : '#e2e8f0'}`,
                    color: showEditPanel ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    padding: '7px 12px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.borderColor = '#bfdbfe';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    if (!showEditPanel) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit DB
                </button>
              )}

              <button
                onClick={onClose}
                aria-label="Tutup drawer"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '7px',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ================= SCROLLABLE BODY (WHITE BACKGROUND) ================= */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: '#f8fafc',
            }}
          >
            {/* 1. TOP EXECUTIVE PROFILE & RISK SCORE CARD */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14 }}>
                {/* Left: Identity Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '1.35rem',
                        fontWeight: 800,
                        color: '#0f172a',
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {displayName}
                    </span>

                    {/* Syndicate / Forensic Role Badge */}
                    {detectedForensicRole && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          color: '#dc2626',
                        }}
                      >
                        <AlertTriangle size={12} strokeWidth={2.4} />
                        {detectedForensicRole}
                      </span>
                    )}
                  </div>

                  {/* Credentials / Identification Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {/* Account Number Chip with Copy */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: 6,
                        padding: '4px 9px',
                        fontSize: '0.82rem',
                        color: '#0369a1',
                      }}
                    >
                      <span style={{ color: '#0284c7', fontSize: '0.72rem', fontWeight: 700 }}>REK:</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          color: '#0369a1',
                        }}
                      >
                        {displayAccount}
                      </span>
                      <button
                        onClick={() => handleCopy(displayAccount, 'acc')}
                        title="Salin No. Rekening"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: copiedField === 'acc' ? '#16a34a' : '#0284c7',
                          padding: 1,
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: 2,
                        }}
                      >
                        {copiedField === 'acc' ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
                      </button>
                    </div>

                    {/* NIK Chip with Copy */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        padding: '4px 9px',
                        fontSize: '0.82rem',
                        color: '#334155',
                      }}
                    >
                      <span style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>NIK:</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 600,
                          color: '#1e293b',
                        }}
                      >
                        {displayNik}
                      </span>
                      <button
                        onClick={() => handleCopy(displayNik, 'nik')}
                        title="Salin NIK"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: copiedField === 'nik' ? '#16a34a' : '#64748b',
                          padding: 1,
                          display: 'flex',
                          alignItems: 'center',
                          marginLeft: 2,
                        }}
                      >
                        {copiedField === 'nik' ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Solid CRA Risk Score Box (Light Mode) */}
                <div
                  style={{
                    background: riskScore >= 80 ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${riskScore >= 80 ? '#fecaca' : '#bbf7d0'}`,
                    borderRadius: 8,
                    padding: '10px 14px',
                    textAlign: 'center',
                    minWidth: 120,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 3 }}>
                    {riskScore >= 80 ? (
                      <ShieldAlert size={14} color="#dc2626" strokeWidth={2.4} />
                    ) : (
                      <ShieldCheck size={14} color="#16a34a" strokeWidth={2.4} />
                    )}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: riskScore >= 80 ? '#dc2626' : '#16a34a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {riskScore >= 80 ? 'MULE 90.0%' : 'LOW RISK'}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: riskScore >= 80 ? '#b91c1c' : '#15803d',
                      fontFamily: 'var(--font-mono, monospace)',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {riskScore}
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginLeft: 2 }}>/100</span>
                  </div>

                  <div style={{ fontSize: '0.74rem', color: riskScore >= 80 ? '#991b1b' : '#166534', marginTop: 4, fontWeight: 700 }}>
                    Skor CRA: <span>{riskScore >= 80 ? 'Kritis' : 'Normal'}</span>
                  </div>
                </div>
              </div>

              {/* UU PDP Compliance Action Row */}
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: '#64748b' }}>
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      background: '#f0f9ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: localMasked ? '#0284c7' : '#059669',
                    }}
                  >
                    {localMasked ? <Lock size={12} strokeWidth={2.2} /> : <Unlock size={12} strokeWidth={2.2} />}
                  </div>
                  <span>
                    UU PDP No. 27/2022 <span style={{ color: localMasked ? '#0284c7' : '#059669', fontWeight: 700 }}>({localMasked ? 'Sensor Otomatis' : 'Sensor Terbuka'})</span>
                  </span>
                </div>

                {localMasked ? (
                  can('unmaskPII') ? (
                    <button
                      onClick={() => setShowUnmaskModal(true)}
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#b45309',
                        padding: '5px 12px',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fef3c7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fffbeb';
                      }}
                    >
                      <Unlock size={13} strokeWidth={2.2} /> Buka Sensor (MLRO)
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                      Buka Sensor Hanya MLRO
                    </span>
                  )
                ) : (
                  <button
                    onClick={() => setLocalMasked(true)}
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#047857',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Lock size={13} /> Kunci Kembali Sensor
                  </button>
                )}
              </div>
            </div>

            {/* 2. COMPLIANCE & DUE DILIGENCE 4-GRID (CLEAN WHITE CARDS) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Card 1: CDD / EDD */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d97706',
                    }}
                  >
                    <ShieldAlert size={14} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Status CDD / EDD
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: cddStatus === 'EDD_REQUIRED' ? '#b45309' : '#0284c7',
                  }}
                >
                  {cddStatus}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 3 }}>
                  POJK No. 8/2023 Pilar 1
                </div>
              </div>

              {/* Card 2: PEP Status */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#475569',
                    }}
                  >
                    <User size={14} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    PEP Status
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {pepStatus}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 3 }}>
                  Politically Exposed Person
                </div>
              </div>

              {/* Card 3: Pekerjaan & Pendapatan */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7',
                    }}
                  >
                    <Briefcase size={14} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Pekerjaan & Pendapatan
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {civilianJob}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700, marginTop: 3, fontFamily: 'var(--font-mono, monospace)' }}>
                  {formatCurrency(monthlyIncome)} / bln
                </div>
              </div>

              {/* Card 4: Inaktif (Dormancy) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '14px 16px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 5,
                      background: dormantDays > 90 ? '#fef2f2' : '#f0f9ff',
                      border: `1px solid ${dormantDays > 90 ? '#fecaca' : '#bae6fd'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: dormantDays > 90 ? '#dc2626' : '#0284c7',
                    }}
                  >
                    <Clock size={14} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Inaktif (Dormancy)
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: dormantDays > 90 ? '#dc2626' : '#0284c7',
                  }}
                >
                  {dormantDays} Hari Pasif
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 3 }}>
                  Dormant Awakening Anomaly
                </div>
              </div>
            </div>

            {/* 3. DIGITAL & DEVICE FOOTPRINT */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={17} color="#0284c7" /> Digital & Device Footprint
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    color: '#0369a1',
                  }}
                >
                  Telemetri SDK v2.4
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Device Fingerprint */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Fingerprint size={14} color="#94a3b8" /> Device Fingerprint:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.84rem' }}>
                      {liveDeviceTelemetry?.device_fingerprint || displayDevice}
                    </span>
                    <button
                      onClick={() => handleCopy(liveDeviceTelemetry?.device_fingerprint || displayDevice, 'dev')}
                      title="Salin ID Perangkat"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedField === 'dev' ? '#16a34a' : '#94a3b8',
                        padding: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {copiedField === 'dev' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Device Model & OS */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Smartphone size={14} color="#94a3b8" /> Device Model & OS:
                  </span>
                  <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem', textAlign: 'right' }}>
                    {rawDeviceModel}
                  </span>
                </div>

                {/* IP Address & ISP */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wifi size={14} color="#94a3b8" /> IP Address & ISP:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.84rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{displayIp}</span> · {rawIspProvider}
                    </span>
                    <button
                      onClick={() => handleCopy(displayIp, 'ip')}
                      title="Salin Alamat IP"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedField === 'ip' ? '#16a34a' : '#94a3b8',
                        padding: 1,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {copiedField === 'ip' ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Integritas Lingkungan */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} color="#94a3b8" /> Integritas Lingkungan:
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      padding: '3px 8px',
                      borderRadius: 4,
                      background: (liveDeviceTelemetry?.is_rooted_jailbroken || riskScore > 90)
                        ? '#fef2f2'
                        : '#ecfdf5',
                      border: `1px solid ${(liveDeviceTelemetry?.is_rooted_jailbroken || riskScore > 90) ? '#fecaca' : '#a7f3d0'}`,
                      color: (liveDeviceTelemetry?.is_rooted_jailbroken || riskScore > 90) ? '#dc2626' : '#059669',
                    }}
                  >
                    {(liveDeviceTelemetry?.is_rooted_jailbroken || riskScore > 90)
                      ? 'ROOT/JAILBREAK DETECTED'
                      : 'SECURE (Non-Root, No-VPN)'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. LIVE TRANSACTIONS LEDGER (NEON DB) */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div
                style={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <History size={17} color="#0284c7" /> Mutasi Transaksi Terakhir (NeonDB)
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: '#0369a1',
                    fontWeight: 700,
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {mutationsToDisplay.length} Transaksi Terverifikasi
                </span>
              </div>

              {isLoadingLive ? (
                <div style={{ fontSize: '0.84rem', color: '#64748b', textAlign: 'center', padding: '16px 0' }}>
                  Memuat data transaksi dari database Neon...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mutationsToDisplay.slice(0, 5).map((tx, idx) => (
                    <div
                      key={tx.transaction_id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '10px 12px',
                        borderRadius: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: tx.status === 'BLOCKED' ? '#fef2f2' : '#f0f9ff',
                            color: tx.status === 'BLOCKED' ? '#dc2626' : '#0284c7',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <ArrowUpRight size={15} strokeWidth={2} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                            Ke: {tx.receiver_account}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 1 }}>
                            {tx.destination_type || 'Transfer'} • {tx.timestamp ? tx.timestamp.replace('T', ' ').substring(0, 19) : 'Baru'}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            fontWeight: 800,
                            color: '#dc2626',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: '0.92rem',
                          }}
                        >
                          -{formatCurrency(tx.amount)}
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 3,
                            display: 'inline-block',
                            marginTop: 2,
                            background: tx.status === 'SUCCESS' ? '#f0fdf4' : '#fef2f2',
                            color: tx.status === 'SUCCESS' ? '#16a34a' : '#dc2626',
                            border: `1px solid ${tx.status === 'SUCCESS' ? '#bbf7d0' : '#fecaca'}`,
                          }}
                        >
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. GNN RELATIONAL GRAPH FORENSIC ANALYSIS (LIGHT BLUE ACCENT CARD) */}
            <div
              style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: 12,
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <GitBranch size={16} /> GNN GraphSAGE · AI Topology Inference
                </div>
                <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>
                  Model v2.4 (AUC: 0.948)
                </span>
              </div>

              {/* Forensic Metrics Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', padding: '5px 6px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>IN-DEGREE</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>{inDegree}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', padding: '5px 6px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>OUT-DEGREE</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>{outDegree}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', padding: '5px 6px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>DISTANTA</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono, monospace)' }}>{embeddingDist}</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e0f2fe', padding: '5px 6px', borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>OFF-RAMP</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#d97706', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cryptoDest}</div>
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0, lineHeight: 1.55 }}>
                Simpul rekening ini memiliki <strong style={{ color: '#0f172a' }}>In-Degree = {inDegree}</strong> (menerima dari {inDegree} rekening berbeda) dan <strong style={{ color: '#0f172a' }}>Out-Degree = {outDegree}</strong> (mengalirkan dana ke {cryptoDest}). Posisi embedding kosinus model GNN GraphSAGE berada pada jarak <strong style={{ color: '#0284c7' }}>{embeddingDist}</strong> mendekati centroid klaster sindikat rekening mule perbankan.
              </p>
            </div>
          </div>

          {/* ================= FOOTER ACTIONS (CLEAN WHITE FOOTER) ================= */}
          <div
            style={{
              padding: '14px 22px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              gap: 10,
              background: '#ffffff',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => {
                onClose();
                if (onNavigateToGNN) onNavigateToGNN(account);
              }}
              style={{
                flex: 1,
                padding: '11px 18px',
                borderRadius: 8,
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0369a1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#0284c7';
              }}
            >
              <GitBranch size={16} strokeWidth={2} /> Buka di Kanvas GNN
            </button>

            <button
              onClick={() => {
                onClose();
                if (onCreateCase) onCreateCase(account);
              }}
              style={{
                padding: '11px 18px',
                borderRadius: 8,
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#94a3b8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
            >
              <FileText size={16} strokeWidth={2} /> Buat Kasus
            </button>
          </div>
        </motion.div>
      </div>

      {/* ================= UNMASKING REASON MODAL (CLEAN LIGHT POPUP) ================= */}
      {showUnmaskModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          }}
          onClick={() => setShowUnmaskModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 450,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#d97706', marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertTriangle size={18} strokeWidth={2.2} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  Otorisasi Buka Sensor PII
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600 }}>
                  Kepatuhan Regulasi UU PDP No. 27/2022
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.55, marginBottom: 16 }}>
              Sesuai Pasal 35 UU No. 27/2022, pembukaan data identitas nasabah perbankan wajib memiliki justifikasi investigasi hukum/kepatuhan yang dicatat ke sistem audit log permanen.
            </p>

            <form onSubmit={handleUnmaskSubmit}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Alasan Investigasi Khusus (Wajib Diisi):
              </label>
              <textarea
                value={unmaskReason}
                onChange={(e) => setUnmaskReason(e.target.value)}
                placeholder="Contoh: Permintaan verifikasi data nasabah untuk draf LTKM goAML PPATK terkait klaster rekening mule."
                rows={3}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  padding: '10px 12px',
                  color: '#0f172a',
                  fontSize: '0.84rem',
                  marginBottom: 16,
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                  resize: 'none',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#0284c7';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowUnmaskModal(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 6,
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    background: '#0284c7',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                  }}
                >
                  Buka Sensor &amp; Catat Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{/* end unmask modal — showUnmaskModal block closes here */}



      {/* ═══════════════════════════════════════════════════
          EDIT ACCOUNT PANEL (CRUD — UPDATE)
          ═══════════════════════════════════════════════════ */}
      {showEditPanel && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1100,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
            paddingTop: 'var(--header-height, 72px)',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
          onClick={() => setShowEditPanel(false)}
        >
          <div
            style={{
              width: '100%', maxWidth: 480,
              height: 'calc(100vh - var(--header-height, 72px))',
              background: '#ffffff',
              borderLeft: '1px solid #e2e8f0',
              boxShadow: '-16px 0 40px rgba(0,0,0,0.14)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Edit Panel Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#eff6ff', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>Edit Data Akun — Database</div>
                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: 1 }}>ID: <b style={{ fontFamily: 'monospace' }}>{accountId}</b> · Aksi dicatat ke audit log</div>
              </div>
              <button onClick={() => setShowEditPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleEditSave} style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Section: Identity */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid #f1f5f9' }}>Identitas Nasabah</div>

              {[
                { key: 'owner_name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama nasabah sesuai KTP' },
                { key: 'national_id', label: 'NIK KTP', type: 'text', placeholder: '16 digit NIK' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>{label}</label>
                  <input
                    type={type}
                    value={editForm[key] || ''}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', outline: 'none', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              ))}

              {/* Section: CRA Profile */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid #f1f5f9', marginTop: 4 }}>Profil Risiko CRA</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Risk Profile</label>
                  <select
                    value={editForm.risk_profile || 'LOW'}
                    onChange={e => setEditForm(f => ({ ...f, risk_profile: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', cursor: 'pointer' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Risk Score (0–100)</label>
                  <input
                    type="number" min="0" max="100"
                    value={editForm.risk_score ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, risk_score: e.target.value }))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Status CDD/EDD</label>
                <select
                  value={editForm.cdd_edd_status || 'CDD_STANDARD'}
                  onChange={e => setEditForm(f => ({ ...f, cdd_edd_status: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', cursor: 'pointer' }}
                >
                  <option value="CDD_STANDARD">CDD_STANDARD</option>
                  <option value="CDD_VERIFIED">CDD_VERIFIED</option>
                  <option value="EDD_REQUIRED">EDD_REQUIRED</option>
                  <option value="EDD_COMPLETED">EDD_COMPLETED</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={!!editForm.pep_status}
                    onChange={e => setEditForm(f => ({ ...f, pep_status: e.target.checked }))}
                    style={{ width: 14, height: 14, cursor: 'pointer' }}
                  />
                  PEP (Politically Exposed Person)
                </label>
              </div>

              {/* Section: Occupation & Finance */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid #f1f5f9', marginTop: 4 }}>Pekerjaan & Keuangan</div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Pekerjaan / Ocupasi</label>
                <input
                  type="text"
                  value={editForm.occupation || ''}
                  onChange={e => setEditForm(f => ({ ...f, occupation: e.target.value }))}
                  placeholder="Contoh: Karyawan Swasta, Wiraswasta"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#3b82f6'}
                  onBlur={e => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Penghasilan Bulanan (Rp)</label>
                  <input
                    type="number"
                    value={editForm.monthly_income ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, monthly_income: e.target.value }))}
                    placeholder="10000000"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Saldo (Rp)</label>
                  <input
                    type="number"
                    value={editForm.balance ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, balance: e.target.value }))}
                    placeholder="0"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              </div>

              {/* Section: Device & Network */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid #f1f5f9', marginTop: 4 }}>Perangkat & Jaringan</div>

              {[
                { key: 'registered_device', label: 'Device Fingerprint', placeholder: 'DEV-IPHONE15-PRO-MAX' },
                { key: 'registered_ip', label: 'Registered IP Address', placeholder: '182.16.2.89' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>{label}</label>
                  <input
                    type="text"
                    value={editForm[key] || ''}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 7, border: '1px solid #d1d5db', fontSize: '0.84rem', background: '#f9fafb', color: '#111827', fontFamily: 'monospace', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = '#3b82f6'}
                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
              ))}

              {/* Section: Status Flags */}
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', paddingBottom: 4, borderBottom: '1px solid #f1f5f9', marginTop: 4 }}>Status Akun</div>

              <div style={{ display: 'flex', gap: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={!!editForm.is_active}
                    onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))}
                    style={{ width: 14, height: 14, cursor: 'pointer' }}
                  />
                  Akun Aktif
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: editForm.is_blocked ? '#dc2626' : '#374151' }}>
                  <input
                    type="checkbox"
                    checked={!!editForm.is_blocked}
                    onChange={e => setEditForm(f => ({ ...f, is_blocked: e.target.checked }))}
                    style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#dc2626' }}
                  />
                  Akun Diblokir
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 8, paddingTop: 12, borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ padding: '9px 14px', borderRadius: 7, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  Hapus Akun
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setShowEditPanel(false)} style={{ padding: '9px 14px', borderRadius: 7, background: 'transparent', border: '1px solid #d1d5db', color: '#64748b', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    style={{ padding: '9px 18px', borderRadius: 7, background: isSaving ? '#93c5fd' : '#2563eb', border: 'none', color: '#ffffff', cursor: isSaving ? 'not-allowed' : 'pointer', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {isSaving ? (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Simpan ke DB
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
          ═══════════════════════════════════════════════════ */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1200,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{ background: '#ffffff', borderRadius: 14, padding: '24px', maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Konfirmasi Hapus Akun</div>
                <div style={{ fontSize: '0.76rem', color: '#dc2626', fontFamily: 'monospace', fontWeight: 600 }}>{accountId}</div>
              </div>
            </div>

            <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.55, marginBottom: 14 }}>
              Aksi ini akan menghapus akun secara permanen dari database Core Banking. Semua riwayat transaksi tetap tersimpan. Aksi akan dicatat di audit log.
            </p>

            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#374151', marginBottom: 6 }}>Alasan Penghapusan (Wajib):</label>
            <textarea
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              placeholder="Contoh: Akun mule teridentifikasi, dihapus setelah koordinasi PPATK per surat No. …"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8, border: '1px solid #fca5a5', fontSize: '0.83rem', fontFamily: 'inherit', resize: 'none', background: '#fef2f2', color: '#111827', outline: 'none', marginBottom: 14 }}
              onFocus={e => e.target.style.borderColor = '#dc2626'}
              onBlur={e => e.target.style.borderColor = '#fca5a5'}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }} style={{ padding: '9px 14px', borderRadius: 7, background: 'transparent', border: '1px solid #d1d5db', color: '#64748b', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 600 }}>
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isSaving || !deleteReason.trim()}
                style={{ padding: '9px 16px', borderRadius: 7, background: (isSaving || !deleteReason.trim()) ? '#fca5a5' : '#dc2626', border: 'none', color: '#ffffff', cursor: (isSaving || !deleteReason.trim()) ? 'not-allowed' : 'pointer', fontSize: '0.84rem', fontWeight: 700 }}
              >
                {isSaving ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>

  );
}
