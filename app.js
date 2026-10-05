/* Each photo graded four ways, one per time of day in Mumbai. Files live in /images. */
const PHOTOS={
 "sealink": {
  "dawn": "images/sealink-dawn.jpg",
  "day": "images/sealink-day.jpg",
  "golden": "images/sealink-golden.jpg",
  "night": "images/sealink-night.jpg"
 },
 "train": {
  "dawn": "images/train-dawn.jpg",
  "day": "images/train-day.jpg",
  "golden": "images/train-golden.jpg",
  "night": "images/train-night.jpg"
 },
 "marine": {
  "dawn": "images/marine-dawn.jpg",
  "day": "images/marine-day.jpg",
  "golden": "images/marine-golden.jpg",
  "night": "images/marine-night.jpg"
 },
 "skyline": {
  "dawn": "images/skyline-dawn.jpg",
  "day": "images/skyline-day.jpg",
  "golden": "images/skyline-golden.jpg",
  "night": "images/skyline-night.jpg"
 }
};

/* =========================================================
   1. DATA
   Everything between DATA:START and DATA:END is refreshed by the
   daily scheduled task. In the full build this comes from a database.
   ========================================================= */
/* DATA:START */
// Events, queue, run log and communities are loaded from events.json (see index.html).
const {REFRESHED,EVENTS_RAW,QUEUE_RAW,RUNS,COMMUNITIES} = window.__DATA;
/* DATA:END */

const CAT = {
  AI:{c:"#FFB23F"}, Design:{c:"#FF6B5B"}, UX:{c:"#4DA3FF"}, XR:{c:"#9B7BFF"},
  Startup:{c:"#3DDC97"}, Tech:{c:"#6FA8FF"}, Art:{c:"#FF5FA2"}, Culture:{c:"#36D1C4"},
  Education:{c:"#E3B77A"}, Climate:{c:"#6BD66B"}, Hardware:{c:"#6FA8FF"}, Games:{c:"#FF5FA2"}, Civic:{c:"#3DDC97"}
};
const PATS = ["pat-dots","pat-lines","pat-check","pat-grid"];

// Forms are delivered by FormSubmit (formsubmit.co) to this inbox. No account needed.
const FORM_INBOX = "hello@inventndiscover.com";
const FORM_URL = "https://formsubmit.co/ajax/" + FORM_INBOX;
async function sendForm(data){
  const r = await fetch(FORM_URL,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify({_template:"table",_captcha:"false",...data})});
  const j = await r.json().catch(()=>({}));
  if(!r.ok || String(j.success)!=="true") throw new Error(j.message||("HTTP "+r.status));
  return j;
}

// Demos in Invent; kind:"tutorial" cards show in Learn instead. inst:"Example" marks sample cards that only show the format; real demos have a gif (card) and video (sheet).
const DEMOS = [
 {id:"tufani-samundar",name:"Tufani Samundar",line:"A real-time 3D storm ocean you can dive into, in VR too",cat:"XR",status:"Concept",makers:["Mohit Bhardwaj"],inst:"Real",tools:["WebGL 2","WebXR","Web Audio"],
  gif:"media/tufani-samundar.gif",img:"media/tufani-samundar-whale.jpg",sheetImg:"media/tufani-samundar-storm.jpg",url:"demos/tufani-samundar/",
  needs:"Best on a laptop or desktop with a recent Chrome, Edge or Safari. Older phones may not run it.",
  vr:"inventndiscover.com/demos/tufani-samundar",
  desc:"A force-10 storm at sea, simulated live in the browser. Dive under the waves to a coral reef with a humpback whale, sharks, manta rays, turtles and an octopus. Change the sea state, time of day, cloud and rain, switch on a dive torch, and hear sound made on the fly. Everything is generated in one web page, with nothing to download."},
 {id:"market-walkthrough",name:"Market Walkthrough Low Poly",line:"A walkable low-poly shopping plaza, in your browser or in VR",cat:"XR",status:"Concept",makers:["Mohit Bhardwaj"],inst:"Real",tools:["Three.js","WebXR","Web Audio"],
  gif:"media/market-walkthrough.gif",img:"media/market-walkthrough-cover.jpg",sheetImg:"media/market-walkthrough-cover.jpg",url:"demos/market-walkthrough-low-poly/",
  vr:"inventndiscover.com/demos/market-walkthrough-low-poly",
  needs:"On a laptop: click to enter, walk with W A S D, look with the mouse, scroll to zoom, press T to change the time of day. Walk up to a display to lift and turn a product. Works best in a recent Chrome, Edge or Safari.",
  desc:"A low-poly shopping plaza you can walk around: a watch store, three boutiques and a restaurant, with traffic on the avenue, birds overhead, a city skyline on one side and mountains on the other. Slide from dawn to night and watch the city lights come on. In VR, pick up a product with the trigger to look at it up close."},
 {id:"flapping-bird",name:"Flapping Bird",line:"A neon, step-by-step origami bird whose wings really flap",cat:"Design",kind:"tutorial",status:"Live",makers:["Mohit Bhardwaj"],inst:"Real",tools:["Claude","Python","FFmpeg"],
  gif:"media/flapping-bird.gif",video:"media/flapping-bird-tutorial.mp4",poster:"media/flapping-bird-poster.jpg",
  desc:"Twelve steps turn one square sheet into a classic flapping bird, drawn as glowing line art. Hold the base of the neck, gently pull the tail, and the wings flap. About ten minutes, no glue. The third animated tutorial in the series, made with AI."},
 {id:"paper-heart",name:"Paper Heart",line:"A neon, step-by-step origami heart tutorial",cat:"Design",kind:"tutorial",status:"Live",makers:["Mohit Bhardwaj"],inst:"Real",tools:["Claude","Python","FFmpeg"],
  gif:"media/paper-heart.gif",video:"media/paper-heart-tutorial.mp4",poster:"media/paper-heart-poster.jpg",
  desc:"Seven folds turn one square sheet into a heart, drawn as glowing line art. No glue, under five minutes. A short animated tutorial made with AI, the second in a series turning origami into screen-based lessons."},
 {id:"paper-fan",name:"Paper Fan",line:"A neon, step-by-step origami tutorial",cat:"Design",kind:"tutorial",status:"Live",makers:["Mohit Bhardwaj"],inst:"Real",tools:["Claude","Python","FFmpeg"],
  gif:"media/paper-fan.gif",video:"media/paper-fan-tutorial.mp4",poster:"media/paper-fan-poster.jpg",
  desc:"Eight folds, from a flat sheet to a finished fan, drawn as glowing line art. A one-minute animated tutorial made with AI, as part of a series turning origami into screen-based lessons."},
 {id:"tapri",name:"Tapri",line:"Voice-first ordering for neighbourhood tea stalls",cat:"Civic",status:"Prototype",makers:["Two design students"],inst:"Example",tools:["Speech-to-text","React Native"],desc:"Customers speak an order in Hindi, Marathi or English; the stall owner sees a running tab without typing."},
 {id:"local-lines",name:"Local Lines",line:"AR help for first-time train riders",cat:"XR",status:"Concept",makers:["XR studio team"],inst:"Example",tools:["Unity","AR Foundation"],desc:"Point a phone at a platform indicator board and see which coach to board and which side the doors open."},
 {id:"dabba-route",name:"Dabba Route",line:"An interactive map of how lunchboxes cross the city",cat:"UX",status:"Live",makers:["Independent designer"],inst:"Example",tools:["D3.js","Mapbox"],desc:"A visual explainer tracing one tiffin from a Borivali kitchen to a Fort office, stop by stop."},
 {id:"kolam-kit",name:"Kolam Kit",line:"Generative floor-pattern tool for designers",cat:"Design",status:"Live",makers:["Creative coder"],inst:"Example",tools:["p5.js"],desc:"Draw kolam and rangoli-style grids with rules you can tweak, then export for print or textile."},
 {id:"handloom-lens",name:"Handloom Lens",line:"Identify a weave from a photo",cat:"AI",status:"Prototype",makers:["Textile and ML duo"],inst:"Example",tools:["TensorFlow Lite","Flutter"],desc:"A phone model that recognises common Indian weave types and links to the craft clusters that make them."},
 {id:"stilt",name:"Stilt",line:"A water-level sensor for flood-prone buildings",cat:"Hardware",status:"Prototype",makers:["Engineering students"],inst:"Example",tools:["ESP32","LoRa"],desc:"Sends an alert to a building's WhatsApp group when water in the compound crosses a set level."},
 {id:"chawl-vr",name:"Chawl Stories VR",line:"Oral histories you can walk through",cat:"XR",status:"Prototype",makers:["Immersive media class"],inst:"Example",tools:["Unity","Meta Quest"],desc:"A recreated chawl corridor where each doorway opens a recorded memory from a former resident."},
 {id:"pav-stack",name:"Pav Stack",line:"A one-thumb stacking game",cat:"Games",status:"Live",makers:["Game design student"],inst:"Example",tools:["Godot"],desc:"Stack pav, bhaji and chutney as the vendor's cart speeds up. Built in a 48-hour jam."},
 {id:"bhasha-captions",name:"Bhasha Captions",line:"Live classroom captions in Hindi and Marathi",cat:"AI",status:"Concept",makers:["Accessibility research group"],inst:"Example",tools:["Whisper","WebSockets"],desc:"Captions a lecture in the listener's chosen language on their own phone, for students who are hard of hearing."}
];

// Real posts from inventndiscover.com
const ARTICLES = [
 {title:"2025: A Year of Learning, Decoding Knowledge, and Gratitude",date:"2025-12-26",tag:"Reflection",url:"https://blog.inventndiscover.com/2025/12/26/2025-a-year-of-learning-decoding-knowledge-and-gratitude/"},
 {title:"Stanford University: Where Ideas Are Constantly in Motion",date:"2025-12-18",tag:"Education",url:"https://blog.inventndiscover.com/2025/12/18/stanford-university-where-ideas-are-constantly-in-motion/"},
 {title:"The Silicon Valley Soul: Reflecting on AI, Ethics, and Education at Santa Clara University",date:"2025-12-14",tag:"AI",url:"https://blog.inventndiscover.com/2025/12/14/the-silicon-valley-soul-two-months-reflecting-on-ai-ethics-and-education-at-santa-clara-university/"},
 {title:"San José State University: Business Innovation, AI, and XR in Action",date:"2025-12-10",tag:"XR",url:"https://blog.inventndiscover.com/2025/12/10/san-jose-state-university-business-innovation-ai-and-xr-in-action/"},
 {title:"Showcasing AR Innovation to N. Chandrasekaran and Ronnie Screwvala",date:"2025-12-04",tag:"XR",url:"https://blog.inventndiscover.com/2025/12/04/showcasing-ar-innovation-to-n-chandrasekaran-and-ronnie-screwvala/"},
 {title:"A Glimpse into Innovation at Northeastern University's Oakland Campus",date:"2025-12-02",tag:"Education",url:"https://blog.inventndiscover.com/2025/12/02/a-glimpse-into-innovation-at-northeastern-universitys-oakland-campus/"},
 {title:"Designing Tomorrow: The Research-First Imperative from UC Berkeley's XR Lab",date:"2025-11-27",tag:"XR",url:"https://blog.inventndiscover.com/2025/11/27/designing-tomorrow-the-research-first-imperative-from-uc-berkeleys-xr-lab/"},
 {title:"Learning by Design: Key Insights from Golden Gate University, San Francisco",date:"2025-11-25",tag:"Design",url:"https://blog.inventndiscover.com/2025/11/25/learning-by-design-key-insights-from-golden-gate-university-san-francisco/"},
 {title:"Fueling Innovation: Key Learnings from the University of San Francisco (USF) Immersion",date:"2025-11-18",tag:"Education",url:"https://blog.inventndiscover.com/2025/11/18/fueling-innovation-key-learnings-from-the-university-of-san-francisco-usf-immersion/"}
];
const ART_CAT = {Reflection:"#E3B77A",Education:"#E3B77A",AI:"#FFB23F",XR:"#9B7BFF",Design:"#FF6B5B"};

