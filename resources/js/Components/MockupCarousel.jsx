import { useState } from "react";

const mockups = [
  {
    src: "/storage/mockup/cetak_struk.jpeg",
    title: "Cetak Struk Dinamis",
    desc: "Unduh & cetak struk untuk kertas dengan lebar 58mm, tersedia dalam dua ukuran font.",
  },
  {
    src: "/storage/mockup/struk_unduhan.jpeg",
    title: "Hasil Unduhan Struk",
    desc: "Simpan bukti transaksi dalam format digital.",
  },
  {
    src: "/storage/mockup/edit_harga_dan_cetak.jpeg",
    title: "Transaksi & Cetak Struk",
    desc: "Kelola transaksi, ubah data toko, harga, admin, dan unduh struk dalam satu halaman yang praktis.",
  },
  {
    src: "/storage/mockup/edit_toko.jpeg",
    title: "Kelola Profil Toko",
    desc: "Ubah informasi toko seperti nama, alamat, dan nomor telepon toko sesuai kebutuhan.",
  },
  {
    src: "/storage/mockup/edit_harga_dan_admin.jpeg",
    title: "Edit Harga & Biaya Admin",
    desc: "Atur harga jual dan biaya admin sesukamu.",
  }
];

export default function MockupCarousel() {
  const [current, setCurrent] = useState(0);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? mockups.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev === mockups.length - 1 ? 0 : prev + 1));
  };

  const { src, title, desc } = mockups[current];

  return (
    <section className="w-full bg-[#F5F7FA] py-12 px-6">
      <div className="max-w-[500px] mx-auto flex flex-col gap-6 items-center relative">
        <h2 className="text-2xl font-bold text-center text-main">Tampilan Aplikasi</h2>
        <p className="text-gray-600 text-center text-sm">
          Jelajahi antarmuka website Muvausa Store, dan nikmati beragam fitur yang telah disediakan.
        </p>

        <div className="flex flex-row items center justify-center space-x-4">
          <button
            onClick={handlePrev}
            className="text-main"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-12 h-12" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-4.5-.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z" />
            </svg>
          </button>

          <div className="relative max-w-[300px] max-h-[620px] border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] shadow-xl">
            <div className="max-w-[148px] max-h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute" />
            <div className="max-h-[46px] max-w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg" />
            <div className="max-h-[46px] max-w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg" />
            <div className="max-h-[64px] max-w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg" />

            <div className="rounded-[2rem] overflow-hidden max-w-[272px] max-h-[572px] bg-white mx-auto mt-0">
              <img src={src} alt={title} className="w-full h-full object-cover" />
            </div>
          </div>

          <button
            onClick={handleNext}
            className="text-main"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-12 h-12" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8m15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
            </svg>
          </button>
        </div>

        {/* Title & Description */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-main">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{desc}</p>
        </div>
      </div>
    </section>
  );
}
