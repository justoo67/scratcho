/**
 * Offline-first sync queue for stat events.
 *
 * When a scorer taps a stat action, the event is:
 * 1. Written to Dexie (IndexedDB) immediately — UI updates optimistically
 * 2. Queued for server sync
 * 3. Synced when online; retried if the request fails
 *
 * The ULID id is the idempotency key — safe to retry any number of times.
 */

import Dexie, { type Table } from "dexie";

export interface PendingStatEvent {
  id: string; // ULID — idempotency key
  gameId: string;
  playerId: string;
  statId: string;
  value: number;
  scorerPlayerId?: string;
  scorerSessionId?: string;
  recordedAt: number; // epoch ms
  synced: boolean;
  voided: boolean;
}

class ScratchoDb extends Dexie {
  pendingStatEvents!: Table<PendingStatEvent>;

  constructor() {
    super("scratcho");
    this.version(1).stores({
      // Index by synced status so we can quickly find unsynced events
      pendingStatEvents: "id, gameId, synced, voided",
    });
  }
}

// Singleton — safe to call multiple times
let _db: ScratchoDb | null = null;
export function getScratchoDb(): ScratchoDb {
  if (!_db) _db = new ScratchoDb();
  return _db;
}

export async function queueStatEvent(
  event: Omit<PendingStatEvent, "synced" | "voided">
): Promise<void> {
  const db = getScratchoDb();
  await db.pendingStatEvents.add({ ...event, synced: false, voided: false });
}

export async function markEventSynced(id: string): Promise<void> {
  const db = getScratchoDb();
  await db.pendingStatEvents.update(id, { synced: true });
}

export async function getUnsyncedEvents(
  gameId: string
): Promise<PendingStatEvent[]> {
  const db = getScratchoDb();
  return db.pendingStatEvents
    .where({ gameId, synced: false, voided: false })
    .toArray();
}

export async function voidLocalEvent(id: string): Promise<void> {
  const db = getScratchoDb();
  await db.pendingStatEvents.update(id, { voided: true });
}
