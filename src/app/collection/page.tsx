"use client";

import { useState } from 'react';
import { mockPhotography } from '@/data/photography';
import PhotographyGrid from '@/components/photography/PhotographyGrid';

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState<'Owned' | 'Created' | 'Listed'>('Owned');

  // Hardcoded mock user wallet address to match the mock data
  const MOCK_WALLET = "0x7737...70b7";
  
  const ownedPhotography = mockPhotography.filter(p => p.ownerAddress === MOCK_WALLET);
  const createdPhotography = mockPhotography.filter(p => p.creatorAddress === MOCK_WALLET);
  const listedPhotography = ownedPhotography.slice(0, 1); // Mock 1 listed
  
  let currentDisplay = ownedPhotography;
  if (activeTab === 'Created') currentDisplay = createdPhotography;
  if (activeTab === 'Listed') currentDisplay = listedPhotography;

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Stats */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-12 shadow-xl shadow-black/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">My Collection</h1>
              <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950 w-fit px-4 py-2 rounded-full border border-zinc-800/50 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-mono text-sm">{MOCK_WALLET}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
              <div className="text-left md:text-center">
                <p className="text-zinc-500 text-sm font-medium mb-1">Owned</p>
                <p className="text-3xl font-bold text-white">{ownedPhotography.length}</p>
              </div>
              <div className="text-left md:text-center">
                <p className="text-zinc-500 text-sm font-medium mb-1">Created</p>
                <p className="text-3xl font-bold text-white">{createdPhotography.length}</p>
              </div>
              <div className="text-left md:text-center">
                <p className="text-zinc-500 text-sm font-medium mb-1">Listed</p>
                <p className="text-3xl font-bold text-white">{listedPhotography.length}</p>
              </div>
              <div className="text-left md:text-center">
                <p className="text-zinc-500 text-sm font-medium mb-1">Royalty Earned</p>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-sm">1.25 ETH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800/80 mb-10 overflow-x-auto scrollbar-hide">
          {(['Owned', 'Created', 'Listed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-base font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Grid or Empty State */}
        {currentDisplay.length > 0 ? (
          <PhotographyGrid items={currentDisplay} />
        ) : (
          <div className="py-24 text-center bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center shadow-xl shadow-black/20">
             <svg className="text-zinc-800 mb-6" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <h3 className="text-2xl font-bold text-white mb-2">Nothing here yet</h3>
            <p className="text-zinc-400 mb-8 max-w-sm">
              {activeTab === 'Owned' && "You don't own any photography yet. Explore the marketplace to start your collection."}
              {activeTab === 'Created' && "You haven't created any photography yet. Turn your photos into digital collectibles."}
              {activeTab === 'Listed' && "You don't have any artworks listed for sale at the moment."}
            </p>
            {activeTab === 'Owned' && (
              <a href="/marketplace" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Explore Marketplace
              </a>
            )}
            {activeTab === 'Created' && (
              <a href="/create" className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-8 py-3 rounded-full font-semibold transition-colors">
                Create Artwork
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
