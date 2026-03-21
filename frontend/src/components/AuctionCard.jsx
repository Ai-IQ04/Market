'use client';

import CountdownTimer from './CountdownTimer';
import { t } from '@/lib/i18n';

export default function AuctionCard({ item, lang = 'th' }) {
  const statusClass = item.status?.toLowerCase().replace('_', '-') || 'open';
  const typeLabel = t(lang, item.type || 'auction');

  return (
    <article className={`auction-card status-${statusClass}`}>
      {/* Image */}
      <div className="card-image-wrapper">
        {item.image ? (
          <img src={item.image} alt={item.name} className="card-image" loading="lazy" />
        ) : (
          <div className="card-image-placeholder">
            <span className="placeholder-icon">
              {item.type === 'giveaway' ? '🎁' : item.type === 'market' ? '🏪' : '⚔️'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-content">
        {/* Badges Section */}
        <div className="card-badges">
          <span className={`type-badge type-${item.type}`}>
            {typeLabel}
          </span>
          <span className={`status-badge badge-${statusClass}`}>
            {item.status === 'ENDING_SOON' ? t(lang, 'endingSoon') :
             item.status === 'CLOSED' ? t(lang, 'closed') : t(lang, 'open')}
          </span>
        </div>

        {/* Name */}
        <h3 className="card-name" title={item.name}>{item.name}</h3>

        {/* Channel & Ref */}
        <div className="card-meta">
          <span className="channel-tag">#{item.channel}</span>
          {item.refCode && <span className="ref-code">#{item.refCode}</span>}
        </div>

        {/* Price Section */}
        {item.type !== 'giveaway' && (
          <div className="card-pricing">
            {item.type === 'auction' && item.currentBid != null ? (
              <>
                <div className="price-row">
                  <span className="price-label">{t(lang, 'currentBid')}</span>
                  <span className="price-value highlight">{formatPrice(item.currentBid)}</span>
                </div>
                {item.buyNowPrice && (
                  <div className="price-row">
                    <span className="price-label">{t(lang, 'buyNow')}</span>
                    <span className="price-value buynow">{formatPrice(item.buyNowPrice)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="price-row">
                <span className="price-label">{t(lang, 'price')}</span>
                <span className="price-value highlight">{formatPrice(item.price)}</span>
              </div>
            )}
            {item.quantity > 1 && (
              <div className="price-row">
                <span className="price-label">{t(lang, 'quantity')}</span>
                <span className="price-value">×{item.quantity}</span>
              </div>
            )}
          </div>
        )}

        {/* Countdown */}
        <div className="card-countdown">
          <span className="countdown-label">{t(lang, 'timeLeft')}</span>
          <CountdownTimer endTime={item.endTime} lang={lang} />
        </div>

        {/* Owner */}
        {item.owner && (
          <div className="card-owner">
            <span className="owner-icon">👤</span>
            <span className="owner-name">{item.owner}</span>
          </div>
        )}

        {/* Discord Link Button */}
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="discord-btn"
        >
          <svg className="discord-icon" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          {t(lang, 'viewOnDiscord')}
        </a>
      </div>
    </article>
  );
}

function formatPrice(price) {
  if (price == null) return '-';
  return `${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD₮`;
}
