import { useState, useEffect } from "react";
import { router, useForm } from "@inertiajs/react";
import PopupSelect from "@/Components/PopupSelect";

export default function AddProduct({ product, categories, brands, types, input_types }) {
    const isEdit = !!product; // Cek apakah sedang edit atau tambah
    const [showBrandPopup, setShowBrandPopup] = useState(false);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [showTypePopup, setShowTypePopup] = useState(false);
    const [showInputTypePopup, setShowInputTypePopup] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const handleDeleteClick = (id) => {
        setSelectedProductId(id);
        setIsPopupOpen(true);
    };

    const handleDelete = () => {
        if (selectedProductId) {
            router.delete(route("product.destroy", selectedProductId));
            setIsPopupOpen(false);
        }
    };

    const { data, setData, post, put, processing, errors } = useForm({
        buyer_sku_code: product?.buyer_sku_code || "",
        product_name: product?.product_name || "",
        category_id: product?.category_id || "",
        brand_id: product?.brand_id || "",
        type_id: product?.type_id || "",
        input_type_id: product?.input_type_id || "",
        price: product?.price || "",
        sell_price: product?.sell_price || "",
        buyer_product_status: product?.buyer_product_status ?? true,
        seller_product_status: product?.seller_product_status ?? true,
        unlimited_stock: product?.unlimited_stock ?? true,
        stock: product?.stock || "",
        multi: product?.multi ?? true,
        start_cut_off: product?.start_cut_off || "0:0",
        end_cut_off: product?.end_cut_off || "0:0",
        desc: product?.desc || "",
        seller_name: product?.seller_name || "Muvausa Store",
    });

    useEffect(() => {
        if (data.category_id !== product?.category_id) {
            setData(prev => ({ ...prev, brand_id: null, type_id: null }));
        }
    }, [data.category_id]);
    
    useEffect(() => {
        if (data.brand_id !== product?.brand_id) {
            setData(prev => ({ ...prev, type_id: null }));
        }
    }, [data.brand_id]);
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEdit) {
            post(route("product.update", product.id)); // Mode Edit
        } else {
            post(route("product.store")); // Mode Tambah
        }
    };

    const [displayValue, setDisplayValue] = useState("");

    // Format angka ke Rupiah (Rp100.000 tanpa spasi setelah "Rp")
    const formatRupiah = (value) => {
        if (!value) return "Rp0";
        return "Rp" + parseInt(value, 10).toLocaleString("id-ID").replace(/,/g, ".");
    };

    // Sinkronkan tampilan dengan state utama
    useEffect(() => {
        setDisplayValue(formatRupiah(data.price));
    }, [data.price]);

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, ""); // Hanya angka
        setData("price", rawValue);
    };

    return (
        <div className="mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen">
            <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[412px] w-full z-10 bg-main">
                {/* Header */}
                <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    {/* Left Section (Back Icon + Title) */}
                    <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                        {/* Back Icon */}
                        <button
                            className="shrink-0 w-6 h-6"
                            onClick={() => window.history.back()}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        {/* Title */}
                        <div className="font-utama text-white font-bold text-lg">
                            {isEdit ? "Edit Produk" : "Tambah Produk"}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mb-4 min-h-[756px] pt-[60px] bg-white">
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-[380px] h-max flex flex-col space-y-4 mb-6">

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">Nama Produk (Wajib Hukumnya)</label>
                                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Contoh: Pulsa Transfer XL 100.000"
                                        value={data.product_name}
                                        onChange={(e) => setData("product_name", e.target.value)}
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                        required
                                    />
                                    {errors.product_name && <p className="text-red-500">{errors.product_name}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">Kode SKU (Wajib Hukumnya)</label>
                                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Contoh: xl100"
                                        value={data.buyer_sku_code}
                                        onChange={(e) => setData("buyer_sku_code", e.target.value)}
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                        required
                                    />
                                    {errors.buyer_sku_code && <p className="text-red-500">{errors.buyer_sku_code}</p>}
                                </div>
                            </div>

                            {/* Pilih Kategori */}
                            <div className="relative w-full">
                                <label className="w-full h-max text-gray-700 text-left align-middle">Kategori (Wajib Hukumnya)</label>
                                <div
                                    className="flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer"
                                    onClick={() => setShowCategoryPopup(true)}
                                >
                                    <span>
                                        {data.category_id ? categories.find(cat => cat.id === data.category_id)?.name : "Pilih Kategori"}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-gray-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </div>
                            </div>

                            {/* Pilih Brand */}
                            <div className="relative w-full">
                                <label className="w-full h-max text-gray-700 text-left align-middle">Brand (Wajib Hukumnya)</label>
                                <div
                                    className={`flex items-center justify-between w-full h-10 px-4 py-2 border rounded-md cursor-pointer 
                                        ${!data.category_id ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700"}`}
                                    onClick={() => data.category_id && setShowBrandPopup(true)}
                                >

                                    <span>
                                        {data.brand_id 
                                            ? brands.find(brand => brand.id === data.brand_id)?.name.split(" - ")[0] 
                                            : "Pilih Brand"}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-gray-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </div>
                            </div>

                            {/* Pilih Type */}
                            <div className="relative w-full">
                                <label className="w-full h-max text-gray-700 text-left align-middle">Tipe (Wajib Hukumnya)</label>
                                <div
                                    className={`flex items-center justify-between w-full h-10 px-4 py-2 border rounded-md cursor-pointer 
                                        ${!data.brand_id ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700"}`}
                                    onClick={() => data.brand_id && setShowTypePopup(true)}
                                >
                                    <span>
                                        {data.type_id 
                                            ? types.find(type => type.id === data.type_id)?.name.split(" - ")[0] 
                                            : "Pilih Type"}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-gray-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </div>
                            </div>

                            {/* Pilih Input Type */}
                            <div className="relative w-full">
                                <label className="w-full h-max text-gray-700 text-left align-middle">Tipe Input</label>
                                <div
                                    className="flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer"
                                    onClick={() => setShowInputTypePopup(true)}
                                >
                                    <span>
                                        {data.input_type_id ? input_types.find(it => it.id === data.input_type_id)?.name : "Pilih Jenis Input"}
                                    </span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-gray-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M6 9l6 6 6-6"></path>
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">Harga (Wajib Hukumnya)</label>
                                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Contoh: xl100"
                                        value={displayValue}
                                        onChange={handleChange} // Tetap pakai ini
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                        required
                                    />
                                    {errors.price && <p className="text-red-500">{errors.price}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">Harga Jual (Hanya Lihat)</label>
                                <div className="flex items-center justify-between w-full h-10 bg-white border border-gray-300 rounded-md">
                                    <input
                                        type="text"
                                        placeholder="Contoh: xl100"
                                        value={`Rp${Math.ceil(data.sell_price || 0).toLocaleString('id-ID')}`}
                                        readOnly
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                    />
                                    {errors.price && <p className="text-red-500">{errors.price}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-32 text-gray-700 text-left align-middle">Deskripsi</label>
                                <div className="w-full flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <textarea
                                        type="text"
                                        placeholder="Contoh: paket lama wajib diunreg terlebih dahulu"
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                        value={data.desc}
                                        onChange={(e) => setData("desc", e.target.value)}
                                    ></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">Start Cut Off</label>
                                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Contoh: xl100"
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                        value={data.start_cut_off}
                                        onChange={(e) => setData("start_cut_off", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">End Cut Off</label>
                                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Contoh: xl100"
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                        value={data.end_cut_off}
                                        onChange={(e) => setData("end_cut_off", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="w-full h-max text-gray-700 text-left align-middle">Stok</label>
                                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        placeholder="Contoh: 100"
                                        className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400 disabled:text-gray-500"
                                        value={data.unlimited_stock ? "Unlimited" : data.stock}
                                        onChange={(e) => setData("stock", e.target.value)}
                                        disabled={data.unlimited_stock}
                                    />
                                    {errors.stock && <p className="text-red-500">{errors.stock}</p>}
                                </div>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        id="unlimitedStock"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked={data.unlimited_stock}
                                        onChange={(e) => setData("unlimited_stock", e.target.checked)}
                                    />
                                    <label htmlFor="unlimitedStock" className="ml-2 text-gray-700 text-sm">
                                        Unlimited Stok
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">

                                <label className="flex items-center gap-2 px-3 py-2 bg-neutral-100 border-2 border-gray-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-300 rounded"
                                        checked={data.multi}
                                        onChange={(e) => setData("multi", e.target.checked)}
                                    />
                                    <span className="text-gray-700 text-sm">Multi</span>
                                </label>

                                <label className="flex items-center gap-2 px-3 py-2 bg-neutral-100 border-2 border-gray-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-300 rounded"
                                        checked={data.seller_product_status}
                                        onChange={(e) => setData("seller_product_status", e.target.checked)}
                                    />
                                    <span className="text-gray-700 text-sm">Seller Product Status</span>
                                </label>

                                <label className="flex items-center gap-2 px-3 py-2 bg-neutral-100 border-2 border-gray-200 rounded-lg">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring focus:ring-blue-300 rounded"
                                        checked={data.buyer_product_status}
                                        onChange={(e) => setData("buyer_product_status", e.target.checked)}
                                    />
                                    <span className="text-gray-700 text-sm">Buyer Product Status</span>
                                </label>
                            </div>
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded text-white ${processing || !data.category_id || !data.brand_id || !data.type_id || !data.buyer_sku_code || !data.price || !data.product_name
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600"
                                    }`}
                                disabled={processing || !data.category_id || !data.brand_id || !data.type_id || !data.buyer_sku_code || !data.price || !data.product_name}
                            >
                                {processing ? "Processing..." : isEdit ? "Update Produk" : "Tambah Produk"}
                            </button>
                            {isEdit && (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteClick(product.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Hapus Produk
                                </button>
                            )}
                        </div>
                    </div>


                    {isPopupOpen && (
                        <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                            <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                                <p className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                                    Yakin ingin menghapus produk ini?
                                </p>
                                <div className="w-full h-max flex flex-row space-x-2">
                                    <button
                                        onClick={handleDelete}
                                        className="w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                        Ya
                                    </button>
                                    <button
                                        onClick={() => setIsPopupOpen(false)}
                                        className="w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-main rounded-md hover:bg-blue-700"
                                    >
                                        Tidak
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Popups */}
                    <PopupSelect show={showCategoryPopup} setShow={setShowCategoryPopup} title="Kategori" options={categories} selectedId={null} setData={setData} dataKey="category_id" />
                    <PopupSelect show={showBrandPopup} setShow={setShowBrandPopup} title="Brand" options={brands} selectedId={data.category_id} setData={setData} dataKey="brand_id" filterKey="category_id" />
                    <PopupSelect show={showTypePopup} setShow={setShowTypePopup} title="Type" options={types} selectedId={data.brand_id} setData={setData} dataKey="type_id" filterKey="brand_id" />
                    <PopupSelect show={showInputTypePopup} setShow={setShowInputTypePopup} title="Jenis Input" options={input_types} selectedId={null} setData={setData} dataKey="input_type_id" />
                </form>
            </div>
        </div>
    );
}
