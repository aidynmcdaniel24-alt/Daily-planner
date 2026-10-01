// ===== Load saved data =====
var $=function(i){return document.getElementById(i)},st={};
try{st=JSON.parse(localStorage.getItem("apexplan")||"{}")}catch(e){st={}}
function save(){st.ts=Date.now();try{localStorage.setItem("apexplan",JSON.stringify(st))}catch(e){}}
function td(){return new Date().toLocaleDateString("en-CA")}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
if(st.th)document.documentElement.style.setProperty("--acc",st.th);
if(st.md&&st.md!=="auto")document.documentElement.setAttribute("data-theme",st.md);

var a=st.ob||{},i=0;
function has(g){return(a.goals||[]).indexOf(g)>-1}
function hasWk(w){return(a.wk||[]).indexOf(w)>-1}
function full(){return a.mode!=="quick"}
function rankFull(){return has("rank")&&full()}

// ===== Time helpers =====
function pad(n){return("0"+n).slice(-2)}
function mins(t){var p=t.split(":");return+p[0]*60+ +p[1]}
function norm(m){return((m%1440)+1440)%1440}
function nice(m){m=norm(m);var h=Math.floor(m/60);return(h%12||12)+":"+pad(m%60)+" "+(h<12?"AM":"PM")}
function hhmm(m){m=norm(m);return pad(Math.floor(m/60))+":"+pad(m%60)}

function matchGame(t){var s=String(t||"").toLowerCase().replace(/[^a-z0-9]/g,"");
 if(s.indexOf("apex")>-1)return"Apex Legends";
 if(s.indexOf("fortnite")>-1)return"Fortnite";
 if(s.indexOf("valo")>-1)return"Valorant";
 if(s.indexOf("counterstrike")>-1||s.indexOf("csgo")>-1||s==="cs"||s.indexOf("cs2")>-1)return"CS2";
 return"Another game"}

