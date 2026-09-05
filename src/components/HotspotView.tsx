import { useState, useEffect } from 'react';
import { SanitationReport, SanitationHotspot, HotspotRiskLevel } from '../types';
import { detectHotspots, fetchAIEnrichedHotspots } from '../services/hotspotDetection';
import { HotspotMap } from './HotspotMap';
import { HotspotDetailModal } from './HotspotDetailModal';
import {
  Flame,
  AlertTriangle,
  Sparkles,
  MapPin,
  RefreshCw,
  Filter,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
} from 'lucide-react';

interface HotspotViewProps {
  reports: SanitationReport[];
  onSelectReport: (report: SanitationReport) => void;
  onViewInTracker: (areaName: string) => void;
}

const RISK_CARD_THEME: Record<
  HotspotRiskLevel,
  { border: string; bg: string; badgeBg: string; badgeText: string; dotBg: string }
> = {
  Critical: {
    border: 'border-red-300 hover:border-red-500',
    bg: 'bg-red-50/40',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    dotBg: 'bg-red-600',
  },
  High: {
    border: 'border-orange-300 hover:border-orange-500',
    bg: 'bg-orange-50/40',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800',
    dotBg: 'bg-orange-500',
  },
  Medium: {
    border: 'border-amber-300 hover:border-amber-500',
    bg: 'bg-amber-50/30',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    dotBg: 'bg-amber-500',
  },
  Low: {
    border: 'border-emerald-200 hover:border-emerald-400',
    bg: 'bg-emerald-50/30',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    dotBg: 'bg-emerald-600',
  },
};

