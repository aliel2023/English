/**
 * ALIELENGLISH — Service Worker v1.0
 * Strategy: Cache First → Network Fallback
 * Offline: Essential pages and grammar rules cached
 */

const CACHE_NAME = 'alielenglish-v1.2';
const OFFLINE_URL = '/index.html';

// Core assets to precache on install
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/daily-word.html',
    '/test.html',
    '/speaking.html',
    '/resources.html',
    '/pricing.html',
    '/contact.html',
    '/styles/design-system.css',
    '/styles/main.css',
    '/styles/home.css',
    '/styles/auth.css',
    '/styles/ai-teacher.css',
    '/scripts/design-system.js',
    '/scripts/i18n.js',
    '/scripts/main.js',
    '/scripts/ai-teacher.js',
    '/i18n/az.json',
    '/i18n/en.json',
    '/assets/instagram-1-svgrepo-com.svg',
    '/assets/telegram-svgrepo-com.svg',
    '/assets/gmail-icon-logo-svgrepo-com.svg',
    'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&subset=latin,latin-ext&display=swap'
];

// ===== INSTALL — precache core assets =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS.map(url => {
                return new Request(url, { credentials: 'same-origin' });
            })).catch(err => {
                console.warn('[SW] Precache partial failure:', err);
            });
        }).then(() => {
            return self.skipWaiting();
        })
    );
});

// ===== ACTIVATE — clean old caches =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then((keys) =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            ),
            self.clients.claim()
        ])
    );
});

// ===== FETCH — cache strategies =====
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and cross-origin API calls
    if (request.method !== 'GET') return;
    if (url.hostname === 'generativelanguage.googleapis.com') return;
    if (url.hostname === 'firestore.googleapis.com') return;
    if (url.hostname === 'identitytoolkit.googleapis.com') return;
    if (url.hostname === 'securetoken.googleapis.com') return;
    if (url.hostname === 'script.google.com') return;

    // HTML pages — Network First
    if (request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirstStrategy(request));
        return;
    }

    // Google Fonts — Cache First (long-lived)
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(cacheFirstStrategy(request, 'fonts-cache-v1'));
        return;
    }

    // Static assets (CSS, JS, images, JSON) — Cache First
    if (
        url.pathname.match(/\.(css|js|json|svg|png|jpg|jpeg|webp|ico|woff2?)$/)
    ) {
        event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
        return;
    }

    // Default — Network First
    event.respondWith(networkFirstStrategy(request));
});

// ── Cache First strategy ──
async function cacheFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return caches.match(OFFLINE_URL);
    }
}

// ── Network First strategy ──
async function networkFirstStrategy(request) {
    try {
        const response = await fetch(request);
        if (response && response.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        return caches.match(OFFLINE_URL);
    }
}

// ===== MESSAGE — manual cache clear =====
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data === 'CLEAR_CACHE') {
        caches.delete(CACHE_NAME);
    }
});
