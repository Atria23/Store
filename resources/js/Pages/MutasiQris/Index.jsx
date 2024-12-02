import React from "react";
import { Head } from "@inertiajs/react";

const MutasiQris = ({ mutasiQris }) => {
    return (
        <div className="container mx-auto px-4 py-6">
            <Head title="Mutasi QRIS" />
            <h1 className="text-2xl font-bold mb-4">Mutasi QRIS</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">Tanggal</th>
                            <th className="border border-gray-300 px-4 py-2">Nominal</th>
                            <th className="border border-gray-300 px-4 py-2">Jenis</th>
                            <th className="border border-gray-300 px-4 py-2">QRIS</th>
                            <th className="border border-gray-300 px-4 py-2">Brand</th>
                            <th className="border border-gray-300 px-4 py-2">Issuer Ref</th>
                            <th className="border border-gray-300 px-4 py-2">Buyer Ref</th>
                            <th className="border border-gray-300 px-4 py-2">Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mutasiQris.data.map((item, index) => (
                            <tr key={index} className="text-center">
                                <td className="border border-gray-300 px-4 py-2">{item.date}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.amount}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.type}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.qris}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.brand_name}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.issuer_reff}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.buyer_reff}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.balance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4">
                <div className="flex justify-between">
                    {mutasiQris.links.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            className={`px-4 py-2 border rounded ${
                                link.active ? "bg-blue-500 text-white" : "bg-white"
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MutasiQris;
