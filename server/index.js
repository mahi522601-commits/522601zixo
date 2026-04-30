import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import multer from "multer";
import fs from "node:fs";
import { Firestore } from "@google-cloud/firestore";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8080);
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

function loadFirebaseAdmin() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (!serviceAccountPath) {
    return null;
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  const credential = admin.credential.cert(serviceAccount);

  admin.initializeApp({ credential });
  return admin.firestore();
}

const adminDb = loadFirebaseAdmin();

function loadOrdersDb() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) return null;
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  return new Firestore({
    projectId: serviceAccount.project_id,
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
    databaseId: process.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-ebdd5a64-0a16-4954-be8c-990515302f14'
  });
}
const ordersDb = loadOrdersDb();

app.use(express.json({ limit: "100kb" }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
  }),
);

const trackLimiter = rateLimit({
  windowMs: Number(process.env.TRACK_RATE_LIMIT_WINDOW_MS || 60000),
  max: Number(process.env.TRACK_RATE_LIMIT_MAX || 60),
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/upload-image", upload.single("image"), async (request, response, next) => {
  try {
    if (!process.env.IMGBB_API_KEY) {
      response.status(500).json({ error: { message: "Missing IMGBB_API_KEY." } });
      return;
    }

    if (!request.file) {
      response.status(400).json({ error: { message: "Image file is required." } });
      return;
    }

    const formData = new FormData();
    formData.append(
      "image",
      new Blob([request.file.buffer], { type: request.file.mimetype }),
      request.file.originalname,
    );

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${encodeURIComponent(process.env.IMGBB_API_KEY)}`,
      {
        method: "POST",
        body: formData,
      },
    );
    const payload = await imgbbResponse.json();

    response.status(imgbbResponse.status).json(payload);
  } catch (error) {
    next(error);
  }
});

app.post("/api/track", trackLimiter, async (request, response, next) => {
  try {
    const event = {
      type: String(request.body?.type || "event"),
      payload: request.body?.payload || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (adminDb) {
      await adminDb.collection("trackingEvents").add(event);
    }

    response.status(202).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No orders DB configured." });
    const orderData = { ...req.body, createdAt: Firestore.FieldValue.serverTimestamp() };
    const docRef = await ordersDb.collection("orders").add(orderData);
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error) {
    next(error);
  }
});

app.get("/api/orders", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No orders DB configured." });
    const snapshot = await ordersDb.collection("orders").orderBy("createdAt", "desc").get();
    const orders = snapshot.docs.map(doc => {
      const data = doc.data();
      // Handle timestamp conversion
      if (data.createdAt && data.createdAt.toDate) {
        data.createdAt = data.createdAt.toDate().toISOString();
      }
      return { id: doc.id, ...data };
    });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/orders/:id", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No orders DB configured." });
    await ordersDb.collection("orders").doc(req.params.id).update(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (req, res, next) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email || "",
      displayName: userRecord.displayName || "",
      lastSignInTime: userRecord.metadata.lastSignInTime,
      creationTime: userRecord.metadata.creationTime,
      isAnonymous: userRecord.providerData.length === 0,
    }));
    
    // Sort by creation time descending
    users.sort((a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime());
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

app.get("/api/carts/:uid", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    const doc = await ordersDb.collection("carts").doc(req.params.uid).get();
    if (!doc.exists) {
      return res.status(200).json({ items: [] });
    }
    res.status(200).json(doc.data());
  } catch (error) {
    next(error);
  }
});

app.post("/api/carts/:uid", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    await ordersDb.collection("carts").doc(req.params.uid).set(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Products endpoints
app.get("/api/products", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    const snapshot = await ordersDb.collection("products").orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: String(data.name ?? ""),
        category: String(data.category ?? ""),
        price: Number(data.price ?? 0),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
        details: String(data.details ?? ""),
        imageUrl: String(data.imageUrl ?? ""),
        detailImageUrl: data.detailImageUrl ? String(data.detailImageUrl) : undefined,
        thumbnailUrls: Array.isArray(data.thumbnailUrls) ? data.thumbnailUrls.map(String) : undefined,
        imagePath: data.imagePath ? String(data.imagePath) : undefined,
        imageHost: data.imageHost ? String(data.imageHost) : undefined,
      };
    });
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

app.post("/api/products", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    const data = {
      ...req.body,
      createdAt: Firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await ordersDb.collection("products").add(data);
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error) {
    next(error);
  }
});

app.put("/api/products/:id", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    await ordersDb.collection("products").doc(req.params.id).update(req.body);
    res.status(200).json({ success: true, ...req.body });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/products/:id", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    await ordersDb.collection("products").doc(req.params.id).delete();
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/orders/:id", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No orders DB configured." });
    await ordersDb.collection("orders").doc(req.params.id).delete();
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Categories endpoints
app.get("/api/categories", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    const snapshot = await ordersDb.collection("categories").orderBy("createdAt", "asc").get();
    const categories = snapshot.docs.map(doc => ({
      id: doc.id,
      name: String(doc.data().name ?? ""),
    }));
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

app.post("/api/categories", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    const data = {
      name: req.body.name,
      createdAt: Firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await ordersDb.collection("categories").add(data);
    res.status(201).json({ id: docRef.id, name: req.body.name });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/categories/:id", async (req, res, next) => {
  try {
    if (!ordersDb) return res.status(500).json({ error: "No database configured." });
    await ordersDb.collection("categories").doc(req.params.id).delete();
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  response.status(500).json({
    error: {
      message: error instanceof Error ? error.message : "Server error.",
    },
  });
});

app.listen(port, (error) => {
  if (error) {
    console.error(error);
    process.exitCode = 1;
    return;
  }

  console.log(`API server listening on http://localhost:${port}`);
});
