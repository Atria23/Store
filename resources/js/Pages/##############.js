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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                {/* Tombol Close */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                >
                    &times;
                </button>

                {/* Judul */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
                    Edit Toko
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Input Foto */}
                    <div className="text-center">
                        <div
                            className="relative inline-block cursor-pointer"
                            onClick={handleImageClick}
                        >
                            <img
                                src={imagePreview || "/storage/.webp"}
                                alt="Foto Toko"
                                className="w-32 h-32 object-cover rounded-full shadow-lg border"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-sm rounded-full opacity-0 hover:opacity-100 transition">
                                Ganti Foto
                            </span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </div>
                    {/* Nama Toko */}
                    <div>
                        <label className="block text-gray-600 font-medium">Nama Toko</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="border border-gray-300 rounded-lg w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                            placeholder="Masukkan nama toko"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 font-medium">Nomor Telepon Toko</label>
                        <input
                            type="number"
                            value={data.phone_number}
                            onChange={(e) => setData("phone_number", e.target.value)}
                            className="border border-gray-300 rounded-lg w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                            placeholder="Masukkan nomor telepon toko"
                        />
                    </div>

                    {/* alamat */}
                    <div>
                        <label className="block text-gray-600 font-medium">Alamat</label>
                        <textarea
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            className="border border-gray-300 rounded-lg w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400"
                            placeholder="Tambahkan alamat"
                        />
                    </div>

                    {/* Tombol Aksi */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 px-4 py-2"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            disabled={processing}
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
