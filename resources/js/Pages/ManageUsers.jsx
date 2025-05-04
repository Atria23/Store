import { useEffect, useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";

export default function UserManagement() {
    const { users, total_balance } = usePage().props;

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilter, setShowFilter] = useState(false);
    const [showBalance, setShowBalance] = useState(false);

    const toggleBalanceVisibility = () => {
        setShowBalance(!showBalance);
    };

    const filteredUsers = users
        .filter((user) => {
            const query = searchQuery.toLowerCase();
            const match =
                user.name?.toLowerCase().includes(query) ||
                user.email?.toLowerCase().includes(query);

            const createdDate = new Date(user.created_at);
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

    const totalPages = Math.ceil(filteredUsers.length / 10);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * 10,
        currentPage * 10
    );

    const getNextDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOrder, dateRange]);

    const handleEdit = (userId) => {
        // Redirect to the edit user page
        router.get(route('manage-users.edit', userId));
    };

    const handleDelete = (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            // Call API to delete user
            // Example using Inertia's delete method
            router.delete(route('manage-users.destroy', userId), {
                onSuccess: () => {
                    alert('User deleted successfully');
                },
                onError: (error) => {
                    alert('Error deleting user: ' + error.message);
                }
            });
        }
    };

    return (
        <>
            <Head title="Manage User" />
            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
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
                                Manajemen Pengguna
                            </div>
                        </div>

                        {/* Kanan: Balance + Toggle */}
                        <div className="flex items-center space-x-2">
                            <span className="text-white text-sm font-semibold">
                                {showBalance ? `Rp${total_balance.toLocaleString('id-ID')}` : '••••••'}
                            </span>
                            <button onClick={toggleBalanceVisibility} className="text-white">
                                {showBalance ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                        <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8Zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                                    </svg>
                                )}
                            </button>
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
                                placeholder="Cari nama/email pengguna"
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
                </div>

                <div className="mb-4 min-h-[756px] pt-[163px] bg-white">
                    {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex justify-between items-center p-3 border-b border-neutral-200"
                            >
                                {/* Kiri: Logo dan Informasi Produk */}
                                <div className="flex items-center gap-2 w-full">
                                    {/* Logo */}
                                    <div className="w-14 bg-white shadow hidden min-[406px]:flex items-center justify-center rounded-xl">
                                        <img
                                            // src="/storage/logo.webp"
                                            src={user.avatar || "/default-avatar.png"}
                                            alt="Company Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Informasi Produk */}
                                    <div className="flex flex-col items-start w-max space-y-[2px]">
                                        <p className="font-utama font-semibold text-sm truncate w-full max-w-[200px] [@media(max-width:350px)]:max-w-[215px]">
                                            {user.name}
                                        </p>
                                        <p className="w-full font-utama text-sm">{user.email}</p>


                                        <p className="flex items-center text-xs px-2 py-1 bg-green-100 text-green-600 rounded-lg font-medium whitespace-nowrap">
                                            Rp{Number(user.balance).toLocaleString("id-ID")}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-full flex items-end justify-end gap-2 flex-wrap sm:flex-nowrap">

                                    {/* Edit */}
                                    <button
                                        onClick={() => handleEdit(user.id)}
                                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
                                        title="Edit"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-pencil-fill"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 
                14.207 5.5l1.647-1.646a.5.5 0 0 0 
                0-.708zm.646 6.061L9.793 2.5 3.293 
                9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 
                1 .5.5v.5h.5a.5.5 0 0 1 
                .5.5v.5h.5a.5.5 0 0 1 
                .5.5v.207zm-7.468 7.468A.5.5 0 0 1 
                6 13.5V13h-.5a.5.5 0 0 
                1-.5-.5V12h-.5a.5.5 0 0 
                1-.5-.5V11h-.5a.5.5 0 0 
                1-.5-.5V10h-.5a.5.5 0 0 
                1-.175-.032l-.179.178a.5.5 0 0 
                0-.11.168l-2 5a.5.5 0 0 
                0 .65.65l5-2a.5.5 0 0 0 
                .168-.11z"/>
                                        </svg>
                                    </button>

                                    {/* Hapus */}
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                        title="Hapus"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-trash3-fill"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M11 1.5v1h3.5a.5.5 0 0 
                1 0 1h-.538l-.853 10.66A2 2 0 0 
                1 11.115 16h-6.23a2 2 0 0 
                1-1.994-1.84L2.038 3.5H1.5a.5.5 
                0 0 1 0-1H5v-1A1.5 1.5 0 0 
                1 6.5 0h3A1.5 1.5 0 0 1 11 
                1.5m-5 0v1h4v-1a.5.5 0 0 
                0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 
                5.029l.5 8.5a.5.5 0 1 
                0 .998-.06l-.5-8.5a.5.5 0 1 
                0-.998.06m6.53-.528a.5.5 0 0 
                0-.528.47l-.5 8.5a.5.5 0 0 
                0 .998.058l.5-8.5a.5.5 0 0 
                0-.47-.528M8 4.5a.5.5 0 0 
                0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 
                0 0 0-.5-.5"/>
                                        </svg>
                                    </button>
                                </div>


                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full mt-6">
                            <p className="text-gray-500">Tidak ada pengguna ditemukan.</p>
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


            </div>
        </>
    );
}
