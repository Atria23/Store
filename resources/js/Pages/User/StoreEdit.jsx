import React, { useRef, useState } from "react";
import { useForm } from "@inertiajs/react";

export default function StoreEdit({ store }) {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(store?.image ? `/storage/${store.image}` : "/logo.webp");

    const { data, setData, post, progress, errors, processing } = useForm({
        name: store?.name || '',
        address: store?.address || '',
        phone_number: store?.phone_number || '',
        image: null,
    });
    

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("store.update"), {
            preserveScroll: true,
            onSuccess: () => {
                window.location.href = route('profile'); // Redirect after success
            },
        });
    };

    const isFormValid = data.name;

    return (
        <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
            <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">
                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="w-full h-max flex flex-row items-center px-4 py-2 space-x-4">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Edit Toko
                        </div>
                    </div>
                </header>

                {/* Spacer Header */}
                <div className="h-11" />

                {/* Avatar Section */}
                <section className="flex flex-col items-center space-y-4 mb-6 px-4">
                    <div onClick={handleImageClick} className="relative inline-block cursor-pointer">
                        <img
                            src={imagePreview}
                            alt="Store Image"
                            className="w-24 h-24 object-cover rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-xs rounded-full opacity-0 hover:opacity-100 transition">
                            Ganti Gambar
                        </span>
                    </div>
                    <label className="text-gray-700 font-medium text-sm">Logo Toko</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                </section>

                {/* Form Section */}
                <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="w-full flex flex-col space-y-4 mb-6">
                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 mb-1">Nama Toko</label>
                                <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama Toko"
                                        className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                        required
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-gray-700 mb-1">Alamat Toko</label>
                                <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        name="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Alamat lengkap"
                                        className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                    />
                                </div>
                                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-gray-700 mb-1">Nomor Telepon</label>
                                <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        placeholder="Nomor telepon toko"
                                        className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                    />
                                </div>
                                {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={`w-full text-white p-2 rounded text-sm transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                    }`}
                                disabled={!isFormValid || processing}
                            >
                                {processing ? "Menyimpan..." : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