/* =========================================================
   2. DATES (always in Mumbai time, whatever the viewer's clock)
   ========================================================= */
const istDay = d=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(d);
const TODAY = istDay(new Date());                       // "YYYY-MM-DD"
const toUTC = s=>{const [y,m,d]=s.split("-").map(Number);return Date.UTC(y,m-1,d)};
const dayDiff = (a,b)=>Math.round((toUTC(a)-toUTC(b))/864e5);
const plusDays = (s,n)=>new Date(toUTC(s)+n*864e5).toISOString().slice(0,10);
const dowOf = s=>new Date(toUTC(s)).getUTCDay();
const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDay = s=>{const d=new Date(toUTC(s));return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`};
const rel = s=>{const n=dayDiff(s,TODAY);return n===0?"Today":n===1?"Tomorrow":fmtDay(s)};
const t12 = s=>{if(!s)return "";let [h,m]=s.split(":").map(Number);const ap=h>=12?"pm":"am";h=h%12||12;return m?`${h}:${String(m).padStart(2,"0")} ${ap}`:`${h} ${ap}`};

function buildEvent(e){
  const day=e.start.slice(0,10), time=e.start.length>10?e.start.slice(11,16):null;
  const at=Date.parse(`${day}T${time||"12:00"}:00+05:30`);
  const lastDay=e.endDate||day;
  return {...e,day,time,at,lastDay,expired:dayDiff(lastDay,TODAY)<0,status:e.status||"Published",verified:e.verified||"Checked on source page"};
}
let EVENTS = EVENTS_RAW.map(buildEvent);
let QUEUE = QUEUE_RAW.slice();
const LIVE = ()=>EVENTS.filter(e=>!e.expired);
const whenText = e=>e.time?`${t12(e.time)}${e.end?` – ${t12(e.end)}`:" onwards"}`:(e.timeNote||"Time on the event page");
const fmtRefreshed = ()=>{const d=new Date(REFRESHED);return new Intl.DateTimeFormat("en-IN",{day:"numeric",month:"short",hour:"numeric",minute:"2-digit",timeZone:"Asia/Kolkata"}).format(d)+" IST"};

/* =========================================================
   3. STATE + HELPERS
   ========================================================= */
const state = {view:"home",f:{when:"all",area:"all",cat:"all",fmt:"all",cost:"all",aud:"all",q:""},sort:"date",understood:[],demoCat:"all",demoStatus:"all",submitKind:"event",submitted:null};
let saved = new Set();
try{ saved = new Set(JSON.parse(localStorage.getItem("id-saved")||"[]")); }catch(e){}
const persistSaved=()=>{try{localStorage.setItem("id-saved",JSON.stringify([...saved]))}catch(e){}};
const $ = s=>document.querySelector(s);
const esc = s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const hash = s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;return h};
const priceShort = e=>e.price===0?"Free":e.price==null?"Paid":`₹${e.price.toLocaleString("en-IN")}${e.priceNote&&e.priceNote.includes("to")?"+":""}`;
function toast(msg){const t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}

/* Generated cover art: category colour + pattern + oversized word.
   Real photos replace this once organizers upload images. */
function cover(word,color,seed,opts={}){
  // A glow field: one light source in the category colour, a cooler fill light, a faint grid.
  const h=hash(seed), x=55+h%35, y=55+(h>>5)%35, x2=5+(h>>9)%30, y2=5+(h>>13)%25;
  const c2=["#3D8BFF","#8E7BFF","#FF7B5C","#36D1C4"][(h>>3)%4];
  return `<div class="cover" style="--c:${color};--c2:${c2};--x:${x}%;--y:${y}%;--x2:${x2}%;--y2:${y2}%" aria-hidden="true">
    ${opts.tag?`<span class="cover-tag">${esc(opts.tag)}</span>`:""}
    ${opts.flag?`<span class="cover-flag">${esc(opts.flag)}</span>`:""}
    ${opts.stamp?`<span class="stamp">${esc(opts.stamp)}</span>`:""}
    <span class="cover-word">${esc(word)}</span></div>`;
}
const saveBtn = id=>`<button class="save" data-save="${id}" aria-pressed="${saved.has(id)}" aria-label="${saved.has(id)?"Remove from saved":"Save event"}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button>`;
const freshLine = ()=>`<div class="fresh"><span class="live">Updated ${fmtRefreshed()}</span><span>Sources: Luma, Meetup, AllEvents</span><span>Refreshed daily</span></div>`;

/* =========================================================
   4. FILTERING
   ========================================================= */
function weekendRange(){const dow=dowOf(TODAY);const sat=dow===0?plusDays(TODAY,-1):plusDays(TODAY,6-dow);return [sat,plusDays(sat,1)]}
function matchWhen(e,w){
  const a=dayDiff(e.day,TODAY), b=dayDiff(e.lastDay,TODAY);   // event spans a..b days from today
  const within=(lo,hi)=>a<=hi&&b>=lo;
  if(w==="today")return within(0,0);
  if(w==="tomorrow")return within(1,1);
  if(w==="weekend"){const [s,u]=weekendRange();return within(dayDiff(s,TODAY),dayDiff(u,TODAY))}
  if(w==="week")return within(0,6);
  if(w==="next")return within(7,13);
  return true;
}
function filterEvents(f=state.f){
  const q=f.q.trim().toLowerCase();
  let list=LIVE().filter(e=>matchWhen(e,f.when)
    &&(f.area==="all"||e.area===f.area)
    &&(f.cat==="all"||e.cat===f.cat)
    &&(f.fmt==="all"||e.fmt===f.fmt)
    &&(f.cost==="all"||(f.cost==="free"?e.price===0:e.price!==0))
    &&(f.aud==="all"||e.aud.includes(f.aud)||e.aud.includes("Open to All"))
    &&(!q||[e.title,e.org,e.area,e.cat,e.desc,...e.tags].join(" ").toLowerCase().includes(q)));
  if(state.sort==="date")list.sort((a,b)=>a.at-b.at);
  if(state.sort==="free")list.sort((a,b)=>(a.price??1e9)-(b.price??1e9)||a.at-b.at);
  return list;
}
const AREAS=()=>[...new Set(EVENTS.map(e=>e.area))].sort();
const CATS=()=>[...new Set(EVENTS.map(e=>e.cat))].sort();

/* Sentence -> filters. In the full build Gemini does this step and
   returns the same shape; here simple keyword rules stand in for it. */
function parseSentence(text){
  const t=" "+text.toLowerCase()+" ", f={when:"all",area:"all",cat:"all",fmt:"all",cost:"all",aud:"all",q:""}, got=[];
  const has=(...w)=>w.some(x=>t.includes(x));
  if(has(" free "))          {f.cost="free";got.push("Free")}
  if(has("today","tonight")) {f.when="today";got.push("Today")}
  else if(has("tomorrow"))   {f.when="tomorrow";got.push("Tomorrow")}
  else if(has("weekend"))    {f.when="weekend";got.push("This weekend")}
  else if(has("next week"))  {f.when="next";got.push("Next week")}
  else if(has("this week"))  {f.when="week";got.push("Next 7 days")}
  const cats=[["AI",[" ai ","agent","machine learning"," ml ","llm"]],["XR",[" xr "," vr "," ar ","webxr","immersive"]],["UX",[" ux ","usability"]],["Design",["design","figma"]],["Startup",["startup","founder","legal"]],["Tech",["hack","drone","robot","hardware","code","coding","javascript"," js ","security","cyber"]],["Art",[" art","exhibition"]],["Climate",["climate","clean","beach","volunteer","mangrove"]],["Culture",["culture","film","philosophy"]]];
  for(const [c,words] of cats){ if(words.some(w=>t.includes(w))){f.cat=c;got.push(c);break} }
  for(const a of AREAS()){ const key=a.toLowerCase().replace(/ (east|west)$/,""); if(key!=="mumbai"&&t.includes(key)){f.area=a;got.push(a);break} }
  if(has("online")){f.fmt="Online";got.push("Online")}
  for(const [a,w] of [["Student","student"],["Developer","developer"],["Founder","founder"],["Professional","professional"]]) if(t.includes(w)&&!(a==="Founder"&&f.cat==="Startup")){f.aud=a;got.push("For "+a.toLowerCase()+"s");break}
  if(!got.length)f.q=text.trim();
  return {f,got};
}
function runSentence(text){const {f,got}=parseSentence(text);state.f=f;state.understood=got;state.sort="date";go("discover")}

/* =========================================================
   5. VIEWS
   ========================================================= */
/* Card cover as a dot-matrix display: three cells, each value highlighted. */
function matrix(cells,color,seed){
  // cells: [{k,v,cls,span}] ; first row two cells, second row one wide cell
  return `<div class="mx" style="--c:${color};--sx:${20+hash(seed)%60}%" aria-hidden="true">${cells.map(c=>`<div class="mx-cell ${c.span?"wide":""}"><span class="mx-k">${esc(c.k)}</span><span class="mx-v ${c.cls||""}" style="--n:${Math.max(3,String(c.v).replace(/<[^>]+>/g,"").length)}">${c.v}</span>${c.note?`<span class="mx-note">${esc(c.note)}</span>`:""}</div>`).join("")}</div>`;
}
function eventCard(e){
  const running=e.lastDay!==e.day&&dayDiff(e.day,TODAY)<0;
  const day=running?"On now":rel(e.day), time=running?`Until ${fmtDay(e.lastDay)}`:(e.time?t12(e.time):"Time TBA");
  const entry=e.price===0?"Free":priceShort(e);
  const mxHTML=matrix([
    {k:"Category",v:esc(e.cat),cls:"cat"},
    {k:"Entry",v:esc(entry),cls:e.price===0?"free":"paid",note:e.access==="approval"?"Apply to attend":""},
    {k:"When",v:`${esc(day)}<b>${esc(time)}</b>`,cls:"when",span:1}
  ],CAT[e.cat].c,e.id);
  return `<article class="card">
    <button class="cover-link" data-open-event="${e.id}" aria-label="Open ${esc(e.title)}">${mxHTML}</button>
    <div class="card-body">
      <h3><a href="#discover" data-open-event="${e.id}" style="text-decoration:none">${esc(e.title)}</a></h3>
      <div class="meta"><span>${esc(e.area)}</span><span class="sep">/</span><span>${esc(e.org)}</span></div>
      <div class="card-foot">
        <span class="src">via ${esc(e.src)}</span>${saveBtn(e.id)}
      </div>
    </div></article>`;
}
function demoCard(d){
  const mxHTML=matrix([
    {k:"Category",v:esc(d.cat),cls:"cat"},
    {k:"Stage",v:esc(d.status),cls:d.status==="Live"?"free":"paid"},
    {k:"Built with",v:esc(d.tools.join(" · ")),cls:"when small",span:1}
  ],CAT[d.cat].c,d.id);
  const pic=d.gif||d.img;
  const coverHTML=pic?`<div class="demo-gif"><img src="${pic}" alt="${esc(d.name)}: ${esc(d.line)}" loading="lazy" width="400" height="250"><span class="play" aria-hidden="true">${d.url?"▶ Try it":"▶ Watch"}</span></div>`:mxHTML;
  return `<article class="card">
    <button class="cover-link" data-open-demo="${d.id}" aria-label="Open ${esc(d.name)}">${coverHTML}</button>
    <div class="card-body">
      <h3><a href="#invent" data-open-demo="${d.id}" style="text-decoration:none">${esc(d.name)}</a></h3>
      <p style="margin:0;color:var(--ink2);font-size:14px">${esc(d.line)}</p>
      <div class="card-foot"><span class="src">${esc(d.makers.join(", "))}</span>${d.inst==="Example"?'<span class="tag sample">Example</span>':'<span class="tag new">New</span>'}</div>
    </div></article>`;
}
function articleRow(a){
  const d=new Date(a.date);
  return `<a class="rowitem" href="${a.url}" target="_blank" rel="noopener">
    ${cover(a.tag,ART_CAT[a.tag]||"#C7A36F",a.url,{})}
    <div><div class="label">${esc(a.tag)} · ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}</div><h3>${esc(a.title)}</h3></div>
    <span class="arrow">Read on the blog ↗</span></a>`;
}
function commCard(c){
  const col=CAT[c.cats[0]].c;
  const next=LIVE().filter(e=>e.org===c.org).sort((a,b)=>a.at-b.at)[0];
  return `<article class="comm" style="--c:${col}">
    <div class="comm-top"><div><h3>${esc(c.name)}</h3><div class="label">${esc(c.area)}</div></div></div>
    <p>${esc(c.focus)}</p>
    <dl class="kv"><dt>Topics</dt><dd>${c.cats.map(esc).join(", ")}</dd>
    ${next?`<dt>Next</dt><dd><a href="#discover" data-open-event="${next.id}">${esc(next.title)}</a> · ${rel(next.day)}</dd>`:""}</dl>
    <div style="margin-top:auto"><a class="btn ghost small" href="${c.url}" target="_blank" rel="noopener">Visit their page ↗</a></div>
  </article>`;
}

let boardOpen=false;
function boardHTML(){
  const now=Date.now();
  const rows=LIVE().filter(e=>e.time?e.at>now:dayDiff(e.day,TODAY)>=0).sort((a,b)=>a.at-b.at).slice(0,7);
  const first=rows[0];
  return `<div class="board ${boardOpen?"open":""}" role="region" aria-label="Next events in Mumbai">
    <button class="board-toggle" id="boardToggle" aria-expanded="${boardOpen}" aria-controls="boardRows">
      <span class="bt-top"><b>MUMBAI · NEXT UP</b><span id="clock" class="num"></span></span>
      <span class="bt-next">${first?`<span class="t num">${first.time||"TBA"}</span><span class="day">${DOW[dowOf(first.day)].toUpperCase()}</span><span class="ev">${esc(first.title)}</span>`:`<span class="ev">No upcoming events</span>`}
        <span class="bt-more">${rows.length>1?`+${rows.length-1} more`:""}<svg class="chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></span></span>
    </button>
    <div class="board-rows" id="boardRows"><div class="board-inner">
    ${rows.map((e,i)=>`<button class="board-row" data-open-event="${e.id}" style="--i:${i}" tabindex="${boardOpen?0:-1}">
      <span class="t num">${e.time||"TBA"}</span><span class="day">${DOW[dowOf(e.day)].toUpperCase()}</span><span class="ev">${esc(e.title)}</span><span class="area">${esc(e.area)}</span></button>`).join("")}
    <div class="board-foot">Updated ${fmtRefreshed()} · tap a row</div></div></div></div>`;
}
function toggleBoard(){
  boardOpen=!boardOpen;
  const bd=document.querySelector(".board");if(!bd)return;
  bd.classList.toggle("open",boardOpen);
  $("#boardToggle").setAttribute("aria-expanded",boardOpen);
  bd.querySelectorAll(".board-row").forEach(r=>r.tabIndex=boardOpen?0:-1);
}
function sealinkSVG(){
  // Bandra–Worli Sea Link, drawn from numbers: two towers with fanned cables.
  const W=1200,deck=150,towers=[[470,24],[790,40]];let p="";
  for(const [x,top] of towers){
    p+=`<path d="M${x-7} ${deck+22}L${x-3} ${top}L${x+3} ${top}L${x+7} ${deck+22}" fill="none" stroke="currentColor" stroke-width="2"/>`;
    for(let i=1;i<=11;i++){const y=top+6+i*3.2,off=i*26;p+=`<path d="M${x} ${y}L${x-off} ${deck}M${x} ${y}L${x+off} ${deck}" stroke="currentColor" stroke-width=".8" opacity=".75"/>`}
  }
  p+=`<path d="M0 ${deck}H${W}" stroke="currentColor" stroke-width="2.5"/>`;
  for(let x=40;x<W;x+=64)p+=`<path d="M${x} ${deck}V${deck+22}" stroke="currentColor" stroke-width="1.5" opacity=".6"/>`;
  for(let i=0;i<3;i++)p+=`<path d="M0 ${deck+30+i*8}H${W}" stroke="currentColor" stroke-width="1" stroke-dasharray="${14+i*6} ${10+i*4}" opacity="${.35-i*.08}"/>`;
  return `<svg class="sealink" viewBox="0 0 ${W} 200" role="img" aria-label="Line drawing of the Bandra–Worli Sea Link">${p}</svg>`;
}

/* ---------- From X: AI & Tech ----------
   signals.json is refreshed once a day. Each post is summarised in our own words
   and links to the original on X; the detail panel shows X's official embed. */
const SIG = (window.__SIGNALS&&Array.isArray(window.__SIGNALS.SIGNALS)) ? window.__SIGNALS : {REFRESHED:null,SIGNALS:[]};
const SIGNALS = SIG.SIGNALS.filter(p=>p&&p.url&&/^https:\/\/(x|twitter)\.com\//.test(p.url)).sort((a,b)=>Date.parse(b.posted)-Date.parse(a.posted));
const XCOL={AI:"#FFB23F",Models:"#9B7BFF","Open models":"#3DDC97",Research:"#4DA3FF",Tech:"#6FA8FF",India:"#FF7B5C",Policy:"#E3B77A",XR:"#9B7BFF",Design:"#FF6B5B"};
const agoShort = iso=>{const m=Math.max(1,Math.round((Date.now()-Date.parse(iso))/6e4));return m<60?`${m}m`:m<1440?`${Math.round(m/60)}h`:`${Math.round(m/1440)}d`};
const xLogo='<svg class="xlogo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z"/></svg>';
function xCard(p){
  const init=(p.name||p.handle).replace(/[^A-Za-z0-9 ]/g,"").split(" ").filter(Boolean).map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const k=(p.kind||"").toLowerCase();
  return `<button class="xpost" data-open-x="${esc(p.id)}" aria-label="Post by ${esc(p.name)}: ${esc(p.summary)}">
    <span class="xhead"><span class="xav" style="--c:${XCOL[p.topic]||"#6FA8FF"}">${esc(init)}</span><span class="xwho"><b>${esc(p.name)}</b><span>@${esc(p.handle)} · ${agoShort(p.posted)}</span></span>${xLogo}</span>
    <p class="xtext">${esc(p.summary)}</p>
    <span class="xfoot"><span style="display:flex;gap:6px;align-items:center"><span class="xkind ${k}">${esc(p.kind||"Post")}</span><span>${esc(p.topic||"")}</span></span><span>View post ›</span></span>
  </button>`;
}
const xFresh = ()=>SIG.REFRESHED?`<div class="fresh"><span class="live">Updated ${agoShort(SIG.REFRESHED)} ago</span><span>Summaries in our words, linked to the original posts</span><span>Refreshed daily</span></div>`:"";
function xSection(limit){
  if(!SIGNALS.length)return "";
  return `<section class="block"><div class="wrap">
    <div class="sec-head"><div><h2 class="sec-title">From X: AI &amp; Tech</h2><p class="sec-sub">What labs, builders and reporters are posting about right now.</p><div style="margin-top:10px">${xFresh()}</div></div>${limit?`<a class="more" href="#insights" data-go="insights">All posts</a>`:""}</div>
    <div class="xgrid">${SIGNALS.slice(0,limit||SIGNALS.length).map(xCard).join("")}</div>
  </div></section>`;
}
function xSheet(id){
  const p=SIGNALS.find(x=>x.id===id);if(!p)return;
  const tweetUrl=p.url.replace("://x.com/","://twitter.com/");
  openSheet(`<div class="sheet-body" style="padding-top:60px">
    <div class="xhead">${xCard(p).match(/<span class="xav"[\s\S]*?<\/span><\/span>/)[0]}</div>
    <h2 style="font-size:22px;line-height:1.35;letter-spacing:-.02em">${esc(p.summary)}</h2>
    <div class="note">Our summary. The original post is below${p.kind==="Leak"?"; this is an unconfirmed report":""}.</div>
    <div class="xembed" id="xembed"><blockquote class="twitter-tweet" data-theme="dark" data-dnt="true"><a href="${esc(tweetUrl)}">Loading the post from X…</a></blockquote></div>
    <a class="btn taxi" href="${esc(p.url)}" target="_blank" rel="noopener">Open on X ↗</a>
  </div>`,`Post by ${p.name}`);
  // X's official embed script turns the blockquote into the real post
  if(window.twttr&&twttr.widgets){twttr.widgets.load(document.getElementById("xembed"))}
  else if(!document.getElementById("twjs")){const s=document.createElement("script");s.id="twjs";s.async=true;s.src="https://platform.twitter.com/widgets.js";document.body.appendChild(s)}
}

let insightsOpen=false;
let themesOpen=false; // trend themes start folded
document.addEventListener("toggle",e=>{if(e.target.id==="foldThemes")themesOpen=e.target.open},true);
let bayOpen=false; // Bay Area posts start folded; remembered while you move around the site
document.addEventListener("toggle",e=>{if(e.target.id==="foldBayArea")bayOpen=e.target.open},true);
document.addEventListener("toggle",e=>{if(e.target.id==="foldInsights")insightsOpen=e.target.open},true);
function viewHome(){
  const upcoming=LIVE().sort((a,b)=>a.at-b.at);
  const [ws,we]=weekendRange();
  const weekend=upcoming.filter(e=>matchWhen(e,"weekend"));
  const free=upcoming.filter(e=>e.price===0);
  const students=upcoming.filter(e=>e.aud.includes("Student"));
  return `
  <section class="hero"><canvas id="necklace" aria-hidden="true"></canvas><span class="photo-credit">Bandra–Worli Sea Link</span><div class="wrap">
    <div class="hero-grid">
      <div>
        <div class="kicker"><span class="pill">Mumbai · ${TOD_LABEL[PHASE]}</span></div>
        <h1 class="mega hero-title" aria-label="Invent and Discover"><span class="amp-bg" aria-hidden="true">+</span><span>Invent</span><span class="d">Discover</span></h1>
        <p class="hero-copy">See what people in this city are building, and find the meetups, workshops and communities where you can join them.</p>
        <form class="hero-search" data-sentence>
          <label for="heroQ" style="position:absolute;left:-9999px">Search in plain words</label>
          <input id="heroQ" placeholder="Try “free AI events this weekend”" autocomplete="off">
          <button class="btn" type="submit">Search</button>
        </form>
        <div class="examples">${["free AI events this weekend","hackathons for students","events in Andheri","climate volunteering"].map(x=>`<button class="chip" data-example="${x}">${x}</button>`).join("")}</div>
      </div>
      ${boardHTML()}
    </div>
  </div></section>

  <section class="block" style="padding-top:28px"><div class="wrap split">
    <a class="door inv has-img" href="#invent" data-go="invent"><img class="door-img" src="${img("skyline")}" alt="" loading="lazy" style="object-position:70% 50%"><div><h3>Invent</h3><p>Product demos by students, makers and young startups. Opening with its first real demos: the examples show the format, and yours could be first.</p></div><span class="go">Add the first demo →</span></a>
    <a class="door dis has-img" href="#discover" data-go="discover"><img class="door-img" src="${img("train")}" alt="" loading="lazy"><div><h3>Discover</h3><p>Events and people around the city, sorted by what you care about and when you're free.</p></div><span class="go">${upcoming.length} upcoming events →</span></a>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="sec-head"><div><h2 class="sec-title">This weekend</h2><p class="sec-sub">${fmtDay(dayDiff(ws,TODAY)<0?TODAY:ws)} to ${fmtDay(we)}</p></div><a class="more" href="#discover" data-when="weekend">All weekend events</a></div>
    ${weekend.length?`<div class="grid">${weekend.slice(0,4).map(eventCard).join("")}</div>`:`<div class="empty">Nothing listed for this weekend yet. <a href="#discover" data-go="discover">See what's coming up</a>.</div>`}
  </div></section>

  ${xSection(3)}

  <section class="block"><div class="wrap">
    <div class="sec-head"><div><h2 class="sec-title">For students</h2><p class="sec-sub">Hackathons, workshops and meetups open to students.</p></div><a class="more" href="#discover" data-aud="Student">All student events</a></div>
    <div class="grid">${students.slice(0,4).map(eventCard).join("")}</div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="sec-head"><div><h2 class="sec-title">Free to attend</h2></div><a class="more" href="#discover" data-cost="free">All free events</a></div>
    <div class="grid">${free.slice(0,4).map(eventCard).join("")}</div>
  </div></section>

  <section class="block"><div class="wrap">
    <div class="sec-head"><div><h2 class="sec-title">Communities running these</h2></div><a class="more" href="#communities" data-go="communities">All communities</a></div>
    <div class="grid">${COMMUNITIES.slice(0,3).map(commCard).join("")}</div>
  </div></section>

  <section class="block"><div class="wrap">
    <details class="fold" id="foldInsights" ${insightsOpen?"open":""}>
      <summary class="fold-head" aria-label="Latest insights: show or hide"><h2 class="sec-title">Latest insights</h2><span class="fold-btn" aria-hidden="true"><svg viewBox="0 0 12 8"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span></summary>
      <div class="fold-body"><p class="sec-sub" style="margin:0 0 18px">From the Invent &amp; Discover archive.</p><div class="rowlist">${ARTICLES.slice(0,3).map(articleRow).join("")}</div>
        <p style="margin:18px 0 0"><a class="more" href="#insights" data-go="insights">All insights</a></p></div>
    </details>
  </div></section>

  <section class="block"><div class="wrap">${digestHTML()}</div></section>`;
}
function digestHTML(){
  return `<div class="digest"><div><h2>What's worth discovering this week?</h2><p>One email every Thursday: a short list of events, demos and communities in Mumbai.</p></div>
    <form data-digest><label for="digestEmail" style="position:absolute;left:-9999px">Email address</label><input id="digestEmail" type="email" required placeholder="you@college.edu"><button class="btn" type="submit">Subscribe</button></form></div>`;
}

function viewDiscover(){
  const f=state.f, list=filterEvents();
  const opt=(v,cur,label)=>`<option value="${v}" ${v===cur?"selected":""}>${label??v}</option>`;
  return `
  <div class="page-head has-img"><img class="ph-img" src="${img("train")}" alt=""><div class="wrap head-row">
    <div><div class="kicker"><span class="pill">Discover</span></div><h1 class="mega">Discover</h1><p>Upcoming events around Mumbai, each checked on its source page. You register on the organiser's own page.</p><div style="margin-top:14px">${freshLine()}</div></div>
  </div></div>
  <div class="filters"><div class="wrap">
    <div class="frow">
      <form class="search-in" data-sentence role="search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <label for="dq" style="position:absolute;left:-9999px">Search events</label><input id="dq" value="${esc(f.q)}" placeholder="Type a sentence, e.g. “free AI events this weekend”" autocomplete="off"></form>
      ${[["today","Today"],["tomorrow","Tomorrow"],["weekend","This weekend"],["week","Next 7 days"],["next","Next week"],["all","Any time"]].map(([v,l])=>`<button class="chip" data-when="${v}" aria-pressed="${f.when===v}">${l}</button>`).join("")}
    </div>
    <div class="frow">
      <label for="fCat" style="position:absolute;left:-9999px">Category</label><select class="sel" id="fCat" data-f="cat">${opt("all",f.cat,"All categories")}${CATS().map(c=>opt(c,f.cat)).join("")}</select>
      <label for="fArea" style="position:absolute;left:-9999px">Area</label><select class="sel" id="fArea" data-f="area">${opt("all",f.area,"All of MMR")}${AREAS().map(a=>opt(a,f.area)).join("")}</select>
      <label for="fCost" style="position:absolute;left:-9999px">Cost</label><select class="sel" id="fCost" data-f="cost">${opt("all",f.cost,"Free or paid")}${opt("free",f.cost,"Free")}${opt("paid",f.cost,"Paid")}</select>
      <label for="fAud" style="position:absolute;left:-9999px">Audience</label><select class="sel" id="fAud" data-f="aud">${opt("all",f.aud,"For anyone")}${["Student","Developer","Founder","Professional"].map(x=>opt(x,f.aud,"For "+x.toLowerCase()+"s")).join("")}</select>
    </div>
    ${state.understood.length?`<div class="understood"><span>Understood as</span>${state.understood.map(u=>`<span class="tag">${esc(u)}</span>`).join("")}<button class="chip" data-clear>Clear</button></div>`:""}
  </div></div>
  <div class="wrap">
    <div class="results-bar"><span><b class="num">${list.length}</b> ${list.length===1?"event":"events"}</span>
      <span style="display:flex;gap:8px;align-items:center"><label for="sortSel" class="label">Sort</label><select class="sel" id="sortSel" data-sort>${opt("date",state.sort,"Soonest first")}${opt("free",state.sort,"Free first")}</select></span></div>
    ${list.length?`<div class="grid">${list.map(eventCard).join("")}</div>`:`<div class="empty"><p style="margin:0 0 12px"><b>No events match these filters.</b> Try a wider date range or another area.</p><button class="btn ghost" data-clear>Clear filters</button></div>`}
    <div class="banner"><span aria-hidden="true">↻</span><span><b>${QUEUE.length} more events are waiting for a date.</b> Some Luma pages don't show their date publicly, so they stay off this list until a curator confirms it. Know of an event we're missing? <a href="#submit" data-go="submit">Submit it</a>.</span></div>
    ${communitiesBlock()}
  </div>`;
}

function viewInvent(){
  const inv=DEMOS.filter(d=>d.kind!=="tutorial");
  const cats=["all",...new Set(inv.map(d=>d.cat))];
  const list=inv.filter(d=>(state.demoCat==="all"||d.cat===state.demoCat)&&(state.demoStatus==="all"||d.status===state.demoStatus));
  return `
  <div class="page-head has-img"><img class="ph-img" src="${img("skyline")}" alt="" style="object-position:70% 55%"><div class="wrap head-row">
    <div><div class="kicker"><span class="pill">Invent</span></div><h1 class="mega">Invent</h1><p>A gallery of things people in Mumbai are building: student projects, prototypes and early products. Every demo links to something you can try or watch.</p></div>
    <a class="btn taxi" href="#submit" data-go="submit" data-kind="demo">+ Add your demo</a>
  </div></div>
  <div class="wrap">
    <div class="banner"><span aria-hidden="true">✦</span><span><b>The first real demos are up: Tufani Samundar and Market Walkthrough.</b> The origami tutorials now live in <a href="#learn" data-go="learn">Learn</a>. Cards marked "Example" only show the format. Submit yours and it replaces one of them once a curator checks the link works.</span></div>
    <div class="results-bar">
      <div class="frow">${cats.map(c=>`<button class="chip" data-dcat="${c}" aria-pressed="${state.demoCat===c}">${c==="all"?"All":c}</button>`).join("")}</div>
      <div class="seg" role="group" aria-label="Stage">${["all","Concept","Prototype","Live"].map(s=>`<button data-dstatus="${s}" aria-pressed="${state.demoStatus===s}">${s==="all"?"Any stage":s}</button>`).join("")}</div>
    </div>
    ${list.length?`<div class="grid">${list.map(demoCard).join("")}</div>`:`<div class="empty">No demos at this stage yet.</div>`}
    <section class="block"><div class="sec-head"><div><h2 class="sec-title">How a demo gets here</h2><p class="sec-sub">Makers submit a demo with a link or video. A curator checks it works, then it's published. Stages tell visitors what to expect.</p></div></div>
      <div class="pipe">${[["Concept","An idea with sketches or a pitch video."],["Prototype","Something you can try, with rough edges."],["Live","In use by real people."]].map(([a,b])=>`<div class="step"><b>${a}</b><span style="color:var(--ink2)">${b}</span></div>`).join("")}</div>
    </section>
  </div>`;
}


/* ---------- AI trends (Insights page) ----------
   trends.json is refreshed once a week by the GitHub workflow (tools/update_trends.py),
   using arXiv's free search. No Claude credits are used. If it fails to load, the
   section is skipped. */
const TR = window.__TRENDS;
const fmtN = n => n.toLocaleString("en-IN");
const wkLabel = iso => { const d=new Date(iso+"T00:00:00"); return d.getDate()+" "+MON[d.getMonth()]; };
function trSpark(vals,weeks,t){
  const W=160,H=40,p=4, lo=Math.min(...vals), hi=Math.max(...vals), mid=(lo+hi)/2, rng=Math.max(hi-lo,2);
  const x=i=>p+i*(W-2*p)/(vals.length-1), y=v=>H/2-(v-mid)/rng*(H-2*p);
  const d=vals.map((v,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(v).toFixed(1)).join(" ");
  const n=vals.length-1;
  return `<svg class="tr-spark" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">
    <path d="${d} L${x(n).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z" class="tr-spark-area"/><path d="${d}" class="tr-spark-line"/>
    ${vals.map((v,i)=>`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${i===n?3:0}" class="tr-spark-end"/>`).join("")}
  </svg>`;
}
function trTotals(weeks){
  const W=480,H=140,pl=8,pr=8,pt=16,pb=22, n=weeks.length, max=Math.max(...weeks.map(w=>w.total))*1.15;
  const x=i=>pl+i*(W-pl-pr)/(n-1), y=v=>pt+(H-pt-pb)*(1-v/max);
  const line=weeks.map((w,i)=>(i?"L":"M")+x(i).toFixed(1)+" "+y(w.total).toFixed(1)).join(" ");
  const grid=[.25,.5,.75,1].map(f=>`<line x1="${pl}" x2="${W-pr}" y1="${y(max*f/1.15)}" y2="${y(max*f/1.15)}" class="tg-grid"/>`).join("");
  return `<svg class="tr-total" viewBox="0 0 ${W} ${H}" role="img" aria-label="New AI papers per week: ${weeks.map(w=>wkLabel(w.start)+" "+w.total).join(", ")}">
    <defs><linearGradient id="trFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--amber);stop-opacity:.32"/><stop offset="1" style="stop-color:var(--amber);stop-opacity:0"/></linearGradient></defs>
    ${grid}<path d="${line} L${x(n-1).toFixed(1)} ${y(0)} L${x(0).toFixed(1)} ${y(0)} Z" fill="url(#trFill)"/><path d="${line}" class="tg-line"/>
    ${weeks.map((w,i)=>`<g class="tg-pt" tabindex="0" data-tip="Week of ${wkLabel(w.start)}: ${fmtN(w.total)} new AI papers">
      <rect x="${(x(i)-(W-pl-pr)/(n-1)/2).toFixed(1)}" y="0" width="${((W-pl-pr)/(n-1)).toFixed(1)}" height="${H-pb}" fill="transparent"/>
      <circle cx="${x(i).toFixed(1)}" cy="${y(w.total).toFixed(1)}" r="${i===n-1?5:3}" class="tg-dot${i===n-1?" end":""}"/>
      ${i%3===(n-1)%3?`<text x="${x(i).toFixed(1)}" y="${H-5}" class="tg-ax" text-anchor="${i===0?"start":i===n-1?"end":"middle"}">${wkLabel(w.start)}</text>`:""}</g>`).join("")}
  </svg>`;
}
function trendsSection(){
  if(!TR||!Array.isArray(TR.THEMES)) return "";
  const W=Array.isArray(TR.WEEKS)?TR.WEEKS.filter(w=>w&&w.total>0&&w.themes):[];
  const head=`<div class="sec-head"><div><h2 class="sec-title" id="trendsTitle">How AI is shaping up</h2>
      <p class="sec-sub">Where AI is heading, week by week, based on the new research papers posted each week. Updated every Monday.</p>
      <div class="tr-src label">Source · <a href="${esc(TR.SOURCE.url)}" target="_blank" rel="noopener">${esc(TR.SOURCE.name)}</a>${W.length?` · last ${W.length} weeks, to ${wkLabel(W[W.length-1].end)}`:""}</div></div></div>`;
  if(W.length<4) return `<div class="wrap"><section class="block trends" aria-labelledby="trendsTitle">${head}
    <div class="tr-panel tr-empty"><p>The first weekly numbers are on their way. They appear here after the next weekly update.</p></div></section></div>`;
  const last=W[W.length-1], prev=W.slice(-5,-1), base=W[W.length-5];
  const avg=prev.reduce((a,w)=>a+w.total,0)/prev.length, dTot=(last.total-avg)/avg*100;
  const share=(w,id)=>w.themes[id]/w.total*100;
  const rows=TR.THEMES.map(t=>{const vals=W.map(w=>share(w,t.id)), now=vals[vals.length-1], then=share(base,t.id);return {t,vals,now,chg:now-then,n:last.themes[t.id]}});
  const riser=rows.reduce((a,r)=>r.chg>a.chg?r:a,rows[0]);
  const chip=c=>{const up=c>=0.05,down=c<=-0.05;return `<span class="tr-chg ${up?"up":down?"down":"flat"}">${up?"▲":down?"▼":"●"} ${Math.abs(c).toFixed(1)} pts</span>`};
  return `<div class="wrap"><section class="block trends" aria-labelledby="trendsTitle">${head}
    <div class="tr-panel">
      <div class="tr-top">
        <div class="tr-hero">
          <div class="label">New AI papers last week</div>
          <div class="tr-big num">${fmtN(last.total)}</div>
          <div class="tr-sub label">${dTot>=0?"▲":"▼"} ${Math.abs(dTot).toFixed(0)}% vs the 4 weeks before</div>
          <p class="tr-note">Week of ${wkLabel(last.start)} to ${wkLabel(last.end)}. Hover the chart for each week.</p>
        </div>
        <div class="tr-chart">${trTotals(W)}</div>
      </div>
      <details class="fold tr-fold" id="foldThemes" ${themesOpen?"open":""}>
      <summary class="fold-head tr-fold-head" aria-label="Themes to watch: show or hide"><div><h3 class="tr-fold-title">Themes to watch</h3><p class="tr-fold-sub">${TR.THEMES.length} themes${riser.chg>0?` · Rising fastest: <b>${esc(riser.t.label)}</b>`:""}</p></div><span class="fold-btn" aria-hidden="true"><svg viewBox="0 0 12 8"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span></summary>
      <div class="fold-body tr-rows">
        <div class="tr-row tr-rhead label"><span>Theme</span><span>Last ${W.length} weeks</span><span>Share of papers</span><span>vs 4 weeks ago</span></div>
        ${rows.map(r=>`<div class="tr-row${r===riser&&r.chg>0?" rising":""}" tabindex="0" data-tip="${esc(r.t.label)}: ${r.now.toFixed(1)}% of last week's papers (${fmtN(r.n)})">
          <span class="tr-theme"><b>${esc(r.t.label)}</b>${r===riser&&r.chg>0?`<i class="tr-flag">Rising fastest</i>`:""}<small>${esc(r.t.hint)}</small></span>
          ${trSpark(r.vals,W,r.t)}
          <span class="tr-now num">${r.now.toFixed(1)}%</span>
          ${chip(r.chg)}</div>`).join("")}
      </div>
      </details>
      <p class="tr-method">${esc(TR.METHOD||"")}</p>
    </div>
    <div class="tr-tip" id="trTip" role="status" hidden></div>
  </section></div>`;
}
// One shared tooltip for every chart mark (hover or keyboard focus).
(function(){
  const show=e=>{const t=e.target.closest&&e.target.closest("[data-tip]"),tip=document.getElementById("trTip");if(!tip)return;
    if(!t){tip.hidden=true;return}
    tip.textContent=t.getAttribute("data-tip");tip.hidden=false;
    const r=t.getBoundingClientRect();tip.style.left=Math.min(window.innerWidth-tip.offsetWidth-12,Math.max(12,r.left+r.width/2-tip.offsetWidth/2))+"px";tip.style.top=Math.max(8,r.top-tip.offsetHeight-8)+"px";};
  document.addEventListener("pointerover",show);document.addEventListener("focusin",show);
  document.addEventListener("scroll",()=>{const tip=document.getElementById("trTip");if(tip)tip.hidden=true},{passive:true});
})();

function viewInsights(){
  return `
  <div class="page-head has-img"><img class="ph-img" src="${img("marine")}" alt="" style="object-position:50% 30%"><div class="wrap head-row">
    <div><div class="kicker"><span class="pill">Insights</span></div><h1 class="mega">Insights</h1><p>Essays, visit notes and event recaps from the Invent &amp; Discover blog.</p></div>
  </div></div>
  ${trendsSection()}
  ${xSection(0)}
  <div class="wrap">
    <section class="block">
      <details class="fold" id="foldBayArea" ${bayOpen?"open":""}>
        <summary class="fold-head" aria-label="Bay Area immersion, 2025: show or hide the ${ARTICLES.length} posts"><div><h2 class="sec-title">Bay Area immersion, 2025</h2><p class="sec-sub" style="margin:10px 0 0">Notes from university visits on AI, XR and design education · ${ARTICLES.length} posts</p></div><span class="fold-btn" aria-hidden="true"><svg viewBox="0 0 12 8"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg></span></summary>
        <div class="fold-body"><div class="rowlist">${ARTICLES.map(articleRow).join("")}</div></div>
      </details>
    </section>
  </div>`;
}

function viewLearn(){
  const list=DEMOS.filter(d=>d.kind==="tutorial");
  return `
  <div class="page-head has-img"><img class="ph-img" src="${img("marine")}" alt="" style="object-position:50% 70%"><div class="wrap head-row">
    <div><div class="kicker"><span class="pill">Learn</span></div><h1 class="mega">Learn</h1><p>Short tutorials you can follow at your own pace, one step at a time. Each one plays here, and you can download it to watch offline.</p></div>
  </div></div>
  <div class="wrap" style="padding-top:28px">
    <section class="block" style="padding-top:0"><div class="sec-head"><div><h2 class="sec-title">Origami</h2><p class="sec-sub">One square sheet of paper, no glue, a few minutes each.</p></div></div>
      <div class="grid">${list.map(demoCard).join("")}</div>
    </section>
    <div class="banner"><span aria-hidden="true">✦</span><span><b>More tutorials are on the way,</b> starting with music. Have a tutorial to share? <a href="mailto:hello@inventndiscover.com">Write to us</a>.</span></div>
  </div>`;
}

/* Tools: hand-made framework tools, each a standalone page under /toolkit/. */
const TOOLS=[
 {id:"scamper",name:"SCAMPER",line:"Seven questions that turn something you already know into new ideas.",url:"/toolkit/scamper/",
  credit:"Bob Eberle (1971), from Alex Osborn's questions in Applied Imagination (1953)",time:"15–30 minutes",letters:["S","C","A","M","P","E","R"]}
];
function viewTools(){
  const col=["#A58BFF","#7B8CFF","#3D9BFF","#2FD1C5","#46D69A","#FFB23F","#FF7B8A"];
  return `
  <div class="page-head has-img"><img class="ph-img" src="${img("skyline")}" alt="" style="object-position:30% 50%"><div class="wrap head-row">
    <div><div class="kicker"><span class="pill">Tools</span></div><h1 class="mega">Tools</h1><p>Free tools for design thinking and idea generation. They work in your browser with nothing to sign up for, and every framework is credited to the people who created it.</p></div>
  </div></div>
  <div class="wrap" style="padding-top:28px">
    ${TOOLS.map(t=>`<a class="tool-card" href="${t.url}">
      <div class="tool-letters" aria-hidden="true">${t.letters.map((l,i)=>`<b style="color:${col[i%col.length]}">${l}</b>`).join("")}</div>
      <div><span class="tag new">New</span><h3>${esc(t.name)}</h3><p>${esc(t.line)}</p>
      <p class="tool-meta"><span class="label">Credit</span> ${esc(t.credit)}<br><span class="label">Time</span> ${esc(t.time)}</p></div>
      <span class="go">Open the tool →</span></a>`).join("")}
    <div class="banner"><span aria-hidden="true">✦</span><span><b>More frameworks are on the way,</b> each credited to the people who created it. Want one sooner? <a href="mailto:hello@inventndiscover.com">Tell us which</a>.</span></div>
  </div>`;
}

function communitiesBlock(){
  return `<section class="block" id="communities"><div class="sec-head"><div><h2 class="sec-title">Communities</h2><p class="sec-sub">Groups behind the events above. Visit their pages to join; their next event shows up here when it's listed.</p></div><a class="btn ghost" href="#submit" data-go="submit" data-kind="community">+ List your community</a></div>
    <div class="grid">${COMMUNITIES.map(commCard).join("")}</div></section>`;
}

function viewSubmit(){
  if(state.submitted){
    const s=state.submitted;
    return `<div class="page-head"><div class="wrap"><h1 class="mega">Thanks</h1></div></div>
    <div class="wrap" style="padding-top:28px"><div class="done">
      <span class="status-pill">Pending review</span>
      <h2 style="font-size:24px;margin:14px 0 6px">“${esc(s.title)}” is with a curator</h2>
      <p style="color:var(--ink2);margin:0 0 16px">Reference <span style="font-family:var(--mono)">${s.ref}</span>. A curator checks the details and the link, usually within two days, and replies to the email you gave if anything is missing.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-again>Submit another</button><a class="btn ghost" href="#discover" data-go="discover">Back to events</a></div>
    </div></div>`;
  }
  const k=state.submitKind, cats=["AI","Design","UX","XR","Startup","Tech","Art","Culture","Climate","Education"];
  const areaList=[...new Set([...AREAS(),"Bandra West","BKC","Colaba","Fort","Navi Mumbai","Online"])].sort();
  const field=(id,label,type="text",opts={})=>`<div class="field ${opts.full?"full":""}"><label for="${id}">${label}${opts.req?' <span style="color:var(--warn)">*</span>':""}</label>
    ${type==="textarea"?`<textarea id="${id}" name="${id}" ${opts.req?"required":""}></textarea>`:type==="select"?`<select id="${id}" name="${id}">${opts.options.map(o=>`<option>${o}</option>`).join("")}</select>`:`<input id="${id}" name="${id}" type="${type}" ${opts.req?"required":""} ${opts.ph?`placeholder="${opts.ph}"`:""}>`}
    ${opts.hint?`<span class="hint">${opts.hint}</span>`:""}</div>`;
  let body="";
  if(k==="event") body=
    field("title","Event title","text",{req:1,full:1})+
    field("desc","Description","textarea",{req:1,full:1,hint:"What will people do or learn? Two or three sentences."})+
    field("date","Date","date",{req:1})+field("start","Start time","time",{req:1})+
    field("venue","Venue","text",{req:1,ph:"Name of the place, or “Online”"})+field("area","Area","select",{options:areaList})+
    field("cat","Category","select",{options:cats})+field("fmt","Format","select",{options:["Offline","Online","Hybrid"]})+
    field("reg","Registration link","url",{req:1,full:1,ph:"https://luma.com/…",hint:"Where people sign up. We send visitors there; we never take registrations ourselves."})+
    field("org","Organiser","text",{req:1})+field("price","Price in ₹","number",{hint:"Leave empty or 0 if free."})+
    `<div class="field full"><span style="font-weight:600;font-size:14px">Who is it for?</span><div class="checks">${["Student","Developer","Founder","Professional","Open to All"].map(a=>`<label><input type="checkbox" name="aud" value="${a}">${a}</label>`).join("")}</div></div>`;
  if(k==="demo") body=
    field("title","Product name","text",{req:1})+field("line","One-line description","text",{req:1})+
    field("desc","What does it do, and for whom?","textarea",{req:1,full:1})+
    field("makers","Makers","text",{req:1,hint:"Names, separated by commas."})+field("inst","College or startup","text")+
    field("cat","Category","select",{options:["AI","XR","UX","Design","Hardware","Games","Civic"]})+field("stage","Stage","select",{options:["Concept","Prototype","Live"]})+
    field("try","Link to try it","url",{ph:"https://…"})+field("video","Demo video link","url",{ph:"YouTube or Vimeo"})+
    field("tools","Tools used","text",{full:1,ph:"Unity, React, ESP32…"});
  if(k==="community") body=
    field("title","Community name","text",{req:1})+field("area","Area","select",{options:areaList})+
    field("desc","Who is it for, and what do you do together?","textarea",{req:1,full:1})+
    field("meets","How often do you meet?","text",{ph:"e.g. First Saturday of the month"})+field("site","Website or social link","url",{ph:"https://…"});
  return `
  <div class="page-head"><div class="wrap head-row"><div><div class="kicker"><span class="pill">Submit</span></div><h1 class="mega">Submit</h1><p>Share an event, a demo or a community. A curator reviews everything before it goes live, usually within two days.</p></div></div></div>
  <div class="wrap" style="padding-top:28px">
    <div class="seg" role="group" aria-label="What are you submitting" style="margin-bottom:24px">${[["event","Event"],["demo","Demo"],["community","Community"]].map(([v,l])=>`<button data-kind="${v}" aria-pressed="${k===v}">${l}</button>`).join("")}</div>
    <form class="form" data-submit novalidate>${body}${field("email","Your email","email",{req:1,ph:"you@example.com",hint:"Only used to reply about this submission."})}
      <input type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">
      <div class="field full" style="flex-direction:row;gap:10px;align-items:center"><button class="btn taxi" type="submit">Send for review</button><span class="hint" id="formErr" role="alert"></span></div>
    </form>
    <p class="hint" style="font-size:12.5px;color:var(--ink3);margin-top:16px">Submissions go to ${FORM_INBOX}. Nothing is published until a curator has checked it.</p>
  </div>`;
}

function viewCurator(){
  const found=RUNS.reduce((s,r)=>s+r.found,0), pub=EVENTS.length, dup=RUNS.reduce((s,r)=>s+r.dup,0);
  return `
  <div class="page-head"><div class="wrap head-row"><div><div class="kicker"><span class="pill">Team only</span><span class="label">Sign-in required in the full build</span></div><h1 class="mega">Curator desk</h1><p>Everything the discovery run finds lands here. Events only reach Discover once their date, place and link are confirmed.</p><div style="margin-top:14px">${freshLine()}</div></div></div></div>
  <div class="wrap">
    <section class="block" style="padding-top:28px">
      <div class="sec-head"><div><h2 class="sec-title">Preview time of day</h2><p class="sec-sub">The site changes its colours and photos with Mumbai time. Pick a mood to check how it looks, then use the menu to visit any page. Visitors always see Auto.</p></div></div>
      <div class="tod-note" role="group" aria-label="Time of day">${[["auto","Auto (Mumbai time)"],["dawn","Dawn"],["day","Day"],["golden","Golden hour"],["night","Night"]].map(([k,l])=>`<button data-tod="${k}" aria-pressed="${todMode===k}">${l}</button>`).join("")}</div>
    </section>
    <section class="block" style="padding-top:28px">
      <div class="stats">
        <div><span class="label">Listings checked</span><b class="num">${found}</b></div>
        <div><span class="label">Published</span><b class="num">${pub}</b></div>
        <div><span class="label">Need a date</span><b class="num">${QUEUE.length}</b></div>
        <div><span class="label">Duplicates merged</span><b class="num">${dup}</b></div>
        <div><span class="label">Live now</span><b class="num">${LIVE().length}</b></div>
      </div>
    </section>

    <section class="block">
      <div class="sec-head"><div><h2 class="sec-title">Review queue</h2><p class="sec-sub">These pages didn't show a readable date. Open the source, enter the date and time, then approve. Confidence shows how sure the extraction was about each field.</p></div></div>
      ${QUEUE.length?QUEUE.map(reviewCard).join(""):`<div class="empty">Queue is clear.</div>`}
    </section>

    <section class="block">
      <div class="sec-head"><div><h2 class="sec-title">How events arrive</h2><p class="sec-sub">A scheduled job runs daily. Visitors never wait for a web search; the site reads from the stored list.</p></div></div>
      <div class="pipe">${[["Sources","Luma, Meetup, AllEvents, the submit form","c","System"],["Discovery","Find candidate event pages","s","Web search"],["Extraction","Read title, date, venue, price into fields; blank if unsure","g","AI"],["Classification","Category, tags, audience","g","AI"],["Duplicates","Same event on two sites?","g","AI + rules"],["Review","Approve, add a date, merge or reject","h","Curator"],["Published","Shown on the site until the event ends","c","System"]].map(([a,b,cls,w])=>`<div class="step"><span class="who ${cls}">${w}</span><b>${a}</b><span style="color:var(--ink2)">${b}</span></div>`).join("")}</div>
    </section>

    <section class="block">
      <div class="sec-head"><div><h2 class="sec-title">Latest discovery run</h2><p class="sec-sub">${fmtRefreshed()}</p></div></div>
      <div class="tbl-wrap"><table><thead><tr><th>Source</th><th>What was checked</th><th>Found</th><th>Published</th><th>Need review</th><th>Duplicates</th><th>Skipped</th><th>Why skipped</th></tr></thead>
      <tbody>${RUNS.map(r=>`<tr><td>${esc(r.src)}</td><td>${esc(r.what)}</td><td class="num">${r.found}</td><td class="num">${r.pub}</td><td class="num">${r.review}</td><td class="num">${r.dup}</td><td class="num">${r.skip}</td><td>${esc(r.note)}</td></tr>`).join("")}</tbody></table></div>
    </section>
  </div>`;
}
function reviewCard(q){
  const confRow=(k,v)=>v==null?`<div class="conf-row"><span class="label">${k}</span><span style="font-size:12px;color:var(--ink3)">Entered by organiser</span><span></span></div>`:`<div class="conf-row"><span class="label">${k}</span><span class="bar"><i class="${v<75?"lo":""}" style="width:${Math.max(v,3)}%"></i></span><span class="num">${v}%</span></div>`;
  const needsDate=!q.day;
  return `<article class="review">
    <div>
      <div class="label">${esc(q.cat)} · ${esc(q.area)} · via ${esc(q.src)}</div>
      <h3>${esc(q.title)}</h3>
      ${q.why?`<p style="margin:8px 0 0;font-size:13px;color:var(--warn)">${esc(q.why)}</p>`:""}
      ${q.url?`<p style="margin:8px 0 0;font-size:13px"><a href="${esc(q.url)}" target="_blank" rel="noopener">Open source page ↗</a></p>`:""}
      ${needsDate?`<div class="pick"><label for="d-${q.qid}">Date<input type="date" id="d-${q.qid}" value="${q.hint||""}"></label><label for="t-${q.qid}">Start<input type="time" id="t-${q.qid}"></label></div>`:`<p style="margin:8px 0 0;font-size:13px">${fmtDay(q.day)}${q.time?", "+t12(q.time):""}</p>`}
      <div class="review-actions">
        <button class="btn small" data-approve="${q.qid}">Approve</button>
        <button class="btn ghost small" data-reject="${q.qid}">Reject</button>
      </div>
    </div>
    <div class="conf"><span class="label">Extraction confidence</span>${confRow("Date",q.conf?.date)}${confRow("Place",q.conf?.place)}${confRow("Category",q.conf?.category)}</div>
  </article>`;
}

/* Event and demo detail sheets */
function openSheet(html,label){
  closeSheet();
  const s=document.createElement("div");s.className="scrim";s.id="scrim";
  s.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(label)}" style="position:relative"><button class="icon-btn close" data-close aria-label="Close">✕</button>${html}</div>`;
  document.body.appendChild(s);document.body.style.overflow="hidden";
  s.querySelector("[data-close]").focus();
}
function closeSheet(){const s=$("#scrim");if(s){s.remove();document.body.style.overflow=""}}
function eventSheet(id){
  const e=EVENTS.find(x=>x.id===id);if(!e)return;
  // Each published event has its own page with a proper link preview; share that page.
  const page=/^[a-z0-9-]+$/.test(e.id)&&EVENTS_RAW.some(x=>x.id===e.id)?`https://inventndiscover.com/events/${e.id}/`:(e.url||"");
  const text=encodeURIComponent(`${e.title} · ${fmtDay(e.day)}${e.time?", "+t12(e.time):""} · ${e.area}\n${page}`);
  const dateLine=e.lastDay!==e.day?`${fmtDay(e.day)} to ${fmtDay(e.lastDay)}`:fmtDay(e.day);
  openSheet(`${cover(e.cat,CAT[e.cat].c,e.id,{tag:e.cat})}
  <div class="sheet-body">
    <div><div class="label">${esc(e.org)}</div><h2>${esc(e.title)}</h2></div>
    <div class="facts">
      <div><span class="label">When</span><b>${dateLine}</b>${esc(whenText(e))}</div>
      <div><span class="label">Where</span><b>${esc(e.area)}</b>${esc(e.venue)}</div>
      <div><span class="label">Entry</span><b>${esc(e.priceNote||priceShort(e))}</b></div>
      <div><span class="label">For</span><b>${esc(e.aud.join(", "))}</b></div>
    </div>
    <p style="margin:0;font-size:16px">${esc(e.desc)}</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap">${e.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
    ${e.url?`<a class="btn taxi" href="${esc(e.url)}" target="_blank" rel="noopener">${e.access==="approval"?"Apply":"Register"} on ${esc(e.src)} ↗</a>`:`<button class="btn taxi" disabled>No registration link yet</button>`}
    <div class="note">Source: ${esc(e.src)}${e.also?` (also listed on ${esc(e.also)})`:""} · ${esc(e.verified)} · updated ${fmtRefreshed()}. Details can change, so confirm on the organiser's page before you go.</div>
    <div><div class="label" style="margin-bottom:8px">Share</div>
      <div class="share"><a class="btn ghost small" href="https://wa.me/?text=${text}" target="_blank" rel="noopener">WhatsApp</a>${e.url?`<a class="btn ghost small" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(page)}" target="_blank" rel="noopener">LinkedIn</a><button class="btn ghost small" data-copy="${esc(page)}">Copy link</button>`:""}${saveBtn(e.id)}</div>
      ${e.url?`<p class="url" style="margin:10px 0 0">${esc(e.url)}</p>`:""}</div>
  </div>`,e.title);
}
function demoSheet(id){
  const d=DEMOS.find(x=>x.id===id);if(!d)return;
  const real=d.inst!=="Example";
  const top=d.video?`<video class="demo-video" src="${d.video}" poster="${d.poster||""}" controls playsinline preload="metadata"></video>`:d.sheetImg?`<img class="demo-video" src="${d.sheetImg}" alt="${esc(d.name)}">`:cover(d.name.split(" ")[0],CAT[d.cat].c,d.id+"x",{tag:d.cat,stamp:d.status});
  openSheet(`${top}
  <div class="sheet-body">
    <div><div class="label">${d.kind==="tutorial"?"Origami tutorial":real?esc(d.cat)+" demo":"Example demo"}</div><h2>${esc(d.name)}</h2><p style="margin:6px 0 0;color:var(--ink2);font-size:17px">${esc(d.line)}</p></div>
    <p style="margin:0;font-size:16px">${esc(d.desc)}</p>
    <div class="facts"><div><span class="label">Stage</span><b>${esc(d.status)}</b></div><div><span class="label">Made by</span><b>${esc(d.makers.join(", "))}</b></div><div style="grid-column:1/-1"><span class="label">Built with</span><b>${esc(d.tools.join(" · "))}</b></div></div>
    ${real?(d.url?`<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn taxi" href="${d.url}" target="_blank" rel="noopener">Open the simulation ↗</a></div>${d.vr?`<div class="note"><b>Experience it in VR.</b> Put on your Meta Quest, open the Meta Quest browser, go to <b style="overflow-wrap:anywhere">${esc(d.vr)}</b> and tap <b>Enter VR</b>.</div>`:""}${d.needs?`<div class="note">${esc(d.needs)}</div>`:""}`:d.video?`<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn ghost" href="${d.video}" download>Download the video</a></div>`:""):`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn taxi" disabled>Try the demo ↗</button><button class="btn ghost" disabled>Watch video</button></div>
    <div class="note"><b>Example.</b> This shows the format of a demo page. Real demos open the maker's live link or video.</div>`}
  </div>`,d.name);
}

/* Hero: the Sea Link photograph drawn on a canvas, with its lamps lit and traffic
   moving along the deck. Deck points are in photo coordinates (0–1), so the lights
   stay on the bridge at any screen size. */
/* Time of day in Mumbai decides the accent colour and which photo grade is shown.
   Dawn 5:00–8:00 · Day 8:00–16:30 · Golden hour 16:30–19:30 · Night 19:30–5:00 */
const TOD_LABEL={dawn:"Dawn",day:"Day",golden:"Golden hour",night:"Night"};
// How lit the city is in each phase: bridge lamps, traffic lights, how much to darken for text
const TOD_LIGHT={dawn:{lamp:.35,car:.5,shade:.84,haze:"255,150,170"},day:{lamp:0,car:.18,shade:.8,haze:"160,200,255"},golden:{lamp:.55,car:.75,shade:.84,haze:"255,150,70"},night:{lamp:1,car:1,shade:.86,haze:"150,120,255"}};
function phaseNow(){
  const [h,m]=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date()).split(":").map(Number);
  const t=h*60+m;
  return t>=300&&t<480?"dawn":t>=480&&t<990?"day":t>=990&&t<1170?"golden":"night";
}
let todMode="auto", PHASE=phaseNow();
const img=n=>PHOTOS[n][PHASE];
const heroPhotos={};for(const ph of ["dawn","day","golden","night"]){const i=new Image();i.src=PHOTOS.sealink[ph];heroPhotos[ph]=i}
function applyPhase(ph,rerender){
  const changed=ph!==PHASE; PHASE=ph;
  document.documentElement.setAttribute("data-tod",ph);
  document.querySelectorAll(".tod-note button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.tod===todMode));
  if(changed&&rerender)render();
}
setInterval(()=>{if(todMode==="auto")applyPhase(phaseNow(),true)},60000);
let neckRAF=0;
const DECK=[[0,.748],[.147,.692],[.294,.648],[.441,.603],[.588,.558],[.706,.518],[.794,.480],[.868,.442],[.919,.410],[.949,.382]];
function deckAt(t){ // point and depth along the deck, t from 0 (near, left) to 1 (far, right)
  const f=t*(DECK.length-1), i=Math.min(DECK.length-2,Math.floor(f)), k=f-i;
  return [DECK[i][0]+(DECK[i+1][0]-DECK[i][0])*k, DECK[i][1]+(DECK[i+1][1]-DECK[i][1])*k];
}
function startNecklace(){
  cancelAnimationFrame(neckRAF);
  const cv=document.getElementById("necklace"); if(!cv)return;
  const heroPhoto=heroPhotos[PHASE], LT=TOD_LIGHT[PHASE];
  if(!heroPhoto.complete){heroPhoto.onload=startNecklace;return}
  const ctx=cv.getContext("2d"), reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W=0,H=0,s=1,dx=0,dy=0,mx=0,my=0,tx=0,ty=0;
  const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
  const lamps=[...Array(46)].map((_,i)=>({t:i/45,ph:rnd(i)*6.28}));
  const cars=[...Array(18)].map((_,i)=>({t:rnd(i+40),dir:i%2?1:-1,v:.018+rnd(i+80)*.02}));
  function layout(){
    const r=cv.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
    const iw=heroPhoto.width,ih=heroPhoto.height; s=Math.max(W/iw,H/ih)*1.04;
    const fx=W<700?.78:.62; dx=(W-iw*s)*fx; dy=(H-ih*s)*.55;
  }
  const P=(u,v)=>[dx+u*heroPhoto.width*s+tx*-12, dy+v*heroPhoto.height*s+ty*-6];
  let last=0;
  function frame(ts){
    const time=(ts||0)/1000, dt=Math.min(.05,time-last); last=time;
    tx+=(mx-tx)*.05;ty+=(my-ty)*.05;
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(heroPhoto,dx+tx*-12,dy+ty*-6,heroPhoto.width*s,heroPhoto.height*s);
    // warm city haze behind the skyline
    let g=ctx.createRadialGradient(W*.55,H*.42,0,W*.55,H*.42,W*.6);
    g.addColorStop(0,`rgba(${LT.haze},.14)`);g.addColorStop(1,`rgba(${LT.haze},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.save();ctx.globalCompositeOperation="lighter";
    // lamps along the deck, smaller as the bridge recedes
    if(LT.lamp>0)for(const L of lamps){
      const [u,v]=deckAt(L.t), [x,y]=P(u,v-.012), depth=1-L.t*.7;
      const tw=(reduce?1:.8+.2*Math.sin(time*2.2+L.ph))*LT.lamp, r=(2.2*depth+.6)*tw*Math.max(.7,s*1.2);
      const gl=ctx.createRadialGradient(x,y,0,x,y,r*6);
      gl.addColorStop(0,"rgba(255,220,150,.95)");gl.addColorStop(.3,"rgba(255,170,70,.35)");gl.addColorStop(1,"rgba(255,140,40,0)");
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x,y,r*6,0,6.283);ctx.fill();
      // reflection in the water below the deck
      const [,wy]=P(u,v+.06);const rg=ctx.createLinearGradient(0,wy,0,wy+50*depth);
      rg.addColorStop(0,`rgba(255,170,70,${.22*LT.lamp})`);rg.addColorStop(1,"rgba(255,170,70,0)");
      ctx.fillStyle=rg;ctx.fillRect(x-1+(reduce?0:Math.sin(time*1.5+L.ph)),wy,2,50*depth);
    }
    // traffic: white headlights one way, red tail lights the other
    for(const c of cars){
      if(!reduce){c.t+=c.dir*c.v*dt*(1.2-c.t*.6);if(c.t>1)c.t=0;if(c.t<0)c.t=1}
      const [u,v]=deckAt(c.t),[x,y]=P(u,v+(c.dir>0?.012:.02)),depth=1-c.t*.7,r=1.6*depth+.5;
      const col=c.dir>0?"255,70,60":"235,240,255";
      const gl=ctx.createRadialGradient(x,y,0,x,y,r*5);gl.addColorStop(0,`rgba(${col},${.95*LT.car})`);gl.addColorStop(1,`rgba(${col},0)`);
      ctx.fillStyle=gl;ctx.beginPath();ctx.arc(x,y,r*5,0,6.283);ctx.fill();
    }
    ctx.restore();
    // keep the headline readable on the left
    g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,`rgba(5,6,10,${LT.shade})`);g.addColorStop(.5,`rgba(5,6,10,${LT.shade*.45})`);g.addColorStop(1,"rgba(5,6,10,0)");
    ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"rgba(5,6,10,.55)");g.addColorStop(.25,"rgba(5,6,10,0)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    if(!reduce&&document.getElementById("necklace")===cv)neckRAF=requestAnimationFrame(frame);
  }
  layout();frame(0);
  cv.parentElement.onpointermove=e=>{const r=cv.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5};
  if(!window.__neckResize){window.__neckResize=1;addEventListener("resize",()=>{if(document.getElementById("necklace"))startNecklace()})}
}

