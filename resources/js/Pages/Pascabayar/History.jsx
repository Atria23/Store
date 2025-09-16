import React, { useState, useEffect } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import Footer from '@/Components/Footer'; // Pastikan path ini benar

// Dummy Footer Component (Jika Anda belum punya, bisa pakai ini)
const DummyFooter = () => (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="flex justify-around py-2">
            <button className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="text-xs">Beranda</span>
            </button>
            <button className="flex flex-col items-center text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="w-6 h-6">
                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z" />
                    <path d="M4 0h1v3H4zm5 0h1v3H9zm5 0h1v3h-1zM0 4h3v1H0zm0 5h3v1H0zm0 5h3v1H0zM4 15h1v-3H4zm5 0h1v-3H9zm5 0h1v-3h-1z" />
                </svg>
                <span className="text-xs">Riwayat</span>
            </button>
            <button className="flex flex-col items-center text-gray-500 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0H4.501z" />
                </svg>
                <span className="text-xs">Profil</span>
            </button>
        </div>
    </div>
);
// Ganti komponen Footer di bawah dengan DummyFooter jika Anda tidak punya file Footer yang sebenarnya.
// import Footer from './DummyFooter'; // Contoh jika menggunakan DummyFooter

// Komponen untuk menampilkan setiap item transaksi
// Ubah agar menerima seluruh objek 'transaction' sebagai prop
const TransactionItem = ({ transaction }) => {
    // Mapping status ke kelas CSS Tailwind untuk warna latar dan teks
    const statusClasses = {
        Sukses: "bg-green-100 text-green-600",
        Pending: "bg-yellow-100 text-yellow-600",
        Gagal: "bg-red-100 text-red-600",
    };

    // Destrukturisasi properti yang dibutuhkan dari objek transaction
    const { ref_id, type, customer_no, selling_price, status, created_at, product } = transaction;

    // Format tanggal agar lebih mudah dibaca
    const formattedDate = new Date(created_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short", // "Agu" untuk Agustus
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta", // Sesuaikan dengan zona waktu Anda
    });

    // Format harga ke dalam format mata uang Rupiah
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(selling_price);

    // Format nomor pelanggan untuk menyembunyikan sebagian angka
    const formattedCustomerNo = (cn) => {
        if (!cn) return "";
        if (cn.length >= 6) {
            return cn.slice(0, 3) + "****" + cn.slice(-3);
        } else {
            return cn.slice(0, 3) + (cn.length > 3 ? "****" : "");
        }
    };

    const { get } = useForm();

    // Fungsi untuk menangani klik pada item transaksi, mengarahkan ke halaman detail
    const handleTransactionClick = () => {
        get(route('postpaid.history.show', ref_id));
    };

    // Menyimpan URL saat ini ke session storage
    useEffect(() => {
        const current = window.location.pathname;
        sessionStorage.setItem('previous-url', current);
    }, []);

    return (
        <div
            onClick={handleTransactionClick}
            className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 cursor-pointer w-full gap-2"
        >
            {/* Kiri: Logo dan Informasi Produk */}
            <div className="flex items-center gap-2 w-full">
                {/* Logo - disesuaikan agar sama persis dengan contoh pertama */}
                <div className="w-14 bg-white shadow hidden min-[350px]:flex items-center justify-center rounded-xl">
                    <img
                        src="/storage/logo.webp" // Menggunakan path dari contoh pertama
                        alt="Company Logo" // Menggunakan alt dari contoh pertama
                        className="w-full h-full object-cover" // Menggunakan kelas dari contoh pertama
                    />
                </div>

                {/* Informasi Produk - disesuaikan agar sama persis dengan contoh pertama */}
                <div className="flex flex-col items-start w-max space-y-[2px]">
                    {/* Menggunakan product.product_name yang sudah di eager load */}
                    <p className="font-utama font-semibold text-sm truncate w-full max-w-[180px] [@media(max-width:350px)]:max-w-[215px]">
                        {product ? product.product_name : type} {/* Fallback ke 'type' jika product_name tidak ada */}
                    </p>
                    <p className="w-full font-utama text-sm">
                        ID Pelanggan: {formattedCustomerNo(customer_no)}
                    </p>
                    <p className="truncate w-full max-w-[180px] font-utama text-sm text-gray-500">
                        ID: {ref_id}
                    </p>
                </div>
            </div>

            {/* Kanan: Status dan Tanggal - disesuaikan agar sama persis dengan contoh pertama */}
            <div className="w-full flex flex-col items-end justify-end space-y-1">
                <p
                    className={`hidden w-max-full min-[300px]:flex px-2 py-[2px] text-xs rounded-3xl justify-center ${statusClasses[status] || 'bg-gray-100 text-gray-600'}`}
                >
                    {status}
                </p>
                <p className="hidden min-[350px]:flex font-utama text-[12px] text-right text-gray-500">{formattedDate}</p>
            </div>
        </div>
    );
};


