import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DepositDetail = ({ deposit }) => {
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [imageSrc, setImageSrc] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [showLottieRefId, setShowLottieRefId] = useState(false);
    const [showLottieSn, setShowLottieSn] = useState(false);
    const [lottie, setLottie] = useState(false);

    // useEffect(() => {
    //     if (deposit.status === "pending" && deposit.expires_at) {
    //         const updateTimeLeft = () => {
    //             const timeDiff = new Date(deposit.expires_at) - new Date();
    //             if (timeDiff <= 0) {
    //                 setTimeLeft("Expired");

    //                 // Kirim request ke backend saat expired
    //                 fetch("/deposit/check-expired", {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json",
    //                         "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
    //                     },
    //                 });
    //             } else {
    //                 const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    //                 const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    //                 const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    //                 setTimeLeft(
    //                     `${hours.toString().padStart(2, "0")}:${minutes
    //                         .toString()
    //                         .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    //                 );
    //             }
    //         };

    //         updateTimeLeft();
    //         const interval = setInterval(updateTimeLeft, 1000);
    //         return () => clearInterval(interval);
    //     }
    // }, [deposit.status, deposit.expires_at]);
    useEffect(() => {
        if (deposit.status === "pending" && deposit.expires_at) {
            const updateTimeLeft = () => {
                const timeDiff = new Date(deposit.expires_at) - new Date();
                if (timeDiff <= 0) {
                    setTimeLeft("Expired");

                    // Kirim request ke backend saat expired
                    fetch("/deposit/check-expired", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                        },
                    }).then(() => {
                        // Setelah server merespon, reload halaman
                        location.reload();
                    });
                } else {
                    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                    setTimeLeft(
                        `${hours.toString().padStart(2, "0")}:${minutes
                            .toString()
                            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
                    );
                }
            };

            updateTimeLeft();
            const interval = setInterval(updateTimeLeft, 1000);
            return () => clearInterval(interval);
        }
    }, [deposit.status, deposit.expires_at]);



    const formatRupiah = (amount) => {
        const formattedAmount = parseInt(amount).toLocaleString('id-ID'); // Convert to integer and format with commas
        return `Rp${formattedAmount}`; // Remove space after 'Rp'
    };

    const formattedDate = new Date(deposit.created_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const formattedExpDate = new Date(deposit.expires_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const formatPaymentMethod = (method) => {
        if (!method) return "";
        return method
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleCopy = (textToCopy, setLottie) => {
        navigator.clipboard.writeText(textToCopy);
        setLottie(true);
        setTimeout(() => setLottie(false), 1500);
    };

    const handleCopyAcc = (textToCopy, setLottie) => {
        navigator.clipboard.writeText(textToCopy);
        setLottie(true);
        setTimeout(() => setLottie(false), 1500);
    };

    const handleConfirm = (id) => {
        if (confirm("Are you sure you want to confirm this deposit?")) {
            setLoading(true);
            setLoadingId(id);

            fetch(`/deposit/confirm/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({}),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        window.location.reload();  // Tampilkan pesan sukses
                    } else {
                        alert(`Konfirmasi gagal: tidak ditemukan data yang sesuai`);  // Tampilkan pesan gagal
                    }
                })
                .catch((error) => {
                    alert('Terjadi kesalahan: ' + error.message);
                })
                .finally(() => {
                    setLoading(false);
                    setLoadingId(null);
                });
        }
    };

    const handleImageClick = (url) => {
        setImageSrc(url);
        setIsImageOpen(true);
    };

    const closeImage = () => {
        setIsImageOpen(false);
        setImageSrc("");
    };

    const [uploadingId, setUploadingId] = useState(null);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const handleUploadProof = (id, file) => {
        if (!file) return;

        setUploadingId(id);

        const formData = new FormData();
        formData.append("proof_of_payment", file);

        fetch(`/deposit/upload-proof/${id}`, {
            method: "POST",
            body: formData,
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Proof of payment uploaded successfully!");
                    window.location.href = `/deposit`; // arahkan ke halaman daftar deposit
                } else {
                    alert("Failed to upload proof of payment.");
                }
            })
            .catch((error) => {
                console.error("Error uploading proof:", error);
                alert("An error occurred while uploading proof.");
            })
            .finally(() => setUploadingId(null));
    };

    return (
        <>
            <Head title="Detail Deposit" />
            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
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
                            Detail Deposit
                        </div>
                    </div>
                </header>

                {/* Card */}
                <main className="w-full w-max-[500px] flex flex-col space-y-3 mt-12 [@media(max-width:277px)]:mt-[76px] p-4 bg-main-white">


                    {/* Pesan saat status Pending */}
                    {deposit.status === "pending" && (
                        <div className="w-full text-justify bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 text-sm rounded-xl">
                            Pastikan melakukan pembayaran deposit sebelum batas pembayaran. Jika terdapat kesalahan nominal pembayaran, maka jumlah saldo masuk akan dikurangi 5%.
                        </div>
                    )}

                    {/* bg putih */}
                    <div className="w-full flex flex-col space-y-8 items-center justify-center p-6 rounded-3xl bg-white shadow-md">
                        <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                            <div className="w-full flex justify-center">
                                {deposit.status === "pending" && (
                                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 16 16"
                                            className="w-14 h-14 text-yellow-500"
                                            fill="currentColor"
                                        >
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                        </svg>
                                    </div>
                                )}
                                {deposit.status === "confirmed" && (
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 16 16"
                                            className="w-14 h-14 text-green-500"
                                            fill="currentColor"
                                        >
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                        </svg>
                                    </div>
                                )}
                                {deposit.status !== "pending" && deposit.status !== "confirmed" && (
                                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            className="w-14 h-14 text-red-500"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex justify-center">
                                <span
                                    className={`text-center text-sm font-medium px-4 py-1 rounded-full ${deposit.status === "pending"
                                        ? "text-yellow-700 bg-yellow-100"
                                        : deposit.status === "confirmed"
                                            ? "text-green-700 bg-green-100"
                                            : "text-red-700 bg-red-100"
                                        }`}
                                >
                                    Transaksi {deposit.status}
                                </span>
                            </div>
                        </div>
                        <div className="w-full h-px bg-gray-600" />
                        <div className="w-full flex flex-col space-y-2 items-start justify-center">
                            <div className="w-full flex flex-col space-y-2 items-start justify-start">
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        ID
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words flex items-center justify-end gap-1">
                                        <div className="flex items-center justify-end gap-2 text-sm font-medium text-right font-utama tracking-[0.1px]">
                                            {showLottieRefId ? (
                                                <div className="w-20">
                                                    <DotLottieReact
                                                        src="https://lottie.host/519fbc9d-1e9b-4ddf-ab6f-14423aabd845/MtxYOaYcV8.lottie"
                                                        autoplay
                                                        loop={false}
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="break-words">{deposit.id}</span>
                                                    <button
                                                        onClick={() => handleCopy(deposit.id, setShowLottieRefId)}
                                                        className="text-main hover:text-blue-700 font-medium"
                                                        aria-label="Copy Ref Id"
                                                    >
                                                        <svg
                                                            className="w-5 h-5 shrink-0"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="24"
                                                            height="24"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M7 9v6a4 4 0 0 0 4 4h4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1v2Z"
                                                                clipRule="evenodd"
                                                            />
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M13 3.054V7H9.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 13 3.054ZM15 3v4a2 2 0 0 1-2 2H9v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Dibuat pada
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formattedDate}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Batas Pembayaran
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm text-red-500 font-medium tracking-[0.1px] break-words">
                                        {deposit.status === "expired" ? formattedExpDate : timeLeft}
                                    </div>

                                </div>
                                <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Metode Pembayaran
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatPaymentMethod(deposit.payment_method)}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Nominal
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiah(deposit.amount)}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Kode Unik
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiah(deposit.unique_code)}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Biaya Admin
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiah(deposit.admin_fee)}
                                    </div>
                                </div>
                                <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Saldo Masuk
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiah(deposit.get_saldo)}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                            <div className="w-full flex flex-row justify-between items-center">
                                <span className="text-md font-utama font-medium text-gray-700">Total Bayar</span>
                                <span className="text-md font-utama font-semibold text-black">
                                    {formatRupiah(deposit.total_pay)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {(deposit.payment_method === "qris_otomatis" ||
                        deposit.payment_method === "qris_dana" ||
                        deposit.payment_method === "qris_shopeepay" ||
                        deposit.payment_method === "qris_ovo" ||
                        deposit.payment_method === "qris_gopay") &&
                        deposit.admin_account ? (
                        <>
                            {/* bg putih */}
                            <div className="w-full flex flex-col space-y-4 items-center justify-center p-4 rounded-3xl bg-white shadow-md">
                                <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                                    <p className="w-full font-utama font-semibold text-xl break-words text-wrap text-center">Rekening QRIS</p>
                                </div>
                                <div className="w-full h-px bg-gray-600" />
                                <img
                                    src={`/storage/${deposit.admin_account}`}
                                    alt={`QRIS ${deposit.payment_method}`}
                                    className="w-64 object-cover cursor-pointer rounded"
                                    onClick={() => handleImageClick(`/storage/${deposit.admin_account}`)}
                                />


                                {/* Tombol Simpan */}
                                <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                    <button
                                        onClick={() => handleImageClick(`/storage/${deposit.admin_account}`)}
                                        className="w-full bg-main text-white p-2 rounded-xl hover:bg-blue-700 transition"
                                    >
                                        PERBESAR GAMBAR
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        deposit.admin_account && (
                            <>
                                {/* bg putih */}
                                <div className="w-full flex flex-col space-y-4 items-center justify-center p-4 rounded-3xl bg-white shadow-md">
                                    <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                                        <p className="w-full font-utama font-semibold text-xl break-words text-wrap text-center">Rekening Pembayaran</p>
                                    </div>
                                    <div className="w-full h-px bg-gray-600" />
                                    <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                                        {lottie ? (
                                            <div className="w-full flex items-center justify-center">
                                                <div className="w-20">
                                                    <DotLottieReact
                                                        src="https://lottie.host/519fbc9d-1e9b-4ddf-ab6f-14423aabd845/MtxYOaYcV8.lottie"
                                                        autoplay
                                                        loop={false}
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="w-full font-utama font-semibold text-xl break-words text-wrap text-center">
                                                {deposit.admin_account}
                                            </p>
                                        )}

                                    </div>

                                    {/* Tombol Salin Nomor Rekening */}
                                    <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                        <button
                                            onClick={() => handleCopyAcc(deposit.admin_account, setLottie)}
                                            className="w-full bg-main text-white p-2 rounded-xl hover:bg-blue-700 transition"
                                        >
                                            SALIN NOMOR REKENING
                                        </button>
                                    </div>
                                </div>
                            </>
                        )
                    )}

                    {/* Unggah bukti bayar */}
                    <div className="w-full flex flex-col space-y-4 items-center justify-center p-4 rounded-3xl bg-white shadow-md">
                        <div className="w-full flex flex-col space-y-4 items-center justify-center">
                            <p className="w-full font-utama font-semibold text-xl text-center break-words">
                                Unggah Bukti Pembayaran
                            </p>
                        </div>
                        <div className="w-full h-px bg-gray-600" />

                        {deposit.proof_of_payment ? (
                            <div className="w-full flex flex-col items-center justify-center space-y-4">
                                <img
                                    src={`/proof-of-payment/${deposit.id}`}
                                    alt="Proof of Payment"
                                    className="w-64 object-cover rounded cursor-pointer"
                                    onClick={() => handleImageClick(`/proof-of-payment/${deposit.id}`)}
                                />
                                {deposit.status === "pending" &&
                                    (!deposit.expires_at || new Date(deposit.expires_at) > new Date()) && (
                                        <>
                                            <label
                                                htmlFor="upload-proof"
                                                className="w-full text-center bg-main text-white py-2 px-4 rounded-xl hover:bg-blue-700 cursor-pointer transition text-sm"
                                            >
                                                GANTI BUKTI PEMBAYARAN
                                            </label>
                                            <input
                                                id="upload-proof"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleUploadProof(deposit.id, e.target.files[0])}
                                                className="hidden"
                                                disabled={uploadingId === deposit.id}
                                            />
                                        </>
                                    )}
                            </div>
                        ) : deposit.status === "confirmed" || new Date(deposit.expires_at) <= new Date() ? (
                            <p className="text-gray-400 text-center">N/A</p>
                        ) : deposit.payment_method === "qris_otomatis" ? (
                            <button
                                onClick={() => handleConfirm(deposit.id)}
                                className="w-full bg-main text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition"
                                disabled={loading || loadingId === deposit.id}
                            >
                                {loading && loadingId === deposit.id ? "MENGKONFIRMASI..." : "KONFIRMASI DEPOSIT"}
                            </button>
                        ) : (
                            <div className="w-full flex flex-col items-center justify-center space-y-2">
                                <label
                                    htmlFor="upload-proof"
                                    className="w-full text-center bg-main text-white py-2 px-4 rounded-xl hover:bg-blue-700 cursor-pointer transition text-sm"
                                >
                                    UNGGAH BUKTI PEMBAYARAN
                                </label>
                                <input
                                    id="upload-proof"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleUploadProof(deposit.id, e.target.files[0])}
                                    className="hidden"
                                    disabled={uploadingId === deposit.id}
                                />
                                {uploadingId === deposit.id && (
                                    <p className="text-sm text-gray-500 text-center">Sedang mengunggah...</p>
                                )}
                            </div>
                        )}
                    </div>

                </main>
            </div>
            {isImageOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="relative">
                        <button
                            onClick={closeImage}
                            className="absolute top-0 right-0 text-white text-xl bg-red-500 rounded-full px-3 py-1 m-2"
                        >
                            &times;
                        </button>
                        <img src={imageSrc} alt="Preview" className="max-w-full max-h-[80vh] rounded-lg shadow-lg" />
                    </div>
                </div>
            )}
        </>
    );
};

export default DepositDetail;
