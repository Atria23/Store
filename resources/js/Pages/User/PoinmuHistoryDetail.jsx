import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function PoinmuHistoryDetail({ history }) {
    const formattedDate = new Date(history.created_at).toLocaleString("id-ID", {
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
            <Head title="Detail Riwayat Poinmu" />

            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <div className="w-full flex flex-row space-x-4 items-center justify-start">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Detail Riwayat Poinmu
                        </div>
                    </div>
                </header>

                {/* Card */}
                <main className="w-full flex flex-col space-y-3 mt-12 p-4 bg-main-white">

                    <div className="w-full flex flex-col space-y-8 items-center justify-center p-6 rounded-3xl bg-white shadow-md">
                        <div className="w-full h-max flex flex-col space-y-4 items-start justify-center">
                            <div className="w-full flex justify-center">
                                {/* {history.points > 0 ? (
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-14 h-14 text-main" viewBox="0 0 16 16">
                                            <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                            <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-14 h-14 text-main" viewBox="0 0 16 16">
                                            <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                            <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                        </svg>
                                    </div>
                                )} */}
                                {(() => {
                                    const match = history.description?.match(/ke\s+([\w]+)/i);
                                    const iconKey = match ? match[1].toLowerCase() : null;

                                    return (
                                        <div className="w-24 h-24 border border-gray-300 rounded-full flex items-center justify-center">
                                            {iconKey ? (
                                                <img
                                                    src={`/storage/redeem_account/${iconKey}.png`}
                                                    alt={iconKey}
                                                    className="w-14 h-14 object-contain"
                                                />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-14 h-14 text-main" viewBox="0 0 16 16">
                                                    <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })()}

                            </div>

                            <div className="w-full flex items-center justify-center">
                                <p className={`w-max text-center text-xl font-medium px-4 py-1 rounded-full border
  ${Number(history.points) < 0
                                        ? 'border-red-600 bg-red-100 text-red-600'
                                        : 'border-green-600 bg-green-100 text-green-600'}`}>
                                    {Number(history.points) > 0 ? `+${Number(history.points).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`
                                        : Number(history.points).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    <span className="text-sm"> PoinMu</span>
                                </p>

                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-600" />
                        <div className="w-full flex flex-col space-y-2 items-start justify-center">
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                    ID
                                </div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words flex items-center justify-end gap-1">
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
                                            <span className="break-words">{history.id}</span>
                                            <button
                                                onClick={() => handleCopy(history.id, setShowLottieRefId)}
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
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                    Waktu Transaksi
                                </div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                    {formattedDate}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                    Status
                                </div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                    <span
                                        className={`
    px-2 rounded-full text-xs font-semibold w-fit
    ${history.status === 'pending'
                                                ? 'border border-yellow-600 bg-yellow-100 text-yellow-600'
                                                : history.status === 'sukses'
                                                    ? 'border border-green-600 bg-green-100 text-green-600'
                                                    : 'border border-red-600 bg-red-100 text-red-600'}
  `}
                                    >
                                        {history.status
                                            ? history.status.charAt(0).toUpperCase() + history.status.slice(1)
                                            : '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                            <div className="w-full flex flex-row">
                                <div className="text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                    Deskripsi
                                </div>
                                <div className="w-full text-right font-utama text-sm ml-20 font-medium tracking-[0.1px] break-words">
                                    {history.description || '-'}
                                </div>
                            </div>

                            <div className="w-full h-px border border-dashed border-gray-400 my-4" />
                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-normal tracking-[0.25px] break-words">
                                    Poin Sebelumnya
                                </div>
                                <div className="w-1/2 text-right font-utama text-sm font-medium tracking-[0.1px] break-words">
                                    {Number(history.previous_points).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                </div>
                            </div>

                            <div className="w-full flex flex-row">
                                <div className="w-1/2 text-left font-utama text-sm text-gray-800 font-semibold tracking-[0.25px] break-words">
                                    Poin Sekarang
                                </div>
                                <div className="w-1/2 text-right font-utama text-sm font-semibold tracking-[0.1px] break-words">
                                    {Number(history.new_points).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
