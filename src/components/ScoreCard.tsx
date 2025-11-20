import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

interface ScoreCardProps {
  title: string;
  score: number;
  issues: string[];
  recommendations: string[];
  metrics?: Record<string, string | number>;
  predictedRank?: string;
  color?: "primary" | "accent" | "success" | "warning";
}

export const ScoreCard = ({
  title,
  score,
  issues,
  recommendations,
  metrics,
  predictedRank,
  color = "primary",
}: ScoreCardProps) => {
  const getScoreColor = () => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "destructive";
  };

  const getColorClass = () => {
    switch (color) {
      case "accent":
        return "from-accent/10 to-accent/5 border-accent/20";
      case "success":
        return "from-success/10 to-success/5 border-success/20";
      case "warning":
        return "from-warning/10 to-warning/5 border-warning/20";
      default:
        return "from-primary/10 to-primary/5 border-primary/20";
    }
  };

  return (
    <Card
      className={`p-6 bg-gradient-to-br ${getColorClass()} shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-all duration-300`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Badge variant={getScoreColor() as any} className="text-lg px-3 py-1">
            {score}/100
          </Badge>
        </div>

        <Progress value={score} className="h-2" />

        {metrics && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}:
                </span>
                <span className="ml-1 font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}

        {predictedRank && (
          <div className="flex items-center gap-2 pt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Predicted:</span>
            <span className="font-medium">{predictedRank}</span>
          </div>
        )}

        {issues.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Issues Found
            </div>
            <ul className="space-y-1">
              {issues.slice(0, 3).map((issue, index) => (
                <li key={index} className="text-sm text-muted-foreground pl-6">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-warning" />
              Top Recommendations
            </div>
            <ul className="space-y-1">
              {recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground pl-6">
                  <CheckCircle2 className="h-3 w-3 inline mr-1 text-success" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};
