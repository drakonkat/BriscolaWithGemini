/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PromoButtons microcomponent for displaying promotional buttons (Missions and Gallery)
 * @param {Object} props - Component props
 * @param {boolean} props.isNsfwEnabled - Whether NSFW features are enabled
 * @param {boolean} props.hasUnclaimedRewards - Whether there are unclaimed mission rewards
 * @param {Function} props.onMissionsClick - Handler for missions button click
 * @param {Function} props.onGalleryClick - Handler for gallery button click
 * @param {Object} props.translations - Translation object (T)
 */
export const PromoButtons = ({
    isNsfwEnabled,
    hasUnclaimedRewards,
    onMissionsClick,
    onGalleryClick,
    translations
}) => {
    return (
        <div className="promo-buttons-container" data-tutorial-id="gallery">
            <button className="missions-promo-button" onClick={onMissionsClick}>
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0V0z" fill="none"/>
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 9H7v-2h6v2zm3-4H7V5h9v2zm-1 8H7v-2h8v2z"/>
                </svg>
                <span>{translations.missions.title}</span>
                {hasUnclaimedRewards && <span className="notification-badge" />}
            </button>
            {isNsfwEnabled && (
                <button className="gallery-promo-button" onClick={onGalleryClick}>
                    {translations.gallery.promoButton}
                </button>
            )}
        </div>
    );
};