"use client";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@/components/ui/";

// Zod schema for product creation
const productSchema = z.object({
  product_code: z.string().min(1, "Product code is required"),
  product_name: z.string().min(1, "Product name is required"),
  category_id: z.string().min(1, "Category is required"),
  brand: z.string().default("YTL Cement"),
  description: z.string().optional(),
  cement_type: z.enum(["OPC", "PPC", "PSC", "SRC", "RHPC"], {
    required_error: "Cement type is required",
  }),
  grade: z.string().optional(),
  compressive_strength: z.string().optional(),
  setting_time: z.string().optional(),
  fineness: z.string().optional(),
  package_size: z.number().min(0, "Package size must be positive").optional(),
  price_per_bag: z.number().min(0, "Price per bag must be positive").optional(),
  price_per_ton: z.number().min(0, "Price per ton must be positive").optional(),
  stock_quantity: z
    .number()
    .min(0, "Stock quantity must be non-negative")
    .default(0),
  minimum_order_quantity: z
    .number()
    .min(1, "Minimum order quantity must be at least 1")
    .default(1),
  weight_per_bag: z
    .number()
    .min(0, "Weight per bag must be positive")
    .optional(),
  dimensions: z.string().optional(),
  shelf_life_months: z
    .number()
    .min(1, "Shelf life must be at least 1 month")
    .default(3),
  storage_requirements: z.string().optional(),
  is_active: z.boolean().default(true),
  technical_specifications: z
    .array(
      z.object({
        key: z.string().min(1, "Specification key is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      brand: "YTL Cement",
      stock_quantity: 0,
      minimum_order_quantity: 1,
      shelf_life_months: 3,
      is_active: true,
      technical_specifications: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "technical_specifications",
  });

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Convert technical_specifications array to JSONB format
      const technicalSpecs = data.technical_specifications?.reduce(
        (acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      const formattedData = {
        ...data,
        category_id: parseInt(data.category_id),
        technical_specifications: technicalSpecs,
      };

      // TODO: Replace with your actual API call
      console.log("Submitting product data:", formattedData);

      // Example API call:
      // const response = await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formattedData),
      // });

      // if (response.ok) {
      //   router.push('/staff/Products');
      // }

      alert("Product created successfully! (This is a demo)");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/Dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/staff/Products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>New Product</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <div className="flex items-center gap-2">
            <Link href="/staff/Products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the basic details of the cement product.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="product_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., OPC53-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., YTL OPC Grade 53" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">
                          Ordinary Portland Cement
                        </SelectItem>
                        <SelectItem value="2">
                          Portland Pozzolan Cement
                        </SelectItem>
                        <SelectItem value="3">Portland Slag Cement</SelectItem>
                        <SelectItem value="4">
                          Rapid Hardening Portland Cement
                        </SelectItem>
                        <SelectItem value="5">
                          Sulphate Resistant Cement
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cement Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPC">
                          Ordinary Portland Cement (OPC)
                        </SelectItem>
                        <SelectItem value="PPC">
                          Portland Pozzolan Cement (PPC)
                        </SelectItem>
                        <SelectItem value="PSC">
                          Portland Slag Cement (PSC)
                        </SelectItem>
                        <SelectItem value="SRC">
                          Sulphate Resistant Cement (SRC)
                        </SelectItem>
                        <SelectItem value="RHPC">
                          Rapid Hardening Portland Cement (RHPC)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Grade 53, Grade 43"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter product description..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
              <CardDescription>
                Enter the technical properties of the cement.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="compressive_strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compressive Strength</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 53 MPa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setting_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setting Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Initial: 30 min, Final: 600 min"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fineness"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fineness</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 225 m²/kg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shelf_life_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelf Life (Months)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="storage_requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Storage Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter storage requirements..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Technical Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Technical Specifications</CardTitle>
              <CardDescription>
                Add custom technical specifications as key-value pairs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end">
                    <FormField
                      control={form.control}
                      name={`technical_specifications.${index}.key`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Specification Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Soundness" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`technical_specifications.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2 mm max" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ key: "", value: "" })}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Specification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Packaging & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Packaging & Pricing</CardTitle>
              <CardDescription>
                Enter packaging details and pricing information.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="package_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Size (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight_per_bag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight per Bag (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 50cm x 80cm x 10cm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_bag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Bag (RM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_per_ton"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Ton (RM)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            parseFloat(e.target.value) || undefined
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Manage stock levels and ordering constraints.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimum_order_quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Product</FormLabel>
                        <FormDescription>
                          This product will be visible to customers when active.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/staff/Products">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
