// ===== Extra features (runs after script.js and content.js) =====

// ---------- Quotes by mood ----------
function mixLists(a, b) { var p = []; for (var i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) p.push(a[i]); if (b[i]) p.push(b[i]); } return p; }
function setQ() {
  var m = st.qm || "mix", mood = st.qmo || "any", h = Math.floor(Date.now() / 3600000);
  var src = (mood !== "any" && CONTENT.moods[mood]) ? CONTENT.moods[mood] : { q: CONTENT.quotes, v: CONTENT.verses };
  var verses = src.v.map(function (ref) { return { ref: ref }; }), quotes = src.q.map(function (q) { return { q: q }; });
  var p = m === "moti" ? quotes : m === "faith" ? verses : mixLists(quotes, verses);
  if (!p.length) p = quotes.length ? quotes : verses;
  [].forEach.call(document.querySelectorAll("#qm button"), function (b) { b.setAttribute("aria-pressed", b.dataset.m === m); });
  [].forEach.call(document.querySelectorAll("#qmo button"), function (b) { b.setAttribute("aria-pressed", b.dataset.o === mood); });
  var it = p[(h + (st.qsh || 0)) % p.length];
  if (it.q) { $("qt").textContent = "\u201C" + it.q[0] + "\u201D"; $("qa").textContent = "\u2014 " + it.q[1]; return; }
  var t = verseText(it.ref);
  $("qt").textContent = t ? "\u201C" + t + "\u201D" : "Loading verse\u2026";
  $("qa").textContent = "\u2014 " + it.ref + " (KJV)";
  loadVerse(it.ref, setQ);
}
$("qmo").onclick = function (e) { var b = e.target.closest("button"); if (b) { st.qmo = b.dataset.o; st.qsh = 0; save(); setQ(); } };
$("qnx").onclick = function () { st.qsh = (st.qsh || 0) + 1; save(); setQ(); };
setQ();

// ---------- Drill guide ----------
function drillFor(text) {
  var L = genreOf(st).drills, t = String(text || "").toLowerCase();
  for (var i = 0; i < L.length; i++) if (L[i].name.toLowerCase() === t) return L[i];
  for (i = 0; i < L.length; i++) if ((L[i].keys || []).some(function (k) { return t.indexOf(k) > -1; })) return L[i];
  for (i = 0; i < L.length; i++) if (t.indexOf(L[i].name.toLowerCase()) > -1) return L[i];
  return L[0];
}
function drillHTML(d) {
  return '<div class="head"><b>' + esc(d.name) + '</b><span class="pill">' + esc(d.time) + '</span></div><ol class="steps">' +
    d.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ol><p class="tip"><b>Tip:</b> ' + esc(d.tip) + "</p>";
}
function drills() {
  var today = drillFor(foc);
  $("dgt").innerHTML = drillHTML(today);
  $("dga").innerHTML = genreOf(st).drills.filter(function (d) { return d.name !== today.name; }).map(function (d) { return '<div class="dgi">' + drillHTML(d) + "</div>"; }).join("");
}
drills();

