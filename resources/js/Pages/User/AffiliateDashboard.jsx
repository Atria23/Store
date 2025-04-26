import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";

const AffiliateDashboard = ({ affiliator, referrals, affiliateHistory, avatar }) => {
    // const [imagePreview, setImagePreview] = useState(
    //     user?.avatar ? `${user.avatar}` : "/storage/logo.webp"
    // );

    const [imagePreview, setImagePreview] = useState(
        affiliator?.avatar ?? "/storage/logo.webp"
    );

    return (
        <>

            <Head title="Dashboard Affiliator" />
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
                            Dashboard Affiliator
                        </div>
                    </div>
                </header>

                {/* Spacer header */}
                <div className="h-11" />

                {/* Form Section */}
                <main className="w-full flex flex-col space-y-6 items-center justify-center p-4">
                    <section className="w-full flex flex-row space-x-4 items-center justify-start">
                        <img
                            src={imagePreview}
                            alt="Logo Muvausa Store"
                            className="md:w-20 md:h-20 w-12 h-12 p-1.5 border-2 border-white rounded-full shadow-lg bg-white"
                            onError={(e) => (e.target.src = "/storage/logo.webp")}
                        />
                        <div className="w-full flex flex-col space-y-1">
                            <h2 className="text-xl font-semibold">{affiliator.referral_code}</h2>

                            <Link href="/affiliator">
                                <div className="w-full flex flex-row space-x-1 justify-start items-center text-main">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 16 16"
                                        className="w-4 h-4"
                                    >
                                        <path d="M12.146.854a.5.5 0 0 1 .708 0l2.292 2.292a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-4 1.5a.5.5 0 0 1-.65-.65l1.5-4a.5.5 0 0 1 .11-.168l10-10zM11.207 3L13 4.793 14.293 3.5 12.5 1.707 11.207 3zM12 5.207 10.793 4 3 11.793V13h1.207L12 5.207z" />
                                    </svg>
                                    <span className="text-md font-medium">Ubah Data Affiliator</span>
                                </div>
                            </Link>


                        </div>
                    </section>

                    <section className="w-full flex justify-center items-center p-4 bg-white shadow-md rounded-xl">
                        <div className="flex flex-col justify-center items-center">
                            <p className="font-utama font-semibold text-2xl">Total Perolehan Komisi</p>
                            <p className="font-utama font-semibold text-4xl text-main">{Number(affiliator.total_commission).toLocaleString("id-ID")} <span className="text-2xl">PoinMu</span></p>
                        </div>
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
                                            <div className="w-14 p-3 bg-white shadow hidden min-[406px]:flex items-center justify-center rounded-xl">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-full h-full text-main" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                                                </svg>
                                            </div>

                                            {/* Informasi Produk */}
                                            <div className="flex flex-col items-start w-max space-y-[2px]">
                                                <p className="font-utama font-semibold text-sm truncate w-full max-w-[200px] [@media(max-width:315px)]:max-w-[250px]">
                                                    {history.affiliate_product.product_name}
                                                </p>
                                                <p className="w-full font-utama text-sm">
                                                    Komisi: {history.status === "Gagal" ? "0" : Number(history.commission).toLocaleString("id-ID")} PoinMu
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
                                                className={`px-2 py-[2px] text-xs rounded-3xl 
                                                ${history.status === 'Sukses' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                            >
                                                {history.status}
                                            </p>

                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 px-4">Belum ada riwayat komisi.</p>
                        )}

                    </section>

                </main>
            </div>
        </>
    );
};

export default AffiliateDashboard;
