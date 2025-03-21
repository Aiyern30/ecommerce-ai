import { Card, CardContent } from "@/components/ui/";
import { motion } from "framer-motion";

interface FeatureCardsProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
}: FeatureCardsProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.05,
        boxShadow: "8px 8px 20px rgba(0, 0, 0, 0.15)",
      }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      className="flex flex-col h-full"
    >
      <Card className="h-full flex flex-col rounded-xl shadow-[4px_4px_12px_rgba(0,0,0,0.1)] border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
        <CardContent className="p-6 flex flex-col items-center text-center flex-grow">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
