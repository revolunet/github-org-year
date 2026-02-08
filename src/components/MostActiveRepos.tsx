import type { RepoActivity } from "../types.ts";

interface MostActiveReposProps {
  repos: RepoActivity[];
}

export function MostActiveRepos({ repos }: MostActiveReposProps) {
  if (repos.length === 0) {
    return null;
  }

  const filteredRepos = repos.slice(0, 25);
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Most Active Repositories</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 px-4 font-semibold">Repository</th>
              <th className="py-3 px-4 font-semibold hidden sm:table-cell">
                Description
              </th>
              <th className="py-3 px-4 font-semibold text-right">Commits</th>
              <th className="py-3 px-4 font-semibold text-right hidden md:table-cell">
                PRs
              </th>
              <th className="py-3 px-4 font-semibold text-right hidden md:table-cell">
                Stars
              </th>
              <th className="py-3 px-4 font-semibold hidden lg:table-cell">
                Language
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRepos.map((repo) => (
              <tr
                key={repo.name}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {repo.name}
                  </a>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm hidden sm:table-cell max-w-xs truncate">
                  {repo.description ?? "—"}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  {repo.commits.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono hidden md:table-cell">
                  {repo.pullRequests.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-right font-mono hidden md:table-cell">
                  {repo.stars.toLocaleString()}
                </td>
                <td className="py-3 px-4 hidden lg:table-cell">
                  {repo.language ? (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {repo.language}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
