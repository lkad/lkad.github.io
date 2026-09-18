document.addEventListener("DOMContentLoaded", function () {
  if (typeof mermaid === "undefined") return;
  if (window.__mermaidInited) return;
  window.__mermaidInited = true;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: "neutral",
    flowchart: { curve: "basis", useMaxWidth: true },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true }
  });

  // Jekyll/Kramdown emits ```mermaid as <pre><code class="language-mermaid">,
  // which mermaid's default `.mermaid` selector does not match. Pass the
  // code-block selector explicitly so both forms render.
  if (typeof mermaid.run === "function") {
    mermaid
      .run({ querySelector: "pre > code.language-mermaid, code.language-mermaid" })
      .catch(function () { /* swallow per-diagram errors, keep page usable */ });
  }
});
