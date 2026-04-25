'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Nav from './components/Nav';

const content = {
  en: {
    title: 'Your Voice to the Government',
    te: 'ప్రభుత్వానికి మీ వాణి',
    sub: 'File complaints, track resolutions, and hold your government accountable. Free for every citizen of Andhra Pradesh.',
    file: 'File a Complaint',
    track: 'Track My Complaint',
    stats_title: 'Portal at a glance',
    how_title: 'How it works',
    steps: [
      { n: '1', t: 'File your complaint', s: 'Describe the issue, attach a photo, pick your district and department.' },
      { n: '2', t: 'Get your complaint ID', s: 'Receive a unique ID like AP-2026-CTR-00421 instantly via SMS.' },
      { n: '3', t: 'Government acts', s: 'Your complaint is routed to the right department with an SLA deadline.' },
      { n: '4', t: 'Track & close', s: 'Follow every status update until your issue is resolved.' },
    ],
    depts: ['Roads & Infrastructure', 'Water Supply', 'Electricity', 'Health & Medical', 'Education', 'Municipal Services', 'Revenue & Land', 'Agriculture'],
  },
  te: {
    title: 'ప్రభుత్వానికి మీ వాణి',
    te: 'Your Voice to the Government',
    sub: 'ఫిర్యాదులు నమోదు చేయండి, పరిష్కారాలను ట్రాక్ చేయండి. ఆంధ్రప్రదేశ్ ప్రతి పౌరుడికి ఉచితంగా.',
    file: 'ఫిర్యాదు నమోదు చేయండి',
    track: 'నా ఫిర్యాదు ట్రాక్ చేయండి',
    stats_title: 'పోర్టల్ సారాంశం',
    how_title: 'ఇది ఎలా పని చేస్తుంది',
    steps: [
      { n: '1', t: 'ఫిర్యాదు నమోదు చేయండి', s: 'సమస్యను వివరించండి, ఫోటో జోడించండి, జిల్లా మరియు విభాగం ఎంచుకోండి.' },
      { n: '2', t: 'ఫిర్యాదు ID పొందండి', s: 'AP-2026-CTR-00421 వంటి ప్రత్యేక ID SMS ద్వారా వెంటనే అందుతుంది.' },
      { n: '3', t: 'ప్రభుత్వం చర్య తీసుకుంటుంది', s: 'మీ ఫిర్యాదు సరైన విభాగానికి SLA గడువుతో పంపబడుతుంది.' },
      { n: '4', t: 'ట్రాక్ & మూసివేయండి', s: 'మీ సమస్య పరిష్కారమయ్యే వరకు ప్రతి స్థితి నవీకరణను అనుసరించండి.' },
    ],
    depts: ['రోడ్లు & మౌలిక సదుపాయాలు', 'నీటి సరఫరా', 'విద్యుత్', 'ఆరోగ్యం & వైద్యం', 'విద్య', 'పురపాలక సేవలు', 'రెవెన్యూ & భూమి', 'వ్యవసాయం'],
  }
};

