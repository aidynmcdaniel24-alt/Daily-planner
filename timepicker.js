// ===== Custom time picker (used by the planner and settings) =====
function pad(n){return("0"+n).slice(-2)}
function fmt(v){if(!v)return"Set time";var p=v.split(":"),h=+p[0];return(h%12||12)+":"+p[1]+" "+(h<12?"AM":"PM")}
function tp(el,def){
 el.hidden=true;
 var b=document.createElement("button"),pn=document.createElement("div");
 b.type="button";b.className="tpb";pn.className="tpp";pn.hidden=true;el.after(b,pn);
 var lab=document.querySelector('label[for="'+el.id+'"]');if(lab)b.setAttribute("aria-label",lab.textContent);
 function cur(){var p=(el.value||def).split(":");return{h:+p[0],m:+p[1]}}
 function set(h,m){el.value=pad(h)+":"+pad(m);el.dispatchEvent(new Event("input",{bubbles:true}));draw()}
 function col(k,list,sel,show){return'<div class="tpc" data-k="'+k+'">'+list.map(function(x){return'<button type="button" data-v="'+x+'" aria-pressed="'+(x===sel)+'">'+(show?show(x):x)+"</button>"}).join("")+"</div>"}
 function draw(){
  b.textContent=fmt(el.value);if(pn.hidden)return;
  var c=cur(),hs=[12,1,2,3,4,5,6,7,8,9,10,11],ms=[];
  for(var i=0;i<60;i+=5)ms.push(i);
  if(ms.indexOf(c.m)<0){ms.push(c.m);ms.sort(function(x,y){return x-y})}
  pn.innerHTML=col("h",hs,c.h%12||12)+col("m",ms,c.m,pad)+col("a",["AM","PM"],c.h<12?"AM":"PM")+'<button type="button" class="tpd" data-done="1">Done</button>';
  [].forEach.call(pn.querySelectorAll('.tpc [aria-pressed="true"]'),function(x){x.parentNode.scrollTop=x.offsetTop-60})}
 pn.onclick=function(e){var t=e.target.closest("button");if(!t)return;
  if(t.dataset.done){pn.hidden=true;draw();return}
  var c=cur(),k=t.parentNode.dataset.k,v=t.dataset.v,h=c.h%12,pm=c.h>=12;
  if(k==="h")set(+v%12+(pm?12:0),c.m);
  else if(k==="m")set(c.h,+v);
  else set(h+(v==="PM"?12:0),c.m)};
 b.onclick=function(){pn.hidden=!pn.hidden;draw()};
 el._tpr=draw;draw()}
