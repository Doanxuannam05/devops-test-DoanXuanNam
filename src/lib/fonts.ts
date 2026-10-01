import { Inter, Playfair_Display } from 'next/font/google';

// Both fonts include the Vietnamese subset so diacritics (ắ, ề, ộ, ữ…) render correctly.
export const sans = Inter({ subsets: ['latin', 'vietnamese'], display: 'swap' });

export const serif = Playfair_Display({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
});
