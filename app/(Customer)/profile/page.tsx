"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { getUserDetails } from "@/lib/user";
import { UserDetails } from "@/type/user";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

const HEADER_HEIGHT = 64; // px, adjust if your header is taller

// Country codes with proper formatting
const countries = [
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+52", name: "Mexico", flag: "🇲🇽" },
  { code: "+54", name: "Argentina", flag: "🇦🇷" },
  { code: "+56", name: "Chile", flag: "🇨🇱" },
  { code: "+57", name: "Colombia", flag: "🇨🇴" },
  { code: "+51", name: "Peru", flag: "🇵🇪" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+420", name: "Czech Republic", flag: "🇨🇿" },
  { code: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "+886", name: "Taiwan", flag: "🇹🇼" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
];

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "done">("input");
  const [error, setError] = useState("");
  const [countryCode, setCountryCode] = useState("+60");
  const [isLoading, setIsLoading] = useState(false);

  const isPhoneValid = phone.length >= 8 && /^\d+$/.test(phone);

  const handleSendOtp = async () => {
    setError("");
    setIsLoading(true);

    const fullPhone = countryCode + phone;

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP.");
      } else {
        setStep("otp");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    setIsLoading(true);

    const fullPhone = countryCode + phone;

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: fullPhone,
          code: otp,
          user_id: user!.id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "OTP verification failed.");
        return;
      }

      if (!user) {
        setError("User not found. Please log in again.");
        return;
      }

      const updateRes = await fetch("/api/update-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, user_id: user.id }),
      });

      if (!updateRes.ok) {
        const result = await updateRes.json();
        setError(result.message || "Failed to update phone.");
        return;
      }

      setStep("done");
      window.location.reload();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    setStep("input");
    setOtp("");
    setError("");
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ff7a5c]"></div>
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
            <span className="font-medium text-green-600">✓ {user.phone}</span>
          ) : (
            <div className="flex flex-col items-center gap-2 w-full">
              {step === "input" && (
                <>
                  <div className="flex gap-2 w-full">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <div className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span className="text-xs">{c.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      className="flex-1"
                      maxLength={15}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={!isPhoneValid || isLoading}
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </Button>
                </>
              )}

              {step === "otp" && (
                <>
                  <div className="text-center mb-2">
                    <p className="text-sm text-gray-600">
                      We sent an OTP to {countryCode}
                      {phone}
                    </p>
                    <button
                      onClick={handleBackToInput}
                      className="text-xs text-[#ff7a5c] hover:underline"
                    >
                      Change number
                    </button>
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full text-center"
                    maxLength={6}
                  />
                  <Button
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6 || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                </>
              )}

              {step === "done" && (
                <div className="text-center">
                  <span className="text-green-600 flex items-center gap-1">
                    ✓ Phone number verified!
                  </span>
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
