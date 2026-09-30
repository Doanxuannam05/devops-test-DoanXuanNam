"use client";

const CATEGORIES = [
  'All',
  'Nature',
  'Portrait',
  'Landscape',
  'Street',
  'Architecture',
  'Travel',
  'Abstract'
];

interface CategoryFilterProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function CategoryFilter({ activeCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full max-w-full">
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
            activeCategory === category 
              ? 'bg-purple-600 border-purple-600 text-white' 
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
