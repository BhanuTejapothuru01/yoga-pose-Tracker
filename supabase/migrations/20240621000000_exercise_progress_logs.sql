-- Exercise logs (per session detail) and progress logs (daily aggregates)

CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  exercise_slug TEXT,
  category TEXT,
  exercise_type TEXT DEFAULT 'hold',
  reps INTEGER DEFAULT 0,
  sets INTEGER DEFAULT 1,
  form_score FLOAT NOT NULL DEFAULT 0 CHECK (form_score >= 0 AND form_score <= 100),
  classification TEXT NOT NULL DEFAULT 'needs_adjustment'
    CHECK (classification IN ('correct', 'incorrect', 'needs_adjustment')),
  duration_seconds INTEGER DEFAULT 0,
  feedback_log TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  average_form_score FLOAT DEFAULT 0,
  exercises_completed TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_user ON exercise_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_logs_session ON exercise_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_date ON progress_logs(user_id, log_date DESC);

ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users insert own exercise logs" ON exercise_logs;
DROP POLICY IF EXISTS "Users manage own progress logs" ON progress_logs;

CREATE POLICY "Users read own exercise logs" ON exercise_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own exercise logs" ON exercise_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own progress logs" ON progress_logs
  FOR ALL USING (auth.uid() = user_id);
