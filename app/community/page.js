'use client';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';

const API = 'https://vaani-backend-w3zz.onrender.com';

const STATUS_COLORS = {
  submitted: { bg: '#fef9c3', text: '#854d0e' },
  acknowledged: { bg: '#dbeafe', text: '#1e40af' },
  assigned: { bg: '#e0e7ff', text: '#3730a3' },
  in_progress: { bg: '#f3e8ff', text: '#6b21a8' },
  resolved: { bg: '#dcfce7', text: '#166534' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

export default function CommunityPage() {
  const [lang, setLang]             = useState('te');
  const [complaints, setComplaints] = useState([]);
  const [districts, setDistricts]   = useState([]);
  const [departments, setDepartments] = useState([]);
  const [districtId, setDistrictId] = useState('');
  const [deptId, setDeptId]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [upvoting, setUpvoting]     = useState(null);
  const [upvoted, setUpvoted]       = useState(new Set());

  const te = lang === 'te';

  useEffect(() => {
    fetch(`${API}/api/districts`).then(r=>r.json()).then(setDistricts).catch(()=>{});
    fetch(`${API}/api/departments`).then(r=>r.json()).then(setDepartments).catch(()=>{});
  }, []);

  useEffect(() => { fetchComplaints(); }, [districtId, deptId]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/complaints/public?`;
      if (districtId) url += `district_id=${districtId}&`;
      if (deptId) url += `department_id=${deptId}&`;
      const res = await fetch(url);
      const data = await res.json();
      setComplaints(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  const upvote = async (complaintNo) => {
    setUpvoting(complaintNo);
    try {
      const res = await fetch(`${API}/api/complaints/${complaintNo}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.status === 409) {
        setUpvoted(prev => new Set([...prev, complaintNo]));
      } else {
        const newCount = data.upvote_count || 0;
        setComplaints(prev => prev.map(c =>
          c.complaint_no === complaintNo ? { ...c, upvote_count: newCount } : c
        ));
        setUpvoted(prev => new Set([...prev, complaintNo]));
      }
    } catch {}
    setUpvoting(null);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'780px'}}>

        <div className="page-title">{te ? 'కమ్యూనిటీ సమస్యలు' : 'Community Issues'}</div>
        <div className="page-sub">
          {te
            ? 'మీ ప్రాంతంలోని సమస్యలను చూడండి మరియు మద్దతివ్వండి.'
            : 'Browse and support issues in your area. Complaints with 10+ supporters get escalated to High Priority automatically.'}
        </div>

        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',fontSize:'13px',color:'#1e40af'}}>
          💡 {te
            ? 'రోడ్లు, నీరు, విద్యుత్, విద్య, పురపాలక సమస్యలు మాత్రమే ఇక్కడ కనిపిస్తాయి.'
            : 'Only infrastructure complaints (Roads, Water, Electricity, Education, Municipal) are shown here. Personal complaints remain private.'}
        </div>

        <div style={{display:'flex',gap:'10px',marginBottom:'20px',flexWrap:'wrap'}}>
          <select className="form-input" value={districtId} onChange={e=>setDistrictId(e.target.value)} style={{flex:1,minWidth:'180px'}}>
            <option value="">{te ? 'అన్ని జిల్లాలు' : 'All Districts'}</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}{d.name_te ? ` · ${d.name_te}` : ''}</option>)}
          </select>
          <select className="form-input" value={deptId} onChange={e=>setDeptId(e.target.value)} style={{flex:1,minWidth:'180px'}}>
            <option value="">{te ? 'అన్ని విభాగాలు' : 'All Departments'}</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn-secondary" onClick={fetchComplaints} style={{padding:'10px 20px'}}>
            {te ? 'రిఫ్రెష్' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--text-3)'}}>
            {te ? 'లోడ్ అవుతోంది...' : 'Loading...'}
          </div>
        ) : complaints.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'40px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
            <div style={{fontWeight:'600'}}>{te ? 'ఫిర్యాదులు లేవు' : 'No complaints found'}</div>
            <div style={{fontSize:'13px',color:'var(--text-3)',marginTop:'4px'}}>{te ? 'ఫిల్టర్లు మార్చి మళ్ళీ చూడండి' : 'Try changing the filters above'}</div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:'13px',color:'var(--text-3)',marginBottom:'12px'}}>
              {complaints.length} {te ? 'ఫిర్యాదులు' : 'complaints'} · {te ? 'మద్దతు ప్రకారం' : 'sorted by support'}
            </div>
            {complaints.map((c, i) => {
              const sc = STATUS_COLORS[c.status] || { bg: '#f3f4f6', text: '#374151' };
              const count = c.upvote_count || 0;
              const isUpvoted = upvoted.has(c.complaint_no);
              return (
                <div key={i} className="card" style={{marginBottom:'12px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'12px',marginBottom:'10px'}}>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'600',fontSize:'15px',marginBottom:'4px'}}>{c.title}</div>
                      <div style={{fontSize:'12px',color:'var(--ap-gold)',fontWeight:'600',marginBottom:'4px'}}>{c.complaint_no}</div>
                      <div style={{fontSize:'12px',color:'var(--text-3)'}}>
                        📍 {c.district}{c.mandal ? ` · ${c.mandal}` : ''} · {c.department}
                      </div>
                      <div style={{fontSize:'12px',color:'var(--text-3)',marginTop:'2px'}}>
                        📅 {fmt(c.created_at)}
                        {c.is_overdue && <span style={{color:'#ef4444',marginLeft:'8px'}}>⚠ Overdue</span>}
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px'}}>
                      <span style={{background:sc.bg,color:sc.text,padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600',textTransform:'capitalize',whiteSpace:'nowrap'}}>
                        {c.status.replace('_',' ')}
                      </span>
                      {c.priority === 'emergency' && <span style={{background:'#fee2e2',color:'#991b1b',padding:'3px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'600'}}>🚨 Emergency</span>}
                      {c.priority === 'high' && <span style={{background:'#ffedd5',color:'#9a3412',padding:'3px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'600'}}>⚡ High Priority</span>}
                    </div>
                  </div>

                  <div style={{borderTop:'1px solid var(--border)',paddingTop:'10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div>
                      <span style={{fontWeight:'700',fontSize:'18px',color:'var(--ap-navy)'}}>{count}</span>
                      <span style={{fontSize:'12px',color:'var(--text-3)',marginLeft:'6px'}}>
                        {count === 1 ? 'citizen' : 'citizens'} {te ? 'మద్దతిచ్చారు' : 'supported'}
                      </span>
                      {count >= 10 && <span style={{marginLeft:'8px',fontSize:'12px',color:'#ea580c'}}>🔥 {te ? 'కమ్యూనిటీ సమస్య' : 'Community issue'}</span>}
                    </div>

                    {isUpvoted ? (
                      <div style={{fontSize:'13px',color:'#16a34a',fontWeight:'600'}}>
                        ✓ {te ? 'మీరు మద్దతిచ్చారు' : 'You supported this'}
                      </div>
                    ) : (
                      <button
                        onClick={() => upvote(c.complaint_no)}
                        disabled={upvoting === c.complaint_no}
                        style={{padding:'6px 16px',background:'var(--ap-navy)',color:'white',border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'13px',cursor:'pointer',fontFamily:'inherit',opacity: upvoting === c.complaint_no ? 0.6 : 1}}
                      >
                        {upvoting === c.complaint_no ? '...' : `👆 ${te ? 'నాకూ ఇదే సమస్య' : 'I have this issue too'}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
