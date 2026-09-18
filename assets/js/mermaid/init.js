document.addEventListener("DOMContentLoaded", function () {
  if (typeof mermaid === "undefined") return;
  if (window.__mermaidInited) return;
  window.__mermaidInited = true;
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: "loose",
    theme: "neutral",
    flowchart: { curve: "basis", useMaxWidth: true },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true }
  });
  if (typeof mermaid.run === "function") {
    try { mermaid.run(); } catch (e) { /* noop */ }
  }
});