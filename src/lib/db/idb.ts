import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { CheckIn, SavedEvent, CheckInSyncStatus } from "../types";
import { isPreFestivalTimestamp } from "../quest/schedule";

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

const PARTICIPANT_ID_KEY = "klik_participant_id";
const PARTICIPANT_NAME_KEY = "klik_participant_name";
const CHECK_INS_LS_KEY = "klik_check_ins";
const TICKET_LS_KEY = "klik_lucky_draw_ticket";
const COMPLETED_AT_LS_KEY = "klik_lucky_draw_completed_at";
const PRE_LAUNCH_CLEANUP_KEY = "klik_pre_festival_test_reset_v1";

/**
 * Automatically purges any pre-festival test check-ins and pre-festival Lucky Draw tickets
 * recorded prior to official KLiK 2026 opening (Fri 27 Nov 2026, 15:45 SAST).
 * Runs safely once per device so legitimate festival check-ins are never touched.
 */
export async function purgePreFestivalTestData(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // Always filter out any check-ins timestamped before festival launch
    const lsItems = readLocalStorageCheckIns();
    const validLsItems = lsItems.filter((c) => !isPreFestivalTimestamp(c.timestamp));
    if (validLsItems.length !== lsItems.length) {
      writeLocalStorageCheckIns(validLsItems);
    }

    const db = getDb();
    if (db) {
      try {
        const database = await db;
        const idbItems = await database.getAll("check_ins");
        for (const item of idbItems) {
          if (isPreFestivalTimestamp(item.timestamp)) {
            await database.delete("check_ins", item.id);
            await database.delete("offline_queue", item.id);
          }
        }
      } catch {
        // ignore IDB errors
      }
    }

    // Clear pre-festival Lucky Draw ticket if it was earned before launch OR if no valid festival check-ins exist
    const completedAt = localStorage.getItem(COMPLETED_AT_LS_KEY);
    const hasSavedTicket = Boolean(localStorage.getItem(TICKET_LS_KEY));
    const alreadyCleaned = localStorage.getItem(PRE_LAUNCH_CLEANUP_KEY) === "done";

    if (
      hasSavedTicket &&
      (isPreFestivalTimestamp(completedAt) || (!alreadyCleaned && validLsItems.length === 0))
    ) {
      localStorage.removeItem(TICKET_LS_KEY);
      localStorage.removeItem(COMPLETED_AT_LS_KEY);
      localStorage.removeItem("klik_prize_draw_submitted");
      localStorage.removeItem("klik_quest_started_tracked");
      localStorage.removeItem("klik_quest_completed_tracked");
      if (db) {
        try {
          const database = await db;
          await database.delete("keyval", TICKET_LS_KEY);
          await database.delete("keyval", COMPLETED_AT_LS_KEY);
        } catch {
          // ignore
        }
      }
    }

    if (!alreadyCleaned) {
      localStorage.setItem(PRE_LAUNCH_CLEANUP_KEY, "done");
    }
  } catch {
    // ignore storage errors
  }
}

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

export function isVerifiedCheckInStatus(status: CheckInSyncStatus): boolean {
  return (
    status === "verified" ||
    status === "captured_offline" ||
    status === "pending_sync"
  );
}

// ----------------- KeyVal Helpers -----------------

export async function getKeyVal<T = unknown>(key: string): Promise<T | null> {
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      const value = await database.get("keyval", key);
      if (value !== undefined) return value as T;
    } catch {
      // fall back to localStorage
    }
  }
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        try {
          return JSON.parse(raw) as T;
        } catch {
          return raw as unknown as T;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function setKeyVal(key: string, value: unknown): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      await database.put("keyval", value, key);
    } catch {
      // ignore
    }
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    } catch {
      // ignore
    }
  }
}

// ----------------- Anonymous Participant -----------------

