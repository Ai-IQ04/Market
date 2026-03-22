'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import CategoryFilter from '@/components/CategoryFilter';
import SortSelect from '@/components/SortSelect';
import AuctionGrid from '@/components/AuctionGrid';
import { useAuctions } from '@/hooks/useAuctions';
import { t } from '@/lib/i18n';

export default function Home() {
  const { auctions, loading, connected } = useAuctions();
  const [lang, setLang] = useState('th');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [toasts, setToasts] = useState([]); // Added toasts state

  // Use refs for socket updates
  const auctionsRef = useRef(auctions); // Added auctionsRef

  // Toast adder utility
  const addToast = (message, title) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Extract unique categories from auctions
  const categories = useMemo(() => {
    const cats = new Set();
    auctions.forEach(item => {
      if (item.channel) cats.add(item.channel);
    });
    return Array.from(cats).sort();
  }, [auctions]);

  // Group counts before filtering by category/search
  const categoryCounts = useMemo(() => {
    const counts = { all: auctions.filter(a => a.status !== 'CLOSED').length };
    auctions.filter(a => a.status !== 'CLOSED').forEach(item => {
      counts[item.channel] = (counts[item.channel] || 0) + 1;
    });
    return counts;
  }, [auctions]);

  const isFirstLoad = useRef(true);

  // Connect state ref to updated auctions and detect changes for toasts
  useEffect(() => {
    if (isFirstLoad.current) {
      if (auctions.length > 0) {
        isFirstLoad.current = false;
        auctionsRef.current = auctions;
      }
      return;
    }

    if (auctions.length > 0 && auctionsRef.current.length > 0) {
      auctions.forEach(newItem => {
        const oldItem = auctionsRef.current.find(a => a.id === newItem.id);
        if (oldItem) {
          if (newItem.price > oldItem.price) {
            addToast(`🔥 บิดล่าสุดขึ้นเป็น ${newItem.price} USD₮`, newItem.name);
          }
        } else {
          // New item
          addToast(`✨ ของใหม่เข้าตลาด!`, newItem.name);
        }
      });
    }

    auctionsRef.current = auctions;
  }, [auctions]);

  // Filter and sort auctions
  const filteredItems = useMemo(() => {
    // ★ แสดงเฉพาะรายการที่ยังไม่หมดอายุ (OPEN / ENDING_SOON)
    let items = auctions.filter(item => item.status !== 'CLOSED');

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(item =>
        item.name?.toLowerCase().includes(q) ||
        item.channel?.toLowerCase().includes(q) ||
        item.owner?.toLowerCase().includes(q) ||
        item.refCode?.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (category !== 'all') {
      items = items.filter(item => item.channel === category);
    }

    // Sort
    switch (sort) {
      case 'priceAsc':
        items.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'priceDesc':
        items.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'endingSoon':
        items.sort((a, b) => {
          if (!a.endTime) return 1;
          if (!b.endTime) return -1;
          return a.endTime - b.endTime;
        });
        break;
      case 'newest':
      default:
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }

    return items;
  }, [auctions, search, category, sort]);

  return (
    <div className="app">
      <Navbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        lang={lang}
        setLang={setLang}
        connected={connected}
        itemCount={filteredItems.length}
      />

      <main className="main-content">
        {/* Filters Bar */}
        <div className="filters-bar">
          <CategoryFilter
            categories={categories}
            selected={category}
            onSelect={setCategory}
            counts={categoryCounts}
            lang={lang}
          />
        </div>

        {/* Loading State & Empty State */}
        {loading ? (
          <div className="skeleton-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>{lang === 'th' ? 'ไม่พบรายการที่ต้องการ' : 'No items found'}</h3>
            <p>{lang === 'th' ? 'ลองเลือกหมวดหมู่หรือคำค้นหาอื่นดูอีกครั้งครับ' : 'Try adjusting your filters or search terms.'}</p>
          </div>
        ) : (
          <AuctionGrid items={filteredItems} lang={lang} />
        )}
      </main>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-card" onClick={() => setToasts(t => t.filter(x => x.id !== toast.id))}>
            <div className="toast-icon">⚡</div>
            <div className="toast-content">
              <h4 className="toast-title">{toast.title}</h4>
              <p className="toast-msg">{toast.message}</p>
            </div>
            <div className="toast-close">✕</div>
          </div>
        ))}
      </div>
    </div>
  );
}
