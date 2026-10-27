'use client';

import { useId } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  tone?: 'surface' | 'felt';
  monospace?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  tone = 'surface',
  monospace = false,
  autoComplete,
  autoFocus,
  invalid,
  describedBy,
}: TextFieldProps) {
  const id = useId();
  const toneClass = tone === 'felt' ? 'border-card-ink bg-paper text-card-ink' : 'border-line bg-input-bg text-ink';
  const typeClass = monospace ? 'font-mono text-lg font-semibold uppercase tracking-[.12em]' : 'text-base font-medium';
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={`text-xs font-bold uppercase tracking-[.08em] ${tone === 'felt' ? '' : 'text-muted'}`}
      >
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        autoCapitalize={monospace ? 'characters' : undefined}
        spellCheck={monospace ? false : undefined}
        aria-invalid={invalid}
        aria-describedby={invalid ? describedBy : undefined}
        className={`h-12 w-full rounded-lg border-2 px-3.5 outline-offset-2 focus-visible:outline-3 focus-visible:outline-yellow ${toneClass} ${typeClass}`}
      />
    </div>
  );
}
