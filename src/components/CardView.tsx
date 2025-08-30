/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { getCardId, getCardImagePath } from '../core/utils';
import type { Card, Language, Element } from '../core/types';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { ElementIcon } from './ElementIcon';

// FIX: Added `className` to the component's props to allow for custom styling from parent components.
export const CardView = ({ card, isFaceDown, onClick, isPlayable, lang, className, element }: { card: Card, isFaceDown?: boolean, onClick?: () => void, isPlayable?: boolean, lang: Language, className?: string, element?: Element }) => {
  const T = translations[lang];

  if (isFaceDown) {
    // Render the card back using an <img> tag to ensure the full image is visible.
    return (
        <div className="card card-back" aria-label={T.cardBack}>
            <CachedImage imageUrl="https://s3.tebi.io/waifubriscola/background/cardback1.png" alt={T.cardBack} />
        </div>
    );
  }

  const cardId = getCardId(card, lang);
  const imagePath = getCardImagePath(card);

  return (
    <div
      className={`card ${isPlayable ? 'playable' : ''} ${className || ''}`}
      onClick={onClick}
      role="button"
      aria-label={cardId}
      tabIndex={isPlayable ? 0 : -1}
    >
      <CachedImage imageUrl={imagePath} alt={cardId} />
      {element && !isFaceDown && (
          <div className="card-element-icon" title={T[element]}>
              <ElementIcon element={element} />
          </div>
      )}
    </div>
  );
};