import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header Section */}
                <div className="relative bg-blue-600 text-center p-8 mb-8">
                    <div className="absolute inset-x-0 -bottom-10 flex justify-center">
                        <img
                            src="/storage/logo.webp"
                            alt="Logo Muvausa Store"
                            className="w-20 h-20 p-1.5 border-4 border-white rounded-full shadow-lg bg-white"
                        />
                    </div>
                </div>
                <div className="p-6">

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 text-center">
                        Halaman Register
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-8">
                        Daftar dulu, baru login
                    </p>

                    {/* Form */}
                    <form onSubmit={submit}>
                        {/* Name Input */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Lengkap
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                placeholder="Diisi bebas, yang penting inget"
                                onChange={(e) => setData('name', e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.name && (
                                <div className="text-sm text-red-500 mt-1">{errors.name}</div>
                            )}
                        </div>

                        {/* Email Input */}
                        <div className="mt-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="Wajib banget email aktif"
                                onChange={(e) => setData('email', e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.email && (
                                <div className="text-sm text-red-500 mt-1">{errors.email}</div>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="mt-4">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                placeholder="Bikin yang susah tebak"
                                onChange={(e) => setData('password', e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.password && (
                                <div className="text-sm text-red-500 mt-1">{errors.password}</div>
                            )}
                        </div>

                        {/* Password Confirmation Input */}
                        <div className="mt-4">
                            <label
                                htmlFor="password_confirmation"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Konfirmasi Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                placeholder="Samain kayak kolom password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.password_confirmation && (
                                <div className="text-sm text-red-500 mt-1">{errors.password_confirmation}</div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {processing ? 'Registering...' : 'Daftar'}
                            </button>
                        </div>
                    </form>

                    {/* Sudah punya akun */}
                    <p className="mt-4 text-center text-sm text-gray-600">
                        Udah punya akun?{' '}
                        <a
                            href="login"
                            className="text-blue-500 hover:underline"
                        >
                            Login di sini
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
