'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const t = {
  en: { home: 'Home', file: 'File Complaint', track: 'Track', community: 'Community', dashboard: 'Dashboard', lang: 'తెలుగు', officer: 'Officer Login' },
  te: { home: 'హోమ్', file: 'ఫిర్యాదు నమోదు', track: 'ట్రాక్', community: 'కమ్యూనిటీ', dashboard: 'డాష్‌బోర్డ్', lang: 'English', officer: 'అధికారి లాగిన్' },
};

export default function Nav({ lang, setLang }) {
  const path = usePathname();
  const l = t[lang];

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand" style={{gap:'8px'}}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
          <rect width="36" height="36" rx="8" fill="#0f2d5e"/>
          <circle cx="13" cy="11" r="4" fill="#f0a500"/>
          <path d="M9 16 Q7 22 8 28 L18 28 Q19 22 17 16 Z" fill="#f0a500"/>
          <path d="M16 18 L24 13" stroke="#f0a500" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M24 11 L24 16 L28 17.5 L28 9.5 Z" fill="#f0a500"/>
          <path d="M28 9.5 L34 7 L34 20 L28 17.5 Z" fill="#f0a500" opacity="0.75"/>
          <path d="M35 11 Q37 14 35 17" fill="none" stroke="#f0a500" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div style={{lineHeight:'1.2'}}>
          <div className="nav-title" style={{fontSize:'15px'}}>Vaani</div>
          <div className="nav-te" style={{fontSize:'10px'}}>వాణి</div>
        </div>
      </Link>
      <div className="nav-links">
        <Link href="/"           className={`nav-link ${path === '/' ? 'active' : ''}`}>{l.home}</Link>
        <Link href="/file"       className={`nav-link ${path === '/file' ? 'active' : ''}`}>{l.file}</Link>
        <Link href="/track"      className={`nav-link ${path === '/track' ? 'active' : ''}`}>{l.track}</Link>
        <Link href="/community"  className={`nav-link ${path === '/community' ? 'active' : ''}`}>{l.community}</Link>
        <Link href="/dashboard"  className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>{l.dashboard}</Link>
        <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'te' : 'en')}>{l.lang}</button>
        <Link href="/officer/login"
          style={{fontSize:'12px',color:'var(--text-3)',textDecoration:'underline',opacity:'0.6',whiteSpace:'nowrap'}}
          className={`nav-link ${path.startsWith('/officer') ? 'active' : ''}`}>
          {l.officer}
        </Link>
      </div>
    </nav>
  );
}
