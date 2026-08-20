import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Cpu,
  Target,
  Activity,
  Zap,
  Terminal,
  Play,
  BarChart3,
  GitBranch,
  Crosshair,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  Search,
  Filter,
  SlidersHorizontal,
  Maximize2,
  ShieldAlert,
  Sparkles,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { gnnGraphData, gnnModelMetrics, formatCurrency } from '../data/mockData';
import { checkHealth, fetchGnnGraph, simulateBackendDemo, gnnInference } from '../services/api';

// Node shape renderers for SVG
function NodeShape({ node, isHovered, isHighlighted, onMouseEnter, onMouseLeave, onClick, onDoubleClick }) {
  const size = node.type === 'exchange' ? 28 : node.type === 'wallet' ? 24 : node.type === 'mule' ? 26 : 24;
  const colors = {
    bank: { stroke: '#2563eb', bg: 'url(#grad-bank)', border: '#60a5fa', glow: '#3b82f6' },
    mule: { stroke: '#dc2626', bg: 'url(#grad-mule)', border: '#f87171', glow: '#ef4444' },
    wallet: { stroke: '#9333ea', bg: 'url(#grad-wallet)', border: '#c084fc', glow: '#a855f7' },
    exchange: { stroke: '#ea580c', bg: 'url(#grad-exchange)', border: '#fb923c', glow: '#f97316' }
  };
  const c = colors[node.type];
  const isActive = isHovered || isHighlighted;
  const opacity = isHighlighted === false ? 0.15 : 1;

  // Truncate labels to avoid text clutter and overlap
  const displayLabel = node.label.length > 13 ? node.label.substring(0, 11) + '...' : node.label;

  // Custom bobbing parameters so nodes float asynchronously
  const bobbingDuration = 3.5 + (node.id.charCodeAt(node.id.length - 1) % 4) * 0.5;
  const bobbingDelay = (node.id.charCodeAt(0) % 5) * 0.3;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ cursor: 'pointer', opacity, transition: 'opacity 0.3s, transform 0.2s' }}
    >
      <motion.g
        animate={{ y: [-3, 3, -3] }}
        transition={{
          duration: bobbingDuration,
          delay: bobbingDelay,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Pulse ring for high-risk nodes */}
        {node.riskScore >= 80 && (
          <circle r={size + 8} fill="none" stroke="#ef4444" strokeWidth="1.8" opacity="0.5">
            <animate attributeName="r" values={`${size + 4};${size + 15};${size + 4}`} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.8s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Glow */}
        {isActive && (
          <circle r={size + 6} fill="none" stroke={c.border} strokeWidth="2" strokeDasharray="4 2" opacity="0.85">
            <animate attributeName="stroke-dashoffset" from="12" to="0" dur="1s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Shape based on type */}
        {node.type === 'bank' && (
          <circle r={size} fill={c.bg} stroke={c.border} strokeWidth={isActive ? 3.0 : 1.8} filter={isActive ? "url(#node-glow)" : "url(#node-soft-shadow)"} />
        )}
        {node.type === 'mule' && (
          <polygon
            points={`0,${-size} ${size},0 0,${size} ${-size},0`}
            fill={c.bg} stroke={c.border} strokeWidth={isActive ? 3.0 : 1.8}
            filter={isActive ? "url(#node-glow)" : "url(#node-soft-shadow)"}
          />
        )}
        {node.type === 'wallet' && (
          <polygon
            points={hexPoints(size)}
            fill={c.bg} stroke={c.border} strokeWidth={isActive ? 3.0 : 1.8}
            filter={isActive ? "url(#node-glow)" : "url(#node-soft-shadow)"}
          />
        )}
        {node.type === 'exchange' && (
          <rect
            x={-size} y={-size} width={size * 2} height={size * 2}
            rx="6" fill={c.bg} stroke={c.border} strokeWidth={isActive ? 3.0 : 1.8}
            filter={isActive ? "url(#node-glow)" : "url(#node-soft-shadow)"}
          />
        )}

        {/* Label Capsule Background Card */}
        <rect
          x={-50}
          y={size + 5}
          width={100}
          height={17}
          rx="5"
          fill="rgba(3, 7, 18, 0.92)"
          stroke={isActive ? c.border : "rgba(255,255,255,0.1)"}
          strokeWidth="1.2"
        />

        {/* Label */}
        <text
          y={size + 16.5}
          textAnchor="middle"
          fill="white"
          fontSize="9.5"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          {displayLabel}
        </text>

        {/* Risk score badge */}
        <g transform={`translate(${size - 2}, ${-size + 2})`}>
          <circle r="10.5" fill={node.riskScore >= 80 ? '#ef4444' : node.riskScore >= 50 ? '#f59e0b' : '#10b981'} stroke="#0f172a" strokeWidth="1.8" />
          <text textAnchor="middle" y="3.5" fill="white" fontSize="8.5" fontWeight="800" fontFamily="var(--font-mono)">
            {node.riskScore}
          </text>
        </g>
      </motion.g>
    </g>
  );
}

function hexPoints(size) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(`${Math.cos(angle) * size},${Math.sin(angle) * size}`);
  }
  return points.join(' ');
}

