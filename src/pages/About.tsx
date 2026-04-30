import Header from "@/components/Header";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import { ProductsProvider } from "@/context/ProductsContext";
import { ArrowRight, ShoppingBag, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";

function AboutContent() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D0D0D] text-[#FFF8E7] min-h-screen font-sans">
      
      {/* HERO SECTION */}
      <section className="relative bg-[#0D0D0D] py-24 md:py-32 flex items-center justify-center overflow-hidden border-b border-[#C9960C]/30">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F0C040_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="container-main relative text-center px-4 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="text-[#F0C040] font-bold uppercase tracking-widest text-sm bg-[#1E1600]/80 px-4 py-1.5 rounded-full border border-[#C9960C]/30 shadow-sm inline-block mb-6">
            Our Story — Zixo Cookies
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#F0C040] mb-6 leading-none uppercase">
            Baked with Love,<br/>Delivered with Care
          </h1>
          <p className="text-lg md:text-xl text-[#FFF8E7]/80 font-medium">
            Handcrafted cookies from the heart of Narasaraopet
          </p>
        </div>
      </section>

      {/* SECTION 1: WHO WE ARE */}
      <section className="py-20 container-main px-4 max-w-4xl">
        <div className="bg-[#1E1600] p-8 md:p-12 rounded-2xl shadow-md border border-[#C9960C]/30 text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#F0C040] mb-6 flex items-center gap-3 justify-center md:justify-start tracking-wide">
            <span className="h-8 w-1.5 bg-[#F0C040] rounded-full inline-block"></span>
            Who We Are
          </h2>
          <div className="space-y-6 text-[#FFF8E7]/80 leading-relaxed text-base md:text-lg">
            <p>
              Zixo Cookies is a homegrown cookie brand born in Narasaraopet, Andhra Pradesh. 
              We believe that every cookie should tell a story — of fresh ingredients, careful hands, 
              and the warmth of a kitchen that cares. From our small setup in Babapet, we craft every batch 
              by hand and deliver it fresh to doorsteps across India.
            </p>
            <p className="font-bold text-[#FFF8E7]">
              We are not a factory. We are a passion project turned into a brand — built for people who appreciate real food, made the right way.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR PRODUCTS */}
      <section className="py-20 bg-[#1A1500] border-y border-[#C9960C]/30">
        <div className="container-main px-4">
          <h2 className="text-3xl font-bold text-[#F0C040] text-center mb-12 tracking-wide">What We Bake</h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            
            {/* Card 1 */}
            <div className="group bg-[#2A1E00] p-8 rounded-2xl shadow-md border border-[#C9960C]/30 hover:border-[#F0C040] transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="text-4xl mb-6 bg-[#1E1600] border border-[#C9960C]/30 w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                🍪
              </div>
              <h3 className="text-xl font-bold text-[#F0C040] mb-4">Classic Cookies</h3>
              <p className="text-[#FFF8E7]/80 text-sm leading-relaxed flex-1">
                Our signature classic cookies are crispy on the outside, soft on the inside. Made with premium butter, fresh flour, and a touch of vanilla, these are the cookies that started it all. Perfect for gifting, snacking, or just treating yourself after a long day.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-[#2A1E00] p-8 rounded-2xl shadow-md border border-[#C9960C]/30 hover:border-[#F0C040] transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="text-4xl mb-6 bg-[#1E1600] border border-[#C9960C]/30 w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                🎁
              </div>
              <h3 className="text-xl font-bold text-[#F0C040] mb-4">Festive Special Packs</h3>
              <p className="text-[#FFF8E7]/80 text-sm leading-relaxed flex-1">
                Celebrate every occasion with our curated festive combo packs. Available in assorted flavors, our festive boxes are carefully packaged and ready to gift. Whether it's Diwali, birthdays, or just a thank-you gesture — Zixo has you covered.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-[#2A1E00] p-8 rounded-2xl shadow-md border border-[#C9960C]/30 hover:border-[#F0C040] transition-all duration-300 hover:-translate-y-1 flex flex-col">
              <div className="text-4xl mb-6 bg-[#1E1600] border border-[#C9960C]/30 w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                📦
              </div>
              <h3 className="text-xl font-bold text-[#F0C040] mb-4">Combo Value Packs</h3>
              <p className="text-[#FFF8E7]/80 text-sm leading-relaxed flex-1">
                Love our cookies? Get more and save more. Our combo packs are designed for families, offices, and cookie lovers who just can't get enough. Same handcrafted quality, better value. Free delivery included on all combos.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: WHY CHOOSE US */}
      <section className="py-20 bg-[#0D0D0D] container-main px-4">
        <h2 className="text-3xl font-bold text-[#F0C040] text-center mb-12 tracking-wide">Why Zixo Cookies?</h2>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          
          <div className="bg-[#1E1600] p-6 rounded-2xl shadow-md border border-[#C9960C]/30 text-center flex flex-col items-center">
            <div className="text-3xl mb-4">🌿</div>
            <h4 className="font-bold text-[#F0C040] mb-2 text-base">No Preservatives</h4>
            <p className="text-[#FFF8E7]/70 text-xs leading-relaxed">
              Every cookie is made fresh to order. No artificial colors, no preservatives — just real ingredients you can trust.
            </p>
          </div>

          <div className="bg-[#1E1600] p-6 rounded-2xl shadow-md border border-[#C9960C]/30 text-center flex flex-col items-center">
            <div className="text-3xl mb-4">🚚</div>
            <h4 className="font-bold text-[#F0C040] mb-2 text-base">Free Delivery</h4>
            <p className="text-[#FFF8E7]/70 text-xs leading-relaxed">
              We ship pan-India on all prepaid orders at zero delivery cost. Your cookies arrive fresh, sealed, and on time.
            </p>
          </div>

          <div className="bg-[#1E1600] p-6 rounded-2xl shadow-md border border-[#C9960C]/30 text-center flex flex-col items-center">
            <div className="text-3xl mb-4">🏠</div>
            <h4 className="font-bold text-[#F0C040] mb-2 text-base">Homemade Quality</h4>
            <p className="text-[#FFF8E7]/70 text-xs leading-relaxed">
              We don't do mass production. Small batches, personal attention, consistent quality — that's the Zixo promise.
            </p>
          </div>

          <div className="bg-[#1E1600] p-6 rounded-2xl shadow-md border border-[#C9960C]/30 text-center flex flex-col items-center">
            <div className="text-3xl mb-4">⭐</div>
            <h4 className="font-bold text-[#F0C040] mb-2 text-base">5-Star Love</h4>
            <p className="text-[#FFF8E7]/70 text-xs leading-relaxed">
              Thousands of happy customers trust Zixo Cookies for fresh, authentic taste. Taste the difference yourself.
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 4: OUR PROCESS */}
      <section className="py-20 bg-[#1A1500] text-[#FFF8E7] border-y border-[#C9960C]/30">
        <div className="container-main px-4 max-w-5xl">
          <h2 className="text-3xl font-bold text-[#F0C040] text-center mb-16 tracking-wide">How We Make Your Cookies</h2>
          <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-12 md:gap-6">
            
            {/* Step 1 */}
            <div className="flex-1 text-center relative z-10 group flex flex-col items-center">
              <div className="text-4xl mb-6 bg-[#2A1E00] border border-[#C9960C]/30 w-20 h-20 rounded-full flex items-center justify-center shadow-md text-[#F0C040] transition-transform group-hover:scale-110 duration-300">
                🌾
              </div>
              <span className="text-[#C9960C] font-bold text-xs uppercase tracking-wider mb-2">Step 1</span>
              <h3 className="text-lg font-bold mb-3 text-[#FFF8E7]">Sourcing</h3>
              <p className="text-[#FFF8E7]/80 text-sm leading-relaxed max-w-xs">
                We source only the finest flour, butter, and natural ingredients. No compromises on quality, ever.
              </p>
            </div>

            {/* Connector (desktop) */}
            <div className="hidden md:block absolute top-10 left-[25%] right-[60%] h-0.5 bg-[#C9960C]/30 z-0"></div>

            {/* Step 2 */}
            <div className="flex-1 text-center relative z-10 group flex flex-col items-center">
              <div className="text-4xl mb-6 bg-[#2A1E00] border border-[#C9960C]/30 w-20 h-20 rounded-full flex items-center justify-center shadow-md text-[#F0C040] transition-transform group-hover:scale-110 duration-300">
                👐
              </div>
              <span className="text-[#C9960C] font-bold text-xs uppercase tracking-wider mb-2">Step 2</span>
              <h3 className="text-lg font-bold mb-3 text-[#FFF8E7]">Handcrafted</h3>
              <p className="text-[#FFF8E7]/80 text-sm leading-relaxed max-w-xs">
                Every cookie is shaped and baked by hand in small batches to ensure consistent taste and freshness in every bite.
              </p>
            </div>

            {/* Connector (desktop) */}
            <div className="hidden md:block absolute top-10 left-[55%] right-[30%] h-0.5 bg-[#C9960C]/30 z-0"></div>

            {/* Step 3 */}
            <div className="flex-1 text-center relative z-10 group flex flex-col items-center">
              <div className="text-4xl mb-6 bg-[#2A1E00] border border-[#C9960C]/30 w-20 h-20 rounded-full flex items-center justify-center shadow-md text-[#F0C040] transition-transform group-hover:scale-110 duration-300">
                📬
              </div>
              <span className="text-[#C9960C] font-bold text-xs uppercase tracking-wider mb-2">Step 3</span>
              <h3 className="text-lg font-bold mb-3 text-[#FFF8E7]">Packed & Shipped</h3>
              <p className="text-[#FFF8E7]/80 text-sm leading-relaxed max-w-xs">
                Each order is hygienically sealed and dispatched within 24 hours of being placed. Tracked delivery to your doorstep.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: OUR VALUES */}
      <section className="py-20 container-main px-4 max-w-4xl">
        <div className="bg-[#1E1600] p-8 md:p-12 rounded-2xl shadow-md border border-[#C9960C]/30 text-center md:text-left">
          <h2 className="text-3xl font-bold text-[#F0C040] mb-6 flex items-center gap-3 justify-center md:justify-start tracking-wide">
            <span className="h-8 w-1.5 bg-[#F0C040] rounded-full inline-block"></span>
            What We Stand For
          </h2>
          <div className="space-y-6 text-[#FFF8E7]/80 leading-relaxed text-base md:text-lg">
            <p>
              We started Zixo Cookies because we were tired of choosing between taste and quality. 
              Store-bought cookies are loaded with preservatives. Street snacks aren't always hygienic. 
              We wanted something better — and we built it.
            </p>
            
            <div className="pt-4">
              <p className="font-bold text-[#FFF8E7] mb-4">Our values are simple:</p>
              <ul className="space-y-3 pl-2 font-bold text-[#FFF8E7]">
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-[#F0C040] text-lg">→</span> Freshness over shelf life
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-[#F0C040] text-lg">→</span> Honesty over marketing fluff
                </li>
                <li className="flex items-center gap-2 justify-center md:justify-start">
                  <span className="text-[#F0C040] text-lg">→</span> Customer satisfaction over everything
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-16 md:py-24 bg-[#1A1500] border-y border-[#C9960C]/30">
        <div className="container-main relative text-center px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold text-[#F0C040] mb-4 tracking-tight leading-none uppercase">
            Ready to Try Zixo Cookies?
          </h2>
          <p className="text-base md:text-lg font-medium text-[#FFF8E7]/80 mb-8">
            Order now and get free delivery on your first prepaid order.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 bg-[#F0C040] text-[#0D0D0D] px-6 py-3.5 rounded-lg text-sm font-bold hover:bg-[#C9960C] transition-colors shadow-md hover:shadow-lg duration-300"
            >
              <ShoppingBag className="w-4 h-4" />
              Shop Now
            </button>
            <a 
              href="https://wa.me/918096697748"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3.5 rounded-lg text-sm font-bold hover:bg-[#1ebd5a] transition-colors shadow-md hover:shadow-lg duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Us
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function About() {
  return (
    <ProductsProvider>
      <div className="min-h-screen bg-[#0D0D0D]">
        <Header />
        <CartDrawer />
        <AboutContent />
        <Footer />
      </div>
    </ProductsProvider>
  );
}
