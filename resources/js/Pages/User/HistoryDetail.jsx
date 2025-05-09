import { useEffect, useState, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { toPng } from 'html-to-image'; // Import html-to-image
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Receipt from '@/Components/Receipt';

const HistoryDetail = () => {
    const { params, transactions, store } = usePage().props;
    const cardRef = useRef(null); // Ref untuk elemen kartu
    const [transaction, setTransaction] = useState(null);
    const [price, setPrice] = useState(0); // State untuk harga sementara
    const [adminFee, setAdminFee] = useState(0); // State untuk biaya admin sementara
    const [isEditing, setIsEditing] = useState(false); // State untuk toggle mode edit
    const [size, setSize] = useState('kecil'); // default ke kecil
    const [showModal, setShowModal] = useState(false);

    const [storeData, setStoreData] = useState({
        name: "",
        address: "",
        phone_number: "",
        image: "",
    });

    useEffect(() => {
        if (store) {
            setStoreData(store);
        }
    }, [store]);

    const rcMessages = {
        "00": "Transaksi Sukses",
        "01": "Timeout",
        "02": "Transaksi Gagal",
        "03": "Transaksi Pending",
        "40": "Payload Error",
        "50": "Transaksi Tidak Ditemukan",
        "51": "Nomor Tujuan Diblokir",
        "52": "Prefix Tidak Sesuai Operator",
        "53": "Produk Seller Tidak Tersedia",
        "54": "Nomor Tujuan Salah",
        "55": "Produk Gangguan",
        "57": "Jumlah Digit Tidak Sesuai",
        "58": "Sedang Perbaikan",
        "59": "Tujuan di Luar Wilayah",
        "60": "Tagihan Belum Tersedia",
        "62": "Produk Mengalami Gangguan",
        "63": "Tidak Support Transaksi Multi",
        "65": "Limit Transaksi Multi",
        "66": "Sedang Perbaikan Sistem",
        "68": "Stok Habis",
        "71": "Produk Tidak Stabil",
        "72": "Unreg Paket Dulu",
        "73": "Kwh Melebihi Batas",
        "74": "Transaksi Refund",
        "80": "Akun Diblokir Penyedia Layanan",
        "82": "Akun Belum Terverifikasi",
        "84": "Nominal Tidak Valid",
        "85": "Limitasi Transaksi",
        "86": "Limitasi Pengecekan PLN",
    };

    const getResponseMessage = (rc) => rcMessages[rc] || `Transaksi Gagal`;

    const [showLottieRefId, setShowLottieRefId] = useState(false);
    const [showLottieSn, setShowLottieSn] = useState(false);

    const handleCopy = (textToCopy, setLottie) => {
        navigator.clipboard.writeText(textToCopy);
        setLottie(true);
        setTimeout(() => setLottie(false), 1500);
    };

    const ref_id = params.ref_id;

    useEffect(() => {
        if (transactions && Array.isArray(transactions)) {
            const transactionData = transactions.find((t) => t.ref_id === ref_id);
            if (transactionData) {
                setTransaction(transactionData);
            }
        }
    }, [ref_id, transactions]);

    const handleDownload = () => {
        if (cardRef.current) {
            toPng(cardRef.current, { backgroundColor: 'white' })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `Transaction-${transaction?.ref_id}.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((err) => {
                    console.error('Error generating image:', err);
                });
        }
    };

    const updateStatus = (transaction_id) => {
        fetch("/transactions/update-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    "meta[name='csrf-token']"
                ).getAttribute("content"),
            },
            body: JSON.stringify({
                transaction_id: transaction_id,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    window.location.reload();
                } else {
                    window.location.reload();
                }
            })
            .catch((error) => console.error("Error updating status:", error));
    };

    // Automatically update status every 2 seconds for pending transactions
    useEffect(() => {
        const interval = setInterval(() => {
            if (transaction?.status === "Pending") {
                updateStatus(transaction.ref_id);
            }
        }, 2000); // 2 seconds interval

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [transaction]);

    if (!transaction) {
        return <div>Loading...</div>;
    }

    const formattedDate = new Date(transaction.created_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const formatRupiah = (amount) => {
        const formattedAmount = parseInt(amount).toLocaleString('id-ID'); // Convert to integer and format with commas
        return `Rp${formattedAmount}`; // Remove space after 'Rp'
    };

    const previousUrl = sessionStorage.getItem('previous-url') || '/';

    return (
        <>
            <Head title="History Detail" />
            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
                {/* fixed position */}

                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <div className="w-full flex flex-row space-x-4 items-center justify-start">
                        <button className="shrink-0 w-6 h-6" onClick={() => router.visit(previousUrl, { preserveState: false })}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Detail Riwayat Transaksi
                        </div>
                    </div>
                </header>

                {/* Card */}
                <main className="w-full w-max-[500px] flex flex-col space-y-3 mt-12 [@media(max-width:277px)]:mt-[76px] p-4 bg-main-white">


                    {/* Pesan saat status Pending */}
                    {transaction.status === "Pending" && (
                        <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 text-sm rounded-xl">
                            Status pesanan saat ini <strong>Pending</strong>. Tetap di halaman ini untuk melihat pembaruan terbaru secara otomatis.
                        </div>
                    )}

                    {/* tombol edit toko */}
                    {transaction.status === "Sukses" && (

                        <a href={route('store.edit')}>
                            <button className="w-full h-max flex flex-row space-x-3 justify-center items-center p-4 rounded-full border border-main"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    className="text-main w-5"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5m2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5" />
                                </svg>
                                <span className="text-main text-sm font-medium">Edit Informasi Toko</span>
                            </button>
                        </a>
                    )}

                    {/* bg putih */}
                    <div className="w-full flex flex-col space-y-8 items-center justify-center p-6 rounded-3xl bg-white shadow-md">
                        <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                            <div className="w-full flex justify-center">
                                {transaction.status === "Pending" && (
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
                                {transaction.status === "Sukses" && (
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
                                {transaction.status !== "Pending" && transaction.status !== "Sukses" && (
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
                                    className={`text-center text-sm font-medium px-4 py-1 rounded-full ${transaction.status === "Pending"
                                        ? "text-yellow-700 bg-yellow-100"
                                        : transaction.status === "Sukses"
                                            ? "text-green-700 bg-green-100"
                                            : "text-red-700 bg-red-100"
                                        }`}
                                >
                                    Transaksi {transaction.status}
                                </span>
                            </div>
                            <p className="w-full font-utama font-semibold text-xl break-words text-wrap text-center">{transaction.product_name}</p>
                        </div>
                        <div className="w-full h-px bg-gray-600" />
                        <div className="w-full flex flex-col space-y-2 items-start justify-center">
                            <div className="w-full flex flex-col space-y-2 items-start justify-start">
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        ID Transaksi
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
                                                    <span className="break-words">{transaction.ref_id}</span>
                                                    <button
                                                        onClick={() => handleCopy(transaction.ref_id, setShowLottieRefId)}
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
                                        Waktu Transaksi
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formattedDate}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Pesan
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {transaction.status === 'Pending'
                                            ? 'Transaksi sedang diproses'
                                            : getResponseMessage(transaction.rc)}                                    </div>
                                </div>
                                <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Kategori
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {transaction.category}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Brand
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {transaction.brand.split(" - ")[0]}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Tipe
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {transaction.type.split(" - ")[0]}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        ID Tujuan
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {transaction.customer_no}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Harga
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {isEditing && (
                                            <div className="fixed h-screen px-4 inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                                <div className="w-full max-w-[328px] p-4 bg-white rounded-lg shadow-lg">
                                                    <div className="w-full h-max flex flex-col">
                                                        <button
                                                            className="w-full flex justify-end"
                                                            onClick={() => {
                                                                setPrice(transaction.price);
                                                                setAdminFee(Number(transaction.admin_fee) || 0);
                                                                setIsEditing(false);
                                                            }}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 16 16"
                                                                fill="currentColor"
                                                                className="w-7 h-7 text-red-500"
                                                            >
                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                                            </svg>
                                                        </button>

                                                        <h2 className="text-center text-utama text-lg font-medium mb-4">Edit Harga & Biaya Admin</h2>

                                                        <form
                                                            onSubmit={(e) => {
                                                                e.preventDefault();
                                                                setIsEditing(false);
                                                                // Optional: simpan ke backend di sini
                                                            }}
                                                            className="space-y-4"
                                                        >
                                                            {/* Harga */}
                                                            <div className="w-full max-w-[328px] h-max flex flex-col space-y-2">
                                                                <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Harga</p>
                                                                <input
                                                                    type="text"
                                                                    value={formatRupiah(price)}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value.replace(/\D/g, ""); // Remove non-digit
                                                                        setPrice(Number(raw));
                                                                    }}
                                                                    className="w-full rounded-lg border-2 border-gray-200 bg-neutral-100 px-3 py-2 text-sm focus:outline-none"
                                                                    placeholder="Harga"
                                                                />
                                                            </div>

                                                            {/* Admin Fee */}
                                                            <div className="w-full max-w-[328px] h-max flex flex-col space-y-2">
                                                                <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Biaya Admin</p>
                                                                <input
                                                                    type="text"
                                                                    value={formatRupiah(adminFee)}
                                                                    onChange={(e) => {
                                                                        const raw = e.target.value.replace(/\D/g, ""); // Remove non-digit
                                                                        setAdminFee(Number(raw) || 0); // fallback ke 0
                                                                    }}
                                                                    className="w-full rounded-lg border-2 border-gray-200 bg-neutral-100 px-3 py-2 text-sm focus:outline-none"
                                                                    placeholder="Biaya Admin"
                                                                />
                                                            </div>

                                                            {/* Tombol Simpan */}
                                                            <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                                                <button
                                                                    type="submit"
                                                                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                                                                >
                                                                    Simpan
                                                                </button>
                                                            </div>
                                                        </form>


                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tampilan awal saat tidak sedang edit */}
                                        {!isEditing && (
                                            <div className="text-right items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setPrice(transaction.price);
                                                        setAdminFee(Number(transaction.admin_fee) || 0);
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                    <span className="text-right">{formatRupiah(price || transaction.price)}</span>
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                                <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Kode Promosi
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        -
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Diskon
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        -
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Biaya Admin
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {isEditing ? (
                                            <></>
                                        ) : (
                                            <div className="text-right items-center gap-2">
                                                <span className="text-right">{formatRupiah(adminFee)}</span>
                                                <button
                                                    onClick={() => {
                                                        setAdminFee(0); // Set initial admin fee for editing
                                                        setIsEditing(true);
                                                    }}
                                                >
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                            <div className="w-full flex flex-row justify-between items-center">
                                <span className="text-md font-utama font-medium text-gray-700">Total Bayar</span>
                                <span className="text-md font-utama font-semibold text-black">
                                    {formatRupiah((parseFloat(price) || transaction.price) + (parseFloat(adminFee) || 0))}
                                </span>
                            </div>
                        </div>
                        {transaction.status == 'Sukses' && (
                            // If "Sukses", display the full card
                            <div className="w-full p-3 rounded-lg mt-6 mb-2 border border-gray-400">
                                <div className="items-center text-center mb-2">
                                    <h3 className="text-sm font-medium text-gray-700">SERIAL NUMBER</h3>
                                </div>

                                <hr className="border-t border-gray-200 mb-2" />

                                <div className="flex flex-col items-center">
                                    {showLottieSn ? (
                                        <div className="w-20">
                                            <DotLottieReact
                                                src="https://lottie.host/519fbc9d-1e9b-4ddf-ab6f-14423aabd845/MtxYOaYcV8.lottie"
                                                autoplay
                                                loop={false}
                                                style={{ width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleCopy(transaction.sn, setShowLottieSn)}
                                            className="text-main hover:text-blue-700 font-medium flex items-center justify-center gap-2 text-sm"
                                            aria-label="Copy Serial Number"
                                        >
                                            <span className="text-base font-semibold text-gray-800 break-all">
                                                {transaction.sn || 'N/A'}
                                            </span>
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
                                    )}
                                </div>
                            </div>
                        )
                        }
                    </div>
                </main>

                {/* tombol edit harga, unduh struk, beranda */}
                {transaction.status === 'Sukses' ? (
                    <div className="w-full w-max-[500px] p-4">

                        {/* Tombol Edit Harga dan Unduh Struk */}
                        <div className="flex justify-between mb-4">
                            <button
                                onClick={() => {
                                    setPrice(transaction.price);
                                    setIsEditing(true);
                                }}
                                className="w-[48%] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm text-center flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-receipt" viewBox="0 0 16 16">
                                    <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27m.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0z" />
                                    <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5" />
                                </svg>
                                Edit Harga
                            </button>

                            <button
                                onClick={() => setShowModal(true)}
                                className="w-[48%] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm text-center flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                                </svg>
                                Unduh Struk
                            </button>
                        </div>
                        {showModal && (
                            <div className="fixed h-screen px-4 inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                <div className="bg-white rounded-xl shadow-xl max-h-[90vh] w-full max-w-[450px] p-4 overflow-auto">
                                    {/* Header: Tombol Tutup + Judul */}
                                    <div className="w-full h-max flex flex-col mb-4">
                                        <button
                                            className="w-full flex items-end justify-end"
                                            onClick={() => setShowModal(false)}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 16 16"
                                                fill="currentColor"
                                                className="w-7 h-7 text-red-500"
                                            >
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                            </svg>
                                        </button>
                                        <h2 className="w-full text-utama text-lg font-medium text-center">Preview Struk</h2>
                                    </div>

                                    {/* PILIHAN STRUK */}
                                    <div className="flex justify-between mb-4">
                                        {['kecil', 'besar'].map((tipe) => (
                                            <button
                                                key={tipe}
                                                onClick={() => setSize(tipe)}
                                                className={`w-[48%] rounded-lg px-4 py-2 text-sm font-semibold border
                                                ${size === tipe
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-white text-blue-500 border-blue-500'}`}
                                            >
                                                Struk Font {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* PREVIEW STRUK */}
                                    <div
                                        ref={cardRef}
                                        className="flex justify-center border border-dashed border-gray-300 p-2 rounded-md bg-gray-50 w-full overflow-auto"
                                    >
                                        <div className="w-full flex justify-center">
                                            <div className="w-full max-w-full">
                                                <Receipt
                                                    storeData={storeData}
                                                    transaction={transaction}
                                                    price={price}
                                                    adminFee={adminFee}
                                                    ref_id={ref_id}
                                                    formattedDate={formattedDate}
                                                    size={size}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tombol Beranda */}
                        <a href={route('user.dashboard')}>
                            <button className="w-full bg-blue-500 text-white rounded-lg px-6 py-3 text-center text-sm font-semibold hover:bg-blue-600 flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        fillRule="evenodd"
                                        d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Beranda
                            </button>
                        </a>
                    </div>
                ) : (
                    <div className="w-full w-max-[500px] p-4">
                        {/* Tombol Beranda Saja */}
                        <a href={route('user.dashboard')}>
                            <button className="w-full bg-blue-500 text-white rounded-lg px-6 py-3 text-center text-sm font-semibold hover:bg-blue-600 flex items-center justify-center gap-2">
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                    <path
                                        fillRule="evenodd"
                                        d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Beranda
                            </button>
                        </a>
                    </div>
                )}
            </div>
        </>

    );
};

export default HistoryDetail;