// ===== Questions =====
var GOALS=[["rank","Rank up"],["code","Learn to code"],["sleep","Sleep better"]];
var DRO=[["track","Tracking"],["recoil","Recoil control"],["flick","Flicks"],["switch","Target switching"],["micro","Small precise aim"],["move","Aim while moving"]];
var S=[
 {k:"mode",q:"How do you want to set up?",h:"Quick takes 30 seconds. Full builds a better plan.",t:"one",o:[["quick","Quick setup (3 questions)"],["full","Full setup"]]},
 {k:"nm",q:"What's your name?",t:"text"},
 {k:"goals",q:"What do you want to work on?",h:"Pick all that apply.",t:"multi",o:GOALS},
 {k:"gm",q:"What game do you play most?",h:"Type the name of your game.",t:"text",ph:"Example: Apex Legends",f:rankFull},
 {k:"g2",q:"Do you play a second game?",h:"Optional. Leave it blank to skip.",t:"text",opt:1,ph:"Example: Rocket League",f:rankFull},
 {k:"rk",q:"What's your rank right now?",t:"one",f:rankFull,
  o:[["new","New to ranked"],["low","Bronze to Silver"],["mid","Gold to Platinum"],["high","Diamond or higher"]]},
 {k:"wk",q:"What do you want to fix?",h:"Pick all that apply.",t:"multi",f:rankFull,
  o:[["track","Tracking"],["recoil","Recoil"],["flick","Flicks"],["pos","Positioning"],["tilt","Tilting"],["sense","Game sense"]]},
 {k:"dr",q:"Pick your aim drills",h:"We picked some from your weak spots. Change them if you want.",t:"multi",opt:1,f:rankFull,o:DRO},
 {k:"fd",q:"Which days are you free most of the day?",h:"These get a longer routine. Pick none if you're busy every day.",t:"multi",opt:1,f:rankFull,
  o:[["0","Mon"],["1","Tue"],["2","Wed"],["3","Thu"],["4","Fri"],["5","Sat"],["6","Sun"]]},
 {k:"hr",q:"On free days, how long do you play?",t:"one",f:rankFull,
  o:[["1","About 1 hour"],["2","2 to 3 hours"],["4","4+ hours"]]},
 {k:"cl",q:"How much coding do you know?",t:"one",f:function(){return has("code")&&full()},
  o:[["none","None yet"],["beg","A little"],["mid","I can build small projects"]]},
 {k:"cp",q:"What do you want to do in tech?",t:"one",f:function(){return has("code")&&full()},
  o:[["web","Websites"],["py","Python and scripts"],["game","Game dev"],["it","IT support"],["sec","Cybersecurity"],["ns","Not sure yet"]]},
 {k:"bt",q:"What time do you want to be in bed?",t:"one",
  o:[["21:30","9:30 PM"],["22:00","10:00 PM"],["22:30","10:30 PM"],["23:00","11:00 PM"],["23:30","11:30 PM"],["00:00","12:00 AM"],["00:30","12:30 AM"],["01:00","1:00 AM"]]},
 {k:"wt",q:"What time do you wake up?",t:"one",f:full,
  o:[["06:00","6:00 AM"],["06:30","6:30 AM"],["07:00","7:00 AM"],["07:30","7:30 AM"],["08:00","8:00 AM"],["09:00","9:00 AM"],["10:00","10:00 AM"],["11:00","11:00 AM"]]},
 {k:"th",q:"Pick a color for your planner",h:"You can change it later in Settings.",t:"one",f:full,
  o:[["#6d5cff",'<span class="sw-dot" style="background:#6d5cff"></span>Purple'],["#e8590c",'<span class="sw-dot" style="background:#e8590c"></span>Orange'],["#12a37a",'<span class="sw-dot" style="background:#12a37a"></span>Green'],
     ["#d6336c",'<span class="sw-dot" style="background:#d6336c"></span>Pink'],["#0b7285",'<span class="sw-dot" style="background:#0b7285"></span>Teal'],["#5f3dc4",'<span class="sw-dot" style="background:#5f3dc4"></span>Violet']]},
 {k:"qm",q:"What kind of daily quote do you want?",t:"one",f:full,
  o:[["moti","Motivation"],["faith","Bible verses"],["mix","Mix of both"]]}
];
function steps(){return S.filter(function(s){return!s.f||s.f()})}
function ok(s){var v=a[s.k];if(s.opt)return true;if(s.t==="multi")return!!(v&&v.length);return!!(v&&String(v).trim())}

