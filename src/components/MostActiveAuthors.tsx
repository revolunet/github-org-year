import type { AuthorActivity } from "../types.ts";

interface MostActiveAuthorsProps {
  authors: AuthorActivity[];
}

export function MostActiveAuthors({ authors }: MostActiveAuthorsProps) {
  if (authors.length === 0) {
    return null;
  }

  const top = authors
    .filter(
      (a) =>
        ![
          "DashlordBetaGouvBot",
          "dependabot[bot]",
          "github-actions[bot]",
        ].includes(a.login),
    )
    .slice(0, 50);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Most Active Authors</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {top.map((author) => (
          <a
            key={author.login}
            href={`https://github.com/${author.login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <img
              src={author.avatarUrl}
              alt={author.login}
              className="w-16 h-16 rounded-full mb-2"
              loading="lazy"
            />
            <span className="font-medium text-sm text-center truncate w-full">
              {author.login}
            </span>
            <span className="text-gray-500 text-xs">
              {author.commits.toLocaleString()} commits
            </span>
            <span className="text-gray-400 text-xs">
              {author.repos.length}{" "}
              {author.repos.length === 1 ? "repo" : "repos"}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
