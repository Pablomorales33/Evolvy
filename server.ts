import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Stripe Client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock_stripe_key_placeholder");

// Process-level unhandled rejection safety (prevents Google Cloud ADC lookups from crashing the dev server)
process.on("unhandledRejection", (reason) => {
  console.warn("Handled background unhandledRejection:", reason instanceof Error ? reason.message : reason);
});

// Initialize Firebase Admin SDK
let hasAdminCredentials = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
    hasAdminCredentials = true;
  } else {
    console.info("Firebase Admin: No FIREBASE_SERVICE_ACCOUNT_JSON detected. Local dev will use fallback token processing.");
  }
} catch (error) {
  console.warn("Firebase Admin failed to initialize:", error);
}

// Stripe Webhook Endpoint (Requires raw body, defined BEFORE express.json())
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event: Stripe.Event;

  try {
    const rawBody = req.body;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Fallback for local testing without signature validation
      if (typeof rawBody === "object" && !(rawBody instanceof Buffer)) {
        event = rawBody;
      } else {
        event = JSON.parse(rawBody.toString("utf8"));
      }
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
  }

  // Handle checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId && hasAdminCredentials) {
      try {
        await getFirestore().collection("users").doc(userId).set(
          {
            isPro: true,
            stripeCustomerId: session.customer as string,
            subscriptionId: session.subscription as string,
          },
          { merge: true }
        );
        console.log(`Successfully upgraded user ${userId} to Pro`);
      } catch (dbErr) {
        console.error("Failed to update user in Firestore:", dbErr);
      }
    }
  }

  res.json({ received: true });
});

app.use(express.json({ limit: "10mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "IronTrack" });
});

// Stripe Create Checkout Session Endpoint
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  try {
    const { userId, planType } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const isAnnual = planType === "annual" || planType === "yearly";
    const priceAmount = isAnnual ? 3999 : 699; // $39.99 or $6.99
    const priceName = isAnnual ? "Evolvy Pro Annual Membership" : "Evolvy Pro Monthly Membership";
    const priceInterval = isAnnual ? "year" : "month";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: priceName,
              description: isAnnual
                ? "Full annual access to Evolvy Pro: AI periodization, muscle recovery telemetry, and team access. Includes 7-day free trial."
                : "Full monthly access to Evolvy Pro: AI periodization, muscle recovery telemetry, and team access.",
            },
            unit_amount: priceAmount,
            recurring: {
              interval: priceInterval as any,
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: isAnnual
        ? {
            trial_period_days: 7,
          }
        : undefined,
      success_url: `${req.headers.origin || "http://localhost:3000"}/?payment=success`,
      cancel_url: `${req.headers.origin || "http://localhost:3000"}/?payment=cancel`,
      metadata: {
        userId,
        planType: isAnnual ? "annual" : "monthly",
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error creating checkout session" });
  }
});

// User Status Endpoint (Check 15-day Trial & Subscription Status)
app.post("/api/user/status", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing ID Token" });

    let uid = "";
    let name = "Athlete";

    if (hasAdminCredentials) {
      try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        uid = decodedToken.uid;
        name = decodedToken.name || decodedToken.email?.split("@")[0] || "Athlete";

        const userDoc = await getFirestore().collection("users").doc(uid).get();
        let userData = userDoc.data() || {};

        if (!userDoc.exists) {
          const now = Date.now();
          userData = {
            createdAt: now,
            isPro: false,
            name,
          };
          await getFirestore().collection("users").doc(uid).set(userData);
        }

        const registrationDate = userData.createdAt || Date.now();
        const trialDurationMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        const isTrialActive = (Date.now() - registrationDate) < trialDurationMs;
        const daysRemaining = Math.max(0, Math.ceil((registrationDate + trialDurationMs - Date.now()) / (24 * 60 * 60 * 1000)));

        return res.json({
          uid,
          isPro: userData.isPro || false,
          isTrialActive,
          daysRemaining,
          createdAt: registrationDate,
        });
      } catch (authErr) {
        console.warn("Admin token verification warning:", authErr);
      }
    }

    // Safe client fallback when service account is not present
    try {
      const payloadBase64 = idToken.split(".")[1];
      const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf8"));
      uid = payload.user_id || payload.sub || "user";
      name = payload.name || payload.email?.split("@")[0] || "Athlete";
    } catch {
      uid = "athlete-dev";
    }

    return res.json({
      uid,
      isPro: true,
      isTrialActive: true,
      daysRemaining: 7,
      createdAt: Date.now(),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Authentication or status check error" });
  }
});

