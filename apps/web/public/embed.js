/*!
 * Foundura Scheme Scan embed.
 * Usage:
 *   <script src="https://YOUR-FOUNDURA-HOST/embed.js" data-state="KA" async></script>
 * Optional attributes: data-state (state code), data-stage, data-entity-type, data-lang (hi, es, de, ar or he; English by default),
 * data-max-width (px).
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
  var titles = {
    en: "Foundura Scheme Scan",
    hi: "Foundura योजना जाँच",
    es: "Comprobador de programas de Foundura",
    de: "Foundura Förder-Check",
    ar: "فحص البرامج من Foundura",
    he: "בדיקת הזכאות של Foundura",
    mr: "Foundura योजना तपासणी",
    kn: "Foundura ಯೋಜನೆ ಪರಿಶೀಲನೆ",
    ta: "Foundura திட்டச் சரிபார்ப்பு",
    te: "Foundura పథకాల తనిఖీ",
    gu: "Foundura યોજના તપાસ",
    bn: "Foundura প্রকল্প যাচাই",
  };
  var lang = Object.prototype.hasOwnProperty.call(titles, script.dataset.lang) ? script.dataset.lang : "en";
  frame.src = origin + (lang === "en" ? "" : "/" + lang) + "/embed/scan" + (params.toString() ? "?" + params : "");
  frame.title = titles[lang];
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
