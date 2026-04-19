'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API = 'https://vaani-backend-w3zz.onrender.com';

const STATUS_FLOW = [
  { value: 'acknowledged', label: 'Acknowledge',      color: '#7c3aed', desc: 'Confirm complaint received' },
  { value: 'assigned',     label: 'Assign',           color: '#2563eb', desc: 'Assign to field officer' },
  { value: 'in_progress',  label: 'Mark in progress', color: '#d97706', desc: 'Work has started' },
  { value: 'resolved',     label: 'Mark resolved',    color: '#16a34a', desc: 'Issue has been fixed' },
  { value: 'rejected',     label: 'Reject',           color: '#dc2626', desc: 'Invalid or duplicate complaint' },
];

const priorityColor = { normal:'#2563eb', high:'#d97706', emergency:'#dc2626' };
const statusDotColor = { submitted:'#0369a1', acknowledged:'#7c3aed', assigned:'#2563eb', in_progress:'#d97706', resolved:'#16a34a', closed:'#16a34a', rejected:'#dc2626' };

export default function ComplaintDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

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
        <Link href="/officer/dashboard"><button className="btn-secondary">← Back</button></Link>
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
        <div onClick={()=>setShowPhoto(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <img src={showPhoto} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:'8px'}} />
          <div style={{position:'absolute',top:'20px',right:'20px',color:'white',fontSize:'24px'}}>✕</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{background:'var(--ap-navy)',padding:'0 24px',display:'flex',alignItems:'center',height:'60px',gap:'12px'}}>
        <Link href="/officer/dashboard" style={{color:'rgba(255,255,255,0.7)',fontSize:'13px',textDecoration:'none'}}>
          ← Back
        </Link>
        <div style={{color:'white',fontWeight:'600',fontSize:'14px'}}>Complaint Detail</div>
        <div style={{marginLeft:'auto',color:'var(--ap-gold)',fontSize:'12px',fontWeight:'700',letterSpacing:'0.04em'}}>
          {c?.complaint_no}
        </div>
      </nav>

      <div className="page" style={{maxWidth:'800px'}}>

        {success && <div className="alert alert-success" style={{marginBottom:'16px'}}>{success}</div>}
        {error   && <div className="alert alert-error"   style={{marginBottom:'16px'}}>{error}</div>}

        {/* ── COMPLAINT HEADER ── */}
        <div className="card" style={{marginBottom:'16px',borderLeft:`4px solid ${priorityColor[c?.priority] || '#888'}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'16px'}}>
            <div>
              <div style={{fontSize:'20px',fontWeight:'700',marginBottom:'6px'}}>{c?.title}</div>
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

          {/* Info grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'8px',marginBottom:'16px'}}>
            {[
              { l:'Filed on',     v: fmt(c?.created_at) },
              { l:'SLA deadline', v: fmt(c?.sla_deadline), red: c?.is_overdue },
              { l:'Citizen',      v: c?.is_anonymous ? 'Anonymous' : (c?.citizen_name || '—') },
              { l:'Phone',        v: c?.is_anonymous ? '—' : (c?.citizen_phone || '—') },
              { l:'District',     v: c?.district },
              { l:'Mandal',       v: c?.mandal || '—' },
              { l:'Village',      v: c?.village || '—' },
              { l:'Upvotes',      v: `${c?.upvote_count || 0} citizens` },
            ].map((r,i) => (
              <div key={i} style={{background:'var(--bg)',borderRadius:'8px',padding:'10px 12px'}}>
                <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em'}}>{r.l}</div>
                <div style={{fontSize:'13px',fontWeight:'500',marginTop:'2px',color:r.red?'#dc2626':'var(--text-1)'}}>{r.v}</div>
              </div>
            ))}
          </div>

          {c?.is_overdue && (
            <div style={{background:'#fee2e2',color:'#991b1b',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'500'}}>
              ⚠ SLA deadline has passed — immediate action required.
            </div>
          )}
        </div>

        {/* ── DESCRIPTION ── */}
        {c?.description && (
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'12px'}}>📝 Description</div>
            <div style={{fontSize:'14px',color:'var(--text-1)',lineHeight:'1.7',whiteSpace:'pre-wrap'}}>
              {c.description}
            </div>
          </div>
        )}

        {/* ── LOCATION / GPS ── */}
        {(c?.latitude || c?.address) && (
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'12px'}}>📍 Location</div>
            {c?.address && (
              <div style={{fontSize:'14px',color:'var(--text-1)',marginBottom:'8px'}}>{c.address}</div>
            )}
            {c?.latitude && c?.longitude && (
              <div style={{display:'flex',gap:'12px',alignItems:'center',flexWrap:'wrap'}}>
                <div style={{fontSize:'13px',color:'var(--text-3)',fontFamily:'monospace'}}>
                  {parseFloat(c.latitude).toFixed(6)}, {parseFloat(c.longitude).toFixed(6)}
                </div>
                <a href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`} target="_blank" rel="noopener noreferrer" style={{fontSize:'13px',color:'var(--ap-navy)',fontWeight:'600',textDecoration:'none',background:'var(--bg)',padding:'6px 12px',borderRadius:'8px',border:'1px solid var(--border)'}}>Open in Google Maps</a>
              </div>
            )}
          </div>
        )}

        {/* ── PHOTO EVIDENCE ── */}
        {attachments.length > 0 && (
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'12px'}}>
              📷 Evidence Photos ({attachments.length})
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'12px'}}>
              {attachments.map((a,i) => (
                <div key={i} onClick={()=>setShowPhoto(a.file_url)}
                  style={{cursor:'pointer',borderRadius:'10px',overflow:'hidden',border:'1px solid var(--border)',aspectRatio:'4/3'}}>
                  {a.file_type === 'image' ? (
                    <img src={a.file_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={`Evidence ${i+1}`} />
                  ) : (
                    <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',fontSize:'32px'}}>
                      📄
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{fontSize:'12px',color:'var(--text-3)',marginTop:'8px'}}>Click photo to enlarge</div>
          </div>
        )}

        {attachments.length === 0 && (
          <div className="card" style={{marginBottom:'16px',opacity:0.6}}>
            <div style={{fontSize:'13px',color:'var(--text-3)'}}>📷 No photos attached to this complaint</div>
          </div>
        )}

        {/* ── UPDATE STATUS ── */}
        {!isResolved && (
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'16px'}}>Update status</div>
            <div className="form-group">
              <label className="form-label">Add a note (optional)</label>
              <textarea className="form-textarea" value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Describe what action was taken, estimated completion date, field officer name..."
                style={{minHeight:'80px'}} />
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'8px'}}>
              {STATUS_FLOW.map(action => (
                <button key={action.value}
                  onClick={() => updateStatus(action.value)}
                  disabled={updating || c?.status === action.value}
                  style={{
                    padding:'10px 14px',borderRadius:'10px',border:'none',textAlign:'left',
                    background: c?.status === action.value ? '#f0f0f0' : `${action.color}15`,
                    color: c?.status === action.value ? '#999' : action.color,
                    fontWeight:'600',fontSize:'13px',cursor:c?.status === action.value ? 'not-allowed':'pointer',
                    fontFamily:'inherit',borderLeft:`3px solid ${c?.status === action.value ? '#ddd':action.color}`,
                    opacity: updating ? 0.6 : 1,
                  }}>
                  <div>{action.label}</div>
                  <div style={{fontSize:'11px',fontWeight:'400',marginTop:'2px',opacity:0.8}}>{action.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {isResolved && (
          <div className="card" style={{marginBottom:'16px',background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
            <div style={{color:'#166534',fontWeight:'600',fontSize:'14px'}}>
              {c?.status === 'rejected' ? '✗ This complaint has been rejected' : '✓ This complaint has been resolved'}
            </div>
            <div style={{color:'#166534',fontSize:'13px',marginTop:'4px',opacity:0.8}}>No further action required.</div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        <div className="card">
          <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'16px'}}>Activity timeline</div>
          {timeline.length === 0 && (
            <div style={{color:'var(--text-3)',fontSize:'13px'}}>No activity yet</div>
          )}
          {timeline.map((t,i) => (
            <div className="tl-item" key={i}>
              <div className="tl-dot done" style={{background: statusDotColor[t.status] || '#888'}}/>
              <div>
                <div className="tl-text" style={{textTransform:'capitalize'}}>
                  {t.status.replace('_',' ')}
                  {t.updated_by && <span style={{color:'var(--text-3)',fontSize:'12px',fontWeight:'400'}}> · by {t.updated_by}</span>}
                </div>
                {t.note && <div style={{fontSize:'13px',color:'var(--text-2)',marginTop:'2px',fontStyle:'italic'}}>"{t.note}"</div>}
                <div className="tl-sub">{fmtTime(t.created_at)}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
