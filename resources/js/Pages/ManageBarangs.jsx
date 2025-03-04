import React, { useState } from "react";
import { router } from "@inertiajs/react";

export default function ManageBarangs({ barangs = [] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");

    const filteredBarangs = barangs.filter(barang =>
        barang.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatRupiah = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(price)
            .replace(/\s/g, ""); // Menghapus spasi setelah "Rp"
    };

    const handleSync = () => {
        router.get(route("products.sync"), {}, {
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
                            Kelola Produk
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
                        onClick={() => (window.location.href = "/manage-product-detail")}
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
                            placeholder="Cari produk"
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
                    {filteredBarangs.length > 0 ? (
                        [...filteredBarangs]
                            .filter((barang) => barang.product_name?.toLowerCase().includes(searchTerm.toLowerCase())) // 🔍 Search Filter
                            .sort((a, b) => (sortOrder === "asc" ? a.product_name.localeCompare(b.product_name) : b.product_name.localeCompare(a.product_name))) // 🔀 Sorting
                            .map((barang) => (
                                <div
                                    key={barang.id}
                                    className="flex justify-between items-center p-4 border-b-2 border-b-neutral-100"
                                >

                                    <div className="w-full h-max flex items-center space-x-3 content-start">
                                        <div className="w-13 h-13 space-x-2 flex items-center justify center p-1 rounded-xl bg-white shadow">
                                            <img
                                                src={barang.brand_image ? `/storage/${barang.brand_image}` : "storage/brands/default.webp"}
                                                alt={barang.product_name}
                                                className="w-10 h-10 rounded-xl object-cover"
                                            />
                                        </div>

                                        <div className="max-w-[250px] flex flex-col items-start space-y-[2px]">
                                            <p className="font-utama font-semibold text-sm truncate w-full">{barang.product_name}</p>
                                            <p className="font-utama text-xs text-gray-500 truncate w-full">Kategori: {barang.category_name || "Tidak ada kategori"}</p>
                                            <p className="font-utama text-xs text-gray-500 truncate w-full">Brand: {barang.brand_name || "Tidak ada brand"}</p>
                                            <p className="font-utama text-xs text-gray-500 truncate w-full">Tipe: {barang.type_name || "Tidak ada tipe"}</p>
                                        </div>

                                    </div>

                                    <div className="w-max h-full flex flex-col items-center space-y-2">
                                        {/* Harga Produk */}
                                        <div className="w-full h-max px-2 py-[2px] text-xs text-main rounded-3xl bg-blue-50 border border-main flex items-center justify-center">
                                            {formatRupiah(barang.price)}
                                        </div>

                                        {/* Status Produk */}
                                        <div
                                            className={`w-full h-max px-2 py-[2px] text-xs rounded-3xl flex items-center justify-center ${barang.seller_product_status
                                                ? "text-green-600 bg-green-50 border border-green-600"
                                                : "text-red-600 bg-red-50 border border-red-600"
                                                }`}
                                        >
                                            {barang.seller_product_status ? "Tersedia" : "Gangguan"}
                                        </div>

                                        {/* Tombol Lihat Detail */}
                                        <a
                                            href={`/manage-product-detail/${barang.id}`}
                                            className="text-blue-600 text-xs self-end"
                                        >
                                            Lihat Detail
                                        </a>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className="p-4 text-center">Produk tidak ditemukan</p>
                    )}
                </div>
            </div>
        </div>
    );
}