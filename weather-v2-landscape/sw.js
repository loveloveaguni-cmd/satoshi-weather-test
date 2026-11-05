'use strict';
var CACHE = 'satoshi-weather-v2-landscape-shell-v1';
var SHELL = ['./satoshi_weather_v2_landscape.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }));
});
self.addEventListener('activate', function (event) {
  // 他アプリのキャッシュは削除しない。
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);
  // 天気APIをキャッシュ・代替応答しない。更新失敗は既存の天気処理へ渡す。
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  var names = ['satoshi_weather_v2_landscape.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
  if (!names.some(function (name) { return url.pathname === new URL(name, self.registration.scope).pathname; })) return;
  event.respondWith(fetch(event.request).then(function (response) {
    if (response.ok) {
      var copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.put(event.request, copy); }));
    }
    return response;
  }).catch(function (error) {
    return caches.match(event.request).then(function (cached) { if (cached) return cached; throw error; });
  }));
});
