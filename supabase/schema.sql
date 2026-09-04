-- ============================================================
-- BrainQuest: Reflex Engine - Supabase Schema
-- Execute this in the Supabase SQL Editor for your project.
-- ============================================================

-- ---------- Tables ----------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  anchor_phrases TEXT[] NOT NULL,
  difficulty INTEGER CHECK (difficulty IN (1,2,3)),
  lesson_order INTEGER UNIQUE NOT NULL,
  quiz_data JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  lesson_id INTEGER REFERENCES lessons(id) NOT NULL,
  accuracy DECIMAL(5,2),
  speed DECIMAL(5,2),
  mastered BOOLEAN DEFAULT FALSE,
  transcript TEXT,
  attempt_duration_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_focus_points INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------- Views ----------
CREATE OR REPLACE VIEW user_progress AS
SELECT
  user_id,
  COUNT(DISTINCT CASE WHEN mastered THEN lesson_id END) AS mastered_count,
  COUNT(DISTINCT lesson_id) AS attempted_count,
  ROUND(AVG(accuracy)::numeric, 2) AS avg_accuracy,
  ROUND(AVG(speed)::numeric, 2) AS avg_speed
FROM attempts
GROUP BY user_id;

-- ---------- Row Level Security ----------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Attempts
CREATE POLICY "Users can insert own attempts"
  ON attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own attempts"
  ON attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Streaks
CREATE POLICY "Users can insert own streaks"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Lessons (public read, no auth needed)
CREATE POLICY "Lessons public read"
  ON lessons FOR SELECT
  USING (true);

-- ---------- Auto-create profile on signup ----------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
