let CACHE_STATIC_NAME = "static-v13";
let CACHE_DYNAMIC_NAME = "dynamic-v2";

self.addEventListener("install", function(event) {
  console.log("[Service Worker] Installing Service Worker ...", event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then(cache => {
      console.log("pre caching app shell: ", cache);
      cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/css/help.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css"
      ]);
      // cache.add("/");
      // cache.add("/index.html");
      // cache.add("/src/js/app.js");
    })
  );
});

self.addEventListener("activate", function(event) {
  console.log("[Service Worker] Activating Service Worker ....", event);
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log("Service Worker removing old cache: ", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

//cache then network, dynamic caching
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(CACHE_DYNAMIC_NAME).then(cache => {
      return fetch(event.request).then(res => {
        cache.put(event.request, res.clone());
        return res;
      });
    })
  );
});

/*network first then cache*/
// self.addEventListener("fetch", function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(res => {
//         return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//           cache.put(event.request.url, res.clone());
//           return res;
//         });
//       })
//       .catch(err => {
//         return caches.match(event.request);
//       })
//   );
// });

// *cache first then network
// self.addEventListener("fetch", function(event) {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//           .then(res => {
//             return caches.open(CACHE_DYNAMIC_NAME).then(cache => {
//               cache.put(event.request.url, res.clone());
//               return res;
//             });
//           })
//           .catch(err => {
//             return caches
//               .open(CACHE_STATIC_NAME)
//               .then(cache => cache.match("/offline.html"));
//           });
//       }
//     })
//   );
// });

//cache-only
// self.addEventListener("fetch", function(event) {
//   event.respondWith(
//     caches.match(event.request).then(response => {
//       return response;
//     })
//   );
// });
//

/*network only*/
// self.addEventListener("fetch", function(event) {
//   event.respondWith(fetch(event.request));
// });
