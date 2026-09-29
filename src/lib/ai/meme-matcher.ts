import { Anthropic } from '@anthropic-ai/sdk';
import { ExtractedBrandProfile } from './brand-profiler';
import { MemeTemplate } from '@prisma/client';

const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

export interface GeneratedMemeRemix {
  hookText: string;
  positioningAngle: string;
  whyThisContent: string;
}

export async function synthesizeMemeRemix(
  brand: ExtractedBrandProfile,
  meme: MemeTemplate
): Promise<GeneratedMemeRemix> {
  if (hasAnthropic) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const prompt = `You are a viral TikTok copywriter for Fastlane.
Your job is to rewrite an original viral meme hook into a hilarious, high-converting parody hook for a brand.

BRAND CONTEXT:
Brand Name: ${brand.companyName}
Audience: ${brand.targetAudience}
Core Pain Point: ${brand.corePainPoints[0]}
Key Solution: ${brand.keyBenefits[0]}

ORIGINAL VIRAL MEME:
Original Creator: ${meme.creatorHandle}
Original Hook: "${meme.originalHookText}"
Syntax Formula: "${meme.hookSyntaxFormula}"

INSTRUCTIONS:
1. Parody the original meme's cadence and humor, but make ${brand.companyName} the punchline.
2. Example transformation:
   Original: "When your situationship texts you for the first time in months..."
   Remix: "When ${brand.companyName} has one clear button and a real person when you're stuck"
3. Create a 3-word positioning angle (e.g., "Simple Apps, Real Support").
4. Explain in 2 sentences why this content works psychologically.

Return ONLY a valid JSON object:
{
  "hookText": "string",
  "positioningAngle": "string",
  "whyThisContent": "string"
}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 600,
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
  return {
    hookText: `When ${brand.companyName} finally fixes ${brand.corePainPoints?.[0] || 'your problem'}`,
    positioningAngle: "Relatable Pain Relief",
    whyThisContent: "This hooks the user by mentioning a relatable pain point. The meme format provides a humorous release when introducing the brand."
  };
}
