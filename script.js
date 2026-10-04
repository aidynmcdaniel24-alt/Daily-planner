// ===== Setup and saving =====
var $=function(i){return document.getElementById(i)},st={},cat="gaming",W=(new Date().getDay()+6)%7;
function td(o){return new Date(Date.now()-86400000*(o||0)).toLocaleDateString("en-CA")}
function load(){try{st=JSON.parse(localStorage.getItem("apexplan")||"{}")}catch(e){st={}}}
function save(){st.ts=Date.now();try{localStorage.setItem("apexplan",JSON.stringify(st))}catch(e){}if(window.cloudSave)window.cloudSave(st)}

// ===== Games and checklists =====
var foc="";
var DEF={
 sleep:[["Pick tonight's bedtime","Same time as work allows"],["No ranked in the last hour","Wind down instead"],["Screens off 30-60 min before bed","Dim lights, stretch"],["Skip late caffeine","Water instead"],["Wake at your set time","No snooze spiral"]],
 coding:[["Study 20-45 min","CS50, freeCodeCamp, or The Odin Project"],["Build or fix one small thing","Even a tiny script counts"],["Add a line to your learning log","Below on this tab"],["Push your work to GitHub","If you made something today"]]};
function build(){var G=genreOf(st),gid=genreId(st),full=(st.fd||[0,1,2]).indexOf(W)>-1,P=st.plan,
  rot=GAME_FOCUS[st.gm]&&gid==="fps"?GAME_FOCUS[st.gm]:G.drills.slice(0,3).map(function(d){return d.name}).concat([G.warm]);
 var samePlan=P&&(P.gg||"fps")===gid;
 if(samePlan&&P.drills&&P.drills.length)foc=full?P.drills[W%P.drills.length]:P.drills[0];else foc=full?rot[W%3]:rot[3];
 function words(t){return String(t).replace("@skill",G.skill).replace("@play",G.play).replace("Aim training",G.skill).replace("Aim warm-up",G.skill+" warm-up").replace("Ranked block",G.play)}
 if(P&&P.full){DEF.gaming=(full?P.full:P.short).map(function(t){return[words(t[0]),t[1]==="@foc"?foc:t[1]==="@rev"?G.review:t[1]]});return}
 DEF.gaming=full?[["Wake up at your set time","Water and food first"],["Tech learning, 45 min","Check the Coding tab"],[G.skill+", 15 min",foc],[G.play+" 1, 60-90 min","Bring your focus goal into every game"],["Break, 15 min","Walk, water, no screen"],[G.play+" 2, 60-90 min","Stop early on the 2-loss rule"],["Review one game, 15 min",G.review]]:[[G.skill+" warm-up, 10 min",foc],["Tech learning, 20-30 min","Even a little keeps the streak"],[G.play+", 60 min","Only if you have time"],["Write one fix","Quick note, then done"]]}
function gameWords(){var G=genreOf(st);
 $("sl1").textContent=G.scores[0];$("sl2").textContent=G.scores[1];$("sl3").textContent=G.scores[2];$("fg").placeholder=G.ph}
function TK(c){return(st.ct&&st.ct[c])||DEF[c]}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function setFc(){$("fc").textContent=genreOf(st).focus+" today: "+foc}
function upd(c){var n=TK(c).length,k=((st.dn||{})[td()+c]||[]).length;
 $("pc-"+c).textContent=k+"/"+n+" done";$("pb-"+c).style.width=(n?100*k/n:0)+"%";
 st.ok=st.ok||{};if(n>0&&k===n)st.ok[c+td()]=1;else delete st.ok[c+td()];
 var s=0,o=st.ok[c+td()]?0:1;while(st.ok[c+td(o)]){s++;o++}
 $("sk-"+c).textContent=s+" day streak";}
function tasks(c){var d=(st.dn||{})[td()+c]||[];
 $("tk-"+c).innerHTML=TK(c).map(function(t,i){return '<label class="t"><input type="checkbox" data-c="'+c+'" data-i="'+i+'"'+(d.indexOf(i)>-1?" checked":"")+'><div><b>'+esc(t[0])+'</b><span>'+esc(t[1])+'</span></div></label>'}).join("");upd(c)}
