export interface ScoreResult {
  score: number;
  issues: string[];
  recommendations: string[];
  metrics?: Record<string, string | number>;
  predictedRank?: string;
}

export interface AnalysisResults {
  seoScore: ScoreResult;
  serpScore: ScoreResult;
  aeoScore: ScoreResult;
  humanizationScore: ScoreResult;
  differentiationScore: ScoreResult;
  timestamp: string;
}
