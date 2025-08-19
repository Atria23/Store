import { Head, Link, useForm, usePage } from '@inertiajs/react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(number).replace('IDR', 'Rp');
};

export default function PlnInquiry({ products }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_no: '',
    });

    // Ambil flash props dengan aman
    const { flash } = usePage().props;
    // --- INI BARIS YANG DIPERBAIKI ---
    const inquiryResult = flash?.inquiryResult || null; 

    const handleInquiry = (e) => {
        e.preventDefault();
        post(route('pln.inquiry'), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="PLN Prabayar" />
            <div className="bg-gray-100 min-h-screen font-sans">
                <header className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="max-w-md mx-auto p-4 flex items-center space-x-4">
                        <Link href="/" className="text-gray-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <h1 className="text-lg font-bold text-gray-800">PLN</h1>
                    </div>
                </header>

                <main className="max-w-md mx-auto p-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center space-x-3 mb-4">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/9/97/Logo_PLN.png" alt="PLN Logo" className="h-10 w-10 object-contain" />
                            <div>
                                <h2 className="font-bold text-gray-800">PLN</h2>
                                <p className="text-sm text-gray-500">Prabayar</p>
                            </div>
                        </div>

                        <form onSubmit={handleInquiry}>
                            <label htmlFor="customer_no" className="text-sm font-medium text-gray-700">Nomor Meter/ID Pelanggan</label>
                            <div className="relative mt-1">
                                <input
                                    type="number"
                                    id="customer_no"
                                    value={data.customer_no}
                                    onChange={(e) => setData('customer_no', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Contoh: 14123456789"
                                    required
                                />
                            </div>
                            {errors.customer_no && <p className="text-red-500 text-sm mt-2">{errors.customer_no}</p>}
                            
                            {inquiryResult && (
                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm font-semibold text-blue-800">{inquiryResult.name}</p>
                                    <p className="text-xs text-gray-600">{inquiryResult.customer_no} - {inquiryResult.segment_power}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={processing || !data.customer_no}
                                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                            >
                                {processing ? 'Mengecek...' : 'Cek ID Pelanggan'}
                            </button>
                        </form>
                    </div>

                    {inquiryResult && (
                        <div className="mt-6">
                            <h3 className="text-md font-bold text-gray-700 mb-3">Pilih Produk</h3>
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <div key={product.buyer_sku_code} className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:ring-2 hover:ring-blue-500 transition">
                                        <div>
                                            <p className="font-semibold text-gray-800">{product.product_name}</p>
                                            <p className="text-blue-600 font-bold">{formatRupiah(product.sell_price)}</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}