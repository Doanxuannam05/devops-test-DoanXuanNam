'use client';

import 'lenis/dist/lenis.css';
import { ReactLenis, useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** Respect the OS "reduce motion" setting (Windows: Settings → Accessibility → Visual effects → Animation effects). */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION);
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

/** On route change: stop any running inertia and start the new page at the top. */
function ResetOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (!lenis || previous.current === pathname) return;
    previous.current = pathname;
    if (window.location.hash) return; // let "/#section" links land on their section
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [lenis, pathname]);

  return null;
}

/**
 * Smooth (inertia) scrolling for mouse wheel / trackpad on desktop.
 * Touch devices keep their native scrolling, which is already smooth.
 */
export default function SmoothScroll() {
  const reducedMotion = usePrefersReducedMotion();
  if (reducedMotion) return null;

  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.09, // lower = smoother / floatier (0.05–0.15 is a good range)
        wheelMultiplier: 1,
        anchors: { offset: -80 }, // same-page "#section" links glide and stop below the sticky navbar
        allowNestedScroll: true, // textareas, dropdowns and other inner scroll areas keep working
      }}
    >
      <ResetOnNavigate />
    </ReactLenis>
  );
}
