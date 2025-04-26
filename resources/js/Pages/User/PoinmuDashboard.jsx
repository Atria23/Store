import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Head, usePage, Link } from '@inertiajs/react';

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
        <>
            <Head title="Dashboard PoinMu" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-white">
                {/* Header tetap */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="w-full flex items-center px-4 py-2 space-x-4">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="text-white font-bold text-lg font-utama">
                            Dashboard PoinMu
                        </div>
                    </div>
                </header>

                {/* Spacer header */}
                <div className="h-11" />

                {/* Main Content */}
                <main className="w-full flex flex-col items-center justify-center">
                    {/* Informasi Pengguna */}

                    <section className="w-full flex flex-col justify-center items-center space-y-4 px-8 pt-8">
                        <div className="w-full flex justify-center items-center">
                            <div className="flex flex-col justify-center items-center">
                                <p className="font-utama font-semibold text-4xl text-main">PoinMu</p>
                                <p className="font-utama font-bold text-5xl text-main">{user.points.toLocaleString('id-ID')}</p>
                            </div>
                        </div>

                        <div className="p-4 w-full flex justify-center items-center rounded-xl border-[3px] border-main">
                            <div className="flex flex-col justify-center items-center">
                                <p className="font-utama font-semibold text-4xl text-main">1 PoinMu = Rp1</p>
                            </div>
                        </div>
                    </section>

                    {/* Redeem Poin */}
                    <section className="w-full bg-white px-8 p-4 rounded-xl shadow-xl space-y-3">
                        <label className="w-full flex text-center text-md font-medium">Jumlah Poin yang akan diredeem</label>
                        <input
                            type="text"
                            value={redeemPoints}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, '');
                                const formatted = parseInt(raw || '0', 10).toLocaleString('id-ID');
                                setRedeemPoints(formatted);
                            }}
                            className="border border-gray-300 rounded px-3 py-2 w-full text-sm bg-neutral-100"
                            placeholder="Contoh: 1.000"
                        />

                        <button
                            onClick={handleRedeem}
                            className="w-full bg-main text-white px-4 py-2 rounded font-semibold text-sm"
                        >
                            Redeem Poin
                        </button>
                    </section>

                    {/* Riwayat Poin */}
                    <section className="w-full p-2 py-4">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl font-semibold">Riwayat PoinMu</h2>
                            <Link
                                href={route('poinmu.history')}
                                className="text-sm text-main font-bold hover:underline"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        {poinmuHistory.length > 0 ? (
                            poinmuHistory.slice(0, 8).map((history) => (

                                <Link
                                    key={history.id}
                                    href={`/poinmu-history/${history.id}`}>

                                    <div
                                        className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 cursor-pointer w-full gap-2"
                                    >
                                        {/* Kiri: Logo dan Informasi Produk */}
                                        <div className="flex items-center gap-2 w-full">
                                            {/* Logo Produk */}
                                            <div className="w-14 p-3 bg-white shadow hidden min-[406px]:flex items-center justify-center rounded-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-full h-full text-main" viewBox="0 0 16 16">
                                                    <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                                </svg>
                                            </div>

                                            {/* Informasi Produk */}
                                            <div className="flex flex-col items-start w-max space-y-[2px]">
                                                <p className="font-utama font-semibold text-sm truncate w-full max-w-[200px] [@media(max-width:315px)]:max-w-[250px]">
                                                    {history.type}
                                                </p>
                                                {/* <p className="w-full font-utama text-sm w-max-200">Deskripsi: {history.description}</p> */}
                                                <p className="w-full max-w-[200px] truncate font-utama text-sm">
                                                    Deskripsi: {history.description}
                                                </p>

                                                <p className="w-full font-utama text-sm text-gray-500">
                                                    {new Date(history.created_at).toLocaleDateString("id-ID", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                        timeZone: "Asia/Jakarta",
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Kanan: Status */}
                                        <p
                                            className={`hidden min-[350px]:flex w-[150px] items-center justify-center py-2 text-xs rounded-3xl border 
                                            ${history.points < 0 ? 'border-red-600 bg-red-100 text-red-600' : 'border-green-600 bg-green-100 text-green-600'}`}
                                            title={`${history.points > 0 ? '+' : ''}${history.points.toLocaleString('id-ID')} PoinMu`}
                                        >
                                            {history.points > 0 ? '+' : ''}
                                            {
                                                history.points.toLocaleString('id-ID').length > 10
                                                    ? `${history.points.toLocaleString('id-ID').slice(0, 5)}...`
                                                    : history.points.toLocaleString('id-ID')
                                            }
                                            {
                                                history.points.toLocaleString('id-ID').replace(/\D/g, '').length <= 3 && ' PoinMu'
                                            }
                                        </p>

                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 px-4">Belum ada riwayat PoinMu.</p>
                        )}
                    </section>

                </main>
            </div>
        </>
    );
}
