(function () {
  var data = window.WORK || { cards: [], topics: [] };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  document.getElementById("title").textContent = data.title;
  document.getElementById("ask-label").textContent = data.askLabel;

  var topics = document.getElementById("topics");

  /* Buttons and panels rather than <details>: a closed <details> hides its
     content immediately, so it can only snap. A panel whose row goes from 0fr
     to 1fr animates in both directions, which means the one closing and the one
     opening move together instead of the page jumping between them. */
  var panels = [];

  function setOpen(i, open) {
    var pair = panels[i];
    pair.btn.setAttribute("aria-expanded", open ? "true" : "false");
    pair.panel.classList.toggle("is-open", open);
  }

  data.topics.forEach(function (t, i) {
    var li = el("li");

    var btn = el("button", "ask-toggle");
    btn.type = "button";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "ask-panel-" + i);
    btn.appendChild(el("span", "chev", "\u203A"));
    btn.appendChild(el("span", null, t.title));

    var panel = el("div", "ask-panel");
    panel.id = "ask-panel-" + i;
    var inner = el("div");
    var ul = el("ul", "ask-points");
    if (t.points && t.points.length) {
      t.points.forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
    } else {
      ul.appendChild(el("li", "pending", "Points to come."));
    }
    inner.appendChild(ul);
    panel.appendChild(inner);

    btn.addEventListener("click", function () {
      var isOpen = panel.classList.contains("is-open");
      panels.forEach(function (_, n) { setOpen(n, false); });
      if (!isOpen) setOpen(i, true);
    });

    panels.push({ btn: btn, panel: panel });
    li.appendChild(btn);
    li.appendChild(panel);
    topics.appendChild(li);
  });

  /* The categories pair up in Ryan's order, so they head their section rather
     than repeating on both cards underneath it. */
  var root = document.getElementById("gallery");
  var grid = null;
  var lastTag = null;

  data.cards.forEach(function (card) {
    if (card.tag !== lastTag) {
      var group = el("section", "group");
      group.appendChild(el("h2", "group-title", card.tag));
      grid = el("div", "grid");
      group.appendChild(grid);
      root.appendChild(group);
      lastTag = card.tag;
    }
    var live = card.status === "live" && card.href;
    var node = el(live ? "a" : "div", "card " + (live ? "card--live" : "card--soon"));
    if (live) {
      node.href = card.href;
      if (/^https?:/.test(card.href)) {
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      }
    }

    var phone = card.frame === "phone";
    var shot = el("div", "card-shot" + (phone ? " card-shot--phone" : ""));
    if (phone && card.frameBg) shot.style.background = card.frameBg;
    if (card.shot) {
      var img = el("img");
      img.src = card.shot + (data.shotsVersion ? "?v=" + data.shotsVersion : "");
      img.alt = "";
      img.loading = "lazy";
      if (phone) {
        var device = el("div", "phone");
        device.appendChild(img);
        shot.appendChild(device);
      } else {
        shot.appendChild(img);
      }
    } else {
      shot.appendChild(el("span", "placeholder", "Coming soon, ask me about it!"));
    }
    node.appendChild(shot);

    node.appendChild(el("h3", "card-title", card.title));

    if (card.blurb) node.appendChild(el("p", "card-blurb", card.blurb));

    grid.appendChild(node);
  });

  /* Scroll hint: visible while there is page left, gone by the bottom. */
  var hint = document.getElementById("scroll-hint");
  if (hint) {
    var FADE = 320; // px over which it fades out at the end
    var queued = false;

    function paintHint() {
      queued = false;
      var remaining =
        document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      hint.style.opacity = Math.max(0, Math.min(1, remaining / FADE));
    }
    function onScroll() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(paintHint);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    /* the grid grows as lazy screenshots land, so re-measure after they do */
    window.addEventListener("load", paintHint);
    paintHint();
  }
})();