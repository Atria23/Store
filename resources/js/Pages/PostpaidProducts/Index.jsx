import React, { useState, useEffect } from "react";
import { router, Head, Link } from "@inertiajs/react";

export default function ManagePostpaidProducts({ auth, postpaidProducts: initialProducts = [], flash }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [products, setProducts] = useState(initialProducts);

    // useEffect ini tetap diperlukan untuk flash messages
    useEffect(() => {
        setProducts(initialProducts); // Ensure products are updated when initialProducts prop changes
    }, [initialProducts]);

    useEffect(() => {
        if (flash && flash.message) {
            alert(flash.message);
        }
    }, [flash]);

    const normalize = (str) =>
        str?.toString().toLowerCase().replace(/[\s_-]+/g, ''); // Convert to string before lowercasing

    const filteredProducts = searchTerm.trim()
        ? products.filter((product) => {
            const keyword = normalize(searchTerm);
            const combinedString = normalize(
                [
                    product.product_name,
                    product.category,
                    product.brand,
                    product.buyer_sku_code,
                    product.desc,
                    product.admin,      // DITAMBAHKAN: admin untuk pencarian
                    product.commission, // DITAMBAHKAN: commission untuk pencarian
                ]
                    .filter(Boolean)
                    .join(' ')
            );
            return combinedString.includes(keyword);
        })
        : products;

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.product_name.localeCompare(b.product_name);
        } else {
            return b.product_name.localeCompare(a.product_name);
        }
    });

    const formatRupiah = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(price)
            .replace(/\s/g, "");
    };

    const handleSync = () => {
        router.post(route("postpaid.fetch"), {}, {
            onSuccess: (page) => {
                router.reload({ only: ['postpaidProducts'] });
            },
            onError: (errors) => {
                console.error("Gagal sinkronisasi:", errors);
            }
        });
    };

    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);

    // State untuk form bulk update (diterapkan ke semua produk terpilih)
    const [bulkForm, setBulkForm] = useState({
        desc: "",
        seller_product_status: "",
        buyer_product_status: "",
        commission_sell_percentage: "",
        commission_sell_fixed: "",
        image: "", // NEW: Bulk image field
    });

    // State untuk form individual update (untuk setiap produk terpilih)
    const [individualProductForms, setIndividualProductForms] = useState({});

    useEffect(() => {
        if (showBulkModal) {
            // Initialize individual forms when modal opens, based on selected products
            const forms = {};
            products.filter(p => selectedIds.includes(p.id)).forEach(product => {
                forms[product.id] = {
                    desc: product.desc || "",
                    seller_product_status: product.seller_product_status ? "1" : "0",
                    buyer_product_status: product.buyer_product_status ? "1" : "0",
                    commission_sell_percentage: product.commission_sell_percentage || "",
                    commission_sell_fixed: product.commission_sell_fixed || "",
                    image: product.image || "", // NEW: Initialize individual image
                };
            });
            setIndividualProductForms(forms);
            // Reset bulk form when modal opens
            setBulkForm({
                desc: "",
                seller_product_status: "",
                buyer_product_status: "",
                commission_sell_percentage: "",
                commission_sell_fixed: "",
                image: "",
            });
        }
    }, [showBulkModal, selectedIds, products]);


    const isSelected = (id) => selectedIds.includes(id);

    const toggleCheckbox = (id) => {
        setSelectedIds(prev =>
            isSelected(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleGoToBulkEdit = () => {
        if (selectedIds.length === 0) {
            alert("Pilih produk terlebih dahulu.");
            return;
        }
        router.get(route('postpaid.bulk-edit'), {
            ids: selectedIds,
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === sortedProducts.length && sortedProducts.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(sortedProducts.map(b => b.id));
        }
    };

     const handleSingleEdit = (productId) => {
        router.get(route('postpaid.bulk-edit'), {
            ids: [productId],
        });
    };

    return (
        <>
            <Head title="Kelola Produk Pascabayar" />

            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button
                                className="shrink-0 w-6 h-6"
                                onClick={() => window.history.back()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <div className="font-utama text-white font-bold text-lg">
                                Kelola Produk Pascabayar
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
                    </div>
                    <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                            <input
                                id="searchInput"
                                type="text"
                                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                placeholder="Cari produk"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
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
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
                            >
                                {sortOrder === "asc" ? (
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
                            <button className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 16 16"
                                    fill="currentColor"
                                    className="w-4 h-4 text-main"
                                >
                                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5
.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
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
                                                checked={selectedIds.length === sortedProducts.length && sortedProducts.length > 0}
                                                onChange={toggleSelectAll}
                                                className="accent-main w-4 h-4"
                                            />
                                            <label className="text-sm text-gray-700">Pilih Semua</label>
                                        </div>

                                        <div className="w-max flex items-center space-x-2 justify-end">
                                            <p className="text-sm text-gray-700">
                                                {selectedIds.length} produk dipilih
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGoToBulkEdit}
                                        className="text-sm px-3 py-1.5 bg-main text-white rounded-md hover:bg-blue-700 transition"
                                    >
                                        Edit Massal ({selectedIds.length} item)
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
                        {sortedProducts.length > 0 ? (
                            sortedProducts.map((product) => {
                                // --- PERHITUNGAN UNTUK NET PROFIT ---
                                const netProfit = (product.admin || 0) - (
                                    (((product.commission || 0) * (product.commission_sell_percentage || 0)) / 100) +
                                    (product.commission_sell_fixed || 0)
                                );

                                // --- PERHITUNGAN BARU UNTUK TOTAL KOMISI AGEN DALAM RUPIAH ---
                                const totalAgentCommissionRupiah = 
                                    (((product.commission_sell_percentage || 0) / 100) * (product.commission || 0)) +
                                    (product.commission_sell_fixed || 0);

                                return (
                                    <div
                                        key={product.id}
                                        className="flex justify-between items-center p-4 border-b-2 border-b-neutral-100"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected(product.id)}
                                                onChange={() => toggleCheckbox(product.id)}
                                                className="accent-main"
                                            />
                                            <img
                                                src={product.image ? `/storage/${product.image}` : "/storage/brands/default.webp"}
                                                alt={product.product_name}
                                                className="w-12 h-12 rounded-xl object-cover shadow"
                                            />
                                            <div className="flex flex-col items-start space-y-1">
                                                <p className="font-utama font-semibold text-sm max-w-[150px] truncate">
                                                    {product.product_name} - {product.brand || "Tanpa Brand"}
                                                </p>
                                                <p className="font-utama text-xs text-gray-500 max-w-[150px] truncate">{product.brand || "Tanpa Brand"}</p>
                                                <div className="font-utama text-xs text-gray-500 pt-1">
                                                    {product.admin > 0 && (
                                                        <div>Admin: <span className="font-semibold text-gray-700">{formatRupiah(product.admin)}</span></div>
                                                    )}
                                                    {product.commission > 0 && (
                                                        <div>Komisi: <span className="font-semibold text-gray-700">{formatRupiah(product.commission)}</span></div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end space-y-2">

                                            {/* --- TAMPILAN KOMISI AGEN DIPERBARUI --- */}
                                            {totalAgentCommissionRupiah > 0 && (
                                                <div className="w-max h-max px-2 py-[2px] text-xs text-purple-600 rounded-3xl bg-purple-50 border border-purple-600">
                                                    {formatRupiah(totalAgentCommissionRupiah)}
                                                </div>
                                            )}

                                            <div
                                                className={`px-2 py-[2px] text-xs rounded-3xl ${product.seller_product_status
                                                    ? "text-green-600 bg-green-50 border border-green-600"
                                                    : "text-red-600 bg-red-50 border border-red-600"
                                                    }`}
                                            >
                                                {product.seller_product_status ? "Tersedia" : "Gangguan"}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleSingleEdit(product.id)}
                                                className="text-main text-xs font-semibold hover:underline focus:outline-none pt-2"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="p-4 text-center">Produk tidak ditemukan</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}