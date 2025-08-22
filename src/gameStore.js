// src/gameStore.js
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

  // REPLACED playLandFromHand with the more generic playCardFromHand
  playCardFromHand: (playerId, cardId) => set((state) => {
    const player = state.players[playerId];
    const card = player.hand.find(c => c.id === cardId);

    // Rule: Must be the active player and card must exist
    if (!card || state.game.activePlayerId !== playerId) return state;

    // --- CASE 1: Playing a Land ---
    if (card.type === 'Land') {
      if (state.game.landPlayedThisTurn) {
        alert("You've already played a land this turn.");
        return state;
      }
      const newHand = player.hand.filter(c => c.id !== cardId);
      const newBattlefield = [...player.battlefield, { ...card, tapped: false }];
      return {
        game: { ...state.game, landPlayedThisTurn: true },
        players: { ...state.players, [playerId]: { ...player, hand: newHand, battlefield: newBattlefield } },
      };
    }

    // --- CASE 2: Playing a Spell (Creature, etc.) ---
    const { manaPool } = player;
    const cost = { W: 0, U: 0, B: 0, R: 0, G: 0, generic: 0 };
    card.cost.forEach(c => {
      if (['W', 'U', 'B', 'R', 'G'].includes(c)) cost[c]++;
      else cost.generic += parseInt(c, 10) || 0;
    });

    // Check if player can pay the colored portion of the cost
    let canPayColors = (manaPool.W >= cost.W) && (manaPool.U >= cost.U) && (manaPool.B >= cost.B) && (manaPool.R >= cost.R) && (manaPool.G >= cost.G);
    if (!canPayColors) {
      alert("Insufficient mana.");
      return state;
    }

    // Check if player can pay the generic portion with remaining mana
    const remainingMana = (manaPool.W - cost.W) + (manaPool.U - cost.U) + (manaPool.B - cost.B) + (manaPool.R - cost.R) + (manaPool.G - cost.G);
    if (remainingMana < cost.generic) {
      alert("Insufficient mana.");
      return state;
    }

    // --- PAYMENT LOGIC ---
    const newManaPool = { ...manaPool };
    // 1. Pay colored costs
    newManaPool.W -= cost.W;
    newManaPool.U -= cost.U;
    newManaPool.B -= cost.B;
    newManaPool.R -= cost.R;
    newManaPool.G -= cost.G;

    // 2. Pay generic costs from remaining pool (simple version)
    let genericCostLeft = cost.generic;
    for (const color of ['W', 'U', 'B', 'R', 'G']) {
      const spend = Math.min(genericCostLeft, newManaPool[color]);
      newManaPool[color] -= spend;
      genericCostLeft -= spend;
    }

    // --- UPDATE STATE ---
    const newHand = player.hand.filter(c => c.id !== cardId);
    // Creatures enter with summoning sickness
    const newCard = { ...card, tapped: false, summoningSickness: true };
    const newBattlefield = [...player.battlefield, newCard];

    return {
      players: {
        ...state.
