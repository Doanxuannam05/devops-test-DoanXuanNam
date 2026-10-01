'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/format';

type Variant = 'up' | 'fade' | 'scale';

interface RevealProps {
  children: ReactNode;
  /** Delay in ms – use for staggering items in a row/grid. */
  delay?: number;
  /** up = fade + slide up (default), fade = opacity only, scale = fade + slight zoom-in */
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
}

const hidden: Record<Variant, string> = {
  up: 'translate-y-8',
  fade: '',
  scale: 'scale-[0.96]',
};

/**
 * Fades its content in when it scrolls into view (once).
 * - Uses IntersectionObserver + a data attribute → no React re-render, cheap even for big grids.
 * - Respects "reduce motion": content is shown immediately without animation.
 */
export default function Reveal({ children, delay = 0, variant = 'up', className, style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.visible = 'true';
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.visible = 'true';
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible="false"
      style={{ transitionDelay: `${delay}ms`, ...style }}
      className={cn(
        'opacity-0 transition-[opacity,translate,scale,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
        hidden[variant],
        'data-[visible=true]:translate-y-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100',
        'motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
    >
      {children}
    </div>
  );
}
