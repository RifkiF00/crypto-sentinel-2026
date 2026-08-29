import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ArrowRight, Brain, Zap, FileText,
  ChevronDown, Radio, CheckCircle, Play, Check, Clock, Lock,
  Send, Server, Cpu, Activity, RefreshCw, X, Mail, Phone, Building, MessageSquare, Calendar
} from 'lucide-react';

// ---- Scroll reveal wrapper ----
const Reveal = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : direction === 'down' ? -40 : 0,
      x: direction === 'left' ? 40 : direction === 'right' ? -40 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.75, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

// ---- Animated counter ----
function AnimatedNum({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let startTime = null;
        const duration = 2200;
        const step = (ts) => {
          if (!startTime) startTime = ts;
          const p = Math.min((ts - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{count.toLocaleString('id-ID')}{suffix}</span>;
}

// ---- Mini Animated Charts for Stat Cards ----
function MiniThroughputWaveChart() {
  return (
    <div style={{ width: '100%', height: 44, marginTop: 8, position: 'relative', overflow: 'hidden' }}>
      <svg viewBox="0 0 200 44" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="waveBlueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 36 Q 30 30, 60 33 T 110 18 T 160 10 T 200 4 L 200 44 L 0 44 Z"
          fill="url(#waveBlueGrad)"
        />
        <path
          d="M 0 36 Q 30 30, 60 33 T 110 18 T 160 10 T 200 4"
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="200" cy="4" r="4" fill="#2563eb" />
      </svg>
    </div>
  );
}

function MiniAccuracyModelBars() {
  const models = [
    { name: 'GraphSAGE GNN', score: 99.98, color: '#16a34a' },
    { name: 'Random Forest', score: 99.42, color: '#0284c7' },
    { name: 'Rule Engine OJK', score: 97.10, color: '#f59e0b' }
  ];
  return (
    <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {models.map((m, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.64rem', color: '#64748b' }}>
          <span style={{ width: 88, textAlign: 'left', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
          <div style={{ flex: 1, height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${m.score}%`, background: m.color, borderRadius: 3, transition: 'width 1s ease' }} />
          </div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: m.color, width: 42, textAlign: 'right' }}>{m.score}%</span>
        </div>
      ))}
    </div>
  );
}

function MiniLatencyPipelineSpectrum() {
  const steps = [
    { name: 'Rule Engine', ms: 3.8, color: '#0284c7', pct: '24%' },
    { name: 'Random Forest', ms: 6.5, color: '#8b5cf6', pct: '41%' },
    { name: 'GraphSAGE GNN', ms: 5.7, color: '#f59e0b', pct: '35%' },
  ];
  return (
    <div style={{ width: '100%', marginTop: 8 }}>
      <div style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', background: '#f1f5f9', marginBottom: 5 }}>
        {steps.map((st, i) => (
          <div
            key={i}
            style={{ height: '100%', width: st.pct, background: st.color }}
            title={`${st.name}: ${st.ms}ms`}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>
        <span>Rule 3.8ms</span>
        <span>RF 6.5ms</span>
        <span>GNN 5.7ms</span>
      </div>
      <div style={{ fontSize: '0.62rem', color: '#16a34a', fontWeight: 700, marginTop: 4, textAlign: 'center' }}>
        ⚡ Total: 16.0ms (SLA &lt;18ms Pass)
      </div>
    </div>
  );
}

function MiniGraphClusterChart() {
  return (
    <div style={{ width: '100%', height: 44, marginTop: 8, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 200 44" style={{ width: '100%', height: '100%' }}>
        <line x1="25" y1="22" x2="75" y2="12" stroke="#dc2626" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.6" />
        <line x1="25" y1="22" x2="75" y2="32" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3,3" opacity="0.6" />
        <line x1="75" y1="12" x2="135" y2="22" stroke="#16a34a" strokeWidth="1.2" opacity="0.6" />
        <line x1="75" y1="32" x2="135" y2="22" stroke="#16a34a" strokeWidth="1.2" opacity="0.6" />
        <line x1="135" y1="22" x2="185" y2="22" stroke="#2563eb" strokeWidth="1.5" opacity="0.8" />

        <circle cx="25" cy="22" r="5" fill="#dc2626" />
        <circle cx="75" cy="12" r="4" fill="#f59e0b" />
        <circle cx="75" cy="32" r="4" fill="#f59e0b" />
        <circle cx="135" cy="22" r="5.5" fill="#16a34a" />
        <circle cx="185" cy="22" r="4" fill="#2563eb" />
      </svg>
    </div>
  );
}

// ---- Team members ----
const team = [
  {
    name: 'Rifki Firmansyah',
    role: 'AI Architect & Team Lead',
    initials: 'RF',
    color: '#1e3a8a',
    desc: 'Bertanggung jawab atas seluruh arsitektur AI/ML sistem Crypto-Sentinel, mulai dari model Random Forest, Graph Neural Network, hingga rule engine 15 indikator. Sekaligus menjadi product strategist dan memimpin koordinasi kemitraan dengan Bank Kuningan dan BRI Kuningan.',
    tags: ['AI/ML', 'GNN', 'Product Strategy', 'Team Lead'],
  },
  {
    name: 'Aam Setiana',
    role: 'Frontend & Product Analyst',
    initials: 'AS',
    color: '#164e63',
    desc: 'Merancang dan mengembangkan antarmuka dashboard forensik berbasis React — termasuk GNN Visualization real-time, panel alert, dan seluruh komponen UI yang digunakan analis kepatuhan bank untuk mengawasi transaksi mencurigakan.',
    tags: ['React', 'Dashboard UI', 'GNN Visualization', 'Product Analysis'],
  },
  {
    name: 'Desta Erlangga',
    role: 'Backend & Integration Developer',
    initials: 'DE',
    color: '#14532d',
    desc: 'Membangun seluruh infrastruktur backend FastAPI yang menghubungkan core banking Expresso dengan FDS engine, termasuk endpoint analisis transaksi, STR/LTKM generator, dan sistem pelaporan real-time ke dashboard.',
    tags: ['FastAPI', 'SQLite', 'API Integration', 'STR Generator'],
  },
  {
    name: 'Billy Jonathan',
    role: 'Mobile Developer & Security Analyst',
    initials: 'BJ',
    color: '#92400e',
    desc: 'Mengembangkan aplikasi mobile banking Bank Kuningan berbasis Flutter yang terintegrasi penuh dengan SNAP BI authentication (HMAC-SHA256). Juga berperan sebagai security analyst yang memastikan seluruh jalur komunikasi API aman.',
    tags: ['Flutter', 'SNAP BI', 'HMAC-SHA256', 'Cybersecurity'],
  },
];

// ---- FAQ ----
const faqs = [
  { q: 'Apa itu Crypto-Sentinel FDS?', a: 'Crypto-Sentinel adalah Security Middleware Layer yang berjalan sebagai lapisan intersepsi antara aplikasi mobile banking nasabah dan core banking bank. Setiap transaksi melewati mesin AI kami sebelum saldo berubah — memastikan tidak ada dana yang keluar ke tangan yang salah.' },
  { q: 'Bagaimana sistem bekerja dalam <18ms?', a: 'Mesin rule engine kami dioptimalkan untuk berjalan di RAM tanpa akses disk. Graf transaksi (NetworkX) disimpan in-memory dan diperbarui secara incremental. Model Hybrid GNN + Random Forest hanya memerlukan forward pass pada vektor 13 fitur — total komputasi selesai dalam <18ms per transaksi.' },
  { q: 'Apakah sistem ini patuh regulasi OJK dan PPATK?', a: 'Ya. Crypto-Sentinel mematuhi SNAP BI (PADG No. 23/18/PADG/2021) untuk autentikasi API, ISO 20022 untuk standardisasi pesan transaksi, dan menghasilkan laporan LTKM sesuai format PPATK goAML berdasarkan UU No. 8 Tahun 2010 tentang TPPU.' },
  { q: 'Bagaimana integrasi ke core banking yang sudah ada?', a: 'Sistem dirancang sebagai plug-and-play middleware. Bank cukup mengarahkan traffic transfer API ke endpoint Crypto-Sentinel sebelum meneruskan ke core banking. Tidak ada perubahan pada sistem core banking yang sudah berjalan.' },
  { q: 'Apakah data nasabah aman?', a: 'Data nasabah diproses secara in-memory dan tidak disimpan oleh Crypto-Sentinel. Hanya log transaksi anonim dan skor risiko yang dicatat untuk keperluan audit. Roadmap kami mencakup implementasi Federated Learning (UU PDP No. 27/2022 compliant).' },
];

// ---- Animated Interception Pipeline Component ----
function AnimatedFlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Inisiasi Transfer',
      desc: 'Nasabah tap "Lanjutkan" di m-banking. Request dikirim ke Expresso API dengan SNAP BI Header.',
      icon: Send,
      color: '#3b82f6',
      badge: 'SNAP BI Validated'
    },
    {
      num: '02',
      title: 'Validasi Core Banking',
      desc: 'Expresso memverifikasi signature & 5 transaksi terakhir pengirim sebelum meneruskan paket.',
      icon: Server,
      color: '#818cf8',
      badge: 'Signature Verified'
    },
    {
      num: '03',
      title: 'Evaluasi FDS AI',
      desc: 'Rule engine + Random Forest + GNN PageRank berjalan paralel. 13 sub-indikator fraud dievaluasi secara real-time (<18ms).',
      icon: Cpu,
      color: '#f59e0b',
      badge: 'High Risk (Score: 100%)'
    },
    {
      num: '04',
      title: 'Keputusan & Aksi',
      desc: 'BLOCK → Rekening dibekukan langsung & draft LTKM ter-generate otomatis.',
      icon: Lock,
      color: '#ef4444',
      badge: 'AUTO BLOCK & FREEZE'
    }
  ];

  return (
    <div style={{
      background: 'linear-gradient(145deg, #09132e, #040917)',
      border: '1px solid rgba(59,130,246,0.3)',
      borderRadius: '24px',
      padding: '32px 28px',
      color: '#ffffff',
      boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient lighting */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.2), transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16 }}>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: 2, color: '#38bdf8', textTransform: 'uppercase' }}>
            // INTERCEPTION PIPELINE
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
            Alur Deteksi Real-Time
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', padding: '6px 12px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, color: '#4ade80' }}>
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }}
          />
          INTERCEPTING &lt;18ms
        </div>
      </div>

      {/* Steps Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          const isActive = activeStep === idx;
          return (
            <div key={idx} style={{ position: 'relative' }}>
              {/* Vertical Animated Pulse Pipeline */}
              {idx < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 23,
                  top: 48,
                  bottom: -16,
                  width: 2,
                  background: 'rgba(255,255,255,0.1)',
                  zIndex: 1
                }}>
                  {isActive && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 2.2, ease: 'linear', repeat: Infinity }}
                      style={{
                        position: 'absolute',
                        width: 6,
                        height: 14,
                        left: -2,
                        borderRadius: 3,
                        background: step.color,
                        boxShadow: `0 0 10px ${step.color}`
                      }}
                    />
                  )}
                </div>
              )}

              {/* Step Card */}
              <motion.div
                onClick={() => setActiveStep(idx)}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  borderColor: isActive ? step.color : 'rgba(255,255,255,0.08)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)'
                }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: '16px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  background: isActive ? step.color : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: isActive ? `0 0 20px ${step.color}66` : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <IconComp size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: isActive ? '#ffffff' : '#cbd5e1', margin: 0 }}>
                      {step.num}. {step.title}
                    </h4>
                    {isActive && (
                      <span style={{ fontSize: '0.66rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', background: `${step.color}22`, color: step.color, border: `1px solid ${step.color}44` }}>
                        {step.badge}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0, lineHeight: 1.45 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LandingPage({ onEnter }) {
  const [activeDocTab, setActiveDocTab] = useState('tp');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    institution: '',
    email: '',
    need: 'Integrasi Core Banking (SNAP BI)',
    message: ''
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const [tickerLogs, setTickerLogs] = useState([
    { id: 1, time: '07:41:02', msg: 'FDS Engine v3.2 initialized. 15 detection rules loaded.', type: 'info' },
    { id: 2, time: '07:41:09', msg: '[ALLOW] TXN-20260810-0021 | Rp 500.000 → Siti Rahma | Score: 12% | 17ms', type: 'success' },
    { id: 3, time: '07:41:22', msg: '[BLOCK] TXN-20260810-0034 | Rp 90.000.000 → Indodax BCA | Score: 100% | Smurfing+Blacklist', type: 'danger' },
  ]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const logs = [
      { msg: '[ALLOW] TXN-20260810-0112 | Rp 200.000 → Siti Rahma | Score: 8% | 16ms', type: 'success' },
      { msg: '[REVIEW] TXN-20260810-0139 | Rp 6.000.000 → BNI External | Score: 65% | Odd-Hour+High Amount', type: 'warning' },
      { msg: '[BLOCK] TXN-20260810-0156 | Rp 15.000.000 → Indodax Escrow BCA | Score: 100% | Blacklisted Wallet', type: 'danger' },
      { msg: 'Smurfing detected: 4 unique destinations/60min — account 0123456789 upstream frozen.', type: 'danger' },
      { msg: 'LTKM draft auto-generated for alert #8831. PPATK goAML format. Ready to sign.', type: 'info' },
      { msg: '[ALLOW] TXN-20260810-0201 | Rp 350.000 → Bank Kuningan internal | Score: 0% | 14ms', type: 'success' },
      { msg: 'GNN topology updated: 562.239 nodes, 308.213 edges. PageRank centrality recalculated.', type: 'info' },
      { msg: '[BLOCK] TXN-20260810-0219 | Rp 50.000.000 → Tokocrypto Mandiri | Score: 95% | Purpose Mismatch', type: 'danger' },
    ];
    const iv = setInterval(() => {
      const log = logs[Math.floor(Math.random() * logs.length)];
      const now = new Date();
      const t = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;
      setTickerLogs(prev => [{ id: Date.now(), time: t, ...log }, ...prev.slice(0, 5)]);
    }, 3200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="lp">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .lp {
          background: #f0f5ff;
          min-height: 100vh;
          color: #111111;
          font-family: 'Outfit', sans-serif;
        }

        /* ---- NAV (FIXED STICKY HEADER) ---- */
        .lp-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          width: 100%;
          background: rgba(240,245,255,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }

        .lp-nav-container {
          max-width: 1340px;
          margin: 0 auto;
          padding: 0 48px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .lp-nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .lp-nav-logo {
          width: 44px; height: 44px;
          background: transparent;
          border: none;
          padding: 0;
          overflow: visible;
          display: flex; align-items: center; justify-content: center;
          box-shadow: none;
        }

        .lp-nav-logo img { width: 100%; height: 100%; object-fit: contain; }

        .lp-nav-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 800;
          color: #111111;
          letter-spacing: -0.3px;
        }

        .lp-nav-name span { color: #1e3a8a; }

        .lp-nav-links {
          display: flex; align-items: center; gap: 4px; list-style: none;
        }

        .lp-nav-links a {
          padding: 7px 16px;
          font-size: 0.88rem; font-weight: 600;
          color: #777777;
          text-decoration: none;
          border-radius: 9999px;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .lp-nav-links a:hover { color: #111111; background: rgba(0,0,0,0.05); }

        .lp-nav-cta {
          display: inline-flex; align-items: center; gap: 8px;
          background: #1e3a8a;
          border: none; border-radius: 9999px;
          padding: 10px 22px;
          font-size: 0.88rem; font-weight: 700; color: white;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 4px 16px rgba(30,58,138,0.3);
          transition: all 0.3s ease;
        }

        .lp-nav-cta:hover {
          background: #1e40af;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(30,58,138,0.4);
        }

        /* ---- HERO MATCHING MOCKUP IMAGE ---- */
        .lp-hero-wrapper {
          max-width: 1340px;
          margin: 0 auto;
          padding: 118px 48px 40px;
          position: relative;
        }

        .lp-hero-grid {
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 48px;
          align-items: center;
        }

        .lp-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 16px;
          background: rgba(37,99,235,0.06);
          border: 1px solid rgba(37,99,235,0.2);
          border-radius: 9999px;
          font-size: 0.75rem; font-weight: 700; color: #2563eb;
          letter-spacing: 0.8px; text-transform: uppercase;
          margin-bottom: 24px;
        }

        .lp-hero-title {
          font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
          font-size: 3.4rem; font-weight: 800;
          line-height: 1.15; letter-spacing: -0.8px;
          margin-bottom: 20px; color: #0b1329;
        }

        .lp-hero-title .highlight-blue { color: #2563eb; }

        .lp-hero-sub {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.0rem; color: #475569;
          line-height: 1.7; margin-bottom: 32px;
          max-width: 560px;
        }

        .lp-hero-btns { display: flex; align-items: center; gap: 14px; margin-bottom: 40px; }

        .lp-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: #2563eb; border: none;
          border-radius: 12px; padding: 14px 28px;
          font-size: 0.92rem; font-weight: 700; color: white;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
          transition: all 0.3s ease;
        }

        .lp-btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,0.45);
        }

        .lp-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: white;
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 12px; padding: 14px 24px;
          font-size: 0.92rem; font-weight: 600; color: #334155;
          cursor: pointer; font-family: 'Outfit', sans-serif;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.3s ease;
        }

        .lp-btn-secondary:hover {
          border-color: rgba(0,0,0,0.25);
          color: #0f172a;
          background: #f8fafc;
        }

        /* Bottom Feature Strip (Dark Navy 3-Column Card) */
        .lp-hero-strip {
          background: #09132e;
          border-radius: 16px;
          padding: 20px 24px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          box-shadow: 0 12px 36px rgba(9,19,46,0.3);
          color: white;
        }

        .lp-strip-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lp-strip-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          flex-shrink: 0;
        }

        .lp-strip-title {
          font-size: 0.86rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 2px;
        }

        .lp-strip-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.35;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* Right column illustration & risk card */
        .lp-hero-visual-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .lp-hero-shield-img {
          width: 100%;
          max-width: 580px;
          border-radius: 24px;
          display: block;
          transform: scale(1.05);
        }

        /* Glassmorphism Risk Panel (matching exact mockup) */
        .lp-risk-glass-panel {
          position: absolute;
          right: -25px;
          top: 50%;
          transform: translateY(-50%);
          width: 270px;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.14);
          color: #0f172a;
          z-index: 10;
        }

        .lp-risk-glass-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .lp-risk-score-num {
          font-size: 1.6rem;
          font-weight: 900;
          color: #ef4444;
          line-height: 1;
        }

        .lp-risk-score-num span {
          font-size: 0.95rem;
          color: #64748b;
          font-weight: 600;
        }

        .lp-risk-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #ef4444;
          margin-top: 3px;
        }

        .lp-risk-decision-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 10px;
        }

        .lp-decision-box {
          border-radius: 10px;
          padding: 8px 12px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .lp-decision-box.allow {
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.3);
          color: #16a34a;
        }

        .lp-decision-box.review {
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.3);
          color: #d97706;
        }

        .lp-decision-box.block {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #dc2626;
        }

        /* ---- HERO MOCKUP (terminal — keep dark) ---- */
        .lp-hero-mockup { position: relative; }

        .lp-mockup-frame {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 20px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08);
          position: relative; overflow: hidden;
        }

        .lp-mockup-frame::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #1e3a8a, #2563eb, #1e3a8a);
          background-size: 200% 100%;
          animation: gradient-slide 3s linear infinite;
        }

        @keyframes gradient-slide {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }

        .lp-mockup-dots { display: flex; gap: 6px; margin-bottom: 14px; }
        .lp-mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-mockup-dot.r { background: #ef4444; }
        .lp-mockup-dot.y { background: #f59e0b; }
        .lp-mockup-dot.g { background: #10b981; }

        .lp-mockup-console {
          background: rgba(6,9,18,0.95);
          border-radius: 12px; padding: 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem; min-height: 200px;
        }

        .lp-mockup-row {
          display: flex; gap: 10px;
          margin-bottom: 6px; line-height: 1.5;
        }

        .lp-mockup-time { color: #334155; flex-shrink: 0; }
        .lp-mockup-msg { word-break: break-all; }
        .lp-mockup-msg.s { color: #34d399; }
        .lp-mockup-msg.w { color: #fbbf24; }
        .lp-mockup-msg.d { color: #f87171; }
        .lp-mockup-msg.i { color: #475569; }

        .lp-mockup-stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 10px; margin-top: 14px;
        }

        .lp-mockup-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 10px; text-align: center;
        }

        .lp-mockup-stat-val {
          font-size: 1.05rem; font-weight: 800;
          font-family: 'Outfit', sans-serif;
        }

        .lp-mockup-stat-val.i { color: #818cf8; }
        .lp-mockup-stat-val.g { color: #34d399; }
        .lp-mockup-stat-val.r { color: #f87171; }

        .lp-mockup-stat-lbl {
          font-size: 0.58rem; color: #475569;
          text-transform: uppercase; letter-spacing: 0.5px;
          font-family: 'Outfit', sans-serif; margin-top: 3px;
        }

        /* Floating badges */
        .lp-hero-float {
          position: absolute;
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 14px; padding: 12px 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
          display: flex; align-items: center; gap: 10px;
        }

        .lp-hero-float.top-left {
          top: -20px; left: -20px;
          animation: float-1 4s ease-in-out infinite;
        }

        .lp-hero-float.bottom-right {
          bottom: -20px; right: -20px;
          animation: float-2 4s ease-in-out infinite 2s;
        }

        @keyframes float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes float-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(8px); }
        }

        /* ---- DIVIDER ---- */
        .lp-divider {
          width: 100%; height: 1px;
          background: rgba(0,0,0,0.08);
        }

        /* ---- SECTION ---- */
        .lp-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 48px;
        }

        .lp-section-tag {
          font-size: 0.7rem; font-weight: 800;
          text-transform: uppercase; letter-spacing: 3px;
          color: #1e3a8a; display: block; margin-bottom: 14px;
        }

        .lp-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 3rem; font-weight: 900;
          color: #111111; line-height: 1.12;
          letter-spacing: -0.5px; margin-bottom: 20px;
        }

        .lp-section-title .red { color: #1e3a8a; font-style: italic; }
        .lp-section-title .crimson-it { color: #1e3a8a; font-style: italic; }

        .lp-section-desc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem; color: #666666;
          line-height: 1.8; max-width: 620px;
        }

        /* ---- STATS ---- */
        .lp-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px; margin-top: 60px;
        }

        .lp-stat-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 24px; padding: 32px 20px;
          text-align: center; position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .lp-stat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.12);
        }

        .lp-stat-accent {
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px; border-radius: 24px 24px 0 0;
        }

        .lp-stat-icon {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; font-size: 1.5rem;
        }

        .lp-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem; font-weight: 900;
          line-height: 1; margin-bottom: 8px;
        }

        .lp-stat-lbl {
          font-size: 0.78rem; color: #888888;
          font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.8px; line-height: 1.5;
        }

        .lp-stat-badge {
          display: inline-block; margin-top: 12px;
          font-size: 0.68rem; padding: 3px 10px;
          border-radius: 9999px; font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ---- REGULATORY ---- */
        .lp-reg-strip {
          display: flex; align-items: center;
          justify-content: center; gap: 10px;
          flex-wrap: wrap; margin-top: 60px;
          padding: 24px 0;
          border-top: 1px solid rgba(0,0,0,0.07);
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }

        .lp-reg-label {
          font-size: 0.68rem; text-transform: uppercase;
          letter-spacing: 2px; color: #cccccc;
          font-weight: 700; padding-right: 8px;
        }

        .lp-reg-badge {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 16px;
          background: white;
          border: 1px solid rgba(0,0,0,0.08);
          border-radius: 9999px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
        }

        .lp-reg-badge:hover {
          border-color: rgba(30,58,138,0.3);
          box-shadow: 0 4px 12px rgba(30,58,138,0.08);
        }

        .lp-reg-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #10b981;
          animation: blink 2s infinite;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

        .lp-reg-name { font-size: 0.8rem; font-weight: 800; color: #333333; }
        .lp-reg-desc { font-size: 0.68rem; color: #aaaaaa; }

        /* ---- LETTER SECTION (alt bg) ---- */
        .lp-letter-section {
          background: #0b1d3e;
          padding: 0;
        }

        .lp-letter {
          max-width: 1200px;
          margin: 0 auto;
          padding: 100px 48px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: start;
        }

        .lp-letter-text h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.8rem; font-weight: 900;
          line-height: 1.15; color: #f8f8f6;
          margin-bottom: 28px; letter-spacing: -0.5px;
        }

        .lp-letter-text h2 em { color: #2563eb; font-style: italic; }

        .lp-letter-text p {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.0rem; color: #888888;
          line-height: 1.85; margin-bottom: 18px;
        }

        .lp-letter-text p strong { color: #bbbbbb; font-weight: 600; }

        .lp-letter-blockquote {
          margin-top: 28px;
          border-left: 3px solid #2563eb;
          padding-left: 20px;
        }

        .lp-letter-blockquote p {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; font-weight: 700;
          font-style: italic; color: #f8f8f6;
          line-height: 1.6; margin: 0;
        }

        .lp-flow-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 32px;
          position: sticky; top: 100px;
        }

        .lp-flow-title {
          font-size: 0.7rem; text-transform: uppercase;
          letter-spacing: 2px; color: #444444;
          font-weight: 700; margin-bottom: 24px;
          font-family: 'JetBrains Mono', monospace;
        }

        .lp-flow-step {
          display: flex; align-items: flex-start;
          gap: 16px; padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .lp-flow-step:last-child { border-bottom: none; }

        .lp-flow-num {
          width: 32px; height: 32px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 800; flex-shrink: 0;
          font-family: 'JetBrains Mono', monospace;
        }

        .lp-flow-step-content h4 {
          font-size: 0.9rem; font-weight: 700;
          color: #e2e8f0; margin-bottom: 4px;
        }

        .lp-flow-step-content p {
          font-size: 0.8rem; color: #555555;
          line-height: 1.55;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ---- FEATURES ---- */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px; margin-top: 60px;
        }

        .lp-feat {
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 24px; padding: 36px 28px;
          transition: all 0.4s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .lp-feat:hover {
          border-color: rgba(30,58,138,0.15);
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.1);
        }

        .lp-feat-icon {
          width: 54px; height: 54px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 22px;
        }

        .lp-feat h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 800;
          color: #111111; margin-bottom: 14px;
          letter-spacing: -0.2px;
        }

        .lp-feat p {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; color: #666666;
          line-height: 1.75; margin-bottom: 20px;
        }

        .lp-feat-tags { display: flex; flex-wrap: wrap; gap: 6px; }

        .lp-feat-tag {
          font-size: 0.7rem; padding: 3px 10px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          background: rgba(30,58,138,0.06);
          color: #1e3a8a;
          border: 1px solid rgba(30,58,138,0.15);
        }

        /* ---- CONSOLE (stays dark) ---- */
        .lp-console-wrap {
          background: #0f1117;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px; overflow: hidden;
          margin-top: 60px;
          box-shadow: 0 40px 80px rgba(0,0,0,0.15);
        }

        .lp-console-bar {
          display: flex; align-items: center; gap: 8px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(0,0,0,0.3);
        }

        .lp-cdot { width: 11px; height: 11px; border-radius: 50%; }
        .lp-cdot.r { background: #ef4444; }
        .lp-cdot.y { background: #f59e0b; }
        .lp-cdot.g { background: #10b981; }

        .lp-console-title-txt {
          font-size: 0.72rem; color: #334155;
          font-weight: 700; margin-left: 10px;
          text-transform: uppercase; letter-spacing: 1.5px;
          font-family: 'JetBrains Mono', monospace;
        }

        .lp-live {
          margin-left: auto; display: flex; align-items: center;
          gap: 6px; font-size: 0.7rem; color: #10b981;
          font-weight: 700; font-family: 'JetBrains Mono', monospace;
        }

        .lp-live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981; animation: blink 1.2s infinite;
        }

        .lp-console-body {
          padding: 20px; display: flex; flex-direction: column;
          gap: 7px; min-height: 200px;
          font-family: 'JetBrains Mono', monospace; font-size: 0.78rem;
        }

        .lp-log-line {
          display: flex; gap: 12px; line-height: 1.5;
          animation: log-in 0.35s ease;
        }

        @keyframes log-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .lp-log-time { color: #1e293b; flex-shrink: 0; }
        .lp-log-msg { word-break: break-all; }
        .lp-log-msg.s { color: #34d399; }
        .lp-log-msg.w { color: #fbbf24; }
        .lp-log-msg.d { color: #f87171; }
        .lp-log-msg.i { color: #475569; }

        /* ---- TEAM ---- */
        .lp-team-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px; margin-top: 60px;
        }

        .lp-team-card {
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 24px; padding: 32px;
          display: flex; gap: 22px; align-items: flex-start;
          transition: all 0.4s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }

        .lp-team-card:hover {
          border-color: rgba(30,58,138,0.15);
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.1);
        }

        .lp-team-avatar {
          width: 68px; height: 68px;
          border-radius: 18px; flex-shrink: 0;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid;
        }

        .lp-team-avatar-fallback {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 900;
        }

        .lp-team-info h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; font-weight: 800;
          color: #111111; margin-bottom: 4px;
          letter-spacing: -0.2px;
        }

        .lp-team-role {
          font-size: 0.75rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 12px; display: block;
        }

        .lp-team-desc {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.83rem; color: #666666;
          line-height: 1.7; margin-bottom: 14px;
        }

        .lp-team-tags { display: flex; flex-wrap: wrap; gap: 6px; }

        .lp-team-tag {
          font-size: 0.68rem; padding: 3px 10px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
          background: rgba(0,0,0,0.04);
          color: #888888;
          border: 1px solid rgba(0,0,0,0.08);
        }

        /* ---- FAQ ---- */
        .lp-faq { margin-top: 60px; display: flex; flex-direction: column; gap: 10px; }

        .lp-faq-item {
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          transition: border-color 0.3s ease;
        }

        .lp-faq-item.open { border-color: rgba(30,58,138,0.25); }

        .lp-faq-btn {
          width: 100%; display: flex; align-items: center;
          justify-content: space-between;
          padding: 22px 24px; background: none;
          border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif; text-align: left; gap: 16px;
        }

        .lp-faq-q { font-size: 1rem; font-weight: 700; color: #111111; line-height: 1.4; }

        .lp-faq-icon {
          flex-shrink: 0; color: #1e3a8a;
          transition: transform 0.3s ease;
        }

        .lp-faq-item.open .lp-faq-icon { transform: rotate(180deg); }

        .lp-faq-body {
          padding: 0 24px 22px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem; color: #666666; line-height: 1.8;
        }

        /* ---- DOCS ---- */
        .lp-docs {
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 28px; padding: 40px;
          margin-top: 60px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }

        .lp-doc-tabs {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 16px; margin-bottom: 32px;
        }

        .lp-doc-tab {
          padding: 20px 24px; border-radius: 16px;
          border: 1.5px solid; cursor: pointer;
          transition: all 0.3s ease; text-align: left;
          display: flex; flex-direction: column;
          justify-content: center; min-height: 86px;
          box-sizing: border-box;
        }

        .lp-doc-tab h4 { font-size: 0.94rem; font-weight: 700; margin: 0 0 6px 0; }

        .lp-doc-tab p {
          font-size: 0.78rem; color: #888888;
          line-height: 1.45;
          font-family: 'Plus Jakarta Sans', sans-serif; margin: 0;
        }

        .lp-doc-img-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;
        }

        .lp-doc-img-card {
          background: #f8f8f6;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 16px; padding: 18px;
        }

        .lp-doc-img-card img {
          width: 100%; border-radius: 10px;
          margin-bottom: 12px; object-fit: cover;
        }

        .lp-doc-img-card h4 {
          font-size: 0.88rem; font-weight: 700;
          color: #111111; margin-bottom: 6px;
        }

        .lp-doc-img-card p {
          font-size: 0.8rem; color: #666666;
          line-height: 1.6;
          font-family: 'Plus Jakarta Sans', sans-serif; margin: 0;
        }

        /* ---- FOOTER ---- */
        .lp-footer {
          border-top: 1px solid rgba(0,0,0,0.08);
          padding: 48px;
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 40px; align-items: center;
        }

        .lp-footer-brand h3 {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem; font-weight: 800;
          color: #111111; margin-bottom: 8px;
        }

        .lp-footer-brand p {
          font-size: 0.82rem; color: #999999;
          font-family: 'Plus Jakarta Sans', sans-serif;
          line-height: 1.6;
        }

        .lp-footer-right { text-align: right; }

        .lp-footer-right p {
          font-size: 0.78rem; color: #bbbbbb;
          font-family: 'Plus Jakarta Sans', sans-serif; line-height: 1.6;
        }

        /* ---- RESPONSIVE MEDIA QUERIES ---- */
        @media (max-width: 1024px) {
          .lp-nav-container { padding: 0 24px; }
          .lp-hero-wrapper { padding: 95px 24px 30px; }
          .lp-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .lp-hero-title { font-size: 2.8rem; }
          .lp-hero-shield-img { max-width: 100%; transform: none; }
          .lp-hero-strip { grid-template-columns: 1fr; gap: 16px; }
          .lp-letter { grid-template-columns: 1fr; gap: 40px; padding: 60px 24px; }
          .lp-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .lp-features-grid { grid-template-columns: 1fr; }
          .lp-team-grid { grid-template-columns: 1fr; }
          .lp-footer { grid-template-columns: 1fr; text-align: left; padding: 40px 24px; }
          .lp-footer-right { text-align: left; }
        }

        @media (max-width: 640px) {
          .lp-nav-container { padding: 0 16px; height: 60px; }
          .lp-nav-links { display: none; }
          .lp-nav-name { font-size: 1.05rem; }
          .lp-nav-cta { padding: 8px 16px !important; font-size: 0.78rem !important; }
          .lp-hero-wrapper { padding: 80px 16px 30px; }
          .lp-hero-title { font-size: 2.1rem; line-height: 1.2; }
          .lp-hero-sub { font-size: 0.9rem; }
          .lp-hero-btns { flex-direction: column; width: 100%; gap: 10px; }
          .lp-btn-primary, .lp-btn-secondary { width: 100%; justify-content: center; }
          .lp-hero-strip { grid-template-columns: 1fr; padding: 16px; }
          .lp-section { padding: 50px 16px; }
          .lp-section-title { font-size: 2.0rem; }
          .lp-stats-grid { grid-template-columns: 1fr; gap: 14px; }
          .lp-stat-card { padding: 24px 16px; }
          .lp-stat-val { font-size: 2.2rem; }
          .lp-reg-strip { justify-content: flex-start; overflow-x: auto; padding: 16px 0; }
          .lp-doc-tabs { grid-template-columns: 1fr; }
          .lp-doc-img-grid { grid-template-columns: 1fr; }
          .lp-doc-img-card { padding: 14px; }
          .lp-team-card { flex-direction: column; gap: 14px; padding: 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-nav-container">
          <div className="lp-nav-brand" onClick={() => scrollToSection('beranda')} style={{ cursor: 'pointer' }}>
            <div className="lp-nav-logo">
              <img src="/img/logo_transparent.png" alt="Logo" />
            </div>
            <div className="lp-nav-name">Crypto<span>-Sentinel 2026</span></div>
          </div>
          <ul className="lp-nav-links">
            <li><a href="#beranda" onClick={(e) => { e.preventDefault(); scrollToSection('beranda'); }}>Beranda</a></li>
            <li><a href="#solusi" onClick={(e) => { e.preventDefault(); scrollToSection('solusi'); }}>Solusi</a></li>
            <li><a href="#teknologi" onClick={(e) => { e.preventDefault(); scrollToSection('teknologi'); }}>Teknologi</a></li>
            <li><a href="#dampak" onClick={(e) => { e.preventDefault(); scrollToSection('dampak'); }}>Dampak</a></li>
            <li><a href="#tim" onClick={(e) => { e.preventDefault(); scrollToSection('tim'); }}>Tentang Kami</a></li>
          </ul>
          <button className="lp-nav-cta" onClick={() => setShowContactModal(true)} style={{ background: '#09132e', borderRadius: '9999px', padding: '10px 24px' }}>
            Hubungi Kami <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION MATCHING MOCKUP IMAGE */}
      <section className="lp-hero-wrapper" id="beranda">
        <div className="lp-hero-grid">
          <Reveal>
            <div>
              <div className="lp-hero-badge">
                <span style={{ color: '#2563eb', marginRight: 4 }}>●</span> NEXT-GEN ANTI-MONEY LAUNDERING
              </div>
              <h1 className="lp-hero-title">
                Melindungi Setiap Transaksi,<br />
                Menjaga <span className="highlight-blue">Kedaulatan Ekonomi.</span>
              </h1>
              <p className="lp-hero-sub">
                Crypto-Sentinel 2026 adalah middleware AI cerdas yang bertindak sebagai <strong>Smart Circuit Breaker</strong>, mendeteksi dan menghentikan transaksi berisiko dalam hitungan milidetik sebelum kerugian terjadi.
              </p>
              <div className="lp-hero-btns">
                <button className="lp-btn-primary" onClick={() => scrollToSection('skema-gnn')}>
                  Pelajari Solusi Kami <ArrowRight size={16} />
                </button>
                <button className="lp-btn-secondary" onClick={onEnter}>
                  <Play size={15} fill="#2563eb" color="#2563eb" /> Lihat Demo
                </button>
              </div>

              {/* Bottom Feature Strip (Dark Navy 3-Column Card) */}
              <div className="lp-hero-strip">
                <div className="lp-strip-item">
                  <div className="lp-strip-icon">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="lp-strip-title">Deteksi &lt; 18ms</div>
                    <div className="lp-strip-desc">Hentikan transaksi berisiko sebelum dana keluar.</div>
                  </div>
                </div>
                <div className="lp-strip-item">
                  <div className="lp-strip-icon">
                    <Brain size={20} />
                  </div>
                  <div>
                    <div className="lp-strip-title">GNN Intelligence</div>
                    <div className="lp-strip-desc">Temukan pola mule ring tersembunyi secara akurat.</div>
                  </div>
                </div>
                <div className="lp-strip-item">
                  <div className="lp-strip-icon">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="lp-strip-title">Kepatuhan Terjamin</div>
                    <div className="lp-strip-desc">Otomatisasi STR/LTKM sesuai regulasi OJK &amp; UU TPPU.</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Hero Visual with landing2.jpeg (Seamless Feathered Blend) */}
          <Reveal delay={0.2} direction="left">
            <div className="lp-hero-visual-box">
              <motion.div
                animate={{ 
                  y: [0, -12, 0],
                }}
                transition={{ 
                  duration: 4.5, 
                  repeat: Infinity, 
                  ease: 'easeInOut' 
                }}
                style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <div
                  style={{
                    position: 'relative',
                    maxWidth: 540,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <img
                    src="/img/landing2.jpeg"
                    alt="Crypto-Sentinel Banking Surveillance Platform"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      objectFit: 'contain',
                      borderRadius: '24px',
                      WebkitMaskImage: 'radial-gradient(ellipse 95% 92% at 58% 50%, black 68%, transparent 100%)',
                      maskImage: 'radial-gradient(ellipse 95% 92% at 58% 50%, black 68%, transparent 100%)',
                      filter: 'drop-shadow(0 20px 40px rgba(37, 99, 235, 0.18))'
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="lp-divider" />

      {/* STATS */}
      <section className="lp-section" id="solusi">
        <Reveal>
          <span className="lp-section-tag">Hasil Terukur</span>
          <h2 className="lp-section-title">
            Angka Nyata dari<br />Pengujian <span className="crimson-it">Dataset PaySim</span>
          </h2>
          <p className="lp-section-desc">
            Semua metrik diukur dari pengujian sistem terhadap <strong>308.213 baris data transaksi</strong>
            PaySim + SMOTE augmentation — dataset benchmark fraud detection IEEE standar internasional.
          </p>
        </Reveal>

        <div className="lp-stats-grid">
          {[
            {
              accent: 'linear-gradient(90deg,#1e3a8a,#2563eb)',
              color: '#1e3a8a',
              target: 308213,
              label: 'Transaksi Dianalisis',
              sub: 'Dataset PaySim + SMOTE 308K',
              badge: '✓ Terverifikasi',
              badgeStyle: { background: '#dcfce7', color: '#16a34a' },
              chart: <MiniThroughputWaveChart />
            },
            {
              accent: 'linear-gradient(90deg,#166534,#16a34a)',
              color: '#166534',
              val: '99.98%',
              label: 'Akurasi AI',
              sub: 'Hybrid GNN + Random Forest',
              badge: '✓ Diukur Langsung',
              badgeStyle: { background: '#dcfce7', color: '#16a34a' },
              chart: <MiniAccuracyModelBars />
            },
            {
              accent: 'linear-gradient(90deg,#92400e,#d97706)',
              color: '#92400e',
              val: '<18ms',
              label: 'Latency FDS',
              sub: 'End-to-End Rule Engine + ML',
              badge: '⚡ Real Measurement',
              badgeStyle: { background: '#fef3c7', color: '#92400e' },
              chart: <MiniLatencyPipelineSpectrum />
            },
            {
              accent: 'linear-gradient(90deg,#7f1d1d,#dc2626)',
              color: '#991b1b',
              target: 562239,
              label: 'Node Graph GNN',
              sub: '308.213 Edges Dipetakan',
              badge: '✓ GraphSAGE Model',
              badgeStyle: { background: '#fee2e2', color: '#991b1b' },
              chart: <MiniGraphClusterChart />
            },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="lp-stat-card">
                <div className="lp-stat-accent" style={{ background: s.accent }} />
                <div className="lp-stat-val" style={{ color: s.color }}>
                  {s.target !== undefined ? <AnimatedNum target={s.target} /> : s.val}
                </div>
                <div className="lp-stat-lbl">{s.label}<br /><span style={{ opacity: 0.7, fontSize: '0.7rem' }}>{s.sub}</span></div>
                {s.chart}
                <span className="lp-stat-badge" style={s.badgeStyle}>{s.badge}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="lp-reg-strip">
          <span className="lp-reg-label">Standar Kepatuhan</span>
          {[
            { name: 'SNAP BI', desc: 'Open API Nasional' },
            { name: 'ISO 20022', desc: 'Financial Messaging' },
            { name: 'OJK', desc: 'Otoritas Jasa Keuangan' },
            { name: 'PPATK', desc: 'Anti Money Laundering' },
            { name: 'Bank Indonesia', desc: 'Sistem Pembayaran' },
            { name: 'UU TPPU', desc: 'No. 8 Tahun 2010' },
          ].map((b, i) => (
            <div className="lp-reg-badge" key={i}>
              <div className="lp-reg-dot" />
              <div>
                <div className="lp-reg-name">{b.name}</div>
                <div className="lp-reg-desc">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LETTER — dark section */}
      <div className="lp-letter-section" id="dampak">
        <div className="lp-letter">
          <Reveal>
            <div className="lp-letter-text">
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 3, color: '#2563eb', display: 'block', marginBottom: 14 }}>Dampak Finansial &amp; Masalah Nyata</span>
              <h2>Rp 9,1 Triliun<br /><em>Raib dari Penipuan Digital.</em></h2>
              <p>OJK mencatat akumulasi kerugian masyarakat akibat <strong>penipuan keuangan digital mencapai Rp 9,1 Triliun</strong> dari 432.637 laporan (IASC OJK, Januari 2026). PPATK mendeteksi transaksi mencurigakan terkait <strong>aset kripto senilai lebih dari Rp 800 Miliar</strong> sepanjang 2022–2024. Celah utamanya selalu sama: <strong>tidak ada intersepsi real-time</strong> sebelum dana keluar ke bursa kripto.</p>
              <p>Sistem FDS konvensional bekerja <em>post-facto</em> — mendeteksi setelah dana berpindah. Crypto-Sentinel membalik paradigma ini: setiap transaksi dianalisis oleh mesin AI <strong>sebelum saldo berubah</strong>, dalam waktu kurang dari 18ms, menggunakan <strong>13 sub-indikator</strong> behavioral dan graph topology GNN.</p>
              <p>Bukan sekadar alert. <strong>Sistem kami memblokir langsung.</strong> Mule account dibekukan. Draft LTKM digenerate otomatis sesuai format PPATK goAML. Compliance officer tinggal verifikasi dan tanda tangan.</p>
              <div className="lp-letter-blockquote">
                <p>"Fraud detection yang baik bukan yang paling keras berteriak — melainkan yang paling cepat bertindak."</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2} direction="left">
            <AnimatedFlowDiagram />
          </Reveal>
        </div>
      </div>

      {/* FEATURES */}
      <section className="lp-section" id="teknologi">
        <Reveal>
          <span className="lp-section-tag">Fitur Unggulan</span>
          <h2 className="lp-section-title">Tiga Pilar <span className="crimson-it">Pertahanan</span><br />Keuangan Digital</h2>
        </Reveal>
        <div className="lp-features-grid">
          {[
            {
              icon: <Zap size={26} />,
              iconBg: '#eff6ff',
              iconBorder: '#bfdbfe',
              iconColor: '#2563eb',
              title: 'Smart Circuit Breaker',
              desc: 'Memblokir mutasi saldo ke rekening penipu, mule account, dan bursa kripto terlarang secara otomatis — tanpa menunggu persetujuan manual. Saat keputusan BLOCK keluar, upstream freeze langsung terpicu pada semua rekening dalam jaringan mule yang terhubung.',
              tags: ['Real-time Block', 'Upstream Freeze', 'Whitelist/Blacklist']
            },
            {
              icon: <Brain size={26} />,
              iconBg: '#faf5ff',
              iconBorder: '#e9d5ff',
              iconColor: '#7c3aed',
              title: 'Forensic GNN Visualizer',
              desc: 'Memetakan jaringan relasional antara pengirim, mule account, dan rekening tujuan kripto dalam bentuk graf interaktif real-time. Saat pola smurfing terdeteksi, seluruh jalur aliran dana menyala merah — memperlihatkan kepada analis struktur sindikat yang sesungguhnya.',
              tags: ['NetworkX', 'PageRank', 'Real-time Graph', 'Mule Ring Detection']
            },
            {
              icon: <FileText size={26} />,
              iconBg: '#fff7ed',
              iconBorder: '#fed7aa',
              iconColor: '#c2410c',
              title: 'Auto-Generated LTKM',
              desc: 'Menghasilkan draft Laporan Transaksi Keuangan Mencurigakan sesuai format PPATK goAML secara otomatis segera setelah BLOCK terdeteksi. Narasi kecurigaan ditulis oleh AI dalam Bahasa Indonesia formal, siap ditandatangani Compliance Officer.',
              tags: ['PPATK goAML', 'AI Narrative', 'UU TPPU 8/2010', 'PDF Print-ready']
            },
          ].map((f, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div className="lp-feat" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="lp-feat-icon" style={{ background: f.iconBg, border: `1px solid ${f.iconBorder}`, color: f.iconColor }}>
                    {f.icon}
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
                <div className="lp-feat-tags">{f.tags.map((t, j) => <span className="lp-feat-tag" key={j}>{t}</span>)}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FULL-WIDTH GNN EXPLAINABLE SHOWCASE */}
      <section className="lp-section" id="skema-gnn" style={{ paddingTop: 20, paddingBottom: 60 }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="lp-section-tag" style={{ background: '#faf5ff', color: '#7c3aed', borderColor: '#e9d5ff' }}>
              🧠 Skema Forensik GNN
            </span>
            <h2 className="lp-section-title" style={{ fontSize: '2.2rem', marginBottom: 12 }}>
              Deteksi Pola Smurfing &amp; <span className="crimson-it">Pelarian Dana ke Kripto</span>
            </h2>
            <p className="lp-section-desc" style={{ maxWidth: 840, margin: '0 auto' }}>
              Bagaimana arsitektur <strong>Graph Neural Network (GraphSAGE)</strong> memetakan interkoneksi rekening perantara (mule), transaksi terstruktur (structuring), relasi perangkat / Device IP, hingga agregasi transit sebelum dilarikan ke bursa aset kripto.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            background: '#ffffff',
            borderRadius: 24,
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            padding: '16px'
          }}>
            <img
              src="/img/GNN_explainable.jpeg"
              alt="Skema GNN (Graph Neural Network) untuk Deteksi Smurfing &amp; Pelarian Dana Sebelum ke Kripto"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 16,
                objectFit: 'contain'
              }}
            />
          </div>
        </Reveal>
      </section>

      <div className="lp-divider" />

      {/* LIVE CONSOLE */}
      <section className="lp-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <Reveal>
          <span className="lp-section-tag">Live Activity</span>
          <h2 className="lp-section-title">FDS Bekerja<br /><span className="red">Tanpa Henti.</span></h2>
          <p className="lp-section-desc">Setiap baris di bawah adalah transaksi nyata yang melewati mesin FDS kami. ALLOW dalam milidetik. BLOCK sebelum uang berpindah.</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="lp-console-wrap">
            <div className="lp-console-bar">
              <div className="lp-cdot r" /><div className="lp-cdot y" /><div className="lp-cdot g" />
              <span className="lp-console-title-txt">crypto-sentinel-fds · activity-monitor · Bank Kuningan</span>
              <div className="lp-live"><div className="lp-live-dot" /> LIVE</div>
            </div>
            <div className="lp-console-body">
              {tickerLogs.map(log => (
                <div className="lp-log-line" key={log.id}>
                  <span className="lp-log-time">[{log.time}]</span>
                  <span className={`lp-log-msg ${log.type === 'success' ? 's' : log.type === 'warning' ? 'w' : log.type === 'danger' ? 'd' : 'i'}`}>
                    {log.type === 'success' ? '✓ ' : log.type === 'warning' ? '⚠ ' : log.type === 'danger' ? '✗ ' : '$ '}{log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <div className="lp-divider" />

      {/* TEAM */}
      <section className="lp-section" id="tim">
        <Reveal>
          <span className="lp-section-tag">Tim Pengembang</span>
          <h2 className="lp-section-title">Dibangun oleh<br /><span className="crimson-it">Tim EXPRESSO</span> S1251</h2>
          <p className="lp-section-desc">Empat mahasiswa dengan spesialisasi berbeda — AI/ML, Frontend, Backend, dan Cybersecurity — membangun Crypto-Sentinel dari nol hingga menjadi sistem FDS berlatency 18ms yang siap validasi pilot di Bank Kuningan.</p>
        </Reveal>
        <div className="lp-team-grid">
          {team.map((member, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="lp-team-card">
                <div className="lp-team-avatar" style={{ borderColor: member.color + '33', background: member.color + '11' }}>
                  <div className="lp-team-avatar-fallback" style={{ color: member.color }}>{member.initials}</div>
                </div>
                <div className="lp-team-info">
                  <h3>{member.name}</h3>
                  <span className="lp-team-role" style={{ color: member.color }}>{member.role}</span>
                  <p className="lp-team-desc">{member.desc}</p>
                  <div className="lp-team-tags">
                    {member.tags.map((t, j) => (
                      <span className="lp-team-tag" key={j} style={{ borderColor: member.color + '22', color: member.color }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="lp-divider" />

      {/* FAQ */}
      <section className="lp-section" id="regulasi">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
          <Reveal>
            <div>
              <span className="lp-section-tag">PERTANYAAN UMUM</span>
              <h2 className="lp-section-title" style={{ fontSize: '2.2rem' }}>Pertanyaan yang<br />Sering <span className="highlight-blue">Diajukan.</span></h2>
              <p className="lp-section-desc" style={{ marginBottom: 0 }}>Informasi lengkap mengenai cara kerja sistem, integrasi core banking, kepatuhan regulasi OJK &amp; PPATK, serta perlindungan data nasabah.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="lp-faq">
              {faqs.map((faq, i) => (
                <div className={`lp-faq-item ${openFaq === i ? 'open' : ''}`} key={i}>
                  <button className="lp-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span className="lp-faq-q">{faq.q}</span>
                    <ChevronDown size={18} className="lp-faq-icon" />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
                        <div className="lp-faq-body">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <div className="lp-divider" />

      {/* DOCS */}
      <section className="lp-section" style={{ paddingTop: 80 }}>
        <Reveal>
          <span className="lp-section-tag">Dokumentasi Produk</span>
          <h2 className="lp-section-title">Target Pengguna &amp;<br /><span className="crimson-it">Arsitektur Alur Sistem</span></h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="lp-docs">
            <div className="lp-doc-tabs">
              {[
                { key: 'tp', label: '1. Target Pengguna', desc: '4 aktor utama: Compliance Officer, Risk Manager, Regulator (OJK & PPATK), Nasabah', accent: '#1e3a8a' },
                { key: 'flow', label: '2. Flowchart & Rich Picture', desc: 'Arsitektur ekosistem end-to-end SNAP BI dan alur logika keputusan FDS', accent: '#d97706' },
              ].map(tab => (
                <div key={tab.key} className="lp-doc-tab" onClick={() => setActiveDocTab(tab.key)} style={{ background: activeDocTab === tab.key ? tab.accent + '0f' : '#fafaf8', borderColor: activeDocTab === tab.key ? tab.accent : 'rgba(0,0,0,0.08)' }}>
                  <h4 style={{ color: activeDocTab === tab.key ? tab.accent : '#333333' }}>{tab.label}</h4>
                  <p>{tab.desc}</p>
                </div>
              ))}
            </div>
            <AnimatePresence mode="wait">
              {activeDocTab === 'tp' && (
                <motion.div key="tp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="lp-doc-img-grid">
                    {[
                      { img: '/img/TP1.jpeg', title: '1. Analis Kepatuhan (Compliance Officer)', desc: 'Memantau notifikasi transaksi berisiko tinggi secara real-time, meninjau alert smurfing (skor 50–84%), memverifikasi pembekuan rekening mule, dan menandatangani draft LTKM yang dihasilkan sistem.' },
                      { img: '/img/TP2.jpeg', title: '2. Manajer Risiko & AML (Risk Manager)', desc: 'Mengatur ambang batas risiko (risk threshold 85%), mengevaluasi efektivitas 15 indikator deteksi FDS, dan memantau statistik tren anomali transaksi antardomisili.' },
                      { img: '/img/TP3.jpeg', title: '3. Regulator (OJK & PPATK)', desc: 'Menerima draf otomatis Laporan Transaksi Keuangan Mencurigakan (LTKM/STR) lengkap dengan narasi kasus berbasis AI dan bukti audit forensik digital.' },
                      { img: '/img/TP4.jpeg', title: '4. Nasabah Perbankan (Consumer Banking)', desc: 'Mendapatkan jaminan keamanan akun dari ancaman penyalahgunaan rekening penampung (mule account). Sistem bekerja sepenuhnya transparan di layer belakang.' },
                    ].map((tp, i) => (
                      <div className="lp-doc-img-card" key={i}>
                        <img src={tp.img} alt={tp.title} />
                        <h4>{tp.title}</h4>
                        <p>{tp.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              {activeDocTab === 'flow' && (
                <motion.div key="flow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {[
                      { img: '/img/rich-picture.jpeg', title: 'A. Rich Picture Ecosystem', accent: '#d97706', desc: 'Diagram menggambarkan hubungan end-to-end dari transaksi nasabah melalui API Gateway SNAP BI. FDS mengevaluasi menggunakan Rule Engine dan GNN. Jika ≥4 tujuan unik/1 jam terdeteksi, dana diblokir dan STR PPATK diterbitkan.' },
                      { img: '/img/Flowchart.jpeg', title: 'B. Flowchart Logika Keputusan FDS', accent: '#1e3a8a', desc: 'Alur keputusan: evaluasi limit nominal → geolokasi → smurfing check → skor hibrida ML+GNN. Hasil: ALLOW (<50%), REVIEW (50–84%), BLOCK (≥85%).' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: '#fafaf8', border: `1px solid ${item.accent}22`, borderRadius: 16, padding: 24 }}>
                        <h4 style={{ color: item.accent, fontWeight: 700, fontSize: '0.9rem', marginBottom: 12 }}>{item.title}</h4>
                        <img src={item.img} alt={item.title} style={{ width: '100%', borderRadius: 10, marginBottom: 12 }} />
                        <p style={{ color: '#666666', fontSize: '0.83rem', lineHeight: 1.7, margin: 0, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
        <div className="lp-footer">
          <div className="lp-footer-brand">
            <h3>Crypto-Sentinel</h3>
            <p>Fraud Detection System · SNAP BI Compliant · PPATK goAML Ready<br />Dikembangkan oleh Tim EXPRESSO S1251 · Digdaya × Hackathon PIDI 2026</p>
          </div>
          <div className="lp-footer-right">
            <p>© 2026 Crypto-Sentinel<br />SNAP BI · ISO 20022 · OJK · PPATK · UU TPPU No. 8/2010</p>
          </div>
        </div>
      </footer>

      {/* ========================================================
          INTERACTIVE CONTACT & BANKING PARTNERSHIP MODAL
      ======================================================== */}
      <AnimatePresence>
        {showContactModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(11, 19, 41, 0.75)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              style={{
                background: '#ffffff',
                borderRadius: 24,
                maxWidth: 620,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                padding: '32px 36px',
                position: 'relative',
                border: '1px solid rgba(0,0,0,0.08)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowContactModal(false)}
                style={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={18} />
              </button>

              {!contactSubmitted ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0b1329', margin: 0 }}>
                        Konsultasi Kemitraan Bank
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                        Jadwalkan Sandbox Testing FDS Terintegrasi POJK No. 8/2023
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0 20px' }} />

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitted(true);
                      const waText = encodeURIComponent(
                        `*PERMOHONAN KONSULTASI & SANDBOX FDS*\n` +
                        `*Crypto-Sentinel 2026 — BI Innovation Hub*\n\n` +
                        `Halo Tim Crypto-Sentinel 2026, kami mengajukan permohonan konsultasi teknis:\n\n` +
                        `• *Nama PIC:* ${contactForm.name}\n` +
                        `• *Institusi / Bank:* ${contactForm.institution}\n` +
                        `• *Email Bisnis:* ${contactForm.email}\n` +
                        `• *Fokus Kebutuhan:* ${contactForm.need}\n` +
                        `• *Catatan / Kebutuhan:* ${contactForm.message || '-'}\n\n` +
                        `Portal Resmi: https://innovation.pidi.id/inovasi/crypto-sentinel-2026\n` +
                        `Mohon koordinasi jadwal demo lebih lanjut. Terima kasih.`
                      );
                      window.open(`https://wa.me/6281280851615?text=${waText}`, '_blank');
                    }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Nama Lengkap PIC / Pejabat Bank
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso, S.E. (Kepala Divisi APU-PPT)"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Institusi / Bank / Regulator
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: PT Bank BJB Tbk / BPR"
                          value={contactForm.institution}
                          onChange={(e) => setContactForm({ ...contactForm, institution: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                          Email Kantor / Bisnis
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="compliance@bank.co.id"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: 10,
                            border: '1px solid #cbd5e1',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Fokus Kebutuhan Integrasi
                      </label>
                      <select
                        value={contactForm.need}
                        onChange={(e) => setContactForm({ ...contactForm, need: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          background: '#ffffff',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="Integrasi Core Banking (SNAP BI)">Integrasi Core Banking (SNAP BI Open API)</option>
                        <option value="Uji Coba GNN AI Engine & Circuit Breaker">Uji Coba GNN AI Engine &amp; Circuit Breaker</option>
                        <option value="Kepatuhan POJK No. 8/2023 & goAML PPATK">Kepatuhan POJK No. 8/2023 &amp; goAML PPATK</option>
                        <option value="Demo Khusus Direksi & Komite Risiko">Demo Khusus Direksi &amp; Komite Risiko Bank</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                        Catatan / Waktu Konsultasi yang Diinginkan
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Contoh: Kami ingin menjadwalkan demo teknis integrasi API SNAP BI untuk Bank BPD kami minggu depan."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem',
                          outline: 'none',
                          boxSizing: 'border-box',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #09132e 0%, #1e3a8a 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(30,58,138,0.3)'
                      }}
                    >
                      <Send size={16} /> Kirim Permintaan via WhatsApp &amp; Email
                    </button>
                  </form>

                  {/* Direct Contact Cards */}
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <a
                      href="https://wa.me/6281280851615?text=Halo%20Tim%20Crypto-Sentinel%202026,%20saya%20tertarik%20untuk%20konsultasi%20kemitraan%20dan%20uji%20coba%20Sandbox%20FDS.%0A%0APortal%20Resmi:%20https://innovation.pidi.id/inovasi/crypto-sentinel-2026"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.74rem', textDecoration: 'none', display: 'block', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>💬 WhatsApp Hotline PIC</div>
                      <div style={{ color: '#16a34a', fontWeight: 700 }}>081280851615</div>
                    </a>
                    <a
                      href="mailto:frifki971@gmail.com?subject=Konsultasi%20Kemitraan%20Bank%20-%20Crypto-Sentinel%202026"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: '0.74rem', textDecoration: 'none', display: 'block', transition: 'all 0.2s ease' }}
                    >
                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>✉️ Email Resmi Tim</div>
                      <div style={{ color: '#2563eb', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>frifki971@gmail.com</div>
                    </a>
                  </div>

                  {/* Official BI Innovation Hub Link */}
                  <a
                    href="https://innovation.pidi.id/inovasi/crypto-sentinel-2026"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(124,58,237,0.07) 100%)',
                      border: '1px solid rgba(37,99,235,0.25)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      marginTop: 12,
                      textDecoration: 'none',
                      color: '#1e3a8a'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ fontSize: '1.2rem' }}>🏛️</div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e3a8a' }}>
                          Crypto-Sentinel 2026 — BI Innovation Hub
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          innovation.pidi.id/inovasi/crypto-sentinel-2026
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={15} color="#2563eb" />
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                    Permintaan Konsultasi Terkirim!
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 20px' }}>
                    Terima kasih, Bapak/Ibu <strong>{contactForm.name || 'PIC'}</strong> dari <strong>{contactForm.institution || 'Institusi Perbankan'}</strong>. Permintaan Anda telah diteruskan ke WhatsApp Hotline <strong>081280851615</strong> dan Email <strong>frifki971@gmail.com</strong>.
                  </p>

                  {/* Official BI Innovation Hub Link in Success Screen */}
                  <a
                    href="https://innovation.pidi.id/inovasi/crypto-sentinel-2026"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(37,99,235,0.08)',
                      border: '1px solid rgba(37,99,235,0.25)',
                      borderRadius: 9999,
                      padding: '8px 18px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#1e3a8a',
                      textDecoration: 'none',
                      marginBottom: 20
                    }}
                  >
                    🏛️ Kunjungi Profil di BI Innovation Hub <ArrowRight size={14} />
                  </a>
                  <br />

                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setShowContactModal(false);
                    }}
                    style={{
                      padding: '10px 28px',
                      borderRadius: 9999,
                      background: '#09132e',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Tutup &amp; Kembali ke Halaman Utama
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
