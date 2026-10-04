// ===== AI helpers (Google Gemini through Firebase AI Logic) =====
// Makes a practice plan for any game, and coding project ideas.
// If the AI can't be reached, the app quietly uses the built-in plans in genres.js.
import { app, ready } from "./firebase.js";
import { getAI, getGenerativeModel, GoogleAIBackend, Schema } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-ai.js";

// Models to try, in order. If Google retires one, put a newer name first.
const MODELS = ["gemini-3.8-flash", "gemini-3.5-flash"];
// Most AI requests one device can make per day (protects your free limit)
const DAILY_LIMIT = 12;

const ai = ready ? getAI(app, { backend: new GoogleAIBackend() }) : null;

// ===== Small safety helpers =====
function str(x, max) { return typeof x === "string" ? x.replace(/\s+/g, " ").trim().slice(0, max) : ""; }
function list(x, maxItems, maxLen) { return Array.isArray(x) ? x.map(function (v) { return str(v, maxLen); }).filter(Boolean).slice(0, maxItems) : []; }
function norm(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function underLimit() {
  const today = new Date().toLocaleDateString("en-CA");
  let u = {}; try { u = JSON.parse(localStorage.getItem("apexai") || "{}"); } catch (e) {}
  if (u.d !== today) u = { d: today, n: 0 };
  if (u.n >= DAILY_LIMIT) return false;
  u.n++; localStorage.setItem("apexai", JSON.stringify(u));
  return true;
}
function timeout(ms) { return new Promise(function (_, no) { setTimeout(function () { no(new Error("timeout")); }, ms); }); }

// Ask the AI for JSON. Tries each model until one works.
async function askJSON(prompt, schema) {
  if (!ai) throw new Error("AI is off");
  if (!underLimit()) throw new Error("daily limit");
  let last;
  for (const name of MODELS) {
    try {
      const model = getGenerativeModel(ai, { model: name, generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0.4 } });
      const res = await Promise.race([model.generateContent(prompt), timeout(30000)]);
      return JSON.parse(res.response.text());
    } catch (e) { last = e; }
  }
  throw last;
}

// ===== Game plan =====
const S = Schema;
const planSchema = S.object({
  properties: {
    known: S.boolean(),
    name: S.string(),
    genre: S.enumString({ enum: window.GENRE_ORDER || ["general"] }),
    skill: S.string(), focus: S.string(), play: S.string(), pts: S.string(),
    scores: S.array({ items: S.string() }),
    ph: S.string(), review: S.string(), warm: S.string(),
    drills: S.array({ items: S.object({ properties: { name: S.string(), time: S.string(), steps: S.array({ items: S.string() }), tip: S.string() } }) }),
    ranks: S.object({ properties: { tiers: S.array({ items: S.string() }), div: S.array({ items: S.string() }), top: S.array({ items: S.string() }) } })
  }
});

function planPrompt(game) {
  return [
    "You are a friendly coach helping a teenager practice a video game or competitive game. Write in short, plain words.",
    "The game is: \"" + game.slice(0, 60) + "\".",
    "Return JSON with:",
    "- known: true only if you clearly recognize this exact game.",
    "- name: the game's official name (or the text as typed if unknown).",
    "- genre: the closest type from the list.",
    "- skill: a 1-3 word name for practice time, like \"Aim training\" or \"Chess study\".",
    "- focus: a 1-3 word label like \"Aim focus\" or \"Study focus\".",
    "- play: a 1-3 word name for a block of real games, like \"Ranked block\" or \"Rated games\".",
    "- pts: what ranked points are called in this game (like RP, LP, MMR, Rating), or \"Points\".",
    "- scores: exactly 3 short numbers worth tracking for this game (like \"CS per minute\"). No long phrases.",
    "- ph: an example daily goal starting with \"Example: \".",
    "- review: one short instruction for reviewing a loss.",
    "- warm: a short warm-up for busy days (under 8 words).",
    "- drills: 4 to 6 practice drills for this exact game. Each has name (2-4 words), time (like \"10 min\"), 3 short steps, and one tip. Only suggest real modes, tools, or sites you are sure exist.",
    "- ranks: the game's CURRENT ranked tiers from lowest to highest (tiers), division labels inside a tier (div, like IV, III, II, I), and top ranks without divisions (top).",
    "  If the game has no ranked mode or you are not sure of the current names, use empty lists. Never guess rank names.",
    "If you don't recognize the game, set known to false and give general practice advice for its likely type."
  ].join("\n");
}

function cleanPlan(r, typed) {
  if (!r || typeof r !== "object") return null;
  const genre = (window.GENRES && window.GENRES[r.genre]) ? r.genre : "general";
  const base = window.GENRES[genre];
  const drills = (Array.isArray(r.drills) ? r.drills : []).map(function (d) {
    return d && { name: str(d.name, 40), time: str(d.time, 20) || "10 min", steps: list(d.steps, 5, 220), tip: str(d.tip, 200) };
  }).filter(function (d) { return d && d.name && d.steps.length >= 2; }).slice(0, 6);
  if (drills.length < 3) return null;
  let scores = list(r.scores, 3, 32);
  while (scores.length < 3) scores.push(base.scores[scores.length]);
  const ranks = r.ranks || {};
  return {
    for: norm(typed), g: genre, name: str(r.name, 60) || typed, known: r.known === true,
    plan: {
      skill: str(r.skill, 28) || base.skill, focus: str(r.focus, 28) || base.focus, play: str(r.play, 28) || base.play,
      pts: str(r.pts, 12) || base.pts, scores: scores,
      ph: str(r.ph, 90) || base.ph, review: str(r.review, 120) || base.review, warm: str(r.warm, 60) || base.warm,
      drills: drills,
      ranks: { tiers: list(ranks.tiers, 12, 20), div: list(ranks.div, 6, 6), top: list(ranks.top, 5, 24) }
    },
    at: Date.now()
  };
}

async function gamePlan(game) {
  game = String(game || "").trim();
  if (!game) return null;
  try { return cleanPlan(await askJSON(planPrompt(game), planSchema), game); } catch (e) { return null; }
}

// ===== Coding project ideas =====
const ideaSchema = S.object({
  properties: { ideas: S.array({ items: S.object({ properties: { lang: S.enumString({ enum: ["python", "web"] }), title: S.string(), desc: S.string() } }) }) }
});
async function projects(level, path, avoid) {
  const lv = { none: "has never coded", beg: "knows a little coding", mid: "can build small projects" }[level] || "knows a little coding";
  const want = path === "py" ? "Python only" : path === "web" ? "HTML, CSS, and JavaScript only" : "a mix of Python and HTML/CSS/JavaScript";
  const prompt = "Give 5 small coding project ideas for a teen who " + lv + " and likes video games. Use " + want + ". " +
    "Each should take about an hour. Title under 5 words. Description is one plain sentence saying exactly what to build. " +
    "Don't repeat these: " + (avoid || []).slice(0, 20).join(", ") + ".";
  try {
    const r = await askJSON(prompt, ideaSchema);
    return (r.ideas || []).map(function (x) { return [x.lang === "web" ? "w" : "p", str(x.title, 40), str(x.desc, 200)]; })
      .filter(function (x) { return x[1] && x[2]; }).slice(0, 5);
  } catch (e) { return []; }
}

window.AI = ai ? { gamePlan: gamePlan, projects: projects, norm: norm } : null;
window.dispatchEvent(new Event("ai-ready"));
