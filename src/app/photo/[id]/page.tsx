import Image from 'next/image';
import Link from 'next/link';
import { mockPhotography } from '@/data/photography';
import { notFound } from 'next/navigation';

export default async function PhotographyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const photo = mockPhotography.find((p) => p.id === resolvedParams.id);
  
  if (!photo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/marketplace" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Marketplace
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Column: Image */}
          <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-[50vh] min-h-[400px] lg:h-[70vh] self-start max-h-[800px]">
            <div className="relative w-full h-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-900/10">
              <Image 
                src={photo.image}
                alt={photo.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
          
          {/* Right Column: Details */}
          <div className="w-full lg:w-1/2">
            <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-purple-400 mb-6">
              {photo.category}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{photo.title}</h1>
            <p className="text-xl text-zinc-400 mb-8">by <span className="text-white hover:text-purple-400 hover:underline cursor-pointer transition-colors">{photo.creator}</span></p>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
              <h2 className="text-sm font-medium text-zinc-500 mb-2">Description</h2>
              <p className="text-zinc-300 mb-6 leading-relaxed">
                {photo.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-800">
                <div>
                  <h2 className="text-sm font-medium text-zinc-500 mb-1">Price</h2>
                  <p className="text-2xl md:text-3xl font-bold text-white">{photo.price.toFixed(2)} ETH</p>
                </div>
                <div className="min-w-0 pr-2">
                  <h2 className="text-sm font-medium text-zinc-500 mb-1">Owner</h2>
                  <p className="text-sm md:text-base font-mono text-zinc-300 truncate" title={photo.owner}>
                    {photo.ownerAddress}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20 active:scale-[0.98]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 7.59l-9.74 3.73A2 2 0 0 1 2 20.13V8"/><path d="M22 13v9a2 2 0 0 1-2 2H6"/></svg>
                Buy Now
              </button>
              <Link href="/collection" className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center active:scale-[0.98]">
                View Collection
              </Link>
            </div>
            
            <div className="space-y-6">
              {/* Royalty Info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="text-purple-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <h3 className="text-lg font-bold text-white">Royalty Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-zinc-500 mb-1">Creator Royalty</p>
                    <p className="text-lg font-semibold text-white">{photo.royalty}%</p>
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="text-sm text-zinc-500 mb-1">Creator Address</p>
                    <p className="text-sm md:text-base font-mono text-zinc-300 truncate" title={photo.creatorAddress}>{photo.creatorAddress}</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                  Royalty is paid to the creator when this artwork is resold.
                </p>
              </div>
              
              {/* Blockchain Info */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                 <div className="flex items-center gap-3 mb-6">
                  <svg className="text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                  <h3 className="text-lg font-bold text-white">Blockchain Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <span className="text-zinc-500 text-sm">Token ID</span>
                    <span className="text-white font-mono text-sm max-w-[60%] truncate text-right">#{photo.tokenId.toString().padStart(3, '0')}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <span className="text-zinc-500 text-sm">Contract</span>
                    <span className="text-white font-mono text-sm max-w-[60%] truncate text-right" title={photo.contractAddress}>{photo.contractAddress}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <span className="text-zinc-500 text-sm">Network</span>
                    <span className="text-white text-sm max-w-[60%] truncate text-right">Test Network</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0 last:pb-0">
                    <span className="text-zinc-500 text-sm">License</span>
                    <span className="text-white text-sm max-w-[60%] text-right">{photo.license}</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
