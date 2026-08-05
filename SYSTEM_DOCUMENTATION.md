# Teacher Tool — System Architecture & Maintenance Documentation

**Founder & Lead Developer**: NKUNDIMANA Theogene  
**Contact**: (+250) 781 339 530 / (+250) 724 038 043  
**Platform**: Nkorera Education / AI Teacher Systems  
**Stack**: Full-Stack TypeScript (React 18 + Vite + Tailwind CSS + Node.js Express Server + Google Gemini 2.5 AI SDK + Firebase Firestore)

---

## 1. Application Overview

Teacher Tool is an AI-powered educational management platform designed for Rwandan primary and secondary school educators adhering to the **REB Competency-Based Curriculum (CBC)** standard. The application enables teachers to generate weekly lesson plans, diagnostic Remedial Learning Program (RLP) assessments, homework/quizzes with marking schemes, printable worksheets, interactive presentation slides, daily class diaries (Cahier de Textes), official school certificates with two signatories (Headteacher & Teacher), and manage mobile money (MoMo) subscriptions.

---

## 2. Directory & Folder Structure

```
/
├── server.ts                       # Entry point for Express REST API backend & Vite dev server middleware
├── firebase-applet-config.json     # Firebase client SDK initialization credentials
├── firebase-blueprint.json         # Firestore schema definition blueprint
├── firestore.rules                 # Security rules for cloud database collections
├── index.html                      # HTML entry point for Vite React SPA
├── metadata.json                   # AI Studio applet capabilities and permissions configuration
├── package.json                    # Dependencies, scripts (dev, build, start, lint)
├── vite.config.ts                  # Vite build and dev server configuration
├── SYSTEM_DOCUMENTATION.md         # Full system architecture documentation (this file)
│
├── src/                            # React Frontend Source Directory
│   ├── main.tsx                    # React DOM entry point
│   ├── App.tsx                     # Main application component & tab router
│   ├── index.css                   # Global Tailwind CSS imports & styles
│   ├── types.ts                    # Global TypeScript interfaces, types & data models
│   │
│   ├── components/                 # Extracted React Sub-Components
│   │   ├── Header.tsx              # Top navigation bar, language switcher, user badge, Help Center trigger
│   │   ├── HelpCenter.tsx          # Help Center modal, Video player/scripts, PDF guide viewer, AI Support Assistant Chat & Admin maintainer
│   │   ├── LessonPlanForm.tsx      # Standard REB CBC Lesson Plan Request Form
│   │   ├── LessonPlanView.tsx      # Interactive rendering & 1-page printable PDF of generated Lesson Plans
│   │   ├── RemedialPlanCreator.tsx # Remedial Learning Program (RLP 1-4) diagnostic planner
│   │   ├── NurseryPlanCreator.tsx  # Pre-primary & Nursery level AI lesson plan generator
│   │   ├── ExercisesCreator.tsx    # Homework, Classwork, Quizzes & Marking Scheme generator
│   │   ├── WorksheetsCreator.tsx   # Printable educational worksheets generator
│   │   ├── PresentationCreator.tsx # Interactive presentation slides & Teacher Notes generator
│   │   ├── ClassDiaryCreator.tsx   # Daily Cahier de Textes logbook & persistent tracker
│   │   ├── CertificateCreator.tsx  # Official school certificates generator (Headteacher & Teacher signatures)
│   │   ├── CertificateVerification.tsx # Public certificate authenticity verification page
│   │   ├── LibraryTab.tsx          # Saved lesson plans and exported documents repository
│   │   ├── HistoryTab.tsx          # User transaction and activity history log
│   │   ├── SubscriptionTab.tsx     # MoMo payment instructions (0781339530) & Tx Ref submission
│   │   ├── AdminPanel.tsx          # System administration dashboard for user approvals and top-ups
│   │   ├── FounderTab.tsx          # Information about founder Nkundimana Theogene & contact channels
│   │   ├── RoboticsAssistantWidget.tsx # Floating AI assistant widget for real-time guidance
│   │   ├── SignInModal.tsx         # User authentication & registration modal
│   │   ├── PolicyTermsModal.tsx    # Terms of Service & Privacy Policy modal
│   │   └── InstallPwaPrompt.tsx    # Progressive Web App installation prompt banner
│   │
│   └── data/                       # Static Configuration Data
│       ├── plans.ts                # Subscription pricing tiers, founder info, MoMo details
│       └── mockData.ts             # Default initial content fallbacks
│
└── public/                         # Static Assets (Images, Icons, Logos)
```

---

## 3. Dependency Graph & Technical Stack

```
                       ┌──────────────────────────────────────┐
                       │           Browser Client             │
                       │   React 18 / Tailwind CSS / Motion   │
                       └──────────────────┬───────────────────┘
                                          │
                                   HTTP / REST API
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │          Express Backend             │
                       │             (server.ts)              │
                       └──────────┬────────────────┬──────────┘
                                  │                │
             Gemini 2.5 AI SDK    │                │   Firestore Admin SDK
          (GoogleGenAI API Key)   │                │   (Firebase Database)
                                  ▼                ▼
                       ┌────────────────┐   ┌─────────────────┐
                       │  Gemini AI API │   │ Firebase Cloud  │
                       │  (Generative)  │   │   Firestore     │
                       └────────────────┘   └─────────────────┘
```

