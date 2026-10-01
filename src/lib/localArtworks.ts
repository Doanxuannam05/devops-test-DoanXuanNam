import { useSyncExternalStore } from 'react';
import { mockPhotography, mockSales } from '@/data/photography';
import type { Address, Photography, Sale } from '@/types/photography';

/**
 * Demo marketplace state stored in this browser's localStorage:
 *  - artworks created on /create
 *  - purchases made on /photo/[id]   (ownership transfer + sale history + royalties)
 *  - listing changes (list / unlist / new price)
 * Replace with real on-chain reads/writes once the contract is connected.
 */
const KEYS = {
  artworks: 'photochain:minted:v1',
  sales: 'photochain:sales:v1',
  listings: 'photochain:listings:v1',
} as const;
const CHANGE_EVENT = 'photochain:demo-change';

type Listing = { isListed: boolean; price: number };
type Listings = Record<string, Listing>;

export interface MarketData {
  photos: Photography[];
  sales: Sale[];
}

const SERVER_SNAPSHOT: MarketData = { photos: mockPhotography, sales: mockSales };

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const readArtworks = () => {
  const v = parse<unknown>(localStorage.getItem(KEYS.artworks), []);
  return Array.isArray(v) ? (v as Photography[]) : [];
};
const readSales = () => {
  const v = parse<unknown>(localStorage.getItem(KEYS.sales), []);
  return Array.isArray(v) ? (v as Sale[]) : [];
};
const readListings = () => parse<Listings>(localStorage.getItem(KEYS.listings), {});

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    throw new Error('Bộ nhớ trình duyệt đã đầy. Hãy xóa bớt tác phẩm demo rồi thử lại.');
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/* ---------- snapshot (cached so useSyncExternalStore gets a stable reference) ---------- */

let cacheKey: string | null = null;
let cache: MarketData = SERVER_SNAPSHOT;

function getClientSnapshot(): MarketData {
  const raws = [KEYS.artworks, KEYS.sales, KEYS.listings].map((k) => localStorage.getItem(k) ?? '');
  const key = raws.join('\u0000');
  if (key === cacheKey) return cache;
  cacheKey = key;

  const localSales = readSales();
  const listings = readListings();

  const photos = [...readArtworks(), ...mockPhotography].map((p) => {
    let photo = p;
    // Latest local purchase decides the current owner; a bought artwork is no longer for sale.
    const lastSale = [...localSales].reverse().find((s) => s.photoId === p.id);
    if (lastSale) photo = { ...photo, ownerAddress: lastSale.to, isListed: false };
    const listing = listings[p.id];
    if (listing) photo = { ...photo, ...listing };
    return photo;
  });

  cache = { photos, sales: [...mockSales, ...localSales] };
  return cache;
}

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange); // other tabs
  window.addEventListener(CHANGE_EVENT, onChange); // this tab
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Mock data + everything done in this browser (created, bought, listed). */
export function useMarketData(): MarketData {
  return useSyncExternalStore(subscribe, getClientSnapshot, () => SERVER_SNAPSHOT);
}

export function useAllPhotography() {
  return useMarketData().photos;
}

/** false during SSR / first hydration pass, true afterwards. */
export function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/* ---------- actions ---------- */

export const isLocalArtwork = (id: string) => id.startsWith('local-');

export function addArtwork(photo: Photography) {
  write(KEYS.artworks, [photo, ...readArtworks()]);
}

export function removeArtwork(id: string) {
  write(KEYS.artworks, readArtworks().filter((p) => p.id !== id));
  write(KEYS.sales, readSales().filter((s) => s.photoId !== id));
  const listings = readListings();
  delete listings[id];
  write(KEYS.listings, listings);
}

/** Demo purchase: records a sale from the current owner to the buyer at the listed price. */
export function buyArtwork(photo: Photography, buyer: Address) {
  const sale: Sale = {
    photoId: photo.id,
    from: photo.ownerAddress,
    to: buyer,
    price: photo.price,
    date: new Date().toISOString().slice(0, 10),
  };
  const listings = readListings();
  delete listings[photo.id];
  write(KEYS.listings, listings);
  write(KEYS.sales, [...readSales(), sale]);
}

export function setListing(id: string, isListed: boolean, price: number) {
  write(KEYS.listings, { ...readListings(), [id]: { isListed, price } });
}

/** Wipe all demo activity in this browser. */
export function resetDemoData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function nextTokenId() {
  return Math.max(0, ...readArtworks().map((p) => p.tokenId), ...mockPhotography.map((p) => p.tokenId)) + 1;
}

/** Downscale + JPEG-compress the upload so it fits in localStorage (~200–500 KB). */
export async function fileToDataUrl(file: File, maxSize = 1400, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không xử lý được ảnh.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
