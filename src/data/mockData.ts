import { Routine, MuscleGroup, DuoPartner, ActivityFeedItem, DuoChallenge, PersonalRecord, UserProfile, ActiveWorkout, RoutineExerciseTemplate } from "../types";

export const INITIAL_PRS: PersonalRecord[] = [
  { id: "pr-1", exercise: "Barbell Squats", weight: 335, reps: 3, estimatedOneRepMax: 365, date: "2026-08-15", unit: "lbs" },
  { id: "pr-2", exercise: "Barbell Bench Press", weight: 245, reps: 5, estimatedOneRepMax: 275, date: "2026-08-20", unit: "lbs" },
  { id: "pr-3", exercise: "Conventional Deadlift", weight: 405, reps: 2, estimatedOneRepMax: 425, date: "2026-08-10", unit: "lbs" },
  { id: "pr-4", exercise: "Overhead Press", weight: 165, reps: 5, estimatedOneRepMax: 185, date: "2026-08-05", unit: "lbs" },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: "Pablo",
  experienceLevel: "Advanced",
  unit: "lbs",
  readinessScore: 94,
  weeklyWorkoutsTarget: 5,
  weeklyCompletedWorkouts: 3,
  completedWorkoutsCount: 48,
  totalVolumeMovedLbs: 342500,
  streakDays: 14,
  bodyweightLbs: 185,
  isPro: true,
  personalRecords: INITIAL_PRS,
};

export const INITIAL_DUO_PARTNER: DuoPartner = {
  id: "partner-1",
  name: "Alex",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMeZl52P3-A1SDRlfgrSNZqPRUr2u587kq636wFHMUKd9LoSfdAmGJ6eOwQT3ESsno1JpPpVKW_R5HvwC3wNfgAjXL7hATCVJGs6DHOC0544jBckGccD1LjSFw8GdsbYglPGWI83dI03Y4b21RzzFXx6nxmw91aWZRwbUKxF-u1uCVdMN5ru4EWW_AmIZxtAJdX_q0wSEA2RYQfSVPA9TMEqUI12LZ0BzLLHy5hFBhXKfeSOEBSISavw",
  status: "ONLINE",
  currentActivity: "Resting between sets of Deadlifts",
  weeklyVolumeLbs: 28200,
  targetVolumeLbs: 35000,
  streakDays: 14,
};

export const INITIAL_DUO_CHALLENGES: DuoChallenge[] = [
  {
    id: "chal-1",
    title: "Weekly Volume War",
    targetMetric: "Total Lbs Moved",
    userProgress: 24500,
    partnerProgress: 28200,
    targetTotal: 50000,
    unit: "lbs",
    daysRemaining: 2,
    isActive: true,
  },
  {
    id: "chal-2",
    title: "Leg Day Squat Blitz",
    targetMetric: "Squat Volume",
    userProgress: 8400,
    partnerProgress: 7200,
    targetTotal: 10000,
    unit: "lbs",
    daysRemaining: 4,
    isActive: true,
  },
];

export const INITIAL_FEED: ActivityFeedItem[] = [
  {
    id: "feed-1",
    userName: "Alex",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMeZl52P3-A1SDRlfgrSNZqPRUr2u587kq636wFHMUKd9LoSfdAmGJ6eOwQT3ESsno1JpPpVKW_R5HvwC3wNfgAjXL7hATCVJGs6DHOC0544jBckGccD1LjSFw8GdsbYglPGWI83dI03Y4b21RzzFXx6nxmw91aWZRwbUKxF-u1uCVdMN5ru4EWW_AmIZxtAJdX_q0wSEA2RYQfSVPA9TMEqUI12LZ0BzLLHy5hFBhXKfeSOEBSISavw",
    action: "finished a Set of",
    detail: "Deadlifts (315 lbs x 5)",
    subtext: "2 mins ago • RPE 9.0 • 3rd Set",
    timestamp: "2m ago",
    likes: 3,
    hasLiked: true,
    type: "SET_COMPLETE",
  },
  {
    id: "feed-2",
    userName: "Alex",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMeZl52P3-A1SDRlfgrSNZqPRUr2u587kq636wFHMUKd9LoSfdAmGJ6eOwQT3ESsno1JpPpVKW_R5HvwC3wNfgAjXL7hATCVJGs6DHOC0544jBckGccD1LjSFw8GdsbYglPGWI83dI03Y4b21RzzFXx6nxmw91aWZRwbUKxF-u1uCVdMN5ru4EWW_AmIZxtAJdX_q0wSEA2RYQfSVPA9TMEqUI12LZ0BzLLHy5hFBhXKfeSOEBSISavw",
    action: "started a workout:",
    detail: "Heavy Pull Protocol",
    subtext: "45 mins ago",
    timestamp: "45m ago",
    likes: 1,
    hasLiked: false,
    type: "WORKOUT_START",
  },
  {
    id: "feed-3",
    userName: "Sarah",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDIlzyfDBVNKRUeI5EchYvxeBp1J-_YSZLEd8g9eKQYJFgva9OwqQgpzrnQ67XR8-Ksk27Q00AqcqRd9pj06eDUGg2_CY6jty6kWqSrtFgPYFyP4In1wanjzlkXaTLcClZmKSBn0cm5aCmYxPwbStucCYEDbly-F9rayuBe5sTT5v2xiXqdB4_Eeh7JgygUe4YqllezdfbVH7OOJVr4UepYEJJGfkJbQlggJcjRfHRYWlqKoL7cxSuZ-w",
    action: "unlocked a new PR in",
    detail: "Barbell Squats",
    subtext: "Yesterday • 225 lbs x 8 reps (+15 lbs PR!)",
    timestamp: "1d ago",
    likes: 8,
    hasLiked: true,
    type: "PR_BROKEN",
  },
];

