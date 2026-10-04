// ===== Admin page: edit the content everyone sees =====
import { auth, db, ready } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const $ = function (id) { return document.getElementById(id); };
const MOOD_NAMES = { focus: "Focus", loss: "After a loss", tired: "Tired" };
const COURSE_NAMES = { web: "Websites", py: "Python and scripts", game: "Game dev", it: "IT support", sec: "Cybersecurity", ns: "Not sure yet" };

function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
function lines(v) { return v.split("\n").map(function (x) { return x.trim(); }).filter(Boolean); }
function pairs(v) {
  return lines(v).map(function (l) { const i = l.lastIndexOf("|"); return i > 0 ? [l.slice(0, i).trim(), l.slice(i + 1).trim()] : null; })
    .filter(function (p) { return p && p[0] && p[1]; });
}
// The database can't store lists inside lists, so each quote is saved as { q: quote, a: author }
function toObj(L) { return L.map(function (p) { return { q: p[0], a: p[1] }; }); }
function pairText(L) { return L.map(function (p) { return p[0] + " | " + p[1]; }).join("\n"); }
function msg(t, good) { $("er").hidden = !t; $("er").textContent = t || ""; $("er").className = good ? "okm" : "err"; }

// ===== Fill the form =====
function fill(c) {
  $("quotes").value = pairText(c.quotes);
  $("verses").value = c.verses.join("\n");
  $("moods").innerHTML = Object.keys(MOOD_NAMES).map(function (m) {
    return '<h3>' + MOOD_NAMES[m] + '</h3><label class="l" for="mq-' + m + '">Quotes (Quote | Author)</label><textarea id="mq-' + m + '" rows="3">' + esc(pairText(c.moods[m].q)) +
      '</textarea><label class="l" for="mv-' + m + '" style="margin-top:8px">Verse references</label><textarea id="mv-' + m + '" rows="3">' + esc(c.moods[m].v.join("\n")) + "</textarea>";
  }).join("");
  $("chal").innerHTML = c.challenges.map(function (x) {
    return '<div class="crow"><input type="checkbox" id="co-' + x.id + '"' + (x.on !== false ? " checked" : "") + ' aria-label="Turn on"><input type="text" id="ct-' + x.id + '" value="' + esc(x.text) +
      '" aria-label="Challenge text"><input type="number" id="cg-' + x.id + '" value="' + x.goal + '" min="1" max="50" aria-label="Goal"></div>';
  }).join("");
  $("nv").value = c.news.v; $("ni").value = c.news.items.join("\n");
  $("courses").innerHTML = Object.keys(COURSE_NAMES).map(function (k) {
    return '<label class="l" for="cr-' + k + '" style="margin-top:8px">' + COURSE_NAMES[k] + '</label><input type="text" id="cr-' + k + '" value="' + esc(c.courses[k]) + '">';
  }).join("");
  $("blocked").value = c.blocked.join("\n");
}

// ===== Read the form =====
function read() {
  const moods = {}, courses = {};
  Object.keys(MOOD_NAMES).forEach(function (m) { moods[m] = { q: toObj(pairs($("mq-" + m).value)), v: lines($("mv-" + m).value) }; });
  Object.keys(COURSE_NAMES).forEach(function (k) { courses[k] = $("cr-" + k).value.trim() || DEFAULT_CONTENT.courses[k]; });
  return {
    quotes: toObj(pairs($("quotes").value)),
    verses: lines($("verses").value),
    moods: moods,
    challenges: DEFAULT_CONTENT.challenges.map(function (d) {
      return { id: d.id, text: $("ct-" + d.id).value.trim() || d.text, goal: Math.max(1, Math.min(50, parseInt($("cg-" + d.id).value, 10) || d.goal)), on: $("co-" + d.id).checked };
    }),
    news: { v: $("nv").value.trim() || "1.0", items: lines($("ni").value) },
    courses: courses,
    blocked: lines($("blocked").value).map(function (w) { return w.toLowerCase(); })
  };
}

// ===== Check verse references =====
$("vchk").onclick = async function () {
  const refs = lines($("verses").value).slice(0, 14);
  $("vres").innerHTML = "";
  for (const r of refs) {
    const li = document.createElement("li"); li.textContent = r + ": checking…"; $("vres").appendChild(li);
    try {
      const res = await fetch("https://bible-api.com/" + encodeURIComponent(r).replace(/%20/g, "+") + "?translation=kjv");
      const j = res.ok ? await res.json() : null;
      li.textContent = j && j.text ? "✓ " + r + ": " + j.text.replace(/\s+/g, " ").trim().slice(0, 80) + "…" : "✗ " + r + ": not found. Check the spelling.";
      li.className = j && j.text ? "good" : "bad";
    } catch (e) { li.textContent = "✗ " + r + ": couldn't check (no internet?)"; li.className = "bad"; }
    await new Promise(function (ok) { setTimeout(ok, 2100); });   // stay under the API's rate limit
  }
};

// ===== Save =====
$("rst").onclick = function () { if (confirm("Fill the form with the built-in content? (Nothing saves until you click Save.)")) fill(cleanContent(null)); };
$("f").onsubmit = async function (e) {
  e.preventDefault(); msg("");
  const data = read();
  if (!data.quotes.length) return msg("Add at least one quote.");
  $("sv").disabled = true; $("sv").textContent = "Saving…";
  try {
    data.updated = serverTimestamp();
    await setDoc(doc(db, "content", "app"), data);
    localStorage.removeItem("apexcontent");
    msg("Saved! Everyone gets it within an hour. Refresh the planner to see it now.", true);
  } catch (err) {
    msg(err.code === "permission-denied" ? "Not allowed. Make sure your user ID is in the admin line of your rules, and that you clicked Publish." : "Couldn't save (" + (err.code || err.message || "unknown error") + ").");
  }
  $("sv").disabled = false; $("sv").textContent = "Save for everyone";
};

// ===== Start =====
if (!ready) {
  $("who").innerHTML = '<p class="mute" style="margin:0">Firebase isn\'t set up yet.</p>';
} else {
  onAuthStateChanged(auth, async function (user) {
    if (!user) {
      $("who").innerHTML = '<p style="margin:0">Sign in first, then come back to this page.</p><div class="row"><a class="pri btnlink" href="../login/login.html">Sign in</a></div>';
      return;
    }
    $("who").innerHTML = '<h2>You\'re signed in</h2><p class="mute">To be allowed to save, your user ID must be in the admin line of <code>firestore.rules</code>.</p>' +
      '<div class="codebox"><span id="uid" class="uid"></span><button type="button" id="cpy">Copy</button></div>';
    $("uid").textContent = user.uid;
    $("cpy").onclick = async function () { try { await navigator.clipboard.writeText(user.uid); this.textContent = "Copied!"; } catch (e) { this.textContent = "Select and copy it"; } };
    let c = null;
    try { const snap = await getDoc(doc(db, "content", "app")); if (snap.exists()) c = snap.data(); } catch (e) {}
    fill(cleanContent(c));
    $("f").hidden = false;
  });
}
