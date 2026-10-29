import Image from 'next/image';

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <Image src="/jnnk-logo-light.png" alt="jnnk" width={size} height={size} className="logo-light absolute inset-0" />
      <Image
        src="/jnnk-logo-dark.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        className="logo-dark absolute inset-0"
      />
    </span>
  );
}
