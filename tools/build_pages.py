"""
Build the pages that search engines and link previews need.

Run from the repository root:   python3 tools/build_pages.py

It reads events.json and signals.json, and keeps archive.json (committed) as a record of
every event ever listed, so an event's page stays online after the day has passed.

Generated on every publish (not committed):
  events/<id>/index.html   one page per event, upcoming or past, with Event data for Google
  events/<id>/share.jpg    the picture shown when that page is shared on WhatsApp or LinkedIn
  events/index.html        a plain list of all upcoming events
  mumbai/<topic>/          topic pages: AI events, free events, this weekend, hackathons, students
  weekly/<monday>/         one roundup per week, plus weekly/index.html
  llms.txt                 a plain-text summary of the site for AI assistants
  sitemap.xml, robots.txt  so Google finds every page
It also writes a plain, readable copy of the home page's content between the
<!--STATIC--> markers in index.html, for search engines and AI crawlers that don't run JavaScript.

The GitHub workflow runs this just before publishing, so the pages always match
the latest events.json. The home page's own share picture (images/share.jpg) is
made once with:   python3 tools/build_pages.py --home-image
"""
import html, json, os, re, shutil, sys
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://inventndiscover.com"
IST = timezone(timedelta(hours=5, minutes=30))
FONTS = os.path.join(ROOT, "tools", "fonts")
ANALYTICS = json.load(open(os.path.join(ROOT, "site.json"))).get("analytics", {}) if os.path.exists(os.path.join(ROOT, "site.json")) else {}

CAT_COLOUR = {"AI": (255, 178, 63), "Design": (255, 107, 91), "UX": (77, 163, 255), "XR": (155, 123, 255),
              "Startup": (61, 220, 151), "Tech": (111, 168, 255), "Art": (255, 95, 162), "Culture": (54, 209, 196),
              "Education": (227, 183, 122), "Climate": (107, 214, 107)}
DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

esc = lambda s: html.escape(str(s or ""), quote=True)


def day_words(d):
    """'2026-10-10' -> 'Sat 10 Oct 2026'"""
    dt = datetime.strptime(d[:10], "%Y-%m-%d")
    return f"{DOW[dt.weekday()]} {dt.day} {MON[dt.month - 1]} {dt.year}"


def t12(hm):
    h, m = map(int, hm.split(":"))
    return f"{h % 12 or 12}{':%02d' % m if m else ''} {'pm' if h >= 12 else 'am'}"


def when_words(e):
    days = day_words(e["start"]) + (f" to {day_words(e['endDate'])}" if e.get("endDate") else "")
    if len(e["start"]) > 10:
        return f"{days}, {t12(e['start'][11:16])}" + (f" to {t12(e['end'])}" if e.get("end") else "")
    return f"{days}, {e.get('timeNote') or 'time on the event page'}"


def price_words(e):
    return e.get("priceNote") or ("Free" if e.get("price") == 0 else "Paid")


