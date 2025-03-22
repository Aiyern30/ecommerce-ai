"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const StaffPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return null;
};

export default StaffPage;
