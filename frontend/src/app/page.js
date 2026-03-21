'use client';

import { useState, useMemo } from 'react';
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

  // Extract unique categories from auctions
  const categories = useMemo(() => {
    const cats = new Set();
    auctions.forEach(item => {
      if (item.channel) cats.add(item.channel);
    });
    return Array.from(cats).sort();
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
            lang={lang}
          />
          <SortSelect value={sort} onChange={setSort} lang={lang} />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t(lang, 'loading')}</p>
          </div>
        ) : (
          <AuctionGrid items={filteredItems} lang={lang} />
        )}
      </main>
    </div>
  );
}
