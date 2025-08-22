// src/App.jsx
import React from 'react';
import { useGameStore } from './gameStore';
import { PlayerZone, OpponentZone } from './components/PlayerZone';
import { ActionPanel } from './components/ActionPanel';
import './App.css';

function App() {
  const { turnNumber, activePlayerId } = useGameStore(state => state.game);

  return (
    <div className="game-board">
      <OpponentZone />
      <div className="center-zone game-zone">
        <h2>Turn {turnNumber}</h2>
        <p>Active Player: <strong>{activePlayerId}</strong></p>
      </div>
      <PlayerZone />
      <div className="sidebar">
        <ActionPanel />
        {/* The Game Log component would go here */}
      </div>
    </div>
  );
}

export default App;