document.addEventListener("change",function(e){var t=e.target;if(t.type!=="checkbox"||!t.dataset.c)return;
 st.dn=st.dn||{};var c=t.dataset.c,k=td()+c,a=st.dn[k]||[],i=+t.dataset.i,p=a.indexOf(i),was=!!(st.ok||{})[c+td()];
 if(t.checked&&p<0)a.push(i);if(!t.checked&&p>-1)a.splice(p,1);st.dn[k]=a;upd(c);save();
 if(!was&&st.ok[c+td()])celebrate(t,c)});

// ===== Toast with an Undo button =====
function undoToast(msg,undo){var el=document.createElement("div"),b=document.createElement("button"),sp=document.createElement("span"),t;
 el.className="toast act";el.setAttribute("role","status");sp.textContent=msg;b.type="button";b.textContent="Undo";el.appendChild(sp);el.appendChild(b);
 [].forEach.call(document.querySelectorAll(".toast"),function(x){x.remove()});
 document.body.appendChild(el);
 function close(){clearTimeout(t);el.classList.add("out");setTimeout(function(){el.remove()},400)}
 b.onclick=function(){undo();close()};t=setTimeout(close,5000)}

// ===== Celebration when a checklist is finished =====
function toast(msg){var el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=msg;
 document.body.appendChild(el);setTimeout(function(){el.classList.add("out")},2600);setTimeout(function(){el.remove()},3000)}
function celebrate(from,c){
 var name={gaming:"Gaming",sleep:"Sleep",coding:"Coding"}[c];
 toast(name+" checklist done! Streak: "+sk(c)+(sk(c)===1?" day":" days"));
 var card=$("tk-"+c).closest(".card");card.classList.remove("win");void card.offsetWidth;card.classList.add("win");
 if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 var r=from.getBoundingClientRect(),box=document.createElement("div"),cols=["var(--acc)","var(--ok)","var(--hot)"];
 box.className="burst";box.style.left=(r.left+r.width/2)+"px";box.style.top=(r.top+r.height/2)+"px";
 for(var n=0;n<18;n++){var b=document.createElement("i"),ang=Math.random()*Math.PI*2,dist=50+Math.random()*70;
  b.style.background=cols[n%3];b.style.setProperty("--dx",Math.cos(ang)*dist+"px");b.style.setProperty("--dy",Math.sin(ang)*dist-30+"px");
  b.style.setProperty("--rt",(Math.random()*540-270)+"deg");box.appendChild(b)}
 document.body.appendChild(box);setTimeout(function(){box.remove()},1000)}

// ===== Tabs =====
function show(c){cat=c;["gaming","sleep","coding","summary"].forEach(function(x){$("p-"+x).hidden=x!==c});if(c==="summary")sumry();
 [].forEach.call(document.querySelectorAll("#tabs button"),function(b){b.setAttribute("aria-selected",b.dataset.c===c)})}
$("tabs").addEventListener("click",function(e){var b=e.target.closest("button");if(b)show(b.dataset.c)});

// ===== Break timer =====
var tl=600,ti;function tm(){$("tm").textContent=tl<=0?"Break over":Math.floor(tl/60)+":"+("0"+tl%60).slice(-2)}
$("ts").onclick=function(){clearInterval(ti);if(tl<=0)tl=600;ti=setInterval(function(){tl--;tm();if(tl<=0)clearInterval(ti)},1000)};
$("tr").onclick=function(){clearInterval(ti);tl=600;tm()};

// ===== Tilt tracker =====
function tilt(){var a=(st.tl||[]).filter(function(x){return x[0]>=td(6)}),c=a.filter(function(x){return x[1]==="c"}).length;
 $("tls").textContent="Last 7 days: "+c+" calm, "+(a.length-c)+" tilted";tiltCheck()}
function lg(v){st.tl=st.tl||[];st.tl.push([td(),v]);save();tilt()}
function tiltCheck(){var t=(st.tl||[]).filter(function(x){return x[0]===td()}),n=t.length;
 $("tb").hidden=!(n>=2&&t[n-1][1]==="t"&&t[n-2][1]==="t")}
