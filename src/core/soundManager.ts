
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { SoundName, OscillatorType, DrumType, Chord, Decade } from './types';
import { CHORDS } from './types';

export interface SoundSettings {
    tempo: number; // BPM
    oscillatorType: OscillatorType;
    filterCutoff: number; // Hz
    lfoFrequency: number; // Hz
    lfoDepth: number; // a gain value
    reverbWetness: number; // 0 to 1
    masterVolume: number; // 0 to 1
    drumPattern: Record<DrumType, boolean[]>;
    chordPattern: Chord[];
}

const SEQUENCE_LENGTH = 16;
export const DRUM_TYPES: DrumType[] = ['kick', 'snare', 'closedHat', 'openHat'];

export const defaultSoundSettings: SoundSettings = {
    tempo: 120,
    oscillatorType: 'sawtooth',
    filterCutoff: 2000,
    lfoFrequency: 0.1,
    lfoDepth: 1200,
    reverbWetness: 0.3,
    masterVolume: 0.5,
    drumPattern: {
        kick: Array(SEQUENCE_LENGTH).fill(false),
        snare: Array(SEQUENCE_LENGTH).fill(false),
        closedHat: Array(SEQUENCE_LENGTH).fill(false),
        openHat: Array(SEQUENCE_LENGTH).fill(false),
    },
    chordPattern: Array(SEQUENCE_LENGTH).fill('---'),
};

// Chord definitions (frequencies for root, third, fifth)
const CHORD_MAP: Record<Chord, number[] | null> = {
    '---': null,
    'Am': [220.00, 261.63, 329.63], // A3, C4, E4
    'G': [196.00, 246.94, 293.66],  // G3, B3, D4
    'C': [261.63, 329.63, 392.00],  // C4, E4, G4
    'F': [349.23, 440.00, 523.25],  // F4, A4, C5
    'Dm': [293.66, 349.23, 440.00], // D4, F4, A4
    'E': [329.63, 415.30, 493.88],  // E4, G#4, B4
};

