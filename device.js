(function () {
  var stage = document.querySelector(".stage");
  var device = document.querySelector(".device");
  var frame = document.getElementById("app-frame");
  if (!device || !frame) return;

  var SHELL_H = 812 + 22; // screen plus bezel padding
  var SHELL_W = 375 + 22;

  /* A desktop browser reports env(safe-area-inset-*) as 0, so apps that pad
     with it sit flush against the top of the shell — the "cornered" look. The
     shell is same-origin with the app, so it can hand the real insets over. */
  function onFrameLoad() {
    var doc;
    try {
      doc = frame.contentDocument;
    } catch (e) {
      return; /* different origin: leave the app as it renders */
    }
    if (!doc) return;

    var css = device.getAttribute("data-inject");
    if (css) {
      var style = doc.createElement("style");
      style.textContent = css;
      doc.head.appendChild(style);
    }

    /* A phone has no drag-and-drop. Any image the app left natively draggable
       will start an HTML5 drag when someone swipes across it with a mouse, and
       the ghost keeps following the cursor after they let go. */
    doc.addEventListener("dragstart", function (e) { e.preventDefault(); }, true);
  }

  /* Scale the whole device to fit the window. The viewport inside stays 375
     wide so the app lays out exactly as it would on a phone. */
  var wrap = document.querySelector(".device-wrap");
  var MIN_TOP = 28;

  function fit() {
    var stageH = stage.clientHeight;
    var scale = Math.min(1, (stageH - MIN_TOP) / SHELL_H, stage.clientWidth / SHELL_W);
    scale = Math.max(scale, 0.42);
    device.style.transform = "scale(" + scale + ")";
    // sit the phone in the middle of whatever room is left, not jammed at the top
    if (wrap) wrap.style.top = Math.max(MIN_TOP, (stageH - SHELL_H * scale) / 2) + "px";
  }

  /* Deployed, the shell and the app share an origin, so the insets can be
     handed over. On the dev server they would not, which would hide the very
     thing we are checking — so preview against a local copy when there is one. */
  var local = device.getAttribute("data-app-local");
  var isDev = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  frame.addEventListener("load", onFrameLoad);
  frame.src = (isDev && local) ? local : device.getAttribute("data-app");

  fit();
  window.addEventListener("resize", fit);
})();
