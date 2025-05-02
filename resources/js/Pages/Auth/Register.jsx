// referal wajib

// import { useEffect, useState } from 'react';
// import { Link, Head, useForm } from '@inertiajs/react';

// export default function Register() {
//     const { data, setData, post, processing, errors, reset } = useForm({
//         name: '',
//         email: '',
//         password: '',
//         password_confirmation: '',
//         referral_code: '',
//     });

//     const [referralValid, setReferralValid] = useState(null);

//     useEffect(() => {
//         const params = new URLSearchParams(window.location.search);
//         const ref = params.get('ref');
//         if (ref) {
//             setData('referral_code', ref);
//         }
//     }, []);


//     useEffect(() => {
//         if (data.referral_code.trim() === '') {
//             setReferralValid(null);
//             return;
//         }

//         const timeout = setTimeout(() => {
//             fetch('/check-referral', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//                 },
//                 body: JSON.stringify({ referral_code: data.referral_code }),
//             })
//                 .then(res => res.json())
//                 .then(data => setReferralValid(data.valid))
//                 .catch(() => setReferralValid(false));
//         }, 500);

//         return () => clearTimeout(timeout);
//     }, [data.referral_code]);


//     const [isChecked, setIsChecked] = useState(false);
//     const isFormValid =
//         data.name &&
//         data.email &&
//         data.password &&
//         data.password_confirmation &&
//         data.referral_code &&
//         isChecked &&
//         referralValid === true;

//     useEffect(() => {
//         return () => {
//             reset('password', 'password_confirmation');
//         };
//     }, []);

//     const submit = (e) => {
//         e.preventDefault();
//         post(route('register'));
//     };

//     return (
//         <>
//             <Head title="Register" />
//             <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
//                 <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">

//                     {/* section atas */}
//                     <section className="w-full h-max flex flex-col items-center space-y-4 mb-6 px-4">
//                         <img
//                             src="/storage/logo_no_bg.png"
//                             alt="Logo Muvausa Store"
//                             className="w-20 p-1.5 border-4 border-white bg-white mx-auto"
//                         />
//                         <p className="font-utama text-xl font-bold text-center">Registrasi</p>
//                         <p className="font-utama text-base font-medium text-gray-600 text-center">
//                             Daftar dulu, baru login
//                         </p>
//                     </section>

//                     {/* section form register */}
//                     <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
//                         <form onSubmit={submit} className="w-full">
//                             <div className="w-full h-max flex flex-col space-y-4 mb-6">
//                                 <div>
//                                     <label className="block text-gray-700 mb-1">Nama Lengkap</label>
//                                     <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                         <input
//                                             id="name"
//                                             type="text"
//                                             name="name"
//                                             value={data.name}
//                                             placeholder="Diisi bebas, yang penting inget"
//                                             onChange={(e) => setData('name', e.target.value)}
//                                             className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
//                                             required
//                                         />
//                                     </div>
//                                     {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
//                                 </div>

//                                 <div>
//                                     <label className="block text-gray-700 mb-1">Email</label>
//                                     <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                         <input
//                                             id="email"
//                                             type="email"
//                                             name="email"
//                                             value={data.email}
//                                             placeholder="Wajib banget email aktif"
//                                             onChange={(e) => setData('email', e.target.value)}
//                                             className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
//                                             required
//                                         />
//                                     </div>
//                                     {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//                                 </div>

//                                 <div>
//                                     <label className="block text-gray-700 mb-1">Password</label>
//                                     <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                         <input
//                                             id="password"
//                                             type="password"
//                                             name="password"
//                                             value={data.password}
//                                             placeholder="Bikin yang susah ditebak"
//                                             onChange={(e) => setData('password', e.target.value)}
//                                             className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
//                                             required
//                                         />
//                                     </div>
//                                     {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//                                 </div>

//                                 <div>
//                                     <label className="block text-gray-700 mb-1">Konfirmasi Password</label>
//                                     <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                         <input
//                                             id="password_confirmation"
//                                             type="password"
//                                             name="password_confirmation"
//                                             value={data.password_confirmation}
//                                             placeholder="Samain kayak kolom password"
//                                             onChange={(e) => setData('password_confirmation', e.target.value)}
//                                             className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
//                                             required
//                                         />
//                                     </div>
//                                     {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
//                                 </div>

//                                 <div>
//                                     <label className="block text-gray-700 mb-1">Kode Referral Teman</label>
//                                     <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                         <input
//                                             id="referral_code"
//                                             type="text"
//                                             name="referral_code"
//                                             value={data.referral_code}
//                                             placeholder="Masukkan kode dari teman"
//                                             onChange={(e) => {
//                                                 const cleaned = e.target.value.toLowerCase().replace(/\s+/g, '');
//                                                 setData('referral_code', cleaned);
//                                             }}
//                                             className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
//                                             required
//                                         />
//                                     </div>
//                                     {errors.referral_code && (
//                                         <p className="text-red-500 text-sm mt-1">{errors.referral_code}</p>
//                                     )}

//                                     {referralValid === false && !errors.referral_code && (
//                                         <p className="text-red-500 text-sm mt-1">Kode referral tidak ditemukan.</p>
//                                     )}

//                                 </div>

