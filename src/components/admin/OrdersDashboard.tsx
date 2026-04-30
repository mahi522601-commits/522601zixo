import { useEffect, useState } from "react";
import { Loader2, ExternalLink, Send, Trash2 } from "lucide-react";
import { BASE_URL } from "@/services/firebaseProducts";

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${BASE_URL}/api/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm("Are you sure you want to delete this order? This will remove it from Firebase.")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  }

  async function updateOrderStatus(id: string, newStatus: string) {
    try {
      await fetch(`${BASE_URL}/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch(err) {
      console.error(err);
    }
  }

  async function sendTracking(order: any) {
    const trackingNo = prompt("Enter tracking details (e.g. Courier Name & Tracking Number) to send to the customer:");
    if (!trackingNo) return;
    
    try {
      await fetch(`${BASE_URL}/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingDetails: trackingNo, status: "Shipped" })
      });
      
      const phone = order.customerPhone.replace(/[^0-9]/g, '');
      const message = `Hi ${order.customerName},\nYour order from Zixo Cookies has been shipped!\n\n📦 *Tracking Details*:\n${trackingNo}\n\nThank you for shopping with us!`;
      
      const emailSubject = `Your Zixo Cookies Order has been shipped!`;
      const emailBody = `Hi ${order.customerName},\n\nYour order from Zixo Cookies has been shipped!\n\nTracking Details:\n${trackingNo}\n\nThank you for shopping with us!\n\nBest regards,\nZixo Cookies Team`;
      
      // Open WhatsApp in a new tab
      window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, '_blank');
      
      // Trigger email client in the current tab (this just opens the default mail app)
      setTimeout(() => {
        window.location.href = `mailto:${order.customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      }, 300);
      
      fetchOrders();
    } catch(err) {
      console.error(err);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#F0C040]" /></div>;

  return (
    <div className="space-y-6 text-[#FFF8E7]">
      <h2 className="text-2xl font-bold text-[#F0C040] tracking-wide">Orders ({orders.length})</h2>
      {orders.length === 0 && <p className="text-[#FFF8E7]/50">No orders found.</p>}
      
      <div className="grid gap-6">
        {orders.map(order => (
          <div key={order.id} className="bg-[#1E1600] p-4 sm:p-6 rounded-lg border border-[#C9960C]/30 shadow-md text-[#FFF8E7]">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4 pb-4 border-b border-[#C9960C]/30">
              <div className="w-full sm:w-auto">
                <h3 className="font-bold text-lg text-[#F0C040] tracking-wide">{order.customerName}</h3>
                <p className="text-sm font-medium text-[#FFF8E7]/80 break-all">{order.customerEmail} | {order.customerPhone}</p>
                <p className="text-sm text-[#FFF8E7]/70 mt-1 max-w-sm">{order.customerAddress}</p>
                <p className="text-xs font-bold text-[#C9960C] mt-2">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div className="w-full sm:w-auto flex flex-row sm:flex-col justify-between sm:items-end items-center gap-2">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-lg sm:text-xl text-[#F0C040]">Rs. {order.totalAmount?.toFixed(2)}</p>
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    className="p-3 sm:p-1.5 text-[#FFF8E7]/50 hover:text-red-400 bg-[#2A1E00] hover:bg-red-900/30 border border-[#C9960C]/30 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title="Delete Order"
                  >
                    <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`text-sm border rounded p-2 sm:p-1.5 font-bold outline-none cursor-pointer bg-[#1E1600] min-h-[40px]
                    ${order.status === 'Pending' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-900/20' : 
                      order.status === 'Processing' ? 'text-blue-400 border-blue-500/30 bg-blue-900/20' :
                      order.status === 'Shipped' ? 'text-purple-400 border-purple-500/30 bg-purple-900/20' :
                      order.status === 'Delivered' ? 'text-green-400 border-green-500/30 bg-green-900/20' :
                      'text-red-400 border-red-500/30 bg-red-900/20'
                    }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-[#F0C040] mb-3">Items Ordered:</h4>
                <ul className="text-sm space-y-2">
                  {order.items?.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between border-b border-[#C9960C]/20 pb-2">
                      <span className="font-bold text-[#FFF8E7]">{item.quantity}x {item.name}</span>
                      <span className="font-bold text-[#F0C040]">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                
                {order.trackingDetails && (
                  <div className="mt-4 p-3 bg-blue-900/20 rounded-md text-sm border border-blue-500/30 text-[#FFF8E7]">
                    <strong className="text-blue-300">Tracking Details:</strong> 
                    <p className="text-blue-200 mt-1">{order.trackingDetails}</p>
                  </div>
                )}
                
                <button
                  onClick={() => sendTracking(order)}
                  className="mt-5 flex items-center justify-center w-full gap-2 text-sm bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 transition-colors font-bold shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  Update Tracking & Notify (WhatsApp + Email)
                </button>
              </div>
              
              <div>
                <h4 className="font-bold text-[#F0C040] mb-3">Payment Screenshot:</h4>
                {order.paymentScreenshotUrl ? (
                  <a href={order.paymentScreenshotUrl} target="_blank" rel="noreferrer" className="block w-max relative group">
                    <img src={order.paymentScreenshotUrl} alt="Payment" className="h-48 object-cover rounded-md border border-[#C9960C]/30 shadow-sm bg-[#2A1E00]" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                      <ExternalLink className="text-[#F0C040] w-8 h-8" />
                    </div>
                  </a>
                ) : (
                  <p className="text-sm text-[#FFF8E7]/50 italic bg-[#2A1E00] p-4 rounded-md border border-[#C9960C]/30">No screenshot provided.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
