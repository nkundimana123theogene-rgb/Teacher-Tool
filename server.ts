import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { SUBSCRIPTION_PLANS, OWNER_INFO } from "./src/data/plans";
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit 
} from "firebase/firestore";

dotenv.config();

// Load Firebase configuration
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
} catch (err) {
  console.error("Error loading firebase config:", err);
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google Gen AI
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "dummy-key-for-init",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Robust Gemini AI execution helper with automatic model fallback and rate-limit backoff retry
async function callGeminiWithRetry(options: { contents: any; config?: any }) {
  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-flash-lite"
  ];

  const ai = getGenAI();
  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config
      });
      if (response) return response;
    } catch (err: any) {
      lastError = err;
      const errStr = String(err?.message || err || "").toLowerCase();
      console.warn(`[Gemini API Retry Engine] Model ${model} failed (attempt ${i + 1}/${modelsToTry.length}):`, errStr);
      
      const isRateLimit = errStr.includes("429") || 
                          errStr.includes("rate") || 
                          errStr.includes("quota") || 
                          errStr.includes("resource_exhausted") || 
                          errStr.includes("overloaded") ||
                          errStr.includes("limit");

      const backoffMs = isRateLimit ? (i + 1) * 700 : 250;
      await new Promise((res) => setTimeout(res, backoffMs));
    }
  }

  throw lastError || new Error("All Gemini AI models are currently rate-limited or unavailable.");
}

// Initialize Firebase App & Firestore
let db: any = null;
if (firebaseConfig) {
  try {
    const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || undefined);
    console.log("Firebase initialized successfully with project ID:", firebaseConfig.projectId);
  } catch (err) {
    console.error("Failed to initialize Firebase app:", err);
  }
} else {
  console.warn("firebaseConfig not loaded, database operations will fallback to in-memory.");
}

// In-memory payment store & sample data for owner NKUNDIMANA Theogene (synced with Firestore)
let paymentSubmissions: any[] = [
  {
    id: "pay_1001",
    userEmail: "nkundimana123theogene@gmail.com",
    userName: "NKUNDIMANA Theogene",
    userPhone: "0781339530",
    planId: "plan_25",
    planLabel: "25 Lesson Plans",
    amountFrw: 2000,
    plansCount: 25,
    momoTxRef: "0781339530",
    momoNumber: "0781339530",
    status: "approved",
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "pay_1002",
    userEmail: "nkundimana123theogene@gmail.com",
    userName: "NKUNDIMANA Theogene",
    userPhone: "0781339530",
    planId: "plan_50",
    planLabel: "50 Lesson Plans",
    amountFrw: 4000,
    plansCount: 50,
    momoTxRef: "0781339530",
    momoNumber: "0781339530",
    status: "pending",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  }
];

// In-memory generated lesson plans log for admin tracking (synced with Firestore)
let generatedPlanLogs: any[] = [
  {
    id: "log_demo1",
    userEmail: "nkundimana123theogene@gmail.com",
    userName: "NKUNDIMANA Theogene (Educator)",
    subject: "Mathematics",
    classGrade: "Primary 5",
    unitTitle: "Fractions and Decimals",
    lessonTitle: "Converting Common Fractions to Decimal Fractions",
    language: "English",
    format: "reb_grid",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    schoolName: "GS Remera Catholique",
    instructionalObjective: "By the end of the lesson, given illustrative charts and exercise sheets, learners will be able to convert common fractions into decimals accurately within 40 minutes."
  },
  {
    id: "log_demo2",
    userEmail: "nkundimana123theogene@gmail.com",
    userName: "NKUNDIMANA Theogene (Admin)",
    subject: "Kinyarwanda",
    classGrade: "Senior 2",
    unitTitle: "Ikinyabupfura n'Umutekano",
    lessonTitle: "Inyandiko y'Umutekano mu Muhanda",
    language: "Kinyarwanda",
    format: "reb_grid",
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
    schoolName: "Kigali Parents School",
    instructionalObjective: "Mu mpera z'isomo, nyuma yo gusoma inyandiko ku mutekano, abanyeshuri bazaba bashobora gusesengura amategeko y'umuhanda ku kigero cya 90%."
  },
  {
    id: "log_demo3",
    userEmail: "nkundimana123theogene@gmail.com",
    userName: "NKUNDIMANA Theogene (Educator)",
    subject: "Physics",
    classGrade: "Senior 4 MPC",
    unitTitle: "Newtonian Kinematics",
    lessonTitle: "Equations of Linear Motion with Uniform Acceleration",
    language: "English",
    format: "reb_grid",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    schoolName: "GS Saint Andre",
    instructionalObjective: "By the end of the lesson, learners will be able to derive and apply the 3 equations of motion to solve numerical problems accurately."
  }
];

// User accounts simulated database state (synced with Firestore)
let userDatabase: Record<string, any> = {
  "nkundimana123theogene@gmail.com": {
    id: "usr_owner",
    name: "NKUNDIMANA Theogene",
    email: "nkundimana123theogene@gmail.com",
    phone: "0781339530",
    country: "Rwanda",
    currentPlan: "Unlimited Admin / VIP",
    remainingPlans: 9999,
    totalGenerated: 42,
    isAdmin: true,
    authProvider: "google",
    password: "123",
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    lastLoginAt: new Date().toISOString(),
    status: "active",
    loginCount: 18,
  }
};

// In-memory verification codes store for Forgot Password feature (synced with Firestore)
let resetCodesDatabase: Record<string, { code: string; expiresAt: number }> = {};

// In-memory class diaries store (synced with Firestore)
let classDiariesLogs: any[] = [];

// -------------------------------------------------------------
// FIRESTORE SYNC & ACCESS UTILS
// -------------------------------------------------------------

async function getFirestoreUser(email: string): Promise<any> {
  const cleanEmail = email.toLowerCase().trim();
  if (db) {
    try {
      const userRef = doc(db, "users", cleanEmail);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const u = userSnap.data();
        userDatabase[cleanEmail] = u; // Keep cache fresh
        return u;
      }
    } catch (err) {
      console.error("Error getting user from Firestore:", err);
    }
  }
  return userDatabase[cleanEmail] || null;
}

async function saveFirestoreUser(email: string, userData: any): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  userDatabase[cleanEmail] = userData; // Update local cache
  if (db) {
    try {
      const userRef = doc(db, "users", cleanEmail);
      await setDoc(userRef, userData, { merge: true });
    } catch (err) {
      console.error("Error saving user to Firestore:", err);
    }
  }
}

async function getFirestorePayments(): Promise<any[]> {
  if (db) {
    try {
      const paymentsCol = collection(db, "payments");
      const q = query(paymentsCol, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      if (list.length > 0) {
        paymentSubmissions = list;
      }
      return list;
    } catch (err) {
      console.error("Error getting payments from Firestore:", err);
    }
  }
  return paymentSubmissions;
}

async function saveFirestorePayment(payment: any): Promise<void> {
  const idx = paymentSubmissions.findIndex(p => p.id === payment.id);
  if (idx > -1) {
    paymentSubmissions[idx] = payment;
  } else {
    paymentSubmissions.unshift(payment);
  }
  if (db) {
    try {
      const payRef = doc(db, "payments", payment.id);
      await setDoc(payRef, payment);
    } catch (err) {
      console.error("Error saving payment to Firestore:", err);
    }
  }
}

async function getFirestorePlanLogs(): Promise<any[]> {
  if (db) {
    try {
      const logsCol = collection(db, "planLogs");
      const q = query(logsCol, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      if (list.length > 0) {
        generatedPlanLogs = list;
      }
      return list;
    } catch (err) {
      console.error("Error getting plan logs from Firestore:", err);
    }
  }
  return generatedPlanLogs;
}

async function saveFirestorePlanLog(log: any): Promise<void> {
  const idx = generatedPlanLogs.findIndex(l => l.id === log.id);
  if (idx > -1) {
    generatedPlanLogs[idx] = log;
  } else {
    generatedPlanLogs.unshift(log);
  }
  if (db) {
    try {
      const logRef = doc(db, "planLogs", log.id);
      await setDoc(logRef, log);
    } catch (err) {
      console.error("Error saving plan log to Firestore:", err);
    }
  }
}

async function getFirestoreResetCode(email: string): Promise<any> {
  const cleanEmail = email.toLowerCase().trim();
  if (db) {
    try {
      const resetRef = doc(db, "resetCodes", cleanEmail);
      const resetSnap = await getDoc(resetRef);
      if (resetSnap.exists()) {
        const data = resetSnap.data();
        resetCodesDatabase[cleanEmail] = data as any;
        return data;
      }
    } catch (err) {
      console.error("Error getting reset code from Firestore:", err);
    }
  }
  return resetCodesDatabase[cleanEmail] || null;
}

async function saveFirestoreResetCode(email: string, codeData: any): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  resetCodesDatabase[cleanEmail] = codeData;
  if (db) {
    try {
      const resetRef = doc(db, "resetCodes", cleanEmail);
      await setDoc(resetRef, codeData);
    } catch (err) {
      console.error("Error saving reset code to Firestore:", err);
    }
  }
}

async function deleteFirestoreResetCode(email: string): Promise<void> {
  const cleanEmail = email.toLowerCase().trim();
  delete resetCodesDatabase[cleanEmail];
  if (db) {
    try {
      const resetRef = doc(db, "resetCodes", cleanEmail);
      await deleteDoc(resetRef);
    } catch (err) {
      console.error("Error deleting reset code from Firestore:", err);
    }
  }
}

// Class Diary (Cahier de Textes) Firestore Helpers
async function getFirestoreClassDiaries(email: string): Promise<any[]> {
  const cleanEmail = email.toLowerCase().trim();
  if (db) {
    try {
      const diariesCol = collection(db, "classDiaries");
      const q = query(diariesCol, where("userEmail", "==", cleanEmail));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });
      // Sort on client/server-side JS by date descending to avoid custom index creation requirement
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (err) {
      console.error("Error getting class diaries from Firestore:", err);
    }
  }
  const list = classDiariesLogs.filter(d => d.userEmail === cleanEmail);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

async function saveFirestoreClassDiary(diary: any): Promise<void> {
  const idx = classDiariesLogs.findIndex(d => d.id === diary.id);
  if (idx > -1) {
    classDiariesLogs[idx] = diary;
  } else {
    classDiariesLogs.unshift(diary);
  }
  if (db) {
    try {
      const diaryRef = doc(db, "classDiaries", diary.id);
      await setDoc(diaryRef, diary);
    } catch (err) {
      console.error("Error saving class diary to Firestore:", err);
    }
  }
}

async function deleteFirestoreClassDiary(id: string): Promise<void> {
  classDiariesLogs = classDiariesLogs.filter(d => d.id !== id);
  if (db) {
    try {
      const diaryRef = doc(db, "classDiaries", id);
      await deleteDoc(diaryRef);
    } catch (err) {
      console.error("Error deleting class diary from Firestore:", err);
    }
  }
}

// Certificates Firestore Helpers
let certificateLogs: any[] = [];

async function saveFirestoreCertificate(cert: any): Promise<void> {
  if (!cert || (!cert.certificateNumber && !cert.id)) return;
  const certKey = (cert.certificateNumber || cert.id).toUpperCase().trim();
  const idx = certificateLogs.findIndex(c => (c.certificateNumber && c.certificateNumber.toUpperCase().trim() === certKey) || (c.id && c.id.toUpperCase().trim() === certKey));
  if (idx > -1) {
    certificateLogs[idx] = cert;
  } else {
    certificateLogs.unshift(cert);
  }
  if (db) {
    try {
      const certRef = doc(db, "certificates", certKey);
      await setDoc(certRef, cert);
    } catch (err) {
      console.error("Error saving certificate to Firestore:", err);
    }
  }
}

async function getFirestoreCertificateByNumber(certNumber: string): Promise<any> {
  if (!certNumber) return null;
  const cleanKey = certNumber.toUpperCase().trim();
  if (db) {
    try {
      const certRef = doc(db, "certificates", cleanKey);
      const snap = await getDoc(certRef);
      if (snap.exists()) {
        const data = snap.data();
        const idx = certificateLogs.findIndex(c => (c.certificateNumber && c.certificateNumber.toUpperCase().trim() === cleanKey) || (c.id && c.id.toUpperCase().trim() === cleanKey));
        if (idx > -1) certificateLogs[idx] = data;
        else certificateLogs.unshift(data);
        return data;
      }
    } catch (err) {
      console.error("Error getting certificate from Firestore:", err);
    }
  }
  return certificateLogs.find(c => (c.certificateNumber && c.certificateNumber.toUpperCase().trim() === cleanKey) || (c.id && c.id.toUpperCase().trim() === cleanKey)) || null;
}

async function seedFirestoreIfNeeded(): Promise<void> {
  if (!db) return;
  try {
    const usersCol = collection(db, "users");
    const usersSnap = await getDocs(query(usersCol, limit(1)));
    if (usersSnap.empty) {
      console.log("Firestore is empty. Seeding initial data...");
      
      // Seed users
      for (const [email, user] of Object.entries(userDatabase)) {
        await setDoc(doc(db, "users", email), user);
      }
      
      // Seed payments
      for (const payment of paymentSubmissions) {
        await setDoc(doc(db, "payments", payment.id), payment);
      }
      
      // Seed logs
      for (const log of generatedPlanLogs) {
        await setDoc(doc(db, "planLogs", log.id), log);
      }
      
      console.log("Firestore seeded successfully!");
    } else {
      console.log("Firestore already has data. Loading latest into memory caches...");
      await getFirestorePayments();
      await getFirestorePlanLogs();
      const allUsersSnap = await getDocs(collection(db, "users"));
      allUsersSnap.forEach((doc) => {
        userDatabase[doc.id] = doc.data();
      });
      // Sync class diaries from Firestore
      try {
        const allDiariesSnap = await getDocs(collection(db, "classDiaries"));
        classDiariesLogs = [];
        allDiariesSnap.forEach((doc) => {
          classDiariesLogs.push(doc.data());
        });
        console.log(`Synced ${classDiariesLogs.length} class diaries from Firestore.`);
      } catch (err) {
        console.warn("Could not sync class diaries (might be empty or missing schema):", err);
      }
      console.log("In-memory caches synced with Firestore successfully!");
    }
  } catch (err) {
    console.error("Error seeding/syncing Firestore:", err);
  }
}

// Helper to get or create user
async function getUserProfile(email: string, name?: string, phone?: string, provider?: string, password?: string) {
  const cleanEmail = email.toLowerCase().trim();
  const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-07"
  const now = new Date().toISOString();

  let user = await getFirestoreUser(cleanEmail);

  if (!user) {
    user = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name || cleanEmail.split("@")[0],
      email: cleanEmail,
      phone: phone || "",
      country: "Rwanda",
      currentPlan: "Free Tier (3 plans/mo)",
      remainingPlans: 3,
      totalGenerated: 0,
      lastFreeResetMonth: currentMonth,
      isAdmin: cleanEmail === "nkundimana123theogene@gmail.com",
      authProvider: provider || "google",
      password: password || "123456", // Default fallback password if none provided
      createdAt: now,
      lastLoginAt: now,
      status: "active",
      loginCount: 1,
    };
  } else {
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (provider) user.authProvider = provider;
    if (password) user.password = password;
    user.lastLoginAt = now;
    user.loginCount = (user.loginCount || 0) + 1;

    // Monthly automatic reset of 3 free plans for all customers
    if (user.lastFreeResetMonth !== currentMonth && !user.isAdmin) {
      user.lastFreeResetMonth = currentMonth;
      if (user.currentPlan === "Free Tier (3 plans/mo)" || user.remainingPlans < 3) {
        user.remainingPlans = 3;
      }
    }
  }

  await saveFirestoreUser(cleanEmail, user);
  return user;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", appName: OWNER_INFO.websiteName, owner: OWNER_INFO.name });
});

app.get("/api/owner-info", (req, res) => {
  res.json(OWNER_INFO);
});

app.get("/api/subscription-plans", (req, res) => {
  res.json(SUBSCRIPTION_PLANS);
});

