import React, { useRef, useState } from "react";
import { useForm } from "@inertiajs/react";

export default function AccountSettings({ user }) {
    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(
        user?.avatar ? `${user.avatar}` : "/logo.webp"
    );

    const { data, setData, post, progress, errors } = useForm({
        name: user.name,
        username: user.username,
        avatar: null, // Avatar baru diunggah akan diatur di sini
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData("avatar", file);
            setImagePreview(URL.createObjectURL(file)); // Preview image baru
        }
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("account.settings.update"), {
            preserveScroll: true, // Opsional: tetap di posisi scroll saat submit
        });
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="w-full max-w-full p-6">
                <h1 className="text-xl font-bold mb-4">Pengaturan Akun</h1>
                <form onSubmit={handleSubmit}>
                    {/* Avatar */}
                    <div className="text-center mb-6">
                        <div
                            className="relative inline-block cursor-pointer"
                            onClick={handleImageClick}
                        >
                            <img
                                src={imagePreview} // Menggunakan preview gambar sementara
                                alt="Avatar"
                                className="w-32 h-32 object-cover rounded-full flex items-center justify-center shadow-lg border"
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-sm rounded-full opacity-0 hover:opacity-100 transition">
                                Ganti Foto
                            </span>
                        </div>
                        <label className="block text-gray-700">Foto Profil</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="hidden"
                        />
                    </div>
                    {progress && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${progress.percentage}%` }}
                            ></div>
                        </div>
                    )}
                    {errors.avatar && (
                        <span className="text-red-500 text-sm">{errors.avatar}</span>
                    )}

                    {/* Email */}
                    <div className="mb-4 relative">
                        <label className="block text-gray-700">Email</label>
                        <div className="relative">
                            <input
                                type="email"
                                className="w-full rounded-md border-gray-300 shadow-sm bg-gray-100 pl-3 pr-10"
                                value={user.email}
                                readOnly
                            />
                            {/* Ikon Verifikasi */}
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                {user.email_verified_at ? (
                                    <svg
                                        className="w-5 text-green-600"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 text-red-600"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
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
                    <div className="mb-4">
                        <label className="block text-gray-700">Nama</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && (
                            <span className="text-red-500 text-sm">{errors.name}</span>
                        )}
                    </div>

                    {/* Username */}
                    <div className="mb-4">
                        <label className="block text-gray-700">Username</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={data.username}
                            onChange={(e) => setData("username", e.target.value)}
                        />
                        {errors.username && (
                            <span className="text-red-500 text-sm">{errors.username}</span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Simpan Perubahan
                    </button>
                </form>
            </div>
        </div>
    );
}
