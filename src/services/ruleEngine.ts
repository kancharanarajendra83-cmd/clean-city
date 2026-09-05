import { AIAnalysisResult, AIInsightsResult, SanitationCategory, SanitationReport, SeverityLevel } from '../types';

export function analyzeReportWithRuleEngine(
  description: string,
  location: string,
  selectedCategory?: string
): AIAnalysisResult {
  const text = (description + ' ' + (selectedCategory || '')).toLowerCase();

  // Category detection
  let category: SanitationCategory = 'Street Litter';
  if (text.includes('overflow') || text.includes('full bin') || text.includes('spilling')) {
    category = text.includes('bin') || text.includes('dustbin') ? 'Overflowing Bin' : 'Garbage Overflow';
  } else if (text.includes('illegal') || text.includes('dump') || text.includes('truck') || text.includes('construction') || text.includes('debris') || text.includes('rubble')) {
    category = 'Illegal Dumping';
  } else if (text.includes('litter') || text.includes('plastic') || text.includes('wrapper') || text.includes('bottles') || text.includes('cups')) {
    category = 'Street Litter';
  } else if (text.includes('park') || text.includes('square') || text.includes('public') || text.includes('monument') || text.includes('bench') || text.includes('sidewalk')) {
    category = 'Unclean Public Space';
  } else if (text.includes('collection') || text.includes('missed') || text.includes('truck') || text.includes('schedule') || text.includes('pickup')) {
    category = 'Waste Collection Issue';
  } else if (selectedCategory && selectedCategory !== 'Other') {
    category = selectedCategory as SanitationCategory;
  }

  // Severity & priority calculation
  let severity: SeverityLevel = 'Medium';
  let priority = 5;

  const criticalWords = ['hazard', 'toxic', 'medical', 'hospital', 'chemical', 'sewage', 'drain blocked', 'rats', 'infestation', 'fire', 'burning', 'corpse', 'disease'];
  const highWords = ['huge', 'massive', 'overflow', 'dumping', 'road blocked', 'traffic', 'school', 'market', 'foul smell', 'stench', 'maggots', 'illegal'];
  const lowWords = ['minor', 'small', 'few', 'single', 'dry leaves', 'wrapper'];

  const hasCritical = criticalWords.some(w => text.includes(w));
  const hasHigh = highWords.some(w => text.includes(w));
  const hasLow = lowWords.some(w => text.includes(w));

  if (hasCritical) {
    severity = 'Critical';
    priority = 9;
  } else if (hasHigh) {
    severity = 'High';
    priority = 8;
  } else if (hasLow) {
    severity = 'Low';
    priority = 3;
  } else {
    // Context-based defaults
    if (category === 'Illegal Dumping') {
      severity = 'High';
      priority = 8;
    } else if (category === 'Garbage Overflow') {
      severity = 'High';
      priority = 7;
    } else if (category === 'Overflowing Bin') {
      severity = 'Medium';
      priority = 6;
    } else {
      severity = 'Medium';
      priority = 4;
    }
  }

  // Generate crisp summary & recommendation
  let summary = `Sanitation concern classified under ${category} at ${location || 'the reported area'}.`;
  let recommendedAction = 'Dispatch field inspector to verify and initiate standard clearance.';

  switch (category) {
    case 'Garbage Overflow':
      summary = `Accumulated waste overflow impacting public hygiene around ${location || 'collection point'}.`;
      recommendedAction = 'Dispatch municipal waste compactor truck immediately and sanitize the surrounding sidewalk.';
      break;
    case 'Illegal Dumping':
      summary = `Unauthorized disposal of bulky materials or debris identified at ${location || 'public site'}.`;
      recommendedAction = 'Deploy heavy mechanical loader and issue municipal compliance notice for the sector.';
      break;
    case 'Overflowing Bin':
      summary = `Public receptacle capacity reached with spillage onto pedestrian footpaths.`;
      recommendedAction = 'Schedule priority bin clearance and consider upgrading to a high-capacity solar-compacting bin.';
      break;
    case 'Street Litter':
      summary = `Dispersed litter comprising plastic packaging and discarded containers along thoroughfare.`;
      recommendedAction = 'Assign civic street sweeping crew and install supplementary waste bins along pedestrian path.';
      break;
    case 'Unclean Public Space':
      summary = `Degraded cleanliness and accumulated waste in public gathering zone.`;
      recommendedAction = 'Initiate deep pressure-wash cleaning and schedule routine morning patrol.';
      break;
    case 'Waste Collection Issue':
      summary = `Interruption in routine scheduled residential/commercial waste pickup.`;
      recommendedAction = 'Route secondary recovery vehicle to service missed route sector.';
      break;
    default:
      summary = `General sanitation issue reported requiring municipal verification at ${location || 'site'}.`;
      recommendedAction = 'Assign ward sanitation supervisor for assessment and resolution routing.';
  }

  return {
    category,
    severity,
    priority,
    summary,
    recommendedAction,
    confidence: 0.92,
    modelUsed: 'Intelligent Rule Heuristic Engine v2.0 (FOSS)',
  };
}

