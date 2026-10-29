'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { MAX_NAME_LENGTH, parseRoomCode, sanitizeName } from '@/lib/ids';
import { useT } from '@/lib/use-translations';
import { rememberName } from '@/lib/join-handover';
import { Button } from './Button';
import { TextField } from './TextField';

type FieldError = 'code' | 'name' | null;

export function JoinForm() {
  const t = useT();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<FieldError>(null);
  const errorId = useId();

  function join(event: React.FormEvent) {
    event.preventDefault();
    const roomCode = parseRoomCode(code);
    if (!roomCode) return setError('code');
    const cleanName = sanitizeName(name);
    if (!cleanName) return setError('name');
    rememberName(roomCode, cleanName);
    router.push(`/room/${roomCode}`);
  }

  const clearingError = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setError(null);
  };

  return (
    <form
      onSubmit={join}
      aria-labelledby="join-heading"
      noValidate
      className="flex flex-col gap-4 rounded-[20px] border-2 border-line bg-surface p-6"
    >
      <h2 id="join-heading" className="font-display text-[32px] font-extrabold uppercase leading-none">
        {t.home.joinTitle}
      </h2>
      <TextField
        label={t.home.code}
        value={code}
        onChange={clearingError(setCode)}
        placeholder={t.home.codePh}
        monospace
        autoComplete="off"
        invalid={error === 'code'}
        describedBy={errorId}
      />
      <TextField
        label={t.home.name}
        value={name}
        onChange={clearingError(setName)}
        placeholder={t.home.namePh}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="nickname"
        invalid={error === 'name'}
        describedBy={errorId}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm font-semibold text-primary">
          {error === 'code' ? t.home.errCode : t.home.errName}
        </p>
      )}
      <Button type="submit" variant="secondary" size="lg" className="mt-1">
        {t.home.joinBtn}
      </Button>
    </form>
  );
}
