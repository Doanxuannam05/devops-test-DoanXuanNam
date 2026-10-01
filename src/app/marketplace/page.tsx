'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import CategoryFilter, { type CategoryOption } from '@/components/photography/CategoryFilter';
import PhotographyGrid from '@/components/photography/PhotographyGrid';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Reveal from '@/components/ui/Reveal';
import { SearchIcon } from '@/components/ui/icons';
import { serif } from '@/lib/fonts';
import { cn } from '@/lib/format';
import { useMarketData } from '@/lib/market';
import { CATEGORY_LABELS } from '@/lib/labels';
import { getDisplayName } from '@/lib/photography';
import { CATEGORIES } from '@/types/photography';
import { buttonClasses } from '@/components/ui/Button';

const PAGE_SIZE = 16;

type Sort = 'newest' | 'price-asc' | 'price-desc';

function Marketplace() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
  const [category, setCategory] = useState<CategoryOption>('All');
  const [sort, setSort] = useState<Sort>('newest');
  const [listedOnly, setListedOnly] = useState(false);
  const { photos: all, status } = useMarketData();

  // Keep in sync when searching from the navbar while already on this page.
  // (React-recommended "adjust state during render" pattern – no effect needed.)
  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const counts = useMemo(() => {
    const c: Partial<Record<CategoryOption, number>> = { All: all.length };
    CATEGORIES.forEach((cat) => (c[cat] = all.filter((p) => p.category === cat).length));
    return c;
  }, [all]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = all.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (listedOnly && !p.isListed) return false;
      if (!q) return true;
      return [p.title, p.description, p.category, CATEGORY_LABELS[p.category], getDisplayName(p.creatorAddress)].some((f) => f.toLowerCase().includes(q));
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return b.tokenId - a.tokenId;
    });
  }, [all, query, category, sort, listedOnly]);

  // Hiển thị dần từng trang; đổi bộ lọc thì quay về trang đầu (điều chỉnh state ngay khi render).
  const filterKey = `${query}|${category}|${sort}|${listedOnly}`;
  const [page, setPage] = useState({ key: filterKey, count: PAGE_SIZE });
  if (page.key !== filterKey) setPage({ key: filterKey, count: PAGE_SIZE });
  const visible = items.slice(0, page.count);
  const remaining = items.length - visible.length;

  const reset = () => {
    setQuery('');
    setCategory('All');
    setListedOnly(false);
  };

  return (
    <Container className="py-12 lg:py-16">
      <Reveal className="mb-10">
        <header>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Chợ ảnh</p>
          <h1 className={cn(serif.className, 'text-5xl text-white md:text-6xl')}>Khám phá tác phẩm</h1>
        </header>
      </Reveal>

      <div className="sticky top-16 z-30 -mx-4 mb-10 space-y-4 border-b border-white/10 bg-zinc-950/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <SearchIcon size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <label htmlFor="market-search" className="sr-only">Tìm kiếm</label>
            <input
              id="market-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên ảnh, tác giả, địa danh…"
              className="h-11 w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-white/25 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/10 px-4 text-sm text-zinc-300">
              <input type="checkbox" checked={listedOnly} onChange={(e) => setListedOnly(e.target.checked)} className="accent-white" />
              Chỉ ảnh đang bán
            </label>
            <label htmlFor="sort" className="sr-only">Sắp xếp</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 rounded-full border border-white/10 bg-zinc-950 px-4 text-sm text-zinc-300 focus:border-white/25 focus:outline-none"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: thấp đến cao</option>
              <option value="price-desc">Giá: cao đến thấp</option>
            </select>
          </div>
        </div>
        <CategoryFilter activeCategory={category} onSelectCategory={setCategory} counts={counts} />
      </div>

      <p className="mb-6 text-sm text-zinc-500">
        {items.length} kết quả
        {remaining > 0 && ` · đang hiện ${visible.length}`}
      </p>

      <PhotographyGrid
        items={visible}
        loading={status === 'loading'}
        empty={
          <EmptyState
            title="Không tìm thấy tác phẩm nào"
            description="Hãy thử thể loại hoặc từ khóa khác."
            action={
              <button type="button" onClick={reset} className="text-sm text-white underline underline-offset-4">
                Xóa tất cả bộ lọc
              </button>
            }
          />
        }
      />

      {remaining > 0 && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setPage((p) => ({ ...p, count: p.count + PAGE_SIZE }))}
            className={buttonClasses('secondary', 'lg')}
          >
            Xem thêm {Math.min(remaining, PAGE_SIZE)} tác phẩm
          </button>
        </div>
      )}
    </Container>
  );
}

export default function MarketplacePage() {
  // useSearchParams must be wrapped in Suspense for static rendering (Next 14/15).
  return (
    <Suspense fallback={<Container className="py-16 text-zinc-500">Đang tải…</Container>}>
      <Marketplace />
    </Suspense>
  );
}
