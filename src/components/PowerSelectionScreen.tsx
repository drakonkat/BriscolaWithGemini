/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
// FIX: Import React to use React.Fragment.
import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { POWER_UP_DEFINITIONS } from '../core/roguelikePowers';
import type { RoguelikePowerUp, RoguelikePowerUpId } from '../core/types';

const PowerCard = ({ title, description, onClick, isUpgrade = false, lang }: { title: string, description: string, onClick: () => void, isUpgrade?: boolean, lang: 'it' | 'en' }) => {
    return (
        // FIX: Corrected translation path
        <div className={`power-card ${isUpgrade ? 'upgrade' : ''}`} onClick={onClick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()} role="button" tabIndex={0}>
            <h3>{title}</h3>
            <p>{description}</p>
            {isUpgrade && <div className="upgrade-banner">{translations[lang].roguelike.powers.upgrade}</div>}
        </div>
    );
};

export const PowerSelectionScreen = observer(() => {
    const { gameStateStore, gameSettingsStore, uiStore } = useStores();
    // FIX: `powerSelectionOptions` is now a valid property on GameStateStore.
    const { powerSelectionOptions } = gameStateStore;
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
                {/* FIX: Corrected translation keys */}
                <h1>{upgrade ? TR.chooseYourPath : TR.chooseYourPower}</h1>
                {/* FIX: Corrected translation keys */}
                <p>{upgrade ? TR.levelUpMessage(gameStateStore.roguelikeState.currentLevel) : TR.initialPowerMessage}</p>

                <div className="power-cards-container">
                    {newPowers.map(powerId => {
                        const def = POWER_UP_DEFINITIONS[powerId];
                        return (
                            // FIX: Wrap PowerCard in React.Fragment to solve key prop type error.
                            <React.Fragment key={powerId}>
                                <PowerCard 
                                    title={def.name(language)}
                                    description={def.description(language, 1)}
                                    // FIX: `selectPowerUp` is now a valid method on GameStateStore.
                                    onClick={() => gameStateStore.selectPowerUp(powerId, false)}
                                    lang={language}
                                />
                            </React.Fragment>
                        );
                    })}
                    {upgrade && (
                        <PowerCard 
                            title={POWER_UP_DEFINITIONS[upgrade.id].name(language)}
                            description={POWER_UP_DEFINITIONS[upgrade.id].description(language, upgrade.level + 1)}
                            // FIX: `selectPowerUp` is now a valid method on GameStateStore.
                            onClick={() => gameStateStore.selectPowerUp(upgrade.id, true)}
                            isUpgrade
                            lang={language}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});