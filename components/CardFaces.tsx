import type { CSSProperties } from 'react';
import type { CardIcon } from '@/lib/protocol';
import { BackArt, CoffeeArt } from './CardArt';
import { cardMetrics } from '@/lib/card-metrics';

function printOffset(width: number): number {
  const { small } = cardMetrics(width);
  return small ? 0.8 : Math.max(1, Math.round(width * 0.0135 * 10) / 10);
}

export function FrontFace({ value, width }: { value: string; width: number }) {
  const metrics = cardMetrics(width);
  const lengthScale = [...value].length >= 3 ? 0.6 : [...value].length === 2 ? 0.84 : 1;
  const shadowOffset = Math.max(1, Math.round(metrics.numeral * 0.05 * 10) / 10);
  const cornerStyle: CSSProperties = {
    position: 'absolute',
    fontWeight: 800,
    fontSize: Math.round(metrics.numeral * 0.26),
    lineHeight: 1,
  };
  const cornerInset = { x: Math.round(metrics.radius * 0.7), y: Math.round(metrics.radius * 0.6) };

  return (
    <>
      {width >= 56 && (
        <>
          <span style={{ ...cornerStyle, top: cornerInset.y, left: cornerInset.x }}>{value}</span>
          <span style={{ ...cornerStyle, bottom: cornerInset.y, right: cornerInset.x, transform: 'rotate(180deg)' }}>
            {value}
          </span>
        </>
      )}
      <span
        style={{
          fontWeight: 900,
          fontSize: Math.round(metrics.numeral * lengthScale),
          lineHeight: 1,
          letterSpacing: '-.01em',
          textShadow: `${shadowOffset}px ${(shadowOffset * 0.8).toFixed(1)}px 0 var(--card-yellow)`,
        }}
      >
        {value}
      </span>
    </>
  );
}

export function BackFace({ icon, width }: { icon: CardIcon; width: number }) {
  const metrics = cardMetrics(width);
  const medallion = Math.round(width * 0.58);
  return (
    <>
      <div
        className="pointer-events-none absolute"
        style={{
          inset: Math.round(width * 0.07),
          border: `${metrics.small ? 1 : 1.5}px solid rgba(251,248,241,.75)`,
          borderRadius: Math.max(2, metrics.radius - 3),
        }}
      />
      <div
        className="relative box-border rounded-full"
        style={{
          width: medallion,
          height: medallion,
          padding: Math.round(medallion * 0.12),
          background: 'var(--card-red)',
        }}
      >
        <BackArt icon={icon} offset={printOffset(width)} />
      </div>
    </>
  );
}

export function AbstainFace({ width, label }: { width: number; label?: string }) {
  const metrics = cardMetrics(width);
  const large = width >= 120;
  const iconSize = Math.round(width * (large ? 0.42 : 0.56));
  return (
    <div className="flex w-full flex-col items-center justify-center px-1.5" style={{ gap: large ? 10 : 6 }}>
      <div style={{ width: iconSize, height: iconSize }}>
        <CoffeeArt offset={printOffset(width)} />
      </div>
      {label && width >= 70 && (
        <span
          className="text-center font-extrabold uppercase text-(--card-ink)"
          style={{ fontSize: Math.max(11, Math.round(metrics.numeral * 0.24)), letterSpacing: '.06em', lineHeight: 1 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function EmptyFace({ width }: { width: number }) {
  const dotSize = cardMetrics(width).small ? 3 : 4;
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="dot-pulse block rounded-full bg-felt-line"
          style={{ width: dotSize, height: dotSize, animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
