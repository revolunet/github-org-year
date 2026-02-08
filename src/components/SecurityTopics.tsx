import { Link } from "react-router-dom";
import type { SecurityTopic } from "../types.ts";

interface SecurityTopicsProps {
  topics: SecurityTopic[];
}

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function SecurityTopics({ topics }: SecurityTopicsProps) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Security Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((topic, i) => (
          <Link
            key={i}
            to={`/security/${i}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg">{topic.title}</h3>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${severityColors[topic.severity] ?? "bg-gray-100 text-gray-800"}`}
              >
                {topic.severity}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
            <div className="flex flex-wrap gap-1">
              {topic.relatedRepos.map((repo) => (
                <span
                  key={repo}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                >
                  {repo}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
