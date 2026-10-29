'use client';

import type { CSSProperties } from 'react';
import { ABSTAIN } from '@/lib/decks';
import type { CardIcon } from '@/lib/protocol';
import { AbstainFace, BackFace, EmptyFace, FrontFace } from './CardFaces';
import { cardMetrics } from '@/lib/card-metrics';

export type CardFace = 'front' | 'back' | 'abstain' | 'empty';

interface CardProps {
  face: CardFace;
  w: number;
  value?: string;
  icon?: CardIcon | null;
  selected?: boolean;
  label?: string;
}

const BACK_DOT_PATTERN = 'radial-gradient(rgba(242,190,44,.5) .9px, transparent 1.25px)';
const RESTING_SHADOW = '0 2px 0 rgba(0,0,0,.28)';
const EMPTY_SLOT_FILL = 'rgba(0,0,0,.10)';

function surfaceOf(face: CardFace): CSSProperties {
  switch (face) {
    case 'back':
      return {
        backgroundColor: 'var(--card-red)',
        backgroundImage: BACK_DOT_PATTERN,
        backgroundSize: '6px 6px',
      };
    case 'abstain':
      return { backgroundColor: 'var(--card-yellow)' };
    case 'empty':
      return { backgroundColor: EMPTY_SLOT_FILL };
    default:
      return { backgroundColor: 'var(--card-paper)' };
  }
}

function edgeOf(face: CardFace, selected: boolean, small: boolean): Pick<CSSProperties, 'border' | 'boxShadow'> {
  if (face === 'empty') return { border: '2px dashed var(--felt-line)', boxShadow: 'none' };
  if (selected) {
    const offset = small ? 3 : 4;
    return {
      border: `${small ? 2.5 : 3}px solid var(--primary)`,
      boxShadow: `${offset}px ${offset}px 0 var(--shadow)`,
    };
  }
  return { border: `${small ? 1.5 : 2}px solid var(--card-ink)`, boxShadow: RESTING_SHADOW };
}

export function Card({ face, w, value = '', icon, selected = false, label }: CardProps) {
  const { height, radius, small } = cardMetrics(w);
  return (
    <div
      className="relative box-border flex shrink-0 items-center justify-center overflow-hidden font-display text-(--card-ink)"
      style={{ width: w, height, borderRadius: radius, ...surfaceOf(face), ...edgeOf(face, selected, small) }}
    >
      {face === 'front' && <FrontFace value={value} width={w} />}
      {face === 'abstain' && <AbstainFace width={w} label={label} />}
      {face === 'empty' && <EmptyFace width={w} />}
      {face === 'back' && icon && <BackFace icon={icon} width={w} />}
    </div>
  );
}

interface ValueCardProps {
  value: string;
  w: number;
  selected?: boolean;
  label?: string;
}

export function ValueCard({ value, w, selected, label }: ValueCardProps) {
  return value === ABSTAIN ? (
    <Card face="abstain" w={w} selected={selected} label={label} />
  ) : (
    <Card face="front" w={w} value={value} selected={selected} />
  );
}
