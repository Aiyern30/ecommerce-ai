import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white shadow-md p-4 rounded-lg flex flex-col items-center text-center">
        <p>
          <strong>Name:</strong> {session.user?.name}
        </p>
        <p>
          <strong>Email:</strong> {session.user?.email}
        </p>
        {session.user?.image ? (
          <div className="relative w-24 h-24 mt-4">
            <Image
              src={session.user.image}
              alt="Profile Picture"
              fill
              className="rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-24 h-24 mt-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>
    </div>
  );
}