// ---------- Daily coding project idea ----------
function projectList() {
  var cp = st.ob && st.ob.cp, want = cp === "py" ? "p" : cp === "web" ? "w" : null;
  return PROJECTS.filter(function (p) { return !want || p[0] === want; });
}
function aiIdea() { return st.pj && st.pj.d === td() && st.pj.list && st.pj.list.length ? st.pj.list[(st.pj.i || 0) % st.pj.list.length] : null; }
function project() {
  var p = aiIdea();
  if (!p) { var L = projectList(), day = Math.floor(Date.now() / 86400000), off = (st.pio && st.pio.d === td()) ? st.pio.n : 0; p = L[(day + off) % L.length]; }
  $("pit").textContent = p[1];
  $("pid").textContent = p[2];
  $("pil").textContent = p[0] === "p" ? "Python" : "HTML, CSS, JS";
  $("pib").dataset.t = p[1];
}
function moreIdeas(done) {
  if (!window.AI || !st.ob || !st.ob.goals || st.ob.goals.indexOf("code") < 0) { if (done) done(false); return; }
  var built = (st.tc || []).map(function (x) { return x.t.replace(/^Built: /, ""); }).slice(-15);
  var seen = (st.pj && st.pj.d === td() ? st.pj.list.map(function (x) { return x[1]; }) : []).concat(built);
  window.AI.projects(st.ob.cl, st.ob.cp, seen).then(function (L) {
    if (!L.length) { if (done) done(false); return; }
    if (st.pj && st.pj.d === td()) { st.pj.list = st.pj.list.concat(L); st.pj.n = (st.pj.n || 1) + 1; }
    else st.pj = { d: td(), list: L, i: 0, n: 1 };
    save(); if (done) done(true);
  });
}
$("pin").onclick = function () {
  var b = this;
  if (aiIdea()) {
    st.pj.i = (st.pj.i || 0) + 1;
    if (st.pj.i >= st.pj.list.length && (st.pj.n || 1) < 3 && window.AI) {
      b.disabled = true; b.textContent = "Thinking\u2026";
      moreIdeas(function () { b.disabled = false; b.textContent = "Another idea"; if (st.pj.i >= st.pj.list.length) st.pj.i = 0; save(); project(); });
      return;
    }
    if (st.pj.i >= st.pj.list.length) st.pj.i = 0;
    save(); project(); return;
  }
  var o = (st.pio && st.pio.d === td()) ? st.pio.n : 0; st.pio = { d: td(), n: o + 1 }; save(); project();
};
project();
$("pib").onclick = function () {
  st.tc = st.tc || []; st.tc.push({ d: td(), t: "Built: " + this.dataset.t }); save(); tlog();
  this.textContent = "Added to your log"; var b = this; setTimeout(function () { b.textContent = "I built this"; }, 2000);
};
project();

// ---------- Week helpers ----------
function weekDates() { var a = []; for (var i = 0; i <= W; i++) a.push(td(i)); return a; }
function inWeek(d) { return weekDates().indexOf(d) > -1; }
function weekKey() { return td(W); }

// ---------- Weekly challenges ----------
function challengeCount(id) {
  var D = weekDates(), ok = st.ok || {};
  switch (id) {
    case "calm": return (st.tl || []).filter(function (x) { return inWeek(x[0]) && x[1] === "c"; }).length;
    case "sleep": return D.filter(function (d) { var e = (st.sl || {})[d]; return e && hrs(e.b, e.w) >= 7; }).length;
    case "logs": return (st.tc || []).filter(function (x) { return inWeek(x.d); }).length;
    case "gday": return D.filter(function (d) { return ok["gaming" + d]; }).length;
    case "cday": return D.filter(function (d) { return ok["coding" + d]; }).length;
    case "score": return (st.sc || []).filter(function (x) { return inWeek(x.d); }).length;
    case "notes": return D.filter(function (d) { return ((st.nt || {})[d] || "").trim(); }).length;
    case "all": return D.filter(function (d) { return ok["gaming" + d] && ok["sleep" + d] && ok["coding" + d]; }).length;
    case "rank": return (st.rkl || []).filter(function (x) { return inWeek(x.d); }).length;
  }
  return 0;
}
function thisWeeksChallenges() {
  var L = CONTENT.challenges.filter(function (c) { return c.on !== false; });
  var seed = Math.floor((Date.now() / 86400000 + 3) / 7), n = L.length, out = [];
  for (var k = 0; out.length < Math.min(3, n) && k < n * 4; k++) { var c = L[(seed * 5 + k * 4) % n]; if (out.indexOf(c) < 0) out.push(c); }
  return out;
}
function challenges() {
  var L = thisWeeksChallenges(), done = 0;
  $("wchl").innerHTML = L.map(function (c) {
    var v = Math.min(challengeCount(c.id), c.goal), fin = v >= c.goal; if (fin) done++;
    return '<li class="' + (fin ? "fin" : "") + '"><div class="head"><span>' + (fin ? "✓ " : "") + esc(c.text) + '</span><span class="mute">' + v + "/" + c.goal +
      '</span></div><div class="bar"><i style="width:' + (100 * v / c.goal) + '%"></i></div></li>';
  }).join("");
  $("wchs").textContent = L.length ? done + " of " + L.length + " done. New challenges every Monday." : "No challenges this week.";
  st.chw = st.chw || {};
  if (st.chw[weekKey()] !== done) { st.chw[weekKey()] = done; save(); }
}

