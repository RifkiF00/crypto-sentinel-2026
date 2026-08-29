import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Check, Users,
  ShieldCheck, Landmark, UserCheck, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { DEMO_USERS, ROLES } from '../context/AuthContext';

export default function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [email, setEmail] = useState('compliance@bankkuningan.co.id');
  const [password, setPassword] = useState('SentinelPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [selectedQuickUser, setSelectedQuickUser] = useState('u1');

  const getRoleIcon = (role, isSelected) => {
    if (role === 'compliance_officer') {
      return <ShieldCheck size={18} color={isSelected ? '#ffffff' : '#1e3a8a'} />;
    }
    if (role === 'admin_regulator') {
      return <Landmark size={18} color={isSelected ? '#ffffff' : '#0f172a'} />;
    }
    return <UserCheck size={18} color={isSelected ? '#ffffff' : '#0369a1'} />;
  };

  const getRoleTierBadge = (role) => {
    if (role === 'compliance_officer') return 'LEVEL 3 · MLRO';
    if (role === 'admin_regulator') return 'SUPERVISORY AUDIT';
    return 'LEVEL 1 · FORENSIK';
  };

  const handleQuickSelect = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setSelectedQuickUser(user.id);
    setLoginError('');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Validate against DEMO_USERS
      const matched = DEMO_USERS.find(
        u => u.email === email && u.password === password
      );
      if (matched) {
        onLoginSuccess(matched);
      } else {
        setLoginError('Email atau password tidak valid. Gunakan akun demo di bawah.');
      }
    }, 700);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        background: '#03081e',
        display: 'flex',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Right Column: High-Res Crisp Visual Image Container */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '68%',
          minWidth: '500px',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        <img
          src="/img/login.jpeg"
          alt="Crypto-Sentinel Banking Protection"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center right',
            display: 'block'
          }}
        />
        {/* Smooth Left & Top Blending Gradients */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, #03081e 0%, rgba(3, 8, 30, 0.6) 18%, rgba(3, 8, 30, 0.0) 45%), linear-gradient(to bottom, rgba(3, 8, 30, 0.3) 0%, transparent 15%, transparent 85%, rgba(3, 8, 30, 0.6) 100%)',
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Top Floating Back Button */}
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          color: '#0f172a',
          padding: '8px 18px',
          borderRadius: 9999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          zIndex: 30
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.transform = 'translateX(-3px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <ArrowLeft size={16} /> Kembali ke Beranda
      </button>

      {/* Left Column: Fixed / Fluid Glassmorphic Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '560px',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px clamp(16px, 4vw, 48px)',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: 440,
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            borderRadius: 28,
            padding: '36px 32px',
            boxShadow: '0 25px 60px rgba(0, 10, 30, 0.35), 0 0 35px rgba(255, 255, 255, 0.4)',
            boxSizing: 'border-box'
          }}
        >
        {/* Brand Logo */}
        <div style={{ marginBottom: 20 }}>
          <img
            src="/img/Logo3_transparent.png"
            alt="Crypto-Sentinel"
            style={{
              height: 48,
              width: 'auto',
              objectFit: 'contain',
              display: 'block'
            }}
          />
        </div>

        {/* Header Title */}
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            Selamat Datang Kembali
          </h1>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#64748b',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            Masuk untuk mengakses dashboard dan memantau transaksi secara real-time.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* ── Quick Login Role Selector ───────────────────────────── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Pilih Akun Demo Perbankan
              </label>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Otentikasi Instan</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_USERS.map(u => {
                const roleConfig = ROLES[u.role];
                const isSelected = selectedQuickUser === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '11px 14px',
                      background: isSelected ? '#ffffff' : '#ffffff',
                      border: isSelected ? '1.5px solid #1e3a8a' : '1px solid #e2e8f0',
                      borderRadius: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                      width: '100%',
                      boxShadow: isSelected ? '0 4px 14px rgba(30, 58, 138, 0.12)' : '0 1px 2px rgba(0, 0, 0, 0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Role Icon Box */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: isSelected ? '#1e3a8a' : '#f1f5f9',
                      border: isSelected ? '1px solid #1e3a8a' : '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.18s ease'
                    }}>
                      {getRoleIcon(u.role, isSelected)}
                    </div>

                    {/* Role Name & Unit */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.25 }}>
                        {u.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 2, fontWeight: 500 }}>
                        {roleConfig?.sublabel}
                      </div>
                    </div>

                    {/* Tier Badge */}
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: isSelected ? 'rgba(30, 58, 138, 0.08)' : '#f8fafc',
                      color: isSelected ? '#1e3a8a' : '#64748b',
                      border: isSelected ? '1px solid rgba(30, 58, 138, 0.25)' : '1px solid #e2e8f0',
                      flexShrink: 0,
                      letterSpacing: '0.02em'
                    }}>
                      {getRoleTierBadge(u.role)}
                    </span>

                    {/* Radio Indicator */}
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%',
                      border: isSelected ? '5px solid #1e3a8a' : '1.5px solid #cbd5e1',
                      background: '#ffffff',
                      flexShrink: 0,
                      transition: 'all 0.15s ease'
                    }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Email
            </label>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '0 14px',
                height: 44,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <Mail size={17} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  background: 'transparent',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: 6
              }}
            >
              Password
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                padding: '0 14px',
                height: 44,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <Lock size={17} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  background: 'transparent',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              fontSize: '0.78rem'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#334155',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: '#2563eb',
                  cursor: 'pointer',
                  borderRadius: 4
                }}
              />
              <span>Ingat saya</span>
            </label>

            <a
              href="#lupa"
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi Administrator Bank Kuningan untuk reset kredensial FDS.');
              }}
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Lupa password?
            </a>
          </div>

          {/* Error message */}
          {loginError && (
            <div style={{
              marginBottom: 14,
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10,
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              ❌ {loginError}
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: 46,
              background: 'linear-gradient(135deg, #09132e 0%, #1e3a8a 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.2s ease',
              marginBottom: 16
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 23, 42, 0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(15, 23, 42, 0.25)')}
          >
            {isLoading ? (
              <span>Mengotentikasi Sesi...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>

          {/* Security Compliance Footer Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              fontSize: '0.72rem',
              color: '#64748b',
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            <Shield size={14} color="#059669" />
            <span>Sistem Kepatuhan Terenkripsi SNAP BI &amp; POJK 8/2023</span>
          </div>
        </form>
      </motion.div>
    </div>
  </div>
);
}
