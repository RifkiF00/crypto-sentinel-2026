import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function AuthLoadingScreen({ onFinished }) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { code: '01', title: 'Inisialisasi Protokol Keamanan', desc: 'SNAP BI & ISO 20022 Handshake' },
    { code: '02', title: 'Sinkronisasi Model Forensik', desc: 'In-Memory GraphSAGE Neural Engine' },
    { code: '03', title: 'Verifikasi Otoritas Sesi', desc: 'Kepatuhan POJK No. 8/2023' },
    { code: '04', title: 'Gerbang Terbuka', desc: 'Akses Portal Terverifikasi' }
  ];

  useEffect(() => {
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
    }, 30);

    const finishTimer = setTimeout(() => {
      onFinished();
    }, 2200);

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
        background: '#060913',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: 24,
        overflow: 'hidden',
        perspective: 1200
      }}
    >
      {/* ── Subtle Luxury Ambient Lighting (Muted Champagne Gold & Deep Platinum) ── */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 550,
          height: 550,
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, rgba(148, 163, 184, 0.04) 40%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }}
      />

      {/* ── 3D Moving Animated Metallic Shield / Vault Crest ── */}
      <div
        style={{
          position: 'relative',
          width: 220,
          height: 220,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* 3D Orbital Titanium Ring 1 */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 230,
            height: 230,
            borderRadius: '50%',
            border: '1px solid rgba(148, 163, 184, 0.15)',
            borderTop: '1.5px solid rgba(212, 175, 55, 0.5)',
            transform: 'rotateX(68deg) rotateY(12deg)',
            transformStyle: 'preserve-3d',
            pointerEvents: 'none'
          }}
        >
          {/* Champagne Gold Satellite Orb */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fef08a 0%, #d4af37 100%)',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.7)'
            }}
          />
        </motion.div>

        {/* 3D Counter-Rotating Orbital Ring 2 */}
        <motion.div
          animate={{ rotateZ: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: 205,
            height: 205,
            borderRadius: '50%',
            border: '1px solid rgba(203, 213, 225, 0.12)',
            borderBottom: '1.5px solid rgba(203, 213, 225, 0.4)',
            transform: 'rotateX(55deg) rotateY(-25deg)',
            transformStyle: 'preserve-3d',
            pointerEvents: 'none'
          }}
        />

        {/* ── Main 3D Floating Gyroscopic Shield Body ── */}
        <motion.div
          animate={{
            rotateY: [-14, 14, -14],
            rotateX: [8, -8, 8],
            rotateZ: [-2, 2, -2],
            y: [-5, 5, -5]
          }}
          transition={{
            duration: 6.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'relative',
            width: 140,
            height: 160,
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Layer 0: Deep Titanium Back Shadow */}
          <div
            style={{
              position: 'absolute',
              inset: -4,
              borderRadius: '28px 28px 70px 70px',
              background: 'linear-gradient(145deg, #111726 0%, #080d18 100%)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              transform: 'translateZ(-14px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)'
            }}
          />

          {/* Layer 1: Brushed Dark Obsidian Shield Frame */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '24px 24px 60px 60px',
              background: 'linear-gradient(135deg, #1e2638 0%, #0d1322 45%, #182033 100%)',
              border: '1.5px solid rgba(212, 175, 55, 0.45)',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.2), 0 12px 28px rgba(0, 0, 0, 0.6)',
              transform: 'translateZ(6px)',
              overflow: 'hidden'
            }}
          >
            {/* Metallic Specular Shimmer Sweep */}
            <motion.div
              animate={{ x: ['-150%', '200%'] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '70%',
                background: 'linear-gradient(105deg, transparent 20%, rgba(254, 240, 138, 0.18) 50%, transparent 80%)',
                transform: 'skewX(-20deg)',
                pointerEvents: 'none'
              }}
            />

            {/* Geometric Luxury Relief Lines */}
            <svg width="100%" height="100%" viewBox="0 0 140 160" fill="none" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
              <path d="M 20 20 L 70 5 L 120 20 L 120 90 Q 70 150 70 150 Q 20 90 20 90 Z" stroke="#d4af37" strokeWidth="1" />
              <path d="M 35 32 L 70 20 L 105 32 L 105 85 Q 70 130 70 130 Q 35 85 35 85 Z" stroke="#94a3b8" strokeWidth="0.75" />
              <line x1="70" y1="20" x2="70" y2="130" stroke="#d4af37" strokeWidth="0.75" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* Layer 2: 3D Embossed Center Vault Crest */}
          <div
            style={{
              position: 'relative',
              width: 68,
              height: 68,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #2a354c 0%, #0d121f 80%)',
              border: '1.5px solid rgba(212, 175, 55, 0.65)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'translateZ(26px)'
            }}
          >
            {/* Inner Rotating Dial */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 4,
                borderRadius: '50%',
                border: '1px dashed rgba(212, 175, 55, 0.35)'
              }}
            />

            <Shield size={28} color="#d4af37" strokeWidth={1.8} />
          </div>
        </motion.div>
      </div>

      {/* ── Brand Title (Corporate Banking Typo) ── */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            margin: '0 0 5px 0',
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 50%, #d4af37 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          CRYPTO-SENTINEL 2026
        </h2>
        <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
          Sovereign Financial Defense &amp; AML Gateway
        </div>
      </div>

      {/* ── Clean Digital Percentage Counter ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
        <span
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#f8fafc',
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}
        >
          {progress}
        </span>
        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#d4af37' }}>%</span>
      </div>

      {/* ── Ultra-Thin Luxury Progress Bar ── */}
      <div style={{ width: '100%', maxWidth: 320, marginBottom: 22 }}>
        <div
          style={{
            width: '100%',
            height: 3,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 9999,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #94a3b8 0%, #d4af37 60%, #fef08a 100%)',
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
              width: `${progress}%`
            }}
          />
        </div>
      </div>

      {/* ── Minimalist Status Indicator ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 18px',
          borderRadius: 9999,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4af37', boxShadow: '0 0 6px rgba(212, 175, 55, 0.8)' }} />
        <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
          {steps[activeStep]?.title} — <span style={{ color: '#94a3b8', fontWeight: 400 }}>{steps[activeStep]?.desc}</span>
        </span>
      </div>
    </div>
  );
}
