'use client';
import { useState, useEffect, useRef } from 'react';
import Nav from '../components/Nav';

const API = 'https://vaani-backend-w3zz.onrender.com';

const LOCATION_TYPES = [
  { en: 'Road / Street',        te: 'రోడ్డు / వీధి' },
  { en: 'Public building',      te: 'ప్రభుత్వ భవనం' },
  { en: 'Residential area',     te: 'నివాస ప్రాంతం' },
  { en: 'Agricultural land',    te: 'వ్యవసాయ భూమి' },
  { en: 'Other public place',   te: 'ఇతర ప్రజా స్థలం' },
];

const STEPS = {
  en: ['Problem location', 'Complaint details', 'Add evidence', 'Verify & submit'],
  te: ['సమస్య స్థానం', 'ఫిర్యాదు వివరాలు', 'సాక్ష్యం జోడించండి', 'ధృవీకరించి సమర్పించండి'],
};

export default function FilePage() {
  const [step, setStep]           = useState(1);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals]     = useState([]);
  const [depts, setDepts]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(null);
  const [error, setError]         = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [otpSent, setOtpSent]     = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef();

  const [lang, setLangState] = useState('te');
useEffect(() => {
  const sync = () => {
    const saved = localStorage.getItem('vaani_lang');
    if (saved) setLangState(saved);
  };
  sync(); // run on mount
  window.addEventListener('vaani_lang_change', sync);
  return () => window.removeEventListener('vaani_lang_change', sync);
}, []);
const setLang = (l) => {
  localStorage.setItem('vaani_lang', l);
  window.dispatchEvent(new Event('vaani_lang_change'));
  setLangState(l);
};

  const [form, setForm] = useState({
    district_id: '', mandal_id: '', village: '',
    location_type: '', latitude: '', longitude: '', address: '',
    department_id: '', problem_type_label: '', priority: 'normal', title: '', description: '',
    files: [],
    name: '', phone: '', otp: '', lang_pref: 'te',
  });

  const te = lang === 'te';
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch(`${API}/api/districts`).then(r => r.json()).then(setDistricts);
    fetch(`${API}/api/departments`).then(r => r.json()).then(setDepts);
  }, []);

  useEffect(() => {
    if (form.district_id) {
      fetch(`${API}/api/districts/${form.district_id}/mandals`)
        .then(r => r.json()).then(setMandals);
    }
  }, [form.district_id]);

  const detectGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        set('latitude', latitude.toFixed(6));
        set('longitude', longitude.toFixed(6));
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const addr = data.display_name || '';
          set('address', addr.split(',').slice(0, 3).join(',').trim());
        } catch { }
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        alert(te ? 'GPS అందుబాటులో లేదు. దయచేసి స్థానాన్ని చేతితో నమోదు చేయండి.' : 'GPS not available. Please enter location manually.');
      }
    );
  };

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const valid = selected.filter(f => f.size < 20 * 1024 * 1024);
    set('files', valid);
    setPreviewUrls(valid.map(f => ({ url: URL.createObjectURL(f), type: f.type, name: f.name })));
  };

  const sendOtp = async () => {
    if (!form.phone || form.phone.length !== 10) {
      setError(te ? 'చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి' : 'Enter a valid 10-digit mobile number');
      return;
    }
    setOtpLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpSent(true);
      if (data.dev_otp) alert(`Dev OTP: ${data.dev_otp}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    setOtpLoading(true); setError(null);
    try {
      const res = await fetch(`${API}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp: form.otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOtpVerified(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const submit = async () => {
    if (!otpVerified) {
      setError(te ? 'దయచేసి మొదట మీ మొబైల్ నంబర్ను ధృవీకరించండి' : 'Please verify your mobile number first');
      return;
    }
    setLoading(true); setError(null);
    try {
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
        const loginRes = await fetch(`${API}/api/citizens/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: form.phone })
        });
        token = (await loginRes.json()).token;
      } else {
        token = (await regRes.json()).token;
      }
      if (!token) throw new Error('Authentication failed');

      const fd = new FormData();
      fd.append('department_id', form.department_id);
      fd.append('district_id',   form.district_id);
      if (form.mandal_id) fd.append('mandal_id', form.mandal_id);
      fd.append('village',       form.village);
      fd.append('title',         form.title);
      fd.append('description',   form.description);
      fd.append('priority',      form.priority);
      fd.append('source',        'web');
      if (form.latitude)  fd.append('latitude',  form.latitude);
      if (form.longitude) fd.append('longitude', form.longitude);
      if (form.address)   fd.append('address',   form.address);
      form.files.forEach(f => fd.append('attachments', f));

      const compRes = await fetch(`${API}/api/complaints`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await compRes.json();
      if (!compRes.ok) throw new Error(data.error || 'Failed to file complaint');
      setSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.district_id && form.village.trim();
    if (step === 2) return form.department_id && form.title.trim() && form.description.trim();
    if (step === 3) return true;
    if (step === 4) return form.name.trim() && form.phone.length === 10;
    return false;
  };

  const StepBar = () => (
    <div style={{display:'flex',gap:'0',marginBottom:'28px'}}>
      {STEPS[lang].map((s, i) => (
        <div key={i} style={{flex:1,position:'relative'}}>
          <div style={{height:'4px',background:i<step?'var(--ap-navy)':'var(--border)',borderRadius:i===0?'2px 0 0 2px':i===3?'0 2px 2px 0':'0'}}/>
          <div style={{width:'20px',height:'20px',borderRadius:'50%',background:i<step?'var(--ap-navy)':i===step-1?'var(--ap-gold)':'#94a3b8',position:'absolute',top:'-8px',left:'50%',transform:'translateX(-50%)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'700',color:i<step?'white':i===step-1?'var(--ap-navy)':'var(--text-3)',border:'2px solid white'}}>{i<step-1?'✓':i+1}</div>
          <div style={{fontSize:'10px',color:i===step-1?'var(--ap-navy)':'#64748b',textAlign:'center',marginTop:'14px',fontWeight:i===step-1?'600':'400'}}>{s}</div>
        </div>
      ))}
    </div>
  );

  if (success) return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'600px',textAlign:'center',paddingTop:'60px'}}>
        <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:'28px'}}>✓</div>
        <div style={{fontSize:'22px',fontWeight:'700',marginBottom:'8px',color:'var(--ap-navy)'}}>{te?'ఫిర్యాదు నమోదైంది!':'Complaint filed successfully!'}</div>
        <div style={{fontSize:'14px',color:'var(--text-2)',marginBottom:'24px'}}>{te?'మీ ఫిర్యాదు ID సేవ్ చేసుకోండి':'Save your complaint ID to track progress'}</div>
        <div style={{background:'var(--ap-navy)',color:'white',padding:'20px',borderRadius:'var(--radius)',marginBottom:'24px'}}>
          <div style={{fontSize:'12px',opacity:0.7,marginBottom:'4px'}}>{te?'ఫిర్యాదు ID':'Complaint ID'}</div>
          <div style={{fontSize:'24px',fontWeight:'700',letterSpacing:'0.05em'}}>{success.complaint_no}</div>
          <div style={{fontSize:'12px',opacity:0.7,marginTop:'8px'}}>{te?'SLA గడువు:':'SLA deadline:'} {new Date(success.sla_deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
        </div>
        <div style={{display:'flex',gap:'12px',justifyContent:'center'}}>
          <a href={`/track?id=${success.complaint_no}`}><button className="btn-primary" style={{width:'auto',padding:'10px 24px'}}>{te?'ట్రాక్ చేయండి':'Track complaint'}</button></a>
         <a href={`https://wa.me/?text=${encodeURIComponent(te
            ? `నేను వాణి ద్వారా ఫిర్యాదు నమోదు చేశాను!\n\nఫిర్యాదు ID: ${success.complaint_no}\n\n👆 మీకూ ఇదే సమస్య ఉంటే మద్దతివ్వండి:\nvaani-ecru.vercel.app/community\n\n📝 మీ ఫిర్యాదు నమోదు చేయండి (ఆధార్ అవసరం లేదు):\nvaani-ecru.vercel.app`
            : `I filed a complaint on Vaani — AP's citizen grievance platform.\n\nComplaint ID: ${success.complaint_no}\n\n👆 Have the same issue? Support this complaint:\nvaani-ecru.vercel.app/community\n\n📝 File your own complaint (free, no Aadhaar needed):\nvaani-ecru.vercel.app`
          )}`} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><button style={{background:'#25D366',color:'white',border:'none',padding:'10px 24px',borderRadius:'10px',fontWeight:'600',fontSize:'14px',cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'16px'}}>📲</span>{te ? 'WhatsApp లో షేర్ చేయండి' : 'Share on WhatsApp'}</button></a>
          <button className="btn-secondary" onClick={()=>{setSuccess(null);setStep(1);setOtpSent(false);setOtpVerified(false);setPreviewUrls([]);setForm({district_id:'',mandal_id:'',village:'',location_type:'',latitude:'',longitude:'',address:'',department_id:'',problem_type_label:'',priority:'normal',title:'',description:'',files:[],name:'',phone:'',otp:'',lang_pref:'te'});}}>{te?'మరొక ఫిర్యాదు':'File another'}</button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Nav lang={lang} setLang={setLang} />
      <div className="page" style={{maxWidth:'680px'}}>
        <div className="page-title">{te?'ఫిర్యాదు నమోదు చేయండి':'File a Complaint'}</div>
        <div className="page-sub" style={{marginBottom:'24px'}}>{te?'దశ దశగా మీ సమస్యను నమోదు చేయండి':'Step by step — takes less than 3 minutes'}</div>
        <StepBar />
        {error && <div className="alert alert-error" style={{marginBottom:'16px'}}>{error}</div>}
        <div className="card">

          {step === 1 && (
            <div>
              <div style={{background:'#fff8e1',border:'1px solid #f0a500',borderRadius:'8px',padding:'10px 14px',marginBottom:'20px',fontSize:'13px',color:'#7a5200'}}>
                {te?'📍 సమస్య ఉన్న స్థలాన్ని తెలపండి — మీ ఇంటి చిరునామా కాదు':'📍 Tell us where the problem is — not your home address'}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{te?'జిల్లా':'District'} *</label>
                  <select className="form-select" value={form.district_id} onChange={e=>{set('district_id',e.target.value);set('mandal_id','');}}>
                    <option value="">{te?'జిల్లా ఎంచుకోండి':'Select district'}</option>
                    {districts.map(d=><option key={d.id} value={d.id}>{te&&d.name_te?d.name_te:d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{te?'మండలం':'Mandal'}</label>
                  <select className="form-select" value={form.mandal_id} onChange={e=>set('mandal_id',e.target.value)} disabled={!mandals.length}>
                    <option value="">{te?'మండలం ఎంచుకోండి':'Select mandal'}</option>
                    {mandals.map(m=><option key={m.id} value={m.id}>{te&&m.name_te?m.name_te:m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{te?'సమస్య దగ్గర గ్రామం / వీధి / ల్యాండ్‌మార్క్':'Village / Street / Landmark near the problem'} *</label>
                <input className="form-input" value={form.village} onChange={e=>set('village',e.target.value)}
                  placeholder={te?'ఉదా: మెయిన్ రోడ్, బస్ స్టాండ్ దగ్గర':'e.g. Main road near bus stand, Ward 4'} />
              </div>
              <div className="form-group">
                <label className="form-label">{te?'సమస్య రకం (ఐచ్ఛికం)':'Type of location (optional)'}</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
                  {LOCATION_TYPES.map((lt,i)=>(
                    <button key={i} type="button" onClick={()=>set('location_type',lt.en)}
                      style={{padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit',background:form.location_type===lt.en?'var(--ap-navy)':'var(--bg)',color:form.location_type===lt.en?'white':'var(--text-2)',border:form.location_type===lt.en?'none':'1px solid var(--border)'}}>
                      {te?lt.te:lt.en}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{te?'GPS స్థానం (ఐచ్ఛికం)':'GPS location (optional but helpful)'}</label>
                {form.latitude?(
                  <div style={{display:'flex',alignItems:'center',gap:'10px',background:'#f0fdf4',padding:'10px 14px',borderRadius:'8px',border:'1px solid #bbf7d0'}}>
                    <span style={{fontSize:'13px',color:'#166534'}}>📍 {form.latitude}, {form.longitude}</span>
                    {form.address&&<span style={{fontSize:'12px',color:'#166534',opacity:0.8}}>· {form.address}</span>}
                    <button type="button" onClick={()=>{set('latitude','');set('longitude','');set('address','');}} style={{marginLeft:'auto',fontSize:'11px',color:'#dc2626',background:'none',border:'none',cursor:'pointer'}}>{te?'తొలగించు':'Remove'}</button>
                  </div>
                ):(
                  <button type="button" onClick={detectGPS} disabled={gpsLoading}
                    style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 16px',borderRadius:'8px',border:'1.5px solid var(--ap-navy)',background:'var(--bg)',cursor:'pointer',fontFamily:'inherit',fontSize:'13px',color:'var(--text-2)',width:'100%',justifyContent:'center'}}>
                    {gpsLoading?(te?'వెతుకుతోంది...':'Detecting...'):(te?'📍 నా GPS స్థానాన్ని గుర్తించండి':'📍 Auto-detect my location')}
                  </button>
                )}
                <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'6px'}}>{te?'GPS సమస్య యొక్క ఖచ్చితమైన స్థానాన్ని అధికారులకు చూపిస్తుంది':'GPS helps officers find the exact problem location on the map'}</div>
              </div>
            </div>
          )}
            {step === 2 && (
            <div>
              {/* Smart Problem Type Picker */}
              <div className="form-group">
                <label className="form-label">{te ? 'సమస్య రకం ఏమిటి?' : 'What type of problem is this?'} *</label>
                <div style={{fontSize:'12px', color:'var(--text-3)', marginBottom:'12px'}}>
                  {te ? 'మీ సమస్యకు దగ్గరగా ఉన్నదాన్ని ఎంచుకోండి — మేము సరైన అధికారికి పంపుతాము' : "Pick what best describes your issue — we'll route it to the right department automatically"}
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'10px', marginBottom:'16px'}}>
                  {[
                    { id: 1, icon: '🕳️', en: 'Road / Pothole / Bridge', te: 'రోడ్డు / గుంత / వంతెన' },
                    { id: 2, icon: '💧', en: 'Water Supply / Tap Water', te: 'నీటి సరఫరా / కుళాయి' },
                    { id: 3, icon: '⚡', en: 'Electricity / Power Cut', te: 'విద్యుత్ / కరెంట్ కోత' },
                    { id: 3, icon: '🌆', en: 'Street Lights Not Working', te: 'వీధి దీపాలు పని చేయడం లేదు' },
                    { id: 6, icon: '🗑️', en: 'Garbage / Drainage / Sewage', te: 'చెత్త / డ్రైనేజీ / మురుగు' },
                    { id: 5, icon: '🏫', en: 'School / Teachers / Meals', te: 'పాఠశాల / ఉపాధ్యాయులు / భోజనం' },
                    { id: 4, icon: '🏥', en: 'Hospital / Doctor / Medicine', te: 'ఆసుపత్రి / డాక్టర్ / మందులు' },
                    { id: 8, icon: '🌾', en: 'Agriculture / Irrigation / Crop', te: 'వ్యవసాయం / సాగునీరు / పంట' },
                    { id: 7, icon: '📋', en: 'Land / Patta / Survey', te: 'భూమి / పట్టా / సర్వే' },
                    { id: 6, icon: '🏗️', en: 'Public Building / Park / Toilet', te: 'ప్రభుత్వ భవనం / పార్కు / మరుగుదొడ్డి' },
                  ].map((pt, i) => {
                    const isSelected = form.department_id == pt.id && form.problem_type_label === (te ? pt.te : pt.en);
                    return (
                      <button key={i} type="button"
                        onClick={() => { set('department_id', pt.id); set('problem_type_label', te ? pt.te : pt.en); }}
                        style={{
                          padding: '12px 10px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--ap-navy)' : '1.5px solid var(--border)',
                          background: isSelected ? 'var(--ap-navy)' : 'var(--bg)',
                          color: isSelected ? 'white' : 'var(--text-1)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textAlign: 'center',
                          transition: 'all 0.15s',
                        }}>
                        <div style={{fontSize:'24px', marginBottom:'6px'}}>{pt.icon}</div>
                        <div style={{fontSize:'11px', fontWeight:'600', lineHeight:'1.3'}}>
                          {te ? pt.te : pt.en}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {form.department_id && (
                  <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'8px', padding:'8px 14px', fontSize:'12px', color:'#166534', marginBottom:'8px'}}>
                    ✓ {te ? 'మేము మీ ఫిర్యాదును సరైన విభాగానికి పంపుతాము' : "We'll route this to the right department automatically"}
                  </div>
                )}
              </div>

              {/* Urgency */}
              <div className="form-group">
                <label className="form-label">{te?'ఎంత అత్యవసరం?':'How urgent is this?'}</label>
                <select className="form-select" value={form.priority} onChange={e=>set('priority',e.target.value)}>
                  <option value="normal">{te?'సాధారణ — వేచి ఉండగలను':'Normal — can wait'}</option>
                  <option value="urgent">{te?'అత్యవసర — వేగంగా అవసరం':'Urgent — needed soon'}</option>
                  <option value="emergency">{te?'అత్యంత అత్యవసర — ప్రమాదకరం':'Emergency — safety risk'}</option>
                </select>
              </div>

              {/* Problem title */}
              <div className="form-group">
                <label className="form-label">{te?'సమస్య ఏమిటి?':'What is the problem?'} *</label>
                <input className="form-input" value={form.title} onChange={e=>set('title',e.target.value)}
                  placeholder={te?'ఉదా: బస్ స్టాండ్ దగ్గర రోడ్డుకు పెద్ద గుంత ఉంది':'e.g. Large pothole near bus stand causing accidents'} />
                <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'4px'}}>{te?'సమస్యను ఒక వాక్యంలో వివరించండి':'One clear sentence describing the problem'}</div>
              </div>

              {/* Full details */}
              <div className="form-group">
                <label className="form-label">{te?'పూర్తి వివరాలు':'Full details'} *</label>
                <textarea className="form-textarea" value={form.description} onChange={e=>set('description',e.target.value)} style={{minHeight:'120px'}}
                  placeholder={te?'సమస్య ఎంత కాలం నుండి ఉంది? ఎవరు ప్రభావితమయ్యారు?':'How long has this existed? Who is affected? Any incidents caused by this?'} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div style={{fontSize:'14px',color:'var(--text-2)',marginBottom:'16px',lineHeight:'1.6'}}>
                {te?'ఫోటో లేదా వీడియో జోడించడం వల్ల మీ ఫిర్యాదు వేగంగా పరిష్కారమవుతుంది. అధికారులు సాక్ష్యాధారాలను విస్మరించలేరు.':'Adding a photo or video makes your complaint 3x more likely to be resolved quickly. Officers cannot ignore evidence.'}
              </div>
              <div onClick={()=>fileInputRef.current.click()}
                style={{border:'2px dashed var(--border)',borderRadius:'12px',padding:'40px 20px',textAlign:'center',cursor:'pointer',background:'var(--bg)',marginBottom:'16px'}}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{e.preventDefault();const files=Array.from(e.dataTransfer.files);set('files',files);setPreviewUrls(files.map(f=>({url:URL.createObjectURL(f),type:f.type,name:f.name})));}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>📸</div>
                <div style={{fontSize:'14px',fontWeight:'600',color:'var(--text-1)',marginBottom:'4px'}}>{te?'ఫోటో / వీడియో జోడించండి':'Add photos or videos'}</div>
                <div style={{fontSize:'12px',color:'var(--text-3)'}}>{te?'క్లిక్ చేయండి లేదా డ్రాగ్ & డ్రాప్ చేయండి · గరిష్టం 20MB':'Click or drag & drop · Max 20MB per file'}</div>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={handleFiles} style={{display:'none'}} />
              </div>
              {previewUrls.length>0&&(
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:'8px'}}>
                  {previewUrls.map((f,i)=>(
                    <div key={i} style={{position:'relative',borderRadius:'8px',overflow:'hidden',border:'1px solid var(--border)'}}>
                      {f.type.startsWith('image')?<img src={f.url} style={{width:'100%',height:'100px',objectFit:'cover'}} alt=""/>:<div style={{height:'100px',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px'}}>🎥</div>}
                      <div style={{padding:'4px 6px',fontSize:'10px',color:'var(--text-3)',background:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</div>
                      <button type="button" onClick={()=>{const nf=form.files.filter((_,fi)=>fi!==i);set('files',nf);setPreviewUrls(p=>p.filter((_,pi)=>pi!==i));}}
                        style={{position:'absolute',top:'4px',right:'4px',width:'20px',height:'20px',borderRadius:'50%',background:'rgba(0,0,0,0.6)',color:'white',border:'none',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{marginTop:'16px',padding:'12px 14px',background:'var(--bg)',borderRadius:'8px',fontSize:'12px',color:'var(--text-2)'}}>
                {te?'💡 చిట్కా: సమస్య స్పష్టంగా కనిపించే ఫోటో తీయండి. వీలైతే సమీపంలో ల్యాండ్‌మార్క్ కూడా చేర్చండి.':'💡 Tip: Take a clear photo showing the problem. Including a nearby landmark helps officers locate it faster.'}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{te?'మీ పేరు':'Your name'} *</label>
                  <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} placeholder={te?'మీ పూర్తి పేరు':'Your full name'} />
                </div>
                <div className="form-group">
                  <label className="form-label">{te?'SMS భాష':'SMS language'}</label>
                  <select className="form-select" value={form.lang_pref} onChange={e=>set('lang_pref',e.target.value)}>
                    <option value="te">తెలుగు</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{te?'మొబైల్ నంబర్':'Mobile number'} *</label>
                <div style={{display:'flex',gap:'8px'}}>
                  <div style={{display:'flex',alignItems:'center',background:'var(--bg)',border:'1.5px solid var(--border)',borderRadius:'8px',padding:'0 12px',fontSize:'14px',color:'var(--text-2)',flexShrink:0}}>+91</div>
                  <input className="form-input" value={form.phone} onChange={e=>set('phone',e.target.value.replace(/\D/g,'').slice(0,10))} placeholder="9876543210" style={{flex:1}} disabled={otpVerified} />
                  <button type="button" onClick={sendOtp} disabled={otpLoading||otpVerified||form.phone.length!==10}
                    style={{padding:'0 16px',borderRadius:'8px',border:'none',background:otpVerified?'#16a34a':'var(--ap-navy)',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',flexShrink:0,whiteSpace:'nowrap'}}>
                    {otpVerified?'✓ Verified':otpLoading?'...':otpSent?(te?'పునః పంపు':'Resend'):(te?'OTP పంపు':'Send OTP')}
                  </button>
                </div>
                <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'4px'}}>{te?'మీ ఫిర్యాదు స్థితి నవీకరణలు ఈ నంబర్‌కు SMS ద్వారా వస్తాయి':'Status updates will be sent to this number via SMS'}</div>
              </div>
              {otpSent&&!otpVerified&&(
                <div className="form-group">
                  <label className="form-label">{te?'OTP నమోదు చేయండి':'Enter OTP'}</label>
                  <div style={{display:'flex',gap:'8px'}}>
                    <input className="form-input" value={form.otp} onChange={e=>set('otp',e.target.value.replace(/\D/g,'').slice(0,6))}
                      placeholder="• • • • • •" style={{flex:1,letterSpacing:'0.3em',fontSize:'20px',fontWeight:'700',textAlign:'center'}} maxLength={6} />
                    <button type="button" onClick={verifyOtp} disabled={otpLoading||form.otp.length!==6}
                      style={{padding:'0 16px',borderRadius:'8px',border:'none',background:'#16a34a',color:'white',fontSize:'13px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',flexShrink:0}}>
                      {otpLoading?'...':(te?'ధృవీకరించు':'Verify')}
                    </button>
                  </div>
                  <div style={{fontSize:'11px',color:'var(--text-3)',marginTop:'4px'}}>{te?'OTP 10 నిమిషాలలో గడువు ముగుస్తుంది':'OTP expires in 10 minutes'}</div>
                </div>
              )}
              {otpVerified&&(
                <div style={{background:'#dcfce7',border:'1px solid #bbf7d0',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',color:'#166534',marginBottom:'16px'}}>
                  ✓ {te?'మొబైల్ నంబర్ ధృవీకరించబడింది':'Mobile number verified successfully'}
                </div>
              )}
              <div style={{background:'var(--bg)',borderRadius:'8px',padding:'14px',fontSize:'13px',color:'var(--text-2)',marginTop:'8px'}}>
                <div style={{fontWeight:'600',color:'var(--text-1)',marginBottom:'8px'}}>{te?'మీ ఫిర్యాదు సారాంశం':'Your complaint summary'}</div>
                {[
                  {l:te?'సమస్య స్థానం':'Problem location', v:`${districts.find(d=>d.id==form.district_id)?.name||''} · ${form.village}`},
                  {l:te?'విభాగం':'Department', v:depts.find(d=>d.id==form.department_id)?.name||''},
                  {l:te?'సమస్య':'Problem', v:form.title},
                  {l:te?'సాక్ష్యం':'Evidence', v:form.files.length?`${form.files.length} file(s) attached`:'No files attached'},
                ].map((r,i)=>r.v&&(
                  <div key={i} style={{display:'flex',gap:'8px',padding:'4px 0',borderBottom:'0.5px solid var(--border)'}}>
                    <span style={{minWidth:'120px',opacity:0.7}}>{r.l}</span>
                    <span style={{fontWeight:'500',color:'var(--text-1)'}}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:'12px',marginTop:'24px'}}>
            {step>1&&(
              <button type="button" className="btn-secondary" onClick={()=>{setStep(s=>s-1);setError(null);}} style={{flex:1}}>
                {te?'← వెనుకకు':'← Back'}
              </button>
            )}
            {step<4?(
              <button type="button" className="btn-primary" style={{flex:2}}
                onClick={()=>{if(canProceed()){setStep(s=>s+1);setError(null);}else{setError(te?'దయచేసి అన్ని అవసరమైన వివరాలు నమోదు చేయండి':'Please fill in all required fields');}}}>
                {te?'తదుపరి →':'Next →'}
              </button>
            ):(
              <button type="button" className="btn-primary" onClick={submit} disabled={loading||!otpVerified} style={{flex:2}}>
                {loading?(te?'సమర్పిస్తోంది...':'Submitting...'):(te?'ఫిర్యాదు సమర్పించండి':'Submit Complaint')}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}