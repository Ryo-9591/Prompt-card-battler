
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

export interface Dungeon {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  enemyPool: Card[];
  boss?: Card;
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
    canAttack: true, 
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

  damageLogs.forEach(msg => turnLogs.push({ turn: 0, message: msg, type: 'info' }));

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

// --- Enemy Data ---

const BEGINNER_ENEMIES: Card[] = [
    {
        id: 'b1', name: 'ゴブリン', stats: { attack: 2, health: 3 }, element: 'Nature', keywords: [], cost: 1,
        explanation: '森に住む小鬼。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20goblin%20forest?width=512&height=768&nologo=true'
    },
    {
        id: 'b2', name: 'スライム', stats: { attack: 1, health: 4 }, element: 'Water', keywords: [], cost: 1,
        explanation: 'ぷるぷるしている。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20blue%20slime?width=512&height=768&nologo=true'
    },
    {
        id: 'b3', name: 'ウルフ', stats: { attack: 3, health: 2 }, element: 'Nature', keywords: [], cost: 2,
        explanation: '素早い動きで噛みつく。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20wolf%20forest?width=512&height=768&nologo=true'
    },
    {
        id: 'b4', name: 'フェアリー', stats: { attack: 2, health: 2 }, element: 'Light', keywords: [], cost: 2,
        explanation: '光の魔法を使う。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20fairy%20light?width=512&height=768&nologo=true'
    },
];

const INTERMEDIATE_ENEMIES: Card[] = [
    {
        id: 'i1', name: 'ファイア・インプ', stats: { attack: 4, health: 2 }, element: 'Fire', keywords: ['Rush'], cost: 3,
        explanation: '燃え盛る小悪魔。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20fire%20imp?width=512&height=768&nologo=true'
    },
    {
        id: 'i2', name: 'リザードマン', stats: { attack: 3, health: 5 }, element: 'Fire', keywords: [], cost: 3,
        explanation: '鱗が硬い戦士。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20lizardman%20warrior?width=512&height=768&nologo=true'
    },
    {
        id: 'i3', name: 'マグマゴーレム', stats: { attack: 2, health: 7 }, element: 'Fire', keywords: ['Guard'], cost: 4,
        explanation: '溶岩でできた巨人。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20magma%20golem?width=512&height=768&nologo=true'
    },
    {
        id: 'i4', name: 'サラマンダー', stats: { attack: 5, health: 3 }, element: 'Fire', keywords: [], cost: 4,
        explanation: '炎を纏うトカゲ。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20fire%20salamander?width=512&height=768&nologo=true'
    },
];

const ADVANCED_ENEMIES: Card[] = [
    {
        id: 'a1', name: 'シャドウナイト', stats: { attack: 6, health: 6 }, element: 'Dark', keywords: [], cost: 5,
        explanation: '闇に堕ちた騎士。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20dark%20knight?width=512&height=768&nologo=true'
    },
    {
        id: 'a2', name: 'アークデーモン', stats: { attack: 7, health: 5 }, element: 'Dark', keywords: [], cost: 6,
        explanation: '上位の悪魔。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20archdemon?width=512&height=768&nologo=true'
    },
    {
        id: 'a3', name: 'カオスドラゴン', stats: { attack: 9, health: 8 }, element: 'Dark', keywords: [], cost: 8,
        explanation: '混沌を呼ぶ竜。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20chaos%20dragon?width=512&height=768&nologo=true'
    },
    {
        id: 'a4', name: 'ヴァンパイアロード', stats: { attack: 5, health: 10 }, element: 'Dark', keywords: ['Revenge'], cost: 7,
        explanation: '血を求める貴族。', imageUrl: 'https://image.pollinations.ai/prompt/fantasy%20card%20art%20vampire%20lord?width=512&height=768&nologo=true'
    },
];

export const DUNGEONS: Dungeon[] = [
    {
        id: 'd1',
        name: 'はじまりの森',
        difficulty: 'Beginner',
        description: 'モンスターが現れ始めた森。初心者向け。',
        enemyPool: BEGINNER_ENEMIES
    },
    {
        id: 'd2',
        name: '灼熱の火山',
        difficulty: 'Intermediate',
        description: '強力な炎属性モンスターが生息する危険地帯。',
        enemyPool: INTERMEDIATE_ENEMIES
    },
    {
        id: 'd3',
        name: '深淵の魔城',
        difficulty: 'Advanced',
        description: '最凶の魔物が巣食う城。生きて帰った者はいない。',
        enemyPool: ADVANCED_ENEMIES
    }
];

export const MOCK_ENEMY_DECK = BEGINNER_ENEMIES; // Fallback
