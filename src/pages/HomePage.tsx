import { useMemo } from "react";
import type { OrgReport } from "../types.ts";
import { MostCommentedPRs } from "../components/MostCommentedPRs.tsx";
import { MostActiveRepos } from "../components/MostActiveRepos.tsx";
import { SecurityTopics } from "../components/SecurityTopics.tsx";
import { TopFeatures } from "../components/TopFeatures.tsx";
import { MostActiveAuthors } from "../components/MostActiveAuthors.tsx";

interface HomePageProps {
  data: OrgReport;
}

export function HomePage({ data }: HomePageProps) {
  const stats = useMemo(() => {
    const totalCommits = data.repos.reduce((sum, r) => sum + r.commits, 0);
    const uniqueContributors = new Set(data.repos.flatMap((r) => r.contributors));
    return {
      commits: totalCommits,
      contributors: uniqueContributors.size,
      repos: data.repos.length,
    };
  }, [data.repos]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Commits", value: stats.commits },
          { label: "Contributors", value: stats.contributors },
          { label: "Repositories", value: stats.repos },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl shadow p-6 text-center"
          >
            <p className="text-5xl font-extrabold text-gray-900">
              {stat.value.toLocaleString()}
            </p>
            <p className="mt-2 text-gray-500 text-lg">{stat.label}</p>
          </div>
        ))}
      </section>

      {data.mostCommentedPRs && data.mostCommentedPRs.length > 0 && (
        <MostCommentedPRs prs={data.mostCommentedPRs} />
      )}
      <MostActiveRepos repos={data.repos} />
      <SecurityTopics topics={data.securityTopics} />
      <TopFeatures features={data.features} />
      <MostActiveAuthors authors={data.authors} />
    </main>
  );
}
