"use client";

import { useState } from "react";
import { Card as CardComponent } from "@/components/Card";
import { Card } from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Loader2, Sparkles, Save, Scroll } from "lucide-react";

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
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold text-[#ffd700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          運命のカードを創造せよ
        </h1>
        <p className="text-[#d8c8a8] text-lg font-light tracking-wide">
          古の魔導書に言葉を刻み、新たな伝説を喚び出さん。
        </p>
      </div>

      <div className="w-full max-w-2xl bg-slate-950/80 p-8 rounded-xl border border-[#c5a000]/30 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#c5a000]/50 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-[#c5a000]/50 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#c5a000]/50 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#c5a000]/50 rounded-br-xl pointer-events-none" />

        <form onSubmit={handleGenerate} className="flex flex-col gap-4 relative z-10">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: 純粋な星の光で作られ、味方を癒やすドラゴン..."
              className="w-full bg-black/50 border border-[#c5a000]/30 rounded-lg px-6 py-4 text-[#f0e6d2] placeholder:text-slate-500 focus:outline-none focus:border-[#ffd700] focus:ring-1 focus:ring-[#ffd700]/50 transition-all font-serif tracking-wide"
              disabled={loading}
            />
            <Scroll className="absolute right-4 top-1/2 -translate-y-1/2 text-[#c5a000]/50" size={20} />
          </div>
          
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-[#ca8a04] to-[#eab308] hover:from-[#eab308] hover:to-[#facc15] text-slate-950 font-bold py-3 px-4 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            <span className="font-serif text-lg">創造の儀式を行う</span>
          </button>
        </form>
      </div>

      <div className="min-h-[450px] flex items-center justify-center w-full">
        {loading ? (
          <div className="flex flex-col items-center space-y-6 text-[#ffd700] animate-pulse">
            <div className="relative">
              <Sparkles className="w-20 h-20 animate-spin-slow" />
              <div className="absolute inset-0 blur-xl bg-[#ffd700]/20 rounded-full" />
            </div>
            <p className="font-serif text-2xl tracking-widest">魔力を充填中...</p>
          </div>
        ) : generatedCard ? (
          <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="relative group">
              <div className="absolute inset-0 bg-[#ffd700]/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <CardComponent card={generatedCard} className="scale-110 shadow-2xl" />
            </div>
            
            <button
              onClick={handleSave}
              disabled={saved}
              className={`
                font-bold py-3 px-8 rounded-lg shadow-lg transition-all flex items-center gap-3 text-lg border
                ${saved 
                  ? 'bg-green-900/50 border-green-500 text-green-400 cursor-default' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white hover:border-[#ffd700] hover:text-[#ffd700] hover:shadow-[0_0_15px_rgba(255,215,0,0.2)]'
                }
              `}
            >
              <Save size={20} />
              {saved ? "グリモワールに記録済み" : "グリモワールに記録"}
            </button>
          </div>
        ) : (
          <div className="text-slate-600 italic border-2 border-dashed border-[#c5a000]/20 rounded-xl p-16 flex flex-col items-center gap-4 bg-black/20">
            <div className="w-16 h-16 rounded-full bg-[#c5a000]/10 flex items-center justify-center">
              <Sparkles className="text-[#c5a000]/30" size={32} />
            </div>
            <p className="font-serif text-lg">ここに生成されたカードが顕現します</p>
          </div>
        )}
      </div>
    </div>
  );
}
