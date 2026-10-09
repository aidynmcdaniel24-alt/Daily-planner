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
 // "What's new" popup. To show it after a commit: raise v (1.4 -> 1.5) and change the items.
 // (If the admin page has a higher version saved, that one shows instead.)
 news: { v: "1.6", items: [
  "Coding tab upgrade: a daily coding drill, a focus session timer, and stats for your week",
  "Tip of the day and a list of helpful free sites, picked for your tech path",
  "Brand new home page: progress rings for today, a Next up card, and a cleaner two-column layout",
  "New login and sign up page with smooth switching between the two",
  "Pick your games as #tags during setup, and add more than one game",
  "Break timer: 5, 10 or 15 minutes, pause and resume, and a sound when it's done",
  "Bedtime countdown, sleep history bars, and new stats on the Summary tab",
  "Redesigned Settings, Leaderboard and Setup pages",
  "Pop-ups that match the app instead of plain browser boxes",
  "Smooth animations everywhere (they turn off if your device is set to reduce motion)",
  "Cleaner links like /home, /login and /settings",
  "Clearer Privacy Policy and Terms of Use",
  "Press ? for keyboard shortcuts, and N to check off your next task",
  "Lots of fixes for phones, tablets and big screens"
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
// Quotes come from the database as { q, a }; turn them into [quote, author]
function toPairs(L) { return (L || []).map(function (x) { return isPair(x) ? x : (x && typeof x.q === "string" && typeof x.a === "string" && x.q && x.a) ? [x.q, x.a] : null; }).filter(Boolean); }
// true if version a is higher than version b ("1.10" > "1.9")
function newer(a, b) {
  var x = String(a).split("."), y = String(b).split(".");
  for (var i = 0; i < Math.max(x.length, y.length); i++) { var p = parseInt(x[i], 10) || 0, q = parseInt(y[i], 10) || 0; if (p !== q) return p > q; }
  return false;
}
function cleanContent(d) {
  var c = JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  if (!d || typeof d !== "object") return c;
  if (Array.isArray(d.quotes) && toPairs(d.quotes).length) c.quotes = toPairs(d.quotes);
  if (Array.isArray(d.verses) && d.verses.filter(function (v) { return typeof v === "string" && v.trim(); }).length) c.verses = d.verses.filter(function (v) { return typeof v === "string" && v.trim(); });
  if (d.moods && typeof d.moods === "object") ["focus", "loss", "tired"].forEach(function (m) {
    var x = d.moods[m]; if (!x) return;
    if (Array.isArray(x.q) && toPairs(x.q).length) c.moods[m].q = toPairs(x.q);
    if (Array.isArray(x.v) && x.v.filter(function (v) { return typeof v === "string"; }).length) c.moods[m].v = x.v.filter(function (v) { return typeof v === "string"; });
  });
  if (Array.isArray(d.challenges)) c.challenges = c.challenges.map(function (def) {
    var x = d.challenges.filter(function (y) { return y && y.id === def.id; })[0];
    return x ? { id: def.id, text: typeof x.text === "string" && x.text ? x.text : def.text, goal: Math.max(1, Math.min(50, parseInt(x.goal, 10) || def.goal)), on: x.on !== false } : def;
  });
  // "What's new": whichever has the higher version wins (this file or the admin page),
  // so bumping the version here and committing shows the popup to everyone.
  if (d.news && typeof d.news.v === "string" && Array.isArray(d.news.items) && newer(d.news.v, c.news.v))
    c.news = { v: d.news.v, items: d.news.items.filter(function (i) { return typeof i === "string"; }) };
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
  fetch("https://bible-api.com/" + encodeURI(ref.replace(/ /g, "+")) + "?translation=kjv")
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


// ----- Coding drills (like the gaming drills). paths: which tech paths it fits ("all" = everyone) -----
var CODE_DRILLS = [
 {name:"Read the error first", time:"10 min", paths:["all"],
  steps:["Run something that breaks, or open an old bug.","Read the whole error message out loud, bottom line first.","Find the file and line number it points to.","Write one sentence: what you think went wrong.","Fix it, then run it again to prove it."],
  tip:"Most errors tell you exactly where to look. Beginners skip reading them."},
 {name:"Rubber duck debugging", time:"10 min", paths:["all"],
  steps:["Pick code that isn't working the way you want.","Explain it line by line, out loud, like you're teaching someone.","Stop at the first line you can't explain clearly.","That's usually where the bug is. Test that line."],
  tip:"Saying it out loud forces you to notice what you skipped over."},
 {name:"Type it, don't paste it", time:"15 min", paths:["all"],
  steps:["Find a short example from a tutorial or the docs.","Type it out by hand instead of copying.","Change one thing and guess what will happen before you run it.","Run it and check if you were right."],
  tip:"Typing builds memory. Pasting builds nothing."},
 {name:"Rebuild it from memory", time:"20 min", paths:["all"],
  steps:["Pick something small you made in the last few days.","Close it. Start a new empty file.","Build it again without looking.","Only peek when you're truly stuck, and note what you forgot."],
  tip:"The parts you forgot are exactly what to practice next."},
 {name:"Make it cleaner", time:"15 min", paths:["all"],
  steps:["Open code you wrote before.","Rename unclear variables so they say what they hold.","Split one long block into a small function.","Delete anything that isn't used. Make sure it still runs."],
  tip:"Clean code is code you can still read next week."},
 {name:"One practice problem", time:"20 min", paths:["all"],
  steps:["Open Exercism or Codewars and pick one easy problem.","Write the steps in plain words before any code.","Solve it, even if it's messy.","Then read 2 other people's solutions and note one trick."],
  tip:"Reading other solutions is where most of the learning happens."},
 {name:"Read the docs", time:"10 min", paths:["all"],
  steps:["Pick one thing you used today (a function, tag, or command).","Look it up in the official docs.","Find one option or feature you didn't know about.","Try it in a tiny example."],
  tip:"Docs feel slow at first, but they're faster than guessing."},
 {name:"Git basics", time:"10 min", paths:["all"],
  steps:["Make a small change to a project.","Check what changed with git status and git diff.","Commit it with a clear message, like \"Add score reset button\".","Push it to GitHub."],
  tip:"Small commits with clear messages make mistakes easy to undo."},
 {name:"Use the browser DevTools", time:"15 min", paths:["web"],
  steps:["Open any page you built and press F12.","In Elements, change a color or size live.","In Console, run document.title and one line of your own.","Find one error or warning and fix it in your code."],
  tip:"DevTools lets you test a fix before you write it."},
 {name:"Copy a small piece of UI", time:"25 min", paths:["web"],
  steps:["Find a button, card, or nav bar you like on a real site.","Rebuild it with your own HTML and CSS.","Make it look right on a phone width too.","Compare side by side and fix one difference."],
  tip:"Copying real designs teaches layout faster than tutorials."},
 {name:"Test your function", time:"15 min", paths:["py"],
  steps:["Write a small function, like one that adds tax to a price.","Under it, write 3 assert lines with answers you know are right.","Add one weird case: 0, a negative, or empty input.","Run it. Fix the function until every assert passes."],
  tip:"If you can't write a test for it, you're not sure what it should do yet."},
 {name:"Play in the Python shell", time:"10 min", paths:["py"],
  steps:["Open a terminal and type python.","Try 5 string methods on a word, like .upper() and .split().","Use dir() and help() on something you don't know.","Write down the one you'll use next."],
  tip:"The shell is the fastest way to answer \"what does this do?\""},
 {name:"Make one mechanic", time:"30 min", paths:["game"],
  steps:["Pick one move: jump, dash, or shoot.","Make it work in a blank scene with just a box.","Tweak the numbers until it feels good.","Write the best numbers down so you can reuse them."],
  tip:"Games are built one small mechanic at a time."},
 {name:"Command line practice", time:"15 min", paths:["it","sec","ns"],
  steps:["Open a terminal.","Make a folder, move into it, and create 3 files.","List, rename, and delete them using commands only.","Look up one new command and try it."],
  tip:"Getting comfortable in the terminal pays off in every tech job."},
 {name:"One hands-on lab", time:"30 min", paths:["sec","it"],
  steps:["Open TryHackMe or OverTheWire.","Do one beginner room or level.","Write down every command you used and what it did.","Read the official walkthrough after and note one thing you missed."],
  tip:"Your notes become your own cheat sheet."},
 {name:"Learn one network thing", time:"10 min", paths:["it","sec"],
  steps:["Pick one: DNS, DHCP, HTTP, or SSH.","Read what it does and what port it uses.","Explain it in 2 sentences in your learning log.","Find it in action on your own computer if you can."],
  tip:"Networking shows up in almost every IT and security question."}
];

// ----- Coding tips (one shows each day) -----
var CODE_TIPS = [
 "Code a little every day. 20 minutes daily beats 3 hours once a week.",
 "Stuck for more than 20 minutes? Take a short walk, then explain the problem out loud.",
 "Build small things you actually want to use. You'll finish them.",
 "Google the exact error message in quotes. Someone has seen it before.",
 "Name variables for what they hold: playerScore, not x.",
 "Save often and commit often. Future you will thank you.",
 "Don't watch tutorials back to back. Watch one, then build something without it.",
 "Break big tasks into steps so small they feel too easy.",
 "Read your code out loud. Bugs hide in the parts you skim.",
 "Keep a list of things you learned. It's proof you're getting better.",
 "Copying code is fine if you can explain every line.",
 "When something works, change one thing and see what breaks. That's how you learn why.",
 "Use print statements to see what your code is actually doing.",
 "Ask for help with what you tried, what you expected, and what happened.",
 "Finish projects, even ugly ones. Finished beats perfect.",
 "Learn your editor's shortcuts. Ctrl+D and Ctrl+/ save tons of time.",
 "Rest matters. Tired brains write buggy code.",
 "Compare yourself to you from last month, not to other people.",
 "Put your projects on GitHub. It becomes your portfolio.",
 "If a fix feels like magic, look up why it worked."
];

// ----- Helpful sites: [name, url, what it's for, group, paths] -----
var CODE_SITES = [
 ["freeCodeCamp","https://www.freecodecamp.org/","Free courses with hands-on lessons","Learn",["web","py","ns"]],
 ["The Odin Project","https://www.theodinproject.com/","Full free path to web developer","Learn",["web"]],
 ["CS50x","https://cs50.harvard.edu/x/","Harvard's free intro to computer science","Learn",["all"]],
 ["CS50P","https://cs50.harvard.edu/python/","Harvard's free Python course","Learn",["py","ns"]],
 ["Automate the Boring Stuff","https://automatetheboringstuff.com/","Free Python book for useful scripts","Learn",["py"]],
 ["roadmap.sh","https://roadmap.sh/","Step-by-step maps for every tech path","Learn",["all"]],
 ["Godot docs","https://docs.godotengine.org/","Free game engine with great tutorials","Learn",["game"]],
 ["Unity Learn","https://learn.unity.com/","Free official Unity courses","Learn",["game"]],
 ["Professor Messer","https://www.professormesser.com/","Free CompTIA A+, Network+ and Security+ videos","Learn",["it","sec"]],
 ["TryHackMe","https://tryhackme.com/","Beginner hacking labs in your browser","Practice",["sec","it"]],
 ["OverTheWire","https://overthewire.org/wargames/","Command line and security games","Practice",["sec","it"]],
 ["Exercism","https://exercism.org/","Free practice problems with mentors","Practice",["all"]],
 ["Codewars","https://www.codewars.com/","Short coding challenges by level","Practice",["all"]],
 ["Frontend Mentor","https://www.frontendmentor.io/","Real designs to build with HTML and CSS","Practice",["web"]],
 ["MDN Web Docs","https://developer.mozilla.org/","The best reference for HTML, CSS and JS","Docs",["web"]],
 ["Python docs","https://docs.python.org/3/","Official Python reference and tutorial","Docs",["py"]],
 ["Python Tutor","https://pythontutor.com/","See your code run step by step","Tools",["py","ns"]],
 ["Stack Overflow","https://stackoverflow.com/","Answers to almost every coding error","Tools",["all"]],
 ["GitHub","https://github.com/","Save your code and show your projects","Tools",["all"]],
 ["CodePen","https://codepen.io/","Try HTML, CSS and JS right in the browser","Tools",["web"]]
];
