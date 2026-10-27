'use client';

import { useState } from 'react';
import { isValidRoomCode } from '@/lib/ids';
import { recallName, rememberName } from '@/lib/join-handover';
import { useRoomSession, useRoomStore } from '@/lib/room-store';
import { isRoomReady } from '@/lib/snapshot';
import { NamePrompt } from './NamePrompt';
import { Hydrated } from './Providers';
import { RoomView } from './Room';
import { StateScreen } from './StateScreen';

export function RoomPage({ code: rawCode }: { code: string }) {
  return (
    <Hydrated>
      <RoomGate code={rawCode.toLowerCase()} />
    </Hydrated>
  );
}

function RoomGate({ code }: { code: string }) {
  const valid = isValidRoomCode(code);
  const [name, setName] = useState(() => recallName(code));
  const [attempt, setAttempt] = useState(0);
  // Without a name we only peek at the room (title, head count) so the invite can show it.
  useRoomSession(code, valid ? name || 'guest' : '', attempt, !name);
  const snap = useRoomStore((s) => s.snapshot);

  if (!valid) return <StateScreen kind="notfound" />;
  if (!name)
    return (
      <NamePrompt
        code={code}
        peek={snap?.config ? { config: snap.config, others: snap.seats.length - 1 } : null}
        onSubmit={(n) => {
          rememberName(code, n);
          setName(n);
        }}
      />
    );

  const again = () => setAttempt((n) => n + 1);
  if (snap?.status === 'not-found') return <StateScreen kind="notfound" onPrimary={again} />;
  if (snap?.status === 'removed') return <StateScreen kind="removed" onPrimary={again} />;
  if (!isRoomReady(snap)) return <StateScreen kind="connecting" />;
  return <RoomView snapshot={snap} />;
}
