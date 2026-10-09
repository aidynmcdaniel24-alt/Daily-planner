// ===== Offline support =====
// Saves the app's own files so it opens fast and works without internet.
// Change the version number when you update files, so phones get the new ones.
const CACHE = "planner-v32";
const FILES = [
  "./", "./index.html", "./style.css", "./script.js", "./genres.js", "./content.js", "./extras.js", "./timepicker.js", "./sync.js", "./firebase.js", "./ai.js", "./remote.js", "./legal.js", "./home.js", "./dialog.js",
  "./home/", "./login/", "./login/login.js", "./signup/", "./setup/", "./setup/setup.js",
  "./settings/", "./settings/settings.js", "./leaderboard/", "./leaderboard/leaderboard.js",
  "./welcome/welcome.js", "./welcome/auth-check.js", "./privacy/", "./terms/", "./404.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Our own files: always try the internet first so everyone gets the newest version
// (mixing old and new files breaks the app). Use the saved copy only when offline.
self.addEventListener("fetch", function (e) {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(function (res) {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || caches.match(new URL(e.request.url).pathname.indexOf("/home") > -1 ? "./home/" : "./"); });
    })
  );
});
