
import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";

export default function AffiliateHistoryDetail() {
    const { transactions, params, store } = usePage().props;

    // Fungsi untuk memformat tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("id-ID", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    return (
        <div className="container mx-auto p-4">
            <Head title={`Affiliate History`} />

            <h1 className="text-2xl font-bold mb-4">Affiliate History - {params.affiliator_id}</h1>

            {store && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <h2 className="text-lg font-semibold">Store Information</h2>
                    <p><strong>Name:</strong> {store.name}</p>
                    <p><strong>Address:</strong> {store.address}</p>
                    <p><strong>Phone:</strong> {store.phone_number}</p>
                    {store.image && <img src={store.image} alt="Store" className="w-32 h-32 rounded-md mt-2" />}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg">
                    <thead>
                        <tr className="bg-gray-200 text-gray-700">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Commission</th>
                            <th className="p-2 border">ID Transaction</th>
                            <th className="p-2 border">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((item) => (
                            <tr key={item.id} className="text-center">
                                <td className="p-2 border">{item.id}</td>
                                <td className="p-2 border">
                                    {item.affiliate_product ? (
                                        <Link href={`/affiliate-products/${item.affiliate_product.id}`} className="text-blue-500 hover:underline">
                                            {item.affiliate_product.product_name}
                                        </Link>
                                    ) : "N/A"}
                                </td>
                                <td className="p-2 border">Rp {item.commission}</td>
                                <td className="p-2 border">{item.transaction?.id || "N/A"}</td>
                                <td className="p-2 border">{formatDate(item.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
