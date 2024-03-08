const version = 73;
const cacheName = {
  static: `static?version=${version}`,
  dynamic: `dynamic?version=${version}`,
};

const staticAsset = ["/","/assets/styles/main.css"];

self.addEventListener("install", (event) => {
  console.log("installed service worker");
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheName.static).then((cache) => {
      cache
        .addAll(staticAsset)
        .then((e) => {
          console.log("added static file to cache");
        })
        .catch((err) => console.log(err));
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("activate service worker");
  event.waitUntil(clients.claim());

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

  // // network only
  // event.respondWith(event.request);

  // ****************************************************************************************************************************

  // // caches only
  const url = new URL(event.request.url);
  const isPreCachedRequest = staticAsset.includes(url.pathname);
  console.log("isPreCachedRequest",isPreCachedRequest);
  if (isPreCachedRequest) {
    // Grab the precached asset from the cache
    event.respondWith(caches.open(cacheName.static).then((cache) => {
      return cache.match(event.request);
    }));
  } else {
    // Go to the network
    // return  event.respondWith(null);
    return event.respondWith(event.request);

  }
  // event.respondWith(caches.match(event.request));

  // ****************************************************************************************************************************

  // Cache first, falling back to network
  // // and this advance
  // event.respondWith(caches.open(cacheName.dynamic).then((cache) => {
  //   // Go to the cache first
  //   return cache.match(event.request).then((cachedResponse) => {
  //     // Return a cached response if we have one
  //     if (cachedResponse) {
  //       return cachedResponse;
  //     }

  //     // Otherwise, hit the network
  //     return fetch(event.request).then((fetchedResponse) => {
  //       // Add the network response to the cache for later visits
  //       cache.put(event.request, fetchedResponse.clone());

  //       // Return the network response
  //       return fetchedResponse;
  //     });
  //   });
  // }));

  // ****************************************************************************************************************************

  //Network first, falling back to cache
  // event.respondWith(caches.open(cacheName.dynamic).then(async (cache) => {
  //   // Go to the network first
  //   try {
  //     const fetchedResponse = await fetch(event.request);
  //     cache.put(event.request, fetchedResponse.clone());
  //     return fetchedResponse;
  //   } catch {
  //     return await cache.match(event.request);
  //   }
  // }));

  // ****************************************************************************************************************************

  // Stale-while-revalidate
  // event.respondWith(
  //   caches.open(cacheName.dynamic).then(async (cache) => {
  //     const cachedResponse = await cache.match(event.request);
  //     const fetchedResponse = fetch(event.request).then((networkResponse) => {
  //       cache.put(event.request, networkResponse.clone());

  //       return networkResponse;
  //     });
  //     return cachedResponse || fetchedResponse;
  //   })
  // );
});
