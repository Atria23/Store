import { Link, Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });
    const isFormValid = data.email;

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Lupa Password" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
                <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">{/* Header dengan tombol kembali */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="w-full h-max flex flex-row items-center px-4 py-2 space-x-4">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Lupa Password
                        </div>
                    </div>
                </header>

                {/* Spacer header */}
                <div className="h-11" />

                    {/* section atas */}
                    <section className="w-full h-max flex flex-col items-center space-y-4 mb-6 px-4">
                        <img
                            src="/storage/logo_no_bg.png"
                            alt="Logo Muvausa Store"
                            className="w-20 p-1.5 border-4 border-white bg-white mx-auto"
                        />
                        <p className="font-utama text-xl font-bold text-center">Lupa Password</p>
                        <p className="font-utama text-base font-medium text-gray-600 text-center">
                            Lupa password?, kita bantu
                        </p>
                    </section>

                    {/* section form */}
                    <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
                        <form onSubmit={submit} className="w-full">
                            <div className="w-full h-max flex flex-col space-y-4 mb-6">
                                {status && <div className="font-utama text-base font-medium text-center text-green-600">{status}</div>}
                                <div>
                                    <label className="block text-gray-700 mb-1">Email</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="pasti inget email yang kamu daftarin dong"
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full text-white p-2 rounded text-sm transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                        }`}
                                    disabled={!isFormValid || processing}
                                >
                                    {processing ? 'Memproses permintaanmu...' : 'Kirim Email Reset Password'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <p className="fixed bottom-14 left-1/2 -translate-x-1/2 w-full max-w-[320px] px-4 text-center text-sm text-gray-600 font-utama z-10">
                        Ingat passwordnya?{' '}
                        <Link
                            href={route('login')}
                            className="text-blue-500 font-semibold hover:underline"
                        >
                            Coba login
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
