"use client";
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-purple-500">Photo</span>Chain
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/marketplace" className="text-zinc-400 hover:text-white transition-colors">Explore</Link>
              <Link href="/create" className="text-zinc-400 hover:text-white transition-colors">Create</Link>
              <Link href="/collection" className="text-zinc-400 hover:text-white transition-colors">Collection</Link>
            </div>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full transition-colors font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 7.59l-9.74 3.73A2 2 0 0 1 2 20.13V8"/><path d="M22 13v9a2 2 0 0 1-2 2H6"/></svg>
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button className="p-2 text-zinc-400" aria-label="Search">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white p-2">
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-900 border-b border-zinc-800">
          <div className="px-4 pt-2 pb-6 flex flex-col">
            <Link href="/marketplace" className="text-zinc-300 hover:text-white block py-3" onClick={() => setIsOpen(false)}>Explore</Link>
            <Link href="/create" className="text-zinc-300 hover:text-white block py-3" onClick={() => setIsOpen(false)}>Create</Link>
            <Link href="/collection" className="text-zinc-300 hover:text-white block py-3" onClick={() => setIsOpen(false)}>Collection</Link>
            <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white w-full py-3 rounded-xl transition-colors mt-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5 7.59l-9.74 3.73A2 2 0 0 1 2 20.13V8"/><path d="M22 13v9a2 2 0 0 1-2 2H6"/></svg>
              <span>Connect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
