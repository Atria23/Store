import { useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'));
    };

    return (
        <>
            <Head title="Muvausa Store - Confirm Password" />
            
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
                            Konfirmasi Password
                        </h2>
                        <p className="text-gray-500 text-sm text-center mb-8">
                            Wajib banget masukkin passwordmu kalo mau lanjut
                        </p>

                        {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

                        {/* Form */}
                        <form onSubmit={submit}>
                            {/* Email Input */}
                            <div>
                                <InputLabel htmlFor="password" value="Password"
                                    className="block text-sm font-medium text-gray-700"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    isFocused={true}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Passwordnya pasti inget kan?!"
                                />
                                <InputError message={errors.password} className="mt-2" />

                            </div>

                            {/* Submit Button */}
                            <div className="mt-4">
                                <button
                                    disabled={processing}
                                    className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {processing ? 'Proses...' : 'Konfirmasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
