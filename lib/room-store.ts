'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { getClientId, isValidRoomCode } from './ids';
import { consumeCreateConfig } from './join-handover';
import { RoomSession } from './session';
import type { RoomSnapshot } from './snapshot';
import { createTrysteroTransport } from './sync';
import { createSessionVoteStorage } from './vote-storage';

interface RoomStore {
  session: RoomSession | null;
  snapshot: RoomSnapshot | null;
}

export const useRoomStore = create<RoomStore>(() => ({ session: null, snapshot: null }));

/** Joins the room for as long as the calling component is mounted; `attempt` forces a fresh join. */
export function useRoomSession(code: string, name: string, attempt: number, observer = false): void {
  useEffect(() => {
    if (!isValidRoomCode(code) || !name) return;
    const session = new RoomSession({
      code,
      selfCid: getClientId(),
      name,
      transport: createTrysteroTransport(code),
      createConfig: observer ? undefined : consumeCreateConfig(code),
      observer,
      storage: createSessionVoteStorage(code),
      onChange: (snapshot) => useRoomStore.setState({ snapshot }),
    });
    useRoomStore.setState({ session, snapshot: session.getSnapshot() });
    session.start();
    const leaveOnPageHide = () => session.leave();
    window.addEventListener('pagehide', leaveOnPageHide);
    return () => {
      window.removeEventListener('pagehide', leaveOnPageHide);
      session.leave();
      useRoomStore.setState({ session: null, snapshot: null });
    };
  }, [code, name, attempt, observer]);
}
