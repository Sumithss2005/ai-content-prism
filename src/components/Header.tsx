import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

interface HeaderProps {
  onNewAnalysis: () => void;
}

export const Header = ({ onNewAnalysis }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Content Quality Audit
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered Content Analysis</p>
            </div>
          </div>
          
          <Button onClick={onNewAnalysis} variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>
    </header>
  );
};
