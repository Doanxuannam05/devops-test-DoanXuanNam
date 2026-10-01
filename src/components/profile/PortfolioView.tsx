'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import PhotographyGrid from '@/components/photography/PhotographyGrid';
import { buttonClasses } from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Reveal from '@/components/ui/Reveal';
import Stat from '@/components/ui/Stat';
import Tabs from '@/components/ui/Tabs';
import { formatEth } from '@/lib/format';
import { useMarketData } from '@/lib/market';
import { getCreatedBy, getListedBy, getOwnedBy, getRoyaltiesEarned } from '@/lib/photography';
import type { Address } from '@/types/photography';

type TabId = 'owned' | 'created' | 'listed';

interface PortfolioViewProps {
  address: Address;
  /** true when viewing your own wallet – changes empty-state copy and CTAs */
  isSelf: boolean;
  header: ReactNode;
  defaultTab?: TabId;
  tabsOrder?: TabId[];
}

/** Shared body for /collection and /profile/[address] – one source of truth for stats, tabs and empty states. */
export default function PortfolioView({ address, isSelf, header, defaultTab = 'owned', tabsOrder = ['owned', 'created', 'listed'] }: PortfolioViewProps) {
  const [tab, setTab] = useState<TabId>(defaultTab);
  const { photos: all, sales, status } = useMarketData();

  const data: Record<TabId, ReturnType<typeof getOwnedBy>> = {
    owned: getOwnedBy(address, all),
    created: getCreatedBy(address, all),
    listed: getListedBy(address, all),
  };
  const royalties = getRoyaltiesEarned(address, sales, all);

  const labels: Record<TabId, string> = { owned: 'Đang sở hữu', created: 'Đã tạo', listed: 'Đang rao bán' };

  const empty: Record<TabId, ReactNode> = {
    owned: (
      <EmptyState
        title={isSelf ? 'Bạn chưa sở hữu tác phẩm nào' : 'Chưa sở hữu tác phẩm nào'}
        description={isSelf ? 'Khám phá chợ ảnh để bắt đầu bộ sưu tập của bạn.' : undefined}
        action={isSelf && <Link href="/marketplace" className={buttonClasses('primary')}>Khám phá chợ ảnh</Link>}
      />
    ),
    created: (
      <EmptyState
        title={isSelf ? 'Bạn chưa tạo tác phẩm nào' : 'Chưa tạo tác phẩm nào'}
        description={isSelf ? 'Biến ảnh của bạn thành tác phẩm sưu tầm số.' : undefined}
        action={isSelf && <Link href="/create" className={buttonClasses('primary')}>Tạo tác phẩm</Link>}
      />
    ),
    listed: (
      <EmptyState
        title="Chưa có tác phẩm nào đang rao bán"
        description={isSelf ? 'Rao bán một tác phẩm bạn sở hữu để bán trên chợ ảnh.' : undefined}
      />
    ),
  };

  return (
    <>
      <div className="mb-12 flex flex-col gap-10 border-b border-white/10 pb-12 lg:flex-row lg:items-end lg:justify-between">
        <Reveal>{header}</Reveal>
        <Reveal delay={150} variant="fade" className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4">
          <Stat label="Đang sở hữu" value={data.owned.length} />
          <Stat label="Đã tạo" value={data.created.length} />
          <Stat label="Đang rao bán" value={data.listed.length} />
          <Stat label="Bản quyền đã nhận" value={formatEth(royalties, 3)} />
        </Reveal>
      </div>

      <Tabs
        className="mb-10"
        value={tab}
        onChange={setTab}
        tabs={tabsOrder.map((id) => ({ id, label: labels[id], count: data[id].length }))}
      />

      <PhotographyGrid items={data[tab]} empty={empty[tab]} loading={status === 'loading'} />
    </>
  );
}
