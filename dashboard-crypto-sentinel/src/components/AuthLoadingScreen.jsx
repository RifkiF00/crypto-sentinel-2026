import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle2, Cpu, Terminal, Activity } from 'lucide-react';

export default function AuthLoadingScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { code: 'SEC-01', text: 'Menginisialisasi Protokol SNAP BI & ISO 20022...', status: 'OK' },
    { code: 'GNN-02', text: 'Memuat Engine In-Memory GraphSAGE Neural Network...', status: 'INITIALIZED' },
    { code: 'FDS-03', text: 'Sinkronisasi Rule Engine & Node Bank Kuningan...', status: 'SYNCED' },
    { code: 'AUTH-04', text: 'Sesi Forensik Aman Terverifikasi. Membuka Portal...', status: 'GRANTED' }
  ];

  useEffect(() => {
    // Smooth progress counter
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 2;
        if (next >= 25 && next < 55) setActiveStep(1);
        else if (next >= 55 && next < 85) setActiveStep(2);
        else if (next >= 85) setActiveStep(3);
        return next;
      });
    }, 32);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#030712',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: 24,
        overflow: 'hidden'
      }}
    >
      {/* Background Cyber Ambient Lights */}
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.18) 0%, rgba(56, 189, 248, 0.05) 45%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      {/* Cyber Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.8,
          pointerEvents: 'none'
        }}
      />

      {/* Center Holographic Scanning Unit */}
      <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer Rotating Cyber Dashed Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1.5px dashed rgba(56, 189, 248, 0.35)',
            borderTopColor: '#38bdf8'
          }}
        />

        {/* Inner Counter-Rotating Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRightColor: '#60a5fa',
            borderBottomColor: '#2563eb'
          }}
        />

        {/* Center 3D Glowing Shield Hologram */}
        <div
          style={{
            width: 108,
            height: 108,
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'radial-gradient(circle, #0b1e42 0%, #030712 100%)',
            border: '1.5px solid rgba(56, 189, 248, 0.5)',
            boxShadow: '0 0 40px rgba(37, 99, 235, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.2)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="/img/heroo.jpeg"
            alt="Crypto-Sentinel Shield"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scale(1.2)'
            }}
          />

          {/* Sweeping Laser Scanner */}
          <motion.div
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 3,
              background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
              boxShadow: '0 0 12px #38bdf8, 0 0 20px #2563eb',
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>

      {/* Brand Title */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 4px 0', letterSpacing: '-0.3px', color: '#f8fafc' }}>
          CRYPTO-SENTINEL <span style={{ color: '#38bdf8' }}>2026</span>
        </h2>
        <div style={{ fontSize: '0.72rem', color: '#64748b', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 700 }}>
          Bank Security &amp; AML Surveillance Gateway
        </div>
      </div>

      {/* Big Digital Percentage */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
        <span
          style={{
            fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
            fontSize: '2.4rem',
            fontWeight: 900,
            color: '#f8fafc',
            lineHeight: 1
          }}
        >
          {progress}
        </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8' }}>%</span>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', maxWidth: 380, marginBottom: 20 }}>
        <div
          style={{
            width: '100%',
            height: 4,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.8)',
              width: `${progress}%`
            }}
          />
        </div>
      </div>

      {/* Live Terminal Telemetry Box */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 14,
          padding: '12px 16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.68rem', color: '#94a3b8', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
            <Terminal size={12} color="#38bdf8" />
            <span>CORE_INITIALIZATION_STREAM</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.64rem', color: '#10b981', fontWeight: 700 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            LIVE
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.68rem' }}>
          {steps.map((s, i) => {
            const isDone = i < activeStep || progress === 100;
            const isCurrent = i === activeStep && progress < 100;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: isDone ? '#94a3b8' : isCurrent ? '#38bdf8' : '#475569',
                  opacity: isDone || isCurrent ? 1 : 0.4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: isDone ? '#10b981' : isCurrent ? '#38bdf8' : '#64748b', fontWeight: 800 }}>
                    {isDone ? '✓' : isCurrent ? '›' : '·'}
                  </span>
                  <span>{s.text}</span>
                </div>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: isDone ? '#10b981' : isCurrent ? '#f59e0b' : '#64748b'
                  }}
                >
                  {isDone ? s.status : isCurrent ? 'RUNNING...' : 'QUEUED'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
