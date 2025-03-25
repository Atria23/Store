import React from "react";
import { Head, Link } from "@inertiajs/react";

const AffiliateDashboard = ({ affiliator, referrals, affiliateHistory }) => {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            <Head title="Affiliate Dashboard" />
            <h1 className="text-2xl font-bold text-center mb-4">Affiliate Dashboard</h1>

            {/* Informasi Affiliator */}
            <div className="p-4 bg-blue-100 rounded-lg mb-6">
                <h2 className="text-xl font-semibold">Informasi Affiliator</h2>
                <p><strong>Referral Code:</strong> {affiliator.referral_code}</p>
                <p><strong>Total Komisi:</strong> Rp {affiliator.total_commission.toLocaleString()}</p>
            </div>

            {/* Daftar Referral */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Referral Anda</h2>
                {referrals.length > 0 ? (
                    <ul className="list-disc list-inside bg-gray-100 p-4 rounded-lg">
                        {referrals.map((referral) => (
                            <li key={referral.id}>
                                {referral.user.name} ({referral.user.email})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Belum ada referral.</p>
                )}
            </div>

            {/* Riwayat Affiliate */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Riwayat Komisi</h2>
                {affiliateHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-blue-500 text-white">
                                    <th className="p-2 border border-gray-300">Tanggal</th>
                                    <th className="p-2 border border-gray-300">Produk</th>
                                    <th className="p-2 border border-gray-300">Komisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {affiliateHistory.map((history) => (
                                    <tr key={history.id} className="border border-gray-300">
                                        <td className="p-2">{new Date(history.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <Link href={`/affiliate-products/${history.affiliate_product.id}`} className="text-blue-500 hover:underline">
                                                {history.affiliate_product.product_name}
                                            </Link>
                                        </td>                                    
                                        <td className="p-2">Rp {history.commission.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500">Belum ada riwayat komisi.</p>
                )}
            </div>
        </div>
    );
};

export default AffiliateDashboard;
