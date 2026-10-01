'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CHAIN_ID, IS_ONCHAIN, ensureChain } from '@/lib/chain';
import type { Address } from '@/types/photography';

/**
 * Minimal EIP-1193 wallet connection (MetaMask, Rabby, Coinbase extension…) with zero dependencies.
 * When you move to production, swap this for wagmi + RainbowKit/ConnectKit and keep the same `useWallet()` API.
 */
type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, cb: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, cb: (...args: unknown[]) => void) => void;
};

type Status = 'idle' | 'connecting' | 'connected' | 'unavailable';

interface WalletState {
  address: Address | null;
  status: Status;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  /** Chain hiện tại của ví (số thập phân), null nếu chưa biết */
  chainId: number | null;
  /** true khi web chạy on-chain nhưng ví đang ở mạng khác */
  wrongNetwork: boolean;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);
const STORAGE_KEY = 'photochain:disconnected';

const getProvider = () =>
  typeof window === 'undefined' ? undefined : (window as unknown as { ethereum?: Eip1193 }).ethereum;

const noopSubscribe = () => () => {};
/** true on the server (optimistic), real value on the client – without setState in an effect. */
const useHasProvider = () => useSyncExternalStore(noopSubscribe, () => !!getProvider(), () => true);

export function WalletProvider({ children }: { children: ReactNode }) {
  const hasProvider = useHasProvider();
  const [address, setAddress] = useState<Address | null>(null);
  const [connStatus, setStatus] = useState<Exclude<Status, 'unavailable'>>('idle');
  const [error, setError] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const status: Status = hasProvider ? connStatus : 'unavailable';
  const wrongNetwork = IS_ONCHAIN && !!address && chainId !== null && chainId !== CHAIN_ID;

  const applyAccounts = useCallback((accounts: unknown) => {
    const first = Array.isArray(accounts) ? (accounts[0] as Address | undefined) : undefined;
    setAddress(first ?? null);
    setStatus(first ? 'connected' : 'idle');
  }, []);

  // Silently restore an existing connection + listen for account switches.
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;
    if (localStorage.getItem(STORAGE_KEY) !== '1') {
      provider.request({ method: 'eth_accounts' }).then(applyAccounts).catch(() => {});
    }
    provider
      .request({ method: 'eth_chainId' })
      .then((id) => setChainId(Number(id)))
      .catch(() => {});
    const onAccountsChanged = (accounts: unknown) => applyAccounts(accounts);
    const onChainChanged = (id: unknown) => setChainId(Number(id));
    provider.on?.('accountsChanged', onAccountsChanged);
    provider.on?.('chainChanged', onChainChanged);
    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged);
      provider.removeListener?.('chainChanged', onChainChanged);
    };
  }, [applyAccounts]);

  const switchNetwork = useCallback(async () => {
    setError(null);
    try {
      await ensureChain();
    } catch {
      setError('Không chuyển được mạng. Hãy mở MetaMask và chọn mạng thủ công.');
    }
  }, []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setError('Không tìm thấy ví. Hãy cài MetaMask hoặc một ví trình duyệt khác.');
      return;
    }
    setStatus('connecting');
    setError(null);
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      localStorage.removeItem(STORAGE_KEY);
      applyAccounts(accounts);
      if (IS_ONCHAIN) await ensureChain().catch(() => {});
    } catch {
      setStatus('idle');
      setError('Yêu cầu kết nối đã bị từ chối.');
    }
  }, [applyAccounts]);

  const disconnect = useCallback(() => {
    // Injected wallets cannot be disconnected programmatically – we just forget the session locally.
    localStorage.setItem(STORAGE_KEY, '1');
    setAddress(null);
    setStatus('idle');
  }, []);

  const value = useMemo(
    () => ({ address, status, error, connect, disconnect, chainId, wrongNetwork, switchNetwork }),
    [address, status, error, connect, disconnect, chainId, wrongNetwork, switchNetwork],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
}
