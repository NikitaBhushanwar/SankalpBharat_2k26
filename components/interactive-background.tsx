'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function InteractiveBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 15;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * 5,
      });
    }

    // Create particle elements
    particles.forEach((particle) => {
      const particleEl = document.createElement('div');
      particleEl.className = 'particle';
      particleEl.style.width = `${particle.size * 4}px`;
      particleEl.style.height = `${particle.size * 4}px`;
      particleEl.style.left = `${particle.x}%`;
      particleEl.style.bottom = `-${particle.size * 4}px`;
      particleEl.style.animationDuration = `${particle.duration}s`;
      particleEl.style.animationDelay = `${particle.delay}s`;
      containerRef.current?.appendChild(particleEl);
    });

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return <div ref={containerRef} className="floating-particles" />;
}