// Komponen Utama Halaman Riwayat
export default function History({ transactions: initialTransactions }) {
    // State untuk data transaksi, pencarian, paginasi, dll.
    const [transactions, setTransactions] = useState(initialTransactions.data);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc"); // 'desc' untuk terbaru, 'asc' untuk terlama
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilter, setShowFilter] = useState(false);

    // Logika untuk memfilter dan mengurutkan transaksi berdasarkan state
    const filteredAndSortedTransactions = transactions
        .filter((tx) => {
            const lowerQuery = searchQuery.toLowerCase();
            // Cek apakah query cocok dengan nama produk, jenis (fallback), no pelanggan, atau ref_id
            const productName = tx.product ? tx.product.product_name : tx.type; // Gunakan product_name jika ada
            const matchSearch =
                (productName && productName.toLowerCase().includes(lowerQuery)) ||
                (tx.customer_no && tx.customer_no.toLowerCase().includes(lowerQuery)) ||
                (tx.ref_id && tx.ref_id.toLowerCase().includes(lowerQuery));


            // Cek apakah transaksi berada dalam rentang tanggal yang dipilih
            const txDate = new Date(tx.created_at);
            const startDate = dateRange.start ? new Date(dateRange.start) : null;
            // Atur akhir hari untuk tanggal akhir agar inklusif
            const endDate = dateRange.end ? new Date(dateRange.end) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);


            const inDateRange =
                (!startDate || txDate >= startDate) &&
                (!endDate || txDate <= endDate);

            return matchSearch && inDateRange;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    // Reset ke halaman pertama setiap kali filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOrder, dateRange]);

    // Fungsi pembantu untuk tanggal akhir (dari contoh sebelumnya)
    const getNextDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    // Logika Paginasi
    const transactionsPerPage = 10;
    const totalPages = Math.ceil(filteredAndSortedTransactions.length / transactionsPerPage);
    const paginatedTransactions = filteredAndSortedTransactions.slice(
        (currentPage - 1) * transactionsPerPage,
        currentPage * transactionsPerPage
    );


    return (
        <>
            <Head title="Riwayat Transaksi" /> {/* Judul di Head */}
            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    {/* Header */}
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        {/* Left Section (Back Icon + Title) */}
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            {/* Title */}
                            <div className="font-utama text-white font-bold text-lg">
                                Riwayat Transaksi Pascabayar
                            </div>
                        </div>
                    </div>
                    {/* Search & Filter */}
                    <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                            {/* Search Bar */}
                            <input
                                id="searchInput"
                                type="text"
                                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                placeholder="Cari id transaksi/tujuan/nama produk"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {/* Search Icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="0.3"  // Ubah ketebalan stroke di sini
                                className="w-5 h-5 text-main"
                            >
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                            </svg>
                        </div>

                        {/* Sorting & Filter */}
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button
                                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                                className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    className="w-4 h-4 text-main"
                                    viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                                </svg>
                                <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">
                                    {sortOrder === "desc" ? "Terbaru" : "Terlama"}
                                </span>
                            </button>
                            <div className="shrink-0 w-px bg-main h-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    className="w-full h-full"
                                >
                                    <line x1="12" y1="4" x2="12" y2="20" />
                                </svg>
                            </div>
                            <button
                                onClick={() => setShowFilter(!showFilter)}
                                className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="w-4 h-4 text-main"
                                >
                                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                                </svg>
                                <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">Filter</span>
                            </button>
                        </div>
                    </div>

                    {showFilter && (
                        <div className="fixed h-screen px-4 inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50">
                            <div className="w-full max-w-[328px] p-4 bg-white rounded-lg shadow-lg">
                                <div className="w-full h-max flex flex-col space-y-4">
                                    {/* Tombol Close */}
                                    <button
                                        className="w-full flex justify-end"
                                        onClick={() => setShowFilter(false)}
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

                                    {/* Judul */}
                                    <h2 className="text-center text-utama text-lg font-medium">Filter Tanggal</h2>

                                    {/* Input Tanggal */}
                                    <div className="flex flex-col space-y-2">
                                        {/* Tanggal Mulai */}
                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-utama">Tanggal Mulai</label>
                                            <input
                                                type="date"
                                                className="text-sm px-3 py-2 border border-gray-200 rounded-md bg-neutral-100"
                                                value={dateRange.start}
                                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                            />
                                        </div>

                                        {/* Tanggal Akhir */}
                                        <div className="flex flex-col">
                                            <label className="text-sm font-medium text-utama">Tanggal Akhir</label>
                                            <input
                                                type="date"
                                                className="text-sm px-3 py-2 border border-gray-200 rounded-md bg-neutral-100"
                                                value={dateRange.end}
                                                min={dateRange.start ? getNextDate(dateRange.start) : ""}
                                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                            />
                                        </div>
                                    </div>


                                    {/* Tombol Aksi */}
                                    <div className="w-full flex flex-col gap-2 mt-2">
                                        <button
                                            onClick={() => setDateRange({ start: "", end: "" })}
                                            className="w-full border border-red-300 text-red-500 text-sm py-2 rounded hover:bg-red-50 transition"
                                        >
                                            Reset Tanggal
                                        </button>
                                        <button
                                            onClick={() => setShowFilter(false)}
                                            className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition"
                                        >
                                            Terapkan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-4 min-h-[756px] pt-[163px] bg-white">
                    {paginatedTransactions.length > 0 ? (
                        paginatedTransactions.map((transaction) => (
                            // Teruskan seluruh objek 'transaction' sebagai prop
                            <TransactionItem key={transaction.ref_id} transaction={transaction} />
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full mt-6">
                            <p className="text-gray-500">Tidak ada transaksi ditemukan.</p>
                        </div>
                    )}

                    {/* Laravel-style Pagination */}
                    {totalPages > 1 && (
                        <div className="w-full flex justify-center py-4">
                            <div className="flex flex-wrap justify-center items-center gap-1 max-w-full px-2">
                                {/* Tombol Prev */}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`px-2 py-1 text-xs rounded border transition-all ${currentPage === 1
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                                        : "bg-white hover:bg-gray-100 text-main border-gray-300"
                                        }`}
                                >
                                    « Prev
                                </button>

                                {/* Tombol Angka */}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2 py-1 text-xs rounded border transition-all ${page === currentPage
                                            ? "bg-main text-white border-main"
                                            : "bg-white hover:bg-gray-100 text-main border-gray-300"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                {/* Tombol Next */}
                                <button
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className={`px-2 py-1 text-xs rounded border transition-all ${currentPage === totalPages
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                                        : "bg-white hover:bg-gray-100 text-main border-gray-300"
                                        }`}
                                >
                                    Next »
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <div className="pt-12"><Footer /></div>
            </div>
        </>
    );
}