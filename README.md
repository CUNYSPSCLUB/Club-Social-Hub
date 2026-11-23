# SPS Club Hub

Every CUNY SPS student club in one place. A progressive web app (PWA): it runs in any browser, and students can install it on their phone from the browser's "Add to Home Screen".

## How it's built (Phase 1)

| Part | What we use | Why |
|---|---|---|
| Frontend | HTML, CSS, JavaScript (no framework) | Runs on GitHub Pages with no build step. Anyone on the team can edit it right in GitHub. |
| Data | `clubs.json` | ~35 clubs is tiny. A file is enough until we need logins and RSVPs. |
| Hosting | GitHub Pages | Free, and every change you commit goes live in about a minute. |
| PWA | `manifest.json` + `sw.js` | Lets the site install like an app and open offline. |

## Files

```
index.html        page shell, top bar, bottom tabs
styles.css        colors, layout (CUNY blue #0033A1 + gold #FFB81C)
app.js            pages: Home, Clubs, Club detail, Events, Saved, About
clubs.json   all club info: edit this to add or update clubs
manifest.json     app name, icons, colors for "install"
sw.js             offline support (bump VERSION after changes)
icon*.png, icon.svg  app icons
```

## Add or edit a club

1. Open `clubs.json` on GitHub and click the pencil icon.
2. Copy an existing club block and change the fields: `id` (short, no spaces), `name`, `emoji`, `category`, `about`, `join` (sign-up link, optional).
3. Commit. The site updates in about a minute.

## Run it on your computer

Any static server works, for example:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Roadmap

- **Phase 2 — accounts and events:** add a backend database with login (Supabase free tier, or Azure / AWS free tiers). Club leads post events; students RSVP.
- **Phase 3 — mobile app:** wrap this same site with Capacitor to publish to the App Store and Google Play, or rebuild the screens in React Native if we move to React.

Club information comes from the [official CUNY SPS clubs page](https://sps.cuny.edu/student-success/student-life/student-clubs-and-organizations).
