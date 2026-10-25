/*
 * Shared read-aloud "engine" for Discover analog stories.
 *
 * What this is: one script, used by every story, instead of pasting a
 * near-identical <script> block into each new story's HTML file. If we
 * improve the voice, the pacing, or fix a reading bug, we fix it here
 * once and every story — past and future — picks it up the next time
 * its page loads. No story file needs editing when this file changes.
 *
 * What a story page needs, to use it:
 *   1. In <head>, link the matching stylesheet:
 *        <link rel="stylesheet" href="../listen.css">
 *      (adjust the "../" if the story lives somewhere other than one
 *      folder below /discover/)
 *   2. Load this script, deferred so it runs after the page's HTML exists:
 *        <script src="../listen-engine.js" defer></script>
 *   3. Somewhere in the page (usually in the header, next to a reading
 *      time estimate), add this exact markup — the engine looks for
 *      these three ids by name:
 *        <button class="listen" id="listen" type="button" aria-pressed="false">
 *          <span class="switch" aria-hidden="true"></span><span id="listen-label">Listen: off</span>
 *        </button>
 *        <button class="speed" id="speed" type="button" aria-label="Reading speed, click to change">1x</button>
 *        <span class="listen-note" id="listen-note" hidden>Your browser can't read this page aloud.</span>
 *   4. Tag every paragraph/heading/list item/panel that should be read
 *      aloud with a plain `data-read` attribute, in the order they
 *      should be spoken (top to bottom is usually right):
 *        <p data-read>Some sentence of the story.</p>
 *      If the visible text would sound wrong read literally (numbers,
 *      abbreviations, a word like "Tor" that needs context, a <span>
 *      with markup inside it), add a `data-say="..."` attribute with
 *      the version to actually speak — keep it worded the SAME as the
 *      visible text wherever possible, just smoothed for pronunciation,
 *      so a reader following along with Listen on never hears something
 *      different from what's on screen:
 *        <li data-read data-say="Number to remember: about two hundred thousand lunches a day.">
 *          Number to remember: <strong>about 200,000 lunches a day</strong>.
 *        </li>
 *
 * That's the whole contract. Everything below runs itself once the page
 * loads — no story page needs to call anything.
 */
(function () {
  function init() {
    var btn = document.getElementById("listen");
    var label = document.getElementById("listen-label");
    var speedBtn = document.getElementById("speed");
    var note = document.getElementById("listen-note");
    if (!btn || !label || !speedBtn) return; // this page doesn't have the Listen controls — nothing to wire up

    var synth = window.speechSynthesis;
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") {
      btn.disabled = true;
      speedBtn.disabled = true;
      label.textContent = "Listen: unavailable";
      if (note) note.hidden = false;
      return;
    }

    var parts = Array.prototype.slice.call(document.querySelectorAll("[data-read]"));
    var idx = 0, on = false;

    // Playback speed: a multiplier on top of the base narration pace
    // below, cycled by the "1x" button the same way a podcast app's
    // speed control works. speedSteps[speedIdx] is always what's
    // showing on the button.
    var speedSteps = [1, 1.5, 2];
    var speedIdx = 0;

    function pickVoice() {
      // Browsers ship several built-in voices; quality varies a lot
      // between them. On Chrome, voices whose name contains "Google"
      // are the higher-quality ones (closer to a real narrator) rather
      // than the flat default system voice, so we try those first,
      // still preferring an Indian-English accent, before falling back
      // to whatever plain English voice exists.
      var v = synth.getVoices();
      return v.find(function (x) { return /en-IN/i.test(x.lang) && /Google/i.test(x.name); }) ||
             v.find(function (x) { return /en-IN/i.test(x.lang); }) ||
             v.find(function (x) { return /^en/i.test(x.lang) && /Google/i.test(x.name); }) ||
             v.find(function (x) { return /^en/i.test(x.lang); }) || null;
    }
    function clear() { parts.forEach(function (p) { p.classList.remove("speaking"); }); }
    function next() {
      if (!on) return;
      if (idx >= parts.length) { stop(); return; }
      var el = parts[idx];
      clear(); el.classList.add("speaking");
      try { el.scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {}
      var u = new SpeechSynthesisUtterance(el.getAttribute("data-say") || el.textContent.trim());
      var v = pickVoice(); if (v) { u.voice = v; u.lang = v.lang; }
      // rate: speed of speech (1 = normal). pitch: how high/low the
      // voice sits (1 = the voice's natural pitch). 0.92 is the base
      // storytelling pace (a touch slower and lower than default, so
      // it reads less like a robot reading a manual); the speed button
      // then multiplies that base pace by 1x, 1.5x or 2x, the same way
      // a podcast player's speed control scales normal playback rather
      // than replacing it.
      u.rate = 0.92 * speedSteps[speedIdx];
      u.pitch = 0.95;
      u.onend = function () { idx++; next(); };
      u.onerror = function () { idx++; next(); };
      synth.speak(u);
    }
    function stop() {
      on = false; synth.cancel(); clear(); idx = 0;
      btn.setAttribute("aria-pressed", "false"); label.textContent = "Listen: off";
    }
    btn.addEventListener("click", function () {
      if (on) { stop(); return; }
      on = true; idx = 0;
      btn.setAttribute("aria-pressed", "true"); label.textContent = "Listen: on";
      synth.cancel(); next();
    });
    speedBtn.addEventListener("click", function () {
      // Just move to the next step and relabel the button; next() reads
      // speedSteps[speedIdx] fresh for every new chunk it speaks, so the
      // new pace takes effect from the next sentence or panel onward
      // (we don't interrupt whatever is being read right now).
      speedIdx = (speedIdx + 1) % speedSteps.length;
      speedBtn.textContent = speedSteps[speedIdx] + "x";
    });
    window.addEventListener("pagehide", stop);
  }

  // The <script> tag uses "defer", so the HTML is already parsed by the
  // time this file runs — but init() is wrapped this way too, just in
  // case a future story loads it without "defer".
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
