// components/WhyChooseUs.tsx
"use client";
import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/";
import { Typography } from "@/components/ui/Typography";
import { AspectRatio } from "@/components/ui/";

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
    image: c1,
  },
  {
    number: "02",
    title: "Innovative Products",
    description:
      "Our products, like the ECOConcrete™ range, are developed with meticulous research to provide high performance while reducing environmental impact.",
    color: "text-cyan-500",
    image: c2,
  },
  {
    number: "03",
    title: "Nation-Building Legacy",
    description:
      "We have contributed to some of Malaysia's most iconic projects, including the Petronas Twin Towers, Merdeka 118, and KLIA.",
    color: "text-cyan-500",
    image: c3,
  },
  {
    number: "04",
    title: "Environmental Commitment",
    description:
      "We are committed to sustainable practices through our ECO Product Range, which offers low-carbon alternatives to conventional materials.",
    color: "text-cyan-500",
    image: c4,
  },
];

export function WhyChooseUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: easeOut,
      },
    },
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <motion.div
          className="text-center mb-12 lg:mb-16"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h1"
            className="text-gray-800 dark:text-white mb-4 text-3xl lg:text-4xl xl:text-5xl"
          >
            Why Choose Us
          </Typography>
          <Typography
            variant="lead"
            className="text-gray-600 dark:text-gray-200 max-w-2xl mx-auto text-lg lg:text-xl"
          >
            Experience excellence through our proven track record and commitment
            to quality construction solutions.
          </Typography>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="group"
            >
              <Card className="p-0">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Image Section */}
                    <div className="w-full sm:w-2/5 relative">
                      <AspectRatio ratio={4 / 3}>
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        />
                      </AspectRatio>
                      {/* Number overlay */}
                      <div className="absolute top-4 left-4">
                        <motion.div
                          className={`text-4xl font-bold ${feature.color} dark:text-cyan-400 bg-white/90 dark:bg-gray-900/90 rounded-lg px-3 py-2 backdrop-blur-sm`}
                          initial={{ scale: 0, rotate: -10 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1 + index * 0.1,
                            type: "spring",
                            stiffness: 150,
                          }}
                        >
                          {feature.number}
                        </motion.div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full sm:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
                      <Typography
                        variant="h3"
                        className="text-gray-800 dark:text-white mb-3 text-xl lg:text-2xl group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300"
                      >
                        {feature.title}
                      </Typography>

                      <Typography
                        variant="muted"
                        className="text-gray-600 dark:text-gray-200 leading-relaxed text-base"
                      >
                        {feature.description}
                      </Typography>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
