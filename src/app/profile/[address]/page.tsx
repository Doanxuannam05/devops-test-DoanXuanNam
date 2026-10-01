'use client';

import { useParams } from 'next/navigation';
import AddressPill from '@/components/profile/AddressPill';
import Avatar from '@/components/profile/Avatar';
import PortfolioView from '@/components/profile/PortfolioView';
import Container from '@/components/ui/Container';
import EmptyState from '@/components/ui/EmptyState';
import { useWallet } from '@/components/wallet/WalletProvider';
import { serif } from '@/lib/fonts';
import { cn, formatAddress, sameAddress } from '@/lib/format';
import { getCreator } from '@/lib/photography';
import type { Address } from '@/types/photography';

const isAddress = (v: string): v is Address => /^0x[0-9a-fA-F]{40}$/.test(v);

export default function ProfilePage() {
  const params = useParams<{ address: string }>();
  const raw = decodeURIComponent(params.address ?? '');
  const { address: connected } = useWallet();

  if (!isAddress(raw)) {
    return (
      <Container className="py-24">
        <EmptyState title="Địa chỉ ví không hợp lệ" description="Hãy kiểm tra lại đường dẫn." />
      </Container>
    );
  }

  const creator = getCreator(raw);
  const name = creator?.name ?? formatAddress(raw);
  const isSelf = sameAddress(raw, connected);

  return (
    <Container className="py-12 lg:py-16">
      <PortfolioView
        key={raw}
        address={raw}
        isSelf={isSelf}
        defaultTab="created"
        tabsOrder={['created', 'owned', 'listed']}
        header={
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar address={raw} name={creator?.name ?? 'P'} className="h-24 w-24 md:h-28 md:w-28" />
            <div className="min-w-0">
              <h1 className={cn(serif.className, 'truncate text-5xl text-white md:text-6xl')}>{name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <AddressPill address={raw} />
                {isSelf && <span className="text-xs text-zinc-500">Đây là bạn</span>}
              </div>
              {creator?.bio && <p className="mt-4 max-w-xl leading-relaxed text-zinc-400">{creator.bio}</p>}
            </div>
          </div>
        }
      />
    </Container>
  );
}
