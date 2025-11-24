"use client";

import { useState, useEffect, useRef } from "react";
import { Card as CardComponent } from "@/components/Card";
import { 
  Card, 
  BattleCard, 
  BattleLogEntry, 
  MOCK_ENEMY_DECK, 
  initializeBattleDeck, 
  resolveCombat 
} from "@/lib/game-logic";
import { storage } from "@/lib/storage";
import { Swords, RotateCcw, Shield, Skull, ArrowRight } from "lucide-react";
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

  // Interaction State
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Animation State
  const [attackingCardId, setAttackingCardId] = useState<string | null>(null);
  const [damagedCardId, setDamagedCardId] = useState<string | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize Battle
  const startBattle = () => {
    const pDeck = storage.getDeck();
    if (pDeck.length === 0) {
      alert("デッキがありません！デッキビルダーで作成してください。");
      return;
    }
    setPlayerDeck(initializeBattleDeck(pDeck));
    setEnemyDeck(initializeBattleDeck(MOCK_ENEMY_DECK));
    setLogs([{ turn: 1, message: "バトル開始！あなたのターンです。", type: 'info' }]);
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
    
    // Update Logs
    const newLogs = combatLogs.map(l => ({ ...l, turn }));
    setLogs(prev => [...prev, ...newLogs]);

    // Update State
    if (isPlayerAttacking) {
        setPlayerDeck(prev => prev.map(c => c.id === newAttacker.id ? { ...newAttacker, canAttack: false } : c));
        setEnemyDeck(prev => prev.map(c => c.id === newDefender.id ? newDefender : c));
    } else {
        setEnemyDeck(prev => prev.map(c => c.id === newAttacker.id ? { ...newAttacker, canAttack: false } : c));
        setPlayerDeck(prev => prev.map(c => c.id === newDefender.id ? newDefender : c));
    }
  };

  const endTurn = () => {
    if (phase !== 'player' || winner) return;
    
    setPhase('enemy');
    setLogs(prev => [...prev, { turn, message: "ターン終了。敵のターンです。", type: 'info' }]);
    
    // Reset Enemy Attacks (allow them to attack in their turn)
    setEnemyDeck(prev => prev.map(c => ({ ...c, canAttack: true })));

    // AI Logic (Simple Delay)
    setTimeout(() => {
        executeEnemyTurn();
    }, 1000);
  };

  const executeEnemyTurn = () => {
    // Simple AI: Each living enemy attacks a random living player card
    // We need to do this sequentially for animations to make sense, or just one attack per turn for simplicity?
    // Let's do one attack per enemy card that can attack.
    
    // Note: Since state updates are async, we can't loop easily with state updates in React without complex effects or refs.
    // For this MVP, let's just have ONE enemy attack per turn or make them all attack at once (logic wise) but animate fast.
    // Better: Recursive function with delay.

    let currentEnemyIndex = 0;
    const enemyAttackSequence = async () => {
        // We need to read the LATEST state. In a real app, use refs or functional state updates carefully.
        // Here, we will cheat slightly by using a ref or just doing one attack for simplicity if multiple is too hard.
        // Let's try to do one random attack for now to keep it stable.
        
        // Actually, let's just make the first available enemy attack a random target.
        // To support multiple, we'd need a more robust queue system.
        // Let's try to iterate over the deck in the state *at the start of the turn*? No, state changes.
        
        // Simplified AI: Pick ONE random attacker and ONE random target.
        // If we want full board attacks, we need a better system. 
        // Let's stick to: All enemies attack random targets one by one.
        
        // For this implementation, let's just have the AI attack ONCE with a random card to keep it simple and bug-free for now.
        // If the user wants "Shadowverse", usually all followers can attack.
        // Let's try to implement a sequence.
        
        // We will use a ref to track the current deck state during the AI turn to avoid closure staleness, 
        // or just use functional updates.
        
        // Let's just do: Find all eligible attackers.
        // For each, pick a target.
        // Execute.
        
        // Since we can't easily chain state updates with delays in a loop without useEffect chains,
        // let's just do one attack for now.
        
        setPlayerDeck(currentPDeck => {
            setEnemyDeck(currentEDeck => {
                // This is getting complex to orchestrate animations.
                // Let's just do a single massive logic update for all AI attacks, 
                // and maybe skip individual animations for AI or just animate the first one.
                
                // Let's go with: AI picks the strongest attacker and attacks the weakest player card.
                const validAttackers = currentEDeck.filter(c => !c.isDead && c.canAttack);
                if (validAttackers.length === 0) {
                    finishEnemyTurn();
                    return currentEDeck;
                }

                const attacker = validAttackers[0]; // Just first one for now
                const validTargets = currentPDeck.filter(c => !c.isDead);
                
                if (validTargets.length > 0) {
                    const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                    
                    // Trigger animation (visual only, might be out of sync if we do multiple)
                    setAttackingCardId(attacker.id);
                    setDamagedCardId(target.id);
                    setTimeout(() => {
                        setAttackingCardId(null);
                        setDamagedCardId(null);
                    }, 800);

                    const { attacker: newAttacker, defender: newDefender, logs: combatLogs } = resolveCombat(attacker, target);
                    
                    const newLogs = combatLogs.map(l => ({ ...l, turn }));
                    setLogs(prev => [...prev, ...newLogs]);

                    // Update Decks
                    // We need to return the new Enemy Deck state here
                    // And also update Player Deck state (which is in the outer scope)
                    
                    // This nested set state is tricky.
                    // Let's use a helper to do the logic and update both at once.
                    return currentEDeck.map(c => c.id === newAttacker.id ? { ...newAttacker, canAttack: false } : c);
                } else {
                    finishEnemyTurn();
                    return currentEDeck;
                }
            });
            
            // We need to update player deck based on the combat result calculated inside setEnemyDeck... 
            // This is why complex game logic in `useState` is hard.
            // Let's refactor: Calculate everything first, then set state.
            return currentPDeck; 
        });
        
        return;
    };

    // Better AI Implementation
    const performAiTurn = () => {
        // Get current state
        // Note: In a closure, these might be stale if we aren't careful.
        // But since we call this from a timeout in endTurn, and we don't await anything before,
        // the state *should* be relatively fresh, but `playerDeck` and `enemyDeck` are consts from the render.
        // We need to use the functional update pattern to ensure we have the latest.
        
        setEnemyDeck(prevEnemyDeck => {
            const attackers = prevEnemyDeck.filter(c => !c.isDead);
            
            if (attackers.length === 0) {
                setTimeout(finishEnemyTurn, 500);
                return prevEnemyDeck;
            }

            // We will execute attacks sequentially using a chain of timeouts/state updates?
            // No, that's too messy.
            // Let's just execute ONE attack for this turn to keep the flow clear.
            // "The enemy rallies and one unit attacks!"
            
            const attacker = attackers[Math.floor(Math.random() * attackers.length)];
            
            setPlayerDeck(prevPlayerDeck => {
                const targets = prevPlayerDeck.filter(c => !c.isDead);
                if (targets.length === 0) {
                    setTimeout(finishEnemyTurn, 500);
                    return prevPlayerDeck;
                }
                
                const target = targets[Math.floor(Math.random() * targets.length)];
                
                // Execute Combat Logic
                const { attacker: newAttacker, defender: newDefender, logs: combatLogs } = resolveCombat(attacker, target);
                
                // Side effects (Logs, Animation)
                const newLogs = combatLogs.map(l => ({ ...l, turn }));
                setLogs(prev => [...prev, ...newLogs]);
                
                setAttackingCardId(attacker.id);
                setTimeout(() => setAttackingCardId(null), 500);
                setTimeout(() => {
                    setDamagedCardId(target.id);
                    setTimeout(() => setDamagedCardId(null), 500);
                }, 300);

                setTimeout(finishEnemyTurn, 1500);

                // Return new Player Deck
                return prevPlayerDeck.map(c => c.id === newDefender.id ? newDefender : c);
            });

            // Return new Enemy Deck
            // We need to find the updated attacker in the list
            // But `newAttacker` is derived inside the inner function... 
            // This structure is still problematic.
            
            // CORRECT APPROACH:
            // We need to access both decks. We can't easily do that with separate setStates if they depend on each other's result.
            // But we can just read the current state from the refs if we had them, or just assume the render scope state is fresh enough 
            // IF we haven't modified it since the render. 
            // Since `endTurn` sets phase and then waits 1s, the component re-renders.
            // So `playerDeck` and `enemyDeck` in `executeEnemyTurn` (if defined in component) ARE fresh.
            
            return prevEnemyDeck; // We will update it properly in the dedicated function below
        });
        
        return []; // Dummy return for the first setEnemyDeck call if we used it, but we shouldn't.
    };
    
    // Let's try the "Fresh State" approach
    // Since we are inside the component, we can just read `playerDeck` and `enemyDeck`.
    // BUT, we need to be careful about the closure.
    // `executeEnemyTurn` is called from `setTimeout`. The `playerDeck` it sees is the one from the render where `setTimeout` was created.
    // That should be fine as no other changes happen in between.
    
    const aiAttacker = enemyDeck.find(c => !c.isDead && c.canAttack);
    if (aiAttacker) {
        // Find Target
        const targets = playerDeck.filter(c => !c.isDead);
        if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            executeAttack(aiAttacker, target, false);
        }
    }
    
    setTimeout(finishEnemyTurn, 1500);
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
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startBattle} 
            className="bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-[#ffd700] font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-500 flex items-center gap-3 text-xl"
          >
            <Swords size={24} /> バトル開始
          </motion.button>
        ) : (
            <div className="flex gap-4">
                 {phase === 'player' && !winner && (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={endTurn} 
                        className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg border border-blue-500 flex items-center gap-2 shadow-lg"
                    >
                        ターン終了 <ArrowRight size={18} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Battle Visuals */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4 bg-slate-950/40 p-8 rounded-xl border border-[#c5a000]/20 relative overflow-hidden backdrop-blur-sm">
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

        {/* Battle Log */}
        <div className="bg-black/60 border border-[#c5a000]/30 rounded-xl p-0 flex flex-col h-full overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="p-4 border-b border-[#c5a000]/20 bg-[#c5a000]/5">
            <h2 className="text-xl font-serif font-bold text-[#f0e6d2] flex items-center gap-2">
                <span className="text-[#ffd700]">📜</span> バトルログ
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {logs.map((log, i) => (
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
