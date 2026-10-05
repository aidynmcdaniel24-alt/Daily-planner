# Daily Planner

A planner for gaming, sleep, and coding habits. Built with plain HTML, CSS, and JavaScript, with Firebase for accounts.

## Features
- Accounts (email or Google) with sync across devices, or use it as a guest
- Setup questions that build a plan for you (quick or full), plus a short tour
- Gaming, Sleep, Coding, and Summary tabs with daily checklists and streaks
- Drag to reorder tasks
- Break timer, tilt tracker with break suggestions, score tracker
- Weekly charts for tasks done and sleep
- Friends leaderboard with friend codes
- Calendar reminders, installable app, works offline
- Plans, drill guides, and score labels for every kind of game (shooters, chess, GeoGuessr, MOBAs, fighting, racing, rhythm, and more)
- Weekly challenges, daily coding project ideas
- Rank tracker, daily notes, month calendar
- Focus mode (press F), keyboard shortcuts (1-4 for tabs)
- Friend nudges, recent logins, log out of all devices
- Themes, dark mode, sound, export and import

## Content and AI
- Quotes, verse references, weekly challenges, "What's new", course suggestions, and blocked words live in the Firebase database. Edit them at `/admin/` (add your user ID to `firestore.rules` first).
- Custom game plans and coding project ideas come from Google Gemini through Firebase AI Logic (`ai.js`). If AI is unavailable, built-in plans in `genres.js` are used.
- Bible verse text loads live from bible-api.com.

## How to run
Use the Live Server extension in VS Code and open `index.html` (the landing page). The planner itself is at `/home/`.
