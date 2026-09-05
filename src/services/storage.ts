import { SanitationReport, ReportStatus } from '../types';
import { INITIAL_SAMPLE_REPORTS } from '../data/sampleReports';

const STORAGE_KEY = 'cleancity_reports_v1';

export function getStoredReports(): SanitationReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial sample data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_REPORTS));
      return INITIAL_SAMPLE_REPORTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SAMPLE_REPORTS;
  } catch (e) {
    console.warn('Failed to parse stored reports from localStorage:', e);
    return INITIAL_SAMPLE_REPORTS;
  }
}

export function saveNewReport(report: SanitationReport): SanitationReport[] {
  const current = getStoredReports();
  const updated = [report, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save report to localStorage:', e);
  }
  return updated;
}

export function updateReportStatus(
  reportId: string,
  newStatus: ReportStatus,
  note?: string
): SanitationReport[] {
  const current = getStoredReports();
  const updated = current.map((r) => {
    if (r.id === reportId) {
      const newTimelineEvent = {
        id: `evt-${Date.now()}`,
        status: newStatus,
        timestamp: new Date().toISOString(),
        title: `Status Updated to ${newStatus}`,
        notes: note || `Report advanced to ${newStatus} stage by administrator/demonstration action.`,
        actor: 'CleanCity Dispatch Control',
      };

      return {
        ...r,
        status: newStatus,
        updatedAt: new Date().toISOString(),
        timeline: [...r.timeline, newTimelineEvent],
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update report status in localStorage:', e);
  }
  return updated;
}

export function toggleReportConfirmation(reportId: string): SanitationReport[] {
  const current = getStoredReports();
  const updated = current.map((r) => {
    if (r.id === reportId) {
      const isCurrentlyConfirmed = !!r.userConfirmed;
      const currentCount = r.confirmationsCount || 0;
      return {
        ...r,
        userConfirmed: !isCurrentlyConfirmed,
        confirmationsCount: isCurrentlyConfirmed ? Math.max(0, currentCount - 1) : currentCount + 1,
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to toggle confirmation in localStorage:', e);
  }
  return updated;
}

export function addReportComment(
  reportId: string,
  comment: { author: string; text: string; role?: 'Resident' | 'Ward Inspector' | 'Sanitation Lead' | 'Community Volunteer' }
): SanitationReport[] {
  const current = getStoredReports();
  const updated = current.map((r) => {
    if (r.id === reportId) {
      const newComment = {
        id: `cmt-${Date.now()}`,
        author: comment.author || 'Helpful Neighbor',
        text: comment.text,
        role: comment.role || 'Resident',
        timestamp: new Date().toISOString(),
      };
      return {
        ...r,
        comments: [...(r.comments || []), newComment],
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to add comment in localStorage:', e);
  }
  return updated;
}

export function sendCrewKudos(reportId: string): SanitationReport[] {
  const current = getStoredReports();
  const updated = current.map((r) => {
    if (r.id === reportId) {
      return {
        ...r,
        crewKudos: (r.crewKudos || 0) + 1,
      };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to send kudos in localStorage:', e);
  }
  return updated;
}

export function resetReportsToDefault(): SanitationReport[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_REPORTS));
  } catch (e) {
    console.error('Failed to reset localStorage:', e);
  }
  return INITIAL_SAMPLE_REPORTS;
}

export function exportReportsAsJson(reports: SanitationReport[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reports, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `cleancity-reports-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
