-- workout_plan_items had SELECT-only RLS; inserts failed when saving plans

DROP POLICY IF EXISTS "Users read own plan items" ON workout_plan_items;
DROP POLICY IF EXISTS "Users manage own plan items" ON workout_plan_items;

CREATE POLICY "Users manage own plan items" ON workout_plan_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = workout_plan_items.plan_id
        AND workout_plans.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = workout_plan_items.plan_id
        AND workout_plans.user_id = auth.uid()
    )
  );
