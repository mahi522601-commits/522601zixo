// ================= BASE URL =================
export const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://five22601zixo.onrender.com";

// ================= FIREBASE =================
import { FirebaseError } from "firebase/app";
import {
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ================= TYPES =================
export interface FirebaseProductInput {
  name: string;
  category: string;
  price: number;
  details: string;
  image: File;
  detailImage?: File;
  thumbnails?: File[];
}

export interface FirebaseProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  details: string;
  imageUrl: string;
  detailImageUrl?: string;
  thumbnailUrls?: string[];
  imageHost?: string;
}

export interface FirebaseCategory {
  id: string;
  name: string;
}

export interface UploadStatus {
  stage: "imgbb" | "firestore";
  message: string;
  progress?: number;
}

interface ImgBBResponse {
  data?: { url?: string };
  error?: { message?: string };
}

// ================= COLLECTIONS =================
const productsCollection = collection(db, "products");
const categoriesCollection = collection(db, "categories");

// ================= ERROR HANDLER =================
export function getFirebaseErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    return `${error.code}: ${error.message}`;
  }
  return error instanceof Error ? error.message : "Unknown error";
}

// ================= TIMEOUT =================
const uploadTimeoutMs = 15000;

async function withTimeout<T>(promise: Promise<T>, message: string) {
  let timeoutId = 0;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error(message)), uploadTimeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

// ================= IMGBB UPLOAD (FIXED) =================
async function uploadToImgBB(file: File): Promise<string> {
  const API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

  // 🔴 HARD CHECK (IMPORTANT)
  if (!API_KEY) {
    throw new Error("IMGBB API key missing. Add VITE_IMGBB_API_KEY in Vercel.");
  }

  const formData = new FormData();
  formData.append("image", file);

  console.log("Uploading to ImgBB...");

  const res = await withTimeout(
    fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
      method: "POST",
      body: formData,
    }),
    "ImgBB timeout"
  );

  const data = (await res.json()) as ImgBBResponse;

  // 🔴 STRICT VALIDATION
  if (!res.ok || !data?.data?.url) {
    console.error("ImgBB FULL ERROR:", data);
    throw new Error(
      data?.error?.message || "ImgBB upload failed"
    );
  }

  console.log("ImgBB SUCCESS:", data.data.url);

  return data.data.url;
}

// ================= CREATE PRODUCT =================
export async function createFirebaseProduct(
  input: FirebaseProductInput,
  onProgress?: (p: number) => void,
  onStatus?: (s: UploadStatus) => void
) {
  try {
    onStatus?.({ stage: "imgbb", message: "Uploading main image..." });

    const imageUrl = await uploadToImgBB(input.image);

    let detailImageUrl = imageUrl;

    if (input.detailImage) {
      onStatus?.({ stage: "imgbb", message: "Uploading detail image..." });
      detailImageUrl = await uploadToImgBB(input.detailImage);
    }

    const thumbnailUrls: string[] = [];

    if (input.thumbnails?.length) {
      for (let i = 0; i < input.thumbnails.length; i++) {
        onStatus?.({
          stage: "imgbb",
          message: `Uploading thumbnail ${i + 1}`,
        });

        const url = await uploadToImgBB(input.thumbnails[i]);
        thumbnailUrls.push(url);
      }
    }

    onProgress?.(100);

    const finalProduct = {
      name: input.name,
      category: input.category,
      price: input.price,
      details: input.details,
      imageUrl,
      detailImageUrl,
      thumbnailUrls,
      imageHost: "imgbb",
    };

    // ================= SAVE TO BACKEND =================
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalProduct),
    });

    if (!res.ok) {
      throw new Error("Backend save failed");
    }

    return await res.json();
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    throw error;
  }
}

// ================= GET PRODUCTS =================
export async function getFirebaseProducts() {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) return [];
  return res.json();
}

// ================= DELETE PRODUCT =================
export async function deleteFirebaseProduct(id: string) {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Delete failed");
}

// ================= CATEGORY =================
export async function getFirebaseCategories() {
  const res = await fetch(`${BASE_URL}/api/categories`);
  if (!res.ok) return [];
  return res.json();
}

export async function createFirebaseCategory(name: string) {
  const res = await fetch(`${BASE_URL}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  return res.json();
}

export async function deleteFirebaseCategory(id: string) {
  await fetch(`${BASE_URL}/api/categories/${id}`, {
    method: "DELETE",
  });
}