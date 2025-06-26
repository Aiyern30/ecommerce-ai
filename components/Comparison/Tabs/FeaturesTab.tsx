import { Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/";

interface Feature {
  name: string;
  available: boolean;
}

interface ProductWithFeatures {
  id: string;
  name: string;
  features: Feature[];
}

interface FeaturesTabProps {
  products: ProductWithFeatures[];
}

export function FeaturesTab({ products }: FeaturesTabProps) {
  if (!products.length || !products[0].features) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>No features data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Comparison</CardTitle>
        <CardDescription>
          See which features are available in each product
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Feature</th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="text-left py-3 px-4 font-medium"
                  >
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products[0].features.map((feature, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4 font-medium">{feature.name}</td>
                  {products.map((product) => (
                    <td key={product.id} className="py-3 px-4">
                      {product.features[index]?.available ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
