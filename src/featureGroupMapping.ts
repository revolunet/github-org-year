import type { Feature } from "./types.ts";

export interface FeatureGroup {
  id: string;
  title: string;
  icon: string;
  color: string;
  /** Category values and title keywords that map to this group */
  matchers: RegExp[];
}

export const featureGroups: FeatureGroup[] = [
  {
    id: "ui-ux",
    title: "UI/UX & Design System",
    icon: "\uD83C\uDFA8",
    color: "bg-pink-100 text-pink-800 border-pink-200",
    matchers: [
      /responsive design/i,
      /accessibility/i,
      /\ba11y\b/i,
      /ui component/i,
      /\bDSFR\b/i,
      /user interface/i,
      /theming/i,
      /ui\/ux/i,
    ],
  },
  {
    id: "api-backend",
    title: "API & Backend",
    icon: "\u2699\uFE0F",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    matchers: [
      /api endpoint/i,
      /\bREST\b/i,
      /\bGraphQL\b/i,
      /admin panel/i,
      /api.*development/i,
      /api.*enhancement/i,
      /api.*maintenance/i,
      /backend/i,
      /refactoring/i,
    ],
  },
  {
    id: "security",
    title: "Security & Authentication",
    icon: "\uD83D\uDD12",
    color: "bg-red-100 text-red-800 border-red-200",
    matchers: [
      /^security/i,
      /security enhancement/i,
      /security update/i,
      /authentication/i,
      /authorization/i,
      /rate limiting/i,
      /\bcyber\b/i,
      /hardening/i,
    ],
  },
  {
    id: "cicd-infra",
    title: "CI/CD & Infrastructure",
    icon: "\uD83D\uDE80",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    matchers: [
      /ci\/cd/i,
      /docker/i,
      /containeriz/i,
      /infrastructure/i,
      /deployment/i,
      /dependency update/i,
      /configuration.*management/i,
      /project setup/i,
    ],
  },
  {
    id: "data",
    title: "Data Management & Processing",
    icon: "\uD83D\uDCCA",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    matchers: [
      /data import/i,
      /data management/i,
      /data processing/i,
      /data.*pipeline/i,
      /analytics/i,
      /database migration/i,
      /\bETL\b/i,
      /data.*synchroniz/i,
      /bulk operation/i,
      /background job/i,
    ],
  },
  {
    id: "docs",
    title: "Documentation",
    icon: "\uD83D\uDCDD",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    matchers: [
      /documentation/i,
      /\bAPI docs\b/i,
      /knowledge sharing/i,
    ],
  },
  {
    id: "testing",
    title: "Testing & Quality",
    icon: "\u2705",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    matchers: [
      /automated testing/i,
      /quality assurance/i,
      /performance optimization/i,
      /bug fix/i,
      /stability/i,
      /code quality/i,
      /testing.*ci/i,
    ],
  },
  {
    id: "features",
    title: "Application Features",
    icon: "\u2728",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    matchers: [
      /feature development/i,
      /feature flag/i,
      /user profile/i,
      /webhook/i,
      /real.time/i,
      /websocket/i,
      /cantine/i,
      /volunteer/i,
      /mission/i,
      /\bAI integration\b/i,
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring & Logging",
    icon: "\uD83D\uDCE1",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    matchers: [
      /logging/i,
      /error tracking/i,
      /monitoring/i,
      /observability/i,
    ],
  },
  {
    id: "integrations",
    title: "Integrations & Tooling",
    icon: "\uD83D\uDD27",
    color: "bg-cyan-100 text-cyan-800 border-cyan-200",
    matchers: [
      /third.party/i,
      /integration/i,
      /form handling/i,
      /form builder/i,
      /validation/i,
      /search.*filter/i,
      /file upload/i,
      /file.*storage/i,
      /internationalization/i,
      /\bi18n\b/i,
      /open data/i,
    ],
  },
];

function matchFeatureToGroup(feature: Feature): FeatureGroup | null {
  const text = `${feature.title} ${feature.category}`;
  for (const group of featureGroups) {
    if (group.matchers.some((m) => m.test(text))) {
      return group;
    }
  }
  return null;
}

export interface GroupedFeatures {
  group: FeatureGroup;
  features: { feature: Feature; originalIndex: number }[];
}

export function groupFeaturesByCategory(features: Feature[]): {
  groups: GroupedFeatures[];
  ungrouped: { feature: Feature; originalIndex: number }[];
} {
  const groupMap = new Map<string, GroupedFeatures>();
  const ungrouped: { feature: Feature; originalIndex: number }[] = [];

  features.forEach((feature, originalIndex) => {
    const group = matchFeatureToGroup(feature);
    if (group) {
      const existing = groupMap.get(group.id);
      if (existing) {
        existing.features.push({ feature, originalIndex });
      } else {
        groupMap.set(group.id, {
          group,
          features: [{ feature, originalIndex }],
        });
      }
    } else {
      ungrouped.push({ feature, originalIndex });
    }
  });

  // Sort by number of features descending
  const groups = Array.from(groupMap.values()).sort(
    (a, b) => b.features.length - a.features.length
  );

  return { groups, ungrouped };
}
