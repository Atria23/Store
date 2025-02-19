// import React, { useState } from "react";
// import BannerSlider from "@/Components/BannerSlider";
// import ProductCategories from "@/Components/ProductCategories";
// import Footer from "./Footer";

// function Profile({ user }) {
//   const [showBalance, setShowBalance] = useState(false);

//   const toggleBalanceVisibility = () => {
//     setShowBalance(!showBalance);
//   };

//   return (
//     <>
//       <div className="relative min-h-screen pb-16">
//         <div className="bg-white">
//           <div className="relative z-10 bg-[#0055bb] rounded-b-2xl">
//             <section className="text-white flex justify-between items-center px-6 py-8">
//               <div>
//                 <p className="text-3xl font-bold">{user.name}!</p>
//                 <p className="text-3xl font-bold">{user.email}</p>
//               </div>
//               <div className="text-right">
//                 <p><span className="bg-blue-100 text-blue-800 text-lg font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{user.transactions} trx</span></p>
//                 <br />
//               </div>
//             </section>

//             <section className="bg-white p-6 rounded-xl shadow-lg">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-lg font-bold text-gray-800">Saldo</h2>
//               </div>
//               <div className="flex items-center space-x-4">
//                 <p className="text-3xl font-bold text-gray-800">
//                   {showBalance ? `Rp${user.balance.toLocaleString('id-ID')}` : "••••••••"}
//                 </p>
//                 <button
//                   onClick={toggleBalanceVisibility}
//                   className="text-blue-500 hover:text-blue-700"
//                 >
//                   {showBalance ? (
//                     <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#0055bb" className="bi bi-eye-fill" viewBox="0 0 16 16">
//                       <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
//                       <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
//                     </svg>
//                   ) : (
//                     <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#0055bb" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
//                       <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
//                       <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
//                     </svg>
//                   )}
//                 </button>
//               </div>
//               <div className="flex justify-between items-center mt-2  ">
//                 <div>
//                   <p className="text-gray-600">PoinMu</p>
//                   <p className="text-xl font-bold text-green-600">{user.points}</p>
//                 </div>
//                 <button className="bg-[#0055bb] hover:bg-blue-500 text-white py-2 px-4 rounded-lg shadow">
//                   Tukar
//                 </button>
//               </div>

//               {/* akses cepat */}
//               <div className="mt-4">
//                 <div className="w-full h-px bg-gray-300 mb-6"></div>
//                 <div className="grid grid-cols-4 gap-4">
//                   {/* Deposit */}
//                   <a href="/deposit/create">
//                     <div className="flex flex-col items-center">
//                       <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
//                         <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
//                           <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
//                           <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                       <p className="mt-2 text-sm text-center">Deposit</p>
//                     </div>
//                   </a>
//                   {/* Mutasi */}
//                   <div className="flex flex-col items-center">
//                     <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
//                       <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
//                         <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 20V7m0 13-4-4m4 4 4-4m4-12v13m0-13 4 4m-4-4-4 4" />
//                       </svg>
//                     </div>
//                     <p className="mt-2 text-sm text-center">Mutasi</p>
//                   </div>
//                   {/* Riwayat Deposit */}
//                   <a href="/deposit">
//                     <div className="flex flex-col items-center">
//                       <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
//                         <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
//                           <path fillRule="evenodd" d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z" clipRule="evenodd" />
//                           <path fillRule="evenodd" d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clipRule="evenodd" />
//                           <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
//                         </svg>
//                       </div>
//                       <p className="mt-2 text-sm text-center">Riwayat Deposit</p>
//                     </div>
//                   </a>
//                   {/* Riwayat Transaksi */}
//                   <a href="/history">
//                     <div className="flex flex-col items-center">
//                       <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
//                         <svg className="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
//                           <path fillRule="evenodd" d="M5.617 2.076a1 1 0 0 1 1.09.217L8 3.586l1.293-1.293a1 1 0 0 1 1.414 0L12 3.586l1.293-1.293a1 1 0 0 1 1.414 0L16 3.586l1.293-1.293A1 1 0 0 1 19 3v18a1 1 0 0 1-1.707.707L16 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L12 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L8 20.414l-1.293 1.293A1 1 0 0 1 5 21V3a1 1 0 0 1 .617-.924ZM9 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clipRule="evenodd" />
//                         </svg>
//                       </div>
//                       <p className="mt-2 text-sm text-center">Riwayat Transaksi</p>
//                     </div>
//                   </a>
//                 </div>
//               </div>
//             </section>

//           </div>

//           {/* Section 3 */}
//           <section className="bg-white p-6 rounded-xl shadow-lg">
//             <BannerSlider />
//           </section>

