import { Anthropic } from '@anthropic-ai/sdk';
import { ScrapedBrandData } from '../scraper/web-scraper';

const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

export interface ExtractedBrandProfile {
  companyName: string;
  tagline: string;
  targetAudience: string;
  brandVoice: string;
  corePainPoints: string[];
  keyBenefits: string[];
}

export async function extractBrandDNA(scraped: ScrapedBrandData, url: string): Promise<ExtractedBrandProfile> {
  if (hasAnthropic) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `Analyze this scraped product landing page and extract structured brand DNA.
Title: ${scraped.title}
Description: ${scraped.description}
Headings: ${scraped.headings.join(' | ')}
Key Text: ${scraped.bulletPoints.join(' | ')}

Return ONLY a valid JSON object matching this schema:
{
  "companyName": "string (brand name)",
  "tagline": "string (one-line slogan)",
  "targetAudience": "string (demographic who suffers the pain)",
  "brandVoice": "string (e.g. relatable, sarcastic, empathetic, direct)",
  "corePainPoints": ["string (pain 1)", "string (pain 2)", "string (pain 3)"],
  "keyBenefits": ["string (benefit 1)", "string (benefit 2)", "string (benefit 3)"]
}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = message.content.find((c): c is Anthropic.TextBlock => c.type === 'text');
      if (textBlock) {
         const jsonStr = textBlock.text.replace(/```json|```/g, '').trim();
         return JSON.parse(jsonStr);
      }
    } catch (err) {
      console.error("Anthropic failed:", err);
    }
  }

  // Fallback for sandbox when API keys are not provided
  const companyNameMatch = scraped?.title?.split('-')[0]?.split('|')[0]?.trim();
  const companyName = companyNameMatch || new URL(url).hostname.replace('www.', '').split('.')[0];

  return {
    companyName: companyName || "Unknown Brand",
    tagline: scraped.description || "Simplifying your workflow",
    targetAudience: "Busy professionals",
    brandVoice: "Direct and empathetic",
    corePainPoints: ["Wasting time on manual tasks", "Confusing support bots", "Fragmented data"],
    keyBenefits: ["Automate in 1 click", "Talk to a real human", "Centralized dashboard"]
  };
}
