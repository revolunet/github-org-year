import { useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import { useReportData } from "./hooks/useReportData.ts";
import { Header } from "./components/Header.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { SecurityTopicDetail } from "./pages/SecurityTopicDetail.tsx";
import { FeatureDetail } from "./pages/FeatureDetail.tsx";
import type { OrgReport } from "./types.ts";

function filterExcludedRepos(data: OrgReport): OrgReport {
  const excluded = new Set(data.excludedRepos);
  if (excluded.size === 0) return data;

  const repos = data.repos.filter((r) => !excluded.has(r.name));
  const authors = data.authors
    .map((a) => ({
      ...a,
      repos: a.repos.filter((r) => !excluded.has(r)),
    }))
    .filter((a) => a.repos.length > 0);

  return { ...data, repos, authors };
}

function App() {
  const { data: rawData, loading, error } = useReportData();
  const data = useMemo(() => rawData && filterExcludedRepos(rawData), [rawData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Failed to load report</h2>
          <p className="text-gray-500">{error ?? "No data available"}</p>
          <p className="text-gray-400 text-sm mt-2">
            Make sure <code>public/data/report.json</code> exists. Run{" "}
            <code>npm run generate-data</code> to generate it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <a
        href="https://github.com/new?template_name=github-org-year&template_owner=revolunet"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-0 right-0 z-50"
      >
        <div className="absolute top-[28px] right-[-60px] rotate-45 bg-green-600 text-white text-xs font-semibold py-1 w-[200px] text-center shadow-md hover:bg-green-700 transition-colors">
          Use for my org
        </div>
      </a>
      <Header
        orgName={data.orgName}
        orgAvatarUrl={data.orgAvatarUrl}
        year={data.year}
        generatedAt={data.generatedAt}
      />
      <Routes>
        <Route path="/" element={<HomePage data={data} />} />
        <Route path="/security/:index" element={<SecurityTopicDetail data={data} />} />
        <Route path="/feature/:index" element={<FeatureDetail data={data} />} />
      </Routes>
    </div>
  );
}

export default App;