export const INITIAL_MUSCLES: MuscleGroup[] = [
  { id: "quads", name: "Quadriceps", fatiguePercent: 92, status: "FATIGUED", recRestHours: 24, lastTrainedDaysAgo: 1, view: "front" },
  { id: "glutes", name: "Glutes", fatiguePercent: 84, status: "FATIGUED", recRestHours: 24, lastTrainedDaysAgo: 1, view: "back" },
  { id: "chest", name: "Pectoralis (Chest)", fatiguePercent: 15, status: "PRIMED", recRestHours: 0, lastTrainedDaysAgo: 4, view: "front" },
  { id: "triceps", name: "Triceps Brachii", fatiguePercent: 20, status: "PRIMED", recRestHours: 0, lastTrainedDaysAgo: 4, view: "both" },
  { id: "biceps", name: "Biceps", fatiguePercent: 35, status: "PRIMED", recRestHours: 0, lastTrainedDaysAgo: 3, view: "front" },
  { id: "back", name: "Latissimus Dorsi", fatiguePercent: 45, status: "RECOVERING", recRestHours: 8, lastTrainedDaysAgo: 2, view: "back" },
  { id: "shoulders", name: "Deltoids", fatiguePercent: 28, status: "PRIMED", recRestHours: 0, lastTrainedDaysAgo: 4, view: "both" },
  { id: "hamstrings", name: "Hamstrings", fatiguePercent: 78, status: "FATIGUED", recRestHours: 18, lastTrainedDaysAgo: 1, view: "back" },
  { id: "calves", name: "Gastrocnemius", fatiguePercent: 50, status: "RECOVERING", recRestHours: 12, lastTrainedDaysAgo: 1, view: "both" },
  { id: "abs", name: "Abdominals / Core", fatiguePercent: 18, status: "PRIMED", recRestHours: 0, lastTrainedDaysAgo: 3, view: "front" },
];

