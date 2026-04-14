# Prompt Wars: Real-Time AI-Powered Crowd Management System

## Problem Statement

Large public venues face critical challenges managing crowd congestion:
- **Lack of real-time visibility** into crowd distribution across zones
- **Reactive alert systems** that provide no actionable insights for venue management
- **Manual decision-making** without intelligent recommendations to optimize visitor flow
- **No predictive capability** to anticipate congestion before it becomes critical

This results in visitor dissatisfaction, safety risks, and operational inefficiency.

## Solution Overview

**Prompt Wars** is a **real-time, AI-powered decision-support system** that monitors crowd density across venue zones and provides intelligent recommendations using Google Gemini AI. The system combines:

- **Real-time data streaming** via Firebase for live crowd metrics
- **Intelligent classification** using rule-based decision logic (High/Medium/Low severity)
- **AI-powered insights** from Google Gemini to analyze patterns and generate recommendations
- **Cloud-native deployment** on Google Cloud Run for scalability and reliability
- **Interactive visualization** using Google Maps API for spatial awareness

The system enables venue managers to make data-driven decisions that optimize visitor experience, improve safety, and enhance operational efficiency.

## Key Features

- ✅ **Real-time Crowd Monitoring** – Live crowd density metrics streamed via Firebase Realtime Database
- ✅ **Smart Alert System** – Dynamic alerts with severity classification (High/Medium/Low) and zone-aware recommendations
- ✅ **AI-Powered Insights** – Google Gemini AI analyzes crowd patterns and generates actionable recommendations
- ✅ **Interactive Maps** – Google Maps JavaScript API visualizes crowd zones with wait times and routing suggestions
- ✅ **Persistent Alert History** – Firestore stores and retrieves historical alerts for trend analysis
- ✅ **Secure User Roles** – Firebase Authentication with protected admin dashboard
- ✅ **Cloud Deployment** – Serverless backend on Google Cloud Run, frontend on Firebase Hosting
- ✅ **Optimized Performance** – Debounced AI API calls to minimize latency and cost
- ✅ **Responsive UI** – Mobile-friendly React interface with accessibility features

## Smart Decision Logic

The system implements a **three-tier severity classification** that converts raw crowd metrics into actionable insights:

### Severity Levels

| Severity | Threshold | Example Response |
|----------|-----------|------------------|
| **High** | > 75% capacity | "Gate A is critically crowded. Recommend: Redirect visitors to Gate B or adjust entry flow." |
| **Medium** | 50–75% capacity | "Food Court showing elevated congestion. Suggestion: Encourage dining at alternative venues." |
| **Low** | ≤ 50% capacity | "Seating areas are healthy. Normal operations recommended." |

### Intelligent Recommendations

For each congested zone, the system:

1. **Identifies problem area** – Which zone is overcrowded?
2. **Analyzes alternatives** – Which nearby zones have capacity?
3. **Generates recommendation** – Route visitors to relieve congestion
4. **Triggers notifications** – Alerts venue staff and visual dashboard updates

### Example Flow

```
Gate A Crowd: 82% → Classification: HIGH
↓
Recommendation: "Gate A crowded → Redirect to Gate B"
↓
Alert severity: CRITICAL (red)
↓
Venue manager receives notification + map visualization
↓
Manager implements recommendation → Flow improves
```

This logic enables **predictive, data-driven decision-making** rather than reactive management.

## AI Integration

### Google Gemini AI for Crowd Analysis

The system integrates **Google Generative AI (Gemini)** to provide context-aware insights beyond rule-based alerts:

#### How It Works

1. **Real-Time Data Collection** – Current crowd metrics ({Gate A: 82%, Food Court: 60%, Seating: 45%}) are captured in real-time
2. **Structured Prompt Generation** – Data is formatted into a structured prompt for Gemini
3. **AI Analysis** – Gemini analyzes patterns and generates short, actionable insights:
   - Short risk assessment ("Gate A is critically congested—potential guest dissatisfaction or safety concerns")
   - Specific recommendation ("Accelerate entry processing or open Gate B")
4. **User Presentation** – Insights display in the dashboard with "⚡ Insight:" label for clear attribution

#### Example AI Insight

```
Input: {Gate A: 82%, Food Court: 55%, Seating: 40%}

AI Output:
"Gate A is critically crowded—consider opening additional entry points or 
staggering entry times. Food Court elevated but manageable."
```

#### Performance Optimization

- **Debounced API Calls** – Gemini is called every 1.5+ seconds to prevent rapid-fire API requests
- **Graceful Degradation** – If Gemini is unavailable, the system falls back to rule-based alerts
- **Cost Control** – Debouncing reduces API calls and associated costs while maintaining responsiveness

### Why Gemini?

