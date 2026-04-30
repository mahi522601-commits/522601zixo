import { motion } from "framer-motion";
import { useProducts } from "@/hooks/useProducts";

export default function CookieTubs() {
  const { products, loading, error, setSelectedProduct } = useProducts();
  const tubProducts = products.filter(
    (p) => p.category?.toLowerCase().includes("tub")
  );

  if (loading) {
    return (
      <section className="py-12 bg-[#1A1500] border-y border-[#C9960C]/20">
        <div className="container-main">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F0C040] mb-6 flex items-center gap-2 tracking-wide">
            <span>✨</span> 1kg Cookie Tubs
          </h2>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0C040]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || tubProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-[#1A1500] border-y border-[#C9960C]/20">
      <div className="container-main">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F0C040] mb-6 flex items-center gap-2 tracking-wide">
          <span>✨</span> 1kg Cookie Tubs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {tubProducts.slice(0, 3).map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative rounded-xl overflow-hidden group cursor-pointer border border-[#C9960C]/30 hover:border-[#F0C040] transition-colors"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-[4/3] relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/80 via-[#0D0D0D]/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#F0C040] text-[#0D0D0D] text-xs font-bold px-3 py-1 rounded-full">
                    15% OFF
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-[#FFF8E7] font-bold text-lg mb-1 tracking-wide">{product.name}</h3>
                  <p className="text-[#F0C040] text-sm font-bold">Rs. {product.price.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
