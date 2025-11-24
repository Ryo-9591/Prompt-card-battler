"use client";

import { useState, useEffect, useRef } from "react";
import { Card as CardComponent } from "@/components/Card";
import { Card, BattleLogEntry, simulateBattle, MOCK_ENEMY_DECK } from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Swords, RotateCcw, Shield, Skull } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BattlePage() {
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [enemyDeck, setEnemyDeck] = useState<Card[]>([]);
  const [logs, setLogs] = useState<BattleLogEntry[]>([]);
  const [battleStarted, setBattleStarted] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Animation states
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);
  const [damagedCardId, setDamagedCardId] = useState<string | null>(null);

  useEffect(() => {
    const deck = storage.getDeck();
    setPlayerDeck(deck);
    setEnemyDeck(MOCK_ENEMY_DECK); // Reset enemy deck
  }, []);

  useEffect(() => {
    if (battleStarted && currentLogIndex < logs.length) {
      const currentLog = logs[currentLogIndex];
      
      // Trigger animations based on log type
      if (currentLog.type === 'attack') {
        // Parse message to find attacker (Simplified logic for demo)
        // In a real app, the log object should contain sourceId and targetId
        // Here we'll just animate the first card of the active turn side as a placeholder
        const isPlayerTurn = currentLog.turn % 2 !== 0; 
        const attacker = isPlayerTurn ? playerDeck[0] : enemyDeck[0];
        const defender = isPlayerTurn ? enemyDeck[0] : playerDeck[0];

        if (attacker) {
            setAttackingCardId(attacker.id);
            setTimeout(() => setAttackingCardId(null), 500);
        }
        if (defender) {
            setTimeout(() => {
                setDamagedCardId(defender.id);
                setTimeout(() => setDamagedCardId(null), 500);
            }, 300);
        }
      }

      // Handle Defeat (Remove card)
      if (currentLog.message.includes("倒れた")) {
         // Logic to remove card from state for visual effect would go here
         // For now, we rely on the log to tell the story, but we could animate the card out
         // if we tracked health in state in real-time.
         // Since simulateBattle returns all logs at once, we aren't updating state step-by-step.
         // To fully animate death, we'd need to replay the state changes.
         // For this MVP, we'll focus on the attack/damage animations.
      }

      const timer = setTimeout(() => {
        setCurrentLogIndex((prev) => prev + 1);
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 1500); // Slower for dramatic effect
      return () => clearTimeout(timer);
    }
  }, [battleStarted, currentLogIndex, logs, playerDeck, enemyDeck]);

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

  const visibleLogs = logs.slice(0, currentLogIndex + 1);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[900px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-serif font-bold text-[#ffd700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          バトルアリーナ
        </h1>
        {!battleStarted ? (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startBattle} 
            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-[#ffd700] font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500 flex items-center gap-3 text-xl"
          >
            <Swords size={24} /> バトル開始
          </motion.button>
        ) : (
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetBattle} 
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-6 rounded-lg border border-slate-600 flex items-center gap-2"
          >
            <RotateCcw size={18} /> リセット
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Battle Visuals */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4 bg-slate-950/40 p-8 rounded-xl border border-[#c5a000]/20 relative overflow-hidden backdrop-blur-sm">
          {/* Background Decor */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950/80 to-slate-950 pointer-events-none" />
          
          {/* Enemy Side */}
          <div className="relative z-10">
            <div className="flex justify-center gap-4 min-h-[260px] items-center perspective-1000">
              <AnimatePresence>
                {enemyDeck.map((card, i) => (
                  <motion.div 
                    key={card.id}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ 
                        opacity: i === 0 ? 1 : 0.6, 
                        scale: i === 0 ? 1 : 0.85,
                        y: attackingCardId === card.id ? 50 : 0,
                        x: damagedCardId === card.id ? [0, -10, 10, -10, 10, 0] : 0,
                        filter: damagedCardId === card.id ? "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)" : "none"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative ${i === 0 ? 'z-20' : 'z-10 grayscale-[0.5]'} w-40 h-60`}
                  >
                     <div className="absolute inset-0 origin-top-left scale-[0.625] w-64 h-96">
                        <CardComponent card={card} className="w-full h-full" isEnemy />
                     </div>
                     {i === 0 && <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-red-500 font-bold tracking-widest text-sm flex items-center gap-1"><Skull size={14}/> ENEMY</div>}
                  </motion.div>
                ))}
              </AnimatePresence>
              {enemyDeck.length === 0 && <div className="text-slate-500 font-serif text-xl">敵デッキ切れ</div>}
            </div>
          </div>

          <div className="text-center relative z-10">
             <div className="inline-block px-6 py-2 bg-black/60 border-y border-[#c5a000]/50 text-[#ffd700] font-serif font-bold text-2xl tracking-[0.2em]">
                VS
             </div>
          </div>

          {/* Player Side */}
          <div className="relative z-10">
            <div className="flex justify-center gap-4 min-h-[260px] items-center perspective-1000">
              <AnimatePresence>
                {playerDeck.map((card, i) => (
                  <motion.div 
                    key={card.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                        opacity: i === 0 ? 1 : 0.6, 
                        scale: i === 0 ? 1 : 0.85,
                        y: attackingCardId === card.id ? -50 : 0,
                        x: damagedCardId === card.id ? [0, -10, 10, -10, 10, 0] : 0,
                        filter: damagedCardId === card.id ? "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)" : "none"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`relative ${i === 0 ? 'z-20' : 'z-10 grayscale-[0.5]'} w-40 h-60`}
                  >
                     <div className="absolute inset-0 origin-top-left scale-[0.625] w-64 h-96">
                        <CardComponent card={card} className="w-full h-full" />
                     </div>
                     {i === 0 && <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-blue-400 font-bold tracking-widest text-sm flex items-center gap-1"><Shield size={14}/> PLAYER</div>}
                  </motion.div>
                ))}
              </AnimatePresence>
               {playerDeck.length === 0 && <div className="text-slate-500 font-serif text-xl">自分デッキ切れ</div>}
            </div>
          </div>
        </div>

        {/* Battle Log */}
        <div className="bg-black/60 border border-[#c5a000]/30 rounded-xl p-0 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-4 border-b border-[#c5a000]/20 bg-[#c5a000]/5">
            <h2 className="text-xl font-serif font-bold text-[#f0e6d2] flex items-center gap-2">
                <span className="text-[#ffd700]">📜</span> バトルログ
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {visibleLogs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className={`p-3 rounded-lg border-l-4 shadow-sm ${
                  log.type === 'victory' ? 'bg-green-950/30 border-green-500 text-green-200' :
                  log.type === 'defeat' ? 'bg-red-950/30 border-red-500 text-red-200' :
                  log.type === 'attack' ? 'bg-slate-800/50 border-slate-500 text-slate-300' :
                  'text-slate-400 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider opacity-50 bg-black/30 px-1.5 rounded">Turn {log.turn}</span>
                </div>
                {log.message}
              </motion.div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
