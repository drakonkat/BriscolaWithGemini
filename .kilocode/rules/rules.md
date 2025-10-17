# BriscolaWithGemini Development Guidelines

## Project Overview

**BriscolaWithGemini** is a modern web-based implementation of the traditional Italian card game Briscola, enhanced with AI-powered opponents and multiple game modes. The project combines classic card game mechanics with roguelike progression, elemental powers, and character-driven storytelling featuring anime-style waifu characters.

### Key Features
- **Multiple Game Modes**: Classic Briscola, Roguelike progression, and Dungeon challenges
- **AI Integration**: Google Gemini-powered waifu opponents with unique personalities
- **Elemental Powers**: Strategic card abilities in roguelike mode
- **Progression Systems**: Missions, gacha for backgrounds, crafting system
- **Cross-Platform**: Web deployment with Capacitor for mobile apps
- **Analytics**: PostHog integration for user behavior tracking

### Technology Stack
- **Frontend**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.1.3
- **State Management**: MobX 6.13.0
- **Mobile**: Capacitor 7.4.3
- **AI**: Google Gemini API
- **Analytics**: PostHog
- **Styling**: CSS modules with custom animations

## Architecture

### Project Structure
```
src/
├── components/          # React components
├── core/               # Game logic and utilities
│   ├── types.ts        # TypeScript type definitions
│   ├── constants.ts    # Game constants and configurations
│   ├── translations.ts # Multi-language support
│   ├── gameLogic.ts    # Core game mechanics
│   └── waifus.ts       # Character definitions
├── stores/             # MobX state management
├── hooks/              # Custom React hooks
└── styles/             # Global styles and animations
```

### Architectural Patterns

#### Component Architecture
- **Functional Components**: All components use modern React functional syntax
- **Observer Pattern**: MobX `@observer` decorator for reactive updates
- **Custom Hooks**: Business logic extracted into reusable hooks
- **Compound Components**: Related components grouped in modal systems

#### State Management Architecture
- **Root Store Pattern**: Single `RootStore` managing all application state
- **Mode-Specific Stores**: Separate stores for different game modes (Classic, Roguelike, Dungeon)
- **Observable Properties**: MobX observables for reactive state updates
- **Action-Based Mutations**: All state changes through MobX actions

#### Game Logic Separation
- **Core Logic**: Pure functions in `core/` directory
- **UI Logic**: Component-specific logic in stores and hooks
- **AI Logic**: Separate modules for local AI and Gemini integration

## Coding Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx"
  }
}
```

### Naming Conventions
- **Components**: PascalCase (e.g., `GameBoard`, `CardView`)
- **Files**: PascalCase for components, camelCase for utilities
- **Types**: PascalCase with descriptive names (e.g., `GamePhase`, `Waifu`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `SUITS_IT`, `POINTS`)
- **Functions**: camelCase (e.g., `getCardPoints`, `shuffleDeck`)

### Code Quality Rules
- **Strict TypeScript**: All variables, parameters, and return types must be typed
- **No Any Types**: Avoid `any` type; use proper type definitions
- **Interface vs Type**: Use `interface` for object shapes, `type` for unions
- **Const Assertions**: Use `as const` for literal type narrowing
- **Error Handling**: Proper try-catch blocks with meaningful error messages

## React/TypeScript/Vite Best Practices

### Component Design Patterns

#### Functional Components with Hooks
```typescript
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';

export const GameBoard = observer(() => {
  const { gameStateStore } = useStores();
  
  return (
    <div className="game-board">
      {/* Component JSX */}
    </div>
  );
});
```

#### Props Typing
```typescript
interface CardProps {
  card: Card;
  isPlayable: boolean;
  onClick: (card: Card) => void;
}

export const CardView: React.FC<CardProps> = ({ card, isPlayable, onClick }) => {
  // Component implementation
};
```

#### Custom Hooks
```typescript
export const useGameState = () => {
  const { gameStateStore } = useStores();
  
  return {
    currentPhase: gameStateStore.phase,
    isPlayerTurn: gameStateStore.turn === 'human',
    // ... other derived state
  };
};
```

### Vite-Specific Practices

#### Environment Variables
```typescript
// vite.config.ts
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.APP_VERSION': JSON.stringify(process.env.npm_package_version),
}
```

#### Path Aliases
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': fileURLToPath(new URL('.', import.meta.url)),
  }
}
```

#### Build Optimization
- **Code Splitting**: Use dynamic imports for modals and heavy components
- **Asset Optimization**: Proper image formats and compression
- **Bundle Analysis**: Monitor bundle size and dependencies

## State Management

### MobX Store Patterns

#### Store Structure
```typescript
export class GameStateStore {
  // Observable state
  @observable phase: GamePhase = 'menu';
  @observable humanScore = 0;
  
  // Computed properties
  @computed get isGameActive(): boolean {
    return this.phase === 'playing';
  }
  
  // Actions
  @action startGame = () => {
    this.phase = 'playing';
    this.humanScore = 0;
  };
}
```

#### Root Store Pattern
```typescript
export class RootStore {
  gameSettingsStore: GameSettingsStore;
  uiStore: UIStateStore;
  gameStateStore: GameStateStore;
  
  constructor() {
    this.gameSettingsStore = new GameSettingsStore(this);
    this.uiStore = new UIStateStore(this);
    // Initialize gameStateStore based on mode
  }
}
```

