// ===== FIREBASE SETUP (do these once) =====
// 1. Go to console.firebase.google.com and click "Create a project". Skip Analytics.
// 2. Build > Authentication > Get started. Turn on "Email/Password" and "Google".
// 3. Authentication > Settings > Authorized domains > Add "127.0.0.1" (for Live Server).
// 4. Build > Firestore Database > Create database > pick "production mode".
// 5. Firestore > Rules tab > replace everything with this, then click Publish:
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        function signedIn() { return request.auth != null; }
//        function isMe(id) { return signedIn() && request.auth.uid == id; }
//
//        match /users/{userId} {
//          allow read, delete: if isMe(userId);
//          allow create, update: if isMe(userId)
//            && request.resource.data.keys().hasOnly(['data', 'updated', 'epoch'])
//            && (!('data' in request.resource.data) || (request.resource.data.data is string
//                && request.resource.data.data.size() < 500000))
//            && (!('epoch' in request.resource.data) || request.resource.data.epoch is int)
//            && request.resource.data.updated == request.time;
//
//          match /logins/{id} {
//            allow read, delete: if isMe(userId);
//            allow create: if isMe(userId)
//              && request.resource.data.keys().hasOnly(['device', 'time'])
//              && request.resource.data.device is string && request.resource.data.device.size() <= 60
//              && request.resource.data.time == request.time;
//          }
//        }
//
//        match /board/{userId} {
//          allow read: if signedIn();
//          allow delete: if isMe(userId);
//          allow create, update: if isMe(userId)
//            && request.resource.data.keys().hasOnly(['name', 'code', 'streak', 'best', 'updated'])
//            && request.resource.data.name is string && request.resource.data.name.size() > 0
//            && request.resource.data.name.size() <= 24
//            && request.resource.data.code is string && request.resource.data.code.size() == 6
//            && request.resource.data.streak is int && request.resource.data.streak >= 0
//            && request.resource.data.best is int && request.resource.data.best >= request.resource.data.streak
//            && request.resource.data.best <= 3650
//            && request.resource.data.updated == request.time;
//        }
//
//        match /nudges/{toId}/in/{fromId} {
//          allow read, delete: if isMe(toId);
//          allow create: if isMe(fromId) && fromId != toId
//            && request.resource.data.keys().hasOnly(['name', 'time'])
//            && request.resource.data.name is string && request.resource.data.name.size() > 0
//            && request.resource.data.name.size() <= 24
//            && request.resource.data.time == request.time;
//          allow update: if isMe(fromId) && fromId != toId
//            && request.resource.data.keys().hasOnly(['name', 'time'])
//            && request.resource.data.name is string && request.resource.data.name.size() <= 24
//            && request.resource.data.time == request.time
//            && request.time > resource.data.time + duration.value(12, 'h');
//        }
//      }
//    }
//
// 6. Gear icon > Project settings > Your apps > click the </> (Web) icon > register.
// 7. Copy the 4 values from "firebaseConfig" into the box below.

const firebaseConfig = {
  apiKey: "AIzaSyDCrg9rC3A_AFBqrYNDYLy3PwH5Y2MxvpA",
  authDomain: "daily-planner-8801e.firebaseapp.com",
  projectId: "daily-planner-8801e",
  appId: "1:204598190100:web:bf3a3021be31bc0a514701"
};

// ===== You don't need to change anything below =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, addDoc, getDocs, deleteDoc, collection, query, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const ready = firebaseConfig.apiKey !== "PASTE_HERE";
export const app = initializeApp(firebaseConfig);
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
