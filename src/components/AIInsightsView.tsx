import React, { useState, useEffect } from 'react';
import { SanitationReport, AIInsightsResult } from '../types';
import { generateCommunityInsightsAI } from '../services/aiService';
import {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';

interface AIInsightsViewProps {
  reports: SanitationReport[];
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ reports }) => {
  const [insights, setInsights] = useState<AIInsightsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Auto-generate on initial mount or reports change
  useEffect(() => {
    let isMounted = true;
    async function loadInsights() {
      setLoading(true);
      try {
        const result = await generateCommunityInsightsAI(reports);
        if (isMounted) setInsights(result);
      } catch (err) {
        console.error('Failed to generate insights:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadInsights();

    return () => {
      isMounted = false;
    };
  }, [reports]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await generateCommunityInsightsAI(reports);
      setInsights(result);
    } catch (err) {
      console.error('Failed to regenerate insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Critical':
        return 'bg-red-500 text-white border-red-600';
      case 'High':
        return 'bg-rose-500 text-white border-rose-600';
      case 'Medium':
        return 'bg-amber-500 text-white border-amber-600';
      case 'Low':
        return 'bg-emerald-500 text-white border-emerald-600';
      default:
        return 'bg-zinc-500 text-white border-zinc-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Community Patterns & Sanitation Directives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Neighborhood AI Insights & Action Plan
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            Synthesizes all citizen tickets to identify recurring waste bottlenecks, detect geographic hotspots, and generate targeted field recommendations for municipal crews.
          </p>
        </div>

        <button
          id="btn-refresh-ai-insights"
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50 self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Synthesizing...' : 'Regenerate AI Analysis'}</span>
        </button>
      </div>

      {loading && !insights && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-xs">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <h3 className="text-base font-bold text-zinc-800">Synthesizing Community Intelligence...</h3>
          <p className="text-xs text-zinc-500 mt-1">
            Evaluating incident frequencies, spatial hotspots, and priority distribution with Gemini 3.8-Flash.
          </p>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {/* Risk Level & Top Issue Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-zinc-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                  Municipal Strategic Health Index
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-zinc-400">Engine Source:</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-emerald-300">
                  {insights.source === 'gemini' ? 'Gemini 3.8-Flash' : 'Intelligent Local Heuristic (FOSS)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Risk Level */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-xs text-zinc-400 block mb-1">Citywide Risk Level</span>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getRiskColor(insights.riskLevel)}`}>
                    {insights.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Dominant Problem */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-xs text-zinc-400 block mb-1">Dominant Issue Category</span>
                <div className="text-lg font-bold text-white truncate">{insights.topIssue}</div>
              </div>

              {/* High Priority Unresolved */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-xs text-zinc-400 block mb-1">High-Priority Incidents</span>
                <div className="text-lg font-bold text-rose-400">
                  {insights.summaryStats.highPriorityCount} <span className="text-xs text-zinc-400 font-normal">critical alerts</span>
                </div>
              </div>
            </div>

            {/* Key Strategic Insight */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1 flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                <span>Key Strategic Insight:</span>
              </span>
              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
                "{insights.keyInsight}"
              </p>
            </div>
          </div>

          {/* 2-Column: Recommended Actions & Hotspot Locations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Municipal Recommended Actions (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Targeted Municipal Directives
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Concrete operational guidelines generated by CleanCity AI for civic crews
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {insights.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium text-zinc-800 leading-relaxed">
                        {rec}
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-emerald-200">
                        Operational Directive
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotspot Locations Panel (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-rose-500" />
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    Recurring Hotspot Corridors
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Sectors with repeated complaints requiring persistent surveillance
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {insights.hotspots.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-3 text-center">
                    No recurring hotspots clustered currently.
                  </p>
                ) : (
                  insights.hotspots.map((hotspot, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </div>
                        <span className="text-xs font-bold text-zinc-900 truncate">
                          {hotspot.location}
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md shrink-0 ml-2">
                        {hotspot.count} {hotspot.count === 1 ? 'Report' : 'Reports'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <strong>Hotspot Protocol:</strong> Locations with ≥2 recurrent reports trigger automatic notification to the Ward Chief Sanitation Inspector for route re-adjustment.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
