'use client';

import SearchBar from './SearchBar';
import LanguageToggle from './LanguageToggle';
import { t } from '@/lib/i18n';

export default function Navbar({ search, onSearchChange, lang, setLang, connected, itemCount }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-brand">
          <span className="navbar-logo">⚔️</span>
          <h1 className="navbar-title">{t(lang, 'title')}</h1>
          <div className={`connection-badge ${connected ? 'online' : 'offline'}`} title={connected ? t(lang, 'connected') : t(lang, 'disconnected')}>
            <span className="connection-dot"></span>
          </div>
        </div>

        {/* Center: Search */}
        <div className="navbar-center">
          <SearchBar value={search} onChange={onSearchChange} lang={lang} />
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
