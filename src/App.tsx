import React, { useState, useEffect } from 'react';
import { SanitationReport, ActiveTab, ReportStatus } from './types';
import {
  getStoredReports,
  saveNewReport,
  updateReportStatus,
  toggleReportConfirmation,
  addReportComment,
  sendCrewKudos,
  resetReportsToDefault,
  exportReportsAsJson,
} from './services/storage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ReportIssueForm } from './components/ReportIssueForm';
import { ReportTracker } from './components/ReportTracker';
import { ReportDetailModal } from './components/ReportDetailModal';
import { AIInsightsView } from './components/AIInsightsView';
import { HotspotView } from './components/HotspotView';
import { AboutView } from './components/AboutView';
import { ShieldCheck, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [reports, setReports] = useState<SanitationReport[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedReport, setSelectedReport] = useState<SanitationReport | null>(null);
  const [trackerSearchId, setTrackerSearchId] = useState<string>('');

  // Initial load from LocalStorage
  useEffect(() => {
    const loaded = getStoredReports();
    setReports(loaded);
  }, []);

  // Handler: Report creation (Feature 1 & Feature 2)
  const handleReportCreated = (newReport: SanitationReport) => {
    const updated = saveNewReport(newReport);
    setReports(updated);
  };

  // Handler: Status update / advance stage simulation (Feature 3)
  const handleStatusUpdate = (reportId: string, newStatus: ReportStatus, note?: string) => {
    const updated = updateReportStatus(reportId, newStatus, note);
    setReports(updated);
    const updatedSelected = updated.find((r) => r.id === reportId);
    if (updatedSelected) {
      setSelectedReport(updatedSelected);
    }
  };

  // Handler: Community confirmation toggle
  const handleToggleConfirmation = (reportId: string) => {
    const updated = toggleReportConfirmation(reportId);
    setReports(updated);
    const updatedSelected = updated.find((r) => r.id === reportId);
    if (updatedSelected) {
      setSelectedReport(updatedSelected);
    }
  };

  // Handler: Community comment addition
  const handleAddComment = (
    reportId: string,
    comment: { author: string; text: string; role?: 'Resident' | 'Ward Inspector' | 'Sanitation Lead' | 'Community Volunteer' }
  ) => {
    const updated = addReportComment(reportId, comment);
    setReports(updated);
    const updatedSelected = updated.find((r) => r.id === reportId);
    if (updatedSelected) {
      setSelectedReport(updatedSelected);
    }
  };

  // Handler: Crew kudos
  const handleSendKudos = (reportId: string) => {
    const updated = sendCrewKudos(reportId);
    setReports(updated);
    const updatedSelected = updated.find((r) => r.id === reportId);
    if (updatedSelected) {
      setSelectedReport(updatedSelected);
    }
  };

  // Handler: Reset to sample data
  const handleResetData = () => {
    if (window.confirm('Reset all report tickets back to initial demonstration sample data?')) {
      const reset = resetReportsToDefault();
      setReports(reset);
      setSelectedReport(null);
    }
  };

  // Handler: Export JSON
  const handleExportData = () => {
    exportReportsAsJson(reports);
  };

  // Navigation helpers
  const handleNavigateToTracker = (reportId?: string) => {
    if (reportId) {
      setTrackerSearchId(reportId);
    } else {
      setTrackerSearchId('');
    }
    setActiveTab('tracker');
  };

  // Open reports count for badge
  const openReportsCount = reports.filter(
    (r) => r.status === 'Reported' || r.status === 'Under Review' || r.status === 'Assigned'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100/60 text-zinc-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openReportsCount={openReportsCount}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardView
            reports={reports}
            onSelectReport={(report) => setSelectedReport(report)}
            onNavigateToReport={() => setActiveTab('report')}
            onNavigateToTracker={(location) => handleNavigateToTracker(location)}
            onNavigateToInsights={() => setActiveTab('insights')}
            onNavigateToHotspots={() => setActiveTab('hotspots')}
            onResetData={handleResetData}
            onExportData={handleExportData}
          />
        )}

        {activeTab === 'hotspots' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <HotspotView
              reports={reports}
              onSelectReport={(report) => setSelectedReport(report)}
              onViewInTracker={(areaName) => handleNavigateToTracker(areaName)}
            />
          </div>
        )}

        {activeTab === 'report' && (
          <ReportIssueForm
            onReportCreated={handleReportCreated}
            onNavigateToTracker={handleNavigateToTracker}
          />
        )}

        {activeTab === 'tracker' && (
          <ReportTracker
            reports={reports}
            initialSearchId={trackerSearchId}
            onSelectReport={(report) => setSelectedReport(report)}
            onNavigateToReport={() => setActiveTab('report')}
            onToggleConfirm={handleToggleConfirmation}
          />
        )}

        {activeTab === 'insights' && <AIInsightsView reports={reports} />}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Detailed Report Modal */}
      <ReportDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onStatusUpdate={handleStatusUpdate}
        onToggleConfirm={handleToggleConfirmation}
        onAddComment={handleAddComment}
        onSendKudos={handleSendKudos}
      />

      {/* Civic Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 mt-12 text-zinc-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-zinc-800">CleanCity Platform</span>
            <span>•</span>
            <span>AI Citizen Waste Reporting & Accountability MVP</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-emerald-700 transition cursor-pointer"
            >
              Project Documentation & Viva Checklist
            </button>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <span>Dual Engine: Gemini 3.8-Flash + FOSS Heuristic</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
