const CACHE_NAME = "avditor-mvndi-v1";
const SHADER_CACHE_NAME = "avditor-mvndi-shaders-v1";

const PRECACHE_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/favicon.ico",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/shaders/spacetime.glsl",
];

// Install event: Precache core app shell & static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event: Clean up old cache versions & claim clients immediately
self.addEventListener("activate", (event) => {
  const allowedCaches = [CACHE_NAME, SHADER_CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (!allowedCaches.includes(name)) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event: Network-first for navigation, stale-while-revalidate for static assets
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and external origins
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Bypass dynamic API routes
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation requests (HTML pages)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache fresh copy of navigable page
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match("/offline.html");
          return offlinePage || Response.error();
        })
    );
    return;
  }

  // Shader requests — Cache-First
  if (url.pathname.startsWith("/shaders/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const responseToCache = response.clone();
          caches.open(SHADER_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // Static assets (_next/static, images, fonts) — Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || fetchPromise;
    })
  );
});
