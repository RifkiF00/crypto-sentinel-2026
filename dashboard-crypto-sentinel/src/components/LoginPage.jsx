import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Check } from 'lucide-react';

export default function LoginPage({ onLoginSuccess, onBackToLanding }) {
  const [email, setEmail] = useState('compliance@bankkuningan.co.id');
  const [password, setPassword] = useState('SentinelPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        email: email || 'compliance@bankkuningan.co.id',
        name: 'Rifki Firmansyah, S.Kom',
        role: 'compliance',
        roleLabel: 'Compliance Officer (PPATK/OJK)'
      });
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundImage: 'url(/img/login.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '32px clamp(16px, 6vw, 80px)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      {/* Subtle Mobile/Tablet Gradient Overlay to guarantee contrast */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(10, 25, 55, 0.4) 0%, rgba(10, 25, 55, 0.1) 60%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />

      {/* Top Floating Back Button */}
      <button
        onClick={onBackToLanding}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          color: '#0f172a',
          padding: '8px 18px',
          borderRadius: 9999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.82rem',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s ease',
          zIndex: 20
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ffffff';
          e.currentTarget.style.transform = 'translateX(-3px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
          e.currentTarget.style.transform = 'none';
        }}
      >
        <ArrowLeft size={16} /> Kembali ke Beranda
      </button>

      {/* Pixel-Perfect Glassmorphic Login Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: 28,
          padding: '36px 32px',
          boxShadow: '0 25px 60px rgba(10, 25, 60, 0.22), 0 0 30px rgba(255, 255, 255, 0.5)',
          position: 'relative',
          zIndex: 10,
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
          {/* Email Field */}
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
              Email
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

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: 46,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
              marginBottom: 18
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 10px 25px rgba(37, 99, 235, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.35)')}
          >
            {isLoading ? (
              <span>Mengotentikasi...</span>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '18px 0',
              color: '#94a3b8',
              fontSize: '0.74rem'
            }}
          >
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ padding: '0 12px' }}>atau masuk dengan</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Secondary SSO Button */}
          <button
            type="button"
            onClick={() => handleSubmit()}
            style={{
              width: '100%',
              height: 44,
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: 12,
              color: '#1e293b',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s ease',
              marginBottom: 22
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <Shield size={18} color="#2563eb" />
            <span>SSO Perusahaan</span>
          </button>

          {/* Footer Text */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#64748b'
            }}
          >
            Belum memiliki akun?{' '}
            <a
              href="#kontak"
              onClick={(e) => {
                e.preventDefault();
                alert('Silakan hubungi IT Security Administrator Bank Kuningan / Tim EXPRESSO.');
              }}
              style={{
                color: '#2563eb',
                fontWeight: 700,
                textDecoration: 'underline'
              }}
            >
              Hubungi administrator
            </a>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
