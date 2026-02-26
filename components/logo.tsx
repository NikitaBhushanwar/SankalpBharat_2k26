'use client';

import Image from 'next/image';

interface SBLogoProps {
  size?: number;
  showName?: boolean;
  nameWidth?: number;
}

export default function SBLogo({
  size = 500,
  showName = false,
  nameWidth = 700,
}: SBLogoProps) {
  return (
    <div className="flex flex-col items-center justify-center">

      {/* Main Logo */}
      <div
        style={{ width: size, height: size }}
        className="relative"
      >
        <Image
          src="/sb_logo.webp"
          alt="Sankalp Bharat Logo"
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Name Image */}
      {showName && (
        <div
          className="relative mt-3"
          style={{ width: nameWidth, height: nameWidth * 0.28 }}
        >
          <Image
            src="/sb_name.webp"
            alt="Sankalp Bharat"
            fill
            priority
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}