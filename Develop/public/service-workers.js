const APP_PREFIX = 'my-site-cache-';  
const VERSION = 'v1';
const CACHE = APP_PREFIX + VERSION;
const DATA = "data-cache-" + VERSION;

const FILES = [
    "./index.html",
    "./css/styles.css",
    "./js/idb.js",
    "./js/index.js",
    "./manifest.json",
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png"
];

// Install application code 
self.addEventListener("install", function(event) {
    event.waitUntil(
      caches.open(CACHE).then(function(cache) {
        console.log('installing application: ' + CACHE)
        return cache.addAll(FILES);
      })
    );
});
  
// grab cached application code 
self.addEventListener("fetch", function(event) {
    if(event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA).then(cache => {
          return fetch(event.request)
            .then(response => {
              if (response.status === 200) {
                cache.put(event.request.url, response.clone());
              }
  
              return response;
            })
            .catch(err => {
              return cache.match(event.request);
            });
        }).catch(err => console.log(err))
      );
  
      return;
}
// deploy data   
event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
          if(response) {
            return response;
          }else if(event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/");
          }
        });
      })
    );
});

// clear residual files
self.addEventListener('activate', function (e) {
    e.waitUntil(
      caches.keys().then(function (keyList) {
        let cacheFile = keyList.filter(function (key) {
          return key.indexOf(APP_PREFIX);
        })
        cacheFile.push(CACHE);
  
        return Promise.all(keyList.map(function (key, i) {
          if(cacheFile.indexOf(key) === -1) {
            console.log('Application deleted: ' + keyList[i] );
            return caches.delete(keyList[i]);
          }
        }));
      })
    );
});
  