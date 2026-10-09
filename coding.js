// ===== Coding tab extras: stats, drill, focus session, tip of the day, helpful sites =====
(function () {
  function path() { return (st.ob && st.ob.cp) || ""; }
  function fits(paths) { var p = path(); return !p || paths.indexOf("all") > -1 || paths.indexOf(p) > -1; }
  function dayNum() { return Math.floor(new Date(td() + "T12:00").getTime() / 86400000); }
  function offset(key) { var o = st[key]; return o && o.d === td() ? o.n : 0; }
  function bump(key) { st[key] = { d: td(), n: offset(key) + 1 }; save(); }
  function hm(m) { m = Math.round(m); return m < 60 ? m + " min" : Math.floor(m / 60) + " h" + (m % 60 ? " " + (m % 60) + " m" : ""); }

  // ---------- Minutes coded (st.cm = { "2026-10-09": 35 }) ----------
  function minsOn(d) { return (st.cm && st.cm[d]) || 0; }
  function addMins(n) {
    if (n < 1) return;
    st.cm = st.cm || {};
    st.cm[td()] = minsOn(td()) + n;
    var cut = td(60); Object.keys(st.cm).forEach(function (k) { if (k < cut) delete st.cm[k]; });
    save(); draw();
  }

  // ---------- Stat tiles ----------
  function stats() {
    var week = 0, logs = 0, built = 0;
    for (var i = 0; i < 7; i++) week += minsOn(td(i));
    (st.tc || []).forEach(function (x) { if (x.d >= td(6)) logs++; if (/^Built: /.test(x.t)) built++; });
    var s = sk("coding");
    var T = [["Coded this week", week ? hm(week) : "0 min", "From focus sessions"],
             ["Coding streak", s + (s === 1 ? " day" : " days"), "Checklist finished"],
             ["Log entries", logs, "In the last 7 days"],
             ["Projects built", built, "All time"]];
    $("ctiles").innerHTML = T.map(function (t) { return '<div class="tile"><span>' + t[0] + "</span><b>" + esc(t[1]) + "</b><small>" + t[2] + "</small></div>"; }).join("");
  }

  // ---------- Minutes chart (last 7 days) ----------
  function bars() {
    var D = [], max = 30;
    for (var i = 6; i >= 0; i--) { var d = td(i); D.push(d); max = Math.max(max, minsOn(d)); }
    $("cmins").innerHTML = D.map(function (d) {
      var m = minsOn(d), h = m ? Math.max(8, Math.round(100 * m / max)) : 4;
      var name = new Date(d + "T12:00").toLocaleDateString("en-US", { weekday: "narrow" });
      return '<div class="sn' + (m ? " good" : "") + '" title="' + hm(m) + '"><i style="height:' + h + '%"></i><b>' + name + "</b></div>";
    }).join("");
    var t = minsOn(td());
    $("cmt").textContent = t ? "Today: " + hm(t) + " of focused coding" : "No focus sessions yet today.";
  }

  // ---------- Today's drill ----------
  function drillList() { var L = CODE_DRILLS.filter(function (d) { return fits(d.paths); }); return L.length ? L : CODE_DRILLS; }
  function drill() {
    var L = drillList(), d = L[(dayNum() + offset("cdo")) % L.length];
    $("cdt").innerHTML = drillHTML(d);
    $("cdd").dataset.t = d.name;
    $("cda").innerHTML = L.filter(function (x) { return x !== d; }).map(function (x) { return '<div class="dgi">' + drillHTML(x) + "</div>"; }).join("");
  }
  $("cdn").onclick = function () { bump("cdo"); drill(); };
  $("cdd").onclick = function () {
    st.tc = st.tc || []; st.tc.push({ d: td(), t: "Drill: " + this.dataset.t }); save(); tlog();
    var b = this; b.textContent = "Added to your log"; setTimeout(function () { b.textContent = "I did this"; }, 2000);
  };

  // ---------- Tip of the day ----------
  function tip() { $("ctt").textContent = CODE_TIPS[(dayNum() + offset("cto")) % CODE_TIPS.length]; }
  $("ctn").onclick = function () { bump("cto"); tip(); };

  // ---------- Helpful sites ----------
  function siteHTML(s) {
    return '<a class="site" href="' + esc(s[1]) + '" target="_blank" rel="noopener"><span class="st"><b>' + esc(s[0]) + "</b><small>" + esc(s[2]) + '</small></span><em>' + esc(s[3]) + "</em></a>";
  }
  function sites() {
    var p = path(), mine = [], rest = [];
    CODE_SITES.forEach(function (s) { (p ? s[4].indexOf(p) > -1 : s[4].indexOf("all") > -1) ? mine.push(s) : rest.push(s); });
    // fill up with the "everyone" sites so the main list is never short
    rest = rest.filter(function (s) { if (mine.length < 6 && s[4].indexOf("all") > -1) { mine.push(s); return false; } return true; });
    $("csl").innerHTML = mine.map(siteHTML).join("");
    $("csm").innerHTML = rest.map(siteHTML).join("");
  }

  // ---------- Focus session timer ----------
  var mins = st.cmin || 25, left = mins * 60, end = 0, tick = null, baseTitle = document.title;
  function fmt(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function drawTimer() {
    $("ctm").textContent = left <= 0 ? "Done" : fmt(left);
    var c = $("crv"); c.setAttribute("pathLength", "100");
    c.style.strokeDasharray = (100 * left / (mins * 60)) + " 100";
    $("cring").classList.toggle("run", !!tick);
    $("cts").textContent = tick ? "Pause" : left < mins * 60 && left > 0 ? "Resume" : "Start";
    $("ctr").disabled = left >= mins * 60;
    if (tick) document.title = fmt(left) + " · Coding"; else if (/ · Coding$/.test(document.title)) document.title = baseTitle;
    [].forEach.call(document.querySelectorAll("#cpre button"), function (b) { b.setAttribute("aria-pressed", +b.dataset.m === mins); });
  }
  function halt() { clearInterval(tick); tick = null; }
  function logSession() { var used = Math.floor((mins * 60 - Math.max(0, left)) / 60); left = mins * 60; addMins(used); return used; }
  function step() {
    left = Math.max(0, Math.round((end - Date.now()) / 1000));
    if (left > 0) { drawTimer(); return; }
    halt(); logSession(); drawTimer();
    if (window.chime) chime();
    if (window.toast) toast("Nice session. " + mins + " minutes added to your week.");
    try { if (window.Notification && Notification.permission === "granted" && document.hidden) new Notification("Focus session done", { body: mins + " minutes of coding. Take a short break.", icon: "../icons/icon-192.png" }); } catch (e) {}
  }
  $("cts").onclick = function () {
    if (tick) { halt(); drawTimer(); return; }
    if (left <= 0) left = mins * 60;
    end = Date.now() + left * 1000;
    tick = setInterval(step, 250); drawTimer();
  };
  $("ctr").onclick = function () {
    halt(); var n = logSession(); drawTimer();
    if (window.toast) toast(n ? hm(n) + " added to your week." : "Session stopped. Under a minute isn't counted.");
  };
  $("cpre").onclick = function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (left < mins * 60) { halt(); logSession(); }
    mins = +b.dataset.m; left = mins * 60; st.cmin = mins; save(); drawTimer();
  };
  // closing the page mid-session still counts the minutes
  window.addEventListener("pagehide", function () { if (left < mins * 60) { halt(); logSession(); } });

  // ---------- Keep everything fresh ----------
  function draw() { stats(); bars(); }
  var baseLog = tlog; tlog = function () { baseLog(); stats(); };
  var baseSave = save, busy = false;
  save = function () { baseSave.apply(this, arguments); if (!busy) { busy = true; try { stats(); } finally { busy = false; } } };

  window.codingRefresh = function () { draw(); drill(); tip(); sites(); };
  window.codingRefresh();
  drawTimer();
})();
