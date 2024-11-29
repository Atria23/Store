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