- Provides **contextual intelligence** (not just raw thresholds)
- Generates **natural language recommendations** suitable for human decision-makers
- **Scalable AI service** matching venue operations at high volume
- **Cost-effective** when debounced appropriately

---

## Architecture Overview

### Frontend Architecture

**Technology Stack:**
- React 18 (Vite for dev/build)
- React Router v7 (dynamic routing, protected admin routes)
- Google Generative AI SDK (Gemini integration)
- @react-google-maps/api (interactive maps)
- Firebase SDK (Auth, Realtime DB, Firestore)

**Key Components:**
- `App.jsx` – Main orchestrator for state, effects, and event listeners
- `AuthForm.jsx` – User authentication (email/password via Firebase Auth)
- `AdminDashboard.jsx` – Protected dashboard displaying crowd metrics, alerts, and AI insights
- `Map.jsx` – Google Maps visualization with crowd zone markers and recommendations
- `MapLoader.jsx` – Lazy-loaded map component with error handling
- `ProtectedAdminRoute.jsx` – Route guard for admin-only access

**Data Flow:**
```
Firebase Auth (login)
         ↓
Realtime DB / Firestore (live crowd + alerts)
         ↓
Gemini AI (crowd analysis)
         ↓
React Components (render + notifications)
```

### Backend Architecture

**Technology Stack:**
- Node.js 18+ (runtime)
- Express.js (HTTP server)
- Helmet (security headers, CSP)
- CORS (controlled cross-origin requests)
- Docker (containerization)

**API Endpoints:**
- `GET /api/health` – Health check (server status, Firebase connectivity)
- `POST /api/alerts` – Write alerts to Firebase Realtime DB (admin only)

**Security Features:**
- CORS allowlist (frontend origin only)
- Content Security Policy (CSP) headers
- Environment-based configuration (no hardcoded secrets)

**Deployment:**
- Docker image pushed to Google Container Registry (gcr.io)
- Cloud Run deploys containerized backend with auto-scaling

---

## Cloud Services Used (Critical Stack)

The system leverages the **complete Google Firebase and Google Cloud ecosystem**:

### 1. **Google Cloud Run** (Backend Deployment)
- **Purpose:** Serverless container execution for Node.js/Express backend
- **Usage:** Backend API exposed as managed HTTPS endpoint
- **Benefits:** Auto-scaling, zero infrastructure management, pay-per-request pricing
- **Deployment:** `gcloud run deploy prompt-wars-backend --image gcr.io/[project]/prompt-wars-backend`
- **Endpoint:** https://prompt-wars-backend-919982044794.asia-south1.run.app

### 2. **Firebase Authentication**
- **Purpose:** Secure user identity management
- **Usage:** Email/password sign-up and login with session persistence
- **Mechanism:** Firebase SDK handles token lifecycle; localStorage stores auth state
- **Benefit:** No manual secure password storage; built-in security best practices

### 3. **Firebase Realtime Database**
- **Purpose:** Live crowd metrics and admin alerts
- **Schema:**
  ```
  /crowd/Gate A: { value: 82, timestamp: 1234567890 }
  /crowd/Food Court: { value: 60, timestamp: 1234567890 }
  /alerts/latest: { message: "...", severity: "high", timestamp: ... }
  ```
- **Usage:** Event listeners (`onValue`) stream data in real-time; no polling
- **Benefit:** Sub-second updates for dashboard, instant admin alerts

### 4. **Firebase Firestore**
- **Purpose:** Persistent alert history and queryable archive
- **Schema:**
  ```
  Collection: "alerts"
  Document: {
    message: "Gate A crowded → redirect to Gate B",
    level: "High",
    timestamp: 1234567890
  }
  ```
- **Usage:** `listenToRecentAlerts()` queries last 5 alerts ordered by timestamp
- **Benefit:** Historical trend analysis, permanent audit trail

### 5. **Firebase Hosting**
- **Purpose:** Frontend CDN and static asset hosting
- **Usage:** React app (built with Vite) deployed as static bundle
- **Deployment:** `firebase deploy`
- **Benefits:** Global CDN, automatic HTTPS, instant rollback, preview channels
- **Endpoint:** https://prompt-wars-43ba6.web.app

### 6. **Google Maps JavaScript API**
- **Purpose:** Interactive visualization of crowd zones and recommendations
- **Usage:** Map component renders stadium/venue layout with:
  - Zone markers color-coded by congestion level
  - Wait time labels
  - Polyline routing suggestions (e.g., "Gate A → Gate B")
- **Benefit:** Spatial awareness for human decision-makers

### 7. **Google Generative AI (Gemini)**
- **Purpose:** AI-powered crowd analysis and recommendation generation
- **Model:** `gemini-pro` (text-based analysis)
- **Flow:**
  1. Current crowd metrics fed to Gemini
  2. Gemini returns natural language insights (risk + 1-line recommendation)
  3. Insights displayed in dashboard with "⚡ Insight:" label
