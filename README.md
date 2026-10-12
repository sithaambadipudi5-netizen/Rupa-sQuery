# RUPA's Query — Interactive SQL Learning & Mastery Platform

**RUPA's Query** is a full-stack, AI-powered interactive SQL learning platform built and designed by **Ambadipudi Rupavani**, a Computer Science & Engineering student at **Malla Reddy College of Engineering and Technology (MRCET)**.

---

## 🔗 Live Application Links

- **🌐 Live Production / Shared App**: [https://ais-pre-z2h4bofprah275lmufmu3s-460816146050.asia-southeast1.run.app](https://ais-pre-z2h4bofprah275lmufmu3s-460816146050.asia-southeast1.run.app)
- **🛠️ Development Preview App**: [https://ais-dev-z2h4bofprah275lmufmu3s-460816146050.asia-southeast1.run.app](https://ais-dev-z2h4bofprah275lmufmu3s-460816146050.asia-southeast1.run.app)

---

The platform provides a complete environment for learning, practicing, and mastering relational databases—featuring an in-browser WebAssembly SQL execution engine, a 12-module structured curriculum, 200+ auto-evaluated practice challenges, Gemini AI tutoring, real-time query debugging, interactive interview preparation, and cloud progress tracking.

---

## 🚀 Key Features

- **In-Browser SQLite Sandbox (WebAssembly)**: Run real SQL queries live in the browser using `sql.js` without installing or configuring local database servers.
- **12-Module Comprehensive Curriculum**: From SQL fundamentals and relational algebra up through advanced analytical window functions, indexing, and query plan optimization.
- **200+ Practice Problems**: Categorized by difficulty (Beginner, Intermediate, Advanced) with instant table diff validation and performance profiling.
- **Gemini AI SQL Tutor**: Integrated with Google Gemini AI for smart query reviews, syntax bug diagnosis, progressive Socratic hints, and conceptual explanations.
- **Technical Interview Simulator**: 60+ real-world interview scenarios tailored for top engineering and data analyst roles.
- **Interactive Schema Designer**: Visual entity-relationship diagramming and table schema inspector.
- **Personalized Notes & Bookmarks**: Save custom notes, bookmark challenging problems, and track learning progress with XP, streaks, and achievements.
- **Cloud Synchronization**: Optional Firebase Authentication and Firestore synchronization across devices.

---

## 🛠️ Technologies Used

### Frontend Architecture
- **React 19 (`react`, `react-dom`)**: Modern declarative user interface built with functional components and React hooks.
- **TypeScript 5.8**: Type-safe development across the entire client and server codebase.
- **Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss`)**: High-performance utility-first styling with responsive layouts and dark/light theme support.
- **Motion (`motion`)**: Fluid interface transitions, modal animations, and interactive feedback.
- **Lucide React (`lucide-react`)**: Clean, accessible icon system.
- **Recharts (`recharts`)**: Data visualization for query metrics, execution statistics, and progress analytics.
- **React Markdown (`react-markdown`)**: Rendering rich formatted AI tutor explanations and course markdown.
- **Canvas Confetti (`canvas-confetti`)**: Interactive reward animations upon solving problems and completing modules.

### Database & In-Browser Execution
- **SQL.js (`sql.js`)**: Port of SQLite to WebAssembly (WASM), allowing real database execution, constraint validation, transactions, and multi-table joins directly in client memory.

### Backend & API Layer
- **Node.js**: Modern JavaScript runtime.
- **Express.js (`express`)**: Server framework handling AI tutor endpoints, static file serving, and asset delivery.
- **Vite 6 (`vite`, `@vitejs/plugin-react`)**: Ultra-fast frontend development server and production bundler.
- **esbuild (`esbuild`)**: Bundles `server.ts` into a self-contained CommonJS production bundle (`dist/server.cjs`).
- **tsx (`tsx`)**: Direct execution of TypeScript server files in development mode without manual compilation steps.
- **dotenv (`dotenv`)**: Secure loading of environment variables.

### Artificial Intelligence
- **Google GenAI SDK (`@google/genai`)**: Server-side integration with Google Gemini models for real-time SQL tutoring, query review, and hints.

### Cloud Persistence & Authentication
- **Firebase v12 (`firebase`)**:
  - **Firebase Authentication**: User accounts with Google OAuth popup and email/password authentication.
  - **Cloud Firestore**: Persistent storage for user XP, solved problems, lesson completion, notes, bookmarks, and user profiles.

---

## 📦 Dependencies

### Runtime Dependencies (`dependencies`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `@google/genai` | `^2.4.0` | Official Google Gen AI TypeScript SDK for Gemini API integration |
| `@tailwindcss/vite` | `^4.1.14` | Vite plugin for Tailwind CSS v4 integration |
| `@types/canvas-confetti` | `^1.9.0` | TypeScript definitions for canvas-confetti |
| `@types/sql.js` | `^1.4.11` | TypeScript definitions for sql.js WebAssembly SQLite engine |
| `@vitejs/plugin-react` | `^5.0.4` | Vite official plugin for Fast Refresh and React JSX support |
| `canvas-confetti` | `^1.9.4` | Celebration confetti animations upon problem completion |
| `dotenv` | `^17.2.3` | Loads environment variables from `.env` |
| `express` | `^4.21.2` | Node.js web application framework |
| `firebase` | `^12.18.0` | Client SDK for Firebase Authentication and Firestore Database |
| `lucide-react` | `^0.546.0` | Vector icons used throughout the UI |
| `motion` | `^12.23.24` | Modern animation library for smooth UI transitions |
| `react` | `^19.0.1` | React core library |
| `react-dom` | `^19.0.1` | React DOM rendering library |
| `react-markdown` | `^10.1.0` | Markdown rendering component for AI tutor output |
| `recharts` | `^3.10.1` | Charting library for progress and query metrics |
| `sql.js` | `^1.14.2` | SQLite compiled to WebAssembly for browser-side database execution |
| `vite` | `^6.2.3` | Next-generation frontend build tool |

### Developer Dependencies (`devDependencies`)

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `@types/express` | `^4.17.21` | TypeScript types for Express.js |
| `@types/node` | `^22.14.0` | TypeScript definitions for Node.js runtime APIs |
| `autoprefixer` | `^10.4.21` | CSS vendor prefix tool |
| `esbuild` | `^0.25.0` | High-speed bundler to compile `server.ts` to `dist/server.cjs` |
| `tailwindcss` | `^4.1.14` | Utility-first CSS framework |
| `tsx` | `^4.21.0` | TypeScript execute engine for development mode |
| `typescript` | `~5.8.2` | TypeScript compiler and static type checker |

---

## 📂 Project Structure

```
.
├── public/                     # Static assets (images, sql-wasm.wasm)
│   ├── rupavani_profile.jpg    # Author portrait
│   └── sql-wasm.wasm           # WebAssembly SQLite binary
├── src/
│   ├── components/             # Reusable modular UI components
│   │   ├── ai/                 # AI Tutor chat panel and hints
│   │   ├── editor/             # SQL query editor and result tables
│   │   ├── layout/             # Header, Navigation, Footer
│   │   └── schema/             # Schema visualizer and database inspector
│   ├── context/                # Global state management
│   │   └── AppContext.tsx      # User profile, theme, bookmarks, auth state
│   ├── data/                   # Structured curriculum and problem sets
│   │   ├── courses.ts          # 12 course modules with lessons
│   │   ├── practiceProblems.ts # 200+ practice questions and test schemas
│   │   └── interviewQuestions.ts# Technical interview scenarios
│   ├── pages/                  # Top-level route views
│   │   ├── LandingHome.tsx     # Hero banner, feature overview, author tribute
│   │   ├── CoursesView.tsx     # Modular interactive SQL curriculum
│   │   ├── PracticeView.tsx    # Problem solving workspace with live validation
│   │   ├── SandboxView.tsx     # Custom SQL playground with sample databases
│   │   ├── InterviewPrepView.tsx# Technical interview question practice
│   │   ├── CheatsheetView.tsx  # SQL syntax cheatsheet & reference cards
│   │   ├── NotesView.tsx       # Personal SQL notebook & query notes
│   │   └── AboutAuthorView.tsx # Author profile, education, and career vision
│   ├── services/               # API clients and persistence
│   │   ├── firebase.ts         # Firebase configuration and auth helpers
│   │   ├── sqlEngine.ts        # sql.js WebAssembly initialization & execution
│   │   └── storageService.ts   # Local storage and state synchronization
│   ├── types.ts                # TypeScript interfaces and type declarations
│   ├── App.tsx                 # Primary application controller and navigation
│   ├── main.tsx                # Client application bootstrap
│   └── index.css               # Global CSS styling with Tailwind CSS v4
├── server.ts                   # Express server with Gemini AI Tutor endpoints
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── metadata.json               # Application metadata and capabilities
└── package.json                # Project dependencies and run scripts
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm or yarn

### Installation
```bash
# Clone the repository or navigate to the project directory
cd <project-directory>

# Install all dependencies
npm install
```

### Environment Setup
Create a `.env` file in the root directory (refer to `.env.example` if available):
```env
# Optional: Google Gemini API key for live AI Tutor explanations
GEMINI_API_KEY=your_gemini_api_key_here
```
*Note: If `GEMINI_API_KEY` is not provided, the platform automatically utilizes a built-in educational SQL analysis engine to provide structured hints and reviews.*

### Running in Development
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### Building for Production
```bash
npm run build
```
This runs `vite build` for the client assets and bundles `server.ts` into `dist/server.cjs` using `esbuild`.

### Starting the Production Server
```bash
npm start
```

---

## 👤 Author Information

- **Creator & Developer**: Ambadipudi Rupavani
- **Institution**: Malla Reddy College of Engineering and Technology (MRCET)
- **Specialization**: Computer Science & Engineering
- **Focus Areas**: Relational Database Design, SQL Query Optimization, Full-Stack Development
- **Email**: [sithaambadipudi5@gmail.com](mailto:sithaambadipudi5@gmail.com)
- **Phone**: +91 9701691282
- **Location**: Hyderabad, Telangana, India
- **Live Platform**: [https://ais-pre-z2h4bofprah275lmufmu3s-460816146050.asia-southeast1.run.app](https://ais-pre-z2h4bofprah275lmufmu3s-460816146050.asia-southeast1.run.app)
