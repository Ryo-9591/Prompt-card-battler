"use client";

import { useState, useEffect } from "react";
import { Card as CardComponent } from "@/components/Card";
import { Card } from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Save, Trash2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeckPage() {
  const [collection, setCollection] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCollection(storage.getCards());
    setDeck(storage.getDeck());
    setMounted(true);
  }, []);

  const addToDeck = (card: Card) => {
    if (deck.length >= 8) {
      alert("デッキは8枚までです！");
      return;
    }
    if (deck.some((c) => c.id === card.id)) {
      alert("そのカードは既にデッキに入っています！");
      return;
    }
    setDeck([...deck, card]);
  };

  const removeFromDeck = (cardId: string) => {
    setDeck(deck.filter((c) => c.id !== cardId));
  };

  const saveDeck = () => {
    if (deck.length < 5) {
      alert("デッキは最低5枚必要です！");
      return;
    }
    storage.saveDeck(deck);
    alert("デッキを保存しました！");
  };

  const clearDeck = () => {
    if (confirm("デッキをクリアしてもよろしいですか？")) {
      setDeck([]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col space-y-12 pb-12">
      <div className="flex justify-between items-end border-b border-[#c5a000]/30 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#ffd700] drop-shadow-md mb-2">デッキビルダー</h1>
          <p className="text-[#d8c8a8] font-light">最強の部隊を編成せよ (5〜8枚)</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className={`text-2xl font-serif font-bold ${deck.length < 5 || deck.length > 8 ? 'text-red-400' : 'text-green-400'} bg-black/40 px-4 py-2 rounded-lg border border-white/10`}>
            {deck.length} / 8
          </div>
          <button onClick={clearDeck} className="bg-red-950/50 hover:bg-red-900/80 border border-red-800 text-red-200 font-bold py-2 px-4 rounded-lg shadow transition-all flex items-center gap-2">
            <Trash2 size={18} />
            <span className="hidden sm:inline">クリア</span>
          </button>
          <button onClick={saveDeck} className="bg-gradient-to-r from-[#ca8a04] to-[#eab308] hover:from-[#eab308] hover:to-[#facc15] text-slate-950 font-bold py-2 px-6 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <Save size={18} />
            デッキを保存
          </button>
        </div>
      </div>

      {/* Current Deck Section */}
      <div className="bg-slate-950/60 border border-[#c5a000]/20 rounded-xl p-8 min-h-[350px] shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c5a000]/50 to-transparent" />
        
        <h2 className="text-2xl font-serif font-bold text-[#f0e6d2] mb-6 flex items-center gap-3">
          <span className="text-[#ffd700]">⚔️</span> 現在のデッキ
          {deck.length < 5 && <span className="text-sm font-sans font-normal text-red-400 flex items-center gap-1 bg-red-950/30 px-3 py-1 rounded-full border border-red-900/50"><AlertCircle size={14}/> あと {5 - deck.length} 枚必要</span>}
        </h2>
        
        {deck.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic border-2 border-dashed border-slate-800 rounded-lg bg-black/20">
            <p className="text-lg">下のコレクションからカードを選択して召喚してください</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
            <AnimatePresence>
              {deck.map((card) => (
                <motion.div 
                  key={card.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="relative group w-40 h-60"
                >
                  <div className="absolute inset-0 origin-top-left scale-[0.625] w-64 h-96">
                    <CardComponent 
                      card={card} 
                      className="w-full h-full cursor-pointer group-hover:border-red-500 transition-colors shadow-xl"
                      onClick={() => removeFromDeck(card.id)}
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 pointer-events-none">
                    <X size={16} strokeWidth={3} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl">
                    <span className="text-red-500 font-bold uppercase tracking-widest border-2 border-red-500 px-3 py-1 rounded bg-black/80 transform -rotate-12">外す</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Collection Section */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-[#f0e6d2] mb-6 border-l-4 border-[#c5a000] pl-4">あなたのコレクション</h2>
        {collection.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-[#c5a000]/20 rounded-xl bg-slate-900/30">
            <p className="text-slate-400 mb-6 text-lg">まだカードを作成していません。</p>
            <a href="/craft" className="inline-block bg-slate-800 hover:bg-slate-700 text-[#ffd700] px-6 py-3 rounded-lg border border-[#c5a000]/30 transition-all hover:border-[#c5a000]">
              カード作成の間へ
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {collection.map((card) => {
              const isInDeck = deck.some(c => c.id === card.id);
              return (
                <div key={card.id} className={`relative transition-all duration-300 ${isInDeck ? 'opacity-40 grayscale blur-[1px]' : 'hover:-translate-y-2'} w-full aspect-[2/3]`}>
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl">
                     {/* We use a container query approach or just scale based on assumed width? 
                         Since grid is responsive, fixed scale is hard. 
                         However, for the collection grid, the cards are roughly w-40 to w-50.
                         Let's use a ViewBox-like approach: Render card large, scale to fit container.
                         But CSS 'zoom' is non-standard. 'transform: scale' needs a fixed size.
                         
                         Alternative: Just let the Collection cards be fluid (which we fixed in Card.tsx) 
                         and accept that text might be small. 
                         But wait, we fixed Card.tsx to be fluid! So maybe we don't need scaling here if the text wraps?
                         The Card.tsx has fixed text sizes (text-lg). 
                         If the card is w-40, text-lg is big.
                         
                         Let's try to use the fluid Card component here first. 
                         Since we updated Card.tsx to use percentages, the layout shouldn't break.
                         The text size is the only remaining concern.
                         
                         Actually, for the collection grid, let's stick to the fluid layout.
                         The scaling trick is best for fixed-size slots like the Deck Builder or Battle Arena.
                         For the responsive grid, scaling is hard because we don't know the exact width.
                      */}
                    <CardComponent 
                      card={card} 
                      className="w-full h-full cursor-pointer shadow-lg"
                      onClick={() => !isInDeck && addToDeck(card)}
                    />
                  </div>
                  {isInDeck && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="bg-slate-950/90 text-[#ffd700] px-3 py-1 rounded-full font-bold border border-[#ffd700]/50 shadow-lg text-sm">召喚済み</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
