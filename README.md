# CleanCity — AI-Powered Citizen Waste Reporting & Accountability Platform

CleanCity is a modern civic technology web application designed to empower citizens to report garbage overflow, illegal dumping, and unclean public spaces, while enforcing municipal transparency and accountability through automated AI triage and step-by-step progress tracking.

Developed as a **Final-Year Computer Science Engineering AI Vibe Coding MVP**, CleanCity is built with free and open-source principles: no paid APIs are mandatory, no credit cards are required, and the entire system operates with dual-engine AI (Google Gemini 3.8-Flash with intelligent local heuristic fallbacks).

---

## 1. Problem Statement

Citizens across urban centers frequently encounter garbage overflow, illegal construction dumping, overflowing public receptacles, and littered streets. However, reporting processes remain fragmented, slow, and opaque. Citizens file complaints without knowing whether municipal sanitation authorities have acknowledged, assigned, or resolved them.

**CleanCity bridges this gap** by:
1. Providing an intuitive citizen reporting interface with photo upload, GPS geotagging, and description fields.
2. Automating incident triage using AI to classify the category, evaluate public health severity, score priority (1–10), and formulate municipal crew directives.
3. Providing an open accountability status tracker (**Reported → Under Review → Assigned → In Progress → Resolved**).
4. Presenting civic dashboards and AI-generated macro recommendations for municipal planners.

---

## 2. Core Features (Implemented 5/5)

### Feature 1 — Report a Sanitation Issue
- **Photo Upload**: Drag-and-drop, camera file upload (with automatic base64 serialization), or 1-click test scenarios (Dumpster Overflow, Construction Debris, Park Bin Spill, Street Litter).
- **Location Capture**: Text entry with neighborhood presets plus browser HTML5 GPS Geolocation detection.
- **Form Validation**: Instant input verification, character counter, and loading state.
- **Unique Ticket Generation**: Creates an authoritative ID (e.g. `CC-2026-1042`).
- **Confirmation Screen**: Displays the generated ID and instant AI assessment with direct transition to tracking.

### Feature 2 — AI-Powered Issue Categorization & Priority
- Evaluates photo evidence and issue description.
- Returns structured JSON:
  - `category`: Garbage Overflow, Illegal Dumping, Street Litter, Overflowing Bin, Unclean Public Space, Waste Collection Issue, or Other.
  - `severity`: Low, Medium, High, Critical.
  - `priority`: Quantitative score (1–10).
  - `summary`: Concise diagnostic summary.
  - `recommendedAction`: Municipal operational crew dispatch directive.
- **Dual Engine**: Server-side Google Gemini 3.8-Flash via `@google/genai` with automatic fallback to an intelligent local heuristic rule engine if offline or if no API key is present.

### Feature 3 — Track Report Status & Lifecycle
- Standard civic progression pipeline:
  $$\text{Reported} \longrightarrow \text{Under Review} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved}$$
- Detailed modal view displaying high-resolution photo, AI diagnostics, audit log with timestamps and actors.
- Multi-criteria filtering by status, category, priority tier, and search query.
- **Demonstration Advance Stage Tool**: Allows academic evaluators to simulate transitioning a ticket from one stage to the next with audit notes.

### Feature 4 — Community & Sanitation Dashboard
- Real-time statistics: Total reports, Open queues, In-progress, Resolved count, Resolution rate percentage, and High-priority issues.
- Category distribution analytics with visual comparative progress bars.
- Resolution lifecycle funnel stages.
- Public health severity breakdown (Critical / High / Medium / Low).
- Recent incident activity feed with direct modal access.

### Feature 5 — AI Insights & Recommended Actions
- Strategic meta-analysis of all citizen reports.
- Computes citywide risk level (Low, Medium, High, Critical).
- Identifies the dominant issue category and recurring geographic hotspots.
- Generates concrete operational directives for sanitation commissioners.
- On-demand "Regenerate AI Analysis" button.

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- **Backend / API**: Express 4, Node.js (`tsx` for dev, `esbuild` for production bundling)
- **AI Integration**: `@google/genai` SDK (Gemini 3.8-Flash model)
- **Local Fallback**: Deterministic heuristic rule engine (100% offline-capable)
- **Persistence**: Browser LocalStorage with automatic realistic demo data seeding
- **Deployment**: Vercel & Node.js container ready

---

## 4. Architecture

```
[ Citizen Browser / React Client ]
       │
       ├── LocalStorage State Engine (Persistence across refreshes)
       │
       ├── POST /api/analyze-report
       │       │
       │       ├── [Server] Check for GEMINI_API_KEY
       │       │        ├── IF Present ──► @google/genai (Gemini 3.8-Flash)
       │       │        └── IF Absent / Error ──► Intelligent Rule Heuristic Engine
       │       │
       │       └── Returns Structured JSON (category, severity, priority, actions)
       │
       └── POST /api/generate-insights
               └── Analyzes community trends & geographic hotspots
```

---

## 5. How to Run Locally

### Prerequisites
- Node.js 20+ and npm installed.

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/your-username/cleancity.git
cd cleancity

# 2. Install dependencies
npm install

# 3. (Optional) Set your Gemini API key in .env
# If omitted, CleanCity automatically runs using the intelligent local rule engine!
echo "GEMINI_API_KEY=your_gemini_api_key" > .env

# 4. Start the full-stack development server
npm run dev

# 5. Open http://localhost:3000 in your browser
```

---

## 6. How to Deploy to Vercel

1. Push your project to a GitHub repository.
2. Log into [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your `cleancity` repository.
4. Verify project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. (Optional) In **Environment Variables**, add `GEMINI_API_KEY` if you have one. If not, the application will transparently use the client-side rule engine fallback.
6. Click **Deploy**. Your application will be live in under a minute!

---

## 7. AI Implementation & Fallback Details

- **Cloud AI Engine**: Server-side proxy calls `ai.models.generateContent` with model `gemini-3.8-flash` and strict JSON schemas via `@google/genai`. All API keys remain confidential and are never exposed to client browsers.
- **Intelligent Heuristic Fallback**: Implemented in `src/services/ruleEngine.ts`. Scans natural language tokens (e.g. hazardous keywords, decomposing smell, blockage, clinical waste, overflowing bins, construction rubble), scores priority from 1–10, and generates realistic municipal dispatch directives.
- **Zero-Failure Guarantee**: If the network times out or Gemini returns unparseable content, the fallback catches the error and serves the heuristic result so the user experience is never interrupted.

---

## 8. Final Cost Check (Free & Open Source Verification)

- **Subscription Fee**: $0.00 (None required)
- **Credit Card Required**: No
- **Paid APIs**: No mandatory paid APIs; Gemini 3.8-Flash has a free tier, and the built-in heuristic engine is 100% free and open-source.
- **Database**: Zero-cost browser LocalStorage persistence.
- **Hosting**: Free on Vercel or Google Cloud Run dev container.

---

## 9. Future Enhancements

- Integration with municipal GIS mapping servers (e.g., OpenStreetMap / Mapbox).
- Citizen push notifications via Web Push API when ticket status changes.
- Automated SMS alerts for field crew dispatchers.
- AI automated image duplicate detection for clustered reports.