function generateRandomAlphanumeric(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Ambiguity-free characters (no 0/O/1/I)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < length; i++) {
      out += alphabet[bytes[i] % alphabet.length];
    }
    return out;
  }
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function getOrCreateParticipantId(): string {
  if (typeof window === "undefined") return "klik_anon_server";
  try {
    let id = localStorage.getItem(PARTICIPANT_ID_KEY);
    if (!id) {
      id = `klik_anon_${generateRandomAlphanumeric(6).toLowerCase()}_${Date.now().toString(36)}`;
      localStorage.setItem(PARTICIPANT_ID_KEY, id);
    }
    return id;
  } catch {
    return `klik_anon_${generateRandomAlphanumeric(6).toLowerCase()}`;
  }
}

export function getParticipantName(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(PARTICIPANT_NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setParticipantName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PARTICIPANT_NAME_KEY, name);
  } catch {
    // ignore
  }
}

/**
 * Generates or retrieves the participant's single, persistent unique competition entry code.
 * Preserves any previously saved code (never overwrites or duplicates).
 */
export async function getOrCreateCompetitionCode(): Promise<{
  code: string;
  completedAt: string;
}> {
  let existingCode: string | null = null;
  let existingCompletedAt: string | null = null;

  if (typeof window !== "undefined") {
    try {
      existingCode = localStorage.getItem(TICKET_LS_KEY);
      existingCompletedAt = localStorage.getItem(COMPLETED_AT_LS_KEY);
    } catch {
      // ignore
    }
  }

  if (!existingCode) {
    const idbCode = await getKeyVal<string>(TICKET_LS_KEY);
    if (typeof idbCode === "string" && idbCode.trim().length > 0) {
      existingCode = idbCode;
    }
  }
  if (!existingCompletedAt) {
    const idbDate = await getKeyVal<string>(COMPLETED_AT_LS_KEY);
    if (typeof idbDate === "string" && idbDate.trim().length > 0) {
      existingCompletedAt = idbDate;
    }
  }

  const code = existingCode || `KLIK-2026-${generateRandomAlphanumeric(6)}`;
  const completedAt = existingCompletedAt || new Date().toISOString();

  await setKeyVal(TICKET_LS_KEY, code);
  await setKeyVal(COMPLETED_AT_LS_KEY, completedAt);

  return { code, completedAt };
}

export async function getSavedCompetitionCode(): Promise<{
  code: string | null;
  completedAt: string | null;
}> {
  let code: string | null = null;
  let completedAt: string | null = null;

  if (typeof window !== "undefined") {
    try {
      code = localStorage.getItem(TICKET_LS_KEY);
      completedAt = localStorage.getItem(COMPLETED_AT_LS_KEY);
    } catch {
      // ignore
    }
  }

  if (!code) {
    const idbCode = await getKeyVal<string>(TICKET_LS_KEY);
    if (typeof idbCode === "string" && idbCode.trim()) {
      code = idbCode;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(TICKET_LS_KEY, code);
        } catch {
          // ignore
        }
      }
    }
  }

  if (!completedAt) {
    const idbDate = await getKeyVal<string>(COMPLETED_AT_LS_KEY);
    if (typeof idbDate === "string" && idbDate.trim()) {
      completedAt = idbDate;
    }
  }

  return { code, completedAt };
}

// ----------------- Saved Events (My Festival) -----------------

export async function getSavedEvents(): Promise<SavedEvent[]> {
  const db = getDb();
  if (!db) {
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
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("klik_saved_events");
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export async function isEventSaved(eventId: string): Promise<boolean> {
  const db = getDb();
  if (!db) {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem("klik_saved_events");
      const arr: SavedEvent[] = raw ? JSON.parse(raw) : [];
      return arr.some((item) => item.eventId === eventId);
    } catch {
      return false;
    }
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
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("klik_saved_events");
      const list: SavedEvent[] = raw ? JSON.parse(raw) : [];
      if (!list.some((x) => x.eventId === eventId)) {
        list.push(record);
        localStorage.setItem("klik_saved_events", JSON.stringify(list));
      }
      window.dispatchEvent(new Event("klik_saved_events_changed"));
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
      window.dispatchEvent(new Event("klik_saved_events_changed"));
    } catch {
      // ignore
    }
  }
}

// ----------------- Check-Ins & Offline Queue -----------------

function readLocalStorageCheckIns(): CheckIn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CHECK_INS_LS_KEY);
    return raw ? (JSON.parse(raw) as CheckIn[]) : [];
  } catch {
    return [];
  }
}

