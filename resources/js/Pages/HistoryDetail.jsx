// import { useEffect, useState } from 'react';
// import { usePage } from '@inertiajs/react';
// import PopupEditStore from "./PopupEditStore"; // Import komponen popup

// const HistoryDetail = () => {
//     const { params, transactions, store } = usePage().props;
//     const [transaction, setTransaction] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [isPopupOpen, setIsPopupOpen] = useState(false);
//     const [price, setPrice] = useState(0); // State untuk harga sementara
//     const [adminFee, setAdminFee] = useState(0); // State untuk biaya admin sementara
//     const [isEditing, setIsEditing] = useState(false); // State untuk toggle mode edit
//     const storeData = store || {
//         name: "Nama Toko Default",
//         address: "Alamat Toko Default",
//         phone_number: "Nomor Default",
//         image: "https://i.ibb.co/YRD8yDC/logo-muvausa-store-lingkaran-putih.webp",
//     };


//     const ref_id = params.ref_id;

//     useEffect(() => {
//         if (transactions && Array.isArray(transactions)) {
//             const transactionData = transactions.find((t) => t.ref_id === ref_id);
//             if (transactionData) {
//                 setTransaction(transactionData);
//             }
//         }
//     }, [ref_id, transactions]);

//     const updateStatus = (transaction_id) => {
//         fetch("/transactions/update-status", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "X-CSRF-TOKEN": document.querySelector(
//                     "meta[name='csrf-token']"
//                 ).getAttribute("content"),
//             },
//             body: JSON.stringify({
//                 transaction_id: transaction_id,
//             }),
//         })
//             .then((response) => response.json())
//             .then((data) => {
//                 if (data.success) {
//                     window.location.reload();// Reload the page after updating the transaction status
//                 } else {
//                     window.location.reload();// Reload the page after updating the transaction statusd
//                 }
//             })
//             .catch((error) => console.error("Error updating status:", error));
//     };

//     // Automatically update status every 2 seconds for pending transactions
//     useEffect(() => {
//         const interval = setInterval(() => {
//             if (transaction?.status === "Pending") {
//                 updateStatus(transaction.ref_id);
//             }
//         }, 2000); // 2 seconds interval

//         return () => clearInterval(interval); // Cleanup interval on unmount
//     }, [transaction]);

//     if (!transaction) {
//         return <div>Loading...</div>;
//     }

//     const formattedDate = new Date(transaction.created_at).toLocaleString("id-ID", {
//         year: "numeric",
//         month: "short",
//         day: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//     });

//     const formatRupiah = (amount) => {
//         const formattedAmount = parseInt(amount).toLocaleString('id-ID'); // Convert to integer and format with commas
//         return `Rp${formattedAmount}`; // Remove space after 'Rp'
//     };

//     return (
//         <>
//             {/* Header */}
//             <div className="sticky top-0 z-20 w-full max-w-full mx-auto flex items-center justify-between px-4 py-6 bg-[#0055bb]">
//                 {/* Kembali */}
//                 <button
//                     onClick={() => window.history.back()}
//                     className="flex items-center gap-2 text-white hover:text-white text-2xl"
//                     aria-label="Kembali"
//                 >
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="w-8 h-8"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                     >
//                         <path d="M15 18l-6-6 6-6" />
//                     </svg>
//                     <span className="text-xl">Kembali</span>
//                 </button>

//                 {/* Edit Toko */}
//                 <button
//                     onClick={() => setIsPopupOpen(true)}
//                     className="flex items-center gap-2 text-white hover:text-white font-medium text-xl"
//                     aria-label="Edit Toko"
//                 >
//                     <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="w-5 h-5"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                     >
//                         <path d="M12 20h9" />
//                         <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
//                     </svg>
//                     Edit Toko
//                 </button>
//             </div>

//             <div className="flex flex-col justify-center items-center p-4 bg-gray-100 relative">
//                 {/* Background */}
//                 <div className="absolute inset-0">
//                     <div className="h-[30%] w-full bg-[#0055bb]" />
//                     <div className="h-[70%] w-full bg-gray-100" />
//                 </div>

//                 {/* Card */}
//                 <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg font-sans z-10">
//                     <div className="flex justify-center mb-4">
//                         <img
//                             // src={storeData.image || "https://i.ibb.co/YRD8yDC/logo-muvausa-store-lingkaran-putih.webp"}
//                             src={storeData.image || "/storage/logo.webp"}
//                             alt="Store Logo"
//                             className="w-20 h-20 rounded-md"
//                         />
//                     </div>

