export type Address = `0x${string}`;

export const CATEGORIES = [
  'Nature',
  'Portrait',
  'Landscape',
  'Street',
  'Architecture',
  'Travel',
  'Abstract',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const LICENSES = ['Personal Use', 'Commercial Use', 'Extended License'] as const;
export type License = (typeof LICENSES)[number];

export interface Exif {
  camera: string;
  lens?: string;
  aperture: string; // "f/1.8"
  shutter: string; // "1/250s"
  iso: number;
  focalLength: string; // "35mm"
}

export interface Photography {
  id: string;
  tokenId: number;
  title: string;
  description: string;
  image: string;
  creatorAddress: Address;
  ownerAddress: Address;
  contractAddress: Address;
  price: number; // ETH
  royalty: number; // percent, 0–10
  category: Category;
  license: License;
  isListed: boolean;
  exif?: Exif;
}

export interface Creator {
  address: Address;
  name: string;
  bio: string;
}

export interface Sale {
  photoId: string;
  from: Address;
  to: Address;
  price: number; // ETH
  date: string; // ISO date
  /** Royalty actually paid (ETH) – known for on-chain sales */
  royalty?: number;
  txHash?: string;
}