//           {/* Section 4 */}
//           <section className="bg-white p-6 rounded-xl shadow-lg">
//             {/* <h2 className="text-xl font-bold mb-4 text-gray-800">
//               Kategori Produk
//             </h2> */}
//             <ProductCategories />
//           </section>
//         </div>
//       </div>






//       <Footer />
//     </>
//   );
// }

// export default Profile;









import React, { useState } from "react";
import Footer from "./Footer";
import { Head } from '@inertiajs/react';


function Profile({ user }) {
    const [showBalance, setShowBalance] = useState(false);
    const [imagePreview, setImagePreview] = useState(
        user?.avatar ? `${user.avatar}` : "/storage/logo.webp"
    );

    const toggleBalanceVisibility = () => {
        setShowBalance(!showBalance);
    };

    return (
        <>
            <Head title="Profile" />
            <div className="relative min-h-screen">
                <div className="pb-24">
                    <section className="bg-[#0055bb]">
                        <div className="text-white flex justify-between items-center px-6 py-8 md:pb-32 pb-20">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={imagePreview}
                                    alt="Logo Muvausa Store"
                                    className="md:w-20 md:h-20 w-12 h-12 p-1.5 border-2 border-white rounded-full shadow-lg bg-white"
                                    onError={(e) => (e.target.src = "/storage/logo.webp")}
                                />
                                <div className="flex flex-col">
                                    <p className="md:text-3xl text-sm font-bold truncate max-w-[200px] md:max-w-[500px]">{user.name}</p>
                                    <p className="md:text-3xl text-sm font-bold truncate max-w-[200px] md:max-w-[500px]">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center text-right">
                                <p>
                                    <span className="bg-blue-100 text-blue-800 md:text-xl text-sm font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                        {user.transactions} trx
                                    </span>
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="px-6 md:-mt-20 -mt-16">
                        {/* Card Saldo dan Poin */}
                        <div className="bg-white shadow-lg rounded-lg p-6 max-w-6xl mx-auto mt-4 flex justify-between items-center hover:shadow-2xl hover:bg-blue-50 transition-all duration-300">
                            {/* Balance Section */}
                            <div className="flex items-center justify-start flex-1">
                                <div className="flex items-center space-x-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#0055bb]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                        <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-700 font-semibold text-sm md:text-base lg:text-lg">
                                            Rp{user.balance.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">Balance</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vertical Divider */}
                            <div className="h-12 border-l-2 border-gray-300 mx-6"></div>

                            {/* Points Section */}
                            <div className="flex items-center justify-start flex-1">
                                <div className="flex items-center space-x-4">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#0055bb]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                                    </svg>
                                    <div>
                                        <p className="text-gray-700 font-semibold text-sm md:text-base lg:text-lg">
                                            {user.points.toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-gray-900 font-medium text-sm md:text-base lg:text-lg">Points</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 2 Full Width Menu Cards */}
                        <div className="grid grid-cols-2 gap-6 md:my-6 my-3 sm:grid-cols-2 max-w-6xl mx-auto">
                            {/* Menu 1: Deposit */}
                            <a href="/deposit/create" className="flex items-center bg-white text-gray-900 p-8 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition duration-300">
                                <div className="flex items-center w-full justify-between">
                                    <div className="flex items-center">
                                        <svg className="w-6 sm:w-10 text-[#0055bb] mr-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm md:text-base font-bold text-[#0055bb]">Deposit</p>
                                    </div>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>

                            {/* Menu 2: Riwayat Transaksi */}
                            <a href="/history" className="flex items-center bg-white text-gray-900 p-8 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-50 transition duration-300">
                                <div className="flex items-center w-full justify-between">
                                    <div className="flex items-center">
                                        <svg className="w-6 sm:w-10 text-[#0055bb] mr-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                                            <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-sm md:text-base font-bold text-[#0055bb]">Transaksi</p>
                                    </div>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>
                        </div>
                    </section>

                    <section className="px-6">
                        <div className="max-w-6xl mx-auto">
                            <p className="text-gray-700 font-semibold text-lg opacity-80">Menu Akun</p>
                            <a href="/account">
                                <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                    <p className="text-gray-900 font-medium">Pengaturan Akun</p>
                                    <span className="text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </div>
                            </a>
                            <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                <p className="text-gray-900 font-medium">Option 2</p>
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                <p className="text-gray-900 font-medium">Option 3</p>
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-4 mt-4 flex justify-between items-center hover:shadow-lg hover:bg-blue-50 transition-all duration-200">
                                <p className="text-gray-900 font-medium">Option 4</p>
                                <span className="text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Profile;
