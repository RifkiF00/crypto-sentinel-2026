import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Shield, Globe, Activity, Lock, AlertTriangle, Play, Pause, RotateCw, ExternalLink } from 'lucide-react';

// ==============================================================================
// 1. FINANCIAL HUBS & OFFSHORE SHELL ENTITY COORDINATES (Lon, Lat)
// ==============================================================================
const BANKING_HUBS = [
  {
    id: 'jkt',
    name: 'Jakarta (Origin)',
    country: 'Indonesia',
    flag: '🇮🇩',
    coords: [106.8456, -6.2088],
    type: 'origin',
    role: 'Expresso Core Banking / BPR Gateway',
    risk: 'SENDER',
    volume: 'Rp 1.480.000.000 (Total Outflow)',
    status: 'SURVEILLANCE_ACTIVE',
    color: '#38bdf8'
  },
  {
    id: 'sin',
    name: 'Singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    coords: [103.8198, 1.3521],
    type: 'transit',
    role: 'Regional Layering & Payment Aggregator',
    risk: 'HIGH',
    volume: 'Rp 420.000.000 (3 Hops)',
    status: 'FLAGGED_PPATK',
    color: '#ef4444'
  },
  {
    id: 'kl',
    name: 'Kuala Lumpur',
    country: 'Malaysia',
    flag: '🇲🇾',
    coords: [101.6869, 3.1390],
    type: 'transit',
    role: 'Mule Ring Distribution Hub',
    risk: 'HIGH',
    volume: 'Rp 180.000.000 (2 Hops)',
    status: 'INTERCEPTED',
    color: '#f59e0b'
  },
  {
    id: 'bkk',
    name: 'Bangkok',
    country: 'Thailand',
    flag: '🇹🇭',
    coords: [100.5018, 13.7563],
    type: 'transit',
    role: 'Cross-Border OTC Currency Exchange',
    risk: 'MEDIUM',
    volume: 'Rp 95.000.000',
    status: 'MONITORED',
    color: '#f59e0b'
  },
  {
    id: 'hkg',
    name: 'Hong Kong',
    country: 'China / SAR',
    flag: '🇭🇰',
    coords: [114.1694, 22.3193],
    type: 'shell',
    role: 'Former Shell Company Trade Escrow',
    risk: 'CRITICAL',
    volume: 'Rp 650.000.000',
    status: 'LTKM_GENERATED',
    color: '#dc2626'
  },
  {
    id: 'dxb',
    name: 'Dubai',
    country: 'UAE',
    flag: '🇦🇪',
    coords: [55.2708, 25.2048],
    type: 'crypto_hub',
    role: 'Crypto P2P OTC & Unhosted Wallet Desk',
    risk: 'CRITICAL',
    volume: 'Rp 890.000.000 (USDT Escrow)',
    status: 'CIRCUIT_BREAKER_BLOCKED',
    color: '#ef4444'
  },
  {
    id: 'sey',
    name: 'Victoria',
    country: 'Seychelles',
    flag: '🇸🇨',
    coords: [55.4513, -4.6191],
    type: 'offshore',
    role: 'Offshore Crypto Exchange & Anonymous Shell',
    risk: 'CRITICAL',
    volume: 'Rp 720.000.000 (Cold Storage)',
    status: 'FATF_BLACKLIST_LINK',
    color: '#dc2626'
  },
  {
    id: 'mru',
    name: 'Port Louis',
    country: 'Mauritius',
    flag: '🇲🇺',
    coords: [57.5012, -20.1609],
    type: 'offshore',
    role: 'Special Purpose Tax Haven Vehicle (SPV)',
    risk: 'HIGH',
    volume: 'Rp 340.000.000',
    status: 'ICIJ_LEAKS_MATCHED',
    color: '#ef4444'
  },
  {
    id: 'lon',
    name: 'London',
    country: 'United Kingdom',
    flag: '🇬🇧',
    coords: [-0.1278, 51.5074],
    type: 'interbank',
    role: 'Correspondent Interbank SWIFT Clearing',
    risk: 'NORMAL',
    volume: 'Rp 1.100.000.000',
    status: 'VERIFIED_CLEARED',
    color: '#10b981'
  },
  {
    id: 'zrh',
    name: 'Zurich',
    country: 'Switzerland',
    flag: '🇨🇭',
    coords: [8.5417, 47.3769],
    type: 'private_bank',
    role: 'Private Banking Wealth Custody Vault',
    risk: 'MEDIUM',
    volume: 'Rp 450.000.000',
    status: 'KYC_AUDITED',
    color: '#38bdf8'
  },
  {
    id: 'cay',
    name: 'George Town',
    country: 'Cayman Islands',
    flag: '🇰🇾',
    coords: [-81.3857, 19.2869],
    type: 'offshore',
    role: 'Discretionary Shell Trust Entity',
    risk: 'CRITICAL',
    volume: 'Rp 1.250.000.000',
    status: 'SANCTION_FLAG',
    color: '#dc2626'
  },
  {
    id: 'pan',
    name: 'Panama City',
    country: 'Panama',
    flag: '🇵🇦',
    coords: [-79.5197, 8.9824],
    type: 'offshore',
    role: 'Bearer Share Corporate Shield',
    risk: 'CRITICAL',
    volume: 'Rp 560.000.000',
    status: 'ICIJ_DATABASE_HIT',
    color: '#dc2626'
  },
  {
    id: 'bom',
    name: 'Mumbai',
    country: 'India',
    flag: '🇮🇳',
    coords: [72.8777, 19.0760],
    type: 'transit',
    role: 'Fintech Payment Routing Node',
    risk: 'MEDIUM',
    volume: 'Rp 110.000.000',
    status: 'MONITORED',
    color: '#f59e0b'
  },
  {
    id: 'dji',
    name: 'Djibouti',
    country: 'Djibouti',
    flag: '🇩🇯',
    coords: [43.1456, 11.5721],
    type: 'transit',
    role: 'Transit Port Currency Escrow',
    risk: 'HIGH',
    volume: 'Rp 75.000.000',
    status: 'SUSPICIOUS_VELOCITY',
    color: '#ef4444'
  },
  {
    id: 'syd',
    name: 'Sydney',
    country: 'Australia',
    flag: '🇦🇺',
    coords: [151.2093, -33.8688],
    type: 'interbank',
    role: 'Pacific Correspondent Gateway',
    risk: 'NORMAL',
    volume: 'Rp 280.000.000',
    status: 'VERIFIED_CLEARED',
    color: '#10b981'
  },
  {
    id: 'tyo',
    name: 'Tokyo',
    country: 'Japan',
    flag: '🇯🇵',
    coords: [139.6917, 35.6895],
    type: 'interbank',
    role: 'Licensed Virtual Asset Service Provider (JVCEA)',
    risk: 'LOW',
    volume: 'Rp 390.000.000',
    status: 'REGULATED_VASP',
    color: '#10b981'
  }
];

