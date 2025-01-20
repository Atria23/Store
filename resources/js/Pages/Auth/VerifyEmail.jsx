// import { Head, useForm } from '@inertiajs/react';

// export default function VerifyEmail({ status }) {
//     const { post, processing } = useForm({});

//     const submit = (e) => {
//         e.preventDefault();
//         post(route('verification.send'));
//     };

//     return (
//         <>
//             <Head title="Email Verification" />
//             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
//                 <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
//                 <img
//                                 src='/storage/logo.webp'
//                                 alt="Logo Muvausa Store"
//                                 className="w-20 h-20 flex mx-auto"
//                             />
//                     <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
//                         Verifikasi Email
//                     </h1>
//                     {status === 'verification-link-sent' && (
//                         <div className="mb-6 text-sm text-green-600 bg-green-100 p-4 rounded-lg border border-green-300">
//                             Link verifikasi baru telah dikirim ke email yang Anda gunakan saat pendaftaran.
//                         </div>
//                     )}
//                     <p className="text-gray-600 text-sm text-center mb-6">
//                         Harap cek email Anda untuk menemukan link verifikasi. Jika belum menerima email, Anda dapat mengirim ulang link verifikasi dengan tombol di bawah.
//                     </p>
//                     <form onSubmit={submit} className="flex justify-center">
//                         <button
//                             className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//                             disabled={processing}
//                         >
//                             {processing ? 'Mengirim...' : 'Kirim Ulang Link Verifikasi'}
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// }





import { Head, useForm } from '@inertiajs/react';

export default function VerifyEmail({ status, isVerified }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    if (isVerified) {
        // Jika email sudah terverifikasi
        return (
            <>
                <Head title="Email Verified" />
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
                    <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
                        <img
                            src="/storage/logo.webp"
                            alt="Logo Muvausa Store"
                            className="w-20 h-20 flex mx-auto mb-4"
                        />
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">Email Anda Sudah Terverifikasi</h1>
                        <p className="text-gray-600 text-sm mb-6">
                            Terima kasih telah memverifikasi email Anda! Anda sekarang dapat menggunakan semua fitur di Muvausa Store.
                        </p>
                        <a
                            href="/user/dashboard"
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Lanjutkan ke Dashboard
                        </a>
                    </div>
                </div>
            </>
        );
    }

    // Jika email belum terverifikasi
    return (
        <>
            <Head title="Email Verification" />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6">
                <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
                    <img
                        src="/storage/logo.webp"
                        alt="Logo Muvausa Store"
                        className="w-20 h-20 flex mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Verifikasi Email</h1>
                    {status === 'verification-link-sent' && (
                        <div className="mb-6 text-sm text-green-600 bg-green-100 p-4 rounded-lg text-center border border-green-300">
                            Link verifikasi baru telah dikirim ke email kamu lho, buruan dicek yaps.
                        </div>
                    )}
                    <p className="text-gray-600 text-sm text-center mb-6">
                        Coba cek email kamu buat nemuin link verifikasinya. Kalo belum ada, klik tombol di bawah ini yaps.
                    </p>
                    <form onSubmit={submit} className="flex justify-center">
                        <button
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={processing}
                        >
                            {processing ? 'Mengirim...' : 'Kirim Ulang Link Verifikasi'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
