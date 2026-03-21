'use client';

import { t } from '@/lib/i18n';

export default function SortSelect({ value, onChange, lang = 'th' }) {
  return (
    <div className="sort-select-wrapper">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sort-select"
        id="sort-select"
      >
        <option value="newest">{t(lang, 'newest')}</option>
        <option value="priceAsc">{t(lang, 'priceAsc')}</option>
        <option value="priceDesc">{t(lang, 'priceDesc')}</option>
        <option value="endingSoon">{t(lang, 'endingSoonSort')}</option>
      </select>
    </div>
  );
}
