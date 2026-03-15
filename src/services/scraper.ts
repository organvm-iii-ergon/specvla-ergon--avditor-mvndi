import * as cheerio from 'cheerio';

export async function scrapeWebsite(url: string): Promise<string> {
  try {
    // Add http:// if missing
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch with a timeout to avoid hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(formattedUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GrowthAuditorBot/1.0; +https://growthauditor.ai)',
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Scraper failed to fetch ${formattedUrl}: ${response.statusText}`);
      return "";
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer, etc to reduce noise
    $('script, style, nav, footer, iframe, noscript').remove();

    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    
    const h1s: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h1s.push(text);
    });

    const h2s: string[] = [];
    $('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text) h2s.push(text);
    });

    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) paragraphs.push(text); // Ignore very short paragraphs
    });

    let content = `Title: ${title}\n`;
    if (description) content += `Description: ${description}\n`;
    if (h1s.length > 0) content += `H1s: ${h1s.join(' | ')}\n`;
    if (h2s.length > 0) content += `H2s: ${h2s.join(' | ')}\n`;
    if (paragraphs.length > 0) content += `Content:\n${paragraphs.join('\n')}\n`;

    // Limit to ~5000 characters to avoid token bloat
    return content.substring(0, 5000);
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return "";
  }
}
