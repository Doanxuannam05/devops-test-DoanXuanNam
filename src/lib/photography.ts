import { mockCreators, mockPhotography, mockSales } from '@/data/photography';
import type { Address, Photography, Sale } from '@/types/photography';
import { formatAddress, sameAddress } from './format';

export const getPhotoById = (id: string, list: Photography[] = mockPhotography) => list.find((p) => p.id === id);

export const getCreator = (address?: string) =>
  mockCreators.find((c) => sameAddress(c.address, address));

/** Display name for any wallet: creator name if known, otherwise short address. */
export const getDisplayName = (address?: string) =>
  getCreator(address)?.name ?? formatAddress(address);

export const getCreatedBy = (address?: string, list: Photography[] = mockPhotography) =>
  list.filter((p) => sameAddress(p.creatorAddress, address));

export const getOwnedBy = (address?: string, list: Photography[] = mockPhotography) =>
  list.filter((p) => sameAddress(p.ownerAddress, address));

export const getListedBy = (address?: string, list: Photography[] = mockPhotography) =>
  getOwnedBy(address, list).filter((p) => p.isListed);

export const getSalesFor = (photoId: string, sales: Sale[] = mockSales) =>
  sales
    .filter((s) => s.photoId === photoId)
    .sort((a, b) => b.date.localeCompare(a.date));

/** Royalty is only paid on secondary sales (seller is not the creator). */
const royaltyOf = (photo: Photography, seller: Address, price: number) =>
  sameAddress(seller, photo.creatorAddress) ? 0 : (price * photo.royalty) / 100;

export const getRoyaltiesEarned = (
  address?: string,
  sales: Sale[] = mockSales,
  photos: Photography[] = mockPhotography,
) =>
  sales.reduce((sum, s) => {
    const photo = getPhotoById(s.photoId, photos);
    if (!photo || !sameAddress(photo.creatorAddress, address)) return sum;
    return sum + (s.royalty ?? royaltyOf(photo, s.from, s.price));
  }, 0);

export const getMarketStats = (photos: Photography[] = mockPhotography, sales: Sale[] = mockSales) => {
  const royaltiesPaid = sales.reduce((sum, s) => {
    const photo = getPhotoById(s.photoId, photos);
    return photo ? sum + (s.royalty ?? royaltyOf(photo, s.from, s.price)) : sum;
  }, 0);
  const creators = new Set(photos.map((p) => p.creatorAddress.toLowerCase()));
  const avgRoyalty = photos.reduce((sum, p) => sum + p.royalty, 0) / Math.max(photos.length, 1);

  return {
    artworks: photos.length,
    creators: creators.size,
    royaltiesPaid,
    avgRoyalty,
  };
};
