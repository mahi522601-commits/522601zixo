import { useState } from "react";
import { X, ShoppingBag, Star, CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import type { FirebaseProduct } from "@/services/firebaseProducts";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: (Product | FirebaseProduct) & { detailImageUrl?: string; thumbnailUrls?: string[] } | null;
}

export default function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const { addItem } = useCart();
  
  if (!isOpen || !product) return null;

  // Resolve main image & detail image
  const homepageImage = (product as any).imageUrl || (product as any).image || "";
  const bigMainImage = product.detailImageUrl || homepageImage;
  
  // Resolve small thumbnails (if empty, use homepage image repeatedly or just hide)
  const thumbs = product.thumbnailUrls && product.thumbnailUrls.length > 0 
    ? product.thumbnailUrls 
    : [homepageImage, homepageImage, homepageImage, homepageImage];

  const [activeImage, setActiveImage] = useState(bigMainImage);

  // Calculate prices safely
  const price = product.price || 0;
  const originalPrice = product.originalPrice || price * 2; // fallback 50% off if original not set
  const savings = originalPrice - price;
  const discountPercent = Math.round((savings / originalPrice) * 100);

  const handleAddToCart = () => {
    const cartItem: Product = {
      id: product.id,
      name: product.name,
      image: homepageImage,
      price: product.price,
      badge: "badge" in product ? product.badge : undefined,
    };
    addItem(cartItem);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#1E1600] rounded-2xl shadow-2xl border border-[#C9960C]/30 overflow-hidden max-h-[90vh] flex flex-col md:flex-row text-[#FFF8E7]">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[#1E1600]/80 border border-[#C9960C]/30 text-[#FFF8E7]/60 hover:bg-[#2A1E00] hover:text-[#F0C040] shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side - Images */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between bg-[#1A1500] border-r border-[#C9960C]/30">
          <div className="flex-1 flex items-center justify-center">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="max-w-full max-h-[320px] md:max-h-[450px] rounded-xl object-contain shadow-md border border-[#C9960C]/20" 
            />
          </div>
          
          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            {thumbs.slice(0, 4).map((thumbUrl, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(thumbUrl)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                  activeImage === thumbUrl 
                    ? "border-[#F0C040] ring-2 ring-[#F0C040]/20 scale-95 shadow-sm" 
                    : "border-[#C9960C]/30 hover:border-[#F0C040]/50"
                }`}
              >
                <img src={thumbUrl} alt={`thumbnail-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side - Details */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-[#1E1600]">
          <div className="flex-1">
            {/* Title */}
            <h2 className="text-2xl font-bold text-[#F0C040] tracking-tight leading-snug">
              {product.name}
            </h2>
            
            {/* Badges */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0C040] text-[#0D0D0D] text-xs font-bold shadow-sm">
                <span>4.8</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-950/20 text-green-400 border border-green-500/30 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Assured</span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="mt-6 bg-[#2A1E00] border border-[#C9960C]/40 rounded-xl p-5 shadow-sm">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#FFF8E7]">₹{price}</span>
                {originalPrice > price && (
                  <>
                    <span className="text-base text-[#FFF8E7]/40 line-through font-medium">₹{originalPrice}</span>
                    <span className="text-sm font-bold text-green-400 bg-green-950/20 px-2 py-0.5 rounded">{discountPercent}% off</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-[#FFF8E7]/60 font-medium mt-1 uppercase tracking-wider">inclusive of all taxes</p>
              {savings > 0 && (
                <p className="text-xs font-bold text-green-400 mt-2">You save ₹{savings}</p>
              )}
            </div>

            {/* Description Box */}
            <div className="mt-6 bg-[#2A1E00] border border-[#C9960C]/30 rounded-xl p-5 shadow-md">
              <h4 className="text-sm font-bold text-[#F0C040] uppercase tracking-wider mb-3">About this product</h4>
              <p className="text-sm text-[#FFF8E7]/80 leading-relaxed whitespace-pre-line">
                {product.details || "Delicious homemade cookies baked with premium ingredients. Prepared fresh in hygienic conditions with no added preservatives."}
              </p>
            </div>
          </div>

          {/* Footer/Action */}
          <div className="mt-6 pt-4 border-t border-[#C9960C]/30 flex gap-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F0C040] px-6 text-base font-bold text-[#0D0D0D] hover:bg-[#C9960C] active:scale-[0.98] transition-all shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Add to Cart
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
