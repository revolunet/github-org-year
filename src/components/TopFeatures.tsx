import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Feature } from "../types.ts";
import {
  groupFeaturesByCategory,
  type GroupedFeatures,
} from "../featureGroupMapping.ts";

interface TopFeaturesProps {
  features: Feature[];
}

function FeatureCard({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) {
  return (
    <Link
      to={`/feature/${index}`}
      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow block bg-white"
    >
      <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
      <p className="text-gray-500 text-xs mb-2 line-clamp-2">
        {feature.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {feature.relatedRepos.slice(0, 3).map((repo) => (
          <span
            key={repo}
            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
          >
            {repo}
          </span>
        ))}
        {feature.relatedRepos.length > 3 && (
          <span className="text-xs text-gray-400">
            +{feature.relatedRepos.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}

function GroupSection({
  grouped,
  defaultExpanded,
}: {
  grouped: GroupedFeatures;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { group, features } = grouped;

  return (
    <div className={`rounded-lg border ${group.color} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{group.icon}</span>
          <h3 className="font-semibold text-lg">{group.title}</h3>
          <span className="text-sm opacity-70">
            ({features.length} {features.length === 1 ? "topic" : "topics"})
          </span>
        </div>
        <span className="text-lg">{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map(({ feature, originalIndex }) => (
              <FeatureCard
                key={originalIndex}
                feature={feature}
                index={originalIndex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TopFeatures({ features }: TopFeaturesProps) {
  const { groups, ungrouped } = useMemo(
    () => groupFeaturesByCategory(features),
    [features]
  );

  if (features.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Top Features & Themes ({features.length})
      </h2>
      <div className="space-y-3">
        {groups.map((grouped, i) => (
          <GroupSection
            key={grouped.group.id}
            grouped={grouped}
            defaultExpanded={i < 3}
          />
        ))}
        {ungrouped.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{"\uD83D\uDCE6"}</span>
                <h3 className="font-semibold text-lg text-gray-700">
                  Other
                </h3>
                <span className="text-sm text-gray-500">
                  ({ungrouped.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ungrouped.map(({ feature, originalIndex }) => (
                  <FeatureCard
                    key={originalIndex}
                    feature={feature}
                    index={originalIndex}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
