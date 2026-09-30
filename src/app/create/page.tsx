"use client";

import { useState } from 'react';

export default function CreatePage() {
  const [royalty, setRoyalty] = useState(5);

  return (
    <div className="min-h-screen bg-zinc-950 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Create Photography</h1>
          <p className="text-xl text-zinc-400">Turn your photography into a digital collectible.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form */}
          <div className="w-full lg:w-2/3">
            <form className="space-y-8 bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-white font-medium mb-3">Upload Image *</label>
                <div className="border-2 border-dashed border-zinc-700 bg-zinc-950/50 hover:bg-zinc-800/50 hover:border-purple-500/50 transition-colors rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer group">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-900/40 group-hover:text-purple-400 transition-colors text-zinc-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  </div>
                  <p className="text-white font-medium mb-1">Click or drag image to upload</p>
                  <p className="text-zinc-500 text-sm">PNG, JPG, WEBP. Max 20MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-3">Title *</label>
                  <input type="text" placeholder="e.g. Sunset in Da Nang" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white font-medium mb-3">Description *</label>
                  <textarea rows={4} placeholder="Describe the story behind your photograph..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans resize-none"></textarea>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-3">Category *</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                    <option value="" disabled selected>Select a category</option>
                    <option>Nature</option>
                    <option>Portrait</option>
                    <option>Landscape</option>
                    <option>Street</option>
                    <option>Architecture</option>
                    <option>Travel</option>
                    <option>Abstract</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-3">License *</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer">
                    <option>Personal Use</option>
                    <option>Commercial Use</option>
                    <option>Extended License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">Price (ETH) *</label>
                  <input type="number" step="0.01" min="0" placeholder="e.g. 0.5" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans" />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-white font-medium">Creator Royalty *</label>
                    <span className="text-purple-400 font-semibold text-lg">{royalty}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={royalty} 
                    onChange={(e) => setRoyalty(parseInt(e.target.value))}
                    className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-1" 
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>1%</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-4 rounded-xl transition-colors shadow-lg shadow-purple-900/20 active:scale-[0.99] flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                  Create Artwork
                </button>
              </div>
            </form>
          </div>

          {/* Preview Card */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 self-start">
            <h2 className="text-white font-bold text-xl mb-6">Preview</h2>
            <div className="pointer-events-none opacity-80 filter saturate-50 grayscale-[50%]">
              <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col h-full shadow-2xl">
                {/* Placeholder Image */}
                <div className="relative aspect-[4/3] bg-zinc-950 flex flex-col items-center justify-center text-zinc-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  <span className="text-sm">Image Preview</span>
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold text-white border border-white/10 z-10">
                    Category
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 pr-2">
                      <h3 className="text-lg font-bold text-white mb-1 truncate">Untitled Artwork</h3>
                      <p className="text-sm text-zinc-400 truncate">by You</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 flex items-center justify-between border-t border-zinc-800">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Price</p>
                      <p className="text-sm font-semibold text-white">-- ETH</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 mb-0.5">Creator Royalty</p>
                      <p className="text-sm font-semibold text-purple-400">{royalty}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-zinc-500 text-sm mt-6 text-center">Fill in the form to see your artwork preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}
