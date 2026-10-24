import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TopAppBar } from "./components/TopAppBar";
import { BottomNavBar, TabId } from "./components/BottomNavBar";
import { initNativeShell, haptic } from "./lib/native";
import { identifyUser, purchasePlan, restorePurchases } from "./lib/billing";
import { DashboardView } from "./components/DashboardView";
import { WorkoutsView } from "./components/WorkoutsView";
import { RoutinesView } from "./components/RoutinesView";
import { RecoveryView } from "./components/RecoveryView";
import { CommunityView } from "./components/CommunityView";
import { ProfileView } from "./components/ProfileView";
import { ProModal } from "./components/ProModal";
import { WorkoutSummaryModal } from "./components/WorkoutSummaryModal";
import { WelcomeStoriesView } from "./components/WelcomeStoriesView";
import { AuthView } from "./components/AuthView";
import { LegalView, LegalDocType } from "./components/LegalView";

// Firebase integration
import { auth, db } from "./firebase";
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, addDoc } from "firebase/firestore";

import {
  INITIAL_USER_PROFILE,
  INITIAL_MUSCLES,
  INITIAL_DUO_PARTNER,
  PRESET_ROUTINES,
  INITIAL_ACTIVE_WORKOUT,
  INITIAL_FEED,
  INITIAL_DUO_CHALLENGES,
} from "./data/mockData";
import {
  UserProfile,
  MuscleGroup,
  DuoPartner,
  Routine,
  ActiveWorkout,
  ActivityFeedItem,
  DuoChallenge,
  Unit,
  OnboardingPreferences,
} from "./types";

/** Pantallas de la app. Las 4 primeras son pestañas raíz; recovery es sub-pantalla; player es pantalla completa. */
type Screen = "home" | "chat" | "teams" | "profile" | "recovery" | "player";

/** Mapea ids legacy (de vistas existentes) a las nuevas pantallas. */
const LEGACY_ROUTES: Record<string, Screen> = {
  dashboard: "home",
  workouts: "player",
  routines: "teams",
  community: "chat",
  recovery: "recovery",
  profile: "profile",
  home: "home",
  chat: "chat",
  teams: "teams",
  player: "player",
};

const screenToTab = (s: Screen): TabId =>
  s === "chat" ? "chat" : s === "teams" ? "teams" : s === "profile" ? "profile" : "workouts";

const getInitialLegalScreen = (): LegalDocType | null => {
  if (typeof window === "undefined") return null;
  const path = window.location.pathname.toLowerCase().replace(/\/$/, "");
  if (path === "/privacy" || path === "/privacidad") return "privacy";
  if (path === "/terms" || path === "/terminos") return "terms";
  if (path === "/support" || path === "/soporte") return "support";
  if (path === "/delete-account" || path === "/eliminar-cuenta" || path === "/deletion") return "deletion";
  return null;
};

