// import React, { useState, useMemo, useEffect } from 'react';
// import { Head, router } from '@inertiajs/react';

// export default function BpjsPascaIndex({ auth }) {
//     // State untuk alur BPJS Satuan
//     const [customerNo, setCustomerNo] = useState(''); // For single inquiry
//     const [inquiryResult, setInquiryResult] = useState(null); // For single inquiry result
//     const [paymentResult, setPaymentResult] = useState(null); // For single payment result

//     // State untuk alur BPJS Massal
//     const [customerNosInput, setCustomerNosInput] = useState(''); // Textarea input for multiple customer numbers
//     const [bulkInquiryResults, setBulkInquiryResults] = useState(null); // {successful: [], failed: []}
//     const [bulkPaymentResults, setBulkPaymentResults] = useState(null); // {results: [], total_refund_amount, total_paid_amount}

//     // State untuk UI & proses pembayaran
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [isBulkMode, setIsBulkMode] = useState(false); // State untuk mode transaksi (satuan/massal)

//     const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
//     const userBalance = auth.user.balance;

//     const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

//     // Calculate total amount for bulk payment based on successful inquiries
//     const totalAmountToPayBulk = useMemo(() => {
//         if (!bulkInquiryResults || !bulkInquiryResults.successful) return 0;
//         return bulkInquiryResults.successful.reduce((sum, item) => sum + item.selling_price, 0);
//     }, [bulkInquiryResults]);

//     const totalBulkDiscount = useMemo(() => {
//         if (!bulkInquiryResults || !bulkInquiryResults.successful) return 0;
//         return bulkInquiryResults.successful.reduce((sum, item) => sum + (item.diskon || 0), 0);
//     }, [bulkInquiryResults]);

//     // Mengosongkan error saat input/mode berubah untuk UX yang lebih baik
//     useEffect(() => {
//         if (error) {
//             setError('');
//         }
//     }, [customerNo, customerNosInput, password, isBulkMode]);


//     // Langkah 1A: Cek Tagihan Satuan (Single Inquiry)
//     const handleInquiry = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');
//         setInquiryResult(null); // Clear single inquiry result
//         setBulkInquiryResults(null); // Clear bulk results if doing single
//         setPaymentResult(null); // Clear payment results
//         setBulkPaymentResults(null); // Clear bulk payment results

//         try {
//             const response = await fetch(route('pascabpjs.inquiry'), { // <<< ROUTE BPJS
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
//                 body: JSON.stringify({ customer_no: customerNo }),
//             });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.message || 'Gagal melakukan pengecekan tagihan BPJS.');
//             setInquiryResult(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Langkah 1B: Cek Tagihan Massal (Bulk Inquiry)
//     const handleBulkInquiry = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');
//         setInquiryResult(null); // Clear single inquiry result
//         setBulkInquiryResults(null); // Clear previous bulk inquiry results
//         setPaymentResult(null); // Clear payment results
//         setBulkPaymentResults(null); // Clear bulk payment results

//         const customerNos = customerNosInput.split(/[\n,;\s]+/) // Split by newline, comma, semicolon, or space
//             .map(num => num.trim())
//             .filter(num => num.length >= 11); // Filter out empty or too short entries. BPJS ID is typically 11-13 digits.

//         if (customerNos.length === 0) {
//             setError('Masukkan setidaknya satu ID Pelanggan BPJS yang valid.');
//             setIsLoading(false);
//             return;
//         }

//         try {
//             const response = await fetch(route('pascabpjs.bulk-inquiry'), { // <<< ROUTE BPJS
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
//                 body: JSON.stringify({ customer_nos: customerNos }),
//             });
//             const data = await response.json();
//             if (!response.ok) {
//                 throw new Error(data.message || 'Gagal melakukan pengecekan tagihan BPJS massal.');
//             }
//             setBulkInquiryResults(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Langkah 2: Buka Modal Konfirmasi (Satuan atau Massal)
//     const handleBayarClick = () => {
//         const amountToCheck = isBulkMode ? totalAmountToPayBulk : inquiryResult?.selling_price;
//         if (userBalance < amountToCheck) {
//             setError("Saldo tidak mencukupi untuk melakukan transaksi.");
//             return;
//         }
//         setError('');
//         setPassword('');
//         setIsModalOpen(true);
//     };

