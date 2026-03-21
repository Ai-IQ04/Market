'use client';

import { t } from '@/lib/i18n';

export default function SearchBar({ value, onChange, lang = 'th' }) {
  return (
    <div className="search-bar">
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder={t(lang, 'searchPlaceholder')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
        id="search-input"
      />
      {value && (
        <button className="search-clear" onClick={() => onChange('')}>
          ✕
        </button>
      )}
    </div>
  );
}
