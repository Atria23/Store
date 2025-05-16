import { useState, useEffect } from "react";
import { Head, usePage, useForm, router } from "@inertiajs/react";

const TransactionItem = ({
    id,
    ref_id,
    product_name,
    customer_no,
    price,
    status,
    created_at,
    user_id,
    sn,
}) => {
    const [isEditing, setIsEditing] = useState(false);

    const statusClasses = {
        Sukses: "bg-green-100 text-green-600",
        Pending: "bg-yellow-100 text-yellow-600",
        Gagal: "bg-red-100 text-red-600",
    };

    const formattedDate = new Date(created_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
    });

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const { data, setData, post, processing, errors } = useForm({
        id,
        status: status || "",
        sn: sn || "",
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submit function triggered");
    
        post("/transactions/update", {
            data: {
                id, // Pastikan ID dikirimkan
                status: data.status,
                sn: data.sn,
            },
            preserveScroll: true,
            onSuccess: () => {
                console.log("Update sukses");
                setIsEditing(false);
                router.visit(route("manage.history")); // 🔁 Redirect manual
            },
            onError: (error) => {
                console.error("Terjadi error saat update:", error);
            },
        });
    };

    const formattedCustomerNo = (customer_no) => {
        if (customer_no.length >= 6) {
            return customer_no.slice(0, 3) + "****" + customer_no.slice(-3);
        } else {
            return customer_no.slice(0, 3) + (customer_no.length > 3 ? "****" : "");
        }
    };

    const { get } = useForm();

    const handleTransactionClick = () => {
        get(`/history/${ref_id}`);
    };

    return (
        <div
            className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 w-full gap-2"
        >
            {/* Kiri: Logo dan Informasi Produk */}
            <div className="flex items-center gap-2 w-full">
                {/* Logo */}
                <div className="w-14 bg-white shadow hidden min-[350px]:flex items-center justify-center rounded-xl">
                    <img
                        src="/storage/logo.webp"
                        alt="Company Logo"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Informasi Produk */}
                <div className="flex flex-col items-start w-max space-y-[2px]">
                    <p className="font-utama font-semibold text-sm truncate w-full max-w-[180px] [@media(max-width:350px)]:max-w-[215px]">
                        {product_name}
                    </p>
                    <p className="w-full font-utama text-sm">
                        ID Tujuan: {formattedCustomerNo(customer_no)}
                    </p>
                    <p className="w-full max-w-[200px] font-utama text-sm truncate" title={sn}>
                        SN: {sn}
                    </p>

                    <p
                        onClick={handleTransactionClick}
                        className="w-full font-utama text-sm text-blue-600 hover:underline cursor-pointer">
                        ID: {ref_id}
                    </p>
                </div>
            </div>

            {/* Kanan: Status dan Tanggal */}
            <div className="w-full flex flex-col items-end justify-end space-y-1">
                <a
                    href={`/manage-users/${user_id}/edit`}
                    className="text-blue-600 hover:underline text-xs"
                >
                    User ID: {user_id}
                </a>
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-2 w-full">
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="w-full p-2 rounded-md border"
                        >
                            <option value="Pending">Pending</option>
                            <option value="Sukses">Sukses</option>
                            <option value="Gagal">Gagal</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Enter SN"
                            value={data.sn}
                            onChange={(e) => setData("sn", e.target.value)}
                            className="w-full p-2 rounded-md border"
                        />

                        <div className="flex justify-between space-x-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                            >
                                Save
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <p
                            className={`w-max-full min-[300px]:flex px-2 py-[2px] text-xs rounded-3xl justify-center ${statusClasses[status]}`}
                        >
                            {status}
                        </p>
                        <p className="hidden min-[350px]:flex font-utama text-[12px] text-right">
                            {formattedDate}
                        </p>

                        <button
                            onClick={handleEditClick}
                            className="text-blue-600 text-sm mt-2"
                        >
                            Edit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const History = () => {
    const { transactions: initialTransactions } = usePage().props;
    const [transactions, setTransactions] = useState(initialTransactions);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [showFilter, setShowFilter] = useState(false);

    const filteredTransactions = transactions
        .filter((transaction) => {
            const lowerQuery = searchQuery.toLowerCase();
            const matchSearch =
                transaction.product_name.toLowerCase().includes(lowerQuery) ||
                transaction.customer_no.toLowerCase().includes(lowerQuery) ||
                transaction.ref_id.toLowerCase().includes(lowerQuery);

            const createdDate = new Date(transaction.created_at);
            const inDateRange =
                (!dateRange.start || createdDate >= new Date(dateRange.start)) &&
                (!dateRange.end || createdDate <= new Date(dateRange.end));

            return matchSearch && inDateRange;
        })
        .sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();

            if (dateA === dateB) {
                return 0; // atau bisa pakai fallback sort by ID kalau butuh
            }

            return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        });


    const getNextDate = (dateString) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    const transactionsPerPage = 10;
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * transactionsPerPage,
        currentPage * transactionsPerPage
    );
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortOrder, dateRange]);


    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    const fetchAndUpdateTransactions = () => {
        transactions.forEach((transaction) => {
            if (transaction.status === "Pending") {
                fetch("/transactions/update-status", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector("meta[name='csrf-token']").getAttribute("content"),
                    },
                    body: JSON.stringify({ transaction_id: transaction.ref_id }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            setTransactions((prevTransactions) =>
                                prevTransactions.map((t) =>
                                    t.ref_id === transaction.ref_id ? { ...t, status: data.new_status || t.status } : t
                                )
                            );
                        }
                    })
                    .catch((error) => console.error("Error updating transaction status:", error));
            }
        });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchAndUpdateTransactions();
        }, 1000);
        return () => clearInterval(interval);
    }, [transactions]);

    return (
        <>
            <Head title="Manage History" />
            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
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
                            {/* Title */}
                            <div className="font-utama text-white font-bold text-lg">
                                Kelola Transaksi
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
                            <TransactionItem key={transaction.ref_id} {...transaction} />
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

            </div>
        </>
    );
};

export default History;