//     // Langkah 3: Kirim Transaksi setelah Konfirmasi Password (Satuan atau Massal)
//     const handleSubmitPayment = async (e) => {
//         e.preventDefault();
//         if (!password) {
//             setError("Silakan masukkan password untuk melanjutkan.");
//             return;
//         }
//         // Pastikan ada tagihan yang berhasil di-inquiry sebelum mencoba pembayaran
//         if ((!inquiryResult && !isBulkMode) || (isBulkMode && (!bulkInquiryResults || bulkInquiryResults.successful.length === 0))) {
//             setError('Tidak ada tagihan BPJS yang siap dibayar.');
//             return;
//         }

//         setIsLoading(true);
//         setError('');

//         try {
//             // Step 1: Verifikasi Password
//             const verifyResponse = await fetch('/auth/verify-password', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
//                 body: JSON.stringify({ password }),
//             });
//             const verifyData = await verifyResponse.json();
//             if (!verifyResponse.ok || !verifyData.success) {
//                 throw new Error("Password yang Anda masukkan salah.");
//             }

//             // Step 2: Lakukan Pembayaran (Satuan atau Massal)
//             let paymentResponse;
//             if (isBulkMode) {
//                 const customerNosToPay = bulkInquiryResults.successful.map(item => item.customer_no);
//                 paymentResponse = await fetch(route('pascabpjs.bulk-payment'), { // <<< ROUTE BPJS
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
//                     body: JSON.stringify({ customer_nos_to_pay: customerNosToPay }), // Send only customer numbers to pay
//                 });
//             } else {
//                 paymentResponse = await fetch(route('pascabpjs.payment'), { // <<< ROUTE BPJS
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
//                     body: JSON.stringify({ customer_no: inquiryResult.customer_no }),
//                 });
//             }

//             const data = await paymentResponse.json();
//             if (!paymentResponse.ok) {
//                 setError(data.message || 'Gagal melakukan pembayaran BPJS.');
//                 // Bahkan jika ada error, set hasil pembayaran untuk potensi partial success (bulk)
//                 isBulkMode ? setBulkPaymentResults(data) : setPaymentResult(data);
//                 return; // Hentikan eksekusi jika ada error
//             }

//             // Jika sukses (atau sukses sebagian untuk bulk)
//             isBulkMode ? setBulkPaymentResults(data) : setPaymentResult(data);
//             setInquiryResult(null);
//             setBulkInquiryResults(null);
//             setCustomerNo(''); // Clear input for single
//             setCustomerNosInput(''); // Clear input for bulk
//             setIsModalOpen(false);

//             router.reload({ only: ['auth'] }); // Refresh user balance

//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Determine current view mode
//     const isViewingPaymentResult = paymentResult || (bulkPaymentResults && (bulkPaymentResults.results && bulkPaymentResults.results.length > 0));
//     const isViewingInquiryResult = inquiryResult || (bulkInquiryResults && (bulkInquiryResults.successful.length > 0 || bulkInquiryResults.failed.length > 0));
//     const showInitialForms = !isViewingInquiryResult && !isViewingPaymentResult;

//     // Handle back button from inquiry results
//     const handleBackFromInquiry = () => {
//         setInquiryResult(null);
//         setBulkInquiryResults(null);
//         setPaymentResult(null);
//         setBulkPaymentResults(null);
//         setError('');
//         setCustomerNo('');
//         setCustomerNosInput('');
//         setIsBulkMode(false); // Reset mode
//     };

//     return (
//         <>
//             <Head title="BPJS Kesehatan" />
//             <div className="mx-auto w-full max-w-[500px] bg-gray-50 flex flex-col min-h-screen">

//                 <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex items-center space-x-4 px-4 py-3 bg-main text-white shadow-md">
//                     <button className="shrink-0 w-6 h-6" onClick={() => (isViewingPaymentResult || isViewingInquiryResult) ? handleBackFromInquiry() : window.history.back()}>
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
//                     </button>
//                     <div className="font-semibold text-lg">BPJS Kesehatan</div> {/* <<< JUDUL BPJS */}
//                 </header>

//                 <main className="w-full pt-16 pb-40 px-4 space-y-4">
//                     <div className="bg-white p-4 rounded-lg shadow-sm border">
//                         {isViewingPaymentResult ? (
//                             // --- TAMPILAN SETELAH PEMBAYARAN (SINGLE / BULK) ---
//                             <div className="space-y-4">
//                                 <div className="text-center">
//                                     <svg
//                                         className="mx-auto h-12 w-12 text-green-500"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                         strokeWidth="1.5"
//                                         stroke="currentColor"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                                         />
//                                     </svg>
//                                     <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Selesai</h3>
//                                     <p className="text-sm text-gray-500">
//                                         {paymentResult ? 'Pembayaran Tagihan BPJS Kesehatan' : 'Pembayaran Tagihan BPJS Kesehatan Massal'} {/* <<< TEXT BPJS */}
//                                     </p>
//                                 </div>

