"use client";

import { useState, useEffect, useRef } from "react";
import { Card as CardComponent } from "@/components/Card";
import { 
  BattleCard, 
  BattleLogEntry, 
  DUNGEON_AREAS,
  DungeonArea,
  DungeonLevel,
  initializeBattleDeck, 
  resolveCombat 
} from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Swords, RotateCcw, Shield, Skull, ArrowRight, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BattlePage() {
  // Game State
  const [playerDeck, setPlayerDeck] = useState<BattleCard[]>([]);
  const [enemyDeck, setEnemyDeck] = useState<BattleCard[]>([]);
  const [logs, setLogs] = useState<BattleLogEntry[]>([]);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<'player' | 'enemy'>('player');
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  
  // Dungeon Selection State
  const [selectedArea, setSelectedArea] = useState<DungeonArea | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<DungeonLevel | null>(null);

  // Interaction State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Animation State
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);
  const [damagedCardId, setDamagedCardId] = useState<string | null>(null);
  const [damageIndicators, setDamageIndicators] = useState<{id: string, cardId: string, damage: number}[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Battle
  const startBattle = (level: DungeonLevel) => {
    if (!selectedArea) return;
    
    const pDeck = storage.getDeck();
    if (pDeck.length === 0) {
      alert("デッキがありません！デッキビルダーで作成してください。");
      return;
    }

    setSelectedLevel(level);
    setPlayerDeck(initializeBattleDeck(pDeck));
    
    // Generate Enemy Deck from Dungeon Pool with Difficulty Scaling
    const pool = selectedArea.enemyPool;
    const multiplier = level.difficultyMultiplier;
    
    const enemyCards = [];
    for (let i = 0; i < 5; i++) {
        const baseCard = pool[Math.floor(Math.random() * pool.length)];
        // Apply multiplier to stats
        const scaledCard = {
            ...baseCard,
            stats: {
                attack: Math.ceil(baseCard.stats.attack * multiplier),
                health: Math.ceil(baseCard.stats.health * multiplier)
            }
        };
        enemyCards.push(scaledCard);
    }
    // Assign unique IDs to avoid key conflicts if same card selected multiple times
    const uniqueEnemyCards = enemyCards.map((c, i) => ({ ...c, id: `enemy-${i}-${c.id}` }));

    setEnemyDeck(initializeBattleDeck(uniqueEnemyCards));
    setLogs([{ turn: 1, message: `バトル開始！ ${selectedArea.name} - ${level.name}`, type: 'info' }]);
    setTurn(1);
    setPhase('player');
    setWinner(null);
    setBattleStarted(true);
    setSelectedCardId(null);
  };

  const resetBattle = () => {
    setBattleStarted(false);
    setLogs([]);
    setWinner(null);
    setPlayerDeck([]);
    setEnemyDeck([]);
    // Keep selectedArea but clear selectedLevel to return to level selection? 
    // Or clear everything to return to area selection?
    // Let's clear everything for a fresh start.
    setSelectedArea(null);
    setSelectedLevel(null);
  };

  // Scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Check Win Condition
  useEffect(() => {
    if (!battleStarted) return;
    
    const playerAlive = playerDeck.some(c => !c.isDead);
    const enemyAlive = enemyDeck.some(c => !c.isDead);

    if (!playerAlive && !enemyAlive) {
        setLogs(prev => [...prev, { turn, message: "引き分け！両者全滅。", type: 'info' }]);
        setWinner('enemy'); // Technically draw, but game over
    } else if (!playerAlive) {
        setLogs(prev => [...prev, { turn, message: "敗北... あなたは負けました...", type: 'defeat' }]);
        setWinner('enemy');
    } else if (!enemyAlive) {
        setLogs(prev => [...prev, { turn, message: "勝利！あなたの勝ちです！", type: 'victory' }]);
        setWinner('player');
    }
  }, [playerDeck, enemyDeck, battleStarted]);

  // Player Interaction
  const handleCardClick = (card: BattleCard, isPlayerSide: boolean) => {
    if (!battleStarted || winner || phase !== 'player') return;

    if (isPlayerSide) {
      // Select Player Card
      if (card.isDead) return;
      if (!card.canAttack) {
          // Optional: Show feedback "Cannot attack"
          return;
      }
      setSelectedCardId(card.id === selectedCardId ? null : card.id);
    } else {
      // Target Enemy Card
      if (!selectedCardId) return;
      if (card.isDead) return;

      const attacker = playerDeck.find(c => c.id === selectedCardId);
      if (!attacker || !attacker.canAttack) return;

      executeAttack(attacker, card, true);
      setSelectedCardId(null);
      
      // Auto-end turn after one attack
      setTimeout(() => {
          endTurn();
      }, 1000); // Wait for animation
    }
  };

  const executeAttack = (attacker: BattleCard, defender: BattleCard, isPlayerAttacking: boolean) => {
    // Animation
    setAttackingCardId(attacker.id);
    setTimeout(() => setAttackingCardId(null), 500);
    setTimeout(() => {
        setDamagedCardId(defender.id);
        setTimeout(() => setDamagedCardId(null), 500);
    }, 300);

    // Logic
    const { attacker: newAttacker, defender: newDefender, logs: combatLogs } = resolveCombat(attacker, defender);
    
    // Show Damage Indicators
    const damageToDefender = defender.stats.health - newDefender.stats.health;
    const damageToAttacker = attacker.stats.health - newAttacker.stats.health;

    if (damageToDefender > 0) showDamage(defender.id, damageToDefender);
    if (damageToAttacker > 0) showDamage(attacker.id, damageToAttacker);

    // Update Logs
    const newLogs = combatLogs.map(l => ({ ...l, turn }));
    setLogs(prev => [...prev, ...newLogs]);

    // Remove old logs to keep it clean (optional, but good for "transient" feel)
    if (logs.length > 5) {
        setLogs(prev => prev.slice(prev.length - 5));
    }

    // Update State
    if (isPlayerAttacking) {
        setPlayerDeck(prev => prev.map(c => c.id === newAttacker.id ? { ...newAttacker, canAttack: false } : c));
        setEnemyDeck(prev => prev.map(c => c.id === newDefender.id ? newDefender : c));
    } else {
        setEnemyDeck(prev => prev.map(c => c.id === newAttacker.id ? { ...newAttacker, canAttack: false } : c));
        setPlayerDeck(prev => prev.map(c => c.id === newDefender.id ? newDefender : c));
    }
  };

  const showDamage = (cardId: string, damage: number) => {
      const id = Math.random().toString(36).substr(2, 9);
      setDamageIndicators(prev => [...prev, { id, cardId, damage }]);
      setTimeout(() => {
          setDamageIndicators(prev => prev.filter(i => i.id !== id));
      }, 1000);
  };

  const endTurn = () => {
    if (phase !== 'player' || winner) return;
    
    setPhase('enemy');
    setLogs(prev => [...prev, { turn, message: "ターン終了。敵のターンです。", type: 'info' }]);
    
    // Reset Enemy Attacks (allow them to attack in their turn)
    setEnemyDeck(prev => prev.map(c => ({ ...c, canAttack: true })));

    // AI Logic
    setTimeout(() => {
        executeEnemyTurnRef();
    }, 1000);
  };

  const executeEnemyTurn = async () => {
    // This function is kept for reference but logic is in executeEnemyTurnRef
  };

  // We need refs to access state inside async loops
  const playerDeckRef = useRef(playerDeck);
  const enemyDeckRef = useRef(enemyDeck);

  useEffect(() => {
      playerDeckRef.current = playerDeck;
  }, [playerDeck]);

  useEffect(() => {
      enemyDeckRef.current = enemyDeck;
  }, [enemyDeck]);

  const executeEnemyTurnRef = async () => {
      const attackers = enemyDeckRef.current.filter(c => !c.isDead && c.canAttack);
      
      if (attackers.length > 0) {
          // Select one random attacker
          const attacker = attackers[Math.floor(Math.random() * attackers.length)];

          // Find target
          const targets = playerDeckRef.current.filter(c => !c.isDead);
          
          if (targets.length > 0) {
              const target = targets[Math.floor(Math.random() * targets.length)];

              // Execute Attack
              executeAttack(attacker, target, false);
              
              // Wait for animation
              await new Promise(resolve => setTimeout(resolve, 1500));
          }
      }
      
      finishEnemyTurn();
  };

  const finishEnemyTurn = () => {
    setTurn(prev => prev + 1);
    setPhase('player');
    setLogs(prev => [...prev, { turn: turn + 1, message: `ターン ${turn + 1}: あなたのターンです。`, type: 'info' }]);
    
    // Reset Player Attacks
    setPlayerDeck(prev => prev.map(c => ({ ...c, canAttack: true })));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[900px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-serif font-bold text-[#ffd700] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          バトルアリーナ
        </h1>
        
        {battleStarted && !winner && (
            <div className="flex items-center gap-4">
                <div className={`px-6 py-2 rounded-full font-bold text-xl border-2 ${phase === 'player' ? 'bg-blue-900/80 border-blue-400 text-blue-100' : 'bg-red-900/80 border-red-400 text-red-100'}`}>
                    {phase === 'player' ? "YOUR TURN" : "ENEMY TURN"}
                </div>
                <div className="text-[#ffd700] font-mono text-xl">Turn {turn}</div>
            </div>
        )}

        {!battleStarted ? (
          !selectedArea ? (
            // Step 1: Select Area
            <div className="flex gap-4">
                {DUNGEON_AREAS.map(area => (
                    <motion.button
                        key={area.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedArea(area)}
                        className={`
                            p-6 rounded-xl border-2 text-left transition-all w-64
                            bg-slate-900/60 border-slate-600 hover:bg-slate-800 hover:border-[#ffd700]
                        `}
                    >
                        <div className="text-xl font-bold text-white mb-2">{area.name}</div>
                        <div className="text-xs text-slate-300">{area.description}</div>
                    </motion.button>
                ))}
            </div>
          ) : (
            // Step 2: Select Level
            <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                    <div className="text-sm text-slate-400">エリア選択中</div>
                    <div className="text-xl text-[#ffd700] font-bold">{selectedArea.name}</div>
                 </div>
                 
                 <div className="h-10 w-px bg-slate-700 mx-2" />

                 <div className="flex gap-2">
                    {selectedArea.levels.map(level => (
                        <motion.button
                            key={level.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startBattle(level)}
                            className={`
                                px-4 py-2 rounded-lg border font-bold transition-all
                                ${level.name === '初級' ? 'bg-green-900/40 border-green-500 hover:bg-green-900/60 text-green-100' : ''}
                                ${level.name === '中級' ? 'bg-orange-900/40 border-orange-500 hover:bg-orange-900/60 text-orange-100' : ''}
                                ${level.name === '上級' ? 'bg-purple-900/40 border-purple-500 hover:bg-purple-900/60 text-purple-100' : ''}
                            `}
                        >
                            {level.name}
                        </motion.button>
                    ))}
                 </div>

                <button 
                    onClick={() => setSelectedArea(null)} 
                    className="ml-4 flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                >
                    <ChevronLeft size={18} /> 戻る
                </button>
            </div>
          )
        ) : (
            <div className="flex gap-4">
                 {phase === 'player' && !winner && (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={endTurn} 
                        className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg border border-blue-500 flex items-center gap-2 shadow-lg"
                    >
                        パス <ArrowRight size={18} />
                    </motion.button>
                 )}
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetBattle} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 px-6 rounded-lg border border-slate-600 flex items-center gap-2"
                >
                    <RotateCcw size={18} /> リセット
                </motion.button>
            </div>
        )}
      </div>

      <div className="relative w-full h-full flex-1 overflow-hidden">
        {/* Battle Visuals */}
        <div className="w-full h-full flex flex-col justify-between space-y-4 bg-slate-950/40 p-8 rounded-xl border border-[#c5a000]/20 relative overflow-hidden backdrop-blur-sm">
          {/* Background Decor */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950/80 to-slate-950 pointer-events-none" />
          
          {/* Enemy Side */}
          <div className="relative z-10">
            <div className="flex justify-center gap-4 min-h-[260px] items-center perspective-1000 flex-wrap">
              <AnimatePresence>
                {enemyDeck.filter(c => !c.isDead).map((card) => (
                  <motion.div 
                    key={card.id}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ 
                        opacity: 1, 
                        y: attackingCardId === card.id ? 50 : 0,
                        x: damagedCardId === card.id ? [0, -10, 10, -10, 10, 0] : 0,
                        filter: damagedCardId === card.id ? "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)" : "none",
                        scale: selectedCardId && phase === 'player' ? 1.05 : 1
                    }}
                    exit={{ opacity: 0, scale: 0, rotate: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => handleCardClick(card, false)}
                    className={`relative w-32 h-48 cursor-pointer transition-all duration-200 ${
                        selectedCardId && phase === 'player' ? 'ring-4 ring-red-500/50 hover:ring-red-500' : ''
                    }`}
                  >
                     <div className="absolute inset-0 origin-top-left scale-[0.5] w-64 h-96 pointer-events-none">
                        <CardComponent card={card} className="w-full h-full" isEnemy />
                     </div>
                     {/* HP Bar Overlay */}
                     <div className="absolute -bottom-6 left-0 right-0 bg-black/80 rounded-full h-4 border border-slate-600 overflow-hidden">
                        <div 
                            className="h-full bg-red-600 transition-all duration-300" 
                            style={{ width: `${(card.stats.health / card.originalStats.health) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                            {card.stats.health}/{card.originalStats.health}
                        </span>
                     </div>
                     {/* Damage Indicator */}
                     <AnimatePresence>
                        {damageIndicators.filter(d => d.cardId === card.id).map(d => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, y: -50, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                            >
                                <span className="text-4xl font-black text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] stroke-white">
                                    -{d.damage}
                                </span>
                            </motion.div>
                        ))}
                     </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
              {enemyDeck.every(c => c.isDead) && battleStarted && <div className="text-slate-500 font-serif text-xl">敵全滅</div>}
            </div>
          </div>

          <div className="text-center relative z-10">
             <div className="inline-block px-6 py-2 bg-black/60 border-y border-[#c5a000]/50 text-[#ffd700] font-serif font-bold text-2xl tracking-[0.2em]">
                VS
             </div>
          </div>

          {/* Player Side */}
          <div className="relative z-10">
            <div className="flex justify-center gap-4 min-h-[260px] items-center perspective-1000 flex-wrap">
              <AnimatePresence>
                {playerDeck.filter(c => !c.isDead).map((card) => (
                  <motion.div 
                    key={card.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                        opacity: card.canAttack ? 1 : 0.6, 
                        y: attackingCardId === card.id ? -50 : (selectedCardId === card.id ? -20 : 0),
                        x: damagedCardId === card.id ? [0, -10, 10, -10, 10, 0] : 0,
                        filter: damagedCardId === card.id ? "brightness(2) sepia(1) hue-rotate(-50deg) saturate(5)" : "none",
                        scale: selectedCardId === card.id ? 1.1 : 1
                    }}
                    exit={{ opacity: 0, scale: 0, rotate: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => handleCardClick(card, true)}
                    className={`relative w-32 h-48 cursor-pointer transition-all duration-200 ${
                        selectedCardId === card.id ? 'ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 
                        (card.canAttack && phase === 'player' ? 'hover:ring-2 hover:ring-blue-400/50' : '')
                    }`}
                  >
                     <div className="absolute inset-0 origin-top-left scale-[0.5] w-64 h-96 pointer-events-none">
                        <CardComponent card={card} className="w-full h-full" />
                     </div>
                     {/* HP Bar Overlay */}
                     <div className="absolute -bottom-6 left-0 right-0 bg-black/80 rounded-full h-4 border border-slate-600 overflow-hidden">
                        <div 
                            className="h-full bg-green-600 transition-all duration-300" 
                            style={{ width: `${(card.stats.health / card.originalStats.health) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                            {card.stats.health}/{card.originalStats.health}
                        </span>
                     </div>
                     {/* Attack Indicator */}
                     {card.canAttack && phase === 'player' && (
                        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg animate-bounce">
                            <Swords size={12} />
                        </div>
                     )}
                     {/* Damage Indicator */}
                     <AnimatePresence>
                        {damageIndicators.filter(d => d.cardId === card.id).map(d => (
                            <motion.div
                                key={d.id}
                                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                                animate={{ opacity: 0, y: -50, scale: 1.5 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                            >
                                <span className="text-4xl font-black text-red-500 drop-shadow-[0_2px_2px_rgba(0,0,0,1)] stroke-white">
                                    -{d.damage}
                                </span>
                            </motion.div>
                        ))}
                     </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
               {playerDeck.every(c => c.isDead) && battleStarted && <div className="text-slate-500 font-serif text-xl">全滅...</div>}
            </div>
          </div>
          
          {/* Winner Overlay */}
          {winner && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    className="relative p-1"
                >
                    {/* Decorative Border Container */}
                    <div className={`absolute inset-0 rounded-2xl blur-sm ${winner === 'player' ? 'bg-gradient-to-br from-[#ffd700] via-blue-500 to-[#ffd700]' : 'bg-gradient-to-br from-red-600 via-purple-900 to-red-600'} opacity-70`} />
                    
                    <div className={`relative bg-slate-950 p-12 rounded-2xl border-2 ${winner === 'player' ? 'border-[#ffd700]/50 shadow-[0_0_100px_rgba(255,215,0,0.3)]' : 'border-red-900/50 shadow-[0_0_100px_rgba(220,38,38,0.3)]'} text-center min-w-[400px]`}>
                        
                        {/* Icon/Decoration */}
                        <div className="mb-6 flex justify-center">
                            {winner === 'player' ? (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#ffd700] to-[#b8860b] flex items-center justify-center shadow-lg">
                                    <Swords size={40} className="text-black" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-red-700 to-red-950 flex items-center justify-center shadow-lg">
                                    <Skull size={40} className="text-red-200" />
                                </div>
                            )}
                        </div>

                        <h2 className={`text-6xl font-serif font-bold mb-4 tracking-wider ${winner === 'player' ? 'text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] via-[#f0e6d2] to-[#b8860b] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'text-red-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`}>
                            {winner === 'player' ? "VICTORY" : "DEFEAT"}
                        </h2>
                        
                        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#ffd700]/50 to-transparent mb-6" />

                        <p className="text-xl text-slate-300 mb-10 font-serif">
                            {winner === 'player' ? "敵を殲滅しました！" : "全滅しました..."}
                        </p>

                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={resetBattle}
                            className={`
                                group relative px-8 py-3 bg-slate-900 text-[#ffd700] font-bold text-lg rounded-lg overflow-hidden transition-all
                                border border-[#ffd700]/30 hover:border-[#ffd700] hover:shadow-[0_0_20px_rgba(255,215,0,0.2)]
                            `}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <RotateCcw size={18} /> もう一度戦う
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#ffd700]/0 via-[#ffd700]/10 to-[#ffd700]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        </motion.button>
                    </div>
                </motion.div>
            </div>
          )}
        </div>

        {/* Floating Battle Log Overlay */}
        <div className="absolute top-4 right-4 z-40 w-80 pointer-events-none">
            <div className="flex flex-col gap-2 items-end">
                <AnimatePresence>
                    {logs.slice(-5).map((log, i) => (
                        <motion.div
                            key={`${log.turn}-${i}`} // Use index to ensure uniqueness if turn is same
                            initial={{ opacity: 0, x: 20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`
                                pointer-events-auto
                                px-4 py-2 rounded-lg shadow-lg border-l-4 text-sm font-mono max-w-full break-words
                                ${
                                  log.type === 'victory' ? 'bg-green-900/90 border-green-500 text-green-100' :
                                  log.type === 'defeat' ? 'bg-red-900/90 border-red-500 text-red-100' :
                                  log.type === 'attack' ? 'bg-slate-800/90 border-slate-500 text-slate-200' :
                                  'bg-black/80 border-slate-600 text-slate-300'
                                }
                            `}
                        >
                            {log.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
