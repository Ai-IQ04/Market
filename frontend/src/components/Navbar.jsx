'use client';

import SearchBar from './SearchBar';
import LanguageToggle from './LanguageToggle';
import SortSelect from './SortSelect';
import { t } from '@/lib/i18n';

export default function Navbar({ search, onSearchChange, sort, onSortChange, lang, setLang, connected, itemCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-brand">
          <div className="logo-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="2" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#c084fc" />
                  <stop offset="1" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="navbar-title">{t(lang, 'title')}</h1>
            <div className={`status-text ${connected ? 'online' : 'offline'}`}>
               <span className="status-dot"></span>
               {connected ? (lang === 'th' ? 'ระบบออนไลน์' : 'SYSTEM ONLINE') : (lang === 'th' ? 'ขาดการเชื่อมต่อ' : 'OFFLINE')}
            </div>
          </div>
        </div>

        {/* Center: Search & Sort */}
        <div className="navbar-center" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SearchBar value={search} onChange={onSearchChange} lang={lang} />
          <SortSelect value={sort} onChange={onSortChange} lang={lang} />
        </div>

        {/* Right side */}
        <div className="navbar-right">
          <div className="navbar-item-count">
            <span className="item-count-number">{itemCount}</span>
            <span className="item-count-label">{t(lang, 'items')}</span>
          </div>
          <LanguageToggle lang={lang} setLang={setLang} />
        </div>
      </div>
    </nav>
  );
}
