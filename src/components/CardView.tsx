/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { getCardId, getCardImagePath } from '../core/utils';
import type { Card, Language } from '../core/types';

export const CardView = ({ card, isFaceDown, onClick, isPlayable, lang }: { card: Card, isFaceDown?: boolean, onClick?: () => void, isPlayable?: boolean, lang: Language }) => {
  if (isFaceDown) {
    // Render the card back.
    return <div className="card card-back" aria-label="Carta coperta"></div>;
  }

  const cardId = getCardId(card, lang);
  const imagePath = getCardImagePath(card);

  return (
    <div
      className={`card ${isPlayable ? 'playable' : ''}`}
      onClick={onClick}
      role="button"
      aria-label={cardId}
      tabIndex={isPlayable ? 0 : -1}
    >
      <img src={imagePath} alt={cardId} />
    </div>
  );
};
