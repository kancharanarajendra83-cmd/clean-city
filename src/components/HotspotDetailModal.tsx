import { SanitationHotspot, SanitationReport, HotspotRiskLevel } from '../types';
import {
  X,
  MapPin,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface HotspotDetailModalProps {
  hotspot: SanitationHotspot | null;
  onClose: () => void;
  onSelectReport: (report: SanitationReport) => void;
  onViewInTracker: (areaName: string) => void;
}

const RISK_BADGE: Record<
  HotspotRiskLevel,
  { label: string; bg: string; text: string; border: string; iconBg: string }
> = {
  Critical: {
    label: 'Critical Hazard Zone',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    iconBg: 'bg-red-600',
  },
  High: {
    label: 'High Priority Hotspot',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    iconBg: 'bg-orange-500',
  },
  Medium: {
    label: 'Moderate Hotspot',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    iconBg: 'bg-amber-500',
  },
  Low: {
    label: 'Low / Stabilized Zone',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-600',
  },
};

export function HotspotDetailModal({
  hotspot,
  onClose,
  onSelectReport,
  onViewInTracker,
}: HotspotDetailModalProps) {
  if (!hotspot) return null;

  const riskStyle = RISK_BADGE[hotspot.riskLevel] || RISK_BADGE.Medium;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fadeIn"
      id="modal-hotspot-detail"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-gray-100 ${riskStyle.bg} flex items-start justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${riskStyle.bg} ${riskStyle.text} border ${riskStyle.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${riskStyle.iconBg}`}></span>
                {riskStyle.label}
              </span>

              {hotspot.source === 'gemini' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  <Sparkles className="w-3 h-3" />
                  Gemini 3.8-Flash Diagnosed
                </span>
              )}

              <span className="text-xs text-gray-500">
                Centroid: {hotspot.coordinates.lat}, {hotspot.coordinates.lng}
              </span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              {hotspot.area}
            </h2>
          </div>

          <button
            id="btn-close-hotspot-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white/80 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80">
              <div className="text-xs font-medium text-gray-500">Total Reports</div>
              <div className="text-2xl font-black text-gray-900 mt-1 font-mono">{hotspot.reportCount}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Recurring incidents</div>
            </div>

            <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-200/60">
              <div className="text-xs font-medium text-red-600">Unresolved</div>
              <div className="text-2xl font-black text-red-700 mt-1 font-mono">{hotspot.unresolvedReports}</div>
              <div className="text-[11px] text-red-500 mt-0.5">Awaiting clearance</div>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
              <div className="text-xs font-medium text-emerald-600">Resolved Rate</div>
              <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{hotspot.resolutionRate}%</div>
              <div className="text-[11px] text-emerald-600 mt-0.5">{hotspot.resolvedReports} cleared</div>
            </div>

            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60">
              <div className="text-xs font-medium text-blue-600">Avg Priority</div>
              <div className="text-2xl font-black text-blue-700 mt-1 font-mono">{hotspot.averageSeverity}/10</div>
              <div className="text-[11px] text-blue-500 mt-0.5">Severity weight</div>
            </div>
          </div>

          {/* AI Explanation & Root Cause Card */}
          <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Hotspot Assessment & Root Cause</span>
            </div>

            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              {hotspot.riskExplanation}
            </p>

            {hotspot.rootCause && (
              <div className="text-xs text-gray-600 bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-start gap-2">
                <span className="font-semibold text-emerald-800 shrink-0">Identified Cause:</span>
                <span>{hotspot.rootCause}</span>
              </div>
            )}
          </div>

          {/* Recommended Municipal Directive */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Recommended Operational Directive</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed font-normal">
              {hotspot.recommendedAction}
            </p>
          </div>

          {/* Category Breakdown */}
          <div>
            <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Incident Category Breakdown</span>
              <span className="text-gray-500 font-normal">Top: {hotspot.topIssue}</span>
            </div>
            <div className="space-y-2">
              {Object.entries(hotspot.categoryBreakdown).map(([cat, count]) => {
                const percent = Math.round((count / hotspot.reportCount) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-700">
                      <span className="font-medium">{cat}</span>
                      <span className="text-gray-500">
                        {count} {count === 1 ? 'report' : 'reports'} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports in this Hotspot */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Reports in this Hotspot ({hotspot.reports.length})
              </div>
              <button
                id="btn-filter-tracker-by-hotspot"
                onClick={() => {
                  onClose();
                  onViewInTracker(hotspot.area);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
              >
                <span>View all in Tracker</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="space-y-2">
              {hotspot.reports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => {
                    onClose();
                    onSelectReport(report);
                  }}
                  className="p-3 rounded-xl border border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/20 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        report.status === 'Resolved'
                          ? 'bg-emerald-500'
                          : report.severity === 'Critical'
                          ? 'bg-red-500'
                          : 'bg-amber-500'
                      }`}
                    ></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-gray-900">{report.id}</span>
                        <span className="text-[11px] px-2 py-0.2 rounded-full bg-gray-100 text-gray-700 font-medium">
                          {report.category}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.2 rounded-full font-medium ${
                            report.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate font-normal">{report.title}</p>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Most recent report logged: {new Date(hotspot.mostRecentReport).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
            >
              Close
            </button>
            <button
              id="btn-inspect-hotspot-tracker"
              onClick={() => {
                onClose();
                onViewInTracker(hotspot.area);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 transition shadow-sm flex items-center gap-1.5"
            >
              <span>Inspect in Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