export function generateInsightsWithRuleEngine(reports: SanitationReport[]): AIInsightsResult {
  if (reports.length === 0) {
    return {
      topIssue: 'No reports filed',
      riskLevel: 'Low',
      keyInsight: 'No active sanitation issues reported currently in the system.',
      recommendations: [
        'Encourage community reporting across active residential sectors.',
        'Distribute awareness guidelines on public waste segregation.',
      ],
      hotspots: [],
      summaryStats: { total: 0, resolvedPercent: 0, highPriorityCount: 0 },
      generatedAt: new Date().toISOString(),
      source: 'rule-engine',
    };
  }

  // Count categories
  const categoryCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  let highPriorityCount = 0;
  let resolvedCount = 0;

  reports.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    // Normalize location key
    const locClean = r.location.split(',')[0].trim();
    locationCounts[locClean] = (locationCounts[locClean] || 0) + 1;

    if (r.priority >= 7 || r.severity === 'High' || r.severity === 'Critical') {
      highPriorityCount++;
    }
    if (r.status === 'Resolved') {
      resolvedCount++;
    }
  });

  // Top issue
  let topIssue = 'Garbage Overflow';
  let maxCount = -1;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topIssue = cat;
    }
  }

  // Hotspots
  const hotspots = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([loc, count]) => ({ location: loc, count }));

  const resolvedPercent = Math.round((resolvedCount / reports.length) * 100);
  const openHighPriority = reports.filter(
    (r) => r.status !== 'Resolved' && (r.priority >= 7 || r.severity === 'High' || r.severity === 'Critical')
  ).length;

  let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';
  if (openHighPriority >= 4 || reports.length > 10 && resolvedPercent < 40) {
    riskLevel = 'Critical';
  } else if (openHighPriority >= 2 || (reports.length > 5 && resolvedPercent < 60)) {
    riskLevel = 'High';
  } else if (resolvedPercent >= 80) {
    riskLevel = 'Low';
  }

  const topHotspot = hotspots.length > 0 ? hotspots[0].location : 'commercial corridors';

  const keyInsight = `${topIssue} represents ${Math.round((maxCount / reports.length) * 100)}% of citizen submissions, with recurrent accumulation clusters around ${topHotspot}. ${openHighPriority} high-priority incidents currently await resolution.`;

  const recommendations = [
    `Increase waste compactor frequency around identified hotspots including ${topHotspot}.`,
    `Deploy targeted early-morning enforcement against illegal dumping in recurring corridors.`,
    `Upgrade standard open bins to higher-capacity covered receptacles to mitigate windblown street litter.`,
    `Implement an accelerated dispatch protocol for reports categorized with priority score ≥ 7.`,
  ];

  return {
    topIssue,
    riskLevel,
    keyInsight,
    recommendations,
    hotspots,
    summaryStats: {
      total: reports.length,
      resolvedPercent,
      highPriorityCount,
    },
    generatedAt: new Date().toISOString(),
    source: 'rule-engine',
  };
}
