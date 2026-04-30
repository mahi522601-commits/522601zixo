import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/context/ProductsContext";
import type { Product } from "@/types";
import type { FirebaseProduct } from "@/services/firebaseProducts";

interface ProductCardProps {
  product: Product | FirebaseProduct;
  index?: number;
}

// Helper to get image URL from either Product or FirebaseProduct
function getProductImage(product: Product | FirebaseProduct): string {
  // Always prefer imageUrl (ImgBB) if present
  if (typeof (product as any).imageUrl === "string" && (product as any).imageUrl.startsWith("http")) {
    return (product as any).imageUrl;
  }
  return (product as any).image || "";
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { setSelectedProduct } = useProducts();
  const imageSrc = getProductImage(product);

  // Convert to CartItem format for addItem
  const cartItem: Product = {
    id: product.id,
    name: product.name,
    image: imageSrc,
    price: product.price,
    badge: "badge" in product ? product.badge : undefined,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group cursor-pointer"
      onClick={() => setSelectedProduct(product as FirebaseProduct)}
    >
      <div className="relative bg-[#2A1E00] rounded-lg overflow-hidden shadow-card border border-[#C9960C]/30 hover:border-[#C9960C]/60 transition-all duration-300">
        {"badge" in product && product.badge && (
          <span className="absolute top-2 left-2 z-10 bg-[#C9960C] text-[#0D0D0D] text-[10px] font-bold px-2 py-1 rounded shadow-sm">
            {product.badge}
          </span>
        )}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(cartItem);
            }}
            className="absolute bottom-3 right-3 bg-[#F0C040] text-[#0D0D0D] p-3 rounded-full md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#C9960C] shadow-lg flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-[#F0C040] line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xs text-[#FFF8E7]/70">MRP:</span>
            <span className="text-base font-bold text-[#F0C040]">
              Rs. {product.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