export const PRESET_ROUTINES: Routine[] = [
  {
    id: "rt-ppl",
    title: "Push/Pull/Legs",
    category: "HYPERTROPHY",
    summary: "Classic 6-day hypertrophy split designed for maximal muscular cross-sectional area and progressive volume overload.",
    weeklyFrequency: 6,
    estimatedDurationMin: 60,
    targetMuscles: ["Chest", "Back", "Quads", "Shoulders", "Hamstrings", "Arms"],
    days: [
      {
        dayNumber: 1,
        title: "Push 1 - Heavy Chest & Triceps",
        focus: "Chest, Anterior Delts, Lateral Triceps",
        exercises: [
          { id: "e1", name: "Barbell Bench Press", targetSetsReps: "4x6-8", defaultWeight: 185, defaultReps: 8, totalSets: 4, restSeconds: 120, rpeTarget: 8.0, primaryMuscle: "Chest", coachingTip: "Pack lats, arch upper back, touch lower sternum." },
          { id: "e2", name: "Incline DB Press", targetSetsReps: "3x8-10", defaultWeight: 65, defaultReps: 8, totalSets: 3, restSeconds: 90, rpeTarget: 8.5, primaryMuscle: "Chest", coachingTip: "Set bench to 30 degrees to minimize anterior delt dominance." },
          { id: "e3", name: "Overhead Dumbbell Press", targetSetsReps: "3x10", defaultWeight: 50, defaultReps: 10, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Shoulders", coachingTip: "Press straight up, tuck chin slightly at lockout." },
          { id: "e4", name: "Rope Tricep Extensions", targetSetsReps: "3x12-15", defaultWeight: 55, defaultReps: 12, totalSets: 3, restSeconds: 60, rpeTarget: 9.0, primaryMuscle: "Triceps", coachingTip: "Spread ropes at bottom and hold peak contraction for 1 sec." },
        ],
      },
      {
        dayNumber: 2,
        title: "Pull 1 - Vertical Lat Dominance",
        focus: "Lats, Rhomboids, Biceps",
        exercises: [
          { id: "e5", name: "Weighted Neutral Pull-Ups", targetSetsReps: "4x6-8", defaultWeight: 25, defaultReps: 6, totalSets: 4, restSeconds: 120, rpeTarget: 8.5, primaryMuscle: "Back", coachingTip: "Drive elbows down to pockets, avoid swinging." },
          { id: "e6", name: "Barbell Bent-Over Row", targetSetsReps: "3x8-10", defaultWeight: 165, defaultReps: 8, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Back", coachingTip: "Torso at 45 degrees, pull barbell to belly button." },
          { id: "e7", name: "Incline DB Bicep Curls", targetSetsReps: "3x10-12", defaultWeight: 30, defaultReps: 10, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Biceps", coachingTip: "Full elbow extension at bottom for deep eccentric stretch." },
        ],
      },
      {
        dayNumber: 3,
        title: "Legs 1 - Quad & Squat Power",
        focus: "Quads, Adductors, Calves",
        exercises: [
          { id: "e8", name: "Barbell Back Squats", targetSetsReps: "3x8-10", defaultWeight: 225, defaultReps: 8, totalSets: 3, restSeconds: 120, rpeTarget: 8.0, primaryMuscle: "Quads", coachingTip: "Push knees out over toes, drive through midfoot." },
          { id: "e9", name: "Leg Press (Close Stance)", targetSetsReps: "3x12", defaultWeight: 380, defaultReps: 12, totalSets: 3, restSeconds: 90, rpeTarget: 8.5, primaryMuscle: "Quads", coachingTip: "Deep range without pelvis lifting from pad." },
          { id: "e10", name: "Standing Calf Raises", targetSetsReps: "4x15", defaultWeight: 135, defaultReps: 15, totalSets: 4, restSeconds: 45, rpeTarget: 9.0, primaryMuscle: "Calves", coachingTip: "2s pause at bottom stretch, 1s squeeze at top." },
        ],
      },
    ],
  },
  {
    id: "rt-lower",
    title: "Lower Body Focus",
    category: "STRENGTH",
    summary: "4-day heavy structural loading targeting the anterior and posterior kinetic chain with dedicated explosive accessory work.",
    weeklyFrequency: 4,
    estimatedDurationMin: 75,
    targetMuscles: ["Quads", "Hamstrings", "Glutes", "Calves", "Core"],
    days: [
      {
        dayNumber: 1,
        title: "Heavy Squat & Glute Drive",
        focus: "Quad Strength & Glutes",
        exercises: [
          { id: "e11", name: "Barbell Squats", targetSetsReps: "4x5", defaultWeight: 275, defaultReps: 5, totalSets: 4, restSeconds: 180, rpeTarget: 8.5, primaryMuscle: "Quads", coachingTip: "Brace hard with Valsalva maneuver before every rep." },
          { id: "e12", name: "Barbell Hip Thrusts", targetSetsReps: "3x8-10", defaultWeight: 315, defaultReps: 8, totalSets: 3, restSeconds: 120, rpeTarget: 8.5, primaryMuscle: "Glutes", coachingTip: "Full posterior pelvic tilt at top lockout." },
          { id: "e13", name: "Walking DB Lunges", targetSetsReps: "3x12/leg", defaultWeight: 50, defaultReps: 12, totalSets: 3, restSeconds: 90, rpeTarget: 8.5, primaryMuscle: "Quads", coachingTip: "Step long and stay balanced throughout." },
        ],
      },
      {
        dayNumber: 2,
        title: "Deadlift & Posterior Kinetic Chain",
        focus: "Hamstrings, Glutes, Lower Back",
        exercises: [
          { id: "e14", name: "Conventional Deadlift", targetSetsReps: "4x4", defaultWeight: 345, defaultReps: 4, totalSets: 4, restSeconds: 180, rpeTarget: 8.5, primaryMuscle: "Back", coachingTip: "Wedge hips in, drive floor away with quads." },
          { id: "e15", name: "Romanian Deadlift (RDL)", targetSetsReps: "3x8-10", defaultWeight: 225, defaultReps: 8, totalSets: 3, restSeconds: 120, rpeTarget: 8.0, primaryMuscle: "Hamstrings", coachingTip: "Keep bar skimmed close to shins." },
          { id: "e16", name: "Lying Leg Curls", targetSetsReps: "3x12", defaultWeight: 95, defaultReps: 12, totalSets: 3, restSeconds: 60, rpeTarget: 9.0, primaryMuscle: "Hamstrings", coachingTip: "Dorsiflex ankles for maximum hamstring contraction." },
        ],
      },
    ],
  },
];

export const INITIAL_ACTIVE_WORKOUT: ActiveWorkout = {
  id: "active-leg-day",
  title: "Leg Day - Hypertrophy",
  category: "HYPERTROPHY",
  targetMuscle: "Quads & Glutes",
  startTime: Date.now() - 45 * 60 * 1000 - 12 * 1000,
  elapsedSeconds: 45 * 60 + 12,
  isPaused: false,
  unit: "lbs",
  currentExerciseIndex: 0,
  exercises: [
    {
      id: "ex-squat",
      name: "Barbell Squats",
      targetSetsReps: "3x8-10",
      restSeconds: 120,
      rpeTarget: 8.0,
      primaryMuscle: "Quads",
      coachingTip: "Drive heels into the floor and maintain a neutral spine. Control the bottom stretch.",
      defaultWeight: 225,
      defaultReps: 8,
      sets: [
        { setNumber: 1, weight: 225, reps: 8, completed: true, rpe: 7.5, completedAt: Date.now() - 4 * 60 * 1000 },
        { setNumber: 2, weight: 225, reps: 8, completed: false, rpe: 8.0 },
        { setNumber: 3, weight: 225, reps: 8, completed: false, rpe: 8.0 },
      ],
    },
    {
      id: "ex-rdl",
      name: "Romanian Deadlift (RDL)",
      targetSetsReps: "3x8-10",
      restSeconds: 90,
      rpeTarget: 8.0,
      primaryMuscle: "Hamstrings",
      coachingTip: "Hinge hips straight backward until a strong hamstring stretch is achieved.",
      defaultWeight: 185,
      defaultReps: 8,
      sets: [
        { setNumber: 1, weight: 185, reps: 8, completed: false },
        { setNumber: 2, weight: 185, reps: 8, completed: false },
        { setNumber: 3, weight: 185, reps: 8, completed: false },
      ],
    },
    {
      id: "ex-legpress",
      name: "Leg Press",
      targetSetsReps: "3x10-12",
      restSeconds: 90,
      rpeTarget: 8.5,
      primaryMuscle: "Quads",
      coachingTip: "Place feet shoulder-width, avoid locking knees at top.",
      defaultWeight: 360,
      defaultReps: 10,
      sets: [
        { setNumber: 1, weight: 360, reps: 10, completed: false },
        { setNumber: 2, weight: 360, reps: 10, completed: false },
        { setNumber: 3, weight: 360, reps: 10, completed: false },
      ],
    },
    {
      id: "ex-calves",
      name: "Standing Calf Raises",
      targetSetsReps: "4x15",
      restSeconds: 60,
      rpeTarget: 9.0,
      primaryMuscle: "Calves",
      coachingTip: "Full pause at the bottom stretch position.",
      defaultWeight: 135,
      defaultReps: 15,
      sets: [
        { setNumber: 1, weight: 135, reps: 15, completed: false },
        { setNumber: 2, weight: 135, reps: 15, completed: false },
        { setNumber: 3, weight: 135, reps: 15, completed: false },
        { setNumber: 4, weight: 135, reps: 15, completed: false },
      ],
    },
  ],
};

export const ALL_EXERCISES_LIBRARY: RoutineExerciseTemplate[] = [
  { id: "lib-bench", name: "Barbell Bench Press", targetSetsReps: "4x8", defaultWeight: 135, defaultReps: 8, totalSets: 4, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Chest", coachingTip: "Pack your shoulders down and drive through your heels.", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-incline-db", name: "Incline Dumbbell Press", targetSetsReps: "3x10", defaultWeight: 50, defaultReps: 10, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Chest", coachingTip: "Keep dumbbells angled at 45 degrees for shoulder health.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-fly", name: "Cable Chest Fly", targetSetsReps: "3x12", defaultWeight: 30, defaultReps: 12, totalSets: 3, restSeconds: 75, rpeTarget: 8.5, primaryMuscle: "Chest", coachingTip: "Squeeze hands together at the peak contraction.", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-squat", name: "Barbell Squats", targetSetsReps: "3x8", defaultWeight: 185, defaultReps: 8, totalSets: 3, restSeconds: 120, rpeTarget: 8.0, primaryMuscle: "Quads", coachingTip: "Drive knees outward and squat below parallel.", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-legpress", name: "Leg Press", targetSetsReps: "3x10", defaultWeight: 360, defaultReps: 10, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Quads", coachingTip: "Lower slowly until knees are at 90 degrees.", imageUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-legext", name: "Leg Extensions", targetSetsReps: "3x12", defaultWeight: 120, defaultReps: 12, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Quads", coachingTip: "Hold the top contraction for 1 second.", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-deadlift", name: "Conventional Deadlift", targetSetsReps: "3x5", defaultWeight: 225, defaultReps: 5, totalSets: 3, restSeconds: 150, rpeTarget: 8.5, primaryMuscle: "Back", coachingTip: "Keep bar close to your shins and brace your core.", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-tbar", name: "Chest-Supported T-Bar Row", targetSetsReps: "3x8", defaultWeight: 90, defaultReps: 8, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Back", coachingTip: "Squeeze rhomboids together at the top of the pull.", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-pulldown", name: "Neutral Grip Lat Pulldown", targetSetsReps: "3x10", defaultWeight: 120, defaultReps: 10, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Back", coachingTip: "Pull with your elbows, not with your hands.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-rdl", name: "Romanian Deadlift (RDL)", targetSetsReps: "3x8", defaultWeight: 135, defaultReps: 8, totalSets: 3, restSeconds: 90, rpeTarget: 8.0, primaryMuscle: "Hamstrings", coachingTip: "Push hips back and feel the stretch in your hamstrings.", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-legcurl", name: "Lying Leg Curls", targetSetsReps: "3x12", defaultWeight: 80, defaultReps: 12, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Hamstrings", coachingTip: "Avoid letting your hips lift off the bench.", imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-ohp", name: "Overhead Barbell Press", targetSetsReps: "4x6", defaultWeight: 95, defaultReps: 6, totalSets: 4, restSeconds: 120, rpeTarget: 8.0, primaryMuscle: "Shoulders", coachingTip: "Brace glutes and abs to protect lower back.", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-latraise", name: "Lateral Raises", targetSetsReps: "3x15", defaultWeight: 15, defaultReps: 15, totalSets: 3, restSeconds: 60, rpeTarget: 9.0, primaryMuscle: "Shoulders", coachingTip: "Lead with your elbows and keep hands slightly lower.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-rear", name: "Reverse Cable Fly (Rear Delts)", targetSetsReps: "3x15", defaultWeight: 15, defaultReps: 15, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Shoulders", coachingTip: "Focus on pulling backward with the rear shoulders.", imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a25f1?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-curl", name: "Incline DB Bicep Curls", targetSetsReps: "3x10", defaultWeight: 25, defaultReps: 10, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Biceps", coachingTip: "Keep elbows pinned back as you curl.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-hammer", name: "Hammer Curls", targetSetsReps: "3x12", defaultWeight: 30, defaultReps: 12, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Biceps", coachingTip: "Squeeze the dumbell tight to engage brachioradialis.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-pushdown", name: "Cable Tricep Pushdowns", targetSetsReps: "3x12", defaultWeight: 50, defaultReps: 12, totalSets: 3, restSeconds: 60, rpeTarget: 8.5, primaryMuscle: "Triceps", coachingTip: "Lock elbows to side, flare rope outward at the bottom.", imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-dips", name: "Dips", targetSetsReps: "3x10", defaultWeight: 0, defaultReps: 10, totalSets: 3, restSeconds: 90, rpeTarget: 8.5, primaryMuscle: "Chest", coachingTip: "Lean forward to shift tension to the lower pectorals.", imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-calf", name: "Standing Calf Raises", targetSetsReps: "4x15", defaultWeight: 100, defaultReps: 15, totalSets: 4, restSeconds: 45, rpeTarget: 9.0, primaryMuscle: "Calves", coachingTip: "Hold the bottom stretch for 2 seconds before exploding up.", imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80" },
  { id: "lib-abs", name: "Hanging Leg Raises", targetSetsReps: "3x15", defaultWeight: 0, defaultReps: 15, totalSets: 3, restSeconds: 60, rpeTarget: 8.0, primaryMuscle: "Core", coachingTip: "Avoid swinging; lift legs using abdominal tension.", imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80" }
];

