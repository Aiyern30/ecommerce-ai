"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { getUserDetails } from "@/lib/user";
import { UserDetails } from "@/type/user";

const HEADER_HEIGHT = 64; // px, adjust if your header is taller

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "done">("input");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    if (error) {
      setError(error.message);
    } else {
      setStep("done");
      // Optionally, refresh user data here
    }
  };

  useEffect(() => {
    if (user === null) {
      router.replace("/login");
    } else if (user) {
      (async () => {
        const details = await getUserDetails(user.email as string);
        setUserDetails(details as UserDetails);
        setLoading(false);
      })();
    }
  }, [user, router]);

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`min-h-[calc(100vh-${HEADER_HEIGHT}px)] flex items-center justify-center bg-gradient-to-br from-[#fff5f3] to-gray-100 dark:from-gray-900 dark:to-gray-800`}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 flex flex-col items-center">
        {/* Avatar */}
        {user.user_metadata?.picture || user.user_metadata?.avatar_url ? (
          <div className="relative w-28 h-28 mb-4">
            <Image
              src={user.user_metadata.picture || user.user_metadata.avatar_url}
              alt="Profile Picture"
              fill
              className="rounded-full object-cover border-4 border-[#ff7a5c]"
              priority
            />
          </div>
        ) : (
          <div className="w-28 h-28 mb-4 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
            <span className="text-3xl font-bold">
              {user.user_metadata?.full_name?.charAt(0) ||
                user.user_metadata?.name?.charAt(0) ||
                user.email?.charAt(0) ||
                "?"}
            </span>
          </div>
        )}

        {/* Name, Email, Role */}
        <h2 className="text-2xl font-semibold mb-1">
          {user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-1">{user.email}</p>
        <p className="text-sm text-gray-400 mb-4">
          Role: {user.user_metadata?.role || user.role || "User"}
        </p>

        {/* Member Since */}
        {userDetails?.memberSince && (
          <p className="text-sm text-muted-foreground mb-4">
            Member since{" "}
            {new Date(userDetails.memberSince).toLocaleDateString()}
          </p>
        )}

        {/* Useful Details */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#fff5f3] dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Loyalty Points</span>
            <span className="font-bold text-lg">
              {userDetails?.loyaltyPoints || 0}
            </span>
          </div>
          <div className="bg-[#fff5f3] dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Reward Level</span>
            <span className="font-bold text-lg">
              {userDetails?.rewardLevel || "Bronze"}
            </span>
          </div>
          <div className="bg-[#fff5f3] dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Total Orders</span>
            <span className="font-bold text-lg">
              {userDetails?.orders?.length || 0}
            </span>
          </div>
          <div className="bg-[#fff5f3] dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm">Provider</span>
            <span className="font-bold text-lg">
              {user.app_metadata?.provider || "email"}
            </span>
          </div>
        </div>

        {/* Phone Section */}
        <div className="w-full flex flex-col items-center mb-2">
          <span className="text-gray-500 text-sm mb-1">Phone Number</span>
          {user.user_metadata?.phone_verified ? (
            <span className="font-medium">{user.phone}</span>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              {step === "input" && (
                <>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input input-bordered w-full"
                  />
                  <button
                    className="px-4 py-2 rounded-full bg-[#ff7a5c] text-white hover:bg-[#ff6a4c] transition"
                    onClick={handleSendOtp}
                  >
                    Send OTP
                  </button>
                </>
              )}
              {step === "otp" && (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input input-bordered w-full"
                  />
                  <button
                    className="px-4 py-2 rounded-full bg-[#ff7a5c] text-white hover:bg-[#ff6a4c] transition"
                    onClick={handleVerifyOtp}
                  >
                    Verify OTP
                  </button>
                </>
              )}
              {step === "done" && (
                <span className="text-green-600">Phone number verified!</span>
              )}
              {error && <span className="text-red-500 text-sm">{error}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
