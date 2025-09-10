// import React, { useState, useRef, useEffect } from 'react';
// import { Head } from '@inertiajs/react';

// // Asumsi userBalance didapatkan dari props atau state management global
// // Untuk contoh ini, kita akan hardcode nilainya
// const USER_BALANCE = 500000;

// export default function Pdam({ products }) {
//     const [customerNo, setCustomerNo] = useState('');
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');

//     // Mengganti nama state agar lebih sesuai dengan contoh
//     const [inquiryResult, setInquiryResult] = useState(null);
//     const [paymentResult, setPaymentResult] = useState(null);

//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // State untuk modal konfirmasi password
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);

//     // State untuk user balance (simulasi)
//     const [userBalance, setUserBalance] = useState(USER_BALANCE);

//     const [headerHeight, setHeaderHeight] = useState(0);
//     const stickyHeaderRef = useRef(null);

//     useEffect(() => {
//         if (stickyHeaderRef.current) {
//             setHeaderHeight(stickyHeaderRef.current.offsetHeight);
//         }
//     }, [selectedProduct, inquiryResult, paymentResult]);

//     // Mengosongkan error saat input berubah untuk UX yang lebih baik
//     useEffect(() => {
//         if (error) {
//             setError(null);
//         }
//     }, [customerNo, password, selectedProduct]);


//     const formatRupiah = (number) => {
//         let num = 0;
//         if (typeof number === 'number' || typeof number === 'string') {
//             const parsedNum = parseFloat(number);
//             if (!isNaN(parsedNum)) {
//                 num = parsedNum;
//             }
//         }
//         const roundedUpNumber = Math.ceil(num);
//         return new Intl.NumberFormat("id-ID", {
//             style: "currency",
//             currency: "IDR",
//             minimumFractionDigits: 0
//         }).format(roundedUpNumber);
//     };

//     const handleInquiry = async (e) => {
//         e.preventDefault();
//         if (!selectedProduct) {
//             setError('Silakan pilih produk PDAM terlebih dahulu.');
//             return;
//         }

//         setIsLoading(true);
//         setError(null);
//         setInquiryResult(null);
//         setPaymentResult(null);

//         try {
//             const response = await fetch(route('pascapdam.inquiry'), {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//                     'Accept': 'application/json'
//                 },
//                 body: JSON.stringify({ customer_no: customerNo, buyer_sku_code: selectedProduct.buyer_sku_code })
//             });

//             const data = await response.json();
//             if (!response.ok) throw new Error(data.message || 'Gagal melakukan pengecekan tagihan.');
//             setInquiryResult(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Fungsi untuk membuka modal
//     const handleBayarClick = () => {
//         setError(null); // Bersihkan error sebelumnya
//         setIsModalOpen(true);
//     };

//     // Fungsi untuk menangani submit pembayaran dari modal
//     const handleSubmitPayment = async (e) => {
//         e.preventDefault();
//         if (!inquiryResult) {
//             setError('Data tagihan tidak ditemukan.');
//             return;
//         }
//         setIsLoading(true);
//         setError(null);
//         setPaymentResult(null);

//         try {
//             const response = await fetch(route('pascapdam.payment'), {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//                     'Accept': 'application/json'
//                 },
//                 // Kirim password bersama data pembayaran
//                 body: JSON.stringify({
//                     customer_no: inquiryResult.customer_no,
//                     password: password
//                 })
//             });

//             const data = await response.json();
//             if (!response.ok) throw new Error(data.message || 'Gagal melakukan pembayaran.');

//             // Jika sukses, tutup modal & tampilkan hasil
//             setPaymentResult(data);
//             setInquiryResult(null);
//             setIsModalOpen(false);
//             setPassword('');

