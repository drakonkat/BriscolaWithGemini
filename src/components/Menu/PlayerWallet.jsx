/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { translations } from '../../core/translations';
import { ElementIcon } from '../shared/ElementIcon';
import styles from './PlayerWallet.module.css';

export const PlayerWallet = ({
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
    translations: T = translations[language]
}) => {
    const [expanded, setExpanded] = useState(() => {
        const saved = localStorage.getItem('walletExpandedState');
        return saved ? JSON.parse(saved) : {
            currency: true,
            shards: true,
            keys: true,
            essences: true
        };
    });

    useEffect(() => {
        localStorage.setItem('walletExpandedState', JSON.stringify(expanded));
    }, [expanded]);

    const groups = [
        {
            key: 'currency',
            name: T.wallet?.currency || 'Currency',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/>
                </svg>
            ),
            currencies: [
                {
                    name: T.missions?.rewards?.waifuCoins || 'Waifu Coins',
                    amount: waifuCoins,
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/>
                        </svg>
                    ),
                    className: ''
                }
            ]
        },
        {
            key: 'shards',
            name: T.wallet?.shards || 'Shards',
            icon: (
                <svg className={styles.sectionIconSvg} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                </svg>
            ),
            currencies: [
                {
                    name: T.missions?.rewards?.r_shards || 'R Shards',
                    amount: r_shards,
                    icon: (
                        <svg className={styles.shardIconSvg} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                        </svg>
                    ),
                    className: `${styles.shardItem} ${styles.r}`
                },
                {
                    name: T.missions?.rewards?.sr_shards || 'SR Shards',
                    amount: sr_shards,
                    icon: (
                        <svg className={styles.shardIconSvg} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                        </svg>
                    ),
                    className: `${styles.shardItem} ${styles.sr}`
                },
                {
                    name: T.missions?.rewards?.ssr_shards || 'SSR Shards',
                    amount: ssr_shards,
                    icon: (
                        <svg className={styles.shardIconSvg} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                        </svg>
                    ),
                    className: `${styles.shardItem} ${styles.ssr}`
                }
            ]
        },
        {
            key: 'keys',
            name: T.wallet?.keys || 'Keys',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                </svg>
            ),
            currencies: [
                {
                    name: T.gallery?.keyNameR || 'R Key',
                    amount: r_keys,
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                        </svg>
                    ),
                    className: `${styles.keyItem} ${styles.r}`
                },
                {
                    name: T.gallery?.keyNameSR || 'SR Key',
                    amount: sr_keys,
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                        </svg>
                    ),
                    className: `${styles.keyItem} ${styles.sr}`
                },
                {
                    name: T.gallery?.keyNameSSR || 'SSR Key',
                    amount: ssr_keys,
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                        </svg>
                    ),
                    className: `${styles.keyItem} ${styles.ssr}`
                }
            ]
        },
        {
            key: 'essences',
            name: T.wallet?.essences || 'Essences',
            icon: (
                <svg className={styles.sectionIconSvg} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" />
                </svg>
            ),
            currencies: [
                {
                    name: T.missions?.rewards?.fire_essences || 'Fire Essences',
                    amount: fire_essences,
                    icon: <ElementIcon element="fire" />,
                    className: `${styles.essenceItem} ${styles.fire}`
                },
                {
                    name: T.missions?.rewards?.water_essences || 'Water Essences',
                    amount: water_essences,
                    icon: <ElementIcon element="water" />,
                    className: `${styles.essenceItem} ${styles.water}`
                },
                {
                    name: T.missions?.rewards?.air_essences || 'Air Essences',
                    amount: air_essences,
                    icon: <ElementIcon element="air" />,
                    className: `${styles.essenceItem} ${styles.air}`
                },
                {
                    name: T.missions?.rewards?.earth_essences || 'Earth Essences',
                    amount: earth_essences,
                    icon: <ElementIcon element="earth" />,
                    className: `${styles.essenceItem} ${styles.earth}`
                },
                {
                    name: T.missions?.rewards?.transcendental_essences || 'Transcendental Essences',
                    amount: transcendental_essences,
                    icon: (
                        <svg className={styles.essenceIconSvg} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" />
                        </svg>
                    ),
                    className: `${styles.essenceItem} ${styles.transcendental}`
                }
            ]
        }
    ];

    const handleToggle = (key, e) => {
        e.preventDefault();
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleExpandAll = () => {
        setExpanded({
            currency: true,
            shards: true,
            keys: true,
            essences: true
        });
    };

    const handleCollapseAll = () => {
        setExpanded({
            currency: false,
            shards: false,
            keys: false,
            essences: false
        });
    };

    const getTotalForSection = (group) => {
        return group.currencies.reduce((total, currency) => total + currency.amount, 0);
    };

    return (
        <div className={styles.playerWallet}>
            <div className={styles.globalControls}>
                <button
                    className={styles.globalButton}
                    onClick={handleExpandAll}
                    aria-label="Expand all sections"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 14l5-5 5 5z"/>
                    </svg>
                    Expand All
                </button>
                <button
                    className={styles.globalButton}
                    onClick={handleCollapseAll}
                    aria-label="Collapse all sections"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M7 10l5 5 5-5z"/>
                    </svg>
                    {T.wallet?.collapseAll || 'Collapse All'}
                </button>
            </div>
            {groups.map((group) => {
                const total = getTotalForSection(group);
                const hasResources = total > 0;
                return (
                    <details
                        key={group.key}
                        className={styles.walletSection}
                        open={expanded[group.key]}
                        aria-label={group.name}
                    >
                        <summary className={styles.sectionHeader} onClick={(e) => handleToggle(group.key, e)}>
                            <div className={styles.sectionHeaderContent}>
                                {group.icon}
                                <span className={styles.sectionTitle}>{group.name}</span>
                                {hasResources && (
                                    <span className={styles.sectionBadge} aria-label={`${total} total items`}>
                                        {total}
                                    </span>
                                )}
                            </div>
                        </summary>
                        <div className={styles.walletContent}>
                            {group.currencies.map((currency, index) => (
                                <div key={index} className={styles.walletItem}>

                                    {currency.icon}
                                    <span className={currency.className} title={`${currency.amount} ${currency.name}`}>
                                        {currency.amount}
                                    </span>
                                    <span className={styles.currencyName}>{currency.name}</span>
                                </div>
                            ))}
                        </div>
                    </details>
                );
            })}
        </div>
    );
};