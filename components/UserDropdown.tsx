import Link from "next/link";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/";

interface UserDropdownProps {
  session: Session;
}

export default function UserDropdown({ session }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 border-2 border-[#ff7a5c]">
          <AvatarImage src={session.user?.image || undefined} />
          <AvatarFallback>
            {session.user?.name ? session.user.name.charAt(0) : "U"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/Profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="text-red-500 cursor-pointer"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
