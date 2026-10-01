'use client';

import { cn } from '@/lib/format';
import { categoryLabel } from '@/lib/labels';
import { CATEGORIES, type Category } from '@/types/photography';

export type CategoryOption = Category | 'All';
const OPTIONS: CategoryOption[] = ['All', ...CATEGORIES];

interface CategoryFilterProps {
  activeCategory: CategoryOption;
  onSelectCategory: (category: CategoryOption) => void;
  counts?: Partial<Record<CategoryOption, number>>;
}

export default function CategoryFilter({ activeCategory, onSelectCategory, counts }: CategoryFilterProps) {
  return (
    <div
      role="group"
      aria-label="Lọc theo thể loại"
      className="flex w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {OPTIONS.map((category) => {
        const active = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={active}
            onClick={() => onSelectCategory(category)}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm transition-colors',
              active
                ? 'border-white bg-white text-zinc-950'
                : 'border-white/10 text-zinc-400 hover:border-white/25 hover:text-white',
            )}
          >
            {categoryLabel(category)}
            {counts?.[category] !== undefined && (
              <span className={cn('font-mono text-[11px]', active ? 'text-zinc-500' : 'text-zinc-600')}>
                {counts[category]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
