import Link from 'next/link';
import { mockPhotography } from '@/data/photography';
import FeaturedPhotography from '@/components/photography/FeaturedPhotography';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wide uppercase mb-8">
              Decentralized Photography Marketplace
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-8">
              Own the Moment.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Support the Creator.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              Discover unique photography, collect digital art, and help creators earn royalties every time their work is resold.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace" className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-zinc-200 rounded-full font-bold text-lg transition-colors text-center">
                Explore Photography
              </Link>
              <Link href="/create" className="w-full sm:w-auto px-8 py-4 bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800 rounded-full font-bold text-lg transition-colors text-center">
                Create Artwork
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background gradient effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      </section>

      {/* Featured Photography */}
      <FeaturedPhotography items={mockPhotography} />

      {/* How it Works */}
      <section className="py-20 lg:py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How PhotoChain Works</h2>
            <p className="text-zinc-400 text-lg">A seamless marketplace for creators and collectors.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800 text-purple-400 font-bold text-2xl rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-700">01</div>
              <h3 className="text-xl font-bold text-white mb-3">Create</h3>
              <p className="text-zinc-400">Photographers upload their artwork and mint them as digital collectibles.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800 text-purple-400 font-bold text-2xl rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-700">02</div>
              <h3 className="text-xl font-bold text-white mb-3">Collect</h3>
              <p className="text-zinc-400">Collectors purchase unique photography with verified ownership.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-zinc-800 text-purple-400 font-bold text-2xl rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-700">03</div>
              <h3 className="text-xl font-bold text-white mb-3">Earn Royalties</h3>
              <p className="text-zinc-400">Creators automatically receive royalties when their artwork is resold.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Royalties */}
      <section className="py-20 lg:py-24 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Creator Royalties</h2>
              <p className="text-xl text-zinc-300 mb-8">
                Creators continue earning from secondary sales. Our smart contracts ensure creators get paid their fair share every time the artwork changes hands.
              </p>
              <Link href="/marketplace" className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold transition-colors">
                Discover More
              </Link>
            </div>
            <div className="w-full md:w-[40%] flex justify-center md:justify-end">
              <div className="w-48 h-48 md:w-56 md:h-56 bg-black border-4 border-purple-500/50 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.3)]">
                <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-200">5%</span>
                <span className="text-sm font-medium text-purple-300 mt-2 text-center leading-tight">Average<br />Creator Royalty</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
