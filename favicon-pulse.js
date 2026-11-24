/* favicon-pulse.js — softly animates the violet "+" tab icon.
   Runs for ~6 s after the page loads, and again whenever the tab is hidden,
   so it catches the eye in the tab strip. Otherwise the normal still icon shows.
   No animation for people who ask their device for reduced motion,
   and none in the Quest browser (keeps VR frame rates safe). */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (/OculusBrowser|Quest/i.test(navigator.userAgent)) return;

  var canvas = document.createElement("canvas");          // invisible drawing board
  canvas.width = canvas.height = 64;
  var ctx = canvas.getContext("2d");                      // the "pen"
  if (!ctx) return;

  // The page's own icon tags stay as the fallback; we remember them to put them back.
  var links = [].slice.call(document.querySelectorAll('link[rel~="icon"]'));
  if (!links.length) {                                    // page has none: browsers use /favicon.ico anyway
    var l = document.createElement("link"); l.rel = "icon"; l.href = "/favicon.ico";
    document.head.appendChild(l); links = [l];
  }
  var original = links.map(function (l) { return { href: l.getAttribute("href"), type: l.getAttribute("type") }; });

  var COLOURS = [[124, 77, 255], [61, 123, 255], [255, 79, 184]];   // violet → blue → pink
  function mix(a, b, k) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }); }
  function rgb(c) { return "rgb(" + c.join(",") + ")"; }
  function colourAt(p) {                                  // smooth blend around the three colours
    p = p % 3; var i = Math.floor(p), k = p - i; k = k * k * (3 - 2 * k);
    return mix(COLOURS[i], COLOURS[(i + 1) % 3], k);
  }
  function roundRect(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  var t = 0, frame = 0;
  // The spin: 16 frames (~2 s) turning half a circle, slow → fast → slow → stop,
  // then 8 frames (~1 s) resting upright. A "+" looks the same after half a turn,
  // so every spin ends looking exactly like the still icon.
  function spinAngle() {
    var f = frame % 24;
    if (f >= 16) return 0;                                // resting
    var p = f / 16;                                       // 0 → 1 through the spin
    return Math.PI * (1 - Math.cos(Math.PI * p)) / 2;     // ease: slow start, fast middle, soft stop
  }
  function draw() {
    t += 0.15; frame++;
    var c = colourAt(t * 0.5);                            // full colour loop every ~6 s
    var glow = 6 + Math.sin(t * 2) * 4;                   // glow breathes between 2 and 10
    ctx.clearRect(0, 0, 64, 64);
    // the tile, same shape as favicon.svg, tinted with the current colour
    var g = ctx.createLinearGradient(0, 0, 64, 64);
    g.addColorStop(0, rgb(mix(c, [255, 255, 255], 0.45)));
    g.addColorStop(0.5, rgb(c));
    g.addColorStop(1, rgb(mix(c, [0, 0, 0], 0.3)));
    ctx.shadowBlur = 0; ctx.fillStyle = g; roundRect(0, 0, 64, 64, 15); ctx.fill();
    // the white "+", with a soft glow
    ctx.shadowColor = "rgba(255,255,255,0.95)"; ctx.shadowBlur = glow; ctx.fillStyle = "#fff";
    ctx.save();
    ctx.translate(32, 32); ctx.rotate(spinAngle()); ctx.translate(-32, -32);  // turn around the centre
    roundRect(26.88, 14.08, 10.24, 35.84, 5.12); ctx.fill();   // vertical bar
    roundRect(14.08, 26.88, 35.84, 10.24, 5.12); ctx.fill();   // horizontal bar
    ctx.restore();
    var url = canvas.toDataURL("image/png");
    links.forEach(function (l) { l.type = "image/png"; l.href = url; });   // into the tab icon
  }

  var timer = null, introEnds = Date.now() + 6000;
  function start() { if (!timer) { frame = 0; timer = setInterval(draw, 125); } }   // 8 frames a second
  function stop() {
    if (!timer) return;
    clearInterval(timer); timer = null;
    links.forEach(function (l, i) {                       // back to the still icon
      if (original[i].type) l.setAttribute("type", original[i].type); else l.removeAttribute("type");
      l.setAttribute("href", original[i].href);
    });
  }
  function update() {
    if (document.visibilityState === "hidden" || Date.now() < introEnds) start(); else stop();
  }
  document.addEventListener("visibilitychange", update);
  setTimeout(update, 6050);                               // end of the 6-second intro
  update();
})();
