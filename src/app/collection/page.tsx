'use client';

import AddressPill from '@/components/profile/AddressPill';
import PortfolioView from '@/components/profile/PortfolioView';
import Container from '@/components/ui/Container';
import { useWallet } from '@/components/wallet/WalletProvider';
import { DEMO_WALLET } from '@/data/photography';
import { IS_ONCHAIN, resetDemoData } from '@/lib/market';
import { serif } from '@/lib/fonts';
import { cn } from '@/lib/format';

export default function CollectionPage() {
  const { address, connect } = useWallet();
  const current = address ?? DEMO_WALLET;
  const isDemo = !address;

  return (
    <Container className="py-12 lg:py-16">
      {isDemo && (
        <div className="mb-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm sm:flex-row sm:items-center">
          <p className="text-zinc-400">
            <span className="mr-2 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-300">Demo</span>
            Bạn đang xem một ví mẫu. Hãy kết nối ví của bạn để xem bộ sưu tập của mình.
          </p>
          <button type="button" onClick={connect} className="font-medium text-white underline underline-offset-4">
            Kết nối ví
          </button>
        </div>
      )}

      <PortfolioView
        key={current}
        address={current}
        isSelf
        header={
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Danh mục</p>
            <h1 className={cn(serif.className, 'mb-4 text-5xl text-white md:text-6xl')}>Bộ sưu tập của tôi</h1>
            <AddressPill address={current} live={!isDemo} />
          </div>
        }
      />

      {!IS_ONCHAIN && (
      <div className="mt-16 border-t border-white/10 pt-6 text-center">
        <button
          type="button"
          onClick={() => {
            if (confirm('Xóa toàn bộ tác phẩm, giao dịch và tin rao bán demo đã lưu trong trình duyệt này?')) resetDemoData();
          }}
          className="text-xs text-zinc-600 hover:text-red-400"
        >
          Xóa dữ liệu demo
        </button>
      </div>
      )}
    </Container>
  );
}
