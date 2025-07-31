// components/auth/AuthProviderButtons.tsx
"use client";
import { supabase } from "@/lib/supabase/browserClient";
import { Button } from "@/components/ui/";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Clean SVG icon components for brand icons
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const azureIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11.4 11.4H2V2h9.4v9.4z" fill="#F25022" />
    <path d="M22 11.4h-9.4V2H22v9.4z" fill="#7FBA00" />
    <path d="M11.4 22H2v-9.4h9.4V22z" fill="#00A4EF" />
    <path d="M22 22h-9.4v-9.4H22V22z" fill="#FFB900" />
  </svg>
);

const AppleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GitHubIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const DiscordIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// Base auth button component
interface AuthButtonProps {
  provider: "google" | "azure" | "apple" | "github" | "facebook" | "discord";
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mode?: "signin" | "signup";
  className?: string;
}

const AuthButton = ({
  provider,
  isLoading,
  setIsLoading,
  mode = "signin",
  className = "",
}: AuthButtonProps) => {
  const [localLoading, setLocalLoading] = useState(false);

  const providerConfig = {
    google: {
      name: "Google",
      icon: GoogleIcon,
      bgColor: "bg-white hover:bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-300",
    },
    azure: {
      name: "azure",
      icon: azureIcon,
      bgColor: "bg-white hover:bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-300",
    },
    apple: {
      name: "Apple",
      icon: AppleIcon,
      bgColor: "bg-black hover:bg-gray-800",
      textColor: "text-white",
      borderColor: "border-black",
    },
    github: {
      name: "GitHub",
      icon: GitHubIcon,
      bgColor: "bg-gray-900 hover:bg-gray-800",
      textColor: "text-white",
      borderColor: "border-gray-900",
    },
    facebook: {
      name: "Facebook",
      icon: FacebookIcon,
      bgColor: "bg-[#1877F2] hover:bg-[#166FE5]",
      textColor: "text-white",
      borderColor: "border-[#1877F2]",
    },
    discord: {
      name: "Discord",
      icon: DiscordIcon,
      bgColor: "bg-[#5865F2] hover:bg-[#4752C4]",
      textColor: "text-white",
      borderColor: "border-[#5865F2]",
    },
  };

  const config = providerConfig[provider];
  const IconComponent = config.icon;
  const loading = isLoading || localLoading;

  const handleAuth = async () => {
    if (loading) return;

    setLocalLoading(true);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error(`${config.name} auth error:`, error.message);
        // You might want to show a toast notification here
      }
    } catch (err) {
      console.error(`${config.name} auth error:`, err);
    } finally {
      setLocalLoading(false);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAuth}
      disabled={loading}
      className={`
        w-full h-12 flex items-center justify-center gap-3 font-medium rounded-lg border transition-all duration-200
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        disabled:opacity-50 disabled:cursor-not-allowed
        dark:border-gray-600 dark:hover:border-gray-500
        ${className}
      `}
      variant="outline"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <IconComponent size={20} />
      )}
      <span>
        {loading
          ? `Connecting...`
          : `${mode === "signin" ? "Sign in" : "Sign up"} with ${config.name}`}
      </span>
    </Button>
  );
};

// Individual provider components for easier imports
export const GoogleAuthButton = (props: Omit<AuthButtonProps, "provider">) => (
  <AuthButton {...props} provider="google" />
);

export const AzureAuthButton = (props: Omit<AuthButtonProps, "provider">) => (
  <AuthButton {...props} provider="azure" />
);

export const AppleAuthButton = (props: Omit<AuthButtonProps, "provider">) => (
  <AuthButton {...props} provider="apple" />
);

export const GitHubAuthButton = (props: Omit<AuthButtonProps, "provider">) => (
  <AuthButton {...props} provider="github" />
);

export const FacebookAuthButton = (
  props: Omit<AuthButtonProps, "provider">
) => <AuthButton {...props} provider="facebook" />;

export const DiscordAuthButton = (props: Omit<AuthButtonProps, "provider">) => (
  <AuthButton {...props} provider="discord" />
);

// All providers component for easy use
export const AllAuthProviders = ({
  isLoading,
  setIsLoading,
  mode = "signin",
  providers = ["google", "azure", "apple", "github"],
}: {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  mode?: "signin" | "signup";
  providers?: Array<
    "google" | "azure" | "apple" | "github" | "facebook" | "discord"
  >;
}) => (
  <div className="space-y-3">
    {providers.includes("google") && (
      <GoogleAuthButton
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mode={mode}
      />
    )}
    {providers.includes("azure") && (
      <AzureAuthButton
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mode={mode}
      />
    )}
    {providers.includes("apple") && (
      <AppleAuthButton
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mode={mode}
      />
    )}
    {providers.includes("github") && (
      <GitHubAuthButton
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mode={mode}
      />
    )}
    {providers.includes("facebook") && (
      <FacebookAuthButton
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mode={mode}
      />
    )}
    {providers.includes("discord") && (
      <DiscordAuthButton
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        mode={mode}
      />
    )}
  </div>
);