/* Global search overlay: live results across everything */
function resultsHTML(raw){
  const q=raw.trim().toLowerCase();
  if(!q)return `<p class="label" style="margin:6px 10px">Type a word, or a sentence like “free AI events this weekend”, then press Enter</p>`;
  // match the start of words, so "ai" finds "AI Meetup" but not "Mumbai"
  const re=new RegExp("(^|[^a-z0-9])"+q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
  const m=s=>re.test(s.toLowerCase());
  const ev=LIVE().filter(e=>m(e.title+" "+e.cat+" "+e.area+" "+e.org+" "+e.tags.join(" "))).slice(0,5);
  const co=COMMUNITIES.filter(c=>m(c.name+" "+c.focus)).slice(0,3);
  const ar=ARTICLES.filter(a=>m(a.title+" "+a.tag)).slice(0,3);
  const de=DEMOS.filter(d=>m(d.name+" "+d.line+" "+d.cat)).slice(0,3);
  const grp=(t,items)=>items.length?`<h4 class="label">${t}</h4>${items.join("")}`:"";
  return grp("Events",ev.map(e=>`<button type="button" data-open-event="${e.id}"><span>${esc(e.title)}</span><span class="src">${rel(e.day)}</span></button>`))
    +grp("Communities",co.map(c=>`<button type="button" data-go="communities"><span>${esc(c.name)}</span><span class="src">${esc(c.area)}</span></button>`))
    +grp("Insights",ar.map(a=>`<button type="button" data-ext="${a.url}"><span>${esc(a.title)}</span><span class="src">↗</span></button>`))
    +grp("Example demos",de.map(d=>`<button type="button" data-open-demo="${d.id}"><span>${esc(d.name)}</span><span class="src">${esc(d.cat)}</span></button>`))
    || `<p style="margin:10px;color:var(--ink2)">Nothing matches “${esc(raw)}”. Press Enter to search events by meaning instead.</p>`;
}
const hq=document.getElementById("hq"), hres=document.getElementById("hres");
function showH(){hres.innerHTML=resultsHTML(hq.value);hres.hidden=false}
function hideH(){hres.hidden=true}
hq.addEventListener("focus",showH);
hq.addEventListener("input",showH);
hq.addEventListener("keydown",e=>{if(e.key==="Escape"){hq.value="";hideH();hq.blur()}});
document.addEventListener("pointerdown",e=>{if(!e.target.closest(".hsearch"))hideH()});
document.addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();hq.focus()}});
function openSearch(){
  closeSheet();
  const o=document.createElement("div");o.className="overlay";o.id="searchOv";
  o.innerHTML=`<div class="spanel" role="dialog" aria-modal="true" aria-label="Search">
    <form class="search-in" data-sentence><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><label for="gq" style="position:absolute;left:-9999px">Search everything</label><input id="gq" placeholder="Events, communities, articles…" autocomplete="off"></form>
    <div class="sres" id="sres"><p class="label" style="margin:4px 10px">Press Enter to turn a sentence into event filters</p></div></div>`;
  document.body.appendChild(o);
  const inp=$("#gq");inp.focus();
  inp.addEventListener("input",()=>{
    const q=inp.value.trim().toLowerCase(), box=$("#sres");
    if(!q){box.innerHTML=`<p class="label" style="margin:4px 10px">Press Enter to turn a sentence into event filters</p>`;return}
    const m=s=>s.toLowerCase().includes(q);
    const ev=LIVE().filter(e=>m(e.title+" "+e.cat+" "+e.area+" "+e.org+" "+e.tags.join(" "))).slice(0,5);
    const co=COMMUNITIES.filter(c=>m(c.name+" "+c.focus)).slice(0,3);
    const ar=ARTICLES.filter(a=>m(a.title+" "+a.tag)).slice(0,3);
    const de=DEMOS.filter(d=>m(d.name+" "+d.line+" "+d.cat)).slice(0,3);
    const grp=(t,items)=>items.length?`<h4 class="label">${t}</h4>${items.join("")}`:"";
    box.innerHTML=grp("Events",ev.map(e=>`<button data-open-event="${e.id}"><span>${esc(e.title)}</span><span class="src">${rel(e.day)}</span></button>`))
      +grp("Communities",co.map(c=>`<button data-go="communities"><span>${esc(c.name)}</span><span class="src">${esc(c.area)}</span></button>`))
      +grp("Insights",ar.map(a=>`<button data-ext="${a.url}"><span>${esc(a.title)}</span><span class="src">↗</span></button>`))
      +grp("Example demos",de.map(d=>`<button data-open-demo="${d.id}"><span>${esc(d.name)}</span><span class="src">${esc(d.cat)}</span></button>`))
      || `<p style="margin:10px;color:var(--ink2)">Nothing matches “${esc(inp.value)}”. Press Enter to search events by meaning instead.</p>`;
  });
}
function closeSearch(){$("#searchOv")?.remove()}