#### Store Communication
- **Dependency Injection**: Pass `rootStore` to child stores
- **Cross-Store References**: Stores can reference each other through rootStore
- **Event-Driven Updates**: Use MobX reactions for side effects

### State Persistence
```typescript
// LocalStorage integration
saveGame() {
  const state = {
    phase: this.phase,
    humanScore: this.humanScore,
    // ... other serializable state
  };
  localStorage.setItem('game_save', JSON.stringify(state));
}
```

## Component Design

### Component Organization

#### Container vs Presentational
- **Container Components**: Handle data fetching and state management
- **Presentational Components**: Focus on UI rendering and user interaction

#### Component Composition
```typescript
// Compound component pattern
export const GameModals = () => (
  <>
    <RulesModal />
    <SettingsModal />
    <GachaModal />
    {/* Other modals */}
  </>
);
```

### UI State Management

#### Modal System
- **Centralized Modal State**: Single source of truth in UIStore
- **Modal Stacking**: Support for multiple open modals
- **Animation States**: Proper enter/exit animations

#### Responsive Design
- **Mobile-First**: Design for mobile, enhance for desktop
- **Capacitor Integration**: Native mobile features
- **Touch Interactions**: Drag-and-drop for card play

### Performance Considerations

#### React Optimization
- **Memoization**: Use `React.memo` for expensive components
- **Callback Stability**: Stable function references with `useCallback`
- **Effect Dependencies**: Proper dependency arrays in `useEffect`

#### MobX Optimization
- **Selective Observables**: Only mark necessary properties as observable
- **Computed Properties**: Use `@computed` for derived state
- **Reaction Disposal**: Clean up reactions in component unmount

## Testing

### Testing Strategy
*Note: No testing framework is currently implemented. Recommended setup:*

#### Unit Testing
- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **MobX Testing**: State management testing utilities

#### Test Categories
- **Core Logic Tests**: Game mechanics, card calculations
- **Component Tests**: UI rendering and user interactions
- **Store Tests**: State management and business logic
- **Integration Tests**: End-to-end game flows

#### Testing Utilities
```typescript
// Example test structure
describe('getCardPoints', () => {
  it('should return correct points for Asso', () => {
    expect(getCardPoints({ suit: 'Bastoni', value: 'Asso' })).toBe(11);
  });
});
```

## Deployment

### Build Process

#### Vite Build Configuration
```typescript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  base: './', // Relative paths for Capacitor
  plugins: [react()],
  define: {
    // Environment variables
  },
}));
```

#### Capacitor Integration
```json
// capacitor.config.ts
{
  "appId": "com.waifubriscola.app",
  "appName": "Waifu Briscola",
  "bundledWebRuntime": false
}
```

### Deployment Pipeline

#### GitHub Actions
```yaml
# .github/workflows/main.yml
name: Build and Deploy
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
```

#### Mobile Deployment
```bash
# Android APK generation
npm run build
npm run android:apk
```

### Environment Management
- **Development**: Local `.env` files
- **Production**: Environment-specific configurations
- **API Keys**: Secure key management for Gemini API

## Project-Specific Conventions

### Game Mechanics

#### Card System
- **Italian Cards**: 40-card deck with suits (Bastoni, Coppe, Spade, Denara)
- **Point Values**: Asso (11), 3 (10), Re (4), Cavallo (3), Fante (2)
- **Briscola**: Trump suit that beats all others

#### Waifu Characters
```typescript
interface Waifu {
  name: string;
  personality: { it: string; en: string };
  systemInstructions: {
    [language: string]: {
      [emotionalState: string]: string;
    };
  };
  fallbackMessages: {
    [language: string]: {
      [emotionalState: string]: string[];
    };
  };
}
```

#### Roguelike Mode
- **Power-Ups**: Upgradeable abilities (Ace in the Hole, Briscola Mastery, etc.)
- **Elemental System**: Fire, Water, Air, Earth with weakness cycles
- **Follower Abilities**: Special powers from defeated waifus

#### Dungeon Mode
- **Modifiers**: Random challenges (Cursed Hand, Elemental Fury, etc.)
- **Key System**: Rarity-based dungeon access (R, SR, SSR)
- **Rewards**: Coins, shards, backgrounds, essences

### Internationalization
```typescript
// Translation structure
const translations = {
  it: {
    yourTurn: "È il tuo turno.",
    youWonTrick: (points: number) => `Hai vinto la mano! +${points} punti.`,
  },
  en: {
    yourTurn: "It's your turn.",
    youWonTrick: (points: number) => `You won the trick! +${points} points.`,
  }
};
```

### Analytics Integration
```typescript
// PostHog event tracking
posthog?.capture('game_started', {
  gameplay_mode: 'classic',
  difficulty: 'medium',
  waifu: 'Sakura'
});
```

### Error Handling
- **API Quotas**: Graceful fallback to offline mode
- **LocalStorage**: Robust error handling for save/load operations
- **Network Errors**: Retry logic for AI requests

### Performance Guidelines
- **Image Optimization**: Cached image loading system
- **Animation Performance**: CSS animations over JavaScript
- **Memory Management**: Proper cleanup of timers and reactions
- **Bundle Size**: Monitor and optimize build output

This comprehensive guide provides the foundation for maintaining and extending the BriscolaWithGemini project while ensuring code quality, performance, and maintainability.