"use client";

import { useEffect, useRef } from "react";

export default function CursorRevealBackground() {
  const topLayer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!topLayer.current) return;

      const x = e.clientX;
      const y = e.clientY;

      const mask = `radial-gradient(circle 220px at ${x}px ${y}px, transparent 85%, black 100%)`;

      topLayer.current.style.maskImage = mask;
      (topLayer.current.style as any).webkitMaskImage = mask;
    };

    window.addEventListener("pointermove", move);

    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden">

      {/* Bottom image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg2.webp')",
        }}
      />

      {/* Top image (masked) */}
      <div
        ref={topLayer}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bg1.webp')",
          maskImage:
            "radial-gradient(circle 220px at 50% 50%, transparent 85%, black 100%)",
          WebkitMaskImage:
            "radial-gradient(circle 220px at 50% 50%, transparent 85%, black 100%)",
        }}
      />
    </div>
  );
}