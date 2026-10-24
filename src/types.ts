export type Unit = "KG" | "LBS" | "kg" | "lbs";

export interface WorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
  completedAt?: number;
  setType?: "NORMAL" | "WARMUP" | "DROP" | "FAILURE";
}

export interface Exercise {
  id: string;
  name: string;
  targetSetsReps: string;
  restSeconds: number;
  rpeTarget: number;
  primaryMuscle: string;
  coachingTip?: string;
  defaultWeight: number;
  defaultReps: number;
  sets: WorkoutSet[];
  imageUrl?: string;
  previousPerformance?: string[]; // e.g. ["225 lbs x 8", "225 lbs x 7"]
}

export interface ActiveWorkout {
  id: string;
  title: string;
  category?: "HYPERTROPHY" | "STRENGTH" | "CONDITIONING" | "POWERLIFTING";
  targetMuscle?: string;
  startTime?: number;
  elapsedSeconds: number;
  isPaused: boolean;
  exercises: Exercise[];
  currentExerciseIndex: number;
  unit?: Unit;
}

export interface RoutineExerciseTemplate {
  id: string;
  name: string;
  targetSetsReps: string;
  defaultWeight: number;
  defaultReps: number;
  totalSets: number;
  restSeconds: number;
  rpeTarget: number;
  primaryMuscle: string;
  coachingTip?: string;
  imageUrl?: string;
}

export interface RoutineDay {
  dayNumber: number;
  title: string;
  focus: string;
  exercises: RoutineExerciseTemplate[];
}

export interface Routine {
  id: string;
  title: string;
  category: "HYPERTROPHY" | "STRENGTH" | "CONDITIONING" | "POWERLIFTING" | string;
  summary: string;
  weeklyFrequency: number;
  estimatedDurationMin: number;
  targetMuscles: string[];
  days: RoutineDay[];
  isAiGenerated?: boolean;
}

export interface MuscleGroup {
  id: string;
  name: string;
  fatiguePercent: number; // 0 to 100
  status: "FATIGUED" | "RECOVERING" | "PRIMED";
  recRestHours: number;
  lastTrainedDaysAgo: number;
  view: "front" | "back" | "both";
  svgPath?: string;
}

export interface DuoPartner {
  id: string;
  name: string;
  avatarUrl: string;
  status: "ONLINE" | "IN_WORKOUT" | "OFFLINE";
  currentActivity?: string;
  weeklyVolumeLbs: number;
  targetVolumeLbs: number;
  streakDays: number;
}

export interface ActivityFeedItem {
  id: string;
  userName: string;
  userAvatar: string;
  action: string;
  detail: string;
  subtext: string;
  timestamp?: string;
  likes: number;
  hasLiked: boolean;
  type?: "SET_COMPLETE" | "WORKOUT_START" | "WORKOUT_FINISH" | "PR_BROKEN" | "CHALLENGE";
}

export interface DuoChallenge {
  id: string;
  title: string;
  targetMetric: string;
  userProgress: number;
  partnerProgress: number;
  targetTotal: number;
  unit: string;
  daysRemaining: number;
  isActive: boolean;
}

export interface PersonalRecord {
  id?: string;
  exercise: string;
  weight: number;
  reps: number;
  estimatedOneRepMax?: number;
  date: string;
  unit?: Unit;
}

export interface OnboardingPreferences {
  goal: "hypertrophy" | "strength" | "athletic";
  daysPerWeek: number;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Elite";
  teamName: string;
  coachName: string;
}

export interface UserProfile {
  name: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Elite";
  unit: Unit;
  readinessScore: number;
  weeklyWorkoutsTarget: number;
  weeklyCompletedWorkouts: number;
  completedWorkoutsCount: number;
  totalVolumeMovedLbs: number;
  streakDays: number;
  bodyweightLbs: number;
  isPro: boolean;
  personalRecords: PersonalRecord[];
  primaryGoal?: "hypertrophy" | "strength" | "athletic";
  assignedTeam?: string;
  assignedCoach?: string;
}
