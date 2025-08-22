// src/components/Card.jsx
import React from 'react';

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

      {/* NEW: Tooltip for non-land cards */}
      {card.cost && (
        <div className="card-tooltip">
          <div className="tooltip-header">
            <span>{card.name}</span>
            <span>Cost: {card.cost.join('')}</span>
          </div>
          <div className="tooltip-body">
            {card.rulesText ? card.rulesText : <em>(No rules text)</em>}
          </div>
        </div>
      )}
    </div>
  );
};
