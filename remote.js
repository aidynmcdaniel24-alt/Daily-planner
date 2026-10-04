// ===== Loads the live content (quotes, challenges, news...) from your Firebase database =====
// Saved on this device and checked again every hour.
import { db, ready } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const KEY = "apexcontent", HOUR = 3600000;
function cached() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }

export async function refreshContent(force) {
  const c = cached();
  if (!ready || (!force && c.at && Date.now() - c.at < HOUR)) return;
  try {
    const snap = await getDoc(doc(db, "content", "app"));
    const data = snap.exists() ? snap.data() : null;
    localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), data: data }));
    if (window.CONTENT && window.cleanContent) {
      Object.assign(window.CONTENT, window.cleanContent(data));
      if (window.onContent) window.onContent();
    }
  } catch (e) { /* offline or blocked: keep using the saved copy */ }
}
refreshContent();
