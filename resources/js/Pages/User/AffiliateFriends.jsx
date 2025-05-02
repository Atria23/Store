// import React, { useState, useEffect } from 'react';
// import { Link, usePage, Head } from '@inertiajs/react';

// export default function AffiliateFriends() {
//     const { referrals } = usePage().props;

//     const [searchQuery, setSearchQuery] = useState("");
//     const [currentPage, setCurrentPage] = useState(1);
//     const [sortOrder, setSortOrder] = useState("desc");
//     const [dateRange, setDateRange] = useState({ start: "", end: "" });
//     const [showFilter, setShowFilter] = useState(false);

//     const getNextDate = (dateString) => {
//         const date = new Date(dateString);
//         date.setDate(date.getDate() + 1);
//         return date.toISOString().split('T')[0];
//     };

//     const filteredReferrals = referrals
//         .filter((referral) => {
//             const lowerQuery = searchQuery.toLowerCase();

//             const matchSearch = referral.name?.toLowerCase().includes(lowerQuery);
//             const createdDate = new Date(referral.created_at);
//             const inDateRange =
//                 (!dateRange.start || createdDate >= new Date(dateRange.start)) &&
//                 (!dateRange.end || createdDate <= new Date(getNextDate(dateRange.end)));

//             return matchSearch && inDateRange;
//         })
//         .sort((a, b) => {
//             const dateA = new Date(a.created_at).getTime();
//             const dateB = new Date(b.created_at).getTime();
//             return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
//         });

//     const referralsPerPage = 10;
//     const paginatedReferrals = filteredReferrals.slice(
//         (currentPage - 1) * referralsPerPage,
//         currentPage * referralsPerPage
//     );

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [searchQuery, sortOrder, dateRange]);

//     const totalPages = Math.ceil(filteredReferrals.length / referralsPerPage);

//     return (
//         <>
//             <Head title="Affiliate Friends" />

//             <div className="p-6 max-w-4xl mx-auto">
//                 <h1 className="text-2xl font-bold mb-6 text-center">Teman yang Kamu Ajak</h1>

//                 <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                     <input
//                         type="text"
//                         placeholder="Cari nama..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="w-full md:w-1/3 px-4 py-2 border rounded shadow-sm"
//                     />

//                     <div className="flex items-center space-x-2">
//                         <label className="text-sm">Urutkan:</label>
//                         <select
//                             value={sortOrder}
//                             onChange={(e) => setSortOrder(e.target.value)}
//                             className="px-2 py-1 border rounded"
//                         >
//                             <option value="desc">Terbaru</option>
//                             <option value="asc">Terlama</option>
//                         </select>
//                     </div>

//                     <button
//                         onClick={() => setShowFilter(!showFilter)}
//                         className="text-sm text-blue-600 underline"
//                     >
//                         {showFilter ? 'Sembunyikan' : 'Tampilkan'} Filter Tanggal
//                     </button>
//                 </div>

//                 {showFilter && (
//                     <div className="mb-4 flex flex-col md:flex-row gap-2">
//                         <input
//                             type="date"
//                             value={dateRange.start}
//                             onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
//                             className="px-4 py-2 border rounded"
//                         />
//                         <input
//                             type="date"
//                             value={dateRange.end}
//                             onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
//                             className="px-4 py-2 border rounded"
//                         />
//                     </div>
//                 )}

//                 {filteredReferrals.length === 0 ? (
//                     <p className="text-gray-600 text-center">Belum ada teman yang diajak.</p>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         {paginatedReferrals.map((referral, index) => (
//                             <div key={index} className="border rounded-lg p-4 shadow-sm bg-white">
//                                 <p className="text-lg font-semibold text-gray-800">{referral.name}</p>
//                                 <p className="text-sm text-gray-600">
//                                     Total Transaksi: <span className="font-bold">{referral.transactions_count}</span>
//                                 </p>
//                                 <p className="text-sm text-gray-500">
//                                     Bergabung pada:{' '}
//                                     {new Date(referral.created_at).toLocaleDateString('id-ID', {
//                                         year: 'numeric',
//                                         month: 'long',
//                                         day: 'numeric',
//                                     })}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                     <div className="mt-6 flex justify-center space-x-2">
//                         {Array.from({ length: totalPages }, (_, i) => (
//                             <button
//                                 key={i}
//                                 onClick={() => setCurrentPage(i + 1)}
//                                 className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
//                                     }`}
//                             >
//                                 {i + 1}
//                             </button>
//                         ))}
//                     </div>
//                 )}

//                 <div className="mt-6 text-center">
//                     <Link href={route('affiliate.dashboard')} className="text-blue-600 hover:underline font-medium">
//                         ← Kembali ke Dashboard Afiliasi
//                     </Link>
//                 </div>
//             </div>
//         </>
//     );
// }
import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';

export default function AffiliateFriends() {
    const { referrals } = usePage().props;

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilter, setShowFilter] = useState(false);

    const getNextDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    const filteredReferrals = referrals
        .filter((referral) => {
            const lowerQuery = searchQuery.toLowerCase();
            const matchSearch = referral.name?.toLowerCase().includes(lowerQuery);

            const createdDate = new Date(referral.created_at);
            const inDateRange =
                (!dateRange.start || createdDate >= new Date(dateRange.start)) &&
                (!dateRange.end || createdDate <= new Date(dateRange.end));

            return matchSearch && inDateRange;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    const referralsPerPage = 10;
    const totalPages = Math.ceil(filteredReferrals.length / referralsPerPage);
    const paginatedReferrals = filteredReferrals.slice(
        (currentPage - 1) * referralsPerPage,
        currentPage * referralsPerPage
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOrder, dateRange]);

    return (
        <>
            <Head title="Affiliate Friends" />
            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">

                {/* Fixed Header & Filters */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    {/* Header */}
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        {/* Left Section (Back Icon + Title) */}
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <div className="font-utama text-white font-bold text-lg">
                                Teman Diundang
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
                                placeholder="Cari nama teman"
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

                {/* Main Content */}
                <div className="pt-[180px] pb-10 px-4 bg-white min-h-[756px]">
                    {paginatedReferrals.length === 0 ? (
                        <p className="text-center text-gray-500 mt-6">Belum ada teman yang diajak.</p>
                    ) : (
                        paginatedReferrals.map((referral, index) => (
                                <div
                                    key={referral.id ?? index}
                                    className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 w-full gap-2"
                                >
                                    {/* Kiri: Logo dan Informasi Produk */}
                                    <div className="flex items-center gap-2 w-full">

                                        {/* Informasi Produk */}
                                        <div className="flex flex-col items-start w-max space-y-[2px] pr-3">
                                            <p className="font-utama font-semibold text-sm truncate w-full max-w-[200px] [@media(max-width:315px)]:max-w-[250px]">
                                                {referral.name ?? 'Nama tidak tersedia'}
                                            </p>
                                            <p className="w-full font-utama text-xs text-gray-500">
                                                Terdaftar: {new Date(referral.created_at).toLocaleString("id-ID", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Kanan: Status */}
                                    <p className="min-[315px]:inline-flex items-center justify-center px-3 py-1 w-full max-w-[150px] text-xs rounded-3xl bg-blue-100 text-blue-600 text-center">
                                        {referral.transactions_count.toLocaleString("id-ID")} trx
                                    </p>
                                </div>
                        ))
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 flex-wrap gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded text-sm border ${currentPage === i + 1
                                        ? "bg-main text-white border-main"
                                        : "bg-white border-gray-300 text-main"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
