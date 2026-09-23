(function () {
  var d = window.WORKSHOP;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function set(id, text) {
    var n = document.getElementById(id);
    if (n) n.textContent = text;
  }

  /* The one disagreement the gates exist to catch. */
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
        if (isFlagRow && FLAG.cols.indexOf(t.head[i]) !== -1) td.classList.add("flag");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    wrap.appendChild(tbl);
    if (t.more) wrap.appendChild(el("p", "row-count", t.rows.length + " of " + t.more + " rows"));
    return wrap;
  }

  /* ---------- use case ---------- */
  var uc = d.use_case;
  var ucNode = document.getElementById("use-case");
  if (uc && ucNode) {
    var story = el("div", "uc-story");
    uc.situation.forEach(function (p) { story.appendChild(el("p", null, p)); });
    ucNode.appendChild(story);

    var boxes = el("div", "uc-boxes");
    [["Requirements", uc.asked_for], ["Notes", uc.constraints]].forEach(function (pair) {
      var box = el("div", "uc-box");
      box.appendChild(el("h3", null, pair[0]));
      var ul = el("ul");
      pair[1].forEach(function (t) { ul.appendChild(el("li", null, t)); });
      box.appendChild(ul);
      boxes.appendChild(box);
    });
    ucNode.appendChild(boxes);
  }

  /* ---------- files: desktop-style, click to open ---------- */
  var row = document.getElementById("files-row");
  var panel = document.getElementById("file-panel");
  var openIndex = -1;

  function fileBody(f) {
    var body = el("div", "file-body");
    if (f.table) body.appendChild(tableNode(f.table));
    if (f.sheets) {
      f.sheets.forEach(function (s) {
        body.appendChild(el("p", "sheet-name", s.name));
        body.appendChild(tableNode(s.table));
      });
      var note = el("div", "gap-note");
      note.innerHTML =
        "<strong>The gap.</strong> Global Equity is 1.24% here and 1.42% in the " +
        "Performance Extract. Gate 2 catches it; the review sheet shows both so a " +
        "person decides.";
      body.appendChild(note);
    }
    if (f.paras) {
      var c = el("div", "commentary");
      f.paras.forEach(function (p) { c.appendChild(el("p", null, p)); });
      body.appendChild(c);
    }
    return body;
  }

  function openFile(i) {
    var chips = row.querySelectorAll(".file-chip");
    if (openIndex === i) {
      openIndex = -1;
      panel.hidden = true;
      panel.innerHTML = "";
      chips[i].classList.remove("is-open");
      chips[i].setAttribute("aria-expanded", "false");
      return;
    }
    openIndex = i;
    panel.innerHTML = "";
    var f = d.inputs[i];
    var head = el("div", "file-panel-head");
    head.appendChild(el("span", "file-name", f.file));
    head.appendChild(el("span", "file-role", f.role));
    panel.appendChild(head);
    panel.appendChild(fileBody(f));
    panel.hidden = false;
    chips.forEach(function (c, n) {
      c.classList.toggle("is-open", n === i);
      c.setAttribute("aria-expanded", n === i ? "true" : "false");
    });
  }

  d.inputs.forEach(function (f, i) {
    var chip = el("button", "file-chip");
    chip.type = "button";
    chip.setAttribute("aria-expanded", "false");

    var icon = el("span", "file-icon");
    icon.innerHTML =
      '<svg viewBox="0 0 40 50" aria-hidden="true">' +
      '<path d="M4 2h22l10 10v36a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>' +
      '<path class="fold" d="M26 2v10h10"/></svg>' +
      '<span class="file-kind">' + f.kind + "</span>";
    chip.appendChild(icon);
    chip.appendChild(el("span", "file-label", f.file.replace(/^AI Interview /, "")));
    chip.addEventListener("click", function () { openFile(i); });
    row.appendChild(chip);
  });

  /* ---------- strategy ---------- */
  var strat = document.getElementById("strategy");
  (d.strategy || []).forEach(function (item) {
    var li = el("li", "strat");
    li.appendChild(el("h3", null, item.decision));
    if (item.why) li.appendChild(el("p", null, item.why));
    if (item.bullets) {
      var ul = el("ul", "strat-list");
      item.bullets.forEach(function (b) { ul.appendChild(el("li", null, b)); });
      li.appendChild(ul);
    }
    strat.appendChild(li);
  });

  /* ---------- outputs ---------- */
  var o = d.output;
  set("email-label", o.email.label);
  set("email-note", o.email.note);
  set("dash-label", o.dashboard.label);
  set("dash-note", o.dashboard.note);
  set("gates-label", o.gates_label);
  set("gates-note", o.gates_note);
  set("skill-label", o.skill.label);
  set("skill-note", o.skill.note);

  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  function closeLb() {
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }
  document.getElementById("lb-close").addEventListener("click", closeLb);
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) closeLb(); });

  var pages = document.getElementById("pages");
  o.pages.forEach(function (p) {
    var fig = el("div", "pg");
    var btn = el("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Enlarge: " + p.label);
    var img = el("img");
    img.src = p.src;
    img.alt = p.label;
    img.loading = "lazy";
    btn.appendChild(img);
    btn.addEventListener("click", function () {
      lbImg.src = p.src;
      lbImg.alt = p.label;
      lb.hidden = false;
      document.body.style.overflow = "hidden";
    });
    fig.appendChild(btn);
    fig.appendChild(el("p", "label", p.label));
    pages.appendChild(fig);
  });
  document.getElementById("pdf-link").href = o.pdf;

  /* ---------- gates ---------- */
  var gates = document.getElementById("gates");
  d.gates.forEach(function (g) {
    var n = el("div", "gate");
    n.appendChild(el("h4", null, "Gate " + g.n + ". " + g.name));
    n.appendChild(el("p", "gate-script", g.script));
    n.appendChild(el("p", "protects", g.protects));
    gates.appendChild(n);
  });

  /* ---------- skill ---------- */
  var skill = document.getElementById("skill");
  var list = el("ul", "skill-files");
  o.skill.contents.forEach(function (f) { list.appendChild(el("li", null, f)); });
  skill.appendChild(list);
  var dl = el("p", "download");
  var a = el("a", null, "Download the skill");
  a.href = o.skill.file;
  a.setAttribute("download", "");
  dl.appendChild(a);
  skill.appendChild(dl);

  /* ---------- live dashboard: size the frame to its content ---------- */
  var frame = document.getElementById("dash-frame");
  function fitFrame() {
    try {
      var doc = frame.contentDocument;
      if (!doc) return;
      var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
      if (h) frame.style.height = h + "px";
    } catch (e) {
      frame.style.height = "820px"; /* different origin: fall back to a fixed box */
    }
  }
  frame.addEventListener("load", function () {
    fitFrame();
    setTimeout(fitFrame, 400);
    try {
      var w = frame.contentWindow;
      if (w && w.ResizeObserver) new w.ResizeObserver(fitFrame).observe(frame.contentDocument.body);
    } catch (e) {}
  });
  window.addEventListener("resize", fitFrame);
})();
