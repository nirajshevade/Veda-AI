// public/sw.js - VedaAI Progressive Web App Service Worker

const CACHE_NAME = "vedai-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/upload",
  "/manifest.json",
  "/Frame 1618872393.png",
  "/Frame 1984077293.png",
  "/Frame 1618872259.png",
  "/Icon.png",
  "/Icon (1).png",
  "/Icon (2).png",
  "/Icon (3).png",
  "/Vector.png",
  "/file-text.png",
  "/Frame 39959.png",
  "/Niraj-Photo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("Some assets failed to cache during SW install:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip API routes from caching to ensure live Gemini responses
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cache and fetch fresh version in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for HTML navigation requests when offline
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("/upload");
        }
      });
    })
  );
});
