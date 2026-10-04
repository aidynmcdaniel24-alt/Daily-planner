// ===== FIREBASE SETUP =====
// Your database rules live in firestore.rules. When that file changes, copy all of it into
// Firebase > Firestore > Rules, then click Publish.

const firebaseConfig = {
  apiKey: "AIzaSyDCrg9rC3A_AFBqrYNDYLy3PwH5Y2MxvpA",
  authDomain: "daily-planner-8801e.firebaseapp.com",
  projectId: "daily-planner-8801e",
  appId: "1:204598190100:web:bf3a3021be31bc0a514701"
};

// ===== Admins =====
// User IDs that see "Admin" in the profile menu. This only shows the button;
// the real protection is the isAdmin line in firestore.rules (keep both lists the same).
export const ADMINS = ["pmfwWWanIRRf0KcHStAY8e0Juk13"];

// ===== App Check (blocks bots) =====
// Paste your reCAPTCHA v3 SITE key here. Leave "PASTE_HERE" to turn App Check off.
const APP_CHECK_KEY = "6LfxGt4tAAAAANDqYROoVKaG5VMVQbucuwms-Joc";

// ===== You don't need to change anything below =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-check.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, getDocs, deleteDoc, collection, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

export const ready = firebaseConfig.apiKey !== "PASTE_HERE";
export const app = initializeApp(firebaseConfig);
if (APP_CHECK_KEY !== "PASTE_HERE") {
  // On Live Server, App Check prints a "debug token" in the console (F12). Add it in Firebase > App Check > Manage debug tokens.
  if (location.hostname === "127.0.0.1" || location.hostname === "localhost") self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(APP_CHECK_KEY), isTokenAutoRefreshEnabled: true });
}
export const auth = getAuth(app);
export const db = getFirestore(app);

// Local data (same key the planner uses)
export function getLocal() { try { return JSON.parse(localStorage.getItem("apexplan") || "{}"); } catch (e) { return {}; } }
export function setLocal(st) { try { localStorage.setItem("apexplan", JSON.stringify(st)); } catch (e) {} }

// Cloud data (one document per user, saved as text)
export async function pull(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { data: null, epoch: 0 };
  const d = snap.data();
  return { data: d.data ? JSON.parse(d.data) : null, epoch: d.epoch || 0 };
}
export async function push(uid, st) {
  await setDoc(doc(db, "users", uid), { data: JSON.stringify(st), updated: serverTimestamp() }, { merge: true });
}

// When this device logged in (used by "Log out of all devices")
export function markLogin() { try { localStorage.setItem("apexlogin", String(Date.now())); localStorage.setItem("apexseen", String(Date.now())); } catch (e) {} }
function loginAt() { return +(localStorage.getItem("apexlogin") || 0); }

// Sign out every device: devices that logged in before now get kicked out
export async function kickAll(uid) {
  await setDoc(doc(db, "users", uid), { epoch: Date.now(), updated: serverTimestamp() }, { merge: true });
}

// Match this device with the account. Newer copy wins.
// If this device has someone else's (or guest) data, the account's saved data wins.
export async function syncDown(uid) {
  const got = await pull(uid), cloud = got.data, local = getLocal();
  if (got.epoch && got.epoch > loginAt()) return "kicked";
  if (cloud && (local.acct !== uid || (cloud.ts || 0) > (local.ts || 0))) {
    cloud.acct = uid; setLocal(cloud); return "down";
  }
  if (cloud && cloud.ts === local.ts) return "same";
  local.acct = uid; local.ts = local.ts || Date.now(); setLocal(local);
  await push(uid, local); return "up";
}

// ===== Leaderboard =====
// Longest current streak across gaming, sleep, and coding
export function streakOf(st) {
  const ok = st.ok || {}, day = function (o) { return new Date(Date.now() - 86400000 * o).toLocaleDateString("en-CA"); };
  let best = 0;
  ["gaming", "sleep", "coding"].forEach(function (c) {
    let s = 0, o = ok[c + day(0)] ? 0 : 1;
    while (ok[c + day(o)]) { s++; o++; }
    best = Math.max(best, s);
  });
  return best;
}
export async function getBoard(uid) {
  const snap = await getDoc(doc(db, "board", uid));
  return snap.exists() ? snap.data() : null;
}
// Update my leaderboard entry (only if I joined)
export async function updateBoard(uid, st) {
  if (!st.lb || !st.lb.code) return;
  const mine = await getBoard(uid), streak = streakOf(st);
  const best = Math.max(streak, mine ? mine.best || 0 : 0);
  if (mine && mine.streak === streak && mine.best === best && mine.name === st.lb.name) return;
  await setDoc(doc(db, "board", uid), { name: st.lb.name, code: st.lb.code, streak: streak, best: best, updated: serverTimestamp() });
}