// ===== Build the plan from answers =====
var DR={track:"Tracking drills (Strafetrack or Smoothbot)",recoil:"Recoil control in the practice range",flick:"Flick drills (Gridshot)",switch:"Target switching drills",micro:"Small precise aim (Microshot)",move:"Strafe-and-shoot drills"};
function drillKeys(){return a.dr||(a.wk||[]).filter(function(w){return DR[w]})}
function freeDays(){return a.fd?a.fd.map(Number):(full()?[]:[5,6])}
var RES={web:"The Odin Project",py:"CS50P (free Harvard Python course)",game:"Godot docs or Unity Learn",it:"Google IT Support or Professor Messer",sec:"TryHackMe beginner path",ns:"CS50x (free Harvard intro course)"};
function make(){
 var p={},code=has("code");
 // gaming
 var h=a.hr||"2",play=a.rk==="new"?"Play block":"Ranked block";
 var rule=hasWk("tilt")?"Stop after 2 losses in a row":"Take a break if you lose focus";
 var rev=hasWk("pos")?"Rewatch one death: where should you have been?":"Watch at 1.5-2x, write one fix";
 var fl=[["Aim training, "+(h==="1"?"10":"15")+" min","@foc"]];
 if(code)fl.push(["Tech learning, "+(h==="1"?"30":"45")+" min","Check the Coding tab"]);
 if(h==="1")fl.push([play+", 45 min",rule]);
 else if(h==="2")fl.push([play+" 1, 60 min","Bring your focus goal into every fight"],["Break, 15 min","Walk, water, no screen"],[play+" 2, 45 min",rule]);
 else fl.push([play+" 1, 60-90 min","Bring your focus goal into every fight"],["Break, 15 min","Walk, water, no screen"],[play+" 2, 60-90 min",rule]);
 if(hasWk("sense")&&h!=="1")fl.push(["Watch a pro player, 15 min","Notice where they rotate and why"]);
 if(a.g2&&a.g2.trim())fl.push(["Optional: "+a.g2.trim()+" for fun","No ranked pressure"]);
 fl.push(["Review one game, "+(h==="1"?"10":"15")+" min",rev]);
 if(hasWk("tilt"))fl.push(["Log your session","Calm or tilted, in the Tilt tracker"]);
 var short=[["Aim warm-up, 10 min","@foc"]];
 if(code)short.push(["Tech learning, 20 min","Even a little keeps the streak"]);
 short.push([play+", 45-60 min","Only if you have time"],["Write one fix","Quick note, then done"]);
 p.full=fl;p.short=short;
 p.drills=drillKeys().map(function(w){return DR[w]});
 // coding
 var m={none:"20 min",beg:"30 min",mid:"45 min"}[a.cl]||"30 min",hands=a.cp==="it"||a.cp==="sec";
 p.coding=[["Study "+m,RES[a.cp]||RES.ns],
  hands?["Do one hands-on lab","One room or one practice task"]:a.cl==="none"?["Write one tiny program","Even 5 lines counts"]:["Build or fix one small thing","Even a tiny script counts"],
  ["Add a line to your learning log","Below on this tab"],
  a.cl==="none"?["Save your work to GitHub","Make an account if you don't have one"]:["Push your work to GitHub","If you made something today"]];
 // sleep
 var b=mins(a.bt||"22:30"),w=mins(a.wt||"07:00");
 p.hours=norm(w-b)/60;
 p.sleep=[["In bed by "+nice(b),"Same time every night"]];
 if(has("rank"))p.sleep.push(["No ranked after "+nice(b-60),"Wind down instead"]);
 p.sleep.push(["Screens off by "+nice(b-30),"Dim lights, stretch"],["No caffeine after "+nice(b-480),"Water instead"],["Wake at "+nice(w),"No snooze spiral"]);
 p.rem=hhmm(b-30);
 return p}

// ===== Screens =====
function draw(){var L=steps();if(i>=L.length){review();return}
 var s=L[i];
 $("stp").textContent="Question "+(i+1)+" of "+L.length;$("pg").style.width=(100*i/L.length)+"%";
 $("q").textContent=s.q;$("hint").textContent=s.h||"";
 if(s.t==="text"){
  $("ans").innerHTML='<input type="text" id="ti" maxlength="40">';
  var ti=$("ti");ti.placeholder=s.ph||"Type here";ti.value=a[s.k]||"";
  ti.oninput=function(){a[s.k]=ti.value;btn()};
  ti.onkeydown=function(e){if(e.key==="Enter"&&ok(s)){i++;draw()}};ti.focus();
 }else{
  if(s.k==="dr"&&!a.dr)a.dr=(a.wk||[]).filter(function(w){return DR[w]});
  var v=a[s.k]||(s.t==="multi"?[]:"");
  $("ans").innerHTML='<div class="ch">'+s.o.map(function(o){var on=s.t==="multi"?v.indexOf(o[0])>-1:v===o[0];return'<button type="button" data-v="'+o[0]+'" aria-pressed="'+on+'">'+o[1]+"</button>"}).join("")+"</div>";
  $("ans").firstChild.onclick=function(e){var b=e.target.closest("button");if(!b)return;var x=b.dataset.v;
   if(s.t==="multi"){var arr=(a[s.k]||[]).slice(),p=arr.indexOf(x);if(p>-1)arr.splice(p,1);else arr.push(x);a[s.k]=arr}else a[s.k]=x;
   if(s.k==="th")document.documentElement.style.setProperty("--acc",x);
   draw()}}
 $("bk").hidden=i===0;$("nx").textContent="Next";$("impw").hidden=i!==0;btn()}
