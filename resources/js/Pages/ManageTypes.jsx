import React, { useState, useEffect, useRef } from "react";
import { useForm, router } from "@inertiajs/react";

export default function ManageTypes({ types = [], brands = [], categories = [], inputTypes = [] }) {
    const [showModal, setShowModal] = useState(false);
    const [editType, setEditType] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [showBrandPopup, setShowBrandPopup] = useState(false);
    const [showCategoryPopup, setShowCategoryPopup] = useState(false);
    const [showInputTypePopup, setShowInputTypePopup] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchBrand, setSearchBrand] = useState("");
    const [searchCategory, setSearchCategory] = useState("");
    const [searchInputType, setSearchInputType] = useState("");
    const [previewExampleImage, setPreviewExampleImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [showModalBulk, setShowModalBulk] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkEditData, setBulkEditData] = useState({});
    const [categorySearch, setCategorySearch] = useState("");
    const [showCategoryOptions, setShowCategoryOptions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const categoryRef = useRef(null);

    const [inputTypeSearch, setInputTypeSearch] = useState("");
    const [showInputTypeOptions, setShowInputTypeOptions] = useState(false);
    const [selectedInputType, setSelectedInputType] = useState(null);
    const inputTypeRef = useRef(null);

    // filteredTypes adalah data hasil filter pencarian kamu
    // const filteredTypes = types.filter(...)
    const [selectedBrands, setSelectedBrands] = useState([]);

    const handleSelectBrand = (brandId) => {
        setSelectedBrands(prev =>
            prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
        );

        setSelectedIds(prev =>
            prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
        );
    };

    // Fungsi toggle semua checkbox
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTypes.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTypes.map((type) => type.id));
        }
    };

    // Fungsi saat nilai input diubah (profit, category, input type)
    const handleBulkEditChange = (field, value) => {
        setBulkEditData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Submit edit massal
    const handleBulkEditSubmit = () => {
        if (selectedIds.length === 0) {
            toast.error("Pilih minimal satu tipe untuk diubah.");
            return;
        }

        router.post(route("types.bulk-update"), {
            ids: selectedIds,
            ...bulkEditData,
        }, {
            onSuccess: () => {
                setShowModalBulk(false);
                setSelectedIds([]);
                setBulkEditData({});
                setSelectedCategory(null);
                setSelectedInputType(null);
                setCategorySearch("");
                setInputTypeSearch("");
                toast.success("Berhasil mengubah tipe secara massal");
            },
            onError: () => {
                toast.error("Gagal melakukan edit massal");
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setShowCategoryOptions(false);
            }
            if (inputTypeRef.current && !inputTypeRef.current.contains(event.target)) {
                setShowInputTypeOptions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredTypes = types.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { data, setData, post, processing, reset, delete: destroy } = useForm({
        id: "",
        name: "",
        brand_id: "",
        category_id: "",
        input_type_id: "",
        profit_persen: "",
        profit_tetap: "",
        example_id_product: "",
        example_image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("brand_id", data.brand_id);
        formData.append("category_id", data.category_id ?? "");
        formData.append("input_type_id", data.input_type_id ?? "");
        formData.append("profit_persen", data.profit_persen ?? "");
        formData.append("profit_tetap", data.profit_tetap ?? "");
        formData.append("example_id_product", data.example_id_product);
        if (data.example_image) {
            formData.append("example_image", data.example_image);
        }

        if (editType) {
            post(route("types.update", data.id), {
                data: formData,
                onSuccess: () => {
                    reset();
                    setEditType(null);
                    setShowModal(false);
                },
                onError: (err) => setErrors(err),
            });
        } else {
            post(route("types.store"), {
                data: formData,
                onSuccess: () => {
                    reset();
                    setEditType(null);
                    setShowModal(false);
                },
                onError: (err) => setErrors(err),
            });
        }
    };

    const handleExampleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("example_image", file);
            setPreviewExampleImage(URL.createObjectURL(file));
        }
    };

    // 🔹 Handle Edit
    const handleEdit = (type) => {
        setEditType(type);
        setData({
            id: type.id,
            name: type.name.split(" - ")[0],
            brand_id: type.brand_id,
            category_id: type.category_id,
            input_type_id: type.input_type_id,
            profit_persen: type.profit_persen,
            profit_tetap: type.profit_tetap,
            example_id_product: type.example_id_product,
            example_image: type.example_image,
        });
        setPreviewImage(type.image);
        setPreviewExampleImage(type.example_image);
        setShowModal(true);
    };

    // 🔹 Hapus Type
    const confirmDelete = (typeId) => {
        setSelectedTypeId(typeId);
        setIsPopupOpen(true);
    };

    const handleDelete = (id) => {
        setIsPopupOpen(false);
        destroy(route("types.destroy", id));
    };

    useEffect(() => {
        // Reset brand_id hanya jika category_id berubah
        if (data.category_id && !brands.some(bra => bra.id === data.brand_id && bra.category_id === data.category_id)) {
            setData("brand_id", null);
        }
    }, [data.category_id, brands]);

    const handleSync = () => {
        router.get(route("types.sync"), {}, {
            onSuccess: (page) => {
                alert(page.props.flash.message || "Sinkronisasi berhasil!");
            },
            onError: (errors) => {
                console.error("Gagal sinkronisasi:", errors);
                alert("Gagal melakukan sinkronisasi.");
            }
        });
    };

    return (
        <>
            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
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
                                Kelola Tipe
                            </div>
                        </div>
                        <button
                            onClick={handleSync}
                            className="flex items-center w-6 h-6"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-6 h-6 text-white">
                                <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9" />
                                <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z" />
                            </svg>
                        </button>
                        {/* Plus Icon */}
                        <button
                            onClick={() => {
                                setEditType(null);
                                reset();
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
                                placeholder="Cari tipe"
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
                        {selectedIds.length > 0 && (
                            <>
                                <div className="w-full border-b border-gray-400 mb-[200px]"></div>
                                <div className="w-full flex flex-col space-y-3">
                                    <div className="w-full flex flex-row items-center justify-between">
                                        <div className="w-max flex items-center justify-start space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === filteredTypes.length && filteredTypes.length > 0}
                                                onChange={toggleSelectAll}
                                                className="accent-main w-4 h-4"
                                            />
                                            <label className="text-sm text-gray-700">Pilih Semua</label>
                                        </div>
                                        <div className="w-max flex items-center space-x-2 justify-end">
                                            <p className="text-sm text-gray-700">{selectedIds.length} tipe dipilih</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowModalBulk(true)}
                                        className="text-sm px-3 py-1.5 bg-main text-white rounded-md hover:bg-blue-700 transition"
                                    >
                                        Edit Massal
                                    </button>
                                </div>
                            </>
                        )}

                    </div>
                </div>

                {selectedIds.length > 0 && (
                    <>
                        <div className="mb-[100px]"></div>
                    </>
                )}

                <div className="mb-4 min-h-[756px] pt-[163px] bg-white">
                    <div className="mb-4 min-h-[756px] bg-white">
                        {filteredTypes.length > 0 ? (
                            [...filteredTypes]
                                .filter((type) => type.name.toLowerCase().includes(searchTerm.toLowerCase())) // 🔍 Search Filter
                                .sort((a, b) => (sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name))) // 🔀 Sorting
                                .map((type) => (
                                    <div
                                        key={type.id}
                                        className="flex space-x-2 justify-between items-center p-4 border-b-2 border-b-neutral-100"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(type.id)}
                                            onChange={() => handleSelectBrand(type.id)}
                                            className="accent-main w-4 h-4"
                                        />

                                        <div className="w-full h-max flex items-center space-x-3 content-start">
                                            <div className="w-13 h-13 space-x-2 flex items-center justify center p-1 rounded-xl bg-white shadow">
                                                <img
                                                    src={type.image || "storage/brands/default.webp"}
                                                    alt={type.name}
                                                    className="w-10 h-10 rounded-xl object-cover"
                                                />
                                            </div>

                                            <div className="max-w-[200px] flex flex-col items-start space-y-[2px]">
                                                <p className="font-utama font-semibold text-sm truncate w-full">{type.name}</p>
                                                <p className="font-utama text-xs">{type.brand_name || "Tidak ada brand"}</p>
                                                <p className="font-utama text-xs text-gray-500">{type.category_name || "Tidak ada kategori"} / {type.input_type_name || "-"}</p>
                                                {(type.profit_persen || type.profit_tetap) && (
                                                    <div className="w-[180px] h-max px-2 py-[2px] text-xs text-green-600 rounded-3xl bg-green-50 border border-green-600 flex items-center justify-center">
                                                        {type.profit_persen ? `${parseFloat(type.profit_persen).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : ""}        {type.profit_persen && type.profit_tetap ? " + " : ""}
                                                        {type.profit_tetap ? `Rp${parseFloat(type.profit_tetap).toLocaleString('id-ID', { maximumFractionDigits: 0 })}` : ""}
                                                    </div>
                                                )}

                                            </div>

                                        </div>

                                        <div className="w-12 h-full flex flex-col items-center space-y-2">
                                            <button
                                                onClick={() => handleEdit(type)}
                                                className="w-full h-max px-2 py-[2px] text-xs text-main rounded-3xl bg-blue-50 border border-main flex items-center justify-center"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(type.id)}
                                                className={`w-full h-max px-2 py-[2px] text-xs rounded-3xl flex items-center justify-center 
                                            ${type.is_used
                                                        ? "text-yellow-600 bg-yellow-50 border border-yellow-600"
                                                        : "text-red-600 bg-red-50 border border-red-600"
                                                    }`}
                                            >
                                                Hapus
                                            </button>


                                        </div>

                                    </div>
                                ))
                        ) : (
                            <p className="p-4 text-center">type tidak ditemukan</p>
                        )}
                    </div>
                </div>

                {isPopupOpen && (
                    <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                            <p className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                                Yakin ingin menghapus type ini?
                            </p>
                            <div className="w-full h-max flex flex-row space-x-2">
                                <button
                                    onClick={() => handleDelete(selectedTypeId)}
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
                        <div className="w-[328px] max-h-[90vh] overflow-y-auto flex flex-col space-y-2 p-4 rounded-lg bg-white">
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
                                    {editType ? "Edit Tipe" : "Tambah Tipe"}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                                    <div className="w-[294px] h-max flex flex-col space-y-2">
                                        <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Nama Tipe</p>
                                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                            <input
                                                type="text"
                                                placeholder="Contoh: Pulsa Transfer"
                                                value={data.name.split(" - ")[0]}
                                                onChange={(e) => setData("name", e.target.value)}
                                                className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                required
                                            />
                                        </div>

                                        <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Profit Persen</p>
                                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                            <input
                                                type="number"
                                                placeholder="Contoh: 5"
                                                value={data.profit_persen ?? ""}
                                                onChange={(e) => setData("profit_persen", e.target.value)}
                                                className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                step="0.0001"
                                            />
                                        </div>

                                        {/* Profit Tetap */}
                                        <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Profit Tetap</p>
                                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                            <input
                                                type="number"
                                                placeholder="Contoh: 1000"
                                                value={data.profit_tetap ?? ""}
                                                onChange={(e) => setData("profit_tetap", e.target.value)}
                                                className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                step="0.0001"
                                            />
                                        </div>

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

                                        <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Brand</p>
                                        <div className="relative w-full">
                                            <div
                                                className="flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer"
                                                onClick={() => setShowBrandPopup(true)}
                                            >
                                                <span>
                                                    {brands.find(bra => bra.id === data.brand_id)?.name || "Pilih brand"}
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
                                            {showBrandPopup && (
                                                <div className="fixed z-30 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                                                    <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                                                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                                                            {/* Search Bar */}
                                                            <input
                                                                id="searchInput"
                                                                type="text"
                                                                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                                placeholder="Cari Brand..."
                                                                value={searchBrand}
                                                                onChange={(e) => setSearchBrand(e.target.value)}
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
                                                            {brands
                                                                .filter(bra =>
                                                                    (!data.category_id || bra.category_id === data.category_id) &&  // Filter berdasarkan category_id
                                                                    bra.name.toLowerCase().includes(searchBrand.toLowerCase()) // Filter berdasarkan pencarian
                                                                )
                                                                .map((bra) => (
                                                                    <div
                                                                        key={bra.id}
                                                                        className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer"
                                                                        onClick={() => {
                                                                            setData("brand_id", bra.id);
                                                                            setShowBrandPopup(false);
                                                                        }}
                                                                    >
                                                                        {/* Gambar kategori di sebelah kiri */}
                                                                        <img
                                                                            src={bra.image ? `/storage/${bra.image}` : "/storage/brands/default.webp"}
                                                                            alt={bra.name}
                                                                            className="w-8 h-8 border border-gray-300 rounded-full object-cover"
                                                                        />
                                                                        <p className="text-utama text-sm text-left align-middle">{bra.name}</p>
                                                                    </div>
                                                                ))
                                                            }

                                                            {/* Jika tidak ada hasil */}
                                                            {brands.filter(bra =>
  (!data.category_id || String(bra.category_id) === String(data.category_id)) &&
  bra.name.toLowerCase().includes(searchBrand.toLowerCase())
)
.length === 0 && (
                                                                    <p className="text-gray-500 text-sm text-center w-full py-2">Brand tidak ditemukan</p>
                                                                )}
                                                        </div>


                                                        <button
                                                            onClick={() => setShowBrandPopup(false)}
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
                                                            {/* Opsi NULL */}
                                                            <div
                                                                className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer"
                                                                onClick={() => {
                                                                    setData("input_type_id", null);
                                                                    setShowInputTypePopup(false);
                                                                }}
                                                            >
                                                                <p className="text-gray-500 text-sm text-left align-middle">Tidak Ada</p>
                                                            </div>

                                                            {/* List dari Input Types */}
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


                                        <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Contoh ID Pelanggan</p>
                                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                            <input
                                                type="text"
                                                name="example_id_product"
                                                value={data.example_id_product || ""}
                                                onChange={(e) => setData("example_id_product", e.target.value)}
                                                className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                                placeholder="input 1= 24434, input 2=Ms24"
                                            />
                                        </div>
                                        {errors.example_id_product && (
                                            <p className="text-red-600 text-sm">{errors.example_id_product}</p>
                                        )}
                                    </div>
                                    <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                                        <label className="w-20 h-20 rounded-full cursor-pointer overflow-hidden relative border-2 border-gray-200">
                                            {/* Input file transparan di atas lingkaran */}
                                            <input
                                                type="file"
                                                name="image"
                                                accept="image/*"
                                                onChange={handleExampleImageChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {/* Preview gambar atau placeholder */}
                                            {previewExampleImage ? (
                                                <img
                                                    src={previewExampleImage}
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
                                        <p className="w-full h-max text-utama font-medium text-sm text-center align-middle">Gambar Contoh ID Pel</p>
                                    </div>
                                </div>

                                {errors.name && (
                                    <p className="text-red-600 text-sm">{errors.name}</p>
                                )}

                                <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                    <button
                                        type="submit"
                                        disabled={processing || !data.name || !data.category_id || !data.brand_id}
                                        className={`w-full p-2 rounded transition ${processing || !data.name || !data.category_id || !data.brand_id
                                            ? "bg-gray-300 cursor-not-allowed"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                            }`}
                                    >
                                        {editType ? "Update" : "Tambah"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {showModalBulk && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 max-w-[90%] w-[400px] relative z-50">
                        <h2 className="text-lg font-semibold mb-3">Edit Massal Tipe</h2>

                        {/* <div className="mb-2">
                            <label className="block text-sm font-medium">Profit Persen</label>
                            <input
                                type="number"
                                className="w-full border rounded p-2"
                                value={bulkEditData.profit_persen || ""}
                                onChange={(e) => handleBulkEditChange("profit_persen", e.target.value)}
                            />
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm font-medium">Profit Tetap</label>
                            <input
                                type="number"
                                className="w-full border rounded p-2"
                                value={bulkEditData.profit_tetap || ""}
                                onChange={(e) => handleBulkEditChange("profit_tetap", e.target.value)}
                            />
                        </div> */}
                        <div className="mb-2">
                            <label className="block text-sm font-medium">Profit Persen</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    className="w-full border rounded p-2"
                                    value={bulkEditData.profit_persen ?? ""}
                                    onChange={(e) => handleBulkEditChange("profit_persen", e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="px-2 text-sm text-red-600 border border-red-500 rounded hover:bg-red-50"
                                    onClick={() => handleBulkEditChange("profit_persen", null)}
                                >
                                    Null
                                </button>
                            </div>
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm font-medium">Profit Tetap</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    className="w-full border rounded p-2"
                                    value={bulkEditData.profit_tetap ?? ""}
                                    onChange={(e) => handleBulkEditChange("profit_tetap", e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="px-2 text-sm text-red-600 border border-red-500 rounded hover:bg-red-50"
                                    onClick={() => handleBulkEditChange("profit_tetap", null)}
                                >
                                    Null
                                </button>
                            </div>
                        </div>


                        {/* Kategori Dropdown */}
                        <div className="mb-2 relative" ref={categoryRef}>
                            <label className="block text-sm font-medium mb-1">Kategori</label>
                            <input
                                type="text"
                                value={categorySearch}
                                onFocus={() => {
                                    setCategorySearch("");
                                    setShowCategoryOptions(true);
                                }}
                                onChange={(e) => {
                                    setCategorySearch(e.target.value);
                                    setShowCategoryOptions(true);
                                }}
                                placeholder="Ketik untuk mencari kategori..."
                                className="w-full border rounded p-2 text-sm"
                            />
                            {showCategoryOptions && (
                                <div className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto mt-1">
                                    {categories
                                        .filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                        .map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => {
                                                    handleBulkEditChange("category_id", cat.id);
                                                    setSelectedCategory(cat);
                                                    setCategorySearch(cat.name);
                                                    setShowCategoryOptions(false);
                                                }}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                {cat.name}
                                            </div>
                                        ))}
                                    {categories.filter(cat => cat.name.toLowerCase().includes(categorySearch.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-gray-500 text-sm">Tidak ditemukan</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input Type Dropdown */}
                        <div className="mb-2 relative" ref={inputTypeRef}>
                            <label className="block text-sm font-medium mb-1">Tipe Input</label>
                            <input
                                type="text"
                                value={inputTypeSearch}
                                onFocus={() => {
                                    setInputTypeSearch("");
                                    setShowInputTypeOptions(true);
                                }}
                                onChange={(e) => {
                                    setInputTypeSearch(e.target.value);
                                    setShowInputTypeOptions(true);
                                }}
                                placeholder="Ketik untuk mencari tipe input..."
                                className="w-full border rounded p-2 text-sm"
                            />
                            {showInputTypeOptions && (
                                <div className="absolute z-10 bg-white border border-gray-300 rounded w-full max-h-40 overflow-y-auto mt-1">
                                    {inputTypes
                                        .filter(type => type.name.toLowerCase().includes(inputTypeSearch.toLowerCase()))
                                        .map(type => (
                                            <div
                                                key={type.id}
                                                onClick={() => {
                                                    handleBulkEditChange("input_type_id", type.id);
                                                    setSelectedInputType(type);
                                                    setInputTypeSearch(type.name);
                                                    setShowInputTypeOptions(false);
                                                }}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                            >
                                                {type.name}
                                            </div>
                                        ))}
                                    {inputTypes.filter(type => type.name.toLowerCase().includes(inputTypeSearch.toLowerCase())).length === 0 && (
                                        <div className="px-3 py-2 text-gray-500 text-sm">Tidak ditemukan</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Aksi */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={() => setShowModalBulk(false)} className="px-4 py-2 bg-gray-200 rounded">Batal</button>
                            <button onClick={handleBulkEditSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan</button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