$("tc").onclick=function(){lg("c")};
$("tbs").onclick=function(){$("tb").hidden=true;$("tm").closest(".card").scrollIntoView({behavior:"smooth",block:"center"});$("ts").click()};$("tt").onclick=function(){lg("t")};
$("tu").onclick=function(){if(st.tl&&st.tl.length){st.tl.pop();save();tilt()}};
var cc;$("tx2").onclick=function(){var b=$("tx2");if(b.dataset.arm){st.tl=[];save();tilt();b.textContent="Clear all";delete b.dataset.arm;clearTimeout(cc)}else{b.dataset.arm=1;b.textContent="Tap again to clear";cc=setTimeout(function(){b.textContent="Clear all";delete b.dataset.arm},3000)}};

// ===== Score tracker =====
function sp(a,col){if(a.length<2)return"";var mn=Math.min.apply(0,a),mx=Math.max.apply(0,a),r=mx-mn||1;
 return '<polyline fill="none" stroke="'+col+'" stroke-width="3" stroke-linejoin="round" points="'+a.map(function(v,i){return(10+i*280/(a.length-1)).toFixed(1)+","+(60-(v-mn)/r*50).toFixed(1)}).join(" ")+'"/>'}
function chart(){var s=(st.sc||[]).slice(-14);
 $("ch").innerHTML=s.length<2?'<p class="mute">Save scores on 2 or more days to see a chart.</p>':'<svg viewBox="0 0 300 70" width="100%" role="img" aria-label="Score history">'+sp(s.map(function(x){return x.a}),"var(--acc)")+sp(s.map(function(x){return x.b}),"var(--hot)")+'</svg><p class="mute">Purple: '+esc(genreOf(st).scores[0])+'. Orange: '+esc(genreOf(st).scores[1])+'.</p>'}
$("ss").onclick=function(){st.sc=(st.sc||[]).filter(function(x){return x.d!==td()});
 st.sc.push({d:td(),a:+$("s1").value||0,b:+$("s2").value||0,c:+$("s3").value||0});save();chart()};

// ===== Sleep log =====
function hrs(b,w){if(!b||!w)return null;var x=b.split(":"),y=w.split(":"),m=(+y[0]*60+ +y[1])-(+x[0]*60+ +x[1]);if(m<=0)m+=1440;return m/60}
function slp(){var s=st.sl||{},d=s[td()]||{},h=hrs(d.b,d.w);
 $("sr").textContent=h===null?"":h.toFixed(1)+" hours"+(h>=7?" - good":" - a bit short");
 var n=0;for(var i=0;i<7;i++){var e=s[td(i)];if(e&&hrs(e.b,e.w)>=7)n++}$("sw").textContent="Nights with 7+ hours this week: "+n}
["bt","wt"].forEach(function(id){$(id).oninput=function(){st.sl=st.sl||{};st.sl[td()]={b:$("bt").value,w:$("wt").value};save();slp()}});

// ===== Tech learning log =====
function tlog(){$("tl").innerHTML=(st.tc||[]).slice(-5).reverse().map(function(x){return"<li><b>"+esc(x.d)+"</b>: "+esc(x.t)+"</li>"}).join("")}
$("ta").onclick=function(){var v=$("tx").value.trim();if(!v)return;st.tc=st.tc||[];st.tc.push({d:td(),t:v});$("tx").value="";save();tlog()};

// ===== Inputs and theme =====
$("fg").oninput=function(){st.fg=st.fg||{};st.fg[td()]=$("fg").value;save()};
["r1","r2"].forEach(function(id){$(id).oninput=function(){st[id]=$(id).value;save()}});
function th(c){document.documentElement.style.setProperty("--acc",c)}
function lk(v){var r=document.documentElement;if(!v||v==="auto")r.removeAttribute("data-theme");else r.setAttribute("data-theme",v)}

// ===== Quotes (changes every hour) =====
// The real quote code is in extras.js (it uses the live content list)
function setQ(){}
$("qm").onclick=function(e){var b=e.target.closest("button");if(b){st.qm=b.dataset.m;save();setQ()}};

