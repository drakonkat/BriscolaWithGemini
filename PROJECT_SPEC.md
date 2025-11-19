# Waifu Briscola - Complete Project Specification

This document provides an exhaustive technical and functional specification for "Waifu Briscola", designed to allow for an identical recreation of the project.

## 1. Project Identity & Metadata
*   **Project Name**: Waifu Briscola
*   **Version**: 1.12.0
*   **Core Concept**: A single-player card game (Italian Briscola) featuring RPG elements (Roguelike, Dungeon), Gacha mechanics for cosmetic unlocks, and AI opponents driven by Google Gemini for dynamic personality-based commentary.
*   **Platforms**: Web (PWA), Android (via Capacitor), iOS (via Capacitor).
*   **Languages**: Italian (Default), English.

## 2. Technology Stack

### Core Frameworks
*   **Frontend**: React 19 (Functional Components, Hooks).
*   **Language**: TypeScript 5.x (Strict Mode).
*   **Build Tool**: Vite 5.x.
*   **Bundler**: Rollup (under Vite).

### State Management
*   **Library**: MobX 6.x (`mobx`, `mobx-react-lite`).
*   **Pattern**: RootStore pattern. A single `RootStore` instance instantiates and provides access to domain-specific stores (`GameSettingsStore`, `GameStateStore`, etc.).

### Services & APIs
*   **Generative AI**: Google Gemini API (model: `gemini-2.5-flash`) via `@google/genai` SDK. Used for generating chat messages from "Waifus".
*   **Analytics**: PostHog (`posthog-js`) for event tracking (game starts, wins/losses, gacha rolls).
*   **Storage (Assets)**: Tebi.io (S3-compatible storage) for hosting game assets (images).
*   **Storage (Local)**: Browser `localStorage` for persisting user progress (coins, shards, saves).

### Mobile Wrapper
*   **Framework**: Capacitor 7.x.
*   **Plugins**:
    *   `@capacitor/core`
    *   `@capacitor/status-bar`: For overlaying webview on status bar.
    *   `@capacitor/filesystem`: For downloading images to the device.
    *   `@capacitor/screen-orientation`: Locking orientation (portrait/landscape).

### Styling
*   **Methodology**: Plain CSS with CSS Variables for theming.
*   **Structure**: Component-scoped CSS files (e.g., `Menu.css`) and global styles (`index.css`, `animations.css`).
*   **Design System**: "Glassmorphism" dark theme (purples, gold accents, translucent backgrounds).

## 3. Project Configuration

### 3.1. Environment Variables
The application relies on the following environment variables (typically in `.env` files):
*   `GEMINI_API_KEY`: The API key for Google Gemini.
*   `VITE_PUBLIC_POSTHOG_HOST`: Host URL for PostHog analytics.
*   `VITE_PUBLIC_POSTHOG_KEY`: API key for PostHog analytics.
*   `FETCH_IMAGE_FROM_WEB`: flag (string '1' or '0') to toggle between local assets and remote S3 assets. **Note**: The logic in `utils.ts` defaults to `true` (Web) if this variable is NOT '1'.

### 3.2. `vite.config.ts`
*   Defines `process.env` replacements for the variables above.
*   Sets base path to `./` for relative path support (crucial for Capacitor).
*   Configures path alias `@` to project root.

### 3.3. `capacitor.config.ts`
*   **App ID**: `com.waifubriscola.app`
*   **Web Dir**: `dist`
*   **Plugins**:
    *   `SplashScreen`: Configured for dark theme, 2000ms duration.

## 4. Asset Management (Tebi S3)

This is a critical component for keeping the app bundle size small while providing high-quality images.

*   **Source**: `src/core/utils.ts`
*   **Configuration**:
    *   `WEB_IMAGE_BASE_URL`: **`https://s3.tebi.io/waifubriscola`**
    *   `LOCAL_IMAGE_BASE_URL`: `public/assets` (Fallback/Dev)
*   **Logic**:
    *   The function `getImageUrl(path)` prepends the base URL to the relative path.
    *   **Example**: `getImageUrl('/waifus/sakura.png')` -> `https://s3.tebi.io/waifubriscola/waifus/sakura.png`.
