'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { t } from '@/lib/i18n';

export default function CategoryFilter({ categories, selected, onSelect, counts, lang = 'th' }) {
  const containerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll state
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  // Update sliding indicator position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      const activeBtn = container.querySelector('.category-btn.active');
      if (activeBtn) {
        setIndicatorStyle({
          left: activeBtn.offsetLeft,
          top: activeBtn.offsetTop,
          width: activeBtn.offsetWidth,
          height: activeBtn.offsetHeight,
          opacity: 1
        });

        // Auto-scroll active button into view
        const containerRect = container.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        if (btnRect.right > containerRect.right - 40) {
          container.scrollBy({ left: btnRect.right - containerRect.right + 60, behavior: 'smooth' });
        } else if (btnRect.left < containerRect.left + 40) {
          container.scrollBy({ left: btnRect.left - containerRect.left - 60, behavior: 'smooth' });
        }
      }
      checkScroll();
    });
  }, [selected, categories, lang, checkScroll]);

  // Listen to scroll events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  const scrollBy = (direction) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 150, behavior: 'smooth' });
  };

  return (
    <div className="category-filter-wrapper">
      {/* Left fade + arrow */}
      {canScrollLeft && (
        <button className="scroll-fade scroll-fade-left" onClick={() => scrollBy(-1)} aria-label="Scroll left">
          ‹
        </button>
      )}

      <div className="category-filter" ref={containerRef}>
        <div className="active-indicator" style={indicatorStyle} />
        <button
          className={`category-btn ${selected === 'all' ? 'active' : ''}`}
          onClick={() => onSelect('all')}
        >
          <span>{t(lang, 'all')}</span>
          {counts && <span className="cat-count">{counts.all || 0}</span>}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${selected === cat ? 'active' : ''}`}
            onClick={() => onSelect(cat)}
          >
            <span>{formatCategoryName(cat)}</span>
            {counts && <span className="cat-count">{counts[cat] || 0}</span>}
          </button>
        ))}
      </div>

      {/* Right fade + arrow */}
      {canScrollRight && (
        <button className="scroll-fade scroll-fade-right" onClick={() => scrollBy(1)} aria-label="Scroll right">
          ›
        </button>
      )}
    </div>
  );
}

function formatCategoryName(channel) {
  return channel
    .replace(/^(auction|market|giveaway)-?/i, '')
    .replace(/-/g, ' ')
    .replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase())
    || channel;
}