export const decadePresets: Record<Decade, SoundSettings> = {
    '40s': { /* Swing */
        tempo: 140, oscillatorType: 'sine', filterCutoff: 1500, lfoFrequency: 0.1, lfoDepth: 800, reverbWetness: 0.2, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            snare: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            closedHat: [true, false, true, true, true, false, true, true, true, false, true, true, true, false, true, true],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['C','C','G','G','F','F','C','G', 'C','C','G','G','F','F','C','G'],
    },
    '50s': { /* Rock */
        tempo: 165, oscillatorType: 'square', filterCutoff: 2500, lfoFrequency: 0.2, lfoDepth: 1000, reverbWetness: 0.25, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            snare: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            closedHat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['C', '---', 'F', '---', 'G', '---', 'F', '---', 'C', '---', 'F', '---', 'G', '---', 'F', '---'],
    },
    '60s': { /* Soul */
        tempo: 110, oscillatorType: 'sawtooth', filterCutoff: 3000, lfoFrequency: 0.1, lfoDepth: 500, reverbWetness: 0.4, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, true, false, false, true, false, true, false, false, true, false, false, true, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['Am', '---', 'G', '---', 'C', '---', 'F', '---', 'Am', '---', 'G', '---', 'C', '---', 'F', '---'],
    },
    '70s': { /* Disco */
        tempo: 125, oscillatorType: 'sawtooth', filterCutoff: 4000, lfoFrequency: 0.5, lfoDepth: 1500, reverbWetness: 0.5, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
            openHat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        },
        chordPattern: ['Dm', 'Dm', 'G', 'G', 'C', 'C', 'F', 'F', 'Dm', 'Dm', 'G', 'G', 'C', 'C', 'F', 'F'],
    },
    '80s': { /* Synthwave */
        tempo: 100, oscillatorType: 'square', filterCutoff: 5000, lfoFrequency: 0.8, lfoDepth: 2000, reverbWetness: 0.6, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['Am', '---', 'G', '---', 'C', '---', 'F', '---', 'Am', '---', 'G', '---', 'E', '---', 'E', '---'],
    },
    '90s': { /* Pop */
        tempo: 118, oscillatorType: 'sawtooth', filterCutoff: 6000, lfoFrequency: 0.3, lfoDepth: 1000, reverbWetness: 0.4, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, false, true, false, false, true, true, false, false, false, true, false, false, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, true, false],
            closedHat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F'],
    },
    'blue90s': { /* Eiffel 65 - Blue */
        tempo: 128,
        oscillatorType: 'sawtooth',
        filterCutoff: 6200,
        lfoFrequency: 1.8,
        lfoDepth: 1800,
        reverbWetness: 0.5,
        masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            openHat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
        },
        // Transposed progression from Gm-Eb-Bb-F to Am-F-C-G
        chordPattern: ['Am', 'Am', 'F', 'F', 'C', 'C', 'G', 'G', 'Am', 'Am', 'F', 'F', 'C', 'C', 'G', 'G'],
    },
    '2000s': { /* Dance */
        tempo: 128, oscillatorType: 'sawtooth', filterCutoff: 7000, lfoFrequency: 1.0, lfoDepth: 2500, reverbWetness: 0.5, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
            openHat: [false, true, false, true, false, true, false, true, false, true, false, true, false, true, false, true],
        },
        chordPattern: ['Am', 'Am', 'F', 'F', 'C', 'C', 'G', 'G', 'Am', 'Am', 'F', 'F', 'C', 'C', 'G', 'G'],
    },
    '2010s': { /* EDM */
        tempo: 128, oscillatorType: 'square', filterCutoff: 8000, lfoFrequency: 0.9, lfoDepth: 3000, reverbWetness: 0.6, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, true, true, false, false, false, true, false, false, true, true, false, false, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F'],
    },
    '2020s': { /* Lo-fi */
        tempo: 80, oscillatorType: 'triangle', filterCutoff: 1200, lfoFrequency: 0.05, lfoDepth: 400, reverbWetness: 0.7, masterVolume: 0.5,
        drumPattern: {
            kick: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false],
            snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
            closedHat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
            openHat: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        },
        chordPattern: ['F', '---', 'E', '---', 'Am', '---', 'C', '---', 'F', '---', 'E', '---', 'Am', '---', 'G', '---'],
    },
};

let currentSoundSettings: SoundSettings = { ...defaultSoundSettings };

let audioContext: AudioContext | null = null;
let isMusicPlaying = false;

// Audio graph nodes
let masterGainNode: GainNode | null = null;
let musicGainNode: GainNode | null = null;
let convolverNode: ConvolverNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let lfoNode: OscillatorNode | null = null;
let lfoGainNode: GainNode | null = null;
let dryGainNode: GainNode | null = null;
let wetGainNode: GainNode | null = null;
let isMusicGraphBuilt = false;

// High-precision scheduling variables
let schedulerInterval: number | null = null;
let currentStep = 0;
let nextNoteTime = 0.0;
const scheduleAheadTime = 0.1; // seconds
const schedulerFrequency = 25.0; // ms

const initAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
        }
    }
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error('Failed to resume audio context:', e));
    }
    return audioContext;
};

if (typeof window !== 'undefined') {
    const init = () => initAudioContext();
    window.addEventListener('click', init, { once: true });
    window.addEventListener('touchend', init, { once: true });
}

const playNote = (context: AudioContext, frequency: number, startTime: number, duration: number, volume = 0.5) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
};

const createWhiteNoise = (context: AudioContext, duration: number): AudioBufferSourceNode => {
    const bufferSize = Math.round(context.sampleRate * duration);
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    return noise;
};

// --- Synthesized Drum Sounds ---
const createKick = (context: AudioContext, time: number) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.connect(gain);
    if (!masterGainNode) return;
    gain.connect(masterGainNode);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    osc.start(time);
    osc.stop(time + 0.15);
};

