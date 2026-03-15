export interface PageSpeedResult {
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  lcp: string; // Largest Contentful Paint
}

export async function getPageSpeedInsights(url: string): Promise<PageSpeedResult | null> {
  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(formattedUrl)}&category=performance&category=seo&category=accessibility&category=best-practices`;
    
    // Fetch with a timeout to avoid hanging the audit forever
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
    
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`PageSpeed API failed: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    const categories = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};
    
    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
      lcp: audits['largest-contentful-paint']?.displayValue || 'N/A'
    };
  } catch (error) {
    console.error("PageSpeed Insight error:", error);
    return null;
  }
}
