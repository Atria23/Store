import React from 'react';
import { Head, Link } from '@inertiajs/react';
// import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

// Helper Functions
const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Komponen terpisah untuk merender detail spesifik produk
const SpecificDetails = ({ transaction }) => {
    const { type, details } = transaction;

    switch (type) {
        case 'PLN':
            return (
                <div>
                    <p><strong>Tarif / Daya:</strong> {details.tarif} / {details.daya} VA</p>
                    <p><strong>Lembar Tagihan:</strong> {details.lembar_tagihan}</p>
                    {details.bill_details.map((bill, index) => (
                        <div key={index} className="mt-4 border-t pt-2">
                            <p><strong>Periode:</strong> {bill.periode}</p>
                            <p><strong>Nilai Tagihan:</strong> {formatCurrency(bill.nilai_tagihan)}</p>
                            <p><strong>Denda:</strong> {formatCurrency(bill.denda)}</p>
                            {bill.meter_awal && <p><strong>Meter Awal-Akhir:</strong> {bill.meter_awal} - {bill.meter_akhir}</p>}
                        </div>
                    ))}
                </div>
            );
        case 'PDAM':
            return (
                <div>
                    <p><strong>Alamat:</strong> {details.alamat}</p>
                    <p><strong>Jatuh Tempo:</strong> {details.jatuh_tempo}</p>
                    {details.bill_details.map((bill, index) => (
                        <div key={index} className="mt-4 border-t pt-2">
                            <p><strong>Periode:</strong> {bill.periode}</p>
                            <p><strong>Nilai Tagihan:</strong> {formatCurrency(bill.nilai_tagihan)}</p>
                            <p><strong>Meter Awal-Akhir:</strong> {bill.meter_awal} - {bill.meter_akhir}</p>
                        </div>
                    ))}
                </div>
            );
        case 'INTERNET':
            return (
                <div>
                    <p><strong>Lembar Tagihan:</strong> {details.lembar_tagihan}</p>
                    {details.bill_details.map((bill, index) => (
                        <div key={index} className="mt-4 border-t pt-2">
                            <p><strong>Periode:</strong> {bill.periode}</p>
                            <p><strong>Nilai Tagihan:</strong> {formatCurrency(bill.nilai_tagihan)}</p>
                        </div>
                    ))}
                </div>
            );
        case 'BPJS':
            return (
                <div>
                    <p><strong>Jumlah Peserta:</strong> {details.jumlah_peserta}</p>
                    {details.nama_cabang && <p><strong>Nama Cabang:</strong> {details.nama_cabang}</p>}
                    {details.bill_details.map((bill, index) => (
                        <div key={index} className="mt-4 border-t pt-2">
                            <p><strong>Periode:</strong> Bulan ke-{bill.periode}</p>
                        </div>
                    ))}
                </div>
            );
        default:
            return <p>Detail untuk tipe produk ini tidak tersedia.</p>;
    }
};

export default function HistoryDetail({ transaction }) {
    const getStatusClass = (status) => {
        return status === 'Sukses' ? 'text-green-600' : status === 'Gagal' ? 'text-red-600' : 'text-yellow-600';
    };

    return (
        // <AuthenticatedLayout>
        <>
            <Head title={`Detail Transaksi ${transaction.ref_id}`} />
            
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <Link href={route('postpaid.history.index')} className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">&larr; Kembali ke Riwayat</Link>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Detail Transaksi</h1>

                <div className="bg-white shadow-md rounded-lg p-6">
                    {/* Bagian Data Umum */}
                    <h2 className="text-xl font-semibold border-b pb-2 mb-4">Informasi Umum</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <p><strong>Ref ID:</strong> <span className="text-gray-700">{transaction.ref_id}</span></p>
                        <p><strong>Jenis:</strong> <span className="text-gray-700">{transaction.type}</span></p>
                        <p><strong>Tanggal:</strong> <span className="text-gray-700">{formatDate(transaction.created_at)}</span></p>
                        <p><strong>Status:</strong> <span className={getStatusClass(transaction.status)}>{transaction.status}</span></p>
                        <p><strong>No. Pelanggan:</strong> <span className="text-gray-700">{transaction.customer_no}</span></p>
                        <p><strong>Nama Pelanggan:</strong> <span className="text-gray-700">{transaction.customer_name}</span></p>
                        <p><strong>Total Bayar:</strong> <span className="text-gray-700">{formatCurrency(transaction.selling_price)}</span></p>
                        <p><strong>Biaya Admin:</strong> <span className="text-gray-700">{formatCurrency(transaction.admin_fee)}</span></p>
                        {transaction.details.sn && <p><strong>SN/Token:</strong> <span className="text-gray-700">{transaction.details.sn}</span></p>}
                        <p className="md:col-span-2"><strong>Pesan:</strong> <span className="text-gray-700">{transaction.message}</span></p>
                    </div>

                    {/* Bagian Detail Spesifik Produk */}
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold border-b pb-2 mb-4">Detail Produk</h2>
                        <div className="text-gray-700">
                           <SpecificDetails transaction={transaction} />
                        </div>
                    </div>
                </div>
            </div>
        {/* </AuthenticatedLayout> */}
        </>
    );
}