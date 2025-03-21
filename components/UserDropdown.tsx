import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/";
import { Session } from "next-auth";

interface UserDropdownProps {
  session: Session;
}

export default function UserDropdown({ session }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <Avatar className="h-9 w-9 border-2 border-[#ff7a5c]">
          <AvatarImage src={session.user?.image || undefined} />
          <AvatarFallback>
            {session.user?.name ? session.user.name.charAt(0) : "U"}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border p-2">
          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Profile
          </Link>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
