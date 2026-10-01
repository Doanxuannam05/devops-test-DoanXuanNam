import { cn } from '@/lib/format';

/** Deterministic gradient avatar from a wallet address. */
export default function Avatar({ address, name, className }: { address: string; name?: string; className?: string }) {
  const hue = parseInt(address.slice(2, 8), 16) % 360;
  return (
    <div
      aria-hidden
      className={cn('flex shrink-0 items-center justify-center rounded-full text-3xl font-semibold text-white ring-1 ring-white/15', className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 60) % 360} 70% 35%))` }}
    >
      {name?.[0]?.toUpperCase()}
    </div>
  );
}
