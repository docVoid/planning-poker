'use client';

import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { DEFAULT_DECK, type DeckId } from '@/lib/decks';
import { MAX_NAME_LENGTH, MAX_ROOM_NAME_LENGTH, createRoomCode, sanitizeName, sanitizeRoomName } from '@/lib/ids';
import { useT } from '@/lib/use-translations';
import { rememberName, storeCreateConfig } from '@/lib/join-handover';
import { Button } from './Button';
import { DeckPicker } from './DeckPicker';
import { TextField } from './TextField';

export function CreateForm() {
  const t = useT();
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [name, setName] = useState('');
  const [deck, setDeck] = useState<DeckId>(DEFAULT_DECK);
  const [nameMissing, setNameMissing] = useState(false);
  const errorId = useId();

  function create(event: React.FormEvent) {
    event.preventDefault();
    const cleanName = sanitizeName(name);
    if (!cleanName) return setNameMissing(true);
    const code = createRoomCode();
    rememberName(code, cleanName);
    storeCreateConfig(code, { name: sanitizeRoomName(roomName) || t.home.defaultRoomName, deck });
    router.push(`/room/${code}`);
  }

  return (
    <form
      onSubmit={create}
      aria-labelledby="create-heading"
      noValidate
      className="felt flex min-h-0 flex-col gap-6 rounded-[32px] border-2 border-line p-6 sm:px-9 sm:py-8"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="create-heading" className="font-display text-[44px] font-black uppercase leading-none">
          {t.home.createTitle}
        </h2>
        <span className="text-[15px] font-medium">{t.home.createSub}</span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          tone="felt"
          label={t.home.roomName}
          value={roomName}
          onChange={setRoomName}
          placeholder={t.home.roomPh}
          maxLength={MAX_ROOM_NAME_LENGTH}
        />
        <TextField
          tone="felt"
          label={t.home.name}
          value={name}
          onChange={(value) => {
            setName(value);
            setNameMissing(false);
          }}
          placeholder={t.home.namePh}
          maxLength={MAX_NAME_LENGTH}
          autoComplete="nickname"
          invalid={nameMissing}
          describedBy={errorId}
        />
      </div>
      {nameMissing && (
        <p
          id={errorId}
          role="alert"
          className="-mt-3 inline-block w-fit rounded bg-paper px-2 py-1 text-sm font-semibold text-brick"
        >
          {t.home.errName}
        </p>
      )}

      <DeckPicker value={deck} onChange={setDeck} />

      <div>
        <Button type="submit" size="lg">
          {t.home.createBtn}
        </Button>
      </div>
    </form>
  );
}
