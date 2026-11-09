#!/usr/bin/env python3
"""Generates the static site from content/framework.json.

Run from the repo root: python build.py
"""
import html
import io
import json
import os

SITE = "https://meetagent.ai/"
FW = json.load(io.open("content/framework.json", encoding="utf-8"))
DIMS = [d for g in FW["groups"] for d in g["dimensions"]]
e = html.escape

ICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
        "%3Crect width='32' height='32' rx='8' fill='%235b4cf0'/%3E"
        "%3Ccircle cx='12' cy='16' r='5' fill='none' stroke='white' stroke-width='2.5'/%3E"
        "%3Ccircle cx='20' cy='16' r='5' fill='none' stroke='white' stroke-width='2.5'/%3E%3C/svg%3E")


def dots(level):
    spans = "".join(f'<i class="{"on" if n <= level else ""}"></i>' for n in range(1, 6))
    return f'<span class="dots" aria-hidden="true">{spans}</span>'


def page(path, title, description, main, tab):
    root = "../" * path.count("/")
    tabs = [("Framework", "index.html"), ("Dimensions", "dimensions/index.html")]
    nav = "".join(
        f'<a href="{root}{href}"{" aria-current=\"page\"" if name == tab else ""}>{name}</a>' for name, href in tabs
    )
    canonical = SITE + ("" if path == "index.html" else path.replace("index.html", ""))
    doc = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(title)}</title>
  <meta name="description" content="{e(description)}">
  <meta property="og:title" content="{e(title)}">
  <meta property="og:description" content="{e(description)}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:type" content="website">
  <link rel="canonical" href="{canonical}">
  <link rel="icon" href="{ICON}">
  <link rel="stylesheet" href="{root}style.css">
</head>
<body>
  <header>
    <div class="wrap">
      <a class="logo" href="{root}index.html" aria-label="MeetAgent home">
        <svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="var(--accent)"/><circle cx="12" cy="16" r="5" fill="none" stroke="var(--accent-ink)" stroke-width="2.5"/><circle cx="20" cy="16" r="5" fill="none" stroke="var(--accent-ink)" stroke-width="2.5"/></svg>
        <b>meetagent<span>.ai</span></b>
      </a>
      <nav aria-label="Main">{nav}</nav>
    </div>
  </header>
  <main class="wrap">
{main}
  </main>
  <footer>
    <div class="wrap">
      <span>© 2026 MeetAgent</span>
      <span>Agent Evaluation Framework v{FW["version"]}</span>
    </div>
  </footer>
