import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string) {
  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract basic meta
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

    // Extract headers
    const h1 = $('h1').first().text().trim();
    const h2s = $('h2').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0).slice(0, 5);
    const h3s = $('h3').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0).slice(0, 5);

    // Extract button texts (often CTAs)
    const ctas = $('button, a.button, a.btn').map((_, el) => $(el).text().trim()).get().filter(t => t.length > 0 && t.length < 30);

    return {
      title,
      description,
      h1,
      h2s,
      h3s,
      ctas,
      pricing: html.toLowerCase().includes('pricing') ? 'Mentions pricing' : 'No clear pricing',
      rawTextSummary: $('body').text().replace(/\s+/g, ' ').substring(0, 2000) // first 2000 chars for context
    };
  } catch (error) {
    console.error('Failed to scrape URL:', error);
    return null;
  }
}
