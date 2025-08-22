// src/gameStore.js
import create from 'zustand';

const initialCards = {
  'island1': { id: 'island1', name: 'Island', type: 'Land', tapped: false, mana: 'U' },
  'island2': { id: 'island2', name: 'Island', type: 'Land', tapped: false, mana: 'U' },
  'forest1': { id: 'forest1', name: 'Forest', type: 'Land', tapped: false, mana: 'G' },
  'grizzlyBears': { id: 'grizzlyBears', name: 'Grizzly Bears', type: 'Creature', tapped: false, cost: ['G', 'C'] },
  'merfolkLooter': { id: 'merfolkLooter', name: 'Merfolk Looter', type: 'Creature', tapped: false, cost: ['U', 'C'] },
  'sleightOfHand': { id: 'sleightOfHand', name: 'Sleight of Hand', type: 'Sorcery', cost: ['U'] },
};

export const useGameStore = create((set, get) => ({
  game: {
    turnNumber: 1,
    activePlayerId: 'player1',
    currentPhase: 'main1',
  },
  players: {
    'player1': {
      id: 'player1',
      life: 20,
      hand: [initialCards['sleightOfHand']],
      battlefield: [initialCards['island1']],
      graveyard: [],
      library: [initialCards['grizzlyBears'], initialCards['merfolkLooter']],
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    },
    'player2': {
      id: 'player2',
      life: 20,
      hand: [],
      battlefield: [initialCards['island2'], initialCards['forest1']],
      graveyard: [],
      library: [initialCards['grizzlyBears']],
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    },
  },

  tapCard: (playerId, cardId) => set((state) => {
    if (state.game.activePlayerId !== playerId) return state;
    const player = state.players[playerId];
    const cardToTap = player.battlefield.find(c => c.id === cardId);
    if (!cardToTap || cardToTap.tapped) return state;

    const newBattlefield = player.battlefield.map(card =>
      card.id === cardId ? { ...card, tapped: true } : card
    );
    const newManaPool = { ...player.manaPool };
    if (cardToTap.type === 'Land' && cardToTap.mana) {
      newManaPool[cardToTap.mana]++;
    }
    return {
      players: {
        ...state.players,
        [playerId]: { ...player, battlefield: newBattlefield, manaPool: newManaPool },
      },
    };
  }),

  drawCard: (playerId) => set((state) => {
    const player = state.players[playerId];
    if (player.library.length === 0) return state;
    const newLibrary = [...player.library];
    const drawnCard = newLibrary.pop();
    const newHand = [...player.hand, drawnCard];
    return {
      players: {
        ...state.players,
        [playerId]: { ...player, library: newLibrary, hand: newHand },
      },
    };
  }),
  
  passTurn: () => set((state) => {
    const currentPlayerId = state.game.activePlayerId;
    const nextPlayerId = currentPlayerId === 'player1' ? 'player2' : 'player1';
    const nextPlayer = state.players[nextPlayerId];
    const untappedBattlefield = nextPlayer.battlefield.map(card => ({ ...card, tapped: false }));
    const resetPlayerMana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    return {
      game: {
        ...state.game,
        turnNumber: state.game.activePlayerId === 'player2' ? state.game.turnNumber + 1 : state.game.turnNumber,
        activePlayerId: nextPlayerId,
        currentPhase: 'untap',
      },
      players: {
        ...state.players,
        [currentPlayerId]: { ...state.players[currentPlayerId], manaPool: resetPlayerMana },
        [nextPlayerId]: { ...nextPlayer, battlefield: untappedBattlefield, manaPool: resetPlayerMana }
      }
    };
  }),
}));
