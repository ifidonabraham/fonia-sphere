/**
 * Fonia Labs — Site Attribution Badge
 * ─────────────────────────────────────────────────────────────
 * Add ONE line to any site's HTML (before </body>):
 *
 *   <script src="https://fonia-labs.vercel.app/embed/fonia-badge.js"></script>
 *
 * ── Options (data-* attributes on the <script> tag) ──────────
 *
 *   data-label="A Fonia Labs Company"    default text (change to "Product", "Venture", etc.)
 *   data-theme="auto"                    follows system dark/light mode  (default)
 *   data-theme="dark"                    dark pill — good for light-background sites
 *   data-theme="light"                   light pill — good for dark-background sites
 *   data-position="bottom-right"         floating badge, bottom-right corner (default)
 *   data-position="bottom-left"          floating badge, bottom-left corner
 *   data-position="inline"              renders in place — put the tag inside your footer
 *
 * ── Examples ─────────────────────────────────────────────────
 *
 *   // Default — floating, auto-theme, "A Fonia Labs Company"
 *   <script src="https://fonia-labs.vercel.app/embed/fonia-badge.js"></script>
 *
 *   // Product label, inline in footer, forced dark pill
 *   <script src="https://fonia-labs.vercel.app/embed/fonia-badge.js"
 *           data-label="A Fonia Labs Product"
 *           data-position="inline"
 *           data-theme="dark"></script>
 *
 *   // Bottom-left, light pill
 *   <script src="https://fonia-labs.vercel.app/embed/fonia-badge.js"
 *           data-label="A Fonia Labs Company"
 *           data-position="bottom-left"
 *           data-theme="light"></script>
 *
 * ─────────────────────────────────────────────────────────────
 * © Fonia Labs · https://fonia-labs.vercel.app
 */
