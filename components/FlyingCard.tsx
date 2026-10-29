'use client';

import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';
import { cardMetrics } from '@/lib/card-metrics';
import type { CardIcon } from '@/lib/protocol';
import { Card, ValueCard } from './Card';

const FLIGHT_MS = 440;
const TURN_MS = 240;
const TURN_DELAY_MS = 120;
const ARC_HEIGHT_PX = 70;
const MAX_SPIN_DEGREES = 14;

export interface Flight {
  key: number;
  value: string;
  from: DOMRect;
  tilt: number;
  icon: CardIcon;
}

function throwKeyframes(from: DOMRect, to: DOMRect, restingTilt: number): Keyframe[] {
  const dx = to.left - from.left;
  const dy = to.top - from.top;
  const scale = to.width / from.width;
  const spin = (Math.random() * 2 - 1) * MAX_SPIN_DEGREES;
  return [
    { transform: 'translate(0,0) scale(1) rotate(0deg)' },
    {
      transform: `translate(${dx * 0.55}px, ${dy * 0.55 - ARC_HEIGHT_PX}px) scale(${1 + (scale - 1) * 0.5}) rotate(${spin}deg)`,
      offset: 0.55,
    },
    { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${restingTilt}deg)` },
  ];
}

interface FlyingCardProps {
  flight: Flight;
  targetRef: RefObject<HTMLElement | null>;
  onDone: () => void;
}

export function FlyingCard({ flight, targetRef, onDone }: FlyingCardProps) {
  const flightRef = useRef<HTMLDivElement>(null);
  const turnRef = useRef<HTMLDivElement>(null);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });
  const width = Math.round(flight.from.width);
  const { height } = cardMetrics(width);

  useLayoutEffect(() => {
    const flying = flightRef.current;
    const turning = turnRef.current;
    const slot = targetRef.current;
    if (!flying || !turning || !slot || typeof flying.animate !== 'function') {
      onDoneRef.current();
      return;
    }
    const travel = flying.animate(throwKeyframes(flight.from, slot.getBoundingClientRect(), flight.tilt), {
      duration: FLIGHT_MS,
      easing: 'cubic-bezier(.2,.8,.2,1)',
      fill: 'forwards',
    });
    turning.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], {
      duration: TURN_MS,
      delay: TURN_DELAY_MS,
      easing: 'cubic-bezier(.45,0,.2,1)',
      fill: 'forwards',
    });
    travel.onfinish = () => onDoneRef.current();
    return () => travel.cancel();
  }, [flight, targetRef]);

  return (
    <div
      ref={flightRef}
      aria-hidden="true"
      className="pointer-events-none fixed z-50"
      style={{ left: flight.from.left, top: flight.from.top, width, height, transformOrigin: '0 0', perspective: 800 }}
    >
      <div ref={turnRef} style={{ position: 'relative', width, height, transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>
          <ValueCard value={flight.value} w={width} />
        </div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <Card face="back" w={width} icon={flight.icon} />
        </div>
      </div>
    </div>
  );
}
