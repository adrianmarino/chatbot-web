# Chatbot Web 🎬

An interactive, high-fidelity Web Client console designed for the Hybrid Recommendation System. This project was built to complement the Python-based `chat-bot-api` backend, enabling real-time conversational recommendation requests and advanced multi-modal visual result inspectability.

Developed under standards of both **Senior Software Engineering** and **User Experience (UX) Architecture**, this client provides researchers, evaluators, and users with a premium, sleek interface to test, visualize, and interact with complex candidate retrieval and Large Language Model ranking pipelines.

---

## 🎨 Key Features

1. **User Profile & Onboarding Management:**
   - Multi-profile selector to quickly alternate active context sessions and observe real-time differences in recommendation outputs.
   - Elegant, intuitive onboarding modal to register new user profiles with dynamic genre tag selectability and release year filters to resolve the **Cold-Start** problem.

2. **Reasoning Chat Interface (`ChatFeed.tsx`):**
   - Sleek speech bubble conversation feed with autocomplete prompt-suggestion chips to expedite testing.
   - **Pipeline Status Tracker:** Real-time feedback showing each stage of the hybrid execution process (Profile Loading 🔍 -> Retrieval/RAG/Collaborative Filtering 🧬 -> LLM Context Filtering 🤖 -> Metadata Augmentation 🎬).

3. **High-Fidelity Movie Grid & Interactive Feedback:**
   - Responsive flex-grid displaying recommended movies with styled procedural gradients acting as fallback poster images.
   - In-line star rating system (1-5) that registers ratings instantly in the MongoDB database via the `/interactions` endpoint, creating a **closed-loop feedback system** to update the collaborative filtering training sets.

4. **Deep Researcher & Developer Insights Drawer:**
   - Real-time pipeline latency/execution time tracking.
   - Live stream of backend execution logs.
   - **Prompt Auditor:** Complete syntax block showing the raw, context-injected prompt constructed and sent to the LLM.
   - **Raw Model Auditor:** Verbatim response from the LLM, retaining thinking tokens (`<think>...</think>`) when using advanced reasoning models like DeepSeek-R1.
   - **Excluded Candidate Visualizer:** Full details of candidates retrieved by the search databases but ultimately discarded by the LLM context filter.

---

## 🛠 Tech Stack

- **Framework:** React 19 (TypeScript)
- **Bundler:** Vite 8 (Ultra-fast Hot Module Replacement)
- **Styling:** Tailwind CSS v4 (Sleek layout, responsive grids, dark mode default)
- **Icons:** Lucide React
- **API Client:** Axios (Modular async handlers mapped strictly to backend DTO schemas)

---

## 📂 Project Structure

```text
chatbot-web/
├── src/
│   ├── components/         # Modular UX components
│   │   ├── Sidebar.tsx     # Session, profile creation & model selections
│   │   ├── ChatFeed.tsx    # Scrollable thread & live pipeline feedback
│   │   ├── MovieGrid.tsx   # Contenedor for recommendation cards
│   │   ├── MovieCard.tsx   # Poster card with why-rec, stars, similarity metrics
│   │   └── DeveloperPanel.tsx # Sliding panel auditing prompt, raw AI & exclusions
│   ├── services/
│   │   └── api.ts          # Strictly-typed HTTP client wrapping all endpoints
│   ├── App.tsx             # Root orchestration & global states
│   ├── main.tsx            # DOM initialization
│   └── index.css           # Global Tailwind import
├── dist/                   # Compiled production-grade client build
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Local Development (HMR)
Start the Vite local server with live-reloading:
```bash
npm run dev
```
By default, the development server will run on `http://localhost:5173`. It connects to the skynet backend at `http://nonosoft.ddns.net:8080/api/v1` via Axios.

### 3. Production Build & FastAPI Hosting
To package the app for production and host it directly from your `chat-bot-api` FastAPI server (which unifies both frontend and backend onto a single port, e.g. `8080`):

1. Compile the React assets:
   ```bash
   npm run build
   ```
   This will generate a highly optimized bundle inside the `dist/` directory.

2. Ensure your FastAPI backend has the mounting configuration set up in its `api.py`:
   ```python
   app.mount("/", StaticFiles(directory="/home/adrian/development/personal/maestria/chatbot-web/dist", html=True), name="static")
   ```

3. Start or reload your backend. Now, visiting **`http://localhost:8080/`** (or your skynet domain) will serve the full web client!
