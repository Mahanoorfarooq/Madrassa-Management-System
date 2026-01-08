import { useState } from "react";
import Head from "next/head";
import { Key, ShieldCheck } from "lucide-react";
import { useRouter } from "next/router";

export default function SuperAdminAuth() {
    const [key, setKey] = useState("");
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleVerify = async () => {
        const resp = await fetch("/api/super-admin/verify-master", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key })
        });

        if (resp.ok) {
            router.push("/super-admin");
        } else {
            setError(true);
            setKey("");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Head>
                <title>سپر ایڈمن تصدیق</title>
            </Head>

            <div className="w-full max-w-[400px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-saPrimary p-10 text-white text-center">
                    <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-secondary animate-bounce" />
                    <h1 className="text-2xl font-black font-urdu">سپر ایڈمن تصدیق</h1>
                    <p className="text-white/60 text-xs font-urdu mt-2">جاری رکھنے کے لیے ماسٹر کی درج کریں</p>
                </div>

                <div className="p-10 space-y-6">
                    <div className="relative">
                        <label className="block text-right text-[10px] font-black text-slate-400 mb-2 font-urdu mr-2">ماسٹر کی</label>
                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={key}
                            onChange={(e) => { setKey(e.target.value); setError(false); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className={`w-full border-2 ${error ? 'border-red-500' : 'border-slate-100'} rounded-2xl px-5 py-4 text-center tracking-[0.5em] focus:outline-none focus:border-secondary transition-all font-bold text-saPrimary bg-slate-50`}
                        />
                        {error && <p className="text-[10px] text-red-500 text-right mt-2 font-urdu pr-2">غلط ماسٹر کی درج کی گئی ہے ⚠️</p>}
                    </div>

                    <button
                        onClick={handleVerify}
                        className="w-full bg-saPrimary hover:bg-slate-800 text-white font-black py-5 rounded-[1.5rem] shadow-xl transition-all font-urdu text-base active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span>تصدیق کریں</span>
                        <Key className="h-5 w-5 text-secondary" />
                    </button>
                </div>
            </div>
        </div>
    );
}
