// import { useState, useEffect } from "react";
// import { Head, router } from '@inertiajs/react';

// export default function CheckoutPage({ product, balance }) {
//     const [promoCode, setPromoCode] = useState("");
//     const [total, setTotal] = useState(product.price);
//     const [promoMessage, setPromoMessage] = useState("");
//     const [destinationId, setDestinationId] = useState("Tidak tersedia");
//     const [loading, setLoading] = useState(false);
//     const [password, setPassword] = useState("");
//     const [errorMessage, setErrorMessage] = useState("");
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [showBalance, setShowBalance] = useState(false);

//     useEffect(() => {
//         const params = new URLSearchParams(window.location.search);
//         const customerNo = params.get("customerNo");
//         const phone = params.get("phone");
//         setDestinationId(customerNo || phone || "Tidak tersedia");
//     }, []);

//     const applyPromoCode = () => {
//         setPromoMessage("Saat ini belum ada promo tersedia.");
//         setTotal(product.price);
//     };

//     const totalBayar = Number(total) + Number(product.admin || 0) - Number(product.discount || 0);

//     const handleBayarClick = () => {
//         if (balance < totalBayar) {
//             setErrorMessage("Saldo tidak mencukupi untuk melakukan transaksi.");
//             return;
//         }
//         setIsModalOpen(true);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (loading) return; // Mencegah double klik
//         setErrorMessage("");

//         if (!product || destinationId === "Tidak tersedia") {
//             setErrorMessage("Mohon lengkapi nomor pelanggan dan pilih produk.");
//             return;
//         }

//         if (balance < totalBayar) {
//             setErrorMessage("Saldo tidak mencukupi untuk melakukan transaksi.");
//             return;
//         }

//         if (!password) {
//             setErrorMessage("Silakan masukkan password untuk melanjutkan.");
//             return;
//         }

//         setLoading(true);

//         try {
//             const verifyResponse = await fetch("/auth/verify-password", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
//                 },
//                 body: JSON.stringify({ password }),
//             });

//             const verifyData = await verifyResponse.json();

//             if (!verifyData.success) {
//                 setErrorMessage("Password salah. Silakan coba lagi.");
//                 setLoading(false);
//                 return;
//             }

//             const transactionResponse = await fetch("/transactions", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
//                 },
//                 body: JSON.stringify({
//                     buyer_sku_code: product.buyer_sku_code,
//                     customer_no: destinationId,
//                     max_price: totalBayar,
//                     price_product: product.price,
//                     testing: false,
//                 }),
//             });

//             // Redirect setelah transaksi selesai (baik sukses atau gagal)
//             router.visit("/history");

//         } catch (error) {
//             console.error("Error:", error);
//             setErrorMessage("Terjadi kesalahan saat mengirim permintaan transaksi.");
//             setLoading(false);
//         }
//     };

//     return (
//         <>
//             <Head title="Checkout" />

//             <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen overflow-auto">
//                 {/* fixed position */}

//                 {/* Header */}
//                 <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
//                     <div className="w-full flex flex-row space-x-4 items-center justify-start">
//                         <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
//                                 <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
//                             </svg>
//                         </button>
//                         <div className="font-utama text-white font-bold text-lg">
//                             Checkout
//                         </div>
//                     </div>
//                 </header>

//                 {/* Card */}
//                 <div className="w-full px-4 py-2 pt-14">
//                     {/* saldo */}
//                     <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow border">
//                         <p className="w-full h-max font-utama font-semibold text-sm text-left flex items-center space-x-2">
//                             <svg className="w-6 h-6 text-main" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
//                                 <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
//                                 <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
//                             </svg>
//                             <span>DompetMu</span>
//                         </p>

