// ===== Content: drill guides, weekly challenges, project ideas, mood quotes =====
// This file is just data. Add your own drills, ideas, or quotes here.

// ----- Aim drill guides -----
// "keys" are words that match today's aim focus, so the right guide shows up.
var DRILLS = [
 {name:"Tracking", keys:["track","smooth","strafetrack","orbit"], time:"10 min",
  steps:["Pick a smooth tracking scenario (Strafetrack, Smoothbot, or a moving bot in your game's range).",
         "Keep your crosshair on the target's center. Move with your arm for big motions and your wrist for small ones.",
         "Do 3 rounds. On each one, try to stay on target longer than the last."],
  tip:"Relax your grip. A tense hand makes tracking shaky."},
 {name:"Recoil control", keys:["recoil","spray"], time:"10 min",
  steps:["Go to the practice range with your main AR or SMG.",
         "Spray a full mag at a wall from medium range and look at the bullet pattern.",
         "Spray again, pulling your mouse the opposite way of the pattern. Then try it on a moving dummy."],
  tip:"Learn one gun really well before moving to the next."},
 {name:"Flicks", keys:["flick","gridshot"], time:"8 min",
  steps:["Pick a flick scenario like Gridshot.",
         "Do your first 2 runs slow. Only click when your crosshair is on the target.",
         "Speed up on the next runs, but stop speeding up if accuracy drops below about 85%."],
  tip:"Accuracy first, speed second. Speed comes on its own."},
 {name:"Target switching", keys:["switch","spidershot"], time:"8 min",
  steps:["Pick a scenario with several targets on screen.",
         "Move to the next target, settle, then shoot. Don't shoot while still moving.",
         "Try to cut the pause between targets a little each round."],
  tip:"In real fights, switch to the weakest enemy first."},
 {name:"Small precise aim", keys:["micro","precise","headshot"], time:"8 min",
  steps:["Pick a scenario with small targets (like Microshot).",
         "Use tiny wrist and finger movements only.",
         "Count your misses and try to beat that number next time."],
  tip:"Lower your speed until you can hit almost every shot."},
 {name:"Aim while moving", keys:["strafe","move","movement","counter"], time:"10 min",
  steps:["In the range, strafe left and right (A and D) while shooting a dummy.",
         "Keep your crosshair on the target while your body moves.",
         "In tactical shooters, practice stopping fully (counter-strafing) right before you shoot."],
  tip:"Good movement makes you harder to hit. Good aim makes it count."},
 {name:"Crosshair placement", keys:["crosshair","prefire","peek"], time:"10 min",
  steps:["Load a map in practice mode.",
         "Walk through it with your crosshair always at head height.",
         "Aim where an enemy would appear around each corner before you peek."],
  tip:"Good placement means you barely need to flick."}
];

// ----- Weekly challenges -----
// Each one counts something from this week (Monday to Sunday).
var CHALLENGES = [
 {id:"calm",  text:"Log 5 calm sessions", goal:5},
 {id:"sleep", text:"Get 7+ hours of sleep on 4 nights", goal:4},
 {id:"logs",  text:"Write 3 tech learning log entries", goal:3},
 {id:"gday",  text:"Finish your gaming checklist on 4 days", goal:4},
 {id:"cday",  text:"Finish your coding checklist on 3 days", goal:3},
 {id:"score", text:"Save your aim scores on 3 days", goal:3},
 {id:"notes", text:"Write a daily note on 5 days", goal:5},
 {id:"all",   text:"Finish all 3 checklists on the same day, twice", goal:2},
 {id:"rank",  text:"Log your rank 2 times", goal:2}
];

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

// ----- Quotes and verses by mood -----
var MOODS = {
 focus:{q:[["We are what we repeatedly do. Excellence, then, is not an act, but a habit.","Will Durant"],
           ["Discipline is the bridge between goals and accomplishment.","Jim Rohn"],
           ["Champions keep playing until they get it right.","Billie Jean King"]],
        v:[["Let thine eyes look right on, and let thine eyelids look straight before thee.","Proverbs 4:25 (KJV)"],
           ["Commit thy works unto the LORD, and thy thoughts shall be established.","Proverbs 16:3 (KJV)"]]},
 loss:{q:[["I've failed over and over and over again in my life. And that is why I succeed.","Michael Jordan"],
          ["It does not matter how slowly you go as long as you do not stop.","Confucius"]],
       v:[["For a just man falleth seven times, and riseth up again…","Proverbs 24:16 (KJV)"],
          ["Let us not be weary in well doing: for in due season we shall reap, if we faint not.","Galatians 6:9 (KJV)"],
          ["He that is slow to anger is better than the mighty…","Proverbs 16:32 (KJV)"]]},
 tired:{q:[["A good laugh and a long sleep are the best cures in the doctor's book.","Irish proverb"],
           ["Well done is better than well said.","Benjamin Franklin"]],
        v:[["Come unto me, all ye that labour and are heavy laden, and I will give you rest.","Matthew 11:28 (KJV)"],
           ["I will both lay me down in peace, and sleep: for thou, LORD, only makest me dwell in safety.","Psalm 4:8 (KJV)"],
           ["They that wait upon the LORD shall renew their strength…","Isaiah 40:31 (KJV)"]]}
};
// Extra coding quotes for the main list
var MORE_Q = [["Programs must be written for people to read, and only incidentally for machines to execute.","Harold Abelson"],
 ["Simplicity is prerequisite for reliability.","Edsger W. Dijkstra"],
 ["Discipline is the bridge between goals and accomplishment.","Jim Rohn"]];
var MORE_V = [["Come unto me, all ye that labour and are heavy laden, and I will give you rest.","Matthew 11:28 (KJV)"],
 ["Commit thy works unto the LORD, and thy thoughts shall be established.","Proverbs 16:3 (KJV)"]];
