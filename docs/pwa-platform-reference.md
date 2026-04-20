# PWA Platform Reference — iOS vs Android vs Native Apps

**Version:** 1 | **Date:** 2026-04-20
**Status:** Living reference. Expand as we learn more about how the site behaves on different platforms.

---

## Purpose

This document preserves the conceptual background behind [KB-0007](knowledge-base.md) — the "PNG icon set for iOS PWA install" task — so that whoever picks it up in the future (including a fresh Claude session) understands:

- What a PWA "install" actually is (spoiler: it's different on every platform)
- How iPhone and Android treat PWAs differently
- What shipping PNG icons actually accomplishes, and what it does *not* accomplish
- When this work is worth doing vs. safe to defer

Distilled from chat session 2026-04-20.

---

## 1. What "PWA install" really means

A **Progressive Web App (PWA)** is a regular website that meets a few technical criteria (manifest file, service worker, HTTPS). When those criteria are met, the browser offers users a way to "install" the site — typically through **Add to Home Screen** or a browser-prompted **Install this app?** dialog.

### The key insight

A PWA "install" is **not** a real App Store / Play Store app in the traditional sense. It is — depending on the platform — somewhere between a glorified bookmark and a lightweight wrapper around the browser. The installed "app" still loads and runs our HTML/CSS/JavaScript from the web; it is not recompiled, packaged, or submitted to an app store.

In other words: calling it "installed" is partly marketing. The reality is the OS gets a shortcut, possibly with some app-shell wrapping around it, that loads our live website.

### Real native app vs PWA install — the key differences

| | **Real Native App** (App Store / Play Store) | **PWA Install** |
|---|---|---|
| Where it comes from | Official app store | "Add to Home Screen" from the website |
| Built in | Swift / Kotlin / Java (with platform SDKs) | HTML / CSS / JavaScript |
| Review process | Apple / Google approval required | None |
| Developer account required | Apple: $99/yr · Google: $25 one-time | Free |
| Updates | Developer pushes to store; user downloads | Just redeploy the website — user sees change on next open |
| OS API access | Full (camera, health, contacts, GPS, Bluetooth, etc.) | Limited to what browser web APIs expose |
| Works offline | If coded for it | If a service worker is set up (we did this in Phase 3A) |
| Feels like an app to the user | Yes | Usually — full-screen, icon, no browser URL bar visible |
| Counts as "installed" to the OS | Yes | Depends on platform (see next sections) |

**Upshot:** the PWA we built looks and feels reasonably app-like for free, without any App Store work. But at its core it's still the website running in a browser engine. This is by design; it's what makes PWAs cheap and portable.

---

## 2. Why iPhone and Android are different

### The short version

**Google** invested heavily in PWAs. PWAs are a central part of the modern web strategy for Chrome. Android treats PWAs almost like real apps.

**Apple** did not — because PWAs compete directly with the App Store revenue model (Apple's 30% cut on in-app purchases and subscriptions). Apple has implemented just enough of the PWA standards that Safari technically qualifies, but the experience is deliberately rougher than on Android.

This is not a technical accident. It's a business decision reflected in the product.

### What this means in practice

The same website (our Baseball Daily site) behaves differently when "installed":

- **On Android**: near-native experience, icon in app drawer, listed in Settings, can receive push notifications.
- **On iOS**: a slightly-dressed-up home-screen bookmark, limited notifications (iOS 16.4+), no app-drawer listing.

Both "work" — the app loads, tabs function, data renders. But the polish and OS integration are very different.

---

## 3. iOS / iPhone specifics

### How installation works

1. User opens Safari (and **only** Safari — Chrome for iOS is just a WebKit wrapper; PWA install there doesn't work the same way)
2. User taps the **Share** button (bottom of Safari toolbar)
3. User scrolls and taps **Add to Home Screen**
4. A home-screen icon appears

There is **no install banner or prompt**. Most iPhone users have never heard of PWAs and don't know this option exists. Discovery is entirely manual and entirely up to the user.

### Icon sourcing on iOS

Apple historically ignores SVG icons in `manifest.webmanifest` (the standard PWA way). iOS looks for an older HTML pattern:

```html
<link rel="apple-touch-icon" href="icon-180.png">
```

- The expected size is **180×180 pixels** (for modern iPhones).
- Additional sizes can be provided for older devices.
- Must be a **PNG** file, not SVG.
- Must be referenced via the `<link rel="apple-touch-icon">` tag in the HTML `<head>`, not (or not only) through the manifest file.

If the `apple-touch-icon` is missing, iOS falls back to one of:
- A screenshot of the current page (low-res, random)
- A generic grey square
- The page's regular favicon, scaled up and looking pixelated

None of these look good on a home screen.

### Technical limits

- The installed PWA runs in a sandboxed Safari WebView. It's isolated from your main Safari browser (separate cookies, separate login sessions).
- **No push notifications** before iOS 16.4. Limited support from 16.4 forward.
- **No background sync.** App can't refresh data while closed.
- **No Web Bluetooth, WebUSB**, or similar "extra" web APIs.
- Storage quotas are lower than on Android.
- As of iOS 17.4 (in the EU) and iOS 18+ (broadly), Apple has loosened some restrictions, but the story is still more limited than Android.

### What this means for our site on iPhone

An iPhone user today:
1. Visits `jjmgladden.github.io/baseball-daily/` in Safari → works perfectly, all features work
2. Taps Share → Add to Home Screen
3. Sees the page title as the suggested icon name
4. Icon appears as either a tiny page screenshot or a generic placeholder (ugly)
5. Tapping the icon launches the site full-screen, functionally identical to visiting in Safari

Only the icon is broken. Everything else functions.

---

## 4. Android specifics

### How installation works

1. User opens **Chrome** (the default browser on most Android devices)
2. Chrome detects our site meets PWA criteria (manifest, service worker, HTTPS)
3. After a few seconds of engagement, Chrome shows an **Install this app?** prompt automatically — OR the user can tap the three-dot menu and choose **Install app**
4. User taps Install
5. Chrome silently generates a tiny Android app package (**WebAPK**) on the device
6. The OS installs this WebAPK as a real app

That last step is the crucial difference. On Android, **a real app is actually installed**. It's just that the app's job is to load and display our website.

### What WebAPK gets you

A WebAPK is essentially a small Android wrapper around Chrome's rendering engine, configured to load our site. To the Android OS, it is indistinguishable from any other installed app:

- Appears in the **app drawer** alongside real apps
- Appears in **Settings → Apps** with its own storage, permissions, and uninstall option
- Runs in its own **process** (separate from Chrome itself)
- Has its own **storage quota** separate from Chrome's
- Can receive **push notifications** properly
- Can be **long-pressed and uninstalled** like a normal app
- Shows up correctly in app switchers / recent tasks

### Icon sourcing on Android

Chrome reads our `manifest.webmanifest` file and uses whatever icon we specify. **SVG works.** PNG works too. Android Chrome is forgiving about format.

For best-quality display across launcher icon sizes, app drawer, splash screens, etc., standard practice is to provide PNG icons at:

- **192×192** — standard launcher icon size
- **512×512** — high-res for splash screen, task switchers

Again: **SVG works**, but providing PNGs is a slight quality improvement on certain devices / configurations.

### Technical capabilities

Android PWAs get most of the things iOS PWAs don't:

- **Push notifications** (full, not limited)
- **Background sync** (can refresh data while closed)
- **Web Bluetooth, WebUSB, Web NFC** — modern device APIs
- Generous storage quotas
- Separate storage per PWA
- **Can be submitted to Google Play Store** via **Trusted Web Activity (TWA)** — a wrapper that lets a PWA appear on the Play Store as a regular app

### Popular apps that are secretly PWAs

The distinction between "real app" and "PWA" is increasingly blurry. Several apps a typical user has on their Android phone are (or started as) PWAs:

- **Twitter / X Lite** — PWA
- **Starbucks** — originally a PWA, now hybrid
- **Pinterest** — PWA-first
- **Uber, Flipkart, Trivago** — use heavy PWA architecture
- **Tinder** — PWA-first in some markets

---

## 5. What KB-0007 specifically accomplishes

KB-0007 is: "Create a PNG icon set for better iOS PWA install support."

### What it changes

**Today (SVG only), for an iPhone user:**

| Step | Experience |
|---|---|
| 1. Visit the site in Safari | ✅ Works perfectly — all data, all tabs, all features |
| 2. Tap Share → Add to Home Screen | ✅ Works — icon is added |
| 3. **Icon appearance on home screen** | ❌ Ugly fallback: generic grey square or low-res screenshot |
| 4. Tap icon → launch | ✅ Works — site opens full-screen, all features function |

**After PNGs ship:**

| Step | Experience |
|---|---|
| 1. Visit the site in Safari | ✅ Same — unchanged |
| 2. Tap Share → Add to Home Screen | ✅ Same — unchanged |
| 3. **Icon appearance on home screen** | ✅ Clean baseball graphic at proper resolution |
| 4. Tap icon → launch | ✅ Same — unchanged |

**Only the home-screen icon polish changes.** Functionality is identical before and after.

### What it does NOT change

- ❌ Does NOT create an iOS App Store app
- ❌ Does NOT require an Apple Developer account ($99/yr)
- ❌ Does NOT make push notifications work on older iOS
- ❌ Does NOT add any features or data
- ❌ Does NOT change anything for Android users (SVG already works there)
- ❌ Does NOT change desktop browser behavior

### What files would change

When this gets built:

1. New files in `app/`:
   - `icon-180.png` — 180×180 for iOS home screen
   - `icon-192.png` — 192×192 for Android standard
   - `icon-512.png` — 512×512 for Android splash and high-res contexts
2. `app/index.html` gains:
   ```html
   <link rel="apple-touch-icon" href="icon-180.png">
   ```
3. `app/manifest.webmanifest` adds PNG entries alongside the existing SVG entry:
   ```json
   "icons": [
     { "src": "icon.svg", "type": "image/svg+xml", ... },
     { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
     { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
   ]
   ```
4. `app/sw.js` — update `SHELL_FILES` to include the new PNGs, and bump `CACHE` per rule

### Three ways to generate the PNGs

Listed by effort:

1. **Online SVG-to-PNG converter (zero setup)**
   - Go to something like https://cloudconvert.com/svg-to-png
   - Upload `app/icon.svg`
   - Export three times at 180, 192, 512 pixels
   - Save outputs as `app/icon-180.png`, `app/icon-192.png`, `app/icon-512.png`
   - Notify Claude to wire up the manifest and HTML
2. **Node script with `sharp` library**
   - Adds one npm dependency
   - Tiny script converts `icon.svg` → three PNGs on demand
   - Regeneration becomes `npm run build:icons`
3. **Manual export from a vector editor** (Inkscape, Affinity Designer, Illustrator, etc.)
   - Open `icon.svg` in the editor
   - Export as PNG at each size
   - Slightly more control over rendering quality

---

## 6. Practical guidance — when to act vs defer

### When to do it (convert from T3 to T2)

- Anyone is actually installing the site on an iPhone and the ugly icon is noticeable
- We're sharing the site publicly and polish matters for the first impression
- We want the site submitted to Google Play via TWA (requires the icons too)

### When to keep deferring (leave at T3)

- Audience is the owner on desktop and Android phone only
- Nobody mentions the icon looking bad
- There are other higher-priority enhancements (e.g. KB-0020 public refresh, career-stats integration)

### Current recommendation

Leave at **T3**. Almost no impact on day-to-day use. If an iPhone user complains or someone starts installing the site on their phone, revisit.

---

## References

- **KB-0007** (docs/knowledge-base.md) — the tracking entry for this work
- **App manifest** (app/manifest.webmanifest) — where PNG icon entries would be added
- **App index** (app/index.html) — where `<link rel="apple-touch-icon">` would be added
- **Service worker** (app/sw.js) — SHELL_FILES list needs updating + cache bump on implementation
- **MDN — Progressive Web Apps:** https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- **Web.dev — Installable PWAs:** https://web.dev/learn/pwa/installation
- **Apple — Configuring Web Applications:** https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html

---

## Glossary

- **PWA** — Progressive Web App. A website that meets specific criteria (manifest, service worker, HTTPS) and can therefore be "installed" by the browser.
- **Manifest** — `manifest.webmanifest`, a JSON file describing the app's name, icons, display mode, etc.
- **Service worker** — a background script that caches files for offline use and handles network requests. Ours is at `app/sw.js`.
- **WebAPK** — Android-specific. An automatically-generated APK that wraps a PWA so it behaves like a real Android app.
- **TWA (Trusted Web Activity)** — a way to package a PWA into a proper Play Store app. Not yet used by us.
- **apple-touch-icon** — the legacy HTML tag iOS Safari uses to find the home-screen icon. Expects PNG, ignores SVG.
- **Shell** — in a PWA context, the static UI files (HTML/CSS/JS) that don't depend on user data. In our app, this is the `app/` directory contents.
