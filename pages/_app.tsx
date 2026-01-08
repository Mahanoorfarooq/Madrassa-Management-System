import type { AppProps } from "next/app";
import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlOrMeta && e.shiftKey && (e.key === "H" || e.key === "h")) {
        router.push("/super-admin/auth").catch(() => window.location.reload());
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div className="font-urdu min-h-screen">
      <Component {...pageProps} />
    </div>
  );
}
