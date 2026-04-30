import { useState, useEffect } from "react";
import { X, Package, Calendar, Receipt } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  trackingDetails?: string;
  items: OrderItem[];
  createdAt?: any;
}

export default function MyOrdersModal({ isOpen, onClose }: MyOrdersModalProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    async function fetchUserOrders() {
      setLoading(true);
      try {
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("customerUid", "==", user?.uid || "")
        );
        const snapshot = await getDocs(q);
        const ordersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
          } as Order;
        });

        // Sort by date locally if needed (createdAt could be timestamp)
        setOrders(ordersData.reverse());
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchUserOrders();
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#1E1600] rounded-2xl shadow-2xl border border-[#C9960C]/30 overflow-hidden max-h-[80vh] flex flex-col text-[#FFF8E7]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#C9960C]/30 bg-[#1E1600]">
          <h2 className="text-xl font-bold text-[#F0C040] flex items-center gap-2 tracking-wide">
            <Package className="w-5 h-5 text-[#F0C040]" />
            My Orders
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#2A1E00] text-[#FFF8E7]/50 hover:text-[#F0C040] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F0C040]"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-[#FFF8E7]/50">
              <Receipt className="mx-auto mb-3 h-12 w-12 opacity-20 text-[#F0C040]" />
              <p className="text-base font-bold">No orders found</p>
              <p className="text-xs mt-1 text-[#FFF8E7]/40">Your placed orders will appear here</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-[#2A1E00] rounded-xl border border-[#C9960C]/30 p-4 shadow-md">
                <div className="flex flex-wrap justify-between items-center gap-2 border-b border-dashed border-[#C9960C]/20 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#FFF8E7]/50 uppercase tracking-wider">Order ID</span>
                    <p className="text-xs font-mono text-[#FFF8E7]/70">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#FFF8E7]/50 uppercase tracking-wider block">Status</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${
                      order.status === "Delivered" 
                        ? "bg-green-950/20 text-green-400 border-green-500/30" 
                        : order.status === "Shipped" 
                        ? "bg-blue-950/20 text-blue-400 border-blue-500/30" 
                        : "bg-yellow-950/20 text-yellow-400 border-yellow-500/30"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-center">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-[#C9960C]/20 bg-[#1E1600]" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#F0C040] truncate">{item.name}</h4>
                        <p className="text-xs text-[#FFF8E7]/60">Qty: {item.quantity} • ₹{item.price}</p>
                      </div>
                      <div className="text-sm font-bold text-[#F0C040]">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-[#C9960C]/20 mt-3 pt-3 font-bold">
                  <span className="text-sm text-[#FFF8E7]/80 font-medium">Total Amount Paid:</span>
                  <span className="text-base text-[#F0C040]">₹{order.totalAmount}</span>
                </div>
                {order.trackingDetails && (
                  <div className="mt-2 bg-[#1E1600] rounded-md p-2 text-xs text-[#FFF8E7]/80 border border-[#C9960C]/20">
                    <strong className="text-[#F0C040]">Tracking Info:</strong> {order.trackingDetails}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
