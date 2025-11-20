import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log("Fetching content from URL:", url);

    if (!url) {
      throw new Error("URL is required");
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error("Invalid URL format");
    }

    // Fetch the webpage with realistic browser headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error("This website blocks automated access. Please try copying the content directly or use a different URL.");
      }
      if (response.status === 404) {
        throw new Error("Page not found. Please check the URL and try again.");
      }
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML and extract text content
    const doc = new DOMParser().parseFromString(html, "text/html");
    if (!doc) {
      throw new Error("Failed to parse HTML");
    }

    // Remove script and style elements
    const scripts = doc.querySelectorAll("script, style, nav, footer, aside");
    scripts.forEach((el) => el.parentNode?.removeChild(el));

    // Extract main content
    const article = doc.querySelector("article") || 
                    doc.querySelector("main") || 
                    doc.querySelector('[role="main"]') ||
                    doc.querySelector("body");
    
    if (!article) {
      throw new Error("Could not find main content");
    }

    let content = article.textContent || "";
    
    // Clean up the content
    content = content
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    console.log("Extracted content length:", content.length);

    return new Response(
      JSON.stringify({ content, url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in fetch-url-content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
