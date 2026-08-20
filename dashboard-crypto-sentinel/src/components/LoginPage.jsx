import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Key, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [role, setRole] = useState('compliance');
  const [nip, setNip] = useState('ADM-882910');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const roles = [
    { id: 'compliance', label: 'Compliance Officer', icon: Shield, desc: 'Verifikasi STR/LTKM PPATK & Freeze Rekening' },
    { id: 'risk', label: 'Risk & AML Lead', icon: Key, desc: 'Pengaturan Threshold FDS & Parameter GNN' },
    { id: 'auditor', label: 'Auditor Eksekutif', icon: User, desc: 'Laporan Forensik & Kepatuhan OJK' }
  ];

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        nip: nip || 'ADM-882910',
        role: role,
        name: role === 'compliance' ? 'Rifki Firmansyah, S.Kom' : 'Budi Santoso, M.Fin',
        roleLabel: roles.find(r => r.id === role)?.label || 'Compliance Officer'
      });
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'radial-gradient(ellipse at 50% 20%, #0d1e44 0%, #060d21 60%, #020617 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Background Ambience */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(59, 130, 246, 0.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />

      {/* Top Back to Landing Button */}
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          color: '#cbd5e1',
          padding: '8px 16px',
          borderRadius: 9999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.8rem',
          fontWeight: 600,
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(10px)',
          zIndex: 10
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
      >
        <ArrowLeft size={16} /> Kembali ke Beranda
      </button>

      {/* Main Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 24,
          padding: '36px 32px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 35px rgba(37, 99, 235, 0.15)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 2,
          boxSizing: 'border-box'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(15, 23, 42, 0.9))',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: '0 0 25px rgba(37, 99, 235, 0.3)'
            }}
          >
            <img
              src="/img/Logo3_transparent.png"
              alt="Crypto-Sentinel"
              style={{ height: 38, width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0', color: '#f8fafc' }}>
            Portal Masuk Forensik FDS
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            Sistem Deteksi Penipuan Keuangan &amp; Pelarian Kripto Bank Kuningan
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 8 }}>
            Pilih Peran Otorisasi
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = role === r.id;
              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 12,
                    border: isSelected ? '1.5px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <Icon size={18} color={isSelected ? '#60a5fa' : '#64748b'} />
                  <span style={{ fontSize: '0.68rem', fontWeight: isSelected ? 700 : 500, lineHeight: 1.2 }}>
                    {r.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* NIP Field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8', marginBottom: 6 }}>
              NIP / ID Petugas
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '0 14px',
                height: 44
              }}
            >
              <User size={18} color="#64748b" style={{ marginRight: 10 }} />
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: ADM-882910"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  width: '100%',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#94a3b8' }}>
                Kata Sandi / PIN Dinamis
              </label>
              <span style={{ fontSize: '0.68rem', color: '#38bdf8', cursor: 'pointer' }}>
                Mode Demo Aktif
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '0 14px',
                height: 44
              }}
            >
              <Lock size={18} color="#64748b" style={{ marginRight: 10 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi petugas"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '0.88rem',
                  width: '100%'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              height: 46,
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              border: 'none',
              borderRadius: 12,
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease',
              marginBottom: 12
            }}
          >
            {isSubmitting ? (
              <span>Mengotentikasi Sesi...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard Forensik</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* 1-Click Demo Shortcut */}
          <button
            type="button"
            onClick={() => handleLogin()}
            style={{
              width: '100%',
              height: 40,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 12,
              color: '#93c5fd',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
          >
            ⚡ Masuk Otomatis (Akses Cepat Penguji)
          </button>
        </form>

        {/* Security Footer Info */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CheckCircle size={14} color="#10b981" />
            <span>Enkripsi TLS 1.3 / SNAP BI</span>
          </div>
          <span>PPATK goAML Ready</span>
        </div>
      </motion.div>
    </div>
  );
}
