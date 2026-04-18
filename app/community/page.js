'use client';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';

const API = 'https://vaani-backend-w3zz.onrender.com';

const STATUS_COLORS = {
  submitted: '#854d0e', acknowledged: '#1e40af', assigned: '#3730a3',
  in_progress: '#6b21a8', resolved: '#166534', rejected: '#991b1b',
};

const STATUS_BG = {
  submitted: '#fef9c3', acknowledged: '#dbeafe', assigned: '#e0e7ff',
  in_progress: '#f3e8ff', resolved: '#dcfce7', rejected: '#fee2e2',
};

export default function CommunityPage() {
  const [lang, setLang]           = useState('en');
  const [complaints, setComplaints] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [districtId, setDistrictId] = useState('');
  const [deptId, setDeptId]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [upvotePhone, setUpvotePhone] = useState('');
  const [upvoting, setUpvoting]   = useState(null);
  const [showInput, setShowInput] = useState(null);

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
      setComplaints(data);
    } catch {}
    setLoading(false);
  };

  const upvote = async (complaintNo) => {
    setUpvoting(complaintNo);
    try {
      const res = await fetch(`${API}/api/complaints/${complaintNo}/upvote`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (res.status === 409) {
        alert(te ? 'మీరు ఇప్పటికే వోట్ చేశారు' : 'You already supported this complaint');
      } else {
        setComplaints(prev => prev.map(c =>
          c.complaint_no === complaintNo ? { ...c, upvote_count: data.upvote_count } : c
        ));
        const newCount = data.upvote_count || 0;
        const citizenWord = newCount === 1 ? 'citizen' : 'citizens';
        alert(te ? `ధన్యవాదాలు! 🙏 మొత్తం మద్దతు: ${newCount}` : `Thank you! ${newCount} ${citizenWord} now support this.`);
      }
      setShowInput(null);
      setUpvotePhone('');
    } catch { alert('Failed. Please try again.'); }
    setUpvoting(null);
  };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'780px'}}>

        {/* Header */}
        <div className="page-title">{te ? 'కమ్యూనిటీ సమస్యలు' : 'Community Issues'}</div>
        <div className="page-sub">
          {te
            ? 'మీ ప్రాంతంలోని సమస్యలను చూడండి మరియు మద్దతివ్వండి. అధిక మద్దతు ఉన్న ఫిర్యాదులు High Priority కి పెంచబడతాయి.'
            : 'Browse and support issues in your area. Complaints with 10+ supporters get escalated to High Priority automatically.'}
        </div>

        {/* Info banner */}
        <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'10px',padding:'12px 16px',marginBottom:'20px',fontSize:'13px',color:'#1e40af'}}>
          💡 {te
            ? 'రోడ్లు, నీరు, విద్యుత్, విద్య, పురపాలక సమస్యలు మాత్రమే ఇక్కడ కనిపిస్తాయి. వ్యక్తిగత ఫిర్యాదులు గోప్యంగా ఉంటాయి.'
            : 'Only infrastructure complaints (Roads, Water, Electricity, Education, Municipal) are shown here. Personal complaints remain private.'}
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:'10px',marginBottom:'20px',flexWrap:'wrap'}}>
          <select className="form-input" value={districtId} onChange={e=>setDistrictId(e.target.value)}
            style={{flex:1,minWidth:'180px'}}>
            <option value="">{te ? 'అన్ని జిల్లాలు' : 'All Districts'}</option>
            {districts.map(d => <option key={d.id} value={d.id}>{d.name}{d.name_te ? ` · ${d.name_te}` : ''}</option>)}
          </select>
          <select className="form-input" value={deptId} onChange={e=>setDeptId(e.target.value)}
            style={{flex:1,minWidth:'180px'}}>
            <option value="">{te ? 'అన్ని విభాగాలు' : 'All Departments'}</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn-secondary" onClick={fetchComplaints} style={{padding:'10px 20px'}}>
            {te ? 'రిఫ్రెష్' : 'Refresh'}
          </button>
        </div>

        {/* Complaints */}
        {loading ? (
          <div style={{textAlign:'center',padding:'40px',color:'var(--text-3)'}}>
            {te ? 'లోడ్ అవుతోంది...' : 'Loading...'}
          </div>
        ) : complaints.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:'40px'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>📭</div>
            <div style={{fontWeight:'600',color:'var(--text-1)'}}>
              {te ? 'ఈ ప్రాంతంలో ఫిర్యాదులు లేవు' : 'No complaints found in this area'}
            </div>
            <div style={{fontSize:'13px',color:'var(--text-3)',marginTop:'4px'}}>
              {te ? 'ఫిల్టర్లు మార్చి మళ్ళీ చూడండి' : 'Try changing the filters above'}
            </div>
          </div>
        ) : (
          <div>
            <div style={{fontSize:'13px',color:'var(--text-3)',marginBottom:'12px'}}>
              {complaints.length} {te ? 'ఫిర్యాదులు కనుగొనబడ్డాయి' : 'complaints found'} · {te ? 'మద్దతు ప్రకారం క్రమీకరించబడింది' : 'sorted by support'}
            </div>
            {complaints.map((c, i) => (
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
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'6px'}}>
                    <span style={{
                      background: STATUS_BG[c.status] || '#f3f4f6',
                      color: STATUS_COLORS[c.status] || '#374151',
                      padding:'3px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600',
                      textTransform:'capitalize',whiteSpace:'nowrap'
                    }}>{c.status.replace('_',' ')}</span>
                    {c.priority === 'emergency' && (
                      <span style={{background:'#fee2e2',color:'#991b1b',padding:'3px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'600'}}>
                        🚨 Emergency
                      </span>
                    )}
                    {c.priority === 'high' && (
                      <span style={{background:'#ffedd5',color:'#9a3412',padding:'3px 8px',borderRadius:'20px',fontSize:'10px',fontWeight:'600'}}>
                        ⚡ High Priority
                      </span>
                    )}
                  </div>
                </div>

                {/* Upvote row */}
                <div style={{borderTop:'1px solid var(--border)',paddingTop:'10px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'8px'}}>
                  <div>
                    <span style={{fontWeight:'700',fontSize:'18px',color:'var(--ap-navy)'}}>{c.upvote_count || 0}</span>
                    <span style={{fontSize:'12px',color:'var(--text-3)',marginLeft:'6px'}}>
                      {te ? 'నాగరికులు మద్దతిచ్చారు' : 'citizens supported'}
                    </span>
                    {(c.upvote_count || 0) >= 10 && (
                      <span style={{marginLeft:'8px',fontSize:'12px',color:'#ea580c'}}>🔥 {te ? 'కమ్యూనిటీ సమస్య' : 'Community issue'}</span>
                    )}
                  </div>

                  <button onClick={()=>upvote(c.complaint_no)} disabled={upvoting === c.complaint_no}
                    style={{padding:'6px 16px',background:'var(--ap-navy)',color:'white',
                      border:'none',borderRadius:'8px',fontWeight:'600',fontSize:'13px',
                      cursor:'pointer',fontFamily:'inherit'}}>
                    {upvoting === c.complaint_no ? '...' : `👆 ${te ? 'నాకూ ఇదే సమస్య' : 'I have this issue too'}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
