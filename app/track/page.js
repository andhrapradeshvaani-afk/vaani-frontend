'use client';
import { useState } from 'react';
import Nav from '../components/Nav';

const API = 'https://vaani-backend-w3zz.onrender.com';

const statusColors = {
  submitted: 'done', acknowledged: 'done', assigned: 'done',
  in_progress: 'active', resolved: 'done', closed: 'done', rejected: 'pending'
};

const statusOrder = ['submitted','acknowledged','assigned','in_progress','resolved','closed'];

export default function TrackPage() {
  const [lang, setLang]       = useState('en');
  const [id, setId]           = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const te = lang === 'te';

  const track = async () => {
    if (!id.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/api/complaints/track/${id.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Complaint not found');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  const currentStepIdx = result ? statusOrder.indexOf(result.complaint.status) : -1;

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'680px'}}>
        <div className="page-title">{te ? 'ఫిర్యాదు ట్రాక్ చేయండి' : 'Track your complaint'}</div>
        <div className="page-sub">{te ? 'మీ ఫిర్యాదు ID నమోదు చేయండి' : 'Enter your complaint ID to see the latest status'}</div>

        <div className="card" style={{marginBottom:'20px'}}>
          <div style={{display:'flex',gap:'10px'}}>
            <input
              className="form-input"
              value={id}
              onChange={e=>setId(e.target.value)}
              placeholder="AP-2025-CTR-00001"
              onKeyDown={e=>e.key==='Enter'&&track()}
              style={{flex:1,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:'600'}}
            />
            <button className="btn-secondary" onClick={track} disabled={loading} style={{whiteSpace:'nowrap',padding:'10px 20px'}}>
              {loading ? '...' : (te ? 'ట్రాక్ చేయండి' : 'Track')}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{te ? 'ఫిర్యాదు కనుగొనబడలేదు. ID తనిఖీ చేయండి.' : error}</div>}

        {result && (
          <>
            {/* Complaint summary */}
            <div className="card" style={{marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'16px',gap:'12px'}}>
                <div>
                  <div style={{fontSize:'16px',fontWeight:'600',marginBottom:'4px'}}>{result.complaint.title}</div>
                  <div style={{fontSize:'13px',color:'var(--text-2)'}}>
                    {result.complaint.department} · {result.complaint.district}
                    {result.complaint.mandal && ` · ${result.complaint.mandal}`}
                  </div>
                  <div style={{fontSize:'12px',color:'var(--text-3)',marginTop:'4px',fontWeight:'600',letterSpacing:'0.04em'}}>
                    {result.complaint.complaint_no}
                  </div>
                </div>
                <span className={`badge badge-${result.complaint.status}`} style={{flexShrink:0}}>
                  {result.complaint.status.replace('_',' ')}
                </span>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                {[
                  {l: te?'నమోదు తేదీ':'Filed on',      v: fmt(result.complaint.created_at)},
                  {l: te?'SLA గడువు':'SLA deadline',    v: fmt(result.complaint.sla_deadline)},
                  {l: te?'ప్రాధాన్యత':'Priority',       v: result.complaint.priority},
                  {l: te?'స్థితి':'Status',             v: result.complaint.status.replace('_',' ')},
                ].map((r,i) => (
                  <div key={i} style={{background:'var(--bg)',borderRadius:'8px',padding:'10px 12px'}}>
                    <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em'}}>{r.l}</div>
                    <div style={{fontSize:'13px',fontWeight:'500',marginTop:'2px',textTransform:'capitalize'}}>{r.v}</div>
                  </div>
                ))}
              </div>

              {result.complaint.is_overdue && (
                <div style={{marginTop:'12px',background:'#fee2e2',color:'#991b1b',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'500'}}>
                  {te ? '⚠ SLA గడువు దాటిపోయింది' : '⚠ SLA deadline has passed — escalation triggered'}
                </div>
              )}
            </div>

            {/* Progress steps */}
            <div className="card" style={{marginBottom:'16px'}}>
              <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'16px'}}>
                {te ? 'పురోగతి' : 'Progress'}
              </div>
              <div style={{display:'flex',gap:'0',marginBottom:'8px'}}>
                {statusOrder.slice(0,-1).map((s,i) => (
                  <div key={s} style={{flex:1,position:'relative'}}>
                    <div style={{
                      height:'6px',
                      background: i <= currentStepIdx ? 'var(--ap-green)' : 'var(--border)',
                      borderRadius: i===0?'3px 0 0 3px':i===statusOrder.length-2?'0 3px 3px 0':'0',
                    }}/>
                    <div style={{
                      width:'12px',height:'12px',borderRadius:'50%',
                      background: i <= currentStepIdx ? 'var(--ap-green)' : 'var(--border)',
                      position:'absolute',top:'-3px',left:'50%',transform:'translateX(-50%)',
                      border:'2px solid white',
                    }}/>
                    <div style={{fontSize:'10px',color:'var(--text-3)',textAlign:'center',marginTop:'10px',textTransform:'capitalize'}}>
                      {s.replace('_',' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'16px'}}>
                {te ? 'కార్యకలాప చరిత్ర' : 'Activity timeline'}
              </div>
              {result.timeline.length === 0 && (
                <div style={{color:'var(--text-3)',fontSize:'13px'}}>
                  {te ? 'ఇంకా కార్యకలాపాలు లేవు' : 'No activity yet'}
                </div>
              )}
              {result.timeline.map((t,i) => (
                <div className="tl-item" key={i}>
                  <div className={`tl-dot ${statusColors[t.status] || 'pending'}`}/>
                  <div>
                    <div className="tl-text" style={{textTransform:'capitalize'}}>
                      {t.status.replace('_',' ')}
                      {t.updated_by && <span style={{color:'var(--text-3)',fontSize:'12px',fontWeight:'400'}}> · {t.updated_by}</span>}
                    </div>
                    {t.note && <div style={{fontSize:'13px',color:'var(--text-2)',marginTop:'2px'}}>{t.note}</div>}
                    <div className="tl-sub">{fmtTime(t.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
