import { SanitationReport, SanitationHotspot, HotspotRiskLevel, SanitationCategory } from '../types';

// Keyword matching dictionary to consolidate near-identical location descriptions
const AREA_PATTERNS: { name: string; keywords: string[]; defaultCoords: { lat: number; lng: number } }[] = [
  {
    name: 'Central Metro & Downtown Transit Hub',
    keywords: ['central metro', 'metro station', 'downtown corridor', 'metro exit'],
    defaultCoords: { lat: 37.7752, lng: -122.4191 },
  },
  {
    name: 'Greenwood Lane Industrial Sector',
    keywords: ['greenwood', 'greenwood lane', 'industrial sector'],
    defaultCoords: { lat: 37.7837, lng: -122.4169 },
  },
  {
    name: 'Market Street Commercial Corridor',
    keywords: ['market st', 'market street', 'market corridor'],
    defaultCoords: { lat: 37.7918, lng: -122.3993 },
  },
  {
    name: 'Riverside Community Park & Recreation Zone',
    keywords: ['riverside', 'riverside community park', 'playground', 'jogger trail'],
    defaultCoords: { lat: 37.7688, lng: -122.4461 },
  },
  {
    name: 'Civic Town Plaza & Main Square',
    keywords: ['civic town plaza', 'town plaza', 'main square', 'fountain'],
    defaultCoords: { lat: 37.7793, lng: -122.4180 },
  },
  {
    name: 'Elmwood Avenue Residential Block',
    keywords: ['elmwood', 'elmwood avenue', 'residential block'],
    defaultCoords: { lat: 37.7558, lng: -122.4234 },
  },
];

/**
 * Calculates Euclidean geographic distance in degrees (~1 deg lat is approx 111 km).
 * 0.015 deg is approx 1.5 km.
 */
