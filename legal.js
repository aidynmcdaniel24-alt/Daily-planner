// ===== Legal pages: theme, table of contents, back to top =====
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // Use the planner's saved theme
  try {
    var s = JSON.parse(localStorage.getItem("apexplan") || "{}");
    if (s.th) document.documentElement.style.setProperty("--acc", s.th);
    if (s.md && s.md !== "auto") document.documentElement.setAttribute("data-theme", s.md);
    if (!s.acct) { $("back").textContent = "Get started"; $("back").href = "../"; }
  } catch (e) {}

  // Contents starts closed on phones
  var toc = $("toc");
  if (matchMedia("(max-width: 899px)").matches) toc.open = false;
  toc.addEventListener("click", function (e) { if (e.target.closest("a") && matchMedia("(max-width: 899px)").matches) toc.open = false; });

  // Highlight the section you're reading
  var links = {};
  [].forEach.call(toc.querySelectorAll("a"), function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var current = null;
  function mark(id) {
    if (id === current) return;
    if (current && links[current]) links[current].removeAttribute("aria-current");
    current = id;
    if (links[id]) links[id].setAttribute("aria-current", "true");
  }
  var secs = [].slice.call(document.querySelectorAll(".lsec"));
  function onScroll() {
    var y = 140, pick = secs[0];
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= y) pick = s; });
    if (innerHeight + scrollY >= document.body.scrollHeight - 4) pick = secs[secs.length - 1];
    mark(pick.id);
    $("totop").hidden = scrollY < 600;
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $("totop").onclick = function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); };
  $("print").onclick = function () { print(); };
})();
