/* Apparate website — interactions. Content comes from the page (rendered from src/_data). */
(function () {
"use strict";
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasG = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const isHome = document.body.classList.contains("page-home");

/* ---------- always open at the top (unless a section link was used) ---------- */
try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) {}
const toTop = () => { if (!/^#[\w-]+$/.test(location.hash)) { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0); document.documentElement.style.scrollBehavior = ""; } };
let userMoved = false, holdTop = true;
["wheel", "touchstart", "keydown", "pointerdown"].forEach(ev => addEventListener(ev, () => { userMoved = true; holdTop = false; }, { passive: true, capture: true }));
addEventListener("scroll", () => { if (holdTop && !userMoved && window.scrollY > 0) toTop(); }, { passive: true });
toTop(); addEventListener("pageshow", toTop); setTimeout(() => { holdTop = false; }, 4500);

/* ---------- data ---------- */
let DATA = { categories: [], items: [], techniques: [], relative: false, prefix: "" };
try { const el = $("#site-data"); if (el) DATA = JSON.parse(el.textContent); } catch (e) {}
const src = p => !p || p[0] !== "/" ? p : DATA.relative ? p.slice(1) : (DATA.prefix || "") + p;
const catName = id => (DATA.categories.find(c => c.id === id) || {}).name || "";
const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- loader: waits for the hero photo and brand fonts (max 3.5 s) ---------- */
let introTweens = [];
(function () {
  const bar = $("#lbar"), pct = $("#lpct"), L = $("#loader"); let p = 0, done = false;
  if (!L) return;
  const t0 = performance.now();
  const t = setInterval(() => { p = Math.min(92, p + Math.random() * 14); bar.style.width = p + "%"; pct.textContent = Math.round(p); }, 90);
  const finish = () => {
    if (done) return; done = true; clearInterval(t); bar.style.width = "100%"; pct.textContent = "100";
    const wait = Math.max(0, 700 - (performance.now() - t0)); // never flash the loader
    setTimeout(() => { toTop(); if (hasG) ScrollTrigger.refresh(); intro(); L.classList.add("done"); }, wait + 200);
  };
  const ready = [];
  const heroBg = $(".hero .bg");
  if (heroBg) {
    const m = (heroBg.style.backgroundImage || "").match(/url\(["']?([^"')]+)["']?\)/);
    if (m) ready.push(new Promise(res => { const im = new Image(); im.onload = im.onerror = res; im.src = m[1]; if (im.decode) im.decode().then(res, res); }));
  }
  if (document.fonts && document.fonts.ready) ready.push(document.fonts.ready.catch(() => {}));
  Promise.all(ready).then(finish);
  setTimeout(finish, 3500);
})();
function intro() {
  if (!hasG || reduce || document.visibilityState !== "visible") return;
  const add = tw => { introTweens.push(tw); return tw; };
  if (isHome) {
    add(gsap.from("#heroTitle .script", { y: 30, opacity: 0, duration: 1, ease: "power3.out" }));
    add(gsap.from("#heroTitle .w>span", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: .09, delay: .1 }));
    add(gsap.from(".hero .kicker,.hero .sub", { y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: .12, delay: .35 }));
    add(gsap.from(".hero .bg", { scale: 1.12, duration: 2, ease: "power2.out" }));
  } else {
    add(gsap.from(".startpage h1,.startpage .lead,.startpage .steps li", { y: 30, opacity: 0, duration: .9, stagger: .08, ease: "power3.out" }));
  }
  // safety: if the tab is throttled or hidden, never leave the opening half-revealed
  setTimeout(() => introTweens.forEach(tw => tw.progress(1)), 2600);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") introTweens.forEach(tw => tw.progress(1)); });
}

/* ---------- portfolio + lightbox (home) ---------- */
const grid = $("#grid"), filters = $("#filters"), cats = $("#cats"), lb = $("#lb");
let cur = 0, lastFocus = null;
function setFilter(f) {
  if (!filters) return;
  $$("button", filters).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === f)));
  $$(".item", grid).forEach(it => it.classList.toggle("out", !(f === "all" || it.dataset.c === f)));
  if (hasG && !reduce) gsap.fromTo($$(".item:not(.out)", grid), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .04, ease: "power3.out", overwrite: true });
  if (hasG) ScrollTrigger.refresh();
}
if (filters) filters.addEventListener("click", e => { const b = e.target.closest("button"); if (b) setFilter(b.dataset.f); });
if (cats) cats.addEventListener("click", e => { const b = e.target.closest(".cat"); if (!b) return; setFilter(b.dataset.cat); filters.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }); });
const visibleIdx = () => $$(".item:not(.out)", grid).map(x => +x.dataset.i);
function showWork(i, j = 0) {
  cur = i; const w = DATA.items[i]; if (!w) return;
  $("#lbImg").src = src(w.images[j]); $("#lbImg").alt = w.brand + " " + w.product;
  $("#lbCat").textContent = catName(w.category); $("#lbTitle").textContent = w.product;
  $("#lbBy").textContent = w.brand + (w.via ? " · " + w.via : ""); $("#lbText").textContent = w.description;
  $("#lbTags").innerHTML = (w.tags || []).map(t => `<span class="chip">${esc(t)}</span>`).join("");
  $("#lbThumbs").innerHTML = w.images.length > 1 ? w.images.map((m, k) => `<button type="button" aria-label="Image ${k + 1}" aria-current="${k === j}" data-k="${k}"><img src="${esc(src(m))}" alt=""></button>`).join("") : "";
  const v = visibleIdx(); $("#lbCount").textContent = (v.indexOf(i) + 1) + " / " + v.length;
}
function openLB() { lastFocus = document.activeElement; lb.classList.add("open"); document.body.style.overflow = "hidden"; $("#lbClose").focus(); }
function closeLB() { lb.classList.remove("open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
function step(d) { const v = visibleIdx(); let p = v.indexOf(cur); if (p < 0) p = 0; showWork(v[(p + d + v.length) % v.length]); }
function openTech(i) {
  const x = DATA.techniques[i]; if (!x) return; lb.classList.add("tech");
  $("#lbImg").src = src(x.image); $("#lbImg").alt = x.name + " print example";
  $("#lbCat").textContent = "Printing technique"; $("#lbTitle").textContent = x.name; $("#lbBy").textContent = x.caption;
  $("#lbText").textContent = x.description;
  $("#lbTags").innerHTML = x.example ? `<div style="width:100%"><div class="exlabel">Example</div><p style="color:#fff;font-weight:600;margin-top:6px">${esc(x.example)}</p><p style="margin-top:6px">${esc(x.exampleNote)}</p></div>` : "";
  $("#lbThumbs").innerHTML = ""; openLB();
}
if (lb) {
  grid.addEventListener("click", e => { const b = e.target.closest(".item"); if (b) { lb.classList.remove("tech"); showWork(+b.dataset.i); openLB(); } });
  $$("[data-tech]").forEach(b => b.addEventListener("click", () => openTech(+b.dataset.tech)));
  $("#lbThumbs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showWork(cur, +b.dataset.k); });
  $("#lbClose").addEventListener("click", closeLB); $("#lbPrev").addEventListener("click", () => step(-1)); $("#lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb || e.target.classList.contains("stagebox")) closeLB(); });
  document.addEventListener("keydown", e => { if (!lb.classList.contains("open")) return; if (e.key === "Escape") closeLB(); if (lb.classList.contains("tech")) return; if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); });
}

/* ---------- reach switch ---------- */
(function () {
  const a = $("#reachA"), b = $("#reachB"), pill = $("#reachPill"); if (!a) return;
  const place = btn => { pill.style.width = btn.offsetWidth + "px"; pill.style.transform = `translateX(${btn.offsetLeft - 5}px)`; };
  const set = on => { a.setAttribute("aria-pressed", String(on === a)); b.setAttribute("aria-pressed", String(on === b)); place(on); $("#rLocal").hidden = on !== a; $("#rRegional").hidden = on !== b; };
  a.addEventListener("click", () => set(a)); b.addEventListener("click", () => set(b));
  addEventListener("resize", () => place(a.getAttribute("aria-pressed") === "true" ? a : b));
  requestAnimationFrame(() => place(a)); document.fonts && document.fonts.ready.then(() => place(a.getAttribute("aria-pressed") === "true" ? a : b));
})();

/* ---------- quality gates ---------- */
const railPos = [6, 30, 50, 94];
function setGate(g) {
  $$(".gate").forEach(el => { const on = +el.dataset.g === g; el.classList.toggle("on", on); el.setAttribute("aria-selected", String(on)); });
  $$(".gate-dot").forEach(el => { const d = +el.dataset.g; el.setAttribute("aria-selected", String(d === g)); el.classList.toggle("passed", d < g); });
  const r = $("#gateRail"); if (r) r.style.width = railPos[g] + "%";
}
$$(".gate").forEach(el => el.addEventListener("click", () => setGate(+el.dataset.g)));
if ($(".gate")) setGate(0);

/* ---------- timeline bars ---------- */
$$(".track-bar").forEach(tb => { const n = +tb.dataset.n; tb.innerHTML = Array.from({ length: +tb.dataset.of }, (_, i) => `<i style="${i < n ? "" : "opacity:.25"}"></i>`).join(""); });

/* ---------- brief builder (start page) ---------- */
const form = $("#briefForm");
if (form) {
  let BD = { whatsapp: "", email: "" }; try { BD = JSON.parse($("#brief-data").textContent); } catch (e) {}
  let FILES = [];
  const vals = id => $$("#" + id + " input:checked").map(i => i.value);
  const buildBrief = () => {
    const v = k => (form.elements[k] && form.elements[k].value || "").trim();
    const fab = vals("t-fabric"), br = vals("t-brand"), fl = FILES.map(f => f.name);
    const filled = [v("product"), v("qty"), fab.length, br.length, v("finishing"), v("date"), fl.length].filter(Boolean).length;
    const d = v("date") ? new Date(v("date") + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";
    const lines = [
      "FEASIBILITY REVIEW REQUEST · APPARATE", "",
      "From:        " + (v("name") || "—") + (v("company") ? " · " + v("company") : ""),
      "Category:    " + v("category"),
      "Product:     " + (v("product") || "—"),
      "Qty/colors:  " + (v("qty") || "—"),
      "Fabric:      " + (fab.join(", ") || "—"),
      "Print/embr.: " + (br.join(", ") || "—"),
      "Accessories: " + (v("finishing") || "—"),
      "Delivery by: " + (d || "—"),
      "Destination: " + v("destination")
    ];
    if (fl.length) lines.push("Idea files:  " + fl.join(", ") + "  (attached separately)");
    if (v("notes")) lines.push("", "Notes: " + v("notes"));
    const txt = lines.join("\n");
    $("#briefOut").textContent = txt;
    $("#pm").style.width = (filled / 7 * 100) + "%"; $("#pmTxt").textContent = filled + " of 7 brief items";
    $("#waBrief").href = "https://wa.me/" + BD.whatsapp + "?text=" + encodeURIComponent(txt);
    $("#mailBrief").href = "mailto:" + BD.email + "?subject=" + encodeURIComponent("Feasibility review · " + (v("company") || v("product") || "New project")) + "&body=" + encodeURIComponent(txt);
    return txt;
  };
  const fin = $("#f-files"), ups = $("#ups"), drop = $("#drop");
  const renderUps = () => {
    ups.innerHTML = FILES.map((f, i) => `<div class="up">${f.url ? `<img src="${f.url}" alt="">` : `<div class="th">${esc((f.name.split(".").pop() || "FILE").slice(0, 4).toUpperCase())}</div>`}<span title="${esc(f.name)}">${esc(f.name)}</span><button type="button" aria-label="Remove ${esc(f.name)}" data-rm="${i}">×</button></div>`).join("") + (FILES.length ? `<p class="upnote">${esc(ups.dataset.note)}</p>` : "");
    buildBrief();
  };
  const addFiles = list => { Array.from(list).forEach(f => { if (FILES.length >= 8) return; FILES.push({ name: f.name, url: /^image\//.test(f.type) ? URL.createObjectURL(f) : "" }); }); renderUps(); };
  fin.addEventListener("change", () => { addFiles(fin.files); fin.value = ""; });
  ups.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (!b) return; const f = FILES.splice(+b.dataset.rm, 1)[0]; if (f && f.url) URL.revokeObjectURL(f.url); renderUps(); });
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  form.addEventListener("input", buildBrief); form.addEventListener("change", buildBrief); form.addEventListener("submit", e => e.preventDefault());
  buildBrief();
  const toast = m => { const t = $("#toast"); t.textContent = m; clearTimeout(toast.t); toast.t = setTimeout(() => t.textContent = "", 2600); };
  const selectText = el => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  $("#copyBrief").addEventListener("click", () => { const t = buildBrief(); const p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject(); p.then(() => toast("Brief copied. Paste it into WhatsApp or an email to " + BD.email)).catch(() => { selectText($("#briefOut")); toast("Brief selected. Press Ctrl/Cmd + C to copy it."); }); });
}
$$("[data-copy]").forEach(b => b.addEventListener("click", () => { const t = b.dataset.copy; const p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(t) : Promise.reject(); p.then(() => { b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1600); }).catch(() => { const s = getSelection(), r = document.createRange(); r.selectNodeContents(b.previousElementSibling.querySelector("b")); s.removeAllRanges(); s.addRange(r); b.textContent = "Selected"; setTimeout(() => b.textContent = "Copy", 1600); }); }));

/* ---------- nav ---------- */
const nav = $("#nav"), burger = $("#burger"), mnav = $("#mnav"), prog = $("#progress"); let lastY = 0;
burger.addEventListener("click", () => { const o = !mnav.classList.contains("open"); mnav.classList.toggle("open", o); burger.setAttribute("aria-expanded", String(o)); });
$$("a", mnav).forEach(a => a.addEventListener("click", () => { mnav.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); }));
addEventListener("scroll", () => {
  const y = scrollY; nav.classList.toggle("scrolled", y > 40);
  nav.classList.toggle("hide", y > lastY && y > 600 && !mnav.classList.contains("open")); lastY = y;
  const h = document.documentElement.scrollHeight - innerHeight; prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
}, { passive: true });

/* ---------- cursor + hero mouse parallax ---------- */
const cur$ = $("#cursor");
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; cur$.style.opacity = 1; });
  (function loop() { cx += (mx - cx) * .18; cy += (my - cy) * .18; cur$.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener("mouseover", e => { cur$.classList.toggle("big", !!e.target.closest("[data-cursor]")); });
  const hero = $("#hero");
  if (hero) { const layers = $$("[data-mouse]", hero);
    hero.addEventListener("mousemove", e => { const r = hero.getBoundingClientRect(); const dx = (e.clientX - r.width / 2) / r.width, dy = (e.clientY - r.height / 2) / r.height; layers.forEach(l => { const s = +l.dataset.mouse; l.style.translate = `${dx * s}px ${dy * s}px`; }); }); }
} else cur$.style.display = "none";

/* ---------- count up ---------- */
const fmt = n => Math.round(n).toLocaleString("en-US");
function countUp(el) {
  const to = +el.dataset.count, from = +(el.dataset.from || 0), suf = el.dataset.suffix || "", pre = el.dataset.prefix || "", plain = "plain" in el.dataset;
  if (reduce) return; const t0 = performance.now(), dur = 1600;
  (function f(t) { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4), v = from + (to - from) * e; el.textContent = pre + (plain ? Math.round(v) : fmt(v)) + suf; if (k < 1) requestAnimationFrame(f); })(t0);
}
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } }), { threshold: .6 });
$$("[data-count]").forEach(el => io.observe(el));
const io2 = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io2.unobserve(en.target); } }), { threshold: .4 });
$$(".method article").forEach(el => io2.observe(el));
const io3 = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("on"); io3.unobserve(en.target); } }), { threshold: .6 });
$$(".track-bar").forEach(el => io3.observe(el));

