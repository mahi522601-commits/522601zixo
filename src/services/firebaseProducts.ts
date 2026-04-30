import { FirebaseError } from "firebase/app";
import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  imagePath?: string;
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
  data?: {
    url?: string;
  };
  error?: {
    message?: string;
  };
}

const productsCollection = collection(db, "products");
const categoriesCollection = collection(db, "categories");
const uploadTimeoutMs = 15000;

export function getFirebaseErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied" || error.code === "firestore/permission-denied") {
      return "Firebase denied this request. Check Firestore rules for the products collection.";
    }

    return `${error.code}: ${error.message}`;
  }

  return error instanceof Error ? error.message : "Firebase request failed.";
}

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

async function uploadToImgBB(file: File) {
  const body = new FormData();
  body.set("image", file);

  const response = await withTimeout(
    fetch("/api/upload-image", {
      method: "POST",
      body,
    }),
    "ImgBB upload did not respond within 15 seconds.",
  );

  const payload = (await response.json()) as ImgBBResponse;

  if (!response.ok || !payload.data?.url) {
    throw new Error(payload.error?.message || `Image upload failed with status ${response.status}.`);
  }

  return payload.data.url;
}

export async function createFirebaseProduct(
  input: FirebaseProductInput,
  onProgress?: (progress: number) => void,
  onStatus?: (status: UploadStatus) => void,
) {
  onStatus?.({
    stage: "imgbb",
    message: "Uploading main homepage image...",
    progress: 0,
  });

  const imageUrl = await uploadToImgBB(input.image);

  let detailImageUrl = imageUrl;
  if (input.detailImage) {
    onStatus?.({
      stage: "imgbb",
      message: "Uploading big detail image...",
      progress: 25,
    });
    detailImageUrl = await uploadToImgBB(input.detailImage);
  }

  const thumbnailUrls: string[] = [];
  if (input.thumbnails && input.thumbnails.length > 0) {
    const total = input.thumbnails.length;
    for (let i = 0; i < total; i++) {
      onStatus?.({
        stage: "imgbb",
        message: `Uploading thumbnail ${i + 1} of ${total}...`,
        progress: 40 + Math.floor((i / total) * 50),
      });
      const tUrl = await uploadToImgBB(input.thumbnails[i]);
      thumbnailUrls.push(tUrl);
    }
  }

  onProgress?.(100);
  onStatus?.({
    stage: "imgbb",
    message: "ImgBB upload complete.",
    progress: 100,
  });

  onStatus?.({ stage: "firestore", message: "Saving product details to database..." });
  
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

  try {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalProduct),
    });
    
    if (!res.ok) throw new Error("Failed to save product via API");
    return await res.json() as FirebaseProduct;
  } catch (error) {
    console.warn("API save failed, falling back to local storage:", error);
    const fallback = { id: `local-${Date.now()}`, ...finalProduct };
    const localItems = JSON.parse(localStorage.getItem("fallbackProducts") || "[]");
    localItems.push(fallback);
    localStorage.setItem("fallbackProducts", JSON.stringify(localItems));
    return fallback;
  }
}

export async function getFirebaseProducts() {
  let apiProducts: FirebaseProduct[] = [];
  
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      apiProducts = await res.json();
    }
  } catch (error) {
    console.warn("Failed to fetch from API, using local fallback:", error);
  }

  const localItems = JSON.parse(localStorage.getItem("fallbackProducts") || "[]") as FirebaseProduct[];
  return [...localItems.reverse(), ...apiProducts];
}

export async function deleteFirebaseProduct(id: string) {
  if (id.startsWith("local-")) {
    const localItems = JSON.parse(localStorage.getItem("fallbackProducts") || "[]") as FirebaseProduct[];
    const updated = localItems.filter((item) => item.id !== id);
    localStorage.setItem("fallbackProducts", JSON.stringify(updated));
    return;
  }

  const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete product via API");
}

// Category Management Functions
export async function createFirebaseCategory(name: string) {
  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error("Failed to create category via API");
    return await res.json() as FirebaseCategory;
  } catch (error) {
    console.warn("API save failed for category, falling back to local storage:", error);
    const fallback = { id: `local-cat-${Date.now()}`, name };
    const localCats = JSON.parse(localStorage.getItem("fallbackCategories") || "[]");
    localCats.push(fallback);
    localStorage.setItem("fallbackCategories", JSON.stringify(localCats));
    return fallback;
  }
}

export async function getFirebaseCategories() {
  let apiCategories: FirebaseCategory[] = [];
  try {
    const res = await fetch("/api/categories");
    if (res.ok) {
      apiCategories = await res.json();
    }
  } catch (error) {
    console.warn("Failed to fetch categories from API, using local fallback:", error);
  }

  const localCats = JSON.parse(localStorage.getItem("fallbackCategories") || "[]") as FirebaseCategory[];
  
  const defaultCats: FirebaseCategory[] = [
    { id: "default-1", name: "Chocolate Cookies" },
    { id: "default-2", name: "Gourmet cookies" },
    { id: "default-3", name: "Healthy Cookies" },
    { id: "default-4", name: "Combo Cookies" },
    { id: "default-5", name: "Cookie Tubs" }
  ];

  const deletedDefaults = JSON.parse(localStorage.getItem("deletedDefaultCategories") || "[]") as string[];

  // Return unique categories (by name)
  const combined = [...defaultCats, ...apiCategories, ...localCats].filter(c => !deletedDefaults.includes(c.id));
  const unique = Array.from(new Map(combined.map(c => [c.name, c])).values());
  return unique;
}

export async function deleteFirebaseCategory(id: string) {
  if (id.startsWith("local-cat-")) {
    const localCats = JSON.parse(localStorage.getItem("fallbackCategories") || "[]") as FirebaseCategory[];
    const updated = localCats.filter((item) => item.id !== id);
    localStorage.setItem("fallbackCategories", JSON.stringify(updated));
    return;
  }

  if (id.startsWith("default-")) {
    const deletedDefaults = JSON.parse(localStorage.getItem("deletedDefaultCategories") || "[]") as string[];
    deletedDefaults.push(id);
    localStorage.setItem("deletedDefaultCategories", JSON.stringify(deletedDefaults));
    return;
  }

  const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
  if (!res.ok) console.warn("Failed to delete category via API");
}
