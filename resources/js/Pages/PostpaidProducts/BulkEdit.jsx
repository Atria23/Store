// import React, { useState, useEffect } from 'react';
// import { Head, router, Link } from '@inertiajs/react';

// export default function BulkEdit({ auth, postpaidProducts, errors = {}, flash = {} }) {
//     // State untuk form "Terapkan ke Semua"
//     const [bulkForm, setBulkForm] = useState({
//         desc: "",
//         seller_product_status: "",
//         buyer_product_status: "",
//         commission_sell_percentage: "",
//         commission_sell_fixed: "",
//         image: null, // State untuk file gambar
//         imagePreview: null, // State untuk pratinjau gambar
//     });

//     const [productForms, setProductForms] = useState([]);
//     const [isProcessing, setIsProcessing] = useState(false);

//     useEffect(() => {
//         const initialForms = postpaidProducts.map(product => ({
//             id: product.id,
//             product_name: product.product_name,
//             buyer_sku_code: product.buyer_sku_code,
//             desc: product.desc || '',
//             seller_product_status: product.seller_product_status ? '1' : '0',
//             buyer_product_status: product.buyer_product_status ? '1' : '0',
//             commission_sell_percentage: product.commission_sell_percentage ?? '',
//             commission_sell_fixed: product.commission_sell_fixed ?? '',
//             image: null,
//             imagePreview: product.image ? `/storage/${product.image}` : null,
//             original: {
//                 desc: product.desc || '',
//                 seller_product_status: product.seller_product_status ? '1' : '0',
//                 buyer_product_status: product.buyer_product_status ? '1' : '0',
//                 commission_sell_percentage: product.commission_sell_percentage ?? '',
//                 commission_sell_fixed: product.commission_sell_fixed ?? '',
//                 image: null,
//             }
//         }));
//         setProductForms(initialForms);
//     }, [postpaidProducts]);

//     // Handler untuk mengubah state pada form "Terapkan ke Semua"
//     const handleBulkFormChange = (field, value) => {
//         setBulkForm(prev => ({ ...prev, [field]: value }));
//     };
    
//     // Handler KHUSUS untuk input gambar di form bulk
//     const handleBulkImageChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setBulkForm(prev => ({
//                 ...prev,
//                 image: file,
//                 imagePreview: URL.createObjectURL(file)
//             }));
//         }
//     };

//     // FUNGSI BARU: Menerapkan semua perubahan dari form bulk yang terisi
//     const applyAllBulkChanges = () => {
//         const changesToApply = {};

//         // Kumpulkan semua nilai dari bulkForm yang tidak kosong
//         if (bulkForm.desc.trim() !== "") {
//             changesToApply.desc = bulkForm.desc;
//         }
//         if (bulkForm.seller_product_status !== "") {
//             changesToApply.seller_product_status = bulkForm.seller_product_status;
//         }
//         if (bulkForm.buyer_product_status !== "") {
//             changesToApply.buyer_product_status = bulkForm.buyer_product_status;
//         }
//         if (bulkForm.commission_sell_percentage !== "") {
//             changesToApply.commission_sell_percentage = bulkForm.commission_sell_percentage;
//         }
//         if (bulkForm.commission_sell_fixed !== "") {
//             changesToApply.commission_sell_fixed = bulkForm.commission_sell_fixed;
//         }
//         if (bulkForm.image !== null) {
//             changesToApply.image = bulkForm.image;
//             changesToApply.imagePreview = bulkForm.imagePreview;
//         }

//         // Jika tidak ada yang diisi, beri tahu pengguna dan hentikan proses
//         if (Object.keys(changesToApply).length === 0) {
//             alert("Tidak ada input di form 'Terapkan ke Semua' untuk diterapkan.");
//             return;
//         }

//         // Terapkan perubahan yang telah dikumpulkan ke semua produk
//         setProductForms(prevForms =>
//             prevForms.map(form => ({
//                 ...form,
//                 ...changesToApply
//             }))
//         );