function btn(){var s=steps()[i];$("nx").disabled=s?!ok(s):false}

function list(t,arr){return"<h3>"+t+"</h3><ul class=\"plan\">"+arr.map(function(x){return"<li><b>"+esc(x[0])+"</b>"+(x[1]?" <span class=\"mute\">"+esc(x[1]==="@foc"?"Your aim drill":x[1])+"</span>":"")+"</li>"}).join("")+"</ul>"}
function review(){var p=make(),h="";
 $("stp").textContent="All done";$("pg").style.width="100%";
 $("q").textContent="Here's your plan, "+a.nm.trim();$("hint").textContent="You can edit any task later.";
 if(has("rank")){
  if(a.gm&&a.gm.trim())h+="<p><b>Game:</b> "+esc(a.gm.trim())+(a.g2&&a.g2.trim()?" (and "+esc(a.g2.trim())+")":"")+"</p>";
  if(p.drills.length)h+="<p><b>Aim focus:</b> "+esc(p.drills.join(", "))+"</p>";
  if(freeDays().length)h+=list("Free days",p.full);
  h+=list("Busy days",p.short)}
 if(has("code"))h+=list("Coding",p.coding);
 if(has("rank"))h+=sample(p);
 h+=list("Sleep",p.sleep);
 h+='<p class="'+(p.hours<7?"warn":"mute")+'">That\'s '+p.hours.toFixed(1)+" hours of sleep."+(p.hours<7?" Try an earlier bedtime to get 7+.":"")+"</p>";
 $("ans").innerHTML=h;$("bk").hidden=false;$("impw").hidden=true;$("nx").textContent="Start my planner";$("nx").disabled=false}

function finish(){var p=make();
 st.ob=a;st.nm=a.nm.trim();
 st.gl=GOALS.filter(function(g){return has(g[0])}).map(function(g){return g[1]}).join(", ");
 st.qm=a.qm||st.qm||"mix";if(a.th)st.th=a.th;st.rm=st.rm||{};st.rm.b=p.rem;st.ct=st.ct||{};st.ct.sleep=p.sleep;
 if(has("rank")){st.gn=(a.gm||"").trim();st.gn2=(a.g2||"").trim();st.gm=matchGame(a.gm);st.fd=freeDays();st.plan={full:p.full,short:p.short,drills:p.drills}}else delete st.plan;
 if(has("code"))st.ct.coding=p.coding;else delete st.ct.coding;
 delete st.ct.gaming;
 if(st.dn)["gaming","sleep","coding"].forEach(function(c){delete st.dn[td()+c]});
 st.tour=1;st.done=1;st.sk=1;save();location.href="../index.html"}

// ===== Sample day =====
function sample(p){var fd=freeDays(),L=fd.length?p.full:p.short,t=mins(a.wt||"08:00")+60,rows=[];
 L.forEach(function(x){var m=/(\d+)/.exec(x[0].replace(/block \d,/,"block,"));rows.push([nice(t),x[0].replace(/, \d+(-\d+)? min$/,""),x[1]==="@foc"?(p.drills[0]||"Your aim drill"):x[1]]);t+=m?+m[1]:10});
 return"<h3>Sample "+(fd.length?"free":"busy")+" day</h3><ul class=\"sample\">"+rows.map(function(r){return"<li><span>"+r[0]+"</span><div><b>"+esc(r[1])+"</b></div></li>"}).join("")+"</ul>"}

// ===== Import a backup =====
$("imp").onclick=function(){$("impf").click()};
$("impf").onchange=function(){var f=this.files[0];this.value="";if(!f)return;
 var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);if(!d||typeof d!=="object"||Array.isArray(d))throw 0;
  d.acct=st.acct;d.done=1;d.sk=1;st=d;save();location.href="../index.html"}catch(e){$("imp").textContent="That file didn't work. Try another."}};
 r.readAsText(f)};

// ===== Buttons =====
$("nx").onclick=function(){if(i>=steps().length){finish();return}i++;draw()};
$("bk").onclick=function(){if(i>0){i--;draw()}};
draw();
