import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function DepositAdmin() {
    const { props } = usePage();
    const alert = props.alert || null;

    const { data, setData, post, processing, errors } = useForm({
        amount: 200000,
        bank: 'BCA',
        owner_name: 'Danu Trianggoro',
    });

    const [formattedAmount, setFormattedAmount] = useState(() =>
        formatRupiah(data.amount.toString())
    );

    const [result, setResult] = useState(() => (
        alert?.type === 'success' ? alert : null
    ));

    useEffect(() => {
        if (alert?.type === 'success') {
            setResult(alert);
        }
    }, [alert]);

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        const intVal = parseInt(raw || '0', 10);

        setData('amount', intVal);
        setFormattedAmount(formatRupiah(raw));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setResult(null);
        post(route('deposit-admin.store'));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="max-w-[500px] mx-auto">
            <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                {/* Left Section (Back Icon + Title) */}
                <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                    {/* Back Icon */}
                    <button
                        className="shrink-0 w-6 h-6"
                        onClick={() => window.history.back()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    {/* Title */}
                    <div className="font-utama text-white font-bold text-lg">
                        Deposit Admin
                    </div>
                </div>
            </div>
            {/* Alert Success */}
            {result && result.type === 'success' && (
                <div className="mt-6 p-4 bg-green-100 border rounded text-green-800 space-y-3">
                    <h2 className="font-semibold mb-2">Permintaan Deposit Diterima</h2>

                    <div className="flex items-center justify-between">
                        <span>
                            Jumlah yang harus ditransfer:{' '}
                            <strong>{Number(result.amount).toLocaleString('id-ID')}</strong>
                        </span>
                        <button
                            onClick={() => copyToClipboard(result.amount.toString())}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Salin
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>
                            Berita transfer: <strong>{result.notes}</strong>
                        </span>
                        <button
                            onClick={() => copyToClipboard(result.notes)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Salin
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>
                            Nomor Rekening: <strong>{result.account_number}</strong>
                        </span>
                        <button
                            onClick={() => copyToClipboard(result.account_number)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Salin
                        </button>
                    </div>
                </div>
            )}


            {/* Alert Error */}
            {alert?.type === 'error' && (
                <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
                    {alert.message}
                </div>
            )}

            {/* API validation error */}
            {errors.api && (
                <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{errors.api}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6 px-4">
                <div>
                    <label className="block font-medium">Jumlah Deposit</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={formattedAmount}
                        onChange={handleAmountChange}
                    />
                    {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
                </div>

                <div>
                    <label className="block font-medium">Bank Tujuan</label>
                    <select
                        className="w-full border rounded p-2"
                        value={data.bank}
                        onChange={(e) => setData('bank', e.target.value)}
                    >
                        <option value="BCA">BCA</option>
                        <option value="MANDIRI">MANDIRI</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                    </select>
                    {errors.bank && <div className="text-red-500 text-sm">{errors.bank}</div>}
                </div>

                <div>
                    <label className="block font-medium">Nama Pemilik Rekening</label>
                    <input
                        type="text"
                        className="w-full border rounded p-2"
                        value={data.owner_name}
                        onChange={(e) => setData('owner_name', e.target.value)}
                    />
                    {errors.owner_name && <div className="text-red-500 text-sm">{errors.owner_name}</div>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-600 text-white py-2 px-4 rounded w-full"
                >
                    {processing ? 'Mengirim...' : 'Kirim Permintaan Deposit'}
                </button>
            </form>
        </div>
    );
}

function formatRupiah(value) {
    const number = parseInt(value || '0', 10);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    })
        .format(number)
        .replace(/^Rp/, 'Rp');
}
