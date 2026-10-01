'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Container from '@/components/ui/Container';
import { useWallet } from '@/components/wallet/WalletProvider';
import { DEMO_WALLET } from '@/data/photography';

/** /profile → /profile/<connected wallet> (or the demo wallet). */
export default function ProfileRedirect() {
  const router = useRouter();
  const { address } = useWallet();

  useEffect(() => {
    router.replace(`/profile/${address ?? DEMO_WALLET}`);
  }, [address, router]);

  return <Container className="py-24 text-zinc-500">Đang tải hồ sơ…</Container>;
}
