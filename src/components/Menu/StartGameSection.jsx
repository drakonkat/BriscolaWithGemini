/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * StartGameSection - Microcomponent for game start buttons
 *
 * @param {Object} props
 * @param {boolean} props.hasSavedGame - Whether there's a saved game to resume
 * @param {string} props.gameplayMode - Current gameplay mode (for dungeon mode handling)
 * @param {Function} props.onResumeGame - Handler for resume game button
 * @param {Function} props.onStartGame - Handler for start game button
 * @param {Object} props.translations - Translation object (T)
 */
export const StartGameSection = ({
    hasSavedGame,
    gameplayMode,
    onResumeGame,
    onStartGame,
    translations
}) => {
    return (
        <div className="start-game-container" data-tutorial-id="start-game">
            {hasSavedGame && (
                <button
                    className="start-game-button"
                    onClick={onResumeGame}
                    aria-label={translations.resumeGameAria || translations.resumeGame}
                >
                    {translations.resumeGame}
                </button>
            )}
            <button
                className="start-game-button"
                onClick={onStartGame}
                disabled={gameplayMode === 'dungeon'}
                aria-label={translations.startGameAria || translations.startGame}
                aria-describedby={gameplayMode === 'dungeon' ? 'dungeon-mode-disabled' : undefined}
            >
                {translations.startGame}
            </button>

            {/* Screen reader only text for disabled state explanation */}
            {gameplayMode === 'dungeon' && (
                <div id="dungeon-mode-disabled" className="sr-only">
                    {translations.dungeonModeDisabled || 'Start game is disabled in dungeon mode. Select a different game mode to start playing.'}
                </div>
            )}
        </div>
    );
};