//                                 {paymentResult && ( // Display for single payment result
//                                     <div className="bg-gray-50 rounded-lg p-4 text-center">
//                                         <p className="text-sm text-gray-600">Total Pembayaran</p>
//                                         <p className="text-3xl font-bold text-main">
//                                             {formatRupiah(paymentResult.selling_price)}
//                                         </p>
//                                     </div>
//                                 )}

//                                 {bulkPaymentResults && ( // Display for bulk payment results
//                                     <div className="space-y-4">
//                                         <div className="bg-gray-50 rounded-lg p-4 text-center">
//                                             <p className="text-sm text-gray-600">Total Pembayaran Berhasil</p>
//                                             <p className="text-3xl font-bold text-main">
//                                                 {formatRupiah(bulkPaymentResults.results.filter(r => r.status === 'Sukses').reduce((sum, item) => sum + item.selling_price, 0))}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {paymentResult && ( // Customer details only for single payment result
//                                     <div className="space-y-2 text-sm">
//                                         <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">
//                                             Detail Pelanggan
//                                         </h4>
//                                         <div className="flex justify-between">
//                                             <span className="text-gray-500">Nama</span>
//                                             <span className="font-medium text-right">{paymentResult.customer_name}</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                             <span className="text-gray-500">ID Pelanggan</span>
//                                             <span className="font-medium">{paymentResult.customer_no}</span>
//                                         </div>
//                                     </div>
//                                 )}

//                                 <button
//                                     onClick={() => router.visit(route("postpaid.history.index"))}
//                                     className="w-full py-2 px-4 border border-main text-main font-semibold rounded-lg hover:bg-blue-50 transition-colors"
//                                 >
//                                     Riwayat Transaksi
//                                 </button>
//                                 <button
//                                     onClick={handleBackFromInquiry} // Use reset function
//                                     className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700"
//                                 >
//                                     Transaksi Lagi
//                                 </button>
//                             </div>
//                         ) : isViewingInquiryResult ? (
//                             // --- TAMPILAN SETELAH INQUIRY SUKSES (SINGLE / BULK) ---
//                             <div className="space-y-4">
//                                 <p className="w-full font-semibold text-md text-center text-gray-800">
//                                     {inquiryResult ? 'Detail Tagihan BPJS' : 'Ringkasan Pengecekan Tagihan BPJS Massal'} {/* <<< TEXT BPJS */}
//                                 </p>
//                                 <div className="w-full h-px bg-gray-200" />

//                                 {inquiryResult && ( // Single inquiry result display
//                                     <>
//                                         <div className="space-y-2 text-sm">
//                                             <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
//                                             <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
//                                             <div className="flex justify-between"><span className="text-gray-500">Jumlah Peserta</span><span className="font-medium text-gray-900">{inquiryResult.desc.jumlah_peserta}</span></div> {/* <<< BPJS SPECIFIC */}
//                                             <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-gray-900 text-right">{inquiryResult.desc.alamat}</span></div> {/* <<< BPJS SPECIFIC */}
//                                         </div>

//                                         {inquiryResult.desc.detail && inquiryResult.desc.detail.length > 0 && (
//                                             <div className="space-y-2 text-sm border-t pt-2">
//                                                 <h4 className="font-semibold text-md text-gray-800 pb-1">Rincian Periode Tagihan</h4> {/* <<< TEXT BPJS */}
//                                                 {inquiryResult.desc.detail.map((detail, index) => (
//                                                     <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
//                                                         <p className="font-medium text-gray-700">Periode: {detail.periode}</p>
//                                                         {/* BPJS details might not have nilai_tagihan, denda, admin per period, or meter readings directly here */}
//                                                         {/* You can add them if your specific API response includes them in desc.detail */}
//                                                         {/* For now, simplified to just periode as per example response */}
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         )}

//                                         <div className="space-y-2 text-sm border-t pt-2">
//                                             <h4 className="font-semibold text-md text-gray-800 pb-1">Ringkasan Pembayaran</h4>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-500">Total Nilai Tagihan</span>
//                                                 <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.price)}</span>
//                                             </div>
//                                             {/* BPJS generally doesn't have a separate 'denda' field, or it's included in 'price'.
//                                                 If your backend sets 'denda' for BPJS, it will display. Otherwise, this section won't show. */}
//                                             {inquiryResult.denda > 0 && (
//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-500">Total Denda</span>
//                                                     <span className="font-medium text-red-600">{formatRupiah(inquiryResult.denda)}</span>
//                                                 </div>
//                                             )}
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-500">Total Biaya Admin</span>
//                                                 <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.admin)}</span> {/* Use top-level admin */}
//                                             </div>

