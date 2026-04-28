'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

const API = 'https://vaani-backend-w3zz.onrender.com';
const DEFAULT_DISTRICT = 'Srikakulam'; // most-data district by default

// ─── Tiny markdown renderer for the brief format ───────────────────────────
function renderBrief(md) {
  if (!md) return null;
  const lines = md.split('\n');
  const blocks = [];
  let listBuf = null;
  let listType = null;

  const flushList = () => {
    if (!listBuf) return;
    blocks.push({ type: listType, items: listBuf });
    listBuf = null;
    listType = null;
  };

  for (let raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushList(); continue; }

    if (line.startsWith('### ')) {
      flushList();
      blocks.push({ type: 'h3', text: line.slice(4) });
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (bulletMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul'; listBuf = listBuf || []; listBuf.push(bulletMatch[1]);
      continue;
    }

    const numMatch = line.match(/^\s*\d+\.\s+(.*)/);
    if (numMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol'; listBuf = listBuf || []; listBuf.push(numMatch[1]);
      continue;
    }

    flushList();
    blocks.push({ type: 'p', text: line });
  }
  flushList();

  const inline = (text) => {
    const parts = [];
    let key = 0;
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIdx = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > lastIdx) parts.push(text.slice(lastIdx, m.index));
      const tok = m[0];
      if (tok.startsWith('**')) {
        parts.push(<strong key={key++} style={{ fontWeight: 700 }}>{tok.slice(2, -2)}</strong>);
      } else if (tok.startsWith('*')) {
        parts.push(<em key={key++} style={{ color: '#6b7280' }}>{tok.slice(1, -1)}</em>);
      } else if (tok.startsWith('`')) {
        parts.push(<code key={key++} style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4, fontSize: '0.92em', fontFamily: 'monospace' }}>{tok.slice(1, -1)}</code>);
      }
      lastIdx = m.index + tok.length;
    }
    if (lastIdx < text.length) parts.push(text.slice(lastIdx));
    return parts;
  };

  return blocks.map((b, i) => {
    if (b.type === 'h3') return (
      <h3 key={i} style={{ fontSize: '17px', fontWeight: 700, color: '#0f2d5e', marginTop: i === 0 ? 0 : '24px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid #e5e7eb' }}>
        {inline(b.text)}
      </h3>
    );
    if (b.type === 'ul') return (
      <ul key={i} style={{ marginLeft: 0, paddingLeft: '20px', marginBottom: '14px', listStyle: 'disc' }}>
        {b.items.map((item, j) => (
          <li key={j} style={{ marginBottom: '8px', lineHeight: 1.55, color: '#1f2937', fontSize: '14px' }}>{inline(item)}</li>
        ))}
      </ul>
    );
    if (b.type === 'ol') return (
      <ol key={i} style={{ marginLeft: 0, paddingLeft: '22px', marginBottom: '14px' }}>
        {b.items.map((item, j) => (
          <li key={j} style={{ marginBottom: '8px', lineHeight: 1.55, color: '#1f2937', fontSize: '14px' }}>{inline(item)}</li>
        ))}
      </ol>
    );
    return (
      <p key={i} style={{ margin: '6px 0', lineHeight: 1.55, color: '#374151', fontSize: '14px' }}>{inline(b.text)}</p>
    );
  });
}