// Middleware to verify admin permissions using the session token in the Authorization header
async function requireAdmin(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ntabwo wemerewe kubona aya makuru (Unauthorized. Missing token)." });
    return;
  }
  const token = authHeader.substring(7);
  // Find user with this session token
  let user = Object.values(userDatabase).find((u) => u.sessionToken === token);
  if (!user && token.startsWith("tok_")) {
    const adminUser = await getFirestoreUser("nkundimana123theogene@gmail.com");
    if (adminUser && !adminUser.sessionToken) {
      adminUser.sessionToken = token;
      await saveFirestoreUser("nkundimana123theogene@gmail.com", adminUser);
      user = adminUser;
    }
  }
  if (!user || !user.isAdmin) {
    res.status(403).json({ error: "Ntabwo uri umuyobozi (Forbidden. Admin access required)." });
    return;
  }
  next();
}

app.post("/api/user-profile", async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  // Check token if provided
  const authHeader = req.headers.authorization;
  let hasValidToken = false;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const existingUser = await getFirestoreUser(email);
    if (existingUser) {
      if (existingUser.sessionToken === token) {
        hasValidToken = true;
      } else if (!existingUser.sessionToken && token.startsWith("tok_")) {
        existingUser.sessionToken = token;
        await saveFirestoreUser(email, existingUser);
        hasValidToken = true;
      }
    }
  }

  const profile = await getUserProfile(email, name);

  // If visitor is requesting owner email but is NOT authenticated with a valid token,
  // we treat them as a standard visitor/free educator to prevent unauthorized privilege escalation.
  if (email.toLowerCase() === "nkundimana123theogene@gmail.com" && !hasValidToken) {
    res.json({
      id: "usr_visitor",
      name: "Mwarimu / Visitor",
      email: "nkundimana123theogene@gmail.com",
      phone: "0781339530",
      country: "Rwanda",
      currentPlan: "Free Tier (3 plans/mo)",
      remainingPlans: 3,
      totalGenerated: 0,
      isAdmin: false,
    });
    return;
  }

  const responseProfile = { ...profile };
  delete responseProfile.password; // Securely hide password from any API responses
  if (!hasValidToken) {
    responseProfile.isAdmin = false;
    delete responseProfile.sessionToken;
  }
  res.json(responseProfile);
});

// Authentication endpoint for Google Sign In / Instant Bypass
app.post("/api/auth/sign-in", async (req, res) => {
  const { email, name, phone, provider } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required for authentication" });
    return;
  }

  // Check if account is blocked by admin
  const existing = await getFirestoreUser(email);
  if (existing && existing.status === 'blocked') {
    res.status(403).json({
      error: "Konti yawe yahagaritswe n'umuyobozi (Account blocked by administrator). Baza umuyobozi kuri 0781339530.",
      code: "ACCOUNT_BLOCKED"
    });
    return;
  }

  const user = await getUserProfile(email, name, phone, provider || 'google');
  // Generate a cryptographically secure-looking temporary session token
  const token = "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  user.sessionToken = token;
  await saveFirestoreUser(email, user);

  const responseUser = { ...user };
  delete responseUser.password;
  res.json({ message: "Sign in successful", user: responseUser });
});

// Real User Registration Endpoint (with password)
app.post("/api/auth/register", async (req, res) => {
  const { email, name, phone, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email n'ijambo ry'ibanga birakenewe." });
    return;
  }

  const existing = await getFirestoreUser(email);
  if (existing) {
    res.status(400).json({ error: "Iyi email isanzwe ifite konti! Gerageza Kwinjira (Login) aho guhanga nshya." });
    return;
  }

  const user = await getUserProfile(email, name, phone, 'email', password);
  const token = "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  user.sessionToken = token;
  await saveFirestoreUser(email, user);

  const responseUser = { ...user };
  delete responseUser.password;
  res.status(201).json({ message: "Konti yaremwe neza!", user: responseUser });
});

// Real User Login Endpoint (checks email & password)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Andika email n'ijambo ry'ibanga." });
    return;
  }

  const user = await getFirestoreUser(email);
  if (!user) {
    res.status(404).json({ error: "Ntabwo iyi email yanditswe muri system! Banza uhange konti nshya (Register)." });
    return;
  }

  if (user.status === 'blocked') {
    res.status(403).json({ error: "Konti yawe yahagaritswe n'umuyobozi! Baza umuyobozi kuri 0781339530." });
    return;
  }

  if (user.password !== password) {
    res.status(401).json({ error: "Ijambo ry'ibanga saryo (Incorrect password). Ongera ugerageze cyangwa ukande 'Wibagiwe'!" });
    return;
  }

  const updatedUser = await getUserProfile(email);
  const token = "tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  updatedUser.sessionToken = token;
  await saveFirestoreUser(email, updatedUser);

  const responseUser = { ...updatedUser };
  delete responseUser.password;
  res.json({ message: "Kwinjira byagenze neza!", user: responseUser });
});

// Forgot Password trigger (generates a beautiful 6-digit code)
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Andika email address yawe." });
    return;
  }

  const user = await getFirestoreUser(email);
  if (!user) {
    res.status(404).json({ error: "Ntabwo iyi email isanzweho! Banza uyihange." });
    return;
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await saveFirestoreResetCode(email, {
    code,
    expiresAt: Date.now() + 600000 // Expires in 10 minutes
  });

  res.json({
    message: "Kode yo guhindura ijambo ry'ibanga yoherejwe!",
    email,
    code // Return code directly so we can simulate showing it in the notification banner for easy demo!
  });
});

// Reset Password (applies new password if code matches)
app.post("/api/auth/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    res.status(400).json({ error: "Andika email, kode n'ijambo ry'ibanga rishya." });
    return;
  }

  const stored = await getFirestoreResetCode(email);
  if (!stored) {
    res.status(400).json({ error: "Kode ntisanzweho cyangwa yarangiye igihe. Kanda 'Wibagiwe' ongera uyisabe." });
    return;
  }

  if (stored.expiresAt < Date.now()) {
    await deleteFirestoreResetCode(email);
    res.status(400).json({ error: "Kode yamaze kurenga igihe (Expired). Ongera uyisabe." });
    return;
  }

  if (stored.code !== code.trim()) {
    res.status(400).json({ error: "Kode wanditse siyo! Cyura neza kode yoherejwe." });
    return;
  }

  // Update password
  const user = await getFirestoreUser(email);
  if (user) {
    user.password = newPassword;
    await saveFirestoreUser(email, user);
  }

  // Clean up code
  await deleteFirestoreResetCode(email);

  res.json({ message: "Ijambo ry'ibanga ryahindutse neza! Sasa winjire ukoresheje rishya." });
});

// Admin API: Get all registered users and active logins
app.get("/api/admin/users", requireAdmin, async (req, res) => {
  if (db) {
    try {
      const usersCol = collection(db, "users");
      const usersSnap = await getDocs(usersCol);
      usersSnap.forEach((doc) => {
        userDatabase[doc.id] = doc.data();
      });
    } catch (err) {
      console.error("Error fetching all users for admin:", err);
    }
  }
  const usersList = Object.values(userDatabase).map((u) => {
    const userCopy = { ...u };
    delete userCopy.password; // Do not leak actual passwords in list response
    return {
      ...userCopy,
      loginCount: u.loginCount || 1,
      status: u.status || 'active',
      authProvider: u.authProvider || 'google',
    };
  });
  res.json(usersList);
});

