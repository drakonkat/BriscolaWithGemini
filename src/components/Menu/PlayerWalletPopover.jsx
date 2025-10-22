/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { PlayerWallet } from './PlayerWallet';
import styles from './PlayerWalletPopover.module.css';
import {translations} from "@/src/core/translations.js";

export const PlayerWalletPopover = ({
    waifuCoins,
    r_shards,
    sr_shards,
    ssr_shards,
    r_keys,
    sr_keys,
    ssr_keys,
    fire_essences,
    water_essences,
    air_essences,
    earth_essences,
    transcendental_essences,
    language,
    translations: T = translations
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    const fabRef = useRef(null);

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen &&
                popoverRef.current &&
                !popoverRef.current.contains(event.target) &&
                fabRef.current &&
                !fabRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const togglePopover = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Dark overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* FAB Button */}
            <button
                ref={fabRef}
                className={styles.fab}
                onClick={togglePopover}
                aria-label={T.wallet?.walletButton || 'Open Wallet'}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                >
                    <path d="M21 7h-3V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1H3a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM8 6h8v1H8V6zm12 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h8v1a1 1 0 0 0 2 0V9h2v10z"/>
                </svg>
            </button>

            {/* Popover */}
            {isOpen && (
                <div
                    ref={popoverRef}
                    className={styles.popover}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="wallet-title"
                >
                    <div className={styles.popoverHeader}>
                        <h2 id="wallet-title" className={styles.popoverTitle}>
                            {T.wallet?.title || 'Player Wallet'}
                        </h2>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                            aria-label={T.common?.close || 'Close'}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    </div>
                    <div className={styles.popoverContent}>
                        <PlayerWallet
                            waifuCoins={waifuCoins}
                            r_shards={r_shards}
                            sr_shards={sr_shards}
                            ssr_shards={ssr_shards}
                            r_keys={r_keys}
                            sr_keys={sr_keys}
                            ssr_keys={ssr_keys}
                            fire_essences={fire_essences}
                            water_essences={water_essences}
                            air_essences={air_essences}
                            earth_essences={earth_essences}
                            transcendental_essences={transcendental_essences}
                            language={language}
                            translations={T}
                        />
                    </div>
                </div>
            )}
        </>
    );
};