// Active Cross-Border Transactions (Flight Arcs from Jakarta & Secondary Layering Arcs)
const ROUTE_EDGES = [
  { from: 'jkt', to: 'sin', risk: 'HIGH', amount: 'Rp 420 Jt', type: 'Layering Mule' },
  { from: 'jkt', to: 'kl', risk: 'HIGH', amount: 'Rp 180 Jt', type: 'Smurfing Split' },
  { from: 'jkt', to: 'bkk', risk: 'MEDIUM', amount: 'Rp 95 Jt', type: 'OTC Transit' },
  { from: 'jkt', to: 'hkg', risk: 'CRITICAL', amount: 'Rp 650 Jt', type: 'Shell Company Escrow' },
  { from: 'jkt', to: 'dxb', risk: 'CRITICAL', amount: 'Rp 890 Jt', type: 'Crypto USDT Outflow' },
  { from: 'jkt', to: 'sey', risk: 'CRITICAL', amount: 'Rp 720 Jt', type: 'Offshore Shell' },
  { from: 'jkt', to: 'mru', risk: 'HIGH', amount: 'Rp 340 Jt', type: 'Tax Haven SPV' },
  { from: 'jkt', to: 'bom', risk: 'MEDIUM', amount: 'Rp 110 Jt', type: 'Fintech Proxy' },
  { from: 'jkt', to: 'dji', risk: 'HIGH', amount: 'Rp 75 Jt', type: 'Escrow Transit' },
  { from: 'jkt', to: 'syd', risk: 'NORMAL', amount: 'Rp 280 Jt', type: 'Clearing BI-FAST' },
  { from: 'jkt', to: 'tyo', risk: 'NORMAL', amount: 'Rp 390 Jt', type: 'Regulated VASP' },
  // Secondary Layering Hops (Interconnected)
  { from: 'sin', to: 'dxb', risk: 'CRITICAL', amount: 'Rp 310 Jt', type: 'Layer 2 Transit' },
  { from: 'hkg', to: 'sey', risk: 'CRITICAL', amount: 'Rp 500 Jt', type: 'Layer 2 Shell Flight' },
  { from: 'mru', to: 'zrh', risk: 'MEDIUM', amount: 'Rp 220 Jt', type: 'Custody Transfer' },
  { from: 'sey', to: 'cay', risk: 'CRITICAL', amount: 'Rp 680 Jt', type: 'Trust Aggregation' },
  { from: 'dxb', to: 'lon', risk: 'NORMAL', amount: 'Rp 400 Jt', type: 'Correspondent Wire' }
];

