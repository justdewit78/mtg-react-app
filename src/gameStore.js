import create from 'zustand';

// src/gameStore.js


const createCardPool = () => {
  let pool = [];
  for (let i = 0; i < 20; i++) {
    pool.push({ id: `island${i}`, name: 'Island', type: 'Land', tapped: false, mana: 'U' });
    pool.push({ id: `forest${i}`, name: 'Forest', type: 'Land', tapped: false, mana: 'G' });
  }
  for (let i = 0; i < 10; i++) {
    // ADDED rulesText and a more descriptive cost
    pool.push({
      id: `grizzlyBears${i}`,
      name: 'Grizzly Bears',
      type: 'Creature',
      tapped: false,
      cost: ['1', 'G'],
      rulesText: '' // Vanilla creatures have no rules text
    });
    // ADDED rulesText
    pool.push({
      id: `merfolkLooter${i}`,
      name: 'Merfolk Looter',
      type: 'Creature',
      tapped: false,
      cost: ['1', 'U'],
      rulesText: '{T}: Draw a card, then discard a card.'
    });
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
      landPlayedThisTurn: false,
    },
    players: players,
  };
};

export const useGameStore = create((set, get) => ({
  ...createInitialState(),

  handleLandClick: (playerId, cardId) => set((state) => {
    if (state.game.activePlayerId !== playerId) return state;

    const player = state.players[playerId];
    const card = player.battlefield.find(c => c.id === cardId);

    if (!card || card.type !== 'Land') return state;

    const newManaPool = { ...player.manaPool };
    let newBattlefield;

    if (card.tapped) {
      if (newManaPool[card.mana] > 0) {
        newManaPool[card.mana]--;
        newBattlefield = player.battlefield.map(c =>
          c.id === cardId ? { ...c, tapped: false } : c
        );
      } else {
        return state;
      }
    } else {
      newManaPool[card.mana]++;
      newBattlefield = player.battlefield.map(c =>
        c.id === cardId ? { ...c, tapped: true } : c
      );
    }

    return {
      players: {
        ...state.players,
        [playerId]: { ...player, battlefield: newBattlefield, manaPool: newManaPool },
      },
    };
  }),

  playLandFromHand: (playerId, cardId) => set((state) => {
    if (state.game.activePlayerId !== playerId) return state;
    if (state.game.landPlayedThisTurn) {
      alert("You've already played a land this turn.");
      return state;
    }
    const player = state.players[playerId];
    const cardToPlay = player.hand.find(c => c.id === cardId);
    if (!cardToPlay || cardToPlay.type !== 'Land') return state;
    const newHand = player.hand.filter(c => c.id !== cardId);
    const newBattlefield = [...player.battlefield, { ...cardToPlay, tapped: false }];
    return {
      game: {
        ...state.game,
        landPlayedThisTurn: true,
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
        landPlayedThisTurn: false,
      },
      players: {
        ...state.players,
        [currentPlayerId]: { ...state.players[currentPlayerId], manaPool: resetPlayerMana },
        [nextPlayerId]: { ...nextPlayer, battlefield: untappedBattlefield, manaPool: resetPlayerMana }
      }
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
