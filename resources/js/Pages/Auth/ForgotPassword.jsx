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
            <div className="mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen md:h-screen">
                <div className="min-h-[892px] md:min-h-full bg-white p-4">
                    <form onSubmit={submit}>
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-[380px] h-max flex flex-col items-center space-y-4 mb-6">
                                <img
                                    src="/storage/logo_no_bg.png"
                                    alt="Logo Muvausa Store"
                                    className="w-20 p-1.5 border-4 border-white bg-white mx-auto"
                                />
                                <p className="font-utama text-xl font-bold text-center">Lupa Password</p>
                                <p className="font-utama text-base font-medium text-gray-600 text-center">Lupa password?, kita bantu</p>
                            </div>

                            <div className="w-[380px] h-max flex flex-col space-y-4 mb-6">
                                {status && <div className="font-utama text-base font-medium text-center text-green-600">{status}</div>}

                                <div>
                                    <label className="w-full h-max text-gray-700 text-left align-middle">Email</label>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="pasti inget email yang kamu daftarin dong"
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500">{errors.email}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full text-white p-2 rounded transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                        }`}
                                    disabled={!isFormValid || processing}
                                >
                                    {processing ? 'Memproses permintaanmu...' : 'Kirim Email Reset Password'}
                                </button>
                            </div>
                        </div>
                    </form>
                    <p className="absolute bottom-20 left-1/2 -translate-x-1/2 md:bottom-14 font-utama font-normal text-center text-sm text-gray-600">
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