// ---------- Daily notes ----------
function notes() {
  var n = st.nt || {};
  $("ntx").value = n[td()] || "";
  var past = Object.keys(n).filter(function (d) { return d < td() && (n[d] || "").trim(); }).sort().reverse().slice(0, 5);
  $("ntp").innerHTML = past.length ? past.map(function (d) {
    return "<li><b>" + new Date(d + "T12:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + "</b>" + esc(n[d]) + "</li>";
  }).join("") : '<li class="mute">Your past notes will show here.</li>';
}
var ntTimer;
$("ntx").oninput = function () { clearTimeout(ntTimer); var v = this.value; ntTimer = setTimeout(function () { st.nt = st.nt || {}; st.nt[td()] = v; if (!v.trim()) delete st.nt[td()]; save(); }, 600); };

// ---------- Month calendar ----------
var moOff = 0;
function month() {
  var now = new Date(), first = new Date(now.getFullYear(), now.getMonth() + moOff, 1), y = first.getFullYear(), m = first.getMonth();
  var days = new Date(y, m + 1, 0).getDate(), lead = (first.getDay() + 6) % 7, ok = st.ok || {}, today = td(), html = "";
  $("mot").textContent = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  $("monx").disabled = moOff >= 0;
  ["M", "T", "W", "T", "F", "S", "S"].forEach(function (d) { html += '<span class="dow">' + d + "</span>"; });
  for (var i = 0; i < lead; i++) html += "<span></span>";
  for (var d = 1; d <= days; d++) {
    var key = y + "-" + ("0" + (m + 1)).slice(-2) + "-" + ("0" + d).slice(-2), got = [];
    ["gaming", "sleep", "coding"].forEach(function (c) { if (ok[c + key]) got.push(c); });
    var label = new Date(key + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric" }) + ": " + (got.length ? got.join(", ") + " done" : "nothing finished");
    html += '<span class="day' + (key === today ? " now" : "") + (key > today ? " fut" : "") + '" title="' + label + '" aria-label="' + label + '"><b>' + d + '</b><span class="dots">' +
      ["gaming", "sleep", "coding"].map(function (c) { return '<i class="c-' + c + (got.indexOf(c) > -1 ? " on" : "") + '"></i>'; }).join("") + "</span></span>";
  }
  $("mog").innerHTML = html;
}
$("mopv").onclick = function () { moOff--; month(); };
$("monx").onclick = function () { if (moOff < 0) { moOff++; month(); } };

// ---------- Rank tracker ----------
function rankInfo() { return rankInfoFor(st); }
function rankSetup() {
  var R = rankInfo(), opts = [];
  R.tiers.forEach(function (t) { R.div.forEach(function (d) { opts.push(t + " " + d); }); });
  opts = opts.concat(R.top);
  $("rkd").innerHTML = opts.map(function (o) { return '<option value="' + o + '">'; }).join("");
  $("rkpl").textContent = R.pts + " (optional)";
  $("rkn").placeholder = st.gm === "CS2" ? "Example: Premier 12,500" : st.gm === "Chess" ? "Example: 1200 rapid" : opts.length ? "Example: " + opts[Math.min(14, opts.length - 1)] : "Your rank";
}
function ranks() {
  var L = st.rkl || [], last = L[L.length - 1], R = rankInfo();
  $("rkc").textContent = last ? last.r + (last.p != null ? " · " + last.p + " " + R.pts : "") : "No rank logged yet";
  $("rkh").innerHTML = L.slice(-6).reverse().map(function (x) {
    return "<li><span>" + new Date(x.d + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) + "</span><b>" + esc(x.r) + "</b>" + (x.p != null ? '<span class="mute">' + x.p + " " + esc(R.pts) + "</span>" : "") + "</li>";
  }).join("");
  var pts = L.filter(function (x) { return x.p != null; }).slice(-14).map(function (x) { return x.p; });
  $("rkg").innerHTML = pts.length < 2 ? "" : '<svg viewBox="0 0 300 70" width="100%" role="img" aria-label="' + R.pts + ' over time, from ' + pts[0] + " to " + pts[pts.length - 1] + '">' + sp(pts, "var(--acc)") + "</svg>";
}
$("rka").onclick = function () {
  var r = $("rkn").value.trim(); if (!r) { $("rkn").focus(); return; }
  var p = $("rkp").value === "" ? null : Math.round(+$("rkp").value);
  st.rkl = (st.rkl || []).filter(function (x) { return x.d !== td(); });
  st.rkl.push({ d: td(), r: r.slice(0, 40), p: isFinite(p) ? p : null }); save();
  $("rkn").value = ""; $("rkp").value = ""; ranks(); toast("Rank logged");
};
rankSetup(); ranks();

// ---------- Focus mode ----------
function toggleFocus(on) {
  var b = document.body, now = on == null ? !b.classList.contains("focus") : on;
  b.classList.toggle("focus", now); $("fx").hidden = !now;
  if (now) scrollTo(0, 0);
}
window.toggleFocus = toggleFocus;
$("fx").onclick = function () { toggleFocus(false); };

// ---------- Keyboard shortcuts ----------
addEventListener("keydown", function (e) {
  var t = e.target, tag = (t.tagName || "").toLowerCase();
  if (e.ctrlKey || e.metaKey || e.altKey || tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable) return;
  if (document.querySelector(".tour")) return;
  var tabs = { "1": "gaming", "2": "sleep", "3": "coding", "4": "summary" };
  if (tabs[e.key]) { toggleFocus(false); show(tabs[e.key]); }
  else if (e.key === "f" || e.key === "F") toggleFocus();
  else if (e.key === "Escape" && document.body.classList.contains("focus")) toggleFocus(false);
});

// ---------- Sound when a checklist is finished ----------
function chime() {
  if (st.snd === false) return;
  try {
    var A = window.AudioContext || window.webkitAudioContext, ctx = new A(), t = ctx.currentTime;
    [[659.25, 0], [880, 0.12]].forEach(function (n) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = n[0];
      g.gain.setValueAtTime(0.0001, t + n[1]); g.gain.exponentialRampToValueAtTime(0.18, t + n[1] + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + n[1] + 0.35);
      o.connect(g); g.connect(ctx.destination); o.start(t + n[1]); o.stop(t + n[1] + 0.4);
    });
    setTimeout(function () { ctx.close(); }, 800);
  } catch (e) {}
}
var baseCelebrate = celebrate;
celebrate = function (from, c) { baseCelebrate(from, c); chime(); challenges(); };

// ---------- Refresh the Summary tab ----------
var baseSumry = sumry;
sumry = function () { baseSumry(); challenges(); notes(); month(); };
var baseShow = show;
show = function (c) { baseShow(c); if (c === "gaming") drills(); };

// ---------- What's new popup ----------
function whatsNew() {
  var N = CONTENT.news;
  if (!st.seenv) { st.seenv = N.v; save(); return; }   // brand new users get the tour instead
  if (st.seenv === N.v || !N.items.length) return;
  st.seenv = N.v; save();
  var d = document.createElement("dialog"); d.className = "dlg";
  d.innerHTML = '<form method="dialog"><p class="mute" style="margin:0">Version ' + esc(N.v) + '</p><h2>What\'s new</h2><ul class="news">' +
    N.items.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") + '</ul><div class="row"><button class="pri" type="submit">Got it</button></div></form>';
  d.addEventListener("close", function () { d.remove(); });
  document.body.appendChild(d); d.showModal(); d.querySelector(".pri").focus();
}
setTimeout(whatsNew, 600);

// ---------- When fresh content arrives from the database ----------
window.onContent = function () {
  setQ();
  if (!$("p-summary").hidden) challenges();
};

// ---------- AI: custom game plan and today's project ideas ----------
function refreshGame() {
  build(); gameWords(); setFc(); tasks("gaming"); drills(); rankSetup(); ranks(); chart();
}
function aiStart() {
  if (!window.AI) return;
  // Game plan: make one if this game doesn't have one yet (tries at most once a day per game)
  var game = st.gn || "", key = normGame(game);
  var auto = !st.gg || st.gg === detectGame(game).g;
  if (key && auto && !aiPlan(st) && !(st.gpTry && st.gpTry.k === key && st.gpTry.d === td())) {
    st.gpTry = { k: key, d: td() }; save();
    window.AI.gamePlan(game).then(function (r) {
      if (!r || normGame(st.gn || "") !== key) return;
      st.gp = r; if (st.gg) st.gg = r.g; save(); refreshGame();
      toast("Your " + r.name + " plan is ready");
    });
  }
  // Project ideas: get today's batch
  // Project ideas: get today's batch (one try per day, so a failing AI doesn't eat the daily limit)
  if (!aiIdea() && st.pjTry !== td()) { st.pjTry = td(); save(); moreIdeas(function (ok) { if (ok) project(); }); }
}
window.addEventListener("ai-ready", aiStart);
if (window.AI) aiStart();
