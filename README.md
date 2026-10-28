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

This is a prototype. The entire hosted preview is intended to be owner-private. Office routes do not implement individual staff authentication or production role-based authorization. All records and readiness checks are in browser localStorage (or temporary memory if storage is unavailable); they are not shared across browsers. No email, text message, host booking, Breeze connection, live calendar sync, or paid advertising is performed. Only use fictitious demo details.

The supplied church office documents inform role mapping. Service information is based on the official Chicago website and proposal research; confirm service exceptions, childcare, and arrival logistics before real use. Calendar downloads use a clearly disclosed one-hour duration placeholder because the service end time is unconfirmed.

## Next production milestone

Implement staff identity and server-side role checks, shared database and retention rules, approved host roster, Breeze field mapping, verified service calendar, approved communication channel, backup/recovery, and production end-to-end tests before opening to actual guest data.

## Project

Native Sites project identity is retained in `.openai/hosting.json`. A new owner-private Site has been registered; publication requires successful source synchronization and deployment through Sites. Local source remains usable even if remote publishing is unavailable.

## Open without a server

Open `KingsWord-Preview.html` directly in a modern browser. It includes all scripts, styles, and the mark in one file, with system fonts and no external asset requests. Regenerate it after edits with `node package-preview.mjs`. This version is provided because the build environment blocked both remote source-server DNS resolution and local listening sockets. The normal `dist/` site and Node development server are also included for development outside that sandbox.

Verification: JavaScript syntax checks, date/validation/export tests, and a lightweight DOM-harness workflow suite. A live browser rendering/accessibility audit has not been completed in this environment.
