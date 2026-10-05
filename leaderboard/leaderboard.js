// ===== Friends leaderboard =====
import { auth, db, ready, getLocal, setLocal, push, getBoard, updateBoard, sendNudge, nameProblem } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { collection, query, where, getDocs, doc, deleteDoc, limit } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const $ = function (id) { return document.getElementById(id); };
let st = getLocal(), uid = null;

// Theme
if (st.th) document.documentElement.style.setProperty("--acc", st.th);
if (st.md && st.md !== "auto") document.documentElement.setAttribute("data-theme", st.md);
$("bk").onclick = function () { location.href = "../home/"; };

function save() {
  st.ts = Date.now(); setLocal(st);
  if (uid) push(uid, st).catch(function () {});
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function msg(t) { $("er").hidden = !t; $("er").textContent = t || ""; }
function status(html) { $("st").hidden = false; $("app").hidden = true; $("st").innerHTML = html; }

// ===== Friend codes =====
const ABC = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode() { let c = ""; for (let i = 0; i < 6; i++) c += ABC[Math.floor(Math.random() * ABC.length)]; return c; }
async function findCode(code) {
  const snap = await getDocs(query(collection(db, "board"), where("code", "==", code), limit(1)));
  return snap.empty ? null : snap.docs[0].data();
}

// ===== Join / leave =====
function showJoin() {
  status('<div class="empty-st"><span class="es-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg></span><h2>Join the leaderboard</h2><p class="mute">Friends you add will see your name and your streaks. Nothing else is shared.</p><button type="button" class="pri" id="jn">Join the leaderboard</button></div>');
  $("jn").onclick = async function () {
    this.disabled = true; this.textContent = "Joining…";
    try {
      let code = newCode();
      while (await findCode(code)) code = newCode();
      let name = (st.nm || (auth.currentUser.displayName || "").split(" ")[0] || "Player").slice(0, 24);
      if (nameProblem(name)) name = "Player";
      st.lb = { code: code, name: name, fr: [] };
      save();
      await updateBoard(uid, st);
      render();
    } catch (e) {
      this.disabled = false; this.textContent = "Join";
      ui.alert("Couldn't join", "Check your internet and try again.");
    }
  };
}
$("lv").onclick = async function () {
  if (!(await ui.confirm("Leave the leaderboard?", "Friends won't see your streaks anymore. You can join again later.", { ok: "Leave", danger: true }))) return;
  try { await deleteDoc(doc(db, "board", uid)); } catch (e) {}
  delete st.lb; save(); showJoin();
};

// ===== Show the board =====
async function render() {
  $("st").hidden = true; $("app").hidden = false;
  $("my").textContent = st.lb.code;
  $("dn").value = st.lb.name;
  const codes = [st.lb.code].concat(st.lb.fr || []), rows = [];
  try {
    for (let i = 0; i < codes.length; i += 30) {
      const snap = await getDocs(query(collection(db, "board"), where("code", "in", codes.slice(i, i + 30))));
      snap.forEach(function (d) { const x = d.data(); x.uid = d.id; rows.push(x); });
    }
  } catch (e) { $("lb").innerHTML = '<li class="mute">Couldn\'t load the board. Try again later.</li>'; return; }
  rows.sort(function (a, b) { return b.streak - a.streak || b.best - a.best; });
  $("cnt").textContent = (rows.length - 1) + (rows.length === 2 ? " friend" : " friends");
  $("lb").innerHTML = rows.map(function (r, i) {
    const me = r.code === st.lb.code;
    return '<li class="' + (me ? "me" : "") + '" style="--i:' + i + '"><span class="rk">' + (i + 1) + '</span><span class="av">' + esc(r.name.charAt(0).toUpperCase()) +
      '</span><span class="nm"><b>' + esc(r.name) + (me ? " (you)" : "") + '</b><span class="mute">Best ' + r.best + (r.best === 1 ? " day" : " days") + '</span></span>' +
      '<span class="sv"><b>' + r.streak + '</b><span class="mute">day streak</span></span>' +
      (me ? "" : '<span class="acts"><button type="button" class="nd" data-u="' + esc(r.uid) + '"' + (nudged(r.uid) ? " disabled" : "") + ' aria-label="Nudge ' + esc(r.name) + '">' + (nudged(r.uid) ? "Nudged" : "Nudge") + '</button>' +
        '<button type="button" class="rm" data-c="' + esc(r.code) + '" aria-label="Remove ' + esc(r.name) + '">Remove</button></span>') + "</li>";
  }).join("") + (rows.length < 2 ? '<li class="empty mute">No friends yet. Share your code above, or add theirs below.</li>' : "");
}
function nudged(u) { return st.lb.nd && st.lb.nd[u] === new Date().toLocaleDateString("en-CA"); }
$("lb").onclick = async function (e) {
  const n = e.target.closest(".nd");
  if (n) {
    n.disabled = true; n.textContent = "Sending…";
    try {
      await sendNudge(uid, n.dataset.u, st.lb.name);
      st.lb.nd = st.lb.nd || {}; st.lb.nd[n.dataset.u] = new Date().toLocaleDateString("en-CA"); save();
      n.textContent = "Nudged";
    } catch (err) { n.textContent = "Try later"; }
    return;
  }
  const b = e.target.closest(".rm"); if (!b) return;
  st.lb.fr = (st.lb.fr || []).filter(function (c) { return c !== b.dataset.c; });
  save(); render();
};

// ===== Add a friend =====
$("af").onsubmit = async function (e) {
  e.preventDefault(); msg("");
  const code = $("fc").value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (code.length !== 6) return msg("Friend codes are 6 letters and numbers.");
  if (code === st.lb.code) return msg("That's your own code.");
  if ((st.lb.fr || []).indexOf(code) > -1) return msg("You already added them.");
  if ((st.lb.fr || []).length >= 50) return msg("You can add up to 50 friends.");
  const today = new Date().toLocaleDateString("en-CA");
  if (!st.lb.ad || st.lb.ad.d !== today) st.lb.ad = { d: today, n: 0 };
  if (st.lb.ad.n >= 10) return msg("You've added 10 friends today. Try again tomorrow.");
  try {
    if (!(await findCode(code))) return msg("No one has that code. Check it and try again.");
  } catch (err) { return msg("Couldn't check that code. Try again."); }
  st.lb.fr = (st.lb.fr || []).concat(code); st.lb.ad.n++; save();
  $("fc").value = ""; render();
};

// ===== Name and copy =====
let nt;
$("dn").oninput = function () {
  clearTimeout(nt);
  nt = setTimeout(function () {
    const v = $("dn").value.trim().slice(0, 24); if (!v) return;
    const bad = nameProblem(v);
    $("dn").setAttribute("aria-invalid", bad ? "true" : "false");
    $("dne").hidden = !bad; $("dne").textContent = bad;
    if (bad) return;
    st.lb.name = v; save(); updateBoard(uid, st).then(render).catch(function () {});
  }, 800);
};
$("cp").onclick = async function () {
  try { await navigator.clipboard.writeText(st.lb.code); this.textContent = "Copied!"; }
  catch (e) { this.textContent = "Select and copy it"; }
  const b = this; setTimeout(function () { b.textContent = "Copy"; }, 2000);
};

// ===== Start =====
if (!ready) {
  status('<div class="empty-st"><span class="es-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg></span><h2>Leaderboard is off</h2><p class="mute">Accounts aren\'t set up yet, so the leaderboard is off.</p></div>');
} else {
  onAuthStateChanged(auth, async function (user) {
    if (!user) {
      status('<div class="empty-st"><span class="es-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/></svg></span><h2>Sign in to compete</h2><p class="mute">The leaderboard needs an account so friends can find you. It only takes a minute.</p><button type="button" class="pri" id="si">Sign in</button></div>');
      $("si").onclick = function () { location.href = "../login/"; };
      return;
    }
    uid = user.uid; st = getLocal();
    if (!st.lb) {
      try {
        const mine = await getBoard(uid);
        if (mine) { st.lb = { code: mine.code, name: mine.name, fr: [] }; save(); }
      } catch (e) {}
    }
    if (st.lb) { updateBoard(uid, st).catch(function () {}).then(render); } else showJoin();
  });
}
