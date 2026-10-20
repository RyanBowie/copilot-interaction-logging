/* Shared interaction layer for the community project sites (original code, MIT).
   Progressive enhancement: with JS off, reduced motion or forced colours the page is the plain page.
   Optional per-page config, set before this script loads:
     window.FX_SITE = { nav: "css selector", cards: "css selector", hero: "css selector", marquee: ["words"], progress: true, reveal: "css selector" }
   Cursor effects only appear over blank background, never over text, diagrams, tables or cards. */
(function () {
  "use strict";
  var cfg = window.FX_SITE || {};
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  function cssVar(n, fb) { var v = getComputedStyle(root).getPropertyValue(n).trim(); return v || fb; }

  /* Community hub: filter chips (the static HTML already shows every group without JS). */
  function community() {
    $$("[data-fx-community]").forEach(function (hub) {
      var groups = $$(".cm-group", hub);
      if (groups.length < 2 || $(".cm-tabs", hub)) return;
      var bar = document.createElement("div");
      bar.className = "cm-tabs"; bar.setAttribute("role", "group"); bar.setAttribute("aria-label", "Filter projects by group");
      function mk(label, key) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "cm-tab"; b.textContent = label; b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          $$(".cm-tab", bar).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          groups.forEach(function (g) { g.hidden = key !== "all" && g.getAttribute("data-group") !== key; });
        });
        bar.appendChild(b); return b;
      }
      var all = mk("All", "all");
      groups.forEach(function (g) { mk(g.getAttribute("data-label"), g.getAttribute("data-group")); });
      all.setAttribute("aria-pressed", "true");
      hub.insertBefore(bar, groups[0]);
    });
  }

  /* Visitor switch for the cursor colour/following effects, remembered across pages and sites of this origin. */
  var KEY = "fx-cursor";
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function off() { return root.classList.contains("fx-cursor-off"); }
  function cursorToggle() {
    if (!fine) return;
    if (stored() === "off") root.classList.add("fx-cursor-off");
    if ($(".fx-cursor-toggle")) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "fx-cursor-toggle";
    function paint() {
      var on = !off();
      btn.setAttribute("aria-pressed", String(on));
      btn.textContent = on ? "Cursor effects: on" : "Cursor effects: off";
      btn.title = on ? "Turn off the cursor colour and trail on blank space" : "Turn on the cursor colour and trail on blank space";
    }
    btn.addEventListener("click", function () {
      root.classList.toggle("fx-cursor-off");
      try { localStorage.setItem(KEY, off() ? "off" : "on"); } catch (e) {}
      paint();
    });
    paint();
    var head = $("header"), gh = head && $('a[href*="github.com/RyanBowie"]', head);
    var host = head && $(".inner, .top, .hero-inner, nav", head);
    if (gh) gh.parentNode.insertBefore(btn, gh.nextSibling);
    else if (host) host.appendChild(btn);
    else { btn.classList.add("fx-cursor-fixed"); document.body.appendChild(btn); }
  }

  community();
  if (!reduce && !window.matchMedia("(forced-colors: active)").matches) cursorToggle();
  if (cfg.hubOnly || reduce || window.matchMedia("(forced-colors: active)").matches) return;

  /* Blank = bare layout background: no text of its own, no fill, border, shadow or image, and not inside content.
     Inside a dot-field host, the host itself counts as the background. */
  var CONTENT = "a,button,input,textarea,select,label,pre,code,summary,details,video,img,picture,canvas,svg,figure,table,li,p,h1,h2,h3,h4,h5,h6,blockquote,dd,dt,.card,.callout,.table-wrap,.cm-hub,.fx-marquee,[data-fx-host]";
  var LAYOUT = { MAIN: 1, SECTION: 1, DIV: 1, ARTICLE: 1, ASIDE: 1, HEADER: 1, FOOTER: 1, NAV: 1, UL: 1, OL: 1 };
  function blank(el, host) {
    if (!el || el.nodeType !== 1) return false;
    if (el === host) return true;
    if (el === root || el === document.body) return !host;
    if (!LAYOUT[el.tagName]) return false;
    var c = el.closest(CONTENT);
    if (c && c !== host) return false;
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && n.nodeValue.trim()) return false;
    var s = getComputedStyle(el);
    if (s.backgroundImage !== "none" || s.boxShadow !== "none") return false;
    if (s.borderTopStyle !== "none" && parseFloat(s.borderTopWidth) + parseFloat(s.borderBottomWidth) + parseFloat(s.borderLeftWidth) + parseFloat(s.borderRightWidth) > 0) return false;
    var m = /rgba?\(([^)]+)\)/.exec(s.backgroundColor);
    if (m) { var p = m[1].split(","); if (p.length < 4 || parseFloat(p[3]) > 0.05) return false; }
    return true;
  }
  function inHost(el) { return !!(el && el.closest && el.closest("[data-fx-host]")); }

  /* Interactive dot field: cursor bulge plus click ripples. */
  function dotField(host, opts) {
    opts = opts || {};
    if (host.querySelector(":scope > .fx-field")) return;
    var cv = document.createElement("canvas");
    cv.className = "fx-field"; cv.setAttribute("aria-hidden", "true");
    host.setAttribute("data-fx-host", ""); host.classList.add("fx-host");
    host.insertBefore(cv, host.firstChild);
    var ctx = cv.getContext("2d"), sp = opts.spacing || 22;
    var w = 0, h = 0, dpr = 1, mouse = { x: -999, y: -999, a: 0, on: false }, ripples = [], visible = true, raf = 0;
    var base, acc, mag;
    function colors() { base = cssVar("--cp-border-strong", "#777"); acc = cssVar("--cp-accent", "#a78bfa"); mag = cssVar("--cp-chart-magenta", "#e879f9"); }
    function size() {
      var r = host.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width; h = r.height;
      cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function draw(now) {
      ctx.clearRect(0, 0, w, h);
      ripples = ripples.filter(function (r) { return now - r.t < 1800; });
      for (var x = sp / 2; x < w; x += sp) for (var y = sp / 2; y < h; y += sp) {
        var dx = x - mouse.x, dy = y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
        var k = Math.max(0, 1 - d / 150) * mouse.a;
        var px = x + (d ? dx / d : 0) * k * 7, py = y + (d ? dy / d : 0) * k * 7;
        var rad = 1.1 + k * 2.4, col = k > 0.05 ? acc : base, alpha = 0.35 + k * 0.65;
        for (var i = 0; i < ripples.length; i++) {
          var R = ripples[i], age = (now - R.t) / 1000, ring = age * 380;
          var rd = Math.abs(Math.sqrt((x - R.x) * (x - R.x) + (y - R.y) * (y - R.y)) - ring);
          if (rd < 46) {
            var f = (1 - rd / 46) * (1 - age / 1.8);
            var a = Math.atan2(y - R.y, x - R.x);
            px += Math.cos(a) * f * 9; py += Math.sin(a) * f * 9;
            rad += f * 2.6; col = mag; alpha = Math.max(alpha, 0.35 + f * 0.65);
          }
        }
        ctx.globalAlpha = Math.min(1, alpha); ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(px, py, rad, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(now) {
      raf = 0;
      mouse.a += ((mouse.on ? 1 : 0) - mouse.a) * 0.12;
      draw(now);
      if (visible && (ripples.length || mouse.a > 0.01 || mouse.on)) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && visible) raf = requestAnimationFrame(loop); }
    function pos(e) { var r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }
    host.addEventListener("pointermove", function (e) { if (off() || !blank(e.target, host)) { if (mouse.on) { mouse.on = false; kick(); } return; } pos(e); mouse.on = true; kick(); });
    host.addEventListener("pointerleave", function () { mouse.on = false; kick(); });
    host.addEventListener("pointerdown", function (e) { if (off() || !blank(e.target, host)) return; pos(e); ripples.push({ x: mouse.x, y: mouse.y, t: performance.now() }); kick(); });
    window.addEventListener("resize", function () { size(); draw(performance.now()); });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) kick(); }).observe(host);
    new MutationObserver(function () { colors(); draw(performance.now()); }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    colors(); size(); draw(performance.now());
    if (opts.intro) setTimeout(function () { ripples.push({ x: w * 0.72, y: h * 0.32, t: performance.now() }); kick(); }, 700);
    root.classList.add("fx-on");
  }

  /* Glyph trail: only over blank background and never over a dot-field area, so text stays easy to select and copy. */
  function trail() {
    if (!fine) return;
    var colors = ["#c3a0ef", "#f73678", "#ff9d4d", "#69aeff", "#5fed83", "#e6cf3a"], glyphs = "-/).+=><*&(".split("");
    var N = 10, blocks = [], idx = 0, lx = -1, ly = -1;
    for (var i = 0; i < N; i++) { var b = document.createElement("div"); b.className = "fx-trail-block"; b.setAttribute("aria-hidden", "true"); document.body.appendChild(b); blocks.push(b); }
    document.addEventListener("mousemove", function (e) {
      if (off() || inHost(e.target) || !blank(e.target)) return;
      var x = 20 * Math.floor(e.clientX / 20), y = 20 * Math.floor(e.clientY / 20);
      if (x === lx && y === ly) return;
      lx = x; ly = y; idx = (idx + 1) % N;
      var blk = blocks[idx];
      blk.style.transform = "translate(" + x + "px," + y + "px)";
      blk.style.background = colors[(Math.random() * colors.length) | 0];
      blk.textContent = Math.random() < 0.3 ? " " : glyphs[(Math.random() * glyphs.length) | 0];
      blk.classList.add("fx-active");
      setTimeout(function () { blk.classList.remove("fx-active"); }, 100 + 300 * Math.random());
    });
  }

  /* Nav text decode on mouse-leave and focus; the accessible name stays the real text. */
  function decode(links) {
    var CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!@#$%^&*()_+-=[]{}|/;<>?";
    links.forEach(function (a) {
      if (a.children.length || a.querySelector(".fx-dec")) return;
      var text = a.textContent.trim(), timers = [];
      if (!text) return;
      a.textContent = "";
      if (!a.hasAttribute("aria-label")) a.setAttribute("aria-label", text);
      var el = document.createElement("span"); el.className = "fx-dec";
      var ph = document.createElement("span"); ph.className = "fx-ph"; ph.textContent = text;
      var live = document.createElement("span"); live.className = "fx-live"; live.setAttribute("aria-hidden", "true"); live.textContent = text;
      el.appendChild(ph); el.appendChild(live); a.appendChild(el);
      function run() {
        timers.forEach(clearTimeout); timers = [];
        var buf = new Array(text.length).fill(" ");
        for (var i = 0; i < text.length; i++) (function (i) {
          var fl = 1 + ((Math.random() * 2) | 0);
          for (var f = 0; f <= fl; f++) (function (f) {
            timers.push(setTimeout(function () {
              buf[i] = f < fl && text.charAt(i) !== " " ? CH.charAt((Math.random() * CH.length) | 0) : text.charAt(i);
              live.textContent = buf.join("");
            }, 40 * i + 45 * f));
          })(f);
        })(i);
      }
      a.addEventListener("mouseleave", run);
      a.addEventListener("focus", run);
    });
  }

  /* Spotlight glow that follows the pointer inside cards (a child layer, so it never clashes with a card's own pseudo-elements). */
  function spotlight(sel) {
    if (!fine) return;
    $$(sel).forEach(function (el) {
      if (el.querySelector(":scope > .fx-glow")) return;
      if (getComputedStyle(el).position === "static") el.classList.add("fx-rel");
      var g = document.createElement("span"); g.className = "fx-glow"; g.setAttribute("aria-hidden", "true"); el.appendChild(g);
      var tilt = el.classList.contains("cm-card");
      if (tilt) el.classList.add("fx-tilt");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        el.style.setProperty("--mx", x + "px"); el.style.setProperty("--my", y + "px");
        if (tilt) { el.style.setProperty("--rx", ((x / r.width - 0.5) * 6).toFixed(2) + "deg"); el.style.setProperty("--ry", ((0.5 - y / r.height) * 6).toFixed(2) + "deg"); }
        el.classList.add("fx-hot");
      });
      el.addEventListener("pointerleave", function () { el.classList.remove("fx-hot"); el.style.removeProperty("--rx"); el.style.removeProperty("--ry"); });
    });
  }

  function magnetic(sel) {
    if (!fine) return;
    $$(sel).forEach(function (b) {
      b.classList.add("fx-mag");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* Outlined marquee band (only when the page supplies words). */
  function marquee(words, hero) {
    var set = words.map(function (w) { return "<span>" + String(w).replace(/[<>&]/g, "") + "</span><i>✦</i>"; }).join("");
    var m = document.createElement("div");
    m.className = "fx-marquee"; m.setAttribute("aria-hidden", "true");
    m.innerHTML = '<div class="fx-marquee-track">' + set + set + "</div>";
    if (hero) hero.parentNode.insertBefore(m, hero.nextSibling);
    else { var first = $("main > section, main > .section, main > *"); if (first) first.parentNode.insertBefore(m, first); }
  }

  /* Scroll progress bar, for pages that don't have one. */
  function progress() {
    var bar = document.createElement("div"); bar.className = "fx-progress"; bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var q = false;
    function upd() { q = false; var h = root.scrollHeight - window.innerHeight; bar.style.transform = "scaleX(" + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ")"; }
    window.addEventListener("scroll", function () { if (!q) { q = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Sections ease in as they scroll into view (only those the page doesn't already reveal). */
  function reveal(sel) {
    if (!("IntersectionObserver" in window)) return;
    var els = $$(sel).filter(function (el) { return !el.classList.contains("dl-reveal") && !el.closest(".dl-reveal") && el.getBoundingClientRect().top > window.innerHeight * 0.9; });
    if (!els.length) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("fx-in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { el.classList.add("fx-rev"); io.observe(el); });
    root.classList.add("fx-reveal-on");
    window.addEventListener("beforeprint", function () { els.forEach(function (el) { el.classList.add("fx-in"); }); });
  }

  var hero = $(cfg.hero || ".hero");
  var feet = $$("footer").filter(function (f) { return !f.closest("[data-fx-host]"); });
  if (hero) dotField(hero, { intro: true });
  feet.forEach(function (f) { dotField(f, { spacing: 24 }); });
  trail();
  decode($$(cfg.nav || ".chips a, .toc a, header nav a, nav.site-nav a, .topnav a, .site-header nav a"));
  spotlight(cfg.cards || ".card, .callout, .cm-card, .table-wrap, .stat, .tile, .facts li");
  magnetic(cfg.magnetic || ".cta-row .btn, .hero .btn, .hero a.button");
  if (cfg.marquee && cfg.marquee.length) marquee(cfg.marquee, hero);
  if (cfg.progress) progress();
  reveal(cfg.reveal || "main > section, main > .section");
})();
