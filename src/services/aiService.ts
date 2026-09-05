import { AIAnalysisResult, AIInsightsResult, SanitationReport } from '../types';
import { analyzeReportWithRuleEngine, generateInsightsWithRuleEngine } from './ruleEngine';

export async function analyzeReportAI(params: {
  description: string;
  location: string;
  category?: string;
  imageBase64?: string;
}): Promise<AIAnalysisResult> {
  try {
    const response = await fetch('/api/analyze-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: params.description,
        location: params.location,
        category: params.category,
        imageBase64: params.imageBase64,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.category && data.severity && typeof data.priority === 'number') {
        return {
          category: data.category,
          severity: data.severity,
          priority: data.priority,
          summary: data.summary || 'Sanitation issue classified successfully.',
          recommendedAction: data.recommendedAction || 'Schedule prompt municipal cleanup.',
          confidence: data.confidence || 0.95,
          modelUsed: data.modelUsed || 'Gemini 3.8-Flash (Server-Side)',
        };
      }
    }
  } catch (err) {
    console.warn('API analysis unavailable, activating intelligent rule fallback:', err);
  }

  // Graceful rule-based engine fallback
  return analyzeReportWithRuleEngine(params.description, params.location, params.category);
}

export async function generateCommunityInsightsAI(reports: SanitationReport[]): Promise<AIInsightsResult> {
  try {
    const response = await fetch('/api/generate-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reportsCount: reports.length,
        reportsSummary: reports.slice(0, 20).map((r) => ({
          id: r.id,
          category: r.category,
          severity: r.severity,
          priority: r.priority,
          status: r.status,
          location: r.location,
          submittedAt: r.submittedAt,
        })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.topIssue && Array.isArray(data.recommendations)) {
        return {
          topIssue: data.topIssue,
          riskLevel: data.riskLevel || 'Medium',
          keyInsight: data.keyInsight,
          recommendations: data.recommendations,
          hotspots: data.hotspots || generateInsightsWithRuleEngine(reports).hotspots,
          summaryStats: {
            total: reports.length,
            resolvedPercent: Math.round(
              (reports.filter((r) => r.status === 'Resolved').length / Math.max(reports.length, 1)) * 100
            ),
            highPriorityCount: reports.filter((r) => r.priority >= 7).length,
          },
          generatedAt: new Date().toISOString(),
          source: 'gemini',
        };
      }
    }
  } catch (err) {
    console.warn('Backend insights API unreachable, using local analytical engine:', err);
  }

  // Fallback to local analytical rule engine
  return generateInsightsWithRuleEngine(reports);
}
