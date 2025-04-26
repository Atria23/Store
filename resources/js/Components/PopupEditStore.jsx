import React, { useState, useRef } from "react";
import { useForm } from "@inertiajs/react";

const PopupEditStore = ({ isOpen, onClose, store }) => {
    const { data, setData, post, processing } = useForm({
        name: store?.name || "Nama Toko Default",
        address: store?.address || "Alamat Toko Default",
        phone_number: store?.phone_number || "0812",
    });

    const [imagePreview, setImagePreview] = useState(
        store?.image ? `${store.image}` : null
    );

    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            const previewURL = URL.createObjectURL(file);
            setImagePreview(previewURL);
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/store/update", {
            onSuccess: () => {
                console.log("Data berhasil diperbarui.");
                onClose(); // Tutup popup setelah submit berhasil
            },
        });
    };

    return (
        <div className="fixed h-screen px-4 inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="w-full max-w-[328px] p-4 bg-white rounded-lg shadow-lg">
                <div className="w-full h-max flex flex-col">
                    {/* Ikon silang di kanan atas */}
                    <button
                        className="w-full flex items-end justify-end"
                        onClick={onClose}
                    >
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
                        Edit Toko
                    </h2>
                </div>
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                        <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                            <label className="w-20 h-20 rounded-full cursor-pointer overflow-hidden relative border-2 border-gray-200">
                                {/* Input file transparan di atas lingkaran */}

                                <input
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    ref={fileInputRef}
                                    className="hidden absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {/* Preview gambar atau placeholder */}
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
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
                            <p className="w-full h-max text-utama font-medium text-sm text-center align-middle">Gambar Kategori</p>
                        </div>
                        <div className="w-full max-w-[328px] h-max flex flex-col space-y-2">
                            <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Nama Toko</p>
                            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                    placeholder="Nama Kategori"
                                />
                            </div>
                        </div>
                        <div className="w-full max-w-[328px] h-max flex flex-col space-y-2">
                            <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Nomor Telepon Toko</p>
                            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                <input
                                    type="text"
                                    name="name"
                                    value={data.phone_number}
                                    onChange={(e) => setData("phone_number", e.target.value)}
                                    className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                    placeholder="Nama Kategori"
                                />
                            </div>
                        </div>
                        <div className="w-full max-w-[328px] h-max flex flex-col space-y-2">
                            <p className="w-full h-max text-utama font-medium text-sm text-left align-middle">Alamat Toko</p>
                            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                <input
                                    type="text"
                                    name="name"
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                    className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                    placeholder="Nama Kategori"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                        <button
                            disabled={processing}
                            type="submit"
                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                        >
                            {processing ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PopupEditStore;
