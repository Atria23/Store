import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { toPng } from 'html-to-image';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import ReceiptPostpaid from '@/Components/ReceiptPostpaid'; // Menggunakan komponen ReceiptPostpaid yang baru

// Helper Functions
const formatRupiahDecimal = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return parseInt(value).toLocaleString('id-ID');
};

const formatRupiahCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

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

const calculateTotalPenaltyFee = (trans) => {
    const details = trans?.details?.desc?.detail;
    if (!details || !Array.isArray(details)) {
        return 0;
    }
    return details.reduce((sum, bill) => sum + parseFloat(bill.denda || 0), 0);
};

// --- Komponen SpecificDetails (tidak berubah, masih digunakan untuk tampilan utama) ---
const SpecificDetails = ({ transaction }) => {
    const { type, details } = transaction;

    if (!details) return (
        <div className="w-full flex flex-row">
            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                Detail Tagihan
            </div>
            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                Tidak tersedia.
            </div>
        </div>
    );

    const descData = details.desc || {};

    const renderBillDetails = (billItems) => {
        if (!billItems || !Array.isArray(billItems) || billItems.length === 0) {
            return (
                <div className="w-full flex flex-row">
                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                        Detail Item Tagihan
                    </div>
                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                        Tidak tersedia.
                    </div>
                </div>
            );
        }
        return billItems.map((bill, index) => (
            <React.Fragment key={index}>
                <div className="w-full h-px border-dashed border-gray-200 my-2" />
                <div className="w-full flex flex-row">
                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words font-semibold">
                        Periode
                    </div>
                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                        {bill.periode || '-'}
                    </div>
                </div>
                {bill.nilai_tagihan && (
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Nilai Tagihan</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{formatRupiahCurrency(bill.nilai_tagihan)}</div>
                    </div>
                )}
                {bill.denda > 0 && ( // Perubahan ada di sini: tambahkan kondisi bill.denda > 0
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Denda</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{formatRupiahCurrency(bill.denda)}</div>
                    </div>
                )}
                {bill.admin > 0 && (
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Admin Per Periode</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{formatRupiahCurrency(bill.admin)}</div>
                    </div>
                )}
                {bill.meter_awal && bill.meter_akhir && (
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Meter Awal-Akhir</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{bill.meter_awal} - {bill.meter_akhir}</div>
                    </div>
                )}
                {bill.biaya_lain > 0 && (
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Biaya Lain</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{formatRupiahCurrency(bill.biaya_lain)}</div>
                    </div>
                )}
                {bill.iuran > 0 && (
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Iuran</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{formatRupiahCurrency(bill.iuran)}</div>
                    </div>
                )}
            </React.Fragment>
        ));
    };

    switch (type) {
        case 'PLN':
            return (
                <React.Fragment>
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Tarif / Daya</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.tarif || '-'} / {descData.daya || '-'} VA</div>
                    </div>
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jumlah Lembar Tagihan</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.lembar_tagihan || '0'}</div>
                    </div>
                    {renderBillDetails(descData.detail)}
                </React.Fragment>
            );
        case 'PDAM':
            return (
                <React.Fragment>
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Tarif</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.tarif || '-'}</div>
                    </div>
                    {descData.alamat && descData.alamat !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Alamat</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.alamat}</div>
                        </div>
                    )}
                    {descData.jatuh_tempo && descData.jatuh_tempo !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jatuh Tempo</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.jatuh_tempo || '-'}</div>
                        </div>
                    )}

                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jumlah Lembar Tagihan</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.lembar_tagihan || '0'}</div>
                    </div>
                    {renderBillDetails(descData.detail)}
                </React.Fragment>
            );
        case 'INTERNET PASCABAYAR':
            return (
                <React.Fragment>
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jumlah Lembar Tagihan</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.lembar_tagihan || '0'}</div>
                    </div>
                    {renderBillDetails(descData.detail)}
                </React.Fragment>
            );
        case 'BPJS KESEHATAN':
            return (
                <React.Fragment>
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jumlah Peserta</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.jumlah_peserta || '0'}</div>
                    </div>
                    {descData.alamat && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Alamat</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.alamat}</div>
                        </div>
                    )}
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jumlah Lembar Tagihan</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.lembar_tagihan || '0'}</div>
                    </div>
                    {renderBillDetails(descData.detail)}
                </React.Fragment>
            );
        // <<<<<<<<<<< TAMBAHAN UNTUK PBB PASCABAYAR >>>>>>>>>>>>>
        case 'PBB':
            return (
                <React.Fragment>
                    {descData.alamat && descData.alamat !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Alamat</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.alamat}</div>
                        </div>
                    )}
                    {descData.tahun_pajak && descData.tahun_pajak !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Tahun Pajak</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.tahun_pajak}</div>
                        </div>
                    )}
                    {descData.kelurahan && descData.kelurahan !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Kelurahan</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.kelurahan}</div>
                        </div>
                    )}
                    {descData.kecamatan && descData.kecamatan !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Kecamatan</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.kecamatan}</div>
                        </div>
                    )}
                    {descData.kab_kota && descData.kab_kota !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Kab/Kota</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.kab_kota}</div>
                        </div>
                    )}
                    {descData.luas_tanah && descData.luas_tanah !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Luas Tanah</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.luas_tanah}</div>
                        </div>
                    )}
                    {descData.luas_gedung && descData.luas_gedung !== '-' && (
                        <div className="w-full flex flex-row">
                            <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Luas Gedung</div>
                            <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.luas_gedung}</div>
                        </div>
                    )}
                    <div className="w-full flex flex-row">
                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Jumlah Lembar Tagihan</div>
                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{descData.lembar_tagihan || '0'}</div>
                    </div>
                </React.Fragment>
            );
        default:
            return (
                <div className="w-full flex flex-row">
                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                        Detail Produk
                    </div>
                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                        Tidak tersedia.
                    </div>
                </div>
            );
    }
};