/* =========================================================
   6. ROUTER + INTERACTIONS
   ========================================================= */
const VIEWS={home:viewHome,discover:viewDiscover,invent:viewInvent,learn:viewLearn,tools:viewTools,insights:viewInsights,submit:viewSubmit};
/* The curator desk is not linked anywhere. It opens only at this unlisted address. */
const DESK="desk-hnljwj364a";
VIEWS[DESK]=viewCurator;
const blankF=()=>({when:"all",area:"all",cat:"all",fmt:"all",cost:"all",aud:"all",q:""});
function render(){
  $("#main").innerHTML=VIEWS[state.view]();
  document.querySelectorAll(".nav a").forEach(a=>a.getAttribute("data-go")===state.view?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
  const c=$("#savedCount");c.hidden=saved.size===0;c.textContent=saved.size;
  tick();
  startNecklace();
}
// Count each section as its own page in GoatCounter (the private desk is never counted)
function countView(v){try{if(window.goatcounter&&window.goatcounter.count&&v!==DESK)window.goatcounter.count({path:"/#"+v,title:v})}catch(e){}}
function go(v){
  // Communities now sits inside Discover: old #communities links land on that section.
  const toComm=v==="communities";if(toComm)v="discover";
  state.view=VIEWS[v]?v:"home";
  if(location.hash!=="#"+state.view)history.replaceState(null,"","#"+state.view);
  render();countView(toComm?"communities":state.view);
  const sec=toComm&&$("#communities");
  if(sec)sec.scrollIntoView();else window.scrollTo({top:0});
}
function tick(){const c=$("#clock");if(c)c.textContent=new Intl.DateTimeFormat("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Kolkata"}).format(new Date())+" IST"}
setInterval(tick,1000);

