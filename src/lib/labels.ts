import type { Category, License } from '@/types/photography';

/** Vietnamese display labels. Internal values stay in English so data & contracts don't change. */
export const CATEGORY_LABELS: Record<Category, string> = {
  Nature: 'Thiên nhiên',
  Portrait: 'Chân dung',
  Landscape: 'Phong cảnh',
  Street: 'Đường phố',
  Architecture: 'Kiến trúc',
  Travel: 'Du lịch',
  Abstract: 'Trừu tượng',
};

export const LICENSE_LABELS: Record<License, string> = {
  'Personal Use': 'Sử dụng cá nhân',
  'Commercial Use': 'Sử dụng thương mại',
  'Extended License': 'Giấy phép mở rộng',
};

export const categoryLabel = (c: Category | 'All') => (c === 'All' ? 'Tất cả' : CATEGORY_LABELS[c]);
