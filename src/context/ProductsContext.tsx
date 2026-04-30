import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getFirebaseProducts, getFirebaseCategories, type FirebaseProduct, type FirebaseCategory } from "@/services/firebaseProducts";

interface ProductsContextType {
  products: FirebaseProduct[];
  categories: FirebaseCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  selectedProduct: FirebaseProduct | null;
  setSelectedProduct: (product: FirebaseProduct | null) => void;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<FirebaseProduct[]>([]);
  const [categories, setCategories] = useState<FirebaseCategory[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<FirebaseProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getFirebaseProducts(),
        getFirebaseCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setProducts([]);
      setCategories([]);
      setError("Failed to load products and categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, categories, loading, error, refetch: fetchData, selectedProduct, setSelectedProduct }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
}

export function useProductsByCategory(category: string) {
  const { products, loading, error } = useProducts();

  const filtered = products.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );

  return { products: filtered, loading, error };
}