//         // TIDAK ADA ALERT DI SINI, perubahan langsung terlihat di tabel
//     };

//     const handleIndividualChange = (id, field, value) => {
//         setProductForms(prevForms =>
//             prevForms.map(form => {
//                 if (form.id === id) {
//                     const newForm = { ...form, [field]: value };
//                     if (field === 'image' && value instanceof File) {
//                         newForm.imagePreview = URL.createObjectURL(value);
//                     }
//                     return newForm;
//                 }
//                 return form;
//             })
//         );
//     };

//     const isModified = (form) => {
//         return Object.keys(form.original).some(key => {
//             if (key === 'image') {
//                 return form.image instanceof File;
//             }
//             return String(form[key]) !== String(form.original[key]);
//         });
//     };
    
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         const individual_updates = productForms
//             .filter(form => isModified(form))
//             .map(form => {
//                 const updates = {};
//                 Object.keys(form.original).forEach(key => {
//                     const originalValue = String(form.original[key]);
//                     const currentValue = String(form[key]);
//                     if (key === 'image' && form.image instanceof File) {
//                         updates.image = form.image;
//                     } else if (key !== 'image' && currentValue !== originalValue) {
//                          updates[key] = form[key];
//                     }
//                 });
                
//                 if (updates.commission_sell_percentage === "") updates.commission_sell_percentage = null;
//                 if (updates.commission_sell_fixed === "") updates.commission_sell_fixed = null;
//                 if (updates.seller_product_status !== undefined) updates.seller_product_status = updates.seller_product_status === "1";
//                 if (updates.buyer_product_status !== undefined) updates.buyer_product_status = updates.buyer_product_status === "1";
                
//                 if (updates.image === null) {
//                     delete updates.image;
//                 }

//                 if (Object.keys(updates).length > 0) {
//                     return { id: form.id, updates };
//                 }
//                 return null;
//             }).filter(Boolean);

//         if (individual_updates.length === 0) {
//             alert("Tidak ada perubahan untuk disimpan.");
//             return;
//         }
//         const idsToUpdate = individual_updates.map(update => update.id);
        
//         router.post(route('postpaid.bulk-update'), {
//             ids: idsToUpdate,
//             individual_updates: individual_updates,
//         }, {
//             onStart: () => setIsProcessing(true),
//             onFinish: () => setIsProcessing(false),
//             onSuccess: () => {},
//             onError: (errorObject) => {
//                 console.error("Update failed:", errorObject);
//                 alert("Gagal memperbarui produk. Periksa pesan error di form.");
//             },
//             preserveScroll: true,
//         });
//     };

//     const pageTitle = productForms.length > 1 ? `Bulk Edit ${productForms.length} Produk` : 'Edit Produk';

