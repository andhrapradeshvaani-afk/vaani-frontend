'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const API = 'https://vaani-backend-w3zz.onrender.com';

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
      setError(null);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const safeNum = (v) => Number(v) || 0;
  const pct = (n, t) => t > 0 ? Math.round((n/t)*100) : 0;
  const fmtTime = (d) => new Date(d).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0f2d5e',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{color:'#f0a500',fontSize:'32px',fontWeight:'700',marginBottom:'8px'}}>వాణి</div>
        <div style={{color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>Loading CM Dashboard...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{minHeight:'100vh',background:'#0f2d5e',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{color:'#f87171',fontSize:'16px',marginBottom:'12px'}}>{error}</div>
        <button onClick={fetchData} style={{background:'#f0a500',color:'#0f2d5e',border:'none',padding:'10px 20px',borderRadius:'8px',fontWeight:'600',cursor:'pointer'}}>Retry</button>
      </div>
    </div>
  );

  const t = data.totals;
  const total = safeNum(t.total);
  const resolved = safeNum(t.resolved);
  const overdue = safeNum(t.overdue);
  const resolutionRate = pct(resolved, total);
  const overdueRate = pct(overdue, total);

  return (
    <div style={{minHeight:'100vh',background:'#f5f6fa',fontFamily:'Plus Jakarta Sans,sans-serif'}}>

      {/* Header */}
      <div style={{background:'#0f2d5e',padding:'0 32px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'64px',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'#f0a500',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px',fontWeight:'700',color:'#0f2d5e'}}>వ</div>
          <div>
            <div style={{color:'white',fontWeight:'700',fontSize:'16px'}}>Vaani — CM Dashboard</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:'11px'}}>Andhra Pradesh Grievance Analytics</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'12px',alignItems:'center'}}>
          <button onClick={fetchData} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',padding:'7px 16px',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontFamily:'inherit'}}>↻ Refresh</button>
          <Link href="/" style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',textDecoration:'none'}}>← Portal</Link>
        </div>
      </div>

      {/* Live bar */}
      <div style={{background:'#1e3a6e',padding:'8px 32px',display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
        <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#4ade80',flexShrink:0}}/>
        <span style={{color:'rgba(255,255,255,0.7)',fontSize:'12px'}}>
          Live · {t.total} total complaints · Updated {new Date().toLocaleTimeString('en-IN')}
        </span>
        {overdue > 0 && (
          <span style={{marginLeft:'8px',background:'#fee2e2',color:'#991b1b',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>
            ⚠ {t.overdue} SLA Breaches
          </span>
        )}
        {safeNum(t.emergency) > 0 && (
          <span style={{background:'#ffedd5',color:'#9a3412',padding:'2px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>
            🚨 {t.emergency} Emergency
          </span>
        )}
      </div>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'24px'}}>

        {/* KPI Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:'12px',marginBottom:'24px'}}>
          {[
            { label:'Total Complaints', value:t.total, sub:'All time', color:'#0f2d5e', border:'#0f2d5e' },
            { label:'Resolved', value:t.resolved, sub:`${resolutionRate}% rate`, color:'#166534', border:'#16a34a' },
            { label:'Pending', value:t.pending, sub:'Awaiting action', color:'#854d0e', border:'#d97706' },
            { label:'SLA Breached', value:t.overdue, sub:`${overdueRate}% of total`, color:'#991b1b', border:'#dc2626' },
            { label:'Emergency', value:t.emergency, sub:'High urgency', color:'#9a3412', border:'#ea580c' },
            { label:'Last 24 Hours', value:t.last_24_hours, sub:'New today', color:'#1e40af', border:'#2563eb' },
            { label:'Last 7 Days', value:t.last_7_days, sub:'Weekly volume', color:'#6b21a8', border:'#7c3aed' },
            { label:'Avg Resolution', value:t.avg_resolution_days ? `${t.avg_resolution_days}d` : 'N/A', sub:'Days to close', color:'#0f6e56', border:'#16a34a' },
          ].map((k,i) => (
            <div key={i} style={{background:'white',borderRadius:'12px',padding:'16px',borderTop:`3px solid ${k.border}`,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:'11px',color:'#888',fontWeight:'600',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:'6px'}}>{k.label}</div>
              <div style={{fontSize:'28px',fontWeight:'700',color:k.color,marginBottom:'2px'}}>{k.value}</div>
              <div style={{fontSize:'11px',color:'#aaa'}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:'4px',marginBottom:'20px',background:'white',padding:'4px',borderRadius:'12px',border:'1px solid #e5e7eb',width:'fit-content',flexWrap:'wrap'}}>
          {[['overview','Overview'],['districts','Districts'],['departments','Departments'],['sla','SLA Performance'],['activity','Recent Activity']].map(([id,label]) => (
            <button key={id} onClick={()=>setActiveTab(id)}
              style={{padding:'8px 16px',borderRadius:'9px',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',fontWeight:'600',whiteSpace:'nowrap',
                background:activeTab===id?'#0f2d5e':'transparent',color:activeTab===id?'#f0a500':'#888'}}>
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'20px'}}>Resolution Rate</div>
              <div style={{display:'flex',alignItems:'center',gap:'24px'}}>
                <div style={{position:'relative',width:'120px',height:'120px',flexShrink:0}}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f0f0f0" strokeWidth="12"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#16a34a" strokeWidth="12"
                      strokeDasharray={`${resolutionRate*3.14} 314`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
                  </svg>
                  <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
                    <div style={{fontSize:'22px',fontWeight:'700',color:'#0f2d5e'}}>{resolutionRate}%</div>
                    <div style={{fontSize:'10px',color:'#888'}}>resolved</div>
                  </div>
                </div>
                <div style={{flex:1}}>
                  {[{l:'Resolved',v:t.resolved,c:'#16a34a'},{l:'In Progress',v:t.in_progress,c:'#d97706'},{l:'Pending',v:t.pending,c:'#0369a1'},{l:'Overdue',v:t.overdue,c:'#dc2626'}].map((s,i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <div style={{width:'10px',height:'10px',borderRadius:'50%',background:s.c}}/>
                        <span style={{fontSize:'13px',color:'#555'}}>{s.l}</span>
                      </div>
                      <span style={{fontSize:'13px',fontWeight:'700',color:s.c}}>{s.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'16px'}}>🔥 Top Community Issues</div>
              {data.topIssues.length === 0
                ? <div style={{color:'#aaa',fontSize:'13px',textAlign:'center',padding:'20px'}}>No upvoted issues yet</div>
                : data.topIssues.map((issue,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'10px',padding:'10px',background:'#f9fafb',borderRadius:'10px'}}>
                    <div style={{width:'36px',height:'36px',borderRadius:'8px',background:'#fff7ed',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',color:'#ea580c',fontSize:'14px',flexShrink:0}}>
                      {issue.upvote_count}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:'13px',fontWeight:'600',color:'#0f2d5e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{issue.title}</div>
                      <div style={{fontSize:'11px',color:'#888'}}>{issue.district} · {issue.department}</div>
                    </div>
                    <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 8px',borderRadius:'20px',flexShrink:0,textTransform:'capitalize',
                      background:issue.status==='resolved'?'#dcfce7':'#fef9c3',color:issue.status==='resolved'?'#166534':'#854d0e'}}>
                      {issue.status}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {/* DISTRICTS */}
        {activeTab === 'districts' && (
          <div style={{background:'white',borderRadius:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e'}}>District-wise Performance</div>
              <div style={{fontSize:'12px',color:'#888'}}>26 districts · sorted by volume</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9fafb'}}>
                    {['District','Total','Resolved','Overdue','Emergency','Resolution %'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',fontWeight:'600',color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.byDistrict.map((d,i) => (
                    <tr key={i} style={{borderTop:'1px solid #f0f0f0',background:safeNum(d.overdue)>0?'#fff9f9':'white'}}>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{fontWeight:'600',fontSize:'13px',color:'#0f2d5e'}}>{d.district}</div>
                        <div style={{fontSize:'11px',color:'#aaa'}}>{d.district_code}</div>
                      </td>
                      <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:'700',color:'#0f2d5e'}}>{d.total}</td>
                      <td style={{padding:'12px 16px',fontSize:'13px',color:'#16a34a',fontWeight:'600'}}>{d.resolved}</td>
                      <td style={{padding:'12px 16px'}}>
                        {safeNum(d.overdue)>0
                          ? <span style={{background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>⚠ {d.overdue}</span>
                          : <span style={{color:'#ccc'}}>—</span>}
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        {safeNum(d.emergency)>0
                          ? <span style={{background:'#ffedd5',color:'#9a3412',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>🚨 {d.emergency}</span>
                          : <span style={{color:'#ccc'}}>—</span>}
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <div style={{flex:1,height:'6px',background:'#f0f0f0',borderRadius:'3px',minWidth:'60px'}}>
                            <div style={{height:'100%',borderRadius:'3px',width:`${Math.min(parseFloat(d.resolution_pct)||0,100)}%`,
                              background:parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626'}}/>
                          </div>
                          <span style={{fontSize:'12px',fontWeight:'600',minWidth:'36px',
                            color:parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626'}}>
                            {d.resolution_pct||0}%
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

        {/* DEPARTMENTS */}
        {activeTab === 'departments' && (
          <div style={{background:'white',borderRadius:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e'}}>Department Performance</div>
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9fafb'}}>
                    {['Department','SLA Days','Total','Resolved','Overdue','Resolution %'].map(h => (
                      <th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'11px',fontWeight:'600',color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{h}</th>
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
                      <td style={{padding:'12px 16px',fontSize:'14px',fontWeight:'700',color:'#0f2d5e'}}>{d.total}</td>
                      <td style={{padding:'12px 16px',fontSize:'13px',color:'#16a34a',fontWeight:'600'}}>{d.resolved}</td>
                      <td style={{padding:'12px 16px'}}>
                        {safeNum(d.overdue)>0
                          ? <span style={{background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>⚠ {d.overdue}</span>
                          : <span style={{color:'#ccc'}}>—</span>}
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                          <div style={{flex:1,height:'6px',background:'#f0f0f0',borderRadius:'3px',minWidth:'60px'}}>
                            <div style={{height:'100%',borderRadius:'3px',width:`${Math.min(parseFloat(d.resolution_pct)||0,100)}%`,
                              background:parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626'}}/>
                          </div>
                          <span style={{fontSize:'12px',fontWeight:'600',minWidth:'36px',
                            color:parseFloat(d.resolution_pct)>=70?'#16a34a':parseFloat(d.resolution_pct)>=30?'#d97706':'#dc2626'}}>
                            {d.resolution_pct||0}%
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

        {/* SLA */}
        {activeTab === 'sla' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'16px'}}>SLA Breach by Department</div>
              {data.slaPerformance.length===0
                ? <div style={{color:'#aaa',fontSize:'13px',textAlign:'center',padding:'20px'}}>No SLA data yet</div>
                : data.slaPerformance.map((s,i) => (
                  <div key={i} style={{marginBottom:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                      <span style={{fontSize:'13px',fontWeight:'600',color:'#0f2d5e'}}>{s.department}</span>
                      <span style={{fontSize:'13px',fontWeight:'600',color:parseFloat(s.breach_pct)>50?'#dc2626':parseFloat(s.breach_pct)>20?'#d97706':'#16a34a'}}>
                        {s.breach_pct||0}%
                      </span>
                    </div>
                    <div style={{height:'8px',background:'#f0f0f0',borderRadius:'4px'}}>
                      <div style={{height:'100%',borderRadius:'4px',width:`${Math.min(parseFloat(s.breach_pct)||0,100)}%`,
                        background:parseFloat(s.breach_pct)>50?'#dc2626':parseFloat(s.breach_pct)>20?'#d97706':'#16a34a'}}/>
                    </div>
                    <div style={{fontSize:'11px',color:'#aaa',marginTop:'3px'}}>{s.breached} of {s.total} breached · SLA: {s.sla_days}d</div>
                  </div>
                ))
              }
            </div>
            <div style={{background:'white',borderRadius:'16px',padding:'24px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e',marginBottom:'16px'}}>SLA Health Summary</div>
              {[
                {label:'On Track',val:total-overdue,color:'#16a34a',bg:'#dcfce7',icon:'✓'},
                {label:'SLA Breached',val:t.overdue,color:'#dc2626',bg:'#fee2e2',icon:'⚠'},
                {label:'Emergency Priority',val:t.emergency,color:'#9a3412',bg:'#ffedd5',icon:'🚨'},
              ].map((s,i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:'16px',background:s.bg,borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                  <div style={{fontSize:'24px'}}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:'28px',fontWeight:'700',color:s.color}}>{s.val}</div>
                    <div style={{fontSize:'13px',color:s.color,opacity:0.8}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab === 'activity' && (
          <div style={{background:'white',borderRadius:'16px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
            <div style={{padding:'20px 24px',borderBottom:'1px solid #f0f0f0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontWeight:'700',fontSize:'15px',color:'#0f2d5e'}}>Recent Complaints</div>
              <div style={{fontSize:'12px',color:'#888'}}>Latest 10</div>
            </div>
            {data.recentActivity.map((c,i) => (
              <div key={i} style={{padding:'14px 24px',borderTop:i>0?'1px solid #f0f0f0':'none',display:'flex',alignItems:'center',gap:'12px'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:'600',fontSize:'13px',color:'#0f2d5e',marginBottom:'2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</div>
                  <div style={{fontSize:'11px',color:'#888'}}>{c.complaint_no} · {c.district} · {c.department}</div>
                </div>
                <div style={{display:'flex',gap:'6px',alignItems:'center',flexShrink:0}}>
                  {c.is_overdue && <span style={{background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'600'}}>Overdue</span>}
                  {c.priority==='emergency' && <span style={{background:'#ffedd5',color:'#9a3412',padding:'2px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'600'}}>Emergency</span>}
                  <span style={{fontSize:'10px',fontWeight:'600',padding:'2px 10px',borderRadius:'20px',textTransform:'capitalize',
                    background:c.status==='resolved'?'#dcfce7':c.status==='in_progress'?'#f3e8ff':'#fef9c3',
                    color:c.status==='resolved'?'#166534':c.status==='in_progress'?'#6b21a8':'#854d0e'}}>
                    {c.status.replace('_',' ')}
                  </span>
                  <span style={{fontSize:'11px',color:'#aaa',whiteSpace:'nowrap'}}>{fmtTime(c.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{textAlign:'center',padding:'24px 0 8px',fontSize:'12px',color:'#aaa'}}>
          Vaani · వాణి · AP Citizen Grievance Portal · CM Analytics
        </div>
      </div>
    </div>
  );
}
