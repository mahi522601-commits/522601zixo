import { useState, FormEvent, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ImagePlus, Loader2, CheckCircle2 } from "lucide-react";
import { BASE_URL } from "@/services/firebaseProducts";

export default function Checkout() {
  const { state, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasUnavailableItems = state.items.some((item) => item.isAvailable === false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    pincode: "",
    address: "",
  });
  
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = screenshot ? URL.createObjectURL(screenshot) : "";

  // Generate QR Code on mount
  useEffect(() => {
    const loadQRCode = async () => {
      const QRCode = await import('qrcode');
      const upiString = `upi://pay?pa=sksaleemasksaleema40@oksbi&pn=Zixocookies&am=${totalPrice}&cu=INR&tn=OrderPayment`;
      const qrContainer = document.getElementById('qrcode');
      if (qrContainer) {
        qrContainer.innerHTML = '';
        QRCode.toCanvas(upiString, { 
          width: 175, 
          margin: 2,
          color: { dark: '#1A2533', light: '#FFFFFF' }
        }, (err: Error | null | undefined, canvas: HTMLCanvasElement) => {
          if (!err && canvas) {
            qrContainer.appendChild(canvas);
          }
        });
      }
    };
    loadQRCode();
  }, [totalPrice]);

  // Handle UPI Deep Links
  const handleUpiDeepLink = (app: string, amount: number) => {
    const upiId = "sksaleemasksaleema40@oksbi";
    const payee = encodeURIComponent("Zixocookies");
    const amt = amount.toFixed(2);
    let url = "";

    switch (app) {
      case "phonepe":
        url = `phonepe://pay?pa=${upiId}&pn=${payee}&am=${amt}&cu=INR&tn=OrderPayment`;
        break;
      case "gpay":
        url = `tez://upi/pay?pa=${upiId}&pn=${payee}&am=${amt}&cu=INR&tn=OrderPayment`;
        break;
      case "paytm":
        url = `paytmmp://pay?pa=${upiId}&pn=${payee}&am=${amt}&cu=INR&tn=OrderPayment`;
        break;
    }

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (isMobile) {
      window.location.href = url;
    } else {
      alert("App links only work on mobile. Please scan the QR code with your UPI app.");
    }
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (state.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (hasUnavailableItems) {
      setError("Some items in your cart are no longer available. Please remove them before placing the order.");
      return;
    }

    if (!screenshot) {
      setError("Please upload a payment screenshot.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload screenshot
      const formData = new FormData();
      formData.append("image", screenshot);
      
      const API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
      
      const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
        method: "POST",
        body: formData,
      });
      
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.data?.url) {
        throw new Error(uploadData.error?.message || "Failed to upload screenshot.");
      }
      
      const screenshotUrl = uploadData.data.url;

      // 2. Submit order
      const orderData = {
        customerUid: user?.uid || "",
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        customerAddress: `${form.address}, ${form.city}, ${form.district} - ${form.pincode}`,
        items: state.items,
        totalAmount: totalPrice,
        paymentScreenshotUrl: screenshotUrl,
        status: "Pending",
        trackingDetails: "",
      };

      const orderRes = await fetch(`${BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to place order.");
      }

      setIsSuccess(true);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="bg-[#1E1600] rounded-lg shadow-card border border-[#C9960C]/30 p-8 max-w-md w-full text-center text-[#FFF8E7]">
          <CheckCircle2 className="w-16 h-16 text-[#F0C040] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#F0C040] mb-2">Order Placed Successfully!</h1>
          <p className="text-[#FFF8E7]/80 mb-6">
            Thank you for your order. We have received your payment screenshot and will begin processing your order shortly.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-[#F0C040] text-[#0D0D0D] px-6 py-3 rounded-md font-bold hover:bg-[#C9960C] transition-colors shadow-md"
          >
            Return to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0D0D] py-12 px-4 sm:px-6 lg:px-8 text-[#FFF8E7]">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-[#F0C040] mb-8 text-center tracking-wide">Checkout</h1>
        
        <div className="bg-[#1E1600] rounded-lg border border-[#C9960C]/30 shadow-card overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Order Summary */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#F0C040]">Order Summary</h2>
                  <span className="text-xs font-bold bg-[#F0C040] text-[#0D0D0D] px-2 py-1 rounded animate-pulse">🚚 FREE SHIPPING!</span>
                </div>
                <div className="bg-[#2A1E00] rounded-md border border-[#C9960C]/20 p-4 space-y-3">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex flex-col flex-1">
                        <span className="text-[#FFF8E7]/80">
                          {item.name} <span className="text-[#FFF8E7]/50 font-medium">x{item.quantity}</span>
                        </span>
                        {item.isAvailable === false && (
                          <span className="text-[10px] text-red-500 font-bold">Item no longer available</span>
                        )}
                      </div>
                      <span className="font-bold text-[#FFF8E7]">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-[#C9960C]/30 pt-3 mt-3 flex justify-between font-bold text-lg">
                    <span className="text-[#FFF8E7]">Total Amount</span>
                    <span className="text-[#F0C040]">Rs. {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#F0C040]">Your Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">Full Name</span>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">Phone Number</span>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">Email Address</span>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">City</span>
                    <input
                      required
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">District</span>
                    <input
                      required
                      type="text"
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">Pincode</span>
                    <input
                      required
                      type="text"
                      value={form.pincode}
                      onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                      className="h-11 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-sm font-semibold text-[#FFF8E7]/90">Delivery Address</span>
                    <textarea
                      required
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="min-h-24 w-full rounded-md border border-[#C9960C]/40 bg-[#1E1600] px-3 py-2 text-sm text-[#FFF8E7] outline-none focus:border-[#F0C040]"
                      placeholder="Enter your complete delivery address"
                    />
                  </label>
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <h2 className="text-xl font-bold mb-4 text-[#F0C040]">Payment</h2>
                
                {/* Order Summary Card */}
                <div className="bg-[#1E1600] rounded-2xl p-7 shadow-sm border border-[#C9960C]/30 mb-7 text-[#FFF8E7]">
                  <h3 className="text-lg font-bold mb-4 text-[#F0C040]">Order Summary</h3>
                  <div id="order-lines-container">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 border-b border-dashed border-[#C9960C]/20 last:border-0">
                        <div className="flex flex-col">
                          <span className="text-[#FFF8E7]/80">{item.name} x{item.quantity}</span>
                          {item.isAvailable === false && (
                            <span className="text-[10px] text-red-500 font-bold">Item no longer available</span>
                          )}
                        </div>
                        <span className="font-bold text-[#FFF8E7]">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-[#C9960C]/30">
                    <span className="font-bold text-lg">Total Amount</span>
                    <span className="text-[#F0C040] font-bold text-xl">Rs. {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* QR Code Card */}
                  <div className="bg-[#1E1600] rounded-2xl p-6 shadow-sm border border-[#C9960C]/30 flex flex-col items-center text-[#FFF8E7]">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-black text-[#F0C040] mb-1">Rs. {totalPrice.toFixed(2)}</div>
                      <div className="text-sm text-[#FFF8E7]/70 font-medium">sksaleemasksaleema40@oksbi</div>
                    </div>
                    <div id="qrcode" className="p-2 bg-white border border-[#C9960C]/50 rounded-xl mb-3 shadow-md"></div>
                    <p className="text-xs text-[#FFF8E7]/70 text-center">Scan with any UPI app • Amount pre-filled</p>
                  </div>

                  {/* Deep Link Buttons Card */}
                  <div className="bg-[#1E1600] rounded-2xl p-6 shadow-sm border border-[#C9960C]/30 text-[#FFF8E7]">
                    <div className="flex flex-col gap-4">
                      {/* PhonePe */}
                      <button
                        type="button"
                        onClick={() => handleUpiDeepLink('phonepe', totalPrice)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-[#C9960C]/30 bg-[#2A1E00] hover:border-[#F0C040] hover:bg-[#1E1600] transition-all text-left"
                      >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="40" rx="10" fill="#5F259F"/>
                          <path d="M12 20C12 15.58 15.58 12 20 12C22.4 12 24.56 13.02 26.08 14.68L22.4 18.36C21.72 17.54 20.92 17 20 17C17.8 17 16 18.8 16 21C16 23.2 17.8 25 20 25C21.54 25 22.88 24.14 23.6 22.86H20V18.86H28V21C28 25.42 24.42 29 20 29C15.58 29 12 25.42 12 21V20Z" fill="white"/>
                        </svg>
                        <div>
                          <div className="font-bold text-[#FFF8E7]">PhonePe</div>
                          <div className="text-xs text-[#FFF8E7]/70">Tap to pay</div>
                        </div>
                      </button>

                      {/* GPay */}
                      <button
                        type="button"
                        onClick={() => handleUpiDeepLink('gpay', totalPrice)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-[#C9960C]/30 bg-[#2A1E00] hover:border-[#F0C040] hover:bg-[#1E1600] transition-all text-left"
                      >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="40" rx="10" fill="#FFFFFF" stroke="#E8E8E8" strokeWidth="1.5"/>
                          <path d="M28.6 20.2C28.6 19.56 28.54 18.94 28.44 18.34H20V21.86H24.84C24.62 23.04 23.96 24.04 22.96 24.7V27.1H25.88C27.6 25.52 28.6 23.06 28.6 20.2Z" fill="#4285F4"/>
                          <path d="M20 29.4C22.42 29.4 24.46 28.58 25.88 27.1L22.96 24.7C22.14 25.26 21.16 25.6 20 25.6C17.66 25.6 15.7 24 14.94 21.84H11.92V24.3C13.34 27.12 16.46 29.4 20 29.4Z" fill="#34A853"/>
                          <path d="M14.94 21.84C14.74 21.28 14.64 20.68 14.64 20.06C14.64 19.44 14.74 18.84 14.94 18.28V15.82H11.92C11.34 16.98 11 18.48 11 20.06C11 21.64 11.34 23.14 11.92 24.3L14.94 21.84Z" fill="#FBBC05"/>
                          <path d="M20 14.5C21.28 14.5 22.42 14.96 23.32 15.82L25.94 13.2C24.46 11.8 22.42 11 20 11C16.46 11 13.34 13.28 11.92 16.1L14.94 18.56C15.7 16.4 17.66 14.5 20 14.5Z" fill="#EA4335"/>
                        </svg>
                        <div>
                          <div className="font-bold text-[#FFF8E7]">Google Pay</div>
                          <div className="text-xs text-[#FFF8E7]/70">Tap to pay</div>
                        </div>
                      </button>

                      {/* Paytm */}
                      <button
                        type="button"
                        onClick={() => handleUpiDeepLink('paytm', totalPrice)}
                        className="flex items-center gap-4 p-4 rounded-xl border border-[#C9960C]/30 bg-[#2A1E00] hover:border-[#F0C040] hover:bg-[#1E1600] transition-all text-left"
                      >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="40" height="40" rx="10" fill="#00B9F1"/>
                          <rect x="9" y="13" width="22" height="9" rx="3" fill="white"/>
                          <text x="20" y="21" fontSize="7.5" fontFamily="Arial" fontWeight="900" fill="#002F6C" textAnchor="middle">Paytm</text>
                          <rect x="9" y="25" width="22" height="5" rx="2.5" fill="white" opacity="0.3"/>
                        </svg>
                        <div>
                          <div className="font-bold text-[#FFF8E7]">Paytm</div>
                          <div className="text-xs text-[#FFF8E7]/70">Tap to pay</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="bg-[#1E1600] rounded-2xl p-7 shadow-sm border border-[#C9960C]/30 mb-5 text-[#FFF8E7]">
                  <h3 className="font-bold text-[#F0C040] mb-4">📸 Upload Payment Screenshot</h3>
                  <div 
                    className="border-2 border-dashed border-[#C9960C]/40 bg-[#2A1E00] rounded-xl p-8 text-center cursor-pointer hover:border-[#F0C040] hover:bg-[#1E1600] transition-all"
                    onClick={() => document.getElementById('screenshot-input')?.click()}
                  >
                    {previewUrl ? (
                      <div className="flex flex-col items-center">
                        <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg border border-[#C9960C]/30 mb-2" />
                        <span className="text-sm font-bold text-[#FFF8E7]">{screenshot?.name}</span>
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="mx-auto mb-2 h-8 w-8 text-[#C9960C]" />
                        <span className="font-bold text-[#FFF8E7]">Drag & drop or click to upload</span>
                        <span className="block text-xs text-[#FFF8E7]/60 mt-1">JPEG, PNG, WEBP • Max 5MB</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    id="screenshot-input"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
                    className="hidden"
                    aria-label="Upload payment screenshot"
                  />
                </div>
              </div>

              {error && <p className="text-[#F0C040] text-sm font-bold bg-[#2A1E00] border border-red-500/50 p-3 rounded-md">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting || state.items.length === 0 || hasUnavailableItems}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-md font-bold text-lg transition-colors shadow-md ${
                  hasUnavailableItems || isSubmitting || state.items.length === 0
                    ? "bg-[#2A1E00] text-red-500/50 border border-red-500/20 cursor-not-allowed"
                    : "bg-[#F0C040] text-[#0D0D0D] hover:bg-[#C9960C]"
                }`}
              >
                {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isSubmitting ? "Processing Order..." : hasUnavailableItems ? "Remove unavailable items" : "Place Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
