import { useParams, Link } from "react-router-dom";
import type { OrgReport, SecurityTopic, CommitInfo } from "../types.ts";
import { mapTopicToOwasp } from "../owaspMapping.ts";

interface SecurityTopicDetailProps {
  data: OrgReport;
}

const severityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const stopWords = new Set([
  "a", "an", "the", "in", "of", "to", "for", "and", "or", "is", "are", "was",
  "be", "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "can", "with", "at", "by",
  "from", "that", "this", "it", "its", "on", "not", "but", "if", "as",
  "into", "than", "then", "they", "them", "there", "these", "those", "when",
  "where", "which", "while", "about", "after", "also", "other", "their",
  "likely", "related", "potentially", "without", "using", "such",
]);

function getRelevantCommits(
  commits: CommitInfo[],
  topic: SecurityTopic,
): CommitInfo[] {
  const keywords = `${topic.title} ${topic.description}`
    .toLowerCase()
    .split(/[\s\-–—/,.:;()"']+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const uniqueKeywords = [...new Set(keywords)];

  return commits.filter((commit) => {
    const msg = commit.message.toLowerCase();
    return uniqueKeywords.some((kw) => msg.includes(kw));
  });
}

export function SecurityTopicDetail({ data }: SecurityTopicDetailProps) {
  const { index } = useParams<{ index: string }>();
  const i = Number(index);
  const topic = data.securityTopics[i];
  const owaspCategory = topic ? mapTopicToOwasp(topic) : null;

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
        {owaspCategory && (
          <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-800 mb-3">
            {owaspCategory.title}
          </span>
        )}
        <p className="text-gray-600 text-lg mb-8">{topic.description}</p>

        <h2 className="text-xl font-semibold mb-4">
          Related Repositories ({relatedRepoDetails.length})
        </h2>

        <div className="space-y-4">
          {relatedRepoDetails.map((repo) => {
            const allMessages = data.commitMessages?.[repo.name];
            const messages = allMessages ? getRelevantCommits(allMessages, topic) : undefined;
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
                  <div className="mt-2">
                    <h3 className="text-sm text-gray-500 mb-2">
                      Commits ({messages.length})
                    </h3>
                    <ul className="max-h-60 overflow-y-auto space-y-1 text-sm text-gray-600 border-l-2 border-gray-200 pl-3">
                      {messages.map((commit, j) => (
                        <li key={j} className="font-mono text-xs">
                          <a
                            href={`${repo.url}/commit/${commit.sha}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {commit.sha.slice(0, 7)}
                          </a>{" "}
                          {commit.message}
                        </li>
                      ))}
                    </ul>
                  </div>
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
