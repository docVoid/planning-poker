import type { ReactNode } from 'react';
import type { CardIcon } from '@/lib/protocol';

const ART: Record<CardIcon, ReactNode> = {
  anchor: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v13M8 10h8M5 13c0 4 3 7 7 7s7-3 7-7M3 15l2-2 2 2M17 15l2-2 2 2" />
    </>
  ),
  kite: <path d="M12 2l6 7-6 7-6-7zM12 2v14M6 9h12M12 16c-2 1.5 2 2.5 0 4s2 2 0 2.5" />,
  cactus: (
    <path d="M9.5 21V6a2.5 2.5 0 0 1 5 0v15M9.5 13H7.5A2.5 2.5 0 0 1 5 10.5V8M14.5 11h2a2.5 2.5 0 0 0 2.5-2.5V6M5 21h14" />
  ),
  moon: (
    <>
      <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10z" />
      <path d="M17 3v3M15.5 4.5h3" />
    </>
  ),
  teapot: (
    <path d="M4.5 11h12v2.5a6 6 0 0 1-6 6a6 6 0 0 1-6-6zM8 11a2.5 2.5 0 0 1 5 0M10.5 6.5v2M16.5 13.5l3.5-3.5M4.5 12.5H3.5a2 2 0 0 0 0 4h1.5M5 21.5h11" />
  ),
  umbrella: <path d="M3 12a9 9 0 0 1 18 0zM12 12v6.5a2 2 0 0 1-4 0M12 3V2" />,
  key: (
    <>
      <circle cx="7" cy="12" r="4" />
      <path d="M11 12h10M17.5 12v3M20.5 12v2" />
    </>
  ),
  snail: (
    <>
      <circle cx="13.5" cy="12" r="5.5" />
      <path d="M13.5 12a1.6 1.6 0 1 0 1.6-1.6a3.2 3.2 0 1 1-3.2 3.2M2.5 19.5h18M4.5 19.5c-1.5-1.5-.5-4 2-4M5 15.5l-1.5-4M6.5 15.5l1-4" />
    </>
  ),
  lighthouse: (
    <path d="M9 21l1.5-11h3L15 21zM10 10V6.5h4V10M9.5 6.5L12 4l2.5 2.5M16 7l4.5-2M16 8.5l4.5 2M5.5 21h13M10 15.5h4" />
  ),
  plane: <path d="M21 3L3 10.5l7 3L13 21zM10 13.5L21 3" />,
  mushroom: (
    <>
      <path d="M3 12.5a9 7.5 0 0 1 18 0zM9.5 12.5v5.5a2.5 2.5 0 0 0 5 0v-5.5" />
      <circle cx="9" cy="9" r="1.1" />
      <circle cx="15" cy="8.5" r="1.4" />
    </>
  ),
  cassette: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="8.5" cy="11" r="1.6" />
      <circle cx="15.5" cy="11" r="1.6" />
      <path d="M10.1 11h3.8M7 18l1.5-3h7l1.5 3" />
    </>
  ),
  pear: (
    <path d="M12 7.5c-2 0-3 1.8-3 3.5c0 1.3-3 2.8-3 6a6 6 0 0 0 12 0c0-3.2-3-4.7-3-6c0-1.7-1-3.5-3-3.5zM12 7.5V4M12 5c1-2 3-2.2 4.5-1.2c-1.2 1.5-3 1.7-4.5 1.2z" />
  ),
  fish: (
    <>
      <path d="M17 12c-3-4.5-8.5-5-13 0c4.5 5 10 4.5 13 0zM17 12l4-3.5v7z" />
      <circle cx="8.5" cy="11.2" r=".9" />
    </>
  ),
  planet: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M7.5 14.3c-3.3 2-4.7 3.9-3.8 4.6c1.3 1 6.6-1.2 11.6-5.2s7.6-8 6.3-8.9c-.8-.6-2.7.1-5 1.6" />
    </>
  ),
  leaf: <path d="M5 19C5 10.5 11 5 20 4c-.8 9-6.5 15-15 15zM5 19l9.5-9.5M10.5 14H14M10.5 14v-3.5" />,
};

const COFFEE = (
  <path d="M5 10h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 11.5h1.5a2.5 2.5 0 0 1 0 5H15.5M3.5 22h14M8.5 3.5c-1 1 1 2 0 3.5M11.5 3c-1 1 1 2 0 3.5M14.5 3.5c-1 1 1 2 0 3.5" />
);

interface ArtProps {
  stroke: string;
  offset: number;
  shadow: string;
}

function Svg({ stroke, offset, shadow, children }: ArtProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'visible',
        filter: `drop-shadow(${offset}px ${offset}px 0 ${shadow})`,
      }}
    >
      {children}
    </svg>
  );
}

export function BackArt({ icon, offset }: { icon: CardIcon; offset: number }) {
  return (
    <Svg stroke="var(--ivory)" offset={offset} shadow="var(--card-yellow)">
      {ART[icon]}
    </Svg>
  );
}

export function CoffeeArt({ offset }: { offset: number }) {
  return (
    <Svg stroke="var(--card-ink)" offset={offset} shadow="var(--card-red)">
      {COFFEE}
    </Svg>
  );
}
