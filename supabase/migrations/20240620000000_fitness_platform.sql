-- Fitness platform: onboarding, equipment, exercises, plans, analytics

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age IS NULL OR (age >= 13 AND age <= 120)),
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IS NULL OR gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC CHECK (height_cm IS NULL OR height_cm > 0),
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC CHECK (weight_kg IS NULL OR weight_kg > 0),
  ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IS NULL OR activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  ADD COLUMN IF NOT EXISTS goal TEXT CHECK (goal IS NULL OR goal IN ('stay_healthy', 'weight_loss', 'muscle_gain', 'strength_building', 'flexibility', 'posture_improvement')),
  ADD COLUMN IF NOT EXISTS bmi NUMERIC,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS user_equipment (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('dumbbells', 'resistance_bands', 'yoga_mat', 'pull_up_bar', 'bench')),
  detected_via TEXT DEFAULT 'manual' CHECK (detected_via IN ('manual', 'yolo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, equipment_type)
);

CREATE TABLE IF NOT EXISTS exercises (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fitness', 'strength_training', 'yoga', 'office_posture')),
  exercise_type TEXT NOT NULL DEFAULT 'hold' CHECK (exercise_type IN ('hold', 'rep')),
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  description TEXT,
  instructions TEXT[],
  ideal_angles JSONB DEFAULT '{}',
  demo_video_url TEXT,
  equipment_required TEXT[] DEFAULT '{}',
  target_reps INTEGER DEFAULT 10,
  target_sets INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  goal TEXT NOT NULL,
  bmi NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_plan_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS exercise_id UUID REFERENCES exercises(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS exercise_type TEXT DEFAULT 'hold',
  ADD COLUMN IF NOT EXISTS reps INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sets INTEGER DEFAULT 1;

-- Seed exercise catalog
INSERT INTO exercises (slug, name, category, exercise_type, difficulty, description, instructions, ideal_angles, demo_video_url, equipment_required, target_reps, target_sets)
VALUES
('squat', 'Squat', 'fitness', 'rep', 'beginner',
 'Lower-body compound movement for legs and glutes.',
 ARRAY['Feet shoulder-width apart', 'Chest up, core braced', 'Sit hips back and down', 'Knees track over toes', 'Drive through heels to stand'],
 '{"left_knee": 90, "right_knee": 90, "left_hip": 90, "right_hip": 90}'::jsonb,
 NULL, '{}', 12, 3),

('push-up', 'Push-up', 'fitness', 'rep', 'beginner',
 'Upper-body pushing exercise for chest, shoulders, and triceps.',
 ARRAY['Hands under shoulders', 'Body in straight line', 'Lower chest toward floor', 'Elbows ~45° from body', 'Push back up'],
 '{"left_elbow": 90, "right_elbow": 90}'::jsonb,
 NULL, '{}', 10, 3),

('lunge', 'Lunge', 'fitness', 'rep', 'beginner',
 'Single-leg strength and balance exercise.',
 ARRAY['Step one foot forward', 'Lower until front knee ~90°', 'Back knee hovers above floor', 'Torso upright', 'Push back to start'],
 '{"front_knee": 90, "back_knee": 90}'::jsonb,
 NULL, '{}', 10, 3),

('bicep-curl', 'Bicep Curl', 'strength_training', 'rep', 'beginner',
 'Isolation exercise for biceps using dumbbells or bands.',
 ARRAY['Stand tall, elbows at sides', 'Curl weight up without swinging', 'Squeeze at top', 'Lower with control'],
 '{"left_elbow": 40, "right_elbow": 40}'::jsonb,
 NULL, ARRAY['dumbbells'], 12, 3),

('shoulder-press', 'Shoulder Press', 'strength_training', 'rep', 'intermediate',
 'Overhead pressing movement for deltoids and triceps.',
 ARRAY['Start at shoulder height', 'Press weights overhead', 'Full extension without arching back', 'Lower with control'],
 '{"left_elbow": 170, "right_elbow": 170, "left_shoulder": 170, "right_shoulder": 170}'::jsonb,
 NULL, ARRAY['dumbbells', 'bench'], 10, 3),

('mountain-pose', 'Mountain Pose', 'yoga', 'hold', 'beginner',
 'Foundational standing pose for posture and balance.',
 ARRAY['Stand with feet together', 'Arms at sides', 'Weight evenly distributed', 'Spine tall', 'Shoulders relaxed'],
 '{"left_elbow": 175, "right_elbow": 175, "left_knee": 175, "right_knee": 175}'::jsonb,
 NULL, ARRAY['yoga_mat'], 0, 1),

('tree-pose', 'Tree Pose', 'yoga', 'hold', 'beginner',
 'Balancing pose that strengthens legs and improves focus.',
 ARRAY['Stand on one leg', 'Place foot on inner thigh', 'Hands in prayer', 'Gaze forward', 'Hold steady'],
 '{"standing_knee": 175, "raised_hip": 90, "left_elbow": 90, "right_elbow": 90}'::jsonb,
 NULL, ARRAY['yoga_mat'], 0, 1),

('warrior-pose', 'Warrior I', 'yoga', 'hold', 'intermediate',
 'Powerful standing pose building strength and stamina.',
 ARRAY['Step into lunge', 'Front knee over ankle', 'Back foot angled', 'Arms overhead', 'Hips square forward'],
 '{"front_knee": 90, "back_knee": 175, "left_elbow": 175, "right_elbow": 175}'::jsonb,
 NULL, ARRAY['yoga_mat'], 0, 1),

('cobra-pose', 'Cobra Pose', 'yoga', 'hold', 'beginner',
 'Backbend that strengthens spine and opens the chest.',
 ARRAY['Lie on stomach', 'Hands under shoulders', 'Press up slowly', 'Elbows slightly bent', 'Lift chest'],
 '{"left_elbow": 150, "right_elbow": 150, "left_shoulder": 45, "right_shoulder": 45}'::jsonb,
 NULL, ARRAY['yoga_mat'], 0, 1),

('desk-stretch', 'Desk Shoulder Stretch', 'office_posture', 'hold', 'beginner',
 'Office-friendly stretch to relieve shoulder and neck tension.',
 ARRAY['Sit or stand tall', 'Pull shoulder blades together', 'Chin slightly tucked', 'Hold 30 seconds', 'Breathe deeply'],
 '{"left_shoulder": 120, "right_shoulder": 120}'::jsonb,
 NULL, '{}', 0, 1),

('seated-twist', 'Seated Spinal Twist', 'office_posture', 'hold', 'beginner',
 'Gentle twist to improve spinal mobility at your desk.',
 ARRAY['Sit upright in chair', 'Rotate torso slowly', 'Keep hips facing forward', 'Hold each side', 'Breathe steadily'],
 '{"left_hip": 90, "right_hip": 90}'::jsonb,
 NULL, '{}', 0, 1)
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE user_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own equipment" ON user_equipment;
DROP POLICY IF EXISTS "Anyone reads exercises" ON exercises;
DROP POLICY IF EXISTS "Users manage own plans" ON workout_plans;
DROP POLICY IF EXISTS "Users read own plan items" ON workout_plan_items;

CREATE POLICY "Users manage own equipment" ON user_equipment FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone reads exercises" ON exercises FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own plans" ON workout_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own plan items" ON workout_plan_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_plans WHERE id = plan_id AND user_id = auth.uid())
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, onboarding_completed)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), NEW.email, false);
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;