function getGeoDistance(
  c1: { lat: number; lng: number },
  c2: { lat: number; lng: number }
): number {
  const dLat = c1.lat - c2.lat;
  const dLng = c1.lng - c2.lng;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * Matches a report to a named zone or creates a location cluster.
 */
function findClusterArea(report: SanitationReport): { areaName: string; coords: { lat: number; lng: number } } {
  const locLower = (report.location || '').toLowerCase();

  // 1. Match by pattern keywords
  for (const pattern of AREA_PATTERNS) {
    if (pattern.keywords.some((k) => locLower.includes(k))) {
      return {
        areaName: pattern.name,
        coords: report.coordinates || pattern.defaultCoords,
      };
    }
  }

  // 2. Clean fallback based on street or location segment
  const parts = report.location.split(',');
  const mainPart = parts[0].trim();
  return {
    areaName: mainPart || 'Ward 4 Unspecified Zone',
    coords: report.coordinates || { lat: 37.7749, lng: -122.4194 },
  };
}

/**
 * Calculates Hotspot Risk Level using explainable, deterministic civic rules:
 * - Number of reports
 * - Unresolved tickets count & ratio
 * - Average priority / severity
 * - Recurrence of identical waste categories
 */
function calculateHotspotRisk(
  reportCount: number,
  unresolvedCount: number,
  avgPriority: number,
  hasCritical: boolean,
  topIssueRatio: number
): { riskLevel: HotspotRiskLevel; explanation: string } {
  const unresolvedRatio = reportCount > 0 ? unresolvedCount / reportCount : 0;

  // Rule 1: Critical Emergency
  if ((hasCritical && unresolvedCount >= 1) || (unresolvedCount >= 3 && avgPriority >= 7.5)) {
    return {
      riskLevel: 'Critical',
      explanation: `Flagged as Critical: ${unresolvedCount} active unresolved reports with critical public health or contamination risk (Avg Severity ${avgPriority}/10).`,
    };
  }

  // Rule 2: High Risk
  if (unresolvedCount >= 2 || avgPriority >= 7.0 || (reportCount >= 3 && unresolvedCount >= 1)) {
    return {
      riskLevel: 'High',
      explanation: `High Risk: ${unresolvedCount} pending unresolved issues in active pedestrian/traffic corridor with recurring ${Math.round(topIssueRatio * 100)}% same-category complaints.`,
    };
  }

  // Rule 3: Medium Risk
  if (unresolvedCount >= 1 || (reportCount >= 2 && unresolvedRatio > 0)) {
    return {
      riskLevel: 'Medium',
      explanation: `Medium Risk: Moderate incident recurrence (${reportCount} reports, ${unresolvedCount} open). Requires regular preventive monitoring.`,
    };
  }

  // Rule 4: Low / Stabilized
  return {
    riskLevel: 'Low',
    explanation: `Low / Stabilized: High municipal clearance rate (${Math.round((1 - unresolvedRatio) * 100)}% resolved) with no critical open hazards.`,
  };
}

/**
 * Generates tailored operational preventive action based on top recurring issue and zone.
 */
function generateHotspotRecommendation(
  topIssue: SanitationCategory,
  areaName: string,
  riskLevel: HotspotRiskLevel
): { action: string; rootCause: string } {
  switch (topIssue) {
    case 'Garbage Overflow':
      return {
        action: 'Upgrade standard collection bins to 1100L heavy-duty roll-off compactors, install ultrasonic fill-level sensors, and schedule twice-daily collection shifts.',
        rootCause: 'High transit pedestrian footfall exceeding existing bin holding capacity during commute rush hours.',
      };
    case 'Illegal Dumping':
      return {
        action: 'Deploy night surveillance camera traps, increase flying-squad night patrols between 11 PM – 4 AM, and issue statutory environmental prosecution warnings.',
        rootCause: 'Unmonitored industrial dead-end and low-light perimeter exploited by commercial renovation contractors.',
      };
    case 'Overflowing Bin':
      return {
        action: 'Install twin-compartment recycling receptacles, increase park groundskeeping weekend rounds, and reposition bins closer to playground entrances.',
        rootCause: 'Weekend recreational crowds and picnickers concentrating waste at a single undersized trash bin.',
      };
    case 'Street Litter':
      return {
        action: 'Enforce mandatory post-market merchant waste-bagging bylaws and route mechanical street sweeper units nightly at 10 PM.',
        rootCause: 'Commercial vendor packaging and street food containers discarded without adequate merchant-provided bins.',
      };
    case 'Waste Collection Issue':
      return {
        action: 'Re-balance municipal collection Route 14 with a relief compactor truck and implement automated dispatch alerts to residents on pickup delays.',
        rootCause: 'Narrow neighborhood access lanes and compactor vehicle maintenance downtime.',
      };
    case 'Unclean Public Space':
      return {
        action: 'Conduct deep microbial pressure wash of plaza seating and establish a bi-weekly preventive civic cleaning schedule with ward sanitation wardens.',
        rootCause: 'Stagnant organic matter accumulation around civic fountains and senior seating areas.',
      };
    default:
      return {
        action: 'Conduct multi-department ward inspection and adjust preventive sanitation patrol rounds to prevent recurring waste accumulation.',
        rootCause: 'General civic waste accumulation in mixed-use corridor.',
      };
  }
}

/**
 * Core Algorithm: Clusters stored reports into explainable AI Sanitation Hotspots.
 */
export function detectHotspots(reports: SanitationReport[]): SanitationHotspot[] {
  if (!reports || reports.length === 0) {
    return [];
  }

  // Group reports by Area Name / Geographic proximity
  const groups: Record<string, SanitationReport[]> = {};
  const groupCoords: Record<string, { lat: number; lng: number }[]> = {};

  reports.forEach((report) => {
    const { areaName, coords } = findClusterArea(report);

    // Check if an existing group is geographically within ~1.5 km
    let matchedGroupKey = areaName;
    for (const existingKey of Object.keys(groups)) {
      if (existingKey === areaName) {
        matchedGroupKey = existingKey;
        break;
      }
      const existingCoords = groupCoords[existingKey];
      if (existingCoords && existingCoords.length > 0 && coords) {
        const dist = getGeoDistance(coords, existingCoords[0]);
        if (dist < 0.012) {
          // within ~1.2 km
          matchedGroupKey = existingKey;
          break;
        }
      }
    }

    if (!groups[matchedGroupKey]) {
      groups[matchedGroupKey] = [];
      groupCoords[matchedGroupKey] = [];
    }
    groups[matchedGroupKey].push(report);
    if (report.coordinates) {
      groupCoords[matchedGroupKey].push(report.coordinates);
    }
  });

  // Calculate metrics and risk for each hotspot group
  const hotspots: SanitationHotspot[] = Object.entries(groups).map(([area, clusterReports]) => {
    const reportCount = clusterReports.length;
    const unresolvedReports = clusterReports.filter((r) => r.status !== 'Resolved').length;
    const resolvedReports = clusterReports.filter((r) => r.status === 'Resolved').length;
    const resolutionRate = reportCount > 0 ? Math.round((resolvedReports / reportCount) * 100) : 0;

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    clusterReports.forEach((r) => {
      categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1;
    });

    let topIssue: SanitationCategory = 'Garbage Overflow';
    let topIssueCount = 0;
    Object.entries(categoryBreakdown).forEach(([cat, count]) => {
      if (count > topIssueCount) {
        topIssueCount = count;
        topIssue = cat as SanitationCategory;
      }
    });

    // Average Priority / Severity
    const totalPriority = clusterReports.reduce((sum, r) => sum + (r.priority || 5), 0);
    const averageSeverity = Math.round((totalPriority / reportCount) * 10) / 10;
    const hasCritical = clusterReports.some((r) => r.severity === 'Critical' || r.priority >= 9);

    // Most recent report
    const sortedByDate = [...clusterReports].sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    const mostRecentReport = sortedByDate[0]?.submittedAt || new Date().toISOString();

    // Centroid coordinates
    const coordsList = groupCoords[area] || [];
    let centroid = { lat: 37.7749, lng: -122.4194 };
    if (coordsList.length > 0) {
      const avgLat = coordsList.reduce((sum, c) => sum + c.lat, 0) / coordsList.length;
      const avgLng = coordsList.reduce((sum, c) => sum + c.lng, 0) / coordsList.length;
      centroid = { lat: Number(avgLat.toFixed(4)), lng: Number(avgLng.toFixed(4)) };
    }

    const { riskLevel, explanation } = calculateHotspotRisk(
      reportCount,
      unresolvedReports,
      averageSeverity,
      hasCritical,
      topIssueCount / reportCount
    );

    const { action, rootCause } = generateHotspotRecommendation(topIssue, area, riskLevel);

    const slug = area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    return {
      id: `hotspot-${slug}`,
      area,
      reportCount,
      topIssue,
      topIssueCount,
      averageSeverity,
      unresolvedReports,
      resolvedReports,
      resolutionRate,
      mostRecentReport,
      riskLevel,
      recommendedAction: action,
      riskExplanation: explanation,
      rootCause,
      coordinates: centroid,
      reports: sortedByDate,
      categoryBreakdown,
      source: 'heuristic',
    };
  });

  // Sort: Critical first, then High, then Medium, then Low; then by reportCount descending
  const riskWeight: Record<HotspotRiskLevel, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  return hotspots.sort((a, b) => {
    if (riskWeight[b.riskLevel] !== riskWeight[a.riskLevel]) {
      return riskWeight[b.riskLevel] - riskWeight[a.riskLevel];
    }
    return b.reportCount - a.reportCount;
  });
}

/**
 * Calls server API to get Gemini-enhanced hotspot analysis if available,
 * falling back seamlessly to deterministic calculation.
 */
export async function fetchAIEnrichedHotspots(reports: SanitationReport[]): Promise<SanitationHotspot[]> {
  const localHotspots = detectHotspots(reports);

  try {
    const res = await fetch('/api/analyze-hotspots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotspots: localHotspots.map((h) => ({
          id: h.id,
          area: h.area,
          reportCount: h.reportCount,
          topIssue: h.topIssue,
          unresolvedReports: h.unresolvedReports,
          averageSeverity: h.averageSeverity,
          riskLevel: h.riskLevel,
          reportsSummary: h.reports.map((r) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            severity: r.severity,
            status: r.status,
          })),
        })),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.hotspots) && data.hotspots.length > 0) {
        // Merge Gemini insights with our rich local coordinates and report lists
        return localHotspots.map((localH) => {
          const aiMatch = data.hotspots.find(
            (aiH: any) => aiH.id === localH.id || aiH.area?.toLowerCase() === localH.area.toLowerCase()
          );
          if (aiMatch) {
            return {
              ...localH,
              riskExplanation: aiMatch.riskExplanation || localH.riskExplanation,
              recommendedAction: aiMatch.recommendedAction || localH.recommendedAction,
              rootCause: aiMatch.rootCause || localH.rootCause,
              source: 'gemini',
            };
          }
          return localH;
        });
      }
    }
  } catch (err) {
    console.log('AI hotspot server analysis unavailable, using local deterministic heuristics:', err);
  }

  return localHotspots;
}
