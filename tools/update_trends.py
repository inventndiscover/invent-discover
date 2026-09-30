#!/usr/bin/env python3
"""
Weekly AI trends for the "How AI is shaping up" section on the Insights page.

What it does, in plain words:
  arXiv is the free website where AI researchers post new papers. For each of the
  last 12 full weeks (Monday to Sunday), this script asks arXiv's public search:
    1. How many new AI papers were posted that week?
    2. How many of them mention each theme (agents, reasoning, and so on)?
  It saves the counts in trends.json. The website turns them into the chart.

It costs nothing: it runs inside the existing GitHub workflow, not in Claude.
It only does the work once a week, on the first run after a week ends (early Monday
morning, India time). On the other runs it sees that trends.json already has last week and
stops straight away. If arXiv is slow or down, it keeps the old
file, so the site never breaks.

Run by hand with:  python3 tools/update_trends.py --force
"""
import datetime as dt
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "trends.json")
WEEKS = 12            # how many weeks the chart shows
PAUSE = 3.2           # arXiv asks for at least 3 seconds between requests

# The AI parts of arXiv: artificial intelligence, machine learning, language,
# computer vision and robotics.
AI_CATS = "(cat:cs.AI OR cat:cs.LG OR cat:cs.CL OR cat:cs.CV OR cat:cs.RO)"

# Each theme is found by words in the paper's summary (its "abstract").
THEMES = [
    {"id": "agents",     "label": "AI agents",               "hint": "AI that plans and takes actions",       "q": "(abs:agent OR abs:agents OR abs:agentic)"},
    {"id": "reasoning",  "label": "Reasoning",               "hint": "Step-by-step thinking and problem solving", "q": "(abs:reasoning)"},
    {"id": "multimodal", "label": "Multimodal",              "hint": "Text, images, audio and video together", "q": "(abs:multimodal OR abs:\"vision-language\")"},
    {"id": "robotics",   "label": "Robots & physical world", "hint": "AI that moves and senses in the real world", "q": "(abs:robot OR abs:robots OR abs:robotic OR abs:embodied)"},
    {"id": "safety",     "label": "Safety & alignment",      "hint": "Making AI reliable and on our side",    "q": "(abs:safety OR abs:alignment)"},
]

API = "https://export.arxiv.org/api/query?search_query={q}&start=0&max_results=1"
UA = {"User-Agent": "inventndiscover.com weekly trends (https://inventndiscover.com)"}


def count(query):
    """Ask arXiv how many papers match. Tries three times before giving up."""
    # arXiv's own examples write spaces as "+", keep [ ] as they are and encode ( ) and quotes.
    url = API.format(q=urllib.parse.quote_plus(query, safe=":[]"))
    last = None
    for attempt in range(3):
        time.sleep(PAUSE * (attempt + 1))
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read().decode("utf-8", "replace")
            m = re.search(r"<opensearch:totalResults[^>]*>(\d+)<", body)
            if m:
                return int(m.group(1))
            last = "no count in the reply"
        except Exception as e:  # network trouble: wait and try again
            last = e
    raise RuntimeError(f"arXiv did not answer ({last}) for {url}")


def diagnose():
    """Prints how arXiv answers a few simple searches, to help fix a failed run."""
    probes = [
        "https://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=1",
        "https://export.arxiv.org/api/query?search_query=cat:cs.AI&max_results=0",
        "https://export.arxiv.org/api/query?search_query=cat:cs.AI+AND+submittedDate:[202609010000+TO+202609072359]&start=0&max_results=1",
        "https://export.arxiv.org/api/query?search_query=%28cat:cs.AI+OR+cat:cs.LG%29+AND+submittedDate:[202609010000+TO+202609072359]&start=0&max_results=1",
        "https://export.arxiv.org/api/query?search_query=cat:cs.AI+AND+abs:agent&start=0&max_results=1",
    ]
    for url in probes:
        time.sleep(PAUSE)
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                body = r.read().decode("utf-8", "replace")
            m = re.search(r"<opensearch:totalResults[^>]*>(\d+)<", body)
            print(f"probe OK   {m.group(1) if m else 'no count'}  {url}")
        except urllib.error.HTTPError as e:
            print(f"probe HTTP {e.code}  {url}  {e.read()[:200]!r}")
        except Exception as e:
            print(f"probe FAIL {e}  {url}")


def weeks_to_fetch(today):
    """The last WEEKS full Monday-to-Sunday weeks, oldest first (UTC)."""
    last_sunday = today - dt.timedelta(days=today.weekday() + 1)
    starts = [last_sunday - dt.timedelta(days=6 + 7 * i) for i in range(WEEKS)]
    return sorted(starts)


def main():
    force = "--force" in sys.argv
    try:
        current = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        current = {}

    today = dt.datetime.now(dt.timezone.utc).date()
    latest_full_week = weeks_to_fetch(today)[-1].isoformat()
    have = (current.get("WEEKS") or [{}])[-1].get("start")
    if not force and have == latest_full_week:
        print(f"trends.json already covers the week of {have}. The next update comes on Monday.")
        return

    rows = []
    try:
        for start in weeks_to_fetch(today):
            end = start + dt.timedelta(days=6)
            span = f"submittedDate:[{start:%Y%m%d}0000 TO {end:%Y%m%d}2359]"
            total = count(f"{AI_CATS} AND {span}")
            if total == 0:
                total = count(f"{AI_CATS} AND {span}")  # arXiv sometimes returns 0 by mistake
            if total == 0:
                raise RuntimeError(f"arXiv reported 0 papers for the week of {start}")
            themes = {}
            for t in THEMES:
                n = count(f"{AI_CATS} AND {span} AND {t['q']}")
                if n > total:
                    raise RuntimeError(f"{t['id']} count is larger than the total for {start}")
                themes[t["id"]] = n
            rows.append({"start": start.isoformat(), "end": end.isoformat(), "total": total, "themes": themes})
            print(f"Week of {start}: {total} AI papers · " + ", ".join(f"{k} {v}" for k, v in themes.items()))
    except Exception as e:
        print(f"::warning::Could not refresh AI trends ({e}). Keeping the current trends.json.")
        diagnose()
        return

    data = {
        "UPDATED": today.isoformat(),
        "SOURCE": {"name": "arXiv", "url": "https://arxiv.org/"},
        "METHOD": ("New papers posted to arXiv each week in AI, machine learning, language, "
                   "computer vision and robotics. A theme counts when a paper's summary mentions it."),
        "THEMES": [{k: t[k] for k in ("id", "label", "hint")} for t in THEMES],
        "WEEKS": rows,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"trends.json updated: {len(rows)} weeks, latest week of {rows[-1]['start']}.")


if __name__ == "__main__":
    main()
