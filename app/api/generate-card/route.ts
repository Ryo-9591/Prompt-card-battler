import { NextResponse } from 'next/server';
import { Card } from '@/lib/game-logic';

export const maxDuration = 300; // ローカルLLMは時間がかかる場合があるため延長

// 短縮版システムプロンプト（速度向上のため）
const SYSTEM_PROMPT = `TCGカードをJSONで生成。Cost(1-10)、Elements:Fire/Water/Nature/Light/Dark、Keywords:Rush/Guard/Combo/Revenge/Pierce。カード名と説明は日本語。{"name":"","stats":{"attack":0,"health":0},"element":"Fire","keywords":[],"cost":5,"explanation":""}`;

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
    // モデル名（タグは含めない、Ollamaが自動的に:latestを解決する）
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
            { role: 'user', content: prompt }
          ],
          format: 'json', // JSONモードを強制
          stream: false,
          options: {
            num_predict: 200, // 出力トークン数を制限（速度向上）
            temperature: 0.7, // 創造性を少し下げて速度向上
            top_p: 0.9,
            repeat_penalty: 1.1
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ollama API error: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Ollama API error: ${response.statusText} - ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();
      console.log('Ollama API response received:', JSON.stringify(result).substring(0, 500));
      
      const content = result.message?.content;
      
      if (!content) {
        console.error('No content in Ollama response:', result);
        throw new Error('No content received from Ollama');
      }

      console.log('Parsing JSON content from Ollama...');
      const parsedData = JSON.parse(content);
      console.log('Parsed card data:', parsedData);

      // Validate and ensure all required fields exist with defaults
      cardData = {
        name: parsedData.name || "名もなきカード",
        stats: {
          attack: parsedData.stats?.attack ?? 0,
          health: parsedData.stats?.health ?? 1
        },
        element: parsedData.element || "Fire",
        keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : [],
        cost: parsedData.cost ?? 5,
        explanation: parsedData.explanation || "謎めいたカードだ。"
      };
      
      console.log('Card data generated successfully:', cardData.name);

    } catch (err) {
      console.error("Local LLM Failed, falling back to mock:", err);
      // Fallback Mock Data
      cardData = {
        name: "身代わりの戦士",
        stats: { attack: 2, health: 2 },
        element: "Nature",
        keywords: [],
        cost: 2,
        explanation: "地元の鍛冶屋が休みだったようだ（Ollama接続失敗）。代わりに木の棒でも使っておけ。"
      };
    }

    // 2. Generate Image with Pollinations.ai (Free)
    // 画像生成プロンプトは英語の方が精度が良い場合が多いが、日本語も含めてみる
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
