# OpenCode Guidelines for ChatBot Web (Thesis Project Frontend)

## Context & Project Overview
- **Documentation**: The `README.md` file in the root directory contains details about compiling, local development, and deploying. Refer to it for operational instructions.
- **Domain**: This is the unifed Single Page Application (SPA) frontend designed to interact with the `chat-bot-api` recommendation engine. It unifies conversational prompting with real-time vector metrics and pipeline debugging tools.
- **Backend Connectivity**: It consumes the FastAPI endpoints served at `/api/v1` (locally or on skynet at `http://nonosoft.ddns.net:8080`).

---

## Code Structure & Conventions

- **Vite & TypeScript**: Built with Vite 8 + React 19 + TypeScript.
- **Strict Modules**: TypeScript has `verbatimModuleSyntax` enabled. **Rule:** You must import types using `import type { ... }` instead of standard imports to prevent compilation errors.
- **Styling**: Uses **Tailwind CSS v4** via the `@tailwindcss/vite` compiler. Configuration is kept inside CSS files (e.g. `src/index.css` via `@import "tailwindcss";`) and the Vite plugin rather than a legacy `tailwind.config.js` file.

```text
src/
├── components/         # Modular UX components
│   ├── Sidebar.tsx     # Sidebar: profile swapping, onboarding, and hyperparameters
│   ├── ChatFeed.tsx    # Scrollable thread with inline grids and loading pipeline
│   ├── MovieGrid.tsx   # Grid containing movie recommendation cards
│   ├── MovieCard.tsx   # Movie card: descriptions, ratings, match metrics
│   └── DeveloperPanel.tsx # Widescreen console displaying prompts, logs, and exclusions
├── services/
│   └── api.ts          # Strictly typed Axios client matching backend Pydantic schemas
├── App.tsx             # State manager (orchestrates profiles, models, chats)
└── main.tsx            # React DOM injection point
```

---

## Core UX Workflows & Mechanics

### 1. Unified Conversational Grid Layout
- **Inline Bubbles**: Movie recommendations are embedded **directly inside the chatbot speech bubble** as a `MovieGrid`. This binds the AI's avatar and the movie cards into a single cohesive chat bubble.
- **Clean Replies**: When recommendations are fetched successfully, the generic textual message bubble is bypassed so the movie cards are rendered instantly next to the bot avatar.

### 2. Viewport Collision-Aware Tooltips
- **Usability**: Explanations for all pipeline sliders are rendered on `onMouseEnter` / `onMouseLeave` (traditional tooltip behavior).
- **The Clipping Bug Fix**: To prevent parent scroll containers (`overflow-y-auto` in Sidebar) from clipping the tooltip content, the tooltips are rendered at the viewport level using `position: fixed`.
- **Positioning Math**: A bounding rect calculation in `Sidebar.tsx`, `ChatFeed.tsx`, and `MovieCard.tsx` mathematically clamps the tooltip's `top` and `left` properties, keeping it 100% visible inside the browser window on any device.

### 3. Double-Width Resizable Insights Console
- **Default Width**: Starts with a double-width of `768px` to comfortably display dense technical data (prompts, raw LLM completions, and excluded candidates).
- **Draggable Divider**: A custom mouse-drag handler on the left border allows the user to resize the panel width between `350px` and `1000px` on the fly.
- **Verbatim LLM Parser**: Tab 3 of this panel automatically parses `<think>...</think>` tokens (Chain of Thought) from advanced reasoning models (like DeepSeek-R1) and separates them into a warm amber thinking box and a crisp emerald structured response box.

### 4. Continuous Rating Loop (Warm-Start Training)
- **Closed Loop**: Movie cards allow immediate 1 to 5 star ratings. Clicking a star immediately dispatches a `POST` to `/interactions` in MongoDB, enabling real-time training data collection for Collaborative Filtering.

---

## Hyperparameters Mapping

All settings from the backend `RecommendationSettings` schema are mapped to adjustable sliders in the `Sidebar`:
- **General**: Include RAG metadata (`include_metadata`), exclude seen movies (`exclude_seen`), and LLM retries (`retry`).
- **RAG (Cold-Start)**: Candidates retrieval limit (`ragCandidates`), recommendations limit (`ragRecommendations`), and diversity augmentation (`ragAugmentation`).
- **Collaborative Filtering (Warm-Start)**: Candidates limit (`cfCandidates`), recommendations limit (`cfRecommendations`), diversity augmentation (`cfAugmentation`), K-Nearest Neighbors (`cfKUsers`), and min rating threshold (`cfMinRating`).

---

## Standard Operations for Agents

- **Production Compilations**: Always run `npm run build` after making visual or state modifications. This guarantees that your TypeScript types compile cleanly and generates the unifed static assets served by FastAPI.
- **MIME & CSS Warnings**: Ensure that Tailwind directives use proper double quotes `@import "tailwindcss";` to prevent PostCSS compilation warnings.