// ===== Editing tasks =====
function mkEd(c){var box=document.createElement("div");box.className="ed";box.innerHTML='<div class="row"><button data-a="tog">Edit tasks</button></div><div id="el-'+c+'" hidden></div>';$("tk-"+c).after(box);
 box.onclick=function(e){var b=e.target.closest("button");if(!b)return;var a=b.dataset.a,L=$("el-"+c);
  if(a==="tog"){L.hidden=!L.hidden;if(!L.hidden)drawEd(c);return}
  if(a==="rst"){if(st.ct)delete st.ct[c];fin(c);return}
  if(a==="up"){var i=+b.dataset.i;if(i>0)move(c,i,i-1);return}
  var cur=TK(c).map(function(t){return t.slice()});
  if(a==="del"){var before=TK(c).map(function(t){return t.slice()}),bd=((st.dn||{})[td()+c]||[]).slice(),gone=cur.splice(+b.dataset.i,1)[0];
   st.ct=st.ct||{};st.ct[c]=cur;fin(c);
   undoToast("Deleted \u201C"+gone[0]+"\u201D",function(){st.ct[c]=before;st.dn=st.dn||{};st.dn[td()+c]=bd;save();tasks(c);drawEd(c)});return}
  if(a==="add"){var v=$("ei-"+c).value.trim();if(!v)return;cur.push([v,$("es-"+c).value.trim()])}
  st.ct=st.ct||{};st.ct[c]=cur;fin(c)}}
function fin(c){if(st.dn)delete st.dn[td()+c];save();tasks(c);drawEd(c)}
function move(c,from,to){if(from===to)return;var cur=TK(c).map(function(t){return t.slice()}),d=(st.dn||{})[td()+c]||[];
 var flags=cur.map(function(t,i){return d.indexOf(i)>-1}),item=cur.splice(from,1)[0],f=flags.splice(from,1)[0];
 cur.splice(to,0,item);flags.splice(to,0,f);
 st.ct=st.ct||{};st.ct[c]=cur;st.dn=st.dn||{};st.dn[td()+c]=flags.map(function(x,i){return x?i:-1}).filter(function(i){return i>-1});
 save();tasks(c);drawEd(c)}
function drawEd(c){$("el-"+c).innerHTML='<p class="mute" style="margin:8px 0 0">Drag the handle to reorder.</p><ul id="eu-'+c+'">'+TK(c).map(function(t,i){return'<li><span class="hd" aria-hidden="true">\u2807</span><span class="tx">'+esc(t[0])+'</span><button data-a="up" data-i="'+i+'" aria-label="Move up" class="mv">\u2191</button><button data-a="del" data-i="'+i+'" aria-label="Delete task">Delete</button></li>'}).join("")+'</ul><input type="text" id="ei-'+c+'" placeholder="New task"><input type="text" id="es-'+c+'" placeholder="Short note (optional)" style="margin-top:6px"><div class="row"><button data-a="add">Add task</button><button data-a="rst">Restore defaults</button></div>';
 if(window.Sortable)Sortable.create($("eu-"+c),{handle:".hd",animation:150,onEnd:function(ev){move(c,ev.oldIndex,ev.newIndex)}})}

// ===== Summary and badges =====
function sk(c){var s=0,o=(st.ok||{})[c+td()]?0:1;while((st.ok||{})[c+td(o)]){s++;o++}return s}
function cnt(c){var n=0;for(var i=0;i<7;i++)if((st.ok||{})[c+td(i)])n++;return n}
function sumry(){weekly();var a=(st.tl||[]).filter(function(x){return x[0]>=td(6)}),calm=a.filter(function(x){return x[1]==="c"}).length,hs=[],nt=0,s=st.sl||{};
 for(var i=0;i<7;i++){var e=s[td(i)],h=e?hrs(e.b,e.w):null;if(h){hs.push(h);if(h>=7)nt++}}
 var avg=hs.length?(hs.reduce(function(x,y){return x+y},0)/hs.length).toFixed(1)+" h":"no data yet",sc=(st.sc||[]).slice(-1)[0],mx=Math.max(sk("gaming"),sk("sleep"),sk("coding")),cl=(st.tc||[]).length;
 $("sm").innerHTML=[["Checklists finished (7 days)","Gaming "+cnt("gaming")+", Sleep "+cnt("sleep")+", Coding "+cnt("coding")],["Current streaks","Gaming "+sk("gaming")+", Sleep "+sk("sleep")+", Coding "+sk("coding")],["Sessions (7 days)","Calm "+calm+", Tilted "+(a.length-calm)],["Average sleep",avg],["Latest scores",sc?genreOf(st).scores[0]+" "+sc.a+", "+genreOf(st).scores[1]+" "+sc.b+", "+genreOf(st).scores[2]+" "+sc.c:"none yet"]].map(function(r){return"<p><b>"+r[0]+":</b> "+esc(r[1])+"</p>"}).join("");
 $("bg").innerHTML=[["3-day streak",mx>=3],["7-day streak",mx>=7],["5 calm sessions",calm>=5],["3 nights of 7+ hours",nt>=3],["First coding log",cl>=1],["10 coding logs",cl>=10]].map(function(b){return'<span class="bd'+(b[1]?" on":"")+'">'+(b[1]?"\u2713 ":"")+b[0]+"</span>"}).join("")}

