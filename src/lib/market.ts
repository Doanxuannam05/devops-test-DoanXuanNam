import { formatEther, parseEther, type EventLog, type Log } from 'ethers';
import { useMemo, useSyncExternalStore } from 'react';
import { CONTRACT_ADDRESS } from '@/data/photography';
import {
  CONTRACT_ADDRESS as CHAIN_CONTRACT,
  DEPLOY_BLOCK,
  IS_ONCHAIN,
  NODE_DOWN_MESSAGE,
  encodeMetadata,
  getReadContract,
  getReadProvider,
  getWriteContract,
  readMetadata,
  resolveIpfs,
  toFriendlyError,
  type TokenMetadata,
} from './chain';
import * as demo from './localArtworks';
import {
  CATEGORIES,
  LICENSES,
  type Address,
  type Category,
  type License,
  type Photography,
  type Sale,
} from '@/types/photography';

/**
 * Nguồn dữ liệu duy nhất cho toàn bộ UI.
 *  - Có NEXT_PUBLIC_CONTRACT_ADDRESS → đọc/ghi smart contract qua MetaMask (on-chain).
 *  - Không có → chế độ demo, lưu trong localStorage như trước.
 */
export { IS_ONCHAIN };

export interface MarketData {
  photos: Photography[];
  sales: Sale[];
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  mode: 'onchain' | 'demo';
}

/* ================================================================ on-chain */

const INITIAL: MarketData = { photos: [], sales: [], status: 'loading', error: null, mode: 'onchain' };
let state: MarketData = INITIAL;
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let started = false;

