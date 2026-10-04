// ===== Content =====
// These are the BUILT-IN defaults. The live versions come from your Firebase database
// (edit them on the admin page: /admin/admin.html). If the database can't be reached,
// the app uses these instead.

var DEFAULT_CONTENT = {
 // Motivational quotes: [quote, author]
 quotes: [
  ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
  ["The journey of a thousand miles begins with a single step.", "Lao Tzu"],
  ["Well done is better than well said.", "Benjamin Franklin"],
  ["Genius is one percent inspiration and ninety-nine percent perspiration.", "Thomas Edison"],
  ["The best way to predict the future is to invent it.", "Alan Kay"],
  ["Talk is cheap. Show me the code.", "Linus Torvalds"],
  ["The only way to do great work is to love what you do.", "Steve Jobs"],
  ["You miss 100% of the shots you don't take.", "Wayne Gretzky"],
  ["Success is the sum of small efforts, repeated day in and day out.", "Robert Collier"],
  ["Programs must be written for people to read, and only incidentally for machines to execute.", "Harold Abelson"],
  ["Simplicity is prerequisite for reliability.", "Edsger W. Dijkstra"],
  ["Discipline is the bridge between goals and accomplishment.", "Jim Rohn"]
 ],
 // Bible verses: just the reference. The exact KJV text is loaded live from bible-api.com.
 verses: ["Philippians 4:13", "Joshua 1:9", "Proverbs 3:5", "Isaiah 40:31", "Galatians 6:9", "Ecclesiastes 9:10",
          "Proverbs 15:1", "Proverbs 16:32", "2 Timothy 1:7", "Matthew 11:28", "Proverbs 16:3"],
 // Quote and verse lists for each mood button
 moods: {
  focus: { q: [["We are what we repeatedly do. Excellence, then, is not an act, but a habit.", "Will Durant"],
               ["Discipline is the bridge between goals and accomplishment.", "Jim Rohn"],
               ["Champions keep playing until they get it right.", "Billie Jean King"]],
           v: ["Proverbs 4:25", "Proverbs 16:3"] },
  loss:  { q: [["I've failed over and over and over again in my life. And that is why I succeed.", "Michael Jordan"],
               ["It does not matter how slowly you go as long as you do not stop.", "Confucius"]],
           v: ["Proverbs 24:16", "Galatians 6:9", "Proverbs 16:32"] },
  tired: { q: [["A good laugh and a long sleep are the best cures in the doctor's book.", "Irish proverb"],
               ["Well done is better than well said.", "Benjamin Franklin"]],
           v: ["Matthew 11:28", "Psalm 4:8", "Isaiah 40:31"] }
 },
 // Weekly challenges. The id decides what gets counted, so only change text, goal, and on.
 challenges: [
  {id:"calm",  text:"Log 5 calm sessions", goal:5, on:true},
  {id:"sleep", text:"Get 7+ hours of sleep on 4 nights", goal:4, on:true},
  {id:"logs",  text:"Write 3 tech learning log entries", goal:3, on:true},
  {id:"gday",  text:"Finish your gaming checklist on 4 days", goal:4, on:true},
  {id:"cday",  text:"Finish your coding checklist on 3 days", goal:3, on:true},
  {id:"score", text:"Save your scores on 3 days", goal:3, on:true},
  {id:"notes", text:"Write a daily note on 5 days", goal:5, on:true},
  {id:"all",   text:"Finish all 3 checklists on the same day, twice", goal:2, on:true},
  {id:"rank",  text:"Log your rank 2 times", goal:2, on:true}
 ],
 // "What's new" popup. Change v and items when you release an update.
 news: { v: "1.3", items: [
  "Custom plans for any game: type any game and AI builds drills, score labels, and rank names for it",
  "A new coding project idea every day, made for your level",
  "Bible verses now load the exact KJV text"
 ]},
 // Course suggestions for the coding checklist, by tech path
 courses: { web: "The Odin Project", py: "CS50P (free Harvard Python course)", game: "Godot docs or Unity Learn",
            it: "Google IT Support or Professor Messer", sec: "TryHackMe beginner path", ns: "CS50x (free Harvard intro course)" },
 // Extra words to block in leaderboard names (on top of the built-in list)
 blocked: []
};

// Backup text for verses, used until the live text loads
var VERSE_TEXT = {
 "Philippians 4:13": "I can do all things through Christ which strengtheneth me.",
 "Joshua 1:9": "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.",
 "Proverbs 3:5": "Trust in the LORD with all thine heart; and lean not unto thine own understanding.",
 "Isaiah 40:31": "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
 "Galatians 6:9": "And let us not be weary in well doing: for in due season we shall reap, if we faint not.",
 "Ecclesiastes 9:10": "Whatsoever thy hand findeth to do, do it with thy might; for there is no work, nor device, nor knowledge, nor wisdom, in the grave, whither thou goest.",
 "Proverbs 15:1": "A soft answer turneth away wrath: but grievous words stir up anger.",
 "Proverbs 16:32": "He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.",
 "2 Timothy 1:7": "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.",
 "Matthew 11:28": "Come unto me, all ye that labour and are heavy laden, and I will give you rest.",
 "Proverbs 16:3": "Commit thy works unto the LORD, and thy thoughts shall be established.",
 "Proverbs 4:25": "Let thine eyes look right on, and let thine eyelids look straight before thee.",
 "Proverbs 24:16": "For a just man falleth seven times, and riseth up again: but the wicked shall fall into mischief.",
 "Psalm 4:8": "I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety."
};