export function HotspotView({ reports, onSelectReport, onViewInTracker }: HotspotViewProps) {
  const [hotspots, setHotspots] = useState<SanitationHotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<SanitationHotspot | null>(null);
  const [filterRisk, setFilterRisk] = useState<HotspotRiskLevel | 'ALL'>('ALL');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  // Cluster reports into hotspots
  useEffect(() => {
    const computed = detectHotspots(reports);
    setHotspots(computed);
  }, [reports]);

  // Handle AI Deep Diagnostic Trigger
  const handleRunAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const enriched = await fetchAIEnrichedHotspots(reports);
      setHotspots(enriched);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error during AI hotspot analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const visibleHotspots = hotspots.filter(
    (h) => filterRisk === 'ALL' || h.riskLevel === filterRisk
  );

  const criticalCount = hotspots.filter((h) => h.riskLevel === 'Critical').length;
  const highCount = hotspots.filter((h) => h.riskLevel === 'High').length;
  const mediumCount = hotspots.filter((h) => h.riskLevel === 'Medium').length;
  const lowCount = hotspots.filter((h) => h.riskLevel === 'Low').length;

  return (
    <div className="space-y-6" id="view-hotspots">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
              <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              Advanced AI Feature
            </span>
            <span className="text-xs text-gray-400">• Updated at {lastRefreshed}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            AI Sanitation Hotspot Detection & Map Analytics
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Automatically aggregates citizen reports by geographic proximity to detect repeat waste
            vulnerabilities, evaluate cumulative community risk, and generate actionable municipal directives.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-run-hotspot-ai"
            onClick={handleRunAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white transition flex items-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Clusters...' : 'Re-Run AI Diagnostics'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => setFilterRisk('ALL')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterRisk === 'ALL'
              ? 'bg-gray-900 text-white border-gray-900 shadow-md'
              : 'bg-white text-gray-800 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-xs font-medium opacity-80">Total Identified Hotspots</div>
          <div className="text-2xl font-black mt-1 font-mono">{hotspots.length}</div>
          <div className="text-[11px] opacity-70 mt-0.5">Across Ward 4 jurisdiction</div>
        </div>

        <div
          onClick={() => setFilterRisk('Critical')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterRisk === 'Critical'
              ? 'bg-red-600 text-white border-red-700 shadow-md'
              : 'bg-red-50/50 text-red-900 border-red-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Critical Risk Areas</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-200"></span>
          </div>
          <div className="text-2xl font-black mt-1 font-mono">{criticalCount}</div>
          <div className="text-[11px] opacity-80 mt-0.5">Hazard & toxic dumping alerts</div>
        </div>

        <div
          onClick={() => setFilterRisk('High')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterRisk === 'High'
              ? 'bg-orange-600 text-white border-orange-700 shadow-md'
              : 'bg-orange-50/50 text-orange-900 border-orange-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">High Risk Corridors</span>
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-200"></span>
          </div>
          <div className="text-2xl font-black mt-1 font-mono">{highCount}</div>
          <div className="text-[11px] opacity-80 mt-0.5">Persistent recurring overflow</div>
        </div>

        <div
          onClick={() => setFilterRisk('Low')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            filterRisk === 'Low'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
              : 'bg-emerald-50/50 text-emerald-900 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Stabilized / Low Risk</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-200"></span>
          </div>
          <div className="text-2xl font-black mt-1 font-mono">{lowCount}</div>
          <div className="text-[11px] opacity-80 mt-0.5">High clearance & sanitized</div>
        </div>
      </div>

      {/* Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Ward 4 GIS Hotspot Map</h2>
            <span className="text-xs text-gray-500">
              (Interactive OpenStreetMap with risk-weighted danger radiuses)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl text-xs font-medium">
            {(['ALL', 'Critical', 'High', 'Medium', 'Low'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-3 py-1 rounded-lg transition ${
                  filterRisk === r
                    ? 'bg-white text-gray-900 font-semibold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {r === 'ALL' ? 'All Risks' : r}
              </button>
            ))}
          </div>
        </div>

        <HotspotMap
          hotspots={hotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={(h) => setSelectedHotspot(h)}
          filterRisk={filterRisk}
          height="480px"
        />
      </div>

      {/* Hotspots Breakdown Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <span>Detected Hotspot Zones</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-mono">
              {visibleHotspots.length}
            </span>
          </h3>
          <span className="text-xs text-gray-500">Click any card to zoom on map & view ticket history</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleHotspots.map((hotspot) => {
            const theme = RISK_CARD_THEME[hotspot.riskLevel] || RISK_CARD_THEME.Medium;
            const isSelected = selectedHotspot?.id === hotspot.id;

            return (
              <div
                key={hotspot.id}
                id={`card-${hotspot.id}`}
                onClick={() => setSelectedHotspot(hotspot)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${
                  theme.border
                } ${isSelected ? 'ring-2 ring-emerald-500 shadow-md' : ''}`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${theme.dotBg}`}></span>
                      {hotspot.riskLevel} Risk
                    </span>

                    <span className="text-xs font-mono font-semibold text-gray-500">
                      {hotspot.reportCount} {hotspot.reportCount === 1 ? 'Report' : 'Reports'}
                    </span>
                  </div>

                  {/* Hotspot Title */}
                  <h4 className="text-base font-bold text-gray-900 leading-snug mb-1.5 group-hover:text-emerald-700 transition">
                    {hotspot.area}
                  </h4>

                  {/* Top Issue & Priority */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
                      Top: {hotspot.topIssue}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>Avg Severity {hotspot.averageSeverity}/10</span>
                  </div>

                  {/* Risk Explanation Snippet */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {hotspot.riskExplanation}
                  </p>

                  {/* Unresolved / Resolved Bar */}
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs mb-3 space-y-1.5">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Status Balance</span>
                      <span className="font-semibold text-gray-800">
                        {hotspot.unresolvedReports} Open / {hotspot.resolvedReports} Resolved
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${hotspot.resolutionRate}%` }}
                      ></div>
                      <div
                        className="bg-red-400 h-full"
                        style={{ width: `${100 - hotspot.resolutionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Recommended Action Snippet */}
                  <div className="text-[11px] text-gray-500 line-clamp-2 italic mb-3">
                    "{hotspot.recommendedAction}"
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 group">
                    <span>Inspect Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(hotspot.mostRecentReport).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Hotspot Details */}
      <HotspotDetailModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        onSelectReport={onSelectReport}
        onViewInTracker={onViewInTracker}
      />
    </div>
  );
}