function setState(patch: Partial<MarketData>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const asCategory = (v: unknown): Category =>
  CATEGORIES.includes(v as Category) ? (v as Category) : 'Abstract';
const asLicense = (v: unknown): License =>
  LICENSES.includes(v as License) ? (v as License) : 'Personal Use';

async function loadFromChain() {
  const provider = getReadProvider();
  if ((await provider.getCode(CHAIN_CONTRACT)) === '0x') {
    throw new Error(
      `Không có contract tại ${CHAIN_CONTRACT}. Hardhat node có thể đã khởi động lại – hãy chạy "npm run deploy" trong thư mục blockchain rồi khởi động lại web.`,
    );
  }
  const contract = getReadContract();
  const total = Number(await contract.totalMinted());

  const photos = await Promise.all(
    Array.from({ length: total }, (_, i) => i + 1).map(async (id): Promise<Photography> => {
      const t = await contract.getToken(id);
      const meta: TokenMetadata = await readMetadata(t.uri).catch(() => ({}));
      const props = meta.properties ?? {};
      return {
        id: String(id),
        tokenId: id,
        title: meta.name || `Tác phẩm #${id}`,
        description: meta.description ?? '',
        image: resolveIpfs(meta.image),
        creatorAddress: t.creator as Address,
        ownerAddress: t.owner as Address,
        contractAddress: CHAIN_CONTRACT,
        price: Number(formatEther(t.price)),
        royalty: Number(t.royaltyBps) / 100,
        category: asCategory(props.category),
        license: asLicense(props.license),
        isListed: t.price > BigInt(0),
        exif: (props.exif as Photography['exif']) ?? undefined,
      };
    }),
  );

  const events = (await contract.queryFilter(contract.filters.Sold(), DEPLOY_BLOCK)).filter(
    (e: EventLog | Log): e is EventLog => 'args' in e,
  );
  const timestamps = new Map<number, number>();
  await Promise.all(
    [...new Set(events.map((e) => e.blockNumber))].map(async (n) => {
      const block = await provider.getBlock(n);
      timestamps.set(n, block?.timestamp ?? 0);
    }),
  );
  const sales: Sale[] = events.map((e) => ({
    photoId: String(e.args.tokenId),
    from: e.args.from as Address,
    to: e.args.to as Address,
    price: Number(formatEther(e.args.price)),
    royalty: Number(formatEther(e.args.royalty)),
    date: new Date((timestamps.get(e.blockNumber) ?? 0) * 1000).toISOString(),
    txHash: e.transactionHash,
  }));

  return { photos: photos.reverse(), sales };
}

/** Tải lại dữ liệu từ blockchain (tự gọi sau mỗi giao dịch, mỗi 15 giây và khi quay lại tab). */
export function refreshMarket(): Promise<void> {
  if (!IS_ONCHAIN) return Promise.resolve();
  inflight ??= loadFromChain()
    .then((data) => setState({ ...data, status: 'ready', error: null }))
    .catch((err) => {
      const msg = err instanceof Error && err.message.startsWith('Không có contract') ? err.message : toFriendlyError(err);
      setState({ status: 'error', error: msg || NODE_DOWN_MESSAGE });
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    void refreshMarket();
    window.setInterval(() => void refreshMarket(), 15_000);
    window.addEventListener('focus', () => void refreshMarket());
  }
  return () => listeners.delete(listener);
}

function useOnchainMarket(): MarketData {
  return useSyncExternalStore(subscribe, () => state, () => INITIAL);
}

/* ==================================================================== demo */

function useDemoMarket(): MarketData {
  const data = demo.useMarketData();
  return useMemo(() => ({ ...data, status: 'ready' as const, error: null, mode: 'demo' as const }), [data]);
}

/** Dữ liệu chợ ảnh (on-chain hoặc demo, tuỳ cấu hình). */
export const useMarketData: () => MarketData = IS_ONCHAIN ? useOnchainMarket : useDemoMarket;

export { useIsClient, isLocalArtwork, removeArtwork, resetDemoData } from './localArtworks';

/* ================================================================= actions */

export interface MintInput {
  file: File;
  title: string;
  description: string;
  category: Category;
  license: License;
  price: string; // ETH, dạng chuỗi từ ô nhập
  royalty: number; // %
}

export interface TxResult {
  id: string;
  txHash?: string;
}

async function uploadImage(dataUrl: string) {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(body.error ?? 'Tải ảnh lên thất bại.');
  return new URL(body.url, window.location.origin).href;
}

/** Tạo tác phẩm: on-chain → upload ảnh, mint qua MetaMask; demo → lưu localStorage. */
export async function mintArtwork(input: MintInput, demoWallet: Address): Promise<TxResult> {
  const dataUrl = await demo.fileToDataUrl(input.file);

  if (!IS_ONCHAIN) {
    const tokenId = demo.nextTokenId();
    const photo: Photography = {
      id: `local-${tokenId}-${Date.now().toString(36)}`,
      tokenId,
      title: input.title,
      description: input.description,
      image: dataUrl,
      creatorAddress: demoWallet,
      ownerAddress: demoWallet,
      contractAddress: CONTRACT_ADDRESS,
      price: Number(input.price),
      royalty: input.royalty,
      category: input.category,
      license: input.license,
      isListed: true,
    };
    demo.addArtwork(photo);
    return { id: photo.id };
  }

  const image = await uploadImage(dataUrl);
  const uri = encodeMetadata({
    name: input.title,
    description: input.description,
    image,
    properties: { category: input.category, license: input.license },
  });
  const contract = await getWriteContract();
  const tx = await contract.mint(uri, BigInt(Math.round(input.royalty * 100)), parseEther(input.price));
  const receipt = await tx.wait();

  let tokenId = '';
  for (const log of receipt?.logs ?? []) {
    const parsed = contract.interface.parseLog(log);
    if (parsed?.name === 'Minted') tokenId = String(parsed.args.tokenId);
  }
  await refreshMarket();
  return { id: tokenId, txHash: tx.hash };
}

export async function buyArtwork(photo: Photography, demoBuyer: Address): Promise<TxResult> {
  if (!IS_ONCHAIN) {
    demo.buyArtwork(photo, demoBuyer);
    return { id: photo.id };
  }
  const contract = await getWriteContract();
  const price: bigint = await contract.priceOf(photo.tokenId); // giá mới nhất, tránh lệch làm tròn
  const tx = await contract.buy(photo.tokenId, { value: price });
  await tx.wait();
  await refreshMarket();
  return { id: photo.id, txHash: tx.hash };
}

export async function listArtwork(photo: Photography, price: string): Promise<TxResult> {
  if (!IS_ONCHAIN) {
    demo.setListing(photo.id, true, Number(price));
    return { id: photo.id };
  }
  const contract = await getWriteContract();
  const tx = await contract.list(photo.tokenId, parseEther(price));
  await tx.wait();
  await refreshMarket();
  return { id: photo.id, txHash: tx.hash };
}

export async function unlistArtwork(photo: Photography): Promise<TxResult> {
  if (!IS_ONCHAIN) {
    demo.setListing(photo.id, false, photo.price);
    return { id: photo.id };
  }
  const contract = await getWriteContract();
  const tx = await contract.unlist(photo.tokenId);
  await tx.wait();
  await refreshMarket();
  return { id: photo.id, txHash: tx.hash };
}

export { toFriendlyError };