//                         <div className="w-max h-max flex flex-row space-x-4 items-center justify-start max-w-[70%]">
//                             <p className="font-utama font-bold text-sm break-words max-w-[150px] overflow-hidden text-ellipsis">
//                                 {showBalance ? `Rp${parseFloat(balance).toLocaleString('id-ID')}` : "••••••••"}
//                             </p>
//                             <button
//                                 onClick={() => setShowBalance(!showBalance)}
//                                 className="text-main hover:text-blue-700"
//                             >
//                                 {showBalance ? (
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         width="26"
//                                         height="26"
//                                         className="bi bi-eye-slash-fill"
//                                         fill="currentColor"
//                                         viewBox="0 0 16 16"
//                                     >
//                                         <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
//                                         <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
//                                     </svg>
//                                 ) : (
//                                     <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         width="26"
//                                         height="26"
//                                         className="bi bi-eye-fill"
//                                         fill="currentColor"
//                                         viewBox="0 0 16 16"
//                                     >
//                                         <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
//                                         <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
//                                     </svg>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 <main className="w-full w-max-[500px] justify-center px-4 py-2 pb-36 bg-main-white">
//                     <div className="w-full flex flex-col items-start justify-center p-4 rounded-lg bg-white shadow-md">
//                         <p className="w-full font-utama font-semibold text-md text-center">Detail Pembayaran</p>
//                         <div className="w-full h-px bg-gray-300 my-3" />
//                         <div className="w-full flex flex-col space-y-2 items-start justify-center">
//                             <div className="w-full flex flex-col space-y-2 items-start justify-start">
//                                 <div className="w-full flex flex-row">
//                                     <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
//                                         Nama Produk
//                                     </div>
//                                     <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
//                                         {product.product_name}
//                                     </div>
//                                 </div>
//                                 <div className="w-full flex flex-row">
//                                     <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
//                                         ID Tujuan
//                                     </div>
//                                     <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
//                                         {destinationId}
//                                     </div>
//                                 </div>
//                                 <div className="w-full flex flex-row">
//                                     <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
//                                         Harga
//                                     </div>
//                                     <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
//                                         Rp{new Intl.NumberFormat("id-ID").format(product.price)}
//                                     </div>
//                                 </div>
//                                 <div className="w-full flex flex-row">
//                                     <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
//                                         Biaya Admin
//                                     </div>
//                                     <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
//                                         Rp{new Intl.NumberFormat("id-ID").format(product.admin || 0)}
//                                     </div>
//                                 </div>
//                                 <div className="w-full flex flex-row">
//                                     <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
//                                         Diskon
//                                     </div>
//                                     <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
//                                         Rp{new Intl.NumberFormat("id-ID").format(product.discount || 0)}
//                                     </div>
//                                 </div>
//                             </div>
//                             <div className="w-full h-px bg-gray-300 my-4" />
//                             <div className="w-full flex flex-row justify-between items-center">
//                                 <span className="w-1/2 text-md font-utama font-medium text-gray-700 break-words">Total Pembayaran</span>
//                                 <span className="w-1/2 text-right text-md font-utama font-semibold text-black break-words">Rp{new Intl.NumberFormat("id-ID").format(totalBayar)}</span>
//                             </div>

//                         </div>
//                     </div>
//                 </main>

//                 <footer className="fixed bottom-0 mt-auto w-full max-w-[500px] px-4 py-2 bg-white shadow-lg border-t rounded-t-xl">
//                     {promoMessage && <p className="my-2 text-red-500 text-sm">{promoMessage}</p>}
//                     <div className="relative w-full h-10">
//                         <input
//                             id="searchInput"
//                             type="text"
//                             className="w-full h-full bg-neutral-100 border-2 border-gray-200 rounded-lg pr-20 pl-3 text-sm focus:ring-0 focus:outline-none placeholder-gray-400"
//                             value={promoCode}
//                             onChange={(e) => setPromoCode(e.target.value)}
//                             placeholder="Masukkan kode promo"
//                         />
//                         <button
//                             onClick={applyPromoCode}
//                             className="absolute right-2 top-1/2 -translate-y-1/2 text-main text-sm px-3 py-1.5 rounded hover:text-blue-700 transition"
//                         >
//                             GUNAKAN
//                         </button>
//                     </div>


//                     <div className="w-full h-px bg-gray-300 my-2" />

//                     <div className="flex flex-row items-center justify-between w-full">
//                         <div className="text-justify">
//                             <p className="text-md text-black font-medium">Total Pembayaran</p>
//                             <p className="text-lg text-main font-bold">
//                                 Rp{new Intl.NumberFormat("id-ID").format(totalBayar)}
//                             </p>
//                         </div>
//                         <button
//                             onClick={handleBayarClick}
//                             disabled={balance < totalBayar}
//                             className={`text-white px-3 py-2 rounded flex items-center gap-2 ${balance < totalBayar ? "bg-gray-400 cursor-not-allowed" : "bg-main hover:bg-blue-700 transition"
//                                 }`}
//                         >
//                             <span className="font-semibold text-sm">{balance < totalBayar ? "Saldo Kurang" : "Bayar"}</span>
//                         </button>
//                     </div>
//                 </footer>

//                 {isModalOpen && (
//                     <div className="fixed bottom-0 left-0 right-0 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//                         <div className="bg-white p-6 rounded shadow-lg w-80">
//                             <h2 className="text-lg font-semibold mb-3">Masukkan Password</h2>
//                             <input
//                                 type="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="w-full border p-2 rounded mb-4"
//                                 placeholder="Masukkan password"
//                             />
//                             {errorMessage && <p className="text-red-500 text-sm mb-2">{errorMessage}</p>}
//                             <div className="flex justify-end space-x-2">
//                                 <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-gray-200 border rounded">
//                                     Batal
//                                 </button>
//                                 <button
//                                     onClick={handleSubmit}
//                                     disabled={loading}
//                                     className={`px-4 py-2 rounded text-white w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//                                         }`}
//                                 >
//                                     {loading ? "Memproses..." : "Konfirmasi"}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }



























import { useState, useEffect } from "react";
import { Head, router } from '@inertiajs/react';

