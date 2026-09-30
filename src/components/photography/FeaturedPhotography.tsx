import { Photography } from '@/types/photography';
import PhotographyCard from './PhotographyCard';

interface FeaturedPhotographyProps {
  items: Photography[];
}

export default function FeaturedPhotography({ items }: FeaturedPhotographyProps) {
  return (
    <section className="py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Photography</h2>
            <p className="text-zinc-400 max-w-2xl text-lg">Discover the highest quality artworks hand-picked by our curators.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.slice(0, 4).map((item) => (
            <PhotographyCard key={item.id} photography={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
