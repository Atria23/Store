// import React from "react";
// import { useForm } from "@inertiajs/react";

// const Admin = ({ admin }) => {
//     const { data, setData, post, processing, errors } = useForm({
//         shopeepay: admin?.shopeepay?.toString() || "",
//         shopeepay_status: admin?.shopeepay_status || false,
//         dana: admin?.dana?.toString() || "",
//         dana_status: admin?.dana_status || false,
//         gopay: admin?.gopay?.toString() || "",
//         gopay_status: admin?.gopay_status || false,
//         ovo: admin?.ovo?.toString() || "",
//         ovo_status: admin?.ovo_status || false,
//         linkaja: admin?.linkaja?.toString() || "",
//         linkaja_status: admin?.linkaja_status || false,
//         wallet_is_active: admin?.wallet_is_active || false,
//         admin_status: admin?.admin_status || false,
//     });

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         post(route("admin.update")); // Gunakan metode POST
//     };

//     return (
//         <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
//             <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 {[ // Input e-wallet
//                     { name: "shopeepay", label: "ShopeePay" },
//                     { name: "dana", label: "Dana" },
//                     { name: "gopay", label: "GoPay" },
//                     { name: "ovo", label: "OVO" },
//                     { name: "linkaja", label: "LinkAja" },
//                 ].map(({ name, label }) => (
//                     <div key={name}>
//                         <label htmlFor={name} className="block font-medium">
//                             {label}
//                         </label>
//                         <input
//                             type="number"
//                             id={name}
//                             value={data[name]}
//                             onChange={(e) => {
//                                 const value = e.target.value;
//                                 setData(name, value === "" ? "" : value.toString());
//                             }}
//                             onWheel={(e) => e.target.blur()}
//                             className="w-full mt-1 p-2 border rounded"
//                         />
//                         {errors[name] && (
//                             <div className="text-red-500 text-sm">
//                                 {errors[name]}
//                             </div>
//                         )}
//                     </div>
//                 ))}

//                 {[ // Checkbox status
//                     { name: "shopeepay_status", label: "ShopeePay Status" },
//                     { name: "dana_status", label: "Dana Status" },
//                     { name: "gopay_status", label: "GoPay Status" },
//                     { name: "ovo_status", label: "OVO Status" },
//                     { name: "linkaja_status", label: "LinkAja Status" },
//                     { name: "wallet_is_active", label: "Wallet Active" },
//                     { name: "admin_status", label: "Admin Status" },
//                 ].map(({ name, label }) => (
//                     <div key={name} className="flex items-center space-x-2">
//                         <input
//                             type="checkbox"
//                             id={name}
//                             checked={data[name]}
//                             onChange={(e) => setData(name, e.target.checked)}
//                             className="h-4 w-4"
//                         />
//                         <label htmlFor={name} className="font-medium">
//                             {label}
//                         </label>
//                     </div>
//                 ))}
//                 <button
//                     type="submit"
//                     disabled={processing}
//                     className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
//                 >
//                     {processing ? "Processing..." : "Save Changes"}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default Admin;




















import React from "react";
import { Head, useForm } from "@inertiajs/react";

const wallets = [
    { name: "shopeepay", label: "ShopeePay", logo: "/storage/payment_method/shopeepay.png" },
    { name: "dana", label: "Dana", logo: "/storage/payment_method/dana.png" },
    { name: "gopay", label: "GoPay", logo: "/storage/payment_method/gopay.png" },
    { name: "ovo", label: "OVO", logo: "/storage/payment_method/ovo.png" },
];

const Admin = ({ admin }) => {
    const { data, setData, post, processing, errors } = useForm({
        shopeepay: admin?.shopeepay || "",
        shopeepay_status: admin?.shopeepay_status || false,
        dana: admin?.dana || "",
        dana_status: admin?.dana_status || false,
        gopay: admin?.gopay || "",
        gopay_status: admin?.gopay_status || false,
        ovo: admin?.ovo || "",
        ovo_status: admin?.ovo_status || false,
        wallet_is_active: admin?.wallet_is_active || false,
        admin_status: admin?.admin_status || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.update"));
    };

    return (
        <>
            <Head title="Deposit" />
            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
                {/* fixed position */}

                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <div className="w-full flex flex-row space-x-4 items-center justify-start">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            Deposit
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="pt-[60px] p-4 space-y-4">
                    {/* Informasi Admin */}
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-600">Informasi Admin</h2>

                        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-main" viewBox="0 0 16 16">
                                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                    <path fill-rule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                                </svg>
                                <span className="text-sm font-medium">Status Admin</span>
                            </div>
                            <div
  onClick={() => setData("admin_status", !data.admin_status)}
  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
    data.admin_status ? "bg-main" : "bg-gray-300"
  }`}
>
  <div
    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
      data.admin_status ? "translate-x-5" : "translate-x-0"
    }`}
  ></div>
</div>

                        </div>

                        <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-main" viewBox="0 0 16 16">
                                    <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
                                    <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z" />
                                </svg>
                                <span className="text-sm font-medium">Penerimaan Pembayaran</span>
                            </div>
                            <div
  onClick={() => setData("wallet_is_active", !data.wallet_is_active)}
  className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer transition ${
    data.wallet_is_active ? "bg-main" : "bg-gray-300"
  }`}
>
  <div
    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
      data.wallet_is_active ? "translate-x-5" : "translate-x-0"
    }`}
  ></div>
</div>

                        </div>
                    </div>

                    {/* Informasi Rekening */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-600 mb-2">Informasi Rekening</h2>
                        {wallets.map(({ name, label, logo }) => (
                            <div key={name} className="bg-white rounded-xl shadow px-4 py-3 mb-4 space-y-3">
                                {/* Baris 1: Logo + Nama & Input */}
                                <div className="flex items-center gap-3">
                                    <img src={logo} alt={label} className="w-16 object-contain" />
                                    <div className="flex flex-col flex-grow space-y-2">
                                        <p className="font-utama font-medium text-base text-gray-800">
                                            {label.split(" (")[0]}
                                        </p>
                                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">

                                            <input
                                                type="text"
                                                value={data[name]}
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                onWheel={(e) => e.target.blur()}
                                                onChange={(e) => setData(name, e.target.value)}
                                                placeholder="088888888888"
                                                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400 text-sm"
                                            />
                                        </div>
                                        {errors[name] && (
                                            <p className="text-xs text-red-500">{errors[name]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Baris 2: Divider */}
                                <hr className="border-t border-gray-300" />

                                {/* Baris 3: Checkbox */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={data[`${name}_status`]}
                                        onChange={(e) => setData(`${name}_status`, e.target.checked)}
                                        className="h-5 w-5 rounded-full accent-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">Aktifkan rekening ini</span>
                                </div>
                            </div>
                        ))}

                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-main text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        {processing ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Admin;