//     return (
//         <div // AuthenticatedLayout component props
//             user={auth.user}
//             header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{pageTitle}</h2>}
//         >
//             <Head title={pageTitle} />
//             <div className="py-12">
//                 <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//                     {flash.message && (
//                         <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
//                             <p>{flash.message}</p>
//                         </div>
//                     )}
//                     <div className="mb-4">
//                         <Link href={route('postpaid.index')} className="inline-flex items-center px-4 py-2 bg-gray-200 border border-transparent rounded-md font-semibold text-xs text-gray-800 uppercase tracking-widest hover:bg-gray-300 transition">
//                             &larr; Kembali ke Daftar Produk
//                         </Link>
//                     </div>
//                     <form onSubmit={handleSubmit}>
//                         {productForms.length > 1 && (
//                             <div className="p-4 bg-gray-100 rounded-lg mb-6 border border-gray-200">
//                                 <h3 className="text-lg font-medium text-gray-900 mb-4">Terapkan ke Semua</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     {/* Deskripsi */}
//                                     <div className="col-span-1 md:col-span-2">
//                                         <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
//                                         <textarea value={bulkForm.desc} onChange={(e) => handleBulkFormChange('desc', e.target.value)} className="mt-1 form-textarea block w-full rounded-md shadow-sm sm:text-sm border-gray-300" rows="3"/>
//                                     </div>
//                                     {/* Gambar */}
//                                     <div className="col-span-1">
//                                         <label className="block text-sm font-medium text-gray-700">Gambar</label>
//                                         {bulkForm.imagePreview && (
//                                             <img src={bulkForm.imagePreview} alt="Bulk Preview" className="w-20 h-20 object-cover mt-1 mb-2 rounded" />
//                                         )}
//                                         <input type="file" accept="image/*" onChange={handleBulkImageChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
//                                     </div>
//                                     {/* Status */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">Status</label>
//                                         <select value={bulkForm.seller_product_status} onChange={(e) => handleBulkFormChange('seller_product_status', e.target.value)} className="mt-1 form-select block w-full rounded-md shadow-sm sm:text-sm border-gray-300">
//                                             <option value="">Pilih Status Seller</option><option value="1">Seller Aktif</option><option value="0">Seller Nonaktif</option>
//                                         </select>
//                                         <select value={bulkForm.buyer_product_status} onChange={(e) => handleBulkFormChange('buyer_product_status', e.target.value)} className="mt-2 form-select block w-full rounded-md shadow-sm sm:text-sm border-gray-300">
//                                             <option value="">Pilih Status Buyer</option><option value="1">Buyer Aktif</option><option value="0">Buyer Nonaktif</option>
//                                         </select>
//                                     </div>
//                                     {/* Komisi */}
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700">Komisi</label>
//                                         <input type="number" step="0.01" min="0" max="99" placeholder="Komisi %" value={bulkForm.commission_sell_percentage} onChange={(e) => handleBulkFormChange('commission_sell_percentage', e.target.value)} className="mt-1 form-input block w-full rounded-md shadow-sm sm:text-sm border-gray-300"/>
//                                         <input type="number" min="0" placeholder="Komisi Tetap" value={bulkForm.commission_sell_fixed} onChange={(e) => handleBulkFormChange('commission_sell_fixed', e.target.value)} className="mt-2 form-input block w-full rounded-md shadow-sm sm:text-sm border-gray-300"/>
//                                     </div>
//                                 </div>
//                                 <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
//                                     <button
//                                         type="button"
//                                         onClick={applyAllBulkChanges}
//                                         className="inline-flex items-center px-4 py-2 bg-main border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                                     >
//                                         Terapkan Semua Perubahan Bulk
//                                     </button>
//                                 </div>
//                             </div>
//                         )}
//                         <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Komisi</th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {productForms.map((form, index) => (
//                                         <tr key={form.id} className={isModified(form) ? 'bg-yellow-50' : ''}>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm font-medium text-gray-900">{form.product_name}</div>
//                                                 <div className="text-sm text-gray-500">{form.buyer_sku_code}</div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <textarea value={form.desc} onChange={(e) => handleIndividualChange(form.id, 'desc', e.target.value)} className="form-textarea rounded-md shadow-sm w-full text-sm" rows="3"/>
//                                                 {errors[`individual_updates.${index}.updates.desc`] && <div className="text-red-500 text-xs mt-1">{errors[`individual_updates.${index}.updates.desc`]}</div>}
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <select value={form.seller_product_status} onChange={(e) => handleIndividualChange(form.id, 'seller_product_status', e.target.value)} className="form-select rounded-md shadow-sm w-full text-sm mb-2">
//                                                     <option value="1">Seller Aktif</option><option value="0">Seller Nonaktif</option>
//                                                 </select>
//                                                 <select value={form.buyer_product_status} onChange={(e) => handleIndividualChange(form.id, 'buyer_product_status', e.target.value)} className="form-select rounded-md shadow-sm w-full text-sm">
//                                                     <option value="1">Buyer Aktif</option><option value="0">Buyer Nonaktif</option>
//                                                 </select>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <input type="number" step="0.01" min="0" max="99" placeholder="Komisi %" value={form.commission_sell_percentage} onChange={(e) => handleIndividualChange(form.id, 'commission_sell_percentage', e.target.value)} className="form-input rounded-md shadow-sm w-full text-sm mb-2"/>
//                                                 <input type="number" min="0" placeholder="Komisi Tetap" value={form.commission_sell_fixed} onChange={(e) => handleIndividualChange(form.id, 'commission_sell_fixed', e.target.value)} className="form-input rounded-md shadow-sm w-full text-sm"/>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 {form.imagePreview && (
//                                                     <img src={form.imagePreview} alt="Preview" className="w-16 h-16 object-cover mb-2 rounded"/>
//                                                 )}
//                                                 <input 
//                                                     type="file" 
//                                                     accept="image/*"
//                                                     onChange={(e) => handleIndividualChange(form.id, 'image', e.target.files[0])} 
//                                                     className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
//                                                 />
//                                                 {errors[`individual_updates.${index}.updates.image`] && <div className="text-red-500 text-xs mt-1">{errors[`individual_updates.${index}.updates.image`]}</div>}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <div className="mt-6 flex justify-end">
//                             <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50" disabled={isProcessing}>
//                                 {isProcessing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }



























