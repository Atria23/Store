import React, { useState, useEffect } from 'react';
// 1. Import 'router' dan komponen yang diperlukan
import { Head, router, Link } from '@inertiajs/react';

// 2. Terima 'errors' dan 'flash' sebagai prop
export default function BulkEdit({ auth, postpaidProducts, errors = {}, flash }) {
    // State untuk form "Terapkan ke Semua"
    const [bulkForm, setBulkForm] = useState({
        desc: "",
        seller_product_status: "",
        buyer_product_status: "",
        commission_sell_percentage: "",
        commission_sell_fixed: "",
        image: "",
    });

    // State untuk menampung data form dari setiap produk
    const [productForms, setProductForms] = useState([]);
    
    // State manual untuk melacak proses pengiriman
    const [isProcessing, setIsProcessing] = useState(false);

    // Inisialisasi state form saat komponen pertama kali dimuat
    useEffect(() => {
        const initialForms = postpaidProducts.map(product => ({
            id: product.id,
            product_name: product.product_name,
            buyer_sku_code: product.buyer_sku_code,
            desc: product.desc || '',
            seller_product_status: product.seller_product_status ? '1' : '0',
            buyer_product_status: product.buyer_product_status ? '1' : '0',
            commission_sell_percentage: product.commission_sell_percentage || '',
            commission_sell_fixed: product.commission_sell_fixed || '',
            image: product.image || '',
            original: {
                desc: product.desc || '',
                seller_product_status: product.seller_product_status ? '1' : '0',
                buyer_product_status: product.buyer_product_status ? '1' : '0',
                commission_sell_percentage: product.commission_sell_percentage || '',
                commission_sell_fixed: product.commission_sell_fixed || '',
                image: product.image || '',
            }
        }));
        setProductForms(initialForms);
    }, [postpaidProducts]);

    // ** IMPLEMENTASI LENGKAP **
    // Menangani perubahan pada form "Terapkan ke Semua"
    const handleBulkFormChange = (e) => {
        const { name, value } = e.target;
        setBulkForm(prev => ({ ...prev, [name]: value }));
    };

    // Menangani perubahan pada form individual produk
    const handleIndividualChange = (id, field, value) => {
        setProductForms(prevForms =>
            prevForms.map(form =>
                form.id === id ? { ...form, [field]: value } : form
            )
        );
    };

    // Menerapkan nilai dari form bulk ke semua form individual
    const applyBulkToAll = () => {
        if (!confirm("Apakah Anda yakin ingin menerapkan nilai ini ke semua produk di halaman ini? Perubahan pada form di bawah akan ditimpa.")) return;

        setProductForms(prevForms =>
            prevForms.map(form => {
                const newForm = { ...form };
                if (bulkForm.desc.trim() !== "") newForm.desc = bulkForm.desc;
                if (bulkForm.seller_product_status !== "") newForm.seller_product_status = bulkForm.seller_product_status;
                if (bulkForm.buyer_product_status !== "") newForm.buyer_product_status = bulkForm.buyer_product_status;
                if (bulkForm.commission_sell_percentage !== "") newForm.commission_sell_percentage = bulkForm.commission_sell_percentage;
                if (bulkForm.commission_sell_fixed !== "") newForm.commission_sell_fixed = bulkForm.commission_sell_fixed;
                if (bulkForm.image.trim() !== "") newForm.image = bulkForm.image;
                return newForm;
            })
        );
        alert("Nilai dari form bulk telah diterapkan.");
    };

    // Helper untuk menandai baris yang sudah diubah
    const isModified = (form) => {
        // Bandingkan setiap field di form dengan nilai originalnya
        return Object.keys(form.original).some(key => form[key] != form.original[key]);
    };

    // Modifikasi handleSubmit untuk menggunakan router.post
    const handleSubmit = (e) => {
        e.preventDefault();

        const individual_updates = productForms
            .filter(form => isModified(form)) // Gunakan helper isModified
            .map(form => {
                const updates = {};
                // Hanya kirim field yang benar-benar berubah untuk efisiensi
                Object.keys(form.original).forEach(key => {
                    if (form[key] != form.original[key]) {
                        updates[key] = form[key];
                    }
                });

                // Konversi tipe data boolean sebelum mengirim
                if (updates.seller_product_status !== undefined) {
                    updates.seller_product_status = updates.seller_product_status === "1";
                }
                if (updates.buyer_product_status !== undefined) {
                    updates.buyer_product_status = updates.buyer_product_status === "1";
                }
                
                return { id: form.id, updates };
            });

        if (individual_updates.length === 0) {
            alert("Tidak ada perubahan untuk disimpan.");
            return;
        }

        const idsToUpdate = individual_updates.map(update => update.id);

        router.post(route('postpaid.bulk-update'), {
            ids: idsToUpdate,
            individual_updates: individual_updates,
        }, {
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                // Flash message akan ditampilkan secara otomatis
            },
            onError: (errorObject) => {
                console.error("Update failed:", errorObject);
                alert("Gagal memperbarui produk. Silakan periksa pesan error.");
            },
            preserveScroll: true,
        });
    };

    return (
        <div
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Bulk Edit Postpaid Products</h2>}
        >
            <Head title="Bulk Edit Postpaid Products" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {flash.message && (
                        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                            <p>{flash.message}</p>
                        </div>
                    )}

                    <div className="mb-4">
                        <Link
                            href={route('postpaid.index')}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300 transition"
                        >
                            &larr; Kembali ke Daftar Produk
                        </Link>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ** JSX LENGKAP: Bagian Form "Terapkan ke Semua" ** */}
                        <div className="bg-white shadow-sm sm:rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-medium mb-4">Terapkan ke Semua</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="desc" type="text" placeholder="Deskripsi" onChange={handleBulkFormChange} className="form-input rounded-md shadow-sm w-full"/>
                                <select name="seller_product_status" onChange={handleBulkFormChange} className="form-select rounded-md shadow-sm w-full">
                                    <option value="">-- Status Penjual --</option>
                                    <option value="1">Aktif</option>
                                    <option value="0">Nonaktif</option>
                                </select>
                                <select name="buyer_product_status" onChange={handleBulkFormChange} className="form-select rounded-md shadow-sm w-full">
                                    <option value="">-- Status Pembeli --</option>
                                    <option value="1">Aktif</option>
                                    <option value="0">Nonaktif</option>
                                </select>
                                <input name="commission_sell_percentage" type="number" placeholder="Komisi %" onChange={handleBulkFormChange} className="form-input rounded-md shadow-sm w-full"/>
                                <input name="commission_sell_fixed" type="number" placeholder="Komisi Tetap" onChange={handleBulkFormChange} className="form-input rounded-md shadow-sm w-full"/>
                                <input name="image" type="text" placeholder="URL Gambar" onChange={handleBulkFormChange} className="form-input rounded-md shadow-sm w-full"/>
                            </div>
                            <button type="button" onClick={applyBulkToAll} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                                Terapkan
                            </button>
                        </div>

                        {/* ** JSX LENGKAP: Bagian Tabel Form Individual ** */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komisi</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {productForms.map((form, index) => (
                                        <tr key={form.id} className={isModified(form) ? 'bg-yellow-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{form.product_name}</div>
                                                <div className="text-sm text-gray-500">{form.buyer_sku_code}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <textarea value={form.desc} onChange={(e) => handleIndividualChange(form.id, 'desc', e.target.value)} className="form-textarea rounded-md shadow-sm w-full text-sm" rows="3"/>
                                                {errors[`individual_updates.${index}.updates.desc`] && <div className="text-red-500 text-xs mt-1">{errors[`individual_updates.${index}.updates.desc`]}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select value={form.seller_product_status} onChange={(e) => handleIndividualChange(form.id, 'seller_product_status', e.target.value)} className="form-select rounded-md shadow-sm w-full text-sm mb-2">
                                                    <option value="1">Seller Aktif</option>
                                                    <option value="0">Seller Nonaktif</option>
                                                </select>
                                                <select value={form.buyer_product_status} onChange={(e) => handleIndividualChange(form.id, 'buyer_product_status', e.target.value)} className="form-select rounded-md shadow-sm w-full text-sm">
                                                    <option value="1">Buyer Aktif</option>
                                                    <option value="0">Buyer Nonaktif</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="number" step="0.01" min="0" max="99" placeholder="Komisi %" value={form.commission_sell_percentage} onChange={(e) => handleIndividualChange(form.id, 'commission_sell_percentage', e.target.value)} className="form-input rounded-md shadow-sm w-full text-sm mb-2"/>
                                                <input type="number" min="0" placeholder="Komisi Tetap" value={form.commission_sell_fixed} onChange={(e) => handleIndividualChange(form.id, 'commission_sell_fixed', e.target.value)} className="form-input rounded-md shadow-sm w-full text-sm"/>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input type="text" placeholder="URL Gambar" value={form.image} onChange={(e) => handleIndividualChange(form.id, 'image', e.target.value)} className="form-input rounded-md shadow-sm w-full text-sm"/>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}