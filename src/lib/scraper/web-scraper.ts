import * as cheerio from 'cheerio';

export interface ScrapedBrandData {
  title: string;
  description: string;
  headings: string[];
  bulletPoints: string[];
  rawTextSample: string;
}

export async function scrapeWebsite(url: string): Promise<ScrapedBrandData> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
  const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';

  const headings: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 120) headings.push(text);
  });

  const bulletPoints: string[] = [];
  $('li, p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20 && text.length < 200) bulletPoints.push(text);
  });

  return {
    title,
    description,
    headings: headings.slice(0, 10),
    bulletPoints: bulletPoints.slice(0, 15),
    rawTextSample: $('body').text().replace(/\s+/g, ' ').slice(0, 3000),
  };
}