//                     {/* Store Info */}
//                     <div className="text-center mb-8">
//                         <h2 className="text-xl font-semibold">{storeData.name || "Nama Toko Kamu"}</h2>
//                         <p className="text-gray-600 text-sm">{storeData.address || "Alamat Toko Kamu"}</p>
//                         <p className="text-gray-600 text-sm">{storeData.phone_number || "Nomor telepon Toko Kamu"}</p>
//                     </div>

//                     <div className="space-y-2">
//                         <div className="flex justify-between items-center border-b pb-2">
//                             {/* Status Label */}
//                             <span
//                                 className={`text-sm font-medium px-4 py-1 rounded-full ${transaction.status === "Pending"
//                                     ? "text-yellow-700 bg-yellow-100"
//                                     : transaction.status === "Sukses"
//                                         ? "text-green-700 bg-green-100"
//                                         : "text-red-700 bg-red-100"
//                                     }`}
//                             >
//                                 Transaksi {transaction.status}
//                             </span>

//                             {/* Tanggal */}
//                             <p className="text-gray-600 text-sm">{formattedDate}</p>

//                         </div>
//                         <div className="text-sm text-gray-700 space-y-2">
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">ID Transaksi</span>
//                                 <div className="flex justify-end items-center gap-2">
//                                     <button
//                                         onClick={() => navigator.clipboard.writeText(transaction.ref_id)}
//                                         className="text-gray-800 hover:text-gray-600 font-medium flex items-center gap-1 text-sm"
//                                         aria-label="Copy Serial Number"
//                                     >
//                                         <svg
//                                             className="w-5 h-5"
//                                             aria-hidden="true"
//                                             xmlns="http://www.w3.org/2000/svg"
//                                             width="24"
//                                             height="24"
//                                             fill="currentColor"
//                                             viewBox="0 0 24 24"
//                                         >
//                                             <path
//                                                 fillRule="evenodd"
//                                                 d="M7 9v6a4 4 0 0 0 4 4h4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1v2Z"
//                                                 clipRule="evenodd"
//                                             />
//                                             <path
//                                                 fillRule="evenodd"
//                                                 d="M13 3.054V7H9.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 13 3.054ZM15 3v4a2 2 0 0 1-2 2H9v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Z"
//                                                 clipRule="evenodd"
//                                             />
//                                         </svg>
//                                     </button>
//                                     <span className="break-words">{transaction.ref_id}</span>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">Nama Produk</span>
//                                 <span className="break-words text-right">{transaction.product_name}</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">Kategori</span>
//                                 <span className="break-words text-right">{transaction.category}</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">Brand</span>
//                                 <span className="break-words text-right">{transaction.brand}</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">Tipe</span>
//                                 <span className="break-words text-right">{transaction.type}</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">ID Tujuan</span>
//                                 <span className="break-words text-right">{transaction.customer_no}</span>
//                             </div>
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">Harga</span>
//                                 {isEditing ? (
//                                     <div className="flex justify-end items-center gap-2">
//                                         <input
//                                             type="number"
//                                             value={price}
//                                             onChange={(e) => setPrice(e.target.value)}
//                                             className="text-right border rounded px-2 py-1"
//                                         />
//                                         <button
//                                             onClick={() => setIsEditing(false)}
//                                             className="text-sm text-green-600 font-medium hover:underline"
//                                         >
//                                             Simpan
//                                         </button>
//                                         <button
//                                             onClick={() => {
//                                                 setPrice(transaction.price); // Reset to original price
//                                                 setIsEditing(false);
//                                             }}
//                                             className="text-sm text-red-600 font-medium hover:underline"
//                                         >
//                                             Batal
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="text-right items-center gap-2">
//                                         <button
//                                             onClick={() => {
//                                                 setPrice(transaction.price); // Set initial price for editing
//                                                 setIsEditing(true);
//                                             }}
//                                         >
//                                             <span className="text-right">{formatRupiah(price || transaction.price)}</span>
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                             <div className="grid grid-cols-2 gap-x-4 items-start">
//                                 <span className="font-medium">Biaya Admin</span>
//                                 {isEditing ? (
//                                     <div className="flex justify-end items-center gap-2">
//                                         <input
//                                             type="number"
//                                             value={adminFee}
//                                             onChange={(e) => setAdminFee(e.target.value)}
//                                             className="text-right border rounded px-2 py-1"
//                                         />
//                                         <button
//                                             onClick={() => setIsEditing(false)}
//                                             className="text-sm text-green-600 font-medium hover:underline"
//                                         >
//                                             Simpan
//                                         </button>
//                                         <button
//                                             onClick={() => {
//                                                 setAdminFee(0); // Reset to original admin fee
//                                                 setIsEditing(false);
//                                             }}
//                                             className="text-sm text-red-600 font-medium hover:underline"
//                                         >
//                                             Batal
//                                         </button>
//                                     </div>
//                                 ) : (
//                                     <div className="text-right items-center gap-2">
//                                         <span className="text-right">{formatRupiah(adminFee)}</span>
//                                         <button
//                                             onClick={() => {
//                                                 setAdminFee(0); // Set initial admin fee for editing
//                                                 setIsEditing(true);
//                                             }}
//                                         >
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                             <hr className="my-2" />
//                             <div className="grid grid-cols-2 gap-x-4 font-semibold">
//                                 <span>Total</span>
//                                 <span className="text-right">
//                                     {formatRupiah((parseFloat(price) || transaction.price) + (parseFloat(adminFee) || 0))}
//                                 </span>
//                             </div>
//                         </div>
//                     </div>

