import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import { useProductsByCategory } from "@/context/ProductsContext";

interface CategorySectionProps {
  title: string;
}

export default function CategorySection({ title }: CategorySectionProps) {
  const { products, loading, error } = useProductsByCategory(title);

  if (loading) {
    return (
      <section className="py-12 bg-[#1A1500]">
        <div className="container-main">
          <SectionHeader title={title} emoji="✨" />
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0C040]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return null; // Hide if no products or error
  }

  return (
    <section id={title.toLowerCase().replace(/\s+/g, '-')} className="py-12 bg-[#1A1500]">
      <div className="container-main">
        <SectionHeader title={title} emoji="✨" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
