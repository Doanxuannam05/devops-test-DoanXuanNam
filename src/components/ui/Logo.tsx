import Link from 'next/link';
import { ApertureIcon } from './icons';

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-white" aria-label="Trang chủ PhotoChain">
      <ApertureIcon size={22} className="text-violet-400" />
      <span className="text-lg font-semibold tracking-tight">PhotoChain</span>
    </Link>
  );
}
