import Link from 'next/link';
import Container from '@/components/ui/Container';
import Logo from '@/components/ui/Logo';

const COLUMNS = [
  {
    title: 'Chợ ảnh',
    links: [
      { href: '/marketplace', label: 'Khám phá' },
      { href: '/create', label: 'Tạo tác phẩm' },
      { href: '/collection', label: 'Bộ sưu tập của tôi' },
      { href: '/profile', label: 'Hồ sơ' },
    ],
  },
  {
    title: 'Tìm hiểu',
    links: [
      { href: '/#how-it-works', label: 'Cách hoạt động' },
      { href: '/#royalties', label: 'Tiền bản quyền' },
    ],
  },
];

/** Thêm link thật vào đây – cột sẽ ẩn khi danh sách trống (không còn href="#"). */
const SOCIALS: { href: string; label: string }[] = [
  // { href: 'https://github.com/your-org/photochain', label: 'GitHub' },
  // { href: 'https://x.com/photochain', label: 'X / Twitter' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              Chợ ảnh nghệ thuật gốc trên blockchain. Sở hữu khoảnh khắc, ủng hộ người sáng tạo.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">{col.title}</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-zinc-300 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {SOCIALS.length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Cộng đồng</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {SOCIALS.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-zinc-300 transition-colors hover:text-white">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8 text-sm text-zinc-600">
          © {new Date().getFullYear()} PhotoChain. Bảo lưu mọi quyền.
        </div>
      </Container>
    </footer>
  );
}
