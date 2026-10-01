import Link from 'next/link';
import Container from '@/components/ui/Container';
import { ArrowRightIcon } from '@/components/ui/icons';
import Reveal from '@/components/ui/Reveal';
import { serif } from '@/lib/fonts';
import { cn } from '@/lib/format';
import type { Photography } from '@/types/photography';
import PhotographyGrid from './PhotographyGrid';

export default function FeaturedPhotography({ items }: { items: Photography[] }) {
  return (
    <section className="py-20 lg:py-28">
      <Container>
        <Reveal className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Tuyển chọn</p>
            <h2 className={cn(serif.className, 'text-4xl text-white md:text-5xl')}>Tác phẩm nổi bật</h2>
            <p className="mt-3 max-w-xl text-zinc-400">Những tác phẩm được chọn lọc từ các nhiếp ảnh gia khắp Việt Nam.</p>
          </div>
          <Link href="/marketplace" className="group inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
            Xem tất cả
            <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <PhotographyGrid items={items.slice(0, 4)} />
      </Container>
    </section>
  );
}
