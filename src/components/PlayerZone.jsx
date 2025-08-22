// src/components/PlayerZone.jsx
import React from 'react';
import { useGameStore } from '../gameStore';
import { Card } from './Card';

const PlayerArea = ({ playerId, isOpponent = false }) => {
  // Get all players, game state, and actions from the store
  const { players, game, handleLandClick, playLandFromHand } = useGameStore(state => ({
    players: state.players,
    game: state.game,
    handleLandClick: state.handleLandClick, // <-- CHANGED from tapCard
    playLandFromHand: state.playLandFromHand,
  }));

  const player = players[playerId];
  const activePlayerId = game.activePlayerId;

  if (!player) return <div>Loading...</div>;

  const manaPoolString = Object.entries(player.manaPool)
    .filter(([, count]) => count > 0)
    .map(([color, count]) => `${color}:${count}`)
    .join(' ');

  const areaClass = isOpponent ? 'opponent-zone game-zone' : 'player-zone game-zone';
  const header = isOpponent ? `Opponent (${player.id})` : `You (${player.id})`;

  return (
    <div className={areaClass} style={{ borderColor: activePlayerId === player.id ? '#61dafb' : '#444' }}>
      <h4>{header} | Life: {player.life} | Lib: {player.library.length}</h4>
      <div><strong>Mana:</strong> {manaPoolString || 'None'}</div>

      <h5>Battlefield:</h5>
      <div className="battlefield">
        {player.battlefield.map((card) => (
          <Card 
            key={card.id} 
            card={card} 
            // This now calls our new, smarter action
            onClick={() => handleLandClick(player.id, card.id)} 
          />
        ))}
      </div>
      
      {!isOpponent && (
        <>
          <h5>Hand:</h5>
          <div className="hand">
            {player.hand.map((card) => (
              <Card 
                key={card.id} 
                card={card} 
                onDoubleClick={() => playLandFromHand(player.id, card.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const PlayerZone = ({ playerId }) => {
  return <PlayerArea playerId={playerId} />;
};

export const OpponentZone = ({ playerId }) => {
  return <PlayerArea playerId={playerId} isOpponent />;
};
