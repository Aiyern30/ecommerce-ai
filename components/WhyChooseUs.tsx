// components/WhyChooseUs.tsx
"use client";
import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/";
import { Typography } from "@/components/ui/Typography";
import { AspectRatio } from "@/components/ui/";
import { useDeviceType } from "@/utils/useDeviceTypes";

import c1 from "@/public/WhyChooseUs/c1.jpeg";
import c2 from "@/public/WhyChooseUs/c2.jpeg";
import c3 from "@/public/WhyChooseUs/c3.jpeg";
import c4 from "@/public/WhyChooseUs/c4.jpeg";

const features = [
  {
    number: "01",
    title: "Market Leadership",
    description:
      "As the largest ready-mixed concrete company in Malaysia, we have over 70 batching plants and a fleet of over 1,000 trucks, ensuring efficient supply.",
    color: "text-cyan-500",
  },
  {
    number: "02",
    title: "Innovative Products",
    description:
      "Our products, like the ECOConcrete™ range, are developed with meticulous research to provide high performance while reducing environmental impact.",
    color: "text-cyan-500",
  },
  {
    number: "03",
    title: "Nation-Building Legacy",
    description:
      "We have contributed to some of Malaysia's most iconic projects, including the Petronas Twin Towers, Merdeka 118, and KLIA.",
    color: "text-cyan-500",
  },
  {
    number: "04",
    title: "Environmental Commitment",
    description:
      "We are committed to sustainable practices through our ECO Product Range, which offers low-carbon alternatives to conventional materials.",
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
        ease: easeOut,
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
        ease: easeOut,
      },
    },
  };

  // Add device type hook
  const { isMobile } = useDeviceType();

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - Images and Title */}
          <motion.div
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h1"
                className="text-gray-800 dark:text-white mb-6 lg:mb-8 text-center lg:text-left"
              >
                Why Choose Us
              </Typography>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography
                variant="lead"
                className="text-gray-600 dark:text-gray-200 mb-8 lg:mb-12 text-center lg:text-left"
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Maecenas varius tortor nibh, sit amet tempor nibh finibus et.
              </Typography>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-sm sm:max-w-md mx-auto lg:max-w-none lg:mx-0">
              <motion.div
                className="space-y-3 sm:space-y-4"
                initial={
                  isMobile
                    ? { opacity: 0, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src={c1}
                    alt="Product 1"
                    fill
                    className="object-contain rounded-lg"
                    style={{ objectFit: "contain" }}
                  />
                </AspectRatio>
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src={c2}
                    alt="Product 2"
                    fill
                    className="object-contain rounded-lg"
                    style={{ objectFit: "contain" }}
                  />
                </AspectRatio>
              </motion.div>

              <motion.div
                className="space-y-3 sm:space-y-4 sm:mt-4 lg:mt-8"
                initial={
                  isMobile
                    ? { opacity: 0, scale: 1 }
                    : { opacity: 0, scale: 0.8 }
                }
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src={c3}
                    alt="Product 3"
                    fill
                    className="object-contain rounded-lg"
                    style={{ objectFit: "contain" }}
                  />
                </AspectRatio>
                <AspectRatio ratio={4 / 3}>
                  <Image
                    src={c4}
                    alt="Product 4"
                    fill
                    className="object-contain rounded-lg"
                    style={{ objectFit: "contain" }}
                  />
                </AspectRatio>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="w-full lg:w-1/2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={containerVariants}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
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
                  <Card className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm h-full shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
                    <CardContent className="p-6 lg:p-8">
                      <motion.div
                        className={`text-3xl lg:text-4xl font-bold ${feature.color} dark:text-cyan-400 mb-3 lg:mb-4`}
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

                      <Typography
                        variant="h3"
                        className="text-gray-800 dark:text-white mb-3 lg:mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300"
                      >
                        {feature.title}
                      </Typography>

                      <Typography
                        variant="muted"
                        className="text-gray-600 dark:text-gray-200 leading-relaxed"
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
