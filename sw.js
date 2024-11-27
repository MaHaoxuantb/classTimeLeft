// sw.js

const CACHE_NAME = 'time-counter-cache-v3.1'; // 更新版本号以确保新资源被缓存
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/alarm.mp3',
    '/themes/default.css',
    '/themes/dark.css',
    '/themes/solarized.css',
    '/themes/monokai.css'
];

// Install Event
self.addEventListener('install', event => {
    console.log('Service Worker: Install Event');
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            try {
                for (const url of urlsToCache) {
                    console.log(`Service Worker: Caching ${url}`);
                    await cache.add(url);
                }
                console.log('Service Worker: All resources cached successfully');
            } catch (error) {
                console.error('Service Worker: Failed to cache resources', error);
                throw error; // 这将导致 install 失败
            }
        })()
    );
});

// Fetch Event
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Activate Event
self.addEventListener('activate', event => {
    console.log('Service Worker: Activate Event');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(`Service Worker: Deleting old cache ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