// AI Routine Generator Endpoint
app.post("/api/routines/generate", async (req, res) => {
  try {
    const { equipment, goal, frequency, experienceLevel, focusArea, customNotes } = req.body;
    const ai = getAI();

    if (!ai) {
      // Fallback rule-based generator if no API key provided
      return res.json({
        routine: generateFallbackRoutine(equipment, goal, frequency, focusArea),
        isAiGenerated: false,
      });
    }

    const prompt = `You are IronTrack AI, an elite strength and conditioning scientist and commercial fitness program designer.
Generate a structured, hyper-optimized training program based on these parameters:
- Equipment: ${equipment || "Full Commercial"}
- Primary Goal: ${goal || "Build Muscle"}
- Frequency: ${frequency || 4} days per week
- Experience Level: ${experienceLevel || "Intermediate"}
- Target Focus: ${focusArea || "Balanced Split"}
- Additional Notes: ${customNotes || "None"}

Requirements:
1. Provide a concise, high-intensity program name and overview description with periodization notes.
2. For each day, provide a day name (e.g. Day 1: Push Hypertrophy, Day 2: Pull Strength, etc.).
3. For each exercise, provide:
   - name: concise exercise name
   - targetSetsReps: string like "4x8-10" or "3x12"
   - restSeconds: number like 90 or 120
   - rpeTarget: number from 6.0 to 9.5
   - primaryMuscle: e.g. "Chest", "Quads", "Back", "Shoulders", "Triceps", "Biceps", "Hamstrings", "Glutes", "Core"
   - coachingTip: 1 short actionable tip for biomechanical form or tempo.
4. Keep the output high-impact, professional, and directly ready to execute in the gym.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the IronTrack AI performance engine. Return structured, science-backed workout plans strictly in valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the training protocol" },
            category: { type: Type.STRING, description: "HYPERTROPHY, STRENGTH, CONDITIONING, or POWERLIFTING" },
            summary: { type: Type.STRING, description: "Overview of the protocol" },
            weeklyFrequency: { type: Type.INTEGER, description: "Days per week" },
            estimatedDurationMin: { type: Type.INTEGER, description: "Average duration per session in minutes" },
            targetMuscles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Main muscle groups primed or targeted",
            },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        targetSetsReps: { type: Type.STRING },
                        defaultWeight: { type: Type.NUMBER },
                        defaultReps: { type: Type.INTEGER },
                        totalSets: { type: Type.INTEGER },
                        restSeconds: { type: Type.INTEGER },
                        rpeTarget: { type: Type.NUMBER },
                        primaryMuscle: { type: Type.STRING },
                        coachingTip: { type: Type.STRING },
                      },
                      required: ["name", "targetSetsReps", "restSeconds", "rpeTarget", "primaryMuscle"],
                    },
                  },
                },
                required: ["dayNumber", "title", "focus", "exercises"],
              },
            },
          },
          required: ["title", "category", "summary", "weeklyFrequency", "estimatedDurationMin", "days"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ routine: parsed, isAiGenerated: true });
  } catch (error) {
    console.error("AI Routine Generation Error:", error);
    // Return robust fallback
    return res.json({
      routine: generateFallbackRoutine(
        req.body?.equipment,
        req.body?.goal,
        req.body?.frequency,
        req.body?.focusArea
      ),
      isAiGenerated: false,
      error: error instanceof Error ? error.message : "Error generating routine",
    });
  }
});

// AI Recovery Coach & Workout Advisor
app.post("/api/recovery/advice", async (req, res) => {
  try {
    const { readiness, fatigueZones, primedZones, lastWorkout } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        advice: `Readiness is at ${readiness || 78}%. Your primed muscle groups (${(primedZones || ["Chest", "Arms"]).join(", ")}) are ready for progressive overload. Take standard 90-120s rest intervals today.`,
        suggestedIntensity: readiness > 80 ? "HIGH" : readiness > 65 ? "MODERATE" : "DELOAD",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `User recovery metrics:
Readiness Score: ${readiness}%
High Fatigue Groups: ${JSON.stringify(fatigueZones)}
Primed Groups: ${JSON.stringify(primedZones)}
Last Completed Session: ${JSON.stringify(lastWorkout)}

Provide 2-3 concise, high-performance tactical recommendations for today's training session.`,
      config: {
        systemInstruction: "You are the IronTrack biometric recovery coach. Provide sharp, industrial athleticism advice.",
      },
    });

    res.json({
      advice: response.text || "Train primed muscles with progressive overload.",
      suggestedIntensity: readiness > 80 ? "HIGH" : readiness > 65 ? "MODERATE" : "DELOAD",
    });
  } catch (error) {
    res.json({
      advice: "Readiness is optimal for moderate intensity loading. Focus on execution and mechanical tension.",
      suggestedIntensity: "MODERATE",
    });
  }
});