*   **Caching (`src/core/imageCache.ts`)**:
    *   To save bandwidth and improve performance, a custom caching layer is implemented.
    *   **`getCachedImageSrc(url)`**:
        1.  Checks in-memory cache.
        2.  Checks `localStorage` for a Base64 representation of the image (Key prefix: `img_cache_`).
        3.  If missing, fetches the image via `fetch()`, converts it to a Blob -> Base64, saves it to `localStorage`, and returns the Base64 string.
    *   **Usage**: The `CachedImage` component uses this hook to render images.

## 5. Architecture & State Stores

The application logic is divided into several MobX stores located in `src/stores/`.

### 5.1. `RootStore` (`index.ts`)
*   Initializes all other stores.
*   Provides a global `StoreContext`.
*   Manages switching the `gameStateStore` instance based on the selected game mode (Classic vs Roguelike vs Dungeon).

### 5.2. `GameSettingsStore`
*   **Persists**: Language, Audio settings (Music/SFX enabled, volumes), Gameplay mode, Difficulty, NSFW toggle, Card Deck style (Classic/Poker).
*   **Function**: Single source of truth for user preferences.

### 5.3. `UIStateStore`
*   **Manages**: Visibility booleans for all modals (`isRulesModalOpen`, `isGalleryModalOpen`, etc.).
*   **Tutorial**: Manages the tutorial state machine (`tutorialStep`, `highlightedElementRect`) which overlays the UI.
*   **Feedback**: Manages `Snackbar` (toasts) and `WaifuBubble` (chat popups).

### 5.4. `GachaStore`
*   **Persists**: User economy (Waifu Coins, Shards R/SR/SSR, Essences, Keys), Collection status (`unlockedBackgrounds`).
*   **Logic**:
    *   `gachaRoll()`: Handles probability logic for pulling backgrounds.
    *   `craftKey()`: Logic for crafting Dungeon Keys using Shards and Essences.
    *   **Rarity Rates**: R (~75%), SR (~20%), SSR (~5%).
    *   **Duplicate Logic**: Converting duplicates into Shards of the corresponding rarity.

### 5.5. `GameStateStore` (Abstract)
*   Base class for specific game mode logic.
*   **State**: Hands, Deck, Table cards, Scores, Turn order, Match History.
*   **Actions**: `playCard`, `drawCards`, `resolveTrick`, `handleAiTurn`.

#### 5.5.1. `ClassicModeStore` (extends GameStateStore)
*   Implements standard Briscola rules.
*   **AI**: Uses `localAI.ts` for card selection logic.

#### 5.5.2. `RoguelikeModeStore` (extends GameStateStore)
*   **State**: `RoguelikeState` (current level, active powers, followers).
*   **Mechanics**:
    *   **Elemental Cards**: Cards have Fire/Water/Air/Earth properties.
    *   **Elemental Clash**: Rock-paper-scissors logic on top of card ranks.
    *   **Powers**: Manages active powers (e.g., "Ace in the Hole", "Divine Tribute").
    *   **Followers**: Manages "Waifu abilities" (one-time use per match).

#### 5.5.3. `DungeonModeStore` (extends ClassicModeStore)
*   **State**: `DungeonRunState` (wins/losses, modifiers).
*   **Mechanics**:
    *   Applies `DungeonModifiers` (e.g., "Cursed Hand", "Briscola Chaos") to the classic rules loop.
    *   Manages sequential matches against increasingly difficult opponents.

### 5.6. `ChatStore`
*   **State**: Chat history.
*   **Integration**: Calls `gemini.ts` to get AI responses.
*   **Logic**: Manages context window, system instructions based on Waifu personality and emotional state (Winning/Losing/Neutral).

## 6. Game Mechanics & Logic

### 6.1. Briscola Engine (`classicGameLogic.ts`)
*   **Deck**: 40 cards.
*   **Rank**: Asso (11) > 3 (10) > Re (4) > Cavallo (3) > Fante (2) > 7 (0) > 6 > 5 > 4 > 2.
*   **Winning Logic**:
    1.  If one card is Briscola and other is not -> Briscola wins.
    2.  If both are Briscola -> Higher rank wins.
    3.  If neither is Briscola -> Lead suit wins (Higher rank wins).
    4.  If suits differ and no Briscola -> Lead card wins.

