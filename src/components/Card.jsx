/** @jsxRuntime classic */
/** @jsx React.createElement */
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

      {/* NEW: Containers for cost and rules text - initially hidden */}
      {card.cost && (
        <div className="card-info">
          <div className="card-cost">Cost: {card.cost.join('')}</div>
          <div className="card-rules">{card.rulesText || <em></em>}</div>
        </div>
      )}
    </div>
  );
};
