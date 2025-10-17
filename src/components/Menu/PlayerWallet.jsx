/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { translations } from '../../core/translations';
import { ElementIcon } from '../shared/ElementIcon';

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
    return (
        <div className="player-wallet">
            <div className="wallet-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9 16.5v-1c0-.83.67-1.5 1.5-1.5H12v-1h-1.5c-.83 0-1.5-.67-1.5-1.5v-1c0-.83.67-1.5 1.5-1.5H12V7h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1h1.5c.83 0 1.5.67 1.5 1.5v1c0 .83-.67 1.5-1.5 1.5H12v1H9z"/>
                </svg>
                <span>{waifuCoins}</span>
            </div>
            <div className="wallet-item">
                <span className="shard-item r">
                    <svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                    </svg>
                    {r_shards}
                </span>
                <span className="shard-item sr">
                    <svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                    </svg>
                    {sr_shards}
                </span>
                <span className="shard-item ssr">
                    <svg className="shard-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 8.5l10 13.5L22 8.5 12 2zm0 2.311L19.225 8.5 12 17.589 4.775 8.5 12 4.311z"/>
                    </svg>
                    {ssr_shards}
                </span>
            </div>
            <div className="wallet-item">
                <span className="key-item r" title={T.gallery?.keyLabelR ? T.gallery.keyLabelR(r_keys) : `${r_keys} R Keys`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                    </svg>
                    {r_keys}
                </span>
                <span className="key-item sr" title={T.gallery?.keyLabelSR ? T.gallery.keyLabelSR(sr_keys) : `${sr_keys} SR Keys`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                    </svg>
                    {sr_keys}
                </span>
                <span className="key-item ssr" title={T.gallery?.keyLabelSSR ? T.gallery.keyLabelSSR(ssr_keys) : `${ssr_keys} SSR Keys`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.5,4A5.5,5.5,0,1,0,20,9.5,5.5,5.5,0,0,0,14.5,4ZM11,9.5a3.5,3.5,0,1,1,3.5,3.5A3.5,3.5,0,0,1,11,9.5ZM10,12,2,20v2H4l8-8V12Zm2-4H2v2H12V8Z"/>
                    </svg>
                    {ssr_keys}
                </span>
            </div>
            <div className="wallet-item">
                <span className="essence-item fire" title={`${fire_essences} ${T.missions?.rewards?.fire_essences || 'Fire Essences'}`}>
                    <ElementIcon element="fire" />
                    {fire_essences}
                </span>
                <span className="essence-item water" title={`${water_essences} ${T.missions?.rewards?.water_essences || 'Water Essences'}`}>
                    <ElementIcon element="water" />
                    {water_essences}
                </span>
                <span className="essence-item air" title={`${air_essences} ${T.missions?.rewards?.air_essences || 'Air Essences'}`}>
                    <ElementIcon element="air" />
                    {air_essences}
                </span>
                <span className="essence-item earth" title={`${earth_essences} ${T.missions?.rewards?.earth_essences || 'Earth Essences'}`}>
                    <ElementIcon element="earth" />
                    {earth_essences}
                </span>
                <span className="essence-item transcendental" title={`${transcendental_essences} ${T.missions?.rewards?.transcendental_essences || 'Transcendental Essences'}`}>
                    <svg className="essence-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 8.5L12 22L22 8.5L12 2Z" />
                    </svg>
                    {transcendental_essences}
                </span>
            </div>
        </div>
    );
};