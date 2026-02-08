import { Routes, Route } from "react-router-dom";
import { useReportData } from "./hooks/useReportData.ts";
import { Header } from "./components/Header.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { SecurityTopicDetail } from "./pages/SecurityTopicDetail.tsx";
import { FeatureDetail } from "./pages/FeatureDetail.tsx";

function App() {
  const { data, loading, error } = useReportData();

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
    <div className="min-h-screen bg-gray-50">
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