- **Integration:** Debounced calls prevent excessive API usage
- **Benefit:** Contextual intelligence beyond rule-based alerts

---

## Security Considerations

### Environment Variable Protection
- API keys (Firebase, Gemini, Google Maps) stored in `.env` files (not committed to Git)
- `.gitignore` prevents accidental secret leakage
- Backend accepts configuration via environment variables only

### Authentication & Authorization
- Firebase Authentication enforces user identity
- Admin routes protected via `ProtectedAdminRoute` component (JWT verification)
- Firestore security rules restrict alert write access to authenticated admins

### CORS & Headers
- Backend CORS middleware allowlists frontend origin only
- Helmet CSP headers prevent XSS and click-jacking attacks
- No overly permissive CORS (no `*` wildcard)

### Data Privacy
- User passwords never stored locally (Firebase Auth handles securely)
- Crowd metrics are aggregated, not per-individual
- Alert data is retention-limited (recent 5 only in queryable form)

---

## Efficiency & Performance

### API Optimization
- **Debounced Gemini Calls:** AI is invoked every 1.5+ seconds (not on every crowd update)
- **Event-Driven Architecture:** No polling; Firebase listeners trigger on data change only
- **Lazy Loading:** Map component loaded on-demand; not rendered until admin dashboard visible

### Build & Deployment
- **Frontend Build:** Vite produces optimized, tree-shaken bundle (83 KB JS + 10 KB CSS gzipped)
- **Backend Containerization:** Docker multi-stage builds minimize image size
- **Cloud Run Cold Starts:** ~500ms first request; subsequent requests <100ms

### Data Transmission
- **Batched Updates:** Multiple crowd metrics sent as single JSON object (not individual requests)
- **Real-Time Listener Efficiency:** Firebase Realtime DB reuses connection; minimum bandwidth
- **Firestore Query Limits:** Alert queries limited to 5 documents (not unbounded)

---

## Testing Strategy

### Health Check (Backend)
- Endpoint: `GET /api/health`
- Validates:
  - Server is running
  - Firebase Realtime DB is accessible
  - Response time < 1 second
- Used as both monitoring probe and diagnostic endpoint

### Manual UI Testing
- Authentication flow: sign up → login → session persistence
- Alert creation and notification display
- Map rendering and marker updates
- AI insight generation and placeholder UX

### API Response Verification
- Crowd data format validation (numeric values in expected ranges)
- Alert message structure (expected keys: message, level, timestamp)
- Gemini API response handling (text extraction, fallback on error)

### Accessibility Testing
- Keyboard navigation through dashboard
- Screen reader compatibility (ARIA labels on icons, semantic HTML)
- Color contrast verification (critical alerts use high-contrast red)

---

## Accessibility Improvements

### ARIA Labels & Semantic HTML
- Buttons include `aria-label` attributes describing action ("Add Alert", "Logout")
- Alert severity indicators have `role="alert"` for screen reader announcements
- Headings use semantic `<h1>`, `<h2>` hierarchy

