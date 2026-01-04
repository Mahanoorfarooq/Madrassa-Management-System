import { useEffect } from "react";
import { useRouter } from "next/router";

// Legacy route: redirect any access of /dashboard/teacher to the main teacher portal
export default function LegacyTeacherDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/teacher");
  }, [router]);

  return null;
}