(function () {
  "use strict";

  var SITE_URL = "https://fonia-labs.vercel.app";

  /* ── Read config from the <script> tag ───────────────────── */
  var currentScript =
    document.currentScript ||
    (function () {
      var s = document.getElementsByTagName("script");
      return s[s.length - 1];
    })();

  var label    = (currentScript && currentScript.getAttribute("data-label"))    || "A Fonia Labs Company";
  var theme    = (currentScript && currentScript.getAttribute("data-theme"))    || "auto";
  var position = (currentScript && currentScript.getAttribute("data-position")) || "bottom-right";

  /* ── Theme resolve ────────────────────────────────────────── */
  function isDark() {
    if (theme === "dark")  return true;
    if (theme === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  /* ── O-Core mark (inline SVG — no external fetch needed) ─── */
  var MARK = [
    '<svg width="20" height="20" viewBox="0 0 64 64" fill="none"',
      'xmlns="http://www.w3.org/2000/svg" aria-hidden="true"',
      'style="display:block;flex-shrink:0">',
      '<circle cx="32" cy="32" r="28" stroke="#38bdf8" stroke-width="3.2"',
        'stroke-opacity="0.55" stroke-linecap="round"',
        'stroke-dasharray="38.5 5.5" transform="rotate(-45 32 32)"/>',
      '<circle cx="32" cy="32" r="21" stroke="#94a3b8" stroke-width="2.4"',
        'stroke-opacity="0.45" stroke-linecap="round"',
        'stroke-dasharray="28.5 4.5" transform="rotate(-45 32 32)"/>',
      '<circle cx="32" cy="32" r="14" stroke="#38bdf8" stroke-width="1.8"',
        'stroke-opacity="0.5" stroke-linecap="round"',
        'stroke-dasharray="18 3.8" transform="rotate(-45 32 32)"/>',
      '<circle cx="32" cy="32" r="7.5" fill="#38bdf8" fill-opacity="0.9"/>',
      '<ellipse cx="29.5" cy="28.5" rx="2.8" ry="1.8" fill="white"',
        'fill-opacity="0.45" transform="rotate(-30 29.5 28.5)"/>',
    '</svg>'
  ].join(" ");

  /* ── Build badge element ──────────────────────────────────── */
  function buildBadge(dark) {
    var badge = document.createElement("a");
    badge.href   = SITE_URL;
    badge.target = "_blank";
    badge.rel    = "noopener noreferrer";
    badge.id     = "fonia-labs-badge";
    badge.setAttribute("aria-label", label + " — Fonia Labs");
    badge.title  = label + " — Visit Fonia Labs";

    /* All styles inline — never clash with the host site's CSS */
    var pill = dark
      ? "background:rgba(11,17,32,0.88);border:1px solid rgba(148,163,184,0.18);box-shadow:0 4px 20px rgba(0,0,0,0.35);"
      : "background:rgba(255,255,255,0.93);border:1px solid rgba(0,0,0,0.1);box-shadow:0 4px 16px rgba(0,0,0,0.12);";

    badge.style.cssText = [
      "display:inline-flex",
      "align-items:center",
      "gap:8px",
      "padding:7px 13px 7px 9px",
      "border-radius:999px",
      "text-decoration:none",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
      "cursor:pointer",
      "backdrop-filter:blur(12px)",
      "-webkit-backdrop-filter:blur(12px)",
      "transition:opacity 0.2s,transform 0.2s",
      pill
    ].join(";");

    /* Mark */
    var markEl = document.createElement("span");
    markEl.style.cssText = "display:flex;align-items:center;flex-shrink:0";
    markEl.innerHTML = MARK;

    /* Text stack */
    var textEl = document.createElement("span");
    textEl.style.cssText = "display:flex;flex-direction:column;gap:1px";

    /* Line 1 — label e.g. "A Fonia Labs Company" */
    var line1 = document.createElement("span");
    line1.style.cssText = [
      "display:block",
      "font-size:10px",
      "font-weight:600",
      "letter-spacing:0.04em",
      dark ? "color:#94a3b8" : "color:#64748b"
    ].join(";");
    line1.textContent = label;

    /* Line 2 — styled wordmark "Fon·ia·LABS" */
    var line2 = document.createElement("span");
    line2.style.cssText = "display:flex;align-items:baseline;gap:0;font-size:12.5px;font-weight:700;letter-spacing:-0.02em";

    var fon  = document.createElement("span");
    fon.style.cssText  = dark ? "color:#f1f5f9" : "color:#0f172a";
    fon.textContent    = "Fon";

    var ia   = document.createElement("span");
    ia.style.cssText   = "color:#38bdf8";
    ia.textContent     = "ia";

    var labs = document.createElement("span");
    labs.style.cssText = [
      "font-size:8.5px",
      "letter-spacing:0.32em",
      "margin-left:5px",
      "align-self:center",
      dark ? "color:#64748b" : "color:#94a3b8"
    ].join(";");
    labs.textContent = "LABS";

    line2.appendChild(fon);
    line2.appendChild(ia);
    line2.appendChild(labs);
    textEl.appendChild(line1);
    textEl.appendChild(line2);
    badge.appendChild(markEl);
    badge.appendChild(textEl);

    badge.addEventListener("mouseenter", function () {
      badge.style.opacity   = "0.82";
      badge.style.transform = "translateY(-2px)";
    });
    badge.addEventListener("mouseleave", function () {
      badge.style.opacity   = "1";
      badge.style.transform = "translateY(0)";
    });

    return badge;
  }

  /* ── Position wrapper (floating modes) ───────────────────── */
  function buildWrapper() {
    var w = document.createElement("div");
    w.id  = "fonia-labs-badge-wrap";
    w.style.cssText = [
      "position:fixed",
      "z-index:9999",
      "bottom:18px",
      position === "bottom-left" ? "left:18px" : "right:18px",
      "pointer-events:auto"
    ].join(";");
    return w;
  }

  /* ── Inject ───────────────────────────────────────────────── */
  function inject() {
    if (document.getElementById("fonia-labs-badge")) return;

    var dark  = isDark();
    var badge = buildBadge(dark);

    if (position === "inline") {
      var wrap = document.createElement("span");
      wrap.id  = "fonia-labs-badge-wrap";
      wrap.style.cssText = "display:inline-flex;vertical-align:middle";
      wrap.appendChild(badge);
      currentScript.parentNode.insertBefore(wrap, currentScript.nextSibling);
    } else {
      var fw = buildWrapper();
      fw.appendChild(badge);
      document.body.appendChild(fw);
    }

    if (theme === "auto" && window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
        var nb = buildBadge(e.matches);
        badge.parentNode.replaceChild(nb, badge);
        badge = nb;
      });
    }
  }

  if (document.body) {
    inject();
  } else {
    document.addEventListener("DOMContentLoaded", inject);
  }
})();
