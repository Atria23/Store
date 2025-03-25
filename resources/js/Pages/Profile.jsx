import React, { useState } from "react";
import Footer from "../Components/Footer";
import { Head, useForm } from '@inertiajs/react';


function Profile({ user }) {
    const { post } = useForm();

    const [showBalance, setShowBalance] = useState(false);
    const [imagePreview, setImagePreview] = useState(
        user?.avatar ? `${user.avatar}` : "/storage/logo.webp"
    );

    const handleLogout = () => {
        post("/logout");
    };

    const toggleBalanceVisibility = () => {
        setShowBalance(!showBalance);
    };

    return (
        <>
            <Head title="Profile" />
            <div className="relative min-h-screen">
                <div className="pb-24">
                    <section className="bg-[#0055bb]">
                        <div className="text-white flex justify-between items-center px-6 py-8 md:pb-32 pb-20">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={imagePreview}
                                    alt="Logo Muvausa Store"
                                    className="md:w-20 md:h-20 w-12 h-12 p-1.5 border-2 border-white rounded-full shadow-lg bg-white"
                                    onError={(e) => (e.target.src = "/storage/logo.webp")}
                                />
                                <div className="flex flex-col">
                                    <p className="md:text-3xl text-sm font-bold truncate max-w-[200px] md:max-w-[500px]">{user.name}</p>
                                    <p className="md:text-3xl text-sm font-bold truncate max-w-[200px] md:max-w-[500px]">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center text-right">
                                <p>
                                    <span className="bg-blue-100 text-blue-800 md:text-xl text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                        {user.transactions} trx
                                    </span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 md:-mt-20 -mt-16">
                        {/* Card Saldo dan Poin */}
                        <div className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto mt-4 flex justify-between items-center hover:shadow-2xl hover:bg-blue-50 transition-all duration-300">
                            {/* Balance Section */}
                            <div className="flex items-center justify-start flex-1">
                                <div className="flex items-center space-x-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#0055bb]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-700 font-semibold text-sm md:text-base lg:text-lg">
                                            Rp{user.balance.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">Balance</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="h-12 border-l-2 border-gray-300 mx-6"></div>

                            {/* Points Section */}
                            <div className="flex items-center justify-start flex-1">
                                <div className="flex items-center space-x-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#0055bb]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-700 font-semibold text-sm md:text-base lg:text-lg">
                                            {user.points.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">Points</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 2 Full Width Menu Cards */}
                        <div className="grid grid-cols-2 gap-6 md:my-6 my-3 sm:grid-cols-2 max-w-6xl mx-auto">
                            {/* Menu 1: Deposit */}
                            <a href="/deposit/create" className="flex items-center bg-white text-gray-900 p-8 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition duration-300">
                                <div className="flex items-center w-full justify-between">
                                    <div className="flex items-center">
                                        <svg className="w-6 sm:w-10 text-[#0055bb] mr-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm md:text-base font-bold text-[#0055bb]">Deposit</p>
                                    </div>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>

                            {/* Menu 2: Riwayat Transaksi */}
                            <a href="/history" className="flex items-center bg-white text-gray-900 p-8 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition duration-300">
                                <div className="flex items-center w-full justify-between">
                                    <div className="flex items-center">
                                        <svg className="w-6 sm:w-10 text-[#0055bb] mr-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm md:text-base font-bold text-[#0055bb]">Transaksi</p>
                                    </div>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>
                        </div>
                    </section>

                    <section className="px-6">
                        <div className="max-w-6xl mx-auto">
                            <p className="text-gray-700 font-semibold text-lg opacity-80">Menu Akun</p>
                            <a href="/account">
                                <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                    <p className="text-gray-900 font-medium">Pengaturan Akun</p>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>
                            <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                <p className="text-gray-900 font-medium">Option 2</p>
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                <p className="text-gray-900 font-medium">Option 3</p>
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                <p className="text-gray-900 font-medium">Option 4</p>
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <button onClick={handleLogout}>
                                <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                    <p className="text-gray-900 font-medium">Logout</p>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </button>

                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Profile;
