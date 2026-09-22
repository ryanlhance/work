(function () {
  var d = window.WORKSHOP;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* The one disagreement the gates exist to catch: the flows report says the
     Global Equity Fund returned 1.24% this week, the performance extract says
     1.42%. Flag both cells so the reader sees it before the gate explains it. */
  var FLAG = { fund: "Global Equity Fund", cols: ["1W Return (%)", "WTD Perf (%)"] };

  function tableNode(t) {
    var wrap = el("div", "table-wrap");
    var tbl = el("table");

    var thead = el("thead"), hr = el("tr");
    t.head.forEach(function (h) { hr.appendChild(el("th", null, h)); });
    thead.appendChild(hr);
    tbl.appendChild(thead);

    var tbody = el("tbody");
    t.rows.forEach(function (row) {
      var tr = el("tr");
      var isFlagRow = row.indexOf(FLAG.fund) !== -1;
      row.forEach(function (cell, i) {
        var td = el("td", null, cell);
        if (i > 0 && cell !== "" && !isNaN(Number(cell))) td.classList.add("num");
        if (isFlagRow && FLAG.cols.indexOf(t.head[i]) !== -1) td.classList.add("flag");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    wrap.appendChild(tbl);
    return wrap;
  }

  function fileNode(f) {
    var node = el("article", "file");

    var head = el("div", "file-head");
    head.appendChild(el("span", "file-kind", f.kind));
    head.appendChild(el("span", "file-name", f.file));
    head.appendChild(el("span", "file-role", f.role));
    node.appendChild(head);

    if (f.note) node.appendChild(el("p", "file-note", f.note));

    if (f.table) node.appendChild(tableNode(f.table));

    if (f.sheets) {
      f.sheets.forEach(function (s) {
        node.appendChild(el("p", "sheet-name", s.name));
        node.appendChild(tableNode(s.table));
      });
      var note = el("div", "gap-note");
      note.innerHTML =
        "<strong>The gap.</strong> This sheet puts the Global Equity Fund at 1.24% for the week. " +
        "The Performance Extract puts it at 1.42%. Gate 2 catches the disagreement, the brief uses " +
        "the source of record, and the review sheet shows both numbers so a person decides.";
      node.appendChild(note);
    }

    if (f.paras) {
      var body = el("div", "commentary");
      f.paras.forEach(function (para) { body.appendChild(el("p", null, para)); });
      node.appendChild(body);
    }

    return node;
  }

  var inputs = document.getElementById("inputs");
  d.inputs.forEach(function (f) { inputs.appendChild(fileNode(f)); });

  var rules = document.getElementById("rules");
  d.rules.forEach(function (r) { rules.appendChild(el("li", null, r)); });

  var gates = document.getElementById("gates");
  d.gates.forEach(function (g) {
    var n = el("div", "gate");
    n.appendChild(el("p", "gate-n", "Gate " + g.n));
    n.appendChild(el("h3", null, g.name));
    n.appendChild(el("p", "gate-script", g.script));
    n.appendChild(el("p", "protects", g.protects));
    gates.appendChild(n);
  });

  /* ---- output pages + lightbox ---- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");

  function openLb(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }
  document.getElementById("lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  var pages = document.getElementById("pages");
  d.output.pages.forEach(function (p) {
    var fig = el("div", "pg");
    var btn = el("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Enlarge: " + p.label);
    var img = el("img");
    img.src = p.src;
    img.alt = p.label;
    img.loading = "lazy";
    btn.appendChild(img);
    btn.addEventListener("click", function () { openLb(p.src, p.label); });
    fig.appendChild(btn);
    fig.appendChild(el("p", "label", p.label));
    pages.appendChild(fig);
  });

  document.getElementById("pdf-link").href = d.output.pdf;
})();
