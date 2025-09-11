import React, { useRef } from 'react';
// Tidak perlu mengimpor toPng di sini lagi

const formatRupiahCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'Rp0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const ReceiptPostpaid = ({ storeData, transaction, size, editableBillPrice, editableAdminFee, editableDiscount, editablePenaltyFee, onDownloadRequest }) => {

    const receiptContentRef = useRef(null); // Ref untuk div utama konten struk yang akan di-capture

    // Menggunakan editable props jika tersedia, jika tidak kembali ke transaction data
    const currentBillPrice = editableBillPrice !== undefined ? editableBillPrice : (transaction?.price || 0);
    const currentAdminFee = editableAdminFee !== undefined ? editableAdminFee : (transaction?.admin_fee || 0);
    const currentDiscount = editableDiscount !== undefined ? editableDiscount : (transaction?.details?.diskon || 0);
    const currentPenaltyFee = editablePenaltyFee !== undefined ? editablePenaltyFee : 0;

    const calculatedTotalForReceipt = currentBillPrice + currentAdminFee + currentPenaltyFee - currentDiscount;

    const formattedDate = new Date(transaction.created_at).toLocaleString("id-ID", {
        year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    });

    const { type, details } = transaction;
    const descData = details?.desc || {};

    const sizeStyle = {
        textSize: size === 'besar' ? 'text-2xl' : 'text-xl', // Untuk label utama dan kini detail rincian tagihan
        fontWeight: size === 'besar' ? 'font-bold' : 'font-medium',
        smallText: size === 'besar' ? 'text-lg' : 'text-base', // Ini mungkin tidak akan banyak dipakai lagi di bagian detail rincian
        serialTitle: size === 'besar' ? 'text-xl' : 'text-base',
        serialNumber: size === 'besar' ? 'text-2xl' : 'text-xl',
        logoWidth: size === 'besar' ? 'w-[90px]' : 'w-[80px]',
        padding: size === 'besar' ? 'p-3' : 'p-3'
    };

    const renderReceiptBillDetails = (billItems) => {
        if (!billItems || !Array.isArray(billItems) || billItems.length === 0) {
            return (
                <div className={`flex justify-between w-full ${sizeStyle.textSize} font-mono tracking-wide leading-tight`}>
                    <span className={`font-bold text-[#6d7278]`}>Detail Item Tagihan</span>
                    <span className={`text-black ${sizeStyle.fontWeight} text-right break-all max-w-[240px]`}>
                        Tidak tersedia.
                    </span>
                </div>
            );
        }
        return (
            <div className="flex flex-col gap-1 w-full my-1">
                {/* Judul "Rincian Tagihan Per Periode" disamakan dengan textSize */}
                <span className={`font-bold text-[#6d7278] ${sizeStyle.textSize}`}>Rincian Tagihan Per Periode:</span>
                {billItems.map((bill, index) => (
                    <div key={index} className="flex flex-col border-b border-dashed border-gray-400 py-1 last:border-b-0">
                        {/* Label dan Value Periode disamakan dengan textSize */}
                        <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight`}>
                            <span className={`font-semibold text-[#6d7278]`}>Periode</span>
                            <span className={`text-black ${sizeStyle.fontWeight} text-right break-all max-w-[200px]`}>
                                {bill.periode || '-'}
                            </span>
                        </div>
                        {bill.nilai_tagihan && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Tagihan:</span>
                                <span>{formatRupiahCurrency(bill.nilai_tagihan)}</span>
                            </div>
                        )}
                        {bill.denda > 0 && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Denda:</span>
                                <span>{formatRupiahCurrency(bill.denda)}</span>
                            </div>
                        )}
                        {bill.admin > 0 && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Admin:</span>
                                <span>{formatRupiahCurrency(bill.admin)}</span>
                            </div>
                        )}
                        {bill.meter_awal && bill.meter_akhir && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Meter:</span>
                                <span>{bill.meter_awal}-{bill.meter_akhir}</span>
                            </div>
                        )}
                        {bill.biaya_lain && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Biaya Lain:</span>
                                <span>{formatRupiahCurrency(bill.biaya_lain)}</span>
                            </div>
                        )}
                        {bill.iuran && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Iuran:</span>
                                <span>{formatRupiahCurrency(bill.iuran)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Tombol Unduh di dalam ReceiptPostpaid, memanggil handler dari parent */}
            <button
                onClick={() => onDownloadRequest(receiptContentRef.current)} // Meneruskan ref ke parent
                className="mt-4 w-full bg-main text-white rounded-lg px-6 py-3 text-center text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 mb-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-download" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" /><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" /></svg>
                Unduh Struk
            </button>
            <div
                ref={receiptContentRef} // Set the ref here
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
                        {transaction.ref_id}
                    </span>
                </div>

                <div className="border-t-2 border-dashed border-gray-600 my-2 w-full" />

                <div className="flex flex-col gap-1 w-full">
                    {[
                        ['Produk', transaction.product?.product_name || transaction.type],
                        ['Tujuan', transaction.customer_no],
                        ['Status', transaction.status],
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

                {(type === 'PLN' || type === 'PDAM' || type === 'INTERNET' || type === 'BPJS') && details && (
                    <div className="flex flex-col gap-1 w-full my-2">
                        {/* Judul Detail Layanan juga disamakan dengan textSize */}
                        <span className={`font-bold text-[#6d7278] ${sizeStyle.textSize}`}>Detail Layanan:</span>
                        {type === 'PLN' && (
                            <>
                                <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                    <span>Tarif/Daya:</span>
                                    <span>{descData.tarif || '-'}/{descData.daya || '-'} VA</span>
                                </div>
                                <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                    <span>Lembar Tagihan:</span>
                                    <span>{descData.lembar_tagihan || '0'}</span>
                                </div>
                            </>
                        )}
                        {type === 'PDAM' && (
                            <>
                                {/* Baris Tarif */}
                                <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                    <span>Tarif:</span> {/* Menggunakan label "Tarif" */}
                                    <span>{descData.tarif || '-'}</span>
                                </div>

                                {/* Baris Alamat dengan kondisi */}
                                {descData.alamat && descData.alamat !== '-' && (
                                    <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                        <span>Alamat:</span>
                                        <span>{descData.alamat}</span> {/* Tidak perlu fallback '-' karena sudah ditangani oleh kondisi */}
                                    </div>
                                )}

                                {/* Baris Jatuh Tempo */}
                                {descData.jatuh_tempo && descData.jatuh_tempo !== '-' && (

                                    <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                        <span>Jatuh Tempo:</span>
                                        <span>{descData.jatuh_tempo || '-'}</span>
                                    </div>
                                )}

                                {/* Baris Lembar Tagihan */}
                                <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                    <span>Lembar Tagihan:</span>
                                    <span>{descData.lembar_tagihan || '0'}</span>
                                </div>
                            </>
                        )}
                        {type === 'INTERNET' && (
                            <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                <span>Lembar Tagihan:</span>
                                <span>{descData.lembar_tagihan || '0'}</span>
                            </div>
                        )}
                        {type === 'BPJS' && (
                            <>
                                <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                    <span>Jumlah Peserta:</span>
                                    <span>{descData.jumlah_peserta || '0'}</span>
                                </div>
                                {descData.alamat && (
                                    <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                        <span>Alamat:</span>
                                        <span>{descData.alamat}</span>
                                    </div>
                                )}
                                <div className={`flex justify-between ${sizeStyle.textSize} font-mono tracking-wide leading-tight pl-2`}>
                                    <span>Lembar Tagihan:</span>
                                    <span>{descData.lembar_tagihan || '0'}</span>
                                </div>
                            </>
                        )}
                        {renderReceiptBillDetails(descData.detail)}
                    </div>
                )}

                <div className="border-t-2 border-dashed border-gray-600 my-2 w-full" />

                <div className="flex flex-col gap-1 w-full">
                    {[
                        ['Harga Tagihan', formatRupiahCurrency(currentBillPrice)],
                        ['Biaya Admin', formatRupiahCurrency(currentAdminFee)],
                        ['Denda', formatRupiahCurrency(currentPenaltyFee)],
                        ['Diskon', formatRupiahCurrency(currentDiscount)],
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

                <div className="border-t-2 border-dashed border-gray-600 my-2 w-full" />

                <div className={`flex justify-between w-full ${size === 'besar' ? 'text-3xl' : 'text-2xl'} font-mono font-bold tracking-wide leading-tight my-1`}>
                    <span className={`font-bold text-[#6d7278]`}>Total</span>
                    <span className={`text-black text-right`}>
                        {formatRupiahCurrency(calculatedTotalForReceipt)}
                    </span>
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

export default ReceiptPostpaid;