import { Link } from "react-router-dom";
import type { Feature } from "../types.ts";

interface TopFeaturesProps {
  features: Feature[];
}

const categoryColors: Record<string, string> = {
  Infrastructure: "bg-purple-100 text-purple-800",
  "UI/UX": "bg-pink-100 text-pink-800",
  API: "bg-blue-100 text-blue-800",
  DevOps: "bg-orange-100 text-orange-800",
  Documentation: "bg-teal-100 text-teal-800",
  Testing: "bg-indigo-100 text-indigo-800",
  Security: "bg-red-100 text-red-800",
};

export function TopFeatures({ features }: TopFeaturesProps) {
  if (features.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Top Features & Themes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <Link
            key={i}
            to={`/feature/${i}`}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow block"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${categoryColors[feature.category] ?? "bg-gray-100 text-gray-800"}`}
              >
                {feature.category}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
            <div className="flex flex-wrap gap-1">
              {feature.relatedRepos.map((repo) => (
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