//                                 <div className="flex flex-wrap items-center justify-between mt-4 w-full">
//                                     <label className="flex items-center">
//                                         <input
//                                             type="checkbox"
//                                             checked={isChecked}
//                                             onChange={() => setIsChecked(!isChecked)}
//                                             className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                         />
//                                         <p className="ml-2 text-sm text-gray-600">
//                                             Saya Menyetujui{" "}
//                                             <Link
//                                                 href={route('privacy')}
//                                                 className="text-blue-500 hover:underline"
//                                             >
//                                                 kebijakan layanan kami
//                                             </Link>
//                                         </p>
//                                     </label>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     className={`w-full text-white p-2 rounded transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
//                                         }`}
//                                     disabled={!isFormValid || processing}
//                                 >
//                                     {processing ? "Pendaftaran..." : "Daftar"}
//                                 </button>

//                                 <p className=" w-full px-4 py-8 text-center text-sm text-gray-600 font-utama">
//                                     Udah punya akun?{' '}
//                                     <a
//                                         href="login"
//                                         className="text-blue-500 font-semibold hover:underline"
//                                     >
//                                         Login di sini
//                                     </a>
//                                 </p>

//                             </div>
//                         </form>
//                     </section>
//                 </div>
//             </div>
//         </>
//     );
// }


























// referal opsional

import { useEffect, useState } from 'react';
import { Link, Head, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        referral_code: '',
    });

    const [referralValid, setReferralValid] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setData('referral_code', ref);
        }
    }, []);


    useEffect(() => {
        if (data.referral_code.trim() === '') {
            setReferralValid(null);
            return;
        }

        const timeout = setTimeout(() => {
            fetch('/check-referral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ referral_code: data.referral_code }),
            })
                .then(res => res.json())
                .then(data => setReferralValid(data.valid))
                .catch(() => setReferralValid(false));
        }, 500);

        return () => clearTimeout(timeout);
    }, [data.referral_code]);


    const [isChecked, setIsChecked] = useState(false);
    const isFormValid =
        data.name &&
        data.email &&
        data.password &&
        data.password_confirmation &&
        isChecked &&
        (data.referral_code === '' || referralValid === true);


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
            <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
                <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">

                    {/* section atas */}
                    <section className="w-full h-max flex flex-col items-center space-y-4 mb-6 px-4">
                        <img
                            src="/storage/logo_no_bg.png"
                            alt="Logo Muvausa Store"
                            className="w-20 p-1.5 border-4 border-white bg-white mx-auto"
                        />
                        <p className="font-utama text-xl font-bold text-center">Registrasi</p>
                        <p className="font-utama text-base font-medium text-gray-600 text-center">
                            Daftar dulu, baru login
                        </p>
                    </section>

                    {/* section form register */}
                    <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
                        <form onSubmit={submit} className="w-full">
                            <div className="w-full h-max flex flex-col space-y-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Nama Lengkap</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="name"
                                            type="text"
                                            name="name"
                                            value={data.name}
                                            placeholder="Diisi bebas, yang penting inget"
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Email</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            placeholder="Wajib banget email aktif"
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Password</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            placeholder="Bikin yang susah ditebak"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Konfirmasi Password</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            placeholder="Samain kayak kolom password"
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            className="bg-transparent text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400"
                                            required
                                        />
                                    </div>
                                    {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                                </div>

                                <div>
                                    <label className="block text-gray-700 mb-1">Kode Afiliasi Teman (opsional)</label>
                                    <div className="w-full h-9 flex items-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        <input
                                            id="referral_code"
                                            type="text"
                                            name="referral_code"
                                            value={data.referral_code}
                                            placeholder="Masukkan kode afiliasi teman"
                                            onChange={(e) => {
                                                const cleaned = e.target.value.toLowerCase().replace(/\s+/g, '');
                                                setData('referral_code', cleaned);
                                            }}
                                            disabled={referralValid === true}
                                            className={`
                                                    text-sm border-none w-full focus:ring-0 focus:outline-none placeholder-gray-400
                                                    ${referralValid === true
                                                    ? 'bg-neutral-200 text-gray-600 cursor-not-allowed'
                                                    : 'bg-transparent text-gray-900'}
    `}
                                        />

                                    </div>
                                    {errors.referral_code && (
                                        <p className="text-red-500 text-sm mt-1">{errors.referral_code}</p>
                                    )}

                                    {referralValid === true && (
                                        <p className="text-green-600 text-sm mt-1">Kode afiliasi valid.</p>
                                    )}


                                    {referralValid === false && !errors.referral_code && (
                                        <p className="text-red-500 text-sm mt-1">Kode afiliasi tidak ditemukan.</p>
                                    )}

                                </div>

                                <div className="flex flex-wrap items-center justify-between mt-4 w-full">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <p className="ml-2 text-sm text-gray-600">
                                            Saya Menyetujui{" "}
                                            <Link
                                                href={route('privacy')}
                                                className="text-blue-500 hover:underline"
                                            >
                                                kebijakan layanan kami
                                            </Link>
                                        </p>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full text-white p-2 rounded transition ${!isFormValid ? "bg-gray-400 cursor-not-allowed" : processing ? "bg-gray-400" : "bg-main hover:bg-blue-700"
                                        }`}
                                    disabled={!isFormValid || processing}
                                >
                                    {processing ? "Pendaftaran..." : "Daftar"}
                                </button>

                                <p className=" w-full px-4 py-8 text-center text-sm text-gray-600 font-utama">
                                    Udah punya akun?{' '}
                                    <a
                                        href="login"
                                        className="text-blue-500 font-semibold hover:underline"
                                    >
                                        Login di sini
                                    </a>
                                </p>

                            </div>
                        </form>
                    </section>
                </div>
            </div>
        </>
    );
}
