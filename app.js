(function () {
  var data = window.WORK || { cards: [], topics: [] };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function shotNode(card) {
    var wrap = el("div", "card-shot");
    if (card.shot) {
      var img = el("img");
      img.src = card.shot;
      img.alt = "";
      img.loading = "lazy";
      wrap.appendChild(img);
    } else {
      wrap.className = "card-shot card-shot--empty";
      wrap.appendChild(el("span", null, "Coming soon"));
    }
    return wrap;
  }

  function cardNode(card) {
    var live = card.status === "live" && card.href;
    var node = el(live ? "a" : "div", "card " + (live ? "card--live" : "card--soon"));
    if (live) {
      node.href = card.href;
      if (/^https?:/.test(card.href)) {
        node.target = "_blank";
        node.rel = "noopener noreferrer";
      }
    }

    node.appendChild(shotNode(card));

    var body = el("div", "card-body");
    if (card.tag) body.appendChild(el("p", "card-tag", card.tag));
    body.appendChild(el("h2", "card-title", card.title));
    if (card.blurb) body.appendChild(el("p", "card-blurb", card.blurb));

    if (live) {
      var go = el("p", "card-go");
      go.appendChild(el("span", null, "Open"));
      go.appendChild(el("span", "arrow", "→"));
      body.appendChild(go);
    }

    node.appendChild(body);
    return node;
  }

  var gallery = document.getElementById("gallery");
  data.cards.forEach(function (c) { gallery.appendChild(cardNode(c)); });

  var topics = document.getElementById("topics");
  data.topics.forEach(function (t, i) {
    var li = el("li");
    li.appendChild(el("span", "num", String(i + 1).padStart(2, "0")));
    li.appendChild(el("span", null, t));
    topics.appendChild(li);
  });
})();
