/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { getCardId, getCardImagePath, getImageUrl } from '../core/utils';
import type { Card, Language, CardDeckStyle } from '../core/types';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { ElementIcon } from './ElementIcon';

type ElementalEffectStatus = 'active' | 'inactive' | 'unset';

// FIX: Define props as a separate type and use React.FC to allow React to handle special props like `key` without type errors.
type CardViewProps = {
  card: Card;
  isFaceDown?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  lang: Language;
  className?: string;
  elementalEffectStatus?: ElementalEffectStatus;
  cardDeckStyle: CardDeckStyle;
  isDraggable?: boolean;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
};

export const CardView: React.FC<CardViewProps> = ({ card, isFaceDown, onClick, isPlayable, lang, className, elementalEffectStatus, cardDeckStyle, isDraggable, onMouseDown, onTouchStart }) => {
  const T = translations[lang];

  if (isFaceDown) {
    return (
        <div className="card card-back" aria-label={T.cardBack}>
            <CachedImage imageUrl={getImageUrl('/background/cardback1.png')} alt={T.cardBack} />
        </div>
    );
  }

  const cardId = getCardId(card, lang);
  const imagePath = getCardImagePath(card, cardDeckStyle);
  
  const stateClasses = [
    isPlayable ? 'playable' : '',
    isDraggable ? 'draggable' : '',
    card.element ? `element-${card.element}` : '',
    elementalEffectStatus && elementalEffectStatus !== 'unset' ? `effect-${elementalEffectStatus}` : '',
    card.isFortified ? 'fortified' : '',
    card.isBurned ? 'burned' : '',
    card.isCursed ? 'cursed' : '',
    className || ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={`card ${stateClasses}`}
      onClick={onClick}
      role="button"
      aria-label={cardId}
      tabIndex={isPlayable ? 0 : -1}
      draggable={false}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <CachedImage imageUrl={imagePath} alt={cardId} />
      {card.element && !isFaceDown && (
          <div className="card-element-icon">
              <ElementIcon element={card.element} />
          </div>
      )}
      {card.isBurned && (
        <div className="incinerate-particles">
            {[...Array(15)].map((_, i) => <div key={i} className="particle" />)}
        </div>
      )}
    </div>
  );
};