// Admin API: Modify user status or remaining plan credits
app.post("/api/admin/update-user", requireAdmin, async (req, res) => {
  const { email, action, value } = req.body;
  const user = await getFirestoreUser(email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (action === "toggle_status") {
    user.status = user.status === "blocked" ? "active" : "blocked";
  } else if (action === "set_remaining_plans") {
    user.remainingPlans = Math.max(0, parseInt(value, 10) || 0);
  } else if (action === "add_plans") {
    user.remainingPlans = (user.remainingPlans || 0) + (parseInt(value, 10) || 10);
  } else if (action === "grant_unlimited") {
    user.currentPlan = "Unlimited Admin / VIP";
    user.remainingPlans = 9999;
  } else if (action === "toggle_cert_download") {
    user.canDownloadCertificate = !user.canDownloadCertificate;
  }

  await saveFirestoreUser(email, user);

  const responseUser = { ...user };
  delete responseUser.password;
  res.json({ message: "User updated successfully", user: responseUser });
});

// Admin API: Get all generated lesson plan logs
app.get("/api/admin/plan-logs", requireAdmin, async (req, res) => {
  const logs = await getFirestorePlanLogs();
  res.json(logs);
});

// Helper for Fallback Lesson Plan Generation in case Gemini model call is unavailable or fails
function generateFallbackLessonPlan(request: any, language: string, format: string, teacherName?: string) {
  const isKiny = language.toLowerCase().includes("kiny") || language.toLowerCase().includes("rwanda");
  const isFrench = language.toLowerCase().includes("fren") || language.toLowerCase().includes("fran");
  const isSwahili = language.toLowerCase().includes("swah") || language.toLowerCase().includes("kisw");

  const school = request.schoolName || "Standard School";
  const teacher = request.teacherName || teacherName || OWNER_INFO.name;
  const term = request.term || "Term 1";
  const date = request.date || new Date().toISOString().split("T")[0];
  const subject = request.subject || "General Science";
  const grade = request.classGrade || "Primary 5";
  const unitNo = request.unitNo || "1";
  const lessonNo = request.lessonNo || "1 of 5";
  const duration = request.duration || "40 minutes";
  const classSize = request.classSize || "40 learners";
  const specialNeeds = request.specialNeeds || (isKiny ? "Abafite ubumuga buzwi bazahabwa imfashanyigisho zihariye." : "Visual and auditory support provided as needed.");
  const unitTitle = request.unitTitle || "Core Concepts";
  const keyCompetence = request.keyUnitCompetence || "Demonstrate understanding and practical application of key concepts.";
  const lessonTitle = request.lessonTitle || "Introduction to Topic";
  const materials = request.learningMaterials || "Textbooks, wall charts, exercise books, chalk/markers";
  const refs = request.references || "REB Syllabus & Teacher Guide";

  let obj = "";
  if (request.instructionalObjective && request.instructionalObjective.length > 5 && !request.instructionalObjective.includes("Auto-generated")) {
    obj = request.instructionalObjective;
  } else if (isKiny) {
    obj = `Mu gusoza isomo, bahawe imfashanyigisho n'inyandiko zikwiye, abanyeshuri bazaba bashoboye gusobanura no gukoresha ${lessonTitle} mu buryo bw'ukuri no bila kuguza.`;
  } else if (isFrench) {
    obj = `À la fin de la leçon, à l'aide des supports pédagogiques fournis, les apprenants seront capables d'expliquer et d'appliquer ${lessonTitle} avec précision.`;
  } else if (isSwahili) {
    obj = `Fikia mwisho wa somo, kwa kutumia vifaa vya kufundishia, wanafunzi wataweza kufafanua na kutumia ${lessonTitle} kwa usahihi.`;
  } else {
    obj = `By the end of the lesson, given illustrative charts and exercise sheets, learners will be able to explain, construct, and apply ${lessonTitle} accurately within ${duration}.`;
  }

  let steps = [];
  if (format === 'nursery_grid') {
    if (isKiny) {
      steps = [
        {
          stepName: '1. GUKORANIRA HAMWE N\'IRIBURIRO (CIRCLE TIME & WELCOME)',
          timing: '10 min',
          teacherActivities: `Mwarimu ahuriza abana hamwe mu ruziga, akaririmba indirimbo yo kubaha ikaze, agasengana nabo, kandi akabategeresha amashyi n'akaririmba kajyanye na "${lessonTitle}". Abereka igipupe cyangwa ishusho ikurura amatsiko.`,
          learnerActivities: `Abana bararirimba babishimye, barasenga, kandi batega amatwi igipupe cyangwa imfashanyigisho mwarimu abereka, bagasubiza mu buryo bw'imikino.`,
          competencesAndCrossCutting: 'Ubusabane (Cooperation) & Indangagaciro z\'umuco (Cultural values).'
        },
        {
          stepName: '2. IGIKORWA NYIRIZINA CY\'UMUKINO N\'AMASHYI (PLAY-BASED LEARNING)',
          timing: '15 min',
          teacherActivities: `Mwarimu agabanyamo abana amatsinda akurikije Station cyangwa ibikinisho bafite. Abayobora mu mukino wo gupima cyangwa gukina na ${lessonTitle} (urugero: kubara utubuye, gusiga amabara, gushushanya). Atanga inyunganira yihariye no gushima abana bose.`,
          learnerActivities: `Abana barakina byoroshye mu matsinda, bagakorakorana n\'imfashanyigisho, bakabara/gushushanya cyangwa kugaragaza ibyo bagezeho bishimiye umukino.`,
          competencesAndCrossCutting: 'Gutekereza mu buryo bwagutse (Creativity & Play) & Gukorana neza (Collaboration).'
        },
        {
          stepName: '3. GUKURAHO IBIKORESHO N\'UMWANZURO (CLEANUP & FAREWELL)',
          timing: '5 min',
          teacherActivities: `Mwarimu araririmba indirimbo yo gukusanya ibikoresho, agafasha abana gubika neza. Abaza ibibazo byoroheje ku byo bakoze, akaririmba indirimbo yo gusezera n\'isengesho ryo gusoza.`,
          learnerActivities: `Abana barakoranya ibikoresho babibika neza mu matsinda, bakayoborwa mu gusubiza no kuririmba indirimbo yo gusezera babikunze.`,
          competencesAndCrossCutting: 'Isuku (Hygiene/Cleanup) & Kwigira no kwiyizera (Self-esteem).'
        }
      ];
    } else if (isFrench) {
      steps = [
        {
          stepName: '1. LE REGROUPEMENT ET RITUEL DE BIENVENUE',
          timing: '10 min',
          teacherActivities: `L'enseignant rassemble les enfants en cercle, chante une chanson de bienvenue, anime une prière courte et présente une marionnette ou un objet attrayant lié à "${lessonTitle}".`,
          learnerActivities: `Les enfants chantent avec enthousiasme, font les gestes, participent à la prière et interagissent avec la marionnette ou le matériel de leçon.`,
          competencesAndCrossCutting: 'Développement du langage, expression orale et socialisation par le jeu.'
        },
        {
          stepName: '2. ATELIERS DE JEUX ÉDUCATIFS ET MANIPULATION',
          timing: '15 min',
          teacherActivities: `L'enseignant organise les enfants en groupes. Il les guide dans des jeux de manipulation liés à "${lessonTitle}" (trier des couleurs, modeler de l'argile, tracer ou compter des objets).`,
          learnerActivities: `Les enfants explorent, manipulent, s'entraident et répètent des exercices ludiques d'apprentissage en groupe.`,
          competencesAndCrossCutting: 'Motricité fine, esprit de partage et créativité.'
        },
        {
          stepName: '3. RANGEMENT ET CONGÉ (SORTIE)',
          timing: '5 min',
          teacherActivities: `L'enseignant chante la chanson du rangement pour ranger les jouets. Il résume l'activité principale de "${lessonTitle}" avec une question simple, puis entonne la chanson de congé.`,
          learnerActivities: `Les enfants rangent soigneusement les jouets, répondent à la question de bilan, chantent la chanson d'au revoir et se préparent à sortir.`,
          competencesAndCrossCutting: 'Responsabilité, propreté et ordre.'
        }
      ];
    } else if (isSwahili) {
      steps = [
        {
          stepName: '1. MUDA WA DUARA NA SALAMU (CIRCLE TIME)',
          timing: '10 min',
          teacherActivities: `Mwalimu anakusanya watoto katika duara, anaongoza wimbo wa kukaribisha, sala fupi, na kuwatambulisha doli au picha ya rangi inayohusiana na "${lessonTitle}".`,
          learnerActivities: `Watoto wanaimba kwa furaha, wanaigiza vitendo, wanashiriki sala na kufurahia picha au vifaa vya kufundishia mwalimu anavyoonyesha.`,
          competencesAndCrossCutting: 'Uwezo wa kijamii, kusikiliza na maendeleo ya lugha kupitia mchezo.'
        },
        {
          stepName: '2. VITUO VYA MICHEZO YA MAFUNZO (PLAY-BASED DEVELOPMENT)',
          timing: '15 min',
          teacherActivities: `Mwalimu anawagawa watoto katika makundi ya michezo. Anawaongoza katika shughuli za kushika na kupanga vifaa vinavyohusiana na "${lessonTitle}" (kama kupanga rangi, kuhesabu kokoto, kuchora).`,
          learnerActivities: `Watoto wanacheza kwa bidii, wanashika vifaa vya kujifunzia, wanashirikiana rasilimali na kurudia mazoezi kwa maelekezo ya mwalimu.`,
          competencesAndCrossCutting: 'Ujuzi wa vidole (fine motor), ugunduzi wa kibunifu, na kushirikiana.'
        },
        {
          stepName: '3. KUWEKA SAWA NA KUAGA (CLEANUP & FAREWELL)',
          timing: '5 min',
          teacherActivities: `Mwalimu anaimba wimbo wa kusafisha ili kurudisha zana za michezo mahali pake. Anajadili lengo kuu la "${lessonTitle}" kwa maswali rahisi na kuongoza wimbo wa kuagana.`,
          learnerActivities: `Watoto wanashirikiana kusafisha na kuweka sawa vifaa vyao, wanajibu swali la muhtasari, wanaimba wimbo wa kuaga, na kuagana kwa usalama.`,
          competencesAndCrossCutting: 'Uwajibikaji, usafi na nidhamu ya makundi.'
        }
      ];
    } else {
      steps = [
        {
          stepName: '1. CIRCLE TIME & WELCOME ROUTINE',
          timing: '10 min',
          teacherActivities: `Teacher gathers children in a circle, leads a lively welcome song, conducts a short morning prayer, and engages children with a puppet or sensory toy related to "${lessonTitle}". Displays colorful visuals to capture their curious attention.`,
          learnerActivities: `Children sing along joyfully, perform actions, participate in the prayer, and interact excitedly with the puppet or colorful teaching materials.`,
          competencesAndCrossCutting: 'Social skills, Active listening, and Language development through play.'
        },
        {
          stepName: '2. PLAY-BASED LEARNING STATIONS (DEVELOPMENT)',
          timing: '15 min',
          teacherActivities: `Teacher organizes children into small play stations. Guides them in hands-on interactive activities related to "${lessonTitle}" (e.g., matching shapes, sorting colors, modeling with clay, counting pebbles). Provides positive reinforcement and individual encouragement.`,
          learnerActivities: `Children actively play, touch, manipulate materials, cooperate in sharing resources, and repeat naming/counting/coloring exercises guided by the teacher.`,
          competencesAndCrossCutting: 'Fine motor skills, Creative exploration, and Collaborative sharing.'
        },
        {
          stepName: '3. CLEAN-UP & FAREWELL ROUTINE (CONCLUSION)',
          timing: '5 min',
          teacherActivities: `Teacher sings a cheerful "Clean-up Song" to guide toy storage. Reviews the main focus of ${lessonTitle} with a simple fun question, and leads a farewell rhyme and closing prayer.`,
          learnerActivities: `Children cooperate to tidy up and pack toys away, respond to the summary question, sing the goodbye song, and wave farewell safely.`,
          competencesAndCrossCutting: 'Responsibility, Tidiness, and Peer empathy.'
        }
      ];
    }
  } else if (format === 'remedial_grid') {
    if (isKiny) {
      steps = [
        {
          stepName: '1. IRIBURIRO N\'ISUZUMA MBULE (DIAGNOSTIC INTRODUCTION)',
          timing: '5 min',
          teacherActivities: `Mwarimu abaza ibibazo ngororamutu n'isuzuma mbule kugira ngo agaragaze ibyuho n'ingorane z'abanyeshuri ku mutwe wa "${lessonTitle}". Agaba abanyeshuri mu matsinda 3 y'inyunganira: Remediation (${request.remedialCount || '8'}), Consolidation (${request.consolidationCount || '22'}), n'Extension (${request.extensionCount || '10'}).`,
          learnerActivities: `Abanyeshuri barasubiza ibibazo by'isuzuma mbule, bitegereza ibikoresho by'isomo, maze buri wese akijyana mu tsinda yagawemo ajyanye n'ikigero cye muri RLP.`,
          competencesAndCrossCutting: 'Kumenya ibyuho mu bumenyi (Diagnostic self-awareness) & Kwishyira mu matsinda (Collaboration).'
        },
        {
          stepName: '2. IBIKORWA BYO KUNGOZA NO KUZAHURA (DIFFERENTIATED REMEDIAL ACTIVITIES)',
          timing: '25 min',
          teacherActivities: `• Group 1 - Remediation (${request.remedialGroup1Category || 'Abakeneye inyunganira yihariye'}): Mwarimu yikora kuri iki tsinda, abasobanurira umwimerere wa "${lessonTitle}" akoresheje ibikoresho bifatika no kubafasha intambwe ku yindi.\n• Group 2 - Consolidation (${request.remedialGroup2Category || 'Abakomeza ubumenyi'}): Mwarimu aha iki tsinda imyitozo yo gukomeza ubumenyi n'ibibazo byo gukemura mu bwumvikane.\n• Group 3 - Extension (${request.remedialGroup3Category || 'Abihuta / Extension'}): Mwarimu aha iki tsinda ibibazo bitoroshye (high-order challenge problems) no kuba abafasha b'abandi (peer tutors).`,
          learnerActivities: `• Group 1 (Remediation): Abanyeshuri bafashwa na mwarimu mu buryo bw'umwimerere no gukora imyitozo yoroshye ifasha kuzahura ubumenyi.\n• Group 2 (Consolidation): Abanyeshuri bakora imyitozo yo gukomeza ubumenyi bagasobanurirana mu tsinda.\n• Group 3 (Extension): Abanyeshuri b'abahanga bakora imyitozo yisumbuye gihamya bakagira n'uruhare mu gufasha bagenzi babo.`,
          competencesAndCrossCutting: 'Inyunganira yihariye (Differentiated Remediation), Ubusabane (Cooperation) & Uburinganire muri RLP.'
        },
        {
          stepName: '3. ISUZUMA RY\'AMATSINDA N\'UMWANZURO (REMEDIAL EVALUATION & PROGRESS CHECK)',
          timing: '10 min',
          teacherActivities: `Mwarimu apima niba ibyuho z'abanyeshuri bo mu tsinda rya Remediation byazahuwe n'isuzuma rigufi. Aha buri tsinda umukoro wihariye uzahura ubumenyi.`,
          learnerActivities: `Abanyeshuri barasubiza ibibazo by'isuzuma ry'amatsinda, baratanga feedback y'ibyo bavumbuye, bakandika umukoro wo mu rugo muri kaye zabo.`,
          competencesAndCrossCutting: 'Gukemura ibibazo (Problem Solving) & Kwigira no gukura mu bumenyi (Lifelong Growth).'
        }
      ];
    } else {
      steps = [
        {
          stepName: '1. DIAGNOSTIC RECAP & GROUPING (REMEDIAL INTRODUCTION)',
          timing: '5 min',
          teacherActivities: `Teacher administers a diagnostic pre-assessment to identify specific learning gaps in "${lessonTitle}". Groups learners into 3 differentiated categories: Remediation (${request.remedialCount || '8'}), Consolidation (${request.consolidationCount || '22'}), and Extension (${request.extensionCount || '10'}).`,
          learnerActivities: `Learners respond to diagnostic review questions, receive feedback on targeted gaps, and move into their designated RLP learning groups.`,
          competencesAndCrossCutting: 'Self-awareness of learning gaps & Collaborative teamwork.'
        },
        {
          stepName: '2. DIFFERENTIATED REMEDIAL ACTIVITIES (RLP DEVELOPMENT)',
          timing: '25 min',
          teacherActivities: `• Group 1 - Remediation (${request.remedialGroup1Category || 'Struggling learners'}): Direct step-by-step teacher coaching, visual aids, scaffolded tasks on core concepts of "${lessonTitle}".\n• Group 2 - Consolidation (${request.remedialGroup2Category || 'Proficient learners'}): Guided group problem-solving exercises to reinforce mastery.\n• Group 3 - Extension (${request.remedialGroup3Category || 'Advanced learners'}): High-order challenge tasks, analytical problem sets, and peer tutoring opportunities.`,
          learnerActivities: `• Group 1 (Remediation): Learners receive targeted teacher remediation and practice fundamental exercises to bridge gaps.\n• Group 2 (Consolidation): Learners work on consolidation worksheets and discuss solutions with peers.\n• Group 3 (Extension): Advanced learners solve complex extension problems and assist peers.`,
          competencesAndCrossCutting: 'Differentiated learning, Critical thinking, and Peer collaboration.'
        },
        {
          stepName: '3. TARGETED EVALUATION & PROGRESS CHECK (REMEDIAL CONCLUSION)',
          timing: '10 min',
          teacherActivities: `Teacher evaluates gap closure across all three groups through exit tickets. Assigns group-tailored homework assignments.`,
          learnerActivities: `Learners demonstrate improved understanding on exit tickets and note down differentiated home assignments.`,
          competencesAndCrossCutting: 'Metacognition, Problem-solving, and Self-assessment.'
        }
      ];
    }
  } else if (isKiny) {
    steps = [
      {
        stepName: "1. IRIBURIRO (INTRODUCTION)",
        timing: "5 min",
        teacherActivities: `Mwarimu asaba abanyeshuri kwibuka isomo ryatambutse, ababaza ibibazo bitanga icyerekezo ku topic ya "${lessonTitle}". Ahanika intego y'isomo ku kibaho.`,
        learnerActivities: `Abanyeshuri barasubiza ibibazo by'isomo rya kera, barategera amatwi intego nshya kandi bakandika umutwe w'isomo muri kaye zabo.`,
        competencesAndCrossCutting: "Itumanaho (Communication) & Ubushobozi bwo gutekereza cyane (Critical thinking)."
      },
      {
        stepName: "2. INYIGISHO NYIRIZINA (DEVELOPMENT)",
        timing: "25 min",
        teacherActivities: `Mwarimu asobanura neza amategeko n'ibice by'isomo rya "${lessonTitle}". Agaba abanyeshuri mu matsinda macheya (group work), akabahera ibikorwa (tasks) no gukora imyitozo. Mwarimu agendagenda mu matsinda afasha abafite ingorane.`,
        learnerActivities: `Abanyeshuri bakorera mu matsinda, baraganira ku ngingo za ${lessonTitle}, bakora imyitozo bayobowe n'amatsinda, bakandika imyanzuro yabo bafite ubusabane. Abahagarariye amatsinda barasobanurira ibyo bagezeho imbere y'ishuri.`,
        competencesAndCrossCutting: "Ubusabane n'ubatabazi (Cooperation) & Uburinganire (Gender education in group leadership)."
      },
      {
        stepName: "3. UMWANZURO N'ISUZUMA (CONCLUSION & EVALUATION)",
        timing: "10 min",
        teacherActivities: `Mwarimu afatanyije n'abanyeshuri basoza incamake y'isomo. Mwarimu abaza ibibazo 2 byo gupima ubumenyi (formative assessment) kandi agahera abanyeshuri umukoro w'o murugo (homework).`,
        learnerActivities: `Abanyeshuri baravuga incamake y'ibyo basobanukiwe, barasubiza ibibazo by'isuzuma, bakandika umukoro wo mu rugo mu makaye zabo.`,
        competencesAndCrossCutting: "Gukemura ibibazo (Problem solving) & Kwigira no kwiyemerera."
      }
    ];
  } else {
    steps = [
      {
        stepName: "1. INTRODUCTION",
        timing: "5 min",
        teacherActivities: `Teacher reviews prerequisite knowledge by asking key questions related to previous topics. Introduces the new lesson topic: "${lessonTitle}" and states the instructional objective clearly on the board.`,
        learnerActivities: `Learners actively respond to recap questions, pay close attention to the introduced objective, and write down the lesson title in their notebooks.`,
        competencesAndCrossCutting: "Communication skills & Critical thinking through guided recap questions."
      },
      {
        stepName: "2. DEVELOPMENT (BODY OF LESSON)",
        timing: "25 min",
        teacherActivities: `Teacher presents core concepts of "${lessonTitle}" using learning materials. Facilitates small group activities and practical exercises. Moves around the classroom providing targeted guidance, checking understanding, and encouraging active peer collaboration.`,
        learnerActivities: `Learners work collaboratively in small groups to examine ${lessonTitle}, solve exercise problems, discuss key solutions, and present group findings to the class.`,
        competencesAndCrossCutting: "Cooperation and Interpersonal relations & Gender equality in team roles."
      },
      {
        stepName: "3. CONCLUSION & ASSESSMENT",
        timing: "10 min",
        teacherActivities: `Teacher guides learners to summarize the main lesson takeaways. Administers quick formative assessment questions to check mastery, and assigns homework exercises.`,
        learnerActivities: `Learners articulate key takeaways, answer assessment questions individually, and write down the assigned homework in their notebooks.`,
        competencesAndCrossCutting: "Problem solving & Lifelong learning."
      }
    ];
  }

  const openFormat = `# LESSON PLAN: ${lessonTitle.toUpperCase()}
**Subject:** ${subject} | **Class:** ${grade} | **Date:** ${date}
**School:** ${school} | **Teacher:** ${teacher}

---
### 1. LESSON OVERVIEW
- **Unit N° & Title:** Unit ${unitNo} - ${unitTitle}
- **Key Unit Competence:** ${keyCompetence}
- **Lesson Topic:** ${lessonTitle} (${lessonNo})
- **Duration:** ${duration} | **Class Size:** ${classSize}
- **Learning Materials:** ${materials}
- **References:** ${refs}

---
### 2. INSTRUCTIONAL OBJECTIVE
${obj}

---
### 3. STEP-BY-STEP PEDAGOGICAL DELIVERABLES
${steps.map(s => `#### ${s.stepName} (${s.timing})
- **Teacher Activities:** ${s.teacherActivities}
- **Learner Activities:** ${s.learnerActivities}
- **Competences & Cross-Cutting:** ${s.competencesAndCrossCutting}
`).join('\n')}

---
### 4. TEACHER SELF-EVALUATION
*(To be completed after lesson delivery)*
`;

  return {
    id: "lp_" + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    language: language,
    format: format,
    header: {
      schoolName: school,
      teacherName: teacher,
      term: term,
      date: date,
      subject: subject,
      classGrade: grade,
      unitNo: unitNo,
      lessonNo: lessonNo,
      duration: duration,
      classSize: classSize,
      specialNeeds: specialNeeds,
      unitTitle: unitTitle,
      keyUnitCompetence: keyCompetence,
      lessonTitle: lessonTitle,
      instructionalObjective: obj,
      location: request.location || "In Classroom",
      learningMaterials: materials,
      references: refs,
      district: request.district || "N/A",
      remedialCount: request.remedialCount || "8 learners",
      consolidationCount: request.consolidationCount || "22 learners",
      extensionCount: request.extensionCount || "10 learners",
      remedialGroup1Category: request.remedialGroup1Category || "Slow learners / Remediation",
      remedialGroup2Category: request.remedialGroup2Category || "Average learners / Consolidation",
      remedialGroup3Category: request.remedialGroup3Category || "Fast learners / Extension",
      remedialGroup4Category: request.remedialGroup4Category || "Peer tutoring & support"
    },
    steps: steps,
    selfEvaluation: "",
    openFormatContent: openFormat
  };
}

app.post("/api/update-country", async (req, res) => {
  const { email, country } = req.body;
  if (!email || !country) {
    res.status(400).json({ error: "Email and country are required" });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  let user = await getFirestoreUser(email);
  if (!user) {
    user = await getUserProfile(email);
  }
  if (token) {
    user.sessionToken = token;
  }

  user.country = country;
  await saveFirestoreUser(email, user);

  const responseUser = { ...user };
  delete responseUser.password;
  res.json(responseUser);
});

// Chat Assistant AI chatbot endpoint
app.post("/api/chat-assistant", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Messages array is required." });
    return;
  }

  try {
    const ai = getGenAI();
    
    // Transform messages to Gemini SDK format
    const contents = messages.map((msg: any) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text || "" }],
    }));

    const response = await callGeminiWithRetry({
      contents,
      config: {
        systemInstruction: `You are "Teacher Tool AI Assistant", a deeply caring, highly intelligent, encouraging, and professional educational AI assistant for "Nkorera Education" (Teacher Lesson Plans) in Rwanda.
Your mission is to bring joy, clarity, and peace of mind to teachers and users by giving exceptionally accurate, well-structured, warm, and heartwarming responses that directly address their questions.

About Nkorera Education:
- Official Website URL: https://teacherlessonplans.ai.studio
- Developer & Creator: ${OWNER_INFO.name} (Phone / WhatsApp: ${OWNER_INFO.whatsapp}, Email: ${OWNER_INFO.email}).
- Core App Features:
  1. AI Lesson Plan Generator (Creates complete, high-quality lesson plans aligned with Rwanda REB competence-based curriculum in CBC Grid, Remedial, or Nursery formats).
  2. Schemes of Work Creator (Creates schemas for Term 1, 2, or 3).
  3. Class Diary / Cahier de Textes Tracker (Keep official records of lessons taught).
  4. Exercise & Quiz Sheets Generator (Creates tests, quizzes, and homework with answers).
  5. Worksheets Generator.
  6. PowerPoint Presentation Slides Generator.
  7. Certificates Creator & Continuous Professional Development.
- Pricing & Subscription Plans:
  - Free Quota: 3 lesson plans per month for every teacher!
  - Single Lesson: 1,000 FRW
  - Teacher Monthly Starter: 5,000 FRW (25 lesson plans)
  - Teacher Monthly Pro: 10,000 FRW (50 lesson plans)
  - Unlimited VIP Plan: 15,000 FRW
  - Mobile Money (MoMo) Code: *182*8*1*${OWNER_INFO.momoCode}# (Name: ${OWNER_INFO.accountHolder}).
- Official Community & Support:
  - Phone & WhatsApp Group: ${OWNER_INFO.whatsapp}

Core Guidelines for Heartwarming & Accurate Responses:
1. DIRECT & ACCURATE ANSWER: Carefully parse the user's question and answer it directly, accurately, and thoroughly. Never give generic or evasive answers.
2. HEARTWARMING & ENCOURAGING TONE: Treat every teacher and user with high respect, empathy, and warmth. Use polite, uplifting greetings (e.g., "Muraho neza mwarimu wacu nkundwa!", "Murakoze cyane kubaza ikibazo cyiza!").
3. OFFICIAL LINK ACCESS: Always include the official website URL: https://teacherlessonplans.ai.studio whenever the user asks about the link, website, where to access lesson plans, how to log in, or when sharing resources.
4. RICH KIN YARWANDA / USER LANGUAGE: Respond fluently in the exact language used by the user (Kinyarwanda, English, French, Swahili). In Kinyarwanda, use beautiful, respectful, standard, and crystal-clear phrasing that gives the user complete confidence and comfort.
5. COMPLETE PROBLEM SOLVING: Provide step-by-step guidance whenever explaining how to do something (e.g., generating lesson plans, paying via MoMo, downloading certificates, or contacting support).`,
        temperature: 0.7,
      },
    });

    const reply = response.text || "Mpisemo kutubabarira, habaye ikibazo mu gutunganya igisubizo cyanyu. Mwongere mugerageze.";
    res.json({ reply });
  } catch (err: any) {
    console.error("Error in chat-assistant endpoint:", err);
    res.status(500).json({ error: "Ntabwo tushoboye kubona igisubizo kuri Gemini ubu. Mwongere mugerageze mu kanya." });
  }
});

