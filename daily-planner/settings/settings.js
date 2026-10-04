// ===== Load and save =====
var $=function(i){return document.getElementById(i)},st={};
function td(){return new Date().toLocaleDateString("en-CA")}
function load(){try{st=JSON.parse(localStorage.getItem("apexplan")||"{}")}catch(e){st={}}}
function save(){st.ts=Date.now();try{localStorage.setItem("apexplan",JSON.stringify(st))}catch(e){}if(window.cloudSave)window.cloudSave(st)}
load();
if(!st.acct)location.replace("../login/login.html");

// ===== Back button =====
$("bk").onclick=function(){location.href="../index.html"};

// ===== Look and theme color =====
function th(c){document.documentElement.style.setProperty("--acc",c)}
function lk(v){var r=document.documentElement;if(v==="auto")r.removeAttribute("data-theme");else r.setAttribute("data-theme",v);
 [].forEach.call($("md").children,function(b){b.setAttribute("aria-pressed",b.dataset.v===v)})}
if(st.th)th(st.th);lk(st.md||"auto");
$("md").onclick=function(e){var b=e.target.closest("button");if(b){st.md=b.dataset.v;save();lk(b.dataset.v)}};
var COLORS=["#6d5cff","#e8590c","#12a37a","#d6336c","#0b7285","#5f3dc4"];
function drawTh(){$("th").innerHTML=COLORS.map(function(c){return'<button class="sw" data-c="'+c+'" style="background:'+c+'" aria-label="Theme '+c+'" aria-pressed="'+((st.th||COLORS[0])===c)+'"></button>'}).join("")}
function drawSnd(){[].forEach.call($("snd").children,function(b){b.setAttribute("aria-pressed",(b.dataset.v==="on")===(st.snd!==false))})}
$("snd").onclick=function(e){var b=e.target.closest("button");if(b){st.snd=b.dataset.v==="on";save();drawSnd()}};drawSnd();
$("th").onclick=function(e){var b=e.target.closest("button");if(b){st.th=b.dataset.c;th(b.dataset.c);save();drawTh()}};drawTh();

// ===== Game and full days =====
var DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
$("gm").value=st.gn||(st.gm&&st.gm!=="Another game"?st.gm:"");
$("gt").innerHTML=GENRE_ORDER.map(function(g){return'<option value="'+g+'">'+GENRES[g].name+"</option>"}).join("");
$("gt").value=genreId(st);
function gameStatus(){var g=genreOf(st);$("gst").textContent=g.ai?"Using a custom AI plan for "+g.game+".":"Using the built-in plan for this game type."}
var aiTimer,aiFor="";
function askAI(){var v=st.gn||"";if(!window.AI||!v||normGame(v)===aiFor)return;
 var mine=aiFor=normGame(v);$("gst").textContent="Making a custom plan for "+v+"\u2026";
 window.AI.gamePlan(v).then(function(r){if(mine!==normGame(st.gn||""))return;
  if(r){st.gp=r;st.gg=r.g;$("gt").value=r.g;save()}gameStatus()})}
window.addEventListener("ai-ready",gameStatus);
$("gm").oninput=function(){var v=$("gm").value.trim(),d=detectGame(v);st.gn=v;st.gm=d.k||"Another game";delete st.gg;$("gt").value=genreId(st);save();gameStatus();
 clearTimeout(aiTimer);aiTimer=setTimeout(askAI,1200)};
$("gt").onchange=function(){st.gg=$("gt").value;save();gameStatus()};
gameStatus();
function drawFd(){$("fd").innerHTML=DAYS.map(function(n,i){return'<button data-i="'+i+'" aria-pressed="'+((st.fd||[0,1,2]).indexOf(i)>-1)+'">'+n+"</button>"}).join("")}
$("fd").onclick=function(e){var b=e.target.closest("button");if(!b)return;var a=(st.fd||[0,1,2]).slice(),i=+b.dataset.i,p=a.indexOf(i);
 if(p>-1)a.splice(p,1);else a.push(i);st.fd=a;save();drawFd()};
drawFd();

// ===== Reminders =====
[["b","rb1","22:00"],["s","rs1","16:00"]].forEach(function(p){var el=$(p[1]);
 el.value=(st.rm||{})[p[0]]||"";
 el.oninput=function(){st.rm=st.rm||{};st.rm[p[0]]=el.value;save()};
 tp(el,p[2])});

// ===== Your data =====
$("rd").onclick=function(){location.href="../onboarding/onboarding.html"};
$("rs").onclick=function(){
 if(!confirm("Uncheck everything on today's checklists?"))return;
 if(st.dn)["gaming","sleep","coding"].forEach(function(c){delete st.dn[td()+c]});
 save();$("rs").textContent="Today's checklists reset"};
$("ex").onclick=function(){
 var blob=new Blob([JSON.stringify(st,null,1)],{type:"application/json"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="planner-data.json";document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(a.href)},1000)};
$("im").onclick=function(){$("if").click()};
$("if").onchange=function(){var f=this.files[0];this.value="";if(!f)return;
 var r=new FileReader();r.onload=function(){try{var d=JSON.parse(r.result);
  if(!d||typeof d!=="object"||Array.isArray(d))throw 0;
  if(!confirm("Replace your current data with this file?"))return;
  d.acct=st.acct;st=d;save();location.reload()}catch(e){$("im").textContent="Not a valid file"}};
 r.readAsText(f)};

// ===== Calendar reminders (.ics file) =====
$("ics").onclick=function(){var r=st.rm||{},ev=[],d=new Date(),day=d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate()),stamp=new Date().toISOString().replace(/[-:]/g,"").split(".")[0]+"Z";
 if(r.b)ev.push(["Bedtime: start winding down","Screens off soon. Your planner's sleep checklist is waiting.",r.b,"bed"]);
 if(r.s)ev.push(["Study time","Time for your coding session.",r.s,"study"]);
 if(!ev.length){alert("Set a bedtime or study reminder above first.");return}
 var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Daily Planner//EN","CALSCALE:GREGORIAN"];
 ev.forEach(function(e){var t=e[2].replace(":","")+"00";
  L.push("BEGIN:VEVENT","UID:planner-"+e[3]+"@daily-planner","DTSTAMP:"+stamp,"DTSTART:"+day+"T"+t,"DURATION:PT15M","RRULE:FREQ=DAILY",
   "SUMMARY:"+e[0],"DESCRIPTION:"+e[1],"BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+e[0],"TRIGGER:PT0M","END:VALARM","END:VEVENT")});
 L.push("END:VCALENDAR");
 var blob=new Blob([L.join("\r\n")],{type:"text/calendar"}),a=document.createElement("a");
 a.href=URL.createObjectURL(blob);a.download="planner-reminders.ics";document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
 $("ics").textContent="Downloaded. Open the file to add it"};

// ===== Install app =====
var promptEv=null,standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
if("serviceWorker" in navigator)navigator.serviceWorker.register("../sw.js").catch(function(){});
if(standalone){$("ih").textContent="You're using the installed app."}
else if(/iphone|ipad|ipod/i.test(navigator.userAgent)){$("ih").textContent="On iPhone: tap the Share button in Safari, then Add to Home Screen."}
addEventListener("beforeinstallprompt",function(e){e.preventDefault();promptEv=e;$("ins").hidden=false});
$("ins").onclick=async function(){if(!promptEv)return;promptEv.prompt();var r=await promptEv.userChoice;promptEv=null;$("ins").hidden=true;
 if(r.outcome==="accepted")$("ih").textContent="Installed! Find it on your home screen or desktop."};
addEventListener("appinstalled",function(){$("ins").hidden=true});
