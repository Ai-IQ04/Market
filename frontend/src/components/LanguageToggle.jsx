'use client';

import { t } from '@/lib/i18n';

export default function LanguageToggle({ lang, setLang }) {
  return (
    <button
      onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
      className="lang-toggle"
      aria-label="Toggle language"
    >
      <span className={`lang-option ${lang === 'th' ? 'active' : ''}`}>TH</span>
      <span className="lang-divider">/</span>
      <span className={`lang-option ${lang === 'en' ? 'active' : ''}`}>EN</span>
    </button>
  );
}