/* ---------- GSAP scroll scenes ---------- */
if (!hasG || reduce) return;
gsap.registerPlugin(ScrollTrigger);
const exists = s => !!$(s);

if (exists("#hero")) {
  gsap.to(".hero .bg", { yPercent: 10, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
}
$$("[data-speed]").forEach(el => {
  const s = +el.dataset.speed; const trig = el.closest("section") || el;
  gsap.fromTo(el, { y: () => -s * innerHeight * .5 }, { y: () => s * innerHeight * .5, ease: "none", scrollTrigger: { trigger: trig, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
});
$$("img[data-par]").forEach(img => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));
/* Reveals: IntersectionObserver (robust to layout changes), triggered ~25% of a screen BEFORE
   content enters the viewport so it is already in place when the visitor arrives. */
(function () {
  const groups = [".chapter h2", ".chapter p", ".chapter .toc", ".cta-band h2", ".cta-band p", ".cta-band .btn",
    "section:not(.chapter):not(.hero) .h2", ".vs > .vs-col", ".gaptop > *", ".values > .val", ".vm > article", ".prints > .pt",
    ".capnums > .capnum", ".routes > div", ".gate-panel > .gate", ".aql > .aq", ".controls > div", ".vis > div", ".times > .tgroup",
    ".emb ol > li", ".duo > .panel", ".faqlist > details", ".contact > div", ".method > article", ".steps > li"];
  const els = $$(groups.join(","));
  const vh = innerHeight;
  els.forEach(el => {
    if (el.getBoundingClientRect().top < vh * 1.05) return;          // already on screen: never hide
    const sib = el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : 0;
    el.classList.add("rv"); el.style.transitionDelay = Math.min(sib, 6) * 40 + "ms";
  });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { rootMargin: "0px 0px 45% 0px", threshold: 0 });
  $$(".rv").forEach(el => io.observe(el));
})();
$$(".gbar").forEach(b => gsap.from(b, { scaleX: 0, transformOrigin: "0 50%", duration: .9, ease: "power3.out", scrollTrigger: { trigger: b, start: "top 98%" } }));

/* Images: fade in when decoded (no half-painted photos), then preload the rest in the background. */
$$("main img").forEach(img => {
  if (img.complete && img.naturalWidth) return;
  img.classList.add("im"); const done = () => { img.classList.add("ok"); refreshSoon(); };
  img.addEventListener("load", done, { once: true }); img.addEventListener("error", done, { once: true });
});
let rT; function refreshSoon() { clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 250); }
addEventListener("load", () => {
  const lazy = $$('main img[loading="lazy"]'); let i = 0;
  const pump = () => { lazy.slice(i, i + 6).forEach(im => { im.loading = "eager"; }); i += 6; if (i < lazy.length) setTimeout(pump, 350); };
  setTimeout(pump, 600);
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshSoon);

if (exists("#tl")) {
  gsap.to("#tlfill", { height: "calc(100% - 16px)", ease: "none", scrollTrigger: { trigger: "#tl", start: "top 70%", end: "bottom 60%", scrub: true } });
}
if (exists("#gates")) ScrollTrigger.create({ trigger: "#gates", start: "top 60%", end: "bottom 70%", onUpdate: self => { const g = Math.min(3, Math.floor(self.progress * 4)); if (g !== setGate.last) { setGate.last = g; setGate(g); } } });
if (exists("#cats")) gsap.fromTo("#cats", { x: 80 }, { x: -40, ease: "none", scrollTrigger: { trigger: "#portfolio", start: "top bottom", end: "bottom top", scrub: true } });
if (exists("#partners")) {
  gsap.fromTo(".logos:not(.rev)", { x: -60 }, { x: 60, ease: "none", scrollTrigger: { trigger: "#partners", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".logos.rev", { x: 60 }, { x: -60, ease: "none", scrollTrigger: { trigger: "#partners", start: "top bottom", end: "bottom top", scrub: true } });
}
if (exists("#hsTrack")) {
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const track = $("#hsTrack"); const dist = () => Math.max(0, track.scrollWidth - innerWidth);
    const tw = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#process", start: "top top", end: () => "+=" + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => { $("#hsProg").style.width = (s.progress * 100) + "%"; } } });
    $$(".stage", track).forEach(st => gsap.from(st.querySelector(".n"), { yPercent: 40, opacity: 0, ease: "none", scrollTrigger: { trigger: st, containerAnimation: tw, start: "left 95%", end: "left 55%", scrub: true } }));
  });
}
addEventListener("load", () => ScrollTrigger.refresh());
})();
