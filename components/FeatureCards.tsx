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
    <div className="p-6 border rounded-lg flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-purple-600" />
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
