'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API = 'https://vaani-backend-w3zz.onrender.com';

const STATUS_FLOW = [
  { value: 'acknowledged', label: 'Acknowledge',       desc: 'Confirm complaint received', color: '#7c3aed', light: '#a78bfa' },
  { value: 'assigned',     label: 'Assign',            desc: 'Send to field officer',      color: '#2563eb', light: '#60a5fa' },
  { value: 'in_progress',  label: 'Mark in progress',  desc: 'Work has started',           color: '#d97706', light: '#fbbf24' },
  { value: 'resolved',     label: 'Mark resolved',     desc: 'Issue has been fixed',       color: '#16a34a', light: '#4ade80' },
  { value: 'rejected',     label: 'Reject',            desc: 'Invalid or duplicate',       color: '#dc2626', light: '#f87171' },
];

const statusDotColor = {
  submitted:'#0369a1', acknowledged:'#7c3aed', assigned:'#2563eb',
  in_progress:'#d97706', resolved:'#16a34a', closed:'#16a34a', rejected:'#dc2626'
};

const priorityColor = { normal:'#2563eb', high:'#d97706', emergency:'#dc2626' };

export default function ComplaintDetail() {
  const router  = useRouter();
  const params  = useParams();
  const id      = params.id;

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote]         = useState('');
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState(null);
  const [token, setToken]       = useState('');
  const [showPhoto, setShowPhoto] = useState(null);

  useEffect(() => {
    const t = localStorage.getItem('officer_token');
    if (!t) { router.push('/officer/login'); return; }
    setToken(t);
    fetchComplaint(t);
  }, []);

  const fetchComplaint = async (t) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/officer/complaints/${id}`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.status === 401) { router.push('/officer/login'); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setData(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const updateStatus = async (status) => {
    if (!confirm(`Mark as "${status.replace('_',' ')}"?`)) return;
    setUpdating(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`${API}/api/officer/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, note })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed');
      setSuccess(`Status updated to "${status.replace('_',' ')}" successfully`);
      setNote('');
      fetchComplaint(token);
    } catch (err) {
      setError(err.message);
    }
    setUpdating(false);
  };

  const fmt     = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)'}}>
      Loading complaint...
    </div>
  );

  if (error && !data) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card" style={{textAlign:'center',padding:'40px'}}>
        <div style={{color:'#dc2626',marginBottom:'12px'}}>{error}</div>
        <Link href="/officer/dashboard"><button className="btn-secondary">Back to dashboard</button></Link>
      </div>
    </div>
  );

  const c = data?.complaint;
  const timeline = data?.timeline || [];
  const attachments = data?.attachments || [];
  const isResolved = ['resolved','closed','rejected'].includes(c?.status);

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>

      {/* Photo lightbox */}
      {showPhoto && (
        <div onClick={()=>setShowPhoto(null)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:1000,
            display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <img src={showPhoto} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:'8px'}} />
          <div style={{position:'absolute',top:'20px',right:'24px',color:'white',fontSize:'28px',fontWeight:'300'}}>✕</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{background:'#0f2d5e',padding:'0 24px',display:'flex',alignItems:'center',height:'56px',gap:'16px'}}>
        <Link href="/officer/dashboard"
          style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',textDecoration:'none',display:'flex',alignItems:'center',gap:'4px'}}>
          ← Back
        </Link>
        <div style={{color:'white',fontWeight:'600',fontSize:'14px'}}>Complaint Detail</div>
        <div style={{marginLeft:'auto',color:'#f0a500',fontSize:'12px',fontWeight:'700',letterSpacing:'0.04em'}}>
          {c?.complaint_no}
        </div>
      </nav>

      {/* Alerts */}
      {(success || error) && (
        <div style={{maxWidth:'1100px',margin:'16px auto 0',padding:'0 24px'}}>
          {success && <div className="alert alert-success">{success}</div>}
          {error   && <div className="alert alert-error">{error}</div>}
        </div>
      )}

      {/* Two column layout */}
      <div style={{maxWidth:'1100px',margin:'24px auto',padding:'0 24px',
        display:'grid',gridTemplateColumns:'1fr 380px',gap:'16px',alignItems:'start'}}>

        {/* ── LEFT — Complaint Information ── */}
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

          {/* Header card */}
          <div className="card" style={{borderLeft:`4px solid ${priorityColor[c?.priority] || '#888'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'12px'}}>
              <div>
                <div style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'6px'}}>
                  Complaint
                </div>
                <div style={{fontSize:'19px',fontWeight:'700',color:'var(--text-1)',marginBottom:'4px'}}>{c?.title}</div>
                <div style={{fontSize:'13px',color:'var(--text-2)'}}>
                  {c?.department} · {c?.district}{c?.mandal ? ` · ${c?.mandal}` : ''}{c?.village ? ` · ${c?.village}` : ''}
                </div>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px',alignItems:'flex-end',flexShrink:0}}>
                <span className={`badge badge-${c?.status}`} style={{textTransform:'capitalize'}}>{c?.status?.replace('_',' ')}</span>
                <span style={{fontSize:'11px',fontWeight:'600',padding:'2px 8px',borderRadius:'10px',
                  background:`${priorityColor[c?.priority]}15`,color:priorityColor[c?.priority],textTransform:'capitalize'}}>
                  {c?.priority}
                </span>
                {c?.upvote_count > 0 && (
                  <span style={{fontSize:'11px',color:'#ea580c',fontWeight:'600'}}>
                    👆 {c.upvote_count} {c.upvote_count === 1 ? 'citizen' : 'citizens'} supported
                  </span>
                )}
              </div>
            </div>

            {c?.is_overdue && (
              <div style={{background:'#fee2e2',color:'#991b1b',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'500'}}>
                ⚠ SLA deadline has passed — immediate action required.
              </div>
            )}
          </div>

          {/* Citizen details */}
          <div className="card">
            <div style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'12px'}}>
              Citizen Details
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'10px'}}>
              {[
                { l:'Name',         v: c?.is_anonymous ? 'Anonymous' : (c?.citizen_name || '—') },
                { l:'Phone',        v: c?.is_anonymous ? '—' : (c?.citizen_phone || '—') },
                { l:'Filed on',     v: fmt(c?.created_at) },
                { l:'SLA deadline', v: fmt(c?.sla_deadline), red: c?.is_overdue },
                { l:'District',     v: c?.district || '—' },
                { l:'Mandal',       v: c?.mandal || '—' },
                { l:'Village',      v: c?.village || '—' },
                { l:'Upvotes',      v: `${c?.upvote_count || 0} ${(c?.upvote_count || 0) === 1 ? 'citizen' : 'citizens'}` },
              ].map((r,i) => (
                <div key={i} style={{background:'var(--bg)',borderRadius:'8px',padding:'10px 12px'}}>
                  <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em'}}>{r.l}</div>
                  <div style={{fontSize:'13px',fontWeight:'500',marginTop:'3px',color:r.red?'#dc2626':'var(--text-1)'}}>{r.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {c?.description && (
            <div className="card">
              <div style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'10px'}}>
                Description
              </div>
              <div style={{fontSize:'14px',color:'var(--text-1)',lineHeight:'1.7',whiteSpace:'pre-wrap'}}>{c.description}</div>
            </div>
          )}

          {/* Location */}
          {(c?.latitude || c?.address) && (
            <div className="card">
              <div style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'10px'}}>
                📍 Location
              </div>
              {c?.address && <div style={{fontSize:'14px',color:'var(--text-1)',marginBottom:'8px'}}>{c.address}</div>}
              {c?.latitude && c?.longitude && (
                <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap'}}>
                  <div style={{fontSize:'12px',color:'var(--text-3)',fontFamily:'monospace'}}>
                    {parseFloat(c.latitude).toFixed(6)}, {parseFloat(c.longitude).toFixed(6)}
                  </div>
                  <a href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{fontSize:'13px',color:'#1e40af',fontWeight:'600',textDecoration:'none',
                      background:'#eff6ff',padding:'6px 14px',borderRadius:'8px',display:'inline-block'}}>
                    Open in Google Maps
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Photos */}
          <div className="card">
            <div style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'12px'}}>
              📷 Evidence Photos {attachments.length > 0 ? `(${attachments.length})` : ''}
            </div>
            {attachments.length === 0 ? (
              <div style={{background:'var(--bg)',borderRadius:'8px',padding:'20px',textAlign:'center',color:'var(--text-3)',fontSize:'13px'}}>
                Citizen did not attach evidence photos
              </div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:'10px'}}>
                  {attachments.map((a,i) => (
                    <div key={i} onClick={()=>setShowPhoto(a.file_url)}
                      style={{cursor:'pointer',borderRadius:'10px',overflow:'hidden',
                        border:'0.5px solid var(--border)',aspectRatio:'4/3',background:'var(--bg)'}}>
                      {a.file_type === 'image'
                        ? <img src={a.file_url} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px'}}>📄</div>
                      }
                    </div>
                  ))}
                </div>
                <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'8px'}}>Click to enlarge</div>
              </>
            )}
          </div>

          {/* Timeline */}
          <div className="card">
            <div style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'14px'}}>
              Activity Timeline
            </div>
            {timeline.length === 0
              ? <div style={{color:'var(--text-3)',fontSize:'13px'}}>No activity yet</div>
              : timeline.map((t,i) => (
                <div key={i} style={{display:'flex',gap:'12px',marginBottom:'14px'}}>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                    <div style={{width:'10px',height:'10px',borderRadius:'50%',flexShrink:0,
                      background: statusDotColor[t.status] || '#888'}}/>
                    {i < timeline.length-1 && <div style={{width:'1px',flex:1,background:'var(--border)',marginTop:'4px'}}/>}
                  </div>
                  <div style={{paddingBottom: i < timeline.length-1 ? '4px' : '0'}}>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-1)',textTransform:'capitalize'}}>
                      {t.status.replace('_',' ')}
                      {t.updated_by && <span style={{color:'var(--text-3)',fontSize:'12px',fontWeight:'400'}}> · by {t.updated_by}</span>}
                    </div>
                    {t.note && <div style={{fontSize:'12px',color:'var(--text-2)',marginTop:'2px',fontStyle:'italic'}}>"{t.note}"</div>}
                    <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'2px'}}>{fmtTime(t.created_at)}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── RIGHT — Officer Action Zone ── */}
        <div style={{position:'sticky',top:'24px'}}>
          {!isResolved ? (
            <div style={{background:'#0f2d5e',borderRadius:'16px',padding:'20px'}}>
              <div style={{fontSize:'11px',fontWeight:'600',color:'rgba(255,255,255,0.5)',
                textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'4px'}}>
                Officer Action Required
              </div>
              <div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',marginBottom:'16px'}}>
                Current status: <span style={{color:'#f0a500',fontWeight:'600',textTransform:'capitalize'}}>{c?.status?.replace('_',' ')}</span>
              </div>

              <textarea
                value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Add a note — what action was taken, field officer name, estimated completion..."
                style={{width:'100%',background:'rgba(255,255,255,0.08)',border:'0.5px solid rgba(255,255,255,0.15)',
                  borderRadius:'8px',padding:'10px 12px',color:'white',fontSize:'13px',
                  resize:'vertical',minHeight:'90px',boxSizing:'border-box',fontFamily:'inherit',marginBottom:'14px'}}
              />

              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {STATUS_FLOW.map(action => (
                  <button key={action.value}
                    onClick={() => updateStatus(action.value)}
                    disabled={updating || c?.status === action.value}
                    style={{
                      padding:'11px 14px',borderRadius:'10px',
                      background:`${action.color}18`,
                      border:`1px solid ${action.color}`,
                      color: action.light,
                      fontWeight:'600',fontSize:'13px',
                      cursor: (updating || c?.status === action.value) ? 'not-allowed' : 'pointer',
                      fontFamily:'inherit',textAlign:'left',
                      opacity: c?.status === action.value ? 0.4 : updating ? 0.6 : 1,
                      width:'100%',
                    }}>
                    <div>{action.label}</div>
                    <div style={{fontSize:'11px',fontWeight:'400',marginTop:'2px',opacity:0.75}}>{action.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{background: c?.status === 'rejected' ? '#fee2e2' : '#f0fdf4',
              border:`1px solid ${c?.status === 'rejected' ? '#fca5a5' : '#bbf7d0'}`,
              borderRadius:'16px',padding:'20px'}}>
              <div style={{color: c?.status === 'rejected' ? '#991b1b' : '#166534',fontWeight:'600',fontSize:'15px',marginBottom:'4px'}}>
                {c?.status === 'rejected' ? '✗ Complaint rejected' : '✓ Complaint resolved'}
              </div>
              <div style={{color: c?.status === 'rejected' ? '#991b1b' : '#166534',fontSize:'13px',opacity:0.8}}>
                No further action required.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
