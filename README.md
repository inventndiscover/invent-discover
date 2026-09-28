# Invent + Discover: Mumbai

The home page of **inventndiscover.com**, served by GitHub Pages. The blog lives at [blog.inventndiscover.com](https://blog.inventndiscover.com) on WordPress.com.

## How the pieces fit

| File | What it is | How often it changes |
|---|---|---|
| `index.html` | The page skeleton and all the styling (CSS) | Rarely: only for design changes |
| `app.js` | The behaviour: filters, search, cards, the "Next up" panel | Rarely: only for new features |
| `events.json` | The data: events, curator queue, run log, communities | **Every day**, synced from Google Drive |
| `signals.json` | Posts from X about AI and tech, summarised in our own words with links to the originals | **Every 3 hours**, synced from Google Drive |
| `images/` | The four Mumbai photos, each in four time-of-day versions | Almost never |

When someone opens the page:

1. The browser loads `index.html`.
2. A small script at the bottom asks for `events.json`.
3. Once the data arrives, it loads `app.js`, which draws the page from that data.

So updating the site means **replacing `events.json`**. The design and code are left alone.

## The shape of one event in `events.json`

```json
{
 "id": "devday-exchange-mumbai",
 "title": "DevDay Exchange Community: Mumbai",
 "cat": "AI",
 "tags": ["OpenAI", "Codex", "Developers"],
 "area": "BKC",
 "venue": "Shared after approval",
 "start": "2026-10-10T10:30",
 "end": null,
 "fmt": "Offline",
 "price": 0,
 "priceNote": "Free · approval required",
 "aud": ["Developer"],
 "src": "Luma",
 "url": "https://luma.com/1fpwe04g",
 "org": "DevDay Exchange community",
 "access": "approval",
 "desc": "A local gathering around OpenAI's DevDay announcements..."
}
```

- `start` is Mumbai time: either `"YYYY-MM-DD"` or `"YYYY-MM-DDTHH:MM"`.
- `end` is `"HH:MM"` or `null`.
- `price`: `0` means free, a number means rupees, and `null` means paid but the amount is unknown.
- `access`: `"open"` shows a **Register** button. `"approval"` shows **Apply**.
- Optional fields: `endDate` (for multi-day events), `timeNote` (when the time is unknown) and `also` (a second source listing the same event).

## How the events update themselves

```
Claude (daily, 07:47 IST)                     GitHub (every 3 hours)
  researches events                             opens the Drive folder
  → saves events-YYYYMMDD-HHMM.json    ──▶      takes the newest events file
    in Google Drive                              checks it (dates, links, fields)
    "Invent & Discover - site data"              → saves it as events.json
                                                 → publishes the site
```

- The workflow lives in `.github/workflows/deploy.yml`. Open the **Actions** tab to see each run; a green tick means it worked.
- To publish right away instead of waiting up to 3 hours: **Actions → Sync events and publish site → Run workflow**.
- If a new file looks wrong (missing fields, bad dates, broken JSON, or older than the live data), the workflow skips it and the site keeps the last good data. The reason shows as a yellow warning in that run.
- The Drive folder must stay shared as **Anyone with the link: Viewer**, or GitHub can't read it.

## Posts from X ("From X: AI & Tech")

A scheduled Claude task runs every 3 hours. It finds notable recent posts on X from AI labs, builders and tech reporters, writes a one-line summary of each in its own words, and saves `signals-YYYYMMDD-HHMM.json` to the same Drive folder. The workflow picks the newest one up and saves it as `signals.json`.

One post looks like this:

```json
{
 "id": "2102435703535939725",
 "handle": "AnthropicAI",
 "name": "Anthropic",
 "url": "https://x.com/AnthropicAI/status/2102435703535939725",
 "posted": "2026-09-22T22:01:00+05:30",
 "topic": "Models",
 "kind": "Official",
 "summary": "Claude Opus 5.5 is now available."
}
```

- `kind` is `Official` (the company or person itself), `Report` (news or commentary) or `Leak` (unconfirmed).
- Clicking a card opens a panel with X's own embed of the original post.
- If `signals.json` is missing or broken, the page simply hides that section; events are unaffected.

## Forms

The Submit forms and the newsletter box send to **hello@inventndiscover.com** through [FormSubmit](https://formsubmit.co), a free service with no account. The very first submission triggers an activation email to hello@: click **Activate Form** once, and every submission after that arrives as a normal email.

## Fixing something by hand

1. Open `events.json` on GitHub and click the pencil icon (**Edit**).
2. Change the text. Keep the quotes and commas exactly as they are: JSON is strict, and one missing comma breaks the whole file.
3. Click **Commit changes**. The site updates in about a minute.

If the page ever shows "Events could not load", the JSON has a typo. To recover, open the file's **History** and restore the previous version.
