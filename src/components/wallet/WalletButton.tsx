'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { buttonClasses } from '@/components/ui/Button';
import { WalletIcon } from '@/components/ui/icons';
import { cn, formatAddress } from '@/lib/format';
import { useWallet } from './WalletProvider';

export default function WalletButton({ className, fullWidth }: { className?: string; fullWidth?: boolean }) {
  const { address, status, error, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!address) {
    return (
      <div className={cn(fullWidth && 'w-full')}>
        <button
          type="button"
          onClick={connect}
          disabled={status === 'connecting'}
          title={error ?? undefined}
          className={buttonClasses('secondary', 'sm', cn(fullWidth && 'w-full h-11', className))}
        >
          <WalletIcon size={16} />
          {status === 'connecting' ? 'Đang kết nối…' : 'Kết nối ví'}
        </button>
        {error && fullWidth && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', fullWidth && 'w-full')}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={buttonClasses('secondary', 'sm', cn('font-mono', fullWidth && 'w-full h-11', className))}
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        {formatAddress(address)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-1 shadow-2xl"
        >
          <Link role="menuitem" href={`/profile/${address}`} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white">
            Hồ sơ của tôi
          </Link>
          <Link role="menuitem" href="/collection" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white">
            Bộ sưu tập của tôi
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => {
              disconnect();
              setOpen(false);
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
          >
            Ngắt kết nối
          </button>
        </div>
      )}
    </div>
  );
}
