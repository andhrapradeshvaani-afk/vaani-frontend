'use client';
import { useState, useEffect } from 'react';
import Nav from '../components/Nav';

const API = 'https://vaani-backend-w3zz.onrender.com';

export default function FilePage() {
  const [lang, setLang]           = useState('en');
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals]     = useState([]);
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(null);
  const [error, setError]         = useState(null);

  const [form, setForm] = useState({
    name: '', phone: '', district_id: '', mandal_id: '',
    village: '', department_id: '', priority: 'normal',
    title: '', description: '', lang_pref: 'te',
  });

  useEffect(() => {
    fetch(`${API}/api/districts`).then(r=>r.json()).then(setDistricts);
    fetch(`${API}/api/departments`).then(r=>r.json()).then(setDepts);
  }, []);

  useEffect(() => {
    if (form.district_id) {
      fetch(`${API}/api/districts/${form.district_id}/mandals`)
        .then(r=>r.json()).then(setMandals);
    }
  }, [form.district_id]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setSuccess(null);

    try {
      // Register/login citizen first
      const regRes = await fetch(`${API}/api/citizens/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, phone: form.phone,
          district_id: form.district_id,
          mandal_id: form.mandal_id || null,
          village: form.village,
          lang_pref: form.lang_pref,
        })
      });

      let token;
      if (regRes.status === 409) {
        // Already registered — login
        const loginRes = await fetch(`${API}/api/citizens/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: form.phone })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
      } else {
        const regData = await regRes.json();
        token = regData.token;
      }

      if (!token) throw new Error('Could not authenticate. Please check your phone number.');

      // File complaint
      const fd = new FormData();
      fd.append('department_id', form.department_id);
      fd.append('district_id',   form.district_id);
      if (form.mandal_id) fd.append('mandal_id', form.mandal_id);
      fd.append('village',       form.village);
      fd.append('title',         form.title);
      fd.append('description',   form.description);
      fd.append('priority',      form.priority);
      fd.append('source',        'web');

      const compRes = await fetch(`${API}/api/complaints`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await compRes.json();
      if (!compRes.ok) throw new Error(data.error || 'Failed to file complaint');

      setSuccess(data);
      setForm({ name:'',phone:'',district_id:'',mandal_id:'',village:'',department_id:'',priority:'normal',title:'',description:'',lang_pref:'te' });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const te = lang === 'te';

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'680px'}}>
        <div className="page-title">{te ? 'ఫిర్యాదు నమోదు చేయండి' : 'File a Complaint'}</div>
        <div className="page-sub">{te ? 'మీ వివరాలు మరియు సమస్యను నమోదు చేయండి' : 'Fill in your details and describe the issue clearly'}</div>

        {success && (
          <div className="alert alert-success">
            <strong>{te ? 'ఫిర్యాదు నమోదైంది!' : 'Complaint filed successfully!'}</strong>
            <br/>
            {te ? 'మీ ఫిర్యాదు ID: ' : 'Your complaint ID: '}
            <strong style={{fontSize:'16px'}}>{success.complaint_no}</strong>
            <br/>
            <span style={{fontSize:'13px'}}>{te ? 'ఈ IDని సేవ్ చేసుకోండి — దీన్ని ట్రాక్ చేయడానికి ఉపయోగించండి.' : 'Save this ID to track your complaint status.'}</span>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit} className="card">

          <div style={{marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-2)',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.04em'}}>
              {te ? 'మీ వివరాలు' : 'Your details'}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{te ? 'పేరు' : 'Full name'} *</label>
                <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder={te?'మీ పేరు':'Your name'} required />
              </div>
              <div className="form-group">
                <label className="form-label">{te ? 'మొబైల్ నంబర్' : 'Mobile number'} *</label>
                <input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="9876543210" pattern="[0-9]{10}" required />
              </div>
            </div>
          </div>

          <div style={{marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid var(--border)'}}>
            <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-2)',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.04em'}}>
              {te ? 'స్థానం' : 'Location'}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{te ? 'జిల్లా' : 'District'} *</label>
                <select className="form-select" value={form.district_id} onChange={e=>set('district_id',e.target.value)} required>
                  <option value="">{te ? 'జిల్లా ఎంచుకోండి' : 'Select district'}</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{te && d.name_te ? d.name_te : d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{te ? 'మండలం' : 'Mandal'}</label>
                <select className="form-select" value={form.mandal_id} onChange={e=>set('mandal_id',e.target.value)} disabled={!mandals.length}>
                  <option value="">{te ? 'మండలం ఎంచుకోండి' : 'Select mandal'}</option>
                  {mandals.map(m => (
                    <option key={m.id} value={m.id}>{te && m.name_te ? m.name_te : m.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{te ? 'గ్రామం / కాలనీ' : 'Village / Colony'}</label>
              <input className="form-input" value={form.village} onChange={e=>set('village',e.target.value)} placeholder={te?'మీ గ్రామం లేదా కాలనీ':'Your village or colony name'} />
            </div>
          </div>

          <div>
            <div style={{fontSize:'13px',fontWeight:'600',color:'var(--text-2)',marginBottom:'12px',textTransform:'uppercase',letterSpacing:'0.04em'}}>
              {te ? 'ఫిర్యాదు వివరాలు' : 'Complaint details'}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{te ? 'విభాగం' : 'Department'} *</label>
                <select className="form-select" value={form.department_id} onChange={e=>set('department_id',e.target.value)} required>
                  <option value="">{te ? 'విభాగం ఎంచుకోండి' : 'Select department'}</option>
                  {depts.map(d => (
                    <option key={d.id} value={d.id}>{te && d.name_te ? d.name_te : d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{te ? 'ప్రాధాన్యత' : 'Priority'}</label>
                <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                  <option value="normal">{te ? 'సాధారణ' : 'Normal'}</option>
                  <option value="urgent">{te ? 'అత్యవసర' : 'Urgent'}</option>
                  <option value="emergency">{te ? 'అత్యంత అత్యవసర' : 'Emergency'}</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{te ? 'ఫిర్యాదు శీర్షిక' : 'Complaint title'} *</label>
              <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)}
                placeholder={te?'సమస్యను సంక్షిప్తంగా వివరించండి':'Brief one-line description of the issue'} required />
            </div>
            <div className="form-group">
              <label className="form-label">{te ? 'పూర్తి వివరణ' : 'Full description'} *</label>
              <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)}
                placeholder={te?'సమస్య ఎక్కడ ఉంది, ఎంత కాలం నుండి ఉంది, ఎవరు ప్రభావితమయ్యారు...':'Where is the issue, how long has it existed, who is affected...'} required />
            </div>
            <div className="form-group">
              <label className="form-label">{te ? 'భాష ప్రాధాన్యత' : 'Language preference'}</label>
              <select className="form-select" value={form.lang_pref} onChange={e=>set('lang_pref',e.target.value)}>
                <option value="te">తెలుగు</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={loading} style={{marginTop:'8px'}}>
            {loading ? (te?'నమోదు అవుతోంది...':'Submitting...') : (te?'ఫిర్యాదు నమోదు చేయండి':'Submit Complaint')}
          </button>
        </form>
      </div>
    </>
  );
}
