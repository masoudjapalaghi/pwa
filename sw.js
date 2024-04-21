// Imports
importScripts("/js/dexie.js");
importScripts("/js/db.js");

const version = 1490;
const cacheNames = {
  static: `static?version=${version}`,
  dynamic: `dynamic?version=${version}`,
};

const limitInCache = (key, size) => {
  caches.open(key).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitInCache(key, size));
      }
    });
  });
};

const stashInCacheByLimits = (cacheName, maxItems, request, response) => {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length < maxItems) {
        cache.put(request, response);
      } else {
        cache.delete(keys[0]).then(() => {
          cache.put(request, response);
        });
      }
    });
  });
};
const staticAsset = ["/", "/fallback.html", "/about.html"];

self.addEventListener("install", (event) => {
  console.log("installed service worker");
  self.skipWaiting();
  event.waitUntil(
    caches.open(cacheNames.static).then((cache) => {
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
  event.waitUntil(self.clients.claim());

  const activateCacheName = Object.values(cacheNames);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.forEach((cacheName) => {
          if (!activateCacheName.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // first introduction
  // event.respondWith(
  //   caches.match(event.request).then((response) => {
  //     if (response) {
  //       return response;
  //     } else {
  //       return fetch(event.request);
  //     }
  //   })
  // );

  // event.respondWith(caches.match(event.request));

  // // network only
  // event.respondWith(event.request);

  // ****************************************************************************************************************************

  // // caches only
  // event.respondWith(caches.match(event.request));

  // ****************************************************************************************************************************

  // Cache first, falling back to network
  // sample
  // event.respondWith(caches.open(cacheNames.dynamic).then((cache) => {
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
  //     })
  //   });
  // }));

  // advance
  const urls = ["https://6242faeed126926d0c5a2a36.mockapi.io/mock/lists"];
  if (urls.includes(event.request.url)) {
    return event.respondWith(
      fetch(event.request).then((response) => {
        const clonedResponse = response.clone();
        clonedResponse.json().then((data) => {
          for (let product in data) {
            db.products.put(data[product]);
          }
        });
        return response;
      })
    );
  } else {
    event.respondWith(
      caches.open(cacheNames.dynamic).then((cache) => {
        // Go to the cache first

        return cache.match(event.request).then((cachedResponse) => {
          // Return a cached response if we have one
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise, hit the network
          return fetch(event.request)
            .then((fetchedResponse) => {
              cache.put(event.request, fetchedResponse.clone());
              return fetchedResponse;
            })
            .catch((err) => {
              return caches.match("/fallback.html");
            });
        });
      })
    );
  }

  // ****************************************************************************************************************************

  //Network first, falling back to cache
  // event.respondWith(caches.open(cacheNames.dynamic).then(async (cache) => {
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
  // event.respondWith(caches.open(cacheNames.dynamic).then(async (cache) => {
  //   const cachedResponse = await cache.match(event.request);
  //   const fetchedResponse = fetch(event.request).then((networkResponse) => {
  //     cache.put(event.request, networkResponse.clone());

  //     return networkResponse;
  //   });
  //   return cachedResponse || fetchedResponse;
  // }));
});

self.addEventListener("sync", (event) => {
  console.log("tagName", event.tag);
  if (event.tag === "add-new-product") {
    addNewProduct();
  }else if(event.tag === "delete-new-product") {
    // 
  }
});

function addNewProduct() {
  console.log("tagName", "test");
  db.syncProducts.toArray().then((data) => {
    data.forEach(async (product) => {
      const res = await fetch("https://6242faeed126926d0c5a2a36.mockapi.io/mock/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: product.title,
        }),
      });
      if (res.status === 201) {
        console.info("The new product has been successfully sent to the server");
        db.syncProducts
          .where({ clientId: product.clientId })
          .delete()
          .then(() => console.log("product removed successfully from indexedDB :))"))
          .catch((err) => console.log("Error in remove product =>", err));
      }
    });
  });
}
