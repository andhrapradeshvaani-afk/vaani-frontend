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
      <Link href="/" className="nav-brand">
        <img src="/favicon.png" alt="Vaani" style={{width:'40px',height:'40px',borderRadius:'10px',objectFit:'cover'}} />
        <div>
          <div className="nav-title">Vaani</div>
          <div className="nav-te">వాణి</div>
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
          style={{fontSize:'12px',color:'var(--text-3)',textDecoration:'underline',opacity:'0.6'}}
          className={`nav-link ${path.startsWith('/officer') ? 'active' : ''}`}>
          {l.officer}
        </Link>
      </div>
    </nav>
  );
}
