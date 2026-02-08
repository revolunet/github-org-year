import { useParams, Link } from "react-router-dom";
import type { OrgReport } from "../types.ts";

interface SecurityTopicDetailProps {
  data: OrgReport;
}

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function SecurityTopicDetail({ data }: SecurityTopicDetailProps) {
  const { index } = useParams<{ index: string }>();
  const i = Number(index);
  const topic = data.securityTopics[i];

  if (!topic) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          &larr; Back to overview
        </Link>
        <div className="mt-8 text-center">
          <h2 className="text-xl font-bold text-gray-700">Security topic not found</h2>
          <p className="text-gray-500 mt-2">The requested security topic does not exist.</p>
        </div>
      </main>
    );
  }

  const relatedRepoDetails = data.repos.filter((r) =>
    topic.relatedRepos.includes(r.name)
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:underline text-sm">
        &larr; Back to overview
      </Link>

      <div className="mt-6">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-3xl font-bold">{topic.title}</h1>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap mt-2 ${severityColors[topic.severity] ?? "bg-gray-100 text-gray-800"}`}
          >
            {topic.severity}
          </span>
        </div>
        <p className="text-gray-600 text-lg mb-8">{topic.description}</p>

        <h2 className="text-xl font-semibold mb-4">
          Related Repositories ({relatedRepoDetails.length})
        </h2>

        <div className="space-y-4">
          {relatedRepoDetails.map((repo) => {
            const messages = data.commitMessages?.[repo.name];
            return (
              <div
                key={repo.name}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-semibold text-lg"
                    >
                      {repo.name}
                    </a>
                    {repo.description && (
                      <p className="text-gray-500 text-sm mt-0.5">
                        {repo.description}
                      </p>
                    )}
                  </div>
                  {repo.language && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded whitespace-nowrap">
                      {repo.language}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                  <span>{repo.commits.toLocaleString()} commits</span>
                  <span>{repo.pullRequests.toLocaleString()} PRs</span>
                  <span>{repo.stars.toLocaleString()} stars</span>
                </div>

                {messages && messages.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                      Commit messages ({messages.length})
                    </summary>
                    <ul className="mt-2 max-h-60 overflow-y-auto space-y-1 text-sm text-gray-600 border-l-2 border-gray-200 pl-3">
                      {messages.map((msg, j) => (
                        <li key={j} className="font-mono text-xs">
                          {msg}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            );
          })}
        </div>

        {relatedRepoDetails.length === 0 && (
          <p className="text-gray-500">No matching repositories found in the report data.</p>
        )}
      </div>
    </main>
  );
}
