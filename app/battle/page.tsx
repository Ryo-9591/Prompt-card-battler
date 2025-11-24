"use client";

import { useState, useEffect, useRef } from "react";
import { Card as CardComponent } from "@/components/Card";
import { Card, BattleLogEntry, simulateBattle, MOCK_ENEMY_DECK } from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Swords, Play, RotateCcw } from "lucide-react";

export default function BattlePage() {
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [enemyDeck, setEnemyDeck] = useState<Card[]>([]);
  const [logs, setLogs] = useState<BattleLogEntry[]>([]);
  const [battleStarted, setBattleStarted] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const deck = storage.getDeck();
    setPlayerDeck(deck);
    setEnemyDeck(MOCK_ENEMY_DECK); // Reset enemy deck
  }, []);

  useEffect(() => {
    if (battleStarted && currentLogIndex < logs.length) {
      const timer = setTimeout(() => {
        setCurrentLogIndex((prev) => prev + 1);
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 800); // Delay between logs
      return () => clearTimeout(timer);
    }
  }, [battleStarted, currentLogIndex, logs]);

  const startBattle = () => {
    if (playerDeck.length === 0) {
      alert("デッキがありません！デッキビルダーで作成してください。");
      return;
    }
    const battleLogs = simulateBattle(playerDeck, enemyDeck);
    setLogs(battleLogs);
    setBattleStarted(true);
    setCurrentLogIndex(0);
  };

  const resetBattle = () => {
    setBattleStarted(false);
    setLogs([]);
    setCurrentLogIndex(0);
    setEnemyDeck(MOCK_ENEMY_DECK); // Reset enemy deck
    setPlayerDeck(storage.getDeck()); // Reset player deck
  };

  const visibleLogs = logs.slice(0, currentLogIndex);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[900px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-serif font-bold text-gold-500">バトルアリーナ</h1>
        {!battleStarted ? (
          <button onClick={startBattle} className="bg-gold-600 hover:bg-gold-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 text-xl px-8 py-3">
            <Swords /> バトル開始
          </button>
        ) : (
          <button onClick={resetBattle} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded shadow transition-all flex items-center gap-2">
            <RotateCcw /> リセット
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Battle Visuals (Simplified) */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
          {/* Enemy Side */}
          <div className="flex justify-center gap-2 overflow-x-auto p-2 min-h-[200px]">
            {enemyDeck.map((card, i) => (
              <div key={card.id} className={`transform transition-all duration-500 ${i === 0 ? 'scale-100 z-10' : 'scale-90 opacity-60'}`}>
                 <CardComponent card={card} className="w-32 h-48 text-[10px]" />
              </div>
            ))}
            {enemyDeck.length === 0 && <div className="text-slate-500 self-center">敵デッキ切れ</div>}
          </div>

          <div className="text-center text-gold-500 font-bold text-2xl my-4">VS</div>

          {/* Player Side */}
          <div className="flex justify-center gap-2 overflow-x-auto p-2 min-h-[200px]">
            {playerDeck.map((card, i) => (
              <div key={card.id} className={`transform transition-all duration-500 ${i === 0 ? 'scale-100 z-10' : 'scale-90 opacity-60'}`}>
                 <CardComponent card={card} className="w-32 h-48 text-[10px]" />
              </div>
            ))}
             {playerDeck.length === 0 && <div className="text-slate-500 self-center">自分デッキ切れ</div>}
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-black/40 border border-slate-700 rounded-xl p-4 flex flex-col h-full overflow-hidden">
          <h2 className="text-xl font-serif font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">バトルログ</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-sm">
            {visibleLogs.map((log, i) => (
              <div 
                key={i} 
                className={`p-2 rounded border-l-2 ${
                  log.type === 'victory' ? 'bg-green-900/20 border-green-500 text-green-400' :
                  log.type === 'defeat' ? 'bg-red-900/20 border-red-500 text-red-400' :
                  log.type === 'attack' ? 'bg-slate-800/50 border-slate-500 text-slate-300' :
                  'text-slate-400 border-transparent'
                }`}
              >
                <span className="text-xs opacity-50 mr-2">T{log.turn}</span>
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
