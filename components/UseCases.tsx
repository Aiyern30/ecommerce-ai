// components/UseCases.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const useCases = [
  {
    number: "01",
    title: "Home Renovation",
    description: "Ideal for tiling, wall plastering, and small-scale repairs.",
    color: "text-blue-500",
  },
  {
    number: "02",
    title: "Commercial Buildings",
    description:
      "Reliable choice for office towers, malls, and high-rise projects.",
    color: "text-blue-500",
  },
  {
    number: "03",
    title: "Infrastructure",
    description:
      "Used in bridges, tunnels, and other public infrastructure projects.",
    color: "text-blue-500",
  },
  {
    number: "04",
    title: "Retail Supply",
    description:
      "Resell premium cement in your local hardware or construction store.",
    color: "text-blue-500",
  },
];

export function UseCases() {
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
    hidden: { opacity: 0, x: 50 },
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
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - Features */}
          <motion.div
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6 lg:mb-8 text-center lg:text-left"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Common Use Cases
            </motion.h2>

            <motion.p
              className="text-gray-600 dark:text-gray-200 mb-8 lg:mb-12 text-base lg:text-lg leading-relaxed text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover the versatile applications of our premium cement across
              various construction projects and industries.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="group"
                >
                  <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl lg:rounded-2xl p-6 lg:p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
                    <motion.div
                      className={`text-3xl lg:text-4xl font-bold ${useCase.color} dark:text-blue-400 mb-4`}
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
                      {useCase.number}
                    </motion.div>

                    <h3 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white mb-3 lg:mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {useCase.title}
                    </h3>

                    <p className="text-sm lg:text-base text-gray-600 dark:text-gray-200 leading-relaxed">
                      {useCase.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Images */}
          <motion.div
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            {/* Product Images Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto lg:max-w-none lg:mx-0">
              {/* First column */}
              <motion.div
                className="space-y-3 sm:space-y-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative w-full h-28 sm:h-32 lg:h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src="/401.png"
                      alt="Construction Project 1"
                      fill
                      className="object-contain p-2 sm:p-3 lg:p-4"
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative w-full h-28 sm:h-32 lg:h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src="/401.png"
                      alt="Construction Project 2"
                      fill
                      className="object-contain p-2 sm:p-3 lg:p-4"
                    />
                  </div>
                </div>
              </motion.div>

              {/* Second column */}
              <motion.div
                className="space-y-3 sm:space-y-4 sm:mt-4 lg:mt-8"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative w-full h-28 sm:h-32 lg:h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src="/401.png"
                      alt="Construction Project 3"
                      fill
                      className="object-contain p-2 sm:p-3 lg:p-4"
                    />
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl dark:hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative w-full h-28 sm:h-32 lg:h-40 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src="/401.png"
                      alt="Construction Project 4"
                      fill
                      className="object-contain p-2 sm:p-3 lg:p-4"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