//                                             {inquiryResult.diskon > 0 && (
//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-500">Diskon</span>
//                                                     <span className="font-medium text-green-600">
//                                                         - {formatRupiah(inquiryResult.diskon)}
//                                                     </span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="w-full h-px bg-gray-200" />
//                                         <div className="flex justify-between items-center">
//                                             <span className="font-semibold text-gray-800">Total Pembayaran</span>
//                                             <span className="font-bold text-xl text-main">{formatRupiah(inquiryResult.selling_price)}</span>
//                                         </div>
//                                     </>
//                                 )}

//                                 {bulkInquiryResults && ( // Bulk inquiry result display
//                                     <div className="space-y-4">
//                                         {bulkInquiryResults.successful.length > 0 && (
//                                             <>
//                                                 <p className="font-semibold text-gray-800">Tagihan BPJS Berhasil Ditemukan ({bulkInquiryResults.successful.length})</p> {/* <<< TEXT BPJS */}
//                                                 {bulkInquiryResults.successful.map((item, index) => {
//                                                     // For BPJS, totalAdminFromDetails might just be item.admin directly if not per detail
//                                                     const totalAdmin = item.admin || 0;
//                                                     return (
//                                                         <div key={index} className="border border-blue-200 bg-blue-50 p-3 rounded-lg space-y-1 text-sm">
//                                                             <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{item.customer_no}</span></div>
//                                                             <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{item.customer_name}</span></div>
//                                                             <div className="flex justify-between"><span className="text-gray-500">Jumlah Peserta</span><span className="font-medium text-gray-900">{item.desc.jumlah_peserta}</span></div> {/* <<< BPJS SPECIFIC */}
//                                                             <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-gray-900 text-right">{item.desc.alamat}</span></div> {/* <<< BPJS SPECIFIC */}

//                                                             {item.desc.detail && item.desc.detail.length > 0 && (
//                                                                 <div className="space-y-1 text-xs border-t pt-1 mt-1">
//                                                                     <h5 className="font-semibold text-gray-700">Rincian per periode</h5>
//                                                                     {item.desc.detail.map((detail, detailIndex) => (
//                                                                         <div key={detailIndex} className="pb-1 mb-1 last:border-b-0 last:pb-0">
//                                                                             <p className="font-medium text-gray-600">Periode: {detail.periode}</p>
//                                                                             {/* Simplified for BPJS details */}
//                                                                         </div>
//                                                                     ))}
//                                                                 </div>
//                                                             )}

//                                                             <div className="space-y-1 text-sm border-t pt-1 mt-1">
//                                                                 <h5 className="font-semibold text-gray-800">Ringkasan</h5>
//                                                                 <div className="flex justify-between">
//                                                                     <span className="text-gray-500">Total Nilai Tagihan</span>
//                                                                     <span className="font-medium text-gray-900">{formatRupiah(item.price)}</span>
//                                                                 </div>
//                                                                 {item.denda > 0 && (
//                                                                     <div className="flex justify-between">
//                                                                         <span className="text-gray-500">Total Denda</span>
//                                                                         <span className="font-medium text-red-600">{formatRupiah(item.denda)}</span>
//                                                                     </div>
//                                                                 )}
//                                                                 <div className="flex justify-between">
//                                                                     <span className="text-gray-500">Total Biaya Admin</span>
//                                                                     <span className="font-medium text-gray-900">{formatRupiah(totalAdmin)}</span> {/* Use aggregated admin */}
//                                                                 </div>
//                                                                 {item.diskon > 0 && (
//                                                                     <div className="flex justify-between">
//                                                                         <span className="text-gray-500">Diskon</span>
//                                                                         <span className="font-medium text-green-600">- {formatRupiah(item.diskon)}</span>
//                                                                     </div>
//                                                                 )}
//                                                                 <div className="w-full h-px bg-gray-200 mt-2" />
//                                                                 <div className="flex justify-between items-center pt-2">
//                                                                     <span className="font-semibold text-gray-800">Total Bayar</span>
//                                                                     <span className="font-bold text-lg text-main">{formatRupiah(item.selling_price)}</span>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </>
//                                         )}

