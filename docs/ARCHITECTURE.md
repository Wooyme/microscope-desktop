# Architecture Documentation

## Overview

This document describes the refactored architecture that reduces coupling and makes components more independent and versatile.

## Key Improvements

### 1. Separation of Concerns

The codebase now follows a clear separation between:
- **Business Logic**: Game state management, AI logic, node operations
- **Presentation**: React components for UI
- **Utilities**: File operations, node factories

### 2. Custom Hooks

#### `useGameState`
Centralizes all game state management in one place.

**Location**: `src/hooks/useGameState.ts`

**Purpose**: Manages all game-related state including nodes, edges, players, history, etc.

**Benefits**:
- Single source of truth for game state
- Easier to test state logic independently
- Can be reused across different components
- Provides clean methods for state manipulation

**Usage**:
```typescript
const gameState = useGameState(initialNodes, initialGameSeed, initialPlayers, initialLegacy);
const { nodes, edges, activePlayer, resetGame, getSaveFile, ... } = gameState;
```

#### `useAiTurn`
Handles all AI turn logic separately from the UI component.

**Location**: `src/hooks/useAiTurn.ts`

**Purpose**: Manages AI turn execution, proposal handling, and state

**Benefits**:
- AI logic is decoupled from UI
- Can be tested independently
- Easier to extend AI capabilities
- Clear error handling

**Usage**:
```typescript
const { isAiTurn, aiMoveProposal, executeAiTurn, resetAiTurn } = useAiTurn();

await executeAiTurn(activePlayer, {
  nodes, edges, historyLog, gameSeed, locale,
  onSuccess: (move, content) => { /* ... */ },
  onError: (error) => { /* ... */ }
});
```

### 3. Utility Modules

#### Save/Load Utilities
**Location**: `src/lib/save-load-utils.ts`

**Functions**:
- `saveGameToFile(saveFile, filename)`: Handles game export to JSON
- `loadGameFromFile(file, onSuccess, onError)`: Handles game import with error handling

**Benefits**:
- File operations isolated from component logic
- Reusable across different save points
- Easier to modify file format

#### Node Factory
**Location**: `src/lib/node-factory.ts`

**Functions**:
- `createPeriodNode()`, `createEventNode()`, `createSceneNode()`
- `createPeriodWithEdge()`, `createEventWithEdge()`, `createSceneWithEdge()`

**Benefits**:
- Consistent node creation
- Encapsulates positioning logic
- Easier to modify node structure

### 4. Type Safety Improvements

#### Node Data Types
Each node type now has a properly exported type definition:

```typescript
// src/components/nodes/period-node.tsx
export type PeriodNodeData = {
  name: string;
  description: string;
  imageUrl?: string;
  updateNodeData?: (id: string, data: any) => void;
  // ... other optional functions
}

type PeriodNode = Node<PeriodNodeData, 'period'>;
```

**Benefits**:
- Better autocomplete in IDEs
- Catch type errors at compile time
- Self-documenting code
- All operation functions are optional for flexibility

### 5. Context API (Prepared for Future Use)

**Location**: `src/contexts/NodeOperationsContext.tsx`

**Purpose**: Provides a context for node operations to avoid prop drilling

**Status**: Created but not yet fully integrated (available for future enhancement)

**Future Usage**:
```typescript
const { updateNodeData, deleteNode, addPeriod } = useNodeOperations();
```

## Component Structure

### Before Refactoring
```
SessionWeaver (675 lines)
├── Game state (15+ state variables)
├── Save/load logic (40+ lines)
├── AI turn logic (30+ lines)
├── Node operations
└── UI rendering
```

### After Refactoring
```
SessionWeaver (630 lines)
├── useGameState hook ───────→ src/hooks/useGameState.ts
├── useAiTurn hook ──────────→ src/hooks/useAiTurn.ts
├── Save/Load utilities ─────→ src/lib/save-load-utils.ts
├── Node factory ────────────→ src/lib/node-factory.ts
└── UI rendering (focus of component)
```

## Testing Benefits

The new architecture makes testing much easier:

1. **Unit Test Hooks**: Test `useGameState` and `useAiTurn` independently
2. **Mock Dependencies**: Easy to mock utility functions
3. **Test Node Operations**: Test node factories without React
4. **Integration Tests**: Test components with mocked hooks

## Future Enhancements

1. **Context Integration**: Migrate to using NodeOperationsContext to further reduce prop drilling
2. **More Granular Hooks**: Split `useGameState` into smaller hooks if needed
3. **Service Layer**: Extract more business logic into service classes
4. **Type Generators**: Auto-generate types from game rules

## Migration Guide

If you're extending this codebase:

### Adding New Game State
Add it to `useGameState` hook instead of SessionWeaver component

### Adding New AI Logic
Extend `useAiTurn` hook with new methods

### Creating New Node Types
1. Define type in node component file
2. Add factory function to `node-factory.ts`
3. Export type for reuse

### Modifying Save Format
Update types in `src/lib/types.ts` and utilities in `save-load-utils.ts`

## Conclusion

This refactoring achieves the goal of reducing coupling and making components more independent and versatile. The code is now:
- More modular and maintainable
- Easier to test
- Better typed
- More reusable
- Clearer in its responsibilities