const createSnare = (context: AudioContext, time: number) => {
    if (!masterGainNode) return;
    const noise = createWhiteNoise(context, 0.2);
    const noiseFilter = context.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1500;
    const noiseGain = context.createGain();
    noise.connect(noiseFilter).connect(noiseGain).connect(masterGainNode);
    noiseGain.gain.setValueAtTime(0.8, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    const osc = context.createOscillator();
    const oscGain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 120;
    osc.connect(oscGain).connect(masterGainNode);
    oscGain.gain.setValueAtTime(0.7, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.start(time);
    osc.start(time);
    noise.stop(time + 0.2);
    osc.stop(time + 0.1);
};

const createHihat = (context: AudioContext, time: number, isOpen: boolean) => {
    if (!masterGainNode) return;
    const duration = isOpen ? 0.3 : 0.08;
    const noise = createWhiteNoise(context, duration);
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;
    const gain = context.createGain();
    
    noise.connect(filter).connect(gain).connect(masterGainNode);
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    noise.start(time);
    noise.stop(time + duration);
};

const createGuitarChord = (context: AudioContext, time: number, frequencies: number[]) => {
    if (!masterGainNode) return;
    const duration = 0.8;
    frequencies.forEach((freq, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.connect(gain);
        gain.connect(masterGainNode);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time + index * 0.02); // Strum effect
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + index * 0.02 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time + index * 0.02);
        osc.stop(time + duration + 0.1);
    });
};


export const playSound = async (name: SoundName) => {
    const context = initAudioContext();
    if (!context) return;
    
    if (context.state === 'suspended') {
        await context.resume().catch(() => {});
    }

    const now = context.currentTime;

    switch (name) {
        case 'card-place': {
            const noise = createWhiteNoise(context, 0.1);
            const filter = context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            const gain = context.createGain();
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            noise.connect(filter).connect(gain).connect(context.destination);
            noise.start(now);
            noise.stop(now + 0.1);
            break;
        }
        case 'trick-win': {
            playNote(context, 523.25, now, 0.1, 0.3); // C5
            playNote(context, 783.99, now + 0.1, 0.15, 0.3); // G5
            break;
        }
        case 'trick-lose': {
            playNote(context, 392.00, now, 0.1, 0.2); // G4
            playNote(context, 311.13, now + 0.1, 0.2, 0.2); // Eb4
            break;
        }
        case 'chat-notify': {
            playNote(context, 1200, now, 0.1, 0.2);
            break;
        }
        case 'game-start':
        case 'game-win': {
            playNote(context, 523.25, now, 0.1, 0.2); // C5
            playNote(context, 659.25, now + 0.1, 0.1, 0.2); // E5
            playNote(context, 783.99, now + 0.2, 0.1, 0.2); // G5
            playNote(context, 1046.50, now + 0.3, 0.2, 0.2); // C6
            break;
        }
        case 'game-lose': {
            playNote(context, 261.63, now, 0.5, 0.2); // C4
            playNote(context, 207.65, now + 0.1, 0.5, 0.15); // G#3
            break;
        }
        case 'element-fire': {
            const noise = createWhiteNoise(context, 0.3);
            const bandpass = context.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 1000;
            bandpass.Q.value = 20;
            const gain = context.createGain();
            noise.connect(bandpass).connect(gain).connect(context.destination);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            noise.start(now);
            noise.stop(now + 0.3);
            break;
        }
        case 'element-water': {
             const osc = context.createOscillator();
             const gain = context.createGain();
             osc.connect(gain);
             gain.connect(context.destination);
             osc.frequency.setValueAtTime(400, now);
             osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
             gain.gain.setValueAtTime(0.4, now);
             gain.gain.linearRampToValueAtTime(0, now + 0.2);
             osc.start(now);
             osc.stop(now + 0.2);
             break;
        }
        case 'element-air': {
            const noise = createWhiteNoise(context, 0.5);
            const bandpass = context.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.Q.value = 5;
            bandpass.frequency.setValueAtTime(200, now);
            bandpass.frequency.exponentialRampToValueAtTime(3000, now + 0.4);
            const gain = context.createGain();
            noise.connect(bandpass).connect(gain).connect(context.destination);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            noise.start(now);
            noise.stop(now + 0.5);
            break;
        }
        case 'element-earth': {
            playNote(context, 80, now, 0.2, 0.5);
            break;
        }
        case 'dice-roll': {
            const totalDuration = 2.5; // seconds
            const numberOfRattles = 30;
            for (let i = 0; i < numberOfRattles; i++) {
                const startTime = now + (i / numberOfRattles) * totalDuration;
                const duration = 0.1 + Math.random() * 0.1;
                const noise = createWhiteNoise(context, duration);
                const filter = context.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1000 + Math.random() * 1500;
                filter.Q.value = 1.5;

                const gain = context.createGain();
                // Fade out the sound over the total duration
                const initialGain = 0.15 * (1 - (i / numberOfRattles));
                gain.gain.setValueAtTime(initialGain, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
                
                noise.connect(filter).connect(gain).connect(context.destination);
                noise.start(startTime);
                noise.stop(startTime + duration);
            }
            break;
        }
        case 'gacha-roll': {
            for (let i = 0; i < 10; i++) {
                playNote(context, 440 + i * 40, now + i * 0.08, 0.1, 0.1);
            }
            break;
        }
        case 'gacha-unlock-r': {
            playNote(context, 659.25, now, 0.4, 0.3); // E5
            playNote(context, 880.00, now, 0.4, 0.3); // A5
            break;
        }
        case 'gacha-unlock-sr': {
            playNote(context, 659.25, now, 0.5, 0.3); // E5
            playNote(context, 880.00, now + 0.1, 0.5, 0.3); // A5
            playNote(context, 1318.51, now + 0.2, 0.5, 0.2); // E6
            break;
        }
        case 'gacha-unlock-ssr': {
            const bass = context.createOscillator();
            const bassGain = context.createGain();
            bass.connect(bassGain).connect(context.destination);
            bass.type = 'sine';
            bass.frequency.setValueAtTime(82.41, now); // E2
            bassGain.gain.setValueAtTime(0, now);
            bassGain.gain.linearRampToValueAtTime(0.4, now + 0.05);
            bassGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
            bass.start(now);
            bass.stop(now + 1.0);
            const notes = [523.25, 659.25, 880.00, 1046.50, 1318.51]; // C5, E5, A5, C6, E6
            notes.forEach((freq, i) => {
                playNote(context, freq, now + i * 0.1, 0.8, 0.3);
            });
            break;
        }
        case 'gacha-refund': {
            playNote(context, 1046.50, now, 0.08, 0.2); // C6
            playNote(context, 1318.51, now + 0.1, 0.1, 0.2); // E6
            playNote(context, 1567.98, now + 0.2, 0.15, 0.2); // G6
            break;
        }
        case 'gacha-multi-unlock': {
            const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
            notes.forEach((freq, i) => {
                playNote(context, freq, now + i * 0.08, 0.5, 0.25);
            });
            break;
        }
    }
};

// --- Background Music ---

const createReverbImpulseResponse = (context: AudioContext): AudioBuffer => {
    const sampleRate = context.sampleRate;
    const duration = 2.5;
    const decay = 2.0;
    const impulse = context.createBuffer(2, sampleRate * duration, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < sampleRate * duration; i++) {
        const n = i / sampleRate;
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / duration, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / duration, decay);
    }
    return impulse;
};

