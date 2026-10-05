// Already signed in on this device (but planner data not loaded yet)? Go finish signing in.
import { auth, ready } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
if (ready) onAuthStateChanged(auth, function (u) { if (u) location.replace("login/"); });
