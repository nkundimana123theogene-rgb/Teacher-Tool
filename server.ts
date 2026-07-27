import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { SUBSCRIPTION_PLANS, OWNER_INFO } from "./src/data/plans.js";
import { initializeApp } from "firebase/app";
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

app.use(express.json());

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

// Initialize Firebase App & Firestore
let db: any = null;
if (firebaseConfig) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
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

app.post("/api/update-country", async (req, res) => {
  const { email, country } = req.body;
  if (!email || !country) {
    res.status(400).json({ error: "Email and country are required" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ntabwo wemerewe guhindura igihugu utarinjira (Authorization required)." });
    return;
  }
  const token = authHeader.substring(7);
  const user = await getFirestoreUser(email);
  if (!user) {
    res.status(401).json({ error: "Guhuza konti yawe byapfuye. Ongera ugaruke winjire (Invalid session)." });
    return;
  }
  if (user.sessionToken !== token) {
    if (!user.sessionToken && token.startsWith("tok_")) {
      user.sessionToken = token;
    } else {
      res.status(401).json({ error: "Guhuza konti yawe byapfuye. Ongera ugaruke winjire (Invalid session)." });
      return;
    }
  }

  user.country = country;
  await saveFirestoreUser(email, user);

  const responseUser = { ...user };
  delete responseUser.password;
  res.json(responseUser);
});

// AI Lesson Plan Generation Endpoint
app.post("/api/generate-lesson-plan", async (req, res) => {
  try {
    const { request, userEmail } = req.body;
    if (!request || !userEmail) {
      res.status(400).json({ error: "Lesson plan request and user email are required" });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ntabwo wemerewe gukora isomo utarinjira (Sign in required)." });
      return;
    }
    const token = authHeader.substring(7);
    const user = await getFirestoreUser(userEmail);
    if (!user) {
      res.status(401).json({ error: "Guhuza konti yawe byapfuye. Banza ugaruke winjire (Invalid session)." });
      return;
    }
    if (user.sessionToken !== token) {
      if (!user.sessionToken && token.startsWith("tok_")) {
        user.sessionToken = token;
      } else {
        res.status(401).json({ error: "Guhuza konti yawe byapfuye. Banza ugaruke winjire (Invalid session)." });
        return;
      }
    }

    if (!user.isAdmin && user.remainingPlans <= 0) {
      res.status(403).json({
        error: "Lesson plans z'ukwezi kwanyu cyangwa izo mwaguze zarangiye (0 Plans Remaining)! Banza ugure izindi lesson plans zishya muri Subscription gukomeza igikorwa cyanyu.",
        code: "QUOTA_EXCEEDED"
      });
      return;
    }

    const ai = getGenAI();
    const targetLanguage = request.language || "English";
    const planFormat = request.format || "reb_grid";

    const userObjective = request.instructionalObjective?.trim();
    const objectiveInstruction = (userObjective && userObjective !== "Auto-generated by AI" && userObjective.length > 5)
      ? `User Provided Objective Draft: "${userObjective}". Polish, refine, and re-format this draft into an exemplary, highly professional Instructional Objective in ${targetLanguage} directly aligned with "${request.lessonTitle}". It MUST strictly adhere to the "ABCD model of instructional objectives" (also known as the "four components of instructional objectives"):
- Audience (A): The target learners ("By the end of the lesson, learners will be able to..." / "Mu gusoza isomo, abanyeshuri bazaba bashoboye...")
- Behavior (B): Clear, observable, and measurable performance/action verb (e.g., identify, calculate, construct, explain, analyze, gusobanura, gukora, gupima) coupled with the specific content/concept of "${request.lessonTitle}"
- Condition (C): The situation/context/materials under which the learning occurs ("Given [materials/diagrams/context]" / "Bahawe [ibikoresho/inyandiko/amashusho]")
- Degree (D): The standard of success or performance criterion (e.g., "accurately", "correctly", "without error", "mu buryo bw'ukuri").`
      : `Generate a brand new, exemplary, highly professional Instructional Objective in ${targetLanguage} tailored specifically to the subject "${request.subject}", unit "${request.unitTitle}", and lesson topic "${request.lessonTitle}". It MUST strictly follow the "ABCD model of instructional objectives" (also known as the "four components of instructional objectives"):
- Audience (A): The target learners ("By the end of the lesson, learners will be able to..." / "Mu gusoza isomo, abanyeshuri bazaba bashoboye...")
- Behavior (B): Clear, observable, and measurable performance/action verb (e.g., identify, calculate, construct, explain, analyze, solve, gusobanura, gukora, gupima) coupled with the specific content/concept of "${request.lessonTitle}"
- Condition (C): The situation/context/materials under which the learning occurs ("Given [learning materials/diagrams/context]" / "Bahawe [ibikoresho/inyandiko/amashusho]")
- Degree (D): The standard of success or performance criterion (e.g., "accurately", "correctly", "without error", "mu buryo bw'ukuri").`;

    const promptText = `
You are an expert educational master curriculum planner and pedagogue for Teacher Tool (founded by NKUNDIMANA Theogene).
Generate an exceptionally high-quality, accurate, comprehensive, and professional pedagogical lesson plan in "${targetLanguage}".

INPUT LESSON PARAMETERS:
- School Name: ${request.schoolName || "Standard School"}
- Teacher's Name: ${request.teacherName || OWNER_INFO.name}
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

4. LANGUAGE & FORMATTING:
   - EVERY SINGLE FIELD (headers, step names, activities, competences) MUST BE WRITTEN EXCLUSIVELY IN ${targetLanguage.toUpperCase()}.
   - Ensure the content is compact, clear, and perfectly formatted for a 1-page printable document.
   - For Teacher Self-Evaluation: return empty string "" so the teacher can fill it after lesson delivery.
   - If Open Format is requested, provide a detailed Markdown formatted text version in 'openFormatContent' in ${targetLanguage}.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction: `You are Teacher Pedagogy's AI Master Lesson Plan Generator. You create professional, standard-compliant REB (Rwanda Basic Education Board) Competence-Based Curriculum lesson plans and open format lesson plans in any language (Kinyarwanda, English, French, Swahili, etc.). Output strictly valid JSON conforming to the requested schema. Ensure content is formatted compactly so it fits on 1 printable page.`,
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

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);

    const fullLessonPlan = {
      id: "lp_" + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      language: targetLanguage,
      format: planFormat,
      ...parsedData,
    };

    // Deduct plan credit from user if not admin
    if (!user.isAdmin) {
      user.remainingPlans = Math.max(0, user.remainingPlans - 1);
    }
    user.totalGenerated = (user.totalGenerated || 0) + 1;
    await saveFirestoreUser(userEmail, user);

    // Log generated plan for admin tracking
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

    res.json({
      lessonPlan: fullLessonPlan,
      userProfile: user,
    });
  } catch (error: any) {
    console.error("Error generating lesson plan:", error);
    res.status(500).json({ error: error?.message || "Failed to generate lesson plan" });
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
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ntabwo wemerewe kohereza ubwishyu utarinjira (Sign in required)." });
    return;
  }
  const token = authHeader.substring(7);
  const user = await getFirestoreUser(userEmail);
  if (!user) {
    res.status(401).json({ error: "Guhuza konti yawe byapfuye. Banza ugaruke winjire (Invalid session)." });
    return;
  }
  if (user.sessionToken !== token) {
    if (!user.sessionToken && token.startsWith("tok_")) {
      user.sessionToken = token;
      await saveFirestoreUser(userEmail, user);
    } else {
      res.status(401).json({ error: "Guhuza konti yawe byapfuye. Banza ugaruke winjire (Invalid session)." });
      return;
    }
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
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ntabwo wemerewe kubona aya makuru utarinjira (Sign in required)." });
    return;
  }
  const token = authHeader.substring(7);
  const user = await getFirestoreUser(email);
  if (!user) {
    res.status(401).json({ error: "Guhuza konti yawe byapfuye. Banza ugaruke winjire (Invalid session)." });
    return;
  }
  if (user.sessionToken !== token) {
    if (!user.sessionToken && token.startsWith("tok_")) {
      user.sessionToken = token;
      await saveFirestoreUser(email, user);
    } else {
      res.status(401).json({ error: "Guhuza konti yawe byapfuye. Banza ugaruke winjire (Invalid session)." });
      return;
    }
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

startServer();
