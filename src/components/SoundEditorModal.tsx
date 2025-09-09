/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect } from 'react';
import { translations } from '../core/translations';
// FIX: OscillatorType is defined in core/types, not exported from soundManager.
// FIX: Added missing 'updateSoundSettings' import.
import { defaultSoundSettings, startMusic, stopMusic, updateSoundSettings, type SoundSettings, DRUM_TYPES } from '../core/soundManager';
import type { Language, OscillatorType, DrumType } from '../core/types';

interface SoundEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SoundSettings;
    onSettingsChange: (value: SoundSettings | ((val: SoundSettings) => SoundSettings)) => void;
    language: Language;
}

const ControlSlider = ({ label, value, min, max, step, onChange, displayValue }: { label: string, value: number, min: number, max: number, step: number, onChange: (newValue: number) => void, displayValue?: string }) => (
    <div className="sound-editor-control">
        <label htmlFor={label}>{label}: <span>{displayValue ?? value}</span></label>
        <input
            id={label}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
    </div>
);

export const SoundEditorModal = ({ isOpen, onClose, settings, onSettingsChange, language }: SoundEditorModalProps) => {
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (!isOpen && isPlaying) {
            stopMusic();
            setIsPlaying(false);
        }
    }, [isOpen, isPlaying]);

    useEffect(() => {
        if (isPlaying) {
            updateSoundSettings(settings);
        }
    }, [settings, isPlaying]);


    if (!isOpen) return null;

    const T = translations[language];

    const handleSettingChange = (key: keyof SoundSettings, value: any) => {
        onSettingsChange(prev => ({ ...prev, [key]: value }));
    };

    const handleDrumToggle = (drum: DrumType, step: number) => {
        onSettingsChange(prev => {
            const newPattern = { ...prev.drumPattern };
            newPattern[drum] = [...newPattern[drum]]; // Create new array for immutability
            newPattern[drum][step] = !newPattern[drum][step];
            return { ...prev, drumPattern: newPattern };
        });
    };

    const handleReset = () => {
        onSettingsChange(defaultSoundSettings);
    };

    const handleTogglePlay = () => {
        if (isPlaying) {
            stopMusic();
            setIsPlaying(false);
        } else {
            startMusic(settings);
            setIsPlaying(true);
        }
    };

    return (
        <div className="game-over-overlay" onClick={onClose}>
            <div className="sound-editor-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label={T.close}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
                <h2>{T.soundEditorTitle}</h2>
                <div className="sound-editor-content">
                    <div className="sound-editor-controls">
                        <ControlSlider label={T.tempo} value={settings.tempo} min={10} max={360} step={1} onChange={(v) => handleSettingChange('tempo', v)} displayValue={`${settings.tempo} BPM`} />
                        
                        <div className="sound-editor-control">
                            <label htmlFor="osc-type">{T.oscillatorType}</label>
                            <select id="osc-type" value={settings.oscillatorType} onChange={(e) => handleSettingChange('oscillatorType', e.target.value as OscillatorType)}>
                                <option value="sawtooth">{T.oscSawtooth}</option>
                                <option value="sine">{T.oscSine}</option>
                                <option value="square">{T.oscSquare}</option>
                                <option value="triangle">{T.oscTriangle}</option>
                            </select>
                        </div>

                        <ControlSlider label={T.filterFrequency} value={settings.filterCutoff} min={100} max={8000} step={50} onChange={(v) => handleSettingChange('filterCutoff', v)} displayValue={`${settings.filterCutoff} Hz`} />
                        <ControlSlider label={T.lfoFrequency} value={settings.lfoFrequency} min={0.05} max={1} step={0.01} onChange={(v) => handleSettingChange('lfoFrequency', v)} displayValue={`${settings.lfoFrequency.toFixed(2)} Hz`} />
                        <ControlSlider label={T.lfoDepth} value={settings.lfoDepth} min={0} max={4000} step={100} onChange={(v) => handleSettingChange('lfoDepth', v)} />
                        <ControlSlider label={T.reverbAmount} value={settings.reverbWetness} min={0} max={1} step={0.05} onChange={(v) => handleSettingChange('reverbWetness', v)} displayValue={`${Math.round(settings.reverbWetness * 100)}%`} />
                    </div>

                    <div className="sound-editor-drums">
                        <h3>{T.drums}</h3>
                        <div className="drum-sequencer">
                            {DRUM_TYPES.map(drum => (
                                <div key={drum} className="drum-row">
                                    {/* FIX: Correctly access translation string for drum type. */}
                                    <span className="drum-label">{T[drum]}</span>
                                    <div className="drum-steps">
                                        {[...Array(16)].map((_, step) => (
                                            <button
                                                key={step}
                                                className={`step-button ${settings.drumPattern[drum][step] ? 'active' : ''} beat-${step % 4 === 0 ? 'strong' : 'weak'}`}
                                                onClick={() => handleDrumToggle(drum, step)}
                                                aria-label={`${T[drum]} step ${step + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button onClick={handleTogglePlay} className="button-primary">
                        {isPlaying ? T.stop : T.play}
                    </button>
                    <button onClick={handleReset} className="button-primary">{T.resetToDefaults}</button>
                    <button onClick={onClose} className="button-secondary">{T.close}</button>
                </div>
            </div>
        </div>
    );
};