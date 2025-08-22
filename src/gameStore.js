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
    console.clear(); 
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
        const newBattlefield
