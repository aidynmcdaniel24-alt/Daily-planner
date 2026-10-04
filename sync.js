// ===== Keeps the planner synced with your account =====
import { auth, db, ready, push, syncDown, getLocal, kickAll, updateBoard, recentLogins, deleteLogins, takeNudges, sendFeedback } from "./firebase.js";
import { onAuthStateChanged, signOut, sendEmailVerification, deleteUser } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const ac = document.getElementById("ac"), lo = document.getElementById("lo"), pf = document.getElementById("pf");
const vb = document.getElementById("vb"), del = document.getElementById("del"), lout = document.getElementById("lout");
const nb = document.getElementById("nb"), rl = document.getElementById("rl");
let timer;
const LOGIN = new URL("login/login.html", import.meta.url).href;
const SETTINGS = new URL("settings/settings.html", import.meta.url).href;
const BOARD = new URL("leaderboard/leaderboard.html", import.meta.url).href;

// script.js calls this every time it saves
window.cloudSave = function (st) {
  const u = auth.currentUser;
  if (!u || st.acct !== u.uid) return;
  clearTimeout(timer);
  timer = setTimeout(function () {
    if (pf) pf.classList.add("saving");
    push(u.uid, st).catch(function () {}).then(function () { if (pf) pf.classList.remove("saving"); });
  }, 1500);
};

async function clearAndLeave() {
  await signOut(auth);
  localStorage.removeItem("apexplan");
  localStorage.removeItem("apexlogin");
  localStorage.removeItem("apexseen");
  location.replace(LOGIN);
}
async function logout() {
  if (!confirm("Log out? Your data stays saved in your account.")) return;
  await clearAndLeave();
}
async function logoutAll() {
  if (!confirm("Log out on every device, including this one?")) return;
  try { await kickAll(auth.currentUser.uid); } catch (e) { alert("Couldn't reach the server. Try again."); return; }
  await clearAndLeave();
}
function goLogin() { location.href = LOGIN; }

if (lo) lo.onclick = function () { auth.currentUser ? logout() : goLogin(); };

// ===== Email verification banner =====
async function checkVerified(user) {
  if (!vb) return;
  const usesPassword = user.providerData.some(function (p) { return p.providerId === "password"; });
  if (!usesPassword) return;
  try { await user.reload(); } catch (e) {}
  if (auth.currentUser.emailVerified) return;
  vb.hidden = false;
  vb.innerHTML = 'Please verify your email. Check your inbox for the link. <button type="button" class="link" id="vr">Resend email</button>';
  document.getElementById("vr").onclick = async function () {
    try { await sendEmailVerification(auth.currentUser); this.textContent = "Sent!"; }
    catch (e) { this.textContent = "Wait a minute, then try again"; }
  };
}

// ===== Delete account =====
async function deleteAccount() {
  const u = auth.currentUser; if (!u) return;
  if (Date.now() - Date.parse(u.metadata.lastSignInTime) > 5 * 60 * 1000) {
    alert("For safety, log out and log back in, then delete your account within 5 minutes.");
    return;
  }
  if (prompt("This deletes your account and all saved data forever. Type DELETE to confirm.") !== "DELETE") return;
  try {
    await deleteLogins(u.uid);
    try { await deleteDoc(doc(db, "board", u.uid)); } catch (x) {}
    await deleteDoc(doc(db, "users", u.uid));
    await deleteUser(u);
    localStorage.removeItem("apexplan");
    location.replace(LOGIN);
  } catch (e) {
    alert(e.code === "auth/requires-recent-login"
      ? "For safety, log out and log back in, then try again."
      : "Couldn't delete your account. Try again.");
  }
}

// ===== Profile in the top corner =====
function fillAvatar(el, user, name) {
  if (user.photoURL) {
    const img = document.createElement("img");
    img.src = user.photoURL; img.alt = ""; img.referrerPolicy = "no-referrer";
    img.onerror = function () { el.textContent = name.charAt(0).toUpperCase(); };
    el.appendChild(img);
  } else {
    el.textContent = name.charAt(0).toUpperCase();
  }
}

