import React from 'react';
import {
  ShieldCheck,
  Cpu,
  CheckCircle2,
  GitBranch,
  Terminal,
  Globe,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>FINAL-YEAR CSE PROJECT SPECIFICATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          CleanCity Project Documentation & Architecture
        </h1>
        <p className="text-zinc-600 text-sm mt-1">
          AI-Powered Citizen Waste Reporting & Municipal Accountability Platform built for hands-on Vibe Coding demonstration and Vercel cloud deployment.
        </p>
      </div>

      {/* 5 Core Features Matrix */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-5">
        <h2 className="text-lg font-bold text-zinc-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>Core MVP Feature Implementation Status</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs text-zinc-900 uppercase">
                Feature 1 — Report a Sanitation Issue
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Drag-and-drop or file upload for photos, description validation, GPS location detection, category options, and unique ID generation (<code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded">CC-2026-XXXX</code>).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs text-zinc-900 uppercase">
                Feature 2 — AI Categorization & Priority
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Analyzes image and description to output structured JSON: category, severity (Low/Med/High/Critical), priority score (1-10), diagnostic summary, and municipal action recommendation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs text-zinc-900 uppercase">
                Feature 3 — Track Report Status
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Complete status lifecycle: <strong>Reported → Under Review → Assigned → In Progress → Resolved</strong> with step indicators, audit log timestamps, keyword/ID search, and live status advance simulation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs text-zinc-900 uppercase">
                Feature 4 — Community Dashboard
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Key indicators: Total reports, open queues, in-progress, resolved percentage, high-priority issues, issue category distribution progress bars, and recent activity feed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-xs text-zinc-900 uppercase">
                Feature 5 — AI Insights & Recommended Actions
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Aggregated analytical intelligence: citywide risk assessment level, dominant issue detection, strategic diagnostic insights, municipal operational action directives, and recurring geographic hotspots.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-1.5">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <h3 className="font-bold text-xs text-zinc-900 uppercase">
                Feature 6 — AI Sanitation Hotspot Detection & Map (Advanced)
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Deterministic geographic clustering + optional Gemini AI pattern analysis identifying recurring complaint clusters. Interactive Leaflet GIS map with color-coded risk levels (Critical, High, Medium, Low) and drill-down modal.
            </p>
          </div>
        </div>
      </div>

      {/* Free & Open-Source Compliance & AI Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">AI Dual-Engine Architecture</h2>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            CleanCity features a modular AI layer separated from the presentation components:
          </p>
          <ul className="text-xs text-zinc-700 space-y-2 list-disc pl-4">
            <li>
              <strong>Cloud AI Engine:</strong> Uses <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">gemini-3.8-flash</code> via the official <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">@google/genai</code> SDK on the server-side proxy route (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">/api/analyze-report</code>).
            </li>
            <li>
              <strong>FOSS Heuristic Fallback:</strong> If no API key is provided or the network is disconnected, CleanCity automatically activates a rule-based intelligent NLP and scoring engine (<code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">ruleEngine.ts</code>) ensuring 100% crash-proof demonstration.
            </li>
            <li>
              <strong>Zero Cost Guarantee:</strong> Operates entirely without paid subscriptions or mandatory credit card registration.
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-zinc-900">Vercel & Local Deployment</h2>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed">
            Built as a modern React 19 + TypeScript + Tailwind CSS application:
          </p>
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl font-mono text-[11px] space-y-1">
            <div className="text-slate-400"># 1. Clone & Install</div>
            <div>git clone &lt;repo-url&gt; && cd cleancity</div>
            <div>npm install</div>
            <div className="text-slate-400 pt-1"># 2. Local Development Server</div>
            <div>npm run dev</div>
            <div className="text-slate-400 pt-1"># 3. Production Build for Vercel</div>
            <div>npm run build</div>
          </div>
          <p className="text-[11px] text-zinc-500">
            For Vercel deployment, connect your GitHub repository and set Build Command to <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">npm run build</code> and Output Directory to <code className="font-mono bg-zinc-100 px-1 py-0.5 rounded">dist</code>.
          </p>
        </div>
      </div>

      {/* Verification Checklist */}
      <div className="bg-slate-50 border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-emerald-600" />
          <span>Final-Year Project Viva Verification Checklist</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-zinc-700">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>5 Core Features Complete</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold text-rose-900">Feature 6 Hotspots & GIS Map</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Photo Upload + 4 Presets</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>GPS Geolocation Detection</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AI Category & Priority (1-10)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>5-Stage Status Progression</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Advance Status Demo Tool</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Analytics Dashboard & Funnel</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>AI Strategic Insights</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>LocalStorage Persistence</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>FOSS / Free Tier Compliant</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No Exposed API Keys</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Vercel Deploy Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
