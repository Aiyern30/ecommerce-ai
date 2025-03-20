import { auth } from "@/auth";

export default async function middleware() {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
