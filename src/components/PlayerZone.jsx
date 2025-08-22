// src/components/PlayerZone.jsx
import React from 'react';
import { useGameStore } from '../gameStore';
import { Card } from './Card';

// Generic component to display any player's full area
const PlayerArea = ({ playerId, isOpponent = false }) => {
  const player = useGameStore(state => state.players[playerId]);
  const tapCard = useGameStore((state) => state.tapCard);
  const activePlayerId = useGameStore(state => state.game.activePlayerId);

  // If player data hasn't loaded yet, show a placeholder
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
          <Card key={card.id} card={card} onCardClick={() => tapCard(player.id, card.id)} />
        ))}
      </div>
      
      {!isOpponent && (
        <>
          <h5>Hand:</h5>
          <div className="hand">
            {player.hand.map((card) => (
              <Card key={card.id} card={card} onCardClick={() => alert(`Playing ${card.name}`)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main player's zone (shows hand)
export const PlayerZone = ({ playerId }) => {
  return <PlayerArea playerId={playerId} />;
};

// Opponent's zone (hides hand)
export const OpponentZone = ({ playerId }) => {
  return <PlayerArea playerId={playerId} isOpponent />;
};
