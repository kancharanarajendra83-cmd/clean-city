import React, { useState, useMemo } from 'react';
import { SanitationReport, SanitationCategory, ReportStatus, SeverityLevel, SanitationHotspot, HotspotRiskLevel } from '../types';
import { formatRelativeTime, getInitials, getAvatarColor } from '../utils/formatters';
import { detectHotspots } from '../services/hotspotDetection';
import { HotspotMap } from './HotspotMap';
import { HotspotDetailModal } from './HotspotDetailModal';
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  PieChart,
  TrendingUp,
  Download,
  RotateCcw,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  ThumbsUp,
  Heart,
  MessageSquare,
  Users,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  reports: SanitationReport[];
  onSelectReport: (report: SanitationReport) => void;
  onNavigateToReport: () => void;
  onNavigateToTracker: (locationFilter?: string) => void;
  onNavigateToInsights: () => void;
  onNavigateToHotspots?: () => void;
  onResetData: () => void;
  onExportData: () => void;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  onSelectReport,
  onNavigateToReport,
  onNavigateToTracker,
  onNavigateToInsights,
  onNavigateToHotspots,
  onResetData,
  onExportData,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<SanitationHotspot | null>(null);
  const [hotspotRiskFilter, setHotspotRiskFilter] = useState<HotspotRiskLevel | 'ALL'>('ALL');

  // Compute Hotspots dynamically from stored reports
  const hotspots = useMemo(() => detectHotspots(reports), [reports]);
  const visibleHotspots = useMemo(
    () => hotspots.filter((h) => hotspotRiskFilter === 'ALL' || h.riskLevel === hotspotRiskFilter),
    [hotspots, hotspotRiskFilter]
  );

  // Compute Key Metrics
  const totalReports = reports.length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
  const inProgressReports = reports.filter((r) => r.status === 'In Progress').length;
  const openReports = reports.filter((r) => r.status === 'Reported' || r.status === 'Under Review' || r.status === 'Assigned').length;
  const highPriorityReports = reports.filter((r) => r.priority >= 7 || r.severity === 'High' || r.severity === 'Critical').length;
  const resolutionPercentage = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Community Engagement Totals
  const totalConfirmations = reports.reduce((acc, r) => acc + (r.confirmationsCount || 0), 0);
  const totalKudos = reports.reduce((acc, r) => acc + (r.crewKudos || 0), 0);
  const totalComments = reports.reduce((acc, r) => acc + (r.comments?.length || 0), 0);

  // Category counts
  const categoryCounts: Record<SanitationCategory, number> = {
    'Garbage Overflow': 0,
    'Illegal Dumping': 0,
    'Street Litter': 0,
    'Overflowing Bin': 0,
    'Unclean Public Space': 0,
    'Waste Collection Issue': 0,
    'Other': 0,
  };

  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  });

  // Top Category
  let topCategory: SanitationCategory = 'Garbage Overflow';
  let topCategoryCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > topCategoryCount) {
      topCategoryCount = count;
      topCategory = cat as SanitationCategory;
    }
  });

  // Status breakdown
  const statusCounts: Record<ReportStatus, number> = {
    'Reported': 0,
    'Under Review': 0,
    'Assigned': 0,
    'In Progress': 0,
    'Resolved': 0,
  };
  reports.forEach((r) => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });

  // Severity breakdown
  const severityCounts: Record<SeverityLevel, number> = {
    'Critical': 0,
    'High': 0,
    'Medium': 0,
    'Low': 0,
  };
  reports.forEach((r) => {
    severityCounts[r.severity] = (severityCounts[r.severity] || 0) + 1;
  });

  // Recent 4 reports
  const recentReports = [...reports].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-400/20">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ward 4 Civic Sanitation & Dispatch Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            CleanCity Community Dashboard
          </h1>
          <p className="mt-3 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Real-time citizen reporting intelligence, neighborhood solidarity, and municipal field accountability. Powered by automated AI classification and transparent status progression.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              id="hero-btn-report"
              onClick={onNavigateToReport}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Waste in Your Neighborhood</span>
            </button>
            <button
              id="hero-btn-insights"
              onClick={onNavigateToInsights}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer backdrop-blur-xs"
            >
              <span>Explore AI Insights & Directives</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Community Solidarity Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-emerald-100 shadow-2xs">
        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-zinc-900">{totalConfirmations}</div>
            <div className="text-[11px] text-zinc-500">Citizen Confirmations</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-zinc-900">{totalKudos}</div>
            <div className="text-[11px] text-zinc-500">Crew Appreciations</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-zinc-900">{totalComments}</div>
            <div className="text-[11px] text-zinc-500">Community Notes</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-extrabold text-zinc-900">Ward 4</div>
            <div className="text-[11px] text-zinc-500">Active Civic Sector</div>
          </div>
        </div>
      </div>

      {/* 6 Key Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Total */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-semibold">Total Reports</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-zinc-900">{totalReports}</div>
          <span className="text-[11px] text-zinc-500">Citizen submissions</span>
        </div>

        {/* Metric 2: Open */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-semibold">Open Queues</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600">{openReports}</div>
          <span className="text-[11px] text-zinc-500">Under review or assigned</span>
        </div>

        {/* Metric 3: In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-semibold">In Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">{inProgressReports}</div>
          <span className="text-[11px] text-zinc-500">Crew actively on-site</span>
        </div>

        {/* Metric 4: Resolved */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{resolvedReports}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">{resolutionPercentage}% cleared</span>
        </div>

        {/* Metric 5: High Priority */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-semibold">High Priority</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600">{highPriorityReports}</div>
          <span className="text-[11px] text-rose-700 font-semibold">Score ≥ 7 urgency</span>
        </div>

        {/* Metric 6: Top Issue */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-semibold">Top Issue</span>
            <PieChart className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-900 truncate mt-1">
            {topCategory}
          </div>
          <span className="text-[11px] text-zinc-500">{topCategoryCount} incidents recorded</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Distribution */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Incident Distribution by Category</h2>
              <p className="text-xs text-zinc-500">Live breakdown across all 7 municipal sanitation types</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
              Ward 4 Records
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(categoryCounts).map(([category, count]) => {
              const percentage = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-700">{category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-zinc-500 text-[11px]">{percentage}%</span>
                      <span className="font-bold text-zinc-900 font-mono w-6 text-right">{count}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Resolution Stages & Severity */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resolution Funnel */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 mb-1">Resolution Funnel Stages</h2>
            <p className="text-xs text-zinc-500 mb-4">Current stage of active municipal tickets</p>

            <div className="space-y-2.5">
              {(['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved'] as ReportStatus[]).map((status) => {
                const count = statusCounts[status];
                const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
                return (
                  <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 text-xs">
                    <span className="font-medium text-zinc-700">{status}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-zinc-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Severity Breakdown Badges */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-zinc-900 mb-1">Severity Breakdown</h2>
            <p className="text-xs text-zinc-500 mb-3">AI-evaluated public health urgency</p>

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800">
                <span className="text-[10px] uppercase font-bold block">Critical</span>
                <span className="text-lg font-extrabold">{severityCounts['Critical']}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                <span className="text-[10px] uppercase font-bold block">High</span>
                <span className="text-lg font-extrabold">{severityCounts['High']}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <span className="text-[10px] uppercase font-bold block">Medium</span>
                <span className="text-lg font-extrabold">{severityCounts['Medium']}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="text-[10px] uppercase font-bold block">Low</span>
                <span className="text-lg font-extrabold">{severityCounts['Low']}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 6: AI SANITATION HOTSPOTS & GIS MAP */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6" id="dashboard-hotspots-section">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
              <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>AI Sanitation Hotspot Detection</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
              Ward 4 Cleanliness Hotspots & Risk Clusters
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl">
              Deterministic incident clustering & AI pattern analysis flagging recurring sanitation problem areas. Evaluates cumulative risk to dispatch proactive municipal clearance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToHotspots && (
              <button
                id="btn-dash-open-hotspots"
                onClick={onNavigateToHotspots}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition shadow-2xs cursor-pointer"
              >
                <span>Full GIS View</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-100">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-zinc-600 mr-1">Risk Filter:</span>
            {(['ALL', 'Critical', 'High', 'Medium', 'Low'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setHotspotRiskFilter(risk)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  hotspotRiskFilter === risk
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {risk === 'ALL' ? `All (${hotspots.length})` : risk}
              </button>
            ))}
          </div>
          <div className="text-xs text-zinc-500">
            Showing {visibleHotspots.length} flagged hotspot areas
          </div>
        </div>

        {/* Interactive Hotspot Map */}
        <HotspotMap
          hotspots={hotspots}
          selectedHotspot={selectedHotspot}
          onSelectHotspot={(h) => setSelectedHotspot(h)}
          filterRisk={hotspotRiskFilter}
          height="380px"
        />

        {/* Hotspot Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleHotspots.map((hotspot) => {
            const theme = RISK_CARD_THEME[hotspot.riskLevel] || RISK_CARD_THEME.Medium;
            return (
              <div
                key={hotspot.id}
                id={`dash-hotspot-${hotspot.id}`}
                onClick={() => setSelectedHotspot(hotspot)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer bg-white shadow-xs hover:shadow-md flex flex-col justify-between ${theme.border} group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}>
                      <span className={`w-2 h-2 rounded-full ${theme.dotBg}`}></span>
                      {hotspot.riskLevel} Risk
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-600">
                      {hotspot.reportCount} {hotspot.reportCount === 1 ? 'Report' : 'Reports'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                    {hotspot.area}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-zinc-600 mt-1 mb-2.5">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 font-medium">
                      {hotspot.topIssue}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-red-600 font-medium">{hotspot.unresolvedReports} open</span>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                    {hotspot.riskExplanation}
                  </p>

                  <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-100 line-clamp-2 italic mb-3">
                    Action: "{hotspot.recommendedAction}"
                  </div>
                </div>

                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Area & Tickets</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {hotspot.resolutionRate}% resolved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hotspot Detail Modal */}
      <HotspotDetailModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
        onSelectReport={onSelectReport}
        onViewInTracker={(areaName) => onNavigateToTracker(areaName)}
      />

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-zinc-900">Recent Incident Submissions</h2>
            <p className="text-xs text-zinc-500">Click any report to view timeline and simulate status progression</p>
          </div>
          <button
            onClick={onNavigateToTracker}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All ({reports.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="p-3.5 rounded-xl border border-zinc-200 hover:border-emerald-300 hover:shadow-2xs transition-all bg-zinc-50/50 cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-zinc-700">{report.id}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                    {report.status}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-zinc-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {report.title}
                </h4>
                <div className="flex items-center space-x-1 text-[11px] text-zinc-500 mt-1 truncate">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{report.location}</span>
                </div>
              </div>

              {/* Engagement line with avatar and time */}
              <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[10px] text-zinc-500">
                <div className="flex items-center space-x-1.5">
                  {report.reporterName && (
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${getAvatarColor(report.reporterName)}`}>
                      {getInitials(report.reporterName)}
                    </div>
                  )}
                  <span>{formatRelativeTime(report.submittedAt)}</span>
                </div>
                {(report.confirmationsCount || 0) > 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center space-x-0.5">
                    <ThumbsUp className="w-2.5 h-2.5" />
                    <span>{report.confirmationsCount}</span>
                  </span>
                ) : (
                  <span className="font-semibold text-zinc-700">P-{report.priority}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demonstration Management Bar */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Final-Year CSE Project: Client-Side LocalStorage Persistence + FOSS Dual AI Engine.</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onExportData}
            id="btn-export-data"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-lg font-medium transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Data (JSON)</span>
          </button>
          <button
            onClick={onResetData}
            id="btn-reset-demo-data"
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-lg font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
