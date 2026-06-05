# DealFlow CRM

**DealFlow** is a complete, production-ready, minimal CRM featuring a visual Kanban pipeline board, robust contact management, and AI-driven inline sales suggestions powered by Google Gemini.

Designed with a premium glassmorphic dark theme and built on top of React (Vite), Tailwind CSS, Supabase, and the official Google Gen AI SDK.

---

## Features

1. **Kanban Pipeline Board**: Group deals into columns representing stages (`Lead`, `Qualified`, `Proposal`, `Won`, `Lost`). Includes column count badges and real-time total pipeline dollar values.
2. **HTML5 Drag-and-Drop**: Drag deals across columns to instantly update their stage in the Supabase database. Alternatively, use the card's native stage dropdown selector.
3. **Contact Management**: Search, add, or delete contacts with full validation. Integrates database cascade deletions (deleting a contact deletes all their deals).
4. **Google Gemini API Stream**: Clicking "Suggest Next Action" on a deal card reads the title, stage, value, and contact info, sends it to Gemini, and streams actionable sales advice inline with smooth animations.
5. **Real-time Sync**: Full sync utilizing Supabase PostgreSQL subscription triggers and manual refetch cascades to guarantee instant frontend updates.

---

## Setup Instructions

### 1. Database Schema (Supabase)
1. Go to your [Supabase Dashboard](https://supabase.com) and open your project.
2. Navigate to the **SQL Editor** tab.
3. Paste the contents of [`supabase_schema.sql`](./supabase_schema.sql) into the editor.
4. Click **Run** to execute the script. This creates the `contacts` and `deals` tables, enables UUID generation, sets the check constraints, and configures Row Level Security (RLS) for public access.

### 2. Environment Configuration
1. In the root of this project, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your keys:
   - `VITE_SUPABASE_URL`: Your project URL (found under Project Settings > API).
   - `VITE_SUPABASE_ANON_KEY`: Your anonymous public key (found under Project Settings > API).
   - `VITE_GEMINI_API_KEY`: Your Google Gemini API Key (obtainable from [Google AI Studio](https://aistudio.google.com/)).

---

## Development & Build

### Install Dependencies
To install the package dependencies (React 19, Vite, `@supabase/supabase-js`, `@google/genai`, and Lucide Icons):
```bash
npm install
```

### Run Locally (Dev Server)
To run the developer server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
To bundle the client application into the static `dist/` directory for deployment:
```bash
npm run build
```

---

## Technology Stack
- **Frontend**: React 19 (Vite), Tailwind CSS v3 (Vanilla)
- **Icons**: Lucide React
- **Backend & Real-time**: Supabase (PostgreSQL)
- **AI Core**: Google Gemini (`gemini-2.5-flash` model via the official `@google/genai` SDK)
- **Architecture**: Single Page Application (SPA), serverless frontend client.