document.addEventListener("click",ev=>{
  const t=ev.target.closest("button,a");if(!t)return;
  const d=t.dataset;
  if(d.close!==undefined){closeSheet();return}
  if(t.id==="boardToggle"){toggleBoard();return}
  if(d.tod){todMode=d.tod;applyPhase(d.tod==="auto"?phaseNow():d.tod,true);toast(d.tod==="auto"?`Following Mumbai time: ${TOD_LABEL[PHASE]}`:`Previewing ${TOD_LABEL[d.tod].toLowerCase()}`);return}
  if(t.closest(".hres")){hideH();hq.blur()}
  if(d.openX){ev.preventDefault();closeSearch();xSheet(d.openX);return}
  if(d.openEvent){ev.preventDefault();closeSearch();eventSheet(d.openEvent);return}
  if(d.openDemo){ev.preventDefault();closeSearch();demoSheet(d.openDemo);return}
  if(d.ext){const a=document.createElement("a");a.href=d.ext;a.target="_blank";a.rel="noopener";a.click();return}
  if(d.save){ev.preventDefault();const id=d.save;saved.has(id)?saved.delete(id):saved.add(id);persistSaved();
    document.querySelectorAll(`[data-save="${id}"]`).forEach(b=>{b.setAttribute("aria-pressed",saved.has(id));b.setAttribute("aria-label",saved.has(id)?"Remove from saved":"Save event")});
    const c=$("#savedCount");c.hidden=saved.size===0;c.textContent=saved.size;toast(saved.has(id)?"Saved in this browser":"Removed from saved");return}
  if(d.copy){navigator.clipboard?.writeText(d.copy).then(()=>toast("Link copied")).catch(()=>toast("Copy didn't work here. Select the link below and copy it."));return}
  if(d.example){runSentence(d.example);return}
  if(d.when&&t.tagName==="A"){ev.preventDefault();state.f={...blankF(),when:d.when};state.understood=[];go("discover");return}
  if(d.when){state.f.when=d.when;state.understood=[];render();return}
  if(d.cost){ev.preventDefault();state.f={...blankF(),cost:d.cost};state.understood=[];go("discover");return}
  if(d.aud){ev.preventDefault();state.f={...blankF(),aud:d.aud};state.understood=[];go("discover");return}
  if(d.clear!==undefined){state.f=blankF();state.understood=[];render();return}
  if(d.dcat){state.demoCat=d.dcat;render();return}
  if(d.dstatus){state.demoStatus=d.dstatus;render();return}
  if(d.kind&&t.tagName==="BUTTON"){state.submitKind=d.kind;render();return}
  if(d.again!==undefined){state.submitted=null;render();return}
  if(d.approve||d.reject){curate(d);return}
  if(d.go){ev.preventDefault();closeSheet();closeSearch();$("#cityMenu").hidden=true;
    if(d.kind){state.submitKind=d.kind;state.submitted=null}
    if(d.go==="submit"&&!d.kind)state.submitted=null;
    go(d.go);return}
});
document.addEventListener("click",ev=>{
  if(ev.target.id==="scrim")closeSheet();
  if(ev.target.id==="searchOv")closeSearch();
  const menu=$("#cityMenu"),btn=$("#cityBtn");
  if(btn.contains(ev.target)){menu.hidden=!menu.hidden;btn.setAttribute("aria-expanded",!menu.hidden)}
  else if(!menu.contains(ev.target)){menu.hidden=true;btn.setAttribute("aria-expanded","false")}
  if(ev.target.closest("[data-city]")){menu.hidden=true;toast("Mumbai MMR is the only live city for now")}
});
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"){closeSheet();closeSearch();$("#cityMenu").hidden=true}});
$("#savedBtn").addEventListener("click",()=>{
  const list=EVENTS.filter(e=>saved.has(e.id)).sort((a,b)=>a.at-b.at);
  openSheet(`<div class="sheet-body" style="padding-top:56px"><h2>Saved events</h2>${list.length?`<div class="grid" style="grid-template-columns:1fr">${list.map(eventCard).join("")}</div>`:`<p style="color:var(--ink2)">Nothing saved yet. Tap the bookmark on any event to keep it here. Saved events stay in this browser.</p>`}</div>`,"Saved events");
});
document.addEventListener("change",ev=>{
  const t=ev.target;
  if(t.dataset.f){state.f[t.dataset.f]=t.value;state.understood=[];render()}
  if(t.dataset.sort!==undefined){state.sort=t.value;render()}
});
document.addEventListener("submit",ev=>{
  const form=ev.target;ev.preventDefault();
  if(form.dataset.sentence!==undefined){const v=form.querySelector("input").value.trim();closeSearch();if(form.classList.contains("hsearch")){hideH();hq.blur()}if(v)runSentence(v);return}
  if(form.dataset.digest!==undefined){const i=form.querySelector("input");if(!i.checkValidity()){toast("Enter a valid email address");return}
    const b=form.querySelector("button");b.disabled=true;b.textContent="Adding…";
    sendForm({_subject:"Newsletter sign-up",email:i.value.trim(),list:"Weekly digest"})
      .then(()=>{form.innerHTML=`<p style="margin:0;font-weight:600">You're on the list. The first edition will land in your inbox.</p>`})
      .catch(()=>{b.disabled=false;b.textContent="Subscribe";toast("Couldn't sign you up just now. Please try again, or email "+FORM_INBOX)});
    return}
  if(form.dataset.submit!==undefined){
    const missing=[...form.querySelectorAll("[required]")].filter(x=>!x.value.trim()||!x.checkValidity());
    form.querySelectorAll(".err").forEach(e=>e.remove());
    if(missing.length){
      missing.forEach(x=>{const e=document.createElement("span");e.className="err";e.textContent=x.type==="url"?"Enter a full link starting with https://":"This is needed";x.closest(".field").appendChild(e)});
      $("#formErr").textContent=`${missing.length} ${missing.length===1?"field needs":"fields need"} attention`;
      missing[0].focus();return;
    }
    const fd=new FormData(form), title=fd.get("title");
    if(fd.get("_honey"))return;
    const ref="ID-"+String(hash(title+Date.now())%100000).padStart(5,"0");
    const kind=state.submitKind, data={_subject:`New ${kind} submission: ${title} (${ref})`,type:kind,reference:ref};
    for(const [k,v] of fd.entries()){if(k==="_honey")continue;data[k]=data[k]?data[k]+", "+v:v}
    const btn=form.querySelector('button[type="submit"]');btn.disabled=true;btn.textContent="Sending…";$("#formErr").textContent="";
    sendForm(data).then(()=>{state.submitted={title,ref};render();window.scrollTo({top:0})})
      .catch(()=>{btn.disabled=false;btn.textContent="Send for review";$("#formErr").innerHTML=`Couldn't send just now. Please try again, or email <a href="mailto:${FORM_INBOX}">${FORM_INBOX}</a>.`});
  }
});

