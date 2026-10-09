// ===== Home page: greeting, today's overview, next task, timer, and small upgrades =====
// Runs after script.js and extras.js, and builds on their functions.
(function () {
  // Gentle entrance on first load
  document.body.classList.add("enter");
  setTimeout(function () { document.body.classList.remove("enter"); }, 1400);
  var LANES = ["gaming", "sleep", "coding"], NAMES = { gaming: "Gaming", sleep: "Sleep", coding: "Coding" };
  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4 0 7-2.7 7-6.8 0-3.4-2.2-5.6-3.6-7.2-.5 1.6-1.4 2.6-2.4 3 .3-3-1-6.3-4-9 0 3.4-1.6 5.3-3.1 7.1C4.6 10.7 5 12 5 15.2 5 19.3 8 22 12 22z"/></svg>';

  // ---------- Greeting ----------
  greet = function () {
    var h = new Date().getHours(), part = h < 5 ? "Up late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    $("hi").textContent = part + (st.nm ? ", " + st.nm : "");
    $("hdate").textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    $("sb").textContent = h < 5 ? "Get some sleep. Your plan will be here tomorrow." : "Here's your plan for today.";
    var goals = String(st.gl || "").split(/\s*,\s*/).filter(Boolean);
    $("goals").innerHTML = goals.map(function (g) { return "<span>" + esc(g) + "</span>"; }).join("");
    $("goals").hidden = !goals.length;
  };
  greet();

  // ---------- Rings ----------
  [].forEach.call(document.querySelectorAll(".ring .rv"), function (c) { c.setAttribute("pathLength", "100"); });
  function ring(id, pct) {
    var c = document.querySelector("#" + id + " .rv");
    if (c) { c.style.strokeDasharray = Math.max(0, Math.min(100, pct)) + " 100"; c.style.opacity = pct > 0 ? 1 : 0; }
  }
  function counts(c) {
    var n = TK(c).length, k = Math.min(((st.dn || {})[td() + c] || []).length, n);
    return { n: n, k: k };
  }

  // ---------- Today's overview ----------
  var queued = false;
  function overview() {
    queued = false;
    var tot = 0, dn = 0, best = 0;
    LANES.forEach(function (c) {
      var x = counts(c), s = sk(c);
      tot += x.n; dn += x.k; best = Math.max(best, s);
      ring("rg-" + c, x.n ? 100 * x.k / x.n : 0);
      $("ls-" + c).textContent = x.k === x.n && x.n ? "All done" : x.k + "/" + x.n + " done";
      $("lk-" + c).innerHTML = s ? FLAME + s : "";
      $("lk-" + c).title = s ? s + " day streak" : "";
      document.querySelector('.lane[data-c="' + c + '"]').classList.toggle("full", x.n > 0 && x.k === x.n);
    });
    var pct = tot ? Math.round(100 * dn / tot) : 0;
    ring("rg-all", pct);
    countTo($("ovp"), pct);
    $("abs").hidden = !best; $("absn").textContent = best;
    $("abs").title = "Best current streak: " + best + (best === 1 ? " day" : " days");
    nextUp();
  }
  // Numbers roll up to their new value
  function countTo(el, to) {
    var from = parseInt(el.textContent, 10) || 0;
    if (calm || from === to) { el.textContent = to + "%"; return; }
    var t0 = performance.now(), dur = 500;
    cancelAnimationFrame(el._raf);
    (function f(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e) + "%";
      if (k < 1) el._raf = requestAnimationFrame(f);
    })(t0);
  }
  function soon() { if (!queued) { queued = true; requestAnimationFrame(overview); } }

  // ---------- Next up ----------
  var nxt = null;
  function nextUp() {
    var order = LANES.indexOf(cat) > -1 ? [cat].concat(["gaming", "coding", "sleep"].filter(function (x) { return x !== cat; })) : ["gaming", "coding", "sleep"];
    nxt = null;
    for (var j = 0; j < order.length && !nxt; j++) {
      var c = order[j], d = (st.dn || {})[td() + c] || [], L = TK(c);
      for (var i = 0; i < L.length; i++) if (d.indexOf(i) < 0) { nxt = { c: c, i: i, t: L[i] }; break; }
    }
    $("nxu").hidden = !nxt; $("nxa").hidden = !!nxt;
    if (!nxt) return;
    if ($("nxt").textContent && $("nxt").textContent !== nxt.t[0] && !calm) {
      var box = $("nxu").querySelector(".nx-l"); box.classList.remove("swap"); void box.offsetWidth; box.classList.add("swap");
    }
    $("nxt").textContent = nxt.t[0];
    $("nxn").textContent = NAMES[nxt.c] + (nxt.t[1] ? " · " + nxt.t[1] : "");
  }
  $("nxd").onclick = function () {
    if (!nxt) return;
    var box = document.querySelector('#tk-' + nxt.c + ' input[data-i="' + nxt.i + '"]');
    if (box && !box.checked) box.click();
  };

  // Update the overview whenever a checklist changes
  var baseUpd = upd;
  upd = function (c) { baseUpd(c); soon(); };

  // ---------- Checklist rows: show the time as a pill ----------
  var baseTasks = tasks;
  tasks = function (c) {
    baseTasks(c);
    [].forEach.call($("tk-" + c).querySelectorAll("label.t b"), function (b) {
      var m = b.textContent.match(/^(.*?),\s*((?:about\s+)?\d[\d\s\-–]*(?:min|mins|minutes|h|hr|hrs|hours?))$/i);
      if (m) b.innerHTML = esc(m[1]) + ' <em class="tpill">' + esc(m[2]) + "</em>";
    });
  };
  LANES.forEach(function (c) { tasks(c); });

  // ---------- Tabs: sliding indicator, remember the last tab ----------
  function moveInd() {
    var b = document.querySelector('#tabs button[aria-selected="true"]'), ind = document.querySelector(".tab-ind");
    if (!b || !ind) return;
    ind.style.width = b.offsetWidth + "px";
    ind.style.transform = "translateX(" + b.offsetLeft + "px)";
  }
  var baseShow2 = show;
  show = function (c) {
    baseShow2(c);
    if (st.tab !== c) { st.tab = c; try { localStorage.setItem("apexplan", JSON.stringify(st)); } catch (e) {} }
    moveInd(); soon();
    if (c === "summary") tiles();
  };
  addEventListener("resize", moveInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);
  show(st.tab && $("p-" + st.tab) ? st.tab : "gaming");
  requestAnimationFrame(function () { document.querySelector(".tab-ind").classList.add("ready"); });

  // Tapping a lane opens its tab
  [].forEach.call(document.querySelectorAll(".lane"), function (b) {
    b.onclick = function () {
      toggleFocus(false); show(b.dataset.c);
      $("tabs").scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    };
  });

  // ---------- Break timer (ring, presets, keeps time in the background) ----------
  var mins = st.brk || 10, end = 0, left = mins * 60, tick = null, baseTitle = document.title;
  function fmt(s) { return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function drawTimer() {
    $("tm").textContent = left <= 0 ? "Done" : fmt(left);
    var c = $("trv"); c.setAttribute("pathLength", "100");
    c.style.strokeDasharray = (100 * left / (mins * 60)) + " 100";
    $("tring").classList.toggle("run", !!tick);
    $("ts").textContent = tick ? "Pause" : left < mins * 60 && left > 0 ? "Resume" : "Start";
    document.title = tick ? fmt(left) + " · Break" : baseTitle;
    [].forEach.call(document.querySelectorAll("#tpre button"), function (b) { b.setAttribute("aria-pressed", +b.dataset.m === mins); });
  }
  function stop() { clearInterval(tick); tick = null; }
  function step() {
    left = Math.max(0, Math.round((end - Date.now()) / 1000));
    if (left <= 0) {
      stop(); drawTimer();
      if (window.chime) chime();
      toast("Break's over. Back to it, with a clear head.");
      try { if (window.Notification && Notification.permission === "granted" && document.hidden) new Notification("Break's over", { body: "Back to it, with a clear head.", icon: "../icons/icon-192.png" }); } catch (e) {}
      return;
    }
    drawTimer();
  }
  $("ts").onclick = function () {
    if (tick) { stop(); drawTimer(); return; }          // pause
    if (left <= 0) left = mins * 60;
    end = Date.now() + left * 1000;
    tick = setInterval(step, 250); drawTimer();
  };
  $("tr").onclick = function () { stop(); left = mins * 60; drawTimer(); };
  $("tpre").onclick = function (e) {
    var b = e.target.closest("button"); if (!b) return;
    stop(); mins = +b.dataset.m; left = mins * 60; st.brk = mins; save(); drawTimer();
  };
  $("tbs").onclick = function () {
    $("tb").hidden = true;
    $("tring").closest(".card").scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
    if (!tick) { if (left <= 0) left = mins * 60; $("ts").click(); }
  };
  clearInterval(window.ti);
  drawTimer();

  // ---------- Tilt tracker: last sessions as dots ----------
  var baseTilt = tilt;
  tilt = function () {
    baseTilt();
    var L = (st.tl || []).slice(-14);
    $("tdots").innerHTML = L.length ? L.map(function (x) { return '<i class="' + (x[1] === "c" ? "c" : "t") + '" title="' + x[0] + '"></i>'; }).join("") : '<span class="mute">No sessions logged yet</span>';
  };
  tilt();

  // ---------- Sleep: last 7 nights + bedtime countdown ----------
  var baseSlp = slp;
  slp = function () {
    baseSlp();
    var s = st.sl || {}, out = "";
    for (var i = 6; i >= 0; i--) {
      var e = s[td(i)], h = e ? hrs(e.b, e.w) : null, day = new Date(Date.now() - 86400000 * i).toLocaleDateString("en-US", { weekday: "narrow" });
      out += '<span class="sn' + (h == null ? " none" : h >= 7 ? " good" : " low") + '" title="' + (h == null ? "No log" : h.toFixed(1) + " h") + '"><i style="height:' + (h == null ? 6 : Math.max(10, Math.min(100, h * 10))) + '%"></i><b>' + day + "</b></span>";
    }
    $("snights").innerHTML = out;
    var r = $("sr");
    r.className = r.textContent.indexOf("good") > -1 ? "good" : r.textContent ? "low" : "";
  };
  slp();

  function bedtime() {
    var b = (st.ob && st.ob.bt) || (st.rm && st.rm.b);
    if (!b) { $("bdt").hidden = true; return; }
    var p = b.split(":"), now = new Date(), tgt = new Date();
    tgt.setHours(+p[0], +p[1], 0, 0);
    var diff = Math.round((tgt - now) / 60000);
    if (diff < -360) diff += 1440;                    // bedtime after midnight
    var txt;
    if (diff > 240) { $("bdt").hidden = true; return; }
    if (diff > 60) txt = "Bedtime in " + Math.floor(diff / 60) + "h " + (diff % 60) + "m";
    else if (diff > 0) txt = "Start winding down. Bedtime in " + diff + " min";
    else if (diff > -180) txt = "It's past your bedtime";
    else { $("bdt").hidden = true; return; }
    $("bdt").innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>' + esc(txt);
    $("bdt").classList.toggle("late", diff <= 60);
    $("bdt").hidden = false;
  }
  bedtime(); setInterval(function () { bedtime(); greet(); }, 60000);

  // ---------- Summary tiles ----------
  function tiles() {
    var perfect = 0, s = st.sl || {}, hs = [];
    for (var i = 0; i < 7; i++) {
      var d = td(i), ok = st.ok || {};
      if (ok["gaming" + d] && ok["sleep" + d] && ok["coding" + d]) perfect++;
      var e = s[d], h = e ? hrs(e.b, e.w) : null; if (h) hs.push(h);
    }
    var a = (st.tl || []).filter(function (x) { return x[0] >= td(6); }), cl = a.filter(function (x) { return x[1] === "c"; }).length;
    var best = Math.max(sk("gaming"), sk("sleep"), sk("coding"));
    var T = [
      ["Perfect days", perfect + "/7", "All three checklists done"],
      ["Best streak", best + (best === 1 ? " day" : " days"), "Your longest current run"],
      ["Avg sleep", hs.length ? (hs.reduce(function (x, y) { return x + y; }, 0) / hs.length).toFixed(1) + " h" : "–", "Over the last 7 nights"],
      ["Calm sessions", a.length ? Math.round(100 * cl / a.length) + "%" : "–", a.length ? cl + " of " + a.length + " this week" : "Log sessions to see this"],
      ["Coding logs", String((st.tc || []).length), "Everything you've logged"]
    ];
    $("tiles").innerHTML = T.map(function (t) { return '<div class="tile"><span>' + t[0] + "</span><b>" + t[1] + "</b><small>" + t[2] + "</small></div>"; }).join("");
  }

  // ---------- Learning log: Enter adds the entry ----------
  $("tx").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("ta").click(); } });

  // ---------- Keyboard shortcuts help ----------
  function keysHelp() {
    if (document.querySelector(".dlg.keys")) return;
    var d = document.createElement("dialog"); d.className = "dlg keys";
    var K = [["1 – 4", "Switch tabs"], ["N", "Check off your next task"], ["F", "Focus mode on or off"], ["Esc", "Leave focus mode"], ["?", "Show this list"]];
    d.innerHTML = '<form method="dialog"><h2>Keyboard shortcuts</h2><dl class="kl">' + K.map(function (k) { return "<div><dt><kbd>" + k[0] + "</kbd></dt><dd>" + k[1] + "</dd></div>"; }).join("") + '</dl><div class="row"><button class="pri" type="submit">Got it</button></div></form>';
    d.addEventListener("close", function () { d.remove(); });
    document.body.appendChild(d); d.showModal();
  }
  $("kbd").onclick = keysHelp;
  addEventListener("keydown", function (e) {
    var t = e.target, tag = (t.tagName || "").toLowerCase();
    if (e.ctrlKey || e.metaKey || e.altKey || tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable || document.querySelector("dialog[open], .tour")) return;
    if (e.key === "?") { e.preventDefault(); keysHelp(); }
    else if (e.key === "n" || e.key === "N") $("nxd").click();
  });

  overview();

  // ---------- Share today's checklists with the Windows app ----------
  // The Windows app reads st.lists, so it shows the same tasks as the website.
  // Saved only when something changed, so it doesn't cause extra syncing.
  function snapshotLists() {
    try {
      var fd = st.fd || [0, 1, 2], days = [0, 1, 2, 3, 4, 5, 6], keepW = W, out = { v: 1, gaming: {}, sleep: TK("sleep"), coding: TK("coding") };
      var fullDay = days.filter(function (x) { return fd.indexOf(x) > -1; })[0], shortDay = days.filter(function (x) { return fd.indexOf(x) < 0; })[0];
      if (fullDay != null) { W = fullDay; build(); out.gaming.full = TK("gaming"); }
      if (shortDay != null) { W = shortDay; build(); out.gaming.short = TK("gaming"); }
      W = keepW; build();
      out.fd = fd.slice();
      if (JSON.stringify(out) !== JSON.stringify(st.lists)) { st.lists = out; save(); }
    } catch (e) {}
  }
  snapshotLists();
  var baseFin = fin;
  fin = function (c, keep) { baseFin(c, keep); snapshotLists(); };
  var baseMove = move;
  move = function (c, a, b) { baseMove(c, a, b); snapshotLists(); };
})();
