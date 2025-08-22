// src/components/Card.jsx
import React from 'react';

// Modified to accept both onClick and onDoubleClick props
export const Card = ({ card, onClick, onDoubleClick }) => {
  const cardClasses = `card ${card.tapped ? 'tapped' : ''}`;

  return (
    <div 
      className={cardClasses} 
      onClick={onClick} 
      onDoubleClick={onDoubleClick}
    >
      <div className="card-name">{card.name}</div>
      <div className="card-type">{card.type}</div>
    </div>
  );
};
