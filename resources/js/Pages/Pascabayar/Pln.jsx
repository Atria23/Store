import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

export default function PlnPascaIndex({ auth }) {
    // State untuk alur PLN Satuan
    const [customerNo, setCustomerNo] = useState(''); // For single inquiry
    const [inquiryResult, setInquiryResult] = useState(null); // For single inquiry result
    const [paymentResult, setPaymentResult] = useState(null); // For single payment result

    // State untuk alur PLN Massal
    const [customerNosInput, setCustomerNosInput] = useState(''); // Textarea input for multiple customer numbers
    const [bulkInquiryResults, setBulkInquiryResults] = useState(null); // {successful: [], failed: []}
    const [bulkPaymentResults, setBulkPaymentResults] = useState(null); // {results: [], total_refund_amount, total_paid_amount}

    // State untuk UI & proses pembayaran
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false); // NEW: State untuk mode transaksi (satuan/massal)

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const userBalance = auth.user.balance;

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    // Calculate total amount for bulk payment based on successful inquiries
    const totalAmountToPayBulk = useMemo(() => {
        if (!bulkInquiryResults || !bulkInquiryResults.successful) return 0;
        return bulkInquiryResults.successful.reduce((sum, item) => sum + item.selling_price, 0);
    }, [bulkInquiryResults]);

    const totalBulkDiscount = useMemo(() => {
        if (!bulkInquiryResults || !bulkInquiryResults.successful) return 0;
        return bulkInquiryResults.successful.reduce((sum, item) => sum + (item.diskon || 0), 0);
    }, [bulkInquiryResults]);

    // Mengosongkan error saat input/mode berubah untuk UX yang lebih baik
    useEffect(() => {
        if (error) {
            setError('');
        }
    }, [customerNo, customerNosInput, password, isBulkMode]);


    // Langkah 1A: Cek Tagihan Satuan (Single Inquiry)
    const handleInquiry = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setInquiryResult(null); // Clear single inquiry result
        setBulkInquiryResults(null); // Clear bulk results if doing single
        setPaymentResult(null); // Clear payment results
        setBulkPaymentResults(null); // Clear bulk payment results

        try {
            const response = await fetch(route('pln.pasca.inquiry'), {
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

    // Langkah 1B: Cek Tagihan Massal (Bulk Inquiry)
    const handleBulkInquiry = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setInquiryResult(null); // Clear single inquiry result
        setBulkInquiryResults(null); // Clear previous bulk inquiry results
        setPaymentResult(null); // Clear payment results
        setBulkPaymentResults(null); // Clear bulk payment results

        const customerNos = customerNosInput.split(/[\n,;\s]+/) // Split by newline, comma, semicolon, or space
            .map(num => num.trim())
            .filter(num => num.length >= 10); // Filter out empty or too short entries

        if (customerNos.length === 0) {
            setError('Masukkan setidaknya satu ID Pelanggan yang valid.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(route('pln.pasca.bulk-inquiry'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ customer_nos: customerNos }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Gagal melakukan pengecekan tagihan massal.');
            }
            setBulkInquiryResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Langkah 2: Buka Modal Konfirmasi (Satuan atau Massal)
    const handleBayarClick = () => {
        const amountToCheck = isBulkMode ? totalAmountToPayBulk : inquiryResult?.selling_price;
        if (userBalance < amountToCheck) {
            setError("Saldo tidak mencukupi untuk melakukan transaksi.");
            return;
        }
        setError('');
        setPassword('');
        setIsModalOpen(true);
    };

    // Langkah 3: Kirim Transaksi setelah Konfirmasi Password (Satuan atau Massal)
    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Silakan masukkan password untuk melanjutkan.");
            return;
        }
        // Pastikan ada tagihan yang berhasil di-inquiry sebelum mencoba pembayaran
        if ((!inquiryResult && !isBulkMode) || (isBulkMode && (!bulkInquiryResults || bulkInquiryResults.successful.length === 0))) {
            setError('Tidak ada tagihan yang siap dibayar.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Step 1: Verifikasi Password
            const verifyResponse = await fetch('/auth/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ password }),
            });
            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyData.success) {
                throw new Error("Password yang Anda masukkan salah.");
            }

            // Step 2: Lakukan Pembayaran (Satuan atau Massal)
            let paymentResponse;
            if (isBulkMode) {
                const customerNosToPay = bulkInquiryResults.successful.map(item => item.customer_no);
                paymentResponse = await fetch(route('pln.pasca.bulk-payment'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ customer_nos_to_pay: customerNosToPay }), // Send only customer numbers to pay
                });
            } else {
                paymentResponse = await fetch(route('pln.pasca.payment'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ customer_no: inquiryResult.customer_no }),
                });
            }

            const data = await paymentResponse.json();
            if (!paymentResponse.ok) {
                setError(data.message || 'Gagal melakukan pembayaran.');
                // Bahkan jika ada error, set hasil pembayaran untuk potensi partial success (bulk)
                isBulkMode ? setBulkPaymentResults(data) : setPaymentResult(data);
                return; // Hentikan eksekusi jika ada error
            }

            // Jika sukses (atau sukses sebagian untuk bulk)
            isBulkMode ? setBulkPaymentResults(data) : setPaymentResult(data);
            setInquiryResult(null);
            setBulkInquiryResults(null);
            setCustomerNo(''); // Clear input for single
            setCustomerNosInput(''); // Clear input for bulk
            setIsModalOpen(false);

            router.reload({ only: ['auth'] }); // Refresh user balance

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Determine current view mode
    const isViewingPaymentResult = paymentResult || (bulkPaymentResults && (bulkPaymentResults.results && bulkPaymentResults.results.length > 0));
    const isViewingInquiryResult = inquiryResult || (bulkInquiryResults && (bulkInquiryResults.successful.length > 0 || bulkInquiryResults.failed.length > 0));
    const showInitialForms = !isViewingInquiryResult && !isViewingPaymentResult;

    // Handle back button from inquiry results
    const handleBackFromInquiry = () => {
        setInquiryResult(null);
        setBulkInquiryResults(null);
        setPaymentResult(null);
        setBulkPaymentResults(null);
        setError('');
        setCustomerNo('');
        setCustomerNosInput('');
        setIsBulkMode(false); // Reset mode
    };

    return (
        <>
            <Head title="PLN Pascabayar" />
            <div className="mx-auto w-full max-w-[500px] bg-gray-50 flex flex-col min-h-screen">

                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex items-center space-x-4 px-4 py-3 bg-main text-white shadow-md">
                    <button className="shrink-0 w-6 h-6" onClick={() => (isViewingPaymentResult || isViewingInquiryResult) ? handleBackFromInquiry() : window.history.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                    </button>
                    <div className="font-semibold text-lg">PLN Pascabayar</div>
                </header>

                <main className="w-full pt-16 pb-40 px-4 space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        {isViewingPaymentResult ? (
                            // --- TAMPILAN SETELAH PEMBAYARAN (SINGLE / BULK) ---
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
                                    <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Selesai</h3>
                                    <p className="text-sm text-gray-500">
                                        {paymentResult ? 'Pembayaran Tagihan PLN Pascabayar' : 'Pembayaran Tagihan PLN Pascabayar Massal'}
                                    </p>
                                </div>

                                {paymentResult && ( // Display for single payment result
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600">Total Pembayaran</p>
                                        <p className="text-3xl font-bold text-main">
                                            {formatRupiah(paymentResult.selling_price)}
                                        </p>
                                    </div>
                                )}

                                {bulkPaymentResults && ( // Display for bulk payment results
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                                            <p className="text-sm text-gray-600">Total Pembayaran Berhasil</p>
                                            <p className="text-3xl font-bold text-main">
                                                {formatRupiah(bulkPaymentResults.results.filter(r => r.status === 'Sukses').reduce((sum, item) => sum + item.selling_price, 0))}
                                            </p>
                                        </div>
                                        {bulkPaymentResults.results.some(r => r.status !== 'Sukses') && (
                                            <div className="text-center text-sm text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                                                Ada {bulkPaymentResults.results.filter(r => r.status !== 'Sukses').length} transaksi yang gagal. Saldo akan dikembalikan.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {(paymentResult?.diskon > 0 || (bulkPaymentResults && bulkPaymentResults.results && bulkPaymentResults.results.some(r => r.diskon > 0))) && (
                                    <div className="text-center text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                                        {paymentResult?.diskon > 0 && `Anda hemat ${formatRupiah(paymentResult.diskon)}!`}
                                        {bulkPaymentResults && !paymentResult && `Total diskon: ${formatRupiah(bulkPaymentResults.results.reduce((sum, item) => sum + (item.diskon || 0), 0))}!`}
                                    </div>
                                )}

                                {paymentResult && ( // Customer details only for single payment result
                                    <div className="space-y-2 text-sm">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">
                                            Detail Pelanggan
                                        </h4>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Nama</span>
                                            <span className="font-medium text-right">{paymentResult.customer_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">ID Pelanggan</span>
                                            <span className="font-medium">{paymentResult.customer_no}</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => router.visit(route("postpaid.history.index"))}
                                    className="w-full py-2 px-4 border border-main text-main font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Riwayat Transaksi
                                </button>
                                <button
                                    onClick={handleBackFromInquiry} // Use reset function
                                    className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                    Transaksi Lagi
                                </button>
                            </div>
                        ) : isViewingInquiryResult ? (
                            // --- TAMPILAN SETELAH INQUIRY SUKSES (SINGLE / BULK) ---
                            <div className="space-y-4">
                                <p className="w-full font-semibold text-md text-center text-gray-800">
                                    {inquiryResult ? 'Detail Tagihan' : 'Ringkasan Pengecekan Tagihan Massal'}
                                </p>
                                <div className="w-full h-px bg-gray-200" />

                                {inquiryResult && ( // Single inquiry result display
                                    <>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Tarif/Daya</span><span className="font-medium text-gray-900">{`${inquiryResult.desc.tarif} / ${inquiryResult.desc.daya}VA`}</span></div>
                                        </div>

                                        {inquiryResult.desc.detail && inquiryResult.desc.detail.length > 0 && (
                                            <div className="space-y-2 text-sm border-t pt-2">
                                                <h4 className="font-semibold text-md text-gray-800 pb-1">Rincian per periode Tagihan</h4>
                                                {inquiryResult.desc.detail.map((detail, index) => (
                                                    <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                                                        <p className="font-medium text-gray-700">Periode: {detail.periode}</p>
                                                        <div className="flex justify-between pl-2">
                                                            <span className="text-gray-500">Nilai Tagihan</span>
                                                            <span className="font-medium">{formatRupiah(detail.nilai_tagihan)}</span>
                                                        </div>
                                                        <div className="flex justify-between pl-2">
                                                            <span className="text-gray-500">Admin (per periode)</span>
                                                            <span className="font-medium">{formatRupiah(detail.admin)}</span>
                                                        </div>
                                                        {detail.denda > 0 && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Denda (per periode)</span>
                                                                <span className="font-medium text-red-600">{formatRupiah(detail.denda)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between pl-2">
                                                            <span className="text-gray-500">Meter Awal - Akhir</span>
                                                            <span className="font-medium">{detail.meter_awal} - {detail.meter_akhir}</span>
                                                        </div>
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

                                            {inquiryResult.desc.detail && inquiryResult.desc.detail.length > 0 && (() => {
                                                const totalAdminFromDetails = inquiryResult.desc.detail.reduce((sum, item) => sum + parseFloat(item.admin || 0), 0);
                                                return (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-500">Total Biaya Admin</span>
                                                        <span className="font-medium text-gray-900">{formatRupiah(totalAdminFromDetails)}</span>
                                                    </div>
                                                );
                                            })()}

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
                                    </>
                                )}

                                {bulkInquiryResults && ( // Bulk inquiry result display
                                    <div className="space-y-4">
                                        {bulkInquiryResults.successful.length > 0 && (
                                            <>
                                                <p className="font-semibold text-gray-800">Tagihan Berhasil Ditemukan ({bulkInquiryResults.successful.length})</p>
                                                {bulkInquiryResults.successful.map((item, index) => {
                                                    const totalAdminFromDetails = item.desc.detail ? item.desc.detail.reduce((sum, d) => sum + parseFloat(d.admin || 0), 0) : (item.admin || 0);
                                                    return (
                                                        <div key={index} className="border border-blue-200 bg-blue-50 p-3 rounded-lg space-y-1 text-sm">
                                                            <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{item.customer_no}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{item.customer_name}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Tarif/Daya</span><span className="font-medium text-gray-900">{`${item.desc.tarif} / ${item.desc.daya}VA`}</span></div>

                                                            {item.desc.detail && item.desc.detail.length > 0 && (
                                                                <div className="space-y-1 text-xs border-t pt-1 mt-1">
                                                                    <h5 className="font-semibold text-gray-700">Rincian per periode</h5>
                                                                    {item.desc.detail.map((detail, detailIndex) => (
                                                                        <div key={detailIndex} className="pb-1 mb-1 last:border-b-0 last:pb-0">
                                                                            <p className="font-medium text-gray-600">Periode: {detail.periode}</p>
                                                                            <div className="flex justify-between pl-2">
                                                                                <span className="text-gray-500">Nilai Tagihan</span>
                                                                                <span className="font-medium">{formatRupiah(detail.nilai_tagihan)}</span>
                                                                            </div>
                                                                            {detail.denda > 0 && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Denda</span>
                                                                                    <span className="font-medium text-red-600">{formatRupiah(detail.denda)}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-between pl-2">
                                                                                <span className="text-gray-500">Admin</span>
                                                                                <span className="font-medium">{formatRupiah(detail.admin)}</span>
                                                                            </div>
                                                                            <div className="flex justify-between pl-2">
                                                                                <span className="text-gray-500">Meter Awal - Akhir</span>
                                                                                <span className="font-medium">{detail.meter_awal} - {detail.meter_akhir}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="space-y-1 text-sm border-t pt-1 mt-1">
                                                                <h5 className="font-semibold text-gray-800">Ringkasan</h5>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Total Nilai Tagihan</span>
                                                                    <span className="font-medium text-gray-900">{formatRupiah(item.price)}</span>
                                                                </div>
                                                                {item.denda > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Total Denda</span>
                                                                        <span className="font-medium text-red-600">{formatRupiah(item.denda)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Total Biaya Admin</span>
                                                                    <span className="font-medium text-gray-900">{formatRupiah(totalAdminFromDetails)}</span>
                                                                </div>
                                                                {item.diskon > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Diskon</span>
                                                                        <span className="font-medium text-green-600">- {formatRupiah(item.diskon)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="w-full h-px bg-gray-200 mt-2" />
                                                                <div className="flex justify-between items-center pt-2">
                                                                    <span className="font-semibold text-gray-800">Total Bayar</span>
                                                                    <span className="font-bold text-lg text-main">{formatRupiah(item.selling_price)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        )}

                                        {bulkInquiryResults.failed.length > 0 && (
                                            <>
                                                <p className="font-semibold text-red-700 mt-4">Tagihan Gagal Ditemukan ({bulkInquiryResults.failed.length})</p>
                                                {bulkInquiryResults.failed.map((item, index) => (
                                                    <div key={index} className="border border-red-300 bg-red-50 p-3 rounded-lg space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">ID Pelanggan</span>
                                                            <span className="font-bold text-red-800">{item.customer_no}</span>
                                                        </div>
                                                        <p className="text-xs text-red-600 mt-1">{item.message}</p>
                                                    </div>
                                                ))}
                                            </>
                                        )}
                                        {bulkInquiryResults.successful.length > 0 && (
                                            <>
                                                <div className="w-full h-px bg-gray-200 mt-4" />
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-gray-800">Total Pembayaran Massal</span>
                                                    <span className="font-bold text-xl text-main">{formatRupiah(totalAmountToPayBulk)}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // --- TAMPILAN AWAL (FORM INPUT SINGLE / BULK) ---
                            <div className="space-y-6">
                                <div className="flex space-x-2 mb-4">
                                    <button
                                        onClick={() => setIsBulkMode(false)}
                                        className={`w-1/2 py-2 text-sm font-semibold rounded-lg ${!isBulkMode ? 'bg-main text-white' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                        Transaksi Satuan
                                    </button>
                                    <button
                                        onClick={() => setIsBulkMode(true)}
                                        className={`w-1/2 py-2 text-sm font-semibold rounded-lg ${isBulkMode ? 'bg-main text-white' : 'bg-gray-200 text-gray-700'}`}
                                    >
                                        Transaksi Massal
                                    </button>
                                </div>

                                {/* Form Satuan */}
                                {!isBulkMode && (
                                    <form onSubmit={handleInquiry} className="space-y-4">
                                        <h3 className="font-semibold text-lg text-gray-800">Cek Tagihan Satuan</h3>
                                        <div>
                                            <label htmlFor="customer_no" className="block text-sm font-medium text-gray-700 mb-1">ID Pelanggan PLN</label>
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
                                                disabled={isLoading} required placeholder="Masukkan ID Pelanggan"
                                            />
                                        </div>
                                        <button
                                            type="submit" disabled={isLoading || !customerNo}
                                            className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                        >
                                            {isLoading ? 'Mengecek...' : 'Lanjutkan'}
                                        </button>
                                    </form>
                                )}

                                {/* Form Massal */}
                                {isBulkMode && (
                                    <form onSubmit={handleBulkInquiry} className="space-y-4">
                                        <h3 className="font-semibold text-lg text-gray-800">Cek Tagihan Massal</h3>
                                        <div>
                                            <label htmlFor="customer_nos_bulk" className="block text-sm font-medium text-gray-700 mb-1">
                                                ID Pelanggan PLN (Pisahkan dengan koma, spasi, atau baris baru)
                                            </label>
                                            <textarea
                                                id="customer_nos_bulk"
                                                value={customerNosInput}
                                                onChange={(e) => setCustomerNosInput(e.target.value)}
                                                rows="5"
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled={isLoading}
                                                required
                                                placeholder="Contoh:&#10;123456789012&#10;098765432109, 112233445566"
                                            />
                                        </div>
                                        <button
                                            type="submit" disabled={isLoading || !customerNosInput.trim()}
                                            className="w-full py-2 px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                                        >
                                            {isLoading ? 'Mengecek Massal...' : 'Lanjutkan Massal'}
                                        </button>
                                    </form>
                                )}
                                {error && !isModalOpen && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                            </div>
                        )}
                    </div>
                </main>

                {/* Footer for action buttons (Single or Bulk) */}
                {((inquiryResult && !isBulkMode) || (bulkInquiryResults && bulkInquiryResults.successful.length > 0 && isBulkMode)) && !isViewingPaymentResult && (
                    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <p className="text-sm text-gray-600">Total Pembayaran</p>
                                <p className="text-xl font-bold text-main">
                                    {isBulkMode ? formatRupiah(totalAmountToPayBulk) : formatRupiah(inquiryResult.selling_price)}
                                </p>
                            </div>
                            <button
                                onClick={handleBayarClick}
                                disabled={userBalance < (isBulkMode ? totalAmountToPayBulk : inquiryResult.selling_price)}
                                className="px-6 py-2 rounded-lg font-semibold text-white bg-main hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {userBalance < (isBulkMode ? totalAmountToPayBulk : inquiryResult.selling_price) ? "Saldo Kurang" : "Bayar Sekarang"}
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