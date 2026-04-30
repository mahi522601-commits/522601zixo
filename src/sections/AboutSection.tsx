import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="py-16 bg-[#0D0D0D] border-y border-[#C9960C]/20">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F0C040] mb-6 tracking-wide">
              ZIXOCOOKIES
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4 text-[#FFF8E7] leading-relaxed"
          >
            <p>
              ZIXOCOOKIES commenced its journey with a vision to serve premium, freshly baked cookies that create moments of pure joy. What started as a passion for authentic, rich baking has quickly grown into a trusted name synonymous with superior quality and unforgettable crunch. Today, we are proud to be the favorite destination for cookie lovers seeking delightful treats crafted with love.
            </p>
            <p>
              Our product line is uniquely formulated to offer incredible value, combining the highest-grade ingredients with artisanal recipes. Every single cookie undergoes rigorous quality controls to ensure that what you bite into is nothing short of absolute perfection.
            </p>
            <p>
              We offer a diverse range of exceptional flavors including decadent Chocolate Chips, Nutty Combo Delights, Healthy Oats, and Gourmet Specialties. Our master bakers work tirelessly to craft new profiles that keep every sweet craving satisfied.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
