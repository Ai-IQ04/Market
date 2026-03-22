'use client';

import { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';

export default function CountdownTimer({ endTime, lang = 'th' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft('--');
      return;
    }

    function update() {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft(t(lang, 'ended'));
        setIsExpired(true);
        setIsUrgent(false);
        return;
      }

      setIsExpired(false);
      setIsUrgent(diff <= 10 * 60 * 1000); // < 10 minutes

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      let parts = [];
      if (days > 0) parts.push(`${days}${t(lang, 'days')}`);
      if (hours > 0 || days > 0) parts.push(`${hours}${t(lang, 'hours')}`);
      parts.push(`${minutes}${t(lang, 'minutes')}`);
      parts.push(`${seconds}${t(lang, 'seconds')}`);

      setTimeLeft(parts.join(' '));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, lang]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div className={`countdown-timer ${isUrgent ? 'urgent' : ''} ${isExpired ? 'expired' : ''}`}>
        <span className="countdown-icon">⏱</span>
        <span className="countdown-text">{timeLeft}</span>
      </div>
      
      {/* Progress Bar Line */}
      <div className="countdown-progress-bg" style={{ 
        height: '3px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '2px', 
        overflow: 'hidden' 
      }}>
        <div className="countdown-progress-fill" style={{ 
          height: '100%', 
          background: isExpired ? 'var(--red)' : isUrgent ? 'var(--orange)' : 'var(--green)', 
          width: isExpired ? '0%' : isUrgent ? '15%' : '100%',
          transition: 'all 1s linear',
          boxShadow: isUrgent ? '0 0 8px var(--orange)' : '0 0 8px var(--green)'
        }}></div>
      </div>
    </div>
  );
}
