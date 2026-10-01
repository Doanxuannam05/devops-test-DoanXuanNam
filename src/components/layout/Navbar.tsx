'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';
import { CloseIcon, MenuIcon, SearchIcon } from '@/components/ui/icons';
import WalletButton from '@/components/wallet/WalletButton';
import { cn } from '@/lib/format';

const NAV_LINKS = [
  { href: '/marketplace', label: 'Khám phá' },
  { href: '/create', label: 'Tạo tác phẩm' },
  { href: '/collection', label: 'Bộ sưu tập' },
];

function SearchForm({ className, autoFocus }: { className?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/marketplace?q=${encodeURIComponent(query)}` : '/marketplace');
  };

  return (
    <form role="search" onSubmit={onSubmit} className={cn('relative', className)}>
      <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
      <label htmlFor="nav-search" className="sr-only">Tìm kiếm ảnh</label>
      <input
        id="nav-search"
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm ảnh, nhiếp ảnh gia…"
        className="h-9 w-full rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder:text-zinc-500 focus:border-white/25 focus:outline-none"
      />
    </form>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  // The menu is "open for a given pathname" → it closes automatically when the route changes,
  // without a setState-in-effect.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const isOpen = openAt === pathname;
  const toggleMenu = () => setOpenAt(isOpen ? null : pathname);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/85 backdrop-blur-md">
      <Container>
        <nav className="flex h-16 items-center justify-between gap-6" aria-label="Điều hướng chính">
          <div className="flex items-center gap-10">
            <Logo />
            <ul className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm transition-colors',
                      isActive(link.href) ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
            <SearchForm className="w-full max-w-xs" />
            <WalletButton />
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
            className="rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            {isOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>
        </nav>
      </Container>

      {isOpen && (
        <div id="mobile-menu" className="border-t border-white/10 bg-zinc-950 md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <SearchForm className="mb-3" />
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'rounded-xl px-3 py-3 text-base',
                  isActive(link.href) ? 'bg-white/10 text-white' : 'text-zinc-300 hover:bg-white/5',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3">
              <WalletButton fullWidth />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
