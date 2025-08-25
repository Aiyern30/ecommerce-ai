// components/UseCases.tsx
"use client";
import { motion, easeOut } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/";
import { Typography } from "@/components/ui/Typography";
import { AspectRatio } from "@/components/ui/";
import u1 from "@/public/UseCases/u1.jpeg";
import u2 from "@/public/UseCases/u2.jpeg";
import u3 from "@/public/UseCases/u5.webp";
import u4 from "@/public/UseCases/u4.jpeg";

const useCases = [
  {
    number: "01",
    title: "Home Renovation",
    description:
      "Perfect for residential projects including tiling, wall plastering, foundation work, and small-scale repairs. Our premium cement ensures long-lasting results for your dream home.",
    color: "text-blue-500",
    image: u1,
    stats: "50k+ Homes Built",
  },
  {
    number: "02",
    title: "Commercial Buildings",
    description:
      "Trusted by developers for office towers, shopping malls, and high-rise projects. Engineered for superior strength and durability in demanding commercial environments.",
    color: "text-blue-500",
    image: u2,
    stats: "200+ Projects",
  },
  {
    number: "03",
    title: "Infrastructure",
    description:
      "Essential for bridges, tunnels, highways, and public infrastructure projects. Meeting the highest standards for safety and structural integrity across Malaysia.",
    color: "text-blue-500",
    image: u3,
    stats: "Major Landmarks",
  },
  {
    number: "04",
    title: "Retail Supply",
    description:
      "Partner with us to supply premium cement through your hardware store or construction supply business. Competitive pricing with reliable delivery schedules.",
    color: "text-blue-500",
    image: u4,
    stats: "1000+ Partners",
  },
];

export function UseCases() {
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
    <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-slate-800">
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
            Common Use Cases
          </Typography>
          <Typography
            variant="lead"
            className="text-gray-600 dark:text-gray-200 max-w-2xl mx-auto text-lg lg:text-xl"
          >
            Discover the versatile applications of our premium cement across
            various construction projects and industries.
          </Typography>
        </motion.div>

        {/* Use Cases Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          {useCases.map((useCase, index) => (
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
                          src={useCase.image}
                          alt={useCase.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500 rounded-xl"
                        />
                      </AspectRatio>
                      {/* Number overlay */}
                      <div className="absolute top-4 left-4">
                        <motion.div
                          className="text-4xl font-bold text-blue-600 dark:text-blue-400 bg-white/90 dark:bg-gray-900/90 rounded-lg px-3 py-2 backdrop-blur-sm"
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
                          {useCase.number}
                        </motion.div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="w-full sm:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
                      <Typography
                        variant="h3"
                        className="text-gray-800 dark:text-white mb-3 text-xl lg:text-2xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300"
                      >
                        {useCase.title}
                      </Typography>

                      <Typography
                        variant="muted"
                        className="text-gray-600 dark:text-gray-200 leading-relaxed text-base"
                      >
                        {useCase.description}
                      </Typography>
                      <div className="mt-4">
                        <Typography
                          variant="small"
                          className="text-blue-600 dark:text-blue-400 font-semibold"
                        >
                          {useCase.stats}
                        </Typography>
                      </div>
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