// Simplified Low-Poly Continents for Fast Orthographic Rendering
const CONTINENT_POLYGONS = [
  // Southeast Asia & Indonesia
  [[95, 5], [105, 5], [108, -7], [115, -8], [125, -9], [130, -5], [140, -3], [140, -9], [130, -10], [110, -9], [105, -5], [95, 5]],
  // Sumatra / Java / Borneo / Sulawesi / Papua
  [[98, 2], [104, -5], [100, -5], [95, 5]],
  [[106, -6], [114, -8], [113, -7], [105, -6]],
  [[109, 2], [118, 5], [118, -3], [110, -3]],
  [[119, 1], [125, 1], [123, -5], [119, -4]],
  [[130, -1], [141, -2], [141, -8], [131, -8]],
  // Mainland Asia & East Asia
  [[60, 25], [75, 30], [80, 20], [88, 22], [92, 16], [100, 15], [105, 20], [108, 10], [100, 8], [98, 15], [85, 20], [70, 15], [68, 25]],
  [[105, 20], [120, 25], [122, 35], [120, 45], [130, 45], [140, 55], [160, 65], [170, 68], [140, 70], [100, 70], [80, 65], [60, 60], [50, 50], [60, 35], [90, 30], [105, 20]],
  // Japan
  [[130, 32], [140, 40], [142, 45], [135, 35]],
  // India & Sri Lanka
  [[68, 24], [72, 18], [78, 8], [80, 13], [88, 22], [78, 30]],
  // Middle East & Arabian Peninsula
  [[35, 30], [45, 35], [55, 28], [60, 25], [58, 22], [55, 18], [45, 12], [42, 16], [35, 28]],
  // Africa
  [[32, 30], [35, 12], [45, 12], [50, 10], [42, -5], [40, -15], [35, -25], [30, -32], [20, -34], [15, -25], [10, 0], [0, 5], [-15, 12], [-15, 28], [0, 35], [20, 32], [32, 30]],
  // Madagascar
  [[44, -12], [50, -14], [48, -25], [44, -24]],
  // Europe
  [[-10, 36], [0, 42], [10, 45], [25, 40], [35, 45], [30, 60], [15, 65], [5, 60], [-5, 50], [-10, 40]],
  [[-5, 50], [0, 55], [-3, 58], [-6, 55]], // UK
  // Australia & New Zealand
  [[115, -22], [125, -15], [135, -12], [145, -15], [150, -25], [152, -35], [140, -38], [130, -32], [115, -35], [112, -25]],
  [[170, -35], [175, -40], [170, -45]],
  // Americas (North & South)
  [[-125, 48], [-120, 35], [-105, 20], [-80, 25], [-75, 35], [-65, 45], [-60, 55], [-90, 60], [-120, 60]],
  [[-80, 10], [-60, 10], [-35, -5], [-40, -22], [-55, -35], [-70, -50], [-75, -40], [-80, -20], [-80, 0]],
  // Caribbean
  [[-85, 22], [-75, 20], [-70, 18], [-80, 15]]
];

