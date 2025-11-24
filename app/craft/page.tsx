"use client";

import { useState } from "react";
import { Card as CardComponent } from "@/components/Card";
import { Card } from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Loader2, Sparkles, Save } from "lucide-react";

export default function CraftPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<Card | null>(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setGeneratedCard(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error("Failed to generate card");

      const data = await res.json();
      setGeneratedCard(data);
    } catch (error) {
      console.error(error);
      alert("カードの生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (generatedCard) {
      storage.saveCard(generatedCard);
      setSaved(true);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-gold-500">運命のカードを創造せよ</h1>
        <p className="text-slate-400">クリーチャー、呪文、アーティファクトを記述して、新たなカードを生み出そう。</p>
      </div>

      <form onSubmit={handleGenerate} className="w-full max-w-xl flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例: 純粋な星の光で作られ、味方を癒やすドラゴン..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500 transition-colors"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-gold-600 hover:bg-gold-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          生成
        </button>
      </form>

      <div className="min-h-[400px] flex items-center justify-center w-full">
        {loading ? (
          <div className="flex flex-col items-center space-y-4 text-gold-500/50 animate-pulse">
            <Sparkles className="w-16 h-16" />
            <p className="font-serif text-xl">鍛冶師が作業中...</p>
          </div>
        ) : generatedCard ? (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-500">
            <CardComponent card={generatedCard} className="scale-110" />
            
            <button
              onClick={handleSave}
              disabled={saved}
              className={`bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded shadow transition-all flex items-center gap-2 ${saved ? 'bg-green-600 hover:bg-green-600 cursor-default' : ''}`}
            >
              <Save size={18} />
              {saved ? "コレクションに保存済み" : "コレクションに保存"}
            </button>
          </div>
        ) : (
          <div className="text-slate-600 italic border-2 border-dashed border-slate-800 rounded-xl p-12">
            ここに生成されたカードが表示されます
          </div>
        )}
      </div>
    </div>
  );
}