// Builds the profile button and its menu (used for signed-in users and guests)
function buildMenu(opts) {
  if (!pf) return;
  pf.innerHTML =
    '<button type="button" class="av" id="avb" aria-haspopup="menu" aria-expanded="false"></button>' +
    '<div class="menu" id="pm" role="menu" hidden>' +
      '<div class="mh"><div class="av" id="ava"></div><div><b id="pn"></b><span id="pe"></span></div></div>' +
      opts.items.map(function (it) { return '<button type="button" role="menuitem" data-a="' + it[0] + '">' + it[1] + "</button>"; }).join("") +
    "</div>";
  const avb = document.getElementById("avb"), pm = document.getElementById("pm");
  opts.fill(avb); opts.fill(document.getElementById("ava"));
  avb.setAttribute("aria-label", "Account menu for " + opts.name);
  document.getElementById("pn").textContent = opts.name;
  document.getElementById("pe").textContent = opts.sub;

  function toggle(open) { pm.hidden = !open; avb.setAttribute("aria-expanded", open); }
  avb.onclick = function (e) { e.stopPropagation(); toggle(pm.hidden); };
  pm.onclick = function (e) {
    const b = e.target.closest("button"); if (!b) return;
    toggle(false);
    const a = b.dataset.a;
    if (a === "set") location.href = SETTINGS;
    if (a === "lb") location.href = BOARD;
    if (a === "out") logout();
    if (a === "in") goLogin();
    if (a === "focus" && window.toggleFocus) window.toggleFocus(true);
    if (a === "fb") openFeedback();
  };
  document.addEventListener("click", function (e) { if (!pf.contains(e.target)) toggle(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
}

const PERSON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

function showProfile(user) {
  const s = getLocal();
  const name = user.displayName || s.nm || (user.email || "User").split("@")[0];
  buildMenu({
    name: name, sub: user.email || "",
    fill: function (el) { fillAvatar(el, user, name); },
    items: (window.toggleFocus ? [["focus", "Focus mode"]] : []).concat([["lb", "Leaderboard"], ["set", "Settings"], ["fb", "Send feedback"], ["out", "Log out"]])
  });
}

function showGuest() {
  const s = getLocal();
  buildMenu({
    name: s.nm || "Guest", sub: "Not signed in",
    fill: function (el) { el.classList.add("guest"); el.innerHTML = PERSON; },
    items: (window.toggleFocus ? [["focus", "Focus mode"]] : []).concat(ready ? [["in", "Sign in to sync"], ["set", "Settings"], ["fb", "Send feedback"]] : [["set", "Settings"], ["fb", "Send feedback"]])
  });
}

// ===== Send feedback =====
const ISSUES = "https://github.com/aidynmcdaniel24-alt/Daily-planner/issues/new";
function openFeedback() {
  if (!auth.currentUser) { window.open(ISSUES, "_blank", "noopener"); return; }
  const d = document.createElement("dialog");
  d.className = "dlg";
  d.innerHTML = '<form method="dialog" id="fbf"><h2>Send feedback</h2><p class="mute">Found a bug or have an idea? Tell me.</p>' +
    '<div class="row" id="fbt" role="radiogroup" aria-label="Type"><button type="button" data-t="bug" aria-pressed="true">Bug</button><button type="button" data-t="idea" aria-pressed="false">Idea</button><button type="button" data-t="other" aria-pressed="false">Other</button></div>' +
    '<label class="l" for="fbx" style="margin-top:14px">Your message</label><textarea id="fbx" maxlength="2000" required placeholder="What happened, or what would you like to see?"></textarea>' +
    '<p class="err" id="fbe" hidden></p><div class="row"><button type="button" id="fbc">Cancel</button><button type="submit" class="pri" id="fbs">Send</button></div></form>';
  document.body.appendChild(d);
  let type = "bug";
  d.querySelector("#fbt").onclick = function (e) {
    const b = e.target.closest("button"); if (!b) return; type = b.dataset.t;
    [].forEach.call(this.children, function (x) { x.setAttribute("aria-pressed", x === b); });
  };
  d.querySelector("#fbc").onclick = function () { d.close(); };
  d.addEventListener("close", function () { d.remove(); });
  d.querySelector("#fbf").onsubmit = async function (e) {
    e.preventDefault();
    const text = d.querySelector("#fbx").value.trim(), err = d.querySelector("#fbe"), btn = d.querySelector("#fbs");
    if (!text) { err.hidden = false; err.textContent = "Type a message first."; return; }
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      await sendFeedback(auth.currentUser.uid, type, text, location.pathname.slice(-100));
      d.querySelector("form").innerHTML = '<h2>Thanks!</h2><p class="mute">Your feedback was sent.</p><div class="row"><button type="submit" class="pri">Close</button></div>';
    } catch (x) { btn.disabled = false; btn.textContent = "Send"; err.hidden = false; err.textContent = "Couldn't send. Check your internet and try again."; }
  };
  d.showModal(); d.querySelector("#fbx").focus();
}

// ===== Nudges and recent logins =====
async function showNudges(uid) {
  if (!nb) return;
  try {
    const names = await takeNudges(uid);
    if (!names.length) return;
    const who = names.length === 1 ? names[0] : names.length === 2 ? names[0] + " and " + names[1] : names[0] + " and " + (names.length - 1) + " others";
    nb.textContent = who + " nudged you. Keep your streak alive today!";
    nb.hidden = false;
  } catch (e) {}
}
async function showLogins(uid) {
  if (!rl) return;
  try {
    const L = await recentLogins(uid);
    if (!L.length) return;
    rl.innerHTML = "";
    L.forEach(function (x) {
      const li = document.createElement("li"), a = document.createElement("span"), b = document.createElement("span");
      a.textContent = x.device; b.className = "mute";
      b.textContent = x.time ? x.time.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
      li.appendChild(a); li.appendChild(b); rl.appendChild(li);
    });
    document.getElementById("rlw").hidden = false;
  } catch (e) {}
}

// ===== Sign out after time away =====
const MAX_AWAY_DAYS = 14;
function awayTooLong() {
  const seen = +(localStorage.getItem("apexseen") || 0);
  return seen && Date.now() - seen > MAX_AWAY_DAYS * 86400000;
}
function markSeen() { try { localStorage.setItem("apexseen", String(Date.now())); } catch (e) {} }

// ===== Watch sign-in state =====
if (pf && ready) pf.innerHTML = '<span class="spin" role="status" aria-label="Loading your account"></span>';
if (!ready) {
  if (ac) ac.textContent = "Accounts aren't set up yet. Your data only saves on this device.";
  showGuest();
} else {
  onAuthStateChanged(auth, async function (user) {
    const s = getLocal();
    if (user) {
      if (awayTooLong()) {
        await signOut(auth);
        localStorage.removeItem("apexplan"); localStorage.removeItem("apexlogin"); localStorage.removeItem("apexseen");
        location.replace(LOGIN + "?expired=1");
        return;
      }
      markSeen();
      setInterval(markSeen, 5 * 60 * 1000);
      if (ac) ac.textContent = "Signed in as " + (user.email || "Google user");
      if (lo) lo.textContent = "Log out";
      checkVerified(user);
      if (del) { del.hidden = false; del.onclick = deleteAccount; }
      if (lout) { lout.hidden = false; lout.onclick = logoutAll; }
      try {
        const r = await syncDown(user.uid);
        if (r === "kicked") { await clearAndLeave(); return; }
        if (r === "down") { location.reload(); return; }
      } catch (e) {}
      updateBoard(user.uid, getLocal()).catch(function () {});
      showProfile(user);
      showNudges(user.uid);
      showLogins(user.uid);
    } else {
      if (s.acct && s.acct !== "guest") { location.replace(LOGIN); return; }
      if (ac) ac.textContent = "Not signed in. Your data only saves on this device.";
      if (lo) lo.textContent = "Sign in";
      showGuest();
    }
  });
}
