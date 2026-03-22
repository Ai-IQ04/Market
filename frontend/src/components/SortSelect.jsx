'use client';

import { useState, useRef, useEffect } from 'react';
import { t } from '@/lib/i18n';

export default function SortSelect({ value, onChange, lang = 'th' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { id: 'newest', label: t(lang, 'newest') },
    { id: 'priceAsc', label: t(lang, 'priceAsc') },
    { id: 'priceDesc', label: t(lang, 'priceDesc') },
    { id: 'endingSoon', label: t(lang, 'endingSoonSort') },
  ];

  const currentOption = options.find(o => o.id === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-sort-wrapper" ref={dropdownRef}>
      <button 
        className={`custom-sort-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={t(lang, 'sort')}
      >
        <svg className="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M6 12h12M9 18h6"/>
        </svg>
        <span className="sort-label">{currentOption.label}</span>
      </button>

      {isOpen && (
        <div className="custom-sort-menu">
          {options.map(opt => (
            <button
              key={opt.id}
              className={`sort-option ${value === opt.id ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {value === opt.id && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
