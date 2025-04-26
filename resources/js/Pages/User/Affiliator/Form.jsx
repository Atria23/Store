import { useForm, Head, router } from "@inertiajs/react";

export default function AffiliatorForm({ affiliator }) {
    const { data, setData, post, processing, errors } = useForm({
        referral_code: affiliator?.referral_code ?? "",
        affiliate_by: affiliator?.affiliate_by ?? "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("affiliator.save"), {
            onError: (errors) => {
                console.log(errors);
            },
            onSuccess: () => router.visit(route("affiliate.dashboard")),
        });
    };

    return (
        <>
            <Head title="Ubah Data Affiliator" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-white">

                {/* Header dengan tombol kembali */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <section className="w-full h-max flex flex-row items-center px-4 py-2 space-x-4">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Program Affiliate
                        </div>
                    </section>
                </div>

                {/* Spacer header */}
                <div className="h-11" />

                {/* Form Section */}
                <section className="w-full flex flex-col space-y-6 items-center justify-center p-4">
                    <div className="w-full h-max flex flex-col space-y-4 mb-6">
                        <img
                            src="/storage/logo_no_bg.png"
                            alt="Logo Muvausa Store"
                            className="w-20 p-1.5 bg-white mx-auto"
                        />
                        {/* section atas */}
                        <section className="w-full h-max flex flex-col items-center space-y-2 mb-6 px-4">
                            <p className="font-utama text-xl font-bold text-center">Ubah Data Affiliator</p>
                            <p className="font-utama text-base font-medium text-gray-600 text-center">
                                Raih Cuan Bersama Muvausa
                            </p>
                        </section>
                        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-4">

                            {affiliator.affiliate_by_code ? (
                                // Jika sudah ada referral teman, isi referral sendiri
                                <div>
                                    <label className="block text-gray-700 mb-1">Kode Referral Anda</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            type="text"
                                            name="referral_code"
                                            value={data.referral_code}
                                            onChange={(e) =>
                                                setData("referral_code", e.target.value.toLowerCase().replace(/\s+/g, ""))
                                            }
                                            placeholder="Masukkan kode referral Anda"
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.referral_code && (
                                        <p className="text-red-500 text-sm mt-1">{errors.referral_code}</p>
                                    )}
                                </div>
                            ) : (
                                // Kalau belum punya referral teman
                                <div>
                                    <label className="block text-gray-700 mb-1">Kode Referral Teman</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            type="text"
                                            name="affiliate_by"
                                            value={data.affiliate_by}
                                            onChange={(e) =>
                                                setData("affiliate_by", e.target.value.toLowerCase().replace(/\s+/g, ""))
                                            }
                                            placeholder="Masukkan kode referral teman"
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.affiliate_by && (
                                        <p className="text-red-500 text-sm mt-1">{errors.affiliate_by}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`w-full text-white p-2 rounded text-sm font-medium transition ${processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                        }`}
                                >
                                    {processing ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>

                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