import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';

// Asumsi: Anda memiliki warna 'main' yang didefinisikan di tailwind.config.js
// Jika tidak, ganti 'bg-main' dengan warna standar seperti 'bg-main'

export default function BulkEdit({ auth, postpaidProducts, errors = {}, flash = {} }) {
    // State untuk form "Terapkan ke Semua"
    const [bulkForm, setBulkForm] = useState({
        desc: "",
        seller_product_status: "",
        buyer_product_status: "",
        commission_sell_percentage: "",
        commission_sell_fixed: "",
        image: null,
        imagePreview: null,
    });

    const [productForms, setProductForms] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const initialForms = postpaidProducts.map(product => ({
            id: product.id,
            product_name: product.product_name,
            buyer_sku_code: product.buyer_sku_code,
            desc: product.desc || '',
            seller_product_status: product.seller_product_status ? '1' : '0',
            buyer_product_status: product.buyer_product_status ? '1' : '0',
            commission_sell_percentage: product.commission_sell_percentage ?? '',
            commission_sell_fixed: product.commission_sell_fixed ?? '',
            image: null,
            imagePreview: product.image ? `/storage/${product.image}` : null,
            original: {
                desc: product.desc || '',
                seller_product_status: product.seller_product_status ? '1' : '0',
                buyer_product_status: product.buyer_product_status ? '1' : '0',
                commission_sell_percentage: product.commission_sell_percentage ?? '',
                commission_sell_fixed: product.commission_sell_fixed ?? '',
                image: null,
            }
        }));
        setProductForms(initialForms);
    }, [postpaidProducts]);

    const handleBulkFormChange = (field, value) => {
        setBulkForm(prev => ({ ...prev, [field]: value }));
    };
    
    const handleBulkImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBulkForm(prev => ({
                ...prev,
                image: file,
                imagePreview: URL.createObjectURL(file)
            }));
        }
    };

    const applyAllBulkChanges = () => {
        const changesToApply = {};
        if (bulkForm.desc.trim() !== "") changesToApply.desc = bulkForm.desc;
        if (bulkForm.seller_product_status !== "") changesToApply.seller_product_status = bulkForm.seller_product_status;
        if (bulkForm.buyer_product_status !== "") changesToApply.buyer_product_status = bulkForm.buyer_product_status;
        if (bulkForm.commission_sell_percentage !== "") changesToApply.commission_sell_percentage = bulkForm.commission_sell_percentage;
        if (bulkForm.commission_sell_fixed !== "") changesToApply.commission_sell_fixed = bulkForm.commission_sell_fixed;
        if (bulkForm.image !== null) {
            changesToApply.image = bulkForm.image;
            changesToApply.imagePreview = bulkForm.imagePreview;
        }

        if (Object.keys(changesToApply).length === 0) {
            alert("Tidak ada input di form 'Terapkan ke Semua' untuk diterapkan.");
            return;
        }

        setProductForms(prevForms =>
            prevForms.map(form => ({ ...form, ...changesToApply }))
        );
    };

    const handleIndividualChange = (id, field, value) => {
        setProductForms(prevForms =>
            prevForms.map(form => {
                if (form.id === id) {
                    const newForm = { ...form, [field]: value };
                    if (field === 'image' && value instanceof File) {
                        newForm.imagePreview = URL.createObjectURL(value);
                    }
                    return newForm;
                }
                return form;
            })
        );
    };

    const isModified = (form) => {
        if (form.image instanceof File) return true;
        return Object.keys(form.original).some(key =>
            key !== 'image' && String(form[key]) !== String(form.original[key])
        );
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const individual_updates = productForms
            .filter(form => isModified(form))
            .map(form => {
                const updates = {};
                Object.keys(form.original).forEach(key => {
                    if (key === 'image' && form.image instanceof File) {
                        updates.image = form.image;
                    } else if (key !== 'image' && String(form[key]) !== String(form.original[key])) {
                        updates[key] = form[key];
                    }
                });
                
                if (updates.commission_sell_percentage === "") updates.commission_sell_percentage = null;
                if (updates.commission_sell_fixed === "") updates.commission_sell_fixed = null;
                if (updates.seller_product_status !== undefined) updates.seller_product_status = updates.seller_product_status === "1";
                if (updates.buyer_product_status !== undefined) updates.buyer_product_status = updates.buyer_product_status === "1";
                
                if (updates.image === null) delete updates.image;

                if (Object.keys(updates).length > 0) {
                    return { id: form.id, updates };
                }
                return null;
            }).filter(Boolean);

        if (individual_updates.length === 0) {
            alert("Tidak ada perubahan untuk disimpan.");
            return;
        }
        
        router.post(route('postpaid.bulk-update'), {
            ids: individual_updates.map(update => update.id),
            individual_updates: individual_updates,
        }, {
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
            onError: (errors) => {
                console.error("Update failed:", errors);
                alert("Gagal memperbarui produk. Periksa pesan error di form.");
            },
            preserveScroll: true,
        });
    };

    const pageTitle = productForms.length > 1 ? `Edit Massal ${productForms.length} Produk` : 'Edit Produk';

    return (
        <>
            <Head title={pageTitle} />
            <div className="mx-auto w-full max-w-[500px] min-h-screen bg-gray-50">
                {/* === HEADER TETAP === */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main shadow-md">
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-3">
                        <Link href={route('postpaid.index')} className="shrink-0 w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </Link>
                        <div className="font-semibold text-white text-lg">
                            {pageTitle}
                        </div>
                    </div>
                </div>

                {/* Padding top untuk memberi ruang di bawah header */}
                <div className="pt-20 pb-24 px-4">
                    <form onSubmit={handleSubmit}>
                        {/* === BAGIAN TERAPKAN KE SEMUA (BULK FORM) === */}
                        {productForms.length > 1 && (
                            <div className="p-4 bg-white rounded-lg mb-6 border border-gray-200 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Terapkan ke Semua</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Deskripsi */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                        <textarea value={bulkForm.desc} onChange={(e) => handleBulkFormChange('desc', e.target.value)} className="form-textarea block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500" rows="3"/>
                                    </div>
                                    {/* Status */}
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Seller</label>
                                            <select value={bulkForm.seller_product_status} onChange={(e) => handleBulkFormChange('seller_product_status', e.target.value)} className="form-select block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Pilih</option><option value="1">Aktif</option><option value="0">Nonaktif</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Buyer</label>
                                            <select value={bulkForm.buyer_product_status} onChange={(e) => handleBulkFormChange('buyer_product_status', e.target.value)} className="form-select block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                                <option value="">Pilih</option><option value="1">Aktif</option><option value="0">Nonaktif</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Komisi */}
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Komisi %</label>
                                            <input type="number" step="0.01" min="0" max="99" placeholder="0.00" value={bulkForm.commission_sell_percentage} onChange={(e) => handleBulkFormChange('commission_sell_percentage', e.target.value)} className="form-input block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Komisi Tetap</label>
                                            <input type="number" min="0" placeholder="0" value={bulkForm.commission_sell_fixed} onChange={(e) => handleBulkFormChange('commission_sell_fixed', e.target.value)} className="form-input block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"/>
                                        </div>
                                    </div>
                                    {/* Gambar */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
                                        {bulkForm.imagePreview && <img src={bulkForm.imagePreview} alt="Preview" className="w-20 h-20 object-cover mt-1 mb-2 rounded" />}
                                        <input type="file" accept="image/*" onChange={handleBulkImageChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                    <button type="button" onClick={applyAllBulkChanges} className="w-full text-center px-4 py-2 bg-main border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700">
                                        Terapkan Perubahan Ini ke Semua
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* === DAFTAR PRODUK (CARD VIEW) === */}
                        <div className="space-y-4">
                            {productForms.map((form, index) => (
                                <div key={form.id} className={`p-4 bg-white rounded-lg border shadow-sm ${isModified(form) ? 'border-yellow-400' : 'border-gray-200'}`}>
                                    {/* Info Produk (Tidak bisa diedit) */}
                                    <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
                                        <img
                                            src={form.imagePreview || "/storage/brands/default.webp"}
                                            alt={form.product_name}
                                            className="aspect-square w-12 h-12 rounded-lg object-cover bg-gray-100"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-gray-800">{form.product_name}</p>
                                            <p className="text-xs text-gray-500">{form.buyer_sku_code}</p>
                                        </div>
                                    </div>

                                    {/* Form Edit Individual */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                            <textarea value={form.desc} onChange={(e) => handleIndividualChange(form.id, 'desc', e.target.value)} className="form-textarea block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500" rows="3"/>
                                            {errors[`individual_updates.${index}.updates.desc`] && <div className="text-red-500 text-xs mt-1">{errors[`individual_updates.${index}.updates.desc`]}</div>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Seller</label>
                                                <select value={form.seller_product_status} onChange={(e) => handleIndividualChange(form.id, 'seller_product_status', e.target.value)} className="form-select block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                                    <option value="1">Aktif</option><option value="0">Nonaktif</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Buyer</label>
                                                <select value={form.buyer_product_status} onChange={(e) => handleIndividualChange(form.id, 'buyer_product_status', e.target.value)} className="form-select block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                                                    <option value="1">Aktif</option><option value="0">Nonaktif</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Komisi %</label>
                                                <input type="number" step="0.01" min="0" max="99" placeholder="0.00" value={form.commission_sell_percentage} onChange={(e) => handleIndividualChange(form.id, 'commission_sell_percentage', e.target.value)} className="form-input block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Komisi Tetap</label>
                                                <input type="number" min="0" placeholder="0" value={form.commission_sell_fixed} onChange={(e) => handleIndividualChange(form.id, 'commission_sell_fixed', e.target.value)} className="form-input block w-full rounded-md shadow-sm sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500"/>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ganti Gambar</label>
                                            <input type="file" accept="image/*" onChange={(e) => handleIndividualChange(form.id, 'image', e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                                            {errors[`individual_updates.${index}.updates.image`] && <div className="text-red-500 text-xs mt-1">{errors[`individual_updates.${index}.updates.image`]}</div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* === TOMBOL SIMPAN TETAP DI BAWAH === */}
                        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] p-4 bg-white border-t border-gray-200">
                            <button type="submit" className="w-full px-6 py-3 bg-main text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isProcessing}>
                                {isProcessing ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}