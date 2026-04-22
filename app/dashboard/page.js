'use client';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';

const API = 'https://vaani-backend-w3zz.onrender.com';

export default function DashboardPage() {
    const [lang, setLangState] = useState('te');
    useEffect(() => {
    const saved = localStorage.getItem('vaani_lang');
    if (saved) setLangState(saved);
    }, []);
    const setLang = (l) => {
    localStorage.setItem('vaani_lang', l);
    setLangState(l);
    };
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const te = lang === 'te';

  const deptNames = {
  'Roads & Infrastructure': 'రోడ్లు & మౌలిక సదుపాయాలు',
  'Electricity (APSPDCL)': 'విద్యుత్ (APSPDCL)',
  'Agriculture': 'వ్యవసాయం',
  'Municipal Services': 'పురపాలక సేవలు',
  'Revenue & Land': 'రెవెన్యూ & భూమి',
  'Education': 'విద్య',
  'Health & Medical': 'ఆరోగ్యం & వైద్యం',
  'Police': 'పోలీసు',
  'Water Supply & Sanitation': 'నీటి సరఫరా & పారిశుద్ధ్యం',
  'Other': 'ఇతర',
};

  useEffect(() => {
    fetch(`${API}/api/dashboard/public`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pct = (a, b) => b > 0 ? Math.round((a / b) * 100) : 0;

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page">
        <div className="page-title">{te ? 'పారదర్శకత డాష్‌బోర్డ్' : 'Transparency Dashboard'}</div>
        <div className="page-sub">{te ? 'ఆంధ్రప్రదేశ్ అంతటా ఫిర్యాదు పరిష్కార స్థితి' : 'Live grievance resolution status across Andhra Pradesh'}</div>

        {loading && (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-3)'}}>
            {te ? 'లోడ్ అవుతోంది...' : 'Loading data...'}
          </div>
        )}

        {data && (
          <>
            {/* Overall stats */}
            <div className="stats-grid" style={{marginBottom:'32px'}}>
              {[
                { n: data.totals.total,       l: te?'మొత్తం ఫిర్యాదులు':'Total complaints',  color: 'var(--ap-navy)' },
                { n: data.totals.resolved,    l: te?'పరిష్కరించబడింది':'Resolved',            color: 'var(--ap-green)' },
                { n: data.totals.in_progress, l: te?'పురోగతిలో':'In progress',               color: '#2563eb' },
                { n: data.totals.overdue,     l: te?'SLA దాటినవి':'Overdue',                  color: 'var(--ap-red)' },
              ].map((s,i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-num" style={{color:s.color}}>{s.n || 0}</div>
                  <div className="stat-lbl">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Department breakdown */}
            <div className="card" style={{marginBottom:'24px'}}>
              <div style={{fontWeight:'600',fontSize:'16px',marginBottom:'20px'}}>
                {te ? 'విభాగాల వారీగా' : 'Resolution by department'}
              </div>
              {data.byDept.length === 0 && (
                <div style={{color:'var(--text-3)',fontSize:'14px',textAlign:'center',padding:'20px'}}>
                  {te ? 'ఇంకా ఫిర్యాదులు లేవు' : 'No complaints yet — be the first to file one!'}
                </div>
              )}
              {data.byDept.map((d,i) => {
                const resPct = pct(d.resolved, d.total);
                return (
                  <div key={i} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'6px',alignItems:'center'}}>
                    <div style={{fontSize:'14px',fontWeight:'500'}}>
                      {te ? (deptNames[d.department] || d.department) : d.department}
                    </div>                      
                    <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
                        <span style={{fontSize:'12px',color:'var(--text-3)'}}>
                          {d.total} {te?'ఫిర్యాదులు':'complaints'}
                        </span>
                        {d.overdue > 0 && (
                          <span style={{fontSize:'11px',background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'10px',fontWeight:'600'}}>
                          {d.overdue} {te ? 'ఆలస్యంగా ఉన్నవి' : 'overdue'}
                          </span>
                        )}
                        <span style={{fontSize:'13px',fontWeight:'600',color: resPct > 75 ? 'var(--ap-green)' : resPct > 40 ? '#2563eb' : 'var(--ap-red)'}}>
                          {resPct}%
                        </span>
                      </div>
                    </div>
                    <div style={{background:'var(--border)',height:'6px',borderRadius:'3px',overflow:'hidden'}}>
                      <div style={{
                        width:`${resPct}%`, height:'100%', borderRadius:'3px',
                        background: resPct > 75 ? 'var(--ap-green)' : resPct > 40 ? '#2563eb' : 'var(--ap-red)',
                        transition:'width 0.8s ease',
                      }}/>
                    </div>
                    {d.avg_resolution_days && (
                      <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'4px'}}>
                        {te?'సగటు పరిష్కార సమయం:':'Avg resolution:'} {d.avg_resolution_days} {te?'రోజులు':'days'}
                        {' · '}SLA: {d.sla_days} {te?'రోజులు':'days'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* District breakdown */}
            <div className="card">
              <div style={{fontWeight:'600',fontSize:'16px',marginBottom:'20px'}}>
                {te ? 'జిల్లాల వారీగా' : 'Resolution by district'}
              </div>
              {data.byDistrict.length === 0 && (
                <div style={{color:'var(--text-3)',fontSize:'14px',textAlign:'center',padding:'20px'}}>
                  {te ? 'ఇంకా ఫిర్యాదులు లేవు' : 'No complaints yet'}
                </div>
              )}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'12px'}}>
                {data.byDistrict.filter(d => d.total > 0).map((d,i) => {
                  const resPct = pct(d.resolved, d.total);
                  return (
                    <div key={i} style={{background:'var(--bg)',borderRadius:'10px',padding:'14px'}}>
                      <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'6px'}}>{d.district}</div>
                      <div style={{fontSize:'12px',color:'var(--text-2)',marginBottom:'8px'}}>
                        {d.total} {te?'ఫిర్యాదులు':'complaints'} · {d.resolved} {te?'పరిష్కరించబడింది':'resolved'}
                      </div>
                      <div style={{background:'var(--border)',height:'4px',borderRadius:'2px',overflow:'hidden'}}>
                        <div style={{
                          width:`${resPct}%`, height:'100%',
                          background: resPct > 75 ? 'var(--ap-green)' : resPct > 40 ? '#2563eb' : 'var(--ap-red)',
                        }}/>
                      </div>
                      <div style={{fontSize:'12px',fontWeight:'600',marginTop:'4px',color:'var(--text-2)'}}>{resPct}% {te?'పరిష్కారం':'resolved'}</div>
                    </div>
                  );
                })}
                {data.byDistrict.filter(d => d.total > 0).length === 0 && (
                  <div style={{gridColumn:'1/-1',color:'var(--text-3)',fontSize:'14px',textAlign:'center',padding:'20px'}}>
                    {te ? 'ఇంకా జిల్లా డేటా లేదు' : 'No district data yet'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
