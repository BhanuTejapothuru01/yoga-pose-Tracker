export const EXERCISE_IMAGE_MAP: Record<string, string> = {
  'Bicep Curl': '/exercises/bicep_curl.jpg',
  'Shoulder Press': '/exercises/shoulder_press.jpg',
  Squat: '/exercises/squat.jpg',
  'Push-up': '/exercises/push_up.jpg',
  Lunge: '/exercises/lunge.jpg',
  'Mountain Pose': '/exercises/mountain_pose.jpg',
  'Tree Pose': '/exercises/tree_pose.jpg',
  'Warrior I': '/exercises/warrior_1.jpg',
  'Warrior Pose': '/exercises/warrior_1.jpg',
  'Warrior II': '/exercises/warrior_2.jpg',
  'Cobra Pose': '/exercises/cobra_pose.jpg',
  'Child Pose': '/exercises/child_pose.jpg',
  'Triangle Pose': '/exercises/triangle_pose.jpg',
  'Crow Pose': '/exercises/crow_pose.jpg',
  'Chair Pose': '/exercises/chair_pose.jpg',
  'Boat Pose': '/exercises/boat_pose.jpg',
  'Desk Shoulder Stretch': '/exercises/desk_stretch.jpg',
  'Seated Spinal Twist': '/exercises/seated_twist.jpg',
}

export function getExerciseImage(poseName: string): string {
  return EXERCISE_IMAGE_MAP[poseName] || '/exercises/mountain_pose.jpg'
}

