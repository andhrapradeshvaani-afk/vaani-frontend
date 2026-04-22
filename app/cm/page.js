'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'https://vaani-backend-w3zz.onrender.com';

export default function CMDashboard() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch]       = useState('');
  const [hideZero, setHideZero]   = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/dashboard/cm`);
      const d   = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const safeNum  = (v) => Number(v) || 0;
  const pct      = (n, t) => t > 0 ? Math.round((n / t) * 100) : 0;
  const fmtTime  = (d) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  const fmtClock = (d) => {
    if (!d) return '—';
    const mins = Math.floor((new Date() - d) / 60000);
    if (mins < 1) return 'Just updated';
    if (mins === 1) return 'Updated 1 min ago';
    return `Updated ${mins} mins ago`;
  };
  const trend = (current, previous) => {
    const c = safeNum(current), p = safeNum(previous);
    if (p === 0 && c === 0) return null;
    if (p === 0) return { diff: c, pctChange: 100, up: true, isNew: true };
    const diff = c - p;
    const pctChange = Math.round(Math.abs(diff / p) * 100);
    return { diff, pctChange, up: diff > 0 };
  };

  // ── LOADING ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f2d5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f0a500', fontSize: '36px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Tiro Telugu, serif' }}>వాణి</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Loading CM Dashboard…</div>
      </div>
    </div>
  );

  // ── ERROR ─────────────────────────────────────────────────────────────────────
  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0f2d5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠</div>
        <div style={{ color: '#fca5a5', fontSize: '15px', marginBottom: '8px', fontWeight: '600' }}>Failed to load dashboard</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '20px' }}>{error}</div>
        <button onClick={fetchData} style={{ background: '#f0a500', color: '#0f2d5e', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}>
          ↻ Retry
        </button>
      </div>
    </div>
  );

  const t              = data.totals;
  const total          = safeNum(t.total);
  const resolved       = safeNum(t.resolved);
  const overdue        = safeNum(t.overdue);
  const emergency      = safeNum(t.emergency);
  const resolutionRate = pct(resolved, total);
  const overdueRate    = pct(overdue, total);
  const pendingCount   = safeNum(t.pending);

  // filtered district list
  const filteredDistricts = (data.byDistrict || []).filter(d => {
    const matchSearch = d.district.toLowerCase().includes(search.toLowerCase());
    const matchZero   = hideZero ? safeNum(d.total) > 0 : true;
    return matchSearch && matchZero;
  });

  // ── SHARED STYLES ─────────────────────────────────────────────────────────────
  const S = {
    // resolution bar color
    barColor: (p) => parseFloat(p) >= 70 ? '#16a34a' : parseFloat(p) >= 30 ? '#d97706' : parseFloat(p) > 0 ? '#dc2626' : '#e5e7eb',
    pctColor: (p) => parseFloat(p) >= 70 ? '#16a34a' : parseFloat(p) >= 30 ? '#d97706' : parseFloat(p) > 0 ? '#dc2626' : '#aaa',
  };

  // ── TABLE HEAD / BODY shared ──────────────────────────────────────────────────
  const TableHead = ({ cols }) => (
    <thead>
      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
        {cols.map(h => (
          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>{h}</th>
        ))}
      </tr>
    </thead>
  );

  const ResBar = ({ val }) => {
    const p = parseFloat(val) || 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, height: '5px', background: '#f0f0f0', borderRadius: '3px', minWidth: '60px', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: '3px', width: `${Math.min(p, 100)}%`, background: S.barColor(p), transition: 'width 0.5s ease' }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: '700', minWidth: '38px', textAlign: 'right', color: p === 0 ? '#ccc' : S.pctColor(p) }}>
          {p === 0 ? '—' : `${p}%`}
        </span>
      </div>
    );
  };

  const Badge = ({ type, children }) => {
    const styles = {
      overdue:    { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' },
      emergency:  { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
      resolved:   { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
      pending:    { background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a' },
      in_progress:{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
      submitted:  { background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd' },
    };
    const s = styles[type] || styles.pending;
    return (
      <span style={{ ...s, display: 'inline-block', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
        {children}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: '#0f2d5e', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="36" height="36" rx="8" fill="#0f2d5e"/>
            <circle cx="13" cy="11" r="4" fill="#f0a500"/>
            <path d="M9 16 Q7 22 8 28 L18 28 Q19 22 17 16 Z" fill="#f0a500"/>
            <path d="M16 18 L24 13" stroke="#f0a500" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M24 11 L24 16 L28 17.5 L28 9.5 Z" fill="#f0a500"/>
            <path d="M28 9.5 L34 7 L34 20 L28 17.5 Z" fill="#f0a500" opacity="0.75"/>
            <path d="M35 11 Q37 14 35 17" fill="none" stroke="#f0a500" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>Vaani — CM Dashboard</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Andhra Pradesh Grievance Analytics</div>
          </div>
        </div>

        {/* Live badge + alerts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', padding: '4px 10px', borderRadius: '20px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: '600', fontFamily: 'monospace' }}>
              LIVE · {total} complaints
            </span>
          </div>
          {overdue > 0 && (
            <div style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
              ⚠ {overdue} SLA {overdue === 1 ? 'Breach' : 'Breaches'}
            </div>
          )}
          {emergency > 0 && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
              🚨 {emergency} Emergency
            </div>
          )}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>
           {fmtClock(lastUpdated)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={fetchData} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit', fontWeight: '500' }}>
            ↻ Refresh
          </button>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textDecoration: 'none' }}>← Portal</Link>
        </div>
      </div>

      {/* ── KPI CARDS ───────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {[
            {
              label: 'Total Complaints', value: total, sub: 'All time',
              accent: '#0f2d5e', icon: '📋',
              trend: trend(t.last_7_days, t.prev_7_days), trendLabel: 'vs last week', trendGoodUp: false,
            },
            {
              label: 'Resolved', value: resolved, sub: `${resolutionRate}% rate`,
              accent: '#16a34a', icon: '✅',
              trend: trend(t.resolved_this_week, t.resolved_last_week), trendLabel: 'this week', trendGoodUp: true,
            },
            {
              label: 'Pending', value: pendingCount, sub: 'Awaiting action',
              accent: '#d97706', icon: '⏳', trend: null,
            },
            {
              label: 'SLA Breached', value: overdue, sub: `${overdueRate}% of total`,
              accent: '#dc2626', icon: '⚠️', trend: null,
              alert: overdue > 0,
            },
            {
              label: 'Emergency', value: emergency, sub: 'High urgency',
              accent: '#ea580c', icon: '🚨', trend: null,
              alert: emergency > 0,
            },
            {
              label: 'Last 24 Hours', value: safeNum(t.last_24_hours), sub: 'New today',
              accent: '#2563eb', icon: '🕐', trend: null,
            },
            {
              label: 'Last 7 Days', value: safeNum(t.last_7_days), sub: `vs ${safeNum(t.prev_7_days)} prev week`,
              accent: '#7c3aed', icon: '📅',
              trend: trend(t.last_7_days, t.prev_7_days), trendLabel: 'vs prev week', trendGoodUp: false,
            },
            {
              label: 'Avg Resolution',
              value: resolved > 0 && parseFloat(t.avg_resolution_days) > 0 ? `${parseFloat(t.avg_resolution_days).toFixed(1)}d` : '—',
              sub: resolved === 0 ? 'No resolved cases yet' : resolved === 1 ? 'Only 1 case resolved' : 'Days to close',
              accent: '#0f6e56', icon: '⏱', trend: null,
            },
          ].map((k, i) => {
            const tr = k.trend;
            const trendUp = tr?.up;
            const trendGood = k.trendGoodUp ? trendUp : !trendUp;
            const trendColor = tr ? (trendGood ? '#16a34a' : '#dc2626') : null;

            return (
              <div key={i} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                borderTop: `3px solid ${k.accent}`,
                boxShadow: k.alert ? `0 0 0 1px ${k.accent}33, 0 2px 8px rgba(0,0,0,0.06)` : '0 1px 4px rgba(0,0,0,0.06)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{k.label}</span>
                  <span style={{ fontSize: '14px' }}>{k.icon}</span>
                </div>
                <div style={{ fontSize: '30px', fontWeight: '800', color: k.accent, marginBottom: '4px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
                {tr ? (
                  <div style={{ fontSize: '11px', color: trendColor, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span style={{ fontSize: '13px' }}>{trendUp ? '↑' : '↓'}</span>
                    <span>{tr.isNew ? 'new this period' : `${tr.pctChange}% ${k.trendLabel}`}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: '#aaa' }}>{k.sub}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── INSIGHT STRIP ──────────────────────────────────────────────────────── */}
        {(overdue > 0 || emergency > 0 || resolutionRate < 30) && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {emergency > 0 && (
              <div style={{ flex: 1, minWidth: '220px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🚨</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#991b1b' }}>{emergency} Emergency {emergency === 1 ? 'Complaint' : 'Complaints'} Flagged</div>
                  <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '2px' }}>High priority — officer escalation in progress</div>
                </div>
              </div>
            )}
            {overdue > 0 && (
              <div style={{ flex: 1, minWidth: '220px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e' }}>{overdue} SLA {overdue === 1 ? 'Breach' : 'Breaches'} — {overdueRate}% of total</div>
                  <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>Deadline missed — escalation needed</div>
                </div>
              </div>
            )}
            {resolutionRate < 30 && total > 0 && (
              <div style={{ flex: 1, minWidth: '220px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#166534' }}>Resolution Rate: {resolutionRate}%</div>
                  <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>{total - resolved} complaints still need resolution</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TABS ───────────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '2px', marginBottom: '16px', background: 'white', padding: '4px', borderRadius: '12px', border: '1px solid #e5e7eb', width: 'fit-content', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          {[['overview', 'Overview'], ['districts', 'Districts'], ['departments', 'Departments'], ['sla', 'SLA Performance'], ['activity', 'Recent Activity']].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)}
              style={{ padding: '8px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', transition: 'all 0.15s',
                background: activeTab === id ? '#0f2d5e' : 'transparent',
                color: activeTab === id ? '#f0a500' : '#9ca3af',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Resolution donut */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e', marginBottom: '20px' }}>Resolution Breakdown</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="12" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="12"
                      strokeDasharray={`${resolutionRate * 3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f2d5e' }}>{resolutionRate}%</div>
                    <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.04em' }}>RESOLVED</div>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { l: 'Resolved',    v: t.resolved,    c: '#16a34a' },
                    { l: 'In Progress', v: t.in_progress, c: '#2563eb' },
                    { l: 'Pending',     v: t.pending,     c: '#d97706' },
                    { l: 'Overdue',     v: t.overdue,     c: '#dc2626' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.c, flexShrink: 0 }} />
                        <span style={{ fontSize: '13px', color: '#555' }}>{s.l}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: s.c, fontVariantNumeric: 'tabular-nums' }}>{safeNum(s.v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top community issues */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e', marginBottom: '16px' }}>🔥 Top Community Issues</div>
              {!data.topIssues || data.topIssues.length === 0 ? (
                <div style={{ color: '#ccc', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>No upvoted issues yet</div>
              ) : data.topIssues.map((issue, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', padding: '10px 12px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#ea580c', fontSize: '13px', flexShrink: 0 }}>
                    {issue.upvote_count}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f2d5e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{issue.district} · {issue.department}</div>
                  </div>
                  <Badge type={issue.status}>{issue.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB: DISTRICTS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'districts' && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Table toolbar */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e' }}>District-wise Performance</div>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                  {filteredDistricts.length} of {(data.byDistrict || []).length} districts shown · sorted by volume
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '6px 12px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>🔍</span>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search district…"
                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: '12px', fontFamily: 'inherit', color: '#0f2d5e', width: '140px' }}
                  />
                </div>
                {/* Hide zero toggle */}
                <button onClick={() => setHideZero(p => !p)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: hideZero ? '#0f2d5e' : '#f8fafc', border: '1px solid ' + (hideZero ? '#0f2d5e' : '#e5e7eb'), borderRadius: '8px', padding: '6px 12px', fontSize: '11px', fontWeight: '600', color: hideZero ? 'white' : '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {hideZero ? '● Active Only' : '○ Show All'}
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHead cols={['District', 'Total', 'Resolved', 'Overdue / SLA', 'Emergency', 'Resolution %']} />
                <tbody>
                  {filteredDistricts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#ccc', fontSize: '13px' }}>
                        No districts match your filter
                      </td>
                    </tr>
                  ) : filteredDistricts.map((d, i) => {
                    const hasEmergency = safeNum(d.emergency) > 0;
                    const hasOverdue   = safeNum(d.overdue) > 0;
                    const isZero       = safeNum(d.total) === 0;
                    return (
                      <tr key={i} style={{
                        borderTop: '1px solid #f5f5f5',
                        background: hasEmergency ? '#fff8f8' : hasOverdue ? '#fffef5' : 'white',
                        opacity: isZero ? 0.5 : 1,
                        transition: 'background 0.1s',
                      }}>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: '700', fontSize: '13px', color: '#0f2d5e' }}>{d.district}</span>
                                {hasEmergency && (
                                  <span style={{ fontSize: '9px', fontWeight: '800', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                    🚨 EMERG
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '10px', color: '#ccc', fontFamily: 'monospace', marginTop: '1px' }}>{d.district_code}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '15px', fontWeight: '800', color: isZero ? '#ccc' : '#0f2d5e', fontVariantNumeric: 'tabular-nums' }}>
                          {d.total}
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '700', color: safeNum(d.resolved) > 0 ? '#16a34a' : '#ccc', fontVariantNumeric: 'tabular-nums' }}>
                          {safeNum(d.resolved) === 0 ? '—' : d.resolved}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {hasOverdue
                            ? <Badge type="overdue">⚠ {d.overdue} overdue</Badge>
                            : <span style={{ color: '#e5e7eb' }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          {hasEmergency
                            ? <Badge type="emergency">🚨 {d.emergency}</Badge>
                            : <span style={{ color: '#e5e7eb' }}>—</span>}
                        </td>
                        <td style={{ padding: '13px 16px', minWidth: '140px' }}>
                          <ResBar val={d.resolution_pct} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer summary */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                <span style={{ color: '#dc2626', fontWeight: '700' }}>{(data.byDistrict || []).filter(d => safeNum(d.emergency) > 0).length}</span> with emergency &nbsp;·&nbsp;
                <span style={{ color: '#d97706', fontWeight: '700' }}>{(data.byDistrict || []).filter(d => safeNum(d.overdue) > 0).length}</span> with SLA breach &nbsp;·&nbsp;
                <span style={{ color: '#aaa', fontWeight: '700' }}>{(data.byDistrict || []).filter(d => safeNum(d.total) === 0).length}</span> with no complaints
              </div>
              {hideZero && (data.byDistrict || []).filter(d => safeNum(d.total) === 0).length > 0 && (
                <button onClick={() => setHideZero(false)} style={{ fontSize: '11px', color: '#0f2d5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600', textDecoration: 'underline' }}>
                  Show all {(data.byDistrict || []).length} districts →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB: DEPARTMENTS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'departments' && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e' }}>Department Performance</div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{(data.byDept || []).length} departments</div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <TableHead cols={['Department', 'SLA Limit', 'Total', 'Resolved', 'Overdue', 'Resolution %']} />
                <tbody>
                  {(data.byDept || []).map((d, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #f5f5f5', background: safeNum(d.overdue) > 0 ? '#fffef5' : 'white' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f2d5e' }}>{d.department}</div>
                        <div style={{ fontSize: '10px', color: '#ccc', fontFamily: 'monospace', marginTop: '1px' }}>{d.code}</div>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', background: '#f0f9ff', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', border: '1px solid #bae6fd' }}>{d.sla_days}d</span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: '15px', fontWeight: '800', color: '#0f2d5e', fontVariantNumeric: 'tabular-nums' }}>{d.total}</td>
                      <td style={{ padding: '13px 16px', fontSize: '13px', fontWeight: '700', color: safeNum(d.resolved) > 0 ? '#16a34a' : '#ccc', fontVariantNumeric: 'tabular-nums' }}>
                        {safeNum(d.resolved) === 0 ? '—' : d.resolved}
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {safeNum(d.overdue) > 0
                          ? <Badge type="overdue">⚠ {d.overdue}</Badge>
                          : <span style={{ color: '#e5e7eb' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', minWidth: '140px' }}>
                        <ResBar val={d.resolution_pct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB: SLA PERFORMANCE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sla' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* SLA by dept */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e', marginBottom: '20px' }}>SLA Breach by Department</div>
              {!data.slaPerformance || data.slaPerformance.length === 0 ? (
                <div style={{ color: '#ccc', fontSize: '13px', textAlign: 'center', padding: '32px 0' }}>No SLA data yet</div>
              ) : data.slaPerformance.map((s, i) => {
                const bp = parseFloat(s.breach_pct) || 0;
                const barColor = bp > 50 ? '#dc2626' : bp > 20 ? '#d97706' : '#16a34a';
                return (
                  <div key={i} style={{ marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f2d5e' }}>{s.department}</span>
                        <span style={{ fontSize: '10px', color: '#aaa', marginLeft: '6px' }}>SLA: {s.sla_days}d</span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: barColor, fontVariantNumeric: 'tabular-nums' }}>{bp}%</span>
                    </div>
                    <div style={{ height: '7px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '4px', width: `${Math.min(bp, 100)}%`, background: barColor, transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '11px', color: '#bbb', marginTop: '4px' }}>
                      {s.breached} of {s.total} breached
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SLA summary */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e', marginBottom: '20px' }}>SLA Health Summary</div>
              {[
                { label: 'On Track',          val: total - overdue,  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' },
                { label: 'SLA Breached',       val: overdue,          color: '#dc2626', bg: '#fff5f5', border: '#fecaca', icon: '⚠️' },
                { label: 'Emergency Priority', val: emergency,         color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', icon: '🚨' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '26px', lineHeight: 1 }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '11px', color: s.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{s.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: '800', color: s.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.val}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: s.color, opacity: 0.7, textAlign: 'right' }}>
                    {pct(s.val, total)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB: RECENT ACTIVITY
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'activity' && (
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f2d5e' }}>Recent Complaints</div>
              <div style={{ fontSize: '11px', color: '#aaa' }}>Latest {(data.recentActivity || []).length}</div>
            </div>
            {(!data.recentActivity || data.recentActivity.length === 0) ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#ccc', fontSize: '13px' }}>No recent activity</div>
            ) : (data.recentActivity || []).map((c, i) => (
              <div key={i} style={{ padding: '14px 20px', borderTop: i > 0 ? '1px solid #f5f5f5' : 'none', display: 'flex', alignItems: 'center', gap: '12px', background: c.is_overdue ? '#fffef5' : c.priority === 'emergency' ? '#fff8f8' : 'white' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#0f2d5e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px' }}>{c.title}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>
                    {c.complaint_no} &nbsp;·&nbsp; {c.district} &nbsp;·&nbsp; {c.department}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {c.is_overdue && <Badge type="overdue">Overdue</Badge>}
                  {c.priority === 'emergency' && <Badge type="emergency">🚨 Emergency</Badge>}
                  <Badge type={c.status}>{c.status.replace('_', ' ')}</Badge>
                  <span style={{ fontSize: '11px', color: '#ccc', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{fmtTime(c.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', padding: '24px 0 8px', fontSize: '11px', color: '#ccc', letterSpacing: '0.04em' }}>
          <div>Vaani · వాణి · Andhra Pradesh Citizen Grievance Portal · CM Analytics</div>
            <div style={{ marginTop: '4px' }}>
              Built by{' '}
              <a href="https://linkedin.com/in/sahu-rajesh160608" target="_blank" rel="noopener noreferrer"
                style={{ color: '#f0a500', textDecoration: 'none', fontWeight: '600' }}>
                Rajesh Sahu · IIT Kanpur
              </a>
            </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74,222,128,0.4); }
          50%       { opacity: 0.8; box-shadow: 0 0 0 5px rgba(74,222,128,0); }
        }
        tr:hover td { background: inherit; }
      `}</style>
    </div>
  );
}
