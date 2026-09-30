"use client";

import { useState } from 'react';
import { mockPhotography } from '@/data/photography';
import CategoryFilter from '@/components/photography/CategoryFilter';
import PhotographyGrid from '@/components/photography/PhotographyGrid';

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Featured');
  
  // Filter logic
  const filteredItems = mockPhotography.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  // Sort logic (Mock implementation)
  if (sortBy === 'Price: Low to High') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'Price: High to Low') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'Newest') {
    filteredItems.sort((a, b) => b.tokenId - a.tokenId);
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Photography</h1>
          <p className="text-zinc-400 text-lg">Discover unique photographs from independent creators.</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-10 justify-between items-start lg:items-center">
          <div className="w-full lg:w-1/3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search photography..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-sans"
              />
              <svg className="absolute left-3 top-3.5 text-zinc-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          
          <div className="w-full lg:w-2/3 flex flex-col sm:flex-row justify-end gap-4 overflow-hidden">
            <div className="flex-grow sm:flex-grow-0 min-w-0">
              <CategoryFilter 
                activeCategory={activeCategory} 
                onSelectCategory={setActiveCategory} 
              />
            </div>
            
            <div className="shrink-0">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full sm:w-auto h-[46px]"
              >
                <option value="Featured">Featured</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Grid */}
        <PhotographyGrid items={filteredItems} />
      </div>
    </div>
  );
}
