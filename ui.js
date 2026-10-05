// Interface behaviour: nav, reveal, parallax, counter animation, loader.
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initNav() {
  const btn = document.querySelector(".menu-btn"), drawer = document.getElementById("drawer");
  if (!btn || !drawer) return;
  const set = open => { btn.setAttribute("aria-expanded", open); btn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); drawer.classList.toggle("open", open); document.body.classList.toggle("lock", open); drawer.inert = !open; };
  set(false);
  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && drawer.classList.contains("open")) { set(false); btn.focus(); } });
  drawer.addEventListener("click", e => { if (e.target === drawer || e.target.closest("a, [data-open-join]")) set(false); });
  matchMedia("(min-width:1180px)").addEventListener("change", e => e.matches && set(false));
}

export function initReveal() {
  const els = document.querySelectorAll(".rv");
  if (reduce || !("IntersectionObserver" in window)) return els.forEach(e => e.classList.add("in"));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
  els.forEach(e => io.observe(e));
}

export function initParallax() {
  const layers = document.querySelectorAll("[data-parallax]");
  if (reduce || !layers.length) return;
  let t = false;
  addEventListener("scroll", () => { if (t) return; t = true; requestAnimationFrame(() => { const y = Math.min(scrollY, innerHeight); layers.forEach(l => l.style.transform = `translate3d(0,${y * +l.dataset.parallax}px,0)`); t = false; }); }, { passive: true });
}

export function initModal() {
  const dlg = document.getElementById("join");
  if (!dlg) return;
  document.addEventListener("click", e => {
    const o = e.target.closest("[data-open-join]");
    if (o) { e.preventDefault(); if (!dlg.open) dlg.showModal(); dlg.querySelector("input,select")?.focus(); }
    if (e.target === dlg || e.target.closest(".x")) dlg.close();
  });
}

const fmt = n => n.toLocaleString("en-US").padStart(2, "0");
const shown = new WeakMap();
let last = null;
export const refreshCount = () => last !== null && renderCount(last);
export function renderCount(n) {
  last = n;
  document.querySelectorAll("[data-count]").forEach(box => {
    const out = box.querySelector("b"); box.dataset.state = "ok";
    const from = shown.get(out) ?? n; shown.set(out, n);
    if (reduce || from === n) { out.textContent = fmt(n); return; }
    const t0 = performance.now(), dur = 1100;
    (function step(t) { const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); out.textContent = fmt(Math.round(from + (n - from) * e)); if (p < 1) requestAnimationFrame(step); })(t0);
  });
  document.querySelectorAll("[data-count-mini]").forEach(e => e.textContent = fmt(n) + " MEMBERS");
}
export function renderCountError() {
  document.querySelectorAll("[data-count]").forEach(box => { box.dataset.state = "error"; box.querySelector("b").textContent = "COMMUNITY COUNT UNAVAILABLE"; });
  document.querySelectorAll("[data-count-mini]").forEach(e => e.textContent = "");
}

export function initChrome() {
  document.querySelectorAll("[data-year]").forEach(e => e.textContent = new Date().getFullYear());
  document.querySelectorAll("img[data-logo]").forEach(i => i.addEventListener("error", () => document.documentElement.classList.add("no-logo")));
  const done = () => document.getElementById("loader")?.classList.add("done");
  document.readyState === "complete" ? done() : addEventListener("load", done); setTimeout(done, 2500);
  if ("serviceWorker" in navigator && location.protocol !== "file:") addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(e => console.warn("SW registration failed", e)));
}
