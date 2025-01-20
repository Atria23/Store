import { useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login')); // Menggunakan logika pengiriman data dari kode kedua
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="relative bg-blue-600 text-center p-8 mb-8">
                        <div className="absolute inset-x-0 -bottom-10 flex justify-center">
                            <img
                                src='/storage/logo.webp'
                                alt="Logo Muvausa Store"
                                className="w-20 h-20 p-1.5 border-4 border-white rounded-full shadow-lg bg-white"
                            />
                        </div>
                    </div>
                    <div className="p-6">

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 text-center">
                            Halaman Login
                        </h2>
                        <p className="text-gray-500 text-sm text-center mb-8">
                            Khusus buat kamu yang udah daftar
                        </p>

                        {/* Form */}
                        <form onSubmit={submit}>
                            {/* Email Input */}
                            <div>
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
                                    placeholder="Jangan isi email palsu lho ya, kita tahu kok!"
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
                                    placeholder="janji nggak kita kasih password kamu ke kucing"
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.password && (
                                    <div className="text-sm text-red-500 mt-1">{errors.password}</div>
                                )}
                            </div>

                            {/* Forgot Password and Submit */}
                            <div className="flex items-center justify-between mt-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Ingetin Saya</span>
                                </label>

                                {canResetPassword && (
                                    <a
                                        href={route('password.request')}
                                        className="text-sm text-blue-500 hover:underline"
                                    >
                                        Lupa Password?
                                    </a>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {processing ? 'Logging in...' : 'Log in'}
                                </button>
                            </div>
                        </form>

                        {/* Belum punya akun */}
                        <p className="mt-4 text-center text-sm text-gray-600">
                            Belum punya akun?{' '}
                            <a
                                href="register"
                                className="text-blue-500 hover:underline"
                            >
                                Daftar dulu
                            </a>
                        </p>
                    </div>
                </div>
            </div>

        </>
    );
}
