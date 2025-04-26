import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function AffiliateHistoryDetail({ transaction }) {
    const formattedDate = new Date(transaction.created_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const [showLottieRefId, setShowLottieRefId] = useState(false);

    const handleCopy = (textToCopy, setLottie) => {
        navigator.clipboard.writeText(textToCopy);
        setLottie(true);
        setTimeout(() => setLottie(false), 1500);
    };

    return (
        <>
            <Head title="Affiliate History Detail" />

            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
                {/* fixed position */}

                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <div className="w-full flex flex-row space-x-4 items-center justify-start">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Detail Riwayat Affiliate
                        </div>
                    </div>
                </header>

                {/* Card */}
                <main className="w-full w-max-[500px] flex flex-col space-y-3 mt-12 [@media(max-width:277px)]:mt-[76px] p-4 bg-main-white">

                    {/* bg putih */}
                    <div className="w-full flex flex-col space-y-8 items-center justify-center p-6 rounded-3xl bg-white shadow-md">
                        <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                            <div className="w-full flex justify-center">
                                {transaction.status === "Pending" && (
                                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-14 h-14 text-yellow-500"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                                        </svg>
                                    </div>
                                )}
                                {transaction.status === "Sukses" && (
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-14 h-14 text-green-500"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                                        </svg>
                                    </div>
                                )}
                                {transaction.status === "Gagal" && (
                                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-14 h-14 text-red-500"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="w-full flex justify-center">
                                <span
                                    className={`text-center text-sm font-medium px-4 py-1 rounded-full ${transaction.status === "Pending"
                                        ? "text-yellow-700 bg-yellow-100"
                                        : transaction.status === "Sukses"
                                            ? "text-green-700 bg-green-100"
                                            : "text-red-700 bg-red-100"
                                        }`}
                                >
                                    Transaksi {transaction.status}
                                </span>
                            </div>
                            {/* <p className="w-full font-utama font-semibold text-xl break-words text-wrap text-center">{transaction.affiliate_product?.product_name || '-'}</p> */}
                            <div className="w-full flex items-center justify-center">
                                <p className="w-max text-center text-xl font-medium px-4 py-1 rounded-full text-blue-700 bg-blue-100 border border-blue-700">
                                    +{transaction.status === 'Gagal' ? '0' : parseInt(transaction.commission || 0).toLocaleString('id-ID')}<span className="text-sm"> PoinMu</span>
                                </p>
                            </div>

                        </div>
                        <div className="w-full h-px bg-gray-600" />
                        <div className="w-full flex flex-col space-y-2 items-start justify-center">
                            <div className="w-full flex flex-col space-y-2 items-start justify-start">
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        ID
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words flex items-center justify-end gap-1">
                                        <div className="flex items-center justify-end gap-2 text-sm font-medium text-right font-utama tracking-[0.1px]">
                                            {showLottieRefId ? (
                                                <div className="w-20">
                                                    <DotLottieReact
                                                        src="https://lottie.host/519fbc9d-1e9b-4ddf-ab6f-14423aabd845/MtxYOaYcV8.lottie"
                                                        autoplay
                                                        loop={false}
                                                        style={{ width: '100%', height: '100%' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="break-words">{transaction.id}</span>
                                                    <button
                                                        onClick={() => handleCopy(transaction.id, setShowLottieRefId)}
                                                        className="text-main hover:text-blue-700 font-medium"
                                                        aria-label="Copy Ref Id"
                                                    >
                                                        <svg
                                                            className="w-5 h-5 shrink-0"
                                                            aria-hidden="true"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="24"
                                                            height="24"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M7 9v6a4 4 0 0 0 4 4h4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1v2Z"
                                                                clipRule="evenodd"
                                                            />
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M13 3.054V7H9.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 13 3.054ZM15 3v4a2 2 0 0 1-2 2H9v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Waktu Transaksi
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {formattedDate}
                                    </div>
                                </div>
                                <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        ID Transaksi
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                        {transaction.transaction?.id}
                                    </div>
                                </div>
                                <div className="w-full flex flex-row">
                                    <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                        Produk
                                    </div>
                                    <div className="w-1/2 text-right font-utama text-sm font-medium text-blue-600 hover:underline tracking-[0.1px] break-words">
                                        <a
                                            href={`/affiliate-products/${transaction.affiliate_product?.slug || transaction.affiliate_product?.id}`}
                                        >
                                            {transaction.affiliate_product?.product_name || '-'}
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                            <div className="w-full flex flex-row justify-between items-center">
                                <span className="text-md font-utama font-medium text-gray-700">Total Komisi</span>
                                <span className="text-md font-utama font-semibold text-black">
                                    {transaction.status === 'Gagal' ? '0' : parseInt(transaction.commission || 0).toLocaleString('id-ID')} PoinMu
                                </span>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </>
    );
}
