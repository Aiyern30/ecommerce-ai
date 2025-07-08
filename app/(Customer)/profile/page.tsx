"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import ProfileTabs from "./profile-tabs";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { getUserDetails } from "@/lib/user";
import { UserDetails } from "@/type/user";

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === null) {
      // Not logged in, redirect to login
      router.replace("/login");
    } else if (user) {
      // Fetch user details
      (async () => {
        const details = await getUserDetails(user.email as string);
        setUserDetails(details as UserDetails);
        setLoading(false);
      })();
    }
  }, [user, router]);

  if (!user || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto my-4">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Profile Summary Card */}
        <div className="bg-card shadow-sm rounded-lg p-6 h-fit">
          <div className="flex flex-col items-center text-center mb-6">
            {user.user_metadata?.picture || user.user_metadata?.avatar_url ? (
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={
                    user.user_metadata.picture || user.user_metadata.avatar_url
                  }
                  alt="Profile Picture"
                  fill
                  className="rounded-full object-cover border-4 border-background"
                  priority
                />
              </div>
            ) : (
              <div className="w-24 h-24 mb-4 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <span className="text-2xl font-bold">
                  {user.user_metadata?.full_name?.charAt(0) ||
                    user.user_metadata?.name?.charAt(0) ||
                    user.email?.charAt(0) ||
                    "?"}
                </span>
              </div>
            )}
            <h2 className="text-xl font-semibold">
              {user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>

            {userDetails?.memberSince && (
              <p className="text-sm text-muted-foreground mt-2">
                Member since{" "}
                {new Date(userDetails.memberSince).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Loyalty Points:</span>
              <span className="font-medium">
                {userDetails?.loyaltyPoints || 0} points
              </span>
            </div>
            <div className="flex justify-between">
              <span>Reward Level:</span>
              <span className="font-medium">
                {userDetails?.rewardLevel || "Bronze"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Orders:</span>
              <span className="font-medium">
                {userDetails?.orders?.length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area with Tabs */}
        <div>{/* <ProfileTabs userDetails={userDetails} /> */}</div>
      </div>
    </div>
  );
}
