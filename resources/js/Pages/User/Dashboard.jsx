import React, { useState } from "react";
import BannerSlider from "@/Components/BannerSlider";
import Footer from "../../Components/Footer";
import { Head, Link } from "@inertiajs/react";

function Dashboard({ user, categories }) {
  const [showBalance, setShowBalance] = useState(false);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  // --- START: Penambahan Kategori Manual ---

  // Definisikan kategori manual Anda
  const manualCategories = [
    // {
    //   id: 'manual-postpaid', // ID unik
    //   name: 'Pascabayar',
    //   image: null, // Untuk kategori ini, kita pakai iconSvg, jadi image null
    //   iconSvg: ( // Ikon Pascabayar dalam bentuk SVG
    //     <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
    //         <path d="M1.92.506a.5.5 0 0 1 .43.234L4.2 3.568l.492.298.927-1.107a.5.5 0 0 1 .795-.078l.385.498.42-.42a.5.5 0 0 1 .708 0l.42.42.385-.498a.5.5 0 0 1 .795.078l.927 1.107.492-.298 1.85-.925a.5.5 0 0 1 .43-.234L15.93 1.5l.006.182-.298 1.127-.781 2.924a.5.5 0 0 1-.498.406L14 6.136V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6.136l-.35-.076a.5.5 0 0 1-.498-.406L.064 2.809.058 2.627zM2.52 1.258l-.66 2.476 1.134.619.66-2.476zm11.96 0 .66 2.476-1.134.619-.66-2.476zM4 14a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7a1 1 0 0 0-.293-.707L11 5.586V7.07l.35.076a.5.5 0 0 1 .498.406l.781 2.924.298 1.127-.006-.182a.5.5 0 0 1-.43-.234l-1.85-.925-.492-.298-.927 1.107a.5.5 0 0 1-.795.078l-.385-.498-.42.42a.5.5 0 0 1-.708 0l-.42-.42-.385.498a.5.5 0 0 1-.795-.078l-.927-1.107-.492.298-1.85.925a.5.5 0 0 1-.43.234l-.006.182 1.134-.619-.66-2.476a.5.5 0 0 1 .498-.406L4 7.07V5.586l.293.707A1 1 0 0 0 5 7z"/>
    //         <path d="M8 8a.5.5 0 0 1 .5.5H10a.5.5 0 0 1 0 1H8.5a.5.5 0 0 1-.5-.5V8zM8 10a.5.5 0 0 1 .5.5H10a.5.5 0 0 1 0 1H8.5a.5.5 0 0 1-.5-.5V10zM8 12a.5.5 0 0 1 .5.5H10a.5.5 0 0 1 0 1H8.5a.5.5 0 0 1-.5-.5V12z"/>
    //     </svg>
    //   ),
    //   link: route('postpaid.history.index'), // Rute ke halaman riwayat pascabayar
    // },
    {
      id: 'pln', // ID unik
      name: 'Tagihan Listrik',
      image: 'categories/tagihan-listrik.png', // Contoh: path ke gambar PNG/JPG untuk promo
      iconSvg: null, // Untuk kategori ini, kita pakai image, jadi iconSvg null
      link: route('pascapln.index'), // Rute ke halaman promo
    },
    {
      id: 'pdam', // ID unik
      name: 'Air',
      image: 'categories/air.png', // Contoh: path ke gambar PNG/JPG untuk promo
      iconSvg: null, // Untuk kategori ini, kita pakai image, jadi iconSvg null
      link: route('pascapdam.index'), // Rute ke halaman promo
    },
    {
      id: 'bpjs', // ID unik
      name: 'BPJS',
      image: 'categories/bpjs.png', // Contoh: path ke gambar PNG/JPG untuk promo
      iconSvg: null, // Untuk kategori ini, kita pakai image, jadi iconSvg null
      link: route('pascabpjs.index'), // Rute ke halaman promo
    },
    {
      id: 'internet', // ID unik
      name: 'Tagihan Internet',
      image: 'categories/tagihan-internet.png', // Contoh: path ke gambar PNG/JPG untuk promo
      iconSvg: null, // Untuk kategori ini, kita pakai image, jadi iconSvg null
      link: route('pascainternet.index'), // Rute ke halaman promo
    },
    {
      id: 'pbb', // ID unik
      name: 'PBB',
      image: 'logo.webp', // Contoh: path ke gambar PNG/JPG untuk promo
      iconSvg: null, // Untuk kategori ini, kita pakai image, jadi iconSvg null
      link: route('pascapbb.index'), // Rute ke halaman promo
    },
    // Tambahkan kategori manual lainnya di sini jika diperlukan:
    // {
    //   id: 'manual-other',
    //   name: 'Kategori Lain',
    //   image: '/storage/categories/another_icon.png', // Contoh gambar kustom
    //   iconSvg: null,
    //   link: '/some-other-route',
    // },
  ];

  // Gabungkan kategori dari props dan kategori manual
  const allCategories = [...categories, ...manualCategories];

  // --- END: Penambahan Kategori Manual ---

  return (
    <>
      <Head title="Dashboard" />
      <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
        {/* Header */}
        <section className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[500px] z-10 h-max flex flex-row space-x-4 items-center justify-center p-4 bg-main">
          <div className="w-full h-full flex flex-col my-auto items-start">
            <div className="font-utama text-white font-bold text-lg">
              Halo,
            </div>
            <div className="font-utama text-white font-bold text-lg">
              {user.name}
            </div>
          </div>
          <div className="w-[90px] h-max flex items-center justify-center px-2 py-1 rounded-3xl text-xs text-main bg-blue-50 border border-main">
            {user.transactions} trx
          </div>
        </section>

        {/* section saldo */}
        <section className="w-full h-max flex flex-col space-y-4 items-center justify-center px-4 pt-[105px] pb-4 rounded-b-[20px] bg-white">
          {/* card */}
          <div className="w-full max-w-[450px] flex flex-col space-y-3 items-start justify-start p-4 rounded-[20px] bg-main-white">
            {/* saldo */}
            <div className="w-max h-max flex flex-col">
              <p className="w-full h-max font-utama font-semibold text-sm text-left flex items-center">DompetMu</p>
              <div className="w-max h-max flex flex-row space-x-4 items-center justify-start">
                <p className="font-utama text-xl font-bold">
                  {showBalance ? `Rp${parseFloat(user.balance).toLocaleString('id-ID')}` : "••••••••"}
                </p>
                <button
                  onClick={toggleBalanceVisibility}
                  className="text-main hover:text-blue-700"
                >
                  {showBalance ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" className="bi bi-eye-slash-fill text-main" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                      <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" className="bi bi-eye-fill text-main" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-gray-200"></div>

            {/* poinmu */}
            <div className="w-full h-max flex flex-row justify-between items-center">
              <div className="w-[196px] h-max flex flex-row space-x-1 items-center justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-main" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                  <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
                </svg>
                <p className="font-utama text-md font-semibold text-left">{showBalance ? `${parseFloat(user.points).toLocaleString('id-ID')}` : "••••••••"}</p>
              </div>
              <a href={route('poinmu.dashboard')}>
                <div className="w-[103px] h-[26px] flex flex-row space-x-4 items-center justify-center px-4 py-2 rounded-[8px] bg-main">
                  <p className="font-utama text-sm font-medium text-left flex items-center justify-center text-white">Tukar</p>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
                  </svg>
                </div>
              </a>
            </div>

            <div className="w-full h-px bg-gray-200"></div>

            {/* menu saldo */}
            <div className="w-full grid grid-cols-2 min-[350px]:grid-cols-4 gap-4 justify-between px-4">
              {/* Item Menu 1 */}
              <a href={route('deposit.create')} className="flex flex-col items-center space-y-1">
                <div className="w-14 h-14 bg-white flex items-center justify-center rounded-full shadow">
                  <svg className="w-6 h-6 text-main" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-center text-xs">Deposit</p>
              </a>
              {/* Item Menu 2 */}
              <a href={route('affiliate.dashboard')} className="flex flex-col items-center space-y-1">
                <div className="w-14 h-14 bg-white flex items-center justify-center rounded-full shadow">
                  <svg className="w-6 h-6 text-main" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
                  </svg>
                </div>
                <p className="text-center text-xs">Afiliasi</p>
              </a>
              {/* Item Menu 3 */}
              <a href={route('deposit.history')} className="flex flex-col items-center space-y-1">
                <div className="w-14 h-14 bg-white flex items-center justify-center rounded-full shadow">
                  <svg className="w-6 h-6 text-main" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clipRule="evenodd" />
                    <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                  </svg>
                </div>
                <p className="text-center text-xs">Riwayat<br />Deposit</p>
              </a>
              {/* Item Menu 4 */}
              <a href={route('history')} className="flex flex-col items-center space-y-1">
                <div className="w-14 h-14 bg-white flex items-center justify-center rounded-full shadow">
                  <svg className="w-6 h-6 text-main" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M5.617 2.076a1 1 0 0 1 1.09.217L8 3.586l1.293-1.293a1 1 0 0 1 1.414 0L12 3.586l1.293-1.293a1 1 0 0 1 1.414 0L16 3.586l1.293-1.293A1 1 0 0 1 19 3v18a1 1 0 0 1-1.707.707L16 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L12 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L8 20.414l-1.293 1.293A1 1 0 0 1 5 21V3a1 1 0 0 1 .617-.924ZM9 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-center text-xs">Riwayat<br />Transaksi</p>
              </a>
            </div>
          </div>
        </section>

        {/* konten utama */}
        <div className="w-full max-w-[500px] flex flex-col space-y-7 pt-7 pb-20">
          {/* banner */}
          <section className="w-full px-6">
            <BannerSlider />
          </section>

          {/* section kategori */}
          <section className="w-full flex flex-col space-y-4 items-center justify-start">
            <div className="w-full px-4 max-w-[450px] grid grid-cols-4 gap-x-2 gap-y-4 flex items-start justify-between">
              {/* Gunakan allCategories yang sudah digabung */}
              {allCategories.map((category) => (
                <Link
                  key={category.id}
                  // Gunakan link kustom jika ada, jika tidak, gunakan format default
                  href={category.link || `/c=${category.name}`}
                  className="w-full h-full flex flex-col space-y-1 items-center justify-start"
                >
                  <div className="relative w-12 h-12 mx-auto">
                    <div className="absolute inset-0 w-12 h-12 bg-white rounded-full"></div>
                    {/* Logika Kondisional untuk memilih antara SVG atau Image */}
                    {category.iconSvg ? ( // Jika ada iconSvg, render SVG
                        <div className="w-8 h-8 flex items-center justify-center absolute inset-2">
                           {/* Kloning SVG untuk menambahkan className dinamis */}
                            {React.cloneElement(category.iconSvg, { className: "w-8 h-8 text-main" })}
                        </div>
                    ) : ( // Jika tidak ada iconSvg, cek apakah ada image path
                        <img
                            // Jika ada image path, gunakan itu, jika tidak, gunakan default.png
                            src={category.image ? `/storage/${category.image}` : "/storage/categories/default.png"}
                            alt={category.name}
                            className="w-8 h-8 rounded-full object-cover absolute inset-2"
                        />
                    )}
                  </div>
                  <p className="text-center text-xs">{category.name}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <Footer />
      </div >
    </>
  );
}

export default Dashboard;