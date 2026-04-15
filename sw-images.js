"use strict";

const IMAGE_CACHE_NAME = "wand-asset-cache";

function isImageRequest(request) {
    return request.method === "GET" && request.destination === "image";
}

function updateImageCache(cache, request, response) {
    if (response && (response.ok || response.type === "opaque")) {
        cache.put(request, response.clone());
    }
    return response;
}

self.addEventListener("install", function (event) {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) {
                    return key.indexOf(IMAGE_CACHE_NAME) === 0 && key !== IMAGE_CACHE_NAME;
                }).map(function (key) {
                    return caches.delete(key);
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

self.addEventListener("fetch", function (event) {
    const request = event.request;

    if (!isImageRequest(request)) {
        return;
    }

    event.respondWith(
        caches.open(IMAGE_CACHE_NAME).then(function (cache) {
            return cache.match(request).then(function (cachedResponse) {
                const networkFetch = fetch(request)
                    .then(function (networkResponse) {
                        return updateImageCache(cache, request, networkResponse);
                    })
                    .catch(function () {
                        return cachedResponse;
                    });

                if (cachedResponse) {
                    return cachedResponse;
                }

                return networkFetch;
            });
        })
    );
});
