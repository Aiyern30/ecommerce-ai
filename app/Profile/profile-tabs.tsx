"use client";

import { useState } from "react";
import OrderHistory from "./order-history";
import AccountSettings from "./account-settings";
import WishlistItems from "./wishlist-items";
import {
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { UserDetails } from "@/type/user";
import PaymentMethods from "./payment-method";
import SavedAddresses from "./saved-address";

interface ProfileTabsProps {
  userDetails: Partial<UserDetails>;
}

export default function ProfileTabs({ userDetails }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("orders");

  return (
    <Tabs
      defaultValue="orders"
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
        <TabsTrigger value="orders">Orders</TabsTrigger>
        <TabsTrigger value="addresses">Addresses</TabsTrigger>
        <TabsTrigger value="payments">Payments</TabsTrigger>
        <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <Card className="mt-4 p-4">
        <TabsContent value="orders" className="mt-0">
          <OrderHistory orders={userDetails?.orders || []} />
        </TabsContent>

        <TabsContent value="addresses" className="mt-0">
          <SavedAddresses addresses={userDetails?.addresses || []} />
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          <PaymentMethods paymentMethods={userDetails?.paymentMethods || []} />
        </TabsContent>

        <TabsContent value="wishlist" className="mt-0">
          <WishlistItems wishlist={userDetails?.wishlist || []} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <AccountSettings user={userDetails || {}} />
        </TabsContent>
      </Card>
    </Tabs>
  );
}