export default function App() {
  // Navegación & Bienvenida
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (getInitialLegalScreen()) return false;
    return localStorage.getItem("evolvy_onboarding_completed") !== "true";
  });
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocType | null>(() => getInitialLegalScreen());
  const [screen, setScreen] = useState<Screen>("home");
  const setCurrentTab = (id: string) => {
    setScreen(LEGACY_ROUTES[id] ?? "home");
    window.scrollTo({ top: 0 });
  };
  const [completedDays, setCompletedDays] = useState<number[]>([]);

  useEffect(() => {
    initNativeShell();
    const handlePopState = () => {
      setActiveLegalDoc(getInitialLegalScreen());
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleOpenLegal = (doc: LegalDocType) => {
    setActiveLegalDoc(doc);
    const route = doc === "deletion" ? "delete-account" : doc;
    window.history.pushState(null, "", `/${route}`);
  };

  const handleCloseLegal = () => {
    setActiveLegalDoc(null);
    window.history.pushState(null, "", "/");
  };

  const handleCompleteOnboarding = (preferences?: OnboardingPreferences) => {
    setShowWelcome(false);
    try {
      localStorage.setItem("evolvy_onboarding_completed", "true");
    } catch (e) {}

    if (preferences) {
      setUserProfile((prev) => {
        const updated: UserProfile = {
          ...prev,
          weeklyWorkoutsTarget: preferences.daysPerWeek,
          experienceLevel: preferences.experienceLevel,
          primaryGoal: preferences.goal,
          assignedTeam: preferences.teamName,
          assignedCoach: preferences.coachName,
        };

        if (currentUser) {
          setDoc(
            doc(db, "users", currentUser.uid),
            {
              weeklyWorkoutsTarget: updated.weeklyWorkoutsTarget,
              experienceLevel: updated.experienceLevel,
              primaryGoal: updated.primaryGoal,
              assignedTeam: updated.assignedTeam,
              assignedCoach: updated.assignedCoach,
            },
            { merge: true }
          ).catch((err) => console.warn("Firestore onboarding sync note:", err));
        }

        return updated;
      });
    }
  };
  const [unit, setUnit] = useState<Unit>("lbs");

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isTrialActive, setIsTrialActive] = useState<boolean>(true);

  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [muscles, setMuscles] = useState<MuscleGroup[]>(INITIAL_MUSCLES);
  const [duoPartner, setDuoPartner] = useState<DuoPartner>(INITIAL_DUO_PARTNER);
  const [routines, setRoutines] = useState<Routine[]>(PRESET_ROUTINES);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout>(INITIAL_ACTIVE_WORKOUT);
  const [feed, setFeed] = useState<ActivityFeedItem[]>(INITIAL_FEED);
  const [challenges, setChallenges] = useState<DuoChallenge[]>(INITIAL_DUO_CHALLENGES);

  // Modals state
  const [isProModalOpen, setIsProModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [lastWorkoutSummary, setLastWorkoutSummary] = useState<{
    totalVolume: number;
    elapsedSeconds: number;
    setsCompleted: number;
  }>({
    totalVolume: 0,
    elapsedSeconds: 0,
    setsCompleted: 0,
  });

  // Observe Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        let isPro = false;
        let daysRemaining = 7;
        let trialActive = true;

        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/user/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          });
          if (res.ok) {
            const status = await res.json();
            daysRemaining = status.daysRemaining;
            trialActive = status.isTrialActive;
            isPro = status.isPro || status.isTrialActive;
          }
        } catch (e) {
          console.warn("Backend status verification offline. Using local Firestore fallback:", e);
        }

        setTrialDaysRemaining(daysRemaining);
        setIsTrialActive(trialActive);
        
        setUserProfile((prev) => ({
          ...prev,
          name: user.displayName || user.email?.split("@")[0] || "Athlete",
          isPro: isPro,
        }));

        identifyUser(user.uid);
        await loadUserDataFromFirestore(user.uid);
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserDataFromFirestore = async (uid: string) => {
    try {
      const profileDoc = await getDoc(doc(db, "users", uid));
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        
        // Calculate local trial days remaining if server is offline
        const createdAt = data.createdAt || Date.now();
        const daysPassed = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, 7 - daysPassed);
        const trialActive = daysRemaining > 0;

        setTrialDaysRemaining((prev) => prev !== undefined ? prev : daysRemaining);
        setIsTrialActive((prev) => prev !== undefined ? prev : trialActive);

        setUserProfile((prev) => ({
          ...prev,
          ...data,
          isPro: prev.isPro || data.isPro || trialActive,
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Athlete",
        }));
      } else {
        // Save initial default profile
        const now = Date.now();
        await setDoc(doc(db, "users", uid), {
          completedWorkoutsCount: INITIAL_USER_PROFILE.completedWorkoutsCount,
          totalVolumeMovedLbs: INITIAL_USER_PROFILE.totalVolumeMovedLbs,
          experienceLevel: INITIAL_USER_PROFILE.experienceLevel,
          createdAt: now,
        }, { merge: true });

        setTrialDaysRemaining(7);
        setIsTrialActive(true);
        setUserProfile((prev) => ({
          ...prev,
          isPro: true, // trial is active on new registration
          name: auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "Athlete",
        }));
      }

      // Load routines
      const routinesSnap = await getDocs(collection(db, "users", uid, "routines"));
      if (!routinesSnap.empty) {
        const loadedRoutines: Routine[] = [];
        routinesSnap.forEach((doc) => {
          loadedRoutines.push({ id: doc.id, ...doc.data() } as Routine);
        });
        setRoutines(loadedRoutines);
      } else {
        // Populate default ones
        for (const routine of PRESET_ROUTINES) {
          await setDoc(doc(db, "users", uid, "routines", routine.id), routine);
        }
      }
    } catch (err) {
      console.error("Error loading data from Firestore:", err);
    }
  };

  // Handlers
  const handleStartWorkout = () => {
    if (!userProfile.isPro) {
      setIsProModalOpen(true);
      return;
    }
    setCurrentTab("workouts");
  };

  const handleOpenRecovery = () => {
    setCurrentTab("recovery");
  };

  const handleUpdateWorkout = (updated: ActiveWorkout) => {
    setActiveWorkout(updated);
  };

  const handleFinishWorkout = async (summary: {
    totalVolume: number;
    elapsedSeconds: number;
    setsCompleted: number;
  }) => {
    setLastWorkoutSummary(summary);
    setIsSummaryModalOpen(true);
    haptic.success();
    const todayIdx = (new Date().getDay() + 6) % 7;
    setCompletedDays((prev) => (prev.includes(todayIdx) ? prev : [...prev, todayIdx]));

    const updatedProfile = {
      ...userProfile,
      completedWorkoutsCount: userProfile.completedWorkoutsCount + 1,
      totalVolumeMovedLbs: userProfile.totalVolumeMovedLbs + summary.totalVolume,
    };
    setUserProfile(updatedProfile);

    // Sync stats to Firestore
    if (currentUser) {
      try {
        await setDoc(doc(db, "users", currentUser.uid), {
          completedWorkoutsCount: updatedProfile.completedWorkoutsCount,
          totalVolumeMovedLbs: updatedProfile.totalVolumeMovedLbs,
        }, { merge: true });

        // Save to workout history subcollection
        const newHistoryItem = {
          title: activeWorkout.title,
          category: activeWorkout.category || "HYPERTROPHY",
          completedAt: Date.now(),
          elapsedSeconds: summary.elapsedSeconds,
          totalVolume: summary.totalVolume,
          setsCompleted: summary.setsCompleted,
          exercises: activeWorkout.exercises.map(ex => ({
            name: ex.name,
            primaryMuscle: ex.primaryMuscle,
            sets: ex.sets.map(s => ({
              weight: s.weight,
              reps: s.reps,
              completed: s.completed,
              rpe: s.rpe || 8.0,
            })),
          })),
        };
        await addDoc(collection(db, "users", currentUser.uid, "workout_history"), newHistoryItem);
      } catch (err) {
        console.error("Error syncing workout to Firestore:", err);
      }
    }

    // Add activity feed item
    const newFeedItem: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      userName: userProfile.name,
      userAvatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBqACE7IgPZuLsrPMDpD8XsHL8se3GIuDlRBEg984yirxNAqkPWT57MZqwEsLCKIMh1gfWnHr-8vkdJSEgDpSD-QRpoyma79_uNp-pqr2b_slJ98noVKGSK00A58V_2y5aCVHF07r83mdAwtIFS7TaE7brvqrFGZpq9eDsTnjQKP_PiwUkFwsvv0tNU-HUIAqxhrZesieGGoCKJ-jTF7oppILH4v33LDE40pymgKoENAvzxzOCFltVeRg",
      action: "completed workout:",
      detail: `${activeWorkout.title} (${summary.totalVolume.toLocaleString()} ${unit})`,
      subtext: "Just now • Progressive Overload recorded",
      timestamp: "Just now",
      likes: 1,
      hasLiked: false,
      type: "WORKOUT_FINISH",
    };
    setFeed((prev) => [newFeedItem, ...prev]);
  };

  const handleCloseSummary = () => {
    setIsSummaryModalOpen(false);
    setCurrentTab("dashboard");
  };

  const handleLoadRoutineToActiveWorkout = (routine: Routine, dayIndex = 0) => {
    if (!userProfile.isPro) {
      setIsProModalOpen(true);
      return;
    }
    const selectedDay = routine.days[dayIndex] || routine.days[0];
    if (!selectedDay) return;

    const newActiveExercises = selectedDay.exercises.map((ex, idx) => {
      const targetSetsCount = parseInt(ex.targetSetsReps.split("x")[0]) || 3;
      const targetRepsCount = parseInt(ex.targetSetsReps.split("x")[1]) || 10;
      return {
        id: `ex-${idx}-${Date.now()}`,
        name: ex.name,
        primaryMuscle: routine.targetMuscles[0] || "Target",
        defaultWeight: ex.defaultWeight || 135,
        defaultReps: targetRepsCount,
        restSeconds: ex.restSeconds || 90,
        rpeTarget: ex.rpeTarget || 8.0,
        targetSetsReps: ex.targetSetsReps,
        imageUrl: ex.imageUrl,
        coachingTip: ex.coachingTip || "Maintain controlled eccentric and explosive concentric drive.",
        sets: Array.from({ length: targetSetsCount }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          weight: ex.defaultWeight || 135,
          reps: targetRepsCount,
          completed: false,
          rpe: ex.rpeTarget || 8.0,
        })),
      };
    });

    setActiveWorkout({
      id: `wkt-${Date.now()}`,
      title: `${routine.title} - ${selectedDay.title}`,
      startTime: Date.now(),
      elapsedSeconds: 0,
      isPaused: false,
      currentExerciseIndex: 0,
      exercises: newActiveExercises,
    });

    setCurrentTab("workouts");
  };

  const handleSaveNewRoutine = (newRoutine: Routine) => {
    setRoutines((prev) => [newRoutine, ...prev]);
  };

  const handleAddFeedReaction = (feedId: string) => {
    setFeed((prev) =>
      prev.map((item) => {
        if (item.id === feedId) {
          return {
            ...item,
            likes: item.hasLiked ? item.likes - 1 : item.likes + 1,
            hasLiked: !item.hasLiked,
          };
        }
        return item;
      })
    );
  };

  const handleAcceptChallenge = (challengeId: string) => {
    // Add active challenge confirmation
  };

  const handleUpgradeToPro = async (planType: "annual" | "monthly" = "annual") => {
    if (!currentUser) {
      setIsProModalOpen(false);
      return;
    }
    try {
      const res = await purchasePlan(planType, currentUser.uid);
      if (res.mode === "native") {
        if (res.success && res.isPro) {
          setUserProfile((prev) => ({ ...prev, isPro: true }));
          setIsProModalOpen(false);
        } else if (res.error) {
          alert(res.error);
        }
      }
    } catch (err) {
      console.error("Error in subscription flow:", err);
    }
  };

  const handleRestorePurchases = async () => {
    if (!currentUser) return;
    try {
      const res = await restorePurchases(currentUser.uid);
      if (res.isPro) {
        setUserProfile((prev) => ({ ...prev, isPro: true }));
        setIsProModalOpen(false);
      }
      alert(res.message);
    } catch (err: any) {
      alert(err?.message || "Error al restaurar compras.");
    }
  };

  if (activeLegalDoc) {
    return (
      <LegalView
        initialDoc={activeLegalDoc}
        onBack={handleCloseLegal}
        isStandalone={true}
      />
    );
  }

  if (showWelcome) {
    return <WelcomeStoriesView onComplete={handleCompleteOnboarding} />;
  }

  const isPlayer = screen === "player";
  const isRootTab = screen === "home" || screen === "chat" || screen === "teams" || screen === "profile";
  const subTitles: Partial<Record<Screen, string>> = {
    recovery: "Recuperación",
    player: activeWorkout.title,
  };

  const handleTabSelect = (tab: TabId) => {
    if (tab === "upgrade") {
      setIsProModalOpen(true);
      return;
    }
    setCurrentTab(tab === "workouts" ? "home" : tab);
  };

  return (
    <div className="min-h-[100dvh] bg-base text-white flex flex-col">
      {/* Header: tira semanal en Workouts; título + atrás en sub-pantallas */}
      {screen === "home" ? (
        <TopAppBar
          userProfile={userProfile}
          onOpenProfile={() => setCurrentTab("profile")}
          completedDays={completedDays}
        />
      ) : !isRootTab ? (
        <TopAppBar
          userProfile={userProfile}
          onOpenProfile={() => setCurrentTab("profile")}
          title={subTitles[screen]}
          onBack={() => setCurrentTab("home")}
        />
      ) : (
        <div className="pt-safe" />
      )}

      <main
        className={`flex-1 w-full max-w-xl mx-auto px-4 ${isPlayer ? "pb-safe" : "pb-tabbar"} ${
          isRootTab && screen !== "home" ? "pt-4" : ""
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: isRootTab ? 0 : 24, y: isRootTab ? 8 : 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: isRootTab ? 0 : -24 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          >
            {screen === "home" && (
              <DashboardView
                userProfile={userProfile}
                muscles={muscles}
                duoPartner={duoPartner}
                onStartWorkout={handleStartWorkout}
                onNavigateToTab={setCurrentTab}
                onOpenRecovery={handleOpenRecovery}
              />
            )}

            {screen === "player" && (
              <WorkoutsView
                activeWorkout={activeWorkout}
                unit={unit}
                onUpdateWorkout={handleUpdateWorkout}
                onFinishWorkout={handleFinishWorkout}
                onSwitchUnit={setUnit}
                onOpenRoutines={() => setCurrentTab("teams")}
              />
            )}

            {screen === "teams" && (
              <RoutinesView
                routines={routines}
                onLoadRoutineToActiveWorkout={handleLoadRoutineToActiveWorkout}
                onSaveRoutine={handleSaveNewRoutine}
              />
            )}

            {screen === "recovery" && (
              <RecoveryView
                muscles={muscles}
                readinessScore={userProfile.readinessScore}
                onGenerateSpecificRoutine={() => setCurrentTab("teams")}
              />
            )}

            {screen === "chat" && (
              <CommunityView
                duoPartner={duoPartner}
                feed={feed}
                challenges={challenges}
                onAddReaction={handleAddFeedReaction}
                onAcceptChallenge={handleAcceptChallenge}
                userWeeklyVolume={(userProfile.totalVolumeMovedLbs % 40000) + 12000}
              />
            )}

            {screen === "profile" && (
              <ProfileView
                userProfile={userProfile}
                unit={unit}
                onUpdateUnit={setUnit}
                onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
                onOpenPro={() => setIsProModalOpen(true)}
                onReplayWelcome={() => setShowWelcome(true)}
                onOpenLegal={handleOpenLegal}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Tab bar Ladder (oculta durante el entreno activo) */}
      {!isPlayer && (
        <BottomNavBar
          currentTab={screenToTab(screen)}
          onSelectTab={handleTabSelect}
          chatUnread={feed.length > 0}
          streakCount={completedDays.length || userProfile.completedWorkoutsCount % 10}
          isPro={userProfile.isPro}
        />
      )}

      {/* Evolvy Pro Upgrade Modal */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isPro={userProfile.isPro}
        onUpgrade={handleUpgradeToPro}
        onOpenLegal={(doc) => handleOpenLegal(doc)}
        onRestorePurchases={handleRestorePurchases}
      />

      {/* Workout Completion Celebratory Summary Modal */}
      <WorkoutSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={handleCloseSummary}
        summary={lastWorkoutSummary}
        unit={unit}
        partnerName={duoPartner.name}
      />
    </div>
  );
}
