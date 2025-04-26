import React from 'react';
import { Link, Head } from '@inertiajs/react';

export default function Dashboard({ title, menus }) {
    return (
        <>
            <Head title={title} />
            <div className="max-w-[500px] mx-auto min-h-screen bg-white">
                {/* Header */}
                <div className="fixed top-0 z-10 w-full max-w-[500px] bg-main text-white px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-lg font-bold">Dashboard Admin</h1>
                        <a href={route('user.dashboard')}>
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


                <div className="pt-2 px-4 space-y-4 pb-8">
                    <div className="pt-[60px] px-4 space-y-4 pb-8">
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
                        {/* <Link
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
                        </Link> */}
                    </div>

                </div>
            </div>
        </>
    );
}
