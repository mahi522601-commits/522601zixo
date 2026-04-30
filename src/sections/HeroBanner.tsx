import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const banners = [
  {
    src: "/images/banner1.png",
    alt: "Zixo Cookies moments made sweeter banner",
  },
  {
    src: "/images/banner2.png",
    alt: "Zixo Cookies premium quality cookies banner",
  },
];

export default function HeroBanner() {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBanner((current) => (current + 1) % banners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#0D0D0D]">
      <div className="relative h-[230px] sm:h-[370px] lg:h-[500px]">
        {banners.map((banner, index) => (
          <motion.img
            key={banner.src}
            src={banner.src}
            alt={banner.alt}
            initial={false}
            animate={{ opacity: activeBanner === index ? 1 : 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ))}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-0">
          {banners.map((banner, index) => (
            <button
              key={banner.src}
              type="button"
              aria-label={`Show banner ${index + 1}`}
              aria-pressed={activeBanner === index}
              onClick={() => setActiveBanner(index)}
              className="group p-4 flex items-center justify-center transition-all"
            >
              <div className={`h-2.5 rounded-full transition-all ${
                activeBanner === index
                  ? "w-8 bg-[#F0C040]"
                  : "w-2.5 bg-[#FFF8E7]/40 group-hover:bg-[#FFF8E7]"
              }`} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
