import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";

const AffiliateDashboard = ({ affiliator, referrals, affiliateHistory, avatar }) => {

    const [imagePreview, setImagePreview] = useState(
        affiliator?.avatar ?? "/storage/logo.webp"
    );

    return (
        <>
            <Head title="Dashboard Afiliator" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-white">

                {/* Header dengan tombol kembali */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="w-full h-max flex flex-row items-center px-4 py-2 space-x-4">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Dashboard Afiliator
                        </div>
                    </div>
                </header>

                {/* Spacer header */}
                <div className="h-11" />

                {/* Form Section */}
                <main className="w-full flex flex-col space-y-6 items-center justify-center p-4">
                    <div className="w-full flex flex-col items-center space-y-6">

                        {/* SECTION: Profile, Centered */}
                        <section className="w-full flex justify-center">
                            <div className="w-full max-w-md flex flex-col items-center space-y-3">
                                <img
                                    src={imagePreview}
                                    alt="Logo Muvausa Store"
                                    className="w-24 h-24 aspect-square object-cover p-1.5 border-2 border-white rounded-full shadow-lg bg-white"
                                    onError={(e) => (e.target.src = "/storage/logo.webp")}
                                />
                                <h2 className="text-xl font-semibold text-center">{affiliator.referral_code || '-'}</h2>

                                <Link href={route('affiliator.index')}>
                                    <div className="flex flex-row space-x-1 items-center text-main hover:underline">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            viewBox="0 0 16 16"
                                            className="w-4 h-4"
                                        >
                                            <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l10-10zM11.207 3L13 4.793 14.293 3.5 12.5 1.707 11.207 3zM12 5.207 10.793 4 3 11.793V13h1.207L12 5.207z" />
                                        </svg>
                                        <span className="text-md font-medium">Ubah Data Afiliator</span>
                                    </div>
                                </Link>
                            </div>
                        </section>


                        {/* SECTION: Button Salin + Teman Diajak */}
                        <section className="w-full max-w-xl flex flex-row gap-4 justify-center">
                            {/* Button: Salin Link */}
                            <button
                                onClick={() => {
                                    if (!affiliator.referral_code) return;
                                    const link = `${window.location.origin}/register?ref=${affiliator.referral_code}`;
                                    navigator.clipboard.writeText(link);
                                    alert("Link referral berhasil disalin!");
                                }}
                                disabled={!affiliator.referral_code}
                                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg shadow transition
                                                ${!affiliator.referral_code
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-main text-white hover:opacity-90 active:scale-95'}
                                            `}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z" />
                                </svg>
                                <span className="font-semibold text-sm">
                                    {affiliator.referral_code ? 'Salin Link Afiliasi' : 'Lengkapi Data'}
                                </span>
                            </button>

                            {/* Button: Teman Diajak */}
                            <a
                                href={route('affiliate.friends')}
                                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg shadow transition bg-main text-white hover:opacity-90 active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                                    <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                                </svg>
                                <span className="font-semibold text-sm">
                                    Teman Diajak
                                </span>
                            </a>
                        </section>

                    </div>

                    <section className="w-full flex flex-col justify-center items-center p-4 bg-white shadow-md rounded-xl">
                        <div className="mb-2 flex flex-col text-center justify-center items-center">
                            <p className="font-utama font-semibold text-2xl">Total Perolehan Komisi</p>
                            <p className="font-utama font-semibold text-4xl text-main">{Number(affiliator.total_commission).toLocaleString("id-ID")} <span className="text-2xl">PoinMu</span></p>

                        </div>
                        <a
                            href={route('poinmu.dashboard')}
                            className="w-full flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg shadow transition bg-main text-white hover:opacity-90 active:scale-95"
                        >
                            <p className="font-utama text-lg font-medium text-left flex items-center justify-center text-white">Tukar PoinMu</p>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 16 16" strokeWidth="1">
                                <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                            </svg>
                        </a>
                    </section>

                    <section className="w-full mb-4 bg-white">
                        <div className="flex items-center justify-between px-4">
                            <h2 className="text-xl font-semibold">Riwayat Affiliasi</h2>
                            <Link
                                href="/affiliate-history"
                                className="text-sm text-main font-bold hover:underline"
                            >
                                Lihat Semua
                            </Link>
                        </div>
                        {affiliateHistory.length > 0 ? (
                            affiliateHistory.slice(0, 8).map((history) => (

                                <Link
                                    key={history.id}
                                    href={`/affiliate-history/${history.id}`}>

                                    <div
                                        className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 cursor-pointer w-full gap-2"
                                    >
                                        {/* Kiri: Logo dan Informasi Produk */}
                                        <div className="flex items-center gap-2 w-full">
                                            {/* Logo Produk */}
                                            <div className="w-14 p-3 bg-white shadow hidden min-[350px]:flex items-center justify-center rounded-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-full h-full text-main" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                                                </svg>
                                            </div>

                                            {/* Informasi Produk */}
                                            <div className="flex flex-col items-start w-max space-y-[2px]">
                                                <p className="font-utama font-semibold text-sm truncate w-full max-w-[150px] [@media(max-width:315px)]:max-w-[250px]">
                                                    {history.affiliate_product.product_name}
                                                </p>
                                                <p className="w-full font-utama text-sm">
                                                    {history.status === "Gagal" ? "0" : Number(history.commission).toLocaleString("id-ID")} PoinMu
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
                                        <div className="hidden w-max-full min-[315px]:flex flex-col items-end justify-end space-y-1">
                                            <p
                                                className={`px-2 py-[2px] text-xs rounded-3xl ${history.status === 'Sukses'
                                                    ? 'bg-green-100 text-green-600'
                                                    : history.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-600'
                                                        : 'bg-red-100 text-red-600'
                                                    }`}
                                            >
                                                {history.status}
                                            </p>


                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="flex justify-center items-center h-full mt-6">
                                <p className="text-gray-500">Riwayat afiliasi tidak ditemukan.</p>
                            </div>
                        )}
                    </section>

                </main>
            </div>
        </>
    );
};

export default AffiliateDashboard;
