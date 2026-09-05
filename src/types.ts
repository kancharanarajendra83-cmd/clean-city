export type SanitationCategory =
  | 'Garbage Overflow'
  | 'Illegal Dumping'
  | 'Street Litter'
  | 'Overflowing Bin'
  | 'Unclean Public Space'
  | 'Waste Collection Issue'
  | 'Other';

export type ReportStatus =
  | 'Reported'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved';

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface TimelineEvent {
  id: string;
  status: ReportStatus;
  timestamp: string;
  title: string;
  notes?: string;
  actor?: string;
}

export interface AIAnalysisResult {
  category: SanitationCategory;
  severity: SeverityLevel;
  priority: number; // 1 to 10
  summary: string;
  recommendedAction: string;
  confidence?: number;
  modelUsed?: string;
}

export interface CommunityComment {
  id: string;
  author: string;
  role?: 'Resident' | 'Ward Inspector' | 'Sanitation Lead' | 'Community Volunteer';
  text: string;
  timestamp: string;
}

export interface SanitationReport {
  id: string; // e.g. CC-2026-1042
  title: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category: SanitationCategory;
  status: ReportStatus;
  priority: number; // 1 to 10
  severity: SeverityLevel;
  aiSummary: string;
  recommendedAction: string;
  photoUrl: string;
  submittedAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  reporterName?: string;
  isCustomAi?: boolean;
  confirmationsCount?: number;
  userConfirmed?: boolean;
  crewKudos?: number;
  comments?: CommunityComment[];
}

export interface AIInsightsResult {
  topIssue: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyInsight: string;
  recommendations: string[];
  hotspots: {
    location: string;
    count: number;
  }[];
  summaryStats: {
    total: number;
    resolvedPercent: number;
    highPriorityCount: number;
  };
  generatedAt: string;
  source: 'gemini' | 'rule-engine';
}

export type HotspotRiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface SanitationHotspot {
  id: string;
  area: string;
  reportCount: number;
  topIssue: SanitationCategory;
  topIssueCount: number;
  averageSeverity: number; // e.g. 7.8
  unresolvedReports: number;
  resolvedReports: number;
  resolutionRate: number; // e.g. 67
  mostRecentReport: string; // ISO date
  riskLevel: HotspotRiskLevel;
  recommendedAction: string;
  riskExplanation: string;
  rootCause?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reports: SanitationReport[];
  categoryBreakdown: Record<string, number>;
  source?: 'gemini' | 'heuristic';
}

export type ActiveTab = 'dashboard' | 'hotspots' | 'report' | 'tracker' | 'insights' | 'about';
