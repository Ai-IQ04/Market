'use client';

import AuctionCard from './AuctionCard';
import { t } from '@/lib/i18n';

export default function AuctionGrid({ items, lang = 'th' }) {
  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🔍</span>
        <p className="empty-text">{t(lang, 'noItems')}</p>
      </div>
    );
  }

  return (
    <div className="auction-grid">
      {items.map((item) => (
        <AuctionCard key={item.id} item={item} lang={lang} />
      ))}
    </div>
  );
}