// ===== Weekly charts =====
function bars(vals,labels,max,fmt,guide,gl){var W=300,H=120,top=10,bot=22,bw=W/vals.length,ph=H-top-bot,o='';
 if(guide!=null){var gy=top+ph-ph*guide/max;o+='<line x1="0" x2="'+W+'" y1="'+gy+'" y2="'+gy+'" class="gd"/><text x="0" y="'+(gy-4)+'" class="gt">'+gl+'</text>'}
 vals.forEach(function(v,i){var x=i*bw+bw*0.2,w=bw*0.6,h=v==null?0:Math.max(v>0?4:0,ph*Math.min(v,max)/max),y=top+ph-h;
  o+='<g class="bh" tabindex="0"><title>'+labels[i]+': '+(v==null?"no data":fmt(v))+'</title><rect x="'+(i*bw)+'" y="0" width="'+bw+'" height="'+H+'" fill="transparent"/>';
  if(h>0)o+='<path d="M'+x+','+(top+ph)+'v-'+(h-4)+'q0,-4 4,-4h'+(w-8)+'q4,0 4,4v'+(h-4)+'z" class="bar-v"/>';
  else o+='<rect x="'+x+'" y="'+(top+ph-2)+'" width="'+w+'" height="2" rx="1" class="bar-e"/>';
  o+='<text x="'+(i*bw+bw/2)+'" y="'+(H-6)+'" text-anchor="middle" class="bl">'+labels[i].charAt(0)+'</text></g>'});
 return'<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" class="wk">'+o+'<line x1="0" x2="'+W+'" y1="'+(top+ph)+'" y2="'+(top+ph)+'" class="ax"/></svg>'}
function weekly(){var L=[],P=[],S=[],sl=st.sl||{};
 for(var i=6;i>=0;i--){var d=td(i),dt=new Date(Date.now()-86400000*i),tot=0,dn=0;
  L.push(dt.toLocaleDateString("en-US",{weekday:"long"}));
  ["gaming","sleep","coding"].forEach(function(c){tot+=TK(c).length;dn+=Math.min(((st.dn||{})[d+c]||[]).length,TK(c).length)});
  P.push(tot?Math.round(100*dn/tot):0);var e=sl[d];S.push(e?hrs(e.b,e.w):null)}
 $("wc").innerHTML='<h3 class="ct">Tasks done each day</h3>'+bars(P,L,100,function(v){return v+"%"})+
  '<h3 class="ct">Hours of sleep</h3>'+bars(S,L,10,function(v){return v.toFixed(1)+" h"},7,"7 h goal");
 $("wtl").innerHTML='<table><thead><tr><th>Day</th><th>Tasks done</th><th>Sleep</th></tr></thead><tbody>'+L.map(function(l,i){return'<tr><td>'+l+'</td><td>'+P[i]+'%</td><td>'+(S[i]==null?"-":S[i].toFixed(1)+" h")+'</td></tr>'}).join("")+'</tbody></table>'}

// ===== Reminders and greeting =====
function mm(t){if(!t)return-1;var p=t.split(":");return+p[0]*60+ +p[1]}
function rem(){var n=new Date(),m=n.getHours()*60+n.getMinutes(),r=st.rm||{},b=mm(r.b),s=mm(r.s),msg=[];
 if(b>=0&&m>=b&&m<b+120)msg.push("Bedtime reminder: start winding down.");
 if(s>=0&&m>=s&&m<s+180&&!((st.dn||{})[td()+"coding"]||[]).length)msg.push("Study reminder: time for your coding session.");
 $("rm").hidden=!msg.length;$("rm").textContent=msg.join(" ")}
