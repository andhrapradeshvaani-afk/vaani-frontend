'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const t = {
  en: { home: 'Home', file: 'File Complaint', track: 'Track', dashboard: 'Dashboard', lang: 'తెలుగు' },
  te: { home: 'హోమ్', file: 'ఫిర్యాదు నమోదు', track: 'ట్రాక్', dashboard: 'డాష్‌బోర్డ్', lang: 'English' },
};

export default function Nav({ lang, setLang }) {
  const path = usePathname();
  const l = t[lang];

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand">
        <div className="nav-logo">V</div>
        <div>
          <div className="nav-title">Vaani</div>
          <div className="nav-te">వాణి</div>
        </div>
      </Link>
      <div className="nav-links">
        <Link href="/"          className={`nav-link ${path === '/' ? 'active' : ''}`}>{l.home}</Link>
        <Link href="/file"      className={`nav-link ${path === '/file' ? 'active' : ''}`}>{l.file}</Link>
        <Link href="/track"     className={`nav-link ${path === '/track' ? 'active' : ''}`}>{l.track}</Link>
        <Link href="/dashboard" className={`nav-link ${path === '/dashboard' ? 'active' : ''}`}>{l.dashboard}</Link>
        <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'te' : 'en')}>{l.lang}</button>
      </div>
    </nav>
  );
}
