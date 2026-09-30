import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mb-4">
              <span className="text-purple-500">Photo</span>Chain
            </Link>
            <p className="text-zinc-400 text-sm">
              Own the Moment. Support the Creator.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link href="/marketplace" className="hover:text-purple-400 transition-colors">Marketplace</Link></li>
              <li><Link href="/create" className="hover:text-purple-400 transition-colors">Create</Link></li>
              <li><Link href="/collection" className="hover:text-purple-400 transition-colors">Collection</Link></li>
              <li><Link href="/profile" className="hover:text-purple-400 transition-colors">Profile</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>NFT</li>
              <li>Blockchain</li>
              <li>Creator Royalties</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Social</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">
          <p>© {new Date().getFullYear()} PhotoChain. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
