import { useEffect, useState } from 'react';
import { Link, Head, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [isChecked, setIsChecked] = useState(false);
    const isFormValid = data.name && data.email && data.password && data.password_confirmation && isChecked;

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
        <>
            <Head title="Register" />
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
                                <p className="font-utama text-xl font-bold text-center">Registrasi</p>
                                <p className="font-utama text-base font-medium text-gray-600 text-center">Daftar dulu, baru login</p>
                            </div>

                            <div className="w-[380px] h-max flex flex-col space-y-4 mb-6">
                                <div>
                                    <label className="w-full h-max text-gray-700 text-left align-middle">Nama Lengkap</label>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            placeholder="Diisi bebas, yang penting inget"
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="w-full h-max text-gray-700 text-left align-middle">Email</label>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            placeholder="Wajib banget email aktif"
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="w-full h-max text-gray-700 text-left align-middle">Password</label>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            placeholder="Bikin yang susah ditebak"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="w-full h-max text-gray-700 text-left align-middle">Konfirmasi Password</label>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            placeholder="Samain kayak kolom password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.password_confirmation && <p className="text-red-500">{errors.password_confirmation}</p>}
                                </div>
                                <label className="flex items-center space-x-2 mt-4 font-utama font-normal text-center text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => setIsChecked(!isChecked)}
                                        className="w-4 h-4 accent-blue-500"
                                    />
                                    <p>Saya menyetujui{" "}
                                        <Link
                                            href={route('privacy')}
                                            className="text-blue-500 hover:underline"
                                        >
                                            ketentuan & kebijakan layanan kami
                                        </Link>
                                    </p>
                                </label>
                                <button
                                    type="submit"
                                    className={`w-full text-white p-2 rounded transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                        }`}
                                    disabled={!isFormValid || processing}
                                >
                                    {processing ? "Pendaftaran..." : "Daftar"}
                                </button>
                            </div>
                        </div>
                    </form>
                    <p className="mt-40 md:mt-5 font-utama font-normal text-center text-sm text-gray-600">
                        Udah punya akun?{' '}
                        <a
                            href="login"
                            className="text-blue-500 font-semibold hover:underline"
                        >
                            Login di sini
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
}
