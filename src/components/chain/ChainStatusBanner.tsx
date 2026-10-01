'use client';

import Container from '@/components/ui/Container';
import { useWallet } from '@/components/wallet/WalletProvider';
import { CHAIN_NAME, IS_ONCHAIN } from '@/lib/chain';
import { useMarketData, useIsClient } from '@/lib/market';

/** Thanh thông báo trạng thái kết nối blockchain, hiện ngay dưới navbar khi có vấn đề. */
export default function ChainStatusBanner() {
  const isClient = useIsClient();
  const { status, error } = useMarketData();
  const { wrongNetwork, switchNetwork } = useWallet();

  if (!isClient) return null;

  if (!IS_ONCHAIN) {
    return (
      <Bar tone="amber">
        <b>Chế độ demo</b> – chưa kết nối smart contract nên giao dịch không đi qua MetaMask. Deploy contract (xem
        blockchain/README.md) rồi khởi động lại web.
      </Bar>
    );
  }
  if (status === 'error') {
    return (
      <Bar tone="red">
        <b>Lỗi blockchain:</b> {error}
      </Bar>
    );
  }
  if (wrongNetwork) {
    return (
      <Bar tone="amber">
        Ví đang ở mạng khác.{' '}
        <button type="button" onClick={switchNetwork} className="font-semibold underline underline-offset-4">
          Chuyển sang {CHAIN_NAME}
        </button>
      </Bar>
    );
  }
  return null;
}

function Bar({ tone, children }: { tone: 'red' | 'amber'; children: React.ReactNode }) {
  const styles =
    tone === 'red'
      ? 'border-red-500/20 bg-red-500/10 text-red-200'
      : 'border-amber-400/20 bg-amber-400/10 text-amber-100';
  return (
    <div role="status" className={`border-b ${styles}`}>
      <Container className="py-2.5 text-sm">{children}</Container>
    </div>
  );
}
