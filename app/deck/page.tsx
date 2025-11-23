"use client";

import { useState, useEffect } from "react";
import { Card as CardComponent } from "@/components/Card";
import { Card } from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Save, Trash2, AlertCircle } from "lucide-react";

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
      alert("Deck cannot exceed 8 cards!");
      return;
    }
    if (deck.some((c) => c.id === card.id)) {
      alert("Card already in deck!");
      return;
    }
    setDeck([...deck, card]);
  };

  const removeFromDeck = (cardId: string) => {
    setDeck(deck.filter((c) => c.id !== cardId));
  };

  const saveDeck = () => {
    if (deck.length < 5) {
      alert("Deck must have at least 5 cards!");
      return;
    }
    storage.saveDeck(deck);
    alert("Deck saved successfully!");
  };

  const clearDeck = () => {
    if (confirm("Are you sure you want to clear your deck?")) {
      setDeck([]);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gold-500">Deck Builder</h1>
          <p className="text-slate-400">Assemble your team (5-8 Cards)</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className={`text-xl font-bold ${deck.length < 5 || deck.length > 8 ? 'text-red-500' : 'text-green-500'}`}>
            {deck.length} / 8
          </div>
          <button onClick={clearDeck} className="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200 font-bold py-2 px-4 rounded shadow transition-all">
            <Trash2 size={18} />
          </button>
          <button onClick={saveDeck} className="bg-gold-600 hover:bg-gold-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <Save size={18} />
            Save Deck
          </button>
        </div>
      </div>

      {/* Current Deck Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[300px]">
        <h2 className="text-2xl font-serif font-bold text-slate-200 mb-4 flex items-center gap-2">
          Current Deck
          {deck.length < 5 && <span className="text-sm font-sans font-normal text-red-400 flex items-center gap-1"><AlertCircle size={14}/> Need {5 - deck.length} more</span>}
        </h2>
        
        {deck.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-slate-600 italic">
            Select cards from your collection below
          </div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {deck.map((card) => (
              <div key={card.id} className="relative group">
                <CardComponent 
                  card={card} 
                  className="w-48 h-72 text-xs cursor-pointer hover:border-red-500 transition-colors"
                  onClick={() => removeFromDeck(card.id)}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-red-500 font-bold uppercase border border-red-500 px-2 py-1 rounded bg-black/80">Remove</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collection Section */}
      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-200 mb-4">Your Collection</h2>
        {collection.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="text-slate-500 mb-4">You haven't crafted any cards yet.</p>
            <a href="/craft" className="text-gold-500 hover:underline">Go to Crafting Forge</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {collection.map((card) => {
              const isInDeck = deck.some(c => c.id === card.id);
              return (
                <div key={card.id} className={`relative ${isInDeck ? 'opacity-50 grayscale' : ''}`}>
                  <CardComponent 
                    card={card} 
                    className="w-full h-auto aspect-[2/3] cursor-pointer hover:-translate-y-2 transition-transform"
                    onClick={() => !isInDeck && addToDeck(card)}
                  />
                  {isInDeck && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="bg-slate-900/80 text-white px-3 py-1 rounded-full font-bold border border-slate-700">In Deck</span>
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
