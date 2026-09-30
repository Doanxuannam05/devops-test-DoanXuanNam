"use client";

import { useState } from 'react';
import { mockPhotography } from '@/data/photography';
import PhotographyGrid from '@/components/photography/PhotographyGrid';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'Created' | 'Owned'>('Created');

  const CREATOR_NAME = "Nam";
  const CREATOR_WALLET = "0x7737...70b7";
  const BIO = "Photography creator exploring landscapes, cities and everyday moments. Seeking the light in the mundane.";
  
  const createdPhotography = mockPhotography.filter(p => p.creator === CREATOR_NAME);
  const ownedPhotography = mockPhotography.filter(p => p.ownerAddress === CREATOR_WALLET);
  
  let currentDisplay = createdPhotography;
  if (activeTab === 'Owned') currentDisplay = ownedPhotography;

  return (
    <div className="min-h-screen bg-zinc-950 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-16 px-4 md:px-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 p-1 shrink-0 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-950 overflow-hidden">
               <span className="text-4xl md:text-5xl font-bold text-white tracking-widest pl-2">N</span>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">{CREATOR_NAME}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-400 bg-zinc-900 w-fit px-4 py-1.5 rounded-full border border-zinc-800/50 mb-6 mx-auto md:mx-0 shadow-inner">
              <span className="font-mono text-sm">{CREATOR_WALLET}</span>
            </div>
            <p className="text-zinc-300 text-lg md:text-xl max-w-2xl leading-relaxed mb-10 italic">
              &quot;{BIO}&quot;
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10 p-6 md:p-0 bg-zinc-900 md:bg-transparent rounded-2xl md:rounded-none border border-zinc-800 md:border-none">
              <div>
                <p className="text-2xl font-bold text-white">{createdPhotography.length}</p>
                <p className="text-zinc-500 text-sm font-medium">Created</p>
              </div>
              <div className="pl-6 border-l border-zinc-800">
                <p className="text-2xl font-bold text-white">{ownedPhotography.length}</p>
                <p className="text-zinc-500 text-sm font-medium">Owned</p>
              </div>
              <div className="pl-6 border-l border-zinc-800">
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-zinc-500 text-sm font-medium">Listed</p>
              </div>
              <div className="pl-6 border-l border-zinc-800">
                <p className="text-2xl font-bold text-purple-400">1.25 ETH</p>
                <p className="text-zinc-500 text-sm font-medium">Royalties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center md:justify-start border-b border-zinc-800/80 mb-10 overflow-x-auto scrollbar-hide">
          {(['Created', 'Owned'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-base font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab 
                  ? 'text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab} Photography
              {activeTab === tab && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {currentDisplay.length > 0 ? (
          <PhotographyGrid items={currentDisplay} />
        ) : (
          <div className="py-24 text-center bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center">
            <svg className="text-zinc-800 mb-6" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <h3 className="text-2xl font-bold text-white mb-2">No photography</h3>
            <p className="text-zinc-400 mb-4 max-w-sm">This creator has no {activeTab.toLowerCase()} photography.</p>
          </div>
        )}
      </div>
    </div>
  );
}