const buildMusicGraph = (context: AudioContext) => {
    if (isMusicGraphBuilt) return;

    masterGainNode = context.createGain();
    musicGainNode = context.createGain();
    filterNode = context.createBiquadFilter();
    lfoNode = context.createOscillator();
    lfoGainNode = context.createGain();
    convolverNode = context.createConvolver();
    dryGainNode = context.createGain();
    wetGainNode = context.createGain();
    filterNode.type = 'lowpass';
    lfoNode.type = 'sine';
    convolverNode.buffer = createReverbImpulseResponse(context);
    lfoNode.connect(lfoGainNode);
    lfoGainNode.connect(filterNode.frequency);
    filterNode.connect(musicGainNode);
    musicGainNode.connect(dryGainNode);
    musicGainNode.connect(wetGainNode);
    dryGainNode.connect(masterGainNode);
    wetGainNode.connect(convolverNode);
    convolverNode.connect(masterGainNode);
    masterGainNode.connect(context.destination);
    lfoNode.start();
    isMusicGraphBuilt = true;
};

export const updateSoundSettings = (newSettings: SoundSettings) => {
    currentSoundSettings = { ...newSettings };
    const context = initAudioContext();
    if (!context || !isMusicGraphBuilt) return;
    if (filterNode) filterNode.frequency.value = currentSoundSettings.filterCutoff;
    if (lfoNode) lfoNode.frequency.value = currentSoundSettings.lfoFrequency;
    if (lfoGainNode) lfoGainNode.gain.value = currentSoundSettings.lfoDepth;
    if (dryGainNode) dryGainNode.gain.value = 1.0 - currentSoundSettings.reverbWetness;
    if (wetGainNode) wetGainNode.gain.value = currentSoundSettings.reverbWetness;
    if (masterGainNode) masterGainNode.gain.value = currentSoundSettings.masterVolume;
};

