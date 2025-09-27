// components/RevealOnce.jsx
import { useEffect, useRef, useState } from "react";

/**
 * Props:
 * - as: elemen wrapper (default 'div')
 * - variant: 'up' | 'down' | 'left' | 'right' | 'zoom'
 * - distance: jarak awal px (default 20)
 * - delay: ms (default 0)
 * - duration: ms (default 700)
 * - className: kelas tambahan
 */
export default function RevealOnce({
  //   as: Tag = "div",
  variant = "up",
  distance = 20,
  delay = 0,
  duration = 700,
  className = "",
  children,
  style,
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Respect reduced motion
    const preferNoMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (preferNoMotion) {
      setShown(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect(); // << hanya sekali
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hiddenTransform = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    zoom: `scale(0.96)`,
  }[variant];

  const base = {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : hiddenTransform,
    transition: `transform ${duration}ms cubic-bezier(.2,.7,.2,1) ${delay}ms, opacity ${duration}ms ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <Tag ref={ref} className={className} style={{ ...base, ...style }}>
      {children}
    </Tag>
  );
}
