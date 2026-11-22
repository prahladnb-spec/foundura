/*!
 * Foundura Scheme Scan embed.
 * Usage:
 *   <script src="https://YOUR-FOUNDURA-HOST/embed.js" data-state="KA" async></script>
 * Optional attributes: data-state (state code), data-stage, data-entity-type, data-max-width (px).
 * The widget sets no cookies and stores no answers.
 */
(function () {
  var script = document.currentScript;
  if (!script) return;
  var origin = new URL(script.src).origin;
  var params = new URLSearchParams();
  if (script.dataset.state) params.set("state", script.dataset.state);
  if (script.dataset.stage) params.set("stage", script.dataset.stage);
  if (script.dataset.entityType) params.set("entityType", script.dataset.entityType);

  var frame = document.createElement("iframe");
  frame.src = origin + "/embed/scan" + (params.toString() ? "?" + params : "");
  frame.title = "Foundura Scheme Scan";
  frame.loading = "lazy";
  frame.style.cssText =
    "width:100%;max-width:" + (script.dataset.maxWidth || "960") + "px;height:900px;border:0;display:block;";
  script.parentNode.insertBefore(frame, script.nextSibling);

  window.addEventListener("message", function (e) {
    if (e.origin !== origin || e.source !== frame.contentWindow) return;
    var d = e.data;
    if (d && d.type === "foundura:height" && typeof d.height === "number") {
      frame.style.height = Math.min(Math.max(d.height, 300), 20000) + "px";
    }
  });
})();
