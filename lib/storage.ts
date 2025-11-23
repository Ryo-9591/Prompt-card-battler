import { Card, Deck } from "./game-logic";

const STORAGE_KEYS = {
  CARDS: "pcb_cards",
  DECK: "pcb_deck",
};

export const storage = {
  getCards: (): Card[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.CARDS);
    return data ? JSON.parse(data) : [];
  },

  saveCard: (card: Card) => {
    const cards = storage.getCards();
    // Avoid duplicates by ID
    if (cards.some((c) => c.id === card.id)) return;
    const newCards = [...cards, card];
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(newCards));
  },

  getDeck: (): Card[] => {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(STORAGE_KEYS.DECK);
    return data ? JSON.parse(data) : [];
  },

  saveDeck: (deck: Card[]) => {
    localStorage.setItem(STORAGE_KEYS.DECK, JSON.stringify(deck));
  },
};
