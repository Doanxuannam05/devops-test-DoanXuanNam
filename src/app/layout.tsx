import type { Metadata } from 'next';
import ChainStatusBanner from '@/components/chain/ChainStatusBanner';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { WalletProvider } from '@/components/wallet/WalletProvider';
import { sans } from '@/lib/fonts';
import { cn } from '@/lib/format';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'PhotoChain — Sở hữu khoảnh khắc', template: '%s · PhotoChain' },
  description: 'Sưu tầm ảnh nghệ thuật gốc trên blockchain. Nhiếp ảnh gia nhận tiền bản quyền mỗi lần tác phẩm được bán lại.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="scroll-pt-20 bg-zinc-950 [color-scheme:dark]">
      <body className={cn(sans.className, 'flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-violet-500/30')}>
        <SmoothScroll />
        <WalletProvider>
          <Navbar />
          <ChainStatusBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </WalletProvider>
      </body>
    </html>
  );
}
