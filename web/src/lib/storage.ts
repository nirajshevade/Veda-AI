// src/lib/storage.ts - High-capacity client-side storage using IndexedDB to avoid sessionStorage 5MB quota limits

import { PipelineResult } from "./types";

const DB_NAME = "VedaAI_DB";
const STORE_NAME = "pipeline_store";
const KEY = "current_pipeline_result";

// In-memory cache for instant cross-route access in single-page navigation
let memoryCache: PipelineResult | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePipelineResult(data: PipelineResult): Promise<void> {
  memoryCache = data;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB save failed, attempting sessionStorage fallback:", err);
    try {
      sessionStorage.setItem("pipeline_result", JSON.stringify(data));
    } catch (sessionErr) {
      console.warn("SessionStorage also exceeded quota, data remains in memoryCache:", sessionErr);
    }
  }
}

export async function loadPipelineResult(): Promise<PipelineResult | null> {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    const db = await openDB();
    const result = await new Promise<PipelineResult | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (result) {
      memoryCache = result;
      return result;
    }
  } catch (err) {
    console.warn("IndexedDB load failed, trying sessionStorage fallback:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("pipeline_result");
      if (stored) {
        const parsed = JSON.parse(stored) as PipelineResult;
        memoryCache = parsed;
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse from sessionStorage:", e);
    }
  }

  return null;
}

export async function clearPipelineResult(): Promise<void> {
  memoryCache = null;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB clear error:", err);
  }

  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem("pipeline_result");
    } catch (e) {
      console.error("Failed to clear sessionStorage:", e);
    }
  }
}
