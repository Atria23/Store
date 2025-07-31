import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Head, usePage, Link } from '@inertiajs/react';

export default function PoinmuDashboard() {
    const { user, poinmuHistory, redeemAccounts } = usePage().props;
    const [redeemPoints, setRedeemPoints] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [redeemMethod, setRedeemMethod] = useState('dompetmu');
    const [destination, setDestination] = useState('');
    const [accountName, setAccountName] = useState('');

    useEffect(() => {
        if (redeemMethod !== 'dompetmu') {
            const previous = redeemAccounts[redeemMethod];
            if (previous) {
                setDestination(previous.destination || '');
                setAccountName(previous.account_name || '');
            } else {
                setDestination('');
                setAccountName('');
            }
        } else {
            setDestination('');
            setAccountName('');
        }
    }, [redeemMethod]);

    const redeemOptions = [
        { value: 'dompetmu', label: 'Dompetmu (Saldo)', icon: '/storage/redeem_account/dompetmu.png' },
        { value: 'bri', label: 'BRI', icon: '/storage/redeem_account/bri.png' },
        { value: 'seabank', label: 'SeaBank', icon: '/storage/redeem_account/seabank.png' },
        { value: 'shopeepay', label: 'ShopeePay', icon: '/storage/redeem_account/shopeepay.png' },
        { value: 'dana', label: 'DANA', icon: '/storage/redeem_account/dana.png' },
    ];


    const handleRedeem = () => {
        const numericPoints = parseInt(redeemPoints.replace(/\./g, '')) || 0;

        if (numericPoints <= 0) {
            alert('Masukkan jumlah poin yang valid.');
            return;
        }

        if (numericPoints > user.points) {
            alert('Poin tidak cukup untuk diredeem.');
            return;
        }

        if (['bri', 'seabank'].includes(redeemMethod) && numericPoints < 10000) {
            alert('Minimal redeem ke BRI atau SeaBank adalah 10.000 poin.');
            return;
        }

        if (redeemMethod !== 'dompetmu' && (!destination || !accountName)) {
            alert('Harap isi nomor tujuan dan nama pemilik akun.');
            return;
        }

        setShowConfirm(true);
    };


    const confirmRedeem = () => {
        const points = parseInt(redeemPoints.replace(/\./g, '')) || 0;
        Inertia.post('/poinmu/redeem', {
            points,
            redeem_method: redeemMethod,
            destination: redeemMethod === 'dompetmu' ? null : destination,
            account_name: redeemMethod === 'dompetmu' ? null : accountName,
        }, {
            onSuccess: () => {
                setRedeemPoints('');
                setDestination('');
                setAccountName('');
                setRedeemMethod('dompetmu');
                setShowConfirm(false);
            },
            onError: (errors) => {
                alert(errors.error || 'Terjadi kesalahan.');
            }
        });
    };


    return (
        <>
            <Head title="Dashboard PoinMu" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-white">
                {/* Header */}
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
                    <section className="w-full px-4 pt-6">
                        <div className="w-full bg-white rounded-xl shadow-md p-6 space-y-6">

                            {/* Bagian PoinMu */}
                            <div className="flex flex-col items-center">
                                <p className="font-utama text-lg font-semibold text-gray-700">PoinMu Saat Ini</p>
                                <p className="font-utama text-5xl font-bold text-main">
                                    {user.points.toLocaleString('id-ID')}
                                </p>
                                <span className="mt-2 px-2 py-1 text-xs bg-main/10 text-main rounded-full">
                                    1 PoinMu = Rp1
                                </span>
                            </div>

                            {/* Form Redeem */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Jumlah Poin yang akan diredeem</label>
                                    <input
                                        type="text"
                                        value={redeemPoints}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/[^\d]/g, '');
                                            const formatted = parseInt(raw || '0', 10).toLocaleString('id-ID');
                                            setRedeemPoints(formatted);
                                        }}
                                        className="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full text-sm bg-neutral-100"
                                        placeholder="Contoh: 10.000"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Metode Redeem</label>

                                    <div className="flex items-center border border-gray-300 rounded bg-neutral-100 px-3 py-2 text-sm w-full">
                                        {/* Ikon metode terpilih */}
                                        <img
                                            src={`/storage/redeem_account/${redeemMethod}.png`}
                                            alt={redeemMethod}
                                            className="w-8 h-8 mr-2 object-contain"
                                        />

                                        {/* Select */}
                                        <select
                                            value={redeemMethod}
                                            onChange={(e) => setRedeemMethod(e.target.value)}
                                            className="bg-transparent focus:outline-none border-none w-full text-sm"
                                        >
                                            <option value="dompetmu">DompetMu (Saldo)</option>
                                            <option value="bri">BRI</option>
                                            <option value="seabank">SeaBank</option>
                                            <option value="shopeepay">ShopeePay</option>
                                            <option value="dana">DANA</option>
                                        </select>
                                    </div>
                                </div>


                                {redeemMethod !== 'dompetmu' && (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nomor Tujuan</label>
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={(e) => setDestination(e.target.value)}
                                                className="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full text-sm bg-neutral-100"
                                                placeholder="Nomor rekening / e-wallet"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Nama Pemilik Akun</label>
                                            <input
                                                type="text"
                                                value={accountName}
                                                onChange={(e) => setAccountName(e.target.value)}
                                                className="mt-1 border border-gray-300 rounded-md px-3 py-2 w-full text-sm bg-neutral-100"
                                                placeholder="Contoh: Budi Santoso"
                                            />
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={handleRedeem}
                                    className="w-full bg-main hover:bg-main/90 text-white px-4 py-2 rounded-md font-semibold text-sm transition"
                                >
                                    Redeem Poin
                                </button>
                            </div>
                        </div>
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
                            poinmuHistory.slice(0, 8).map((history) => {
                                const getRedeemIconKeyFromDescription = (description) => {
                                    const match = history.description?.match(/ke\s+([\w]+)/i);
                                    return match ? match[1].toLowerCase() : 'default';
                                };
                                const iconKey = getRedeemIconKeyFromDescription(history.description);
                                const [isImageError, setIsImageError] = useState(false);

                                return (
                                    <Link key={history.id} href={`/poinmu-history/${history.id}`}>
                                        <div className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 cursor-pointer w-full gap-2">
                                            {/* Kiri: Logo dan Informasi Produk */}
                                            <div className="flex items-center gap-2 w-full">
                                                {/* Logo Produk dari storage/redeem_account */}
                                                <div className="w-14 h-14 p-2 bg-white shadow hidden min-[350px]:flex items-center justify-center rounded-xl">
                                                    {!isImageError ? (
                                                        <img
                                                            src={`/storage/redeem_account/${iconKey}.png`}
                                                            alt={iconKey}
                                                            className="w-full h-full object-contain"
                                                            onError={() => setIsImageError(true)}
                                                        />
                                                    ) : (
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="currentColor"
                                                            className="w-full h-full text-main"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                            <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                                        </svg>
                                                    )}
                                                </div>

                                                {/* Informasi Produk */}
                                                <div className="flex flex-col items-start w-max space-y-[2px]">
                                                    <p className="font-utama font-semibold text-sm truncate w-full max-w-[150px] [@media(max-width:315px)]:max-w-[250px]">
                                                        {history.type.charAt(0).toUpperCase() + history.type.slice(1)}
                                                    </p>
                                                    <span
                                                        className={`
    px-2 rounded-full text-xs font-normal w-fit
    ${history.status === 'pending'
                                                                ? 'border border-yellow-600 bg-yellow-100 text-yellow-600'
                                                                : history.status === 'sukses'
                                                                    ? 'border border-green-600 bg-green-100 text-green-600'
                                                                    : 'border border-red-600 bg-red-100 text-red-600'}
  `}
                                                    >
                                                        {(history.status ?? '-').charAt(0).toUpperCase() + (history.status ?? '-').slice(1)}
                                                    </span>

                                                    <p className="w-full font-utama text-sm text-gray-500">
                                                        {new Date(history.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: false,
                                                            timeZone: 'Asia/Jakarta',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Kanan: Status */}
                                            <p
                                                className={`hidden min-[350px]:flex w-[150px] items-center justify-center py-2 text-xs rounded-3xl border 
                ${history.points < 0
                                                        ? 'border-red-600 bg-red-100 text-red-600'
                                                        : 'border-green-600 bg-green-100 text-green-600'
                                                    }`}
                                                title={`${history.points > 0 ? '+' : ''}${history.points.toLocaleString('id-ID')} PoinMu`}
                                            >
                                                {history.points > 0 ? '+' : ''}
                                                {
                                                    history.points.toLocaleString('id-ID').length > 10
                                                        ? `${history.points.toLocaleString('id-ID').slice(0, 5)}...`
                                                        : history.points.toLocaleString('id-ID')
                                                }
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[100px]">
                                <p className="text-gray-500 px-4 text-center">Belum ada riwayat PoinMu.</p>
                            </div>
                        )}
                    </section>


                    {/* Modal Konfirmasi */}
                    {showConfirm && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-xl w-[90%] max-w-[400px] text-center space-y-4">
                                <h2 className="text-lg font-bold text-main">Konfirmasi Redeem</h2>
                                <p>Anda yakin ingin menukar <span className="font-bold">{redeemPoints}</span> poin menjadi saldo?</p>
                                <div className="flex gap-4 justify-center mt-4">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="px-4 py-2 bg-gray-300 rounded font-semibold text-sm"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={confirmRedeem}
                                        className="px-4 py-2 bg-main text-white rounded font-semibold text-sm"
                                    >
                                        Ya, Tukar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}
