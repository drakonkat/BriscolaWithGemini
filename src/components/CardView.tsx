/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { getCardId, getCardImagePath } from '../core/utils';
import type { Card, Language } from '../core/types';
import { translations } from '../core/translations';

export const CardView = ({ card, isFaceDown, onClick, isPlayable, lang }: { card: Card, isFaceDown?: boolean, onClick?: () => void, isPlayable?: boolean, lang: Language }) => {
  const T = translations[lang];

  if (isFaceDown) {
    // Render the card back using an <img> tag to ensure the full image is visible.
    return (
        <div className="card card-back" aria-label={T.cardBack}>
            <img src="https://s3.tebi.io/waifubriscola/background/cardback1.png" alt={T.cardBack} />
        </div>
    );
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
