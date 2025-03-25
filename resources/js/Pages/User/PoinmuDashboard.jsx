import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';

export default function PoinmuDashboard() {
    const { user, poinmuHistory } = usePage().props;
    const [redeemPoints, setRedeemPoints] = useState('');

    const handleRedeem = () => {
        if (!redeemPoints || parseInt(redeemPoints) <= 0) {
            alert('Masukkan jumlah poin yang valid.');
            return;
        }
        if (parseInt(redeemPoints) > user.points) {
            alert('Poin tidak cukup untuk diredeem.');
            return;
        }

        if (confirm(`Anda yakin ingin menukar ${redeemPoints} poin menjadi saldo?`)) {
            Inertia.post('/poinmu/redeem', { points: parseInt(redeemPoints) }, {
                onSuccess: () => {
                    setRedeemPoints('');
                    alert('Poin berhasil diredeem!');
                },
                onError: (errors) => {
                    alert(errors.error || 'Terjadi kesalahan.');
                }
            });
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded">
            <h1 className="text-xl font-bold mb-4">Dashboard Poinmu</h1>

            <div className="bg-gray-100 p-4 rounded mb-4">
                <p><strong>Nama:</strong> {user.name}</p>
                <p><strong>Poin Saat Ini:</strong> {user.points} Poin</p>
                <p><strong>Saldo:</strong> Rp {user.balance.toLocaleString()}</p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Jumlah Poin yang akan diredeem</label>
                <input
                    type="number"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.value)}
                    className="border p-2 w-full rounded"
                    min="1"
                />
                <button
                    onClick={handleRedeem}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Redeem Poin
                </button>
            </div>

            <h2 className="text-lg font-semibold mb-2">Riwayat Poinmu</h2>
            <div className="bg-gray-50 p-4 rounded">
                {poinmuHistory.length === 0 ? (
                    <p className="text-gray-500">Belum ada riwayat poin.</p>
                ) : (
                    <ul>
                        {poinmuHistory.map((history) => (
                            <li key={history.id} className="mb-2 border-b pb-2">
                                <p><strong>{history.type}</strong> ({history.points > 0 ? '+' : ''}{history.points} Poin)</p>
                                <p className="text-sm text-gray-600">{history.description}</p>
                                <p className="text-xs text-gray-400">{new Date(history.created_at).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
