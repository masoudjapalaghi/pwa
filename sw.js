const version = 17;
const cacheName = {
  static: `static?version=${version}`,
  dynamic: `dynamic?version=${version}`,
};

const staticAsset = ["/"];

self.addEventListener("install", (event) => {
  console.log("installed service worker");
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName.static).then((cache) => {
      cache
        .addAll(staticAsset)
        .then((e) => {
          console.log("added to cache");
        })
        .catch((err) => console.log(err));
    })
  );
});

self.addEventListener("activate", (event) => {
  const activateCacheName = Object.values(cacheName);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.forEach((cacheName) => {
          if (!activateCacheName.includes(cacheName)) {
            return caches.delete(cacheName); // :))
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  console.log(event.request);
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      } else {
        // Check if the request scheme is supported
        if (event.request.url.startsWith("http")) {
          return fetch(event.request).then((serverResponse) => {
            // Open the dynamic cache
            return caches.open(cacheName.dynamic).then((cache) => {
              // Put the response in the cache
              cache.put(event.request, serverResponse.clone());
              return serverResponse;
            });
          }).catch(error => {
            // Handle fetch errors
            console.error('Fetch error:', error);
            throw error;
          });
        } else {
          // If request scheme is not supported, directly return the fetch response
          return fetch(event.request);
        }
      }
    })
  );
});