// ===== Welcome page =====
var $ = function (id) { return document.getElementById(id); };
var st = {}; try { st = JSON.parse(localStorage.getItem("apexplan") || "{}"); } catch (e) {}
if (st.th) document.documentElement.style.setProperty("--acc", st.th);
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
$("yr").textContent = new Date().getFullYear();

// Opened as an installed app and already set up? Go straight to the planner
if (st.acct && (st.done || st.nm || st.sk) && matchMedia("(display-mode: standalone), (display-mode: window-controls-overlay)").matches) location.replace("home/");

// Already using the planner? Point the header button there
if (st.acct && (st.done || st.nm || st.sk)) {
  $("hdr-go").textContent = "Open my planner"; $("hdr-go").href = "home/";
  $("hdr-in").hidden = true;
}

// Try without an account
function guest() {
  st.acct = "guest";
  try { localStorage.setItem("apexplan", JSON.stringify(st)); } catch (e) {}
  location.href = (st.done || st.nm || st.sk) ? "home/" : "setup/";
}
$("guest").onclick = guest; $("guest2").onclick = guest;

// Game types from the planner's own list
$("chips").innerHTML = GENRE_ORDER.filter(function (g) { return g !== "general"; }).map(function (g) {
  return "<li>" + GENRES[g].name.replace(/</g, "&lt;") + "</li>";
}).join("") + "<li class=\"more\">and any other game</li>";

// Header line once you scroll
var hdr = $("top");
addEventListener("scroll", function () { hdr.classList.toggle("scrolled", scrollY > 8); }, { passive: true });

// Sections slide in as you scroll to them
var items = document.querySelectorAll(".reveal");
if (reduce || !("IntersectionObserver" in window)) items.forEach(function (el) { el.classList.add("in"); });
else {
  var io = new IntersectionObserver(function (ents) {
    ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
  items.forEach(function (el, i) { el.style.setProperty("--d", (el.parentElement.querySelectorAll(".reveal").length > 1 ? Array.prototype.indexOf.call(el.parentElement.children, el) % 4 : 0) * 70 + "ms"); io.observe(el); });
}

// The preview checks itself off once, then the streak goes up
var boxes = document.querySelectorAll(".pv-i"), fill = $("pv-fill"), streak = $("pv-streak");
function tick(n) {
  for (var i = 0; i < boxes.length; i++) boxes[i].classList.toggle("on", i < n);
  fill.style.width = (100 * n / boxes.length) + "%";
  if (n === boxes.length) { streak.textContent = "5 day streak"; streak.classList.add("up"); }
}
if (reduce) tick(boxes.length);
else { var n = 0; setTimeout(function step() { tick(++n); if (n < boxes.length) setTimeout(step, 380); }, 700); }
