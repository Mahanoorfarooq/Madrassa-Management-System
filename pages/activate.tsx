import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import axios from "axios";

export default function ActivatePage() {
    const [licenseKey, setLicenseKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleActivate = async () => {
        if (!licenseKey) {
            setError("براہ کرم لائسنس کی درج کریں");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.post("/api/license/activate", { licenseKey });
            if (resp.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "لائسنس کی غلط ہے یا ایکسپائر ہو چکی ہے");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
            <Head>
                <title>سافٹ ویئر ایکٹیویشن | Itqanify</title>
            </Head>

            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `url("/login-bg.png")`,
                    backgroundSize: '600px',
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center'
                }}
            ></div>

            <div className="w-full max-w-[380px] z-10 p-4">
                <div className="bg-white rounded-[2rem] shadow-2xl flex flex-col items-stretch overflow-hidden">

                    {/* Orange Header Section */}
                    <div className="bg-secondary pt-2 pb-4 flex flex-col items-center text-white relative overflow-hidden">
                        <div className="relative w-64 h-64 -my-10">
                            <Image
                                src="/logo-new.png"
                                alt="Logo"
                                layout="fill"
                                objectFit="contain"
                                className="drop-shadow-sm invert brightness-0"
                            />
                        </div>
                        <p className="text-[10px] opacity-90 font-urdu text-center leading-relaxed max-w-[240px] -mt-2 relative z-10" style={{ fontFamily: 'Noto Nastaliq Urdu, serif' }}>
                            سافٹ ویئر ایکٹیویشن جاری رکھنے کے لیے درست لائسنس کی درج کریں
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-[10px] px-2 py-1.5 rounded text-right border border-red-100 font-urdu">
                                {error} ⚠️
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 text-green-600 text-[10px] px-4 py-3 rounded-lg text-center border border-green-100 font-urdu">
                                سافٹ ویئر کامیابی سے ایکٹیویٹ ہو گیا ہے! ری ڈائریکٹ کیا جا رہا ہے...
                            </div>
                        )}

                        {!success && (
                            <>
                                <div className="relative">
                                    <label className="block text-right text-[10px] font-semibold text-gray-400 mb-1 absolute -top-2 right-4 bg-white px-1 font-urdu z-10">
                                        لائسنس کی
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="XXXX-XXXX-XXXX-XXXX"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-center tracking-widest focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all placeholder:text-slate-300 font-urdu"
                                        value={licenseKey}
                                        onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                                    />
                                </div>

                                <button
                                    onClick={handleActivate}
                                    disabled={loading}
                                    className="w-full bg-secondary hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-200 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <span className="font-urdu text-base">ایکٹیویٹ کریں</span>
                                    )}
                                </button>
                            </>
                        )}

                        <div className="pt-2 text-center">
                            <p className="text-slate-400 text-xs font-urdu opacity-80">Powered by Itqanify 2026</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
