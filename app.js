// Renders one radar per agent from window.MEETAGENT (agents.js).
(function () {
  const AXES = [
    { key: "model", short: "Model", name: "Model strength", desc: "Standing of the underlying model on the LMArena text leaderboard. 5 = top 10, 4 = top 25, 3 = top 50." },
    { key: "connectivity", short: "Data", name: "Data connectivity", desc: "From file uploads (1) to live spreadsheets (2), one database (3), three or more warehouses (4), plus semantic layer or scheduled refresh (5)." },
    { key: "analysis", short: "Analysis", name: "Analysis depth", desc: "From formulas (1) to running code (2), charts and statistics (3), multi-step workflows (4), forecasting, ML or reusable apps (5)." },
    { key: "checkability", short: "Checkable", name: "Checkability", desc: "Can you verify the answer? Shows code (2), editable and re-runnable (3), step-by-step trace (4), version history or audit log (5)." },
    { key: "privacy", short: "Privacy", name: "Privacy & security", desc: "One point each: no training on your data by default, retention controls, SOC 2 or ISO 27001, SSO and admin controls, data residency or self-hosting." },
    { key: "affordability", short: "Affordable", name: "Affordability", desc: "Price of the scored plan: free (5), up to $10 (4), $25 (3), $50 (2), more (1). n/d when there is no public price." }
  ];
  const DATA = (window.MEETAGENT && window.MEETAGENT.agents) || [];
  const NS = "http://www.w3.org/2000/svg";
  const tip = document.getElementById("tip");

  const el = (tag, attrs, text) => {
    const n = document.createElement(tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };
  const svgEl = (tag, attrs, text) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs || {}) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  };
  const score = (a, key) => {
    const s = a.scores && a.scores[key];
    return s && typeof s.score === "number" ? s.score : null;
  };

  function showTip(evt, html) {
    tip.innerHTML = html;
    tip.hidden = false;
    const pad = 14;
    let x = evt.clientX + pad, y = evt.clientY + pad;
    const r = tip.getBoundingClientRect();
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y + r.height > window.innerHeight - 8) y = evt.clientY - r.height - pad;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  const hideTip = () => { tip.hidden = true; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function radar(agent) {
    const W = 380, H = 270, cx = W / 2, cy = H / 2 + 2, R = 86, n = AXES.length;
    const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "radar", role: "img",
      "aria-label": agent.name + ": " + AXES.map((ax) => ax.name + " " + (score(agent, ax.key) ?? "not disclosed")).join(", ") });
    const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / n;
    const pt = (i, v) => [cx + Math.cos(ang(i)) * R * v / 5, cy + Math.sin(ang(i)) * R * v / 5];

    for (let lvl = 1; lvl <= 5; lvl++) {
      const pts = AXES.map((_, i) => pt(i, lvl).join(",")).join(" ");
      svg.appendChild(svgEl("polygon", { points: pts, class: "ring" }));
    }
    AXES.forEach((_, i) => {
      const [x, y] = pt(i, 5);
      svg.appendChild(svgEl("line", { x1: cx, y1: cy, x2: x, y2: y, class: "spoke" }));
    });

    const vals = AXES.map((ax) => score(agent, ax.key));
    const known = vals.map((v, i) => (v == null ? null : pt(i, v)));
    const present = known.filter(Boolean);
    if (present.length >= 3) {
      svg.appendChild(svgEl("polygon", { points: present.map((p) => p.join(",")).join(" "), class: "area" }));
    }
    // Solid edges between neighbouring known axes; a dashed bridge across any n/d gap.
    for (let i = 0; i < n; i++) {
      if (!known[i]) continue;
      let j = (i + 1) % n, skipped = false;
      while (!known[j] && j !== i) { j = (j + 1) % n; skipped = true; }
      if (j === i) break;
      svg.appendChild(svgEl("line", { x1: known[i][0], y1: known[i][1], x2: known[j][0], y2: known[j][1], class: skipped ? "bridge" : "edge" }));
    }

    AXES.forEach((ax, i) => {
      const v = vals[i];
      const [lx, ly] = pt(i, 6.1);
      const anchor = Math.abs(lx - cx) < 4 ? "middle" : lx > cx ? "start" : "end";
      const dy = ly < cy - R ? -4 : ly > cy + R ? 12 : 4;
      const label = svgEl("text", { x: lx, y: ly + dy, "text-anchor": anchor, class: "lbl" }, ax.short + " ");
      label.appendChild(svgEl("tspan", { class: v == null ? "nd" : "val" }, v == null ? "n/d" : String(v)));
      svg.appendChild(label);

      const s = agent.scores[ax.key] || {};
      const html = `<b>${esc(ax.name)}: ${v == null ? "not disclosed" : v + " / 5"}</b>${esc(s.reason || "")}`;
      const [px, py] = v == null ? pt(i, 0) : known[i];
      if (v != null) svg.appendChild(svgEl("circle", { cx: px, cy: py, r: 4, class: "dot" }));
      const hit = svgEl("circle", { cx: v == null ? pt(i, 5.4)[0] : px, cy: v == null ? pt(i, 5.4)[1] : py, r: 14, class: "hit" });
      hit.addEventListener("mousemove", (e) => showTip(e, html));
      hit.addEventListener("mouseleave", hideTip);
      svg.appendChild(hit);
    });
    return svg;
  }

  function card(agent) {
    const c = el("article", { class: "card", id: agent.id });
    const h = el("h2");
    h.appendChild(el("a", { href: agent.url, target: "_blank", rel: "noopener" }, agent.name));
    c.appendChild(h);
    c.appendChild(el("p", { class: "meta" }, [agent.vendor, agent.plan, agent.price].filter(Boolean).join(" · ")));
    c.appendChild(radar(agent));
    if (agent.best_for) c.appendChild(el("span", { class: "best" }, "Best for: " + agent.best_for));
    if (agent.verdict) c.appendChild(el("p", { class: "verdict" }, agent.verdict));

    const d = el("details");
    d.appendChild(el("summary", null, "Scores, reasons and sources"));
    const ul = el("ul", { class: "scores" });
    AXES.forEach((ax) => {
      const s = agent.scores[ax.key] || {};
      const li = el("li");
      const head = el("div", { class: "head" });
      head.appendChild(el("span", null, ax.name));
      head.appendChild(el("span", null, typeof s.score === "number" ? s.score + " / 5" : "n/d"));
      li.appendChild(head);
      if (s.reason) li.appendChild(el("p", { class: "why" }, s.reason));
      const src = el("div", { class: "src" });
      (s.sources || []).forEach((so) => src.appendChild(el("a", { href: so.url, target: "_blank", rel: "noopener" }, so.label || so.url)));
      li.appendChild(src);
      ul.appendChild(li);
    });
    d.appendChild(ul);
    if (agent.models) d.appendChild(el("p", { class: "models" }, "Underlying model(s): " + agent.models + " · checked " + agent.checked));
    c.appendChild(d);
    return c;
  }

  function render() {
    const key = document.getElementById("sort").value;
    const list = DATA.slice().sort((a, b) => {
      if (key === "name") return a.name.localeCompare(b.name);
      const va = score(a, key), vb = score(b, key);
      if (va == null && vb == null) return a.name.localeCompare(b.name);
      if (va == null) return 1;
      if (vb == null) return -1;
      return vb - va || a.name.localeCompare(b.name);
    });
    const grid = document.getElementById("grid");
    grid.replaceChildren(...(list.length ? list.map(card) : [el("p", { class: "empty" }, "Scores coming soon.")]));

    const t = document.getElementById("table");
    t.replaceChildren();
    const thead = el("thead"), tr = el("tr");
    tr.appendChild(el("th", null, "Agent"));
    AXES.forEach((ax) => tr.appendChild(el("th", { scope: "col" }, ax.name)));
    thead.appendChild(tr);
    t.appendChild(thead);
    const tb = el("tbody");
    list.forEach((a) => {
      const r = el("tr");
      r.appendChild(el("td", null, a.name));
      AXES.forEach((ax) => {
        const v = score(a, ax.key);
        r.appendChild(el("td", v == null ? { class: "nd" } : null, v == null ? "n/d" : String(v)));
      });
      tb.appendChild(r);
    });
    t.appendChild(tb);
  }

  const sort = document.getElementById("sort");
  AXES.forEach((ax) => sort.appendChild(el("option", { value: ax.key }, ax.name)));
  sort.addEventListener("change", render);

  const dl = document.getElementById("axes");
  AXES.forEach((ax) => { dl.appendChild(el("dt", null, ax.name)); dl.appendChild(el("dd", null, ax.desc)); });

  const checked = window.MEETAGENT && window.MEETAGENT.checked;
  document.getElementById("checked").textContent = checked ? "checked " + checked : "";

  window.addEventListener("scroll", hideTip, { passive: true });
  render();
})();