</body>
</html>
"""
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    io.open(path, "w", encoding="utf-8", newline="\n").write(doc)


def framework():
    rows = []
    for g in FW["groups"]:
        rows.append(f'<tr class="group"><th colspan="6" scope="colgroup">{e(g["name"])}</th></tr>')
        for d in g["dimensions"]:
            cells = "".join(
                f'<td data-l="L{i}" data-dim="{d["slug"]}" data-level="{i}">{dots(i)}<span class="txt">{e(t)}</span></td>'
                for i, t in enumerate(d["levels"], 1)
            )
            rows.append(
                f'<tr><th scope="row"><a href="dimensions/{d["slug"]}.html">{e(d["title"])}</a>'
                f'<small>{e(d["question"])}</small></th>{cells}</tr>'
            )
    main = f"""    <section class="intro">
      <h1>How do you know an AI agent is <em>any good</em>?</h1>
      <p class="lede">An evaluation framework for AI agents. Twelve dimensions, five levels each, written as behaviour you can observe. Every rating also says how strong the evidence is.</p>
    </section>

    <section class="read">
      <div><h2>Dimensions</h2><p>What to evaluate.</p></div>
      <div><h2>Levels</h2><p>How the agent behaves, from L1 to L5.</p></div>
      <div><h2>Evidence</h2><p>How we know.</p></div>
    </section>
    <p class="example">A rating combines all three, for a stated kind of task: <strong>Consistency: L3, tested</strong> on data-cleaning tasks, version 2.1, November 2026.</p>

    <div class="grid-wrap">
      <table class="grid">
        <thead><tr><th scope="col">Dimension</th><th scope="col">L1</th><th scope="col">L2</th><th scope="col">L3</th><th scope="col">L4</th><th scope="col">L5</th></tr></thead>
        <tbody>
          {"".join(rows)}
        </tbody>
      </table>
    </div>
    <p class="fine">Level thresholds are starting points in v{FW["version"]}, not empirically calibrated.</p>

    <section class="band" id="evidence">
      <h2>Evidence labels</h2>
      <dl class="cards">
        <div><dt>Vendor claim</dt><dd>Stated in marketing, with no detail to check.</dd></div>
        <div><dt>Documented</dt><dd>Described specifically in public technical, security or pricing documentation.</dd></div>
        <div><dt>Tested</dt><dd>Measured with a published protocol on a fixed task set, independently of the vendor.</dd></div>
        <div><dt>In production</dt><dd>Measured on real work over time, ideally against a comparison group.</dd></div>
      </dl>
      <p class="muted">Documented does not mean true, and tested does not mean it will work for you. A test supports a claim about those tasks, under those conditions.</p>
    </section>

    <section class="band" id="rules">
      <h2>Rules</h2>
      <ol class="rules">
        <li><strong>Rate for a stated task type.</strong> "Good at analysis" is not a rating. Performance on one task type doesn't transfer automatically to another.</li>
        <li><strong>No overall score.</strong> Levels are ordered, but the gaps between them aren't equal, so averaging them would suggest a precision they don't have. Show the profile instead.</li>
        <li><strong>Missing is not low.</strong> Use "not assessed" when there's no evidence, and "not applicable" when a dimension doesn't apply.</li>
        <li><strong>Show version and date.</strong> Agents change quickly. Treat ratings older than 90 days as possibly out of date.</li>
        <li><strong>Show the denominator.</strong> Write 13 of 18 runs, not 72%.</li>
        <li><strong>Ratings can't be bought.</strong></li>
      </ol>
    </section>

    <section class="band" id="reading">
      <h2>Further reading</h2>
      <ul class="reading">
        <li><a href="https://aims.stanford.edu/textbook/src/chap1.html" rel="noopener">Stanford AI Measurement Science textbook, Chapter 1, "Validity"</a></li>
        <li><a href="https://arxiv.org/abs/2507.05587" rel="noopener">Perrier (2025), "Towards Measurement Theory for Artificial Intelligence"</a></li>
      </ul>
    </section>"""
    page("index.html", "Agent Evaluation Framework | MeetAgent",
         "How do you know an AI agent is any good? Twelve dimensions, five levels and clear evidence labels for evaluating AI agents.",
         main, "Framework")


def dimensions():
    cols = ""
    for g in FW["groups"]:
        cards = "".join(
            f'<a class="dim-card" href="{d["slug"]}.html"><b>{e(d["title"])}</b><span>{e(d["question"])}</span></a>'
            for d in g["dimensions"]
        )
        cols += f'<section><h2>{e(g["name"])}</h2>{cards}</section>'
    main = f"""    <section class="intro">
      <h1>Dimensions</h1>
      <p class="lede">What each dimension means, how to measure it, and how the measurement can mislead.</p>
    </section>
    <div class="dim-groups">{cols}</div>"""
    page("dimensions/index.html", "Dimensions of agent evaluation | MeetAgent",
         "Twelve dimensions for evaluating AI agents, from task success to cost per completed task.", main, "Dimensions")

    for idx, d in enumerate(DIMS):
        group = next(g["name"] for g in FW["groups"] if d in g["dimensions"])
        levels = "".join(
            f'<li><span class="lv">L{i}</span>{dots(i)}<span>{e(t)}</span></li>' for i, t in enumerate(d["levels"], 1)
        )
        note = f'<p class="muted">{e(d["note"])}</p>' if d["note"] else ""
        prev_d, next_d = DIMS[idx - 1] if idx else None, DIMS[idx + 1] if idx + 1 < len(DIMS) else None
        pager = (f'<a href="{prev_d["slug"]}.html">← {e(prev_d["title"])}</a>' if prev_d else "<span></span>") + \
                (f'<a href="{next_d["slug"]}.html">{e(next_d["title"])} →</a>' if next_d else "<span></span>")
        main = f"""    <article class="dim">
      <p class="crumb"><a href="index.html">Dimensions</a> / {e(group)}</p>
      <h1>{e(d["title"])}</h1>
      <p class="lede">{e(d["question"])}</p>
      <h2>Why it matters</h2><p>{e(d["why"])}</p>
      <h2>How to measure it</h2><p>{e(d["measure"])}</p>
      <h2>Main threat to the measurement</h2><p>{e(d["threat"])}</p>
      <h2>Levels</h2>
      <ul class="levels">{levels}</ul>
      {note}
      <div class="pager">{pager}</div>
    </article>"""
        page(f'dimensions/{d["slug"]}.html', f'{d["title"]}: evaluating AI agents | MeetAgent',
             f'{d["question"]} {d["why"]}', main, "Dimensions")


def sitemap():
    urls = [SITE, SITE + "dimensions/"] + [f'{SITE}dimensions/{d["slug"]}.html' for d in DIMS]
    body = "".join(f"<url><loc>{u}</loc></url>" for u in urls)
    io.open("sitemap.xml", "w", encoding="utf-8", newline="\n").write(
        f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{body}</urlset>\n')


framework()
dimensions()
sitemap()
print("built", 2 + len(DIMS), "pages")
