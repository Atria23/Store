import { Link, Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function VerifyEmail({ status, isVerified }) {
    const { post, processing } = useForm({});
    const [cooldown, setCooldown] = useState(0);

    const submit = (e) => {
        e.preventDefault();
        if (cooldown > 0) return;

        post(route('verification.send'), {
            onSuccess: () => {
                setCooldown(60); // mulai countdown 60 detik
            }
        });
    };

    // countdown efek
    useEffect(() => {
        if (cooldown === 0) return;
        const interval = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [cooldown]);

    if (isVerified) {
        return (
            <>
                <Head title="Email Terverifikasi" />
                <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
                    <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">

                        <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                            <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                                <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                                    <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                        </svg>
                                    </button>
                                    <div className="font-utama text-white font-bold text-lg">
                                        Verifikasi Email
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit}>
                            <div className="flex flex-col items-center justify-center pt-[51px]">
                                <div className="w-full h-max flex flex-col items-center space-y-4 mb-6">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 16 16"
                                        className="w-24 h-24 p-1.5 mx-auto fill-current text-[#0055bb]"
                                    >
                                        <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z" />
                                        <path
                                            d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"
                                            className="text-green-600 fill-current"
                                        />
                                    </svg>
                                    <p className="font-utama text-base font-medium text-gray-600 text-center">
                                        Emailmu Sudah Terverifikasi
                                    </p>

                                    <p className="font-utama font-normal text-center text-sm text-gray-600">
                                        Terima kasih telah memverifikasi emailmu!. Silahkan menikmati semua layanan kami.

                                    </p>
                                </div>

                                <div className="w-full h-max flex flex-col space-y-2 mb-6">

                                    <Link
                                        href={route('user.dashboard')}
                                        className="w-full text-center text-white p-2 rounded transition bg-main hover:bg-blue-700"
                                    >
                                        Kunjungi Dashboard
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </>
        );
    }

    return (
        <>
            <Head title="Verifikasi Email" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
                <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">

                    <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                        <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                            <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                                <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                    </svg>
                                </button>
                                <div className="font-utama text-white font-bold text-lg">
                                    Verifikasi Email
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit}>
                        <div className="flex flex-col items-center justify-center pt-[51px]">
                            <div className="w-full h-max flex flex-col items-center space-y-4 mb-6">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    className="w-24 h-24 p-1.5 mx-auto fill-current text-[#0055bb]"
                                >
                                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.026A2 2 0 0 0 2 14h6.256A4.5 4.5 0 0 1 8 12.5a4.49 4.49 0 0 1 1.606-3.446l-.367-.225L8 9.586zM16 4.697v4.974A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-1.965.45l-.338-.207z" />
                                    <path
                                        d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686"
                                        className="text-green-600 fill-current"
                                    />
                                </svg>
                                <p className="font-utama text-base font-medium text-gray-600 text-center">
                                    Link verifikasinya udah dikirim ke emailmu
                                </p>

                                <p className="font-utama font-normal text-center text-sm text-gray-600">
                                    {cooldown > 0 ? (
                                        <>
                                            Tunggu{' '}
                                            <span className="text-blue-500 font-semibold">{cooldown}</span>{' '}
                                            detik untuk mengirim ulang
                                        </>
                                    ) : (
                                        <>
                                            Belum dapet email?{' '}
                                            <button
                                                onClick={submit}
                                                type="button"
                                                disabled={processing}
                                                className="text-blue-500 font-semibold hover:underline"
                                            >
                                                Kirim ulang
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>

                            <div className="w-full h-max flex flex-col space-y-2 mb-6">
                                <Link
                                    href={route('user.dashboard')}
                                    className="w-full text-center text-white p-2 rounded transition bg-main hover:bg-blue-600"
                                >
                                    Verifikasi Nanti
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
