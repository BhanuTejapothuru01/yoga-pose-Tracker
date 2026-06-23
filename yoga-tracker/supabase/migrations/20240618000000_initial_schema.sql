-- Yoga Tracker initial schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yoga poses table
CREATE TABLE IF NOT EXISTS yoga_poses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  instructions TEXT[],
  ideal_angles JSONB,
  keypoints JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  pose_id UUID REFERENCES yoga_poses(id) ON DELETE SET NULL,
  pose_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  accuracy FLOAT NOT NULL DEFAULT 0 CHECK (accuracy >= 0 AND accuracy <= 100),
  confidence FLOAT NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  calories_burned FLOAT DEFAULT 0,
  feedback_log TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_session_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default yoga poses (idempotent)
INSERT INTO yoga_poses (name, difficulty, description, instructions, ideal_angles, keypoints)
SELECT * FROM (VALUES
('Mountain Pose', 'beginner',
 'A foundational standing pose that improves posture and balance.',
 ARRAY['Stand with feet together', 'Arms at sides', 'Weight evenly distributed', 'Spine tall', 'Shoulders relaxed'],
 '{"left_elbow": 175, "right_elbow": 175, "left_knee": 175, "right_knee": 175, "left_hip": 175, "right_hip": 175}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 23, 24, 25, 26]}'::jsonb),

('Tree Pose', 'beginner',
 'A balancing pose that strengthens legs and improves focus.',
 ARRAY['Stand on one leg', 'Place other foot on inner thigh', 'Hands in prayer position', 'Gaze forward', 'Hold steady'],
 '{"standing_knee": 175, "raised_hip": 90, "left_elbow": 90, "right_elbow": 90}'::jsonb,
 '{"landmarks": [11, 12, 23, 24, 25, 26, 27, 28]}'::jsonb),

('Child Pose', 'beginner',
 'A resting pose that gently stretches the hips, thighs, and lower back.',
 ARRAY['Kneel on floor', 'Touch big toes together', 'Sit on heels', 'Stretch arms forward', 'Rest forehead on mat'],
 '{"left_hip": 45, "right_hip": 45, "left_knee": 30, "right_knee": 30}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 23, 24, 25, 26]}'::jsonb),

('Cobra Pose', 'beginner',
 'A backbend that strengthens the spine and opens the chest.',
 ARRAY['Lie on stomach', 'Place hands under shoulders', 'Press up slowly', 'Keep elbows slightly bent', 'Lift chest'],
 '{"left_elbow": 150, "right_elbow": 150, "left_shoulder": 45, "right_shoulder": 45}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 23, 24]}'::jsonb),

('Warrior I', 'intermediate',
 'A powerful standing pose that builds strength and stamina.',
 ARRAY['Step one foot forward into lunge', 'Back foot at 45 degrees', 'Front knee over ankle', 'Arms raised overhead', 'Hips square forward'],
 '{"front_knee": 90, "back_knee": 175, "left_elbow": 175, "right_elbow": 175, "hip": 90}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 23, 24, 25, 26, 27, 28]}'::jsonb),

('Warrior II', 'intermediate',
 'Builds leg strength and improves stability and concentration.',
 ARRAY['Wide stance', 'Front knee bent at 90 degrees', 'Arms extended parallel to floor', 'Gaze over front hand', 'Shoulders relaxed'],
 '{"front_knee": 90, "back_knee": 175, "left_elbow": 175, "right_elbow": 175, "left_shoulder": 90, "right_shoulder": 90}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 23, 24, 25, 26]}'::jsonb),

('Triangle Pose', 'intermediate',
 'A lateral stretch that strengthens legs and opens the torso.',
 ARRAY['Wide stance', 'Reach one hand to ankle', 'Other arm straight up', 'Both legs straight', 'Open chest to ceiling'],
 '{"left_knee": 175, "right_knee": 175, "left_hip": 45, "right_hip": 135}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 15, 16, 23, 24]}'::jsonb),

('Crow Pose', 'advanced',
 'An arm balance that builds core strength and body awareness.',
 ARRAY['Squat low', 'Place hands shoulder-width apart', 'Knees on upper arms', 'Lean forward slowly', 'Lift feet off ground'],
 '{"left_elbow": 90, "right_elbow": 90, "left_hip": 60, "right_hip": 60}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 15, 16, 23, 24]}'::jsonb),

('Chair Pose', 'advanced',
 'A challenging squat that strengthens legs and core.',
 ARRAY['Feet together', 'Bend knees deeply', 'Thighs parallel to floor', 'Arms overhead', 'Torso slightly forward'],
 '{"left_knee": 90, "right_knee": 90, "left_hip": 90, "right_hip": 90, "left_elbow": 175, "right_elbow": 175}'::jsonb,
 '{"landmarks": [11, 12, 13, 14, 23, 24, 25, 26]}'::jsonb),

('Boat Pose', 'advanced',
 'A core strengthener that improves balance and digestion.',
 ARRAY['Sit on floor', 'Lean back slightly', 'Lift legs to 45 degrees', 'Arms parallel to floor', 'Spine straight'],
 '{"left_hip": 90, "right_hip": 90, "left_knee": 175, "right_knee": 175, "left_elbow": 175, "right_elbow": 175}'::jsonb,
 '{"landmarks": [11, 12, 23, 24, 25, 26]}'::jsonb)
) AS v(name, difficulty, description, instructions, ideal_angles, keypoints)
WHERE NOT EXISTS (SELECT 1 FROM yoga_poses LIMIT 1);

-- Row Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoga_poses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users read own sessions" ON sessions;
DROP POLICY IF EXISTS "Users insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users read own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users upsert own streak" ON user_streaks;
DROP POLICY IF EXISTS "Anyone reads poses" ON yoga_poses;
DROP POLICY IF EXISTS "Admin manages poses" ON yoga_poses;

CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users read own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users read own streak" ON user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own streak" ON user_streaks FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone reads poses" ON yoga_poses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manages poses" ON yoga_poses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), NEW.email);
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
