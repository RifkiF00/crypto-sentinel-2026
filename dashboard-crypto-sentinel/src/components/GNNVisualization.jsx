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
  Layers
} from 'lucide-react';
import { gnnGraphData, gnnModelMetrics, formatCurrency } from '../data/mockData';
import { checkHealth, fetchGnnGraph, simulateBackendDemo, gnnInference } from '../services/api';

// Node shape renderers for SVG
function NodeShape({ node, isHovered, isHighlighted, onMouseEnter, onMouseLeave, onClick }) {
  const size = node.type === 'exchange' ? 28 : node.type === 'wallet' ? 24 : node.type === 'mule' ? 26 : 22;
  const colors = {
    bank: { fill: '#3b82f6', stroke: '#2563eb', bg: 'rgba(59,130,246,0.15)' },
    mule: { fill: '#ef4444', stroke: '#dc2626', bg: 'rgba(239,68,68,0.15)' },
    wallet: { fill: '#a855f7', stroke: '#9333ea', bg: 'rgba(168,85,247,0.15)' },
    exchange: { fill: '#f97316', stroke: '#ea580c', bg: 'rgba(249,115,22,0.15)' }
  };
  const c = colors[node.type];
  const isActive = isHovered || isHighlighted;
  const opacity = isHighlighted === false ? 0.2 : 1;

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ cursor: 'pointer', opacity, transition: 'opacity 0.3s' }}
    >
      {/* Pulse ring for high-risk nodes */}
      {node.riskScore >= 85 && (
        <circle r={size + 8} fill="none" stroke={c.fill} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="r" values={`${size + 4};${size + 14};${size + 4}`} dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Glow */}
      {isActive && (
        <circle r={size + 6} fill={c.bg} stroke={c.fill} strokeWidth="1" strokeDasharray="3 2" opacity="0.5">
          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Shape based on type */}
      {node.type === 'bank' && (
        <circle r={size} fill={c.bg} stroke={c.fill} strokeWidth={isActive ? 2.5 : 1.5} />
      )}
      {node.type === 'mule' && (
        <polygon
          points={`0,${-size} ${size},0 0,${size} ${-size},0`}
          fill={c.bg} stroke={c.fill} strokeWidth={isActive ? 2.5 : 1.5}
        />
      )}
      {node.type === 'wallet' && (
        <polygon
          points={hexPoints(size)}
          fill={c.bg} stroke={c.fill} strokeWidth={isActive ? 2.5 : 1.5}
        />
      )}
      {node.type === 'exchange' && (
        <rect
          x={-size} y={-size} width={size * 2} height={size * 2}
          rx="6" fill={c.bg} stroke={c.fill} strokeWidth={isActive ? 2.5 : 1.5}
        />
      )}

      {/* Label */}
      <text
        y={size + 16}
        textAnchor="middle"
        fill="var(--text-primary)"
        fontSize="10"
        fontWeight="600"
        fontFamily="var(--font-sans)"
      >
        {node.label}
      </text>

      {/* Risk score badge */}
      <g transform={`translate(${size - 4}, ${-size + 4})`}>
        <circle r="10" fill={node.riskScore >= 80 ? '#ef4444' : node.riskScore >= 50 ? '#f59e0b' : '#10b981'} />
        <text textAnchor="middle" y="3.5" fill="white" fontSize="8" fontWeight="700" fontFamily="var(--font-mono)">
          {node.riskScore}
        </text>
      </g>
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
function Edge({ edge, sourceNode, targetNode, isHighlighted }) {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const color = colors[edge.riskLevel];
  const thickness = edge.riskLevel === 'high' ? 2.5 : edge.riskLevel === 'medium' ? 1.8 : 1.2;
  const opacity = isHighlighted === false ? 0.08 : isHighlighted === true ? 0.9 : 0.35;

  // Curved path
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const cx = sourceNode.x + dx * 0.5;
  const cy = sourceNode.y + dy * 0.5 - (Math.abs(dy) < 80 ? 30 : 0);

  return (
    <g style={{ opacity, transition: 'opacity 0.3s' }}>
      <path
        d={`M${sourceNode.x},${sourceNode.y} Q${cx},${cy} ${targetNode.x},${targetNode.y}`}
        stroke={color}
        strokeWidth={thickness}
        fill="none"
        strokeDasharray={edge.riskLevel === 'low' ? '5 4' : 'none'}
        markerEnd={`url(#arrowhead-${edge.riskLevel})`}
      >
        {isHighlighted && (
          <animate
            attributeName="stroke-dashoffset"
            from="20"
            to="0"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </path>
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

  // Load GNN Graph from backend on mount
  useEffect(() => {
    async function loadGraph() {
      try {
        const online = await checkHealth();
        if (online) {
          const dynamicGraph = await fetchGnnGraph();
          setGraphData(dynamicGraph);
        }
      } catch (err) {
        console.error("Failed to load GNN graph from API:", err);
      }
    }
    loadGraph();
  }, []);

  const activeNodeId = selectedNode || hoveredNode;

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

      // Call actual GNN inference from API
      const inferenceResult = await gnnInference();

      // Build dynamic steps from API response
      const steps = [
        { text: `[API-DATA-LOADER] Memuat ${inferenceResult.graph_stats.total_nodes} nodes, ${inferenceResult.graph_stats.total_edges} edges dari transaction logs...`, delay: 500 },
        { text: '[API-GNN-PREPROCESS] Menghitung PageRank & Graph Centrality metrics...', delay: 1000 },
        { text: '[API-GNN-LAYER] Message Passing — Agregasi fitur tetangga (k=3)...', delay: 1500 },
        { text: '[API-ATTENTION] Menghitung attention weights pada edges...', delay: 2000 },
        { text: '[API-ANOMALY] Memprediksi anomali dengan Graph Neural Network...', delay: 2500 }
      ];

      // Add detected anomalies from API
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

      // Display terminal output with dynamic timing
      steps.forEach(step => {
        setTimeout(() => {
          setTerminalOutput(prev => [...prev, { time: new Date().toLocaleTimeString(), text: step.text }]);
        }, step.delay);
      });

      // Mark as complete
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

  return (
    <div className="gnn-view">
      {/* Model Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Akurasi Model', value: `${gnnModelMetrics.accuracy}%`, icon: <Target size={20} />, color: 'var(--status-success)', bg: 'var(--status-success-bg)' },
          { label: 'Presisi', value: `${gnnModelMetrics.precision}%`, icon: <Crosshair size={20} />, color: 'var(--accent-primary)', bg: 'var(--accent-primary-subtle)' },
          { label: 'Recall', value: `${gnnModelMetrics.recall}%`, icon: <Activity size={20} />, color: 'var(--status-warning)', bg: 'var(--status-warning-bg)' },
          { label: 'Anomali Terdeteksi', value: gnnModelMetrics.anomaliesDetected, icon: <Zap size={20} />, color: 'var(--status-danger)', bg: 'var(--status-danger-bg)' }
        ].map((metric, i) => (
          <motion.div
            key={i}
            className="card"
            style={{ padding: 18 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: metric.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: metric.color }}>
                {metric.icon}
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{metric.label}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: metric.color }}>{metric.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* GNN Graph + Controls */}
      <div className="content-grid-wide">
        {/* Graph Panel */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><GitBranch size={18} /> Graph Neural Network — Peta Jaringan Transaksi</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {graphData.nodes.length} nodes • {graphData.edges.length} edges
                </span>
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="gnn-graph-container" style={{ position: 'relative' }}>
                <svg
                  ref={svgRef}
                  width="100%"
                  height="520"
                  viewBox="0 0 820 520"
                  style={{ background: 'var(--bg-input)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}
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
                    {/* Grid pattern */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border-color)" strokeWidth="0.5" />
                    </pattern>
                  </defs>

                  {/* Grid background */}
                  <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

                  {/* Column labels */}
                  <text x="80" y="30" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">SUMBER DANA</text>
                  <text x="300" y="30" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">REKENING MULE</text>
                  <text x="530" y="30" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">CRYPTO WALLET</text>
                  <text x="730" y="30" textAnchor="middle" fill="var(--text-muted)" fontSize="11" fontWeight="600">EXCHANGE</text>

                  {/* Column separators */}
                  <line x1="190" y1="40" x2="190" y2="500" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <line x1="415" y1="40" x2="415" y2="500" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <line x1="630" y1="40" x2="630" y2="500" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

                  {/* Edges */}
                  {graphData.edges.map((edge, i) => {
                    const sourceNode = graphData.nodes.find(n => n.id === edge.source);
                    const targetNode = graphData.nodes.find(n => n.id === edge.target);
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
                      />
                    );
                  })}

                  {/* Nodes */}
                  {graphData.nodes.map(node => {
                    const isHovered = hoveredNode === node.id;
                    const isHighlighted = highlightedNodes
                      ? highlightedNodes.has(node.id) ? true : false
                      : null;

                    return (
                      <NodeShape
                        key={node.id}
                        node={node}
                        isHovered={isHovered}
                        isHighlighted={isHighlighted}
                        onMouseEnter={() => handleNodeHover(node.id, node)}
                        onMouseLeave={handleNodeLeave}
                        onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                      />
                    );
                  })}
                </svg>

                {/* Tooltip */}
                {tooltipData && (
                  <div className="gnn-tooltip" style={{
                    position: 'absolute',
                    left: `calc(${(tooltipData.x / 820) * 100}% + 20px)`,
                    top: `calc(${(tooltipData.y / 520) * 100}% - 10px)`,
                    transform: tooltipData.x > 600 ? 'translateX(-120%)' : 'none'
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{tooltipData.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span>Tipe: {typeLabels[tooltipData.type]?.label}</span>
                      {tooltipData.bank && <span> • {tooltipData.bank}</span>}
                    </div>
                    <div style={{ fontSize: '0.72rem', marginTop: 4 }}>
                      Skor Risiko: <strong style={{
                        color: tooltipData.riskScore >= 80 ? '#ef4444' : tooltipData.riskScore >= 50 ? '#f59e0b' : '#10b981'
                      }}>{tooltipData.riskScore}%</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="gnn-legend">
                <div className="gnn-legend-title">
                  <Layers size={14} /> LEGENDA
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
          <div className="card" style={{ marginBottom: 20, border: '1px solid var(--border-accent)', background: 'var(--gradient-card)' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'var(--accent-primary)' }}><Brain size={18} /> GNN Model Config</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16, fontSize: '0.8rem' }}>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Embedding Dim</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.embeddingDimension}d</p>
                </div>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Message Passes</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.messagePasses} layers</p>
                </div>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Training Epochs</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{gnnModelMetrics.trainingEpochs}</p>
                </div>
                <div style={{ padding: 10, background: 'var(--bg-input)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>F1 Score</span>
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-success)' }}>{gnnModelMetrics.f1Score}%</p>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                <p>Nodes diproses: <strong style={{ color: 'var(--text-primary)' }}>{gnnModelMetrics.nodesAnalyzed.toLocaleString()}</strong></p>
                <p>Edges diproses: <strong style={{ color: 'var(--text-primary)' }}>{gnnModelMetrics.edgesProcessed.toLocaleString()}</strong></p>
                <p>Terakhir diperbarui: <strong style={{ color: 'var(--text-primary)' }}>{gnnModelMetrics.lastUpdated}</strong></p>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
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
          <div className="card" style={{ background: '#020617', borderColor: '#1e293b' }}>
            <div className="card-header" style={{ borderBottomColor: '#1e293b', background: '#0b0f19' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Terminal size={16} style={{ color: '#a78bfa' }} />
                <h3 className="card-title" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a78bfa' }}>GNN_INFERENCE_CONSOLE.log</h3>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: isInferring ? '#10b981' : '#64748b', display: 'inline-block' }} />
            </div>
            <div className="card-body" style={{ padding: 12, maxHeight: 280, overflowY: 'auto' }}>
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
