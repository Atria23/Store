import { useState, useEffect } from "react";

export default function CheckoutPage({ product, balance }) {
    const [promoCode, setPromoCode] = useState("");
    const [total, setTotal] = useState(product.price);
    const [promoMessage, setPromoMessage] = useState("");
    const [destinationId, setDestinationId] = useState("Tidak tersedia");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const customerNo = params.get("customerNo");
        const phone = params.get("phone");
        setDestinationId(customerNo || phone || "Tidak tersedia");
    }, []);

    const applyPromoCode = () => {
        setPromoMessage("Saat ini belum ada promo tersedia.");
        setTotal(product.price);
    };

    const totalBayar = Number(total) + Number(product.admin || 0) - Number(product.discount || 0);

    const handleBayarClick = () => {
        if (balance < totalBayar) {
            setErrorMessage("Saldo tidak mencukupi untuk melakukan transaksi.");
            return;
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!product || destinationId === "Tidak tersedia") {
            setErrorMessage("Mohon lengkapi nomor pelanggan dan pilih produk.");
            return;
        }

        if (balance < totalBayar) {
            setErrorMessage("Saldo tidak mencukupi untuk melakukan transaksi.");
            return;
        }

        if (!password) {
            setErrorMessage("Silakan masukkan password untuk melanjutkan.");
            return;
        }

        setLoading(true);
        
        try {
            // Kirim password ke backend untuk verifikasi
            const verifyResponse = await fetch("/auth/verify-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                },
                body: JSON.stringify({ password }),
            });
            
            
            const verifyData = await verifyResponse.json();
            
            if (!verifyData.success) {
                setErrorMessage("Password salah. Silakan coba lagi.");
                setLoading(false);
                return;
            }

            // Jika password benar, lanjutkan transaksi
            const transactionResponse = await fetch("/transactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                },
                body: JSON.stringify({
                    buyer_sku_code: product.buyer_sku_code,
                    customer_no: destinationId,
                    max_price: totalBayar,
                    price_product: product.price,
                    testing: false,
                }),
            });
            

            const transactionData = await transactionResponse.json();

            if (transactionData.success) {
                alert(`Transaksi berhasil: ${transactionData.message}`);
            } else {
                setErrorMessage(`Transaksi gagal: ${transactionData.message}`);
            }
        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Terjadi kesalahan saat mengirim permintaan transaksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Checkout</h2>

            <div className="border rounded-lg p-4 shadow-md bg-white">
                <h3 className="text-lg font-semibold">{product.product_name}</h3>
                <p className="text-gray-600">ID Tujuan: {destinationId}</p>
                <p className="text-lg font-bold">Harga: Rp {new Intl.NumberFormat("id-ID").format(product.price)}</p>
                <p className="text-lg">Admin: Rp {new Intl.NumberFormat("id-ID").format(product.admin || 0)}</p>
                <p className="text-lg text-red-500">Diskon: Rp {new Intl.NumberFormat("id-ID").format(product.discount || 0)}</p>
            </div>

            <div className="mt-4">
                <label className="block font-semibold">Total Pembayaran:</label>
                <p>Rp {new Intl.NumberFormat("id-ID").format(totalBayar)}</p>
            </div>

            <div className="mt-4">
    <label className="block font-semibold">Saldo Anda:</label>
    <p className="text-lg font-bold">Rp {new Intl.NumberFormat("id-ID").format(balance)}</p>
</div>

            <div className="mt-4">
                <label className="block font-semibold">Kode Promo:</label>
                <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full border p-2 rounded mt-1"
                    placeholder="Masukkan kode promo"
                />
                <button onClick={applyPromoCode} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Terapkan Kode Promo
                </button>
                {promoMessage && <p className="mt-2 text-red-500 text-sm">{promoMessage}</p>}
            </div>
            <div className="mt-4">

            
<button
    onClick={handleBayarClick}
    disabled={balance < totalBayar}
    className={`w-full px-4 py-2 rounded text-white ${
        balance < totalBayar ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
    }`}
>
    Bayar Sekarang
</button>
                </div>
                {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-80">
                        <h2 className="text-lg font-semibold mb-3">Masukkan Password</h2>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border p-2 rounded mb-4"
                            placeholder="Masukkan password"
                        />
                        {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Konfirmasi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}