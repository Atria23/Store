import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function PoinmuHistory({ poinmuHistory }) {
    return (
        <div className="max-w-4xl mx-auto p-4">
            <Head title="Riwayat Poinmu" />
            <h1 className="text-2xl font-bold mb-4">Riwayat Poinmu</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-4 py-2">Tanggal</th>
                        <th className="border px-4 py-2">Tipe</th>
                        <th className="border px-4 py-2">Poin</th>
                        <th className="border px-4 py-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {poinmuHistory.data.map((history) => (
                        <tr key={history.id} className="hover:bg-gray-100">
                            <td className="border px-4 py-2">{new Date(history.created_at).toLocaleString()}</td>
                            <td className="border px-4 py-2">{history.type}</td>
                            <td className={`border px-4 py-2 ${history.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {history.points > 0 ? `+${history.points}` : history.points}
                            </td>
                            <td className="border px-4 py-2">
                                <Link href={`/poinmu-history/${history.id}`} className="text-blue-500 hover:underline">
                                    Detail
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-4">
                {poinmuHistory.links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-1 border ${link.active ? "bg-blue-500 text-white" : "bg-gray-100"} mx-1`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
