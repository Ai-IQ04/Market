'use client';

import { t } from '@/lib/i18n';

export default function CategoryFilter({ categories, selected, onSelect, lang = 'th' }) {
  return (
    <div className="category-filter">
      <button
        className={`category-btn ${selected === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        {t(lang, 'all')}
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          className={`category-btn ${selected === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {formatCategoryName(cat)}
        </button>
      ))}
    </div>
  );
}

function formatCategoryName(channel) {
  // Convert "auction-weapon" → "Weapon", "market-accessories" → "Accessories"
  return channel
    .replace(/^(auction|market|giveaway)-?/i, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    || channel;
}
