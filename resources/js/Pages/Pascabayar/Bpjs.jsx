import React, { useState } from 'react';
import { Head } from '@inertiajs/react';

// Komponen untuk alur pembayaran Pascabayar BPJS.
export default function Bpjs({ auth }) {
    // State untuk alur BPJS
    const [customerNo, setCustomerNo] = useState('');
    const [inquiryResult, setInquiryResult] = useState(null); 
    const [paymentResult, setPaymentResult] = useState(null);
    
    // State untuk UI & proses pembayaran
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const userBalance = auth.user.balance;

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    // Langkah 1: Cek Tagihan
    const handleInquiry = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setInquiryResult(null);
        setPaymentResult(null);

        try {
            const response = await fetch(route('pascabpjs.inquiry'), {
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

            const paymentResponse = await fetch(route('pascabpjs.payment'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ customer_no: inquiryResult.customer_no }),
            });
            const paymentData = await paymentResponse.json();
            if (!paymentResponse.ok) {
                throw new Error(paymentData.message || 'Gagal melakukan pembayaran.');
            }

            setPaymentResult(paymentData.data);
            setInquiryResult(null);
            setIsModalOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetTransaction = () => {
        setCustomerNo('');
        setInquiryResult(null);
        setPaymentResult(null);
        setError('');
        setIsLoading(false);
    };


    return (
        <>
            <Head title="BPJS Kesehatan" />
            <div className="mx-auto w-full max-w-[500px] bg-gray-50 flex flex-col min-h-screen">

                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex items-center space-x-4 px-4 py-3 bg-main text-white shadow-md">
                    <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                    </button>
                    <div className="font-semibold text-lg">BPJS Kesehatan</div>
                </header>
                
                <main className="w-full pt-20 pb-40 px-4 space-y-4">
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border">
                        <p className="font-semibold text-sm text-gray-700 flex items-center space-x-2">
                           <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" /><path d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" /></svg>
                            <span>Saldo Anda</span>
                        </p>
                        <div className="flex items-center space-x-2">
                            <p className="font-bold text-sm">{showBalance ? formatRupiah(userBalance) : "••••••••"}</p>
                            <button onClick={() => setShowBalance(!showBalance)} className="text-blue-600">
                                {showBalance ? <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/></svg>}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        {paymentResult ? (
                            paymentResult.status === 'Sukses' ? (
                                // --- TAMPILAN STRUK PEMBAYARAN BERHASIL (BAGIAN YANG DIUPGRADE) ---
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Berhasil</h3>
                                        <p className="text-sm text-gray-500">{paymentResult.message}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600">Total Pembayaran</p>
                                        <p className="text-3xl font-bold text-main">{formatRupiah(paymentResult.selling_price)}</p>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">Detail Pelanggan</h4>
                                        <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-right">{paymentResult.customer_name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Nomor VA</span><span className="font-medium">{paymentResult.customer_no}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Jumlah Peserta</span><span className="font-medium">{paymentResult.desc?.jumlah_peserta} Orang</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-right">{paymentResult.desc?.alamat}</span></div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">Rincian Pembayaran</h4>
                                        <div className="flex justify-between"><span className="text-gray-500">Periode</span><span className="font-medium">{paymentResult.desc?.detail?.map(d => d.periode).join(', ')}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Jumlah Bulan</span><span className="font-medium">{paymentResult.desc?.lembar_tagihan} Bulan</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Tagihan Pokok</span><span className="font-medium">{formatRupiah(paymentResult.selling_price - paymentResult.admin)}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Biaya Admin</span><span className="font-medium">{formatRupiah(paymentResult.admin)}</span></div>
                                    </div>
                                     <div className="space-y-1 text-xs text-gray-500 bg-gray-100 p-3 rounded-md">
                                        <div className="flex justify-between"><span >Serial Number (SN)</span><span className="font-mono">{paymentResult.sn}</span></div>
                                        <div className="flex justify-between"><span >Ref ID</span><span className="font-mono">{paymentResult.ref_id}</span></div>
                                     </div>
                                    <button onClick={resetTransaction} className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700">
                                        Lakukan Transaksi Lain
                                    </button>
                                </div>
                            ) : (
                                // --- TAMPILAN GAGAL (TETAP SAMA) ---
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Gagal</h3>
                                        <p className="text-sm text-red-700 bg-red-50 p-3 mt-2 rounded-lg">{paymentResult.message}</p>
                                    </div>
                                    <button onClick={resetTransaction} className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700">
                                        Coba Lagi
                                    </button>
                                </div>
                            )
                        ) : inquiryResult ? (
                            // TAMPILAN INQUIRY (TETAP SAMA)
                            <div className="space-y-4">
                                <p className="w-full font-semibold text-md text-center text-gray-800 border-b pb-3">Detail Tagihan</p>
                                <div className="space-y-2 text-sm">
                                    <h4 className="font-semibold text-gray-800">Detail Pelanggan</h4>
                                    <div className="flex justify-between"><span className="text-gray-500">Nomor VA</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Jumlah Peserta</span><span className="font-medium text-gray-900">{inquiryResult.desc?.jumlah_peserta} Orang</span></div>
                                </div>
                                <div className="w-full h-px bg-gray-100" />
                                <div className="space-y-2 text-sm">
                                    <h4 className="font-semibold text-gray-800">Rincian Biaya</h4>
                                    <div className="flex justify-between"><span className="text-gray-500">Jumlah Bulan</span><span className="font-medium text-gray-900">{inquiryResult.desc?.lembar_tagihan} Bulan</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Tagihan Pokok</span><span className="font-medium text-gray-900">{formatRupiah(inquiryResult.price - inquiryResult.admin)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Biaya Admin</span><span className="font-medium text-gray-900">{formatRupiah(inquiryResult.admin)}</span></div>
                                </div>
                                <div className="w-full h-px bg-gray-200" />
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-semibold text-gray-800 text-lg">Total Pembayaran</span>
                                    <span className="font-bold text-xl text-blue-600">{formatRupiah(inquiryResult.selling_price)}</span>
                                </div>
                            </div>
                        ) : (
                            // FORM INPUT AWAL (TETAP SAMA)
                            <form onSubmit={handleInquiry} className="space-y-4">
                                <div>
                                    <label htmlFor="customer_no" className="block text-sm font-medium text-gray-700 mb-1">Nomor Virtual Account</label>
                                    <input
                                        id="customer_no" type="number" value={customerNo} onChange={(e) => setCustomerNo(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoading} required placeholder="Contoh: 8888801234567890"
                                    />
                                </div>
                                <button
                                    type="submit" disabled={isLoading || !customerNo}
                                    className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                >
                                    {isLoading ? 'Mengecek...' : 'Cek Tagihan'}
                                </button>
                            </form>
                        )}
                        {error && !isModalOpen && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                    </div>
                </main>
                
                {inquiryResult && !paymentResult && (
                    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
                       <div className="flex items-center justify-between w-full">
                            <div>
                                <p className="text-sm text-gray-600">Total Pembayaran</p>
                                <p className="text-xl font-bold text-blue-600">{formatRupiah(inquiryResult.selling_price)}</p>
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
                                        {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/></svg>}
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