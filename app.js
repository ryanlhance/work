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
  data.topics.forEach(function (t) {
    var li = el("li");
    var det = el("details");
    var sum = el("summary");
    sum.appendChild(el("span", "chev", "\u203A"));
    sum.appendChild(el("span", null, t.title));
    det.appendChild(sum);

    var ul = el("ul", "ask-points");
    if (t.points && t.points.length) {
      t.points.forEach(function (pt) { ul.appendChild(el("li", null, pt)); });
    } else {
      ul.appendChild(el("li", "pending", "Points to come."));
    }
    det.appendChild(ul);
    /* accordion: opening one closes the rest */
    det.addEventListener("toggle", function () {
      if (!det.open) return;
      topics.querySelectorAll("details[open]").forEach(function (other) {
        if (other !== det) other.open = false;
      });
    });
    li.appendChild(det);
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