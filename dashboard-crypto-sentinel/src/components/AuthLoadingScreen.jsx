import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle2, Cpu } from 'lucide-react';

export default function AuthLoadingScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menginisialisasi Security Layer SNAP BI...');

  useEffect(() => {
    const steps = [
      { p: 20, t: 'Menginisialisasi Security Layer SNAP BI & ISO 20022...', delay: 250 },
      { p: 50, t: 'Memuat Engine In-Memory GraphSAGE GNN Network...', delay: 700 },
      { p: 80, t: 'Sinkronisasi Rule Engine & Data Stream Bank Kuningan...', delay: 1250 },
      { p: 100, t: 'Otorisasi Aman Terverifikasi. Mengalihkan ke Portal Login...', delay: 1800 }
    ];

    const timeouts = steps.map(s => {
      return setTimeout(() => {
        setProgress(s.p);
        setStatusText(s.t);
      }, s.delay);
    });

    const finishTimeout = setTimeout(() => {
      onFinished();
    }, 2200);

    return () => {
      timeouts.forEach(t => clearTimeout(t));
      clearTimeout(finishTimeout);
    };
  }, [onFinished]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'radial-gradient(ellipse at center, #0f1e42 0%, #060d21 70%, #020617 100%)',
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
      {/* Background Animated Grid Lines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(37, 99, 235, 0.12) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.7,
          pointerEvents: 'none'
        }}
      />

      {/* Central Glowing Shield Hub */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ position: 'relative', marginBottom: 32 }}
      >
        {/* Pulsing Radar Ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            border: '2px solid rgba(37, 99, 235, 0.4)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(15, 23, 42, 0.8))',
            border: '1.5px solid rgba(59, 130, 246, 0.4)',
            boxShadow: '0 0 50px rgba(37, 99, 235, 0.35)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="/img/Logo3_transparent.png"
            alt="Crypto-Sentinel"
            style={{
              height: 52,
              width: 'auto',
              objectFit: 'contain',
              filter: 'drop-shadow(0 4px 12px rgba(37,99,235,0.6))'
            }}
          />
        </div>
      </motion.div>

      {/* Title & Brand */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        style={{ textAlign: 'center', marginBottom: 28 }}
      >
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#f8fafc' }}>
          CRYPTO-SENTINEL <span style={{ color: '#3b82f6', fontWeight: 900 }}>2026</span>
        </h2>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600 }}>
          Security Gateway · Bank Kuningan
        </div>
      </motion.div>

      {/* Progress Bar Container */}
      <div style={{ width: '100%', maxWidth: 360, marginBottom: 16 }}>
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative'
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #2563eb, #60a5fa, #38bdf8)',
              borderRadius: 9999,
              boxShadow: '0 0 16px rgba(59, 130, 246, 0.8)'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.35 }}
          />
        </div>
      </div>

      {/* Status Live Text */}
      <motion.div
        key={statusText}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: '0.78rem',
          color: '#cbd5e1',
          fontWeight: 600,
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: progress === 100 ? '#10b981' : '#3b82f6',
            boxShadow: `0 0 8px ${progress === 100 ? '#10b981' : '#3b82f6'}`
          }}
        />
        <span>{statusText}</span>
      </motion.div>
    </div>
  );
}
