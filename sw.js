// ===== Offline support =====
// Saves the app's own files so it opens fast and works without internet.
// Change the version number when you update files, so phones get the new ones.
const CACHE = "planner-v13";
const FILES = [
  "./", "./index.html", "./style.css", "./script.js", "./genres.js", "./content.js", "./extras.js", "./timepicker.js", "./sync.js", "./firebase.js", "./ai.js", "./remote.js",
  "./login/login.html", "./login/login.js",
  "./onboarding/onboarding.html", "./onboarding/onboarding.js",
  "./settings/settings.html", "./settings/settings.js",
  "./leaderboard/leaderboard.html", "./leaderboard/leaderboard.js",
  "./legal/privacy.html", "./legal/terms.html", "./404.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Our own files: show the saved copy right away, then update it in the background.
// Everything else (Firebase, fonts): always go to the internet.
self.addEventListener("fetch", function (e) {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      const net = fetch(e.request).then(function (res) {
        if (res.ok) c.put(e.request, res.clone());
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
