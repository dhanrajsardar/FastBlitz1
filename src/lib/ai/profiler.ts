import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// We fallback to mock if no keys are provided in sandbox.
const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
const hasOpenAI = !!process.env.OPENAI_API_KEY;

export async function generateBrandDNA(url: string, scrapeData: any) {
  if (hasAnthropic) {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      system: "You are a viral marketing expert. Analyze the provided website data and extract the brand DNA into a structured JSON.",
      messages: [
        { role: "user", content: `Analyze this site: ${JSON.stringify(scrapeData)}. Return ONLY valid JSON with keys: companyName, tagline, targetAudience, brandVoice, keyBenefits (array of strings), viralAngles (array of strings).` }
      ]
    });
    const textBlock = msg.content.find((c): c is Anthropic.TextBlock => c.type === 'text');
    if (textBlock && textBlock.text) {
      try {
        // Strip markdown if present
        const jsonStr = textBlock.text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse Claude JSON", e);
      }
    }
  } else if (hasOpenAI) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a viral marketing expert. Analyze the provided website data and extract the brand DNA into a structured JSON." },
            { role: "user", content: `Analyze this site: ${JSON.stringify(scrapeData)}. Return ONLY valid JSON with keys: companyName, tagline, targetAudience, brandVoice, keyBenefits (array of strings), viralAngles (array of strings).` }
        ],
        response_format: { type: "json_object" }
    });
    if (response.choices[0].message.content) {
       return JSON.parse(response.choices[0].message.content);
    }
  }

  // Fallback if no keys are present (for sandbox dev purposes)
  const companyNameMatch = scrapeData?.title?.split('-')[0]?.split('|')[0]?.trim();
  const companyName = companyNameMatch || new URL(url).hostname.replace('www.', '').split('.')[0];

  return {
    companyName: companyName,
    tagline: scrapeData?.h1 || scrapeData?.description || "AI-powered infinite video generation",
    targetAudience: "Online users looking for efficiency",
    brandVoice: "High-energy, direct, persuasive",
    keyBenefits: scrapeData?.h2s?.length ? scrapeData.h2s.slice(0, 3) : ["Create 10x more content", "Instant viral hooks", "Hands-free autopilot"],
    viralAngles: [
      `Stop wasting time with alternatives to ${companyName}`,
      `I found the secret to ${scrapeData?.h1 ? scrapeData.h1.toLowerCase() : 'success'}`,
      `The tool that replaces your expensive agency`
    ]
  };
}

export async function generateBlitzScript(dna: any) {
    if (hasAnthropic) {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 500,
        system: "You are a TikTok scriptwriter. Write a 15-second script based on the brand DNA. Return ONLY valid JSON with keys: hookText (first 3 secs), bodyText (middle 10 secs), ctaText (last 2 secs), fullScript (the entire spoken text).",
        messages: [
          { role: "user", content: `Brand DNA: ${JSON.stringify(dna)}` }
        ]
      });
      const textBlock = msg.content.find((c): c is Anthropic.TextBlock => c.type === 'text');
      if (textBlock && textBlock.text) {
        try {
          const jsonStr = textBlock.text.replace(/```json|```/g, '').trim();
          return JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse Claude script JSON", e);
        }
      }
    } else if (hasOpenAI) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
              { role: "system", content: "You are a TikTok scriptwriter. Write a 15-second script based on the brand DNA. Return ONLY valid JSON with keys: hookText (first 3 secs), bodyText (middle 10 secs), ctaText (last 2 secs), fullScript (the entire spoken text)." },
              { role: "user", content: `Brand DNA: ${JSON.stringify(dna)}` }
          ],
          response_format: { type: "json_object" }
      });
      if (response.choices[0].message.content) {
         return JSON.parse(response.choices[0].message.content);
      }
    }

    // Generates a script for a single card based on DNA
    const hooks = [
        "Stop scrolling if you want to",
        "This tool feels illegal to know",
        "Why is nobody talking about this"
    ];

    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    const hookText = `${randomHook} ${dna.companyName}`;
    const bodyText = `With ${dna.companyName}, you get: ${dna.keyBenefits?.[0] || 'amazing features'}. It's literally a cheat code.`;
    const ctaText = "Link in bio to try it out!";

    return {
        hookText,
        bodyText,
        ctaText,
        fullScript: `${hookText}... ${bodyText} ${ctaText}`
    };
}
