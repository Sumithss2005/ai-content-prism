import { useState } from "react";
import { Header } from "@/components/Header";
import { InputForm } from "@/components/InputForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { AnalysisResults } from "@/types/analysis";

const Index = () => {
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysisComplete = (data: AnalysisResults) => {
    setResults(data);
    setIsAnalyzing(false);
  };

  const handleNewAnalysis = () => {
    setResults(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <Header onNewAnalysis={handleNewAnalysis} />
      
      <main className="container mx-auto px-4 py-8">
        {!results ? (
          <InputForm 
            onAnalysisStart={() => setIsAnalyzing(true)}
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={isAnalyzing}
          />
        ) : (
          <ResultsDashboard results={results} />
        )}
      </main>

      <footer className="border-t border-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Content Quality Audit Tool - Powered by Advanced AI Analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
