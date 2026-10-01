export const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

/** 0x7737a1...70b7 -> 0x7737…70b7 */
export const formatAddress = (address?: string) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

export const sameAddress = (a?: string | null, b?: string | null) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

export const formatEth = (value: number, digits = 2) =>
  `${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: 4 })} ETH`;

export const formatTokenId = (id: number) => `#${id.toString().padStart(3, '0')}`;

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
