import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";

export default function PoinmuHistory({ poinmuHistory }) {
    const { users } = usePage().props;
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilter, setShowFilter] = useState(false);

    // Handling date filter change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Filtering and Sorting Logic
    const filteredHistory = poinmuHistory.data
        .filter((history) => {
            const query = searchQuery.toLowerCase();
            const match =
                history.type?.toLowerCase().includes(query) ||
                history.description?.toLowerCase().includes(query);

            const createdDate = new Date(history.created_at);
            const inDateRange =
                (!dateRange.start || createdDate >= new Date(dateRange.start)) &&
                (!dateRange.end || createdDate <= new Date(dateRange.end));

            return match && inDateRange;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

    const paginatedHistory = filteredHistory.slice(
        (currentPage - 1) * 10,
        currentPage * 10
    );

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
        });
    };

    const getNextDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="mx-auto w-full max-w-[500px] min-h-screen bg-white">
            <Head title="Riwayat PoinMu" />

            {/* Header */}
            <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                <div className="w-full flex items-center px-4 py-2 space-x-4">
                    <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                            <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    <div className="text-white font-bold text-lg font-utama">Riwayat PoinMu</div>
                </div>
            </header>

            <div className="h-11" />
            {/* Search & Filter */}
            <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                    {/* Search Bar */}
                    <input
                        id="searchInput"
                        type="text"
                        className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                        placeholder="Cari jenis atau deskripsi"
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
                            <h2 className="text-center text-utama text-lg font-medium">Filter Tanggal Pembuatan</h2>

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

            {/* Main Content */}
            <main className="w-full px-4 pt-4 pb-16">
                {paginatedHistory.length > 0 ? (
                    paginatedHistory.map((history) => {
                        const match = history.description?.match(/ke\s+([\w]+)/i);
                        const iconKey = match ? match[1].toLowerCase() : null;


                        return (
                            <Link key={history.id} href={`/poinmu-history/${history.id}`}>
                                <div className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 cursor-pointer w-full gap-2">
                                    {/* Left: Icon and Info */}
                                    <div className="flex items-center gap-2 w-full">
                                        {/* Dynamic Icon */}
                                        <div className="w-14 h-14 p-2 bg-white shadow hidden min-[350px]:flex items-center justify-center rounded-xl">
                                            {iconKey ? (
                                                <img
                                                    src={`/storage/redeem_account/${iconKey}.png`}
                                                    alt={iconKey}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/storage/redeem_account/dompetmu.png';
                                                    }}
                                                />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-full h-full text-main" viewBox="0 0 16 16">
                                                    <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                                </svg>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex flex-col items-start w-max space-y-[2px]">
                                            <p className="font-utama font-semibold text-sm truncate max-w-[200px]">
                                                {history.type
                                                    ? history.type.charAt(0).toUpperCase() + history.type.slice(1)
                                                    : '-'}
                                            </p>
                                           <span
                                                        className={`
    px-2 rounded-full text-xs font-normal w-fit
    ${history.status === 'pending'
                                                                ? 'border border-yellow-600 bg-yellow-100 text-yellow-600'
                                                                : history.status === 'sukses'
                                                                    ? 'border border-green-600 bg-green-100 text-green-600'
                                                                    : 'border border-red-600 bg-red-100 text-red-600'}
  `}
                                                    >
                                                {history.status
                                                    ? history.status.charAt(0).toUpperCase() + history.status.slice(1)
                                                    : '-'}
                                            </span>
                                            <p className="w-full font-utama text-sm text-gray-500">
                                                {formatDate(history.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Points Status */}
                                    <p
                                        className={`hidden min-[315px]:flex w-[110px] items-center justify-center py-2 text-xs rounded-3xl text-center border 
                                ${history.points < 0
                                                ? 'border-red-600 bg-red-100 text-red-600'
                                                : 'border-green-600 bg-green-100 text-green-600'
                                            }`}
                                        title={`${history.points > 0 ? '+' : ''}${history.points.toLocaleString('id-ID')} PoinMu`}
                                    >
                                        {history.points > 0 ? '+' : ''}
                                        {history.points.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-center">Belum ada riwayat PoinMu.</p>
                )}

                {/* Pagination */}
                <div className="mt-6 flex justify-center flex-wrap gap-2">
                    {poinmuHistory.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url ?? "#"}
                            className={`px-3 py-1 border text-sm rounded ${link.active ? "bg-main text-white" : "bg-gray-100 text-gray-700"
                                } ${!link.url ? "pointer-events-none opacity-50" : ""}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </main>

        </div>
    );
}
