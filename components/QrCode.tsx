import { useMemo } from 'react';
import { encode } from 'uqr';

const QUIET_ZONE_MODULES = 3;

// Always dark on light, even in the dark theme: inverted codes are not read by every scanner.
export function QrCode({ value }: { value: string }) {
  const { size, path } = useMemo(() => {
    const { data, size } = encode(value, { ecc: 'M', border: 0 });
    const modules = data.flatMap((row, y) => row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : '')));
    return { size, path: modules.join('') };
  }, [value]);

  const extent = size + QUIET_ZONE_MODULES * 2;
  return (
    <svg
      aria-hidden="true"
      viewBox={`${-QUIET_ZONE_MODULES} ${-QUIET_ZONE_MODULES} ${extent} ${extent}`}
      shapeRendering="crispEdges"
      className="block size-full"
    >
      <path d={path} fill="var(--card-ink)" />
    </svg>
  );
}