/* Curator actions: approving moves a candidate into the live list */
function curate(d){
  const id=d.approve||d.reject, i=QUEUE.findIndex(q=>q.qid===id);if(i<0)return;
  const q=QUEUE[i];
  if(d.reject){QUEUE.splice(i,1);toast("Rejected. It won't be suggested again.");render();return}
  const day=q.day||$(`#d-${q.qid}`)?.value, time=q.time||$(`#t-${q.qid}`)?.value;
  if(!day){toast("Add the date from the source page first");$(`#d-${q.qid}`)?.focus();return}
  QUEUE.splice(i,1);
  const f=q.full||{};
  EVENTS.push(buildEvent({id:q.qid+"-"+day,title:q.title,cat:CAT[q.cat]?q.cat:"Tech",tags:[q.cat],area:q.area,venue:f.venue||"Venue on the event page",start:time?`${day}T${time}`:day,end:null,timeNote:time?null:"Time on the event page",fmt:f.fmt||"Offline",
    price:f.price??0,priceNote:q.access==="approval"?"Free · approval required":(f.price?`₹${f.price}`:"Free"),aud:f.aud?.length?f.aud:["Open to All"],src:q.src,url:q.url,org:f.org||q.title.split(":")[0],access:q.access,desc:f.desc||"Details checked on the source page by a curator.",verified:"Confirmed by curator"}));
  toast("Approved. It's now live in Discover.");
  render();
}

function fromHash(){const h=location.hash.replace("#","");if(h==="communities"){go(h);return}if(VIEWS[h]&&h!==state.view){state.view=h;render();window.scrollTo({top:0})}}
window.addEventListener("hashchange",fromHash);
applyPhase(PHASE,false);
state.view=VIEWS[location.hash.replace("#","")]?location.hash.replace("#",""):"home";
render();
if(location.hash==="#communities")go("communities");
