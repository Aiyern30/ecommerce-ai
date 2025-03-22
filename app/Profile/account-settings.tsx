"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Button,
  //   Checkbox,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/";
import {
  Separator,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/";
import { updateUserProfile, updateUserPassword } from "@/lib/user-actions";
import {
  UserDetails,
  ProfileFormValues,
  PasswordFormValues,
  //   UserPreferences,
} from "@/type/user";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required." }),
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// const notificationSchema = z.object({
//   emailNotifications: z.boolean().default(true),
//   smsNotifications: z.boolean().default(false),
//   marketingEmails: z.boolean().default(true),
//   orderUpdates: z.boolean().default(true),
//   promotions: z.boolean().default(true),
// });

interface AccountSettingsProps {
  user: Partial<UserDetails>;
}

export default function AccountSettings({ user = {} }: AccountSettingsProps) {
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  //   const notificationForm = useForm<UserPreferences>({
  //     resolver: zodResolver(notificationSchema),
  //     defaultValues: {
  //       emailNotifications: user.preferences?.emailNotifications ?? true,
  //       smsNotifications: user.preferences?.smsNotifications ?? false,
  //       marketingEmails: user.preferences?.marketingEmails ?? true,
  //       orderUpdates: user.preferences?.orderUpdates ?? true,
  //       promotions: user.preferences?.promotions ?? true,
  //     },
  //   });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await updateUserProfile(data);
      alert("Profile updated successfully!");
      // In a real app, you would refresh the data here
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsSubmitting(true);
    try {
      await updateUserPassword(data);
      alert("Password updated successfully!");
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Failed to update password:", error);
      alert("Failed to update password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  //   const onNotificationSubmit = async (data: UserPreferences) => {
  //     setIsSubmitting(true);
  //     try {
  //       await updateUserProfile({ preferences: data });
  //       alert("Notification preferences updated successfully!");
  //     } catch (error) {
  //       console.error("Failed to update notification preferences:", error);
  //       alert("Failed to update notification preferences. Please try again.");
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

  return (
    <div>
      <h3 className="text-lg font-medium mb-6">Account Settings</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 pt-4">
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the email you use to log in to your account.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for order updates and account recovery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Delete Account</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </TabsContent>

        <TabsContent value="password" className="space-y-6 pt-4">
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        {/* <TabsContent value="notifications" className="space-y-6 pt-4">
          <Form {...notificationForm}>
            <form
              onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
              className="space-y-4"
            >
              <div className="space-y-4">
                <h4 className="font-medium">Communication Preferences</h4>

                <FormField
                  control={notificationForm.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Email Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications via email.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationForm.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>SMS Notifications</FormLabel>
                        <FormDescription>
                          Receive notifications via text message.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Email Preferences</h4>

                <FormField
                  control={notificationForm.control}
                  name="orderUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Order Updates</FormLabel>
                        <FormDescription>
                          Receive updates about your orders.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationForm.control}
                  name="promotions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Promotions and Deals</FormLabel>
                        <FormDescription>
                          Receive information about promotions, sales, and
                          deals.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationForm.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Marketing Emails</FormLabel>
                        <FormDescription>
                          Receive marketing emails about new products and
                          features.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Preferences"}
              </Button>
            </form>
          </Form>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
