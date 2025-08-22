// src/App.jsx
import React from 'react';
import { useGameStore } from './gameStore';
import { PlayerZone, OpponentZone } from './components/PlayerZone';
import { ActionPanel } from './components/ActionPanel';
import './App.css';

function App() {
  const { game, players } = useGameStore(state => ({ game: state.game, players: state.players }));
  
  // Your player is always player1 for this prototype
  const selfId = 'player1';
  
  // Find all other player IDs to render as opponents
  const opponentIds = Object.keys(players).filter(id => id !== selfId);

  return (
    <div className="game-board">
      {/* This new container will hold all opponents */}
      <div className="opponents-container">
        {opponentIds.map(id => (
          <OpponentZone key={id} playerId={id} />
        ))}
      </div>
      
      <div className="center-zone game-zone">
        <h2>Turn {game.turnNumber}</h2>
        <p>Active Player: <strong>{game.activePlayerId}</strong></p>
      </div>

      <PlayerZone playerId={selfId} />

      <div className="sidebar">
        <ActionPanel />
      </div>
    </div>
  );
}

export default App;