### Core Libraries
- **Frontend Core**: `react`, `react-dom`, `typescript`, `vite`
- **Styling & UI**: `tailwindcss`, `lucide-react` (icon set), `motion` (animations)
- **Backend & Server**: `express`, `tsx` (dev runtime), `esbuild` (CJS bundler)
- **AI Integration**: `@google/genai` (Google GenAI TypeScript SDK)
- **Database & Auth**: `firebase` (Firestore SDK & Authentication)

---

## 4. End-to-End Data Flow Architecture

### A. AI Generation Request Flow
1. User enters parameters (e.g. Subject, Grade, Competency Objective) in a component like `LessonPlanForm.tsx`.
2. Component sends a `POST` request to `/api/generate-lesson-plan` on `server.ts`.
3. `server.ts` validates the session token and user unit balance.
4. `server.ts` calls `GoogleGenAI` using `process.env.GEMINI_API_KEY` with structured JSON schema constraints.
5. Gemini generates the structured response (Lesson Plan, Marking Scheme, Slides, or Certificate metadata).
6. `server.ts` deducts 1 unit from the user's balance, logs the transaction to Firestore (`planLogs`), and returns the generated document.
7. Frontend renders the output with instant 1-page PDF print options.

### B. Help Center & Tutorial Maintenance Flow
1. User clicks the **Help Center** button in `Header.tsx`, opening `HelpCenter.tsx`.
2. Frontend queries `GET /api/tutorials` to load stored video scripts, guides, and FAQs from Firestore.
3. User asks a question in the AI Support Assistant chat -> `POST /api/help-center/chat-ai`.
4. Gemini generates a step-by-step response in Kinyarwanda/English with interactive navigation buttons (`suggestedAction`).
5. Admin users can generate new tutorials via `POST /api/tutorials/generate-ai-doc` or bump versions via `POST /api/tutorials/update-feature`.

---

## 5. Main Module Responsibilities

| Module | Purpose | File Location | Key API Endpoints |
|---|---|---|---|
| **Lesson Plans** | REB CBC weekly 1-page printable lesson plan generator | `src/components/LessonPlanForm.tsx` | `/api/generate-lesson-plan` |
| **Remedial RLP** | Remedial Learning Program (RLP 1-4) diagnostic planner | `src/components/RemedialPlanCreator.tsx` | `/api/generate-remedial-plan` |
| **Nursery Plans** | Pre-primary / Nursery level lesson planner | `src/components/NurseryPlanCreator.tsx` | `/api/generate-nursery-plan` |
| **Exercises & Quizzes** | Homework, Classwork & Marking Schemes | `src/components/ExercisesCreator.tsx` | `/api/generate-exercises` |
| **Worksheets** | Printable student exercise worksheets | `src/components/WorksheetsCreator.tsx` | `/api/generate-worksheets` |
| **Presentation Slides** | Presentation slide deck + Teacher Notes | `src/components/PresentationCreator.tsx` | `/api/generate-slides` |
| **Class Diary** | Cahier de Textes daily lesson tracker | `src/components/ClassDiaryCreator.tsx` | `/api/class-diaries` |
| **Certificates** | School Certificates with 2 Signatories & verification | `src/components/CertificateCreator.tsx` | `/api/certificates/generate`, `/api/certificates/verify/:id` |
| **Help Center** | Tutorials, Video scripts, Printable PDF guides & AI Assistant | `src/components/HelpCenter.tsx` | `/api/tutorials`, `/api/help-center/chat-ai` |
| **Subscription & Admin**| MoMo payments (0781339530) & Admin approval panel | `src/components/SubscriptionTab.tsx`, `AdminPanel.tsx` | `/api/payments/submit`, `/api/admin/approve-payment` |

---

## 6. Build & Deployment Pipeline

- **Development Mode**: `npm run dev` executes `tsx server.ts`, which boots the Express server on port `3000` and mounts Vite middleware (`appType: 'spa'`).
- **Production Build**: `npm run build` runs:
  1. `vite build` to compile client assets into `/dist`.
  2. `esbuild server.ts --bundle --platform=node --format=cjs --packages=external --outfile=dist/server.cjs` to bundle the backend server into a single CommonJS file.
- **Production Execution**: `npm run start` launches `node dist/server.cjs`, serving the static build from `/dist` and handling API routes natively.

---

## 7. Security & Environment Configuration

- **API Secret Key**: `GEMINI_API_KEY` is maintained strictly on the server side (`server.ts`) and is **never** exposed to client browser bundles.
- **Database Rules**: `firestore.rules` enforces secure read/write conditions on Firestore collections (`users`, `planLogs`, `tutorials`, `classDiaries`, `certificates`).
- **Owner Contact Info**: Nkundimana Theogene — MoMo: `0781339530`, Phone/WhatsApp: `0781339530` / `0724038043`.