function writeLocalStorageCheckIns(items: CheckIn[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHECK_INS_LS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export async function getCheckIns(): Promise<CheckIn[]> {
  await purgePreFestivalTestData();
  const lsItems = readLocalStorageCheckIns();
  const db = getDb();
  if (!db) {
    return lsItems
      .filter((c) => !isPreFestivalTimestamp(c.timestamp))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
  try {
    const database = await db;
    const idbItems = await database.getAll("check_ins");

    // Merge IDB + localStorage by id so progress is never lost even if one store was cleared
    const merged = new Map<string, CheckIn>();
    for (const item of lsItems) {
      if (!isPreFestivalTimestamp(item.timestamp)) {
        merged.set(item.id, item);
      }
    }
    for (const item of idbItems) {
      if (!isPreFestivalTimestamp(item.timestamp)) {
        merged.set(item.id, item);
      }
    }

    return Array.from(merged.values()).sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
  } catch (err) {
    console.error("IDB getCheckIns error:", err);
    return lsItems
      .filter((c) => !isPreFestivalTimestamp(c.timestamp))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}

export async function getVerifiedCheckInForLocation(
  locationId: string
): Promise<CheckIn | null> {
  const checkIns = await getCheckIns();
  return (
    checkIns.find(
      (c) => c.locationId === locationId && isVerifiedCheckInStatus(c.syncStatus)
    ) || null
  );
}

export async function getPendingCheckInForLocation(
  locationId: string
): Promise<CheckIn | null> {
  const checkIns = await getCheckIns();
  return (
    checkIns.find(
      (c) =>
        c.locationId === locationId &&
        (c.syncStatus === "pending_manual_review" ||
          c.syncStatus === "requires_staff_review")
    ) || null
  );
}

/**
 * Returns true only if the participant has a VERIFIED (or offline-captured valid) check-in
 * for the given location. Pending manual reviews or rejected attempts return false.
 */
export async function hasCheckedInLocation(locationId: string): Promise<boolean> {
  const verified = await getVerifiedCheckInForLocation(locationId);
  return verified !== null;
}

export async function recordCheckIn(checkIn: CheckIn): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      await database.put("check_ins", checkIn);
      if (
        checkIn.syncStatus === "captured_offline" ||
        checkIn.syncStatus === "pending_sync"
      ) {
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

  if (typeof window !== "undefined") {
    try {
      const list = readLocalStorageCheckIns();
      const idx = list.findIndex((x) => x.id === checkIn.id);
      if (idx >= 0) {
        list[idx] = checkIn;
      } else {
        list.push(checkIn);
      }
      writeLocalStorageCheckIns(list);
      window.dispatchEvent(new Event("klik_checkins_changed"));
    } catch {
      // ignore
    }
  }
}

export async function deleteCheckInById(checkInId: string): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const database = await db;
      await database.delete("check_ins", checkInId);
      await database.delete("offline_queue", checkInId);
    } catch {
      // ignore
    }
  }
  if (typeof window !== "undefined") {
    const list = readLocalStorageCheckIns().filter((c) => c.id !== checkInId);
    writeLocalStorageCheckIns(list);
    window.dispatchEvent(new Event("klik_checkins_changed"));
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
    const lsList = readLocalStorageCheckIns();

    for (const item of queuedItems) {
      try {
        const updatedCheckIn: CheckIn = {
          ...item.checkIn,
          syncStatus: "verified",
          verifiedAt: new Date().toISOString(),
        };
        await database.put("check_ins", updatedCheckIn);
        await database.delete("offline_queue", item.id);

        const idx = lsList.findIndex((c) => c.id === updatedCheckIn.id);
        if (idx >= 0) {
          lsList[idx] = updatedCheckIn;
        } else {
          lsList.push(updatedCheckIn);
        }
        synced++;
      } catch {
        failed++;
      }
    }

    if (synced > 0) {
      writeLocalStorageCheckIns(lsList);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("klik_checkins_changed"));
      }
    }
  } catch (err) {
    console.error("Flush queue error:", err);
  }
  return { synced, failed };
}
