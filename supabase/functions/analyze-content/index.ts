import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  content: string;
  url?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, url }: AnalysisRequest = await req.json();
    console.log("Analyzing content, length:", content.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Calculate all scores
    const seoScore = calculateSEOScore(content);
    const serpScore = await calculateSERPScore(content, LOVABLE_API_KEY);
    const aeoScore = calculateAEOScore(content);
    const humanizationScore = calculateHumanizationScore(content);
    const differentiationScore = await calculateDifferentiationScore(content, LOVABLE_API_KEY);

    const result = {
      seoScore,
      serpScore,
      aeoScore,
      humanizationScore,
      differentiationScore,
      timestamp: new Date().toISOString(),
    };

    console.log("Analysis complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function calculateSEOScore(content: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Extract potential keyword
  const words = content.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: Record<string, number> = {};
  words.forEach((word) => {
    if (word.length > 4) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  const sortedWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]);
  const primaryKeyword = sortedWords[0]?.[0] || "content";
  const keywordCount = sortedWords[0]?.[1] || 0;
  const keywordDensity = (keywordCount / words.length) * 100;

  // Check keyword density
  if (keywordDensity < 1 || keywordDensity > 2.5) {
    score -= 15;
    issues.push(`Keyword density: ${keywordDensity.toFixed(2)}% (Optimal: 1-2%)`);
    recommendations.push("Adjust keyword density to 1-2% for better SEO");
  }

  // Check readability
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const readabilityScore = 206.835 - 1.015 * avgWordsPerSentence;

  if (readabilityScore < 60) {
    score -= 10;
    issues.push(`Readability score: ${readabilityScore.toFixed(0)} (Low)`);
    recommendations.push("Simplify sentences for better readability");
  }

  // Check header structure
  const h1Count = (content.match(/^#\s/gm) || []).length;
  const h2Count = (content.match(/^##\s/gm) || []).length;

  if (h1Count === 0) {
    score -= 15;
    issues.push("Missing H1 header");
    recommendations.push("Add a clear H1 header with your primary keyword");
  }

  if (h2Count < 2) {
    score -= 10;
    issues.push("Insufficient H2 headers");
    recommendations.push("Add more H2 headers to structure your content");
  }

  // Check content length
  if (words.length < 300) {
    score -= 20;
    issues.push(`Content too short: ${words.length} words (Min: 300)`);
    recommendations.push("Expand content to at least 300 words");
  }

  // Check links
  const linkCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
  if (linkCount < 2) {
    score -= 10;
    issues.push("Few or no links detected");
    recommendations.push("Add relevant internal and external links");
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations: recommendations.slice(0, 5),
    metrics: {
      keywordDensity: keywordDensity.toFixed(2) + "%",
      readabilityScore: readabilityScore.toFixed(0),
      wordCount: words.length,
      primaryKeyword,
    },
  };
}

async function calculateSERPScore(content: string, apiKey: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  try {
    // Use AI to analyze SERP competitiveness
    const prompt = `Analyze this content for SERP performance. Evaluate:
1. Topic coverage depth
2. Word count adequacy
3. Use of stats/data
4. Unique insights
5. Competitive ranking potential

Content:
${content.substring(0, 2000)}

Return analysis in JSON format with: averageTopRankWordCount, topicCoverageGaps, predictedRank, improvements`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an SEO expert analyzing content for SERP performance. Provide detailed, actionable insights.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Parse AI response
    const words = content.split(/\s+/).length;
    if (words < 1000) {
      score -= 20;
      issues.push(`Word count: ${words} (Top rankings avg: 1500+)`);
      recommendations.push("Expand content to 1500+ words to compete with top SERP results");
    }

    // Check for stats/data
    const hasNumbers = /\d+%|\d+\s*(percent|times|years?|months?)/.test(content);
    if (!hasNumbers) {
      score -= 15;
      issues.push("No statistics or data points found");
      recommendations.push("Add concrete statistics and data to support claims");
    }

    // Check for expert quotes or citations
    const hasCitations = /according to|research shows|study found|expert/i.test(content);
    if (!hasCitations) {
      score -= 10;
      issues.push("No expert quotes or research citations");
      recommendations.push("Include expert opinions and research citations");
    }

    issues.push("AI analysis: " + analysis.substring(0, 100));
    recommendations.push("Review AI-generated insights for detailed SERP optimization");

    return {
      score: Math.max(0, score),
      issues,
      recommendations: recommendations.slice(0, 5),
      predictedRank: words > 1500 ? "Page 1 potential" : "Page 2-3",
    };
  } catch (error) {
    console.error("SERP analysis error:", error);
    return {
      score: 50,
      issues: ["Unable to perform full SERP analysis"],
      recommendations: ["Ensure content is comprehensive and well-researched"],
      predictedRank: "Unknown",
    };
  }
}

function calculateAEOScore(content: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check for FAQ sections
  const hasFAQ = /\bfaq\b|frequently asked|questions?:/i.test(content);
  if (!hasFAQ) {
    score -= 15;
    issues.push("No FAQ section detected");
    recommendations.push("Add FAQ section for better AI engine visibility");
  }

  // Check for structured lists
  const listCount = (content.match(/^[\-\*\d+\.]\s/gm) || []).length;
  if (listCount < 3) {
    score -= 10;
    issues.push("Few structured lists");
    recommendations.push("Use bullet points and numbered lists for clarity");
  }

  // Check paragraph structure
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const avgParagraphLength = content.length / paragraphs.length;

  if (avgParagraphLength > 500) {
    score -= 15;
    issues.push("Paragraphs too long for AI parsing");
    recommendations.push("Break content into shorter, scannable paragraphs");
  }

  // Check for how-to patterns
  const hasHowTo = /how to|step \d|first,|second,|finally/i.test(content);
  if (!hasHowTo) {
    score -= 10;
    issues.push("No step-by-step instructions");
    recommendations.push("Add clear step-by-step instructions where applicable");
  }

  // Check for definitions
  const hasDefinitions = /is defined as|refers to|means that/i.test(content);
  if (!hasDefinitions) {
    score -= 10;
    issues.push("Lacks clear definitions");
    recommendations.push("Include clear definitions of key terms");
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations: recommendations.slice(0, 5),
  };
}

function calculateHumanizationScore(content: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Check sentence variety
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
  const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) /
    sentenceLengths.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 5) {
    score -= 20;
    issues.push("Low sentence variety (robotic pattern)");
    recommendations.push("Vary sentence lengths for more natural flow");
  }

  // Check for repetitive sentence starters
  const starters = sentences.map((s) => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
  const starterFreq: Record<string, number> = {};
  starters.forEach((starter) => {
    starterFreq[starter] = (starterFreq[starter] || 0) + 1;
  });

  const maxRepetition = Math.max(...Object.values(starterFreq));
  if (maxRepetition > sentences.length * 0.2) {
    score -= 15;
    issues.push("Repetitive sentence starters");
    recommendations.push("Diversify how you begin sentences");
  }

  // Check passive voice
  const passiveCount = (content.match(/\b(was|were|been|being)\s+\w+ed\b/gi) || []).length;
  const passivePercentage = (passiveCount / sentences.length) * 100;

  if (passivePercentage > 20) {
    score -= 15;
    issues.push(`High passive voice: ${passivePercentage.toFixed(0)}%`);
    recommendations.push("Use more active voice for engaging writing");
  }

  // Check for AI patterns
  const aiPatterns = [
    /\bin conclusion\b/i,
    /\bit's important to note\b/i,
    /\bfurthermore\b/i,
    /\bmoreover\b/i,
  ];
  const aiPatternCount = aiPatterns.filter((pattern) => pattern.test(content)).length;

  if (aiPatternCount > 2) {
    score -= 10;
    issues.push("Common AI writing patterns detected");
    recommendations.push("Use more conversational, human language");
  }

  // Check for personal pronouns
  const personalPronouns = content.match(/\b(I|we|you|us|our|your)\b/gi) || [];
  if (personalPronouns.length < 5) {
    score -= 10;
    issues.push("Lacks personal connection");
    recommendations.push("Use personal pronouns to connect with readers");
  }

  return {
    score: Math.max(0, score),
    issues,
    recommendations: recommendations.slice(0, 5),
    metrics: {
      sentenceVariety: stdDev.toFixed(1),
      passiveVoice: passivePercentage.toFixed(0) + "%",
    },
  };
}

async function calculateDifferentiationScore(content: string, apiKey: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  try {
    // Use AI to check for unique perspectives
    const prompt = `Analyze this content for uniqueness and differentiation:
1. Does it have unique examples or case studies?
2. Does it present a fresh perspective?
3. Does it include personal stories or experiences?
4. How does it differ from generic content on this topic?

Content:
${content.substring(0, 2000)}

Provide scores and specific missing elements.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a content uniqueness expert. Identify what makes content stand out.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI differentiation analysis failed");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // Check for examples
    const hasExamples = /for example|for instance|case study|real.world/i.test(content);
    if (!hasExamples) {
      score -= 20;
      issues.push("No concrete examples or case studies");
      recommendations.push("Add real-world examples and case studies");
    }

    // Check for personal stories
    const hasStories = /\b(I|we)\s+(realized|discovered|found|learned)\b/i.test(content);
    if (!hasStories) {
      score -= 15;
      issues.push("Lacks personal stories or experiences");
      recommendations.push("Include personal anecdotes or experiences");
    }

    // Check for unique POV
    const hasOpinion = /\b(believe|think|opinion|perspective|view)\b/i.test(content);
    if (!hasOpinion) {
      score -= 15;
      issues.push("No clear point of view");
      recommendations.push("Express unique perspectives or opinions");
    }

    // Check content freshness
    const currentYear = new Date().getFullYear();
    const hasRecentDate = new RegExp(`\\b${currentYear}\\b`).test(content);
    if (!hasRecentDate) {
      score -= 10;
      issues.push("Content may lack current information");
      recommendations.push("Update with recent data and trends");
    }

    issues.push("AI uniqueness check: " + analysis.substring(0, 100));
    recommendations.push("Review AI analysis for specific differentiation opportunities");

    return {
      score: Math.max(0, score),
      issues,
      recommendations: recommendations.slice(0, 5),
    };
  } catch (error) {
    console.error("Differentiation analysis error:", error);
    return {
      score: 60,
      issues: ["Unable to perform full uniqueness analysis"],
      recommendations: ["Add unique examples, stories, and perspectives"],
    };
  }
}
