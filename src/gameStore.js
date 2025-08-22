// src/gameStore.js
import create from 'zustand';

// Create a larger pool of cards to draw from
const createCardPool = () => {
  let pool = [];
  for (let i = 0; i < 20; i++) {
    pool.push({ id: `island${i}`, name: 'Island', type: 'Land', tapped: false, mana: 'U' });
    pool.push({ id: `forest${i}`, name: 'Forest', type: 'Land', tapped: false, mana: 'G' });
  }
  for (let i = 0; i < 10; i++) {
    pool.push({ id: `grizzlyBears${i}`, name: 'Grizzly Bears', type: 'Creature', tapped: false, cost: ['G', 'C'] });
    pool.push({ id: `merfolkLooter${i}`, name: 'Merfolk Looter', type: 'Creature', tapped: false, cost: ['U', 'C'] });
  }
  return pool;
};

// Function to set up the initial state for a 4-player game
const createInitialState = () => {
  const players = {};
  const playerIds = ['player1', 'player2', 'player3', 'player4'];

  playerIds.forEach(id => {
    // For each player, shuffle the deck and draw 7 cards
    let cardPool = createCardPool();
    const shuffledLibrary = cardPool.sort(() => Math.random() - 0.5);
    const hand = shuffledLibrary.splice(0, 7); // Take the first 7 for the hand

    players[id] = {
      id: id,
      life: 20,
      hand: hand,
      library: shuffledLibrary, // The rest are the library
      battlefield: [], // Battlefield starts empty
      graveyard: [],
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    };
  });

  return {
    game: {
      turnNumber: 1,
      activePlayerId: 'player1',
      currentPhase: 'main1',
    },
    players: players,
  };
};

export const useGameStore = create((set, get) => ({
  ...createInitialState(),

  // The rest of your actions (tapCard, drawCard, passTurn) go here...
  // They don't need to be changed.
  
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
    const playerIds = Object.keys(state.players);
    const currentPlayerIndex = playerIds.indexOf(state.game.activePlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextPlayerIndex];
    
    const currentPlayerId = state.game.activePlayerId;
    const nextPlayer = state.players[nextPlayerId];
    
    const untappedBattlefield = nextPlayer.battlefield.map(card => ({ ...card, tapped: false }));
    const resetPlayerMana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    
    return {
      game: {
        ...state.game,
        turnNumber: nextPlayerId === 'player1' ? state.game.turnNumber + 1 : state.game.turnNumber,
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