export default function GlobalBankingFlowGlobe({ isLight = true, addToast }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Globe orientation state: center on Jakarta by default [lon: 106.8, lat: -6.2]
  const [rotation, setRotation] = useState({ lon: -100, lat: -10 });
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [hoveredHub, setHoveredHub] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL, CRITICAL, CRYPTO, INTERBANK

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const streamParticlesRef = useRef([]);

  // Initialize Animated Stream Flow Particles
  useEffect(() => {
    const particles = [];
    ROUTE_EDGES.forEach((edge, idx) => {
      // 3 particles per route with different phase offsets
      for (let p = 0; p < 3; p++) {
        particles.push({
          edgeIdx: idx,
          progress: (p / 3) + Math.random() * 0.1,
          speed: 0.0035 + (Math.random() * 0.002),
          size: edge.risk === 'CRITICAL' ? 3.5 : 2.5,
          color: edge.risk === 'CRITICAL' ? '#ef4444' : edge.risk === 'HIGH' ? '#f59e0b' : '#10b981'
        });
      }
    });
    streamParticlesRef.current = particles;
  }, []);

  // --------------------------------------------------------------------------
  // 3D ORTHOGRAPHIC PROJECTION MATHEMATICS
  // --------------------------------------------------------------------------
  const project = useCallback((lon, lat, centerLon, centerLat, radius, cx, cy) => {
    const lambda = (lon * Math.PI) / 180;
    const phi = (lat * Math.PI) / 180;
    const lambda0 = (centerLon * Math.PI) / 180;
    const phi0 = (centerLat * Math.PI) / 180;

    const cosC = Math.sin(phi0) * Math.sin(phi) + Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);
    const isVisible = cosC >= 0.01; // Visible on front hemisphere

    const k = radius;
    const x = cx + k * Math.cos(phi) * Math.sin(lambda - lambda0);
    const y = cy - k * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0));

    return { x, y, visible: isVisible, z: cosC };
  }, []);

  // Great Circle Arc Interpolation on Sphere
  const interpolateGreatCircle = (p1, p2, t) => {
    const lon1 = (p1[0] * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;

    // Convert to 3D Cartesian vectors
    const v1 = [Math.cos(lat1) * Math.cos(lon1), Math.cos(lat1) * Math.sin(lon1), Math.sin(lat1)];
    const v2 = [Math.cos(lat2) * Math.cos(lon2), Math.cos(lat2) * Math.sin(lon2), Math.sin(lat2)];

    // Dot product & Angle omega
    let dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
    dot = Math.max(-1, Math.min(1, dot));
    const omega = Math.acos(dot);

    if (Math.abs(omega) < 0.0001) return [p1[0], p1[1]];

    const sinOmega = Math.sin(omega);
    const a = Math.sin((1 - t) * omega) / sinOmega;
    const b = Math.sin(t * omega) / sinOmega;

    const vInterp = [
      a * v1[0] + b * v2[0],
      a * v1[1] + b * v2[1],
      a * v1[2] + b * v2[2]
    ];

    const latInterp = Math.asin(Math.max(-1, Math.min(1, vInterp[2])));
    const lonInterp = Math.atan2(vInterp[1], vInterp[0]);

    return [(lonInterp * 180) / Math.PI, (latInterp * 180) / Math.PI];
  };

  // --------------------------------------------------------------------------
  // CANVAS RENDER LOOP (High-Performance 60FPS)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let running = true;
    let tick = 0;

    const render = () => {
      if (!running) return;
      tick++;

      // Auto-spin globe slowly if enabled and not currently dragging
      if (isAutoSpin && !isDraggingRef.current) {
        setRotation((prev) => ({
          lon: (prev.lon - 0.25) % 360,
          lat: prev.lat
        }));
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;
      const radius = Math.min(width, height) * 0.42;

      // 1. Globe Atmosphere Background / Ocean
      const oceanGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, radius * 0.1, cx, cy, radius);
      if (isLight) {
        oceanGrad.addColorStop(0, '#ffffff');
        oceanGrad.addColorStop(0.7, '#f8fafc');
        oceanGrad.addColorStop(1, '#e2e8f0');
      } else {
        oceanGrad.addColorStop(0, '#0f172a');
        oceanGrad.addColorStop(0.7, '#090d16');
        oceanGrad.addColorStop(1, '#020617');
      }

      // Outer Sphere Glow
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Sphere Outer Rim Shadow
      ctx.lineWidth = 2;
      ctx.strokeStyle = isLight ? 'rgba(30, 58, 138, 0.2)' : 'rgba(56, 189, 248, 0.3)';
      ctx.stroke();

      // 2. Latitude & Longitude Graticule Grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = isLight ? 'rgba(148, 163, 184, 0.3)' : 'rgba(255, 255, 255, 0.08)';

      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 5) {
          const pt = project(lon, lat, rotation.lon, rotation.lat, radius, cx, cy);
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else { ctx.lineTo(pt.x, pt.y); }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      for (let lon = -180; lon <= 180; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 5) {
          const pt = project(lon, lat, rotation.lon, rotation.lat, radius, cx, cy);
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else { ctx.lineTo(pt.x, pt.y); }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 3. Continent Polygons (Real Earth Geography)
      ctx.fillStyle = isLight ? '#1e293b' : '#1e293b';
      CONTINENT_POLYGONS.forEach((poly) => {
        ctx.beginPath();
        let started = false;
        poly.forEach(([lon, lat]) => {
          const pt = project(lon, lat, rotation.lon, rotation.lat, radius, cx, cy);
          if (pt.visible) {
            if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
            else { ctx.lineTo(pt.x, pt.y); }
          }
        });
        ctx.closePath();
        ctx.fillStyle = isLight ? '#0f172a' : '#1e293b';
        ctx.fill();
        ctx.strokeStyle = isLight ? '#334155' : '#334155';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // 4. Render Cross-Border Curved Flight Arcs & Particles
      const hubMap = new Map();
      BANKING_HUBS.forEach((h) => hubMap.set(h.id, h));

      ROUTE_EDGES.forEach((edge, edgeIdx) => {
        const fromHub = hubMap.get(edge.from);
        const toHub = hubMap.get(edge.to);
        if (!fromHub || !toHub) return;

        // Apply Filter
        if (activeFilter === 'CRITICAL' && edge.risk !== 'CRITICAL') return;
        if (activeFilter === 'CRYPTO' && !edge.type.toLowerCase().includes('crypto') && !toHub.type.includes('crypto')) return;
        if (activeFilter === 'INTERBANK' && edge.risk !== 'NORMAL') return;

        const isEdgeHovered = selectedRoute === edgeIdx;

        // Sample Great Circle Curve points
        const numSteps = 24;
        const curvePoints = [];
        let allVisible = false;

        for (let s = 0; s <= numSteps; s++) {
          const t = s / numSteps;
          const [iLon, iLat] = interpolateGreatCircle(fromHub.coords, toHub.coords, t);
          
          // Add artificial arc altitude elevation (parabolic height above sphere)
          const altitude = Math.sin(t * Math.PI) * (radius * 0.18);
          const pt = project(iLon, iLat, rotation.lon, rotation.lat, radius + altitude, cx, cy);
          curvePoints.push(pt);
          if (pt.visible) allVisible = true;
        }

        if (allVisible) {
          ctx.beginPath();
          let started = false;
          curvePoints.forEach((pt) => {
            if (pt.visible) {
              if (!started) { ctx.moveTo(pt.x, pt.y); started = true; }
              else { ctx.lineTo(pt.x, pt.y); }
            }
          });

          const arcColor = edge.risk === 'CRITICAL' ? '#ef4444' : edge.risk === 'HIGH' ? '#f59e0b' : '#10b981';
          ctx.strokeStyle = isEdgeHovered ? '#38bdf8' : `${arcColor}${isLight ? '99' : '88'}`;
          ctx.lineWidth = isEdgeHovered ? 2.5 : (edge.risk === 'CRITICAL' ? 1.6 : 1.0);
          ctx.stroke();
        }
      });

      // 5. Update & Draw Animated Stream Particles
      streamParticlesRef.current.forEach((particle) => {
        const edge = ROUTE_EDGES[particle.edgeIdx];
        if (!edge) return;

        // Filter check
        if (activeFilter === 'CRITICAL' && edge.risk !== 'CRITICAL') return;
        if (activeFilter === 'CRYPTO' && !edge.type.toLowerCase().includes('crypto')) return;

        particle.progress += particle.speed;
        if (particle.progress > 1) particle.progress = 0;

        const fromHub = hubMap.get(edge.from);
        const toHub = hubMap.get(edge.to);
        if (!fromHub || !toHub) return;

        const [pLon, pLat] = interpolateGreatCircle(fromHub.coords, toHub.coords, particle.progress);
        const altitude = Math.sin(particle.progress * Math.PI) * (radius * 0.18);
        const pt = project(pLon, pLat, rotation.lon, rotation.lat, radius + altitude, cx, cy);

        if (pt.visible) {
          // Glowing Head Particle
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.shadowColor = particle.color;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset shadow
        }
      });

      // 6. Draw Financial Hub Nodes & Pulse Rings
      BANKING_HUBS.forEach((hub) => {
        const pt = project(hub.coords[0], hub.coords[1], rotation.lon, rotation.lat, radius, cx, cy);
        if (!pt.visible) return;

        const isHovered = hoveredHub && hoveredHub.id === hub.id;
        const isJakarta = hub.id === 'jkt';
        const nodeColor = isJakarta ? '#38bdf8' : (hub.risk === 'CRITICAL' ? '#ef4444' : hub.risk === 'HIGH' ? '#f59e0b' : '#10b981');

        // Pulsating Radar Wave
        const pulse = (Math.sin(tick * 0.08 + hub.coords[0]) + 1) / 2;
        const ringRadius = (isJakarta ? 9 : 6) + pulse * (isJakarta ? 14 : 9);

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `${nodeColor}${Math.floor((1 - pulse) * 200).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Node Inner Circle
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isJakarta ? 6 : (isHovered ? 5.5 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? '#ffffff' : nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = isHovered ? 12 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isLight ? '#0f172a' : '#ffffff';
        ctx.stroke();

        // Node City Label (Styled matching reference image)
        const labelOffsetY = isJakarta ? 16 : -10;
        ctx.font = isJakarta ? 'bold 11px JetBrains Mono, monospace' : 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = isJakarta ? '#0284c7' : (hub.risk === 'CRITICAL' ? '#dc2626' : (isLight ? '#334155' : '#cbd5e1'));
        ctx.textAlign = 'center';
        ctx.fillText(hub.name, pt.x, pt.y + labelOffsetY);

        // Subtitle Country Name
        ctx.font = '600 7.5px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
        ctx.fillText(hub.country, pt.x, pt.y + labelOffsetY + 9);
      });

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [rotation, isAutoSpin, hoveredHub, selectedRoute, activeFilter, isLight, project]);

  // --------------------------------------------------------------------------
  // MOUSE & TOUCH DRAG ROTATION HANDLERS
  // --------------------------------------------------------------------------
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    lastMousePosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (isDraggingRef.current) {
      const dx = clientX - lastMousePosRef.current.x;
      const dy = clientY - lastMousePosRef.current.y;

      setRotation((prev) => ({
        lon: (prev.lon + dx * 0.45) % 360,
        lat: Math.max(-60, Math.min(60, prev.lat - dy * 0.35))
      }));

      lastMousePosRef.current = { x: clientX, y: clientY };
    } else {
      // Check node hover collision
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const cx = canvas.clientWidth / 2;
      const cy = canvas.clientHeight / 2 + 10;
      const radius = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.42;

      let found = null;
      BANKING_HUBS.forEach((hub) => {
        const pt = project(hub.coords[0], hub.coords[1], rotation.lon, rotation.lat, radius, cx, cy);
        if (pt.visible) {
          const dist = Math.hypot(pt.x - mx, pt.y - my);
          if (dist < 14) found = hub;
        }
      });
      setHoveredHub(found);
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 620,
        background: isLight ? '#ffffff' : '#0f172a',
        borderRadius: 24,
        border: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
        boxShadow: isLight ? '0 20px 50px rgba(30, 58, 138, 0.12)' : '0 24px 60px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Top Interactive HUD Bar */}
      <div style={{
        padding: '12px 18px',
        borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        background: isLight ? '#f8fafc' : '#090d16'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 8px #ef4444'
          }} />
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', letterSpacing: '-0.2px' }}>
            Cross-Border AML Surveillance
          </span>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#dc2626',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            16 ACTIVE HOPS
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            title={isAutoSpin ? 'Pause Rotasi' : 'Putar Otomatis'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              background: isAutoSpin ? (isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)') : (isLight ? '#f1f5f9' : '#1e293b'),
              border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              color: isAutoSpin ? '#0284c7' : (isLight ? '#64748b' : '#94a3b8'),
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAutoSpin ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoSpin ? 'Auto-Spin' : 'Manual'}</span>
          </button>

          <button
            onClick={() => setRotation({ lon: -100, lat: -10 })}
            title="Reset Fokus Jakarta"
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              background: isLight ? '#ffffff' : '#1e293b',
              border: isLight ? '1px solid #cbd5e1' : '1px solid #334155',
              color: isLight ? '#334155' : '#cbd5e1',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <RotateCw size={12} />
            <span>Reset (🇮🇩)</span>
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Viewport */}
      <div style={{ position: 'relative', width: '100%', height: 380, cursor: 'grab', userSelect: 'none' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Hovered Node Interactive Tooltip Card */}
        {hoveredHub && (
          <div style={{
            position: 'absolute',
            left: 16,
            top: 16,
            zIndex: 20,
            background: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(8, 14, 30, 0.95)',
            backdropFilter: 'blur(16px)',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
            maxWidth: 240,
            pointerEvents: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: '1.1rem' }}>{hoveredHub.flag}</span>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc' }}>
                  {hoveredHub.name}
                </div>
                <div style={{ fontSize: '0.64rem', color: isLight ? '#64748b' : '#94a3b8' }}>
                  {hoveredHub.country}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.68rem', color: isLight ? '#475569' : '#cbd5e1', lineHeight: 1.4, margin: '4px 0' }}>
              {hoveredHub.role}
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 6,
              paddingTop: 6,
              borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b'
            }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#dc2626' }}>
                {hoveredHub.risk} RISK
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, fontFamily: 'monospace', color: '#0284c7' }}>
                {hoveredHub.volume}
              </span>
            </div>
          </div>
        )}

        {/* Drag Hint Watermark */}
        <div style={{
          position: 'absolute',
          right: 14,
          bottom: 12,
          fontSize: '0.65rem',
          color: isLight ? '#94a3b8' : '#64748b',
          fontWeight: 600,
          pointerEvents: 'none',
          background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(15,23,42,0.75)',
          padding: '2px 8px',
          borderRadius: 4
        }}>
          🤏 Geser kursor / layar untuk memutar bola dunia
        </div>
      </div>

      {/* Filter Tabs & Telemetry Strip */}
      <div style={{
        padding: '10px 16px',
        background: isLight ? '#f8fafc' : '#090d16',
        borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b',
        display: 'flex',
        gap: 6,
        overflowX: 'auto'
      }}>
        {[
          { id: 'ALL', label: 'Semua Rute (16)' },
          { id: 'CRITICAL', label: 'Rute Shell & Kripto (Kritis)' },
          { id: 'CRYPTO', label: 'Aliran Bursa Kripto' },
          { id: 'INTERBANK', label: 'Kliring Interbank' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: activeFilter === tab.id
                ? (isLight ? '1px solid #2563eb' : '1px solid #38bdf8')
                : (isLight ? '1px solid #e2e8f0' : '1px solid #1e293b'),
              background: activeFilter === tab.id
                ? (isLight ? '#2563eb' : '#0284c7')
                : (isLight ? '#ffffff' : '#0f172a'),
              color: activeFilter === tab.id ? '#ffffff' : (isLight ? '#475569' : '#94a3b8'),
              fontSize: '0.68rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bottom Citation & Official Methodology Note (Matching Reference Image) */}
      <div style={{
        padding: '14px 18px',
        background: isLight ? '#ffffff' : '#0f172a',
        borderTop: isLight ? '1px solid #e2e8f0' : '1px solid #1e293b'
      }}>
        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', marginBottom: 2 }}>
          Cross-Border Financial Flight Routes with Indonesian Origins
        </div>
        <div style={{ fontSize: '0.68rem', color: isLight ? '#64748b' : '#94a3b8', fontStyle: 'italic' }}>
          Sumber: International Consortium of Investigative Journalists (ICIJ) Offshore Leaks &amp; PPATK AML Cross-Border Surveillance.
        </div>
      </div>
    </div>
  );
}