// ==========================================
// CLASS DIARY (CAHIER DE TEXTES) ENDPOINTS
// ==========================================

app.post("/api/class-diary/list", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }
  const diaries = await getFirestoreClassDiaries(email);
  res.json(diaries);
});

app.post("/api/class-diary/save", async (req, res) => {
  const { diary } = req.body;
  if (!diary || !diary.userEmail) {
    res.status(400).json({ error: "Diary object with userEmail is required" });
    return;
  }
  await saveFirestoreClassDiary(diary);
  res.json({ message: "Class diary saved successfully", diary });
});

app.post("/api/class-diary/delete", async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: "Diary id is required" });
    return;
  }
  await deleteFirestoreClassDiary(id);
  res.json({ message: "Class diary deleted successfully", id });
});

app.post("/api/class-diary/generate", async (req, res) => {
  const { request, userEmail } = req.body;
  if (!request || !userEmail) {
    res.status(400).json({ error: "Request parameters and userEmail are required" });
    return;
  }

  const { subject, classGrade, date, period, lessonTitle, language, additionalInfo } = request;
  const targetLanguage = language || "English";

  try {
    const ai = getGenAI();
    const promptText = `
You are an expert curriculum assistant and pedagogical scheduler for "Teacher Tool" (founded by NKUNDIMANA Theogene).
Generate an exceptionally professional, realistic, and complete Class Diary ("Cahier de Textes" or "Journal de Classe") entry in "${targetLanguage}".

INPUT PARAMETERS:
- Subject (Isomo / Matière): ${subject}
- Class/Grade (Umwaka / Classe): ${classGrade}
- Date (Itariki): ${date}
- Time/Period (Igihe / Période): ${period}
- Lesson Title/Topic (Inyigisho / Sujet): ${lessonTitle}
- Additional Context or Notes: ${additionalInfo || "None"}

You must generate 4 key sections strictly in "${targetLanguage}":
1. Summary of Work Covered (Résumé du cours / Ibyakozwe mu ruziga): A detailed, realistic breakdown of the pedagogical content and activities carried out by the teacher and learners during the session. (Write 3-4 professional sentences).
2. Skills/Competences Targeted (Compétences visées / Ubushobozi n'insanganyamatsiko): Specific generic competences, learning outcomes, or core skills from the national curriculum targeted by this lesson. (Write 1-2 points).
3. Homework/Assignment Assigned (Devoirs donnés / Umukoro watanzwe): A practical homework exercise or task given to the class to reinforce what was learned. (Write 1-2 clear homework tasks).
4. Remarks/Observations (Remarques / Ibyizwe n'Ibyagaragaye): Plausible, realistic, and highly professional observations about learner progress, engagement, general understanding, or any minor incidents (e.g., "The majority of learners grasped the concept easily. 2 learners required additional assistance with fractions during group exercises"). (Write 2 realistic sentences).

Respond strictly with valid JSON inside a JSON block. No markdown wrapper outside the JSON itself. The schema must be:
{
  "workCoveredSummary": "string",
  "skillsCompetencesTargeted": "string",
  "homeworkAssigned": "string",
  "remarksObservations": "string"
}
`;

    const response = await callGeminiWithRetry({
      contents: promptText,
      config: {
        systemInstruction: "You are an AI assistant that generates highly professional educational Class Diary (Cahier de Textes) records in the requested language. Output strictly valid JSON conforming to the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workCoveredSummary: { type: Type.STRING },
            skillsCompetencesTargeted: { type: Type.STRING },
            homeworkAssigned: { type: Type.STRING },
            remarksObservations: { type: Type.STRING }
          },
          required: ["workCoveredSummary", "skillsCompetencesTargeted", "homeworkAssigned", "remarksObservations"]
        }
      }
    });

    let result: any = null;
    if (response.text) {
      try {
        result = JSON.parse(response.text.trim());
      } catch (err) {
        console.error("Error parsing Gemini response text:", err);
      }
    }

    if (!result) {
      throw new Error("Empty or invalid response from Gemini API");
    }

    res.json(result);
  } catch (err: any) {
    console.warn("Class diary generator failed or was throttled, returning fallback:", err?.message || err);
    
    // Provide a high-quality local fallback in Kinyarwanda, English, French, Swahili
    const isKiny = targetLanguage.toLowerCase().includes("kiny") || targetLanguage.toLowerCase().includes("rwanda");
    const isFrench = targetLanguage.toLowerCase().includes("fren") || targetLanguage.toLowerCase().includes("fran");
    const isSwahili = targetLanguage.toLowerCase().includes("swah") || targetLanguage.toLowerCase().includes("kisw");

    let workCoveredSummary = "";
    let skillsCompetencesTargeted = "";
    let homeworkAssigned = "";
    let remarksObservations = "";

    if (isKiny) {
      workCoveredSummary = `Twasuzumye kandi twiga ku mutwe ugira uti "${lessonTitle}" mu isomo rya ${subject}. Abanyeshuri bakoze imyitozo ihambaye, basobanukirwa amategeko n'amashusho, kandi biyoborwa mu matsinda gusesengura ingingo z'ingenzi.`;
      skillsCompetencesTargeted = `• Gutekereza mu buryo bwagutse (Critical thinking) no gukemura ibibazo (Problem solving).\n• Itumanaho no gukorana mu matsinda (Communication & Collaboration).`;
      homeworkAssigned = `Kora imyitozo ya 1 kugeza kuri 3 iri ku bupaji bwa 24 mu gitabo cy'abanyeshuri (Student's Book).`;
      remarksObservations = `Abanyeshuri hafi ya bose berekanye ko basobanukiwe neza ingingo z'isomo. Bake bakeneye gukurikiranwa mu buryo bwihariye mu isomo rikurikira.`;
    } else if (isFrench) {
      workCoveredSummary = `Nous avons exploré et étudié le sujet "${lessonTitle}" en ${subject}. Les apprenants ont participé activement à des exercices d'application, analysé des concepts clés et collaboré en petits groupes pour résoudre les problèmes posés.`;
      skillsCompetencesTargeted = `• Pensée critique et résolution de problèmes.\n• Esprit de collaboration et communication efficace en groupe.`;
      homeworkAssigned = `Faire les exercices d'application 2 et 3 à la page 45 du livre de l'élève.`;
      remarksObservations = `La leçon s'est déroulée avec succès. La majorité des élèves ont atteint l'objectif d'apprentissage, bien que quelques-uns nécessitent encore un suivi personnalisé.`;
    } else if (isSwahili) {
      workCoveredSummary = `Tulijadili na kujifunza kuhusu mada "${lessonTitle}" katika somo la ${subject}. Wanafunzi walifanya mazoezi ya vitendo, wakachambua dhana muhimu, na kushirikiana katika vikundi vidogo kutatua changamoto zilizowasilishwa.`;
      skillsCompetencesTargeted = `• Fikra tunduizi na utatuzi wa changamoto.\n• Ushirikiano na mawasiliano bora baina ya wanafunzi.`;
      homeworkAssigned = `Fanya mazoezi ya 3 na 4 kwenye ukurasa wa 12 wa kitabu cha wanafunzi.`;
      remarksObservations = `Somo lilifanikiwa sana. Wanafunzi wengi walionyesha kuelewa dhana hiyo vizuri, huku wachache wakihitaji usaidizi zaidi katika kipindi kijacho.`;
    } else {
      workCoveredSummary = `We successfully explored and covered the topic "${lessonTitle}" in ${subject}. Learners actively engaged in practical exercises, analyzed core concepts, and collaborated in small groups to solve problems.`;
      skillsCompetencesTargeted = `• Critical thinking and problem-solving skills.\n• Active communication and collaborative teamwork.`;
      homeworkAssigned = `Complete exercises 1, 2, and 3 on page 54 of the Student's Coursebook.`;
      remarksObservations = `The lesson was successfully delivered. Most learners demonstrated a solid understanding of the concepts, while a few will benefit from extra support during revision.`;
    }

    res.json({
      workCoveredSummary,
      skillsCompetencesTargeted,
      homeworkAssigned,
      remarksObservations
    });
  }
});

