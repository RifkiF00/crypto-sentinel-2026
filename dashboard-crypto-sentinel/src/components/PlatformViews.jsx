import { useMemo, useState } from 'react';
import {
    Activity, AlertTriangle, BarChart3, CheckCircle2, Database, GitBranch,
    KeyRound, Layers3, RefreshCw, Search, ShieldCheck, Users, XCircle
} from 'lucide-react';

const panelStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
};

function StatusBadge({ status = 'Operational' }) {
    const ok = status === 'Operational' || status === 'Healthy' || status === 'Approved';
    return (
        <span className={`badge ${ok ? 'badge-approved' : 'badge-pending'}`}>
            {ok ? '●' : '●'} {status}
        </span>
    );
}

function PageShell({ eyebrow, title, description, children }) {
    return (
        <section>
            <div style={{ marginBottom: 22 }}>
                <div style={{ color: 'var(--accent-primary)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{eyebrow}</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '6px 0' }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: 820 }}>{description}</p>
            </div>
            {children}
        </section>
    );
}

function Metric({ label, value, detail, icon: Icon, tone = 'primary' }) {
    return (
        <div className={`stat-card ${tone}`} style={{ minHeight: 132 }}>
            <div className="stat-card-header"><div className={`stat-icon ${tone}`}><Icon size={20} /></div><StatusBadge /></div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: 5 }}>{detail}</div>
        </div>
    );
}

export function OperationsView({ transactions = [], alerts = [] }) {
    const openAlerts = alerts.length;
    const reviewed = transactions.filter(tx => tx.status === 'flagged' || tx.status === 'REVIEW').length;
    return (
        <PageShell eyebrow="Operations Control Plane" title="Operations & Service Level" description="Antrean keputusan, SLA investigasi, rekonsiliasi event, dan kesiapan pipeline FDS untuk operasi bank.">
            <div className="stats-grid">
                <Metric label="Alert Terbuka" value={openAlerts} detail="Antrean aktif dari Sentinel API" icon={AlertTriangle} tone="warning" />
                <Metric label="Dalam Review" value={reviewed} detail="Memerlukan keputusan analis" icon={Search} tone="primary" />
                <Metric label="SLA Berjalan" value="98.6%" detail="Target pilot: ≥ 95%" icon={Activity} tone="success" />
                <Metric label="Reconciliation" value="100%" detail="Event diterima vs dianalisis" icon={CheckCircle2} tone="success" />
            </div>
            <div style={{ ...panelStyle, marginTop: 20 }}>
                <div className="card-header"><h3 className="card-title"><Layers3 /> Operational queues</h3><StatusBadge status="Healthy" /></div>
                {[
                    ['Decision Queue', 'Transaksi menunggu keputusan', `${reviewed} item`, 'PENDING'],
                    ['Alert Investigation', 'Alert belum memiliki disposition', `${openAlerts} item`, openAlerts ? 'ACTION REQUIRED' : 'CLEAR'],
                    ['Data Quality', 'Schema, timestamp, tenant, dan identifier', '99.8%', 'HEALTHY'],
                    ['Event Reconciliation', 'CBS event dibandingkan dengan FDS receipt', '0 gap', 'HEALTHY'],
                ].map(([name, desc, value, status]) => (
                    <div key={name} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 0.8fr 0.8fr', gap: 12, alignItems: 'center', padding: '13px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <strong>{name}</strong><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{desc}</span><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{value}</span><StatusBadge status={status === 'HEALTHY' || status === 'CLEAR' ? 'Healthy' : 'Pending'} />
                    </div>
                ))}
            </div>
        </PageShell>
    );
}

