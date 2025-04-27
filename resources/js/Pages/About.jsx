import { Link, Head } from '@inertiajs/react';
import React from 'react';

export default function About() {

    const benefits = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                    <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z" />
                </svg>
            ),
            title: "Transaksi Otomatis",
            description: "Tersedia fitur validasi pembayaran dan pengiriman pesanan secara otomatis.",
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z" />
                </svg>
            ),
            title: "Pembayaran Beragam",
            description: "Menyediakan pembayaran via QRIS, BRI, Dana, Shopeepay, Ovo, dan Gopay.",
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                </svg>
            ),
            title: "Program Afiliasi",
            description: "Dapatkan komisi untuk setiap transaksi sukses dari user yang kamu undang.",
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                </svg>
            ),
            title: "Layanan 24/7",
            description: "Siap melayani transaksimu setiap hari selama 24 jam.",
        },
    ];

    return (
        <>
            <Head title="Tentang Muvausa Store" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
                <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">

                    {/* Header Fixed */}
                    <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                        <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                            <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                                <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                    </svg>
                                </button>
                                <div className="font-utama text-white font-bold text-lg">
                                    Tentang Muvausa Store
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="w-full">
                        <div className="flex flex-col w-full items-start justify-center">
                            <div className="flex flex-col justify-center gap-[50px] px-[30px] py-12 w-full bg-neutralsilver items-center">
                                <div className="flex flex-col items-start gap-5 w-full max-w-[100%]">

                                    {/* Ikon Muvausa */}
                                    <div className="w-full flex justify-center">
                                        <img
                                            src="/storage/logo_no_bg.png" // Ganti src sesuai logo kamu
                                            alt="Logo Muvausa"
                                            className="w-[80px] h-[80px] object-contain"
                                        />
                                    </div>

                                    <div className="w-full font-semibold text-[#a8d5ba] text-3xl text-center leading-[45px]">
                                        <span className="font-bold text-main text-4xl leading-[24px] block">
                                            Muvausa Store
                                        </span>
                                        <span className="font-semibold text-[21px] leading-[24px] text-main block mt-1">
                                            Top up Murah, transaksi mudah
                                        </span>
                                    </div>

                                    <div className="w-full text-[#333333] text-sm text-center leading-snug">
                                        Muvausa Store hadir sebagai solusi pembelian pulsa, top-up game, paket data, serta produk digital lainnya
                                        yang dilengkapi fitur transaksi otomatis dan program afiliasi.
                                    </div>
                                </div>
                            </div>

                            {/* Banner */}
                            <div className="relative w-full h-[323px] overflow-hidden">
                                <div className="relative w-full h-full">
                                    <img
                                        className="absolute w-full h-full top-0 left-0 object-cover"
                                        alt="banner welcome"
                                        src="/storage/banner.png"
                                    />
                                    <div className="absolute w-full h-full bottom-0 left-0">
                                        <div className="relative w-full h-full bg-gradient-to-t from-white to-white/0" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Benefit Section */}
                    <section className="flex flex-col w-full max-w-[500px] items-center gap-5 px-[30px] py-12 relative bg-neutralwhite">
                        <header className="flex flex-col items-start gap-5 w-full">
                            <div className="flex flex-col items-center gap-12 w-full">
                                <div className="flex flex-col items-start gap-2 w-full">
                                    <h3 className="text-main w-full text-base text-center font-semibold">
                                        KENAPA PILIH MUVAUSA STORE?
                                    </h3>
                                    <h2 className="text-gray-900 w-full text-3xl text-center font-semibold">
                                        Keuntungan Bergabung
                                    </h2>
                                </div>
                            </div>
                        </header>

                        <div className="flex flex-col items-start gap-5 w-full">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center gap-5 px-5 py-[35px] w-full border-2 border-gray-200 shadow-md rounded-xl"
                                >
                                    <div className="w-12 h-12 bg-main rounded-full flex items-center justify-center">
                                        {benefit.icon}
                                    </div>
                                    <div className="flex flex-col items-center gap-2 w-full">
                                        <h4 className="text-gray-900 text-xl text-center font-bold">
                                            {benefit.title}
                                        </h4>
                                        <p className="text-gray-600 text-sm text-center leading-snug">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}
