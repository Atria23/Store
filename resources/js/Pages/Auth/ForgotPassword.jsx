import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
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
                            Reset Password
                        </h2>
                        <p className="text-gray-500 text-sm text-center mb-8">
                            Lupa password?, kita bantu
                        </p>

                        {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

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
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="pasti inget email yang kamu daftarin dong"
                                    isFocused={true}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2" />

                            </div>

                            {/* Submit Button */}
                            <div className="mt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {processing ? 'Memproses permintaanmu...' : 'Kirim Email Reset Password'}
                                </button>
                            </div>
                        </form>

                        {/* Belum punya akun */}
                        <p className="mt-4 text-center text-sm text-gray-600">
                            Ingat passwordnya?{' '}
                            <a
                                href="login"
                                className="text-blue-500 hover:underline"
                            >
                                Coba login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