const scheduleNotes = (step: number, time: number) => {
    const context = audioContext!;
    const secondsPerStep = (60.0 / currentSoundSettings.tempo) / 4.0;
    
    // Schedule Drums
    if (currentSoundSettings.drumPattern.kick[step]) createKick(context, time);
    if (currentSoundSettings.drumPattern.snare[step]) createSnare(context, time);
    if (currentSoundSettings.drumPattern.closedHat[step]) createHihat(context, time, false);
    if (currentSoundSettings.drumPattern.openHat[step]) createHihat(context, time, true);
    
    // Schedule Guitar Chord
    const chordName = currentSoundSettings.chordPattern[step];
    const chordFrequencies = CHORD_MAP[chordName];
    if (chordFrequencies) {
        createGuitarChord(context, time, chordFrequencies);
    }
    
    // Schedule Synth lead
    const currentBar = Math.floor(step / 4);
    let barChordName: Chord | undefined;
    for (let i = step; i >= currentBar * 4; i--) {
        if (currentSoundSettings.chordPattern[i] !== '---') {
            barChordName = currentSoundSettings.chordPattern[i];
            break;
        }
    }
    const currentBarChord = barChordName ? CHORD_MAP[barChordName] : null;

    if (currentBarChord && step % 2 === 0) { // Play synth on 8th notes
        const noteIndex = (step / 2) % currentBarChord.length;
        const freq = currentBarChord[noteIndex] * 2; // one octave higher
        const duration = secondsPerStep * 0.9;
        
        const osc = context.createOscillator();
        const noteGain = context.createGain();

        osc.connect(noteGain);
        noteGain.connect(filterNode!);
        
        osc.type = currentSoundSettings.oscillatorType;
        noteGain.gain.value = 0.25;
        osc.frequency.setValueAtTime(freq, time);
        
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(noteGain.gain.value, time + 0.01);
        noteGain.gain.setValueAtTime(noteGain.gain.value, time + duration - 0.05);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
    }
};

const scheduler = () => {
    const context = audioContext!;
    while (nextNoteTime < context.currentTime + scheduleAheadTime) {
        scheduleNotes(currentStep, nextNoteTime);
        const secondsPerStep = (60.0 / currentSoundSettings.tempo) / 4.0;
        nextNoteTime += secondsPerStep;
        currentStep = (currentStep + 1) % SEQUENCE_LENGTH;
    }
};

export const startMusic = (settings: SoundSettings) => {
    const context = initAudioContext();
    if (!context || isMusicPlaying) return;
    buildMusicGraph(context);
    updateSoundSettings(settings);
    isMusicPlaying = true;
    currentStep = 0;
    nextNoteTime = context.currentTime;
    if (!musicGainNode) return;
    musicGainNode.gain.cancelScheduledValues(context.currentTime);
    musicGainNode.gain.setValueAtTime(0, context.currentTime);
    musicGainNode.gain.linearRampToValueAtTime(0.025, context.currentTime + 2.0);
    schedulerInterval = window.setInterval(scheduler, schedulerFrequency);
};

export const stopMusic = () => {
    const context = initAudioContext();
    if (!context || !isMusicPlaying || !musicGainNode) return;
    isMusicPlaying = false;
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
    }
    musicGainNode.gain.cancelScheduledValues(context.currentTime);
    musicGainNode.gain.linearRampToValueAtTime(0, context.currentTime + 1.5);
};