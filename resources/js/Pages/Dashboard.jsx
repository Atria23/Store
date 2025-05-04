import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';

export default function Dashboard({ title, menus, deposit_balance }) {
    const [showBalance, setShowBalance] = useState(false);
    const toggleBalanceVisibility = () => setShowBalance(!showBalance);

    return (
        <>
            <Head title={title} />
            <div className="max-w-[500px] mx-auto min-h-screen bg-white">
                {/* Header */}
                <div className="fixed top-0 z-10 w-full max-w-[500px] bg-main text-white px-4 py-3">
                    <div className="flex items-center justify-between">
                        {deposit_balance !== null && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="font-bold text-base">
                                    {showBalance
                                        ? `Rp ${Number(deposit_balance).toLocaleString('id-ID')}`
                                        : '••••••••'}
                                </span>
                                <button onClick={toggleBalanceVisibility} className="text-white hover:text-gray-200">
                                    {showBalance ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                            <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8Zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}                        <a href={route('user.dashboard')}>
                            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                <path
                                    fillRule="evenodd"
                                    d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-[100px] px-4 pb-8 space-y-4">
                    {menus.map((menu, index) => (
                        <Link
                            key={index}
                            href={menu.route}
                            className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-blue-500">
                                    {menu.icon === 'users' && <i className="bi bi-people-fill"></i>}
                                    {menu.icon === 'clock' && <i className="bi bi-clock-history"></i>}
                                    {menu.icon === 'box' && <i className="bi bi-box-seam"></i>}
                                    {menu.icon === 'file-text' && <i className="bi bi-file-earmark-text-fill"></i>}
                                    {menu.icon === 'settings' && <i className="bi bi-gear-fill"></i>}
                                </span>
                                <span className="text-gray-800 font-medium">{menu.name}</span>
                            </div>
                            <i className="bi bi-chevron-right text-gray-400"></i>
                        </Link>
                    ))}
                    {/* Tambahan manual */}
                    <Link
                        href={route('user.dashboard')}
                        className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-blue-500">
                                <i className="bi bi-bar-chart-fill"></i>
                            </span>
                            <span className="text-gray-800 font-medium">Dashboard User</span>
                        </div>
                        <i className="bi bi-chevron-right text-gray-400"></i>
                    </Link>
                </div>
            </div>
        </>
    );
}
