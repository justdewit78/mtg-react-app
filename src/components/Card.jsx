// src/components/Card.jsx
import React from 'react';

export const Card = ({ card, onCardClick }) => {
  const cardClasses = `card ${card.tapped ? 'tapped' : ''}`;
  return (
    <div className={cardClasses} onClick={onCardClick}>
      <div className="card-name">{card.name}</div>
      <div className="card-type">{card.type}</div>
    </div>
  );
};
