import { NextResponse } from 'next/server';

export async function GET() {
  const swCode = `const CACHE_NAME = 'restaurant-pos-offline-v4';
const DB_NAME = 'restaurant-pos-offline';
const STORE_NAME = 'requests';
const MUTATION_PATHS = ['/api/sales', '/api/expenses', '/api/loans', '/api/customers'];

function openQueue() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function queueRequest(request) {
  const database = await openQueue();
  const body = await request.text();
  await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).add({ url: request.url, method: request.method, headers: [...request.headers], body });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  if ('sync' in self.registration) await self.registration.sync.register('restaurant-pos-sync');
  return new Response(JSON.stringify({ queued: true, message: 'تم الحفظ وسيتم الإرسال عند عودة الإنترنت' }), { status: 202, headers: { 'Content-Type': 'application/json' } });
}

async function syncQueue() {
  const database = await openQueue();
  const entries = await new Promise((resolve, reject) => {
    const request = database.transaction(STORE_NAME).objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  for (const entry of entries) {
    try {
      const response = await fetch(entry.url, { method: entry.method, headers: Object.fromEntries(entry.headers), body: entry.body });
      if (!response.ok) continue;
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(entry.id);
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error);
      });
    } catch { return; }
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['/cashier', '/menu', '/loans', '/offline.html'])));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('sync', (event) => { if (event.tag === 'restaurant-pos-sync') event.waitUntil(syncQueue()); });
self.addEventListener('online', () => { syncQueue(); });
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === '/api/sw') return;
  if (request.method !== 'GET') {
    if (MUTATION_PATHS.includes(url.pathname)) {
      const requestForQueue = request.clone();
      event.respondWith(fetch(request).catch(() => queueRequest(requestForQueue).catch(() => new Response(JSON.stringify({ queued: false, error: 'تعذر حفظ العملية محلياً' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))));
    }
    return;
  }
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && !url.pathname.startsWith('/_next/')) {
        const responseToCache = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache)).catch(() => undefined));
      }
      return response;
    } catch {
      return (await caches.match(request)) || (request.mode === 'navigate' ? caches.match('/offline.html') : new Response(JSON.stringify({ error: 'غير متصل' }), { status: 503, headers: { 'Content-Type': 'application/json' } }));
    }
  })());
});`;

  return new NextResponse(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
