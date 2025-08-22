// src/components/ActionPanel.jsx
import React from 'react';
import { useGameStore } from '../gameStore';

export const ActionPanel = () => {
  const { game, drawCard, passTurn } = useGameStore(state => ({
    game: state.game,
    drawCard: state.drawCard,
    passTurn: state.passTurn,
  }));
  const isMyTurn = game.activePlayerId === 'player1';
  return (
    <div className="action-panel game-zone">
      <h3>Actions</h3>
      <button onClick={() => drawCard('player1')} disabled={!isMyTurn}>
        Draw Card
      </button>
      <br /><br />
      <button onClick={passTurn} disabled={!isMyTurn}>
        Pass Turn
      </button>
    </div>
  );
};