// AI Lesson Plan Generation Endpoint
app.post("/api/generate-lesson-plan", async (req, res) => {
  const userEmail = (req.body?.userEmail || req.body?.email || "").trim().toLowerCase();
  try {
    const { request } = req.body;
    if (!request || !userEmail) {
      res.status(400).json({ error: "Lesson plan request and user email are required" });
      return;
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    let user = await getFirestoreUser(userEmail);
    if (!user) {
      user = await getUserProfile(userEmail);
    }
    if (token) {
      user.sessionToken = token;
      await saveFirestoreUser(userEmail, user);
    }

    if (user.status === 'blocked') {
      res.status(403).json({
        error: "Konti yawe yahagaritswe n'umuyobozi (Account blocked by administrator). Baza umuyobozi kuri 0781339530.",
        code: "ACCOUNT_BLOCKED"
      });
      return;
    }

    if (!user.isAdmin && user.remainingPlans <= 0) {
      res.status(403).json({
        error: "Lesson plans z'ukwezi kwanyu cyangwa izo mwaguze zarangiye (0 Plans Remaining)! Banza ugure izindi lesson plans zishya muri Subscription gukomeza igikorwa cyanyu.",
        code: "QUOTA_EXCEEDED"
      });
      return;
    }

    const targetLanguage = request.language || "English";
    const planFormat = request.format || "reb_grid";
    let fullLessonPlan: any = null;

    try {
      const ai = getGenAI();
      const userObjective = request.instructionalObjective?.trim();
      const objectiveInstruction = (userObjective && userObjective !== "Auto-generated by AI" && userObjective.length > 5)
        ? `User Provided Objective Draft: "${userObjective}". Polish, refine, and re-format this draft into an exemplary, highly professional Instructional Objective in ${targetLanguage} directly aligned with "${request.lessonTitle}". It MUST strictly adhere to the Five (5) Models of Instructional Objectives:
1. Condition: The learning context, scenario, or materials provided ("Given [learning materials/illustrations/context]" / "Bahawe [imfashanyigisho/amashusho/inyandiko]")
2. Who: The target learner group ("learners" / "P5 pupils" / "abanyeshuri")
3. Action/Behavior: Clear, observable, and measurable performance verb (e.g., calculate, construct, explain, analyze, identify / gusobanura, gukora, gupima)
4. Content: The exact subject matter/concept of "${request.lessonTitle}"
5. Degree of Performance: The criterion or standard of performance (e.g., "accurately without error", "with 90% accuracy", "correctly within 40 minutes" / "mu buryo bw'ukuri no kumpamo").`
        : `Generate a brand new, exemplary, highly professional Instructional Objective in ${targetLanguage} tailored specifically to the subject "${request.subject}", unit "${request.unitTitle}", and lesson topic "${request.lessonTitle}". It MUST strictly follow the Five (5) Models of Instructional Objectives:
1. Condition: The learning context, scenario, or materials provided ("Given [learning materials/illustrations/context]" / "Bahawe [imfashanyigisho/amashusho/inyandiko]")
2. Who: The target learner group ("By the end of the lesson, learners..." / "Mu gusoza isomo, abanyeshuri...")
3. Action/Behavior: Clear, observable, and measurable performance verb (e.g., calculate, construct, explain, analyze, solve, identify / gusobanura, gukora, gupima)
4. Content: The exact subject matter/concept of "${request.lessonTitle}"
5. Degree of Performance: The criterion or standard of performance (e.g., "accurately without error", "with 90% accuracy", "correctly within ${request.duration || '40 minutes'}" / "mu buryo bw'ukuri n'ubusobanuro buhagije").`;

      const promptText = `
You are an expert educational master curriculum planner and pedagogue for Teacher Tool (founded by NKUNDIMANA Theogene).
Generate an exceptionally high-quality, accurate, comprehensive, and professional pedagogical lesson plan in "${targetLanguage}".

INPUT LESSON PARAMETERS:
- School Name: ${request.schoolName || "Standard School"}
- Teacher's Name: ${request.teacherName || OWNER_INFO.name}
- District / Akarere: ${request.district || "N/A"}
- Term: ${request.term || "Term 1"}
- Date: ${request.date || new Date().toISOString().split("T")[0]}
- Subject: ${request.subject}
- Class/Grade: ${request.classGrade}
- Unit N°: ${request.unitNo || "1"}
- Lesson N°: ${request.lessonNo || "1 of 5"}
- Duration: ${request.duration || "40 minutes"}
- Class Size: ${request.classSize || "40 learners"}
- Special Educational Needs: ${request.specialNeeds || "None / Visual and auditory support provided as needed"}
- Unit Title: ${request.unitTitle}
- Key Unit Competence: ${request.keyUnitCompetence}
- Title of the Lesson: ${request.lessonTitle}
- Location: ${request.location || "In Classroom"}
- Learning Materials: ${request.learningMaterials}
- References: ${request.references || "REB Curriculum Syllabus / Textbook"}
- Additional Notes: ${request.additionalNotes || "N/A"}

FORMAT: ${planFormat}
${
  planFormat === 'remedial_grid'
    ? `
SPECIAL REMEDIAL LEARNING PROGRAM (RLP) REQUIREMENTS:
- THIS IS A REMEDIAL LEARNING PROGRAM (RLP) LESSON PLAN (ISOMO RYO KUNGOZA NO KUZAHURA). IT MUST BE DISTINCT FROM A STANDARD REB CBC LESSON PLAN.
- Learners Needing Remediation (Group 1): ${request.remedialCount || '8 learners'} (${request.remedialGroup1Category || 'Abakeneye inyunganira yihariye'})
- Students Needing Consolidation (Group 2): ${request.consolidationCount || '22 learners'} (${request.remedialGroup2Category || 'Abakomeza ubumenyi'})
- Students Needing Extension (Group 3): ${request.extensionCount || '10 learners'} (${request.remedialGroup3Category || 'Abihuta / Extension'})
- Step 1 (Diagnostic Introduction): Focus on diagnostic pre-assessment to identify specific learning gaps in "${request.lessonTitle}" and assign learners to their RLP differentiation groups.
- Step 2 (Differentiated Remedial Activities): MUST BE SUBDIVIDED into 3 explicit group sections in BOTH Teacher Activities and Learner Activities:
  * Group 1 (Remediation / Slow Learners): Intensive teacher scaffolding, concrete materials, basic step-by-step guidance.
  * Group 2 (Consolidation / Average Learners): Practice exercises, guided problem solving, consolidating core skills.
  * Group 3 (Extension / Fast Learners): Advanced challenge problems, peer tutoring roles, higher-order thinking tasks.
- Step 3 (Remedial Evaluation & Progress Check): Targeted gap assessment to verify if remediation objectives were met.
- KEEP SECTION C (identifiedProblems, remedialActivitiesGroup1, remedialActivitiesGroup2, remedialActivitiesGroup3, usedStepsAssessment, remedialAids) VERY CONCISE, CONCISE AND SHORT (1-2 brief bullet points per item max) so that Section C and the whole remedial lesson plan fit on a single printable page.
- Header object MUST return 'remedialCount', 'consolidationCount', 'extensionCount', 'remedialGroup1Category', 'remedialGroup2Category', 'remedialGroup3Category', 'remedialGroup4Category', 'group1Objective', 'group2Objective', 'group3Objective', 'identifiedProblems', 'remedialActivitiesGroup1', 'remedialActivitiesGroup2', 'remedialActivitiesGroup3', 'usedStepsAssessment', 'remedialAids', 'consolidationCategory', 'consolidationActivities', 'consolidationMethodology', 'consolidationAids', 'extensionCategory', 'extensionActivities', 'extensionMethodology', 'extensionAids'.
`
    : planFormat === 'nursery_grid'
    ? `
SPECIAL NURSERY / EARLY CHILDHOOD EDUCATION (ECE) LESSON PLAN REQUIREMENTS:
- THIS IS A NURSERY SCHOOL LESSON PLAN (ISOMO RY'INSHUKE / CHEKECHEA). IT MUST FOCUS ON AGE-APPROPRIATE COGNITIVE, SOCIAL, EMOTIONAL, AND MOTOR DEVELOPMENT for early learners.
- The tone and activities must be play-based, sensory-rich, active, highly visual, and utilize songs, rhymes, games, simple materials (clay, pebbles, blocks, colors), and puppet storytelling.
- Step 1 (Circle Time & Welcome): Greet children warmly, sing a welcome song/rhyme, say a short prayer, hook their attention with a puppet, mascot, or colorful toy/object related to "${request.lessonTitle}".
- Step 2 (Play-Based Learning Stations / Activities): Guide hands-on child-centered learning and active sensory play. Subdivide activities so children learn via touch, matching, sorting, painting, or singing. Ensure there is plenty of repetition and immediate praise.
- Step 3 (Clean-up & Farewell Routine): Lead a cheerful clean-up song to put materials away, review the lesson topic simply, do a closing song/prayer, and prepare children for a friendly farewell.
- Adjust heading titles and language strictly to match "${targetLanguage}".
`
    : ''
}

CRITICAL PEDAGOGICAL & QUALITY REQUIREMENTS (MUST BE WRITTEN IN ${targetLanguage.toUpperCase()}):
1. INSTRUCTIONAL OBJECTIVE (INTEGO Y'ISOMO):
   ${objectiveInstruction}
   Ensure 'header.instructionalObjective' in the returned JSON contains this complete, beautifully written SMART objective.

2. STEP-BY-STEP PEDAGOGICAL ACTIVITIES (TEACHER & LEARNER ACTIVITIES):
   Provide 3 distinct chronological steps strictly tailored to "${request.lessonTitle}" in ${request.subject}:
   - NOTE: 'stepName' MUST BE TRANSLATED INTO ${targetLanguage.toUpperCase()} (e.g. "Iriburiro / Inyigisho nyirizina / Umwanzuro" in Kinyarwanda, "Introduction / Développement / Conclusion" in French, "Utangulizi / Maendeleo / Hitimisho" in Swahili).
   a) Introduction (10-15% duration):
      - Teacher Activities: Review prerequisite knowledge/previous lesson, hook learner interest, introduce lesson title and instructional objective in ${targetLanguage}.
      - Learner Activities: Answer recap questions, pay active attention, observe learning materials, write down lesson title in notebooks.
   b) Development (70-75% duration):
      - Teacher Activities: Provide clear explanations/demonstrations, organize group work or practical experiments, ask probing higher-order questions, monitor group tasks, address misconceptions in ${targetLanguage}.
      - Learner Activities: Participate in active discovery, collaborate in small groups, perform calculations/experiments/discussions, record observations, present group findings to the class.
   c) Conclusion (10-15% duration):
      - Teacher Activities: Guide synthesis of key concepts, conduct quick formative assessment/exit question, assign homework or extension exercise in ${targetLanguage}.
      - Learner Activities: Summarize main takeaways, answer assessment questions, record homework in exercise books.

3. REB CBC GENERIC COMPETENCES & CROSS-CUTTING ISSUES:
   - Determine 2-3 specific Generic Competences and explain explicitly in ${targetLanguage} how they are practiced during this specific lesson.
   - Determine 1-2 Cross-Cutting Issues and explain explicitly in ${targetLanguage} how they are integrated during this specific lesson.

4. PEDAGOGICAL DIVERSITY & HIGH-LEVEL EDUCATION TECHNOLOGY (SOPHISTICATED NOVELTY):
   - DO NOT USE REPETITIVE OR GENERIC WORDING. Each lesson plan must be custom-tailored to the specific topic ("${request.lessonTitle}").
   - Employ sophisticated, creative, and highly dynamic pedagogical methodologies: inquiry-based learning, problem-solving stations, think-pair-share, case analyses, gamified formative assessments, interactive puzzles, or hands-on simulations.
   - Avoid generic "Teacher explains, students listen" or "Teacher asks, students answer" templates. Provide vivid, highly specific activity descriptions explaining exactly what task/game/scenario learners are participating in.

5. LANGUAGE & FORMATTING:
   - EVERY SINGLE FIELD (headers, step names, activities, competences) MUST BE WRITTEN EXCLUSIVELY IN ${targetLanguage.toUpperCase()}.
   - Ensure the content is compact, clear, and perfectly formatted for a 1-page printable document.
   - For Teacher Self-Evaluation: return empty string "" so the teacher can fill it after lesson delivery.
   - If Open Format is requested, provide a detailed Markdown formatted text version in 'openFormatContent' in ${targetLanguage}.
`;

      const geminiCall = callGeminiWithRetry({
        contents: promptText,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2500,
          systemInstruction: `You are Teacher Pedagogy's AI Fast Master Lesson Plan Generator. Output concise, clear, standard-compliant REB (Rwanda Basic Education Board) Competence-Based Curriculum and RLP lesson plans in ${targetLanguage.toUpperCase()}. Employ highly diverse, creative, and advanced active-learning strategies tailored strictly to the lesson topic. Avoid generic, boilerplate, or copy-paste activity templates. Keep activity descriptions concise and direct (2-3 short bullet points max per box) so generation is extremely fast and fits on 1 printable page. Output strictly valid JSON conforming to the requested schema.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              header: {
                type: Type.OBJECT,
                properties: {
                  schoolName: { type: Type.STRING },
                  teacherName: { type: Type.STRING },
                  term: { type: Type.STRING },
                  date: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  classGrade: { type: Type.STRING },
                  unitNo: { type: Type.STRING },
                  lessonNo: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  classSize: { type: Type.STRING },
                  specialNeeds: { type: Type.STRING },
                  unitTitle: { type: Type.STRING },
                  keyUnitCompetence: { type: Type.STRING },
                  lessonTitle: { type: Type.STRING },
                  instructionalObjective: { type: Type.STRING },
                  location: { type: Type.STRING },
                  learningMaterials: { type: Type.STRING },
                  references: { type: Type.STRING },
                  remedialCount: { type: Type.STRING },
                  consolidationCount: { type: Type.STRING },
                  extensionCount: { type: Type.STRING },
                  remedialGroup1Category: { type: Type.STRING },
                  remedialGroup2Category: { type: Type.STRING },
                  remedialGroup3Category: { type: Type.STRING },
                  remedialGroup4Category: { type: Type.STRING },
                  district: { type: Type.STRING },
                  mainProblemCategory: { type: Type.STRING },
                  specificChallenges: { type: Type.STRING },
                  teachingLearningAids: { type: Type.STRING },
                  group1Objective: { type: Type.STRING },
                  group2Objective: { type: Type.STRING },
                  group3Objective: { type: Type.STRING },
                  identifiedProblems: { type: Type.STRING },
                  remedialActivitiesGroup1: { type: Type.STRING },
                  remedialActivitiesGroup2: { type: Type.STRING },
                  remedialActivitiesGroup3: { type: Type.STRING },
                  usedStepsAssessment: { type: Type.STRING },
                  remedialAids: { type: Type.STRING },
                  consolidationCategory: { type: Type.STRING },
                  consolidationActivities: { type: Type.STRING },
                  consolidationMethodology: { type: Type.STRING },
                  consolidationAids: { type: Type.STRING },
                  extensionCategory: { type: Type.STRING },
                  extensionActivities: { type: Type.STRING },
                  extensionMethodology: { type: Type.STRING },
                  extensionAids: { type: Type.STRING },
                },
                required: [
                  "schoolName",
                  "teacherName",
                  "term",
                  "date",
                  "subject",
                  "classGrade",
                  "unitNo",
                  "lessonNo",
                  "duration",
                  "classSize",
                  "specialNeeds",
                  "unitTitle",
                  "keyUnitCompetence",
                  "lessonTitle",
                  "instructionalObjective",
                  "location",
                  "learningMaterials",
                  "references",
                ],
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepName: { type: Type.STRING },
                    timing: { type: Type.STRING },
                    teacherActivities: { type: Type.STRING },
                    learnerActivities: { type: Type.STRING },
                    competencesAndCrossCutting: { type: Type.STRING },
                  },
                  required: [
                    "stepName",
                    "timing",
                    "teacherActivities",
                    "learnerActivities",
                    "competencesAndCrossCutting",
                  ],
                },
              },
              selfEvaluation: { type: Type.STRING },
              openFormatContent: { type: Type.STRING },
            },
            required: ["header", "steps", "selfEvaluation"],
          },
        },
      });

      const fastTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Fast generation timeout (12s limit for maximum speed)")), 12000)
      );

      const response: any = await Promise.race([geminiCall, fastTimeout]);

      const resultText = response.text || "{}";
      const parsedData = JSON.parse(resultText);

      fullLessonPlan = {
        id: "lp_" + Math.random().toString(36).substring(2, 10),
        createdAt: new Date().toISOString(),
        language: targetLanguage,
        format: planFormat,
        ...parsedData,
      };
      if (fullLessonPlan && fullLessonPlan.header) {
        fullLessonPlan.header.district = request.district || fullLessonPlan.header.district || "N/A";
      }
    } catch (geminiError: any) {
      console.warn("Gemini generation encountered an issue, deploying REB fallback generator:", geminiError?.message || geminiError);
      fullLessonPlan = generateFallbackLessonPlan(request, targetLanguage, planFormat, user?.name);
    }

    if (!fullLessonPlan) {
      fullLessonPlan = generateFallbackLessonPlan(request, targetLanguage, planFormat, user?.name);
    }

    if (fullLessonPlan && fullLessonPlan.header) {
      fullLessonPlan.header.district = request.district || fullLessonPlan.header.district || "N/A";
    }

    // Deduct plan credit from user if not admin
    if (!user.isAdmin) {
      user.remainingPlans = Math.max(0, user.remainingPlans - 1);
    }
    user.totalGenerated = (user.totalGenerated || 0) + 1;
    
    try {
      await saveFirestoreUser(userEmail, user);
    } catch (e) {
      console.warn("Non-fatal: Error updating user firestore state during plan gen:", e);
    }

    // Log generated plan for admin tracking
    try {
      const planLog = {
        id: fullLessonPlan.id,
        userEmail: user.email,
        userName: user.name,
        subject: request.subject,
        classGrade: request.classGrade,
        unitTitle: request.unitTitle,
        lessonTitle: request.lessonTitle,
        language: targetLanguage,
        format: planFormat,
        timestamp: fullLessonPlan.createdAt,
        schoolName: request.schoolName,
        instructionalObjective: fullLessonPlan.header?.instructionalObjective,
      };
      await saveFirestorePlanLog(planLog);
    } catch (e) {
      console.warn("Non-fatal: Error saving plan log to firestore:", e);
    }

    res.json({
      lessonPlan: fullLessonPlan,
      userProfile: user,
    });
  } catch (error: any) {
    console.error("Error generating lesson plan:", error);
    // Safe fallback response even in worst-case error
    try {
      const fallbackUser = {
        email: userEmail,
        name: userEmail ? userEmail.split('@')[0] : 'Teacher',
        remainingPlans: 99,
        isAdmin: true,
      };
      const fallbackPlan = generateFallbackLessonPlan(req.body?.request || {}, 'English', 'reb_grid', fallbackUser.name);
      res.json({
        lessonPlan: fallbackPlan,
        userProfile: fallbackUser,
      });
    } catch (finalErr) {
      res.status(500).json({ error: error?.message || "Failed to generate lesson plan" });
    }
  }
});

// Submit Payment Proof
app.post("/api/submit-payment", async (req, res) => {
  const { userEmail, userName, userPhone, planId, momoTxRef, momoNumber } = req.body;
  if (!userEmail || !planId || !momoTxRef) {
    res.status(400).json({ error: "Missing required payment parameters" });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  let user = await getFirestoreUser(userEmail);
  if (!user) {
    user = await getUserProfile(userEmail);
  }
  if (token) {
    user.sessionToken = token;
    await saveFirestoreUser(userEmail, user);
  }

  const selectedPlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
  if (!selectedPlan) {
    res.status(404).json({ error: "Selected plan not found" });
    return;
  }

  const newSubmission = {
    id: "pay_" + Math.random().toString(36).substring(2, 9),
    userEmail,
    userName: userName || userEmail.split("@")[0],
    userPhone: userPhone || momoNumber,
    planId: selectedPlan.id,
    planLabel: selectedPlan.label,
    amountFrw: selectedPlan.priceFrw,
    plansCount: selectedPlan.plansCount,
    momoTxRef,
    momoNumber: momoNumber || userPhone,
    status: "pending",
    timestamp: new Date().toISOString(),
  };

  await saveFirestorePayment(newSubmission);
  res.json({ message: "Payment proof submitted successfully!", payment: newSubmission });
});

// Get user's payment submissions
app.get("/api/user-payments/:email", async (req, res) => {
  const email = req.params.email;

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
  let user = await getFirestoreUser(email);
  if (!user) {
    user = await getUserProfile(email);
  }
  if (token) {
    user.sessionToken = token;
    await saveFirestoreUser(email, user);
  }

  const allPayments = await getFirestorePayments();
  const userPayments = allPayments.filter(
    (p) => p.userEmail.toLowerCase() === email.toLowerCase()
  );
  res.json(userPayments);
});

// Admin API: Get all payments
app.get("/api/admin/payments", requireAdmin, async (req, res) => {
  const payments = await getFirestorePayments();
  res.json(payments);
});

// Admin API: Approve or Reject Payment
app.post("/api/admin/update-payment-status", requireAdmin, async (req, res) => {
  const { paymentId, status } = req.body;
  const allPayments = await getFirestorePayments();
  const payment = allPayments.find((p) => p.id === paymentId);
  if (!payment) {
    res.status(404).json({ error: "Payment record not found" });
    return;
  }

  payment.status = status;
  await saveFirestorePayment(payment);

  if (status === "approved") {
    const user = await getUserProfile(payment.userEmail);
    user.currentPlan = payment.planLabel;
    user.remainingPlans = (user.remainingPlans || 0) + payment.plansCount;
    await saveFirestoreUser(payment.userEmail, user);
  }

  res.json({ message: `Payment ${status} successfully`, payment });
});

// Fallback Exercises Generator to ensure high-uptime and prevent crash under rate limits/quota errors
function generateFallbackExercises(request: any, language: string): any {
  const isKinyarwanda = language === "Kinyarwanda";
  const isFrench = language === "French";
  const isSwahili = language === "Swahili";

  const creationType = request.creationType || "homework";
  const subject = request.subject || "General Studies";
  const grade = request.grade || "Senior 3";
  const topic = request.topic || "General Science";

  let title = `${subject.toUpperCase()} - ${creationType.toUpperCase()}`;
  if (isKinyarwanda) title = `UMWITOZO WA ${subject.toUpperCase()}`;
  if (isFrench) title = `EXERCICE DE ${subject.toUpperCase()}`;
  if (isSwahili) title = `MAZOEZI YA ${subject.toUpperCase()}`;

  let inst1 = "Attempt all questions in this assessment.";
  let inst2 = "Write your answers clearly in the spaces provided.";
  if (isKinyarwanda) {
    inst1 = "Soma neza ibibazo mbere yo gusubiza.";
    inst2 = "Andika ibisubizo byawe neza ahabugenewe.";
  } else if (isFrench) {
    inst1 = "Répondez à toutes les questions avec soin.";
    inst2 = "Écrivez vos réponses clairement dans les espaces fournis.";
  } else if (isSwahili) {
    inst1 = "Jibu maswali yote katika tathmini hii.";
    inst2 = "Andika majibu yako vizuri kwenye nafasi zilizoachwa.";
  }

  // Create 5 general fallback questions
  const questions = [
    {
      number: 1,
      type: "multiple_choice",
      questionText: isKinyarwanda 
        ? `Ni ryo gice ry'ibanze ry'ubuzima rigize ibinyabuzima byose (Cell)?`
        : isFrench
        ? `Quelle est l'unité fondamentale de structure des organismes vivants ?`
        : isSwahili
        ? `Ni nini kitengo cha msingi cha maisha katika viumbe vyote?`
        : `What is the fundamental structural unit of all living organisms?`,
      options: isKinyarwanda
        ? ["Ingirabuzimafatizo (Cell)", "Uruhu", "Amaraso", "Amazi"]
        : isFrench
        ? ["La cellule", "La peau", "Le sang", "L'eau"]
        : isSwahili
        ? ["Seli (Cell)", "Ngozi", "Damu", "Maji"]
        : ["Cell", "Tissue", "Organ", "System"],
      marks: 2,
      hint: isKinyarwanda ? "Ni ryo gice rigizwe na nucleus ndetse na cytoplasm." : "It contains nucleus and cytoplasm."
    },
    {
      number: 2,
      type: "true_false",
      questionText: isKinyarwanda
        ? `Ese amazi yiswe H2O mu miterere y'ubutabire (Chemical structure)?`
        : isFrench
        ? `L'eau est-elle désignée par H2O en structure chimique ?`
        : isSwahili
        ? `Je, maji huitwa H2O katika muundo wa kemikali?`
        : `Is water chemically represented as H2O?`,
      options: isKinyarwanda ? ["Yego (True)", "Oya (False)"] : isFrench ? ["Vrai (True)", "Faux (False)"] : isSwahili ? ["Ndiyo (True)", "Hapana (False)"] : ["True", "False"],
      marks: 2,
      hint: isKinyarwanda ? "Ifite hydrogen ebyiri na oxygen imwe." : "It has two hydrogen atoms and one oxygen."
    },
    {
      number: 3,
      type: "short_answer",
      questionText: isKinyarwanda
        ? `Sobanura muri make akamaro k'uburezi mu muryango wacu.`
        : isFrench
        ? `Expliquez brièvement l'importance de l'éducation dans notre société.`
        : isSwahili
        ? `Eleza kwa kifupi umuhimu wa elimu katika jamii yetu.`
        : `Briefly explain the importance of education in our society.`,
      marks: 4,
      hint: isKinyarwanda ? "Kuvuga kubyerekeye kubaka ubumenyi n'ikinyabupfura." : "Think about knowledge acquisition and moral development."
    },
    {
      number: 4,
      type: "calculation",
      questionText: isKinyarwanda
        ? `Niba x + 5 = 12, shakisha agaciro ka x.`
        : isFrench
        ? `Si x + 5 = 12, déterminez la valeur de x.`
        : isSwahili
        ? `Ikiwa x + 5 = 12, pata thamani ya x.`
        : `If x + 5 = 12, find the value of x.`,
      marks: 4,
      hint: isKinyarwanda ? "Kura 5 ku mpande zombi." : "Subtract 5 from both sides of the equation."
    },
    {
      number: 5,
      type: "essay",
      questionText: isKinyarwanda
        ? `Andika inyandiko ngufi isobanura uburyo bwo kubungabunga ibidukikije mu Rwanda.`
        : isFrench
        ? `Rédigez un court essai expliquant comment protéger l'environnement au Rwanda.`
        : isSwahili
        ? `Andika insha fupi inayoeleza jinsi ya kuhifadhi mazingira nchini Rwanda.`
        : `Write a short essay explaining how to protect the environment in Rwanda.`,
      marks: 8,
      hint: isKinyarwanda ? "Kuvuga ku gutera ibiti no kwirinda gushira imyanda aho mbonye." : "Mention tree planting, recycling, and avoiding single-use plastics."
    }
  ];

  const answerKey = [
    { questionNumber: 1, answer: isKinyarwanda ? "Ingirabuzimafatizo (Cell)" : isFrench ? "La cellule" : isSwahili ? "Seli (Cell)" : "Cell", explanation: "The cell is the basic structural, functional, and biological unit of all known organisms." },
    { questionNumber: 2, answer: isKinyarwanda ? "Yego (True)" : isFrench ? "Vrai (True)" : isSwahili ? "Ndiyo (True)" : "True", explanation: "Water molecule consists of two hydrogen atoms bonded to one oxygen atom." },
    { questionNumber: 3, answer: isKinyarwanda ? "Uburezi butanga ubumenyi n'ubushobozi bwo kwiteza imbere." : isFrench ? "L'éducation fournit des connaissances et des compétences de développement." : isSwahili ? "Elimu inatoa maarifa na ujuzi wa maendeleo." : "Education provides knowledge, builds skills, and opens economic opportunities.", explanation: "It is critical for both personal development and social progression." },
    { questionNumber: 4, answer: "x = 7", explanation: "x = 12 - 5 = 7." },
    { questionNumber: 5, answer: isKinyarwanda ? "Gutera ibiti, kubaka imirongoti, no kurengera ishyamba rya Nyungwe." : isFrench ? "Planter des arbres, construire des digues et protéger la forêt de Nyungwe." : isSwahili ? "Kupanda miti, kujenga mabwawa na kulinda msitu wa Nyungwe." : "Afforestation, terracing hills, protecting wetlands, and minimizing plastic waste.", explanation: "Practical environmental solutions fit for Rwandan geography." }
  ];

  const markingScheme = [
    { questionNumber: 1, criteria: isKinyarwanda ? "Amanota 2 ku gihubizo cyiza." : "2 marks for the correct option selected.", maxMarks: 2 },
    { questionNumber: 2, criteria: isKinyarwanda ? "Amanota 2 ku gihubizo cyiza." : "2 marks for the correct answer.", maxMarks: 2 },
    { questionNumber: 3, criteria: isKinyarwanda ? "Amanota 2 ku gusobanura neza, n'amanota 2 ku ngero zifatika." : "2 marks for clear definition, 2 marks for real-world relevance.", maxMarks: 4 },
    { questionNumber: 4, criteria: isKinyarwanda ? "Amanota 2 ku murongo ubanza w'ishakiro, amanota 2 ku gihubizo cya nyuma." : "2 marks for showing steps, 2 marks for correct value of x.", maxMarks: 4 },
    { questionNumber: 5, criteria: isKinyarwanda ? "Amanota 4 ku ngingo zifatika, amanota 2 ku miterere y'inyandiko, amanota 2 ku rurimi n'isuku." : "4 marks for quality of arguments, 2 marks for structure, 2 marks for language expression.", maxMarks: 8 }
  ];

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  return {
    id: "ex_" + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    creationType,
    title,
    subject,
    grade,
    topic,
    unit: request.unit,
    timeAllowed: request.timeAllowed || "45 Minutes",
    totalQuestions: questions.length,
    totalMarks,
    language,
    instructions: [inst1, inst2],
    sections: [
      {
        title: isKinyarwanda ? "Igice cya A: Ibibazo Rusange" : isFrench ? "Section A: Questions Générales" : isSwahili ? "Sehemu ya A: Maswali ya Jumla" : "Section A: Comprehensive Evaluation Questions",
        instructions: isKinyarwanda ? "Subiza ibibazo byose ukurikije amabwiriza." : "Attempt all questions in this section.",
        questions
      }
    ],
    answerKey,
    markingScheme
  };
}

// AI Exercise / Homework / Quiz Generation Endpoint
app.post("/api/generate-exercises", async (req, res) => {
  const request = req.body;
  const { language, subject, grade, topic, creationType, useSections, sections, simpleCategory, simpleQuestionCount, simpleMarksPerQuestion, difficulty, timeAllowed, sourceContent } = request;

  if (!subject || !grade || !topic) {
    res.status(400).json({ error: "Missing required parameters: subject, grade, topic" });
    return;
  }

  const targetLanguage = language || "English";
  let outputExercise: any = null;

  try {
    const ai = getGenAI();

    const promptText = `
Generate a highly professional, school-grade assessment paper matching these exact configuration parameters:
- Creation Type: ${creationType} (e.g., homework, classwork, quiz)
- Subject / Trade Name: ${subject}
- Class / Grade / Level: ${grade}
- Topic: ${topic}
- Unit Title: ${request.unit || "N/A"}
- Language: ${targetLanguage} (EVERY SINGLE text field, instruction, question, option, answer, and explanation MUST be written exclusively in ${targetLanguage.toUpperCase()})
- Difficulty Level: ${difficulty}
- Time Allowed: ${timeAllowed}
- Context/Textbook Notes (Optional):
  ${sourceContent ? `[SOURCE TEXT] ${sourceContent}` : "None provided."}

SECTION STRUCTURES TO GENERATE:
${useSections ? 
  sections.map((s: any, idx: number) => `- Section ${idx + 1}: "${s.title}" containing ${s.questionCount} questions of type "${s.category}", with each question worth ${s.marksPerQuestion} marks.`).join("\n")
  :
  `- General Section containing ${simpleQuestionCount} questions of type "${simpleCategory}", with each question worth ${simpleMarksPerQuestion} marks.`
}

IMPORTANT PEDAGOGICAL INSTRUCTIONS:
1. Aligned to Rwanda's Competency-Based Curriculum (CBC) or RTB TVET standards. Questions must promote critical thinking, application, analysis, and problem-solving.
2. For multiple choice (multiple_choice) questions, provide exactly 4 clear, plausible options (A, B, C, D) and specify the correct option letter in the Answer Key.
3. For matching (matching) questions, formulate matching list descriptions clearly.
4. For calculation (calculation) or equation questions, provide a realistic numeric scenario relevant to ${subject}.
5. If includeAnswerKey is true, provide the exact answer and a brief explanation.
6. If includeMarkingScheme is true, provide the evaluation criteria and max marks per question.
7. If includeHints is true, provide a small helpful scaffolded hint for each question.
8. Output MUST be written entirely in ${targetLanguage}. Do not mix languages.
`;

    const response = await callGeminiWithRetry({
      contents: promptText,
      config: {
        temperature: 0.1,
        maxOutputTokens: 2500,
        systemInstruction: `You are Teacher Pedagogy's AI Fast Exercises & Assessment Generator. You create professional, standards-compliant homework, classwork, quizzes, and exams aligned with Rwanda Basic Education Board (REB) and RTB TVET specifications. Output strictly valid JSON conforming to the requested schema. Ensure all fields are fully translated into ${targetLanguage.toUpperCase()}. Keep responses crisp and concise for high generation speed.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        number: { type: Type.INTEGER },
                        type: { type: Type.STRING },
                        questionText: { type: Type.STRING },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING }
                        },
                        marks: { type: Type.INTEGER },
                        hint: { type: Type.STRING }
                      },
                      required: ["number", "type", "questionText", "marks"]
                    }
                  }
                },
                required: ["title", "questions"]
              }
            },
            answerKey: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["questionNumber", "answer"]
              }
            },
            markingScheme: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  criteria: { type: Type.STRING },
                  maxMarks: { type: Type.INTEGER }
                },
                required: ["questionNumber", "criteria", "maxMarks"]
              }
            }
          },
          required: ["title", "instructions", "sections"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    // Calculate totals dynamically from questions
    let qCount = 0;
    let totalMarks = 0;
    parsedData.sections.forEach((sec: any) => {
      qCount += sec.questions.length;
      sec.questions.forEach((q: any) => {
        totalMarks += q.marks;
      });
    });

    outputExercise = {
      id: "ex_" + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      creationType,
      subject,
      grade,
      topic,
      unit: request.unit,
      timeAllowed,
      totalQuestions: qCount,
      totalMarks,
      language: targetLanguage,
      ...parsedData
    };

  } catch (geminiError: any) {
    console.warn("Gemini Exercise generation encountered an issue, deploying fallback generator:", geminiError?.message || geminiError);
    outputExercise = generateFallbackExercises(request, targetLanguage);
  }

  if (!outputExercise) {
    outputExercise = generateFallbackExercises(request, targetLanguage);
  }

  res.json(outputExercise);
});

// Fallback Worksheet Generator to ensure high-uptime and prevent crash under rate limits/quota errors
function generateFallbackWorksheet(request: any): any {
  const isKinyarwanda = (request.language || "").toLowerCase().includes("kinya") || (request.language || "").toLowerCase().includes("rwanda");
  const isFrench = (request.language || "").toLowerCase().includes("french") || (request.language || "").toLowerCase().includes("francais");
  const isSwahili = (request.language || "").toLowerCase().includes("swahili");

  const subject = request.subject || "Mathematics";
  const gradeLevel = request.gradeLevel || "Grade 5";
  const topic = request.topic || "Fractions";
  const worksheetType = request.worksheetType || "short_answer";
  const questionCount = request.questionCount || 10;
  const marksPerQuestion = request.marksPerQuestion || 1;

  let title = `${subject.toUpperCase()} WORKSHEET - ${topic.toUpperCase()}`;
  if (isKinyarwanda) title = `IBAZWA RYA ${subject.toUpperCase()} - ${topic.toUpperCase()}`;
  if (isFrench) title = `FICHE DE TRAVAIL : ${subject.toUpperCase()} - ${topic.toUpperCase()}`;
  if (isSwahili) title = `KARATASI YA KAZI: ${subject.toUpperCase()} - ${topic.toUpperCase()}`;

  let inst1 = "Read and answer all questions carefully.";
  let inst2 = "Write your answers in the spaces provided.";
  if (isKinyarwanda) {
    inst1 = "Soma kandi usubize ibibazo byose neza.";
    inst2 = "Andika ibisubizo byawe ahabugenewe.";
  }

  const questions: any[] = [];
  const answerKey: any[] = [];

  for (let i = 1; i <= questionCount; i++) {
    let qText = `Solve challenge question ${i} about ${topic} in ${subject}.`;
    let ans = `Standard correct answer for question ${i} on ${topic}.`;
    let options: string[] | undefined = undefined;

    if (worksheetType === "multiple_choice") {
      qText = `Which of the following represents a correct statement about ${topic} (Concept ${i})?`;
      options = [
        `Primary representation of ${topic}`,
        `Secondary representation of ${topic}`,
        `Alternate variable definition`,
        `None of the above`
      ];
      ans = "Option A";
    } else if (worksheetType === "true_false") {
      qText = `Is it true that ${topic} is directly related to standard principles of ${subject}? (Question ${i})`;
      options = ["True", "False"];
      ans = "True";
    }

    questions.push({
      number: i,
      questionText: qText,
      options,
      marks: marksPerQuestion
    });

    answerKey.push({
      questionNumber: i,
      answer: ans,
      explanation: `Detailed explanatory scaffold for topic: ${topic}, question ${i}.`
    });
  }

  return {
    id: "ws_" + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    subject,
    gradeLevel,
    topic,
    worksheetType,
    difficulty: request.difficulty || "medium",
    questionCount,
    marksPerQuestion,
    totalMarks: questionCount * marksPerQuestion,
    language: request.language || "English",
    curriculum: request.curriculum,
    country: request.country,
    customInstructions: request.customInstructions,
    additionalDetails: request.additionalDetails,
    title,
    instructions: [inst1, inst2],
    questions,
    answerKey
  };
}

// AI Worksheet Generation Endpoint
app.post("/api/generate-worksheets", async (req, res) => {
  const request = req.body;
  const {
    subject,
    gradeLevel,
    topic,
    worksheetType,
    difficulty,
    questionCount,
    marksPerQuestion,
    language,
    curriculum,
    country,
    customInstructions,
    additionalDetails,
    webSearch,
    includeAnswerKey
  } = request;

  if (!subject || !gradeLevel || !topic) {
    res.status(400).json({ error: "Missing required parameters: subject, gradeLevel, topic" });
    return;
  }

  const targetLanguage = language || "English";
  let outputWorksheet: any = null;

  try {
    const ai = getGenAI();

    const promptText = `
Generate a highly professional, ready-to-print educational Worksheet matching these parameters:
- Subject: ${subject}
- Grade Level / Class: ${gradeLevel}
- Topic to assess: ${topic}
- Worksheet Type: ${worksheetType} (e.g., short_answer, multiple_choice, true_false, fill_blank, matching, mixed)
- Difficulty Level: ${difficulty}
- Number of Questions to generate: ${questionCount}
- Marks per Question: ${marksPerQuestion}
- Target Language: ${targetLanguage} (EVERY SINGLE text field, instruction, question, option, answer, and explanation MUST be written exclusively in ${targetLanguage.toUpperCase()})
- Curriculum (Optional): ${curriculum || "Standard CBC"}
- Country (Optional): ${country || "Rwanda"}
- Custom Instructions (Optional): ${customInstructions || "None"}
- Additional Details (Optional): ${additionalDetails || "None"}
- Web Search Enabled: ${webSearch ? "Yes" : "No"}

IMPORTANT PEDAGOGICAL INSTRUCTIONS:
1. Ensure the level of questions is perfectly adapted to ${gradeLevel} learners.
2. For multiple choice (multiple_choice) questions, provide exactly 4 clear, plausible options (e.g. "Primary definition", "Alternative explanation", etc.) and specify the correct option in the Answer Key. Do not label the options as A, B, C, D in the options list itself, just write the options text, so they can be rendered dynamically.
3. For true_false questions, options should be precisely ["True", "False"] or translated counterparts (e.g. ["Yego", "Oya"] in Kinyarwanda).
4. For matching questions, formulate matching list descriptions clearly.
5. If includeAnswerKey is true, provide the exact answer and a brief explanation.
6. Custom instructions or additional details must be respected if provided.
7. Output MUST be written entirely in ${targetLanguage}. Do not mix languages.
`;

    const response = await callGeminiWithRetry({
      contents: promptText,
      config: {
        systemInstruction: `You are Teacher Tool's AI Master Worksheet Generator. You create professional, standard-compliant printable worksheets and answer keys. Output strictly valid JSON conforming to the requested schema. Ensure all fields are fully translated into ${targetLanguage.toUpperCase()}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.INTEGER },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  marks: { type: Type.INTEGER }
                },
                required: ["number", "questionText", "marks"]
              }
            },
            answerKey: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionNumber: { type: Type.INTEGER },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["questionNumber", "answer"]
              }
            }
          },
          required: ["title", "instructions", "questions"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    outputWorksheet = {
      id: "ws_" + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      subject,
      gradeLevel,
      topic,
      worksheetType,
      difficulty,
      questionCount,
      marksPerQuestion,
      totalMarks: questionCount * marksPerQuestion,
      language: targetLanguage,
      curriculum,
      country,
      customInstructions,
      additionalDetails,
      ...parsedData
    };

  } catch (geminiError: any) {
    console.warn("Gemini Worksheet generation issue, deploying fallback:", geminiError?.message || geminiError);
    outputWorksheet = generateFallbackWorksheet(request);
  }

  if (!outputWorksheet) {
    outputWorksheet = generateFallbackWorksheet(request);
  }

  res.json(outputWorksheet);
});

// Presentation Slides Fallback Generator
function generateFallbackSlides(request: any): any {
  const isKiny = (request.language || "").toLowerCase().includes("kinya") || (request.language || "").toLowerCase().includes("rwanda");
  const isFrench = (request.language || "").toLowerCase().includes("fren") || (request.language || "").toLowerCase().includes("fran");
  const isSwahili = (request.language || "").toLowerCase().includes("swah") || (request.language || "").toLowerCase().includes("kisw");

  const subject = request.subject || "General Science";
  const grade = request.grade || "Primary 5";
  const topic = request.topic || "Ecosystems";
  const duration = request.lessonDuration || "40 minutes";
  const theme = request.theme || "Classic Chalk";
  
  let slideCountNum = 6;
  if (request.slideCount && request.slideCount !== "Auto") {
    slideCountNum = parseInt(request.slideCount) || 6;
  }

  let title = `${topic}`;
  let subtitle = `${subject} - Grade ${grade} | ${duration}`;
  
  if (isKiny) {
    subtitle = `${subject} - Umwaka wa ${grade} | Igihe: ${duration}`;
  } else if (isFrench) {
    subtitle = `${subject} - Niveau ${grade} | Durée: ${duration}`;
  } else if (isSwahili) {
    subtitle = `${subject} - Darasa la ${grade} | Muda: ${duration}`;
  }

  const slides = [];

  // Slide 1: Welcome & Intro
  slides.push({
    slideTitle: isKiny ? "1. Iribukiro n'Intangiriro" : isFrench ? "1. Introduction" : isSwahili ? "1. Utangulizi" : "1. Introduction to the Lesson",
    bullets: isKiny ? [
      `Uyu munsi turiga ku nsanganyamatsiko: ${topic}`,
      `Gusobanukirwa n'ibice by'ingenzi by'iri somo`,
      `Kugaragaza aho tubikoresha mu buzima bwa buri munsi`
    ] : isFrench ? [
      `Aujourd'hui, nous allons explorer le sujet : ${topic}`,
      `Comprendre les concepts clés de cette leçon`,
      `Découvrir des exemples concrets du quotidien`
    ] : isSwahili ? [
      `Leo tutajifunza kuhusu mada: ${topic}`,
      `Kuelewa mambo muhimu ya somo hili`,
      `Gundua mifano halisi katika maisha ya kila siku`
    ] : [
      `Today, we will explore the interesting topic: ${topic}`,
      `Understand the foundational concepts and importance`,
      `Connect lessons with real-world applications around us`
    ],
    illustrationPrompt: `A warm welcoming classroom scene with colorful boards highlighting the topic: ${topic}`,
    teacherNotes: isKiny ? "Baza abana niba hari icyo bazi kuri iyi nsanganyamatsiko kugira ngo ubahe ikaze." : "Posez des questions d'introduction pour stimuler la curiosité des élèves.",
    timing: "5 min"
  });

  // Slide 2: Key Concepts
  slides.push({
    slideTitle: isKiny ? "2. Ingingo z'Ibanze" : isFrench ? "2. Concepts Clés" : isSwahili ? "2. Mawazo Muhimu" : "2. Core Concept Overview",
    bullets: isKiny ? [
      `Gusesengura iby'ingenzi bigize isomo rya ${topic}`,
      `Uko buri gice gihuzwa n'ikindi mu buryo bwizewe`,
      `Ibibazo n'ibisubizo by'ibanze ku bintu bishya twize`
    ] : isFrench ? [
      `Analyse des éléments constitutifs de : ${topic}`,
      `Relation de cause à effet entre les variables étudiées`,
      `Vocabulaire essentiel à retenir`
    ] : isSwahili ? [
      `Uchambuzi wa misingi mikuu ya somo la ${topic}`,
      `Uhusiano kati ya vipengele tofauti tunavyochunguza`,
      `Misingi ya kisayansi na kijamii ya mada`
    ] : [
      `Detailed breakdown of the core elements of ${topic}`,
      `Analyzing how these components function together`,
      `Key terms and definitions to remember during the lesson`
    ],
    illustrationPrompt: `A neat flowchart diagram or mental map showing components of ${topic}`,
    teacherNotes: isKiny ? "Sobanura amagambo atoroshye y'ibanze ukoresheje ingero zifatika." : "Expliquez les termes clés à l'aide d'exemples illustrés.",
    timing: "10 min"
  });

  // Slide 3: Application / Deep Dive
  slides.push({
    slideTitle: isKiny ? "3. Isesengura n'Imyitozo" : isFrench ? "3. Approfondissement" : isSwahili ? "3. Maombi na Mazoezi" : "3. Application & Deep Dive",
    bullets: isKiny ? [
      `Uburyo bwo gushyira mu bikorwa ibyo twize ku ${topic}`,
      `Inyungu n'akamaro byabyo mu iterambere`,
      `Icyitegererezo cyiza cyo kureberaho kirimo gushushanywa`
    ] : isFrench ? [
      `La mise en œuvre des concepts de : ${topic}`,
      `Résolution d'exemples pas-à-pas avec la classe`,
      `Exercices collectifs de mise en situation`
    ] : isSwahili ? [
      `Matumizi ya vitendo ya dhana ya ${topic}`,
      `Kusuluhisha changamoto hatua kwa hatua kama kikundi`,
      `Mifano ya jinsi ya kutatua matatizo haya`
    ] : [
      `Practical applications of ${topic} in science or daily life`,
      `Interactive step-by-step guidance through a sample problem`,
      `Collaborative exercises to solve on the board`
    ],
    illustrationPrompt: `An educational illustration showing a practical, hands-on application of ${topic}`,
    teacherNotes: isKiny ? "Fasha abanyeshuri gukora imyitozo mu matsinda mato no gufashanya." : "Guidez les élèves dans la résolution collaborative de l'exercice.",
    timing: "10 min"
  });

  // Slide 4: Group Discussion
  slides.push({
    slideTitle: isKiny ? "4. Ikiganiro mu Matsinda" : isFrench ? "4. Discussion en Groupe" : isSwahili ? "4. Majadiliano ya Vikundi" : "4. Peer Collaboration & Discussion",
    bullets: isKiny ? [
      `Ganira na bagenzi bawe ku bibazo bijyanye na ${topic}`,
      `Tanga ingero zindi z'aho ubona ibyo twize mu gace k'iwanyu`,
      `Andika ingingo z'ingenzi itsinda ryanyu ryemeranyijeho`
    ] : isFrench ? [
      `Discutez en binômes des implications de : ${topic}`,
      `Comparez vos idées et trouvez un compromis éducatif`,
      `Notez les conclusions majeures de votre équipe`
    ] : isSwahili ? [
      `Jadili na wenzako changamoto au faida za ${topic}`,
      `Toa mifano kutoka kwa jamii yenu ya karibu`,
      `Andika muhtasari wa mawazo ya pamoja ya kikundi`
    ] : [
      `Form small teams and debate the impact of ${topic}`,
      `Identify local or global examples in your immediate community`,
      `Synthesize 3 primary conclusions to share with the rest of the class`
    ],
    illustrationPrompt: `A friendly group of students working and brainstorming together on a workspace`,
    teacherNotes: isKiny ? "Genda uzunguruka mu matsinda ubaza ibibazo n'inyunganira zituma banyuranya ingingo." : "Faites le tour des groupes pour encourager la participation de chacun.",
    timing: "10 min"
  });

  // Slide 5: Summary & Assessment
  slides.push({
    slideTitle: isKiny ? "5. Umwanzuro n'Isuzumwa" : isFrench ? "5. Synthèse & Évaluation" : isSwahili ? "5. Muhtasari na Tathmini" : "5. Review & Self-Assessment",
    bullets: isKiny ? [
      `Ibyo twize uyu munsi muri make ku isomo rya ${topic}`,
      `Ibibazo ngufi byo kwisuzuma niba twumvise neza`,
      `Umukoro n'inyigisho z'inyongezo ku ntego z'isomo`
    ] : isFrench ? [
      `Synthèse des connaissances acquises aujourd'hui`,
      `Quiz rapide pour évaluer la compréhension immédiate`,
      `Devoirs à la maison et perspectives de révision`
    ] : isSwahili ? [
      `Muhtasari wa kile tulichojifunza leo kuhusu ${topic}`,
      `Tathmini fupi ya haraka ya kujaribu uelewa wetu`,
      `Kazi ya ziada ya nyumbani na dondoo za kusoma`
    ] : [
      `Key takeaways and summary of what we learned today`,
      `Quick wrap-up quiz or checks for understanding`,
      `Homework assignment or further reading to reinforce the lesson`
    ],
    illustrationPrompt: `A simple checklist or graduation cap symbol indicating completion of ${topic}`,
    teacherNotes: isKiny ? "Shima abanyeshuri bose ku bw'umwete mu isomo ry'uyu munsi." : "Félicitez les élèves pour leur excellent travail aujourd'hui.",
    timing: "5 min"
  });

  // If more slides are requested, we can duplicate/adapt
  while (slides.length < slideCountNum) {
    const i = slides.length + 1;
    slides.push({
      slideTitle: `Slide ${i}: Extra Enrichment Topic`,
      bullets: [
        `Further supplementary material about ${topic}`,
        `Extended exploration of specific case studies`,
        `Extra reflection questions for interested pupils`
      ],
      illustrationPrompt: `An abstract symbol of lightbulb or book showing extra information on ${topic}`,
      teacherNotes: "Provide this extra information only if time permits.",
      timing: "5 min"
    });
  }

  // Slice if fewer are requested (e.g. if count is less than 5)
  const finalSlides = slides.slice(0, slideCountNum);

  return {
    id: "pres_" + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    subject,
    grade,
    topic,
    lessonDuration: duration,
    language: request.language || "English",
    country: request.country || "Rwanda",
    curriculumStandard: request.curriculumStandard || "Standard Curriculum",
    additionalDetails: request.additionalDetails || "",
    pasteNotes: request.pasteNotes || "",
    includeTimings: !!request.includeTimings,
    simplifiedMode: !!request.simplifiedMode,
    theme,
    notesStyle: request.notesStyle || "Detailed",
    bulletStyle: request.bulletStyle || "Concise",
    title,
    subtitle,
    slides: finalSlides
  };
}

// AI Presentation Slides Generation Endpoint
app.post("/api/generate-slides", async (req, res) => {
  const request = req.body;
  const {
    subject,
    grade,
    topic,
    lessonDuration,
    language,
    country,
    curriculumStandard,
    additionalDetails,
    pasteNotes,
    searchCurriculum,
    generateImages,
    notesStyle,
    bulletStyle,
    slideCount,
    includeTimings,
    simplifiedMode,
    theme
  } = request;

  if (!subject || !grade || !topic) {
    res.status(400).json({ error: "Missing required parameters: subject, grade, topic" });
    return;
  }

  const targetLanguage = language || "English";
  let outputSlides: any = null;

  try {
    const ai = getGenAI();

    // Determine target slide count
    let slideCountPrompt = "around 6-8 comprehensive slides";
    if (slideCount && slideCount !== "Auto") {
      slideCountPrompt = `exactly ${slideCount} slides`;
    }

    const promptText = `
Generate a highly professional, beautiful educational classroom Presentation Slide Deck matching these parameters:
- Subject: ${subject}
- Target Grade / Class level: ${grade}
- Slide Presentation Topic: ${topic}
- Lesson Duration / Pace: ${lessonDuration || "40 minutes"}
- Theme Mode: ${theme || "Classic Chalk"}
- Requested Slides Count: ${slideCountPrompt}
- Target Language: ${targetLanguage} (EVERY SINGLE text field, slide title, bullet points, teacher notes, timing, etc. MUST be written exclusively in ${targetLanguage.toUpperCase()})
- Country Context: ${country || "Rwanda"}
- Curriculum Standard: ${curriculumStandard || "Rwanda REB Standards"}
- Teacher Notes Style: ${notesStyle || "Detailed"} (Ensure teacherNotes contain comprehensive teaching guidance of at least 100+ words per slide if "Detailed", or quick bullet points if "Quick")
- Bullet Point Style: ${bulletStyle || "Concise"} (Each bullet in the bullets array must be short and concise (5-10 words each) if "Concise", or descriptive if "Detailed")
- Additional Instructions: ${additionalDetails || "None"}
- Seed Notes / Content pasted by teacher: ${pasteNotes || "None"}
- Include Slide Timings: ${includeTimings ? "Yes" : "No"} (If yes, specify an estimated timing like "5 min" or "10 min" for each slide in the timing field)
- Simplified Mode (No complex academic jargon): ${simplifiedMode ? "Yes" : "No"}

IMPORTANT INSTRUCTION ON OUTPUT LANGUAGE:
- You MUST write all slide titles, bullet points, and teacherNotes strictly in ${targetLanguage.toUpperCase()}. Do not write any English words if Kinyarwanda, Swahili, or French was selected!

Please output strictly valid JSON with the exact requested responseSchema.
`;

    const response = await callGeminiWithRetry({
      contents: promptText,
      config: {
        systemInstruction: `You are Teacher Tool's AI Master Slides & Presentation Creator. You design highly engaging, beautifully structured educational classroom slide decks and detailed teacher guiding scripts. Return strictly valid JSON conforming to the requested schema. Ensure all fields are fully translated into ${targetLanguage.toUpperCase()}.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideTitle: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  illustrationPrompt: { type: Type.STRING, description: "A detailed descriptive prompt for creating a relevant, high-contrast, educational vector diagram, icon, or visual representing the slide content" },
                  teacherNotes: { type: Type.STRING, description: "The spoken text, lecture guide, or instructions for the teacher to present this specific slide" },
                  timing: { type: Type.STRING, description: "Estimated time to spend on this slide, e.g. '5 min'" }
                },
                required: ["slideTitle", "bullets", "illustrationPrompt", "teacherNotes"]
              }
            }
          },
          required: ["title", "subtitle", "slides"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    outputSlides = {
      id: "pres_" + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      subject,
      grade,
      topic,
      lessonDuration,
      language: targetLanguage,
      country,
      curriculumStandard,
      additionalDetails,
      pasteNotes,
      includeTimings,
      simplifiedMode,
      theme,
      notesStyle,
      bulletStyle,
      ...parsedData
    };

  } catch (geminiError: any) {
    console.warn("Gemini Slides generation issue, deploying fallback:", geminiError?.message || geminiError);
    outputSlides = generateFallbackSlides(request);
  }

  if (!outputSlides) {
    outputSlides = generateFallbackSlides(request);
  }

  res.json(outputSlides);
});

// Fallback generator for Schemes of Work (SOW)
function generateFallbackScheme(request: any) {
  const { type, level, tradeOrSubject, moduleTitle, term, numberOfWeeks, language } = request;
  const weeksCount = parseInt(numberOfWeeks) || 10;
  const lang = language || 'English';

  const isKinya = lang.toLowerCase().includes('kinya') || lang.toLowerCase().includes('rwanda');
  const isFrench = lang.toLowerCase().includes('french') || lang.toLowerCase().includes('fran');
  const isSwahili = lang.toLowerCase().includes('swahili') || lang.toLowerCase().includes('kiswahili');

  let title = `Scheme of Work - ${tradeOrSubject}`;
  let subtitle = `${type === 'reb' ? 'REB CBC' : 'RTB TVET'} Modular Planning - ${level} - ${term}`;
  
  if (isKinya) {
    title = `Amateganyanyigisho ya ${tradeOrSubject}`;
    subtitle = `${type === 'reb' ? 'REB CBC' : 'RTB TVET'} - ${level} - ${term}`;
  } else if (isFrench) {
    title = `Schéma de Cours - ${tradeOrSubject}`;
    subtitle = `Planification ${type === 'reb' ? 'REB' : 'RTB'} - ${level} - ${term}`;
  } else if (isSwahili) {
    title = `Mpango wa Kazi - ${tradeOrSubject}`;
    subtitle = `Upangaji ${type === 'reb' ? 'REB' : 'RTB'} - ${level} - ${term}`;
  }

  const weeks = [];
  for (let i = 1; i <= weeksCount; i++) {
    let topic = "";
    let subtopic = "";
    let competency = "";
    let teacherAct = "";
    let learnerAct = "";
    let resources = "";
    let assessment = "";

    if (type === 'reb') {
      if (isKinya) {
        topic = `Umutwe wa ${Math.ceil(i/3)}: Ingingo z'ingenzi z'isomo rya ${tradeOrSubject}`;
        subtopic = `Ingingo ya ${i}: Umwiherero n'inyigisho rusange`;
        competency = `Gushobora gusobanukirwa no gushyira mu bikorwa ubumenyi bw'isomo ry'icyiciro cya ${level}.`;
        teacherAct = `Mwarimu arasobanuza, arema amatsinda y'abanyeshuri, akabahemba no kubayobora.`;
        learnerAct = `Abanyeshuri barakorera hamwe mu matsinda, bafata amafishi y'ibikorwa, kandi berekana ibyo bagezeho.`;
        resources = `Ibitabo by'umwarimu, imfashanyigisho, ibikoresho byo kwifashisha mu ishuri.`;
        assessment = `Ibibazo n'ibisubizo mu ishuri, imyitozo yo mu makaye, n'isuzuma ngororashingiro rya buri cyumweru.`;
      } else if (isFrench) {
        topic = `Module ${Math.ceil(i/3)}: Principes fondamentaux de ${tradeOrSubject}`;
        subtopic = `Thème de leçon ${i}: Analyse approfondie et exploration active`;
        competency = `Démontrer une compréhension conceptuelle et des applications pratiques pour ${level}.`;
        teacherAct = `L'enseignant introduit les concepts, anime la discussion et organise des tâches de groupe.`;
        learnerAct = `Les élèves participent activement, complètent des fiches et évaluent leurs pairs.`;
        resources = `Guide pédagogique REB, manuel de l'élève, et diapositives de cours.`;
        assessment = `Évaluation formative par participation, petit quiz et fiches de devoirs.`;
      } else {
        topic = `Unit ${Math.ceil(i/3)}: Fundamental Core Principles of ${tradeOrSubject}`;
        subtopic = `Lesson Topic ${i}: In-depth analysis and exploration`;
        competency = `To demonstrate solid conceptual understanding and practical applications of ${tradeOrSubject} topics aligned with ${level} benchmarks.`;
        teacherAct = `The teacher introduces the concepts, guides class discussion, organizes small group tasks, and provides immediate scaffolding.`;
        learnerAct = `Learners engage in active cooperative learning, perform tasks, complete structured worksheets, and participate in peer evaluation.`;
        resources = `Official REB Teacher's Guide, Student Textbook, multimedia slides, and chart diagrams.`;
        assessment = `Formative assessment via active class participation, quick individual quiz, and group workbook reviews.`;
      }
    } else {
      const mod = moduleTitle || `Module on ${tradeOrSubject}`;
      if (isKinya) {
        topic = `Module: ${mod}`;
        subtopic = `Intego yo Kwiga (LO) ${Math.ceil(i/4)}: Gushyira mu bikorwa ubumenyi ngiro`;
        competency = `Trainee ishabuka mu nshingano n'ubumenyi ngiro bwa ${tradeOrSubject}.`;
        teacherAct = `Umutoza (Trainer) arerekana uko umushinga ukorwa, agasobanura amabwiriza y'umutekano n'ibikoresho.`;
        learnerAct = `Abasore n'inkumi barimenyereza gukora umushinga ku bikoresho, mu ma-workshop cyangwa kurema ibishushanyo.`;
        resources = `Ibikoresho by'ikoranabuhanga n'ubumenyi ngiro, imfashanyigisho z'umutoza.`;
        assessment = `Isuzuma rishingiye ku musaruro w'akazi (practical rubric), ikizamini ngiro n'itanga rya feedback.`;
      } else if (isFrench) {
        topic = `Module: ${mod}`;
        subtopic = `Objectif d'Apprentissage (LO) ${Math.ceil(i/4)}: Démonstration pratique des techniques clés`;
        competency = `Le stagiaire est capable d'appliquer de manière autonome des procédures industrielles de ${tradeOrSubject}.`;
        teacherAct = `Le formateur démontre les étapes professionnelles et supervise les activités dans l'atelier.`;
        learnerAct = `Les stagiaires réalisent des exercices pratiques et enregistrent les mesures de performance.`;
        resources = `Manuels de formation TVET, équipement d'atelier, et fiches techniques.`;
        assessment = `Évaluation pratique basée sur la performance avec grille de notation de sécurité.`;
      } else {
        topic = `Module: ${mod}`;
        subtopic = `Learning Outcome (LO) ${Math.ceil(i/4)}: Practical Demonstration and Application of Key Techniques`;
        competency = `Trainee is able to competently and independently apply industry-standard procedures in ${tradeOrSubject}.`;
        teacherAct = `The trainer demonstrates professional hands-on execution steps, highlights health and safety protocols, and supervises workshop practice.`;
        learnerAct = `Trainees perform hands-on exercises in the workshop, operate training equipment, record measurements, and troubleshoot issues.`;
        resources = `Industry standard toolkits, TVET learning guides, safety gear, raw materials, and simulator computers.`;
        assessment = `Performance-based practical assessment using a structured rubric grading accuracy, speed, and safety compliance.`;
      }
    }

    weeks.push({
      weekNumber: i,
      topicOrModule: topic,
      subTopicOrLO: subtopic,
      keyCompetencyOrLOCompetence: competency,
      teacherActivities: teacherAct,
      learnerActivities: learnerAct,
      resources: resources,
      assessment: assessment
    });
  }

  return {
    id: "sow_" + Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    title,
    subtitle,
    metadata: {
      curriculum: type === 'reb' ? 'REB CBC' : 'RTB TVET',
      level,
      subject: tradeOrSubject,
      term,
      language: lang
    },
    weeks
  };
}

// AI Curriculum SOW Generation Endpoint
app.post("/api/generate-scheme", async (req, res) => {
  const request = req.body;
  const {
    type,
    level,
    tradeOrSubject,
    moduleTitle,
    term,
    numberOfWeeks,
    language,
    additionalInfo
  } = request;

  if (!type || !level || !tradeOrSubject || !term) {
    res.status(400).json({ error: "Missing required parameters: type, level, tradeOrSubject, term" });
    return;
  }

  const weeksCount = parseInt(numberOfWeeks) || 10;
  const targetLanguage = language || "English";

  let generatedSOW: any = null;

  try {
    const ai = getGenAI();
    const systemInstruction = `You are Teacher Tool's AI Curriculum Specialist and SOW Architect for Rwanda. You construct detailed, highly professional Schemes of Work (SOW) aligned with the Rwanda Education Board (REB) Competence-Based Curriculum (CBC) or the Rwanda TVET Board (RTB) modular curriculum standards. Return strictly valid JSON conforming to the requested schema. Translate all content to ${targetLanguage.toUpperCase()}.`;
    
    const promptText = `Generate a detailed Scheme of Work (SOW) for Rwanda with these details:
- Curriculum Framework Type: ${type.toUpperCase()} (${type === 'reb' ? 'REB CBC (General Education)' : 'RTB/TVET Modular curriculum'})
- Target Grade / Class Level: ${level}
- Subject or Trade: ${tradeOrSubject}
${type === 'rtb' && moduleTitle ? `- Module Title: ${moduleTitle}` : ''}
- Academic Term: ${term}
- Total Weeks of Planning: ${weeksCount}
- Language: ${targetLanguage}
- Additional Guidance or Context: ${additionalInfo || "None"}

Please output exactly ${weeksCount} items in the "weeks" array representing Weeks 1 through ${weeksCount} sequentially.
Make the educational topics, outcomes, teaching steps, activities, resources, and assessments highly descriptive, professional, and directly tailored to the curriculum selected.

You MUST write all output fields in ${targetLanguage.toUpperCase()}.`;

    const response = await callGeminiWithRetry({
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            subtitle: { type: Type.STRING },
            metadata: {
              type: Type.OBJECT,
              properties: {
                curriculum: { type: Type.STRING },
                level: { type: Type.STRING },
                subject: { type: Type.STRING },
                term: { type: Type.STRING },
                language: { type: Type.STRING }
              },
              required: ["curriculum", "level", "subject", "term"]
            },
            weeks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  weekNumber: { type: Type.INTEGER },
                  topicOrModule: { type: Type.STRING, description: "REB Unit/Topic or RTB module code & title" },
                  subTopicOrLO: { type: Type.STRING, description: "REB Sub-topic or RTB Learning Outcome (LO)" },
                  keyCompetencyOrLOCompetence: { type: Type.STRING, description: "Unit/LO core competency or performance indicators" },
                  teacherActivities: { type: Type.STRING, description: "Active teaching methods, guides, explanation, group set up" },
                  learnerActivities: { type: Type.STRING, description: "Practical exercises, cooperative tasks, worksheet work" },
                  resources: { type: Type.STRING, description: "Official textbook page references, workshop tools, computers, or slides" },
                  assessment: { type: Type.STRING, description: "Specific formative evaluation checks, assignments, or quiz tasks" }
                },
                required: ["weekNumber", "topicOrModule", "subTopicOrLO", "keyCompetencyOrLOCompetence", "teacherActivities", "learnerActivities", "resources", "assessment"]
              }
            }
          },
          required: ["title", "subtitle", "weeks"]
        }
      }
    });

    if (response && response.text) {
      const parsedText = response.text.trim();
      generatedSOW = JSON.parse(parsedText);
      // Inject fallback attributes just in case
      generatedSOW.id = "sow_" + Math.random().toString(36).substring(2, 10);
      generatedSOW.createdAt = new Date().toISOString();
    }
  } catch (error: any) {
    console.warn("Gemini SOW generation error, deploying fallback:", error?.message || error);
    generatedSOW = generateFallbackScheme(request);
  }

  if (!generatedSOW) {
    generatedSOW = generateFallbackScheme(request);
  }

  res.json(generatedSOW);
});

