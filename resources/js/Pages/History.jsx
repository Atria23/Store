import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Footer from "../Components/Footer";
import { Inertia } from "@inertiajs/inertia";

const TransactionItem = ({ ref_id, product_name, customer_no, price, status, created_at }) => {
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

    const formattedCustomerNo = (customer_no) => {
        if (customer_no.length >= 6) {
            return customer_no.slice(0, 3) + "****" + customer_no.slice(-3);
        } else {
            return customer_no.slice(0, 3) + (customer_no.length > 3 ? "****" : "");
        }
    };

    const handleTransactionClick = () => {
        Inertia.visit(`/history/${ref_id}`);
    };

    return (
        <div onClick={handleTransactionClick} className="flex items-center p-4 rounded-lg shadow-md bg-white my-2 cursor-pointer">
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-full shadow bg-blue-50 text-blue-600 mr-4">
                <img src="/storage/logo.webp" alt="Company Logo" className="rounded-lg" />
            </div>
            <div className="flex-grow overflow-hidden">
                <div className="text-md font-semibold text-gray-700 truncate">{product_name}</div>
                <div className="text-sm font-bold text-blue-500 truncate">ID: {formattedCustomerNo(customer_no)}</div>
                <div className="text-sm text-gray-500 truncate">
                    <span className="font-semibold bg-gray-200 px-2 py-1 rounded">#{ref_id}</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">{formattedDate}</div>
            </div>
            <div className="flex flex-col items-end ml-4">
                <span className={`px-3 py-1 mt-2 text-sm font-medium rounded-lg ${statusClasses[status]}`}>{status}</span>
            </div>
        </div>
    );
};

const History = () => {
    const { transactions: initialTransactions } = usePage().props;
    const [transactions, setTransactions] = useState(initialTransactions.slice(0, 10));
    const [searchQuery, setSearchQuery] = useState("");
    const [hasMore, setHasMore] = useState(initialTransactions.length > 10);
    const [loading, setLoading] = useState(false);

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

    const loadMoreTransactions = () => {
        if (loading) return;

        setLoading(true);
        const nextTransactions = initialTransactions.slice(transactions.length, transactions.length + 10);
        setTransactions((prevTransactions) => [...prevTransactions, ...nextTransactions]);

        if (transactions.length + nextTransactions.length >= initialTransactions.length) {
            setHasMore(false);
        }
        setLoading(false);
    };

    const filteredTransactions = transactions.filter(
        (transaction) =>
            transaction.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.customer_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.ref_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                {/* Header Sticky */}
                <div className="sticky top-0 z-20 bg-blue-600 text-white py-4 px-6 shadow-md">
                    <h1 className="text-lg font-semibold">Riwayat Transaksi</h1>
                </div>

                {/* Search Sticky */}
                <div className="sticky top-[60px] z-20 bg-gray-50 px-6 py-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari transaksi"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-3 pl-12 pr-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                        />
                        <svg
                            className="w-6 h-6 text-blue-600 absolute left-4 top-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="2"
                                d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                            />
                        </svg>
                    </div>
                </div>


                {/* List Transaksi */}
                <div className="flex-1 overflow-y-auto px-6 py-2">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                            <TransactionItem key={transaction.ref_id} {...transaction} />
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-gray-500">Tidak ada transaksi ditemukan.</p>
                        </div>
                    )}
                </div>

                {/* Tombol Muat Lebih Banyak Sticky */}
                {hasMore && (
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={loadMoreTransactions}
                            className="px-6 py-2 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-300"
                            disabled={loading}
                        >
                            {loading ? "Memuat..." : "Muat Lebih Banyak"}
                        </button>
                    </div>
                )}
            </div>
            <div className="pt-16"><Footer /></div>
        </>
    );
};


export default History;
