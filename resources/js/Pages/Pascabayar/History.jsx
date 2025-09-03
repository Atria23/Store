import React from 'react';
import { Head, Link } from '@inertiajs/react';
// Import komponen Layout utama Anda
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
// Import komponen Paginasi Anda jika ada
// import Pagination from '@/Components/Pagination';

export default function History({ transactions }) {

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Sukses':
                return 'text-green-600';
            case 'Gagal':
                return 'text-red-600';
            case 'Pending':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        // Ganti <div...> dengan komponen Layout utama aplikasi Anda
        // <AuthenticatedLayout>
        <>
            <Head title="Riwayat Transaksi Pascabayar" />

            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Riwayat Transaksi Pascabayar</h1>

                <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jenis</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No. Pelanggan</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Bayar</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.length > 0 ? (
                                transactions.data.map((tx) => (
                                    <tr key={tx.ref_id}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{formatDate(tx.created_at)}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{tx.type}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{tx.customer_no}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{formatCurrency(tx.selling_price)}</td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className={getStatusClass(tx.status)}>
                                                {tx.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                            <Link href={route('postpaid.history.show', tx.ref_id)} className="text-indigo-600 hover:text-indigo-900 font-semibold">
                                                Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-gray-500">
                                        Tidak ada riwayat transaksi ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* 
                    Tambahkan komponen Paginasi di sini.
                    <Pagination className="mt-6" links={transactions.links} />
                */}
            </div>
        {/* </AuthenticatedLayout> */}
        </>
    );
}