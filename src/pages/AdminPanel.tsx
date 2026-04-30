import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ImagePlus, Loader2, PackagePlus, RefreshCcw, Upload } from "lucide-react";
import { firebaseInfo } from "@/lib/firebase";
import {
  createFirebaseProduct,
  deleteFirebaseProduct,
  getFirebaseErrorMessage,
  getFirebaseProducts,
  getFirebaseCategories,
  createFirebaseCategory,
  deleteFirebaseCategory,
  type FirebaseProduct,
  type FirebaseCategory,
  BASE_URL,
} from "@/services/firebaseProducts";

import OrdersDashboard from "../components/admin/OrdersDashboard";
import UsersDashboard from "../components/admin/UsersDashboard";

const initialForm = {
  name: "",
  category: "",
  price: "",
  details: "",
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "users">("products");
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState<File | null>(null);
  const [detailImage, setDetailImage] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<(File | null)[]>([null, null, null, null]);
  const [editingProduct, setEditingProduct] = useState<FirebaseProduct | null>(null);
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [categories, setCategories] = useState<FirebaseCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => image ? URL.createObjectURL(image) : "", [image]);
  const detailPreviewUrl = useMemo(() => detailImage ? URL.createObjectURL(detailImage) : "", [detailImage]);
  const thumbnailPreviewUrls = useMemo(() => thumbnails.map(file => file ? URL.createObjectURL(file) : ""), [thumbnails]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (detailPreviewUrl) URL.revokeObjectURL(detailPreviewUrl);
      thumbnailPreviewUrls.forEach(url => url && URL.revokeObjectURL(url));
    };
  }, [previewUrl, detailPreviewUrl, thumbnailPreviewUrls]);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const [uploadedProducts, fetchedCategories] = await Promise.all([
        getFirebaseProducts(),
        getFirebaseCategories()
      ]);
      setProducts(uploadedProducts);
      setCategories(fetchedCategories);
    } catch (loadError) {
      setError(getFirebaseErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  const handleEditProduct = (product: FirebaseProduct) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      details: product.details,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    if (editingProduct) {
      setIsSaving(true);
      try {
        const res = await fetch(`${BASE_URL}/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            category: form.category,
            price,
            details: form.details.trim(),
          }),
        });
        if (!res.ok) throw new Error("Failed to update product.");

        setProducts((current) =>
          current.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: form.name.trim(),
                  category: form.category,
                  price,
                  details: form.details.trim(),
                }
              : p
          )
        );
        setEditingProduct(null);
        setForm(initialForm);
        setMessage("Product details updated successfully.");
      } catch (editError) {
        setError("Error updating product details.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (!image) {
      setError("Please choose a product image.");
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);
    setUploadStatus("Starting upload...");

    try {
      const product = await createFirebaseProduct(
        {
          name: form.name.trim(),
          category: form.category,
          price,
          details: form.details.trim(),
          image,
          detailImage: detailImage || undefined,
          thumbnails: thumbnails.filter((f): f is File => f !== null).length > 0 
            ? thumbnails.filter((f): f is File => f !== null) 
            : undefined,
        },
        setUploadProgress,
        (status) => setUploadStatus(status.message),
      );

      setProducts((current) => [product, ...current]);
      setForm(initialForm);
      setImage(null);
      setDetailImage(null);
      setThumbnails([null, null, null, null]);
      setMessage("Product image uploaded to ImgBB and details saved to Firebase.");
      setUploadStatus("");
    } catch (saveError) {
      setError(getFirebaseErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await deleteFirebaseProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
      setMessage("Product deleted successfully.");
    } catch (err) {
      setError("Failed to delete product.");
    }
  }

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const newCat = await createFirebaseCategory(newCategoryName.trim());
      setCategories([...categories, newCat]);
      setNewCategoryName("");
      setMessage("Category added successfully.");
    } catch (err) {
      setError("Failed to add category.");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteFirebaseCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
      setMessage("Category deleted.");
    } catch (err) {
      setError("Failed to delete category.");
    }
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-[#FFF8E7]">
      <div className="border-b border-[#C9960C]/30 bg-[#0D0D0D] sticky top-0 z-10">
        <div className="container-main flex flex-wrap h-auto sm:h-16 items-center justify-between gap-4 py-3 sm:py-0">
          <a href="/" className="flex items-center gap-3">
            <img
              src="/images/logo.jpeg"
              alt="Zixo Cookies"
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover border border-[#C9960C]/30"
            />
            <span className="text-base sm:text-lg font-bold tracking-wide text-[#F0C040]">Admin Panel</span>
          </a>
          
          <div className="flex flex-wrap bg-[#1E1600] p-1 rounded-lg border border-[#C9960C]/20 w-full sm:w-auto order-last sm:order-none">
            <button
              onClick={() => setActiveTab("products")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "products" ? "bg-[#F0C040] text-[#0D0D0D]" : "text-[#FFF8E7]/70 hover:text-[#F0C040]"}`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "orders" ? "bg-[#F0C040] text-[#0D0D0D]" : "text-[#FFF8E7]/70 hover:text-[#F0C040]"}`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeTab === "users" ? "bg-[#F0C040] text-[#0D0D0D]" : "text-[#FFF8E7]/70 hover:text-[#F0C040]"}`}
            >
              Users
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#C9960C]/30 bg-[#1E1600] px-4 text-sm font-bold text-[#FFF8E7] hover:bg-[#2A1E00] transition-colors min-w-[44px]"
            aria-label="Refresh Data"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="container-main py-8">
        {activeTab === "orders" ? (
          <OrdersDashboard />
        ) : activeTab === "users" ? (
          <UsersDashboard />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr]">
          <div className="space-y-8">
            <section className="rounded-lg border border-[#C9960C]/30 bg-[#1E1600] p-5 shadow-md text-[#FFF8E7]">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0C040] text-[#0D0D0D]">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#F0C040]">{editingProduct ? "Edit Product Details" : "Upload Product"}</h1>
                <p className="text-sm text-[#FFF8E7]/60">Image goes to ImgBB, details go to Firestore.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-[#FFF8E7]/80">Product name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#2A1E00] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                  placeholder="Chocolate Chip Cookies"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#FFF8E7]/80">Category</span>
                  <select
                    required
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#2A1E00] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                  >
                    <option value="" disabled className="bg-[#1E1600]">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name} className="bg-[#1E1600]">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-bold text-[#FFF8E7]/80">Price</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#2A1E00] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    placeholder="299"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-[#FFF8E7]/80">Details</span>
                <textarea
                  required
                  value={form.details}
                  onChange={(event) => setForm({ ...form, details: event.target.value })}
                  className="min-h-28 w-full rounded-md border border-[#C9960C]/40 bg-[#2A1E00] px-3 py-2 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                  placeholder="Short product description, weight, ingredients, offer details..."
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-[#FFF8E7]/80">Main Homepage Image <span className="text-red-500">*</span></span>
                <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-[#C9960C]/30 bg-[#2A1E00] p-4">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Homepage Preview" className="max-h-32 rounded-md object-contain" />
                  ) : (
                    <div className="text-center text-[#FFF8E7]/50 text-xs">
                      <ImagePlus className="mx-auto mb-1 h-6 w-6 text-[#C9960C]" />
                      <span>Select main homepage image</span>
                    </div>
                  )}
                </div>
                <input
                  required={!editingProduct}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-xs text-[#FFF8E7]/70 file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[#F0C040] file:px-3 file:text-xs file:font-bold file:text-[#0D0D0D] hover:file:bg-[#C9960C]"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-bold text-[#FFF8E7]/80">Main Detail Image (Big)</span>
                <div className="flex min-h-32 items-center justify-center rounded-md border border-dashed border-[#C9960C]/30 bg-[#2A1E00] p-4">
                  {detailPreviewUrl ? (
                    <img src={detailPreviewUrl} alt="Detail Preview" className="max-h-32 rounded-md object-contain" />
                  ) : (
                    <div className="text-center text-[#FFF8E7]/50 text-xs">
                      <ImagePlus className="mx-auto mb-1 h-6 w-6 text-[#C9960C]" />
                      <span>Select big detail image (optional)</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setDetailImage(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-xs text-[#FFF8E7]/70 file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[#F0C040] file:px-3 file:text-xs file:font-bold file:text-[#0D0D0D] hover:file:bg-[#C9960C]"
                />
              </label>

              <div className="space-y-4">
                <span className="block text-sm font-bold text-[#FFF8E7]/80">Small Thumbnail Images (Below Big Image, up to 4)</span>
                
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <label key={idx} className="block">
                      <span className="mb-1 block text-xs font-bold text-[#FFF8E7]/60">Thumbnail {idx + 1}</span>
                      <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-[#C9960C]/30 bg-[#2A1E00] p-2">
                        {thumbnailPreviewUrls[idx] ? (
                          <img src={thumbnailPreviewUrls[idx]} alt={`Thumb ${idx + 1} Preview`} className="max-h-16 rounded-md object-contain" />
                        ) : (
                          <div className="text-center text-[#FFF8E7]/40 text-[10px]">
                            <ImagePlus className="mx-auto mb-1 h-5 w-5 text-[#C9960C]" />
                            <span>Upload image</span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          const updated = [...thumbnails];
                          updated[idx] = event.target.files?.[0] ?? null;
                          setThumbnails(updated);
                        }}
                        className="mt-1 block w-full text-[10px] text-[#FFF8E7]/70 file:mr-2 file:h-6 file:rounded file:border-0 file:bg-[#F0C040] file:px-2 file:text-[10px] file:font-bold file:text-[#0D0D0D] hover:file:bg-[#C9960C]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {isSaving && (
                <div className="space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-[#2A1E00]">
                    <div
                      className="h-full bg-[#F0C040] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="rounded-md bg-[#2A1E00] px-3 py-2 text-xs text-[#FFF8E7]/80">{uploadStatus}</p>
                </div>
              )}

              {message && <p className="rounded-md bg-green-900/20 border border-green-500/30 px-3 py-2 text-sm text-green-400 font-bold">{message}</p>}
              {error && <p className="rounded-md bg-red-900/20 border border-red-500/30 px-3 py-2 text-sm text-red-400 font-bold">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#F0C040] px-4 text-sm font-bold text-[#0D0D0D] hover:bg-[#C9960C] disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {isSaving 
                    ? (editingProduct ? "Saving..." : `Uploading ${uploadProgress}%`) 
                    : (editingProduct ? "Save Changes" : "Upload product")}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setForm(initialForm);
                    }}
                    className="h-11 px-4 rounded-md border border-[#C9960C]/30 text-sm font-bold text-[#FFF8E7] hover:bg-[#2A1E00] transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
            </section>

            <section className="rounded-lg border border-[#C9960C]/30 bg-[#1E1600] p-5 shadow-md text-[#FFF8E7]">
              <h2 className="text-xl font-bold mb-4 text-[#F0C040] tracking-wide">Manage Categories</h2>
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-11 flex-1 rounded-md border border-[#C9960C]/40 bg-[#2A1E00] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                  placeholder="New category name"
                />
                <button
                  type="submit"
                  className="h-11 rounded-md bg-[#F0C040] px-4 text-sm font-bold text-[#0D0D0D] hover:bg-[#C9960C] transition-colors"
                >
                  Add
                </button>
              </form>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id} className="flex justify-between items-center bg-[#2A1E00] p-3 rounded-md border border-[#C9960C]/30">
                    <span className="font-bold text-sm text-[#FFF8E7]">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-xs text-red-400 hover:text-red-500 font-bold"
                    >
                      Delete
                    </button>
                  </li>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-[#FFF8E7]/50">No categories found.</p>
                )}
              </ul>
            </section>
          </div>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#F0C040] tracking-wide">Uploaded Products</h2>
                <p className="text-sm text-[#FFF8E7]/60">Items saved in the Firebase `products` collection.</p>
              </div>
              <span className="rounded-full bg-[#1E1600] border border-[#C9960C]/30 px-3 py-1 text-sm font-bold text-[#F0C040]">
                {products.length} items
              </span>
            </div>

            {isLoading ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-[#C9960C]/30 bg-[#1E1600]">
                <Loader2 className="h-6 w-6 animate-spin text-[#F0C040]" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border border-[#C9960C]/30 bg-[#1E1600] text-sm text-[#FFF8E7]/50">
                No Firebase products uploaded yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <article key={product.id} className="overflow-hidden rounded-lg border border-[#C9960C]/30 bg-[#1E1600] shadow-md">
                    <div className="aspect-square bg-[#2A1E00] border-b border-[#C9960C]/20">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/30 px-2 py-1 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 px-2 py-1 rounded transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#C9960C]">
                        {product.category}
                      </p>
                      <h3 className="text-base font-bold text-[#FFF8E7]">{product.name}</h3>
                      <p className="mt-1 text-sm font-bold text-[#F0C040]">Rs. {product.price.toFixed(2)}</p>
                      <p className="mt-2 line-clamp-3 text-sm text-[#FFF8E7]/80">{product.details}</p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
        )}
      </div>
    </main>
  );
}