export default function CheckoutPage({ product, balance }) {
    const [promoCode, setPromoCode] = useState("");
    const [total, setTotal] = useState(product.price);
    const [promoMessage, setPromoMessage] = useState("");
    const [destinationId, setDestinationId] = useState("Tidak tersedia");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

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
        if (loading) return; // Mencegah double klik
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

            // Redirect setelah transaksi selesai (baik sukses atau gagal)
            router.visit("/history");

        } catch (error) {
            console.error("Error:", error);
            setErrorMessage("Terjadi kesalahan saat mengirim permintaan transaksi.");
            setLoading(false);
        }
    };

    return (
        <>
            <Head title="Checkout" />

            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen overflow-auto">
                {/* fixed position */}

                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <div className="w-full flex flex-row space-x-4 items-center justify-start">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Checkout
                        </div>
                    </div>
                </header>

                {/* Card */}
                <div className="w-full px-4 py-2 pt-14">
                    {/* saldo */}
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow border">
                        <p className="w-full h-max font-utama font-semibold text-sm text-left flex items-center space-x-2">
                            <svg className="w-6 h-6 text-main" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                            </svg>
                            <span>DompetMu</span>
                        </p>

                        <div className="w-max h-max flex flex-row space-x-4 items-center justify-start max-w-[70%]">
                            <p className="font-utama font-bold text-sm break-words max-w-[150px] overflow-hidden text-ellipsis">
                                {showBalance ? `Rp${parseFloat(balance).toLocaleString('id-ID')}` : "••••••••"}
                            </p>
                            <button
                                onClick={() => setShowBalance(!showBalance)}
                                className="text-main hover:text-blue-700"
                            >
                                {showBalance ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="26"
                                        height="26"
                                        className="bi bi-eye-slash-fill"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="26"
                                        height="26"
                                        className="bi bi-eye-fill"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <main className="w-full w-max-[500px] justify-center px-4 py-2 pb-36 bg-main-white">
                    <div className="w-full flex flex-col items-start justify-center p-4 rounded-lg bg-white shadow-md">
                        <p className="w-full font-utama font-semibold text-md text-center">Detail Pembayaran</p>
                        <div className="w-full h-px bg-gray-300 my-3" />
                        <div className="w-full flex flex-col space-y-2 items-start justify-center">
                            <div className="w-full flex flex-col space-y-2 items-start justify-start">
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Nama Produk
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {product.product_name}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        ID Tujuan
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {destinationId}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Harga
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        Rp{new Intl.NumberFormat("id-ID").format(product.price)}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Biaya Admin
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        Rp{new Intl.NumberFormat("id-ID").format(product.admin || 0)}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Diskon
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        Rp{new Intl.NumberFormat("id-ID").format(product.discount || 0)}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-px bg-gray-300 my-4" />
                            <div className="w-full flex flex-row justify-between items-center">
                                <span className="w-1/2 text-md font-utama font-medium text-gray-700 break-words">Total Pembayaran</span>
                                <span className="w-1/2 text-right text-md font-utama font-semibold text-black break-words">Rp{new Intl.NumberFormat("id-ID").format(totalBayar)}</span>
                            </div>

                        </div>
                    </div>
                </main>

                <footer className="fixed bottom-0 mt-auto w-full max-w-[500px] px-4 py-2 bg-white shadow-lg border-t rounded-t-xl">
                    {promoMessage && <p className="my-2 text-red-500 text-sm">{promoMessage}</p>}
                    <div className="relative w-full h-10">
                        <input
                            id="searchInput"
                            type="text"
                            className="w-full h-full bg-neutral-100 border-2 border-gray-200 rounded-lg pr-20 pl-3 text-sm focus:ring-0 focus:outline-none placeholder-gray-400"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Masukkan kode promo"
                        />
                        <button
                            onClick={applyPromoCode}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-main text-sm px-3 py-1.5 rounded hover:text-blue-700 transition"
                        >
                            GUNAKAN
                        </button>
                    </div>


                    <div className="w-full h-px bg-gray-300 my-2" />

                    <div className="flex flex-row items-center justify-between w-full">
                        <div className="text-justify">
                            <p className="text-md text-black font-medium">Total Pembayaran</p>
                            <p className="text-lg text-main font-bold">
                                Rp{new Intl.NumberFormat("id-ID").format(totalBayar)}
                            </p>
                        </div>
                        <button
                            onClick={handleBayarClick}
                            disabled={balance < totalBayar}
                            className={`text-white px-3 py-2 rounded flex items-center gap-2 ${balance < totalBayar ? "bg-gray-400 cursor-not-allowed" : "bg-main hover:bg-blue-700 transition"
                                }`}
                        >
                            <span className="font-semibold text-sm">{balance < totalBayar ? "Saldo Kurang" : "Bayar"}</span>
                        </button>
                    </div>
                </footer>

                {isModalOpen && (
                    <div className="fixed bottom-0 left-0 right-0 inset-0 bg-black bg-opacity-50 flex items-center justify-center">
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
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-gray-200 border rounded">
                                    Batal
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded text-white w-full ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {loading ? "Memproses..." : "Konfirmasi"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}