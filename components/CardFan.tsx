import { Card } from './Card';

export function CardFan({ cardWidth }: { cardWidth: number }) {
  return (
    <div className="flex items-end" aria-hidden="true">
      <div style={{ transform: 'rotate(-14deg) translate(26px,10px)' }}>
        <Card face="back" w={cardWidth} icon="teapot" />
      </div>
      <div className="z-10">
        <Card face="back" w={cardWidth} icon="kite" />
      </div>
      <div className="z-20" style={{ transform: 'rotate(14deg) translate(-26px,10px)' }}>
        <Card face="back" w={cardWidth} icon="planet" />
      </div>
    </div>
  );
}
