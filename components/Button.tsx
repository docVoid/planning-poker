import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline';
type Size = 'md' | 'lg';

const BASE = 'inline-flex shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-lg border-2 font-bold';

const VARIANTS: Record<Variant, string> = {
  primary: 'border-card-ink bg-primary text-on-primary shadow-[4px_4px_0_var(--shadow)] disabled:opacity-60',
  secondary: 'hard-shadow-sm border-line bg-sec-bg text-sec-ink',
  outline: 'border-line bg-transparent font-semibold text-ink',
};

const SIZES: Record<Size, string> = {
  md: 'h-12 px-[22px] text-base',
  lg: 'h-14 px-8 text-lg',
};

function classes(variant: Variant, size: Size, extra = ''): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', className, children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = 'outline',
  size = 'md',
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={classes(variant, size)}>
      {children}
    </Link>
  );
}