// Save Certificate to Firestore/Memory
app.post("/api/certificates/save", async (req, res) => {
  try {
    const certData = req.body;
    if (!certData || (!certData.certificateNumber && !certData.id)) {
      res.status(400).json({ error: "Invalid certificate data" });
      return;
    }
    await saveFirestoreCertificate(certData);
    res.json({ success: true, certificate: certData });
  } catch (err: any) {
    console.error("Error saving certificate:", err);
    res.status(500).json({ error: "Failed to save certificate" });
  }
});

// Verify Certificate endpoint
app.get("/api/certificates/verify/:certNumber", async (req, res) => {
  try {
    const certNumber = req.params.certNumber;
    const cert = await getFirestoreCertificateByNumber(certNumber);
    if (!cert) {
      res.status(404).json({
        verified: false,
        certificateNumber: certNumber,
        error: "Certificate not found or not registered in official database."
      });
      return;
    }

    res.json({
      verified: true,
      certificateNumber: cert.certificateNumber || certNumber,
      certificate: cert,
      verifier: "NKUNDIMANA Theogene",
      issuerRole: "Creator & Founder, Nkorera Education / AI Teacher Systems",
      verifierPhone: "0781339530 / 0724038043",
      statusMessage: "Official Certificate Authenticity Verified by Nkundimana Theogene."
    });
  } catch (err: any) {
    console.error("Error verifying certificate:", err);
    res.status(500).json({ error: "Failed to verify certificate" });
  }
});

// Catch-all 404 for any unhandled /api/* route to ensure valid JSON is returned
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
});

// Global error handling middleware for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled server error:", err);
  if (req.path && req.path.startsWith("/api")) {
    res.status(500).json({ error: err?.message || "Internal server error" });
    return;
  }
  next(err);
});

// Serve static assets from public folder (sw.js, manifest.json, icons) with correct MIME types
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(process.cwd(), "public", "sw.js"));
});

app.use(express.static(path.join(process.cwd(), "public")));

// Start Express and Vite middleware
async function startServer() {
  // Sync caches and seed initial default data if database is brand new
  await seedFirestoreIfNeeded();

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Teacher Tool Server running on http://localhost:${PORT}`);
  });
}

export default app;

if (!process.env.VERCEL) {
  startServer();
}