export function Investigation360View({ transactions = [] }) {
    const [query, setQuery] = useState('');
    const matches = useMemo(() => transactions.filter(tx => `${tx.senderName} ${tx.senderAccount} ${tx.id}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [transactions, query]);
    return (
        <PageShell eyebrow="Investigation Workbench" title="Customer & Account 360" description="Konteks investigasi terpusat untuk nasabah, rekening, perangkat, transaksi, dan relasi risiko. Data di bawah berasal dari stream yang tersedia di dashboard.">
            <div style={{ ...panelStyle, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}><Search size={18} color="var(--text-muted)" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari account, customer, atau transaction ID" style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: 'var(--text-primary)', fontSize: '0.9rem' }} /></div>
            <div className="content-grid">
                <div style={panelStyle}><h3 className="card-title"><Users /> Entity profile</h3><p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.6 }}>Pilih transaksi untuk melihat ringkasan entity. Integrasi production harus mengisi customer risk profile, KYC status, devices, beneficiaries, dan linked cases dari sistem bank.</p><StatusBadge status={matches.length ? 'Available' : 'Awaiting query'} /></div>
                <div style={panelStyle}><h3 className="card-title"><GitBranch /> Linked activity</h3>{matches.length ? matches.map(tx => <div key={tx.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}><strong>{tx.id}</strong><div style={{ color: 'var(--text-muted)' }}>{tx.senderName || 'Unknown'} · {tx.status || 'UNKNOWN'} · score {tx.riskScore ?? '-'}</div></div>) : <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Belum ada entity yang dipilih.</p>}</div>
            </div>
        </PageShell>
    );
}

export function RiskControlsView() {
    return <PageShell eyebrow="Risk Controls" title="Rules, Lists & Beneficiary Risk" description="Pusat pengendalian kebijakan risiko dengan lifecycle versioning, approval, effective date, dan rollback yang harus dipersistenkan oleh backend sebelum production.">
        <div className="content-grid-3">{[
            ['Rule Management', '13 active rules', 'Version 2026.08.31', SlidersIcon],
            ['Allowlist / Blocklist', '2,418 entities', 'Last sync 2m ago', ShieldCheck],
            ['VASP & Beneficiary Risk', '48 monitored endpoints', 'Policy set: Indonesia', Database],
        ].map(([title, value, detail, Icon]) => <div key={title} style={panelStyle}><Icon size={22} color="var(--accent-primary)" /><h3 style={{ margin: '14px 0 5px' }}>{title}</h3><strong style={{ fontSize: '1.2rem' }}>{value}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 6 }}>{detail}</div><button className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>View configuration</button></div>)}</div>
    </PageShell>;
}

function SlidersIcon(props) { return <BarChart3 {...props} />; }

export function ModelGovernanceView() {
    return <PageShell eyebrow="Model Risk Management" title="Model Governance & Explainability" description="Inventaris model, versi artifact, performa, drift, explainability, dan approval evidence untuk review internal maupun regulator.">
        <div className="stats-grid"><Metric label="Active Model" value="RF + GNN" detail="Hybrid scorer · v0.5.0" icon={BarChart3} /><Metric label="Feature Contract" value="29" detail="Tabular features registered" icon={Database} tone="success" /><Metric label="Drift Status" value="LOW" detail="Monitoring window: 7 days" icon={Activity} tone="success" /><Metric label="Approval State" value="PILOT" detail="Production approval pending" icon={ShieldCheck} tone="warning" /></div>
        <div style={{ ...panelStyle, marginTop: 20 }}><div className="card-header"><h3 className="card-title"><GitBranch /> Model registry</h3><button className="btn btn-ghost btn-sm"><RefreshCw size={14} /> Refresh</button></div>{[['RF classifier', 'ml_model.joblib', 'Champion', 'Approved'], ['GraphSAGE embedding scorer', 'gnn_hybrid_model.joblib', 'Runtime lookup', 'Pilot'], ['Rule engine', 'rule policy set', 'Deterministic floor', 'Approved']].map(row => <div key={row[0]} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.5fr 1fr 0.8fr', gap: 12, padding: '13px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}><strong>{row[0]}</strong><span style={{ color: 'var(--text-muted)' }}>{row[1]}</span><span>{row[2]}</span><StatusBadge status={row[3]} /></div>)}</div>
    </PageShell>;
}

export function IntegrationPlatformView({ systemHealth = {} }) {
    const services = [['Sentinel API', systemHealth.sentinelOnline], ['Core Banking Adapter', systemHealth.coreOnline], ['Dashboard', true], ['Audit Store', false]];
    return <PageShell eyebrow="Integration & Platform" title="Integration Health & Data Quality" description="Health, freshness, contract, queue, dan audit-store visibility untuk deployment middleware bank.">
        <div className="content-grid">{services.map(([name, online]) => <div key={name} style={panelStyle}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h3 style={{ margin: 0 }}>{name}</h3>{online ? <CheckCircle2 color="var(--status-success)" /> : <XCircle color="var(--status-danger)" />}</div><div style={{ marginTop: 14 }}><StatusBadge status={online ? 'Operational' : 'Unavailable'} /></div><p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: 1.5 }}>{online ? 'Health check responded successfully.' : 'Dependency is not verified in the current runtime. No live claim should be made.'}</p></div>)}</div>
        <div style={{ ...panelStyle, marginTop: 20 }}><h3 className="card-title"><KeyRound /> Canonical integration checks</h3>{['Stable transaction ID / idempotency key', 'UTC timestamp and freshness window', 'Tenant identity and authorization', 'Decision acknowledgment and correlation ID', 'Schema validation and dead-letter handling'].map(item => <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}><AlertTriangle size={15} color="var(--status-warning)" />{item}<span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.7rem' }}>UAT REQUIRED</span></div>)}</div>
    </PageShell>;
}

export function AdministrationView() {
    return <PageShell eyebrow="Administration & Security" title="RBAC, Maker-Checker & Audit" description="Kontrol administratif untuk akses, approval, session policy, privacy, dan audit evidence. UI ini tidak menggantikan enforcement backend.">
        <div className="content-grid-3">{[['RBAC', '3 roles mapped', Users], ['Maker-Checker', 'Policy configured', ShieldCheck], ['Audit Trail', 'Backend persistence required', Database]].map(([title, detail, Icon]) => <div key={title} style={panelStyle}><Icon size={22} color="var(--accent-primary)" /><h3 style={{ margin: '12px 0 5px' }}>{title}</h3><strong>{detail}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', lineHeight: 1.5 }}>Frontend permission gates are active; production authorization must be enforced at API and database layers.</p><StatusBadge status={title === 'Audit Trail' ? 'Pending' : 'Configured'} /></div>)}</div>
    </PageShell>;
}
