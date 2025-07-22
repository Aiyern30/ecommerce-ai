// components/WhyChooseUs.tsx
"use client";
import { motion } from "framer-motion";

const features = [
  {
    number: "01",
    title: "Pure Organic",
    description:
      "From soothing aloe Vera to revitalizing lavender, each element is handpicked",
    color: "text-cyan-500",
  },
  {
    number: "02",
    title: "No Chemicals",
    description:
      "Reprehenderit esse labore id veniam ut veniam non ex adipisicing amet ullamco",
    color: "text-cyan-500",
  },
  {
    number: "03",
    title: "Transformative",
    description:
      "Experience hair that's not only clean but also deeply nourished and beautifully rejuvenated.",
    color: "text-cyan-500",
  },
  {
    number: "04",
    title: "Environmentally",
    description:
      "We are committed to reducing our carbon footprint. Our packaging is eco-friendly,",
    color: "text-cyan-500",
  },
];

export function WhyChooseUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left side - Images and Title */}
          <motion.div
            className="lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            <motion.h2
              className="text-5xl font-bold text-gray-800 dark:text-white mb-8"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why Choose Us
            </motion.h2>

            <motion.p
              className="text-gray-600 dark:text-gray-200 mb-12 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
              varius tortor nibh, sit amet tempor nibh finibus et.
            </motion.p>

            {/* Product Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      SEB MAN
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="w-full h-32 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      HAIR CARE
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="space-y-4 mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      PREMIUM
                    </span>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <span className="text-white font-bold text-sm relative z-10">
                      STYLE
                    </span>
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Features */}
          <motion.div
            className="lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="group"
                >
                  <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
                    <motion.div
                      className={`text-4xl font-bold ${feature.color} dark:text-cyan-400 mb-4`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + index * 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      {feature.number}
                    </motion.div>

                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
