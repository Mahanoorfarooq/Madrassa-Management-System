import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SuperAdminAuth() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/super-admin-unlock");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Head>
        <title>سپر ایڈمن تصدیق</title>
      </Head>
    </div>
  );
}