// ===== Live content = database copy (if saved) on top of the defaults =====
function isPair(x) { return Array.isArray(x) && typeof x[0] === "string" && typeof x[1] === "string"; }
function cleanContent(d) {
  var c = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  if (!d || typeof d !== "object") return c;
  if (Array.isArray(d.quotes) && d.quotes.filter(isPair).length) c.quotes = d.quotes.filter(isPair);
  if (Array.isArray(d.verses) && d.verses.filter(function (v) { return typeof v === "string" && v.trim(); }).length) c.verses = d.verses.filter(function (v) { return typeof v === "string" && v.trim(); });
  if (d.moods && typeof d.moods === "object") ["focus", "loss", "tired"].forEach(function (m) {
    var x = d.moods[m]; if (!x) return;
    if (Array.isArray(x.q) && x.q.filter(isPair).length) c.moods[m].q = x.q.filter(isPair);
    if (Array.isArray(x.v) && x.v.filter(function (v) { return typeof v === "string"; }).length) c.moods[m].v = x.v.filter(function (v) { return typeof v === "string"; });
  });
  if (Array.isArray(d.challenges)) c.challenges = c.challenges.map(function (def) {
    var x = d.challenges.filter(function (y) { return y && y.id === def.id; })[0];
    return x ? { id: def.id, text: typeof x.text === "string" && x.text ? x.text : def.text, goal: Math.max(1, Math.min(50, parseInt(x.goal, 10) || def.goal)), on: x.on !== false } : def;
  });
  if (d.news && typeof d.news.v === "string" && Array.isArray(d.news.items)) c.news = { v: d.news.v, items: d.news.items.filter(function (i) { return typeof i === "string"; }) };
  if (d.courses && typeof d.courses === "object") Object.keys(c.courses).forEach(function (k) { if (typeof d.courses[k] === "string" && d.courses[k]) c.courses[k] = d.courses[k]; });
  if (Array.isArray(d.blocked)) c.blocked = d.blocked.filter(function (w) { return typeof w === "string"; });
  return c;
}
var CONTENT = (function () { try { return cleanContent((JSON.parse(localStorage.getItem("apexcontent") || "{}")).data); } catch (e) { return cleanContent(null); } })();

// ===== Bible verse text (exact KJV from bible-api.com, saved after the first load) =====
var verseCache = (function () { try { return JSON.parse(localStorage.getItem("apexverses") || "{}"); } catch (e) { return {}; } })();
function verseText(ref) { return verseCache[ref] || VERSE_TEXT[ref] || ""; }
var versePending = {};
function loadVerse(ref, done) {
  if (verseCache[ref] || versePending[ref]) return;
  versePending[ref] = 1;
  fetch("https://bible-api.com/" + encodeURIComponent(ref).replace(/%20/g, "+") + "?translation=kjv")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || typeof j.text !== "string" || !j.text.trim() || j.text.length > 1200) return;
      verseCache[ref] = j.text.replace(/\s+/g, " ").trim();
      try { localStorage.setItem("apexverses", JSON.stringify(verseCache)); } catch (e) {}
      if (done) done();
    })
    .catch(function () {})
    .then(function () { delete versePending[ref]; });
}

// ----- Coding project ideas -----
// p = Python, w = web (HTML/CSS/JS)
var PROJECTS = [
 ["p","Number guessing game","The computer picks a number from 1 to 100. Tell the player higher or lower."],
 ["p","Password generator","Ask how long the password should be, then print a random one with letters, numbers, and symbols."],
 ["p","Rock, paper, scissors","Play against the computer. Keep score until someone gets to 3."],
 ["p","Dice roller","Roll any dice the user asks for, like 2d6, and show each roll and the total."],
 ["p","To-do list in the terminal","Add, list, and remove tasks. Save them to a text file so they stay."],
 ["p","Unit converter","Convert between miles and km, pounds and kg, and F and C."],
 ["p","Quiz game","Ask 5 questions from a list, check the answers, and show a final score."],
 ["p","File organizer","Move files in a folder into subfolders by type (images, docs, zips)."],
 ["p","Word counter","Read a text file and print the 10 most used words."],
 ["p","Hangman","Pick a random word and let the player guess letters, with 6 lives."],
 ["p","Expense tracker","Add spending to a CSV file and print the total for each category."],
 ["p","Countdown timer","Ask for minutes and count down in the terminal, then print a message."],
 ["p","K/D calculator","Ask for kills and deaths from your last 10 games and print your K/D and best game."],
 ["p","Squad randomizer","Store a list of characters and randomly pick a full squad for you and your friends."],
 ["w","Reaction time tester","A box turns green at a random time. Click as fast as you can and show your time."],
 ["w","Click speed test","Count how many clicks you can do in 5 seconds."],
 ["w","Stopwatch","Start, stop, and reset buttons with minutes, seconds, and milliseconds."],
 ["w","Random quote button","Show a new quote every time a button is clicked."],
 ["w","Tip calculator","Enter a bill and tip percent, then show the tip and total."],
 ["w","Tic-tac-toe","Two players on one screen. Show who wins or if it's a tie."],
 ["w","Color palette maker","Show 5 random colors with their hex codes. Click one to copy it."],
 ["w","Typing speed test","Show a sentence, time how long it takes to type, and show words per minute."],
 ["w","Flashcards","Flip cards to study. Add your own cards with a form."],
 ["w","Pomodoro timer","25 minutes of work, then 5 minutes of break, with a sound when it switches."],
 ["w","Personal landing page","A one-page site about you with your projects and links."],
 ["w","Crosshair preview","Pick color, size, and gap with sliders and see a crosshair update live."]
];

