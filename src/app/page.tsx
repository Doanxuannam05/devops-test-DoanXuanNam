'use client';

import Image from 'next/image';
import Link from 'next/link';
import FeaturedPhotography from '@/components/photography/FeaturedPhotography';
import { canOptimize } from '@/components/photography/PhotographyCard';
import { buttonClasses } from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { ArrowRightIcon } from '@/components/ui/icons';
import Reveal from '@/components/ui/Reveal';
import Stat from '@/components/ui/Stat';
import { serif } from '@/lib/fonts';
import { cn, formatEth } from '@/lib/format';
import { useMarketData } from '@/lib/market';
import { getDisplayName, getMarketStats } from '@/lib/photography';

const STEPS = [
  { n: '01', title: 'Tạo tác phẩm', desc: 'Tải ảnh lên, đặt giá và mức tiền bản quyền, rồi mint thành tác phẩm sưu tầm độc bản.' },
  { n: '02', title: 'Sưu tầm', desc: 'Nhà sưu tầm mua tác phẩm gốc, quyền sở hữu được ghi trên blockchain — ai cũng kiểm chứng được.' },
  { n: '03', title: 'Nhận tiền bản quyền', desc: 'Mỗi lần tác phẩm được bán lại trên PhotoChain, nhiếp ảnh gia tự động nhận phần bản quyền.' },
];

const STACK = [
  'left-0 top-14 -rotate-6',
  'left-1/2 top-0 z-10 -translate-x-1/2 rotate-1',
  'right-0 top-20 rotate-6',
];

export default function Home() {
  const { photos, sales } = useMarketData();
  const stats = getMarketStats(photos, sales);
  const heroItems = photos.filter((p) => p.image).slice(0, 3);
  const featured = photos.filter((p) => p.isListed);

  return (
    <>
      {/* Hero – staggered entrance on page load */}
      <section className="relative isolate overflow-x-clip">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(139,92,246,0.18),transparent_70%)]"
        />
        <Container className="grid items-center gap-16 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <Reveal variant="fade">
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                № 001 — Chợ ảnh phi tập trung
              </p>
            </Reveal>
            <Reveal delay={100}>
              <h1 className={cn(serif.className, 'text-5xl leading-[1.12] text-white sm:text-6xl lg:text-7xl')}>
                Sở hữu khoảnh khắc.
                <br />
                <span className="italic text-zinc-500">Tôn vinh người sáng tạo.</span>
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-8 max-w-md text-lg text-zinc-400">
                Sưu tầm ảnh nghệ thuật gốc trên blockchain. Nhiếp ảnh gia nhận tiền bản quyền mỗi khi tác phẩm được
                bán lại trên PhotoChain.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/marketplace" className={buttonClasses('primary', 'lg')}>
                  Khám phá tác phẩm <ArrowRightIcon size={18} />
                </Link>
                <Link href="/create" className={buttonClasses('secondary', 'lg')}>
                  Bắt đầu sáng tạo
                </Link>
              </div>
            </Reveal>
            <Reveal delay={420} variant="fade">
              <div className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
                <Stat label="Tác phẩm" value={stats.artworks} />
                <Stat label="Nhiếp ảnh gia" value={stats.creators} />
                <Stat label="Bản quyền đã trả" value={formatEth(stats.royaltiesPaid, 3)} />
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} variant="scale" className="hidden lg:block">
            <div className="relative mx-auto h-[520px] w-full max-w-lg">
              {heroItems.map((item, i) => (
                <Link
                  key={item.id}
                  href={`/photo/${item.id}`}
                  className={cn(
                    'group absolute w-60 rounded-2xl border border-white/10 bg-zinc-900 p-2 shadow-2xl shadow-black/60 transition duration-500 hover:z-20 hover:rotate-0 hover:scale-105',
                    STACK[i],
                  )}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      loading="eager"
                      unoptimized={!canOptimize(item.image)}
                      fetchPriority={i === 1 ? 'high' : 'auto'}
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between px-2 pb-1 pt-3 text-sm">
                    <span className="truncate text-zinc-400">{getDisplayName(item.creatorAddress)}</span>
                    <span className="font-mono text-white">{formatEth(item.price)}</span>
                  </div>
                  {item.exif && (
                    <p className="px-2 pb-1 font-mono text-[10px] text-zinc-600">
                      {item.exif.aperture} · {item.exif.shutter} · ISO {item.exif.iso}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <FeaturedPhotography items={featured} />

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-y border-white/10 bg-zinc-900/30 py-20 lg:py-28">
        <Container>
          <Reveal>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Quy trình</p>
            <h2 className={cn(serif.className, 'mb-14 text-4xl text-white md:text-5xl')}>PhotoChain hoạt động thế nào</h2>
          </Reveal>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} className="h-full">
                <div className="h-full rounded-2xl border border-white/10 bg-zinc-950 p-8 transition-colors hover:border-white/20 lg:p-10">
                  <span className="font-mono text-sm text-violet-400">{s.n}</span>
                  <h3 className="mt-6 text-xl font-medium text-white">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-zinc-400">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Royalties */}
      <section id="royalties" className="scroll-mt-20 py-20 lg:py-28">
        <Container>
          <Reveal variant="scale">
            <div className="grid items-center gap-12 rounded-3xl border border-white/10 bg-[radial-gradient(80%_80%_at_100%_0%,rgba(139,92,246,0.15),transparent_70%)] p-8 md:p-14 lg:grid-cols-2">
              <div>
                <h2 className={cn(serif.className, 'text-4xl text-white md:text-5xl')}>Tiền bản quyền cho tác giả</h2>
                <p className="mt-6 text-lg leading-relaxed text-zinc-400">
                  Mỗi tác phẩm lưu mức bản quyền ngay trên blockchain (chuẩn ERC-2981). Mỗi lần bán lại trên
                  PhotoChain, phần bản quyền được chuyển thẳng cho nhiếp ảnh gia — không hóa đơn, không trung gian.
                </p>
                <Link href="/create" className={buttonClasses('primary', 'md', 'mt-8')}>
                  Mint bức ảnh đầu tiên
                </Link>
              </div>
              <dl className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Bản quyền trung bình', value: `${stats.avgRoyalty.toFixed(1)}%` },
                  { label: 'Mức bản quyền', value: '0–10%' },
                  { label: 'Đã trả cho tác giả', value: formatEth(stats.royaltiesPaid, 3) },
                  { label: 'Tác giả nhận bản quyền', value: stats.creators },
                ].map((s, i) => (
                  <Reveal
                    key={s.label}
                    delay={200 + i * 100}
                    className="flex flex-col-reverse rounded-2xl border border-white/10 bg-zinc-950/60 p-6"
                  >
                    <dt className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{s.label}</dt>
                    <dd className="font-mono text-2xl text-white">{s.value}</dd>
                  </Reveal>
                ))}
              </dl>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
