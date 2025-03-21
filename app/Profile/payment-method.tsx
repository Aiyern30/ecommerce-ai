"use client";

import { useState } from "react";
import { Plus, Trash2, CreditCard, Badge } from "lucide-react";

import { updateUserPaymentMethods } from "@/lib/user-actions";
import { PaymentMethod } from "@/type/user";
import { Card, CardContent, Button } from "@/components/ui";

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
}

export default function PaymentMethods({
  paymentMethods = [],
}: PaymentMethodsProps) {
  const [isAddingPayment, setIsAddingPayment] = useState<boolean>(false);
  console.log("isAddingPayment", isAddingPayment);
  const handleAddPayment = () => {
    setIsAddingPayment(true);
    // In a real app, this would open a payment form or redirect to a payment provider
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      const updatedPaymentMethods = paymentMethods.filter(
        (method) => method.id !== paymentId
      );
      await updateUserPaymentMethods(updatedPaymentMethods);
      // In a real app, you would refresh the data here
    }
  };

  const handleSetDefault = async (paymentId: string) => {
    const updatedPaymentMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === paymentId,
    }));

    await updateUserPaymentMethods(updatedPaymentMethods);
    // In a real app, you would refresh the data here
  };

  if (paymentMethods.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No payment methods saved</h3>
        <p className="text-muted-foreground mb-6">
          Add a payment method to speed up checkout.
        </p>
        <Button onClick={handleAddPayment}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Payment Methods</h3>
        <Button onClick={handleAddPayment}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment Method
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="relative">
            <CardContent className="pt-6">
              {method.isDefault && (
                <Badge className="absolute top-2 right-2">Default</Badge>
              )}

              <div className="flex items-center gap-3">
                <div className="bg-muted rounded-md p-2">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">
                    {method.cardType} •••• {method.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                {!method.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(method.id)}
                  >
                    Set as Default
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePayment(method.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          Your payment information is stored securely and processed by our
          payment provider. We do not store your full card details on our
          servers.
        </p>
      </div>
    </div>
  );
}
