import { Photography } from '@/types/photography';
import PhotographyCard from './PhotographyCard';

interface PhotographyGridProps {
  items: Photography[];
}

export default function PhotographyGrid({ items }: PhotographyGridProps) {
  if (items.length === 0) {
    return (
      <div className="py-20 text-center bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <h3 className="text-xl font-medium text-white mb-2">No photography found</h3>
        <p className="text-zinc-400">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <PhotographyCard key={item.id} photography={item} />
      ))}
    </div>
  );
}