// Edge renderer
function Edge({ edge, sourceNode, targetNode, isHighlighted, showFlowParticles }) {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const color = colors[edge.riskLevel];
  const thickness = edge.riskLevel === 'high' ? 3.2 : edge.riskLevel === 'medium' ? 2.2 : 1.5;
  const opacity = isHighlighted === false ? 0.08 : isHighlighted === true ? 0.95 : 0.55;

  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  const sourceSize = sourceNode.type === 'exchange' ? 28 : sourceNode.type === 'wallet' ? 24 : sourceNode.type === 'mule' ? 26 : 24;
  const targetSize = targetNode.type === 'exchange' ? 28 : targetNode.type === 'wallet' ? 24 : targetNode.type === 'mule' ? 26 : 24;

  const startX = sourceNode.x + (dx / len) * (sourceSize + 4);
  const startY = sourceNode.y + (dy / len) * (sourceSize + 4);
  const endX = targetNode.x - (dx / len) * (targetSize + 10);
  const endY = targetNode.y - (dy / len) * (targetSize + 10);

  const curveOffset = (dy === 0 ? 0 : dy * 0.14);
  const cx = startX + (endX - startX) * 0.5;
  const cy = startY + (endY - startY) * 0.5 + Math.min(35, Math.max(-35, curveOffset));

  const pathD = `M${startX},${startY} Q${cx},${cy} ${endX},${endY}`;

  return (
    <g style={{ opacity, transition: 'opacity 0.3s' }}>
      <path
        d={pathD}
        stroke={color}
        strokeWidth={thickness}
        fill="none"
        strokeDasharray={edge.riskLevel === 'high' ? "8 4" : "5 5"}
        markerEnd={`url(#arrowhead-${edge.riskLevel})`}
        filter={`url(#edge-glow-${edge.riskLevel})`}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="24"
          to="0"
          dur={edge.riskLevel === 'high' ? "1.2s" : "2s"}
          repeatCount="indefinite"
        />
      </path>

      {/* Animated Fund Particles */}
      {showFlowParticles && (
        <circle r="3.5" fill={color} filter="url(#particle-glow)">
          <animateMotion
            path={pathD}
            dur={edge.riskLevel === 'high' ? "1.8s" : "3s"}
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Edge Amount Badge */}
      {isHighlighted && edge.amount && (
        <g transform={`translate(${cx}, ${cy - 10})`}>
          <rect
            x={-36}
            y={-10}
            width={72}
            height={17}
            rx="5"
            fill="rgba(3, 7, 18, 0.95)"
            stroke={color}
            strokeWidth="1.2"
          />
          <text
            textAnchor="middle"
            y="2.5"
            fill="white"
            fontSize="8.5"
            fontWeight="800"
            fontFamily="var(--font-mono)"
          >
            {formatCurrency(edge.amount)}
          </text>
        </g>
      )}
    </g>
  );
}

export default function GNNVisualization({ addToast }) {
  const [graphData, setGraphData] = useState(gnnGraphData);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isInferring, setIsInferring] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [tooltipData, setTooltipData] = useState(null);
  const svgRef = useRef(null);

  // Filters & Interactivity
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFlowParticles, setShowFlowParticles] = useState(true);

  // Zoom & Pan states
  const [zoomState, setZoomState] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // Load GNN Graph from backend on mount
  useEffect(() => {
    async function loadGraph() {
      try {
        const dynamicGraph = await fetchGnnGraph();
        if (dynamicGraph && dynamicGraph.nodes && dynamicGraph.nodes.length > 0) {
          setGraphData(dynamicGraph);
        }
      } catch (err) {
        console.error("Failed to load GNN graph from API:", err);
      }
    }
    loadGraph();
  }, []);

  const activeNodeId = selectedNode || hoveredNode;

  // Zoom controls click handlers
  const handleZoomIn = () => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.min(3.0, parseFloat((prev.scale + 0.15 * prev.scale).toFixed(2)))
    }));
  };

  const handleZoomOut = () => {
    setZoomState(prev => ({
      ...prev,
      scale: Math.max(0.4, parseFloat((prev.scale - 0.15 * prev.scale).toFixed(2)))
    }));
  };

  const handleResetZoom = () => {
    setZoomState({ scale: 1, offsetX: 0, offsetY: 0 });
  };

  const handleSliderZoom = (e) => {
    const val = parseFloat(e.target.value);
    setZoomState(prev => ({ ...prev, scale: val }));
  };

  // Focus and center node view
  const handleFocusNode = (node) => {
    if (!node) return;
    const newScale = 1.5;
    const newOffsetX = 950 / 2 - node.x * newScale;
    const newOffsetY = dynamicHeight / 2 - node.y * newScale;
    setZoomState({ scale: newScale, offsetX: newOffsetX, offsetY: newOffsetY });
  };

  // Wheel Zoom-to-cursor handler (non-passive via native listener)
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const handleWheelEvent = (e) => {
      e.preventDefault();
      const rect = svgEl.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      const zoomFactor = 0.08;
      const direction = e.deltaY < 0 ? 1 : -1;

      setZoomState(prev => {
        const newScale = Math.min(3.0, Math.max(0.4, prev.scale * (1 + direction * zoomFactor)));
        const xSvg = (px - prev.offsetX) / prev.scale;
        const ySvg = (py - prev.offsetY) / prev.scale;
        return {
          scale: parseFloat(newScale.toFixed(2)),
          offsetX: px - xSvg * newScale,
          offsetY: py - ySvg * newScale
        };
      });
    };

    svgEl.addEventListener('wheel', handleWheelEvent, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', handleWheelEvent);
    };
  }, []);

  // Pointer event handlers for drag-to-pan
  const handlePointerDown = (e) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStartRef.current = { x: e.clientX - zoomState.offsetX, y: e.clientY - zoomState.offsetY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isPanning) return;
    setZoomState(prev => ({
      ...prev,
      offsetX: e.clientX - panStartRef.current.x,
      offsetY: e.clientY - panStartRef.current.y
    }));
  };

  const handlePointerUp = (e) => {
    if (!isPanning) return;
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Dynamic layout constants and computation
  const LAYOUT_WIDTH = 950;
  const X_POSITIONS = {
    bank: 100,
    mule: 350,
    wallet: 600,
    exchange: 850
  };

  const { nodes, dynamicHeight } = useMemo(() => {
    if (!graphData || !graphData.nodes) return { nodes: [], dynamicHeight: 650 };

    const bankNodes = graphData.nodes.filter(n => n.type === 'bank');
    const muleNodes = graphData.nodes.filter(n => n.type === 'mule');
    const walletNodes = graphData.nodes.filter(n => n.type === 'wallet');
    const exchangeNodes = graphData.nodes.filter(n => n.type === 'exchange');

    const maxNodes = Math.max(
      bankNodes.length,
      muleNodes.length,
      walletNodes.length,
      exchangeNodes.length
    );

    const yGap = 125;
    const computedHeight = Math.max(650, maxNodes * yGap + 140);
    const contentHeight = computedHeight - 180;

    const mappedNodes = graphData.nodes.map(n => {
      const colNodes = graphData.nodes.filter(node => node.type === n.type);
      const idx = colNodes.findIndex(node => node.id === n.id);
      const N = colNodes.length;

      const spacing = Math.min(yGap, N > 1 ? contentHeight / (N - 1) : 0);
      const startY = 90 + (contentHeight - (N - 1) * spacing) / 2;
      const y = N > 1 ? startY + idx * spacing : computedHeight / 2;

      return {
        ...n,
        x: X_POSITIONS[n.type] || 300,
        y: y
      };
    });

    return { nodes: mappedNodes, dynamicHeight: computedHeight };
  }, [graphData]);

  // Compute connected edges and nodes for highlighting
  const { highlightedNodes, highlightedEdges } = useMemo(() => {
    if (!activeNodeId) return { highlightedNodes: null, highlightedEdges: null };
    const connEdges = new Set();
    const connNodes = new Set([activeNodeId]);
    graphData.edges.forEach((edge, i) => {
      if (edge.source === activeNodeId || edge.target === activeNodeId) {
        connEdges.add(i);
        connNodes.add(edge.source);
        connNodes.add(edge.target);
      }
    });
    return { highlightedNodes: connNodes, highlightedEdges: connEdges };
  }, [activeNodeId, graphData]);

  // Filtered nodes based on category & search query
  const filteredNodeIds = useMemo(() => {
    const ids = new Set();
    nodes.forEach(n => {
      let matchesCategory = true;
      if (activeFilter === 'high' && n.riskScore < 80) matchesCategory = false;
      if (activeFilter === 'mule' && n.type !== 'mule') matchesCategory = false;
      if (activeFilter === 'crypto' && n.type !== 'wallet' && n.type !== 'exchange') matchesCategory = false;

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const labelMatch = n.label.toLowerCase().includes(q);
        const bankMatch = n.bank && n.bank.toLowerCase().includes(q);
        const typeMatch = n.type.toLowerCase().includes(q);
        matchesSearch = labelMatch || bankMatch || typeMatch;
      }

      if (matchesCategory && matchesSearch) {
        ids.add(n.id);
      }
    });
    return ids;
  }, [nodes, activeFilter, searchQuery]);

  const handleNodeHover = useCallback((nodeId, node) => {
    setHoveredNode(nodeId);
    if (node) {
      setTooltipData({
        x: node.x,
        y: node.y,
        label: node.label,
        type: node.type,
        riskScore: node.riskScore,
        bank: node.bank
      });
    }
  }, []);

  const handleNodeLeave = useCallback(() => {
    setHoveredNode(null);
    setTooltipData(null);
  }, []);

  // GNN Inference simulation
  const runInference = async () => {
    setIsInferring(true);
    setTerminalOutput([]);

    try {
      setTerminalOutput(prev => [...prev, { time: new Date().toLocaleTimeString(), text: '[API-GNN-ENGINE] Menghubungi Crypto-Sentinel API Server...' }]);

      const inferenceResult = await gnnInference();

      const steps = [
        { text: `[API-DATA-LOADER] Memuat ${inferenceResult.graph_stats.total_nodes} nodes, ${inferenceResult.graph_stats.total_edges} edges dari transaction logs...`, delay: 500 },
        { text: '[API-GNN-PREPROCESS] Menghitung PageRank & Graph Centrality metrics...', delay: 1000 },
        { text: '[API-GNN-LAYER] Message Passing — Agregasi fitur tetangga (k=3)...', delay: 1500 },
        { text: '[API-ATTENTION] Menghitung attention weights pada edges...', delay: 2000 },
        { text: '[API-ANOMALY] Memprediksi anomali dengan Graph Neural Network...', delay: 2500 }
      ];

      if (inferenceResult.anomalies && inferenceResult.anomalies.length > 0) {
        inferenceResult.anomalies.forEach((anomaly, idx) => {
          steps.push({
            text: `[API-RESULT] ⚠️ ANOMALI TERDETEKSI: ${anomaly.account_name} (${anomaly.role}) - Skor: ${anomaly.anomaly_score}%`,
            delay: 3000 + (idx * 300)
          });
        });
      } else {
        steps.push({
          text: '[API-RESULT] ℹ️ Tidak ada anomali terdeteksi atau data transaksi masih minimal.',
          delay: 3000
        });
      }

      steps.push({
        text: '[API-COMPLETE] GNN Anomaly Detection selesai! Graph forensik disinkronisasi.',
        delay: 3000 + (Math.max(inferenceResult.anomalies?.length || 0, 1) * 300) + 500
      });

      steps.forEach(step => {
        setTimeout(() => {
          setTerminalOutput(prev => [...prev, { time: new Date().toLocaleTimeString(), text: step.text }]);
        }, step.delay);
      });

      setTimeout(() => {
        setIsInferring(false);
        const anomalyCount = inferenceResult.anomalies?.length || 0;
        addToast?.(
          anomalyCount > 0
            ? `🧠 GNN Inference selesai! ${anomalyCount} anomali terdeteksi.`
            : '🧠 GNN Inference selesai! Sistem ready.',
          anomalyCount > 0 ? 'warning' : 'success'
        );
      }, steps[steps.length - 1].delay + 500);

    } catch (error) {
      console.error("GNN inference failed:", error);
      setIsInferring(false);
      addToast?.('❌ GNN Inference gagal. ' + (error.message || 'Error jaringan.'), 'error');
    }
  };

  const typeLabels = {
    bank: { label: 'Rekening Bank', shape: 'circle', color: '#3b82f6' },
    mule: { label: 'Rekening Mule', shape: 'diamond', color: '#ef4444' },
    wallet: { label: 'Crypto Wallet', shape: 'hexagon', color: '#a855f7' },
    exchange: { label: 'Exchange', shape: 'square', color: '#f97316' }
  };

  const selectedNodeData = useMemo(() => {
    return nodes.find(n => n.id === selectedNode) || null;
  }, [selectedNode, nodes]);

  return (
    <div className="gnn-view">
      {/* Model Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Akurasi GNN', value: `${gnnModelMetrics.accuracy}%`, icon: <Target size={20} />, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.2)' },
          { label: 'Presisi Model', value: `${gnnModelMetrics.precision}%`, icon: <Crosshair size={20} />, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.1)', border: 'rgba(99, 102, 241, 0.2)' },
          { label: 'Recall Rate', value: `${gnnModelMetrics.recall}%`, icon: <Activity size={20} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)' },
          { label: 'Anomali Terdeteksi', value: gnnModelMetrics.anomaliesDetected, icon: <Zap size={20} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)' }
        ].map((metric, i) => (
          <motion.div
            key={i}
            className="card"
            style={{
              padding: 18,
              border: `1px solid ${metric.border}`,
              background: 'var(--bg-card)',
              backdropFilter: 'blur(16px)',
              boxShadow: 'var(--shadow-card)',
              position: 'relative',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: metric.bg,
                border: `1px solid ${metric.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: metric.color,
                boxShadow: `0 0 16px ${metric.bg}`
              }}>
                {metric.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{metric.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: metric.color }}>{metric.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GNN Graph + Controls */}
      <div className="content-grid-wide">
        {/* Main Graph Canvas Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card" style={{ border: '1px solid var(--border-accent)', boxShadow: '0 0 30px rgba(99, 102, 241, 0.08)' }}>
            
            {/* Header + Cyber Filter Toolbar */}
            <div className="card-header" style={{ flexDirection: 'column', gap: 14, alignItems: 'stretch', padding: '16px 20px', background: 'rgba(9, 13, 22, 0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8' }}>
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h3 className="card-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>Graph Neural Network — AI Fraud Forensics Canvas</h3>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Analisis Topologi Aliran Dana Sandbox PaySim & Network Multi-Hop</p>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: 'Semua Node' },
                    { id: 'high', label: '🔴 Risiko Tinggi (80%+)' },
                    { id: 'mule', label: '⚠️ Rekening Mule' },
                    { id: 'crypto', label: '💎 Crypto Wallet & Exchange' }
                  ].map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      style={{
                        fontSize: '0.72rem',
                        padding: '5px 12px',
                        borderRadius: 8,
                        border: activeFilter === filter.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: activeFilter === filter.id ? 'var(--gradient-primary)' : 'var(--bg-input)',
                        color: activeFilter === filter.id ? 'white' : 'var(--text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: activeFilter === filter.id ? '0 0 14px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: 220 }}>
                  <input
                    type="text"
                    placeholder="Cari node / wallet / exchange..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 30px',
                      fontSize: '0.76rem',
                      borderRadius: 8,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            {/* Canvas Container */}
            <div className="card-body" style={{ padding: 0 }}>
              <div className="gnn-graph-container" style={{ position: 'relative', overflow: 'hidden', background: '#030712' }}>
                
                {/* Navigation Instruction Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(9, 13, 22, 0.75)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'rgba(255, 255, 255, 0.75)',
                    fontSize: '0.68rem',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    zIndex: 10,
                    fontWeight: 500
                  }}
                >
                  <HelpCircle size={13} style={{ color: '#38bdf8' }} />
                  <span>Seret Canvas • Scroll / Slider Zoom • Double Click Node untuk Fokus</span>
                </div>

                {/* SVG Graphics Canvas */}
                <svg
                  ref={svgRef}
                  width="100%"
                  height="auto"
                  viewBox={`0 0 950 ${dynamicHeight}`}
                  preserveAspectRatio="xMidYMid meet"
                  style={{
                    background: 'radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.4) 0%, rgba(3, 7, 18, 0.98) 100%)',
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                    cursor: isPanning ? 'grabbing' : 'grab',
                    touchAction: 'none',
                    userSelect: 'none'
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  {/* Defs */}
                  <defs>
                    <marker id="arrowhead-high" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                    </marker>
                    <marker id="arrowhead-medium" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#f59e0b" />
                    </marker>
                    <marker id="arrowhead-low" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="#10b981" />
                    </marker>
                    
                    {/* SVG Node Linear Gradients */}
                    <linearGradient id="grad-bank" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                    <linearGradient id="grad-mule" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f87171" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                    <linearGradient id="grad-wallet" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#7e22ce" />
                    </linearGradient>
                    <linearGradient id="grad-exchange" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#c2410c" />
                    </linearGradient>

                    {/* Cyber Grid pattern */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="0.5" />
                      <circle cx="40" cy="40" r="0.8" fill="rgba(99, 102, 241, 0.2)" />
                    </pattern>
                    
                    {/* Glow filters for edges */}
                    <filter id="edge-glow-high" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.6"/>
                    </filter>
                    <filter id="edge-glow-medium" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.6"/>
                    </filter>
                    <filter id="edge-glow-low" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#10b981" floodOpacity="0.6"/>
                    </filter>
                    <filter id="particle-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="1.8" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>

                    {/* Glow filter for nodes */}
                    <filter id="node-glow" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComponentTransfer in="blur" result="glow">
                        <feFuncA type="linear" slope="0.85" />
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode in="glow" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="node-soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                    </filter>
                  </defs>

                  {/* Grid background */}
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Pan & Zoom Group */}
                  <g transform={`translate(${zoomState.offsetX}, ${zoomState.offsetY}) scale(${zoomState.scale})`}>
                    
                    {/* Translucent Column Lanes */}
                    <g opacity="0.9">
                      <rect x="10" y="45" width="180" height={dynamicHeight - 65} rx="12" fill="rgba(59, 130, 246, 0.02)" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" />
                      <rect x="260" y="45" width="180" height={dynamicHeight - 65} rx="12" fill="rgba(239, 68, 68, 0.04)" stroke="rgba(239, 68, 68, 0.18)" strokeWidth="1.2" strokeDasharray="6 4" />
                      <rect x="510" y="45" width="180" height={dynamicHeight - 65} rx="12" fill="rgba(168, 85, 247, 0.02)" stroke="rgba(168, 85, 247, 0.1)" strokeWidth="1" />
                      <rect x="760" y="45" width="180" height={dynamicHeight - 65} rx="12" fill="rgba(249, 115, 22, 0.02)" stroke="rgba(249, 115, 22, 0.1)" strokeWidth="1" />
                    </g>

                    {/* Column Header Badges */}
                    <g>
                      <text x="100" y="28" textAnchor="middle" fill="#60a5fa" fontSize="10.5" fontWeight="800" letterSpacing="1">1. SUMBER DANA</text>
                      <text x="350" y="28" textAnchor="middle" fill="#f87171" fontSize="10.5" fontWeight="800" letterSpacing="1">2. REKENING MULE</text>
                      <text x="600" y="28" textAnchor="middle" fill="#c084fc" fontSize="10.5" fontWeight="800" letterSpacing="1">3. CRYPTO WALLET</text>
                      <text x="850" y="28" textAnchor="middle" fill="#fb923c" fontSize="10.5" fontWeight="800" letterSpacing="1">4. EXCHANGE</text>
                    </g>

                    {/* Edges */}
                    {graphData.edges.map((edge, i) => {
                      const sourceNode = nodes.find(n => n.id === edge.source);
                      const targetNode = nodes.find(n => n.id === edge.target);
                      if (!sourceNode || !targetNode) return null;

                      const isHighlighted = highlightedEdges
                        ? highlightedEdges.has(i) ? true : false
                        : null;

                      return (
                        <Edge
                          key={i}
                          edge={edge}
                          sourceNode={sourceNode}
                          targetNode={targetNode}
                          isHighlighted={isHighlighted}
                          showFlowParticles={showFlowParticles}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map(node => {
                      const isHovered = hoveredNode === node.id;
                      const isMatchingFilter = filteredNodeIds.has(node.id);
                      const isHighlighted = highlightedNodes
                        ? (highlightedNodes.has(node.id) && isMatchingFilter) ? true : false
                        : isMatchingFilter ? null : false;

                      return (
                        <NodeShape
                          key={node.id}
                          node={node}
                          isHovered={isHovered}
                          isHighlighted={isHighlighted}
                          onMouseEnter={() => handleNodeHover(node.id, node)}
                          onMouseLeave={handleNodeLeave}
                          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                          onDoubleClick={() => handleFocusNode(node)}
                        />
                      );
                    })}
                  </g>
                </svg>

                {/* Glassmorphic Cyber Controls Panel */}
                <div
                  className="gnn-zoom-controls"
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(9, 13, 22, 0.88)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(99, 102, 241, 0.1)',
                    zIndex: 10,
                    userSelect: 'none'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', minWidth: 40, fontFamily: 'var(--font-mono)' }}>
                    {Math.round(zoomState.scale * 100)}%
                  </span>
                  
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ZoomOut size={13} />
                  </button>

                  <input
                    type="range"
                    min="0.4"
                    max="3.0"
                    step="0.05"
                    value={zoomState.scale}
                    onChange={handleSliderZoom}
                    style={{ width: 90, cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                  />
                  
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <ZoomIn size={13} />
                  </button>
                  
                  <div style={{ width: 1, height: 16, background: 'var(--border-color)', marginInline: 2 }} />

                  <button
                    onClick={handleResetZoom}
                    title="Fit / Reset Tampilan"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>

                {/* Node Inspector Drawer */}
                {selectedNodeData && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 280,
                      background: 'rgba(9, 13, 22, 0.96)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid var(--border-accent)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 16,
                      boxShadow: '0 12px 36px rgba(0,0,0,0.7), 0 0 20px rgba(99, 102, 241, 0.15)',
                      zIndex: 30
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="gnn-legend-dot" style={{ background: typeLabels[selectedNodeData.type]?.color }} />
                        <strong style={{ fontSize: '0.88rem', color: 'white' }}>{selectedNodeData.label}</strong>
                      </div>
                      <button
                        onClick={() => setSelectedNode(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.76rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Tipe Node:</span>
                        <strong style={{ color: typeLabels[selectedNodeData.type]?.color }}>{typeLabels[selectedNodeData.type]?.label}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Skor Risiko FDS:</span>
                        <strong style={{ color: selectedNodeData.riskScore >= 80 ? '#ef4444' : selectedNodeData.riskScore >= 50 ? '#f59e0b' : '#10b981', fontFamily: 'var(--font-mono)' }}>
                          {selectedNodeData.riskScore}%
                        </strong>
                      </div>

                      {selectedNodeData.bank && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 6 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Lembaga Bank:</span>
                          <strong>{selectedNodeData.bank}</strong>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: 'var(--bg-input)', borderRadius: 6 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Graph Centrality:</span>
                        <strong style={{ fontFamily: 'var(--font-mono)' }}>{selectedNodeData.degree || 1} k-neighbors</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFocusNode(selectedNodeData)}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 14, justifyContent: 'center', fontSize: '0.78rem', padding: '8px 12px', fontWeight: 700 }}
                    >
                      <Crosshair size={14} /> Fokuskan Tampilan Node
                    </button>
                  </motion.div>
                )}

                {/* Tooltip */}
                {tooltipData && !selectedNodeData && (
                  <div
                    className="gnn-tooltip"
                    style={{
                      position: 'absolute',
                      left: `calc(${((tooltipData.x * zoomState.scale + zoomState.offsetX) / 950) * 100}% + 20px)`,
                      top: `calc(${((tooltipData.y * zoomState.scale + zoomState.offsetY) / dynamicHeight) * 100}% - 10px)`,
                      transform: (tooltipData.x * zoomState.scale + zoomState.offsetX) > (950 * 0.75) ? 'translateX(-120%)' : 'none',
                      pointerEvents: 'none',
                      zIndex: 50,
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{tooltipData.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Tipe: {typeLabels[tooltipData.type]?.label}</span>
                      {tooltipData.bank && <span> • {tooltipData.bank}</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', marginTop: 4 }}>
                      Skor Risiko: <strong style={{
                        color: tooltipData.riskScore >= 80 ? '#ef4444' : tooltipData.riskScore >= 50 ? '#f59e0b' : '#10b981',
                        fontFamily: 'var(--font-mono)'
                      }}>{tooltipData.riskScore}%</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="gnn-legend" style={{ background: 'rgba(9, 13, 22, 0.95)', borderTop: '1px solid var(--border-color)' }}>
                <div className="gnn-legend-title">
                  <Layers size={14} /> LEGENDA FORENSIK GNN
                </div>
                <div className="gnn-legend-items">
                  <div className="gnn-legend-section">
                    <span className="gnn-legend-subtitle">Tipe Node</span>
                    {Object.entries(typeLabels).map(([key, val]) => (
                      <div key={key} className="gnn-legend-item">
                        <span className="gnn-legend-dot" style={{ background: val.color }} />
                        <span>{val.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="gnn-legend-section">
                    <span className="gnn-legend-subtitle">Risiko Edge</span>
                    <div className="gnn-legend-item"><span className="gnn-legend-line" style={{ background: '#ef4444' }} /><span>Tinggi</span></div>
                    <div className="gnn-legend-item"><span className="gnn-legend-line" style={{ background: '#f59e0b' }} /><span>Sedang</span></div>
                    <div className="gnn-legend-item"><span className="gnn-legend-line" style={{ background: '#10b981' }} /><span>Rendah</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Control Panel + Console */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          {/* Model Info */}
          <div className="card" style={{ marginBottom: 20, border: '1px solid var(--border-accent)', background: 'var(--gradient-card)', backdropFilter: 'blur(16px)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--accent-primary)', fontWeight: 800 }}><Brain size={18} /> GNN Model Config</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, fontSize: '0.8rem' }}>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Embedding Dim</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.embeddingDimension}d</p>
                </div>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Message Passes</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.messagePasses} layers</p>
                </div>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Training Epochs</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.trainingEpochs}</p>
                </div>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>F1 Score</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>{gnnModelMetrics.f1Score}%</p>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
                <p>Nodes diproses: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.nodesAnalyzed.toLocaleString()}</strong></p>
                <p>Edges diproses: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.edgesProcessed.toLocaleString()}</strong></p>
                <p>Terakhir diperbarui: <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.lastUpdated}</strong></p>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', fontWeight: 700, boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)' }}
                onClick={runInference}
                disabled={isInferring}
              >
                {isInferring ? (
                  <><Cpu size={16} className="animate-spin" style={{ animationDuration: '2s' }} /> Menjalankan GNN Inference...</>
                ) : (
                  <><Play size={16} /> Jalankan GNN Inference</>
                )}
              </button>
            </div>
          </div>

          {/* Terminal Console */}
          <div className="card" style={{ background: '#020617', borderColor: '#1e293b', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
            <div className="card-header" style={{ borderBottomColor: '#1e293b', background: '#0b0f19', padding: '12px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={16} style={{ color: '#a78bfa' }} />
                <h3 className="card-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a78bfa' }}>GNN_INFERENCE_CONSOLE.log</h3>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isInferring ? '#10b981' : '#64748b', display: 'inline-block', boxShadow: isInferring ? '0 0 10px #10b981' : 'none' }} />
            </div>
            <div className="card-body" style={{ padding: 14, maxHeight: 280, overflowY: 'auto' }}>
              {terminalOutput.length === 0 ? (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b', textAlign: 'center', padding: 20 }}>
                  <Brain size={24} style={{ marginInline: 'auto', marginBottom: 8, display: 'block', opacity: 0.5 }} />
                  Klik "Jalankan GNN Inference" untuk memulai analisis jaringan transaksi.
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {terminalOutput.map((log, i) => (
                    <div key={i} style={{ lineBreak: 'anywhere' }}>
                      <span style={{ color: '#64748b' }}>[{log.time}]</span>{' '}
                      <span style={{
                        color: log.text.includes('ANOMALI') || log.text.includes('MULE')
                          ? '#ef4444'
                          : log.text.includes('COMPLETE')
                            ? '#10b981'
                            : log.text.includes('RESULT')
                              ? '#f59e0b'
                              : '#a78bfa'
                      }}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                  {isInferring && (
                    <span className="animate-pulse" style={{ color: '#a78bfa' }}>▋</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