//                                         {bulkInquiryResults.failed.length > 0 && (
//                                             <>
//                                                 <p className="font-semibold text-red-700 mt-4">Tagihan BPJS Gagal Ditemukan ({bulkInquiryResults.failed.length})</p> {/* <<< TEXT BPJS */}
//                                                 {bulkInquiryResults.failed.map((item, index) => (
//                                                     <div key={index} className="border border-red-300 bg-red-50 p-3 rounded-lg space-y-1 text-sm">
//                                                         <div className="flex justify-between">
//                                                             <span className="text-gray-600">ID Pelanggan</span>
//                                                             <span className="font-bold text-red-800">{item.customer_no}</span>
//                                                         </div>
//                                                         <p className="text-xs text-red-600 mt-1">{item.message}</p>
//                                                     </div>
//                                                 ))}
//                                             </>
//                                         )}
//                                         {bulkInquiryResults.successful.length > 0 && (
//                                             <>
//                                                 <div className="w-full h-px bg-gray-200 mt-4" />
//                                                 <div className="flex justify-between items-center">
//                                                     <span className="font-semibold text-gray-800">Total Pembayaran Massal</span>
//                                                     <span className="font-bold text-xl text-main">{formatRupiah(totalAmountToPayBulk)}</span>
//                                                 </div>
//                                             </>
//                                         )}
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             // --- TAMPILAN AWAL (FORM INPUT SINGLE / BULK) ---
//                             <div className="space-y-6">
//                                 <div className="flex space-x-2 mb-4">
//                                     <button
//                                         onClick={() => setIsBulkMode(false)}
//                                         className={`w-1/2 py-2 text-sm font-semibold rounded-lg ${!isBulkMode ? 'bg-main text-white' : 'bg-gray-200 text-gray-700'}`}
//                                     >
//                                         Transaksi Satuan
//                                     </button>
//                                     <button
//                                         onClick={() => setIsBulkMode(true)}
//                                         className={`w-1/2 py-2 text-sm font-semibold rounded-lg ${isBulkMode ? 'bg-main text-white' : 'bg-gray-200 text-gray-700'}`}
//                                     >
//                                         Transaksi Massal
//                                     </button>
//                                 </div>

//                                 {/* Form Satuan */}
//                                 {!isBulkMode && (
//                                     <form onSubmit={handleInquiry} className="space-y-4">
//                                         <h3 className="font-semibold text-lg text-gray-800">Cek Tagihan Satuan</h3>
//                                         <div>
//                                             <label htmlFor="customer_no" className="block text-sm font-medium text-gray-700 mb-1">ID Pelanggan BPJS Kesehatan</label> {/* <<< LABEL BPJS */}
//                                             <input
//                                                 id="customer_no" type="text"
//                                                 inputMode="numeric"
//                                                 pattern="[0-9]*"
//                                                 value={customerNo}
//                                                 onChange={(e) => {
//                                                     const value = e.target.value;
//                                                     // Allow only digits and limit length (e.g., 13 for BPJS)
//                                                     if (/^\d*$/.test(value) && value.length <= 16) { // BPJS ID usually 11-13 digits, up to 16 for safety
//                                                         setCustomerNo(value);
//                                                     }
//                                                 }}
//                                                 onWheel={(e) => e.target.blur()}
//                                                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                                                 disabled={isLoading} required placeholder="Contoh: 8801234560001" // <<< PLACEHOLDER BPJS
//                                             />
//                                         </div>
//                                         <button
//                                             type="submit" disabled={isLoading || customerNo.length < 11} // Require minimum 11 digits for BPJS
//                                             className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//                                         >
//                                             {isLoading ? 'Mengecek...' : 'Lanjutkan'}
//                                         </button>
//                                     </form>
//                                 )}

//                                 {/* Form Massal */}
//                                 {isBulkMode && (
//                                     <form onSubmit={handleBulkInquiry} className="space-y-4">
//                                         <h3 className="font-semibold text-lg text-gray-800">Cek Tagihan Massal</h3>
//                                         <div>
//                                             <label htmlFor="customer_nos_bulk" className="block text-sm font-medium text-gray-700 mb-1">
//                                                 ID Pelanggan BPJS Kesehatan (Pisahkan dengan koma, spasi, atau baris baru) {/* <<< LABEL BPJS */}
//                                             </label>
//                                             <textarea
//                                                 id="customer_nos_bulk"
//                                                 value={customerNosInput}
//                                                 onChange={(e) => setCustomerNosInput(e.target.value)}
//                                                 rows="5"
//                                                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                                                 disabled={isLoading}
//                                                 required
//                                                 placeholder="Contoh:&#10;8801234560001&#10;8809876540002, 8801122330003" // <<< PLACEHOLDER BPJS
//                                             />
//                                         </div>
//                                         <button
//                                             type="submit" disabled={isLoading || !customerNosInput.trim()}
//                                             className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
//                                         >
//                                             {isLoading ? 'Mengecek Massal...' : 'Lanjutkan Massal'}
//                                         </button>
//                                     </form>
//                                 )}
//                                 {error && !isModalOpen && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
//                             </div>
//                         )}
//                     </div>
//                 </main>