// --- Komponen Utama HistoryDetail ---
export default function HistoryDetail({ transaction: initialTransaction, store }) {
    // modalContentRef menunjuk ke div utama konten modal (yang punya max-h dan overflow).
    const modalContentRef = useRef(null);
    // receiptPreviewWrapperRef menunjuk ke div yang membungkus ReceiptPostpaid di dalam modal pratinjau.
    // Ini adalah elemen yang akan kita modifikasi gayanya untuk unduhan.
    const receiptPreviewWrapperRef = useRef(null);

    const [transaction, setTransaction] = useState(initialTransaction);

    const [editableAdminFee, setEditableAdminFee] = useState(initialTransaction.admin_fee || 0);
    const [editableDiscount, setEditableDiscount] = useState(initialTransaction.details?.diskon || 0);

    const [isEditing, setIsEditing] = useState(false);
    const [size, setSize] = useState('kecil');
    const [showModal, setShowModal] = useState(false);
    const [storeData, setStoreData] = useState({
        name: "", address: "", phone_number: "", image: "",
    });

    const [showLottieRefId, setShowLottieRefId] = useState(false);
    const [showLottieSn, setShowLottieSn] = useState(false);

    useEffect(() => {
        if (store) {
            setStoreData(store);
        }
    }, [store]);

    useEffect(() => {
        if (initialTransaction) {
            setTransaction(initialTransaction);
            setEditableAdminFee(initialTransaction.admin_fee || 0);
            setEditableDiscount(initialTransaction.details?.diskon || 0);
        }
    }, [initialTransaction]);

    const handleCopy = (textToCopy, setLottie) => {
        navigator.clipboard.writeText(textToCopy);
        setLottie(true);
        setTimeout(() => setLottie(false), 1500);
    };

    // Fungsi handleDownload ini sekarang menerima elemen DOM struk dari ReceiptPostpaid
    const handleDownloadRequestFromReceipt = async (receiptElement) => {
        if (receiptElement && modalContentRef.current && receiptPreviewWrapperRef.current) {
            // Simpan gaya asli dari modal content
            const originalModalMaxHeight = modalContentRef.current.style.maxHeight;
            const originalModalOverflow = modalContentRef.current.style.overflow;

            // Simpan gaya asli dari div pembungkus ReceiptPostpaid di preview
            const originalReceiptPreviewOverflow = receiptPreviewWrapperRef.current.style.overflow;
            const originalReceiptPreviewHeight = receiptPreviewWrapperRef.current.style.height;
            const originalReceiptPreviewMaxHeight = receiptPreviewWrapperRef.current.style.maxHeight;

            // Nonaktifkan batasan tinggi dan overflow sementara
            modalContentRef.current.style.maxHeight = 'none';
            modalContentRef.current.style.overflow = 'visible';
            receiptPreviewWrapperRef.current.style.overflow = 'visible';
            receiptPreviewWrapperRef.current.style.height = 'auto'; // Pastikan tinggi auto
            receiptPreviewWrapperRef.current.style.maxHeight = 'none'; // Pastikan max-height none

            try {
                // toPng akan mengambil seluruh elemen receiptElement yang diberikan
                const dataUrl = await toPng(receiptElement, { backgroundColor: 'white' });
                const link = document.createElement('a');
                link.download = `Transaction-${transaction?.ref_id}.png`;
                link.href = dataUrl;
                link.click();
            } catch (err) {
                console.error('Error generating image:', err);
            } finally {
                // Kembalikan gaya asli setelah proses toPng selesai
                modalContentRef.current.style.maxHeight = originalModalMaxHeight;
                modalContentRef.current.style.overflow = originalModalOverflow;
                receiptPreviewWrapperRef.current.style.overflow = originalReceiptPreviewOverflow;
                receiptPreviewWrapperRef.current.style.height = originalReceiptPreviewHeight;
                receiptPreviewWrapperRef.current.style.maxHeight = originalReceiptPreviewMaxHeight;
            }
        }
    };

    const updateStatus = async (transaction_id) => {
        try {
            const response = await fetch("/transactions/update-status", {
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
            });
            const data = await response.json();
            if (data.success) {
                setTransaction(prev => ({ ...prev, status: data.newStatus || prev.status }));
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (transaction?.status === "Pending") {
                updateStatus(transaction.ref_id);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [transaction]);

    if (!transaction) {
        return <div>Loading...</div>;
    }

    const formattedDateSummary = new Date(transaction.created_at).toLocaleString("id-ID", {
        year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    });

    const previousUrl = sessionStorage.getItem('previous-url') || '/';

    const currentTotalPenalty = calculateTotalPenaltyFee(transaction);
    const finalPaidAmount = (transaction.price || 0) + (transaction.admin_fee || 0) + currentTotalPenalty - (transaction.details?.diskon || 0);

    const calculatedEditModalTotal = (transaction.price || 0) + editableAdminFee + currentTotalPenalty - editableDiscount;


    return (
        <>
            <Head title={`Detail Transaksi ${transaction.ref_id}`} />
            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen bg-gray-50">
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

                <main className="w-full flex flex-col space-y-3 pt-14 p-4 bg-gray-50">
                    {transaction.status === "Pending" && (
                        <div className="w-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 text-sm rounded-xl">
                            Status pesanan saat ini <strong>Pending</strong>. Tetap di halaman ini untuk melihat pembaruan terbaru secara otomatis.
                        </div>
                    )}

                    {/* Kontainer utama untuk informasi umum, detail tagihan, dan rincian pembayaran */}
                    <div className="w-full flex flex-col space-y-8 items-center justify-center p-6 rounded-3xl bg-white shadow-md">
                        {/* Bagian Status Transaksi & Nama Produk */}
                        <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                            <div className="w-full flex justify-center">
                                {transaction.status === "Pending" && (<div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-14 h-14 text-yellow-500" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" /></svg></div>)}
                                {transaction.status === "Sukses" && (<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-14 h-14 text-green-500" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" /></svg></div>)}
                                {transaction.status !== "Pending" && transaction.status !== "Sukses" && (<div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-14 h-14 text-red-500" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" /></svg></div>)}
                            </div>
                            <div className="w-full flex justify-center">
                                <span
                                    className={`text-center text-sm font-medium px-4 py-1 rounded-full ${transaction.status === "Pending" ? "text-yellow-700 bg-yellow-100" : transaction.status === "Sukses" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"}`}
                                >
                                    Transaksi {transaction.status}
                                </span>
                            </div>
                            <p className="w-full font-utama font-semibold text-xl break-words text-wrap text-center">{transaction.product?.product_name || transaction.type}</p>
                        </div>

                        <div className="w-full h-px bg-gray-300" /> {/* Garis pemisah */}

                        {/* Bagian Informasi Umum */}
                        <div className="w-full flex flex-col space-y-2 items-start justify-start">
                            {/* ID Transaksi */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">ID Transaksi</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words flex items-center justify-end gap-1">
                                    {showLottieRefId ? (
                                        <div className="w-20"><DotLottieReact src="https://lottie.host/519fbc9d-1e9b-4ddf-ab6f-14423aabd845/MtxYOaYcV8.lottie" autoplay loop={false} style={{ width: '100%', height: '100%' }} /></div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="break-words">{transaction.ref_id}</span>
                                            <button onClick={() => handleCopy(transaction.ref_id, setShowLottieRefId)} className="text-blue-600 hover:text-blue-700 font-medium" aria-label="Copy Ref Id">
                                                <svg className="w-5 h-5 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M7 9v6a4 4 0 0 0 4 4h4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1v2Z" clipRule="evenodd" /><path fillRule="evenodd" d="M13 3.054V7H9.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 13 3.054ZM15 3v4a2 2 0 0 1-2 2H9v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Waktu Transaksi */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Waktu Transaksi</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{formattedDateSummary}</div>
                            </div>
                            {/* Pesan */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Pesan</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                    {transaction.status === 'Pending' ? 'Transaksi sedang diproses' : getResponseMessage(transaction.rc)}
                                </div>
                            </div>
                            <div className="w-full h-px border border-dashed border-gray-400 my-4" /> {/* Garis pemisah */}
                            {/* Kategori */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Kategori</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{transaction.product?.category || "-"}</div>
                            </div>
                            {/* Brand */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Brand</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{transaction.product?.brand || "-"}</div>
                            </div>
                            {/* ID Pelanggan */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">ID Pelanggan</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{transaction.customer_no || "-"}</div>
                            </div>
                            {/* ID Pelanggan */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Nama Pelanggan</div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">{transaction.customer_name || "-"}</div>
                            </div>

                            <div className="w-full h-px border border-dashed border-gray-400 my-4" /> {/* Garis pemisah */}

                            {/* Bagian Detail Tagihan (dari SpecificDetails) */}
                            <div className="w-full flex flex-col space-y-2 items-start justify-start">
                                <SpecificDetails transaction={transaction} />
                            </div>

                            <div className="w-full h-px border border-dashed border-gray-400 my-4" /> {/* Garis pemisah */}

                            {/* Bagian Rincian Pembayaran */}
                            <div className="w-full flex flex-col space-y-2 items-start justify-start">
                                {/* Harga Tagihan (asli dari database) */}
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Total Tagihan</div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiahCurrency(transaction.price || 0)}
                                    </div>
                                </div>
                                {/* Kode Promosi */}
                                {transaction.promo_code && (
                                    <div className="w-full flex flex-row">
                                        <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                            Kode Promosi
                                        </div>
                                        <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                            {transaction.promo_code}
                                        </div>
                                    </div>
                                )}

                                {/* Diskon (asli dari database atau yang sudah diedit) */}
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Diskon</div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiahCurrency(transaction.details?.diskon || 0)}
                                    </div>
                                </div>
                                {/* NEW: Tampilkan Total Denda yang sudah dihitung */}
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Total Denda</div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiahCurrency(currentTotalPenalty)}
                                    </div>
                                </div>
                                {/* Biaya Admin (asli dari database atau yang sudah diedit) */}
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">Total Biaya Admin</div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formatRupiahCurrency(transaction.admin_fee || 0)}
                                    </div>
                                </div>
                                <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                                <div className="w-full flex flex-row justify-between items-center">
                                    <span className="text-md font-utama font-medium text-gray-700">Total Bayar</span>
                                    <span className="text-md font-utama font-semibold text-black">
                                        {formatRupiahCurrency(finalPaidAmount)}
                                    </span>
                                </div>
                            </div>
                        </div> {/* End of main white card */}
                    </div>
                </main>


                {/* Modal Edit Harga & Biaya Admin */}
                {isEditing && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-800 bg-opacity-50 px-4">
                        <div className="bg-white rounded-xl shadow-xl max-h-[90vh] w-full max-w-[450px] p-4 overflow-auto">
                            <div className="w-full h-max flex flex-col mb-4">
                                <button className="w-full flex justify-end" onClick={() => setIsEditing(false)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-7 h-7 text-red-500"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" /></svg>
                                </button>
                                <h2 className="text-center font-utama text-lg font-medium">Edit Biaya Admin & Diskon</h2>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const currentTotalPenaltyFromTransaction = calculateTotalPenaltyFee(transaction);

                                    const billDetails = transaction?.details?.desc?.detail;
                                    const numberOfPeriods = (Array.isArray(billDetails) && billDetails.length > 0) ? billDetails.length : 1;
                                    const newAdminPerPeriod = (editableAdminFee / numberOfPeriods) || 0;

                                    setTransaction(prevTransaction => {
                                        const updatedDetails = prevTransaction.details ? { ...prevTransaction.details } : {};

                                        updatedDetails.diskon = editableDiscount;

                                        if (updatedDetails.desc && Array.isArray(updatedDetails.desc.detail)) {
                                            updatedDetails.desc.detail = updatedDetails.desc.detail.map(bill => ({
                                                ...bill,
                                                admin: newAdminPerPeriod,
                                            }));
                                        }

                                        const updatedSellingPrice =
                                            (prevTransaction.price || 0) +
                                            editableAdminFee +
                                            currentTotalPenaltyFromTransaction -
                                            editableDiscount;

                                        return {
                                            ...prevTransaction,
                                            admin_fee: editableAdminFee,
                                            details: updatedDetails,
                                            selling_price: updatedSellingPrice
                                        };
                                    });
                                    setIsEditing(false);
                                }}
                                className="space-y-4"
                            >
                                <div className="w-full h-max flex flex-col space-y-2">
                                    <p className="w-full h-max font-utama font-medium text-sm text-left align-middle">Biaya Admin (Total)</p>
                                    <input
                                        type="text"
                                        value={formatRupiahDecimal(editableAdminFee)}
                                        onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setEditableAdminFee(Number(raw) || 0); }}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-neutral-100 px-3 py-2 text-sm focus:outline-none"
                                        placeholder="Biaya Admin"
                                    />
                                </div>

                                <div className="w-full h-max flex flex-col space-y-2">
                                    <p className="w-full h-max font-utama font-medium text-sm text-left align-middle">Diskon</p>
                                    <input
                                        type="text"
                                        value={formatRupiahDecimal(editableDiscount)}
                                        onChange={(e) => { const raw = e.target.value.replace(/\D/g, ""); setEditableDiscount(Number(raw) || 0); }}
                                        className="w-full rounded-lg border-2 border-gray-200 bg-neutral-100 px-3 py-2 text-sm focus:outline-none"
                                        placeholder="Diskon"
                                    />
                                </div>
                                <div className="w-full flex justify-between font-bold mt-4">
                                    <span>Total (disesuaikan):</span>
                                    <span>{formatRupiahCurrency(calculatedEditModalTotal)}</span>
                                </div>

                                <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                    <button type="submit" className="w-full bg-main text-white p-2 rounded hover:bg-blue-700 transition">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* Tombol aksi */}
                <div className="w-full max-w-[500px] p-4 bg-gray-50 mt-auto">
                    {transaction.status === 'Sukses' ? (
                        <>
                            <Link href={route('store.edit')} className="w-full">
                                <button className="w-full border border-blue-600 text-blue-600 rounded-lg px-4 py-3 text-sm text-center flex items-center justify-center gap-2 mb-4 hover:bg-blue-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5" viewBox="0 0 16 16"><path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.37 2.37 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5m2 .5a.5.5 0 0 1 .5.5V13h8V9.5a.5.5 0 0 1 1 0V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a.5.5 0 0 1 .5-.5" /></svg>
                                    Edit Informasi Toko
                                </button>
                            </Link>
                            <div className="flex justify-between mb-4 gap-4">
                                <button onClick={() => setIsEditing(true)} className="w-1/2 border border-blue-600 text-blue-600 rounded-lg px-4 py-2 text-sm text-center flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-receipt" viewBox="0 0 16 16"><path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27m.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0z" /><path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5" /></svg>
                                    Edit Harga
                                </button>

                                {/* Hanya menampilkan tombol buka modal, tombol unduh ada di dalam ReceiptPostpaid */}
                                <button onClick={() => setShowModal(true)} className="w-1/2 border border-blue-600 text-blue-600 rounded-lg px-4 py-2 text-sm text-center flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" /><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" /></svg>
                                    Unduh Struk
                                </button>
                            </div>
                            {/* Modal Unduh Struk */}
                            {showModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50 px-4">
                                    <div ref={modalContentRef} className="bg-white rounded-xl shadow-xl max-h-[90vh] w-full max-w-[450px] p-4 overflow-auto">
                                        <div className="w-full h-max flex flex-col mb-4">
                                            <button className="w-full flex items-end justify-end" onClick={() => setShowModal(false)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-7 h-7 text-red-500"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" /></svg>
                                            </button>
                                            <h2 className="w-full font-utama text-lg font-medium text-center">Preview Struk</h2>
                                        </div>

                                        {/* PILIHAN STRUK */}
                                        <div className="flex justify-between mb-4 gap-4">
                                            {['kecil', 'besar'].map((tipe) => (
                                                <button
                                                    key={tipe}
                                                    onClick={() => setSize(tipe)}
                                                    className={`w-1/2 rounded-lg px-4 py-2 text-sm font-semibold border
                                                    ${size === tipe ? 'bg-main text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600'}`}
                                                >
                                                    Struk Font {tipe.charAt(0).toUpperCase() + tipe.slice(1)}
                                                </button>
                                            ))}
                                        </div>

                                        {/* PREVIEW STRUK - Pembungkus untuk ReceiptPostpaid */}
                                        <div ref={receiptPreviewWrapperRef} className="flex justify-center border border-dashed border-gray-300 p-2 rounded-md bg-gray-50 w-full overflow-auto">
                                            <div className="w-full flex justify-center">
                                                <div className="w-full max-w-full">
                                                    <ReceiptPostpaid // Menggunakan komponen ReceiptPostpaid
                                                        storeData={storeData}
                                                        transaction={transaction}
                                                        editableBillPrice={transaction.price}
                                                        editableAdminFee={transaction.admin_fee}
                                                        editableDiscount={transaction.details?.diskon}
                                                        editablePenaltyFee={currentTotalPenalty}
                                                        size={size}
                                                        onDownloadRequest={handleDownloadRequestFromReceipt} // Teruskan handler unduh ke ReceiptPostpaid
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {/* Tombol Unduh di dalam modal. Ini sekarang menjadi bagian dari ReceiptPostpaid */}
                                        {/* <button onClick={handleDownload} ...> // Tombol ini dihapus karena sudah di dalam ReceiptPostpaid */}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        null
                    )}

                    <Link href={route('user.dashboard')} className="w-full">
                        <button className="w-full bg-main text-white rounded-lg px-6 py-3 text-center text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z" clipRule="evenodd" /></svg>
                            Beranda
                        </button>
                    </Link>
                </div>
            </div>
        </>
    );
}