//                     {transaction.status == 'Sukses' && (
//                         // If "Sukses", display the full card
//                         <div className="p-3 rounded-lg shadow-md border-l-4 mt-6 mb-2 bg-green-50 border-green-500">
//                             <div className="items-center text-center mb-2">
//                                 <h3 className="text-sm font-medium text-gray-700">SERIAL NUMBER</h3>
//                             </div>

//                             <hr className="border-t border-gray-200 mb-2" />

//                             <div className="flex flex-col items-center">
//                                 <button
//                                     onClick={() => navigator.clipboard.writeText(transaction.sn)}
//                                     className="text-gray-800 hover:text-gray-600 font-medium flex items-center justify-center gap-2 text-sm"
//                                     aria-label="Copy Serial Number"
//                                 >
//                                     <svg
//                                         className="w-5 h-5 shrink-0"
//                                         aria-hidden="true"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         width="24"
//                                         height="24"
//                                         fill="currentColor"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <path
//                                             fillRule="evenodd"
//                                             d="M7 9v6a4 4 0 0 0 4 4h4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1v2Z"
//                                             clipRule="evenodd"
//                                         />
//                                         <path
//                                             fillRule="evenodd"
//                                             d="M13 3.054V7H9.2a2 2 0 0 1 .281-.432l2.46-2.87A2 2 0 0 1 13 3.054ZM15 3v4a2 2 0 0 1-2 2H9v6a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3Z"
//                                             clipRule="evenodd"
//                                         />
//                                     </svg>
//                                     <span className="text-base font-semibold text-gray-800 break-all">
//                                         {transaction.sn || 'N/A'}
//                                     </span>
//                                 </button>
//                             </div>
//                         </div>
//                     )
//                     }
//                 </div>

//                 {/* Buttons Section */}
//                 {transaction.status == 'Sukses' && (<div className="w-full max-w-lg mt-4 z-10">

//                     <button
//                         onClick={() => {
//                             setPrice(transaction.price); // Set initial price for editing
//                             setIsEditing(true);
//                         }}
//                         className="w-full bg-blue-500 text-white rounded-lg px-6 py-3 text-center text-sm font-semibold hover:bg-blue-600"
//                     >
//                         EDIT HARGA
//                     </button>

//                     {/* Popup Edit Store */}
//                     <PopupEditStore
//                         isOpen={isPopupOpen}
//                         onClose={() => setIsPopupOpen(false)}
//                         store={store}
//                     />

//                     <div className="flex justify-between mt-4">
//                         <button className="w-[48%] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm text-center">
//                             BANTUAN?
//                         </button>
//                         <button className="w-[48%] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm text-center">
//                             BAGIKAN
//                         </button>
//                     </div>
//                 </div>
//                 )}
//             </div>
//         </>
//     );
// };

// export default HistoryDetail;




