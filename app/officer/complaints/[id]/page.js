'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API = 'http://localhost:3001';

const STATUS_FLOW = [
  { value: 'acknowledged', label: 'Acknowledge',  color: '#7c3aed', desc: 'Confirm complaint received' },
  { value: 'assigned',     label: 'Assign',       color: '#2563eb', desc: 'Assign to field officer' },
  { value: 'in_progress',  label: 'Mark in progress', color: '#d97706', desc: 'Work has started' },
  { value: 'resolved',     label: 'Mark resolved', color: '#16a34a', desc: 'Issue has been fixed' },
  { value: 'rejected',     label: 'Reject',       color: '#dc2626', desc: 'Invalid or duplicate complaint' },
];

export default function ComplaintDetail() {
  const router = useRouter();
  const params = useParams();
  const id     = params.id;

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote]       = useState('');
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState(null);
  const [token, setToken]     = useState('');

  useEffect(() => {
    const t = localStorage.getItem('officer_token');
    if (!t) { router.push('/officer/login'); return; }
    setToken(t);
    fetchComplaint(t);
  }, []);

  const fetchComplaint = async (t) => {
    try {
      // Get all complaints and find the one by ID
      const res  = await fetch(`${API}/api/officer/complaints`, {
        headers: { Authorization: `Bearer ${t}` }
      });
      const list = await res.json();
      if (res.status === 401) { router.push('/officer/login'); return; }
      const found = list.find(c => c.id === id);
      if (!found) { setError('Complaint not found'); setLoading(false); return; }

      // Get timeline via track endpoint
      const trackRes  = await fetch(`${API}/api/complaints/track/${found.complaint_no}`);
      const trackData = await trackRes.json();

      setData({ complaint: found, timeline: trackData.timeline || [] });
    } catch (err) {
      setError('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!confirm(`Are you sure you want to mark this as "${status.replace('_',' ')}"?`)) return;
    setUpdating(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(`${API}/api/officer/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, note })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Update failed');
      setSuccess(`Status updated to "${status.replace('_',' ')}" successfully`);
      setNote('');
      fetchComplaint(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const fmt     = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  const priorityColor = { normal:'#2563eb', urgent:'#d97706', emergency:'#dc2626' };
  const statusDotColor = { submitted:'#0369a1', acknowledged:'#7c3aed', assigned:'#2563eb', in_progress:'#d97706', resolved:'#16a34a', closed:'#16a34a', rejected:'#dc2626' };

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)'}}>
      Loading complaint...
    </div>
  );

  if (error && !data) return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card" style={{textAlign:'center',padding:'40px'}}>
        <div style={{color:'var(--ap-red)',marginBottom:'12px'}}>{error}</div>
        <Link href="/officer/dashboard"><button className="btn-secondary">← Back to dashboard</button></Link>
      </div>
    </div>
  );

  const c = data?.complaint;
  const timeline = data?.timeline || [];

  // Determine available next actions based on current status
  const currentIdx = ['submitted','acknowledged','assigned','in_progress','resolved','closed','rejected'].indexOf(c?.status);
  const availableActions = STATUS_FLOW.filter(s => {
    if (c?.status === 'resolved' || c?.status === 'closed' || c?.status === 'rejected') return false;
    if (s.value === 'rejected') return true;
    return true;
  });

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>

      {/* Nav */}
      <nav style={{background:'var(--ap-navy)',padding:'0 24px',display:'flex',alignItems:'center',height:'60px',gap:'12px'}}>
        <Link href="/officer/dashboard" style={{color:'rgba(255,255,255,0.7)',fontSize:'13px',textDecoration:'none',display:'flex',alignItems:'center',gap:'6px'}}>
          ← Back
        </Link>
        <div style={{color:'white',fontWeight:'600',fontSize:'14px'}}>Complaint Detail</div>
        <div style={{marginLeft:'auto',color:'rgba(255,255,255,0.5)',fontSize:'12px',fontWeight:'600',letterSpacing:'0.04em'}}>
          {c?.complaint_no}
        </div>
      </nav>

      <div className="page" style={{maxWidth:'760px'}}>

        {success && <div className="alert alert-success">{success}</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        {/* Complaint summary */}
        <div className="card" style={{marginBottom:'16px',borderLeft:`4px solid ${priorityColor[c?.priority] || '#888'}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'16px'}}>
            <div>
              <div style={{fontSize:'18px',fontWeight:'700',color:'var(--text-1)',marginBottom:'6px'}}>{c?.title}</div>
              <div style={{fontSize:'13px',color:'var(--text-2)'}}>
                {c?.department} · {c?.district}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px',alignItems:'flex-end',flexShrink:0}}>
              <span className={`badge badge-${c?.status}`} style={{textTransform:'capitalize'}}>
                {c?.status?.replace('_',' ')}
              </span>
              <span style={{fontSize:'11px',fontWeight:'600',padding:'2px 8px',borderRadius:'10px',
                background:`${priorityColor[c?.priority]}15`,color:priorityColor[c?.priority],textTransform:'capitalize'}}>
                {c?.priority}
              </span>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'8px',marginBottom:'16px'}}>
            {[
              { l:'Filed on',        v: fmt(c?.created_at) },
              { l:'SLA deadline',    v: fmt(c?.sla_deadline), red: c?.is_overdue },
              { l:'Citizen',         v: c?.citizen_name || 'Anonymous' },
              { l:'Phone',           v: c?.citizen_phone || '—' },
            ].map((r,i) => (
              <div key={i} style={{background:'var(--bg)',borderRadius:'8px',padding:'10px 12px'}}>
                <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em'}}>{r.l}</div>
                <div style={{fontSize:'13px',fontWeight:'500',marginTop:'2px',color:r.red?'#dc2626':'var(--text-1)'}}>{r.v}</div>
              </div>
            ))}
          </div>

          {c?.is_overdue && (
            <div style={{background:'#fee2e2',color:'#991b1b',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'500',marginBottom:'16px'}}>
              ⚠ SLA deadline has passed — this complaint is overdue. Please take action immediately.
            </div>
          )}
        </div>

        {/* Update status */}
        {(c?.status !== 'resolved' && c?.status !== 'closed' && c?.status !== 'rejected') && (
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'16px'}}>Update status</div>

            <div className="form-group">
              <label className="form-label">Add a note (optional)</label>
              <textarea className="form-textarea" value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Describe what action was taken, estimated completion date, field officer name..."
                style={{minHeight:'80px'}} />
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'8px'}}>
              {availableActions.map(action => (
                <button key={action.value}
                  onClick={() => updateStatus(action.value)}
                  disabled={updating || c?.status === action.value}
                  style={{
                    padding:'10px 14px', borderRadius:'10px', border:'none',
                    background: c?.status === action.value ? '#f0f0f0' : `${action.color}15`,
                    color: c?.status === action.value ? '#999' : action.color,
                    fontWeight:'600', fontSize:'13px', cursor: c?.status === action.value ? 'not-allowed' : 'pointer',
                    fontFamily:'inherit', textAlign:'left',
                    borderLeft:`3px solid ${c?.status === action.value ? '#ddd' : action.color}`,
                    opacity: updating ? 0.6 : 1,
                  }}>
                  <div>{action.label}</div>
                  <div style={{fontSize:'11px',fontWeight:'400',marginTop:'2px',opacity:0.8}}>{action.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {(c?.status === 'resolved' || c?.status === 'closed' || c?.status === 'rejected') && (
          <div className="card" style={{marginBottom:'16px',background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
            <div style={{color:'#166534',fontWeight:'600',fontSize:'14px'}}>
              {c?.status === 'rejected' ? '✗ This complaint has been rejected' : '✓ This complaint has been resolved'}
            </div>
            <div style={{color:'#166534',fontSize:'13px',marginTop:'4px',opacity:0.8}}>No further action required.</div>
          </div>
        )}

        {/* Timeline */}
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
