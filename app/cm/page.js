'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'https://vaani-backend-w3zz.onrender.com';

const STATUS_COLOR = {
  submitted: '#0369a1', acknowledged: '#7c3aed', assigned: '#2563eb',
  in_progress: '#d97706', resolved: '#16a34a', rejected: '#dc2626'
};

export default function CMDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/dashboard/cm`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setData(d);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  const pct = (n, total) => total > 0 ? Math.round((n/total)*100) : 0;

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0f2d5e',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#f0a500',fontSize:'16px'}}>Loading CM Dashboard...</div>
    </div>
  );

  if (error) return (
    <div style={{minHeight:'100vh',background:'#0f2d5e',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#f87171',fontSize:'16px'}}>{error}</div>
    </div>
  );

  const t = data.totals;
  const resolutionRate = pct(parseInt(t.resolved), parseInt(t.total));
  const overdueRate = pct(parseInt(t.overdue), parseInt(t.total));

  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',fontFamily:'Plus Jakarta Sans, sans-serif'}}>

      {/* Header */}
      <div style={{background:'#0f2d5e',padding:'0 32px',display:'flex',alignItems:'center',
        justifyContent:'space-between',height:'64px',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'#f0a500',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'700',color:'#0f2d5e'}}>వ</div>
          <div>
            <div style={{color:'white',fontWeight:'700',fontSize:'16px'}}>Vaani — CM Dashboard</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:'11px'}}>Andhra Pradesh Grievance Analytics</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
          <button onClick={fetchData} style={{background:'rgba(255,255,255,0.1)',border:'none',
            color:'white',padding:'7px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>
            ↻ Refresh
          </button>
          <Link href="/" style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',textDecoration:'none'}}>← Back to Portal</Link>
        </div>
      </div>

      {/* Live indicator */}
      <div style={{background:'#1e3a6e',padding:'8px 32px',display:'flex',alignItems:'center',gap:'8px'}}>
        <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}}/>
        <span style={{color:'rgba(255,255,255,0.7)',fontSize:'12px'}}>
          Live data · Last updated {new Date().toLocaleTimeString('en-IN')} · {t.total} total complaints across AP
        </span>
        {parseInt(t.overdue) > 0 && (
          <span style={{marginLeft:'16px',background:'#fee2e2',color:'#991b1b',
            padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>
            ⚠ {t.overdue} SLA Breaches Require Attention
          </span>
        )}
      </div>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'24px 24px'}}>

        {/* KPI Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'12px',marginBottom:'24px'}}>
          {[
            { label:'Total Complaints', value: t.total, sub:'All time', color:'#0f2d5e', bg:'#e8f0fe' },
            { label:'Resolved', value: t.resolved, sub:`${resolutionRate}% resolution rate`, color:'#166534', bg:'#dcfce7' },
            { label:'Pending', value: t.pending, sub:'Awaiting action', color:'#854d0e', bg:'#fef9c3' },
            { label:'SLA Breached', value: t.overdue, sub:`${overdueRate}% breach rate`, color:'#991b1b', bg:'#fee2e2' },
            { label:'Emergency', value: t.emergency, sub:'High priority', color:'#9a3412', bg:'#ffedd5' },
            { label:'Last 24 Hours', value: t.last_24_hours, sub:'New complaints', color:'#1e40af', bg:'#dbeafe' },
            { label:'Last 7 Days', value: t.last_7_days, sub:'Weekly volume', color:'#6b21a8', bg:'#f3e8ff' },
            { label:'Avg Resolution', value: t.avg_resolution_days ? `${t.avg_resolution_days}d` : 'N/A', sub:'Days to resolve', color:'#0f6e56', bg:'#e1f5ee' },
          ].map((k,i) => (
            <div key={i} style={{background:'white',borderRadius:'12px',padding:'16px',
              border:`1px solid ${k.bg}`,borderTop:`3px solid ${k.color}`}}>
              <div style={{fontSize:'11px',color:'#888',fontWeight:'600',textTransform:'uppercase',
                letterSpacing:'0.04em',marginBottom:'6px'}}>{k.label}</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:k.color,marginBottom:'2px'}}>{k.value}</div>
              <div style={{fontSize:'11px',color:'#aaa'}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:'white',
          padding:'4px',borderRadius:'12px',border:'1px solid #e5e7eb',width:'fit-content'}}>
          {['overview','districts','departments','sla','activity'].map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)}
              style={{padding:'8px 18px',borderRadius:'9px',border:'none',cursor:'pointer',
                fontFamily:'inherit',fontSize:'13px',fontWeight:'600',textTransform:'capitalize',
                background: activeTab===tab ? '#0f2d5e' : 'transparent',
                color: activeTab===tab ? '#f0a500' : '#888'}}>
              {tab === 'sla' ? 'SLA Performance' : tab === 'activity' ? 'Recent Activity' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>

            {/* Resolution gauge */}
            <div style={{background:'white',borderRadius:'16px',padding:'24px',border:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'20px'}}>
                Overall Resolution Rate
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'24px'}}>
                <div style={{position:'relative',width:'120px',height:'120px'}}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="12"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="12"
                      strokeDasharray={`${resolutionRate * 3.14} 314`}
                      strokeLinecap="round" transform="rotate(-90 60 60)"/>
                  </svg>
                  <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',
                    textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'700',color:'#0f2d5e'}}>{resolutionRate}%</div>
                    <div style={{fontSize:'10px',color:'#888'}}>resolved</div>
                  </div>
                </div>
                <div style={{flex:1}}>
                  {[
                    { label:'Resolved', val: t.resolved, color:'#16a34a' },
                    { label:'In Progress', val: t.in_progress, color:'#d97706' },
                    { label:'Pending', val: t.pending, color:'#0369a1' },
                    { label:'Overdue', val: t.overdue, color:'#dc2626' },
                  ].map((s,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',
                      alignItems:'center',marginBottom:'8px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'10px',height:'10px',borderRadius:'50%',background:s.color}}/>
                        <span style={{fontSize:'13px',color:'#555'}}>{s.label}</span>
                      </div>
                      <span style={{fontSize:'13px',fontWeight:'600',color:s.color}}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top community issues */}
            <div style={{background:'white',borderRadius:'16px',padding:'24px',border:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'16px'}}>
                🔥 Top Community Issues
              </div>
              {data.topIssues.length === 0 ? (
                <div style={{color:'#aaa',fontSize:'13px',textAlign:'center',padding:'20px'}}>
                  No upvoted issues yet
                </div>
              ) : data.topIssues.map((issue,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',
                  marginBottom:'12px',padding:'10px',background:'#f9fafb',borderRadius:'8px'}}>
                  <div style={{width:'32px',height:'32px',borderRadius:'8px',background:'#fff7ed',
                    display:'flex',alignItems:'center',justifyContent:'center',
                    fontWeight:'700',color:'#ea580c',fontSize:'14px',flexShrink:0}}>
                    {issue.upvote_count}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'#0f2d5e',
                      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{issue.title}</div>
                    <div style={{fontSize:'11px',color:'#888'}}>{issue.district} · {issue.department}</div>
                  </div>
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',
                    background: issue.status==='resolved'?'#dcfce7':'#fef9c3',
                    color: issue.status==='resolved'?'#166534':'#854d0e',flexShrink:0,textTransform:'capitalize'}}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISTRICTS TAB */}
        {activeTab === 'districts' && (
          <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',
              justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e'}}>District-wise Performance</div>
              <div style={{fontSize:'12px',color:'#888'}}>26 districts · sorted by complaint volume</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9fafb'}}>
                    {['District','Total','Resolved','Overdue','Emergency','Resolution %'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',
                        fontWeight:'600',color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',
                        whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byDistrict.map((d,i) => (
                    <tr key={i} style={{borderTop:'1px solid #f0f0f0',
                      background: parseInt(d.overdue)>0 ? '#fff9f9' : 'white'}}>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{fontWeight:'600',fontSize:'14px',color:'#0f2d5e'}}>{d.district}</div>
                        <div style={{fontSize:'11px',color:'#aaa'}}>{d.district_code}</div>
                      </td>
                      <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:'600',color:'#0f2d5e'}}>{d.total}</td>
                      <td style={{padding:'12px 16px',fontSize:'14px',color:'#16a34a',fontWeight:'600'}}>{d.resolved}</td>
                      <td style={{padding:'12px 16px'}}>
                        {parseInt(d.overdue) > 0
                          ? <span style={{background:'#fee2e2',color:'#991b1b',padding:'2px 8px',
                              borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>⚠ {d.overdue}</span>
                          : <span style={{color:'#aaa',fontSize:'13px'}}>—</span>
                        }
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        {parseInt(d.emergency) > 0
                          ? <span style={{background:'#ffedd5',color:'#9a3412',padding:'2px 8px',
                              borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>🚨 {d.emergency}</span>
                          : <span style={{color:'#aaa',fontSize:'13px'}}>—</span>
                        }
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <div style={{flex:1,height:'6px',background:'#f0f0f0',borderRadius:'3px',minWidth:'60px'}}>
                            <div style={{height:'100%',borderRadius:'3px',
                              background: parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626',
                              width:`${Math.min(parseFloat(d.resolution_pct)||0,100)}%`}}/>
                          </div>
                          <span style={{fontSize:'13px',fontWeight:'600',
                            color: parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626',
                            minWidth:'36px'}}>
                            {d.resolution_pct || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e'}}>Department Performance</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9fafb'}}>
                    {['Department','SLA Days','Total','Resolved','Overdue','Avg Days','Resolution %'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',
                        fontWeight:'600',color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byDept.map((d,i) => (
                    <tr key={i} style={{borderTop:'1px solid #f0f0f0'}}>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{fontWeight:'600',fontSize:'13px',color:'#0f2d5e'}}>{d.department}</div>
                        <div style={{fontSize:'11px',color:'#aaa'}}>{d.code}</div>
                      </td>
                      <td style={{padding:'12px 16px',fontSize:'13px',color:'#555'}}>{d.sla_days}d</td>
                      <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:'600',color:'#0f2d5e'}}>{d.total}</td>
                      <td style={{padding:'12px 16px',fontSize:'13px',color:'#16a34a',fontWeight:'600'}}>{d.resolved}</td>
                      <td style={{padding:'12px 16px'}}>
                        {parseInt(d.overdue) > 0
                          ? <span style={{background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'20px',fontSize:'12px',fontWeight:'600'}}>⚠ {d.overdue}</span>
                          : <span style={{color:'#aaa',fontSize:'13px'}}>—</span>}
                      </td>
                      <td style={{padding:'12px 16px',fontSize:'13px',color:'#555'}}>{d.avg_days ? `${d.avg_days}d` : '—'}</td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <div style={{flex:1,height:'6px',background:'#f0f0f0',borderRadius:'3px',minWidth:'60px'}}>
                            <div style={{height:'100%',borderRadius:'3px',
                              background: parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626',
                              width:`${Math.min(parseFloat(d.resolution_pct)||0,100)}%`}}/>
                          </div>
                          <span style={{fontSize:'13px',fontWeight:'600',
                            color: parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626',
                            minWidth:'36px'}}>
                            {d.resolution_pct || 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLA TAB */}
        {activeTab === 'sla' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{background:'white',borderRadius:'16px',padding:'24px',border:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'16px'}}>
                SLA Breach by Department
              </div>
              {data.slaPerformance.length === 0
                ? <div style={{color:'#aaa',fontSize:'13px',textAlign:'center',padding:'20px'}}>No SLA data yet</div>
                : data.slaPerformance.map((s,i) => (
                  <div key={i} style={{marginBottom:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                      <span style={{fontSize:'13px',fontWeight:'600',color:'#0f2d5e'}}>{s.department}</span>
                      <span style={{fontSize:'13px',fontWeight:'600',
                        color: parseFloat(s.breach_pct)>50?'#dc2626':parseFloat(s.breach_pct)>20?'#d97706':'#16a34a'}}>
                        {s.breach_pct || 0}% breach
                      </span>
                    </div>
                    <div style={{height:'8px',background:'#f0f0f0',borderRadius:'4px'}}>
                      <div style={{height:'100%',borderRadius:'4px',
                        background: parseFloat(s.breach_pct)>50?'#dc2626':parseFloat(s.breach_pct)>20?'#d97706':'#16a34a',
                        width:`${Math.min(parseFloat(s.breach_pct)||0,100)}%`}}/>
                    </div>
                    <div style={{fontSize:'11px',color:'#aaa',marginTop:'2px'}}>
                      {s.breached} of {s.total} complaints breached · SLA: {s.sla_days} days
                    </div>
                  </div>
                ))
              }
            </div>

            <div style={{background:'white',borderRadius:'16px',padding:'24px',border:'1px solid #e5e7eb'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'16px'}}>
                SLA Health Summary
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                {[
                  { label:'On Track', val: parseInt(t.total) - parseInt(t.overdue), color:'#16a34a', bg:'#dcfce7', icon:'✓' },
                  { label:'SLA Breached', val: t.overdue, color:'#dc2626', bg:'#fee2e2', icon:'⚠' },
                  { label:'Emergency Priority', val: t.emergency, color:'#9a3412', bg:'#ffedd5', icon:'🚨' },
                ].map((s,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'16px',
                    background:s.bg,borderRadius:'12px',padding:'16px'}}>
                    <div style={{fontSize:'24px'}}>{s.icon}</div>
                    <div>
                      <div style={{fontSize:'24px',fontWeight:'700',color:s.color}}>{s.val}</div>
                      <div style={{fontSize:'13px',color:s.color,opacity:0.8}}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'activity' && (
          <div style={{background:'white',borderRadius:'16px',border:'1px solid #e5e7eb',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',
              justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e'}}>Recent Complaints</div>
              <div style={{fontSize:'12px',color:'#888'}}>Last 10 filed</div>
            </div>
            {data.recentActivity.map((c,i) => (
              <div key={i} style={{padding:'16px 24px',borderTop: i>0?'1px solid #f0f0f0':'none',
                display:'flex',alignItems:'center',gap:'16px'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:'600',fontSize:'14px',color:'#0f2d5e',marginBottom:'2px'}}>{c.title}</div>
                  <div style={{fontSize:'12px',color:'#888'}}>{c.complaint_no} · {c.district} · {c.department}</div>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'center',flexShrink:0}}>
                  {c.is_overdue && <span style={{background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>Overdue</span>}
                  {c.priority === 'emergency' && <span style={{background:'#ffedd5',color:'#9a3412',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>Emergency</span>}
                  <span style={{fontSize:'11px',fontWeight:'600',padding:'3px 10px',borderRadius:'20px',
                    background: c.status==='resolved'?'#dcfce7':c.status==='in_progress'?'#f3e8ff':'#fef9c3',
                    color: c.status==='resolved'?'#166534':c.status==='in_progress'?'#6b21a8':'#854d0e',
                    textTransform:'capitalize'}}>
                    {c.status.replace('_',' ')}
                  </span>
                  <span style={{fontSize:'11px',color:'#aaa',whiteSpace:'nowrap'}}>{fmtTime(c.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{textAlign:'center',padding:'24px 0',fontSize:'12px',color:'#aaa'}}>
          Vaani · వాణి · AP Citizen Grievance Portal · CM Analytics Dashboard
        </div>
      </div>
    </div>
  );
}
