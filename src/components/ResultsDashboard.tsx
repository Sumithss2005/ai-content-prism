import { AnalysisResults } from "@/types/analysis";
import { ScoreCard } from "@/components/ScoreCard";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultsDashboardProps {
  results: AnalysisResults;
}

export const ResultsDashboard = ({ results }: ResultsDashboardProps) => {
  const { toast } = useToast();

  const handleExport = () => {
    const reportContent = `
CONTENT QUALITY AUDIT REPORT
Generated: ${new Date(results.timestamp).toLocaleString()}

================================
SEO SCORE: ${results.seoScore.score}/100
================================
Issues:
${results.seoScore.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Recommendations:
${results.seoScore.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

${results.seoScore.metrics ? `Metrics:\n${Object.entries(results.seoScore.metrics).map(([key, val]) => `- ${key}: ${val}`).join('\n')}` : ''}

================================
SERP PERFORMANCE SCORE: ${results.serpScore.score}/100
================================
Issues:
${results.serpScore.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Recommendations:
${results.serpScore.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

${results.serpScore.predictedRank ? `Predicted Rank: ${results.serpScore.predictedRank}` : ''}

================================
AEO SCORE: ${results.aeoScore.score}/100
================================
Issues:
${results.aeoScore.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Recommendations:
${results.aeoScore.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

================================
HUMANIZATION SCORE: ${results.humanizationScore.score}/100
================================
Issues:
${results.humanizationScore.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Recommendations:
${results.humanizationScore.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

${results.humanizationScore.metrics ? `Metrics:\n${Object.entries(results.humanizationScore.metrics).map(([key, val]) => `- ${key}: ${val}`).join('\n')}` : ''}

================================
DIFFERENTIATION SCORE: ${results.differentiationScore.score}/100
================================
Issues:
${results.differentiationScore.issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

Recommendations:
${results.differentiationScore.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `content-audit-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Your audit report has been downloaded.",
    });
  };

  const avgScore = Math.round(
    (results.seoScore.score +
      results.serpScore.score +
      results.aeoScore.score +
      results.humanizationScore.score +
      results.differentiationScore.score) /
      5
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analysis Results</h2>
          <p className="text-muted-foreground mt-1">
            Overall Score: <span className="font-semibold text-foreground">{avgScore}/100</span>
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScoreCard
          title="SEO Score"
          score={results.seoScore.score}
          issues={results.seoScore.issues}
          recommendations={results.seoScore.recommendations}
          metrics={results.seoScore.metrics}
          color="primary"
        />

        <ScoreCard
          title="SERP Performance"
          score={results.serpScore.score}
          issues={results.serpScore.issues}
          recommendations={results.serpScore.recommendations}
          predictedRank={results.serpScore.predictedRank}
          color="accent"
        />

        <ScoreCard
          title="AEO Score"
          score={results.aeoScore.score}
          issues={results.aeoScore.issues}
          recommendations={results.aeoScore.recommendations}
          color="success"
        />

        <ScoreCard
          title="Humanization"
          score={results.humanizationScore.score}
          issues={results.humanizationScore.issues}
          recommendations={results.humanizationScore.recommendations}
          metrics={results.humanizationScore.metrics}
          color="warning"
        />

        <ScoreCard
          title="Differentiation"
          score={results.differentiationScore.score}
          issues={results.differentiationScore.issues}
          recommendations={results.differentiationScore.recommendations}
          color="primary"
        />
      </div>
    </div>
  );
};
