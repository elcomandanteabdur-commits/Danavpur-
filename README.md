# Danavpur Cloud Realm
A static, multi-page, installable (PWA) website for the fictional world-building universe **Danavpur**: *The Land Above the Clouds*. Firebase (Firestore + a Cloud Function) powers the membership form and the live member count. Danavpur is fictional, not a real nation.

## 1. File structure
`index, realms, pantheon, danavs, artifacts, history, conflicts, map, cosmology, membership, about .html` · `offline.html` · `main.css` · `main.js` (entry) · `ui.js` (nav, motion, count animation) · `membership.js` (form) · `firebase.js` (all Firebase code) · `manifest.json` · `sw.js` · `logo.png` (**you add this**) · `assets/` (future images) · `functions/` (Cloud Function) · `firestore.rules` · `firebase.json`

## 2. Logo
Place your real file at the project **root** as `logo.png` (same folder as `index.html`). It is used by the navbar, mobile menu, footer, loader, favicon and PWA manifest. Until then the site shows a text wordmark. For best PWA installability add true 192×192 and 512×512 icons (e.g. `icon-192.png`, `icon-512.png` in the root) and point the two `manifest.json` icon entries to them.

## 3. Run locally
ES modules and the service worker need http, not file://:
`python3 -m http.server 8000` then open http://localhost:8000

## 4. Firebase setup
Project `danavpur-ab00b` (config already in `firebase.js`).
1. Enable Firestore (production mode).
2. Create the document `stats/public` with `memberCount` (number, e.g. 0) and `updatedAt` (timestamp). **Create it once in the console**; rules forbid clients from creating it.
3. Install the CLI: `npm i -g firebase-tools` and `firebase login`.

## 5. Firestore structure and rules
`members/{autoId}`: `name` string, `phone` string, `state` string, `height` integer, `createdAt` timestamp (`serverTimestamp()`), `status` "approved". `stats/public`: `memberCount`, `updatedAt` (public read, no client writes). Deploy rules from `firestore.rules`: `firebase deploy --only firestore:rules`. Rules are intentionally strict; members cannot be read by the public.

## 6. Cloud Function (member counter)
`functions/index.js` triggers on each new `members/{id}` and increments `stats/public.memberCount` in a transaction. A marker per event id prevents double counting on retries. It also ignores documents that fail validation. Deploy (requires the Blaze plan):
`cd functions && npm install && cd .. && firebase deploy --only functions`

## 7. Abuse protection
Client validation is only for UX. Enforcement is in the rules and the function. To add App Check: register a reCAPTCHA v3 key in the console, set `window.DANAVPUR_APPCHECK_KEY="..."` in a small script before `main.js`, then enforce App Check for Firestore. The form also has a 60-second per-device cooldown (courtesy only). For stronger limiting, add a server-side check in the function.

## 8. PWA
Served over https, Chrome offers "Install Danavpur Cloud Realm". `sw.js` caches the shell, falls back to `offline.html`, and never caches Firestore traffic, so the count is never stale. Bump `VERSION` in `sw.js` after each deploy.

## 9. Updating content
Pages are plain HTML. Each "Lore record — content expansion ready" block is a `<details class="rec">` you can replace with real canon. Map and cosmology are inline SVG in `map.html` and `cosmology.html`.

## 10. GitHub Pages
Push the project root (not the folder around it) to a repo, then Settings → Pages → deploy from branch. All paths are relative, so project sites such as `user.github.io/repo/` work. `.nojekyll` is included.
