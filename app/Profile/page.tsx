import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { authOptions } from "@/auth";
import ProfileTabs from "./profile-tabs";
import { getUserDetails } from "@/lib/user";
import { UserDetails } from "@/type/user";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch additional user details
  const userDetails = (await getUserDetails(
    session.user?.email as string
  )) as UserDetails;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        {/* Profile Summary Card */}
        <div className="bg-card shadow-sm rounded-lg p-6 h-fit">
          <div className="flex flex-col items-center text-center mb-6">
            {session.user?.image ? (
              <div className="relative w-24 h-24 mb-4">
                <Image
                  src={session.user.image || "/placeholder.svg"}
                  alt="Profile Picture"
                  fill
                  className="rounded-full object-cover border-4 border-background"
                  priority
                />
              </div>
            ) : (
              <div className="w-24 h-24 mb-4 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <span className="text-2xl font-bold">
                  {session.user?.name?.charAt(0) ||
                    session.user?.email?.charAt(0) ||
                    "?"}
                </span>
              </div>
            )}
            <h2 className="text-xl font-semibold">{session.user?.name}</h2>
            <p className="text-muted-foreground">{session.user?.email}</p>

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
        <div>
          <ProfileTabs userDetails={userDetails} />
        </div>
      </div>
    </div>
  );
}
