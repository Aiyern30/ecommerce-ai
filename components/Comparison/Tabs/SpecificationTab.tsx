import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/";
import { Product } from "@/type/product";
interface ProductWithSpecs extends Product {
  specs: {
    performance: { value: string; score: number };
    battery: { value: string; score: number };
    storage: { value: string; score: number };
    camera: { value: string; score: number };
  };
}

interface SpecificationsTabProps {
  products: ProductWithSpecs[];
}

export function SpecificationsTab({ products }: SpecificationsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Specifications</CardTitle>
        <CardDescription>
          Compare technical specifications side by side
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">
                  Specification
                </th>
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
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Performance</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4">
                    {product.specs.performance.value}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Battery Life</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4">
                    {product.specs.battery.value}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Storage</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4">
                    {product.specs.storage.value}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4 font-medium">Camera</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4">
                    {product.specs.camera.value}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Price</td>
                {products.map((product) => (
                  <td key={product.id} className="py-3 px-4">
                    {product.price}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
