import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { SecurityTopic } from "../types.ts";
import { groupTopicsByOwasp, type OwaspGroup } from "../owaspMapping.ts";

interface SecurityTopicsProps {
  topics: SecurityTopic[];
}

const severityColors: Record<string, string> = {
  high: "bg-red-200 text-red-900",
  medium: "bg-yellow-200 text-yellow-900",
  low: "bg-green-200 text-green-900",
};

function TopicCard({
  topic,
  originalIndex,
}: {
  topic: SecurityTopic;
  originalIndex: number;
}) {
  return (
    <Link
      to={`/security/${originalIndex}`}
      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow block bg-white"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-sm">{topic.title}</h4>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${severityColors[topic.severity] ?? "bg-gray-100 text-gray-800"}`}
        >
          {topic.severity}
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-2 line-clamp-2">
        {topic.description}
      </p>
      <div className="flex flex-wrap gap-1">
        {topic.relatedRepos.slice(0, 3).map((repo) => (
          <span
            key={repo}
            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
          >
            {repo}
          </span>
        ))}
        {topic.relatedRepos.length > 3 && (
          <span className="text-xs text-gray-400">
            +{topic.relatedRepos.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}

function GroupSection({
  group,
  defaultExpanded,
}: {
  group: OwaspGroup;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { category, topics } = group;

  return (
    <div
      className={`rounded-lg border ${category.color} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <h3 className="font-semibold text-lg">
            <a
              href={`https://owasp.org/Top10/2025/${category.title.replace(/:/, "_").replace(/\s-\s/, "-").replace(/\s/g, "_")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {category.title}
            </a>
          </h3>
          <span className="text-sm opacity-70">
            ({topics.length} {topics.length === 1 ? "topic" : "topics"})
          </span>
        </div>
        <span className="text-lg">{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map(({ topic, originalIndex }) => (
              <TopicCard
                key={originalIndex}
                topic={topic}
                originalIndex={originalIndex}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SecurityTopics({ topics }: SecurityTopicsProps) {
  const { groups, ungrouped } = useMemo(
    () => groupTopicsByOwasp(topics),
    [topics],
  );

  if (topics.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Security Topics ({topics.length})
      </h2>
      <div className="space-y-3">
        {groups.map((group, i) => (
          <GroupSection
            key={group.category.id}
            group={group}
            defaultExpanded={i < 3}
          />
        ))}
        {ungrouped.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{"\uD83D\uDD0D"}</span>
                <h3 className="font-semibold text-lg text-gray-700">
                  Other Security Topics
                </h3>
                <span className="text-sm text-gray-500">
                  ({ungrouped.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ungrouped.map(({ topic, originalIndex }) => (
                  <TopicCard
                    key={originalIndex}
                    topic={topic}
                    originalIndex={originalIndex}
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
