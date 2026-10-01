'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import PhotographyGrid from '@/components/photography/PhotographyGrid';
import Avatar from '@/components/profile/Avatar';
import Button, { buttonClasses } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import Reveal from '@/components/ui/Reveal';
import { useWallet } from '@/components/wallet/WalletProvider';
import { serif } from '@/lib/fonts';
import { cn, formatAddress, formatDate, formatEth, formatTokenId, sameAddress } from '@/lib/format';
import { DEMO_WALLET } from '@/data/photography';
import { canOptimize } from '@/components/photography/PhotographyCard';
import {
  IS_ONCHAIN,
  buyArtwork,
  isLocalArtwork,
  listArtwork,
  removeArtwork,
  toFriendlyError,
  unlistArtwork,
  useIsClient,
  useMarketData,
} from '@/lib/market';
import { CATEGORY_LABELS, LICENSE_LABELS } from '@/lib/labels';
import { getDisplayName, getPhotoById, getSalesFor } from '@/lib/photography';

function Person({ label, address }: { label: string; address: string }) {
  return (
    <Link href={`/profile/${address}`} className="group flex items-center gap-3">
      <Avatar address={address} name={getDisplayName(address)} className="h-10 w-10 text-sm" />
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm text-white group-hover:underline">{getDisplayName(address)}</p>
      </div>
    </Link>
  );
}

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { photos: all, sales: allSales, status: dataStatus } = useMarketData();
  const isClient = useIsClient();
  const photo = getPhotoById(id, all);
  const { address, connect, status } = useWallet();
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [listPrice, setListPrice] = useState('');

  // Dữ liệu on-chain / tác phẩm demo chỉ có ở trình duyệt – đừng báo "không tìm thấy" khi đang tải.
  if (!photo && (!isClient || dataStatus === 'loading')) {
    return <Container className="py-24 text-zinc-500">Đang tải…</Container>;
  }

  if (!photo) {
    return (
      <Container className="py-24">
        <EmptyState
          title="Không tìm thấy tác phẩm"
          description="Tác phẩm có thể đã bị xóa hoặc đường dẫn không đúng."
          action={<Link href="/marketplace" className={buttonClasses('primary')}>Quay lại chợ ảnh</Link>}
        />
      </Container>
    );
  }

  const sales = getSalesFor(photo.id, allSales);
  // Demo không có ví → dùng ví mẫu. On-chain bắt buộc phải có ví thật.
  const me = address ?? (!IS_ONCHAIN && status === 'unavailable' ? DEMO_WALLET : null);
  const isOwner = sameAddress(photo.ownerAddress, me);
  const more = all.filter((p) => p.id !== photo.id && p.category === photo.category).slice(0, 4);

  /** Chạy một giao dịch: hiện trạng thái chờ MetaMask, báo thành công / lỗi dễ hiểu. */
  const run = async (action: () => Promise<{ txHash?: string }>, success: string) => {
    setBusy(true);
    setNotice({ tone: 'info', text: IS_ONCHAIN ? 'Hãy xác nhận giao dịch trong MetaMask…' : 'Đang xử lý…' });
    try {
      const { txHash } = await action();
      setNotice({ tone: 'ok', text: txHash ? `${success} (tx ${txHash.slice(0, 10)}…)` : success });
      return true;
    } catch (err) {
      setNotice({ tone: 'error', text: toFriendlyError(err) });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onBuy = async () => {
    if (!me) return connect();
    if (!IS_ONCHAIN && !confirm(`Mua “${photo.title}” với giá ${formatEth(photo.price)}?\n\nChế độ demo: không có ETH thật nào được gửi đi.`)) return;
    await run(() => buyArtwork(photo, me), 'Mua thành công! Tác phẩm đã nằm trong bộ sưu tập của bạn.');
  };

  const onList = async () => {
    const value = listPrice || (photo.price > 0 ? String(photo.price) : '');
    const price = Number(value);
    if (!value || !Number.isFinite(price) || price < 0.001) {
      return setNotice({ tone: 'error', text: 'Giá tối thiểu là 0.001 ETH.' });
    }
    const ok = await run(() => listArtwork(photo, value), `Đã rao bán với giá ${formatEth(price)}.`);
    if (ok) setListPrice('');
  };

  const onUnlist = () => run(() => unlistArtwork(photo), 'Đã ngừng rao bán.');

  return (
    <>
      <Container className="py-10 lg:py-14">
        <Link href="/marketplace" className="mb-8 inline-block text-sm text-zinc-500 hover:text-white">
          ← Quay lại chợ ảnh
        </Link>

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <Reveal variant="scale">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10 lg:aspect-auto lg:h-full lg:min-h-[640px]">
              {photo.image && (
                <Image src={photo.image} alt={photo.title} fill loading="eager" fetchPriority="high" unoptimized={!canOptimize(photo.image)} sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
              )}
            </div>
          </Reveal>

          <Reveal delay={150} className="flex flex-col">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">{CATEGORY_LABELS[photo.category]}</span>
              <span className="font-mono">{formatTokenId(photo.tokenId)}</span>
            </div>

            <h1 className={cn(serif.className, 'mt-4 text-5xl leading-tight text-white md:text-6xl')}>{photo.title}</h1>
            <p className="mt-4 leading-relaxed text-zinc-400">{photo.description}</p>

            <div className="mt-8 flex flex-wrap gap-8">
              <Person label="Tác giả" address={photo.creatorAddress} />
              <Person label="Chủ sở hữu" address={photo.ownerAddress} />
            </div>

            {/* Price box */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs uppercase tracking-wider text-zinc-500">{photo.isListed ? 'Giá' : 'Trạng thái'}</p>
              <p className="mt-1 font-mono text-3xl text-white">{photo.isListed ? formatEth(photo.price) : 'Không bán'}</p>
              <div className="mt-6">
                {isOwner ? (
                  photo.isListed ? (
                    <Button variant="secondary" size="lg" className="w-full" disabled={busy} onClick={onUnlist}>
                      {busy ? 'Đang xử lý…' : 'Ngừng rao bán'}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <label htmlFor="list-price" className="sr-only">Giá rao bán</label>
                        <input
                          id="list-price"
                          type="number"
                          inputMode="decimal"
                          min="0.001"
                          step="0.001"
                          value={listPrice}
                          onChange={(e) => setListPrice(e.target.value)}
                          placeholder={photo.price > 0 ? photo.price.toString() : '0.5'}
                          className="h-12 w-full rounded-full border border-white/10 bg-zinc-950 pl-5 pr-14 font-mono text-white placeholder:text-zinc-600 focus:border-white/30 focus:outline-none"
                        />
                        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm text-zinc-500">ETH</span>
                      </div>
                      <Button variant="accent" size="lg" disabled={busy} onClick={onList}>
                        {busy ? 'Đang xử lý…' : 'Rao bán'}
                      </Button>
                    </div>
                  )
                ) : (
                  <Button variant="accent" size="lg" className="w-full" disabled={!photo.isListed || busy} onClick={onBuy}>
                    {busy
                      ? 'Đang chờ giao dịch…'
                      : !photo.isListed
                        ? 'Chưa rao bán'
                        : me
                          ? `Mua với giá ${formatEth(photo.price)}`
                          : 'Kết nối ví để mua'}
                  </Button>
                )}
                {isOwner && <p className="mt-3 text-center text-xs text-zinc-500">Bạn đang sở hữu tác phẩm này.</p>}
                {notice && (
                  <p
                    role="status"
                    className={cn(
                      'mt-3 text-center text-sm',
                      notice.tone === 'ok' && 'text-emerald-300',
                      notice.tone === 'error' && 'text-red-300',
                      notice.tone === 'info' && 'text-zinc-400',
                    )}
                  >
                    {notice.text}
                  </p>
                )}
                {isLocalArtwork(photo.id) && isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirm('Xóa tác phẩm demo này khỏi trình duyệt?')) return;
                      removeArtwork(photo.id);
                      router.push('/collection');
                    }}
                    className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-red-400"
                  >
                    Xóa tác phẩm demo
                  </button>
                )}
              </div>
              <p className="mt-4 text-xs text-zinc-500">
                {getDisplayName(photo.creatorAddress)} nhận {photo.royalty}% mỗi lần tác phẩm được bán lại trên PhotoChain.
              </p>
            </div>

            {/* Details */}
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                ['Giấy phép', LICENSE_LABELS[photo.license]],
                ['Bản quyền', `${photo.royalty}%`],
                ['Hợp đồng', formatAddress(photo.contractAddress)],
                ['Token ID', formatTokenId(photo.tokenId)],
                ...(photo.exif
                  ? [
                      ['Máy ảnh', photo.exif.camera],
                      ['Thông số', `${photo.exif.focalLength} · ${photo.exif.aperture} · ${photo.exif.shutter} · ISO ${photo.exif.iso}`],
                    ]
                  : []),
              ].map(([k, v]) => (
                <div key={k} className="border-t border-white/10 pt-3">
                  <dt className="text-zinc-500">{k}</dt>
                  <dd className="mt-1 font-mono text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* History */}
        <Reveal className="mt-20">
        <section>
          <h2 className={cn(serif.className, 'mb-6 text-3xl text-white')}>Lịch sử sở hữu</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-zinc-500">Chưa có giao dịch — tác phẩm vẫn thuộc về tác giả.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500">
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 font-medium">Người bán</th>
                    <th className="px-5 py-3 font-medium">Người mua</th>
                    <th className="px-5 py-3 text-right font-medium">Giá</th>
                    <th className="px-5 py-3 text-right font-medium">Bản quyền</th>
                    <th className="px-5 py-3 text-right font-medium">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s, i) => {
                    const secondary = !sameAddress(s.from, photo.creatorAddress);
                    return (
                      <tr key={s.txHash ?? `${s.date}-${s.from}-${i}`} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3 text-zinc-300">{getDisplayName(s.from)}</td>
                        <td className="px-5 py-3 text-zinc-300">{getDisplayName(s.to)}</td>
                        <td className="px-5 py-3 text-right font-mono text-white">{formatEth(s.price)}</td>
                        <td className="px-5 py-3 text-right font-mono text-zinc-400">
                          {secondary ? formatEth(s.royalty ?? (s.price * photo.royalty) / 100, 3) : '— bán lần đầu'}
                        </td>
                        <td className="px-5 py-3 text-right text-zinc-500">{formatDate(s.date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        </Reveal>
      </Container>

      {more.length > 0 && (
        <section className="border-t border-white/10 py-16">
          <Container>
            <Reveal>
              <h2 className={cn(serif.className, 'mb-10 text-3xl text-white')}>Thêm trong mục {CATEGORY_LABELS[photo.category]}</h2>
            </Reveal>
            <PhotographyGrid items={more} />
          </Container>
        </section>
      )}
    </>
  );
}
