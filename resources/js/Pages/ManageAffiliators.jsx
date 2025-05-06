import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";

export default function ManageAffiliators({ affiliators }) {
    // Memastikan data valid
    if (!affiliators) {
        return <div>Loading...</div>;
    }

    // State untuk pencarian, sorting, dan pagination
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("desc"); // default sort terbaru
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredAffiliators, setFilteredAffiliators] = useState(affiliators);

    const itemsPerPage = 10;

    // Fungsi untuk mengatur urutan (terbaru/terlama)
    const handleSort = () => {
        setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    };

    // Fungsi untuk melakukan filter, sorting, dan pagination
    useEffect(() => {
        let result = affiliators.filter((aff) =>
            aff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (aff.referral_code && aff.referral_code.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        // Sort data berdasarkan tanggal gabung (joined_at)
        result = result.sort((a, b) => {
            const dateA = new Date(a.joined_at);
            const dateB = new Date(b.joined_at);
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });

        // Pagination logic
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedAffiliators = result.slice(startIndex, startIndex + itemsPerPage);

        setFilteredAffiliators(paginatedAffiliators);
    }, [searchTerm, sortOrder, currentPage, affiliators]);

    // Handle perubahan halaman
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Total halaman
    const totalPages = Math.ceil(affiliators.length / itemsPerPage);

    return (
        <>
            <Head title="Kelola Affiliator" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-white">
                {/* Fixed Header */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="w-full flex items-center justify-between px-4 py-2 bg-main">
                        {/* Kiri: Back + Title */}
                        <div className="flex items-center space-x-4">
                            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <div className="font-utama text-white font-bold text-lg">
                                Kelola Affiliator
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
                                placeholder="Cari nama/email/kode affiliator"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                </div>

                {/* Search & Filter */}
                <div className="mb-4 min-h-[756px] pt-[163px] bg-white">

                    {filteredAffiliators.length === 0 && (
                        <p className="text-center text-sm text-gray-500">Belum ada affiliator terdaftar.</p>
                    )}

                    {filteredAffiliators.map((aff) => (
                        <div key={aff.id} className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white">
                            <div className="mb-2">
                                <p className="font-semibold text-main">{aff.name}</p>
                                <p className="text-sm text-gray-500">{aff.email}</p>
                                {/* Tampilkan referral_code */}
                                {aff.referral_code && (
                                    <p className="text-xs text-gray-500">
                                        Kode Afiliator: <span className="font-mono">{aff.referral_code}</span>
                                    </p>
                                )}

                                <p className="text-xs text-gray-400">Gabung sejak {new Date(aff.joined_at).toLocaleDateString()}</p>
                            </div>

                            <div className="mt-3">
                                <p className="font-medium text-sm text-gray-600 mb-1">Referral:</p>
                                {aff.referrals.length > 0 ? (
                                    <ul className="space-y-2">
                                        {aff.referrals.map((ref) => (
                                            <li key={ref.id} className="text-sm border border-gray-100 rounded p-2 bg-white">
                                                <p className="font-semibold text-gray-800">{ref.name}</p>
                                                <div className="text-xs text-gray-400 flex justify-between">
                                                    <span>Gabung: {new Date(ref.joined_at).toLocaleDateString()}</span>
                                                    <span>Transaksi: {ref.transactions_count}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Belum ada teman yang diajak</p>
                                )}
                            </div>
                        </div>
                    ))}


                </div>

                {/* Pagination */}
                <div className="p-4 flex justify-center space-x-2">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 rounded-lg disabled:bg-gray-100"
                    >
                        Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index + 1)}
                            className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? "bg-main text-white" : "bg-gray-100"}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 rounded-lg disabled:bg-gray-100"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}
