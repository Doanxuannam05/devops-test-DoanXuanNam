import Image from 'next/image';
import Link from 'next/link';
import { Photography } from '@/types/photography';

interface PhotographyCardProps {
  photography: Photography;
}

export default function PhotographyCard({ photography }: PhotographyCardProps) {
  return (
    <Link href={`/photo/${photography.id}`} className="group block h-full">
      <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 hover:border-purple-500/50 flex flex-col h-full">
        {/* Image wrapper */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image 
            src={photography.image} 
            alt={photography.title} 
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white border border-white/10 z-10">
            {photography.category}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <div className="min-w-0 pr-2">
              <h3 className="text-lg font-bold text-white mb-1 truncate">{photography.title}</h3>
              <p className="text-sm text-zinc-400 truncate">by {photography.creator}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md mb-1 inline-block">
                Token #{photography.tokenId.toString().padStart(3, '0')}
              </span>
            </div>
          </div>
          
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-800">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Price</p>
              <p className="text-sm font-semibold text-white">{photography.price.toFixed(2)} ETH</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500 mb-0.5">Creator Royalty</p>
              <p className="text-sm font-semibold text-purple-400">{photography.royalty}%</p>
            </div>
          </div>
          
          <button className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-sm font-medium transition-colors group-hover:bg-purple-600">
            View Artwork
          </button>
        </div>
      </div>
    </Link>
  );
}
