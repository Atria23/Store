import { Link, Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';

export default function ResetPasswordSuccess() {
    return (
        <>
            <Head title="Email Terverifikasi" />
            <div className="mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[412px] w-full z-10 bg-main">
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <div className="font-utama text-white font-bold text-lg">
                                Reset Password Sukses
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-[51px]">
                    <div className="w-[380px] h-max flex flex-col items-center space-y-4 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-shield-fill-check w-24 h-24 p-1.5 mx-auto fill-current text-green-500" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793z" />
                        </svg>
                        <p className="font-utama text-base font-medium text-gray-500 text-center">
                            Password Sudah Diperbarui
                        </p>
                        <p className="font-utama font-normal text-center text-sm text-gray-600">
                            Kata sandimu berhasil diubah!. Silakan masuk kembali untuk melanjutkan akses ke akunmu.
                        </p>
                    </div>

                    <div className="w-[380px] h-max flex flex-col space-y-2 mb-6">
                        <Link
                            href={route('login')}
                            className="w-full text-center text-white p-2 rounded transition bg-main hover:bg-blue-700"
                        >
                            Kunjungi Halaman Login
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

