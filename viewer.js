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

    /* Safety net. import_pieces.py normally expands the abbreviated title when a
       piece is re-exported into this repo. If a fresh export is dropped in
       without running it, do it here so the page still reads correctly. */
    retitle(doc);

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

  function retitle(doc) {
    var prefix = frame.getAttribute("data-retitle-prefix");
    var club = frame.getAttribute("data-retitle-club");
    if (!prefix || !club) return;
    if (doc.querySelector(".dchc-title")) return; /* already expanded at import */

    var h1 = doc.querySelector("h1");
    if (!h1 || h1.textContent.indexOf(prefix + " ") !== 0) return;
    var tool = h1.textContent.slice(prefix.length + 1);

    h1.className = "dchc-title";
    h1.textContent = "";
    var c = doc.createElement("span");
    c.className = "club";
    c.textContent = club;
    var t = doc.createElement("span");
    t.className = "tool";
    t.textContent = tool;
    h1.appendChild(c);
    h1.appendChild(t);

    var st = doc.createElement("style");
    st.textContent =
      ".dchc-title{display:block}" +
      ".dchc-title .club{display:block;font-weight:500;font-size:max(11px,0.42em);" +
      "line-height:1.15;opacity:.62;margin-bottom:.12em;text-transform:none}" +
      ".dchc-title .tool{display:block;font-weight:600;letter-spacing:-.018em;" +
      "line-height:1.02;text-transform:none}";
    doc.head.appendChild(st);
  }

  frame.src = (isDev && local) ? local : frame.getAttribute("data-src");
})();
