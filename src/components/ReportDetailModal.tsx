import React, { useState } from 'react';
import { SanitationReport, ReportStatus, CommunityComment } from '../types';
import { formatRelativeTime, formatExactDate, getInitials, getAvatarColor } from '../utils/formatters';
import {
  X,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  Heart,
  Send,
  User,
  Layers,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface ReportDetailModalProps {
  report: SanitationReport | null;
  onClose: () => void;
  onStatusUpdate: (reportId: string, newStatus: ReportStatus, note?: string) => void;
  onToggleConfirm?: (reportId: string) => void;
  onAddComment?: (
    reportId: string,
    comment: { author: string; text: string; role?: 'Resident' | 'Ward Inspector' | 'Sanitation Lead' | 'Community Volunteer' }
  ) => void;
  onSendKudos?: (reportId: string) => void;
}

const STAGES: ReportStatus[] = [
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
];

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onStatusUpdate,
  onToggleConfirm,
  onAddComment,
  onSendKudos,
}) => {
  const [selectedNextStatus, setSelectedNextStatus] = useState<ReportStatus>('In Progress');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // New comment state
  const [newCommentAuthor, setNewCommentAuthor] = useState<string>('');
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [newCommentRole, setNewCommentRole] = useState<'Resident' | 'Community Volunteer' | 'Ward Inspector'>('Resident');
  const [kudosSent, setKudosSent] = useState<boolean>(false);

  if (!report) return null;

  const currentStageIndex = STAGES.indexOf(report.status);

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    onStatusUpdate(
      report.id,
      selectedNextStatus,
      statusNote.trim() || `Status updated to ${selectedNextStatus} by municipal demonstration controller.`
    );
    setStatusNote('');
    setIsUpdating(false);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !onAddComment) return;

    onAddComment(report.id, {
      author: newCommentAuthor.trim() || 'Neighborhood Resident',
      text: newCommentText.trim(),
      role: newCommentRole,
    });

    setNewCommentText('');
  };

  const handleSendKudosClick = () => {
    if (onSendKudos) {
      onSendKudos(report.id);
      setKudosSent(true);
      setTimeout(() => setKudosSent(false), 2500);
    }
  };

  const priorityColor =
    report.priority >= 8
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : report.priority >= 6
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300';

  const severityBadge =
    report.severity === 'Critical'
      ? 'bg-red-600 text-white'
      : report.severity === 'High'
      ? 'bg-rose-500 text-white'
      : report.severity === 'Medium'
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-500 text-white';

  const confirmations = report.confirmationsCount || 0;
  const isUserConfirmed = !!report.userConfirmed;
  const kudos = report.crewKudos || 0;
  const comments = report.comments || [];

  return (
    <div
      id="report-detail-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-zinc-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-zinc-200 bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
              {report.id}
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${severityBadge}`}>
              {report.severity} Urgency
            </span>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
              Ward 4 Sanitation Corridor
            </span>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Title & Photo Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-tight">
                {report.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-medium text-zinc-700">{report.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1" title={formatExactDate(report.submittedAt)}>
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatRelativeTime(report.submittedAt)}</span>
                </span>
                {report.reporterName && (
                  <>
                    <span>•</span>
                    <div className="flex items-center space-x-1.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${getAvatarColor(report.reporterName)}`}>
                        {getInitials(report.reporterName)}
                      </div>
                      <span className="text-zinc-700 font-medium">{report.reporterName}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Citizen Engagement Buttons (Affirmation & Kudos) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  id="btn-confirm-issue"
                  onClick={() => onToggleConfirm && onToggleConfirm(report.id)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    isUserConfirmed
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isUserConfirmed ? 'fill-current' : ''}`} />
                  <span>
                    {isUserConfirmed ? 'Confirmed by you' : 'Confirm Issue (+1)'}
                  </span>
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${isUserConfirmed ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                    {confirmations}
                  </span>
                </button>

                {report.status === 'Resolved' && (
                  <button
                    id="btn-send-kudos"
                    onClick={handleSendKudosClick}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 text-rose-500 ${kudosSent ? 'animate-ping' : 'fill-rose-500'}`} />
                    <span>{kudosSent ? 'Appreciation Sent!' : 'Thank the Crew'}</span>
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-800">
                      {kudos}
                    </span>
                  </button>
                )}
              </div>

              <div className="pt-1">
                <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  Resident Description
                </h4>
                <p className="text-sm text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>

            {/* Photo Preview */}
            <div className="md:col-span-5">
              <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-900 relative aspect-4/3">
                <img
                  src={report.photoUrl}
                  alt={report.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-[11px] font-medium flex justify-between items-center">
                  <span className="font-semibold truncate pr-2">{report.category}</span>
                  <span className="bg-emerald-600 px-2 py-0.5 rounded text-[10px] font-bold">
                    Geo-Tagged
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-slate-50 border border-emerald-100 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Smart Triage & Crew Dispatch Directive
                </h3>
              </div>
              <div className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${priorityColor}`}>
                Priority {report.priority} / 10
              </div>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div>
                <span className="font-semibold text-zinc-800">AI Triage Summary: </span>
                <span className="text-zinc-600">{report.aiSummary}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-800">Dispatch Recommendation: </span>
                <div className="mt-1 p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium text-xs leading-relaxed">
                  {report.recommendedAction}
                </div>
              </div>
            </div>
          </div>

          {/* Status Pipeline Visual Tracker */}
          <div>
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Resolution Lifecycle</span>
            </h3>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {STAGES.map((stage, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div
                    key={stage}
                    className={`text-center p-2 rounded-lg border transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold scale-[1.02]'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                        : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-zinc-300" />
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs block truncate leading-tight">
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Events Log */}
          <div>
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-3">
              Official Dispatch & Field Timeline
            </h3>
            <div className="relative border-l-2 border-emerald-200 ml-3 space-y-4 py-1">
              {report.timeline.map((evt) => (
                <div key={evt.id} className="relative pl-5">
                  <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-1 ring-emerald-300" />
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between text-xs mb-0.5">
                    <span className="font-bold text-zinc-900">{evt.title}</span>
                    <span className="text-zinc-400 text-[11px]">
                      {formatExactDate(evt.timestamp)}
                    </span>
                  </div>
                  {evt.notes && <p className="text-xs text-zinc-600 mt-0.5">{evt.notes}</p>}
                  {evt.actor && (
                    <span className="inline-block mt-1 text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-mono">
                      Log by: {evt.actor}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Community Conversation & Field Notes */}
          <div className="border-t border-zinc-200 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Community Conversation & Field Notes ({comments.length})</span>
              </h3>
              <span className="text-[11px] text-zinc-500">
                Visible to residents & field crews
              </span>
            </div>

            {/* Comments Thread */}
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-500 italic bg-zinc-50 p-3 rounded-xl border border-zinc-200/80 mb-4">
                No notes posted yet. Be the first to add an update or eyewitness detail!
              </p>
            ) : (
              <div className="space-y-2.5 mb-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 bg-zinc-50/90 rounded-xl border border-zinc-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${getAvatarColor(comment.author)}`}>
                          {getInitials(comment.author)}
                        </div>
                        <span className="font-bold text-zinc-900">{comment.author}</span>
                        {comment.role && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                            comment.role === 'Ward Inspector' || comment.role === 'Sanitation Lead'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comment.role === 'Community Volunteer'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-zinc-200 text-zinc-700'
                          }`}>
                            {comment.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {formatRelativeTime(comment.timestamp)}
                      </span>
                    </div>
                    <p className="text-zinc-700 pl-7">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <form onSubmit={handleAddCommentSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Meena / Neighbor)"
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  className="w-full sm:w-1/3 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={newCommentRole}
                  onChange={(e) => setNewCommentRole(e.target.value as any)}
                  className="w-full sm:w-1/4 px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white text-zinc-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Resident">Resident</option>
                  <option value="Community Volunteer">Community Volunteer</option>
                  <option value="Ward Inspector">Ward Inspector</option>
                </select>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Add a field note, photo update, or neighbor comment..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-zinc-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Post Note
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Presentation / Demo Control: Advance Status */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center space-x-2 mb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Municipal Dispatch & Stage Progression
              </h4>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              Simulate real-time municipal status transitions for testing and live demonstrations.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Advance Status To:
                  </label>
                  <select
                    id="select-next-status"
                    value={selectedNextStatus}
                    onChange={(e) => setSelectedNextStatus(e.target.value as ReportStatus)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300 text-xs font-medium text-zinc-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s} {s === report.status ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Field Crew Note / Reason:
                  </label>
                  <input
                    type="text"
                    id="input-status-note"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="e.g. Crew #12 dispatched with compactor, area sanitized..."
                    className="w-full px-3 py-1.5 rounded-lg border border-zinc-300 text-xs text-zinc-800 bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  id="btn-update-status-submit"
                  disabled={isUpdating}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Update Report Stage</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-zinc-200 flex justify-between items-center">
          <span className="text-[11px] text-zinc-500">
            Reported in Ward 4 • Public Civic Ledger
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
