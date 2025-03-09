import type { CSSProperties } from "react";

interface ErrorIllustrationProps {
  className?: string;
  style?: CSSProperties;
  width?: number;
  height?: number;
}

export default function ErrorIllustration({
  className = "",
  style = {},
  width = 160,
  height = 160,
}: ErrorIllustrationProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Background circle */}
      <circle cx="200" cy="200" r="200" fill="#F9F9F9" />

      {/* Computer/device */}
      <rect x="100" y="120" width="200" height="160" rx="8" fill="#2A3990" />
      <rect x="110" y="130" width="180" height="120" rx="4" fill="#FFFFFF" />
      <rect x="140" y="280" width="120" height="10" rx="4" fill="#2A3990" />
      <rect x="170" y="290" width="60" height="20" rx="4" fill="#2A3990" />

      {/* Error screen elements */}
      <path d="M200 170L220 200H180L200 170Z" fill="#F83D92" />
      <circle cx="200" cy="220" r="10" fill="#F83D92" />

      {/* Broken connection lines */}
      <path
        d="M260 150C280 130 300 140 320 120"
        stroke="#F83D92"
        strokeWidth="4"
        strokeDasharray="6 6"
      />
      <path
        d="M80 180C100 200 120 190 140 210"
        stroke="#F83D92"
        strokeWidth="4"
        strokeDasharray="6 6"
      />

      {/* Error symbols */}
      <g transform="translate(150, 150) rotate(15)">
        <rect x="0" y="0" width="30" height="6" rx="2" fill="#F83D92" />
        <rect x="12" y="-12" width="6" height="30" rx="2" fill="#F83D92" />
      </g>

      <g transform="translate(230, 160) rotate(-15)">
        <rect x="0" y="0" width="30" height="6" rx="2" fill="#F83D92" />
        <rect x="12" y="-12" width="6" height="30" rx="2" fill="#F83D92" />
      </g>

      {/* Decorative elements */}
      <circle
        cx="320"
        cy="100"
        r="15"
        fill="#F0F0F0"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
      <circle
        cx="80"
        cy="250"
        r="20"
        fill="#F0F0F0"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
      <circle
        cx="330"
        cy="280"
        r="10"
        fill="#F0F0F0"
        stroke="#E0E0E0"
        strokeWidth="2"
      />
    </svg>
  );
}
