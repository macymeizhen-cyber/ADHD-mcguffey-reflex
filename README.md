# BrainQuest: Reflex Engine — Setup Guide

An ADHD/dyslexia-friendly reading fluency intervention app for ages 7-14, built on the **Shadow Reading** methodology. Users read aloud, the Web Speech API scores their accuracy and speed, and gamified progression (streaks, points, mastery) keeps them motivated.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Speech**: Web Speech API (browser-native, no API keys required)

## 1. Install Dependencies
```bash
npm install
```

## 2. Set Up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. In the **SQL Editor**, run the contents of `supabase/schema.sql` (creates all tables, views, RLS policies, and the signup trigger)
3. Seed the 30 lessons (see below)
4. Go to **Project Settings → API** and copy the **Project URL** and **anon public key**

## 3. Configure Environment
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

## 4. Seed the Lessons
The app ships with 30 real, pedagogically-sound lessons in `src/data/lessons.ts`. A complete SQL insert is provided in **`supabase/seed-lessons.sql`** — run it in the Supabase SQL Editor to load all 30 lessons into the `lessons` table.

> If you later edit lessons in `src/data/lessons.ts`, regenerate the SQL by running:
> ```bash
> node -e "
> import('./src/data/lessons.ts').then(({LESSONS}) => {
>   const q = (s) => \"'\" + s.replace(/'/g, \"''\") + \"'\";
>   const rows = LESSONS.map(l => '(' + l.id + ', ' + q(l.title) + ', ' + q(l.content) + ', ARRAY[' + l.anchor_phrases.map(p => q(p)).join(', ') + '], ' + l.difficulty + ', ' + l.lesson_order + ', ' + q(JSON.stringify(l.quiz_data)) + '::jsonb)');
>   console.log('INSERT INTO lessons (id,title,content,anchor_phrases,difficulty,lesson_order,quiz_data) VALUES\n' + rows.join(',\n') + '\nON CONFLICT (id) DO NOTHING;');
> })
> "
> ```
> and paste the output into the SQL Editor.

## 5. Run the App
```bash
npm run dev
```
Open the printed local URL (default http://localhost:5173). Sign up, pick a lesson, and start shadow reading.

## Browser Support for Speech
Uses the browser-native Web Speech API (`SpeechRecognition`). Works best in **Chrome**, **Edge**, and **Safari**. Mobile Safari requires user permission for microphone. Firefox does not support `SpeechRecognition`.

## Environment Variables Reference
| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |
