import { useForm } from "@inertiajs/react";

export default function AffiliatorForm({ affiliator }) {
    const { data, setData, post, processing, errors } = useForm({
        referral_code: affiliator?.referral_code ?? "",
        affiliate_by: affiliator?.affiliate_by ?? "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("affiliator.save"), {
            onError: (errors) => {
                console.log(errors); // Cek apakah error masuk ke frontend
            }
        });
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Daftar Affiliator</h2>
            <form onSubmit={handleSubmit}>
                {affiliator.affiliate_by_code ? (
                    // Jika sudah punya referral teman, tampilkan input referral sendiri
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Kode Referral Anda</label>
                        <input
                            type="text"
                            className="w-full border px-3 py-2 rounded-md"
                            value={data.referral_code}
                            onChange={(e) => setData("referral_code", e.target.value)}
                            placeholder="Masukkan kode referral Anda"
                        />
                        {errors.referral_code && <p className="text-red-500 text-sm">{errors.referral_code}</p>}
                    </div>
                ) : (
                    // Jika belum punya referral teman, tampilkan input untuk memasukkan kode referral teman
                    <div className="mb-4">
                        <label className="block text-sm font-medium">Kode Referral Teman</label>
                        <input
                            type="text"
                            className="w-full border px-3 py-2 rounded-md"
                            value={data.affiliate_by}
                            onChange={(e) => setData("affiliate_by", e.target.value)}
                            placeholder="Masukkan kode referral teman"
                        />
                        {errors.affiliate_by && <p className="text-red-500 text-sm">{errors.affiliate_by}</p>}
                    </div>
                )}

                <div className="flex justify-between">
                    <button type="button" className="bg-gray-500 text-white px-4 py-2 rounded-md"
                        onClick={() => window.history.back()}>
                        Kembali
                    </button>
                    <button type="submit" disabled={processing}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md">
                        {processing ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </form>
        </div>
    );
}
