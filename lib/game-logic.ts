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

  logs.push({ turn: 0, message: "Battle Start!", type: 'info' });

  while (pDeck.length > 0 && eDeck.length > 0) {
    const pCard = pDeck[0];
    const eCard = eDeck[0];

    logs.push({ turn, message: `Turn ${turn}: ${pCard.name} vs ${eCard.name}`, type: 'info' });

    // Check Element Advantage
    let pDmg = pCard.stats.attack;
    let eDmg = eCard.stats.attack;

    if (ELEMENT_ADVANTAGE[pCard.element] === eCard.element) {
      pDmg += 2;
      logs.push({ turn, message: `> ${pCard.name} has element advantage! (+2 Atk)`, type: 'info' });
    }
    if (ELEMENT_ADVANTAGE[eCard.element] === pCard.element) {
      eDmg += 2;
      logs.push({ turn, message: `> ${eCard.name} has element advantage! (+2 Atk)`, type: 'info' });
    }

    // Combat
    eCard.stats.health -= pDmg;
    pCard.stats.health -= eDmg;

    logs.push({ turn, message: `${pCard.name} deals ${pDmg} dmg to ${eCard.name}`, type: 'attack' });
    logs.push({ turn, message: `${eCard.name} deals ${eDmg} dmg to ${pCard.name}`, type: 'attack' });

    // Check Deaths
    if (pCard.stats.health <= 0) {
      logs.push({ turn, message: `${pCard.name} is defeated!`, type: 'defeat' });
      pDeck.shift();
    }
    if (eCard.stats.health <= 0) {
      logs.push({ turn, message: `${eCard.name} is defeated!`, type: 'defeat' });
      eDeck.shift();
    }

    turn++;
    if (turn > 100) {
      logs.push({ turn, message: "Battle limit reached! Draw!", type: 'info' });
      break;
    }
  }

  if (pDeck.length > 0) {
    logs.push({ turn, message: "VICTORY! You won the battle!", type: 'victory' });
  } else if (eDeck.length > 0) {
    logs.push({ turn, message: "DEFEAT! You lost the battle...", type: 'defeat' });
  } else {
    logs.push({ turn, message: "DRAW! Both sides annihilated.", type: 'info' });
  }

  return logs;
}

export const MOCK_ENEMY_DECK: Card[] = [
  {
    id: 'e1',
    name: 'Goblin Grunt',
    stats: { attack: 2, health: 2 },
    element: 'Nature',
    keywords: [],
    cost: 1,
    explanation: 'Cheap fodder.',
    imageUrl: 'https://placehold.co/400x600/1e293b/22c55e?text=Goblin',
  },
  {
    id: 'e2',
    name: 'Fire Imp',
    stats: { attack: 4, health: 1 },
    element: 'Fire',
    keywords: ['Rush'],
    cost: 2,
    explanation: 'Burns fast.',
    imageUrl: 'https://placehold.co/400x600/1e293b/ef4444?text=Imp',
  },
  {
    id: 'e3',
    name: 'Water Elemental',
    stats: { attack: 3, health: 5 },
    element: 'Water',
    keywords: [],
    cost: 4,
    explanation: 'Hard to kill.',
    imageUrl: 'https://placehold.co/400x600/1e293b/3b82f6?text=Water',
  },
  {
    id: 'e4',
    name: 'Shadow Knight',
    stats: { attack: 6, health: 4 },
    element: 'Dark',
    keywords: [],
    cost: 6,
    explanation: 'Hits hard.',
    imageUrl: 'https://placehold.co/400x600/1e293b/a855f7?text=Shadow',
  },
  {
    id: 'e5',
    name: 'Dragon Lord',
    stats: { attack: 8, health: 8 },
    element: 'Fire',
    keywords: [],
    cost: 9,
    explanation: 'The boss.',
    imageUrl: 'https://placehold.co/400x600/1e293b/ef4444?text=Dragon',
  },
];