### Color Accessibility
- Severity colors (High: #ef4444 red, Medium: #eab308 gold, Low: #10b981 green) have high contrast against white
- Icons paired with text labels (not color-only indicators)
- No reliance on color alone to convey meaning

### Responsive Design
- Mobile-friendly layout (CSS Grid, Flexbox)
- Touch-friendly button sizes (minimum 44x44 px)
- Text scales responsively without horizontal overflow

### Readable UI
- Font sizes: body text 14–16px, headings 20–32px
- Line height: 1.5 for body, 1.2 for headings
- Sufficient whitespace between interactive elements

---

## Live Demo

### Frontend Dashboard
**URL:** https://prompt-wars-43ba6.web.app

**Access:**
1. Sign up with email/password (Firebase Auth)
2. View real-time crowd metrics, alerts, and AI insights
3. Admin login to send test alerts (if credentials provided)

### Backend Health Endpoint
**URL:** https://prompt-wars-backend-919982044794.asia-south1.run.app/api/health

**Response Example:**
```json
{
  "status": "ok",
  "backend": "UP",
  "firebase": "connected",
  "timestamp": "2026-04-14T12:30:45Z"
}
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project with Auth, Realtime DB, Firestore enabled
- Google Maps API key
- Google Gemini API key
- Google Cloud account with Cloud Run enabled

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/[your-org]/prompt-wars.git
cd prompt-wars
```

#### 2. Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your Firebase credentials and API keys:
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_PROJECT_ID=...
# VITE_GOOGLE_MAPS_API_KEY=...
# VITE_GEMINI_API_KEY=...
npm run dev
# Runs on http://localhost:5173
```

#### 3. Backend Setup
```bash
cd ../server
npm install
cp .env.example .env
# Edit .env with your Firebase credentials:
# FIREBASE_PROJECT_ID=...
# FIREBASE_PRIVATE_KEY=...
# FIREBASE_CLIENT_EMAIL=...
npm run start
# Runs on http://localhost:3000
```

#### 4. Verify Health Check
```bash
curl http://localhost:3000/api/health
# Should return: { "status": "ok", "backend": "UP", "firebase": "connected" }
```

### Deployment

#### Firebase Hosting (Frontend)
```bash
cd client
npm run build
firebase login
firebase deploy
```

#### Google Cloud Run (Backend)
```bash
cd server
gcloud builds submit --tag gcr.io/[YOUR_PROJECT]/prompt-wars-backend
gcloud run deploy prompt-wars-backend \
  --image gcr.io/[YOUR_PROJECT]/prompt-wars-backend \
  --platform managed \
  --allow-unauthenticated
```

---

## What I Learned

### 1. Cloud-Native Real-Time Architecture
- Event-driven listeners (Firebase `onValue`, `onSnapshot`) scale better than polling
- Debouncing is critical for controlling AI API costs while maintaining responsiveness
- Serverless deployments remove infrastructure overhead but require careful error handling

### 2. Integrating External AI Services
- Prompt engineering matters—structured data inputs yield better AI outputs
- Graceful degradation (fallback to rules when AI fails) ensures system resilience
- Debouncing AI calls prevents surprise cost spikes in high-volume scenarios

### 3. Multi-Tier Decision Systems
- Combining rule-based logic (High/Medium/Low) with AI insights creates powerful hybrid approach
- Semantic layers (severity levels) make decisions more explainable to humans
- Clear labeling of system behavior ("AI-Powered", "Smart System") builds user trust

### 4. Full-Stack Deployment Pipeline
- Containerization via Docker simplifies cloud deployment (Dockerfile → Cloud Run)
- Firebase Hosting + Cloud Run provides complete full-stack infrastructure
- CI/CD via `gcloud builds` + `firebase deploy` can be automated with GitHub Actions

### 5. Accessibility & UI Clarity
- ARIA labels and semantic HTML are not just best practice—they enable real inclusion
- Visual hierarchy (icons + text + color) communicates urgency without relying on color alone
- Conditional UI states (loading placeholders, error messages) improve user trust

---

## Future Improvements

### 1. Advanced Predictive Analytics
- Train ML models on historical crowd patterns to forecast congestion 30–60 minutes ahead
- Enable proactive management instead of reactive alerts
- Use BigQuery for long-term trend analysis

### 2. IoT Sensor Integration
- Connect physical crowd sensors (LIDAR, infrared) for exact occupancy measurement
- Stream sensor data via Pub/Sub to Firestore for archival
- Combine AI analysis with sensor data for higher accuracy

### 3. Mobile App
- React Native or Flutter app for venue staff
- Push notifications for critical alerts
- Offline-capable dashboard (cached metrics)

### 4. Multi-Venue Support
- Dashboard supporting multiple venue locations
- Comparative analytics across venues
- Centralized admin panel for chain operators

### 5. Computer Vision Integration
- Security camera feeds analyzed for crowd density estimation
- Automated detection of unusual gathering patterns
- Compliance with occupancy regulations

### 6. Custom Threshold Configuration
- Admin panel to set severity thresholds per venue
- Dynamic thresholds based on event type (concert vs. normal day)
- Seasonal adjustments (holiday crowds vs. off-season)

### 7. Advanced Notification Channels
- SMS and email alerts in addition to dashboard
- Integration with venue communication systems
- Escalation workflows (auto-notify security if critical)

---

## Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 18, Vite | UI rendering, real-time updates |
| **Backend** | Node.js, Express | API server, health checks |
| **Authentication** | Firebase Auth | User identity, session management |
| **Real-Time Database** | Firebase Realtime DB | Live crowd metrics, instant updates |
| **Data Persistence** | Firestore | Alert history, queryable archive |
| **Mapping** | Google Maps API | Spatial visualization, routing |
| **AI Analysis** | Google Gemini | Contextual insights, recommendations |
| **Hosting** | Firebase Hosting (frontend), Cloud Run (backend) | Deployment, scaling, HTTPS |
| **Containerization** | Docker | Backend packaging for Cloud Run |
| **Security** | Helmet, CORS, CSP | HTTP headers, attack prevention |

---

## License

[MIT / Select Your License]

---

## Contact & Support

For questions or issues:
- **GitHub:** [Your Repository URL]
- **Email:** [Your Contact Email]
- **Live Demo:** https://prompt-wars-43ba6.web.app

---

**Last Updated:** April 2026
