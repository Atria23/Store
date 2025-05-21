import { useEffect, useState } from 'react';
import { Link, Head, useForm } from '@inertiajs/react';

export default function Login({ canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });
    const isFormValid = data.email && data.password;
    const [showPassword, setShowPassword] = useState(false);
    
    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };


    return (
        <>
            <Head title="Login" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
                <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">

                    {/* section atas */}
                    <section className="w-full h-max flex flex-col items-center space-y-4 mb-6 px-4">
                        <img
                            src="/storage/logo_no_bg.png"
                            alt="Logo Muvausa Store"
                            className="w-20 p-1.5 border-4 border-white bg-white mx-auto"
                        />
                        <p className="font-utama text-xl font-bold text-center">Login</p>
                        <p className="font-utama text-base font-medium text-gray-600 text-center">
                            Khusus buat kamu yang udah daftar
                        </p>
                    </section>

                    {/* section form */}
                    <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
                        <form onSubmit={submit} className="w-full">
                            <div className="w-full h-max flex flex-col space-y-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Email</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            placeholder="Jangan isi email palsu lho ya, kita tahu kok!"
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-1">Password</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200 pr-2">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            placeholder="janji nggak kita kasih password kamu ke kucing"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="ml-2 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="text-main" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                                                    <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="text-main" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>
                                <div className="flex flex-wrap items-center justify-between mt-4 w-full">
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
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-blue-500 hover:underline ml-auto"
                                        >
                                            Lupa Password?
                                        </Link>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className={`w-full text-white p-2 rounded text-sm transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                        }`}
                                    disabled={!isFormValid || processing}
                                >
                                    {processing ? "Validasi data..." : "Masuk"}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* guest section */}
                    <section className="w-full px-4 mx-auto">
                        <div className="flex items-center w-full mb-6">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="px-3 text-gray-500 text-sm whitespace-nowrap">atau</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>
                        <Link href={route('guest.dashboard')}>
                            <button
                                type="button"
                                className="w-full text-white text-sm p-2 rounded transition bg-main hover:bg-blue-700"
                            >
                                Login sebagai Tamu
                            </button>
                        </Link>
                    </section>

                    {/* login */}
                    <p className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[320px] px-4 text-center text-sm text-gray-600 font-utama z-10">
                        Belum punya akun?{' '}
                        <a
                            href="register"
                            className="text-blue-500 font-semibold hover:underline"
                        >
                            Daftar dulu
                        </a>
                    </p>

                </div>
            </div>
        </>
    );
}