import { useEffect, useState, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import PopupEditStore from "./PopupEditStore"; // Import komponen popup
import { toPng } from 'html-to-image'; // Import html-to-image


const HistoryDetail = () => {
    const { params, transactions, store } = usePage().props;
    const cardRef = useRef(null); // Ref untuk elemen kartu
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [price, setPrice] = useState(0); // State untuk harga sementara
    const [adminFee, setAdminFee] = useState(0); // State untuk biaya admin sementara
    const [isEditing, setIsEditing] = useState(false); // State untuk toggle mode edit
    const storeData = store || {
        name: "Nama Toko Default",
        address: "Alamat Toko Default",
        phone_number: "Nomor Default",
        image: "/storage/logo.webp",
    };


    const ref_id = params.ref_id;

    useEffect(() => {
        if (transactions && Array.isArray(transactions)) {
            const transactionData = transactions.find((t) => t.ref_id === ref_id);
            if (transactionData) {
                setTransaction(transactionData);
            }
        }
    }, [ref_id, transactions]);

    const handleDownload = () => {
        if (cardRef.current) {
            toPng(cardRef.current)
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

    const updateStatus = (transaction_id) => {
        fetch("/transactions/update-status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector(
                    "meta[name='csrf-token']"
                ).getAttribute("content"),
            },
            body: JSON.stringify({
                transaction_id: transaction_id,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    window.location.reload();// Reload the page after updating the transaction status
                } else {
                    window.location.reload();// Reload the page after updating the transaction statusd
                }
            })
            .catch((error) => console.error("Error updating status:", error));
    };

    // Automatically update status every 2 seconds for pending transactions
    useEffect(() => {
        const interval = setInterval(() => {
            if (transaction?.status === "Pending") {
                updateStatus(transaction.ref_id);
            }
        }, 2000); // 2 seconds interval

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [transaction]);

    if (!transaction) {
        return <div>Loading...</div>;
    }

    const formattedDate = new Date(transaction.created_at).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const formatRupiah = (amount) => {
        const formattedAmount = parseInt(amount).toLocaleString('id-ID'); // Convert to integer and format with commas
        return `Rp${formattedAmount}`; // Remove space after 'Rp'
    };

    return (
        <>
            {/* Header */}
            <div className="sticky top-0 z-20 w-full max-w-full mx-auto flex items-center justify-between px-4 py-6 bg-[#0055bb]">
                {/* Kembali */}
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-white hover:text-white text-2xl"
                    aria-label="Kembali"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span className="text-xl">Kembali</span>
                </button>

                {/* Edit Toko */}
                <button
                    onClick={() => setIsPopupOpen(true)}
                    className="flex items-center gap-2 text-white hover:text-white font-medium text-xl"
                    aria-label="Edit Toko"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    Edit Toko
                </button>
            </div>

            <div className="flex flex-col justify-center items-center p-4 bg-gray-100 relative">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="h-[30%] w-full bg-[#0055bb]" />
                    <div className="h-[70%] w-full bg-gray-100" />
                </div>

                {/* Card */}
                <div ref={cardRef} className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg font-sans z-10">
                    <div className="flex justify-center mb-4">
                        <img
                            // src={storeData.image || "https://i.ibb.co/YRD8yDC/logo-muvausa-store-lingkaran-putih.webp"}
                            src={storeData.image || "/storage/logo.webp"}
                            alt="Store Logo"
                            className="w-20 h-20 rounded-md"
                        />
                    </div>

                    {/* Store Info */}
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold">{storeData.name || "Nama Toko Kamu"}</h2>
                        <p className="text-gray-600 text-sm">{storeData.address || "Alamat Toko Kamu"}</p>
                        <p className="text-gray-600 text-sm">{storeData.phone_number || "Nomor telepon Toko Kamu"}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center border-b pb-2">
                            {/* Status Label */}
                            <span
                                className={`text-sm font-medium px-4 py-1 rounded-full ${transaction.status === "Pending"
                                    ? "text-yellow-700 bg-yellow-100"
                                    : transaction.status === "Sukses"
                                        ? "text-green-700 bg-green-100"
                                        : "text-red-700 bg-red-100"
                                    }`}
                            >
                                Transaksi {transaction.status}
                            </span>

                            {/* Tanggal */}
                            <p className="text-gray-600 text-sm">{formattedDate}</p>

                        </div>
                        <div className="text-sm text-gray-700 space-y-2">
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">ID Transaksi</span>
                                <div className="flex justify-end items-center gap-2">
                                    <button
                                        onClick={() => navigator.clipboard.writeText(transaction.ref_id)}
                                        className="text-gray-800 hover:text-gray-600 font-medium flex items-center gap-1 text-sm"
                                        aria-label="Copy Serial Number"
                                    >
                                        <svg
                                            className="w-5 h-5"
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
                                    <span className="break-words">{transaction.ref_id}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">Nama Produk</span>
                                <span className="break-words text-right">{transaction.product_name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">Kategori</span>
                                <span className="break-words text-right">{transaction.category}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">Brand</span>
                                <span className="break-words text-right">{transaction.brand}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">Tipe</span>
                                <span className="break-words text-right">{transaction.type}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">ID Tujuan</span>
                                <span className="break-words text-right">{transaction.customer_no}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">Harga</span>
                                {isEditing ? (
                                    <div className="flex justify-end items-center gap-2">
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="text-right border rounded px-2 py-1"
                                        />
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-sm text-green-600 font-medium hover:underline"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => {
                                                setPrice(transaction.price); // Reset to original price
                                                setIsEditing(false);
                                            }}
                                            className="text-sm text-red-600 font-medium hover:underline"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-right items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setPrice(transaction.price); // Set initial price for editing
                                                setIsEditing(true);
                                            }}
                                        >
                                            <span className="text-right">{formatRupiah(price || transaction.price)}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 items-start">
                                <span className="font-medium">Biaya Admin</span>
                                {isEditing ? (
                                    <div className="flex justify-end items-center gap-2">
                                        <input
                                            type="number"
                                            value={adminFee}
                                            onChange={(e) => setAdminFee(e.target.value)}
                                            className="text-right border rounded px-2 py-1"
                                        />
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="text-sm text-green-600 font-medium hover:underline"
                                        >
                                            Simpan
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAdminFee(0); // Reset to original admin fee
                                                setIsEditing(false);
                                            }}
                                            className="text-sm text-red-600 font-medium hover:underline"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-right items-center gap-2">
                                        <span className="text-right">{formatRupiah(adminFee)}</span>
                                        <button
                                            onClick={() => {
                                                setAdminFee(0); // Set initial admin fee for editing
                                                setIsEditing(true);
                                            }}
                                        >
                                        </button>
                                    </div>
                                )}
                            </div>
                            <hr className="my-2" />
                            <div className="grid grid-cols-2 gap-x-4 font-semibold">
                                <span>Total</span>
                                <span className="text-right">
                                    {formatRupiah((parseFloat(price) || transaction.price) + (parseFloat(adminFee) || 0))}
                                </span>
                            </div>
                        </div>
                    </div>

                    {transaction.status == 'Sukses' && (
                        // If "Sukses", display the full card
                        <div className="p-3 rounded-lg shadow-md border-l-4 mt-6 mb-2 bg-green-50 border-green-500">
                            <div className="items-center text-center mb-2">
                                <h3 className="text-sm font-medium text-gray-700">SERIAL NUMBER</h3>
                            </div>

                            <hr className="border-t border-gray-200 mb-2" />

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => navigator.clipboard.writeText(transaction.sn)}
                                    className="text-gray-800 hover:text-gray-600 font-medium flex items-center justify-center gap-2 text-sm"
                                    aria-label="Copy Serial Number"
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
                                    <span className="text-base font-semibold text-gray-800 break-all">
                                        {transaction.sn || 'N/A'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )
                    }
                </div>

                

                {/* Buttons Section */}
                {transaction.status == 'Sukses' && (<div className="w-full max-w-lg mt-4 z-10">

                    <button
                        onClick={() => {
                            setPrice(transaction.price); // Set initial price for editing
                            setIsEditing(true);
                        }}
                        className="w-full bg-blue-500 text-white rounded-lg px-6 py-3 text-center text-sm font-semibold hover:bg-blue-600"
                    >
                        EDIT HARGA
                    </button>

                    {/* Popup Edit Store */}
                    <PopupEditStore
                        isOpen={isPopupOpen}
                        onClose={() => setIsPopupOpen(false)}
                        store={store}
                    />

                    <div className="flex justify-between mt-4">
                        <button className="w-[48%] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm text-center">
                            BANTUAN?
                        </button>
                        <button 
                        onClick={handleDownload}
                        className="w-[48%] border border-blue-500 text-blue-500 rounded-lg px-4 py-2 text-sm text-center">
                            Unduh sebagai Gambar
                        </button>
                    </div>
                </div>
                )}
            </div>
        </>
    );
};

export default HistoryDetail;
