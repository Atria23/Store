import { Link, Head, useForm } from '@inertiajs/react';
import React from "react";
import { useEffect, useState } from 'react';

export default function Welcome(props) {
    const { data, setData, post } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const [isGuestLogin, setIsGuestLogin] = useState(false);
    const loginAsGuest = () => {
        setData({
            email: 'guest@muvausa.com',
            password: 'guest',
            remember: false,
        });
        setIsGuestLogin(true);
    };

    // Saat state `data` berubah dan `isGuestLogin` aktif, kirimkan request login
    useEffect(() => {
        if (isGuestLogin && data.email === 'guest@muvausa.com') {
            post(route('login'));
            setIsGuestLogin(false); // Reset flag agar tidak infinite loop
        }
    }, [data, isGuestLogin]);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

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


    console.log("📦 props:", props);
    const { statsData = [] } = props;

    return (
        <>
            <Head title="Welcome" />
            <div className="bg-[#ffffff] flex flex-row justify-center w-full">
                <div className="bg-neutralwhite w-full max-w-[412px] relative">
                    <header className="flex items-center justify-between p-6 bg-neutralsilver">
                        {/* Logo */}
                        <img className="w-16 h-16" alt="Company logo" src="/storage/logo.webp" />

                        {/* Action buttons */}
                        <div className="flex items-center gap-6">
                            <Link
                                href={route('login')}
                                className="px-5 py-[15px] rounded-xl border border-[#2c2c5b] text-[#2c2c5b] font-button text-[12px] font-[800]"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route('register')}
                                className="px-5 py-[15px] rounded-xl bg-[#2c2c5b] text-white font-button text-[12px] font-[800]">
                                Register
                            </Link>
                        </div>
                    </header>

                    {/* Hero Section */}
                    <div className="w-full">
                        <div className="flex flex-col w-full items-start justify-center">
                            <div className="flex flex-col justify-center gap-[50px] px-[30px] py-12 w-full bg-neutralsilver items-center">
                                <div className="flex flex-col items-start gap-5 w-full">
                                    <div className="w-full [font-family:'Lato-SemiBold',Helvetica] text-[#a8d5ba] text-3xl text-center leading-[45px]">
                                        <span className="font-bold text-main text-4xl leading-[24px] block">
                                            Muvausa Store
                                            <br />
                                        </span>
                                        <span className="font-semibold text-[21px] leading-[24px] text-main">
                                            Top up Murah, transaksi mudah
                                        </span>
                                    </div>

                                    <div className="w-full [font-family:'Lato-Regular',Helvetica] font-normal text-[#333333] text-xs text-center leading-[18px]">
                                        Muvausa Store hadir sebagai solusi pembelian pulsa, top-up game, paket data, serta produk digital lainnya yang dilengkapi fitur transaksi otomatis dan program afiliasi.
                                    </div>
                                </div>

                                <Link href={route('login')}>
                                    <button
                                        onClick={loginAsGuest}
                                        className="flex items-center justify-center gap-2.5 px-8 py-4 bg-transparent border-2 border-main text-main font-extrabold text-sm rounded-xl hover:bg-main hover:text-white transition-all duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-person-badge-fill" viewBox="0 0 16 16">
                                            <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm4.5 0a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6m5 2.755C12.146 12.825 10.623 12 8 12s-4.146.826-5 1.755V14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1z" />
                                        </svg>
                                        <span>Login Sebagai Tamu</span>
                                    </button>
                                </Link>



                            </div>

                            <div className="relative w-full h-[323px] overflow-hidden">
                                <div className="relative w-full h-full">
                                    <img
                                        className="absolute w-full h-full top-0 left-0 object-center"
                                        alt="Waste collection image"
                                        src="/storage/banner.png"
                                    />

                                    <div className="absolute w-full h-full bottom-0 left-0">
                                        <div className="relative w-full h-full bg-gradient-to-t from-white to-white/0" />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    <section className="flex flex-col w-full max-w-[412px] items-center gap-5 px-[30px] py-12 relative bg-neutralwhite">
                        <header className="flex flex-col items-start gap-5 relative self-stretch w-full">
                            <div className="flex flex-col items-center gap-12 relative self-stretch w-full">
                                <div className="flex flex-col items-center gap-2.5 relative self-stretch w-full">
                                    <div className="flex flex-col items-start gap-2 relative self-stretch w-full">
                                        <h3 className="text-main w-full text-base text-center font-semibold">KENAPA PILIH MUVAUSA STORE?</h3>
                                        <h2 className="text-gray-900 w-full text-3xl text-center font-semibold">Keuntungan Bergabung</h2>
                                    </div>
                                </div>
                            </div>
                        </header>

                        <div className="flex flex-col items-start gap-5 relative self-stretch w-full">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center gap-5 px-5 py-[35px] relative self-stretch w-full border-2 border-gray-200 shadow-md rounded-xl"
                                >
                                    <div className="relative w-12 h-12 bg-main rounded-full flex items-center justify-center">
                                        {benefit.icon}
                                    </div>
                                    <div className="flex flex-col items-center gap-2 p-0 w-full">
                                        <h4 className="text-gray-900 text-xl text-center font-bold">{benefit.title}</h4>
                                        <p className="text-gray-600 text-sm text-center">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stats Section */}
                    <div className="w-full">
                        <div className="flex flex-col w-full items-center gap-5 px-[30px] py-12 bg-[#F5F7FA]">
                            <div className="flex flex-wrap items-center justify-center gap-[36.31px_36.31px] w-full rounded-[12.1px]">
                                {statsData.map((stat, index) => (
                                    <div key={index} className="w-[147.72px] h-[63px] relative">
                                        <div className="absolute top-0 left-0 right-0 text-center [font-family:'Manrope-ExtraBold',Helvetica] font-extrabold text-main text-[36.3px] leading-[39.3px] whitespace-nowrap">
                                            {stat.value}
                                        </div>

                                        <div className="absolute w-36 top-11 left-0 right-0 [font-family:'Inter-SemiBold',Helvetica] font-semibold text-[#6d6d6d] text-xs text-center leading-[18.2px]">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col w-full items-center gap-5 px-[30px] py-12 bg-neutralwhite">
                            <div className="w-full [font-family:'Inter-SemiBold',Helvetica] font-semibold text-neutralblack text-xl text-center leading-[25.4px]">
                                Mau hemat sebagai buyer, untung sebagai seller, atau dapat passive income sebagai afiliator?
                            </div>

                            <Link
                                href={route('register')}
                                className="w-[168px] px-7 py-2.5 bg-main rounded-xl text-center font-semibold text-white text-xs">
                                Gabung Sekarang
                            </Link>

                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="flex flex-col w-full items-center justify-center gap-5 px-[30px] py-12 bg-[#2C2D5B]">
                        <div className="flex flex-col w-[314px] items-center justify-center gap-6">
                            <img
                                className="w-[123px] h-auto object-contain"
                                alt="Pusaka Logo"
                                src="/storage/logoTulisanWhite_no_bg.png"
                            />

                            <div className="w-[314px] [font-family:'Inter-Regular',Helvetica] font-normal text-white text-lg text-center leading-[34px]">
                                Jadikan setiap transaksi lebih praktis dan menguntungkan.
                            </div>
                        </div>

                        <div className="border-t-2 border-white/40">
                            <span className="invisible">aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</span>
                        </div>

                        <div className="flex flex-col items-center justify-center gap-6 w-full">
                            <div className="w-full [font-family:'Inter-Regular',Helvetica] font-normal text-white text-lg text-center leading-[34px]">
                                Copyright © 2025 Muvausa Store. All rights reserved.
                            </div>

                            <div className="flex items-center gap-[30px]">
                                <a href="wa.me/6288227397243">
                                    <div className="flex w-[39.73px] h-[39.73px] items-center justify-center bg-white rounded-full overflow-hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-whatsapp" viewBox="0 0 16 16">
                                            <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                                        </svg>
                                    </div>
                                </a>

                                <a href="https://www.instagram.com/muvausastore/">
                                    <div className="flex w-[39.73px] h-[39.73px] items-center justify-center bg-white rounded-full overflow-hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                                            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                                        </svg>
                                    </div>
                                </a>

                                <a href="https://x.com/muvausastore">
                                    <div className="flex w-[39.73px] h-[39.73px] items-center justify-center bg-white rounded-full overflow-hidden">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
                                            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
                                        </svg>
                                    </div>
                                </a>
                            </div>

                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}
