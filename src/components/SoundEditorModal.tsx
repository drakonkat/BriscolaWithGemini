
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState, useEffect } from 'react';
import { translations } from '../core/translations';
import { defaultSoundSettings, startMusic, stopMusic, updateSoundSettings, decadePresets, type SoundSettings, DRUM_TYPES } from '../core/soundManager';
import type { Language, OscillatorType, DrumType, Chord, Decade } from '../core/types';
import { CHORDS } from '../core/types';
import { useStores } from '../stores';

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
    const { gameSettingsStore } = useStores();
    const [isPlaying, setIsPlaying] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [selectedPresetKey, setSelectedPresetKey] = useState('');

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

    const handleChordChange = (step: number, chord: Chord) => {
        onSettingsChange(prev => {
            const newPattern = [...prev.chordPattern];
            newPattern[step] = chord;
            return { ...prev, chordPattern: newPattern };
        });
    };

    const handlePresetChange = (presetKey: string) => {
        setSelectedPresetKey(presetKey);
        const defaultPreset = decadePresets[presetKey as Decade];
        const customPreset = gameSettingsStore.customSoundPresets[presetKey];

        if (defaultPreset) {
            onSettingsChange(defaultPreset);
        } else if (customPreset) {
            onSettingsChange(customPreset);
        }
    };

    const handleReset = () => {
        onSettingsChange(defaultSoundSettings);
        setSelectedPresetKey('');
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
    
    const handleSavePreset = () => {
        if (!presetName.trim()) return;
        gameSettingsStore.saveCustomPreset(presetName, settings);
        setSelectedPresetKey(presetName); // auto-select new preset
        setPresetName(''); // clear input
    };

    const handleDeletePreset = () => {
        if (selectedPresetKey && gameSettingsStore.customSoundPresets[selectedPresetKey]) {
            const nameToDelete = selectedPresetKey;
            setSelectedPresetKey(''); // deselect
            handleReset(); // reset to default
            gameSettingsStore.deleteCustomPreset(nameToDelete);
        }
    };

    const isCustomPresetSelected = selectedPresetKey in gameSettingsStore.customSoundPresets;
    const allDefaultPresets = Object.keys(decadePresets) as Decade[];

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
                        {/* Preset Selector */}
                        <div className="sound-editor-control">
                            <label htmlFor="preset-select">{T.decadePresets}</label>
                            <div className="preset-select-wrapper">
                                <div className="select-wrapper">
                                    <select 
                                        id="preset-select" 
                                        value={selectedPresetKey} 
                                        onChange={(e) => handlePresetChange(e.target.value)}
                                    >
                                        <option value="">{T.loadPresetPlaceholder}</option>
                                        <optgroup label={T.defaultPresets}>
                                            {allDefaultPresets.map(key => {
                                                const translationKey = `decade_${key}` as keyof typeof T;
                                                const label = T[translationKey] as string || key;
                                                return <option key={key} value={key}>{label}</option>;
                                            })}
                                        </optgroup>
                                        {Object.keys(gameSettingsStore.customSoundPresets).length > 0 && (
                                            <optgroup label={T.customPresets}>
                                                {Object.keys(gameSettingsStore.customSoundPresets).map(name => (
                                                    <option key={name} value={name}>{name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                </div>
                                {isCustomPresetSelected && (
                                    <button className="delete-preset-button" onClick={handleDeletePreset}>{T.deletePreset}</button>
                                )}
                            </div>
                        </div>

                        {/* Sliders and Selects */}
                        <ControlSlider label={T.tempo} value={settings.tempo} min={60} max={360} step={1} onChange={(v) => handleSettingChange('tempo', v)} />
                        <div className="sound-editor-control">
                            <label htmlFor="osc-type-select">{T.oscillatorType}</label>
                            <div className="select-wrapper">
                                <select id="osc-type-select" value={settings.oscillatorType} onChange={(e) => handleSettingChange('oscillatorType', e.target.value as OscillatorType)}>
                                    <option value="sine">{T.oscSine}</option>
                                    <option value="sawtooth">{T.oscSawtooth}</option>
                                    <option value="square">{T.oscSquare}</option>
                                    <option value="triangle">{T.oscTriangle}</option>
                                </select>
                            </div>
                        </div>
                        <ControlSlider label={T.filterFrequency} value={settings.filterCutoff} min={100} max={10000} step={100} onChange={(v) => handleSettingChange('filterCutoff', v)} displayValue={`${settings.filterCutoff} Hz`} />
                        <ControlSlider label={T.lfoFrequency} value={settings.lfoFrequency} min={0.1} max={10} step={0.1} onChange={(v) => handleSettingChange('lfoFrequency', v)} displayValue={`${settings.lfoFrequency} Hz`} />
                        <ControlSlider label={T.lfoDepth} value={settings.lfoDepth} min={0} max={5000} step={100} onChange={(v) => handleSettingChange('lfoDepth', v)} />
                        <ControlSlider label={T.reverbAmount} value={settings.reverbWetness} min={0} max={1} step={0.05} onChange={(v) => handleSettingChange('reverbWetness', v)} />
                    </div>

                    {/* Chord Sequencer */}
                    <div className="sound-editor-chords">
                        <h3>{T.guitarChords}</h3>
                        <div className="chord-sequencer">
                            <div className="chord-row">
                                <div className="drum-label">{T.guitarChords}</div>
                                <div className="chord-steps">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className="step-chord-wrapper">
                                            <select 
                                                className="step-select"
                                                value={settings.chordPattern[i] || '---'}
                                                onChange={(e) => handleChordChange(i, e.target.value as Chord)}
                                            >
                                                {CHORDS.map(chord => <option key={chord} value={chord}>{chord}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Drum Sequencer */}
                    <div className="sound-editor-drums">
                        <h3>{T.drums}</h3>
                        <div className="drum-sequencer">
                            {DRUM_TYPES.map(drum => (
                                <div key={drum} className="drum-row">
                                    <div className="drum-label">{T[drum]}</div>
                                    <div className="drum-steps">
                                        {[...Array(16)].map((_, i) => (
                                            <button 
                                                key={i}
                                                className={`step-button ${i % 4 === 0 ? 'beat-strong' : ''} ${settings.drumPattern[drum][i] ? 'active' : ''}`}
                                                onClick={() => handleDrumToggle(drum, i)}
                                                aria-label={`${T[drum] as string} step ${i + 1}`}
                                            ></button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Preset */}
                    <div className="save-preset-section">
                        <h3>{T.savePreset}</h3>
                        <div className="save-preset-controls">
                            <input 
                                type="text"
                                placeholder={T.presetName}
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)} 
                            />
                            <button onClick={handleSavePreset} disabled={!presetName.trim()}>{T.save}</button>
                        </div>
                    </div>
                </div>
                
                <div className="modal-actions">
                    <button onClick={handleTogglePlay} className="button-primary">{isPlaying ? T.stop : T.play}</button>
                    <button onClick={handleReset} className="button-secondary">{T.resetToDefaults}</button>
                </div>
            </div>
        </div>
    );
};
