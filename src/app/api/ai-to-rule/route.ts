// data-alchemist/src/app/api/ai-to-rule/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  const { text, context } = await req.json();

  try {
    const prompt = `
You are an assistant that converts natural language business rules into structured JSON rule objects for a data validation app.
User's rule: "${text}"
Context: ${JSON.stringify(context)}
Output a single JSON object matching one of these types:
- { "type": "coRun", "tasks": [string], "priority"?: number }
- { "type": "slotRestriction", "group": string, "minCommonSlots": number, "priority"?: number }
- { "type": "loadLimit", "workerGroup": string, "maxSlotsPerPhase": number, "priority"?: number }
- { "type": "phaseWindow", "task": string, "allowedPhases": [number], "priority"?: number }
- { "type": "patternMatch", "regex": string, "template": string, "parameters": string, "priority"?: number }
Respond with only the JSON object, no explanation.
`;

    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'command-r-plus', // You can change to another Cohere model if needed
        prompt,
        max_tokens: 300,
        temperature: 0.2,
        stop_sequences: ["\n\n"]
      }),
    });

    const data = await response.json();

    const aiText = data.generations?.[0]?.text?.trim();
    if (!aiText) {
      return NextResponse.json(
        { error: 'Cohere API returned unexpected response', details: data },
        { status: 500 }
      );
    }

    const rule = JSON.parse(aiText);
    return NextResponse.json(rule);

  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate rule', details: error.message }, { status: 500 });
  }
}