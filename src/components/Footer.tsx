import { useState } from "react";
import { Instagram, MapPin, Phone, Youtube } from "lucide-react";

const POLICY_DESCRIPTIONS: Record<string, string> = {
  "Return & Refund Policy": "At Zixo Cookies, we take immense pride in the quality of our freshly baked treats. Because our cookies are perishable food items, all sales are final. However, if your order arrives damaged, incorrect, or incomplete, please reach out to our support team within 24 hours of delivery with photographic proof. We will happily arrange a replacement or issue a full refund to your original payment method.",
  "FAQ": "Q: Do you offer eggless cookies?\\nA: Yes, we specialize in premium eggless cookies baked using the finest ingredients.\\n\\nQ: What is the shelf life of your cookies?\\nA: Our cookies stay perfectly crunchy and delicious for 3-4 weeks if stored in an airtight container.\\n\\nQ: Do you ship across India?\\nA: Yes, we offer reliable doorstep shipping across the country.",
  "Privacy Policy": "Your privacy is extremely important to us. Zixo Cookies collects basic personal data (such as your name, delivery address, email, and phone number) solely to fulfill your orders and optimize your shopping experience. We use secure encryption protocols for all transactions and promise never to sell, lease, or distribute your data to third parties.",
  "Terms of Service": "By browsing or purchasing from Zixo Cookies, you agree to be bound by these terms. All visual designs, content, and logos belong strictly to Zixo Cookies. Prices are displayed in INR and are subject to change. We reserve the right to refuse service or cancel orders at our discretion due to stock limits or delivery constraints."
};

export default function Footer() {
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);

  return (
    <footer className="bg-[#0D0D0D] border-t border-[#C9960C]/30 text-[#FFF8E7]">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand / Logo */}
          <div className="flex flex-col items-start">
            <img src="/images/logo.jpeg" alt="Zixo Cookies" className="h-16 w-16 rounded-full object-cover mb-4 border border-[#C9960C]/50" />
            <p className="text-sm text-[#FFF8E7]/70 leading-relaxed max-w-xs">
              Proudly serving the finest, freshly baked cookies straight from Narasaraopet, Palnadu District. Delicious, crispy, and crunchy treats for every occasion.
            </p>
          </div>

          {/* Column 2: Social */}
          <div>
            <h3 className="font-bold text-[#F0C040] mb-4">Follow us</h3>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.instagram.com/zixo_cookies?igsh=emcwcWxzdDhlMjll" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[#1E1600] border border-[#C9960C]/30 text-[#C9960C] rounded-full hover:bg-[#F0C040] hover:text-[#0D0D0D] transition-colors flex items-center justify-center"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com/@subhani-04?si=UKbUXMagvsmJn_MI" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-[#1E1600] border border-[#C9960C]/30 text-[#C9960C] rounded-full hover:bg-[#F0C040] hover:text-[#0D0D0D] transition-colors flex items-center justify-center"
                aria-label="Follow us on Youtube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="font-bold text-[#F0C040] mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                "Return & Refund Policy", 
                "FAQ", 
                "Privacy Policy", 
                "Terms of Service"
              ].map((link) => (
                <li key={link}>
                  <button 
                    onClick={() => setSelectedPolicy(link)}
                    className="min-h-[44px] text-sm text-[#FFF8E7]/80 hover:text-[#F0C040] transition-colors text-left"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Get in Touch */}
          <div>
            <h3 className="font-bold text-[#F0C040] mb-4">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-[#FFF8E7]/80">
                <MapPin className="w-5 h-5 text-[#C9960C] flex-shrink-0 mt-0.5" />
                <p>Babapet, CPT Road, Narasaraopet,<br/>Palnadu District - 522601</p>
              </div>
              <div className="flex items-start gap-3 text-sm text-[#FFF8E7]/80">
                <Phone className="w-5 h-5 text-[#C9960C] flex-shrink-0 mt-0.5" />
                <p>
                  <a href="tel:8096697748" className="hover:text-[#F0C040] transition-colors">8096697748</a>
                  <br/>
                  <span className="text-xs text-[#FFF8E7]/50">(10AM–6:30PM Mon–Fri)</span>
                </p>
              </div>
              <a 
                href="https://wa.me/918096697748" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#C9960C]/30 py-6">
        <div className="container-main text-center">
          <p className="text-sm text-[#FFF8E7]/60">
            Copyright ©️ 2025, Zixo Cookies
          </p>
        </div>
      </div>
      {/* Policy Modal */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1500] rounded-xl shadow-xl max-w-md w-full p-6 border border-[#C9960C]/50 relative text-[#FFF8E7]">
            <button 
              onClick={() => setSelectedPolicy(null)}
              className="absolute top-4 right-4 text-[#FFF8E7]/50 hover:text-[#F0C040] font-bold text-xl"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold text-[#F0C040] mb-4">{selectedPolicy}</h3>
            <div className="text-sm text-[#FFF8E7]/80 whitespace-pre-line leading-relaxed">
              {POLICY_DESCRIPTIONS[selectedPolicy]}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
