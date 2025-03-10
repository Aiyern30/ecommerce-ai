import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { NotificationsHeader } from "./NotificationHeader";
import { NotificationsList } from "./NotificationList";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto mb-4">
      <NotificationsHeader />

      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="grid w-full grid-cols-4 md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <NotificationsList filter="all" />
        </TabsContent>
        <TabsContent value="orders">
          <NotificationsList filter="order" />
        </TabsContent>
        <TabsContent value="promotions">
          <NotificationsList filter="promotion" />
        </TabsContent>
        <TabsContent value="system">
          <NotificationsList filter="system" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
