import React, { useRef, useState } from "react";
import { useForm } from "@inertiajs/react";

export default function AccountSettings({ user }) {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(user?.avatar ? `${user.avatar}` : "/logo.webp");

    const { data, setData, post, progress, errors, processing } = useForm({
        name: user.name,
        avatar: null,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("avatar", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("account.settings.update"), {
            preserveScroll: true,
            onSuccess: () => {
                window.location.href = route('profile'); // Redirect setelah berhasil update
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
                            Pengaturan Akun
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
                            alt="Avatar"
                            className="w-24 h-24 object-cover rounded-full flex items-center justify-center shadow-lg border-4 border-white"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-xs rounded-full opacity-0 hover:opacity-100 transition">
                            Ganti Foto
                        </span>
                    </div>
                    <label className="text-gray-700 font-medium text-sm">Foto Profil</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="hidden"
                    />
                    {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}
                </section>

                {/* Section Form */}
                <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
                    <form onSubmit={handleSubmit} className="w-full">
                        <div className="w-full flex flex-col space-y-4 mb-6">

                            {/* Email */}
                            <div>
                                <label className="block text-gray-700 mb-1">Email</label>
                                <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200 relative">
                                    <input
                                        type="email"
                                        value={user.email}
                                        readOnly
                                        className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                    />
                                    <div className="absolute right-3">
                                        {user.email_verified_at ? (
                                            <svg className="w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v5a1 1 0 1 0 2 0V8Zm-1 7a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2H12Z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                {!user.email_verified_at && (
                                    <a
                                        href="/email/verify"
                                        className="text-blue-600 hover:text-blue-800 mt-2 inline-block text-sm font-medium underline"
                                    >
                                        Verifikasi Sekarang
                                    </a>
                                )}
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 mb-1">Nama</label>
                                <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama lengkap kamu"
                                        className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                        required
                                    />
                                </div>
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Submit */}
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
