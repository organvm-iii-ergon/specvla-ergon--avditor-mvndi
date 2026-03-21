import puppeteer from 'puppeteer';
import { validateExternalUrl } from '@/lib/url-validator';

export async function captureScreenshot(url: string): Promise<string | null> {
  let browser;
  try {
    const formattedUrl = validateExternalUrl(url);
    
    // Launch headless browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1024']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    // Go to the URL and wait for network to be idle
    await page.goto(formattedUrl, { waitUntil: 'networkidle2', timeout: 15000 });

    // Capture screenshot as base64 string
    const screenshot = await page.screenshot({ type: 'jpeg', quality: 80, encoding: 'base64' });

    return screenshot as string;
  } catch (error) {
    console.error("Puppeteer screenshot error:", error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