# ---------------------------------------------------------------- share images
def share_image(path, eyebrow, title, lines, colour=(165, 139, 255)):
    """1200x630 picture: night Sea Link photo, dark wash, big title."""
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
    W, H = 1200, 630
    photo = Image.open(os.path.join(ROOT, "images", "sealink-night.jpg")).convert("RGB")
    s = max(W / photo.width, H / photo.height)
    photo = photo.resize((round(photo.width * s), round(photo.height * s)))
    x0 = photo.width - W  # keep the towers on the right
    img = photo.crop((x0, (photo.height - H) // 2, x0 + W, (photo.height - H) // 2 + H))
    wash = Image.new("L", (W, H))
    wd = ImageDraw.Draw(wash)
    for x in range(W):  # dark on the left where the words sit
        wd.line([(x, 0), (x, H)], fill=int(235 - 170 * (x / W) ** 1.4))
    img = Image.composite(Image.new("RGB", (W, H), (5, 6, 10)), img, wash)
    d = ImageDraw.Draw(img)
    f = lambda w, size: ImageFont.truetype(os.path.join(FONTS, f"Geist-{w}.ttf"), size)
    mono = ImageFont.truetype(os.path.join(FONTS, "GeistMono-500.ttf"), 24)
    # brand
    d.text((64, 56), "INVENT", font=f(700, 30), fill=(244, 245, 247))
    bx = 64 + d.textlength("INVENT", font=f(700, 30)) + 10
    d.rounded_rectangle([bx, 56, bx + 32, 88], radius=8, fill=colour)
    d.text((bx + 16, 71), "+", font=f(700, 28), fill=(10, 8, 20), anchor="mm")
    d.text((bx + 42, 56), "DISCOVER", font=f(700, 30), fill=(244, 245, 247))
    # eyebrow
    d.text((64, 176), eyebrow.upper(), font=mono, fill=colour)
    # title, wrapped to at most 3 lines, shrinking if needed
    for size in (68, 60, 52, 46):
        font = f(700, size)
        words, rows, cur = title.split(), [], ""
        for w in words:
            test = (cur + " " + w).strip()
            if d.textlength(test, font=font) <= 900: cur = test
            else: rows.append(cur); cur = w
        rows.append(cur)
        if len(rows) <= 3: break
    rows = rows[:3]
    y = 216
    for r in rows:
        d.text((64, y), r, font=font, fill=(255, 255, 255)); y += int(size * 1.12)
    y += 18
    for ln in lines[:2]:
        d.text((64, y), ln, font=f(500, 28), fill=(214, 216, 222)); y += 40
    d.text((64, H - 64), "inventndiscover.com", font=mono, fill=(170, 172, 180))
    img.save(path, "JPEG", quality=82, optimize=True, progressive=True)


# ---------------------------------------------------------------- page parts
STYLE = """
:root{--bg:#05060A;--ink:#F4F5F7;--ink2:rgba(244,245,247,.7);--ink3:rgba(244,245,247,.45);--hair:rgba(255,255,255,.14);--acc:#A58BFF;color-scheme:dark}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 "Geist",-apple-system,"Segoe UI",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}.wrap{max-width:860px;margin:0 auto;padding:0 22px}
.top{border-bottom:1px solid var(--hair);padding:18px 0}.top a{text-decoration:none;font-weight:700;letter-spacing:.02em}
.plus{display:inline-grid;place-items:center;width:22px;height:22px;border-radius:7px;background:var(--acc);color:#0D0820;margin:0 6px;font-size:15px}
.eyebrow{font:500 12px "Geist Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--acc);margin:48px 0 12px}
h1{font-size:clamp(34px,6vw,56px);line-height:1.04;letter-spacing:-.035em;margin:0 0 20px;text-wrap:balance}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:var(--hair);border:1px solid var(--hair);border-radius:14px;overflow:hidden;margin:28px 0}
.facts div{background:#10131A;padding:14px 16px;color:var(--ink2);font-size:14px}.facts b{display:block;color:var(--ink);font-size:15px;margin-top:2px}
.lab{font:500 11px "Geist Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--ink3)}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin:28px 0}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:999px;font-weight:600;text-decoration:none;border:1px solid var(--hair)}
.btn.main{background:var(--acc);color:#0D0820;border-color:var(--acc)}
.note{color:var(--ink3);font-size:14px;border-top:1px solid var(--hair);padding-top:18px;margin:40px 0 60px}
.list{list-style:none;padding:0;margin:24px 0 60px;display:flex;flex-direction:column;gap:10px}
.list a{display:block;padding:16px 18px;border:1px solid var(--hair);border-radius:14px;background:#10131A;text-decoration:none}
.banner{margin:32px 0 0;padding:14px 18px;border-radius:14px;border:1px solid rgba(255,178,63,.45);background:rgba(255,178,63,.08);color:#FFD58A}
.banner a{color:#fff;font-weight:600}
.sub{color:var(--ink2);font-size:18px;max-width:62ch}
h2{font-size:22px;letter-spacing:-.02em;margin:44px 0 0}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.chips a{padding:8px 14px;border:1px solid var(--hair);border-radius:999px;text-decoration:none;font-size:14px;color:var(--ink2)}
.chips a:hover,.chips a[aria-current]{border-color:var(--acc);color:var(--ink)}
.sitefoot{border-top:1px solid var(--hair);margin-top:40px;padding:28px 0 60px;color:var(--ink3);font-size:14px}
.sitefoot a{color:var(--ink2);margin-right:14px;display:inline-block;margin-bottom:6px}
.list a:hover{border-color:var(--acc)}.list b{display:block;font-size:17px}.list span{color:var(--ink2);font-size:14px}
"""


def analytics_snippet():
    """Nothing is added until an analytics ID is set in site.json."""
    ga = ANALYTICS.get("ga4")
    gc = ANALYTICS.get("goatcounter")
    out = ""
    if ga:
        out += (f'<script async src="https://www.googletagmanager.com/gtag/js?id={esc(ga)}"></script>'
                f"<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag('js',new Date());gtag('config','{esc(ga)}');</script>")
    if gc:
        out += f'<script data-goatcounter="https://{esc(gc)}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>'
    return out


def head(title, desc, url, image, extra=""):
    return f"""<!doctype html>
<html lang="en-IN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{esc(url)}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Invent + Discover">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{esc(url)}"><meta property="og:image" content="{esc(image)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#05060A">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@500&display=swap">
<style>{STYLE}</style>{extra}{analytics_snippet()}
</head><body>
<header class="top"><div class="wrap"><a href="/">INVENT<span class="plus">+</span>DISCOVER</a></div></header>
"""


def event_schema(e, url, status="upcoming"):
    online = e.get("fmt") == "Online"
    data = {
        "@context": "https://schema.org", "@type": "Event", "name": e["title"], "url": url,
        "description": e.get("desc", ""),
        "startDate": e["start"] + (":00+05:30" if len(e["start"]) > 10 else ""),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/" + {"Online": "OnlineEventAttendanceMode", "Hybrid": "MixedEventAttendanceMode"}.get(e.get("fmt"), "OfflineEventAttendanceMode"),
        "location": {"@type": "VirtualLocation", "url": e["url"]} if online else
                    {"@type": "Place", "name": e.get("venue") or e.get("area"),
                     "address": {"@type": "PostalAddress", "addressLocality": e.get("area") or "Mumbai", "addressRegion": "Maharashtra", "addressCountry": "IN"}},
        "organizer": {"@type": "Organization", "name": e.get("org", "")},
        "image": [f"{url}share.jpg"],
    }
    if e.get("endDate"):
        data["endDate"] = e["endDate"]
    elif e.get("end") and len(e["start"]) > 10:
        data["endDate"] = f"{e['start'][:10]}T{e['end']}:00+05:30"
    if e.get("price") is not None and status == "upcoming":
        data["offers"] = {"@type": "Offer", "price": e["price"], "priceCurrency": "INR", "url": e["url"], "availability": "https://schema.org/InStock"}
    return '<script type="application/ld+json">' + json.dumps(data, ensure_ascii=False).replace("</", "<\\/") + "</script>"


def event_page(e, status="upcoming"):
    """status: upcoming, ended (the date has passed) or unlisted (dropped from the list before its date)."""
    url = f"{SITE}/events/{e['id']}/"
    when, entry = when_words(e), price_words(e)
    title = f"{e['title']} · {day_words(e['start'])[:-5]} · Mumbai"
    desc = f"{when} at {e.get('venue') or e.get('area')}. {entry}. {e.get('desc', '')}"[:300]
    act = "Apply" if e.get("access") == "approval" else "Register"
    share_text = f"{e['title']} · {when} · {e.get('area')}\n{url}"
    banner = {"ended": f'<p class="banner">This event has ended. <a href="/events/">See what\'s coming up in Mumbai</a>.</p>',
              "unlisted": f'<p class="banner">This event is no longer on our list: it may have moved or been cancelled. Check the organiser\'s page, or <a href="/events/">see what\'s coming up</a>.</p>'}.get(status, "")
    if status != "upcoming":
        title = f"{e['title']} · {day_words(e['start'])} · Mumbai"
    body = f"""<main class="wrap">{banner}
<p class="eyebrow">{esc(e.get('cat'))} · {esc(e.get('area'))}</p>
<h1>{esc(e['title'])}</h1>
<p style="color:var(--ink2);font-size:18px;max-width:60ch">{esc(e.get('desc'))}</p>
<div class="facts">
 <div><span class="lab">When</span><b>{esc(when)}</b></div>
 <div><span class="lab">Where</span><b>{esc(e.get('area'))}</b>{esc(e.get('venue'))}</div>
 <div><span class="lab">Entry</span><b>{esc(entry)}</b></div>
 <div><span class="lab">Organiser</span><b>{esc(e.get('org'))}</b></div>
</div>
<div class="btns">
 <a class="btn{'' if status != 'upcoming' else ' main'}" href="{esc(e['url'])}" rel="noopener">{act if status == 'upcoming' else 'Event page'} on {esc(e.get('src'))} ↗</a>
 <a class="btn" href="https://wa.me/?text={esc(share_text).replace(chr(10), '%0A').replace(' ', '%20')}" rel="noopener">Share on WhatsApp</a>
 <a class="btn" href="/#discover">More Mumbai events</a>
</div>
<p class="note">Listed by Invent + Discover from {esc(e.get('src'))}. Details can change: confirm on the organiser's page before you go.
Part of <a href="/weekly/{monday(e['start'])}/">the roundup for the week of {short_date(monday(e['start']))}</a>.</p>
</main>{site_foot()}</body></html>"""
    return head(title, desc, url, f"{url}share.jpg", event_schema(e, url, status)) + body


def index_page(events):
    url = f"{SITE}/events/"
    items = "".join(f'<li><a href="/events/{esc(e["id"])}/"><b>{esc(e["title"])}</b><span>{esc(when_words(e))} · {esc(e.get("area"))} · {esc(price_words(e))}</span></a></li>' for e in events)
    body = f"""<main class="wrap"><p class="eyebrow">Mumbai · upcoming</p><h1>Tech, design and startup events in Mumbai</h1>
<p style="color:var(--ink2)">{len(events)} upcoming events, checked on each organiser's page and updated every day. <a href="/#discover">Filter them on the main site</a>.</p>
<ul class="list">{items}</ul></main>{site_foot()}</body></html>"""
    return head("Upcoming tech events in Mumbai · Invent + Discover",
                "AI, design, XR and startup events around Mumbai, checked daily. Find something to attend this week.",
                url, f"{SITE}/images/share.jpg") + body


# ---------------------------------------------------------------- topics, weeks, archive
TOPICS = [
    ("ai-events", "AI events in Mumbai", "AI",
     "AI meetups, talks, summits and hackathons around Mumbai, checked daily against each organiser's page.",
     lambda e: e.get("cat") == "AI" or re.search(r"\bAI\b|\bGenAI\b|\bLLM", " ".join([e.get("title", "")] + e.get("tags", [])))),
    ("free-tech-events", "Free tech events in Mumbai", "Free",
     "Tech, AI, design and startup events in Mumbai that cost nothing to attend.",
     lambda e: e.get("price") == 0 or (e.get("priceNote") or "").lower().startswith("free")),
    ("tech-events-this-weekend", "Tech events in Mumbai this weekend", "This weekend",
     "What's on this Saturday and Sunday around Mumbai: AI, design, startup and maker events.",
     None),  # filled in by date, see weekend()
    ("hackathons", "Hackathons in Mumbai", "Hackathons",
     "Upcoming hackathons and build sprints in and around Mumbai, for students and working developers.",
     lambda e: re.search(r"hack|build sprint|buildathon", " ".join([e.get("title", "")] + e.get("tags", [])), re.I)),
    ("events-for-students", "Tech events for students in Mumbai", "For students",
     "Mumbai events open to students: hackathons, workshops, meetups and talks worth a weekday evening.",
     lambda e: "Student" in (e.get("aud") or [])),
    ("startup-events", "Startup events in Mumbai", "Startups",
     "Founder meetups, investor mixers and startup summits around Mumbai.",
     lambda e: e.get("cat") == "Startup"),
]


def last_day(e):
    return (e.get("endDate") or e["start"])[:10]


def weekend(today):
    """The coming Saturday and Sunday (or the current ones, on a weekend)."""
    t = datetime.strptime(today, "%Y-%m-%d")
    sat = t + timedelta(days=(5 - t.weekday()) if t.weekday() <= 5 else -1)
    return sat.strftime("%Y-%m-%d"), (sat + timedelta(days=1)).strftime("%Y-%m-%d")


def monday(d):
    t = datetime.strptime(d[:10], "%Y-%m-%d")
    return (t - timedelta(days=t.weekday())).strftime("%Y-%m-%d")


def short_date(d):
    """'2026-10-10' -> '10 Oct'"""
    t = datetime.strptime(d[:10], "%Y-%m-%d")
    return f"{t.day} {MON[t.month - 1]}"


def site_foot():
    links = "".join(f'<a href="/mumbai/{slug}/">{esc(label)}</a>' for slug, _, label, _, _ in TOPICS)
    return f"""<footer class="sitefoot"><div class="wrap">
<p>{links}<a href="/events/">All upcoming</a><a href="/weekly/">Weekly roundups</a></p>
<p><a href="/">Invent + Discover</a><a href="/about/">About</a><a href="https://blog.inventndiscover.com/">Blog</a><a href="mailto:hello@inventndiscover.com">hello@inventndiscover.com</a></p>
</div></footer>"""


def event_items(events):
    return "".join(f'<li><a href="/events/{esc(e["id"])}/"><b>{esc(e["title"])}</b><span>{esc(when_words(e))} · {esc(e.get("area"))} · {esc(price_words(e))}</span></a></li>' for e in events)


def topic_page(slug, title, label, intro, upcoming, recent, extra_note=""):
    url = f"{SITE}/mumbai/{slug}/"
    chips = "".join(f'<a href="/mumbai/{s2}/"{" aria-current=page" if s2 == slug else ""}>{esc(l2)}</a>' for s2, _, l2, _, _ in TOPICS)
    if upcoming:
        body = f'<p class="sub">{esc(intro)} {len(upcoming)} coming up{esc(extra_note)}.</p><ul class="list">{event_items(upcoming)}</ul>'
    else:
        body = f'<p class="sub">{esc(intro)}</p><p class="banner">Nothing listed right now{esc(extra_note)}. New events are added every morning: see <a href="/events/">everything coming up in Mumbai</a>.</p>'
    if recent:
        body += f'<h2>Recently in Mumbai</h2><ul class="list">{event_items(recent)}</ul>'
    items = [{"@type": "ListItem", "position": i + 1, "url": f"{SITE}/events/{e['id']}/", "name": e["title"]} for i, e in enumerate(upcoming)]
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": url, "description": intro,
          "isPartOf": {"@id": f"{SITE}/#site"}, "mainEntity": {"@type": "ItemList", "itemListElement": items}}
    extra = '<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False).replace("</", "<\\/") + "</script>"
    html_ = head(f"{title} · Invent + Discover", intro, url, f"{SITE}/images/share.jpg", extra)
    return html_ + f"""<main class="wrap"><p class="eyebrow">Mumbai · {esc(label)}</p><h1>{esc(title)}</h1>
<nav class="chips" aria-label="Topics">{chips}</nav>{body}
<p class="note">Every listing is checked against the organiser's own page before it appears here, and the list is refreshed every morning. Registration always happens on the organiser's page.</p>
</main>{site_foot()}</body></html>"""


def week_page(mon, events, today):
    url = f"{SITE}/weekly/{mon}/"
    sun = (datetime.strptime(mon, "%Y-%m-%d") + timedelta(days=6)).strftime("%Y-%m-%d")
    span = f"{short_date(mon)} to {short_date(sun)} {sun[:4]}"
    past = sun < today
    cur = mon <= today <= sun
    lead = ("What happened" if past else "What's on") + f" in Mumbai's tech, AI, design and startup scene, {span}."
    title = f"Mumbai tech events, week of {short_date(mon)} {mon[:4]}"
    free = [e for e in events if e.get("price") == 0]
    cats = {}
    for e in events: cats[e.get("cat")] = cats.get(e.get("cat"), 0) + 1
    mix = ", ".join(f"{n} {c}" for c, n in sorted(cats.items(), key=lambda x: -x[1]))
    summary = f"{len(events)} events listed ({mix}); {len(free)} free to attend."
    body = f"""<main class="wrap"><p class="eyebrow">Weekly roundup · {esc(span)}{' · this week' if cur else ''}</p><h1>{esc(title)}</h1>
<p class="sub">{esc(lead)} {esc(summary)}</p><ul class="list">{event_items(events)}</ul>
<p class="note">{'These events have ended; each page keeps the details for reference.' if past else 'Details can change: confirm on the organiser page before you go.'} <a href="/weekly/">All weekly roundups</a>.</p>
</main>{site_foot()}</body></html>"""
    return head(f"{title} · Invent + Discover", f"{lead} {summary}"[:300], url, f"{SITE}/images/share.jpg") + body


def weekly_index(weeks):
    url = f"{SITE}/weekly/"
    items = "".join(f'<li><a href="/weekly/{m}/"><b>Week of {short_date(m)} {m[:4]}</b><span>{len(ev)} events · {esc(", ".join(e["title"] for e in ev[:3]))}{"…" if len(ev) > 3 else ""}</span></a></li>'
                    for m, ev in sorted(weeks.items(), reverse=True))
    body = f"""<main class="wrap"><p class="eyebrow">Mumbai · every week</p><h1>Weekly roundups of Mumbai tech events</h1>
<p class="sub">One page per week: the AI, design, XR and startup events listed around Mumbai, newest first.</p><ul class="list">{items}</ul></main>{site_foot()}</body></html>"""
    return head("Weekly roundups · Mumbai tech events · Invent + Discover",
                "A week-by-week record of AI, design and startup events around Mumbai.", url, f"{SITE}/images/share.jpg") + body


def home_static(upcoming, signals, weekend_n):
    """Plain HTML copy of the home page for crawlers. Hidden for people with JavaScript."""
    topics = "".join(f'<li><a href="/mumbai/{slug}/">{esc(t)}</a></li>' for slug, t, _, _, _ in TOPICS)
    ev = "".join(f'<li><a href="/events/{esc(e["id"])}/">{esc(e["title"])}</a>: {esc(when_words(e))}, {esc(e.get("area"))}. {esc(price_words(e))}.</li>' for e in upcoming[:15])
    xs = "".join(f'<li><a href="{esc(p["url"])}">{esc(p["name"])}</a>: {esc(p["summary"])}</li>' for p in (signals or [])[:6])
    return f"""<div class="seo-static wrap" style="padding:40px 22px">
<h1>Invent + Discover: Mumbai tech events, product demos and ideas</h1>
<p>Invent + Discover lists AI, design, XR and startup events around Mumbai, checked every morning against each organiser's own page on Luma, Meetup and AllEvents. It also shows product demos (Invent), the week's AI and tech news (Insights) and Mumbai tech communities.</p>
<h2>Coming up in Mumbai</h2><ul>{ev}</ul>
<p><a href="/events/">All {len(upcoming)} upcoming events</a> · {weekend_n} this weekend: <a href="/mumbai/tech-events-this-weekend/">see the weekend list</a></p>
<h2>Browse by topic</h2><ul>{topics}<li><a href="/weekly/">Weekly roundups</a></li></ul>
{f'<h2>AI and tech news this week</h2><ul>{xs}</ul>' if xs else ''}
<p><a href="/about/">About Invent + Discover</a> · Contact: <a href="mailto:hello@inventndiscover.com">hello@inventndiscover.com</a> · <a href="https://blog.inventndiscover.com/">Blog</a></p>
</div>"""


def llms_txt(upcoming, today):
    lines = ["# Invent + Discover", "",
             "> A Mumbai platform listing AI, design, XR and startup events (checked daily against each organiser's page), "
             "plus product demos, tech communities and a daily digest of AI and tech news.", "",
             f"Last updated: {today}. Contact: hello@inventndiscover.com", "",
             "## Events in Mumbai", f"- [All upcoming events]({SITE}/events/): every upcoming event, one page each with date, venue, price and the organiser's link"]
    lines += [f"- [{t}]({SITE}/mumbai/{slug}/): {intro}" for slug, t, _, intro, _ in TOPICS]
    lines += [f"- [Weekly roundups]({SITE}/weekly/): one page per week, including past weeks", "", "## Next events"]
    lines += [f"- [{e['title']}]({SITE}/events/{e['id']}/): {when_words(e)}, {e.get('area')}. {price_words(e)}." for e in upcoming[:20]]
    lines += ["", "## Other", f"- [Home]({SITE}/): events, demos, insights and communities in one page",
              f"- [About]({SITE}/about/): who collates Invent + Discover and how events are chosen and checked",
              "- [Blog](https://blog.inventndiscover.com/): longer writing on design, XR and technology"]
    return "\n".join(lines) + "\n"


# ---------------------------------------------------------------- main
def main():
    if "--home-image" in sys.argv:
        share_image(os.path.join(ROOT, "images", "share.jpg"), "Mumbai · events, demos, ideas",
                    "What people in Mumbai are building, and where to join them",
                    ["AI, XR and design events, checked daily"])
        print("images/share.jpg written"); return

    data = json.load(open(os.path.join(ROOT, "events.json"), encoding="utf-8"))
    today = datetime.now(IST).strftime("%Y-%m-%d")
    listed = [e for e in data.get("EVENTS_RAW", []) if re.fullmatch(r"[a-z0-9-]+", e.get("id", ""))]
    listed_ids = {e["id"] for e in listed}
    upcoming = sorted([e for e in listed if last_day(e) >= today], key=lambda e: e["start"])

    # archive.json remembers every event ever listed, so its page never disappears
    ap = os.path.join(ROOT, "archive.json")
    archive = json.load(open(ap, encoding="utf-8")) if os.path.exists(ap) else {}
    for e in listed:
        archive[e["id"]] = {**e, "firstSeen": archive.get(e["id"], {}).get("firstSeen", today)}
    with open(ap, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(archive.items())), f, ensure_ascii=False, indent=1); f.write("\n")

    def status(e):
        if last_day(e) < today: return "ended"
        return "upcoming" if e["id"] in listed_ids else "unlisted"
    everything = sorted(archive.values(), key=lambda e: e["start"])
    ended = [e for e in everything if status(e) == "ended"]

    # event pages
    for folder in ("events", "mumbai", "weekly"):
        if os.path.isdir(os.path.join(ROOT, folder)): shutil.rmtree(os.path.join(ROOT, folder))
    out = os.path.join(ROOT, "events"); os.makedirs(out)
    for e in everything:
        d = os.path.join(out, e["id"]); os.makedirs(d)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(event_page(e, status(e)))
        short = day_words(e["start"]) + (f" to {day_words(e['endDate'])}" if e.get("endDate") else "") + (f", {t12(e['start'][11:16])}" if len(e["start"]) > 10 else "")
        lines = [short, f"{e.get('area')} · {price_words(e)}"]
        share_image(os.path.join(d, "share.jpg"), f"{e.get('cat')} event · Mumbai", e["title"], lines,
                    CAT_COLOUR.get(e.get("cat"), (165, 139, 255)))
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(index_page(upcoming))

    # topic pages
    sat, sun = weekend(today)
    pages = []
    for slug, title, label, intro, test in TOPICS:
        if test is None:
            match = lambda e: e["start"][:10] <= sun and last_day(e) >= sat
            note = f" ({short_date(sat)} and {short_date(sun)})"
            recent = []
        else:
            match, note = test, ""
            recent = [e for e in reversed(ended) if test(e)][:6]
        up = [e for e in upcoming if match(e)]
        d = os.path.join(ROOT, "mumbai", slug); os.makedirs(d)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(topic_page(slug, title, label, intro, up, recent, note))
        pages.append(f"{SITE}/mumbai/{slug}/")
        if slug == "tech-events-this-weekend": weekend_n = len(up)

    # weekly roundups: every week that has an event, from the archive
    weeks = {}
    for e in everything:
        weeks.setdefault(monday(e["start"]), []).append(e)
    for m, ev in weeks.items():
        d = os.path.join(ROOT, "weekly", m); os.makedirs(d)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(week_page(m, ev, today))
    open(os.path.join(ROOT, "weekly", "index.html"), "w", encoding="utf-8").write(weekly_index(weeks))

    # llms.txt, sitemap, robots
    open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf-8").write(llms_txt(upcoming, today))
    urls = [(f"{SITE}/", today), (f"{SITE}/about/", today), (f"{SITE}/events/", today)] + [(u, today) for u in pages] + [(f"{SITE}/weekly/", today)]
    urls += [(f"{SITE}/weekly/{m}/", today if m >= monday(today) else (datetime.strptime(m, "%Y-%m-%d") + timedelta(days=7)).strftime("%Y-%m-%d")) for m in sorted(weeks)]
    urls += [(f"{SITE}/events/{e['id']}/", today if status(e) == "upcoming" else min(today, (datetime.strptime(last_day(e), "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d"))) for e in everything]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{u}</loc><lastmod>{lm}</lastmod></url>\n" for u, lm in urls) + "</urlset>\n"
    open(os.path.join(ROOT, "sitemap.xml"), "w").write(sm)
    open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")

    # home page: analytics snippet and the plain copy for crawlers
    try:
        signals = json.load(open(os.path.join(ROOT, "signals.json"), encoding="utf-8")).get("SIGNALS", [])
    except Exception:
        signals = []
    idx = os.path.join(ROOT, "index.html"); page = open(idx, encoding="utf-8").read()
    page = re.sub(r"<!--ANALYTICS-->.*?<!--/ANALYTICS-->|<!--ANALYTICS-->", lambda m: "<!--ANALYTICS-->" + analytics_snippet() + "<!--/ANALYTICS-->", page, count=1, flags=re.S)
    if "--no-home" not in sys.argv:
        page = re.sub(r"<!--STATIC-->.*?<!--/STATIC-->", lambda m: "<!--STATIC-->" + home_static(upcoming, signals, weekend_n) + "<!--/STATIC-->", page, count=1, flags=re.S)
    open(idx, "w", encoding="utf-8").write(page)
    print(f"Built {len(everything)} event pages ({len(upcoming)} upcoming, {len(ended)} ended), {len(pages)} topic pages, "
          f"{len(weeks)} weekly roundups, llms.txt, sitemap.xml ({len(urls)} URLs), robots.txt")


if __name__ == "__main__":
    main()