//                 {/* Footer for action buttons (Single or Bulk) */}
//                 {((inquiryResult && !isBulkMode) || (bulkInquiryResults && bulkInquiryResults.successful.length > 0 && isBulkMode)) && !isViewingPaymentResult && (
//                     <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
//                         <div className="flex items-center justify-between w-full">
//                             <div>
//                                 <p className="text-sm text-gray-600">Total Pembayaran</p>
//                                 <p className="text-xl font-bold text-main">
//                                     {isBulkMode ? formatRupiah(totalAmountToPayBulk) : formatRupiah(inquiryResult.selling_price)}
//                                 </p>
//                             </div>
//                             <button
//                                 onClick={handleBayarClick}
//                                 disabled={userBalance < (isBulkMode ? totalAmountToPayBulk : inquiryResult.selling_price)}
//                                 className="px-6 py-2 rounded-lg font-semibold text-white bg-main hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                             >
//                                 {userBalance < (isBulkMode ? totalAmountToPayBulk : inquiryResult.selling_price) ? "Saldo Kurang" : "Bayar Sekarang"}
//                             </button>
//                         </div>
//                     </footer>
//                 )}

//                 {isModalOpen && (
//                     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm space-y-4">
//                             <h2 className="text-lg font-semibold text-center">Konfirmasi Pembayaran</h2>
//                             <form onSubmit={handleSubmitPayment}>
//                                 <div className="relative">
//                                     <input
//                                         type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
//                                         className="w-full border p-2 pr-10 rounded" placeholder="Masukkan password Anda" autoFocus
//                                     />
//                                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
//                                         {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" /></svg>}
//                                     </button>
//                                 </div>
//                                 {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
//                                 <div className="flex justify-end space-x-2 pt-4">
//                                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
//                                     <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-main hover:bg-blue-700 rounded-lg disabled:bg-gray-400">
//                                         {isLoading ? "Memproses..." : "Konfirmasi"}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </>
//     );
// }
import React, { useState, useMemo, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';

// Define rcMessages and getResponseMessage outside the component to avoid re-creation on every render
const rcMessages = {
    "00": "Transaksi Sukses",
    "01": "Timeout",
    "02": "Transaksi Gagal",
    "03": "Transaksi Pending",
    "40": "Payload Error",
    "50": "Transaksi Tidak Ditemukan",
    "51": "Nomor Tujuan Diblokir",
    "52": "Prefix Tidak Sesuai Operator",
    "53": "Produk Tidak Tersedia",
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

const getResponseMessage = (rc) => rcMessages[rc] || `Transaksi Gagal (${rc || 'Tidak Diketahui'})`; // Added fallback for unknown RC code

export default function BpjsPascaIndex({ auth }) {
    // State untuk alur BPJS Satuan
    const [customerNo, setCustomerNo] = useState(''); // For single inquiry
    const [inquiryResult, setInquiryResult] = useState(null); // For single inquiry result
    const [paymentResult, setPaymentResult] = useState(null); // For single payment result

    // State untuk alur BPJS Massal
    const [customerNosInput, setCustomerNosInput] = useState(''); // Textarea input for multiple customer numbers
    const [bulkInquiryResults, setBulkInquiryResults] = useState(null); // {successful: [], failed: []}
    const [bulkPaymentResults, setBulkPaymentResults] = useState(null); // {results: [], total_refund_amount, total_paid_amount}

    // State untuk UI & proses pembayaran
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isBulkMode, setIsBulkMode] = useState(false); // State untuk mode transaksi (satuan/massal)

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
            const response = await fetch(route('pascabpjs.inquiry'), { // <<< ROUTE BPJS
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ customer_no: customerNo }),
            });
            const data = await response.json();
            if (!response.ok) {
                // Use getResponseMessage for inquiry errors if an RC code is available
                throw new Error(data.message || getResponseMessage(data.rc));
            }
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
            .filter(num => num.length >= 11); // Filter out empty or too short entries. BPJS ID is typically 11-13 digits.

        if (customerNos.length === 0) {
            setError('Masukkan setidaknya satu ID Pelanggan BPJS yang valid.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(route('pascabpjs.bulk-inquiry'), { // <<< ROUTE BPJS
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                body: JSON.stringify({ customer_nos: customerNos }),
            });
            const data = await response.json();
            if (!response.ok) {
                // Use getResponseMessage for bulk inquiry errors if an RC code is available
                throw new Error(data.message || getResponseMessage(data.rc));
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
            setError('Tidak ada tagihan BPJS yang siap dibayar.');
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
                paymentResponse = await fetch(route('pascabpjs.bulk-payment'), { // <<< ROUTE BPJS
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ customer_nos_to_pay: customerNosToPay }), // Send only customer numbers to pay
                });
            } else {
                paymentResponse = await fetch(route('pascabpjs.payment'), { // <<< ROUTE BPJS
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrfToken },
                    body: JSON.stringify({ customer_no: inquiryResult.customer_no }),
                });
            }

            const data = await paymentResponse.json();
            if (!paymentResponse.ok) {
                // Use getResponseMessage for payment errors
                setError(data.message || getResponseMessage(data.rc));
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
            <Head title="BPJS Kesehatan" />
            <div className="mx-auto w-full max-w-[500px] bg-gray-50 flex flex-col min-h-screen">

                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex items-center space-x-4 px-4 py-3 bg-main text-white shadow-md">
                    <button className="shrink-0 w-6 h-6" onClick={() => (isViewingPaymentResult || isViewingInquiryResult) ? handleBackFromInquiry() : window.history.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                    </button>
                    <div className="font-semibold text-lg">BPJS Kesehatan</div> {/* <<< JUDUL BPJS */}
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
                                        {paymentResult ? 'Pembayaran Tagihan BPJS Kesehatan' : 'Pembayaran Tagihan BPJS Kesehatan Massal'} {/* <<< TEXT BPJS */}
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

                                {paymentResult && paymentResult.status !== "Sukses" && (
                                    <div className="text-sm text-red-700 bg-red-50 p-3 mt-2 rounded-lg">
                                        {/* Menggunakan getResponseMessage untuk pesan error pembayaran satuan */}
                                        {getResponseMessage(paymentResult.rc || '02')}
                                        {paymentResult.message && ` (${paymentResult.message})`}
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
                                    {inquiryResult ? 'Detail Tagihan BPJS' : 'Ringkasan Pengecekan Tagihan BPJS Massal'} {/* <<< TEXT BPJS */}
                                </p>
                                <div className="w-full h-px bg-gray-200" />

                                {inquiryResult && ( // Single inquiry result display
                                    <>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Jumlah Peserta</span><span className="font-medium text-gray-900">{inquiryResult.desc.jumlah_peserta}</span></div> {/* <<< BPJS SPECIFIC */}
                                            <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-gray-900 text-right">{inquiryResult.desc.alamat}</span></div> {/* <<< BPJS SPECIFIC */}
                                        </div>

                                        {inquiryResult.desc.detail && inquiryResult.desc.detail.length > 0 && (
                                            <div className="space-y-2 text-sm border-t pt-2">
                                                <h4 className="font-semibold text-md text-gray-800 pb-1">Rincian Periode Tagihan</h4> {/* <<< TEXT BPJS */}
                                                {inquiryResult.desc.detail.map((detail, index) => (
                                                    <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                                                        <p className="font-medium text-gray-700">Periode: {detail.periode}</p>
                                                        {/* BPJS details might not have nilai_tagihan, denda, admin per period, or meter readings directly here */}
                                                        {/* You can add them if your specific API response includes them in desc.detail */}
                                                        {/* For now, simplified to just periode as per example response */}
                                                        {parseFloat(detail.nilai_tagihan ?? 0) > 0 && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Nilai Tagihan</span>
                                                                <span className="font-medium">{formatRupiah(detail.nilai_tagihan)}</span>
                                                            </div>
                                                        )}
                                                        {parseFloat(detail.denda ?? 0) > 0 && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Denda</span>
                                                                <span className="font-medium text-red-600">{formatRupiah(detail.denda)}</span>
                                                            </div>
                                                        )}
                                                        {parseFloat(detail.admin ?? 0) > 0 && (
                                                            <div className="flex justify-between pl-2">
                                                                <span className="text-gray-500">Biaya Admin</span>
                                                                <span className="font-medium">{formatRupiah(detail.admin)}</span>
                                                            </div>
                                                        )}
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
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Total Biaya Admin</span>
                                                <span className="font-medium text-gray-900">{formatRupiah(inquiryResult.admin)}</span> {/* Use top-level admin */}
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
                                    </>
                                )}

                                {bulkInquiryResults && ( // Bulk inquiry result display
                                    <div className="space-y-4">
                                        {bulkInquiryResults.successful.length > 0 && (
                                            <>
                                                <p className="font-semibold text-gray-800">Tagihan BPJS Berhasil Ditemukan ({bulkInquiryResults.successful.length})</p> {/* <<< TEXT BPJS */}
                                                {bulkInquiryResults.successful.map((item, index) => {
                                                    // For BPJS, totalAdminFromDetails might just be item.admin directly if not per detail
                                                    const totalAdmin = item.admin || 0;
                                                    return (
                                                        <div key={index} className="border border-blue-200 bg-blue-50 p-3 rounded-lg space-y-1 text-sm">
                                                            <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{item.customer_no}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{item.customer_name}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-500">Jumlah Peserta</span><span className="font-medium text-gray-900">{item.desc.jumlah_peserta}</span></div> {/* <<< BPJS SPECIFIC */}
                                                            <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-gray-900 text-right">{item.desc.alamat}</span></div> {/* <<< BPJS SPECIFIC */}

                                                            {item.desc.detail && item.desc.detail.length > 0 && (
                                                                <div className="space-y-1 text-xs border-t pt-1 mt-1">
                                                                    <h5 className="font-semibold text-gray-700">Rincian per periode</h5>
                                                                    {item.desc.detail.map((detail, detailIndex) => (
                                                                        <div key={detailIndex} className="pb-1 mb-1 last:border-b-0 last:pb-0">
                                                                            <p className="font-medium text-gray-600">Periode: {detail.periode}</p>
                                                                            {parseFloat(detail.nilai_tagihan ?? 0) > 0 && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Nilai Tagihan</span>
                                                                                    <span className="font-medium">{formatRupiah(detail.nilai_tagihan)}</span>
                                                                                </div>
                                                                            )}
                                                                            {parseFloat(detail.denda ?? 0) > 0 && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Denda</span>
                                                                                    <span className="font-medium text-red-600">{formatRupiah(detail.denda)}</span>
                                                                                </div>
                                                                            )}
                                                                            {parseFloat(detail.admin ?? 0) > 0 && (
                                                                                <div className="flex justify-between pl-2">
                                                                                    <span className="text-gray-500">Biaya Admin</span>
                                                                                    <span className="font-medium">{formatRupiah(detail.admin)}</span>
                                                                                </div>
                                                                            )}
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
                                                                    <span className="font-medium text-gray-900">{formatRupiah(totalAdmin)}</span> {/* Use aggregated admin */}
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
                                                <p className="font-semibold text-red-700 mt-4">Tagihan BPJS Gagal Ditemukan ({bulkInquiryResults.failed.length})</p> {/* <<< TEXT BPJS */}
                                                {bulkInquiryResults.failed.map((item, index) => (
                                                    <div key={index} className="border border-red-300 bg-red-50 p-3 rounded-lg space-y-1 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">ID Pelanggan</span>
                                                            <span className="font-bold text-red-800">{item.customer_no}</span>
                                                        </div>
                                                        {/* Menggunakan getResponseMessage untuk item bulk inquiry yang gagal */}
                                                        <p className="text-xs text-red-600 mt-1">{getResponseMessage(item.rc || '02')} {item.message && ` (${item.message})`}</p>
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
                                            <label htmlFor="customer_no" className="block text-sm font-medium text-gray-700 mb-1">ID Pelanggan BPJS Kesehatan</label> {/* <<< LABEL BPJS */}
                                            <input
                                                id="customer_no" type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={customerNo}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Allow only digits and limit length (e.g., 13 for BPJS)
                                                    if (/^\d*$/.test(value) && value.length <= 16) { // BPJS ID usually 11-13 digits, up to 16 for safety
                                                        setCustomerNo(value);
                                                    }
                                                }}
                                                onWheel={(e) => e.target.blur()}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled={isLoading} required placeholder="Contoh: 8801234560001" // <<< PLACEHOLDER BPJS
                                            />
                                        </div>
                                        <button
                                            type="submit" disabled={isLoading || customerNo.length < 11} // Require minimum 11 digits for BPJS
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
                                                ID Pelanggan BPJS Kesehatan (Pisahkan dengan koma, spasi, atau baris baru) {/* <<< LABEL BPJS */}
                                            </label>
                                            <textarea
                                                id="customer_nos_bulk"
                                                value={customerNosInput}
                                                onChange={(e) => setCustomerNosInput(e.target.value)}
                                                rows="5"
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                disabled={isLoading}
                                                required
                                                placeholder="Contoh:&#10;8801234560001&#10;8809876540002, 8801122330003" // <<< PLACEHOLDER BPJS
                                            />
                                        </div>
                                        <button
                                            type="submit" disabled={isLoading || !customerNosInput.trim()}
                                            className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
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