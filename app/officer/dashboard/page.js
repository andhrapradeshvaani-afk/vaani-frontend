'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API = 'http://localhost:3001';

export default function OfficerDashboard() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState({ status: '', priority: '' });
  const [officerName, setOfficerName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('officer_token');
    const name  = localStorage.getItem('officer_name');
    if (!token) { router.push('/officer/login'); return; }
    setOfficerName(name || 'Officer');
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    setLoading(true);
    try {
      const [compRes, statRes] = await Promise.all([
        fetch(`${API}/api/officer/complaints`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/officer/dashboard`,  { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const compData = await compRes.json();
      const statData = await statRes.json();
      if (compRes.status === 401) { router.push('/officer/login'); return; }
      setComplaints(Array.isArray(compData) ? compData : []);
      setStats(statData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('officer_token');
    localStorage.removeItem('officer_name');
    localStorage.removeItem('officer_role');
    router.push('/officer/login');
  };

  const filtered = complaints.filter(c => {
    if (filter.status   && c.status   !== filter.status)   return false;
    if (filter.priority && c.priority !== filter.priority) return false;
    return true;
  });

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  const priorityColor = { normal:'#2563eb', urgent:'#d97706', emergency:'#dc2626' };
  const statusColor   = { submitted:'#0369a1', acknowledged:'#7c3aed', assigned:'#0369a1', in_progress:'#2563eb', resolved:'#16a34a', closed:'#16a34a', rejected:'#dc2626' };

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>

      {/* Officer Nav */}
      <nav style={{background:'var(--ap-navy)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'60px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--ap-gold)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px',color:'var(--ap-navy)'}}>V</div>
          <div>
            <div style={{color:'white',fontWeight:'600',fontSize:'14px'}}>Vaani Officer Portal</div>
            <div style={{color:'rgba(255,255,255,0.6)',fontSize:'11px'}}>Welcome, {officerName}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <Link href="/" style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',textDecoration:'none'}}>← Public portal</Link>
          <button onClick={logout} style={{background:'rgba(255,255,255,0.1)',border:'none',color:'white',padding:'6px 14px',borderRadius:'8px',fontSize:'12px',cursor:'pointer',fontFamily:'inherit'}}>
            Logout
          </button>
        </div>
      </nav>

      <div className="page">

        {/* Stats */}
        {stats && (
          <div className="stats-grid" style={{marginBottom:'28px'}}>
            {[
              { n: stats.new_complaints, l: 'New complaints',  color: '#0369a1' },
              { n: stats.in_progress,   l: 'In progress',     color: '#2563eb' },
              { n: stats.resolved,      l: 'Resolved',        color: '#16a34a' },
              { n: stats.overdue,       l: 'Overdue — act now', color: '#dc2626' },
            ].map((s,i) => (
              <div className="stat-card" key={i} style={{borderTop:`3px solid ${s.color}`}}>
                <div className="stat-num" style={{color:s.color}}>{s.n || 0}</div>
                <div className="stat-lbl">{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{display:'flex',gap:'10px',marginBottom:'16px',flexWrap:'wrap',alignItems:'center'}}>
          <div style={{fontSize:'14px',fontWeight:'600',color:'var(--text-1)'}}>
            {filtered.length} complaints
          </div>
          <div style={{marginLeft:'auto',display:'flex',gap:'8px'}}>
            <select className="form-select" style={{width:'140px',padding:'7px 10px'}}
              value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))}>
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="form-select" style={{width:'130px',padding:'7px 10px'}}
              value={filter.priority} onChange={e=>setFilter(f=>({...f,priority:e.target.value}))}>
              <option value="">All priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
            <button className="btn-secondary" style={{padding:'7px 14px',fontSize:'13px'}}
              onClick={() => fetchData(localStorage.getItem('officer_token'))}>
              Refresh
            </button>
          </div>
        </div>

        {/* Complaint list */}
        {loading && (
          <div style={{textAlign:'center',padding:'60px',color:'var(--text-3)'}}>Loading complaints...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="card" style={{textAlign:'center',padding:'48px',color:'var(--text-3)'}}>
            No complaints found. Try changing the filters.
          </div>
        )}

        {!loading && filtered.map(c => (
          <Link href={`/officer/complaints/${c.id}`} key={c.id} style={{textDecoration:'none'}}>
            <div className="card" style={{marginBottom:'10px',cursor:'pointer',borderLeft:`4px solid ${priorityColor[c.priority] || '#888'}`,transition:'box-shadow 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 20px rgba(15,45,94,0.12)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow)'}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'12px'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'15px',fontWeight:'600',color:'var(--text-1)'}}>{c.title}</span>
                    {c.is_overdue && (
                      <span style={{fontSize:'10px',background:'#fee2e2',color:'#991b1b',padding:'2px 8px',borderRadius:'10px',fontWeight:'600'}}>OVERDUE</span>
                    )}
                  </div>
                  <div style={{fontSize:'13px',color:'var(--text-2)',marginBottom:'6px'}}>
                    {c.department} · {c.district}
                    {c.citizen_name && !c.is_anonymous && ` · ${c.citizen_name}`}
                  </div>
                  <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'11px',fontWeight:'600',color:'var(--text-3)',letterSpacing:'0.04em'}}>{c.complaint_no}</span>
                    <span style={{fontSize:'11px',color:'var(--text-3)'}}>Filed {fmt(c.created_at)}</span>
                    <span style={{fontSize:'11px',color: c.is_overdue ? '#dc2626' : 'var(--text-3)'}}>
                      SLA: {fmt(c.sla_deadline)}
                    </span>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px',flexShrink:0}}>
                  <span style={{
                    fontSize:'11px',fontWeight:'600',padding:'3px 10px',borderRadius:'20px',
                    background: `${statusColor[c.status]}18`,
                    color: statusColor[c.status],
                    textTransform:'capitalize',
                  }}>{c.status.replace('_',' ')}</span>
                  <span style={{
                    fontSize:'11px',fontWeight:'600',padding:'2px 8px',borderRadius:'10px',
                    background: `${priorityColor[c.priority]}15`,
                    color: priorityColor[c.priority],
                    textTransform:'capitalize',
                  }}>{c.priority}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
