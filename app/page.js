'use client';
import { useState } from 'react';
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
      { n: '2', t: 'Get your complaint ID', s: 'Receive a unique ID like AP-2025-CTR-00421 instantly via SMS.' },
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
      { n: '2', t: 'ఫిర్యాదు ID పొందండి', s: 'AP-2025-CTR-00421 వంటి ప్రత్యేక ID SMS ద్వారా వెంటనే అందుతుంది.' },
      { n: '3', t: 'ప్రభుత్వం చర్య తీసుకుంటుంది', s: 'మీ ఫిర్యాదు సరైన విభాగానికి SLA గడువుతో పంపబడుతుంది.' },
      { n: '4', t: 'ట్రాక్ & మూసివేయండి', s: 'మీ సమస్య పరిష్కారమయ్యే వరకు ప్రతి స్థితి నవీకరణను అనుసరించండి.' },
    ],
    depts: ['రోడ్లు & మౌలిక సదుపాయాలు', 'నీటి సరఫరా', 'విద్యుత్', 'ఆరోగ్యం & వైద్యం', 'విద్య', 'పురపాలక సేవలు', 'రెవెన్యూ & భూమి', 'వ్యవసాయం'],
  }
};

export default function Home() {
  const [lang, setLang] = useState('en');
  const c = content[lang];

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
              {n:'0', l: lang==='en'?'Total complaints':'మొత్తం ఫిర్యాదులు'},
              {n:'0', l: lang==='en'?'Resolved':'పరిష్కరించబడింది'},
              {n:'0', l: lang==='en'?'In progress':'పురోగతిలో'},
              {n:'0', l: lang==='en'?'Districts covered':'జిల్లాలు'},
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
        <div>
          <div className="page-title" style={{marginBottom:'16px'}}>{lang==='en'?'Departments covered':'విభాగాలు'}</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'8px'}}>
            {c.depts.map((d,i) => (
              <span key={i} style={{background:'var(--ap-gold-lt)',color:'var(--ap-navy)',padding:'6px 14px',borderRadius:'20px',fontSize:'13px',fontWeight:'500',fontFamily:lang==='te'?'Tiro Telugu, serif':'inherit'}}>
                {d}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{background:'var(--ap-navy)',color:'rgba(255,255,255,0.6)',textAlign:'center',padding:'20px',fontSize:'12px',marginTop:'40px'}}>
        Vaani · వాణి · Andhra Pradesh Citizen Grievance Portal · Built for the people of AP
      </footer>
    </>
  );
}
