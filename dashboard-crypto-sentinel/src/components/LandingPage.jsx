import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Activity, 
  ArrowRight, 
  Brain, 
  Zap, 
  Lock, 
  FileText, 
  TrendingUp, 
  Server, 
  Terminal,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onEnter }) {
  const [activeDocTab, setActiveDocTab] = useState('tp'); // 'tp' | 'flow' | 'bmc'
  const [tickerLogs, setTickerLogs] = useState([
    { id: 1, time: '21:41:02', msg: 'Crypto-Sentinel v3.2 Engine Initialized.', type: 'info' },
    { id: 2, time: '21:41:05', msg: 'GNN Model loaded: PyTorch Geometric 2.4.0 (16 nodes, 18 edges active).', type: 'info' },
    { id: 3, time: '21:41:10', msg: 'SNAP BI API gateway listening on port 8000.', type: 'success' }
  ]);

  // Rolling ticker logs to simulate real-time engine activity
  useEffect(() => {
    const logs = [
      { msg: 'FDS scan triggered for interbank transaction BCA -> Bank Kuningan.', type: 'info' },
      { msg: 'Transaction TXN-20260723-8B12: Risk score evaluated at 35% (Status: ALLOW).', type: 'success' },
      { msg: 'Smurfing rule check: 3 unique destinations within 1 hour for account 0123456789.', type: 'warning' },
      { msg: 'BLOCKED: Transaction TXN-20260723-A91C (Rp 60.000.000) - Smurfing Pattern Detected.', type: 'danger' },
      { msg: 'ALERT: Account 9012666666 (Indodax Escrow) marked as high risk.', type: 'danger' },
      { msg: 'Auto-generating STR report for transaction alert #8831.', type: 'info' },
      { msg: 'Connected to Ethereum and Binance Smart Chain node gateways.', type: 'info' }
    ];

    const interval = setInterval(() => {
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setTickerLogs(prev => [
        { id: Date.now(), time: timeStr, msg: randomLog.msg, type: randomLog.type },
        ...prev.slice(0, 4)
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container">
      <style>{`
        .landing-container {
          background-color: #030712;
          background-image: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, rgba(219, 39, 119, 0.05) 50%, #030712 100%);
          min-height: 100vh;
          color: #f8fafc;
          font-family: 'Outfit', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 40px 24px;
          overflow-x: hidden;
          position: relative;
        }

        .landing-grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 1;
        }

        .landing-glow-orb {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%);
          top: -200px;
          filter: blur(80px);
          z-index: 0;
        }

        .landing-header {
          width: 100%;
          max-width: 1100px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 50px;
          z-index: 20;
          position: relative;
          top: 0;
          left: 0;
        }

        .landing-header-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .landing-logo-box {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: #ffffff;
          border: 1.5px solid rgba(56, 189, 248, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 24px rgba(56, 189, 248, 0.25);
          padding: 4px;
          overflow: hidden;
        }

        .landing-logo-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transform: scale(1.2);
        }

        .landing-brand h1 {
          font-size: 2.0rem;
          font-weight: 800;
          letter-spacing: -0.3px;
          margin: 0;
          color: #0284c7;
        }

        .landing-brand span {
          font-size: 0.74rem;
          color: #64748b;
          letter-spacing: 1.5px;
          font-weight: 700;
          text-transform: uppercase;
          display: block;
          margin-top: 3px;
        }

        .landing-hero {
          max-width: 900px;
          text-align: center;
          z-index: 10;
          margin-bottom: 50px;
        }

        .landing-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #a5b4fc;
          margin-bottom: 24px;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
        }

        .landing-title {
          font-size: 3.8rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
          background: linear-gradient(to right, #f8fafc, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .landing-subtitle {
          font-size: 1.25rem;
          color: #94a3b8;
          max-width: 720px;
          margin: 0 auto 40px auto;
          line-height: 1.6;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .landing-enter-btn {
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border: none;
          padding: 16px 42px;
          border-radius: 16px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 8px 28px rgba(99, 102, 241, 0.4), 0 0 30px rgba(99, 102, 241, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .landing-enter-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 36px rgba(99, 102, 241, 0.55), 0 0 40px rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
        }

        .landing-enter-btn:active {
          transform: translateY(-1px) scale(1.0);
        }

        .landing-enter-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent);
          transform: rotate(30deg);
          animation: btn-shine 4s infinite linear;
        }

        @keyframes btn-shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .landing-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          width: 100%;
          max-width: 1100px;
          margin-bottom: 60px;
          z-index: 10;
        }

        .landing-stat-card {
          background: rgba(17, 24, 39, 0.45);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 22px 16px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 125px;
        }

        .landing-stat-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          background: rgba(17, 24, 39, 0.7);
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(99, 102, 241, 0.12);
        }

        .landing-stat-value {
          font-size: 2.1rem;
          font-weight: 800;
          background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
          line-height: 1;
        }

        .landing-stat-value.highlight {
          background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .landing-stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          line-height: 1.45;
          margin-top: 4px;
        }

        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
          max-width: 1100px;
          margin-bottom: 60px;
          z-index: 10;
        }

        .landing-feature-card {
          background: rgba(17, 24, 39, 0.4);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 24px;
          padding: 32px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .landing-feature-card:hover {
          border-color: rgba(99, 102, 241, 0.25);
          background: rgba(26, 36, 56, 0.5);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(99, 102, 241, 0.08);
        }

        .landing-feature-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          color: white;
        }

        .landing-feature-icon.blue {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .landing-feature-icon.purple {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #c084fc;
        }

        .landing-feature-icon.orange {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.3);
          color: #fb923c;
        }

        .landing-feature-card h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #f8fafc;
        }

        .landing-feature-card p {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .landing-console-box {
          width: 100%;
          max-width: 1100px;
          background: rgba(9, 13, 22, 0.85);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 20px;
          font-family: var(--font-mono);
          z-index: 10;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.5);
          margin-bottom: 40px;
        }

        .console-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .console-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .console-dot.red { background: #ef4444; }
        .console-dot.yellow { background: #f59e0b; }
        .console-dot.green { background: #10b981; }

        .console-title {
          font-size: 0.8rem;
          color: #475569;
          font-weight: 700;
          margin-left: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .console-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.82rem;
          min-height: 120px;
        }

        .console-line {
          display: flex;
          gap: 12px;
          line-height: 1.5;
        }

        .console-time {
          color: #64748b;
          flex-shrink: 0;
        }

        .console-msg {
          color: #e2e8f0;
          word-break: break-all;
        }

        .console-msg.success { color: #34d399; }
        .console-msg.warning { color: #facc15; }
        .console-msg.danger { color: #f87171; }

        .landing-footer {
          z-index: 10;
          color: #475569;
          font-size: 0.85rem;
          text-align: center;
          margin-top: auto;
          width: 100%;
          border-top: 1px solid rgba(255,255,255,0.03);
          padding-top: 24px;
        }

        @media (max-width: 968px) {
          .landing-title { font-size: 2.8rem; }
          .landing-features-grid { grid-template-columns: 1fr; }
          .landing-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 640px) {
          .landing-container { padding: 20px 14px; }
          .landing-header { flex-direction: column; gap: 16px; align-items: center; margin-bottom: 30px; text-align: center; }
          .landing-header-brand { flex-direction: column; gap: 10px; align-items: center; }
          .landing-title { font-size: 2.1rem; letter-spacing: -0.5px; line-height: 1.25; }
          .landing-subtitle { font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
          .landing-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 36px; }
          .landing-stat-card { padding: 14px 10px; min-height: 90px; border-radius: 14px; }
          .landing-stat-value { font-size: 1.5rem; }
          .landing-stat-label { font-size: 0.65rem; }
          .landing-enter-btn { width: 100%; justify-content: center; padding: 14px 20px; font-size: 1.0rem; border-radius: 12px; }
          .landing-logo-box { width: 48px; height: 48px; border-radius: 12px; }
          .landing-brand h1 { font-size: 1.5rem; }
          .landing-brand span { font-size: 0.65rem; }
          .landing-console-box { padding: 12px; border-radius: 14px; }
          .console-line { font-size: 0.72rem; flex-direction: column; gap: 2px; }
          .doc-tabs-header { overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; padding-bottom: 8px; }
          .doc-tab-btn { flex-shrink: 0; white-space: nowrap; font-size: 0.78rem; padding: 8px 14px; }
        }
      `}</style>

      <div className="landing-grid-bg" />
      <div className="landing-glow-orb" />

      {/* Header Top Navbar */}
      <motion.div 
        className="landing-header"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="landing-header-brand">
          <div className="landing-logo-box">
            <img src="/img/LOGO1.jpeg" alt="Crypto - Sentinel Logo" />
          </div>
          <div className="landing-brand">
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '2.0rem', fontWeight: 800, color: '#0284c7', margin: 0 }}>
              Crypto - Sentinel
            </h1>
            <span style={{ color: '#64748b', letterSpacing: '1.5px', fontWeight: 700, fontSize: '0.74rem', display: 'block', marginTop: 3 }}>DETECT • INFILTRATE • INTELLIGENCE</span>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={onEnter}
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            border: 'none',
            borderRadius: 12,
            padding: '10px 20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.35)',
            cursor: 'pointer'
          }}
        >
          <span>Buka Konsol Forensik</span>
          <ArrowRight size={16} />
        </button>
      </motion.div>

      {/* Hero Section */}
      <div className="landing-hero">
        <motion.div 
          className="landing-badge"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Zap size={14} className="animate-pulse" style={{ color: '#fdba74' }} />
          <span>Digdaya x Hackathon PIDI 2026 Submission</span>
        </motion.div>

        <motion.h2 
          className="landing-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          Smart Circuit Breaker &<br />Forensic Graph Engine
        </motion.h2>

        <motion.p 
          className="landing-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ maxWidth: 840, lineHeight: 1.75, fontSize: '1.15rem' }}
        >
          Crypto-Sentinel adalah <strong>Fraud Detection System (FDS) berbasis AI</strong> yang memproteksi gerbang transaksi perbankan nasional (SNAP BI). Memadukan Machine Learning &amp; Graph Neural Network (GNN) untuk memetakan jaringan <em>mule ring</em>, memotong pola <em>Smurfing</em>, dan menghentikan pelarian dana ke ekosistem kripto sebelum mutasi saldo diselesaikan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button className="landing-enter-btn" onClick={onEnter}>
            <span>Mulai Penyelidikan Forensik</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>

      {/* Statistics Row */}
      <motion.div 
        className="landing-stats-grid"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="landing-stat-card">
          <div className="landing-stat-value highlight">Rp 500 M+</div>
          <div className="landing-stat-label">Target Dana Diselamatkan</div>
        </div>
        <div className="landing-stat-card">
          <div className="landing-stat-value">&lt; 50 ms</div>
          <div className="landing-stat-label">Target Latensi FDS</div>
        </div>
        <div className="landing-stat-card">
          <div className="landing-stat-value">250+ Bank</div>
          <div className="landing-stat-label">Target Integrasi BPR &amp; BPD Jawa Barat</div>
        </div>
        <div className="landing-stat-card">
          <div className="landing-stat-value">96.8%</div>
          <div className="landing-stat-label">Target Akurasi GNN</div>
        </div>
      </motion.div>

      {/* Three Pillars Features */}
      <motion.div 
        className="landing-features-grid"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="landing-feature-card">
          <div className="landing-feature-icon blue">
            <Zap size={24} />
          </div>
          <h3>Smart Circuit Breaker</h3>
          <p>
            Mencegah pengeluaran dana ke rekening penipu seketika dengan pemblokiran otomatis berbasis risiko tinggi.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="landing-feature-icon purple">
            <Brain size={24} />
          </div>
          <h3>Forensic GNN Visualizer</h3>
          <p>
            Menyajikan visualisasi graf hubungan relasional antara bank asal, mule accounts, wallet kripto, dan bursa kripto tujuan.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="landing-feature-icon orange">
            <FileText size={24} />
          </div>
          <h3>Auto-Generated STR</h3>
          <p>
            Mempercepat pelaporan LTKM ke PPATK dengan draf narasi kasus berbasis AI yang selesai dalam waktu kurang dari 3 menit.
          </p>
        </div>
      </motion.div>

      {/* Real-time Rolling Console Log */}
      <motion.div 
        className="landing-console-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
      >
        <div className="console-header">
          <div className="console-dot red" />
          <div className="console-dot yellow" />
          <div className="console-dot green" />
          <span className="console-title">Live Scanning Activity Logs</span>
        </div>
        <div className="console-body">
          {tickerLogs.map(log => (
            <div className="console-line" key={log.id}>
              <span className="console-time">[{log.time}]</span>
              <span className={`console-msg ${log.type}`}>
                {log.type === 'success' ? '✓ ' : log.type === 'warning' ? '⚠ ' : log.type === 'danger' ? '✗ ' : '$ '}
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Scroll-down Section: Target Pengguna, Arsitektur &amp; BMC */}
      <div 
        id="explore-docs"
        style={{
          width: '100%',
          maxWidth: 1100,
          background: 'rgba(17, 24, 39, 0.45)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 24,
          padding: 32,
          marginBottom: 60,
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: '0.78rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>
            HACKATHON DOCUMENTATION SHOWCASE
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginTop: 4 }}>
            Dokumentasi &amp; Model Bisnis
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: 650, margin: '8px auto 0 auto' }}>
            Eksplorasi Target Pengguna, Rich Picture Alur Sistem, dan Business Model Canvas (BMC) Crypto-Sentinel.
          </p>
        </div>

        {/* Gallery Interactive Tab Navigation */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
          <div 
            onClick={() => setActiveDocTab('tp')}
            style={{ 
              background: activeDocTab === 'tp' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.06)', 
              border: activeDocTab === 'tp' ? '1.5px solid #818cf8' : '1px solid rgba(99, 102, 241, 0.2)', 
              padding: 20, 
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <h4 style={{ color: '#a5b4fc', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>1. Target Pengguna</h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Profil 4 aktor utama (Compliance Officer, Risk Manager, Regulator, &amp; Nasabah Bank).
            </p>
          </div>

          <div 
            onClick={() => setActiveDocTab('flow')}
            style={{ 
              background: activeDocTab === 'flow' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.06)', 
              border: activeDocTab === 'flow' ? '1.5px solid #fdba74' : '1px solid rgba(249, 115, 22, 0.2)', 
              padding: 20, 
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <h4 style={{ color: '#fdba74', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>2. Flowchart &amp; Rich Picture</h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Alur ekosistem end-to-end perbankan, gateway SNAP BI, dan logika keputusan FDS.
            </p>
          </div>

          <div 
            onClick={() => setActiveDocTab('bmc')}
            style={{ 
              background: activeDocTab === 'bmc' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.06)', 
              border: activeDocTab === 'bmc' ? '1.5px solid #6ee7b7' : '1px solid rgba(16, 185, 129, 0.2)', 
              padding: 20, 
              borderRadius: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <h4 style={{ color: '#6ee7b7', fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>3. Business Model Canvas</h4>
            <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Skema komersialisasi SaaS, Value Proposition, Revenue Streams, &amp; Key Partners.
            </p>
          </div>
        </div>

        {/* TAB 1: TARGET PENGGUNA (TP1 - TP4) */}
        {activeDocTab === 'tp' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 16 }}>
              <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
                <img src="/img/TP1.jpeg" alt="TP1 - Compliance Officer" style={{ width: '100%', borderRadius: 12, marginBottom: 14, objectFit: 'cover' }} />
                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>1. Analis Kepatuhan (Compliance Officer)</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>Peran:</strong> Memantau notifikasi transaksi berisiko tinggi secara real-time, meninjau alert smurfing (skor 50–84%), dan memverifikasi tindakan pembekuan rekening mule (*mule account*).
                </p>
              </div>

              <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
                <img src="/img/TP2.jpeg" alt="TP2 - Risk Manager" style={{ width: '100%', borderRadius: 12, marginBottom: 14, objectFit: 'cover' }} />
                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>2. Manajer Risiko &amp; AML (Risk Manager)</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>Peran:</strong> Mengatur ambang batas risiko (*risk threshold 85%*), mengevaluasi efektivitas aturan FDS, dan memantau statistik tren transaksi anomali antardomisili.
                </p>
              </div>

              <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
                <img src="/img/TP3.jpeg" alt="TP3 - Regulator OJK/PPATK" style={{ width: '100%', borderRadius: 12, marginBottom: 14, objectFit: 'cover' }} />
                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>3. Regulator (OJK &amp; PPATK)</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>Peran:</strong> Menerima draf otomatis Laporan Transaksi Keuangan Mencurigakan (LTKM/STR) lengkap dengan narasi kasus berbasis AI dan bukti audit forensik digital.
                </p>
              </div>

              <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 16 }}>
                <img src="/img/TP4.jpeg" alt="TP4 - Nasabah Perbankan" style={{ width: '100%', borderRadius: 12, marginBottom: 14, objectFit: 'cover' }} />
                <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>4. Nasabah Perbankan (Consumer Banking)</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  <strong>Peran:</strong> Mendapatkan jaminan keamanan akun dari bahaya penyalahgunaan rekening penampung (*mule account*) dan tindak kejahatan rekening mule.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FLOWCHART & RICH PICTURE */}
        {activeDocTab === 'flow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
              <h4 style={{ color: '#fdba74', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>A. Rich Picture Ecosystem (Alur Interaksi Sistem)</h4>
              <img src="/img/rich-picture.jpeg" alt="Rich Picture Ecosystem" style={{ width: '100%', borderRadius: 12, marginBottom: 14, border: '1px solid rgba(249, 115, 22, 0.3)' }} />
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <strong>Penjelasan Alur:</strong> Diagram Rich Picture di atas menggambarkan hubungan end-to-end dari transaksi nasabah pengirim (Mobile Banking Bank Kuningan) melalui API Gateway SNAP BI perbankan. Mesin FDS Crypto-Sentinel mengevaluasi transaksi menggunakan perpaduan *Rule Engine* dan model kecerdasan *PyTorch Graph Neural Network (GNN)*. Apabila terdeteksi indikasi smurfing ($\ge 4$ transaksi unik/1 jam), mutasi saldo dibatalkan seketika (*Smart Circuit Breaker*), notifikasi dikirim ke analis, dan draf resmi STR PPATK otomatis diterbitkan.
              </p>
            </div>

            <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
              <h4 style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '1.1rem', marginBottom: 10 }}>B. Flowchart Logika Keputusan FDS</h4>
              <img src="/img/Flowchart.jpeg" alt="Flowchart Decision Logic" style={{ width: '100%', borderRadius: 12, marginBottom: 14, border: '1px solid rgba(99, 102, 241, 0.3)' }} />
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <strong>Penjelasan Logika:</strong> Flowchart di atas memperlihatkan alur keputusan bertahap: 1) Evaluasi limit nominal &amp; verifikasi geolokasi perangkat, 2) Pengecekan frekuensi pengiriman ke rekening mule (smurfing check), 3) Kalkulasi Skor Risiko Hibrida ML + GNN. Hasil dikategorikan menjadi 3 keputusan: <strong>ALLOW (&lt; 50%)</strong> untuk transaksi normal, <strong>REVIEW (50–84%)</strong> untuk persetujuan manual analis, dan <strong>BLOCK (&ge; 85%)</strong> untuk pemblokiran otomatis instan.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: BUSINESS MODEL CANVAS (BMC) */}
        {activeDocTab === 'bmc' && (
          <div style={{ background: 'rgba(9, 13, 22, 0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <h4 style={{ color: '#6ee7b7', fontWeight: 700, fontSize: '1.1rem', marginBottom: 12 }}>Business Model Canvas (BMC) Crypto-Sentinel</h4>
            <img src="/img/BMC.jpeg" alt="Business Model Canvas" style={{ width: '100%', borderRadius: 12, marginBottom: 16, border: '1px solid rgba(16, 185, 129, 0.3)' }} />
            <div style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.6 }}>
              <p style={{ marginBottom: 8 }}>
                <strong>Penjelasan Detail Model Bisnis:</strong>
              </p>
              <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <li><strong>Value Proposition:</strong> Solusi FDS pencegahan pelarian dana judi online dan TPPU ke kripto berbasis AI real-time dengan latensi &lt;50ms, standar SNAP BI, serta otomatisasi draf STR PPATK.</li>
                <li><strong>Customer Segments:</strong> Bank Pembangunan Daerah (Bank BJB), 250+ BPR &amp; BPRS se-Jawa Barat, serta Bank KBMI IV.</li>
                <li><strong>Revenue Streams:</strong> Skema B2B SaaS Subscription (Biaya lisensi tahunan per bank) + Micro-Fee per API scanning call.</li>
                <li><strong>Key Partners:</strong> Otoritas Jasa Keuangan (OJK), Pusat Pelaporan dan Analisis Transaksi Keuangan (PPATK), Bappebti, Perbarindo Jawa Barat, serta Bursa Kripto Terlisensi (Indodax &amp; Binance).</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="landing-footer">
        <p>© 2026 Crypto-Sentinel. Dibuat khusus untuk Hackathon PIDI 2026 oleh Tim Expresso.</p>
      </div>
    </div>
  );
}
