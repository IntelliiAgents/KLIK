import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { CheckIn, SavedEvent, ChallengeProgress } from "../types";

interface KliKDB extends DBSchema {
  saved_events: {
    key: string; // eventId
    value: SavedEvent;
    indexes: { "by-savedAt": string };
  };
  check_ins: {
    key: string; // checkInId
    value: CheckIn;
    indexes: { "by-location": string; "by-status": string; "by-timestamp": string };
  };
  offline_queue: {
    key: string; // queueItemId
    value: {
      id: string;
      checkIn: CheckIn;
      attemptCount: number;
      lastAttemptAt: string;
    };
  };
  keyval: {
    key: string;
    value: unknown;
  };
}

const DB_NAME = "klik-2026-store";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KliKDB>> | null = null;

function getDb(): Promise<IDBPDatabase<KliKDB>> | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!dbPromise) {
    dbPromise = openDB<KliKDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("saved_events")) {
          const store = db.createObjectStore("saved_events", { keyPath: "eventId" });
          store.createIndex("by-savedAt", "savedAt");
        }
        if (!db.objectStoreNames.contains("check_ins")) {
          const store = db.createObjectStore("check_ins", { keyPath: "id" });
          store.createIndex("by-location", "locationId");
          store.createIndex("by-status", "syncStatus");
          store.createIndex("by-timestamp", "timestamp");
        }
        if (!db.objectStoreNames.contains("offline_queue")) {
          db.createObjectStore("offline_queue", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("keyval")) {
          db.createObjectStore("keyval");
        }
      },
    });
  }
  return dbPromise;
}

// ----------------- Anonymous Participant -----------------

export function getOrCreateParticipantId(): string {
  if (typeof window === "undefined") return "klik_anon_server";
  const KEY = "klik_participant_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `klik_anon_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

// ----------------- Saved Events (My Festival) -----------------

export async function getSavedEvents(): Promise<SavedEvent[]> {
  const db = getDb();
  if (!db) {
    // LocalStorage fallback for SSR / edge cases
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("klik_saved_events");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  try {
    const database = await db;
    const items = await database.getAll("saved_events");
    return items.sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  } catch (err) {
    console.error("IDB getSavedEvents error:", err);
    return [];
  }
}

export async function isEventSaved(eventId: string): Promise<boolean> {
  const db = getDb();
  if (!db) {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem("klik_saved_events");
    const arr: SavedEvent[] = raw ? JSON.parse(raw) : [];
    return arr.some((item) => item.eventId === eventId);
  }
  try {
    const database = await db;
    const item = await database.get("saved_events", eventId);
    return !!item;
  } catch {
    return false;
  }
}

export async function saveEvent(eventId: string): Promise<void> {
  const record: SavedEvent = {
    eventId,
    savedAt: new Date().toISOString(),
  };
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      await database.put("saved_events", record);
    } catch (e) {
      console.warn("Could not save to IDB:", e);
    }
  }
  // Sync to localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("klik_saved_events");
      const list: SavedEvent[] = raw ? JSON.parse(raw) : [];
      if (!list.some((x) => x.eventId === eventId)) {
        list.push(record);
        localStorage.setItem("klik_saved_events", JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }
}

export async function removeSavedEvent(eventId: string): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      await database.delete("saved_events", eventId);
    } catch (e) {
      console.warn("Could not delete from IDB:", e);
    }
  }
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("klik_saved_events");
      if (raw) {
        const list: SavedEvent[] = JSON.parse(raw);
        const filtered = list.filter((x) => x.eventId !== eventId);
        localStorage.setItem("klik_saved_events", JSON.stringify(filtered));
      }
    } catch {
      // ignore
    }
  }
}

// ----------------- Check-Ins & Offline Queue -----------------

export async function getCheckIns(): Promise<CheckIn[]> {
  const db = getDb();
  if (!db) {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("klik_check_ins");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  try {
    const database = await db;
    const items = await database.getAll("check_ins");
    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (err) {
    console.error("IDB getCheckIns error:", err);
    return [];
  }
}

export async function hasCheckedInLocation(locationId: string): Promise<boolean> {
  const checkIns = await getCheckIns();
  return checkIns.some((c) => c.locationId === locationId);
}

export async function recordCheckIn(checkIn: CheckIn): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      await database.put("check_ins", checkIn);
      if (checkIn.syncStatus === "captured_offline" || checkIn.syncStatus === "pending_sync") {
        await database.put("offline_queue", {
          id: checkIn.id,
          checkIn,
          attemptCount: 0,
          lastAttemptAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("IDB recordCheckIn error:", e);
    }
  }
  // Also persist in localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("klik_check_ins");
      const list: CheckIn[] = raw ? JSON.parse(raw) : [];
      if (!list.some((x) => x.id === checkIn.id)) {
        list.push(checkIn);
        localStorage.setItem("klik_check_ins", JSON.stringify(list));
      }
    } catch {
      // ignore
    }
  }
}

export async function getOfflineQueueCount(): Promise<number> {
  const db = getDb();
  if (!db) return 0;
  try {
    const database = await db;
    return await database.count("offline_queue");
  } catch {
    return 0;
  }
}

export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const db = getDb();
  if (!db) return { synced: 0, failed: 0 };
  let synced = 0;
  let failed = 0;

  try {
    const database = await db;
    const queuedItems = await database.getAll("offline_queue");
    for (const item of queuedItems) {
      try {
        // When online, mark as verified (or call Supabase check-in API)
        const updatedCheckIn: CheckIn = {
          ...item.checkIn,
          syncStatus: "verified",
          verifiedAt: new Date().toISOString(),
        };
        await database.put("check_ins", updatedCheckIn);
        await database.delete("offline_queue", item.id);
        synced++;
      } catch {
        failed++;
      }
    }
  } catch (err) {
    console.error("Flush queue error:", err);
  }
  return { synced, failed };
}
