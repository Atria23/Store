import React, { useRef } from 'react';
import { toPng } from 'html-to-image';

const Receipt = ({ storeData, transaction, price, adminFee, ref_id, formattedDate, size = 'besar' }) => {

    const cardRef = useRef();
    const formatRupiah = (amount) => {
        const formattedAmount = parseInt(amount).toLocaleString('id-ID'); // Convert to integer and format with commas
        return `Rp${formattedAmount}`; // Remove space after 'Rp'
    };
    const handleDownload = () => {
        if (cardRef.current) {
            toPng(cardRef.current, { backgroundColor: 'white', skipFonts: true })
                .then((dataUrl) => {
                    const link = document.createElement('a');
                    link.download = `Transaction-${transaction?.ref_id}.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((err) => {
                    console.error('Error generating image:', err);
                });
        }
    };

    const sizeStyle = {
        textSize: size === 'besar' ? 'text-2xl' : 'text-xl',
        fontWeight: size === 'besar' ? 'font-bold' : 'font-medium',
        smallText: size === 'besar' ? 'text-lg' : 'text-base',
        serialTitle: size === 'besar' ? 'text-xl' : 'text-base',
        serialNumber: size === 'besar' ? 'text-2xl' : 'text-xl',
        logoWidth: size === 'besar' ? 'w-[90px]' : 'w-[80px]',
        padding: size === 'besar' ? 'p-3' : 'p-3'
    };

    return (
        <>
            <button
                onClick={handleDownload}
                className="mt-4 w-full max-w-[384px] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 mx-auto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
                </svg>
                <span>Unduh Struk</span>
            </button>
            <div
                ref={cardRef}
                className={`bg-white w-[384px] h-max flex flex-col items-center justify-center mx-auto ${sizeStyle.padding}`}
            >
                <div className="flex flex-col gap-1 items-center w-full my-2">
                    {(storeData?.image || storeData?.name) && (
                        <>
                            {storeData.image && (
                                <img
                                    src={storeData.image}
                                    alt="Logo"
                                    className={`${sizeStyle.logoWidth} h-auto object-contain`}
                                />
                            )}
                            {storeData.name && (
                                <div className={`text-black text-center font-mono ${sizeStyle.textSize} font-bold tracking-wide leading-tight`}>
                                    {storeData.name}
                                </div>
                            )}
                            {storeData.address && (
                                <div className={`text-black text-center font-mono ${sizeStyle.smallText} tracking-wide leading-tight`}>
                                    {storeData.address}
                                </div>
                            )}
                        </>
                    )}

                    <div className={`text-black text-center font-mono ${sizeStyle.smallText} ${sizeStyle.fontWeight} tracking-wide leading-tight`}>
                        {formattedDate}
                    </div>
                </div>

                <div className={`flex justify-between w-full ${sizeStyle.textSize} font-mono tracking-wide leading-tight my-1`}>
                    <span className={`font-bold text-[#6d7278]`}>ID</span>
                    <span className={`text-black ${sizeStyle.fontWeight} text-right break-all pl-10`}>
                        {ref_id}
                    </span>
                </div>

                <div className="border-t-2 border-dashed border-gray-600 my-2 w-full" />

                <div className="flex flex-col gap-1 w-full">
                    {[
                        ['Produk', transaction.product_name],
                        ['Tujuan', transaction.customer_no],
                        ['Harga', formatRupiah(price || transaction.price)],
                    ].map(([label, value], idx) => (
                        <div
                            key={idx}
                            className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight`}
                        >
                            <span className={`font-bold text-[#6d7278]`}>{label}</span>
                            <span className={`text-black ${sizeStyle.fontWeight} text-right break-all max-w-[240px]`}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-dashed border-gray-600 my-2 w-full" />

                <div className="flex flex-col gap-1 w-full">
                    {[
                        ['Admin', formatRupiah(adminFee)],
                        ['Total', formatRupiah((parseFloat(price) || transaction.price) + (parseFloat(adminFee) || 0))],
                    ].map(([label, value], idx) => (
                        <div
                            key={idx}
                            className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight`}
                        >
                            <span className={`font-bold text-[#6d7278]`}>{label}</span>
                            <span className={`${sizeStyle.fontWeight} text-black text-right`}>{value}</span>
                        </div>
                    ))}
                </div>

                <div className="border-2 border-dashed border-black w-full mt-2 px-3 py-1 text-center">
                    <div className={`text-black font-mono ${sizeStyle.serialTitle} font-bold tracking-wide leading-tight`}>
                        Serial Number
                    </div>
                    <div className="w-full border-b border-black mt-1" />
                    <div
                        className={`mt-1 text-black font-mono ${sizeStyle.serialNumber} font-medium tracking-widest break-words whitespace-pre-wrap`}
                    >
                        {transaction.sn}
                    </div>
                </div>

                <div className={`text-black text-center ${sizeStyle.smallText} font-mono ${sizeStyle.fontWeight} tracking-wide leading-tight mt-2`}>
                    Terima kasih sudah berbelanja.<br />
                    {storeData?.phone_number && (
                        <>
                            Hubungi Kami: {storeData.phone_number}<br />
                        </>
                    )}
                </div>

            </div>
        </>
    );
};

export default Receipt;
