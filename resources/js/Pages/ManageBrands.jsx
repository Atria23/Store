import { useState } from "react";
import { useForm } from "@inertiajs/react";

export default function ManageBrands({ brands, categories, inputTypes }) {
    const [showModal, setShowModal] = useState(false);
    const [editBrand, setEditBrand] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [errors, setErrors] = useState({});
    const [searchCategory, setSearchCategory] = useState("");
    const [searchInputType, setSearchInputType] = useState("");
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [showInputTypePopup, setShowInputTypePopup] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedBrandId, setSelectedBrandId] = useState(null);

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchCategory.toLowerCase())
    );

    const filteredInputTypes = inputTypes.filter(type =>
        type.name.toLowerCase().includes(searchInputType.toLowerCase())
    );

    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        id: "",
        name: "",
        image: null,
        category_id: "",
        input_type_id: "",
        profit_persen: "",
        profit_tetap: "",
    });

    // 🔹 Handle Submit (Tambah & Edit)
    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({}); // Reset error


        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("category_id", data.category_id);
        formData.append("input_type_id", data.input_type_id);
        formData.append("profit_persen", data.profit_persen);
        formData.append("profit_tetap", data.profit_tetap);


        if (data.image) {
            formData.append("image", data.image);
        }

        if (editBrand) {
            post(route("brands.update", data.id), {
                data: formData,
                onSuccess: () => {
                    reset();
                    setPreviewImage(null);
                    setEditBrand(null);
                    setTimeout(() => setShowModal(false), 300); // Auto-close modal after update
                },
                onError: (err) => {
                    setErrors(err); // Menyimpan error ke state
                },
            });
        } else {
            post(route("brands.store"), {
                data: formData,
                onSuccess: () => {
                    reset();
                    setPreviewImage(null);
                    setTimeout(() => setShowModal(false), 300); // Auto-close modal after insert
                },
                onError: (err) => {
                    setErrors(err); // Menyimpan error ke state
                },
            });
        }

    };


    // 🔹 Handle Edit
    const handleEdit = (brand) => {
        setEditBrand(brand);
        setData({
            id: brand.id,
            name: brand.name,
            image: null,
            category_id: brand.category_id,
            input_type_id: brand.input_type_id,
            profit_persen: brand.profit_persen,
            profit_tetap: brand.profit_tetap,
        });
        setPreviewImage(brand.image);
        setShowModal(true);
    };

    // 🔹 Handle Ganti Gambar
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // 🔹 Handle Delete
    // const handleDelete = (id) => {
    //     if (confirm("Yakin ingin menghapus brand ini?")) {
    //         destroy(route("brands.destroy", id));
    //     }
    // };

    const confirmDelete = (brandId) => {
        setSelectedBrandId(brandId);
        setIsPopupOpen(true);
    };

    const handleDelete = (id) => {
        setIsPopupOpen(false); // Tutup pop-up setelah user konfirmasi
        destroy(route("brands.destroy", id));
    };




    const sortedBrands = [...filteredBrands].sort((a, b) =>
        sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    );


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
                            Kelola Brand
                        </div>
                    </div>
                    {/* Plus Icon */}
                    <button
                        onClick={() => {
                            setEditBrand(null);
                            reset();
                            setPreviewImage(null);
                            setShowModal(true);
                        }}
                        className="flex items-center w-6 h-6">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8" />
                            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z" />
                        </svg>
                    </button>
                </div>
                {/* Search & Filter */}
                <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                        {/* Search Bar */}
                        <input
                            id="searchInput"
                            type="text"
                            className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                            placeholder="Cari brand"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Search Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="0.3"  // Ubah ketebalan stroke di sini
                            className="w-5 h-5 text-main"
                        >
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                        </svg>
                    </div>
                    {/* Sorting & Filter */}
                    <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                        {/* Sort Button */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
                        >
                            {sortOrder === "asc" ? (
                                // Ikon A-Z (urutan naik)
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="w-4 h-4 text-main"
                                >
                                    <path fillRule="evenodd" d="M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371zm1.57-.785L11 2.687h-.047l-.652 2.157z" />
                                    <path d="M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293z" />
                                </svg>
                            ) : (
                                // Ikon Z-A (urutan turun)
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="w-4 h-4 text-main"
                                >
                                    <path d="M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645z" />
                                    <path fillRule="evenodd" d="M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371zm1.57-.785L11 9.688h-.047l-.652 2.156z" />
                                    <path d="M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293z" />
                                </svg>
                            )}
                            <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">
                                Urutkan
                            </span>
                        </button>

                        <div className="shrink-0 w-8 text-main">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1"
                                className="w-full h-full"
                            >
                                <line x1="12" y1="4" x2="12" y2="20" />
                            </svg>
                        </div>
                        {/* Filter Button */}
                        <button className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="w-4 h-4 text-main"
                            >
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                            </svg>
                            <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">Filter</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mb-4 min-h-[756px] pt-[163px] bg-white">
                <div className="mb-4 min-h-[756px] bg-white">
                    {filteredBrands.length > 0 ? (
                        [...filteredBrands]
                            .filter((brand) => brand.name.toLowerCase().includes(searchTerm.toLowerCase())) // 🔍 Search Filter
                            .sort((a, b) => (sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))) // 🔀 Sorting
                            .map((brand) => (
                                <div
                                    key={brand.id}
                                    className="flex justify-between items-center p-4 border-b-2 border-b-neutral-100"
                                >

                                    <div className="w-full h-max flex items-center space-x-3 content-start">
                                        <div className="w-13 h-13 space-x-2 flex items-center justify center p-1 rounded-xl bg-white shadow">
                                            <img
                                                src={brand.image || "storage/categories/default.png"}
                                                alt={brand.name}
                                                className="w-10 h-10 rounded-xl object-cover"
                                            />
                                        </div>

                                        <div className="max-w-[200px] flex flex-col items-start space-y-[2px]">
                                            <p className="font-utama font-semibold text-sm truncate w-full">{brand.name}</p>
                                            <p className="font-utama text-xs text-gray-500">{categories.find(cat => cat.id === brand.category_id)?.name || "Tidak ada kategori"} / {inputTypes.find(type => type.id === brand.input_type_id)?.name || "Tidak ada tipe input"}</p>
                                            <div className="w-[200px] h-max px-2 py-[2px] text-xs text-green-600 rounded-3xl bg-green-50 border border-green-600 flex items-center justify-center">
                                                {brand.profit_persen}% + Rp{brand.profit_tetap}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="w-12 h-full flex flex-col items-center space-y-2">
                                        <button
                                            onClick={() => handleEdit(brand)}
                                            className="w-full h-max px-2 py-[2px] text-xs text-main rounded-3xl bg-blue-50 border border-main flex items-center justify-center"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(brand.id)}
                                            disabled={brand.is_used}
                                            className={`w-full h-max px-2 py-[2px] text-xs rounded-3xl flex items-center justify-center ${brand.is_used
                                                    ? "text-gray-400 bg-gray-50 border border-gray-400 cursor-not-allowed"
                                                    : "text-red-600 bg-red-50 border border-red-600"
                                                }`}
                                        >
                                            Hapus
                                        </button>


                                    </div>

                                </div>
                            ))
                    ) : (
                        <p className="p-4 text-center">Brand tidak ditemukan</p>
                    )}
                </div>
            </div>

            {isPopupOpen && (
    <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
            <p className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                Yakin ingin menghapus brand ini?
            </p>
            <div className="w-full h-max flex flex-row space-x-2">
                <button
                    onClick={() => handleDelete(selectedBrandId)}
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




            {/* 🔹 MODAL FORM */}
            {showModal && (
                <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                        <div className="w-full h-max flex flex-col">
                            {/* Ikon silang di kanan atas */}
                            <button
                                className="w-full flex items-end justify-end"
                                onClick={() => {
                                    setShowModal(false);
                                    setErrors({}); // Menghapus error saat modal ditutup
                                }}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="w-7 h-7 text-red-500"
                                >
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                </svg>
                            </button>
                            {/* Judul di tengah */}
                            <h2 className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                                {editBrand ? "Edit Brand" : "Tambah Brand"}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                                <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                                    <label className="w-20 h-20 rounded-full cursor-pointer overflow-hidden relative border-2 border-gray-200">
                                        {/* Input file transparan di atas lingkaran */}
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {/* Preview gambar atau placeholder */}
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                                                Pilih Gambar
                                            </span>
                                        )}
                                    </label>
                                    {/* Error message */}
                                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                                    <p className="w-full h-max text-utama font-medium text-sm text-center align-middle">Gambar Brand</p>
                                </div>
                                <div className="w-[294px] h-max flex flex-col space-y-2">
                                    <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Nama Brand</p>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            placeholder="Contoh: Mobile Legends"
                                            required
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-red-600 text-sm">{errors.name}</p>
                                    )}

                                    <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Kategori</p>
                                    <div className="relative w-full">
                                        <div
                                            className="flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer"
                                            onClick={() => setShowCategoryPopup(true)}
                                        >
                                            <span>
                                                {categories.find(cat => cat.id === data.category_id)?.name || "Pilih kategori"}
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
                                        {showCategoryPopup && (
                                            <div className="fixed z-30 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                                                <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                                                        {/* Search Bar */}
                                                        <input
                                                            id="searchInput"
                                                            type="text"
                                                            className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                            placeholder="Cari kategori"
                                                            value={searchCategory}
                                                            onChange={(e) => setSearchCategory(e.target.value)}
                                                        />
                                                        {/* Search Icon */}
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            stroke="currentColor"
                                                            strokeWidth="0.3"  // Ubah ketebalan stroke di sini
                                                            className="w-5 h-5 text-main"
                                                        >
                                                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                                                        </svg>
                                                    </div>

                                                    <div className="w-full max-h-[342px] flex flex-col items-start justify-start overflow-y-auto">
                                                        {categories
                                                            .filter(cat => cat.name.toLowerCase().includes(searchCategory.toLowerCase()))
                                                            .map((cat) => (
                                                                <div
                                                                    key={cat.id}
                                                                    className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer"
                                                                    onClick={() => {
                                                                        setData("category_id", cat.id);
                                                                        setShowCategoryPopup(false);
                                                                    }}
                                                                >
                                                                    {/* Gambar kategori di sebelah kiri */}
                                                                    <img
                                                                        src={cat.image ? `/storage/${cat.image}` : "storage/categories/default.png"}
                                                                        alt={cat.name}
                                                                        className="w-8 h-8 border border-gray-300 rounded-full object-cover"
                                                                    />
                                                                    <p className="text-utama text-sm text-left align-middle">{cat.name}</p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                    <button
                                                        onClick={() => setShowCategoryPopup(false)}
                                                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"                                                    >
                                                        Tutup
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Tipe Input</p>
                                    <div className="relative w-full">
                                        <div
                                            className="flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer"
                                            onClick={() => setShowInputTypePopup(true)}
                                        >
                                            <span>
                                                {inputTypes.find(type => type.id === data.input_type_id)?.name || "Pilih tipe input"}
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
                                        {showInputTypePopup && (
                                            <div className="fixed z-30 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                                                <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                                                    {/* Search Bar */}
                                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                                                        <input
                                                            id="searchInput"
                                                            type="text"
                                                            className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                            placeholder="Cari Input Type..."
                                                            value={searchInputType}
                                                            onChange={(e) => setSearchInputType(e.target.value)}
                                                        />
                                                        {/* Search Icon */}
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            stroke="currentColor"
                                                            strokeWidth="0.3"
                                                            className="w-5 h-5 text-main"
                                                        >
                                                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                                                        </svg>
                                                    </div>

                                                    {/* List Input Types */}
                                                    <div className="w-full max-h-[342px] flex flex-col items-start justify-start overflow-y-auto">
                                                        {inputTypes
                                                            .filter(type => type.name.toLowerCase().includes(searchInputType.toLowerCase()))
                                                            .map((type) => (
                                                                <div
                                                                    key={type.id}
                                                                    className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer"
                                                                    onClick={() => {
                                                                        setData("input_type_id", type.id);
                                                                        setShowInputTypePopup(false);
                                                                    }}
                                                                >
                                                                    <p className="text-utama text-sm text-left align-middle">{type.name}</p>
                                                                </div>
                                                            ))}
                                                    </div>

                                                    {/* Tombol Tutup */}
                                                    <button
                                                        onClick={() => setShowInputTypePopup(false)}
                                                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                                                    >
                                                        Tutup
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Profit Persen</p>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            type="text"
                                            name="name"
                                            value={data.profit_persen}
                                            onChange={(e) => setData("profit_persen", e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            placeholder="Contoh: 2.5"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-red-600 text-sm">{errors.name}</p>
                                    )}

                                    <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Profit Tetap</p>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        {/* Search Bar */}
                                        <input
                                            type="text"
                                            name="name"
                                            value={data.profit_tetap}
                                            onChange={(e) => setData("profit_tetap", e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            placeholder="Contoh: 1000"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-red-600 text-sm">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                <button
                                    type="submit"
                                    disabled={processing || !data.name || !data.category_id || !data.input_type_id}
                                    className={`w-full p-2 rounded transition ${processing || !data.name || !data.category_id || !data.input_type_id
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                        }`}
                                >
                                    {editBrand ? "Update" : "Tambah"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}