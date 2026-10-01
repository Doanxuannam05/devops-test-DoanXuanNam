'use client';

import { useState } from 'react';
import { CheckIcon, CopyIcon } from '@/components/ui/icons';
import { formatAddress } from '@/lib/format';

export default function AddressPill({ address, live }: { address: string; live?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked – ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={address}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-sm text-zinc-300 transition-colors hover:text-white"
    >
      {live && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
      {formatAddress(address)}
      {copied ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} className="text-zinc-500" />}
      <span className="sr-only">{copied ? 'Đã sao chép' : 'Sao chép địa chỉ'}</span>
    </button>
  );
}
