# Microscope Desktop

A NextJS application for collaborative storytelling and worldbuilding using the Microscope RPG framework.

## Architecture

This project follows a modular architecture with clear separation of concerns:

- **Custom Hooks**: `useGameState` and `useAiTurn` manage game state and AI logic
- **Utility Modules**: Separate modules for save/load operations and node creation
- **Type Safety**: Fully typed components with exported interfaces
- **Context Ready**: Prepared for context-based state management

For detailed architecture documentation, see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Getting Started

```bash
npm install
npm run dev
```

Visit http://localhost:9002 to start using the application.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linting
- `npm run typecheck` - Check TypeScript types

## Project Structure

```
src/
├── components/       # React components
│   ├── nodes/       # Node type components (Period, Event, Scene)
│   └── ...          # UI components
├── hooks/           # Custom React hooks
│   ├── useGameState.ts
│   └── useAiTurn.ts
├── lib/             # Utilities and types
│   ├── types.ts
│   ├── save-load-utils.ts
│   └── node-factory.ts
├── contexts/        # React contexts
└── ai/              # AI integration
```
