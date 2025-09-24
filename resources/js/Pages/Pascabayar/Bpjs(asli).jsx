import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function BpjsKesehatanIndex({ auth }) {
    // State untuk alur BPJS Kesehatan
    const [customerNo, setCustomerNo] = useState('');
    const [inquiryResult, setInquiryResult] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    // State untuk UI & proses pembayaran
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const userBalance = auth.user.balance;

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    // Langkah 1: Cek Tagihan
    const handleInquiry = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setInquiryResult(null);

        try {
            const response = await fetch(route('bpjs.kesehatan.inquiry'), { // Perubahan route
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ customer_no: customerNo }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Gagal melakukan pengecekan tagihan.');
            setInquiryResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Langkah 2: Buka Modal Konfirmasi
    const handleBayarClick = () => {
        if (userBalance < inquiryResult.selling_price) {
            setError("Saldo tidak mencukupi untuk melakukan transaksi.");
            return;
        }
        setError('');
        setPassword('');
        setIsModalOpen(true);
    };

    // Langkah 3: Kirim Transaksi setelah Konfirmasi Password
    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Silakan masukkan password untuk melanjutkan.");
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const verifyResponse = await fetch('/auth/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ password }),
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
                throw new Error("Password yang Anda masukkan salah.");
            }

            const paymentResponse = await fetch(route('bpjs.kesehatan.payment'), { // Perubahan route
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ customer_no: inquiryResult.customer_no }),
            });
            const paymentData = await paymentResponse.json();
            if (!paymentResponse.ok) {
                setPaymentResult(paymentData); // Simpan hasil pembayaran meskipun gagal untuk detail
                throw new Error(paymentData.message || 'Gagal melakukan pembayaran.');
            }

            setPaymentResult(paymentData);
            setInquiryResult(null);
            setIsModalOpen(false);
            // Optional: Redirect to history or show success message on current page

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="BPJS Kesehatan" /> {/* Perubahan judul */}
            <div className="mx-auto w-full max-w-[500px] bg-gray-50 flex flex-col min-h-screen">

                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex items-center space-x-4 px-4 py-3 bg-main text-white shadow-md">
                    <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                    </button>
                    <div className="font-semibold text-lg">BPJS Kesehatan</div> {/* Perubahan teks */}
                </header>

                <main className="w-full pt-16 pb-40 px-4 space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        {paymentResult ? (
                            // --- TAMPILAN SETELAH PEMBAYARAN ---
                            <div className="space-y-4">
                                <div className="text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-green-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Berhasil</h3>
                                    <p className="text-sm text-gray-500">Pembayaran Tagihan BPJS Kesehatan</p> {/* Perubahan teks */}
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-600">Total Pembayaran</p>
                                    <p className="text-3xl font-bold text-main">
                                        {formatRupiah(paymentResult.selling_price)}
                                    </p>
                                </div>

                                {paymentResult.diskon > 0 && (
                                    <div className="text-center text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                                        Anda hemat {formatRupiah(paymentResult.diskon)}!
                                    </div>
                                )}

                                <div className="space-y-2 text-sm">
                                    <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">
                                        Detail Pelanggan
                                    </h4>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Nama</span>
                                        <span className="font-medium text-right">{paymentResult.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Nomor BPJS/Virtual Account</span> {/* Perubahan teks */}
                                        <span className="font-medium">{paymentResult.customer_no}</span>
                                    </div>
                                    {/* BPJS Specific details */}
                                    {paymentResult.jumlah_peserta && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Jumlah Peserta</span>
                                            <span className="font-medium">{paymentResult.jumlah_peserta}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => router.visit(route("postpaid.history.index"))}
                                    className="w-full py-2 px-4 border border-main text-main font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Riwayat Transaksi
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentResult(null);
                                        setCustomerNo("");
                                    }}
                                    className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                    Transaksi Lagi
                                </button>
                            </div>
                        ) : inquiryResult ? (
                            // --- TAMPILAN SETELAH INQUIRY SUKSES ---
                            <div className="space-y-4">
                                <p className="w-full font-semibold text-md text-center text-gray-800">Detail Tagihan</p>
                                <div className="w-full h-px bg-gray-200" />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Nomor BPJS/Virtual Account</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
                                    {inquiryResult.jumlah_peserta && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Jumlah Peserta</span>
                                            <span className="font-medium text-gray-900">{inquiryResult.jumlah_peserta}</span>
                                        </div>
                                    )}
                                    {inquiryResult.alamat && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Alamat</span>
                                            <span className="font-medium text-gray-900 text-right">{inquiryResult.alamat}</span>
                                        </div>
                                    )}
                                </div>

                                {/* BPJS dummy response 'desc.detail' only has 'periode'. Adjusting rendering. */}
                                {inquiryResult.desc.detail && inquiryResult.desc.detail.length > 0 && (
                                    <div className="space-y-2 text-sm border-t pt-2">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1">Rincian per Periode Tagihan</h4>
                                        {inquiryResult.desc.detail.map((detail, index) => (
                                            <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                                                <p className="font-medium text-gray-700">Periode: {detail.periode}</p>
                                                {/* BPJS dummy does not have nilai_tagihan, admin, denda per detail */}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-2 text-sm border-t pt-2">
                                    <h4 className="font-semibold text-md text-gray-800 pb-1">Ringkasan Pembayaran</h4>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Nilai Tagihan</span>
                                        <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.price)}</span>
                                    </div>
                                    {inquiryResult.denda > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total Denda</span>
                                            <span className="font-medium text-red-600">{formatRupiah(inquiryResult.denda)}</span>
                                        </div>
                                    )}
                                    {/* Total admin for BPJS is usually at root level, not accumulated from details in dummy response */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Biaya Admin</span>
                                        <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.admin)}</span>
                                    </div>

                                    {inquiryResult.diskon > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Diskon</span>
                                            <span className="font-medium text-green-600">
                                                - {formatRupiah(inquiryResult.diskon)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full h-px bg-gray-200" />
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">Total Pembayaran</span>
                                    <span className="font-bold text-xl text-main">{formatRupiah(inquiryResult.selling_price)}</span>
                                </div>
                            </div>
                        ) : (
                            // --- TAMPILAN AWAL (FORM INPUT) ---
                            <form onSubmit={handleInquiry} className="space-y-4">
                                <div>
                                    <label htmlFor="customer_no" className="block text-sm font-medium text-gray-700 mb-1">Nomor BPJS/Virtual Account</label> {/* Perubahan teks */}
                                    <input
                                        id="customer_no" type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={customerNo}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) {
                                                setCustomerNo(value);
                                            }
                                        }}
                                        onWheel={(e) => e.target.blur()}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoading} required placeholder="Masukkan Nomor BPJS/Virtual Account"
                                    />
                        {error && !isModalOpen && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                                </div>
                                <button
                                    type="submit" disabled={isLoading || !customerNo}
                                    className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isLoading ? 'Mengecek...' : 'Lanjutkan'}
                                </button>
                            </form>
                        )}
                    </div>
                </main>

                {inquiryResult && !paymentResult && (
                    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <p className="text-sm text-gray-600">Total Pembayaran</p>
                                <p className="text-xl font-bold text-main">{formatRupiah(inquiryResult.selling_price)}</p>
                            </div>
                            <button
                                onClick={handleBayarClick} disabled={userBalance < inquiryResult.selling_price}
                                className="px-6 py-2 rounded-lg font-semibold text-white bg-main hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {userBalance < inquiryResult.selling_price ? "Saldo Kurang" : "Bayar Sekarang"}
                            </button>
                        </div>
                    </footer>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm space-y-4">
                            <h2 className="text-lg font-semibold text-center">Konfirmasi Pembayaran</h2>
                            <form onSubmit={handleSubmitPayment}>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border p-2 pr-10 rounded" placeholder="Masukkan password Anda" autoFocus
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" /></svg>}
                                    </button>
                                </div>
                                {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                                <div className="flex justify-end space-x-2 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                                    <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-main hover:bg-blue-700 rounded-lg disabled:bg-gray-400">
                                        {isLoading ? "Memproses..." : "Konfirmasi"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}