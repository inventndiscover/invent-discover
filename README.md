# Invent + Discover: Mumbai

The home page of **inventndiscover.com**, served by GitHub Pages. The blog lives at [blog.inventndiscover.com](https://blog.inventndiscover.com) on WordPress.com.

## How the pieces fit

| File | What it is | How often it changes |
|---|---|---|
| `index.html` | The page skeleton and all the styling (CSS) | Rarely: only for design changes |
| `app.js` | The behaviour: filters, search, cards, the "Next up" panel | Rarely: only for new features |
| `events.json` | The data: events, curator queue, run log, communities | **Every day**, from the scheduled refresh |
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

## Fixing something by hand

1. Open `events.json` on GitHub and click the pencil icon (**Edit**).
2. Change the text. Keep the quotes and commas exactly as they are: JSON is strict, and one missing comma breaks the whole file.
3. Click **Commit changes**. The site updates in about a minute.

If the page ever shows "Events could not load", the JSON has a typo. To recover, open the file's **History** and restore the previous version.
