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
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
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
