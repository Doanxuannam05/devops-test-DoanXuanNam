import { cn } from '@/lib/format';

export default function Stat({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="truncate font-mono text-xl text-white sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-zinc-500">{label}</p>
    </div>
  );
}
