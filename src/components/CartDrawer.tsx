import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { state, toggleCart, removeItem, updateQuantity, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const hasUnavailableItems = state.items.some((item) => item.isAvailable === false);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0D0D0D] z-50 shadow-2xl flex flex-col border-l border-[#C9960C]/30 text-[#FFF8E7]"
          >
            <div className="flex items-center justify-between p-4 border-b border-[#C9960C]/30">
              <h2 className="text-lg font-bold text-[#F0C040] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C9960C]" />
                Your Cart ({totalItems})
              </h2>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-[#1E1600] text-[#FFF8E7]/50 hover:text-[#F0C040] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {state.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#C4A96A]">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add some delicious cookies!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-3 bg-[#1E1600] border border-[#C9960C]/20 rounded-lg p-3 text-[#FFF8E7]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md flex-shrink-0 border border-[#C9960C]/30"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-[#F0C040] line-clamp-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-[#F0C040] font-bold mt-1">
                          Rs. {item.price.toFixed(2)}
                        </p>
                        {item.isAvailable === false && (
                          <p className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold mt-1 inline-block border border-red-500/30">
                            Item is no longer available
                          </p>
                        )}
                          <div className="flex items-center gap-1 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-[#2A1E00] rounded text-[#C9960C] transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-bold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-[#2A1E00] rounded text-[#C9960C] transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-auto w-10 h-10 flex items-center justify-center text-[#FFF8E7]/50 hover:text-red-500 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {state.items.length > 0 && (
              <div className="border-t border-[#C9960C]/30 p-4 space-y-4">
                <div className="flex justify-between text-lg font-bold text-[#F0C040]">
                  <span>Subtotal</span>
                  <span>Rs. {totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => {
                    if (hasUnavailableItems) return;
                    toggleCart();
                    navigate("/checkout");
                  }}
                  disabled={hasUnavailableItems}
                  className={`w-full py-3 rounded-full font-bold transition-colors shadow-md ${
                    hasUnavailableItems 
                      ? "bg-[#1E1600] text-red-500/50 border border-red-500/20 cursor-not-allowed" 
                      : "bg-[#F0C040] text-[#0D0D0D] hover:bg-[#C9960C]"
                  }`}
                >
                  {hasUnavailableItems ? "Remove unavailable items" : "Checkout"}
                </button>
                <button
                  onClick={toggleCart}
                  className="w-full text-center text-sm text-[#FFF8E7]/70 hover:text-[#F0C040] font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
