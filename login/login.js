// ===== Login and sign up =====
import { auth, ready, syncDown, getLocal, setLocal, markLogin, recordLogin } from "../firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, sendEmailVerification, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const $ = function (id) { return document.getElementById(id); };
let mode = "in", busy = false, signingIn = false;

// Use the saved theme
const saved = getLocal();
if (saved.th) document.documentElement.style.setProperty("--acc", saved.th);
if (saved.md && saved.md !== "auto") document.documentElement.setAttribute("data-theme", saved.md);

// Friendly error messages
const ERR = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/wrong-password": "Wrong email or password.",
  "auth/user-not-found": "No account with that email. Try Sign up.",
  "auth/email-already-in-use": "That email already has an account. Try Log in.",
  "auth/weak-password": "Use at least 8 characters with a letter and a number.",
  "auth/password-does-not-meet-requirements": "Use at least 8 characters with a letter and a number.",
  "auth/invalid-email": "That email doesn't look right.",
  "auth/missing-password": "Type your password.",
  "auth/too-many-requests": "Too many tries. Wait a minute and try again.",
  "auth/network-request-failed": "No internet connection.",
  "auth/unauthorized-domain": "This site isn't allowed yet. Add it in Firebase > Authentication > Settings > Authorized domains.",
  "auth/operation-not-allowed": "This sign-in type is off. Turn it on in Firebase > Authentication."
};
function msg(text, good) {
  $("er").hidden = !text;
  $("er").textContent = text || "";
  $("er").className = good ? "okm" : "err";
}
// ===== Email check =====
const TYPOS = { "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gamil.com": "gmail.com", "gmail.co": "gmail.com", "gmal.com": "gmail.com",
  "yaho.com": "yahoo.com", "yahooo.com": "yahoo.com", "yahoo.co": "yahoo.com", "hotmial.com": "hotmail.com", "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com", "outlook.co": "outlook.com", "iclod.com": "icloud.com", "icloud.co": "icloud.com" };
// Returns an error message, or "" if the email looks fine
function emailError(em) {
  if (!em) return "Type your email.";
  if (/\s/.test(em)) return "Emails can't have spaces.";
  const at = em.split("@");
  if (at.length !== 2 || !at[0] || !at[1]) return "An email needs one @ with text on both sides, like you@example.com.";
  if (at[0].length > 64 || em.length > 254) return "That email is too long.";
  if (!/^[A-Za-z0-9._%+-]+$/.test(at[0]) || /^\.|\.$|\.\./.test(at[0])) return "The part before the @ has characters that aren't allowed.";
  const dom = at[1].toLowerCase();
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/.test(dom) || /(^|\.)-|-(\.|$)/.test(dom)) return "The part after the @ should look like example.com.";
  if (TYPOS[dom]) return "Did you mean " + at[0] + "@" + TYPOS[dom] + "?";
  return "";
}
function checkEmail(focus) {
  const err = emailError($("em").value.trim());
  $("em").setAttribute("aria-invalid", err ? "true" : "false");
  if (err) { msg(err); if (focus) $("em").focus(); }   // only jump back on submit, never while typing elsewhere
  return !err;
}
$("em").addEventListener("blur", function () { if (this.value.trim()) checkEmail(); });
$("em").addEventListener("input", function () { if (this.getAttribute("aria-invalid") === "true") { this.setAttribute("aria-invalid", "false"); msg(""); } });

function where() {
  const s = getLocal();
  return (s.done || s.nm || s.sk) ? "../index.html" : "../onboarding/onboarding.html";
}

// After signing in: sync data, then open the planner (or setup if new)
async function done(user, fresh) {
  if (busy) return; busy = true;
  msg("Loading your planner...", true);
  markLogin();
  if (fresh) { try { await recordLogin(user.uid); } catch (e) {} }
  try { await syncDown(user.uid); } catch (e) {}
  location.href = where();
}

