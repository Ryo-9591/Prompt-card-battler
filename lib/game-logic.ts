export type ElementType = 'Fire' | 'Water' | 'Nature' | 'Light' | 'Dark';
export type KeywordType = 'Rush' | 'Guard' | 'Combo' | 'Revenge' | 'Pierce';

export interface Card {
  id: string;
  name: string;
  stats: {
    attack: number;
    health: number;
  };
  element: ElementType;
  keywords: KeywordType[];
  cost: number;
  explanation: string;
  imageUrl: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

export const ELEMENT_ADVANTAGE: Record<ElementType, ElementType> = {
  Fire: 'Nature',
  Nature: 'Water',
  Water: 'Fire',
  Light: 'Dark',
  Dark: 'Light',
};

export interface BattleLogEntry {
  turn: number;
  message: string;
  type: 'info' | 'attack' | 'defeat' | 'victory';
}

export interface BattleCard extends Card {
  originalStats: {
    attack: number;
    health: number;
  };
  canAttack: boolean;
  isDead: boolean;
}

export function initializeBattleDeck(deck: Card[]): BattleCard[] {
  return deck.map(card => ({
    ...card,
    stats: { ...card.stats }, // Clone stats
    originalStats: { ...card.stats },
    canAttack: true, // In this game, maybe cards can attack immediately? Or wait a turn? Let's say wait a turn usually, but for simplicity let's allow immediate attack or handle "summoning sickness" later. The requirement didn't specify. Shadowverse has summoning sickness (except Rush). Let's assume they are already on board for this MVP or can attack immediately for simplicity unless "Rush" keyword is present. 
    // Wait, the prompt says "Shadowverse-like". In Shadowverse, followers can't attack face turn 1, but can attack followers if they have Rush.
    // Since we don't have a "hand" and "play" phase, all cards start on board. So they should be able to attack immediately.
    isDead: false,
  }));
}

export function calculateDamage(attacker: BattleCard, defender: BattleCard): { attackerDamage: number; defenderDamage: number; logs: string[] } {
  const logs: string[] = [];
  let attackerDamage = attacker.stats.attack;
  let defenderDamage = defender.stats.attack;

  // Element Advantage
  if (ELEMENT_ADVANTAGE[attacker.element] === defender.element) {
    attackerDamage += 2;
    logs.push(`> ${attacker.name} の属性有利！ (攻撃力+2)`);
  }
  if (ELEMENT_ADVANTAGE[defender.element] === attacker.element) {
    defenderDamage += 2;
    logs.push(`> ${defender.name} の属性有利！ (攻撃力+2)`);
  }

  return { attackerDamage, defenderDamage, logs };
}

export function resolveCombat(attacker: BattleCard, defender: BattleCard): { 
  attacker: BattleCard; 
  defender: BattleCard; 
  logs: BattleLogEntry[]; 
} {
  const turnLogs: BattleLogEntry[] = [];
  const { attackerDamage, defenderDamage, logs: damageLogs } = calculateDamage(attacker, defender);

  damageLogs.forEach(msg => turnLogs.push({ turn: 0, message: msg, type: 'info' })); // Turn 0 placeholder, will be overridden or ignored in UI display context if needed, or we pass turn number.

  // Apply Damage
  attacker.stats.health -= defenderDamage;
  defender.stats.health -= attackerDamage;

  turnLogs.push({ turn: 0, message: `${attacker.name} は ${defender.name} に ${attackerDamage} のダメージ！`, type: 'attack' });
  turnLogs.push({ turn: 0, message: `${defender.name} は ${attacker.name} に ${defenderDamage} のダメージ！`, type: 'attack' });

  // Check Death
  if (attacker.stats.health <= 0) {
    attacker.isDead = true;
    attacker.stats.health = 0;
    turnLogs.push({ turn: 0, message: `${attacker.name} は倒れた！`, type: 'defeat' });
  }
  if (defender.stats.health <= 0) {
    defender.isDead = true;
    defender.stats.health = 0;
    turnLogs.push({ turn: 0, message: `${defender.name} は倒れた！`, type: 'defeat' });
  }

  return { attacker, defender, logs: turnLogs };
}

export const MOCK_ENEMY_DECK: Card[] = [
  {
    id: 'e1',
    name: 'ゴブリンの歩兵',
    stats: { attack: 2, health: 2 },
    element: 'Nature',
    keywords: [],
    cost: 1,
    explanation: '安価な捨て駒。',
    imageUrl: 'https://image.pollinations.ai/prompt/Fantasy%20card%20art%2C%20Nature%20element%2C%20Goblin%20Infantry%3A%20Cheap%20fodder.%20High%20quality%2C%20digital%20art%2C%20magical%20atmosphere.?width=1024&height=1024&seed=101&nologo=true&model=flux',
  },
  {
    id: 'e2',
    name: 'ファイア・インプ',
    stats: { attack: 4, health: 1 },
    element: 'Fire',
    keywords: ['Rush'],
    cost: 2,
    explanation: '燃え尽きるのは早い。',
    imageUrl: 'https://image.pollinations.ai/prompt/Fantasy%20card%20art%2C%20Fire%20element%2C%20Fire%20Imp%3A%20Burns%20out%20quickly.%20High%20quality%2C%20digital%20art%2C%20magical%20atmosphere.?width=1024&height=1024&seed=102&nologo=true&model=flux',
  },
  {
    id: 'e3',
    name: 'ウォーター・エレメンタル',
    stats: { attack: 3, health: 5 },
    element: 'Water',
    keywords: [],
    cost: 4,
    explanation: 'しぶとい。',
    imageUrl: 'https://image.pollinations.ai/prompt/Fantasy%20card%20art%2C%20Water%20element%2C%20Water%20Elemental%3A%20Resilient.%20High%20quality%2C%20digital%20art%2C%20magical%20atmosphere.?width=1024&height=1024&seed=103&nologo=true&model=flux',
  },
  {
    id: 'e4',
    name: 'シャドウ・ナイト',
    stats: { attack: 6, health: 4 },
    element: 'Dark',
    keywords: [],
    cost: 6,
    explanation: '一撃が重い。',
    imageUrl: 'https://image.pollinations.ai/prompt/Fantasy%20card%20art%2C%20Dark%20element%2C%20Shadow%20Knight%3A%20Heavy%20hitter.%20High%20quality%2C%20digital%20art%2C%20magical%20atmosphere.?width=1024&height=1024&seed=104&nologo=true&model=flux',
  },
  {
    id: 'e5',
    name: 'ドラゴン・ロード',
    stats: { attack: 8, health: 8 },
    element: 'Fire',
    keywords: [],
    cost: 9,
    explanation: '最強の主。',
    imageUrl: 'https://image.pollinations.ai/prompt/Fantasy%20card%20art%2C%20Fire%20element%2C%20Dragon%20Lord%3A%20The%20strongest%20lord.%20High%20quality%2C%20digital%20art%2C%20magical%20atmosphere.?width=1024&height=1024&seed=105&nologo=true&model=flux',
  },
];