export default function Home() {
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
  const [stats, setStats] = useState({ total: 0, resolved: 0, in_progress: 0, pending: 0 });
  const c = content[lang];

  useEffect(() => {
    fetch(`https://vaani-backend-w3zz.onrender.com/api/dashboard/public`)
      .then(r => r.json())
      .then(d => setStats(d.totals))
      .catch(() => {});
  }, []);

  return (
    <>
      <Nav lang={lang} setLang={setLang} />

      {/* HERO */}
      <div className="hero">
        <div className="hero-title">{c.title}</div>
        <div className="hero-te te">{c.te}</div>
        <div className="hero-sub">{c.sub}</div>
        <div className="hero-actions">
          <Link href="/file">
            <button style={{background:'var(--ap-gold)',color:'var(--ap-navy)',border:'none',padding:'14px 28px',borderRadius:'10px',fontWeight:'700',fontSize:'15px',cursor:'pointer',fontFamily:'inherit'}}>
              {c.file}
            </button>
          </Link>
          <Link href="/track">
            <button style={{background:'rgba(255,255,255,0.1)',color:'white',border:'1.5px solid rgba(255,255,255,0.3)',padding:'14px 28px',borderRadius:'10px',fontWeight:'600',fontSize:'15px',cursor:'pointer',fontFamily:'inherit'}}>
              {c.track}
            </button>
          </Link>
        </div>
      </div>

      <div className="page">

        {/* STATS */}
        <div style={{marginBottom:'40px'}}>
          <div className="page-title" style={{marginBottom:'16px'}}>{c.stats_title}</div>
          <div className="stats-grid">
            {[
              {n: stats.total || 0,       l: lang==='en'?'Total complaints':'మొత్తం ఫిర్యాదులు'},
              {n: stats.resolved || 0,    l: lang==='en'?'Resolved':'పరిష్కరించబడింది'},
              {n: stats.in_progress || 0, l: lang==='en'?'In progress':'పురోగతిలో'},
              {n: stats.pending || 0,     l: lang==='en'?'Pending':'పెండింగ్'},
            ].map((s,i) => (
              <div className="stat-card" key={i}>
                <div className="stat-num">{s.n}</div>
                <div className="stat-lbl te" style={{fontFamily: lang==='te'?'Tiro Telugu, serif':'Plus Jakarta Sans, sans-serif'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{marginBottom:'40px'}}>
          <div className="page-title" style={{marginBottom:'20px'}}>{c.how_title}</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'16px'}}>
            {c.steps.map((s,i) => (
              <div className="card" key={i} style={{borderTop:`3px solid var(--ap-gold)`}}>
                <div style={{width:'28px',height:'28px',borderRadius:'50%',background:'var(--ap-navy)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'700',fontSize:'13px',marginBottom:'10px'}}>{s.n}</div>
                <div style={{fontWeight:'600',fontSize:'14px',marginBottom:'6px'}}>{s.t}</div>
                <div style={{fontSize:'13px',color:'var(--text-2)',lineHeight:'1.6'}}>{s.s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* DEPARTMENTS */}
        <div style={{marginBottom:'48px'}}>
          <div className="page-title" style={{marginBottom:'16px'}}>{lang==='en'?'Departments covered':'విభాగాలు'}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            {c.depts.map((d,i) => (
              <span key={i} style={{background:'var(--ap-gold-lt)',color:'var(--ap-navy)',padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'500',fontFamily:lang==='te'?'Tiro Telugu, serif':'inherit'}}>
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* ABOUT VAANI */}
        <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'16px',padding:'32px',marginBottom:'48px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <div style={{width:'4px',height:'28px',background:'var(--ap-gold)',borderRadius:'2px'}}/>
            <div style={{fontSize:'18px',fontWeight:'700',color:'var(--ap-navy)'}}>
              {lang==='en'?'About Vaani':'వాణి గురించి'}
            </div>
          </div>
          <p style={{fontSize:'14px',color:'var(--text-2)',lineHeight:'1.8',marginBottom:'16px'}}>
            {lang==='en'
              ? 'Andhra Pradesh has PGRS — an official grievance system. But it requires Aadhaar eKYC to log in, locking out citizens whose Aadhaar is linked to an old or unavailable mobile number. The filing form is desktop-first, and there is no mobile app for citizens.'
              : 'ఆంధ్రప్రదేశ్‌లో PGRS అనే అధికారిక ఫిర్యాదు వ్యవస్థ ఉంది. కానీ అది లాగిన్ కోసం ఆధార్ eKYC అవసరం — పాత లేదా అందుబాటులో లేని మొబైల్ నంబర్‌తో ఆధార్ లింక్ అయిన పౌరులు లాగిన్ చేయలేరు.'
            }
          </p>
          <p style={{fontSize:'14px',color:'var(--text-2)',lineHeight:'1.8',marginBottom:'20px'}}>
            {lang==='en'
              ? 'Vaani is built for the citizens PGRS was not designed for — mobile-first, no Aadhaar required, Telugu-first, with GPS tagging, photo evidence, and a community upvoting system that gives neighbourhoods collective voice. File a complaint in under 3 minutes, from any phone.'
              : 'వాణి అలాంటి పౌరుల కోసం నిర్మించబడింది — మొబైల్-ఫస్ట్, ఆధార్ అవసరం లేదు, తెలుగు-ఫస్ట్, GPS ట్యాగింగ్, ఫోటో సాక్ష్యం మరియు కమ్యూనిటీ అప్‌వోటింగ్ సిస్టమ్‌తో. 3 నిమిషాల్లోపు ఏ ఫోన్ నుండైనా ఫిర్యాదు నమోదు చేయండి.'
            }
          </p>
          <div style={{display:'flex',flexWrap:'wrap',gap:'10px'}}>
            {[
              {icon:'📱', label: lang==='en'?'Mobile-native app':'మొబైల్ యాప్'},
              {icon:'🔓', label: lang==='en'?'No Aadhaar needed':'ఆధార్ అవసరం లేదు'},
              {icon:'📍', label: lang==='en'?'GPS + photo evidence':'GPS + ఫోటో సాక్ష్యం'},
              {icon:'🗳️', label: lang==='en'?'Community upvoting':'కమ్యూనిటీ అప్‌వోటింగ్'},
              {icon:'⚡', label: lang==='en'?'Under 3 minutes':'3 నిమిషాల్లోపు'},
            ].map((f,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',background:'white',border:'1px solid var(--border)',borderRadius:'20px',padding:'6px 14px',fontSize:'13px',fontWeight:'500',color:'var(--ap-navy)'}}>
                <span>{f.icon}</span><span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BUILT BY */}
        

      </div>

     {/* FOOTER */}
<footer style={{background:'var(--ap-navy)',color:'rgba(255,255,255,0.6)',textAlign:'center',padding:'24px 20px',fontSize:'12px',marginTop:'40px'}}>
  <div style={{fontSize:'13px',marginBottom:'10px'}}>
    Vaani · వాణి · Andhra Pradesh Citizen Grievance Portal · Built for the people of AP
  </div>

  <div style={{fontSize:'12px',marginBottom:'12px'}}>
    {lang==='en'
      ? 'A civic tech initiative by'
      : 'సివిక్ టెక్ చొరవ'}
    {' '}
    <a
      href="https://linkedin.com/in/sahu-rajesh160608"
      target="_blank"
      rel="noopener noreferrer"
      style={{color:'#f0a500',textDecoration:'none',fontWeight:'600'}}
    >
      Rajesh Sahu · IIT Kanpur
    </a>
  </div>

  <div style={{fontSize:'11px',marginBottom:'10px',opacity:0.85}}>
    {lang==='en'
      ? 'Built solo, end-to-end · Open to collaboration with the AP government'
      : 'ఒంటరిగా నిర్మించబడింది · AP ప్రభుత్వంతో సహకారానికి సిద్ధంగా ఉన్నాను'}
  </div>

  <div style={{fontSize:'11px',opacity:0.6}}>
    This is a civic tech pilot. Not an official Government of AP product.
  </div>
</footer>
    </>
  );
}