function greet(){$("sb").textContent=st.nm?"Hi "+st.nm+". "+(st.gl?"Goal: "+st.gl:"Let's get to work."):"Gaming, sleep, and coding in one place."}

// ===== Header buttons =====
// ===== Start =====
load();
var setUp=st.done||st.nm||st.sk;
// No account choice yet, or a guest who left before finishing setup: back to the sign-in page
if(!st.acct||(st.acct==="guest"&&!setUp))location.replace("login/login.html");
else if(!setUp)location.replace("onboarding/onboarding.html");
setInterval(function(){setQ()},60000);
if(st.th)th(st.th);
$("fg").value=(st.fg||{})[td()]||"";
$("r1").value=st.r1||"";$("r2").value=st.r2||"";
var ds=(st.sc||[]).slice(-1)[0];if(ds&&ds.d===td()){$("s1").value=ds.a;$("s2").value=ds.b;$("s3").value=ds.c}
var sl=(st.sl||{})[td()];if(sl){$("bt").value=sl.b||"";$("wt").value=sl.w||""}
build();gameWords();setFc();["gaming","sleep","coding"].forEach(tasks);["gaming","sleep","coding"].forEach(mkEd);lk(st.md);greet();rem();setInterval(rem,60000);tilt();chart();slp();tlog();tm();show("gaming");
[["bt","22:00"],["wt","07:00"]].forEach(function(p){tp($(p[0]),p[1])});

// ===== Quick tour (shows once after setup) =====
function tour(){
 var S=[["tabs","Your tabs","Switch between Gaming, Sleep, Coding, and your weekly Summary."],
  ["tk-gaming","Daily checklist","Check off tasks as you go. Finish them all to grow your streak."],
  ["tm","Break timer","Lost 2 in a row? Take a 10 minute break here."],
  ["pf","Your profile","Tap here for the leaderboard, settings, and logging out."]],i=0;
 var ov=document.createElement("div");ov.className="tour";
 ov.innerHTML='<div class="spot" id="tq-spot"></div><div class="tcard" role="dialog" aria-modal="true" aria-labelledby="tq-t"><p class="mute" id="tq-n"></p><h2 id="tq-t"></h2><p id="tq-b"></p><div class="row"><button type="button" id="tq-skip">Skip</button><button type="button" class="pri" id="tq-next">Next</button></div></div>';
 document.body.appendChild(ov);
 function place(){var t=$(S[i][0]);if(!t)return;var r=t.getBoundingClientRect(),sp=$("tq-spot"),c=ov.querySelector(".tcard"),pd=8;
  sp.style.top=(r.top-pd)+"px";sp.style.left=(r.left-pd)+"px";sp.style.width=(r.width+pd*2)+"px";sp.style.height=(r.height+pd*2)+"px";
  var below=r.bottom+pd+16,h=c.offsetHeight;
  c.style.top=(below+h<innerHeight?below:Math.max(16,r.top-pd-16-h))+"px"}
 function step(){var t=$(S[i][0]);if(!t){next();return}
  t.scrollIntoView({block:"center"});
  $("tq-n").textContent=(i+1)+" of "+S.length;$("tq-t").textContent=S[i][1];$("tq-b").textContent=S[i][2];
  $("tq-next").textContent=i===S.length-1?"Got it":"Next";
  requestAnimationFrame(place);$("tq-next").focus()}
 function end(){removeEventListener("resize",place);removeEventListener("scroll",place);ov.remove()}
 function next(){i++;if(i>=S.length)end();else step()}
 $("tq-next").onclick=next;$("tq-skip").onclick=end;
 ov.addEventListener("keydown",function(e){if(e.key==="Escape")end()});
 addEventListener("resize",place);addEventListener("scroll",place,{passive:true});
 step()}
if(st.tour){delete st.tour;save();setTimeout(tour,400)}

// ===== Installable app =====
if("serviceWorker" in navigator)addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})});
