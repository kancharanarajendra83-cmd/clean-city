import React, { useState, useMemo } from 'react';
import { SanitationReport, ReportStatus, SanitationCategory } from '../types';
import { formatRelativeTime, getInitials, getAvatarColor } from '../utils/formatters';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  RotateCcw,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Heart,
  User,
} from 'lucide-react';

interface ReportTrackerProps {
  reports: SanitationReport[];
  initialSearchId?: string;
  onSelectReport: (report: SanitationReport) => void;
  onNavigateToReport: () => void;
  onToggleConfirm?: (reportId: string) => void;
}

const ALL_CATEGORIES: ('All' | SanitationCategory)[] = [
  'All',
  'Garbage Overflow',
  'Illegal Dumping',
  'Street Litter',
  'Overflowing Bin',
  'Unclean Public Space',
  'Waste Collection Issue',
  'Other',
];

const ALL_STATUSES: ('All' | ReportStatus)[] = [
  'All',
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const ReportTracker: React.FC<ReportTrackerProps> = ({
  reports,
  initialSearchId = '',
  onSelectReport,
  onNavigateToReport,
  onToggleConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchId);
  const [statusFilter, setStatusFilter] = useState<'All' | ReportStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<'All' | SanitationCategory>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'HighCritical' | 'Medium' | 'Low'>('All');

  // Keep search term synced when navigating from other views (e.g. Hotspot drill-down)
  React.useEffect(() => {
    setSearchTerm(initialSearchId || '');
  }, [initialSearchId]);

  // Filter logic
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      // Search text match (ID, title, description, location)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          r.id.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.location.toLowerCase().includes(query) ||
          (r.reporterName && r.reporterName.toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }

      // Status match
      if (statusFilter !== 'All' && r.status !== statusFilter) {
        return false;
      }

      // Category match
      if (categoryFilter !== 'All' && r.category !== categoryFilter) {
        return false;
      }

      // Priority match
      if (priorityFilter === 'HighCritical' && r.priority < 7) {
        return false;
      }
      if (priorityFilter === 'Medium' && (r.priority < 4 || r.priority > 6)) {
        return false;
      }
      if (priorityFilter === 'Low' && r.priority > 3) {
        return false;
      }

      return true;
    });
  }, [reports, searchTerm, statusFilter, categoryFilter, priorityFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Reported':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Assigned':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In Progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 font-semibold text-xs tracking-wider uppercase mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Civic Accountability & Community Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Track Neighborhood Tickets
          </h1>
          <p className="text-zinc-600 text-sm mt-1">
            Monitor public sanitation tickets from initial citizen filing to municipal verification, crew dispatch, and verified resolution.
          </p>
        </div>

        <button
          id="btn-tracker-new-report"
          onClick={onNavigateToReport}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-center cursor-pointer"
        >
          <span>Report New Waste</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs mb-6 space-y-4">
        {/* Search Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          <input
            type="text"
            id="input-tracker-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ticket ID (e.g. CC-2026-1042), street name, keywords, or resident name..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-zinc-300 focus:ring-2 focus:ring-emerald-500 bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Status Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-zinc-500 font-semibold text-[11px] uppercase tracking-wider mr-1 shrink-0">
            Status:
          </span>
          {ALL_STATUSES.map((st) => {
            const isSelected = statusFilter === st;
            const count = st === 'All' ? reports.length : reports.filter((r) => r.status === st).length;
            return (
              <button
                key={st}
                id={`filter-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs font-bold'
                    : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                <span>{st}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-800 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category & Priority Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100">
          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
              Category Filter
            </label>
            <select
              id="filter-category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:ring-2 focus:ring-emerald-500"
            >
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-1">
              Urgency / Priority Filter
            </label>
            <select
              id="filter-priority-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-800 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Priorities (1 - 10)</option>
              <option value="HighCritical">High & Critical (Scores 7 - 10)</option>
              <option value="Medium">Medium Priority (Scores 4 - 6)</option>
              <option value="Low">Low Priority (Scores 1 - 3)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              id="btn-reset-filters"
              onClick={handleResetFilters}
              className="w-full inline-flex items-center justify-center space-x-1 px-3 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reports Count Header */}
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-3 px-1">
        <span>
          Showing <span className="font-bold text-zinc-900">{filteredReports.length}</span> of {reports.length} total tickets
        </span>
        {statusFilter !== 'All' && (
          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
            Filtered by: {statusFilter}
          </span>
        )}
      </div>

      {/* Reports Grid / Cards */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 mb-1">No Matching Reports Found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mb-4">
            No sanitation reports matched your current search parameters or active filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReports.map((report) => {
            const priorityBadgeColor =
              report.priority >= 8
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : report.priority >= 6
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

            const confirmations = report.confirmationsCount || 0;
            const commentsCount = (report.comments || []).length;
            const kudos = report.crewKudos || 0;

            return (
              <div
                key={report.id}
                id={`report-card-${report.id}`}
                onClick={() => onSelectReport(report)}
                className="bg-white rounded-xl border border-zinc-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden flex flex-col cursor-pointer group"
              >
                {/* Photo Thumbnail */}
                <div className="relative h-44 bg-zinc-900 overflow-hidden">
                  <img
                    src={report.photoUrl}
                    alt={report.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-zinc-900 shadow-xs">
                      {report.id}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-xs ${getStatusBadge(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {report.category}
                      </span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${priorityBadgeColor}`}>
                        Priority {report.priority}/10
                      </span>
                    </div>

                    <h3 className="font-bold text-zinc-900 text-sm leading-snug line-clamp-2 mt-1 group-hover:text-emerald-700 transition-colors">
                      {report.title}
                    </h3>
                    <p className="text-zinc-500 text-xs line-clamp-2 mt-1">
                      {report.description}
                    </p>
                  </div>

                  {/* Community Vouching & Engagement Meta */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-zinc-500">
                      <div className="flex items-center space-x-1 truncate max-w-[65%]">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{report.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        <span>{formatRelativeTime(report.submittedAt)}</span>
                      </div>
                    </div>

                    {/* Community Voice Badges */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-2">
                        {confirmations > 0 && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onToggleConfirm) onToggleConfirm(report.id);
                            }}
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              report.userConfirmed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                            }`}
                            title="Neighbors who confirmed seeing this"
                          >
                            <ThumbsUp className="w-2.5 h-2.5" />
                            <span>{confirmations}</span>
                          </span>
                        )}

                        {commentsCount > 0 && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>{commentsCount}</span>
                          </span>
                        )}

                        {report.status === 'Resolved' && kudos > 0 && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700">
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            <span>{kudos}</span>
                          </span>
                        )}

                        {report.reporterName && (
                          <div className="flex items-center space-x-1 text-[11px] text-zinc-500">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${getAvatarColor(report.reporterName)}`}>
                              {getInitials(report.reporterName)}
                            </div>
                            <span className="truncate max-w-[80px]">{report.reporterName.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>

                      <span className="text-emerald-700 font-semibold text-xs flex items-center space-x-0.5 group-hover:translate-x-1 transition-transform">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