//         } catch (err) {
//             // Jika gagal, tampilkan error di dalam modal
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const filteredProducts = products.filter(product =>
//         product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const resetTransaction = () => {
//         setSelectedProduct(null);
//         setCustomerNo('');
//         setInquiryResult(null);
//         setError(null);
//         setPaymentResult(null);
//         setSearchTerm('');
//     };

//     return (
//         <>
//             <Head title="Bayar Tagihan PDAM" />

//             <div className="mx-auto w-full max-w-[500px] min-h-screen bg-gray-50">
//                 {/* ====== HEADER ====== */}
//                 <header ref={stickyHeaderRef} className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-white shadow-lg">
//                     <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-3 bg-main">
//                         <button className="shrink-0 w-6 h-6" onClick={() => (inquiryResult || paymentResult) ? resetTransaction() : window.history.back()}>
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
//                                 <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
//                             </svg>
//                         </button>
//                         <div className="font-semibold text-white text-lg">Tagihan PDAM</div>
//                     </div>

//                     {/* Form Awal (Pencarian & Input Nomor) hanya tampil jika belum ada inquiry/payment */}
//                     {!inquiryResult && !paymentResult && (
//                         <div className="p-4 space-y-3">
//                             <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                 <input
//                                     type="text"
//                                     className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
//                                     placeholder="Cari wilayah PDAM..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                 />
//                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.3" className="w-5 h-5 text-main">
//                                     <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
//                                 </svg>
//                             </div>

//                             {selectedProduct && (
//                                 <form onSubmit={handleInquiry} className='space-y-3'>
//                                     <div className='border-t pt-3'>
//                                         <p className="text-sm text-gray-600">Produk Pilihan:</p>
//                                         <p className="font-bold text-blue-700">{selectedProduct.product_name}</p>
//                                     </div>
//                                     <div>
//                                         <label htmlFor="customer_no" className="block text-sm font-medium text-gray-700 mb-1">Nomor Pelanggan</label>
//                                         <input
//                                             id="customer_no" type="number" value={customerNo} onChange={(e) => setCustomerNo(e.target.value)}
//                                             className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                                             disabled={isLoading} required placeholder="Masukkan nomor pelanggan"
//                                         />
//                                     </div>
//                                     <div className="flex space-x-2">
//                                         <button type="button" onClick={resetTransaction} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Pilih Ulang</button>
//                                         <button type="submit" disabled={isLoading || !customerNo} className="w-full bg-main text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
//                                             {isLoading ? 'Mengecek...' : 'Cek Tagihan'}
//                                         </button>
//                                     </div>
//                                 </form>
//                             )}
//                         </div>
//                     )}
//                 </header>

//                 {/* ====== MAIN CONTENT ====== */}
//                 <main style={{ paddingTop: `${headerHeight}px`, paddingBottom: inquiryResult ? '100px' : '16px' }} className="p-4 transition-all duration-200">
//                     <div className="bg-white p-4 rounded-lg shadow-sm border mt-4">
//                         {paymentResult ? (
//                             paymentResult.status === 'Sukses' ? (
//                                 // --- TAMPILAN STRUK PEMBAYARAN BERHASIL (BAGIAN YANG DIUPGRADE) ---
//                                 <div className="space-y-4">
//                                     <div className="text-center">
//                                         <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
//                                         <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Berhasil</h3>
//                                         <p className="text-sm text-gray-500">{paymentResult.message}</p>
//                                     </div>

//                                     <div className="bg-gray-50 rounded-lg p-4 text-center">
//                                         <p className="text-sm text-gray-600">Total Pembayaran</p>
//                                         <p className="text-3xl font-bold text-main">{formatRupiah(paymentResult.selling_price)}</p>
//                                     </div>

//                                     {/* --- DETAIL PELANGGAN LENGKAP --- */}
//                                     <div className="space-y-2 text-sm">
//                                         <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">Detail Pelanggan</h4>
//                                         <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-right">{paymentResult.customer_name}</span></div>
//                                         <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium">{paymentResult.customer_no}</span></div>
//                                         <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-right">{paymentResult.desc?.alamat}</span></div>
//                                         <div className="flex justify-between"><span className="text-gray-500">Jumlah Tagihan</span><span className="font-medium">{paymentResult.desc?.lembar_tagihan} Lembar</span></div>
//                                         <div className="flex justify-between"><span className="text-gray-500">Jatuh Tempo</span><span className="font-medium">{paymentResult.desc?.jatuh_tempo}</span></div>
//                                     </div>

//                                     {/* --- RINCIAN PEMBAYARAN LENGKAP --- */}
//                                     <div className="space-y-3 text-sm">
//                                         <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">Rincian Pembayaran</h4>
//                                         <div className="flex justify-between"><span className="text-gray-500">Tarif</span><span className="font-medium">{paymentResult.desc?.tarif}</span></div>

//                                         {/* Loop melalui setiap detail tagihan */}
//                                         {paymentResult.desc?.detail?.map((bill, index) => (
//                                             <div key={index} className="space-y-1 pt-2 border-t border-dashed">
//                                                 <p className="font-semibold text-gray-700">Periode: {bill.periode}</p>
//                                                 <div className="pl-2 space-y-1">
//                                                     <div className="flex justify-between"><span className="text-gray-500">Meter Awal - Akhir</span> <span className="font-medium">{bill.meter_awal} - {bill.meter_akhir}</span></div>
//                                                     <div className="flex justify-between"><span className="text-gray-500">Nilai Tagihan</span> <span className="font-medium">{formatRupiah(bill.nilai_tagihan)}</span></div>
//                                                     <div className="flex justify-between"><span className="text-gray-500">Denda</span> <span className="font-medium">{formatRupiah(bill.denda)}</span></div>
//                                                     <div className="flex justify-between"><span className="text-gray-500">Biaya Lainnya</span> <span className="font-medium">{formatRupiah(bill.biaya_lain)}</span></div>
//                                                 </div>
//                                             </div>
//                                         ))}

//                                         {/* Total Biaya */}
//                                         <div className="space-y-1 pt-2 border-t">
//                                             <div className="flex justify-between"><span className="text-gray-500">Tagihan Pokok</span><span className="font-medium">{formatRupiah(paymentResult.selling_price - paymentResult.admin)}</span></div>
//                                             <div className="flex justify-between"><span className="text-gray-500">Biaya Admin</span><span className="font-medium">{formatRupiah(paymentResult.admin)}</span></div>
//                                         </div>
//                                     </div>

//                                     {/* --- DETAIL TRANSAKSI (SN & REF ID) --- */}
//                                     <div className="space-y-1 text-xs text-gray-500 bg-gray-100 p-3 rounded-md">
//                                         <div className="flex justify-between"><span >Serial Number (SN)</span><span className="font-mono">{paymentResult.sn}</span></div>
//                                         <div className="flex justify-between"><span >Ref ID</span><span className="font-mono">{paymentResult.ref_id}</span></div>
//                                     </div>

//                                     <button onClick={resetTransaction} className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700">
//                                         Lakukan Transaksi Lain
//                                     </button>
//                                 </div>
//                             ) : (
//                                 // --- TAMPILAN GAGAL ---
//                                 <div className="space-y-4">
//                                     <div className="text-center">
//                                         <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
//                                             <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Gagal</h3>
//                                         <p className="text-sm text-red-700 bg-red-50 p-3 mt-2 rounded-lg">{paymentResult.message}</p>
//                                     </div>
//                                     <button onClick={resetTransaction} className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700">
//                                         Coba Lagi
//                                     </button>
//                                 </div>
//                             )
//                         ) : inquiryResult ? (
//                             // --- TAMPILAN DETAIL TAGIHAN (INQUIRY) ---
//                             <div className="space-y-4">
//                                 <p className="w-full font-semibold text-md text-center text-gray-800 border-b pb-3">Detail Tagihan</p>
//                                 <div className="space-y-2 text-sm">
//                                     <h4 className="font-semibold text-gray-800">Detail Pelanggan</h4>
//                                     <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
//                                     <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
//                                 </div>
//                                 <div className="w-full h-px bg-gray-100" />
//                                 <div className="space-y-2 text-sm">
//                                     <h4 className="font-semibold text-gray-800">Rincian Biaya</h4>
//                                     <div className="flex justify-between"><span className="text-gray-500">Tagihan Pokok</span><span className="font-medium text-gray-900">{formatRupiah(inquiryResult.price - inquiryResult.admin)}</span></div>
//                                     <div className="flex justify-between"><span className="text-gray-500">Biaya Admin</span><span className="font-medium text-gray-900">{formatRupiah(inquiryResult.admin)}</span></div>
//                                 </div>
//                                 <div className="w-full h-px bg-gray-200" />
//                                 <div className="flex justify-between items-center pt-2">
//                                     <span className="font-semibold text-gray-800 text-lg">Total Pembayaran</span>
//                                     <span className="font-bold text-xl text-main">{formatRupiah(inquiryResult.selling_price)}</span>
//                                 </div>
//                             </div>
//                         ) : (
//                             // --- TAMPILAN AWAL (LIST PRODUK) ---
//                             <div className="grid grid-cols-2 gap-3">
//                                 {filteredProducts.length > 0 ? filteredProducts.map(product => {
//                                     const isDisabled = !product.seller_product_status;
//                                     const isSelected = selectedProduct && selectedProduct.id === product.id;
//                                     return (
//                                         <div
//                                             onClick={() => !isDisabled && setSelectedProduct(product)}
//                                             key={product.id}
//                                             className={`flex flex-col justify-between p-3 border rounded-lg shadow-sm transition-all duration-200 ${isDisabled ? "bg-gray-200 opacity-70 cursor-not-allowed" : "bg-white cursor-pointer hover:shadow-lg"} ${isSelected ? "border-main ring-2 ring-blue-500" : "border-gray-200"}`} >
//                                             <h3 className="text-utama text-xs font-semibold line-clamp-2 mb-2">{product.product_name}</h3>
//                                             <div className="flex flex-col items-start">
//                                                 <p className="text-gray-500 text-xs">Admin</p>
//                                                 <p className="text-main text-sm font-bold">{formatRupiah(product.calculated_admin)}</p>
//                                                 {isDisabled && (<p className="text-xs text-red-500 mt-1 font-medium">Gangguan</p>)}
//                                             </div>
//                                         </div>
//                                     );
//                                 }) : <p className="col-span-2 text-center text-gray-500 pt-4">Produk tidak ditemukan.</p>}
//                             </div>
//                         )}
//                         {error && !isModalOpen && <p className="text-red-500 text-sm text-center pt-4">{error}</p>}
//                     </div>
//                 </main>

//                 {/* ====== FOOTER (TOMBOL BAYAR) ====== */}
//                 {inquiryResult && !paymentResult && (
//                     <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
//                         <div className="flex items-center justify-between w-full">
//                             <div>
//                                 <p className="text-sm text-gray-600">Total Pembayaran</p>
//                                 <p className="text-xl font-bold text-main">{formatRupiah(inquiryResult.selling_price)}</p>
//                             </div>
//                             <button
//                                 onClick={handleBayarClick} disabled={userBalance < inquiryResult.selling_price}
//                                 className="px-6 py-2 rounded-lg font-semibold text-white bg-main hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                             >
//                                 {userBalance < inquiryResult.selling_price ? "Saldo Kurang" : "Bayar Sekarang"}
//                             </button>
//                         </div>
//                     </footer>
//                 )}

//                 {/* ====== MODAL KONFIRMASI PASSWORD ====== */}
//                 {isModalOpen && (
//                     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
//                         <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm space-y-4">
//                             <h2 className="text-lg font-semibold text-center">Konfirmasi Pembayaran</h2>
//                             <form onSubmit={handleSubmitPayment}>
//                                 <div className="relative">
//                                     <input
//                                         type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
//                                         className="w-full border p-2 pr-10 rounded" placeholder="Masukkan password Anda" autoFocus required
//                                     />
//                                     <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
//                                         {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" /><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" /></svg>}
//                                     </button>
//                                 </div>
//                                 {error && <p className="text-red-500 text-xs text-center pt-2">{error}</p>}
//                                 <div className="flex justify-end space-x-2 pt-4">
//                                     <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
//                                     <button type="submit" disabled={isLoading || !password} className="px-4 py-2 text-sm font-medium text-white bg-main hover:bg-blue-700 rounded-lg disabled:bg-gray-400">
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
import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react'; // Import router

export default function Pdam({ auth, products }) { // Menerima `auth` sebagai prop
    // State untuk alur PDAM
    const [customerNo, setCustomerNo] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // State untuk hasil inquiry dan pembayaran
    const [inquiryResult, setInquiryResult] = useState(null);
    const [paymentResult, setPaymentResult] = useState(null);

    // State untuk UI & proses pembayaran
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); // Gunakan string kosong untuk konsistensi
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const userBalance = auth.user.balance; // Gunakan saldo user yang sebenarnya dari prop `auth`

    const [headerHeight, setHeaderHeight] = useState(0);
    const stickyHeaderRef = useRef(null);

    useEffect(() => {
        if (stickyHeaderRef.current) {
            setHeaderHeight(stickyHeaderRef.current.offsetHeight);
        }
    }, [selectedProduct, inquiryResult, paymentResult]);

    // Mengosongkan error saat input berubah untuk UX yang lebih baik
    useEffect(() => {
        if (error) {
            setError(''); // Bersihkan error saat input berubah
        }
    }, [customerNo, password, selectedProduct, searchTerm]);


    const formatRupiah = (number) => {
        // Memastikan number adalah angka yang valid sebelum format
        const num = parseFloat(number);
        if (isNaN(num)) {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(0);
        }
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
    };

    // Langkah 1: Cek Tagihan (Inquiry)
    const handleInquiry = async (e) => {
        e.preventDefault();
        if (!selectedProduct) {
            setError('Silakan pilih produk PDAM terlebih dahulu.');
            return;
        }
        // Pastikan hanya produk yang aktif yang bisa di-inquiry
        if (!selectedProduct.seller_product_status) {
            setError('Produk PDAM ini sedang mengalami gangguan. Silakan pilih produk lain.');
            return;
        }

        setIsLoading(true);
        setError('');
        setInquiryResult(null);
        setPaymentResult(null); // Bersihkan hasil pembayaran sebelumnya

        try {
            const response = await fetch(route('pascapdam.inquiry'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // Tambahkan Accept header
                    'X-CSRF-TOKEN': csrfToken,
                },
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

    // Langkah 2: Buka Modal Konfirmasi
    const handleBayarClick = () => {
        if (userBalance < inquiryResult.selling_price) { // Periksa terhadap selling_price
            setError("Saldo Anda tidak mencukupi untuk melakukan transaksi.");
            return;
        }
        setError(''); // Bersihkan error sebelumnya
        setPassword(''); // Reset field password
        setIsModalOpen(true);
    };

    // Langkah 3: Kirim Transaksi setelah Konfirmasi Password
    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        if (!password) {
            setError("Silakan masukkan password untuk melanjutkan.");
            return;
        }
        if (!inquiryResult) {
            setError('Data tagihan tidak ditemukan.');
            return;
        }
        setIsLoading(true);
        setError(''); // Bersihkan error sebelumnya
        setPaymentResult(null); // Bersihkan hasil pembayaran sebelumnya

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

            // Step 2: Lakukan Pembayaran
            const paymentResponse = await fetch(route('pascapdam.payment'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    customer_no: inquiryResult.customer_no, // Hanya customer_no yang diperlukan, buyer_sku_code dan ref_id sudah di sesi backend
                })
            });

            const data = await paymentResponse.json();
            if (!paymentResponse.ok) {
                setPaymentResult(data); // Set data meskipun gagal untuk ditampilkan
                throw new Error(data.message || 'Gagal melakukan pembayaran.');
            }

            // Jika sukses, tutup modal & tampilkan hasil
            setPaymentResult(data);
            setInquiryResult(null); // Bersihkan hasil inquiry setelah pembayaran berhasil
            setIsModalOpen(false);
            setPassword('');

        } catch (err) {
            // Jika gagal, tampilkan error (baik karena password atau pembayaran)
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const resetTransaction = () => {
        setSelectedProduct(null);
        setCustomerNo('');
        setInquiryResult(null);
        setError('');
        setPaymentResult(null);
        setSearchTerm('');
        setIsModalOpen(false); // Tutup modal jika terbuka
        setPassword(''); // Bersihkan password
    };

    return (
        <>
            <Head title="Tagihan PDAM" />

            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-gray-50 flex flex-col">
                {/* ====== HEADER ====== */}
                <header ref={stickyHeaderRef} className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-white shadow-lg">
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-3 bg-main">
                        <button className="shrink-0 w-6 h-6" onClick={() => (inquiryResult || paymentResult || selectedProduct) ? resetTransaction() : window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-semibold text-white text-lg">Tagihan PDAM</div>
                    </div>

                    {/* Form Awal (Pencarian & Input Nomor) hanya tampil jika belum ada inquiry/payment DAN belum ada produk yang dipilih */}
                    {!inquiryResult && !paymentResult && !selectedProduct && (
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
                    {/* Form input nomor pelanggan hanya tampil jika produk sudah dipilih tapi belum inquiry/payment */}
                    {!inquiryResult && !paymentResult && selectedProduct && (
                        <div className="p-4 space-y-3 border-t">
                            <form onSubmit={handleInquiry} className='space-y-3'>
                                <div>
                                    <p className="text-sm text-gray-600">Produk Pilihan:</p>
                                    <p className="font-bold text-blue-700">{selectedProduct.product_name}</p>
                                </div>
                                <div>
                                    <label htmlFor="customer_no_input" className="block text-sm font-medium text-gray-700 mb-1">Nomor Pelanggan</label>
                                    <input
                                        id="customer_no_input" type="number" value={customerNo} onChange={(e) => setCustomerNo(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        disabled={isLoading || !selectedProduct.seller_product_status} required placeholder="Masukkan nomor pelanggan"
                                    />
                                </div>
                                <div className="flex space-x-2">
                                    <button type="button" onClick={resetTransaction} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Pilih Ulang</button>
                                    <button type="submit" disabled={isLoading || !customerNo || !selectedProduct.seller_product_status} className="w-full bg-main text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                                        {isLoading ? 'Mengecek...' : 'Cek Tagihan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </header>

                {/* ====== MAIN CONTENT ====== */}
                <main style={{ paddingTop: `${headerHeight}px` }} className="w-full pt-20 pb-40 px-4 space-y-4 flex-grow">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        {paymentResult ? (
                            paymentResult.status === 'Sukses' ? (
                                // --- TAMPILAN STRUK PEMBAYARAN BERHASIL ---
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Berhasil</h3>
                                        <p className="text-sm text-gray-500">{paymentResult.message || 'Pembayaran Tagihan PDAM Anda berhasil.'}</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <p className="text-sm text-gray-600">Total Pembayaran Akhir</p>
                                        <p className="text-3xl font-bold text-main">{formatRupiah(paymentResult.selling_price)}</p>
                                    </div>

                                    {paymentResult.diskon > 0 && (
                                        <div className="text-center text-sm text-green-600 font-semibold bg-green-50 p-2 rounded-lg">
                                            Anda hemat {formatRupiah(paymentResult.diskon)}!
                                        </div>
                                    )}

                                    {/* --- DETAIL PELANGGAN LENGKAP --- */}
                                    <div className="space-y-2 text-sm">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">Detail Pelanggan</h4>
                                        <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-right">{paymentResult.customer_name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium">{paymentResult.customer_no}</span></div>
                                        {paymentResult.details?.desc?.alamat && <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-right">{paymentResult.details.desc.alamat}</span></div>}
                                        {paymentResult.details?.jumlah_lembar_tagihan > 0 && <div className="flex justify-between"><span className="text-gray-500">Jumlah Tagihan</span><span className="font-medium">{paymentResult.details.jumlah_lembar_tagihan} Lembar</span></div>}
                                        {paymentResult.details?.desc?.jatuh_tempo && <div className="flex justify-between"><span className="text-gray-500">Jatuh Tempo</span><span className="font-medium">{paymentResult.details.desc.jatuh_tempo}</span></div>}
                                    </div>

                                    {/* --- RINCIAN PER PERIODE TAGIHAN LENGKAP --- */}
                                    {paymentResult.details?.desc?.detail && paymentResult.details.desc.detail.length > 0 && (
                                        <div className="space-y-3 text-sm">
                                            <h4 className="font-semibold text-md text-gray-800 pb-1 border-b">Rincian per Periode Tagihan</h4>
                                            {paymentResult.details.desc.detail.map((bill, index) => (
                                                <div key={index} className="space-y-1 pt-2 border-t border-dashed">
                                                    <p className="font-semibold text-gray-700">Periode: {bill.periode}</p>
                                                    <div className="pl-2 space-y-1">
                                                        {(bill.meter_awal && bill.meter_akhir) && <div className="flex justify-between"><span className="text-gray-500">Meter Awal - Akhir</span> <span className="font-medium">{bill.meter_awal} - {bill.meter_akhir}</span></div>}
                                                        <div className="flex justify-between"><span className="text-gray-500">Nilai Tagihan</span> <span className="font-medium">{formatRupiah(bill.nilai_tagihan)}</span></div>
                                                        {parseFloat(bill.denda) > 0 && <div className="flex justify-between"><span className="text-gray-500">Denda</span> <span className="font-medium">{formatRupiah(bill.denda)}</span></div>}
                                                        {parseFloat(bill.biaya_lain) > 0 && <div className="flex justify-between"><span className="text-gray-500">Biaya Lainnya</span> <span className="font-medium">{formatRupiah(bill.biaya_lain)}</span></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* --- RINGKASAN BIAYA --- */}
                                    <div className="space-y-1 pt-2 border-t">
                                        <div className="flex justify-between"><span className="text-gray-500">Total Tagihan Pokok (+Biaya Lain)</span><span className="font-medium">{formatRupiah(paymentResult.price)}</span></div>
                                        {parseFloat(paymentResult.denda) > 0 && <div className="flex justify-between"><span className="text-gray-500">Total Denda</span><span className="font-medium">{formatRupiah(paymentResult.denda)}</span></div>}
                                        <div className="flex justify-between"><span className="text-gray-500">Total Biaya Admin</span><span className="font-medium">{formatRupiah(paymentResult.admin)}</span></div>
                                        {parseFloat(paymentResult.diskon) > 0 && <div className="flex justify-between"><span className="text-gray-500">Diskon</span><span className="font-medium text-green-600">- {formatRupiah(paymentResult.diskon)}</span></div>}
                                    </div>

                                    <div className="w-full h-px bg-gray-200" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">Total Pembayaran Akhir</span>
                                        <span className="font-bold text-xl text-blue-600">{formatRupiah(paymentResult.selling_price)}</span>
                                    </div>

                                    {/* --- DETAIL TRANSAKSI (SN & REF ID) --- */}
                                    {(paymentResult.sn || paymentResult.ref_id) && (
                                        <div className="space-y-1 text-xs text-gray-500 bg-gray-100 p-3 rounded-md">
                                            {paymentResult.sn && <div className="flex justify-between"><span >Serial Number (SN)</span><span className="font-mono">{paymentResult.sn}</span></div>}
                                            {paymentResult.ref_id && <div className="flex justify-between"><span >Ref ID</span><span className="font-mono">{paymentResult.ref_id}</span></div>}
                                        </div>
                                    )}

                                    <button onClick={() => router.visit(route('postpaid.history.index'))} className="w-full py-2 px-4 border border-main text-main font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                                        Riwayat Transaksi
                                    </button>
                                    <button onClick={resetTransaction} className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700">
                                        Lakukan Transaksi Lain
                                    </button>
                                </div>
                            ) : (
                                // --- TAMPILAN GAGAL ---
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h3 className="text-lg font-bold text-gray-800 mt-2">Pembayaran Gagal</h3>
                                        <p className="text-sm text-red-700 bg-red-50 p-3 mt-2 rounded-lg">{paymentResult.message || 'Terjadi kesalahan saat memproses pembayaran Anda.'}</p>
                                    </div>
                                    <div className="space-y-2 text-sm border-t pt-4">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1">Detail Transaksi Gagal</h4>
                                        <div className="flex justify-between"><span className="text-gray-500">ID Pelanggan</span><span className="font-medium">{paymentResult.customer_no}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Nama</span><span className="font-medium text-right">{paymentResult.customer_name}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Jumlah</span><span className="font-medium">{formatRupiah(paymentResult.selling_price)}</span></div>
                                    </div>
                                    <button onClick={resetTransaction} className="w-full py-2 px-4 bg-main text-white font-semibold rounded-lg hover:bg-blue-700">
                                        Coba Lagi
                                    </button>
                                </div>
                            )
                        ) : inquiryResult ? (
                            // --- TAMPILAN DETAIL TAGIHAN (INQUIRY) ---
                            <div className="space-y-4">
                                <p className="w-full font-semibold text-md text-center text-gray-800 pb-3 border-b">Detail Tagihan</p>
                                <div className="space-y-2 text-sm">
                                    <h4 className="font-semibold text-gray-800">Detail Pelanggan</h4>
                                    <div className="flex justify-between"><span className="text-gray-500">Nomor Pelanggan</span><span className="font-medium text-gray-900">{inquiryResult.customer_no}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Nama Pelanggan</span><span className="font-medium text-gray-900 text-right">{inquiryResult.customer_name}</span></div>
                                    {inquiryResult.desc?.alamat && <div className="flex justify-between"><span className="text-gray-500">Alamat</span><span className="font-medium text-right">{inquiryResult.desc.alamat}</span></div>}
                                    {inquiryResult.jumlah_lembar_tagihan > 0 && <div className="flex justify-between"><span className="text-gray-500">Jumlah Tagihan</span><span className="font-medium">{inquiryResult.jumlah_lembar_tagihan} Lembar</span></div>}
                                    {inquiryResult.desc?.jatuh_tempo && <div className="flex justify-between"><span className="text-gray-500">Jatuh Tempo</span><span className="font-medium">{inquiryResult.desc.jatuh_tempo}</span></div>}
                                    {inquiryResult.desc?.tarif && <div className="flex justify-between"><span className="text-gray-500">Tarif</span><span className="font-medium">{inquiryResult.desc.tarif}</span></div>}
                                </div>

                                {/* --- BAGIAN BARU: DETAIL per periode TAGIHAN --- */}
                                {inquiryResult.desc?.detail && inquiryResult.desc.detail.length > 0 && (
                                    <div className="space-y-2 text-sm border-t pt-2">
                                        <h4 className="font-semibold text-md text-gray-800 pb-1">Rincian per Periode Tagihan</h4>
                                        {inquiryResult.desc.detail.map((detail, index) => (
                                            <div key={index} className="border-b pb-2 mb-2 last:border-b-0 last:pb-0">
                                                <p className="font-medium text-gray-700">Periode: {detail.periode}</p>
                                                <div className="flex justify-between pl-2">
                                                    <span className="text-gray-500">Meter Awal - Akhir</span>
                                                    <span className="font-medium">{detail.meter_awal} - {detail.meter_akhir}</span>
                                                </div>
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
                                {/* --- AKHIR BAGIAN BARU --- */}

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
                                            <span className="font-medium text-green-600">
                                                - {formatRupiah(inquiryResult.diskon)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="w-full h-px bg-gray-200" />
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">Total Pembayaran Akhir</span>
                                    <span className="font-bold text-xl text-blue-600">{formatRupiah(inquiryResult.selling_price)}</span>
                                </div>
                            </div>
                        ) : (
                            // --- TAMPILAN AWAL (LIST PRODUK PDAM) ---
                            <div className="grid grid-cols-2 gap-3">
                                {filteredProducts.length > 0 ? filteredProducts.map(product => {
                                    const isDisabled = !product.seller_product_status;
                                    const isSelected = selectedProduct && selectedProduct.id === product.id;
                                    return (
                                        <div
                                            onClick={() => !isDisabled && setSelectedProduct(product)}
                                            key={product.id}
                                            className={`flex flex-col justify-between p-3 border rounded-lg shadow-sm transition-all duration-200 ${isDisabled ? "bg-gray-200 opacity-70 cursor-not-allowed" : "bg-white cursor-pointer hover:shadow-lg"} ${isSelected ? "border-main ring-2 ring-blue-500" : "border-gray-200"}`} >
                                            <h3 className="text-utama text-xs font-semibold line-clamp-2 mb-2">{product.product_name}</h3>
                                            <div className="flex flex-col items-start">
                                                <p className="text-gray-500 text-xs">Admin</p>
                                                {/* Gunakan product.calculated_admin dari produk yang diambil */}
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
                {inquiryResult && !paymentResult && (
                    <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] rounded-t-xl">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <p className="text-sm text-gray-600">Total Pembayaran Akhir</p>
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