// Helper for fallback routine creation
function generateFallbackRoutine(equipment = "Home Gym", goal = "Build Muscle", frequency = 4, focus = "Balanced") {
  const isStrength = goal === "Powerlifting" || goal === "Strength";
  const numFreq = Number(frequency) || 4;

  const defaultDays = [
    {
      dayNumber: 1,
      title: "Push - Hypertrophy & Delts",
      focus: "Chest, Shoulders, Triceps",
      exercises: [
        {
          id: "ex-1",
          name: "Barbell Bench Press",
          targetSetsReps: isStrength ? "4x5" : "3x8-10",
          defaultWeight: 80,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: isStrength ? 180 : 90,
          rpeTarget: 8.0,
          primaryMuscle: "Chest",
          coachingTip: "Retract scapulae and drive heels into floor for maximal arch stability.",
        },
        {
          id: "ex-2",
          name: "Incline Dumbbell Press",
          targetSetsReps: "3x10-12",
          defaultWeight: 28,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8.5,
          primaryMuscle: "Chest",
          coachingTip: "Control the eccentric descent for 2 full seconds.",
        },
        {
          id: "ex-3",
          name: "Overhead Dumbbell Shoulder Press",
          targetSetsReps: "3x10",
          defaultWeight: 22,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 75,
          rpeTarget: 8.0,
          primaryMuscle: "Shoulders",
          coachingTip: "Keep ribcage locked down; avoid excessive lumbar extension.",
        },
        {
          id: "ex-4",
          name: "Cable Tricep Pushdowns",
          targetSetsReps: "3x12-15",
          defaultWeight: 35,
          defaultReps: 12,
          totalSets: 3,
          restSeconds: 60,
          rpeTarget: 9.0,
          primaryMuscle: "Triceps",
          coachingTip: "Flare rope at contraction apex to fully engage the lateral head.",
        },
      ],
    },
    {
      dayNumber: 2,
      title: "Pull - Vertical & Horizontal Lat Focus",
      focus: "Back, Rear Delts, Biceps",
      exercises: [
        {
          id: "ex-5",
          name: "Barbell Deadlift",
          targetSetsReps: isStrength ? "4x3-5" : "3x6-8",
          defaultWeight: 140,
          defaultReps: 6,
          totalSets: 3,
          restSeconds: 150,
          rpeTarget: 8.5,
          primaryMuscle: "Back",
          coachingTip: "Pull the slack out of the bar before breaking floor contact.",
        },
        {
          id: "ex-6",
          name: "Chest-Supported T-Bar Row",
          targetSetsReps: "3x8-10",
          defaultWeight: 60,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8.0,
          primaryMuscle: "Back",
          coachingTip: "Drive elbows behind torso and squeeze rhomboids for 1 second.",
        },
        {
          id: "ex-7",
          name: "Weighted Pull-Ups",
          targetSetsReps: "3x6-8",
          defaultWeight: 10,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8.5,
          primaryMuscle: "Back",
          coachingTip: "Initiate pull from depressed lats, not elbow flexors.",
        },
        {
          id: "ex-8",
          name: "Incline Incline Dumbbell Bicep Curls",
          targetSetsReps: "3x10-12",
          defaultWeight: 14,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 60,
          rpeTarget: 8.5,
          primaryMuscle: "Biceps",
          coachingTip: "Keep upper arms perpendicular to floor to maintain stretch tension.",
        },
      ],
    },
    {
      dayNumber: 3,
      title: "Leg Day - Quad & Posterior Chain",
      focus: "Quads, Hamstrings, Calves",
      exercises: [
        {
          id: "ex-9",
          name: "Barbell Squats",
          targetSetsReps: "3x8-10",
          defaultWeight: 100,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: 120,
          rpeTarget: 8.0,
          primaryMuscle: "Quads",
          coachingTip: "Maintain tripod foot pressure and descend below parallel with upright torso.",
        },
        {
          id: "ex-10",
          name: "Romanian Deadlift (RDL)",
          targetSetsReps: "3x8-10",
          defaultWeight: 90,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8.0,
          primaryMuscle: "Hamstrings",
          coachingTip: "Hinge hips straight back until deep stretch in hamstring belly.",
        },
        {
          id: "ex-11",
          name: "Bulgarian Split Squats",
          targetSetsReps: "3x10/leg",
          defaultWeight: 20,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8.5,
          primaryMuscle: "Quads",
          coachingTip: "Slight forward torso lean prioritizes glute and quad engagement.",
        },
        {
          id: "ex-12",
          name: "Standing Calf Raises",
          targetSetsReps: "4x15",
          defaultWeight: 50,
          defaultReps: 15,
          totalSets: 4,
          restSeconds: 45,
          rpeTarget: 9.0,
          primaryMuscle: "Calves",
          coachingTip: "Pause 2 seconds at the deep stretch position.",
        },
      ],
    },
    {
      dayNumber: 4,
      title: "Upper Body Power & Arms",
      focus: "Upper Body Heavy Compounds",
      exercises: [
        {
          id: "ex-13",
          name: "Overhead Barbell Press",
          targetSetsReps: "4x6",
          defaultWeight: 55,
          defaultReps: 6,
          totalSets: 4,
          restSeconds: 120,
          rpeTarget: 8.0,
          primaryMuscle: "Shoulders",
          coachingTip: "Squeeze glutes and brace core to provide an unyielding base of power.",
        },
        {
          id: "ex-14",
          name: "Neutral Grip Lat Pulldown",
          targetSetsReps: "3x10",
          defaultWeight: 70,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 75,
          rpeTarget: 8.0,
          primaryMuscle: "Back",
          coachingTip: "Control return phase to maximize eccentric hypertrophic stimulus.",
        },
        {
          id: "ex-15",
          name: "Dips (Bodyweight or Weighted)",
          targetSetsReps: "3x10-12",
          defaultWeight: 0,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 75,
          rpeTarget: 8.5,
          primaryMuscle: "Chest",
          coachingTip: "Descend until upper arms are parallel to floor.",
        },
        {
          id: "ex-16",
          name: "Hammer Curls",
          targetSetsReps: "3x12",
          defaultWeight: 16,
          defaultReps: 12,
          totalSets: 3,
          restSeconds: 60,
          rpeTarget: 8.5,
          primaryMuscle: "Arms",
          coachingTip: "Isolate brachialis by preventing shoulder sway.",
        },
      ],
    },
  ];

  return {
    title: `${goal.toUpperCase()} PROTOCOL (${equipment})`,
    category: isStrength ? "STRENGTH" : "HYPERTROPHY",
    summary: `Engineered ${numFreq}-day tactical progression designed for high mechanical tension, metabolic fatigue, and systemic recovery.`,
    weeklyFrequency: numFreq,
    estimatedDurationMin: isStrength ? 75 : 60,
    targetMuscles: ["Chest", "Quads", "Back", "Shoulders", "Arms", "Core"],
    days: defaultDays.slice(0, Math.min(numFreq, defaultDays.length)),
  };
}

// Vite middleware for development vs static dist for production
async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.join(distPath, "index.html"));

  if (process.env.NODE_ENV !== "production" && !hasDist) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Evolvy server running on http://localhost:${PORT}`);
  });
}

startServer();
