import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/login");
    }, 2200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightBg">
      <div className="text-center">
        <div className="flex items-center justify-center mb-12">
          <span className="text-5xl">🕌</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8">
          جامعہ مینجمنٹ سسٹم
        </h1>
        <p className="text-sm text-gray-600">لوڈ ہو رہا ہے…</p>
      </div>
    </div>
  );
}
