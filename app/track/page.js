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
  const [lang, setLang]               = useState('te');
  const [mode, setMode]               = useState('id');
  const [id, setId]                   = useState('');
  const [phone, setPhone]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [otpSent, setOtpSent]         = useState(false);
  const [myComplaints, setMyComplaints] = useState(null);
  const [result, setResult]           = useState(null);
  const [loading, setLoading]         = useState(false);
  const [otpLoading, setOtpLoading]   = useState(false);
  const [error, setError]             = useState(null);
  const [upvotePhone, setUpvotePhone] = useState('');
  const [upvoteCount, setUpvoteCount] = useState(null);
  const [hasUpvoted, setHasUpvoted]   = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [showUpvoteInput, setShowUpvoteInput] = useState(false);

  const te = lang === 'te';

  const track = async (complaintNo) => {
    const trackId = complaintNo || id;
    if (!trackId.trim()) return;
    setLoading(true); setError(null); setResult(null);
    setUpvoteCount(null); setHasUpvoted(false); setShowUpvoteInput(false);
    try {
      const res = await fetch(`${API}/api/complaints/track/${trackId.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Complaint not found');
      setResult(data);
      const uvRes = await fetch(`${API}/api/complaints/${data.complaint.complaint_no}/upvotes`);
      const uvData = await uvRes.json();
      setUpvoteCount(uvData.upvote_count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    if (phone.length !== 10) { setError(te ? 'చెల్లుబాటు అయ్యే మొబైల్ నంబర్ నమోదు చేయండి' : 'Enter a valid 10-digit mobile number'); return; }
    setOtpLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/otp/send`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      setOtpSent(true);
      if (data.dev_otp) alert(`Dev OTP: ${data.dev_otp}`);
    } catch { setError('Failed to send OTP'); }
    setOtpLoading(false);
  };

  const trackByMobile = async () => {
    if (otp.length !== 6) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true); setError(null); setResult(null); setMyComplaints(null);
    try {
      await fetch(`${API}/api/otp/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const loginRes = await fetch(`${API}/api/citizens/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const loginData = await loginRes.json();
      const res = await fetch(`${API}/api/complaints/mine`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      const data = await res.json();
      setMyComplaints(data);
      if (data.length === 0) setError(te ? 'ఈ నంబర్‌కు ఫిర్యాదులు లేవు' : 'No complaints found for this number');
    } catch { setError('Failed to fetch complaints. Please try again.'); }
    setLoading(false);
  };

  const upvote = async () => {
    setUpvoteLoading(true);
    try {
      const res = await fetch(`${API}/api/complaints/${result.complaint.complaint_no}/upvote`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.status === 409) {
        setHasUpvoted(true);
      } else {
        setUpvoteCount(data.upvote_count);
        setHasUpvoted(true);
      }
    } catch { alert('Failed to upvote. Please try again.'); }
    setUpvoteLoading(false);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
  const currentStepIdx = result ? statusOrder.indexOf(result.complaint.status) : -1;

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'680px'}}>
        <div className="page-title">{te ? 'ఫిర్యాదు ట్రాక్ చేయండి' : 'Track your complaint'}</div>
        <div className="page-sub">{te ? 'మీ ఫిర్యాదు ID లేదా మొబైల్ నంబర్ నమోదు చేయండి' : 'Enter your complaint ID or mobile number to see the latest status'}</div>

        {/* Mode toggle */}
        <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
          {['id','mobile'].map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setMyComplaints(null); setError(null); setOtpSent(false); }}
              style={{padding:'8px 20px',borderRadius:'20px',border:'1.5px solid var(--ap-navy)',
                background: mode===m ? 'var(--ap-navy)' : 'transparent',
                color: mode===m ? 'white' : 'var(--ap-navy)',
                fontWeight:'600',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>
              {m === 'id' ? (te ? '🔢 ID తో' : '🔢 By Complaint ID') : (te ? '📱 మొబైల్ తో' : '📱 By Mobile Number')}
            </button>
          ))}
        </div>

        {/* Track by ID */}
        {mode === 'id' && (
          <div className="card" style={{marginBottom:'20px'}}>
            <div style={{display:'flex',gap:'10px'}}>
              <input className="form-input" value={id} onChange={e=>setId(e.target.value)}
                placeholder="AP-2026-SKL-00001" onKeyDown={e=>e.key==='Enter'&&track()}
                style={{flex:1,textTransform:'uppercase',letterSpacing:'0.05em',fontWeight:'600'}}/>
              <button className="btn-secondary" onClick={()=>track()} disabled={loading}
                style={{whiteSpace:'nowrap',padding:'10px 20px'}}>
                {loading ? '...' : (te ? 'ట్రాక్ చేయండి' : 'Track')}
              </button>
            </div>
          </div>
        )}

        {/* Track by Mobile */}
        {mode === 'mobile' && (
          <div className="card" style={{marginBottom:'20px'}}>
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'13px',fontWeight:'600',color:'var(--text-2)',display:'block',marginBottom:'6px'}}>
                {te ? 'మొబైల్ నంబర్' : 'Mobile Number'}
              </label>
              <div style={{display:'flex',gap:'10px'}}>
                <input className="form-input" value={phone} onChange={e=>setPhone(e.target.value)}
                  placeholder="10-digit mobile" maxLength={10} style={{flex:1}}
                  disabled={otpSent}/>
                {!otpSent && (
                  <button className="btn-secondary" onClick={sendOtp} disabled={otpLoading}
                    style={{whiteSpace:'nowrap',padding:'10px 20px'}}>
                    {otpLoading ? '...' : (te ? 'OTP పంపండి' : 'Send OTP')}
                  </button>
                )}
              </div>
            </div>
            {otpSent && (
              <>
                <div style={{fontSize:'13px',color:'var(--ap-green)',fontWeight:'600',marginBottom:'10px'}}>
                  ✓ {te ? `OTP ${phone} కు పంపబడింది` : `OTP sent to ${phone}`}
                  <button onClick={()=>{setOtpSent(false);setOtp('');}}
                    style={{marginLeft:'8px',fontSize:'12px',color:'var(--text-3)',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
                    {te ? 'మార్చు' : 'Change'}
                  </button>
                </div>
                <div style={{marginBottom:'12px'}}>
                  <label style={{fontSize:'13px',fontWeight:'600',color:'var(--text-2)',display:'block',marginBottom:'6px'}}>
                    {te ? '6 అంకెల OTP' : '6-digit OTP'}
                  </label>
                  <div style={{display:'flex',gap:'10px'}}>
                    <input className="form-input" value={otp} onChange={e=>setOtp(e.target.value)}
                      placeholder="------" maxLength={6} style={{flex:1,letterSpacing:'0.2em',fontSize:'20px',fontWeight:'700'}}/>
                    <button className="btn-secondary" onClick={trackByMobile} disabled={loading}
                      style={{whiteSpace:'nowrap',padding:'10px 20px'}}>
                      {loading ? '...' : (te ? 'వీక్షించు' : 'View')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        {/* My Complaints List */}
        {myComplaints && myComplaints.length > 0 && !result && (
          <div>
            <div className="page-title" style={{fontSize:'16px',marginBottom:'12px'}}>
              {te ? `మీ ఫిర్యాదులు (${myComplaints.length})` : `Your Complaints (${myComplaints.length})`}
            </div>
            {myComplaints.map((c,i) => (
              <div key={i} className="card" style={{marginBottom:'12px',cursor:'pointer'}}
                onClick={() => { setId(c.complaint_no); setMode('id'); track(c.complaint_no); }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                  <div style={{fontWeight:'600',fontSize:'14px'}}>{c.title}</div>
                  <span className={`badge badge-${c.status}`} style={{flexShrink:0,marginLeft:'8px'}}>
                    {c.status.replace('_',' ')}
                  </span>
                </div>
                <div style={{fontSize:'12px',color:'var(--ap-gold)',fontWeight:'600',marginBottom:'4px'}}>{c.complaint_no}</div>
                <div style={{fontSize:'12px',color:'var(--text-3)'}}>
                  {c.district} · {c.department} · {fmt(c.created_at)}
                </div>
                <div style={{fontSize:'12px',color:'var(--text-3)',marginTop:'4px'}}>
                  {te ? 'వివరాల కోసం క్లిక్ చేయండి →' : 'Click for full details →'}
                </div>
              </div>
            ))}
          </div>
        )}

        {result && (
          <>
            {myComplaints && (
              <button onClick={()=>setResult(null)} style={{marginBottom:'12px',background:'none',border:'none',
                color:'var(--ap-navy)',fontWeight:'600',cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>
                ← {te ? 'జాబితాకు వెనక్కి' : 'Back to list'}
              </button>
            )}

            {/* Complaint summary */}
            <div className="card" style={{marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'16px',gap:'12px'}}>
                <div>
                  <div style={{fontSize:'16px',fontWeight:'600',marginBottom:'4px'}}>{result.complaint.title}</div>
                  <div style={{fontSize:'13px',color:'var(--text-2)'}}>
                    {result.complaint.department} · {result.complaint.district}
                    {result.complaint.mandal && ` · ${result.complaint.mandal}`}
                  </div>
                  <div style={{fontSize:'12px',color:'var(--ap-gold)',marginTop:'4px',fontWeight:'600',letterSpacing:'0.04em'}}>
                    {result.complaint.complaint_no}
                  </div>
                </div>
                <span className={`badge badge-${result.complaint.status}`} style={{flexShrink:0}}>
                  {result.complaint.status.replace('_',' ')}
                </span>
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                {[
                  {l: te?'నమోదు తేదీ':'Filed on',    v: fmt(result.complaint.created_at)},
                  {l: te?'SLA గడువు':'SLA deadline', v: fmt(result.complaint.sla_deadline)},
                  {l: te?'ప్రాధాన్యత':'Priority',     v: result.complaint.priority},
                  {l: te?'స్థితి':'Status',           v: result.complaint.status.replace('_',' ')},
                ].map((r,i) => (
                  <div key={i} style={{background:'var(--bg)',borderRadius:'8px',padding:'10px 12px'}}>
                    <div style={{fontSize:'11px',color:'var(--text-3)',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em'}}>{r.l}</div>
                    <div style={{fontSize:'13px',fontWeight:'500',marginTop:'2px',textTransform:'capitalize'}}>{r.v}</div>
                  </div>
                ))}
              </div>

              {result.complaint.is_overdue && (
                <div style={{background:'#fee2e2',color:'#991b1b',padding:'8px 12px',borderRadius:'8px',fontSize:'13px',fontWeight:'500',marginBottom:'12px'}}>
                  ⚠ {te ? 'SLA గడువు దాటిపోయింది — అత్యవసర స్థాయికి పెంచబడింది' : 'SLA deadline passed — escalated to Emergency priority'}
                </div>
              )}

              {/* Upvote section */}
              <div style={{borderTop:'1px solid var(--border)',paddingTop:'12px'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-1)'}}>
                      👆 {upvoteCount ?? 0} {te ? 'నాగరికులు మద్దతిచ్చారు' : `${(upvoteCount ?? 0) === 1 ? 'citizen' : 'citizens'} supported this`}
                    </div>
                    {upvoteCount >= 10 && (
                      <div style={{fontSize:'12px',color:'#ea580c',marginTop:'2px'}}>
                        🔥 {te ? 'కమ్యూనిటీ సమస్య — High Priority కి పెంచబడింది' : 'Community issue — escalated to High Priority'}
                      </div>
                    )}
                  </div>
                  {!hasUpvoted ? (
                    <button onClick={upvote} disabled={upvoteLoading}
                      style={{padding:'8px 16px',background:'var(--ap-navy)',color:'white',border:'none',
                        borderRadius:'8px',fontWeight:'600',fontSize:'13px',cursor:'pointer',fontFamily:'inherit'}}>
                      {upvoteLoading ? '...' : (te ? '👆 నాకూ ఇదే సమస్య' : '👆 I have this issue too')}
                    </button>
                  ) : (
                    <div style={{fontSize:'13px',color:'var(--ap-green)',fontWeight:'600'}}>✓ {te ? 'మీరు మద్దతిచ్చారు' : 'You supported this'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress steps */}
            <div className="card" style={{marginBottom:'16px'}}>
              <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'16px'}}>
                {te ? 'పురోగతి' : 'Progress'}
              </div>
              <div style={{display:'flex',gap:'0',marginBottom:'8px'}}>
                {statusOrder.slice(0,-1).map((s,i) => (
                  <div key={s} style={{flex:1,position:'relative'}}>
                    <div style={{height:'6px',
                      background: i <= currentStepIdx ? 'var(--ap-green)' : 'var(--border)',
                      borderRadius: i===0?'3px 0 0 3px':i===statusOrder.length-2?'0 3px 3px 0':'0'}}/>
                    <div style={{width:'12px',height:'12px',borderRadius:'50%',
                      background: i <= currentStepIdx ? 'var(--ap-green)' : 'var(--border)',
                      position:'absolute',top:'-3px',left:'50%',transform:'translateX(-50%)',
                      border:'2px solid white'}}/>
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
