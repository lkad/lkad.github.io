(function () {
  "use strict";
  if (typeof mermaid === "undefined") return;
  if (window.__mermaidInited) return;
  window.__mermaidInited = true;

  var SELECTOR = "pre > code.language-mermaid, code.language-mermaid";
  var nodes = [];
  var sources = [];
  var pending = false;
  var lastTheme = null;

  function isDark() {
    // Chirpy 7.6 exposes `Theme` with a static isDark getter.
    try {
      if (window.Theme && typeof window.Theme.isDark === "boolean") {
        return window.Theme.isDark;
      }
    } catch (e) { /* ignore */ }
    // Fallback: Chirpy flips data-bs-theme on <html>.
    var el = document.documentElement;
    var attr =
      el.getAttribute("data-bs-theme") ||
      el.getAttribute("data-mode") ||
      el.getAttribute("data-theme");
    if (attr) return /dark/i.test(attr);
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function themeName() {
    return isDark() ? "dark" : "neutral";
  }

  function run() {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: themeName(),
      flowchart: { curve: "basis", useMaxWidth: true },
      sequence: { useMaxWidth: true },
      gantt: { useMaxWidth: true }
    });
    lastTheme = themeName();
    return mermaid.run({ querySelector: ".mermaid" }).catch(function () {
      /* keep the page usable if one diagram fails */
    });
  }

  function collect() {
    // Bail out if Chirpy's own mermaid handler already ran (it creates
    // <pre class="mermaid"> and hides the original code block). In that case
    // the theme handles both rendering and theme switching itself.
    if (document.querySelector("pre.mermaid")) return false;

    var codes = [].slice.call(document.querySelectorAll(SELECTOR));
    if (!codes.length) return false;

    nodes = codes.map(function (code) {
      var target = code.closest("pre") || code;
      var div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = code.textContent;
      target.replaceWith(div);
      return div;
    });
    sources = nodes.map(function (div) {
      return div.textContent;
    });
    return true;
  }

  function rerender() {
    if (!nodes.length) return;
    if (themeName() === lastTheme) return;
    // Rebuild fresh nodes so mermaid re-renders from the original source
    // instead of skipping elements it has already processed.
    nodes = nodes.map(function (node, i) {
      var fresh = document.createElement("div");
      fresh.className = "mermaid";
      fresh.textContent = sources[i];
      if (node.isConnected) node.replaceWith(fresh);
      return fresh;
    });
    run();
  }

  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      rerender();
    });
  }

  function watchTheme() {
    // Chirpy broadcasts this on every theme change.
    window.addEventListener("message", function (e) {
      if (e.source === window && e.data && e.data.id === "theme-updated") schedule();
    });
    // Fallback in case the event is missed: observe the attribute Chirpy flips.
    new MutationObserver(schedule).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-bs-theme", "data-mode", "data-theme"]
    });
    // Theme mode "system": follows OS preference changes.
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", schedule);
    } catch (e) { /* older browsers */ }
  }

  function start() {
    if (!collect()) return;
    watchTheme();
    run();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
