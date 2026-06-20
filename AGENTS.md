# OpenCode Guidelines for ChatBot Web (chatbot-web)

## Context & Project Overview
- **Documentation**: The `README.md` file in this directory contains operational instructions for local development, production compiling, and unified FastAPI deployment. Please refer to it for deeper context.
- **Domain**: This is the unifed Single Page Application (SPA) frontend designed to interact with the `chat-bot-api` recommendation engine. It unifies conversational prompting with real-time vector metrics and pipeline debugging tools.
- **Goal**: Provide a highly visual, responsive, and educational "Research Workbench" side-by-side layout to test, tune, and evaluate the hybrid recommendation pipeline (RAG, CF, LLM).
- **Environment**: Node.js v26 + npm v11 (Vite 8 + React 19).

---

## Project Structure & Navigation
Always navigate to the correct directory before making modifications or starting development. This frontend project is completely separated from the backend thesis-paper and consists of the following modular structure:

- **`src/components/`**: Presentation and interactive UI components:
  - `Sidebar.tsx`: Handles profile management (creation, deletion, swapping), LLM model select, active context preferences summary, and the hyperparameter tuning sliders.
  - `ChatFeed.tsx`: Manages the scrollable chat history, prompt suggestions, pulsing loading states, and nested inline results.
  - `MovieGrid.tsx`: Displays the grid layout of recommended movie cards.
  - `MovieCard.tsx`: Ficha of individual recommended movies containing poster gradients, detailed descriptions, match similarity metrics, and interactive 5-star rating bars.
  - `DeveloperPanel.tsx`: Widescreen console that displays prompt templates, raw LLM completions (Chain of Thought), execution logs, and excluded candidates.
- **`src/services/`**:
  - `api.ts`: strictly-typed Axios HTTP client. Maps endpoints and models to the exact Pydantic schemas in the FastAPI backend.
- **`src/App.tsx`**: The main controller and composition root of the application, orchestrating global states, localStorage session caching, and asynchronous API calls.
- **`src/index.css`**: Global Tailwind CSS stylesheet containing the v4 compilation directives.
- **`dist/`**: Directory containing highly optimized static assets generated after executing `npm run build`. These compiled files are unifed and served directly from your FastAPI backend root URL.

---

## Architecture & Data Flow

1. **Session Initialization**: `App.tsx` loads all user profiles from MongoDB via `GET /api/v1/profiles` and active models via `GET /api/v1/recommendations/models` on mount, setting Gemma as the default LLM.
2. **Context Binding**: Swapping profiles in the `Sidebar` triggers automatic reloading of the chat conversation history (`GET /api/v1/histories/{email}`) and the user's explicit rating history (`GET /api/v1/interactions/users/{user_id}`).
3. **Conversational Inflow**: Typing a query and clicking Send adds the user's bubble and triggers the loading pipeline. It makes a `POST` request to `/api/v1/recommendations` with the active model and fine-tuned hyperparameters.
4. **Nesting & Result Resolution**: When the API responds, the raw generic text response is bypassed. The recommended movie grid (`MovieGrid`) is rendered directly inside the chatbot's speech bubble as a native child, avoiding layout shift and providing a natural chat flow.
5. **Interactive Feedback Loop**: Hovering over the stars on any card displays its purpose. Clicking a star registers a rating instantly in MongoDB via the `POST /api/v1/interactions` endpoint, which immediately recalibrates Collaborative Filtering calculations for future runs.

---

## Global Conventions

- **Strict Types**: Since TypeScript is configured with `verbatimModuleSyntax`, you MUST import types using `import type { ... }` (e.g. `import type { UserProfile } from '../services/api';`) to ensure clean compilation.
- **Widescreen Workbench**: App layout places the Chat Feed on the left/center and the DeveloperPanel on the right. The DeveloperPanel has a default width of `768px` but includes a draggable divider on its left border allowing researchers to resize it dynamically from `350px` to `1000px`.
- **Responsive Clamped Tooltips**: Interactive help guides for all sliders are rendered on hover. To avoid CSS scroll clipping inside parent containers, tooltips are rendered relative to the viewport using `fixed` positioning, and their coordinate boundaries are mathematically clamped in JS to prevent bleeding outside the browser window.

---

## Code Quality, Architecture & Testing Standards

### SOLID Principles in React
- **Single Responsibility Principle (SRP)**: Keep UI presentation components thin and detached from business logic. Views (`MovieCard`, `MovieGrid`) only receive state props and trigger events, while async fetch coordinates and state management are orchestrated entirely in `App.tsx` and the `api.ts` client.
- **Open/Closed Principle (OCP)**: Design components to be extensible via prop-based callbacks or `children` slots instead of hardcoding nested behaviors.
- **Dependency Inversion Principle (DIP)**: Components must depend on abstract interface definitions rather than concrete client implementations. All API functions are abstracted inside the `api` object in `api.ts`, making it straightforward to inject mock datasets during unit testing.

### Design Patterns (Patrones de Diseño)
- **Controller/Orchestrator Pattern**: `App.tsx` acts as the single source of truth and state orchestrator, distributing read-only states and event handlers down to presentation components.
- **Adapter/Mapper Pattern**: The Axios client in `api.ts` acts as an adapter, parsing raw JSON properties from FastAPI into strictly-typed TypeScript interfaces.
- **Composite Pattern**: Nesting modular UI parts (rendering the `MovieGrid` nested directly as a child of the `ChatFeed` speech bubble) to construct complex conversational layouts.

### Test-Driven Development (TDD)
- Unit test presentation elements (such as sliders, collapsible cards, and modal popups) using Vitest or Jest along with React Testing Library.
- Mock the Axios endpoints in `api.ts` deterministically during testing to verify that components render correct loading states (Pipeline tracker), success grids, and connection error banners without accessing skynet.

### CSS & Styling Quality
- Adhere to **Tailwind CSS v4** guidelines. Do not create complex custom stylesheets; instead, leverage utility-first classes and CSS variables defined in `@import "tailwindcss";`.
- Ensure all custom absolute elements (like custom selector arrows) are aligned mathematically using vertical flex centering or `top-1/2 -translate-y-1/2` to guarantee alignment on all viewports.
