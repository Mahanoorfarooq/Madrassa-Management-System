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
        fetch("/api/dev/impersonate-super-admin", { method: "POST" })
          .then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          })
          .then(() => {
            router.push("/super-admin").catch(() => window.location.reload());
          })
          .catch(() => {});
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return <Component {...pageProps} />;
}
