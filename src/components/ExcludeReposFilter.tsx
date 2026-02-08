import { useState } from "react";

interface ExcludeReposFilterProps {
  allRepos: string[];
  serverExcluded: string[];
  clientExcluded: string[];
  onToggle: (repo: string) => void;
}

export function ExcludeReposFilter({
  allRepos,
  serverExcluded,
  clientExcluded,
  onToggle,
}: ExcludeReposFilterProps) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        <span className={`transition-transform ${open ? "rotate-90" : ""}`}>&#9654;</span>
        Filter Repositories ({clientExcluded.length} excluded)
      </button>

      {open && (
        <div className="mt-3 p-4 border border-gray-200 rounded-lg">
          {serverExcluded.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">
                Excluded during data generation:
              </p>
              <div className="flex flex-wrap gap-1">
                {serverExcluded.map((repo) => (
                  <span
                    key={repo}
                    className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {repo}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 mb-2">
            Click to toggle repos in/out of the view:
          </p>
          <div className="flex flex-wrap gap-2">
            {allRepos.map((repo) => {
              const excluded = clientExcluded.includes(repo);
              return (
                <button
                  key={repo}
                  onClick={() => onToggle(repo)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    excluded
                      ? "bg-gray-200 text-gray-400 border-gray-300 line-through"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                  }`}
                >
                  {repo}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
