/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type SoundName =
  | 'game-start'
  | 'card-place'
  | 'trick-win'
  | 'trick-lose'
  | 'chat-notify'
  | 'game-win'
  | 'game-lose'
  | 'element-fire'
  | 'element-water'
  | 'element-air'
  | 'element-earth';

export type OscillatorType = 'sine' | 'sawtooth' | 'square' | 'triangle';

export interface SoundSettings {
    tempo: number; // BPM, will be converted to chord duration
    oscillatorType: OscillatorType;
    filterCutoff: number; // Hz
    lfoFrequency: number; // Hz
    lfoDepth: number; // a gain value
    reverbWetness: number; // 0 to 1
}

export const defaultSoundSettings: SoundSettings = {
    tempo: 15, // 15 BPM = 4 second chord duration
    oscillatorType: 'sawtooth',
    filterCutoff: 2000,
    lfoFrequency: 0.1,
    lfoDepth: 1200,
    reverbWetness: 0.3,
};

let currentSoundSettings: SoundSettings = { ...defaultSoundSettings };

let audioContext: AudioContext | null = null;
let musicScheduler: number | null = null;
let isMusicPlaying = false;

// Audio graph nodes
let musicGainNode: GainNode | null = null;
let convolverNode: ConvolverNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let lfoNode: OscillatorNode | null = null;
let lfoGainNode: GainNode | null = null;
let dryGainNode: GainNode | null = null;
let wetGainNode: GainNode | null = null;
let isMusicGraphBuilt = false;
let currentChordIndex = 0;


const initAudioContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
        }
    }
    // Resume context if it's suspended (required by modern browsers)
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(e => console.error('Failed to resume audio context:', e));
    }
    return audioContext;
};

// Ensure context is initialized on first user interaction
if (typeof window !== 'undefined') {
    window.addEventListener('click', initAudioContext, { once: true });
    window.addEventListener('touchend', initAudioContext, { once: true });
}

// Helper to create a simple volume envelope
const createEnvelope = (gainNode: GainNode, startTime: number, attack: number, decay: number, sustain: number, release: number, duration: number) => {
    const gain = gainNode.gain;
    gain.setValueAtTime(0, startTime);
    gain.linearRampToValueAtTime(1, startTime + attack);
    gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
    gain.setValueAtTime(sustain, startTime + duration - release);
    gain.linearRampToValueAtTime(0, startTime + duration);
};

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
    const bufferSize = context.sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    return noise;
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
            // Create a short burst of filtered white noise to simulate a card hitting a table.
            const noise = createWhiteNoise(context, 0.1);
            const filter = context.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800; // Cut high frequencies for a "thump" sound
            
            const gain = context.createGain();
            gain.gain.setValueAtTime(0.4, now); // Start relatively loud
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1); // Fast decay

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
    }
};

// --- Background Music ---

// Chord progression: i-VI-iv-V (Cm - Ab - Fm - G)
const PROGRESSION = [
    [130.81, 155.56, 196.00], // Cm (C3, Eb3, G3)
    [207.65, 261.63, 311.13], // Ab Major (Ab3, C4, Eb4)
    [174.61, 207.65, 261.63], // Fm (F3, Ab3, C4)
    [196.00, 246.94, 293.66]  // G Major (G3, B3, D4)
];

// Function to create a simple reverb impulse response
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

    // Connections
    lfoNode.connect(lfoGainNode);
    lfoGainNode.connect(filterNode.frequency);
    
    filterNode.connect(musicGainNode);
    musicGainNode.connect(dryGainNode);
    musicGainNode.connect(wetGainNode);
    dryGainNode.connect(context.destination);
    wetGainNode.connect(convolverNode);
    convolverNode.connect(context.destination);

    lfoNode.start();
    isMusicGraphBuilt = true;
};

/**
 * Updates the sound settings and applies them to the live audio graph.
 */
export const updateSoundSettings = (newSettings: SoundSettings) => {
    currentSoundSettings = { ...newSettings }; // Always store the new settings

    const context = initAudioContext();
    if (!context || !isMusicGraphBuilt) return;

    // Apply settings to the existing audio graph nodes for real-time changes.
    if (filterNode) filterNode.frequency.value = currentSoundSettings.filterCutoff;
    if (lfoNode) lfoNode.frequency.value = currentSoundSettings.lfoFrequency;
    if (lfoGainNode) lfoGainNode.gain.value = currentSoundSettings.lfoDepth;
    if (dryGainNode) dryGainNode.gain.value = 1.0 - currentSoundSettings.reverbWetness;
    if (wetGainNode) wetGainNode.gain.value = currentSoundSettings.reverbWetness;
};

const playChord = (context: AudioContext) => {
    if (!isMusicPlaying || !musicGainNode || !filterNode) return;

    const chord = PROGRESSION[currentChordIndex];
    const now = context.currentTime;
    const chordDuration = 60 / currentSoundSettings.tempo;

    chord.forEach((freq, index) => {
        const osc = context.createOscillator();
        const noteGain = context.createGain();

        osc.connect(noteGain);
        noteGain.connect(filterNode!);

        // Use sine for the root note, and slightly detuned custom oscillators for others for richness
        if (index === 0) {
            osc.type = 'sine';
            noteGain.gain.value = 1.0;
        } else {
            osc.type = currentSoundSettings.oscillatorType;
            osc.detune.value = (index === 1) ? -5 : 5; // Detune for chorus effect
            noteGain.gain.value = 0.25; // Upper notes are quieter
        }

        osc.frequency.setValueAtTime(freq, now);

        // Gentle attack and release for each note
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(noteGain.gain.value, now + 0.8);
        noteGain.gain.setValueAtTime(noteGain.gain.value, now + chordDuration - 1);
        noteGain.gain.linearRampToValueAtTime(0, now + chordDuration - 0.1);

        osc.start(now);
        osc.stop(now + chordDuration);
    });

    // Schedule the next chord
    currentChordIndex = (currentChordIndex + 1) % PROGRESSION.length;
    musicScheduler = window.setTimeout(() => playChord(context), chordDuration * 1000);
};

export const startMusic = (settings: SoundSettings) => {
    const context = initAudioContext();
    if (!context || isMusicPlaying) return;

    // Ensure the audio graph is built and ready.
    buildMusicGraph(context);
    
    // Apply the latest settings before starting.
    updateSoundSettings(settings);
    
    isMusicPlaying = true;
    currentChordIndex = 0;

    // Fade music in
    musicGainNode!.gain.cancelScheduledValues(context.currentTime);
    musicGainNode!.gain.setValueAtTime(0, context.currentTime);
    musicGainNode!.gain.linearRampToValueAtTime(0.025, context.currentTime + 2.0);

    playChord(context);
};

export const stopMusic = () => {
    const context = initAudioContext();
    if (!context || !isMusicPlaying || !musicGainNode) return;

    isMusicPlaying = false;

    if (musicScheduler) {
        clearTimeout(musicScheduler);
        musicScheduler = null;
    }
    
    // Fade music out
    musicGainNode.gain.cancelScheduledValues(context.currentTime);
    musicGainNode.gain.linearRampToValueAtTime(0, context.currentTime + 1.5);
};