// ===== Recent logins =====
function deviceName() {
  const u = navigator.userAgent;
  const os = /iPhone|iPad|iPod/.test(u) ? "iPhone/iPad" : /Android/.test(u) ? "Android" : /Windows/.test(u) ? "Windows" : /Mac OS X/.test(u) ? "Mac" : /Linux/.test(u) ? "Linux" : "Unknown device";
  const br = /Edg\//.test(u) ? "Edge" : /OPR\//.test(u) ? "Opera" : /Firefox\//.test(u) ? "Firefox" : /Chrome\//.test(u) ? "Chrome" : /Safari\//.test(u) ? "Safari" : "Browser";
  return br + " on " + os;
}
export async function recordLogin(uid) {
  await addDoc(collection(db, "users", uid, "logins"), { device: deviceName(), time: serverTimestamp() });
}
export async function recentLogins(uid) {
  const snap = await getDocs(query(collection(db, "users", uid, "logins"), orderBy("time", "desc"), limit(8)));
  return snap.docs.map(function (d) { const x = d.data(); return { device: x.device, time: x.time ? x.time.toDate() : null }; });
}
export async function deleteLogins(uid) {
  const snap = await getDocs(collection(db, "users", uid, "logins"));
  await Promise.all(snap.docs.map(function (d) { return deleteDoc(d.ref); }));
}

// ===== Nudges from friends =====
export async function sendNudge(fromUid, toUid, name) {
  await setDoc(doc(db, "nudges", toUid, "in", fromUid), { name: name, time: serverTimestamp() });
}
export async function takeNudges(uid) {
  const snap = await getDocs(collection(db, "nudges", uid, "in"));
  const names = snap.docs.map(function (d) { return d.data().name; });
  await Promise.all(snap.docs.map(function (d) { return deleteDoc(d.ref); }));
  return names;
}

// ===== Name filter (for names other people can see) =====
// Words matched anywhere in the name (long or unusual enough to not cause false matches)
const BAD_ANY = ["fuck","shit","bitch","cunt","nigg","fagg","dick","pussy","whore","slut","bastard","retard","rape","porn",
  "kike","spic","chink","tranny","nazi","hitler","cock","twat","wank","jizz","cum","dildo","penis","vagina","boob","titt"];
// Words only blocked when they stand alone (they appear inside normal words, like "class")
const BAD_WORD = ["ass","fag","hoe","tit","sex","kys","gay","homo","dyke","coon","gook","wetback","jap"];
const SAFE = ["scunthorpe","cocktail","cockpit","peacock","hancock","dickens","cumulative","document","circumstance","therapist","grape","drape","sussex"];
function normalize(s) {
  return s.toLowerCase().replace(/[013457@$!|]/g, function (c) { return { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i", "|": "i" }[c]; });
}
// Returns a message if the name isn't allowed, or "" if it's fine
export function nameProblem(name) {
  const n = String(name || "").trim();
  if (!n) return "Type a name.";
  if (n.length > 24) return "Names can be up to 24 characters.";
  if (!/^[\p{L}\p{N} ._'-]+$/u.test(n)) return "Use letters, numbers, spaces, and . _ ' - only.";
  let flat = normalize(n).replace(/[^a-z]/g, "");
  SAFE.forEach(function (w) { flat = flat.split(w).join(""); });
  const words = normalize(n).split(/[^a-z]+/).filter(Boolean);
  let extra = [];
  try { extra = ((JSON.parse(localStorage.getItem("apexcontent") || "{}").data || {}).blocked || []).map(function (w) { return normalize(String(w)).replace(/[^a-z]/g, ""); }).filter(Boolean); } catch (e) {}
  if (extra.some(function (w) { return flat.indexOf(w) > -1; })) return "That name isn't allowed. Please pick another.";
  if (BAD_ANY.some(function (w) { return flat.indexOf(w) > -1; }) || words.some(function (w) { return BAD_WORD.indexOf(w) > -1; }))
    return "That name isn't allowed. Please pick another.";
  return "";
}

// ===== Feedback =====
export async function sendFeedback(uid, type, text, page) {
  await addDoc(collection(db, "feedback"), { uid: uid, type: type, text: text, page: page, time: serverTimestamp() });
}
