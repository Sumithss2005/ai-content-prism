import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, FileText, Link } from "lucide-react";
import { AnalysisResults } from "@/types/analysis";

interface InputFormProps {
  onAnalysisStart: () => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
  isAnalyzing: boolean;
}

export const InputForm = ({ onAnalysisStart, onAnalysisComplete, isAnalyzing }: InputFormProps) => {
  const [textContent, setTextContent] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const { toast } = useToast();

  const analyzeContent = async (content: string) => {
    try {
      onAnalysisStart();

      const { data, error } = await supabase.functions.invoke("analyze-content", {
        body: { content },
      });

      if (error) throw error;

      onAnalysisComplete(data as AnalysisResults);

      toast({
        title: "Analysis Complete",
        description: "Your content has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze content. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTextAnalysis = async () => {
    if (!textContent.trim()) {
      toast({
        title: "No Content",
        description: "Please enter some content to analyze.",
        variant: "destructive",
      });
      return;
    }

    await analyzeContent(textContent);
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput.trim()) {
      toast({
        title: "No URL",
        description: "Please enter a URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    try {
      onAnalysisStart();

      // Fetch content from URL
      const { data: urlData, error: urlError } = await supabase.functions.invoke(
        "fetch-url-content",
        {
          body: { url: urlInput },
        }
      );

      if (urlError) throw urlError;

      // Analyze the fetched content
      await analyzeContent(urlData.content);
    } catch (error) {
      console.error("URL fetch error:", error);
      toast({
        title: "Failed to Fetch URL",
        description: "Could not retrieve content from the URL. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Card className="p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2">Analyze Your Content</h2>
          <p className="text-muted-foreground">
            Get comprehensive insights on SEO, SERP performance, AEO, humanization, and differentiation
          </p>
        </div>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4 mt-6">
            <Textarea
              placeholder="Paste your content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[300px] resize-none"
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleTextAnalysis}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Content...
                </>
              ) : (
                "Analyze Text"
              )}
            </Button>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-6">
            <Input
              type="url"
              placeholder="https://example.com/article"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button
              onClick={handleUrlAnalysis}
              disabled={isAnalyzing}
              className="w-full"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Fetching & Analyzing...
                </>
              ) : (
                "Analyze URL"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