### 6.2. AI Logic (`localAI.ts`)
*   **Deterministic Heuristics**:
    *   **Easy**: Random valid move.
    *   **Medium**: Basic point protection. Plays low value cards if losing the trick, high value if winning securely.
    *   **Hard**: Counts points, tracks played Briscolas.
    *   **Nightmare/Apocalypse**: "Cheating" AI. Can see the player's hand or the deck to make optimal moves.

### 6.3. Roguelike Mechanics (`roguelikeGameLogic.ts`)
*   **Elements**: Fire > Air > Earth > Water > Fire.
*   **Clash**: If both cards have elements, a clash occurs. Resolved by weakness (instant win) or Dice Roll (random).
*   **Powers**:
    *   *Incinerate (Fire)*: Bonus points on win.
    *   *Tide (Water)*: Reduces opponent points on loss.
    *   *Cyclone (Air)*: Synergy with other Air cards.
    *   *Fortify (Earth)*: Returns card points on loss.

## 7. UI/UX & Components

### 7.1. Main Components
*   **`Menu.tsx`**:
    *   Carousel for Game Mode (Classic, Roguelike, Dungeon).
    *   Carousel for Difficulty (Easy -> Apocalypse).
    *   Carousel for Waifu Selection.
    *   Side Drawer for secondary links (Settings, Rules, Gallery).
*   **`GameBoard.tsx`**:
    *   **Responsive Layout**: Adapts to Portrait (Mobile) and Landscape (Desktop).
    *   **Drag & Drop**: Supports touch and mouse for playing cards (specifically for Roguelike powers).
    *   **Visual Feedback**: CSS Animations for card movement, shuffling, and dealing.
*   **`ChatPanel.tsx`**:
    *   Slide-out panel on mobile, fixed sidebar on desktop (if enabled).
    *   Renders chat bubbles with "Typing..." indicators.

### 7.2. Modals System (`GameModals.tsx`)
*   Centralized rendering of all modals based on `UIStateStore` flags.
*   **Key Modals**:
    *   `GalleryModal`: Tabs for Gacha, Background viewing, Crafting (Keys), Conversion (Shards).
    *   `CraftingMinigameModal`: A reflex-based mini-game bar for crafting items.
    *   `SoundEditorModal`: A comprehensive synthesizer UI for customizing game music.
    *   `MissionsModal`: Daily/Weekly tasks and Achievements.

## 8. Audio System (`soundManager.ts`)

*   **Technology**: Web Audio API (Oscillators, GainNodes, BiquadFilters).
*   **Procedural Generation**: Music is generated in real-time based on a sequencer pattern.
*   **Features**:
    *   **Decade Presets**: 80s, 90s, Lo-Fi, etc.
    *   **Editor**: Users can modify BPM, Waveform (Sine/Square/Sawtooth), Filter Cutoff, and Drum patterns.

## 9. Economy Structure

*   **Waifu Coins (WC)**:
    *   Source: Winning matches, Missions.
    *   Sink: Gacha Rolls (100 WC single, 900 WC multi).
*   **Shards (R, SR, SSR)**:
    *   Source: Gacha duplicates, Missions, Dungeon rewards.
    *   Sink: Crafting Dungeon Keys.
*   **Essences**:
    *   **Elemental (Fire/Water/Air/Earth)**: From Roguelike matches.
    *   **Transcendental**: From Dungeon rewards or converting Elemental essences.
    *   Sink: Advanced crafting.
*   **Dungeon Keys**:
    *   Required to enter Dungeon Mode.

## 10. Instructions for Recreation

To identically recreate this project:

1.  **Scaffold**: Create a Vite + React + TypeScript project.
2.  **Dependencies**: Install `mobx`, `mobx-react-lite`, `posthog-js`, `@google/genai`, `@capacitor/core` (and related plugins).
3.  **CSS**: Copy `index.css` (variables), `animations.css` (keyframes), and component-specific CSS files ensuring the glassmorphism and responsive rules are exact.
4.  **Stores**: Implement the RootStore pattern exactly as described in Section 5.
5.  **Assets**: Implement the `getImageUrl` helper in `utils.ts` pointing to `https://s3.tebi.io/waifubriscola` and the caching logic in `imageCache.ts`.
6.  **Audio**: Implement the `SoundManager` using Web Audio API nodes for procedural sound generation.
7.  **AI**: Hook up the `GoogleGenAI` client with the API key from `process.env`.
8.  **Modals**: Recreate the modal registry in `GameModals.tsx` to handle the extensive list of UI overlays.
