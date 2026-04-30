import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import HeroBanner from "@/sections/HeroBanner";
import MarqueeBar from "@/sections/MarqueeBar";
import CategorySection from "@/sections/CategorySection";
import { ProductsProvider, useProducts } from "@/context/ProductsContext";
import ProductModal from "@/components/ProductModal";

function HomeContent() {
  const { categories, selectedProduct, setSelectedProduct } = useProducts();

  return (
    <main>
      <HeroBanner />
      <MarqueeBar />
      {categories.map((category) => (
        <CategorySection key={category.id} title={category.name} />
      ))}
      <ProductModal 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct} 
      />
    </main>
  );
}

export default function Home() {
  return (
    <ProductsProvider>
      <div className="min-h-screen bg-[#0D0D0D]">

        <Header />
        <CartDrawer />
        <HomeContent />
        <Footer />
      </div>
    </ProductsProvider>
  );
}
