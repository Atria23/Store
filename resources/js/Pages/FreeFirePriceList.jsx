// import React, { useState, useEffect } from 'react';
// import { usePage } from '@inertiajs/react';

// export default function FreeFirePriceList() {
//     const { products } = usePage().props;
//     const [customerNo, setCustomerNo] = useState('');
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [isPopupOpen, setIsPopupOpen] = useState(false);
//     const [sortedProducts, setSortedProducts] = useState(products);
//     const [sortOrder, setSortOrder] = useState('asc');
//     const [errors, setErrors] = useState({});
//     const [errorMessage, setErrorMessage] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [balance, setBalance] = useState(0);
    
//     const fetchBalance = async () => {
//         try {
//             const response = await fetch('/balance');
//             const data = await response.json();
//             setBalance(data.balance);
//         } catch (error) {
//             console.error('Failed to fetch balance:', error);
//         }
//     };    

//     useEffect(() => {
//         fetchBalance();
//     }, []);
    
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

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!selectedProduct || !customerNo) {
//             alert('Mohon lengkapi nomor pelanggan dan pilih produk.');
//             return;
//         }
    
//         setLoading(true);
    
//         fetch('/transactions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//             },
//             body: JSON.stringify({
//                 buyer_sku_code: selectedProduct.buyer_sku_code,
//                 customer_no: customerNo,
//                 max_price: selectedProduct.price,
//                 price_product: selectedProduct.price, // Tambahkan ini
//                 testing: false,
//             }),
//         })
//             .then((response) => response.json())
//             .then((data) => {
//                 if (data.success) {
//                     alert('Transaksi berhasil!');
//                 } else {
//                     alert(`Transaksi gagal: ${data.message}`);
//                 }
//             })
//             .catch((error) => {
//                 alert('Terjadi kesalahan saat mengirim permintaan transaksi.');
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     };
    
    

//     return (
//         <div className="p-4">
//             {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

//             <div className="text-lg mt-2">
//                 <strong>Saldo Anda:</strong> Rp{balance.toLocaleString('id-ID').replace(/,/g, '.')}
//             </div>
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
//                 {errors.customer_no && (
//                     <p className="text-red-500 text-sm">{errors.customer_no}</p>
//                 )}
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
//                     <p className="text-red-500 mt-2">
//                         {balance < selectedProduct.price && 'Saldo Anda tidak mencukupi untuk transaksi ini.'}
//                     </p>
//                     <div className="flex justify-between mt-4">
//                         <button
//                             onClick={handleSubmit}
//                             disabled={loading || (selectedProduct && balance < selectedProduct.price)}
//                             className={`bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 ${
//                                 (loading || (selectedProduct && balance < selectedProduct.price)) && 'bg-gray-400 cursor-not-allowed'
//                             }`}
//                         >
//                             {loading ? 'Processing...' : 'Lanjutkan'}
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
    const [buyerSkuCode, setBuyerSkuCode] = useState('');
    const [customerNo, setCustomerNo] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [testing, setTesting] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true); // Set loading state to true

        Inertia.post('/transactions', {
            buyer_sku_code: buyerSkuCode,
            customer_no: customerNo,
            max_price: maxPrice,
            testing: testing,
        }, {
            onError: (errors) => {
                setErrors(errors);
                setLoading(false); // Reset loading state on error
            },
            onSuccess: () => {
                setLoading(false); // Reset loading state on success
                // Optionally, reset the form
                setBuyerSkuCode('');
                setCustomerNo('');
                setMaxPrice('');
                setTesting(false);
            }
        });
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-3 bg-white rounded shadow-lg">
                <h1 className="text-2xl font-bold text-center">Transaksi Baru</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form Fields Here */}
                    <div>
                        <label className="block text-sm">Buyer SKU Code</label>
                        <input
                            type="text"
                            value={buyerSkuCode}
                            onChange={(e) => setBuyerSkuCode(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Masukkan Buyer SKU Code"
                            required
                        />
                        {errors.buyer_sku_code && (
                            <div className="text-red-500 text-sm mt-2">
                                {errors.buyer_sku_code}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm">Customer Number</label>
                        <input
                            type="text"
                            value={customerNo}
                            onChange={(e) => setCustomerNo(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Masukkan Nomor Pelanggan"
                            required
                        />
                        {errors.customer_no && (
                            <div className="text-red-500 text-sm mt-2">
                                {errors.customer_no}
                            </div>
                        )}
                    </div>


                    <button
                        type="submit"
                        disabled={loading} // Disable button while loading
                        className={`w-full px-4 py-2 font-bold text-white rounded-md ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} focus:outline-none`}
                    >
                        {loading ? 'Submitting...' : 'Submit'} {/* Change button text */}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