// ===== Log in / Sign up switch (with a slide animation) =====
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
let anims = [], target = "in";
function applyMode(m) {
  mode = target = m;
  const up = m === "up";
  $("lt").dataset.mode = m;
  [].forEach.call($("lt").children, function (x) { x.setAttribute("aria-selected", x.dataset.m === m); });
  $("go").textContent = up ? "Create account" : "Log in";
  $("pw").autocomplete = up ? "new-password" : "current-password";
  $("ttl").textContent = up ? "Create your account" : "Welcome back";
  $("sub2").textContent = up ? "Save your plan and pick up on any device." : "Log in to sync your plan across devices.";
  $("fp").hidden = up;
  $("rules").hidden = !up;
  $("pw").placeholder = up ? "Make a password" : "Your password";
  $("ggt").textContent = up ? "Sign up with Google" : "Continue with Google";
  $("swt").textContent = up ? "Already have an account?" : "New here?";
  $("swb").textContent = up ? "Log in" : "Create an account";
  checkRules();
  msg("");
  history.replaceState(null, "", up ? "?mode=up" : location.pathname);
}
function setMode(m, animate) {
  if (m === target) return;
  target = m;
  anims.forEach(function (x) { x.cancel(); }); anims = [];
  if (m === mode) return;
  if (!animate || calm || !document.body.animate) return applyMode(m);
  const dir = m === "up" ? 1 : -1;          // Sign up slides in from the right, Log in from the left
  const card = $("card"), body = $("ab");
  const h0 = card.offsetHeight;
  const out = body.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateX(" + (-28 * dir) + "px)" }],
    { duration: 140, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
  anims.push(out);
  out.onfinish = function () {
    applyMode(m);
    const h1 = card.offsetHeight;
    out.cancel();
    anims = [
      card.animate([{ height: h0 + "px" }, { height: h1 + "px" }], { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" }),
      body.animate([{ opacity: 0, transform: "translateX(" + (28 * dir) + "px)" }, { opacity: 1, transform: "none" }],
        { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" })
    ];
  };
}
$("lt").onclick = function (e) { const b = e.target.closest("button"); if (b) setMode(b.dataset.m, true); };
$("lt").onkeydown = function (e) {
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const m = e.key === "ArrowRight" ? "up" : "in"; setMode(m, true); $("lt").querySelector('[data-m="' + m + '"]').focus(); }
};
$("swb").onclick = function () { setMode(target === "in" ? "up" : "in", true); };

// Password rules (sign up only), ticked off as you type
function checkRules() {
  const pw = $("pw").value;
  const ok = { len: pw.length >= 8, let: /[A-Za-z]/.test(pw), num: /[0-9]/.test(pw) };
  [].forEach.call($("rules").children, function (li) { li.classList.toggle("ok", ok[li.dataset.r]); });
}
$("pw").addEventListener("input", checkRules);

// Email and password
$("f").onsubmit = async function (e) {
  e.preventDefault();
  if (!ready) return msg("Firebase isn't set up yet. Paste your config into firebase.js.");
  const em = $("em").value.trim(), pw = $("pw").value;
  if (!checkEmail(true)) return;
  if (!pw) return msg("Type your password.");
  if (mode === "up" && (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)))
    return msg("Use at least 8 characters with a letter and a number.");
  $("go").disabled = true; signingIn = true;
  $("go").classList.add("busy"); $("go").textContent = mode === "in" ? "Logging in..." : "Creating account...";
  try {
    const r = mode === "in"
      ? await signInWithEmailAndPassword(auth, em, pw)
      : await createUserWithEmailAndPassword(auth, em, pw);
    if (mode === "up") { try { await sendEmailVerification(r.user); } catch (x) {} }
    done(r.user, true);
  } catch (err) {
    msg(ERR[err.code] || "Something went wrong. Try again.");
    $("go").disabled = false; signingIn = false;
    $("go").classList.remove("busy"); $("go").textContent = mode === "in" ? "Log in" : "Create account";
  }
};

// Google
$("gg").onclick = async function () {
  if (!ready) return msg("Firebase isn't set up yet. Paste your config into firebase.js.");
  signingIn = true;
  try {
    const r = await signInWithPopup(auth, new GoogleAuthProvider());
    done(r.user, true);
  } catch (err) {
    signingIn = false;
    if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request")
      msg(ERR[err.code] || "Google sign-in failed. Try again.");
  }
};

// Forgot password
$("fp").onclick = async function () {
  if (!ready) return msg("Firebase isn't set up yet. Paste your config into firebase.js.");
  const em = $("em").value.trim();
  if (!checkEmail(true)) return;
  try { await sendPasswordResetEmail(auth, em); msg("Reset email sent. Check your inbox.", true); }
  catch (err) { msg(ERR[err.code] || "Couldn't send the email. Try again."); }
};

// Show / hide password
$("sh").onclick = function () {
  const show = $("pw").type === "password";
  $("pw").type = show ? "text" : "password";
  $("sh").textContent = show ? "Hide" : "Show";
  $("sh").setAttribute("aria-label", show ? "Hide password" : "Show password");
};

// Guest
$("gs").onclick = function () {
  const s = getLocal(); s.acct = "guest"; setLocal(s);
  location.href = where();
};

// Opened from "Create account"? Start on the Sign up tab
if (new URLSearchParams(location.search).get("mode") === "up") applyMode("up");

// Signed out for being away too long?
if (new URLSearchParams(location.search).get("expired")) msg("You were away for a while, so we signed you out to keep your account safe. Log in again.");

// Already signed in? Skip this page.
// (skipped while a sign-in button is working, so that sign-in gets recorded properly)
if (ready) onAuthStateChanged(auth, function (u) { if (u && !signingIn) done(u); });
