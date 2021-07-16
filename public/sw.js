const CACHE_NAME = 'budget-tracker-file-cache-v1';
const DATA_CACHE_NAME = 'budget-tracker-data-cache-v1';

const FILES_TO_CACHE = [
    '/',
    '/manifest.json',
    '/js/idb.js',
    '/js/main.js',
    '/js/index.js',
    '/css/styles.css',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
    console.log('Installed Service Worker');

    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => {
                console.log('Files were cached!!')
                return cache.addAll(FILES_TO_CACHE)
            })
            .then(() => self.skipWaiting())
            .catch(err => {
                console.log(`Error caching files: ${err}`)
            })
    )
})

self.addEventListener('activate', (event) => {
    console.log('Activated Service Worker');

    event.waitUntil(
        caches
            .keys()
            .then(keyList => {
                return Promise.all(
                    keyList.map(key => {
                        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                            console.log(`Removing old cache data: ${key}`);
                            return caches.delete(key);
                        }
                    })
                )
            })
            .then(() => self.clients.claim())
            .catch(err => {
                console.log(err)
            })
    )
})

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('/api')) {
        event.respondWith(
            caches
                .open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(event.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(event.request.url, response.clone());
                            }
                            return response;
                        })
                        .catch(err => {
                            console.log(err);

                            return cache.match(event.request);
                        })
                })
                .catch(err => console.log(err))
        )
    } else {
        event.respondWith(
            fetch(event.request)
                .catch(err => {
                    return caches.match(event.request).then(response => {
                        if (response) {
                            return response;
                        } else if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(event.request.url);
                        }
                    })
                })
        )
    }
})