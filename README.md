# KingsWord Chicago — welcome & office prototype

A responsive, buildless web app in KingsWord's supplied navy/gold visual direction. Public welcome and service pages connect an optional visit planner to a browser-local office demo.

## Run

Requires Node 20 or newer, with no dependency installation:

```sh
npm start
```

Open http://localhost:4173. Public pages start at `/`; the staff demo is `/#/office`.

```sh
npm run check
npm test
```

## Included

- Sunday and Friday pages, FAQ, directions, computed Chicago service dates.
- Optional demo visit planning, contact permission validation, duplicate-contact check, cancellation, calendar files that account for daylight saving.
- Staff overview, guest search/filters, host assignment, attendance/status updates, follow-up outcomes, activity history, protected CSV export.
- Six-week recurring-service calendar with local readiness checklists.
- Member invitation links/messages, downloadable SVG invitation designs, print layout.
- Mobile navigation, labeled forms, reduced-motion support, modal focus handling, web app manifest.

## Boundaries

This is a prototype. The GitHub Pages version is a public demo using sample data only. Office routes do not implement individual staff authentication or production role-based authorization. All records and readiness checks are in browser localStorage (or temporary memory if storage is unavailable); they are not shared across browsers. No email, text message, host booking, Breeze connection, live calendar sync, or paid advertising is performed. Only use fictitious demo details.

The supplied church office documents inform role mapping. Service information is based on the official Chicago website and proposal research; confirm service exceptions, childcare, and arrival logistics before real use. Calendar downloads use a clearly disclosed one-hour duration placeholder because the service end time is unconfirmed.

## Next production milestone

Implement staff identity and server-side role checks, shared database and retention rules, approved host roster, Breeze field mapping, verified service calendar, approved communication channel, backup/recovery, and production end-to-end tests before opening to actual guest data.

## Project

GitHub Pages publishes the checked-in `docs/` directory from `main`. Source files live in `dist/`; run `npm run build` after edits to refresh the publishable copy and standalone preview. The retained `.openai/hosting.json` is historical Sites configuration and is not used by GitHub Pages.

## Open without a server

Open `KingsWord-Preview.html` directly in a modern browser. It includes all scripts, styles, and the mark in one file, with system fonts and no external asset requests. Regenerate it after edits with `node package-preview.mjs`. This version is provided because the build environment blocked both remote source-server DNS resolution and local listening sockets. The normal `dist/` site and Node development server are also included for development outside that sandbox.

Verification: JavaScript syntax checks, date/validation/export tests, and a lightweight DOM-harness workflow suite. A live browser rendering/accessibility audit has not been completed in this environment.


## GitHub Pages

Expected site URL once enabled: https://kaysongt.github.io/kingsword-chicago/

The office demo is at https://kaysongt.github.io/kingsword-chicago/#/office . It is openly accessible, uses browser-local sample records, and is not a secure staff portal.

Build and verify with `npm run build`, `npm run check`, and `npm test`. Commit `docs/` whenever source changes. On GitHub, set repository visibility to public and Pages source to **Deploy from a branch → main → /docs**. No server, npm installation, custom domain, or backend is required. `docs/.nojekyll` disables Jekyll processing. All local assets use relative URLs so the project subpath works.

Alternatively, run `bash publish-pages.sh` from a terminal authenticated with GitHub CLI. It changes this repository to public and configures Pages to publish `main:/docs`. These changes are explicitly requested by the project owner.

## Department leadership demo

The root URL now opens the office overview. The visitor website remains at `#/welcome`.

- `#/office/leaders`: create a local leader demo profile, choose/create a department, or switch office/leader perspective.
- `#/office/departments`: office oversight of illustrative department teams and their workload.
- `#/office/team`: add/edit sample members, responsibilities, and availability.
- `#/office/tasks`: create/edit tasks, assign active team members, set due dates/priorities, and track To do → In progress → Done.

Demo profile setup does not create a real authenticated account. No passwords are collected. Department-specific screens are demo filtering, not a security boundary. All team/profile/task data remains in this browser's localStorage and is not shared across church staff. Real sign-up needs verified identity, office approval, server-enforced authorization, and a shared database before real use.

## Home-screen app

The web app manifest includes 192px and 512px icons and office/team shortcuts. On supported browsers it can be installed; iOS users can use Safari → Share → Add to Home Screen. The office overview includes an installation helper. A build-versioned service worker caches only this app's static files for offline viewing after the initial online load. No sensitive records or form submissions are sent to the cache. This is a web app, not a native App Store release, and installation does not enable cross-device synchronization.
