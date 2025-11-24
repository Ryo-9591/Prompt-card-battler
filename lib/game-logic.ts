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

export function simulateBattle(playerDeck: Card[], enemyDeck: Card[]): BattleLogEntry[] {
  const logs: BattleLogEntry[] = [];
  let turn = 1;
  
  // Clone decks to avoid mutating original state
  const pDeck = playerDeck.map(c => ({ ...c, stats: { ...c.stats } }));
  const eDeck = enemyDeck.map(c => ({ ...c, stats: { ...c.stats } }));

  logs.push({ turn: 0, message: "バトル開始！", type: 'info' });

  while (pDeck.length > 0 && eDeck.length > 0) {
    const pCard = pDeck[0];
    const eCard = eDeck[0];

    logs.push({ turn, message: `ターン ${turn}: ${pCard.name} vs ${eCard.name}`, type: 'info' });

    // Check Element Advantage
    let pDmg = pCard.stats.attack;
    let eDmg = eCard.stats.attack;

    if (ELEMENT_ADVANTAGE[pCard.element] === eCard.element) {
      pDmg += 2;
      logs.push({ turn, message: `> ${pCard.name} の属性有利！ (攻撃力+2)`, type: 'info' });
    }
    if (ELEMENT_ADVANTAGE[eCard.element] === pCard.element) {
      eDmg += 2;
      logs.push({ turn, message: `> ${eCard.name} の属性有利！ (攻撃力+2)`, type: 'info' });
    }

    // Combat
    eCard.stats.health -= pDmg;
    pCard.stats.health -= eDmg;

    logs.push({ turn, message: `${pCard.name} は ${eCard.name} に ${pDmg} のダメージ！`, type: 'attack' });
    logs.push({ turn, message: `${eCard.name} は ${pCard.name} に ${eDmg} のダメージ！`, type: 'attack' });

    // Check Deaths
    if (pCard.stats.health <= 0) {
      logs.push({ turn, message: `${pCard.name} は倒れた！`, type: 'defeat' });
      pDeck.shift();
    }
    if (eCard.stats.health <= 0) {
      logs.push({ turn, message: `${eCard.name} は倒れた！`, type: 'defeat' });
      eDeck.shift();
    }

    turn++;
    if (turn > 100) {
      logs.push({ turn, message: "制限ターン到達！引き分け！", type: 'info' });
      break;
    }
  }

  if (pDeck.length > 0) {
    logs.push({ turn, message: "勝利！あなたの勝ちです！", type: 'victory' });
  } else if (eDeck.length > 0) {
    logs.push({ turn, message: "敗北... あなたは負けました...", type: 'defeat' });
  } else {
    logs.push({ turn, message: "引き分け！両者全滅。", type: 'info' });
  }

  return logs;
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
    imageUrl: 'https://placehold.co/400x600/1e293b/22c55e?text=Goblin',
  },
  {
    id: 'e2',
    name: 'ファイア・インプ',
    stats: { attack: 4, health: 1 },
    element: 'Fire',
    keywords: ['Rush'],
    cost: 2,
    explanation: '燃え尽きるのは早い。',
    imageUrl: 'https://placehold.co/400x600/1e293b/ef4444?text=Imp',
  },
  {
    id: 'e3',
    name: 'ウォーター・エレメンタル',
    stats: { attack: 3, health: 5 },
    element: 'Water',
    keywords: [],
    cost: 4,
    explanation: 'しぶとい。',
    imageUrl: 'https://placehold.co/400x600/1e293b/3b82f6?text=Water',
  },
  {
    id: 'e4',
    name: 'シャドウ・ナイト',
    stats: { attack: 6, health: 4 },
    element: 'Dark',
    keywords: [],
    cost: 6,
    explanation: '一撃が重い。',
    imageUrl: 'https://placehold.co/400x600/1e293b/a855f7?text=Shadow',
  },
  {
    id: 'e5',
    name: 'ドラゴン・ロード',
    stats: { attack: 8, health: 8 },
    element: 'Fire',
    keywords: [],
    cost: 9,
    explanation: '最強の主。',
    imageUrl: 'https://placehold.co/400x600/1e293b/ef4444?text=Dragon',
  },
];