// ─── Passcode modal ────────────────────────────────────────────────────────
function PasscodeModal({ open, onClose, onSubmit, error, busy }) {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (open) setCode('');
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || busy) return;
    onSubmit(code.trim());
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 45, 94, 0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 16,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 12, padding: '28px 28px 24px',
          maxWidth: 420, width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 6 }}>🔐</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0f2d5e', marginBottom: 4 }}>
          Regenerate brief
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 18 }}>
          Generating a fresh brief calls the AI and uses about ₹0.10 of compute.
          Please enter the access code to proceed.
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access code"
            disabled={busy}
            style={{
              width: '100%', padding: '11px 14px',
              border: error ? '1.5px solid #dc2626' : '1.5px solid #d1d5db',
              borderRadius: 8, fontSize: 14,
              fontFamily: 'inherit', outline: 'none',
              marginBottom: error ? 8 : 16,
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 14, lineHeight: 1.4 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              style={{
                background: 'transparent', border: '1px solid #d1d5db',
                color: '#6b7280', padding: '9px 16px',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
              }}
            >Cancel</button>
            <button
              type="submit"
              disabled={busy || !code.trim()}
              style={{
                background: busy || !code.trim() ? '#9ca3af' : '#f0a500',
                color: '#0f2d5e', border: 'none',
                padding: '9px 18px', borderRadius: 8,
                fontSize: 13, fontWeight: 700,
                cursor: busy || !code.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.02em',
              }}
            >
              {busy ? 'Generating…' : 'Regenerate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function AIBriefPage() {
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load district list on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/ai/districts`);
        const d = await res.json();
        if (!res.ok) throw new Error(d.error || 'Failed to load districts');
        setDistricts(d);
        // Pick a sensible default — district with the most complaints AND a brief
        const withBrief = d.find(x => x.last_brief_date && parseInt(x.complaint_count) > 0);
        const fallback = d.find(x => x.name === DEFAULT_DISTRICT) || d[0];
        const initial = withBrief || fallback;
        if (initial) setSelectedDistrict({ id: initial.id, name: initial.name, code: initial.code });
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    })();
  }, []);

  // Load brief when district changes
  const loadBrief = useCallback(async (district) => {
    setLoading(true);
    setError(null);
    setBrief(null);
    try {
      const res = await fetch(`${API}/api/ai/brief/${encodeURIComponent(district.code || district.name)}`);
      const d = await res.json();
      if (res.ok) {
        setBrief(d);
      } else if (res.status === 404 && d.needs_first_generation) {
        setBrief({ first_generation_needed: true, district: d.district });
      } else {
        throw new Error(d.error || 'Failed to load brief');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDistrict) loadBrief(selectedDistrict);
  }, [selectedDistrict, loadBrief]);

  const handleRegenerate = async (passcode) => {
    if (!selectedDistrict) return;
    setRefreshing(true);
    setModalError(null);
    try {
      const res = await fetch(
        `${API}/api/ai/brief/${encodeURIComponent(selectedDistrict.code || selectedDistrict.name)}?refresh=1`,
        { headers: { 'X-Brief-Passcode': passcode } }
      );
      const d = await res.json();
      if (res.status === 401) {
        setModalError(d.error || 'Incorrect code, approach the founder - Rajesh.');
        setRefreshing(false);
        return;
      }
      if (!res.ok) throw new Error(d.error || 'Failed to regenerate');
      setBrief(d);
      setModalOpen(false);
    } catch (e) {
      setModalError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  const fmtRelative = (iso) => {
    if (!iso) return '—';
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  // ─── render states ─────────────────────────────────────────────────────────
  if (loading && !districts.length) return (
    <div style={{ minHeight: '100vh', background: '#0f2d5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#f0a500', fontSize: '36px', fontWeight: '700', marginBottom: '8px', fontFamily: 'Tiro Telugu, serif' }}>వాణి</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Loading AI Brief…</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: '#0f2d5e', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#0f2d5e', fontWeight: 800 }}>✦</div>
          <div>
            <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>AI Daily Brief</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>For District Collectors · Vaani</div>
          </div>
        </div>
        <Link href="/cm" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', textDecoration: 'none' }}>← Dashboard</Link>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>

        {/* CONTROLS */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>District</label>
            <select
              value={selectedDistrict?.id || ''}
              onChange={(e) => {
                const id = parseInt(e.target.value, 10);
                const d = districts.find(x => x.id === id);
                if (d) setSelectedDistrict({ id: d.id, name: d.name, code: d.code });
              }}
              style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13, fontFamily: 'inherit', background: 'white', cursor: 'pointer', minWidth: 220 }}
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.complaint_count > 0 ? `· ${d.complaint_count}` : '· no data'}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 80 }} />

          <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'right' }}>
            {brief?.brief_md ? (
              <>
                {brief.cached ? '📁 Cached' : '✨ Just generated'}<br />
                {fmtRelative(brief.generated_at)}
              </>
            ) : null}
          </div>

          <button
            onClick={() => { setModalError(null); setModalOpen(true); }}
            disabled={loading}
            style={{
              background: '#f0a500', color: '#0f2d5e', border: 'none',
              padding: '8px 16px', borderRadius: 6,
              fontWeight: 700, cursor: 'pointer',
              fontSize: 12, fontFamily: 'inherit', letterSpacing: '0.02em',
              opacity: loading ? 0.6 : 1,
            }}
          >
            ↻ Regenerate brief
          </button>
        </div>

        {/* ERROR (page-level) */}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            ⚠ {error}
          </div>
        )}

        {/* BRIEF CONTENT */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '28px 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', minHeight: 200, opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {brief?.first_generation_needed ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>No brief yet for {brief.district}</div>
              <div style={{ fontSize: 12 }}>Click "Regenerate brief" above to create the first one.</div>
            </div>
          ) : brief?.brief_md ? renderBrief(brief.brief_md) : !loading && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#9ca3af' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>📋</div>
              <div style={{ fontWeight: 600, color: '#6b7280' }}>Select a district to view its brief</div>
            </div>
          )}
        </div>

        {/* FOOTER NOTE */}
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(15,45,94,0.04)', borderRadius: 8, fontSize: 11, color: '#6b7280', lineHeight: 1.6 }}>
          <strong style={{ color: '#0f2d5e' }}>How this works:</strong> Priorities are ranked by a deterministic score (severity, SLA pressure, citizen impact, trend velocity). Recommended actions come from a rules engine. The AI only converts the structured analysis into prose. Reading is free; regenerating uses ~₹0.10 of compute and is access-controlled.
        </div>
      </div>

      <PasscodeModal
        open={modalOpen}
        onClose={() => { if (!refreshing) { setModalOpen(false); setModalError(null); } }}
        onSubmit={handleRegenerate}
        error={modalError}
        busy={refreshing}
      />
    </div>
  );
}
