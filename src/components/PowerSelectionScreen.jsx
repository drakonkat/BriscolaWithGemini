/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores, RoguelikeModeStore } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';

const PowerCard = ({ title, description, onClick, isUpgrade = false, lang }) => {
    return (
        <div className={`power-card ${isUpgrade ? 'upgrade' : ''}`} onClick={onClick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()} role="button" tabIndex={0}>
            <h3>{title}</h3>
            <p>{description}</p>
            {isUpgrade && <div className="upgrade-banner">{translations[lang].roguelike.powers.upgrade}</div>}
        </div>
    );
};

export const PowerSelectionScreen = observer(() => {
    const { gameStateStore, gameSettingsStore, uiStore } = useStores();
    const roguelikeStore = gameStateStore;
    const { powerSelectionOptions, roguelikeState } = roguelikeStore;
    const { language } = gameSettingsStore;
    const { menuBackgroundUrl } = uiStore;

    const T = translations[language];
    const TR = T.roguelike;

    if (!powerSelectionOptions) return null;

    const { newPowers, upgrade } = powerSelectionOptions;

    return (
        <div className="power-selection-screen">
            <CachedImage imageUrl={menuBackgroundUrl} alt="Roguelike Power Selection Background" className="menu-background" />
            <div className="power-selection-content">
                <h1>{upgrade ? TR.chooseYourPath : TR.chooseYourPower}</h1>
                <p>{upgrade ? TR.levelUpMessage(roguelikeState.currentLevel) : TR.initialPowerMessage}</p>

                <div className="power-cards-container">
                    {newPowers.map(powerId => {
                        const def = POWER_UP_DEFINITIONS[powerId];
                        return (
                            <React.Fragment key={powerId}>
                                <PowerCard 
                                    title={def.name(language)}
                                    description={def.description(language, 1)}
                                    onClick={() => roguelikeStore.selectPowerUp(powerId, false)}
                                    lang={language}
                                />
                            </React.Fragment>
                        );
                    })}
                    {upgrade && (
                        <PowerCard 
                            title={POWER_UP_DEFINITIONS[upgrade.id].name(language)}
                            description={POWER_UP_DEFINITIONS[upgrade.id].description(language, upgrade.level + 1)}
                            onClick={() => roguelikeStore.selectPowerUp(upgrade.id, true)}
                            isUpgrade
                            lang={language}
                        />
                    )}
                </div>

                {!upgrade && (
                    <div className="power-selection-actions">
                        <button
                            className="button-secondary"
                            onClick={gameStateStore.goToMenu}
                        >
                            {T.backToMenu}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});