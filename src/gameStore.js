// src/gameStore.js
import create from 'zustand';

// (The createCardPool function remains the same as before)
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

const createInitialState = () => {
  const players = {};
  const playerIds = ['player1', 'player2', 'player3', 'player4'];

  playerIds.forEach(id => {
    let cardPool = createCardPool();
    const shuffledLibrary = cardPool.sort(() => Math.random() - 0.5);
    const hand = shuffledLibrary.splice(0, 7);

    players[id] = {
      id: id,
      life: 20,
      hand: hand,
      library: shuffledLibrary,
      battlefield: [],
      graveyard: [],
      manaPool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    };
  });

  return {
    game: {
      turnNumber: 1,
      activePlayerId: 'player1',
      currentPhase: 'main1',
      landPlayedThisTurn: false, // <-- NEW: Track land drops
    },
    players: players,
  };
};

export const useGameStore = create((set, get) => ({
  ...createInitialState(),

  // =================================================
  // ACTIONS
  // =================================================

  // NEW ACTION: playLandFromHand
  playLandFromHand: (playerId, cardId) => set((state) => {
    // Rule 1: Only the active player can play lands.
    if (state.game.activePlayerId !== playerId) return state;

    // Rule 2: A player can only play one land per turn.
    if (state.game.landPlayedThisTurn) {
      alert("You've already played a land this turn.");
      return state;
    }

    const player = state.players[playerId];
    const cardToPlay = player.hand.find(c => c.id === cardId);

    // Rule 3: The card must be a Land.
    if (!cardToPlay || cardToPlay.type !== 'Land') return state;

    // Move the card from hand to battlefield
    const newHand = player.hand.filter(c => c.id !== cardId);
    const newBattlefield = [...player.battlefield, { ...cardToPlay, tapped: false }];

    return {
      game: {
        ...state.game,
        landPlayedThisTurn: true, // Mark that a land has been played
      },
      players: {
        ...state.players,
        [playerId]: {
          ...player,
          hand: newHand,
          battlefield: newBattlefield,
        },
      },
    };
  }),

  passTurn: () => set((state) => {
    const playerIds = Object.keys(state.players);
    const currentPlayerIndex = playerIds.indexOf(state.game.activePlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextPlayerIndex];
    
    // (rest of the passTurn logic is the same...)
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
        landPlayedThisTurn: false, // <-- MODIFIED: Reset for the new turn
      },
      players: {
        ...state.players,
        [currentPlayerId]: { ...state.players[currentPlayerId], manaPool: resetPlayerMana },
        [nextPlayerId]: { ...nextPlayer, battlefield: untappedBattlefield, manaPool: resetPlayerMana }
      }
    };
  }),

  // (The tapCard and drawCard actions remain the same as before)
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
}));
