var CACHE = 'bnws-v1';
var PRECACHE = ['/nieuws/', '/nieuws/index.html', '/nieuws/data.json'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(PRECACHE); }).catch(function() {}));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  var url = e.request.url;
  if (url.indexOf('data.json') >= 0) {
    e.respondWith(fetch(e.request).then(function(r) {
      if (r.ok) caches.open(CACHE).then(function(c) { c.put(e.request, r.clone()); });
      return r;
    }).catch(function() { return caches.match(e.request); }));
  } else {
    e.respondWith(caches.open(CACHE).then(function(c) {
      return c.match(e.request).then(function(cached) {
        var net = fetch(e.request).then(function(r) {
          if (r.ok) c.put(e.request, r.clone());
          return r;
        }).catch(function() { return null; });
        return cached || net;
      });
    }));
  }
});
