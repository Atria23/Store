import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';

export default function Pdam({ auth, products }) {
    // State untuk alur PDAM Satuan
    const [customerNo, setCustomerNo] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [inquiryResult, setInquiryResult] = useState(null); // Hasil inquiry satuan
    const [paymentResult, setPaymentResult] = useState(null); // Hasil pembayaran satuan

    // State untuk alur PDAM Massal
    const [customerNosInput, setCustomerNosInput] = useState(''); // Input textarea
    const [bulkInquiryResults, setBulkInquiryResults] = useState(null); // {successful: [], failed: []}
    const [bulkPaymentResults, setBulkPaymentResults] = useState(null); // {results: [], total_refund_amount, total_paid_amount}
    const [isBulkMode, setIsBulkMode] = useState(false); // Mode tampilan: false=satuan, true=massal

    // State untuk UI
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const userBalance = auth.user.balance;

    const stickyHeaderRef = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        if (stickyHeaderRef.current) {
            setHeaderHeight(stickyHeaderRef.current.offsetHeight);
        }
    }, [selectedProduct, inquiryResult, paymentResult, bulkInquiryResults]); // Update header height when relevant states change

    useEffect(() => {
        // Clear error when inputs/modes change
        if (error) {
            setError('');
        }
    }, [customerNo, password, selectedProduct, searchTerm, customerNosInput, isBulkMode]);

    const formatRupiah = (number) => {
        const num = parseFloat(number);
        if (isNaN(num)) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(0);
        }
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    // Kalkulasi total yang harus dibayar untuk bulk payment
    const totalAmountToPayBulk = useMemo(() => {
        if (!bulkInquiryResults || !bulkInquiryResults.successful) return 0;
        return bulkInquiryResults.successful.reduce((sum, item) => sum + item.selling_price, 0);
    }, [bulkInquiryResults]);

    // Kalkulasi total diskon untuk bulk inquiry
    const totalBulkDiscount = useMemo(() => {
        if (!bulkInquiryResults || !bulkInquiryResults.successful) return 0;
        return bulkInquiryResults.successful.reduce((sum, item) => sum + (item.diskon || 0), 0);
    }, [bulkInquiryResults]);

    // Langkah 1A: Cek Tagihan Satuan (Inquiry)
    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!selectedProduct) {
            setError('Silakan pilih produk terlebih dahulu.');
            return;
        }
        if (!selectedProduct.seller_product_status) {
            setError('Produk ini sedang mengalami gangguan. Silakan pilih produk lain.');
            return;
        }

        setIsLoading(true);
        setError('');
        setInquiryResult(null);
        setPaymentResult(null);
        setBulkInquiryResults(null);
        setBulkPaymentResults(null);

        try {
            const response = await fetch(route('pascapdam.inquiry'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    customer_no: customerNo,
                    buyer_sku_code: selectedProduct.buyer_sku_code
                })
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
        if (!selectedProduct) {
            setError('Silakan pilih produk PDAM terlebih dahulu.');
            return;
        }
        if (!selectedProduct.seller_product_status) {
            setError('Produk ini sedang mengalami gangguan. Silakan pilih produk lain.');
            return;
        }

        setIsLoading(true);
        setError('');
        setInquiryResult(null);
        setPaymentResult(null);
        setBulkInquiryResults(null);
        setBulkPaymentResults(null);

        const customerNos = customerNosInput.split(/[\n,;\s]+/)
            .map(num => num.trim())
            .filter(num => num.length >= 4); // PDAM min 4 digits

        if (customerNos.length === 0) {
            setError('Masukkan setidaknya satu ID Pelanggan yang valid.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(route('pascapdam.bulk-inquiry'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({
                    customer_nos: customerNos,
                    buyer_sku_code: selectedProduct.buyer_sku_code
                }),
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
            setError("Saldo Anda tidak mencukupi untuk melakukan transaksi.");
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
        if ((!inquiryResult && !isBulkMode) || (isBulkMode && (!bulkInquiryResults || bulkInquiryResults.successful.length === 0))) {
            setError('Tidak ada tagihan yang siap dibayar.');
            return;
        }
        setIsLoading(true);
        setError('');
        setPaymentResult(null);
        setBulkPaymentResults(null);

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
                paymentResponse = await fetch(route('pascapdam.bulk-payment'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ customer_nos_to_pay: customerNosToPay }),
                });
            } else {
                paymentResponse = await fetch(route('pascapdam.payment'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ customer_no: inquiryResult.customer_no }),
                });
            }

            const data = await paymentResponse.json();
            if (!paymentResponse.ok) {
                setError(data.message || 'Gagal melakukan pembayaran.');
                // Even on error, set payment results for potential partial success in bulk
                isBulkMode ? setBulkPaymentResults(data) : setPaymentResult(data);
                return; // Stop execution on error
            }

            // Jika sukses (atau sukses sebagian untuk bulk)
            isBulkMode ? setBulkPaymentResults(data) : setPaymentResult(data);
            setInquiryResult(null);
            setBulkInquiryResults(null);
            setIsModalOpen(false);
            setPassword('');
            router.reload({ only: ['auth'] }); // Refresh user balance

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Conditional rendering flags
    const isViewingPaymentResult = paymentResult || (bulkPaymentResults && bulkPaymentResults.results && bulkPaymentResults.results.length > 0);
    const isViewingInquiryResult = inquiryResult || (bulkInquiryResults && (bulkInquiryResults.successful.length > 0 || bulkInquiryResults.failed.length > 0));
    const showProductList = !selectedProduct && !isViewingInquiryResult && !isViewingPaymentResult;
    const showSingleInquiryForm = selectedProduct && !isBulkMode && !isViewingInquiryResult && !isViewingPaymentResult;
    const showBulkInquiryForm = selectedProduct && isBulkMode && !isViewingInquiryResult && !isViewingPaymentResult;

    // Filter produk untuk pencarian
    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetTransaction = () => {
        setSelectedProduct(null);
        setCustomerNo('');
        setCustomerNosInput('');
        setInquiryResult(null);
        setBulkInquiryResults(null);
        setError('');
        setPaymentResult(null);
        setBulkPaymentResults(null);
        setSearchTerm('');
        setIsModalOpen(false);
        setPassword('');
        setIsBulkMode(false); // Reset mode
    };

    return (
        <>
            <Head title="Air Pascabayar" />

            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-gray-50 flex flex-col">
                {/* ====== HEADER ====== */}
                <header ref={stickyHeaderRef} className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-white shadow-lg">
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-3 bg-main">
                        <button className="shrink-0 w-6 h-6" onClick={() => (isViewingPaymentResult || isViewingInquiryResult || selectedProduct) ? resetTransaction() : window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-semibold text-white text-lg">Tagihan Air</div>
                    </div>

                    {showProductList && (
                        <div className="p-4 space-y-3">
                            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                                <input
                                    type="text"
                                    className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400 px-3"
                                    placeholder="Cari wilayah PDAM..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.3" className="w-5 h-5 text-main">
                                    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {selectedProduct && !isViewingInquiryResult && !isViewingPaymentResult && (
                        <div className="p-4 space-y-3 border-t">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-sm text-gray-600">Produk Pilihan:</p>
                                <p className="font-bold text-main text-right">{selectedProduct.product_name}</p>
                            </div>

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
                            {showSingleInquiryForm && (
                                <form onSubmit={handleInquiry} className='space-y-3'>
                                    <div>
                                        <label htmlFor="customer_no_input" className="block text-sm font-medium text-gray-700 mb-1">Nomor Pelanggan</label>
                                        <input
                                            id="customer_no_input" type="text" inputMode="numeric" pattern="[0-9]*"
                                            value={customerNo} onChange={(e) => { const value = e.target.value; if (/^\d*$/.test(value)) { setCustomerNo(value); } }}
                                            onWheel={(e) => e.target.blur()}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading || !selectedProduct.seller_product_status} required placeholder="Masukkan nomor pelanggan"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                                    <div className="flex space-x-2">
                                        <button type="button" onClick={resetTransaction} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Pilih Ulang</button>
                                        <button type="submit" disabled={isLoading || !customerNo || !selectedProduct.seller_product_status} className="w-full bg-main text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                                            {isLoading ? 'Mengecek...' : 'Cek Tagihan'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Form Massal */}
                            {showBulkInquiryForm && (
                                <form onSubmit={handleBulkInquiry} className='space-y-3'>
                                    <div>
                                        <label htmlFor="customer_nos_bulk" className="block text-sm font-medium text-gray-700 mb-1">
                                            ID Pelanggan (Pisahkan dengan koma, spasi, atau baris baru)
                                        </label>
                                        <textarea
                                            id="customer_nos_bulk"
                                            value={customerNosInput}
                                            onChange={(e) => setCustomerNosInput(e.target.value)}
                                            rows="5"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            disabled={isLoading || !selectedProduct.seller_product_status}
                                            required
                                            placeholder="Contoh:&#10;123456789012&#10;098765432109, 112233445566"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                                    <div className="flex space-x-2">
                                        <button type="button" onClick={resetTransaction} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Pilih Ulang</button>
                                        <button type="submit" disabled={isLoading || !customerNosInput.trim() || !selectedProduct.seller_product_status} className="w-full bg-main text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                                            {isLoading ? 'Mengecek Massal...' : 'Cek Tagihan Massal'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </header>

                {/* ====== MAIN CONTENT ====== */}
                <main style={{ paddingTop: `${headerHeight}px` }} className="w-full pt-4 pb-40 px-4 space-y-4 flex-grow">
                    <div className="mt-4 bg-white p-4 rounded-lg shadow-sm border">
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
                                    <h3 className="text-lg font-bold text-gray-800 mt-2">
                                        Pembayaran Selesai
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {isBulkMode ? 'Pembayaran Tagihan Air Massal' : 'Pembayaran Tagihan Air Anda berhasil.'}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-600">Total Pembayaran Berhasil</p>
                                    <p className="text-3xl font-bold text-main">
                                        {formatRupiah(isBulkMode ? bulkPaymentResults.total_paid_amount : paymentResult.selling_price)}
                                    </p>
                                </div>

                                {isBulkMode && bulkPaymentResults.results.filter(r => r.status !== 'Sukses').length > 0 && (
                                    <div className="text-center text-sm text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                                        Ada {bulkPaymentResults.results.filter(r => r.status !== 'Sukses').length} transaksi yang gagal. Saldo akan dikembalikan.
                                    </div>
                                )}

                                {paymentResult?.diskon > 0 && (
                                    <div className="text-center text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                                        Anda hemat {formatRupiah(paymentResult.diskon)}!
                                    </div>
                                )}
                                {isBulkMode && totalBulkDiscount > 0 && (
                                    <div className="text-center text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                                        Total diskon: {formatRupiah(totalBulkDiscount)}!
                                    </div>
                                )}


                                {paymentResult && paymentResult.status !== "Sukses" && (
                                    <div className="text-sm text-red-700 bg-red-50 p-3 mt-2 rounded-lg">
                                        {paymentResult.message || "Terjadi kesalahan saat memproses pembayaran Anda."}
                                    </div>
                                )}

                                <button
                                    onClick={() => router.visit(route("postpaid.history.index"))}
                                    className="w-full py-2 px-4 border border-main text-main font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Riwayat Transaksi
                                </button>
                                <button
                                    onClick={resetTransaction}
                                    className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700"
                                >
                                    Lakukan Transaksi Lain
                                </button>
                            </div>
                        ) : isViewingInquiryResult ? (
                            // --- TAMPILAN DETAIL TAGIHAN (INQUIRY: Satuan atau Massal) ---
                            <div className="space-y-4">
                                <p className="w-full font-semibold text-md text-center text-gray-800 pb-3 border-b">
                                    {isBulkMode ? 'Ringkasan Pengecekan Tagihan Massal' : 'Detail Tagihan'}
                                </p>

                                {inquiryResult && !isBulkMode && ( // Single inquiry result display
                                    <>
                                        <div className="space-y-2 text-sm">
                                            <h4 className="font-semibold text-gray-800">Detail Pelanggan</h4>
                                            <div className="flex justify-between"><span className="text-gray-500">ID Pelanggan</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
                                            {inquiryResult.desc?.alamat && inquiryResult.desc.alamat !== '-' && <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-right">{inquiryResult.desc.alamat}</span></div>}
                                            {inquiryResult.jumlah_lembar_tagihan > 0 && <div className="flex justify-between"><span className="text-gray-500">Jumlah Tagihan</span><span className="font-medium">{inquiryResult.jumlah_lembar_tagihan} Lembar</span></div>}
                                            {inquiryResult.desc?.jatuh_tempo && <div className="flex justify-between"><span className="text-gray-500">Jatuh Tempo</span><span className="font-medium">{inquiryResult.desc.jatuh_tempo}</span></div>}
                                            {inquiryResult.desc?.tarif && <div className="flex justify-between"><span className="text-gray-500">Tarif</span><span className="font-medium">{inquiryResult.desc.tarif}</span></div>}
                                        </div>

                                        {inquiryResult.desc?.detail && inquiryResult.desc.detail.length > 0 && (
                                            <div className="space-y-2 text-sm border-t pt-2">
                                                <h4 className="font-semibold text-md text-gray-800 pb-1">Rincian per Periode Tagihan</h4>
                                                {inquiryResult.desc.detail.map((detail, index) => (
                                                    <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                                                        <p className="font-medium text-gray-700">Periode: {detail.periode}</p>
                                                        {detail.meter_awal && detail.meter_akhir && (detail.meter_awal !== '-' || detail.meter_akhir !== '-') && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Meter Awal - Akhir</span>
                                                                <span className="font-medium">{detail.meter_awal} - {detail.meter_akhir}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between pl-2">
                                                            <span className="text-gray-500">Nilai Tagihan</span>
                                                            <span className="font-medium">{formatRupiah(detail.nilai_tagihan)}</span>
                                                        </div>
                                                        {parseFloat(detail.denda) > 0 && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Denda</span>
                                                                <span className="font-medium text-red-600">{formatRupiah(detail.denda)}</span>
                                                            </div>
                                                        )}
                                                        {parseFloat(detail.biaya_lain) > 0 && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Biaya Lainnya</span>
                                                                <span className="font-medium">{formatRupiah(detail.biaya_lain)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="space-y-2 text-sm border-t pt-2">
                                            <h4 className="font-semibold text-md text-gray-800 pb-1">Ringkasan Pembayaran</h4>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total Tagihan Pokok (+Biaya Lain)</span>
                                                <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.price)}</span>
                                            </div>
                                            {parseFloat(inquiryResult.denda) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Total Denda</span>
                                                    <span className="font-medium text-red-600">{formatRupiah(inquiryResult.denda)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total Biaya Admin</span>
                                                <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.admin)}</span>
                                            </div>
                                            {parseFloat(inquiryResult.diskon) > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Diskon</span>
                                                    <span className="font-medium text-green-600">- {formatRupiah(inquiryResult.diskon)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-full h-px bg-gray-200" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-800">Total Pembayaran Akhir</span>
                                            <span className="font-bold text-xl text-blue-600">{formatRupiah(inquiryResult.selling_price)}</span>
                                        </div>
                                    </>
                                )}

                                {bulkInquiryResults && isBulkMode && ( // Bulk inquiry result display
                                    <div className="space-y-4">
                                        {bulkInquiryResults.successful.length > 0 && (
                                            <>
                                                <p className="font-semibold text-gray-800">Tagihan Berhasil Ditemukan ({bulkInquiryResults.successful.length})</p>
                                                {bulkInquiryResults.successful.map((item, index) => {
                                                    const totalAdminFromDetails = item.admin; // PDAM admin is often per transaction, not per detail
                                                    return (
                                                        <div key={index} className="border border-blue-200 bg-blue-50 p-3 rounded-lg space-y-1 text-sm">
                                                            <p className="font-semibold text-main text-base mb-2">{item.product_name}</p>
                                                            <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{item.customer_no}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{item.customer_name}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Tarif</span><span className="font-medium text-gray-900">{item.desc?.tarif || '-'}</span></div>
                                                            {item.desc?.alamat && item.desc.alamat !== '-' && <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-gray-900 text-right">{item.desc.alamat}</span></div>}


                                                            {item.desc?.detail && item.desc.detail.length > 0 && (
                                                                <div className="space-y-1 text-xs border-t pt-1 mt-1">
                                                                    <h5 className="font-semibold text-gray-700">Rincian per Periode</h5>
                                                                    {item.desc.detail.map((detail, detailIndex) => (
                                                                        <div key={detailIndex} className="pb-1 mb-1 last:border-b-0 last:pb-0">
                                                                            <p className="font-medium text-gray-600">Periode: {detail.periode}</p>
                                                                            {detail.meter_awal && detail.meter_akhir && (detail.meter_awal !== '-' || detail.meter_akhir !== '-') && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Meter Awal - Akhir</span>
                                                                                    <span className="font-medium">{detail.meter_awal} - {detail.meter_akhir}</span>
                                                                                </div>
                                                                            )}
                                                                            <div className="flex justify-between pl-2">
                                                                                <span className="text-gray-500">Nilai Tagihan</span>
                                                                                <span className="font-medium">{formatRupiah(detail.nilai_tagihan)}</span>
                                                                            </div>
                                                                            {parseFloat(detail.denda) > 0 && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Denda</span>
                                                                                    <span className="font-medium text-red-600">{formatRupiah(detail.denda)}</span>
                                                                                </div>
                                                                            )}
                                                                            {parseFloat(detail.biaya_lain) > 0 && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Biaya Lainnya</span>
                                                                                    <span className="font-medium">{formatRupiah(detail.biaya_lain)}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="space-y-1 text-sm border-t pt-1 mt-1">
                                                                <h5 className="font-semibold text-gray-800">Ringkasan Pembayaran</h5>
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Total Tagihan Pokok (+Biaya Lain)</span>
                                                                    <span className="font-medium text-gray-900">{formatRupiah(item.price)}</span>
                                                                </div>
                                                                {parseFloat(item.denda) > 0 && (
                                                                    <div className="flex justify-between">
                                                                        <span className="text-gray-500">Total Denda</span>
                                                                        <span className="font-medium text-red-600">{formatRupiah(item.denda)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="flex justify-between">
                                                                    <span className="text-gray-500">Total Biaya Admin</span>
                                                                    <span className="font-medium text-gray-900">{formatRupiah(totalAdminFromDetails)}</span>
                                                                </div>
                                                                {parseFloat(item.diskon) > 0 && (
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
                                                        <p className="font-semibold text-red-800 text-base mb-2">{item.product_name || 'Produk Tidak Diketahui'}</p>
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
                            // --- TAMPILAN AWAL (LIST PRODUK PDAM) ---
                            <div className="grid grid-cols-2 gap-3">
                                {filteredProducts.length > 0 ? filteredProducts.map(product => {
                                    const isDisabled = !Boolean(Number(product.seller_product_status));
                                    const isSelected = selectedProduct && selectedProduct.id === product.id;
                                    return (
                                        <div
                                            onClick={() => !isDisabled && setSelectedProduct(product)}
                                            key={product.id}
                                            className={`flex flex-col justify-between p-3 border rounded-lg shadow-sm transition-all duration-200 ${isDisabled ? "bg-gray-200 opacity-70 cursor-not-allowed" : "bg-white cursor-pointer hover:shadow-lg"} ${isSelected ? "border-main ring-2 ring-blue-500" : "border-gray-200"}`} >
                                            <h3 className="text-utama text-xs font-semibold line-clamp-2 mb-2">{product.product_name}</h3>
                                            <div className="flex flex-col items-start">
                                                <p className="text-gray-500 text-xs">Admin</p>
                                                <p className="text-main text-sm font-bold">{formatRupiah(product.calculated_admin)}</p>
                                                {isDisabled && (<p className="text-xs text-red-500 mt-1 font-medium">Gangguan</p>)}
                                            </div>
                                        </div>
                                    );
                                }) : <p className="col-span-2 text-center text-gray-500 pt-4">Produk tidak ditemukan.</p>}
                            </div>
                        )}
                        {error && !isModalOpen && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                    </div>
                </main>

                {/* ====== FOOTER (TOMBOL BAYAR) ====== */}
                {((inquiryResult && !isBulkMode) || (bulkInquiryResults && isBulkMode && bulkInquiryResults.successful.length > 0)) && !isViewingPaymentResult && (
                    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <p className="text-sm text-gray-600">Total Pembayaran Akhir</p>
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

                {/* ====== MODAL KONFIRMASI PASSWORD ====== */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm space-y-4">
                            <h2 className="text-lg font-semibold text-center">Konfirmasi Pembayaran</h2>
                            <form onSubmit={handleSubmitPayment}>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border p-2 pr-10 rounded" placeholder="Masukkan password Anda" autoFocus required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" /></svg>}
                                    </button>
                                </div>
                                {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
                                <div className="flex justify-end space-x-2 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                                    <button type="submit" disabled={isLoading || !password} className="px-4 py-2 text-sm font-medium text-white bg-main hover:bg-blue-700 rounded-lg disabled:bg-gray-400">
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