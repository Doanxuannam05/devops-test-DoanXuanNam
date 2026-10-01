import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from '@/components/ui/icons';
import { formatEth } from '@/lib/format';
import { CATEGORY_LABELS } from '@/lib/labels';
import { getDisplayName } from '@/lib/photography';
import type { Photography } from '@/types/photography';

/** next/image chỉ tối ưu ảnh từ host đã khai báo; ảnh upload/local/data: hiển thị trực tiếp. */
export const canOptimize = (src?: string | null) => !!src && src.startsWith('https://images.unsplash.com/');

interface CardBodyProps {
  image?: string | null;
  title: string;
  creatorName: string;
  category?: string;
  price?: number | null;
  royalty: number;
  isListed?: boolean;
}

/** Pure visual card – reused by the grid AND by the live preview on /create. */
export function PhotoCardBody({ image, title, creatorName, category, price, royalty, isListed = true }: CardBodyProps) {
  const isBlob = !canOptimize(image);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/10">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            unoptimized={isBlob}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
            <ImageIcon size={36} />
            <span className="text-xs">Ảnh của bạn</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
            {category}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="truncate text-base font-semibold text-white">{title}</h3>
          <p className="truncate text-sm text-white/60">bởi {creatorName}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pt-3 text-sm">
        {isListed && price != null ? (
          <span className="font-mono text-white">{formatEth(price)}</span>
        ) : (
          <span className="text-zinc-500">Chưa rao bán</span>
        )}
        <span className="text-zinc-500">Bản quyền {royalty}%</span>
      </div>
    </div>
  );
}

export default function PhotographyCard({ photography: p }: { photography: Photography }) {
  return (
    <Link
      href={`/photo/${p.id}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-950"
    >
      <PhotoCardBody
        image={p.image}
        title={p.title}
        creatorName={getDisplayName(p.creatorAddress)}
        category={CATEGORY_LABELS[p.category]}
        price={p.price}
        royalty={p.royalty}
        isListed={p.isListed}
      />
    </Link>
  );
}
