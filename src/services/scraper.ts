import * as cheerio from 'cheerio';
import { validateExternalUrl } from '@/lib/url-validator';

export async function scrapeWebsite(url: string, maxPages: number = 1): Promise<string> {
  const visited = new Set<string>();
  const toVisit = [validateExternalUrl(url)];
  let fullContent = "";

  while (toVisit.length > 0 && visited.size < maxPages) {
    const currentUrl = toVisit.shift()!;
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(currentUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GrowthAuditorBot/1.0; +https://growthauditor.ai)',
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Scraper failed to fetch ${currentUrl}: ${response.statusText}`);
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract internal links if we haven't reached maxPages
      if (visited.size < maxPages) {
        const domain = new URL(currentUrl).hostname;
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href');
          if (!href) return;
          
          try {
            const absoluteUrl = new URL(href, currentUrl).toString();
            const absoluteDomain = new URL(absoluteUrl).hostname;
            
            if (absoluteDomain === domain && !visited.has(absoluteUrl) && !toVisit.includes(absoluteUrl)) {
              // Avoid assets and fragments
              if (!absoluteUrl.match(/\.(png|jpg|jpeg|gif|pdf|svg|css|js)$/i) && !absoluteUrl.includes('#')) {
                toVisit.push(absoluteUrl);
              }
            }
          } catch {
            // Ignore invalid URLs
          }
        });
      }

      // Remove scripts, styles, nav, footer, etc to reduce noise
      $('script, style, nav, footer, iframe, noscript').remove();

      const title = $('title').text().trim();
      const description = $('meta[name="description"]').attr('content')?.trim() || '';
      
      const h1s: string[] = [];
      $('h1').each((_, el) => {
        const text = $(el).text().trim();
        if (text) h1s.push(text);
      });

      const paragraphs: string[] = [];
      $('p').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 20) paragraphs.push(text);
      });

      fullContent += `--- PAGE: ${currentUrl} ---\n`;
      fullContent += `Title: ${title}\n`;
      if (description) fullContent += `Description: ${description}\n`;
      if (h1s.length > 0) fullContent += `H1s: ${h1s.join(' | ')}\n`;
      if (paragraphs.length > 0) fullContent += `Content:\n${paragraphs.slice(0, 10).join('\n')}\n\n`;

    } catch (error) {
      console.error(`Failed to scrape ${currentUrl}:`, error);
    }
  }

  // Limit to ~8000 characters for multi-page
  return fullContent.substring(0, 8000);
}
