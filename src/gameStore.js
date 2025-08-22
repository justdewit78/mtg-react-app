import create from 'zustand';

const createCardPool = () => {
  let pool = [];
  for (let i = 0; i < 20; i++) {
    pool.push({ id: `island${i}`, name: 'Island', type: 'Land', tapped: false, mana: 'U' });
    pool.push({ id: `forest${i}`, name: 'Forest', type: 'Land', tapped: false, mana: 'G' });
  }
  for (let i = 0; i < 10; i++) {
    pool.push({ id: `grizzlyBears${i}`, name: 'Grizzly Bears', type: 'Creature', tapped: false, cost: ['1', 'G'], rulesText: '' });
    pool.push({ id: `merfolkLooter${i}`, name: 'Merfolk Looter', type: 'Creature', tapped: false, cost: ['1', 'U'], rulesText: '{T}: Draw a card, then discard a card.' });
    // NEW: Added a 1-mana creature for easier testing
    pool.push({
      id: `llanowarElves${i}`,
      name: 'Llanowar Elves',
      type: 'Creature',
      tapped: false,
      cost: ['G'],
      rulesText: '{T}: Add {G}.'
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

  playCardFromHand: (playerId, cardId) => set((state) => {
    console.clear(); // Clears console for a clean log
    console.log("--- Action: playCardFromHand ---");
    const player = state.players[playerId];
    const card = player.hand.find(c => c.id === cardId);

    if (!card || state.game.activePlayerId !== playerId) {
        console.error("Action aborted: Not active player or card not found.");
        return state;
    }
    
    console.log("Attempting to play card:", card);

    if (card.type === 'Land') {
        console.log("Logic branch: Playing a Land.");
        if (state.game.landPlayedThisTurn) {
            console.warn("FAIL: Land already played this turn.");
            alert("You've already played a land this turn.");
            return state;
        }
        console.log("SUCCESS: Playing land.");
        const newHand = player.hand.filter(c => c.id !== cardId);
        const newBattlefield = [...player.battlefield, { ...card, tapped: false }];
        return {
            game: { ...state.game, landPlayedThisTurn: true },
            players: { ...state.players, [playerId]: { ...player, hand: newHand, battlefield: newBattlefield } },
        };
    }

    console.log("Logic branch: Playing a Spell.");
    const { manaPool } = player;
    console.log("Player's current Mana Pool:", manaPool);

    const cost = { W: 0, U: 0, B: 0, R: 0, G: 0, generic: 0 };
    card.cost.forEach(c => {
        if (['W', 'U', 'B', 'R', 'G'].includes(c)) cost[c]++;
        else cost.generic += parseInt(c, 10) || 0;
    });
    console.log("Calculated Cost of Spell:", cost);

    let canPayColors = (manaPool.W >= cost.W) && (manaPool.U >= cost.U) && (manaPool.B >= cost.B) && (manaPool.R >= cost.R) && (manaPool.G >= cost.G);
    console.log("Can pay colored mana? ->", canPayColors);
    if (!canPayColors) {
        console.warn("FAIL: Cannot pay colored cost.");
        alert("Insufficient mana.");
        return state;
    }

    const remainingManaForGeneric = (manaPool.W - cost.W) + (manaPool.U - cost.U) + (manaPool.B - cost.B) + (manaPool.R - cost.R) + (manaPool.G - cost.G);
    console.log(`Mana left for generic cost: ${remainingManaForGeneric}. Generic cost needed: ${cost.generic}`);
    if (remainingManaForGeneric < cost.generic) {
        console.warn("FAIL: Cannot pay generic cost.");
        alert("Insufficient mana.");
        return state;
    }

    console.log("SUCCESS: Mana cost can be paid. Processing payment...");
    
    const newManaPool = { ...manaPool };
    newManaPool.W -= cost.W;
    newManaPool.U -= cost.U;
    newManaPool.B -= cost.B;
    newManaPool.R -= cost.R;
    newManaPool.G -= cost.G;

    let genericCostLeft = cost.generic;
    for (const color of ['W', 'U', 'B', 'R', 'G', 'C']) {
      const spend = Math.min(genericCostLeft, newManaPool[color]);
      newManaPool[color] -= spend;
      genericCostLeft -= spend;
    }
    
    const newHand = player.hand.filter(c => c.id !== cardId);
    const newCard = { ...card, tapped: false, summoningSickness: true };
    const newBattlefield = [...player.battlefield, newCard];
    
    console.log("Card successfully played. New state being set.");

    return {
      players: {
        ...state.players,
        [playerId]: { ...player, hand: newHand, battlefield: newBattlefield, manaPool: newManaPool },
      },
    };
  }),

  // (The rest of the file remains the same)
  passTurn: () => set((state) => {
    const playerIds = Object.keys(state.players);
    const currentPlayerIndex = playerIds.indexOf(state.game.activePlayerId);
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length;
    const nextPlayerId = playerIds[nextPlayerIndex];
    const currentPlayerId = state.game.activePlayerId;
    const nextPlayer = state.players[nextPlayerId];
    const updatedBattlefield = nextPlayer.battlefield.map(card => ({
      ...card,
      tapped: false,
      summoningSickness: false,
    }));
    const resetPlayerMana = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
    return {
      game: {
        ...


