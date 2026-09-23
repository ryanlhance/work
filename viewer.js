(function () {
  var frame = document.getElementById("app-frame");
  if (!frame) return;

  /* Same-origin once deployed (everything is on one github.io host), which is
     what lets the shell touch the framed page at all. The dev server proxies
     the ones that need it so the preview behaves the same. */
  var isDev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var local = frame.getAttribute("data-src-local");

  frame.addEventListener("load", function () {
    var doc;
    try {
      doc = frame.contentDocument;
    } catch (e) {
      return; /* different origin: leave the piece exactly as it is */
    }
    if (!doc) return;

    var css = frame.getAttribute("data-inject");
    if (css) {
      var style = doc.createElement("style");
      style.textContent = css;
      doc.head.appendChild(style);
    }

    /* Any image a piece left natively draggable will start an HTML5 drag that
       keeps following the cursor after the button comes up. */
    doc.addEventListener("dragstart", function (e) { e.preventDefault(); }, true);

    /* A short page paints its background only as far as its content, and an
       iframe is transparent below that — so the portfolio's own paper showed
       through the bottom of the piece. Let the stage wear the piece's colour. */
    var stage = document.querySelector(".viewer-stage");
    var view = doc.defaultView;
    var bg = view.getComputedStyle(doc.body).backgroundColor;
    if (!bg || bg === "transparent" || /rgba\(0, 0, 0, 0\)/.test(bg)) {
      bg = view.getComputedStyle(doc.documentElement).backgroundColor;
    }
    if (bg && bg !== "transparent" && !/rgba\(0, 0, 0, 0\)/.test(bg)) {
      stage.style.background = bg;
    }
  });

  frame.src = (isDev && local) ? local : frame.getAttribute("data-src");
})();
