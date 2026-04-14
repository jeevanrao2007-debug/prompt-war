# Title

Prompt Wars - Real-Time Crowd Monitoring and Smart Alert System

## Problem Statement

- Stadium crowding changes quickly and can create unsafe congestion.
- Static signage cannot react to live density changes.
- Operations teams need both real-time visibility and action guidance.
- Visitors need immediate redirection suggestions, not only raw numbers.

## Solution Overview

- Prompt Wars is a full-stack web app built with React and Node.js/Express.
- It streams live crowd values from Firebase Realtime Database.
- It applies decision logic to classify severity: High, Medium, Low.
- It generates recommendation alerts such as:
  - Food Court crowded -> redirect to Gate A
- It stores alert history in Firestore and shows the latest 5 alerts in the dashboard.
- It visualizes zone context in Google Maps.

## Key Features

- Firebase Authentication (email/password login and session persistence).
- Real-time crowd dashboard for Gate A, Food Court, and Seating.
- Crowd severity classification with visible color mapping.
- Recommendation-aware alert messages.
- Firestore alert persistence:
  - message
  - level
  - timestamp
- Last 5 alerts fetched in real time from Firestore.
- Google Maps stadium view with markers, wait-time labels, and route polyline.
- Admin alert trigger flow with protected admin route.

## Smart Decision Logic (VERY IMPORTANT)

- Severity rules:
  - if value > 75 -> High
  - else if value > 50 -> Medium
  - else -> Low
- Threshold crossing logic detects upward transitions over the configured alert threshold.
- Recommendation generation maps busy zones to alternatives:
  - Food Court -> Gate A
  - Gate A -> Seating
  - Seating -> Food Court
- Alert payload written to Firestore:
  - message
  - level
  - timestamp
- UI presents both severity and recommendation for operator visibility.

## Architecture Overview

### Frontend

- React 18 + Vite.
- React Router for overview/admin routes.
- Componentized UI:
  - Auth form
  - Crowd dashboard
  - Alerts card
  - Admin dashboard
  - Map loader + map
- Firebase SDK clients for Auth, Firestore, and Realtime Database.
- Real-time subscriptions via `onValue` and `onSnapshot`.

### Backend

- Node.js + Express API.
- Health route: `GET /api/health`.
- Security middleware:
  - `helmet` with CSP directives
  - CORS allowlist enforcement
- Containerized with Docker for serverless deployment.

### Cloud Services

- Frontend hosted on Firebase Hosting.
- Backend deployed on Google Cloud Run.
- Firebase Authentication for identity.
- Firebase Realtime Database for live crowd stream.
- Firestore for persistent alert history.
- Google Maps JavaScript API for geospatial visualization.

## Google Services Used (CRITICAL SECTION)

- Google Cloud Run:
  - Serverless backend runtime for Express API
  - Container-based deployment
  - Public HTTPS endpoint for health/API access
- Firebase Authentication:
  - Login/signup and auth state handling
  - Logged-in email displayed in UI header
- Firebase Realtime Database:
  - Live crowd data feed and admin latest alert node
- Firestore:
  - Persistent storage for smart alerts
  - Real-time query of latest 5 alerts
- Google Maps JavaScript API:
  - Stadium map, markers, info windows, and route visualization

## Security Considerations

- Backend uses `helmet` with explicit Content Security Policy.
- Backend CORS allows known frontend origins only.
- Firebase credentials are loaded from environment variables.
- Authenticated flows are required for dashboard access.
- Admin UI access is gated by an explicit admin email check.
- Error states degrade safely when Firebase is not configured.

## Efficiency & Performance

- Event-driven real-time listeners; no polling loops.
- Alert list constrained to latest 5 entries to bound UI work.
- Map calculations use memoization (`useMemo`, `useCallback`).
- Server is stateless and cloud-run friendly.
- Frontend build served as static assets via Firebase Hosting CDN.

## Testing Strategy

- Automated backend test:
  - `GET /api/health` response validation with `supertest` + `vitest`
- Automated frontend logic test:
  - crowd simulation normalization and bounds checks with `vitest`
- Manual integration checks:
  - Auth flow
  - Live crowd updates
  - Alert generation and Firestore persistence
  - Severity rendering and recommendation visibility

## Accessibility Improvements

- Semantic landmarks in layout (`main`, `header`, `section`, `nav`).
- ARIA labels on key buttons and inputs.
- Live-region semantics for status and alert updates.
- Keyboard-accessible interactions, including map marker controls.
- Alert content exposed with readable severity text, not color alone.

## Live Demo

- Frontend: https://prompt-wars-43ba6.web.app
- Backend: https://prompt-wars-backend-919982044794.asia-south1.run.app
- Backend health endpoint: https://prompt-wars-backend-919982044794.asia-south1.run.app/api/health

## Setup Instructions

- Prerequisites:
  - Node.js 18+
  - npm

- Install all dependencies from repo root:

```bash
npm run install:all
```

- Configure frontend environment in `client/.env` (or `.env.local`):

```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_API_BASE_URL=http://localhost:8080
```

- Run backend:

```bash
cd server
npm run dev
```

- Run frontend (new terminal):

```bash
cd client
npm run dev
```

- Run tests from root:

```bash
npm test
```

## What I Learned

- Real-time systems are clearer when data flow and decision flow are separated.
- Combining Realtime Database (stream) + Firestore (history) improves system observability.
- Severity classification improves operator response speed over raw numeric metrics.
- Recommendation visibility in UI is as important as backend decision correctness.
- Cloud Run + Firebase Hosting is a practical split for full-stack hackathon delivery.

## Future Improvements

- Add backend endpoints for alert analytics and trend windows.
- Replace static admin email check with role claims.
- Add end-to-end tests for auth + alert lifecycle.
- Add per-zone dynamic thresholds by event type.
- Add notification deduplication and rate-limiting controls.
