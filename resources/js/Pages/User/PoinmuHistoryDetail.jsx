import React from "react";
import { Head, Link } from "@inertiajs/react";

export default function PoinmuHistoryDetail({ history }) {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <Head title="Detail Poinmu" />
            <h1 className="text-2xl font-bold mb-4">Detail Riwayat Poinmu</h1>

            <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <p className="mb-2"><strong>Tanggal:</strong> {new Date(history.created_at).toLocaleString()}</p>
                <p className="mb-2"><strong>Tipe:</strong> {history.type}</p>
                <p className={`mb-2 ${history.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    <strong>Poin:</strong> {history.points > 0 ? `+${history.points}` : history.points}
                </p>
                <p className="mb-2"><strong>Poin Sebelumnya:</strong> {history.previous_points}</p>
                <p className="mb-2"><strong>Poin Sekarang:</strong> {history.new_points}</p>
                {history.description && (
                    <p className="mb-2"><strong>Deskripsi:</strong> {history.description}</p>
                )}
            </div>

            <Link href="/poinmu-history" className="text-blue-500 hover:underline">
                &larr; Kembali ke Riwayat Poin
            </Link>
        </div>
    );
}
