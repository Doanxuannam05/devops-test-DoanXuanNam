import type { ReactNode } from 'react';
import EmptyState from '@/components/ui/EmptyState';
import Reveal from '@/components/ui/Reveal';
import type { Photography } from '@/types/photography';
import PhotographyCard from './PhotographyCard';

interface PhotographyGridProps {
  items: Photography[];
  /** Custom empty state; defaults to a generic "no results" message. */
  empty?: ReactNode;
  /** Hiện khung chờ khi dữ liệu (on-chain) đang tải lần đầu */
  loading?: boolean;
}

export default function PhotographyGrid({ items, empty, loading }: PhotographyGridProps) {
  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/5] rounded-2xl bg-white/5" />
            <div className="mt-3 h-4 w-2/3 rounded bg-white/5" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Reveal variant="fade">
        {empty ?? (
          <EmptyState title="Không tìm thấy tác phẩm nào" description="Hãy thử thể loại hoặc từ khóa khác." />
        )}
      </Reveal>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, i) => (
        // Stagger by column so each row "ripples" in from left to right.
        <Reveal key={item.id} delay={(i % 4) * 90}>
          <PhotographyCard photography={item} />
        </Reveal>
      ))}
    </div>
  );
}
