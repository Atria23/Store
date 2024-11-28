// import React, { useState } from 'react';
// import { usePage } from '@inertiajs/react';
// import { Inertia } from '@inertiajs/inertia';

// export default function FreeFirePriceList() {
//     const { products } = usePage().props;
//     const [customerNo, setCustomerNo] = useState('');
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [isPopupOpen, setIsPopupOpen] = useState(false);
//     const [sortedProducts, setSortedProducts] = useState(products);
//     const [sortOrder, setSortOrder] = useState('asc');

//     const handleSort = () => {
//         const sorted = [...sortedProducts].sort((a, b) => {
//             if (sortOrder === 'asc') return parseInt(a.price) - parseInt(b.price);
//             return parseInt(b.price) - parseInt(a.price);
//         });
//         setSortedProducts(sorted);
//         setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     };

//     const formatPrice = (price) => parseInt(price, 10).toLocaleString('id-ID').replace(/,/g, '.');

//     const handleSelectProduct = (product) => {
//         setSelectedProduct(product);
//         setIsPopupOpen(true);
//     };

//     const handleClosePopup = () => {
//         setIsPopupOpen(false);
//         setSelectedProduct(null);
//     };

//     const handleSubmit = async () => {
//         if (selectedProduct && customerNo) {
//             try {
//                 // Kirim data untuk memulai transaksi
//                 const initiateResponse = await Inertia.post('/transaction/initiate', {
//                     customer_no: customerNo,
//                     buyer_sku_code: selectedProduct.buyer_sku_code,
//                     product_name: selectedProduct.product_name,
//                     price: selectedProduct.price,
//                     description: selectedProduct.desc,
//                 });

//                 // Pastikan response dari server memiliki ref_id
//                 if (initiateResponse.props?.ref_id) {
//                     // Proses transaksi dengan ref_id yang didapat
//                     const processResponse = await Inertia.post('/transaction/process', {
//                         ref_id: initiateResponse.props.ref_id,
//                     });

//                     // Berikan feedback kepada pengguna
//                     if (processResponse.props?.success) {
//                         alert('Transaksi berhasil!');
//                     } else {
//                         alert(`Transaksi gagal: ${processResponse.props?.message || 'Kesalahan tidak diketahui.'}`);
//                     }
//                 } else {
//                     alert('Gagal memulai transaksi. Pastikan data transaksi valid.');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('Terjadi kesalahan saat memproses transaksi.');
//             }
//         } else {
//             alert('Mohon lengkapi nomor pelanggan dan pilih produk.');
//         }
//     };

//     return (
//         <div className="p-4">
//             <h1 className="text-2xl font-bold">Daftar Produk Free Fire</h1>

//             <div className="flex justify-end mb-4">
//                 <button
//                     onClick={handleSort}
//                     className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
//                 >
//                     Sort Harga: {sortOrder === 'asc' ? 'Terendah' : 'Termahal'}
//                 </button>
//             </div>

//             <div className="my-4">
//                 <label htmlFor="customerNo" className="block text-sm font-medium text-gray-700">
//                     Nomor Pelanggan
//                 </label>
//                 <input
//                     type="text"
//                     id="customerNo"
//                     value={customerNo}
//                     onChange={(e) => setCustomerNo(e.target.value)}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                     placeholder="Masukkan nomor pelanggan"
//                 />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
//                 {sortedProducts.map((product) => (
//                     <div
//                         key={product.buyer_sku_code}
//                         className="border p-4 rounded shadow bg-white hover:shadow-md"
//                     >
//                         <h2 className="font-semibold">{product.product_name}</h2>
//                         <p>Harga: Rp{formatPrice(product.price)}</p>
//                         <button
//                             onClick={() => handleSelectProduct(product)}
//                             className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
//                         >
//                             Detail Produk
//                         </button>
//                     </div>
//                 ))}
//             </div>

//             {isPopupOpen && selectedProduct && (
//                 <div
//                     className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4"
//                     onClick={(e) => {
//                         if (e.target === e.currentTarget) handleClosePopup();
//                     }}
//                 >
//                     <div className="flex justify-between items-center">
//                         <h2 className="text-lg font-bold">{selectedProduct.product_name}</h2>
//                         <button
//                             onClick={handleClosePopup}
//                             className="text-red-500 font-bold"
//                         >
//                             Tutup
//                         </button>
//                     </div>
//                     <p className="mt-2">{selectedProduct.desc}</p>
//                     <div className="flex justify-between mt-4">
//                         <button
//                             onClick={handleSubmit}
//                             className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
//                         >
//                             Lanjutkan
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }



























import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

const TransactionForm = () => {
    const [userId, setUserId] = useState('');
    const [buyerSkuCode, setBuyerSkuCode] = useState('');
    const [customerNo, setCustomerNo] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTransaction = async () => {
        setLoading(true);
        setMessage('');

        try {
            // Mengirimkan permintaan ke backend menggunakan Inertia
            const response = await Inertia.post('/transaction/initiate', {
                user_id: userId,
                buyer_sku_code: buyerSkuCode,
                customer_no: customerNo
            });

            if (response.props.message === 'Transaction initiated.') {
                setMessage('Transaksi berhasil diinisiasi.');
                
                // Setelah transaksi berhasil diinisiasi, kirim ke proses transaksi Digiflazz
                await Inertia.post('/transaction/process', {
                    user_id: userId,
                    buyer_sku_code: buyerSkuCode,
                    customer_no: customerNo
                });

                setMessage('Transaksi berhasil diproses.');
            } else {
                setMessage('Gagal menginisiasi transaksi.');
            }
        } catch (error) {
            console.error(error);
            setMessage('Terjadi kesalahan dalam transaksi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Form Transaksi</h2>
            <input
                type="text"
                placeholder="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Buyer SKU Code"
                value={buyerSkuCode}
                onChange={(e) => setBuyerSkuCode(e.target.value)}
            />
            <input
                type="text"
                placeholder="Customer No"
                value={customerNo}
                onChange={(e) => setCustomerNo(e.target.value)}
            />
            <button onClick={handleTransaction} disabled={loading}>
                {loading ? 'Processing...' : 'Proses Transaksi'}
            </button>
            <div>{message}</div>
        </div>
    );
};

export default TransactionForm;
