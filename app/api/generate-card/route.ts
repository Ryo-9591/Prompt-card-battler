import { NextResponse } from 'next/server';
import { Card } from '@/lib/game-logic';

export const maxDuration = 300; // ローカルLLMは時間がかかる場合があるため延長

const SYSTEM_PROMPT = `
You are a strict Game Master AI for a TCG. Convert user descriptions into card data (JSON).
Rules:
1. Cost (1-10). If stats/effects are too strong for Cost 10, mark as "Unplayable" (Cost 99).
2. Reduce Cost SIGNIFICANTLY if the user includes "Disadvantages", "Self-Damage", or "Conditions".
3. Elements: Fire (Aggro), Water (Trick), Nature (Growth), Light (Heal), Dark (Sacrifice).
4. Keywords: Rush (Attack immediately), Guard (Taunt), Combo (Double hit), Revenge (Death rattle), Pierce (Ignore Guard).
5. Explanation: Speak like a cynical blacksmith explaining why the cost is set that way.

Output JSON format:
{
  "name": "Card Name",
  "stats": { "attack": 0, "health": 0 },
  "element": "Fire",
  "keywords": ["Rush"],
  "cost": 5,
  "explanation": "..."
}
`;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Generate Card Data with Local Ollama (Qwen)
    let cardData;
    
    // Ollamaの設定
    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    // ユーザー指定の "qwen3" ですが、現時点では qwen2.5 が一般的です。
    // コンテナ内で `ollama pull qwen2.5` などを実行してモデルを用意してください。
    const MODEL_NAME = process.env.OLLAMA_MODEL || 'qwen2.5'; 

    try {
      console.log(`Generating card with model: ${MODEL_NAME} at ${OLLAMA_URL}`);
      
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `User Prompt: ${prompt}` }
          ],
          format: 'json', // JSONモードを強制
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const result = await response.json();
      const content = result.message?.content;
      
      if (!content) {
        throw new Error('No content received from Ollama');
      }

      const parsedData = JSON.parse(content);

      // Validate and ensure all required fields exist with defaults
      cardData = {
        name: parsedData.name || "Unknown Card",
        stats: {
          attack: parsedData.stats?.attack ?? 0,
          health: parsedData.stats?.health ?? 1
        },
        element: parsedData.element || "Fire",
        keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : [],
        cost: parsedData.cost ?? 5,
        explanation: parsedData.explanation || "A mysterious card."
      };

    } catch (err) {
      console.error("Local LLM Failed, falling back to mock:", err);
      // Fallback Mock Data
      cardData = {
        name: "Fallback Warrior",
        stats: { attack: 2, health: 2 },
        element: "Nature",
        keywords: [],
        cost: 2,
        explanation: "The local forge is cold (Ollama connection failed). Here's a wooden sword."
      };
    }

    // 2. Generate Image with Pollinations.ai (Free)
    const imagePrompt = encodeURIComponent(`Fantasy card art, ${cardData.element} element, ${cardData.name}: ${prompt}. High quality, digital art, magical atmosphere.`);
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${imagePrompt}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;

    const card: Card = {
      id: crypto.randomUUID(),
      ...cardData,
      imageUrl,
    };

    return NextResponse.json(card);
  } catch (error) {
    console.error('Error generating card:', error);
    return NextResponse.json({ error: 'Failed to generate card' }, { status: 500 });
  }
}
