var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_genai = require("@google/genai");
var import_vite = require("vite");
var import_stripe = __toESM(require("stripe"), 1);
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase-admin/firestore");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
var stripe = new import_stripe.default(process.env.STRIPE_SECRET_KEY || "mock_stripe_key_placeholder");
process.on("unhandledRejection", (reason) => {
  console.warn("Handled background unhandledRejection:", reason instanceof Error ? reason.message : reason);
});
var hasAdminCredentials = false;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if ((0, import_app.getApps)().length === 0) {
      (0, import_app.initializeApp)({
        credential: (0, import_app.cert)(serviceAccount)
      });
    }
    hasAdminCredentials = true;
  } else {
    console.info("Firebase Admin: No FIREBASE_SERVICE_ACCOUNT_JSON detected. Local dev will use fallback token processing.");
  }
} catch (error) {
  console.warn("Firebase Admin failed to initialize:", error);
}
app.post("/api/stripe/webhook", import_express.default.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    const rawBody = req.body;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
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
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    if (userId && hasAdminCredentials) {
      try {
        await (0, import_firestore.getFirestore)().collection("users").doc(userId).set(
          {
            isPro: true,
            stripeCustomerId: session.customer,
            subscriptionId: session.subscription
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
app.use(import_express.default.json({ limit: "10mb" }));
var aiClient = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new import_genai.GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "IronTrack" });
});
app.post("/api/stripe/create-checkout-session", async (req, res) => {
  try {
    const { userId, planType } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    const isAnnual = planType === "annual" || planType === "yearly";
    const priceAmount = isAnnual ? 3999 : 699;
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
              description: isAnnual ? "Full annual access to Evolvy Pro: AI periodization, muscle recovery telemetry, and team access. Includes 7-day free trial." : "Full monthly access to Evolvy Pro: AI periodization, muscle recovery telemetry, and team access."
            },
            unit_amount: priceAmount,
            recurring: {
              interval: priceInterval
            }
          },
          quantity: 1
        }
      ],
      mode: "subscription",
      subscription_data: isAnnual ? {
        trial_period_days: 7
      } : void 0,
      success_url: `${req.headers.origin || "http://localhost:3000"}/?payment=success`,
      cancel_url: `${req.headers.origin || "http://localhost:3000"}/?payment=cancel`,
      metadata: {
        userId,
        planType: isAnnual ? "annual" : "monthly"
      }
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Error creating checkout session" });
  }
});
app.post("/api/user/status", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "Missing ID Token" });
    let uid = "";
    let name = "Athlete";
    if (hasAdminCredentials) {
      try {
        const decodedToken = await (0, import_auth.getAuth)().verifyIdToken(idToken);
        uid = decodedToken.uid;
        name = decodedToken.name || decodedToken.email?.split("@")[0] || "Athlete";
        const userDoc = await (0, import_firestore.getFirestore)().collection("users").doc(uid).get();
        let userData = userDoc.data() || {};
        if (!userDoc.exists) {
          const now = Date.now();
          userData = {
            createdAt: now,
            isPro: false,
            name
          };
          await (0, import_firestore.getFirestore)().collection("users").doc(uid).set(userData);
        }
        const registrationDate = userData.createdAt || Date.now();
        const trialDurationMs = 7 * 24 * 60 * 60 * 1e3;
        const isTrialActive = Date.now() - registrationDate < trialDurationMs;
        const daysRemaining = Math.max(0, Math.ceil((registrationDate + trialDurationMs - Date.now()) / (24 * 60 * 60 * 1e3)));
        return res.json({
          uid,
          isPro: userData.isPro || false,
          isTrialActive,
          daysRemaining,
          createdAt: registrationDate
        });
      } catch (authErr) {
        console.warn("Admin token verification warning:", authErr);
      }
    }
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
      createdAt: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Authentication or status check error" });
  }
});
app.post("/api/routines/generate", async (req, res) => {
  try {
    const { equipment, goal, frequency, experienceLevel, focusArea, customNotes } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        routine: generateFallbackRoutine(equipment, goal, frequency, focusArea),
        isAiGenerated: false
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
          type: import_genai.Type.OBJECT,
          properties: {
            title: { type: import_genai.Type.STRING, description: "Title of the training protocol" },
            category: { type: import_genai.Type.STRING, description: "HYPERTROPHY, STRENGTH, CONDITIONING, or POWERLIFTING" },
            summary: { type: import_genai.Type.STRING, description: "Overview of the protocol" },
            weeklyFrequency: { type: import_genai.Type.INTEGER, description: "Days per week" },
            estimatedDurationMin: { type: import_genai.Type.INTEGER, description: "Average duration per session in minutes" },
            targetMuscles: {
              type: import_genai.Type.ARRAY,
              items: { type: import_genai.Type.STRING },
              description: "Main muscle groups primed or targeted"
            },
            days: {
              type: import_genai.Type.ARRAY,
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  dayNumber: { type: import_genai.Type.INTEGER },
                  title: { type: import_genai.Type.STRING },
                  focus: { type: import_genai.Type.STRING },
                  exercises: {
                    type: import_genai.Type.ARRAY,
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        id: { type: import_genai.Type.STRING },
                        name: { type: import_genai.Type.STRING },
                        targetSetsReps: { type: import_genai.Type.STRING },
                        defaultWeight: { type: import_genai.Type.NUMBER },
                        defaultReps: { type: import_genai.Type.INTEGER },
                        totalSets: { type: import_genai.Type.INTEGER },
                        restSeconds: { type: import_genai.Type.INTEGER },
                        rpeTarget: { type: import_genai.Type.NUMBER },
                        primaryMuscle: { type: import_genai.Type.STRING },
                        coachingTip: { type: import_genai.Type.STRING }
                      },
                      required: ["name", "targetSetsReps", "restSeconds", "rpeTarget", "primaryMuscle"]
                    }
                  }
                },
                required: ["dayNumber", "title", "focus", "exercises"]
              }
            }
          },
          required: ["title", "category", "summary", "weeklyFrequency", "estimatedDurationMin", "days"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    return res.json({ routine: parsed, isAiGenerated: true });
  } catch (error) {
    console.error("AI Routine Generation Error:", error);
    return res.json({
      routine: generateFallbackRoutine(
        req.body?.equipment,
        req.body?.goal,
        req.body?.frequency,
        req.body?.focusArea
      ),
      isAiGenerated: false,
      error: error instanceof Error ? error.message : "Error generating routine"
    });
  }
});
app.post("/api/recovery/advice", async (req, res) => {
  try {
    const { readiness, fatigueZones, primedZones, lastWorkout } = req.body;
    const ai = getAI();
    if (!ai) {
      return res.json({
        advice: `Readiness is at ${readiness || 78}%. Your primed muscle groups (${(primedZones || ["Chest", "Arms"]).join(", ")}) are ready for progressive overload. Take standard 90-120s rest intervals today.`,
        suggestedIntensity: readiness > 80 ? "HIGH" : readiness > 65 ? "MODERATE" : "DELOAD"
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
        systemInstruction: "You are the IronTrack biometric recovery coach. Provide sharp, industrial athleticism advice."
      }
    });
    res.json({
      advice: response.text || "Train primed muscles with progressive overload.",
      suggestedIntensity: readiness > 80 ? "HIGH" : readiness > 65 ? "MODERATE" : "DELOAD"
    });
  } catch (error) {
    res.json({
      advice: "Readiness is optimal for moderate intensity loading. Focus on execution and mechanical tension.",
      suggestedIntensity: "MODERATE"
    });
  }
});
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
          rpeTarget: 8,
          primaryMuscle: "Chest",
          coachingTip: "Retract scapulae and drive heels into floor for maximal arch stability."
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
          coachingTip: "Control the eccentric descent for 2 full seconds."
        },
        {
          id: "ex-3",
          name: "Overhead Dumbbell Shoulder Press",
          targetSetsReps: "3x10",
          defaultWeight: 22,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 75,
          rpeTarget: 8,
          primaryMuscle: "Shoulders",
          coachingTip: "Keep ribcage locked down; avoid excessive lumbar extension."
        },
        {
          id: "ex-4",
          name: "Cable Tricep Pushdowns",
          targetSetsReps: "3x12-15",
          defaultWeight: 35,
          defaultReps: 12,
          totalSets: 3,
          restSeconds: 60,
          rpeTarget: 9,
          primaryMuscle: "Triceps",
          coachingTip: "Flare rope at contraction apex to fully engage the lateral head."
        }
      ]
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
          coachingTip: "Pull the slack out of the bar before breaking floor contact."
        },
        {
          id: "ex-6",
          name: "Chest-Supported T-Bar Row",
          targetSetsReps: "3x8-10",
          defaultWeight: 60,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8,
          primaryMuscle: "Back",
          coachingTip: "Drive elbows behind torso and squeeze rhomboids for 1 second."
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
          coachingTip: "Initiate pull from depressed lats, not elbow flexors."
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
          coachingTip: "Keep upper arms perpendicular to floor to maintain stretch tension."
        }
      ]
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
          rpeTarget: 8,
          primaryMuscle: "Quads",
          coachingTip: "Maintain tripod foot pressure and descend below parallel with upright torso."
        },
        {
          id: "ex-10",
          name: "Romanian Deadlift (RDL)",
          targetSetsReps: "3x8-10",
          defaultWeight: 90,
          defaultReps: 8,
          totalSets: 3,
          restSeconds: 90,
          rpeTarget: 8,
          primaryMuscle: "Hamstrings",
          coachingTip: "Hinge hips straight back until deep stretch in hamstring belly."
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
          coachingTip: "Slight forward torso lean prioritizes glute and quad engagement."
        },
        {
          id: "ex-12",
          name: "Standing Calf Raises",
          targetSetsReps: "4x15",
          defaultWeight: 50,
          defaultReps: 15,
          totalSets: 4,
          restSeconds: 45,
          rpeTarget: 9,
          primaryMuscle: "Calves",
          coachingTip: "Pause 2 seconds at the deep stretch position."
        }
      ]
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
          rpeTarget: 8,
          primaryMuscle: "Shoulders",
          coachingTip: "Squeeze glutes and brace core to provide an unyielding base of power."
        },
        {
          id: "ex-14",
          name: "Neutral Grip Lat Pulldown",
          targetSetsReps: "3x10",
          defaultWeight: 70,
          defaultReps: 10,
          totalSets: 3,
          restSeconds: 75,
          rpeTarget: 8,
          primaryMuscle: "Back",
          coachingTip: "Control return phase to maximize eccentric hypertrophic stimulus."
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
          coachingTip: "Descend until upper arms are parallel to floor."
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
          coachingTip: "Isolate brachialis by preventing shoulder sway."
        }
      ]
    }
  ];
  return {
    title: `${goal.toUpperCase()} PROTOCOL (${equipment})`,
    category: isStrength ? "STRENGTH" : "HYPERTROPHY",
    summary: `Engineered ${numFreq}-day tactical progression designed for high mechanical tension, metabolic fatigue, and systemic recovery.`,
    weeklyFrequency: numFreq,
    estimatedDurationMin: isStrength ? 75 : 60,
    targetMuscles: ["Chest", "Quads", "Back", "Shoulders", "Arms", "Core"],
    days: defaultDays.slice(0, Math.min(numFreq, defaultDays.length))
  };
}
async function startServer() {
  const distPath = import_path.default.join(process.cwd(), "dist");
  const hasDist = import_fs.default.existsSync(distPath) && import_fs.default.existsSync(import_path.default.join(distPath, "index.html"));
  if (process.env.NODE_ENV !== "production" && !hasDist) {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Evolvy server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
