import { usePage, Head } from '@inertiajs/react';
import { useState } from 'react';

const tutorials = {
  qris_otomatis: [
    { src: '/storage/payment_method/tutorial/qris_otomatis/1.jpg', title: 'Akses Menu Deposit', desc: 'Akses menu deposit melalui beranda.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/2.jpg', title: 'Masukkan Nominal', desc: 'Minimal menginput nominal 1.000.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/3.jpg', title: 'Pilih QRIS Otomatis', desc: 'Memilih metode pembayaran QRIS Otomatis.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/4.jpg', title: 'Ajukan Deposit', desc: 'Klik tombol ajukan deposit.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/5.jpg', title: 'Pilih Riwayat Teratas', desc: 'Memilih riwayat deposit teratas.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/6.jpg', title: 'Perhatikan Nominal Bayar & Batas Bayar', desc: 'Klik ikon salin pada total bayar dan pastikan belum melewati batas bayar.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/7.jpg', title: 'Scan Kode QR', desc: 'Scan menggunakan aplikasi e-wallet/m-banking apa pun yang mendukung pembayaran QRIS.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/8.jpg', title: 'Bayar Sesuai Total Bayar', desc: 'Lakukan pembayaran senilai total bayar yang tertera pada halaman detail pembayaran. Jika salah nominal, saldo tidak akan terkonfirmasi oleh sistem' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/9.jpg', title: 'Klik Konfirmasi Deposit', desc: 'Kembali ke halaman detail pembayaran, kemudian klik tombol konfirmasi deposit.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/10.jpg', title: 'Status Menjadi Confirmed', desc: 'Pastikan status deposit berubah menjadi confirmed.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/11.jpg', title: 'Saldo Masuk', desc: 'Saldo DompetMu (Dompet Muvausa) bertambah sesuai total saldo masuk yang tertera pada halaman detail pembayaran.' },
  ],
  qris_ovo: [
    { src: '/storage/payment_method/tutorial/qris_ovo/1.jpg', title: 'Akses Menu Deposit', desc: 'Akses menu deposit melalui beranda.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/2.jpg', title: 'Masukkan Nominal', desc: 'Minimal menginput nominal 1.000.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/3.jpg', title: 'Pilih QRIS Ovo', desc: 'Memilih metode pembayaran QRIS Ovo.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/4.jpg', title: 'Ajukan Deposit', desc: 'Klik tombol ajukan deposit.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/5.jpg', title: 'Pilih Riwayat Teratas', desc: 'Memilih riwayat deposit teratas.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/6.jpg', title: 'Perhatikan Nominal Bayar & Batas Bayar', desc: 'Klik ikon salin pada total bayar dan pastikan belum melewati batas bayar.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/7.jpg', title: 'Scan Kode QR', desc: 'Scan menggunakan aplikasi e-wallet/m-banking apa pun yang mendukung pembayaran QRIS.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/8.jpg', title: 'Bayar Sesuai Total Bayar', desc: 'Lakukan pembayaran senilai total bayar yang tertera pada halaman detail pembayaran. Jika salah nominal, saldo tidak akan terkonfirmasi oleh sistem' },
    { src: '/storage/payment_method/tutorial/qris_ovo/9.jpg', title: 'Unggah Bukti Bayar', desc: 'Klik tombol unggah bukti pembayaran dan pilih bukti pembayaran yang telah dilakukan.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/10.jpg', title: 'Status Menjadi Confirmed', desc: 'Pastikan status deposit berubah menjadi confirmed.' },
    { src: '/storage/payment_method/tutorial/qris_ovo/11.jpg', title: 'Saldo Masuk', desc: 'Saldo DompetMu (Dompet Muvausa) bertambah sesuai total saldo masuk yang tertera pada halaman detail pembayaran.' },
  ],
  qris_dana: [
    { src: '/storage/payment_method/tutorial/qris_dana/1.jpg', title: 'Akses Menu Deposit', desc: 'Akses menu deposit melalui beranda.' },
    { src: '/storage/payment_method/tutorial/qris_dana/2.jpg', title: 'Masukkan Nominal', desc: 'Minimal menginput nominal 1.000.' },
    { src: '/storage/payment_method/tutorial/qris_dana/3.jpg', title: 'Pilih QRIS Dana', desc: 'Memilih metode pembayaran QRIS Dana.' },
    { src: '/storage/payment_method/tutorial/qris_dana/4.jpg', title: 'Ajukan Deposit', desc: 'Klik tombol ajukan deposit.' },
    { src: '/storage/payment_method/tutorial/qris_dana/5.jpg', title: 'Pilih Riwayat Teratas', desc: 'Memilih riwayat deposit teratas.' },
    { src: '/storage/payment_method/tutorial/qris_dana/6.jpg', title: 'Perhatikan Nominal Bayar & Batas Bayar', desc: 'Klik ikon salin pada total bayar dan pastikan belum melewati batas bayar.' },
    { src: '/storage/payment_method/tutorial/qris_dana/7.jpg', title: 'Scan Kode QR', desc: 'Scan menggunakan aplikasi e-wallet/m-banking apa pun yang mendukung pembayaran QRIS.' },
    { src: '/storage/payment_method/tutorial/qris_dana/8.jpg', title: 'Bayar Sesuai Total Bayar', desc: 'Lakukan pembayaran senilai total bayar yang tertera pada halaman detail pembayaran. Jika salah nominal, saldo tidak akan terkonfirmasi oleh sistem' },
    { src: '/storage/payment_method/tutorial/qris_dana/9.jpg', title: 'Unggah Bukti Bayar', desc: 'Klik tombol unggah bukti pembayaran dan pilih bukti pembayaran yang telah dilakukan.' },
    { src: '/storage/payment_method/tutorial/qris_dana/10.jpg', title: 'Status Menjadi Confirmed', desc: 'Pastikan status deposit berubah menjadi confirmed.' },
    { src: '/storage/payment_method/tutorial/qris_dana/11.jpg', title: 'Saldo Masuk', desc: 'Saldo DompetMu (Dompet Muvausa) bertambah sesuai total saldo masuk yang tertera pada halaman detail pembayaran.' },
  ],
  qris_gopay: [
    { src: '/storage/payment_method/tutorial/qris_gopay/1.jpg', title: 'Akses Menu Deposit', desc: 'Akses menu deposit melalui beranda.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/2.jpg', title: 'Masukkan Nominal', desc: 'Minimal menginput nominal 1.000.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/3.jpg', title: 'Pilih QRIS Gopay', desc: 'Memilih metode pembayaran QRIS Gopay.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/4.jpg', title: 'Ajukan Deposit', desc: 'Klik tombol ajukan deposit.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/5.jpg', title: 'Pilih Riwayat Teratas', desc: 'Memilih riwayat deposit teratas.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/6.jpg', title: 'Perhatikan Nominal Bayar & Batas Bayar', desc: 'Klik ikon salin pada total bayar dan pastikan belum melewati batas bayar.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/7.jpg', title: 'Scan Kode QR', desc: 'Scan menggunakan aplikasi e-wallet/m-banking apa pun yang mendukung pembayaran QRIS.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/8.jpg', title: 'Bayar Sesuai Total Bayar', desc: 'Lakukan pembayaran senilai total bayar yang tertera pada halaman detail pembayaran. Jika salah nominal, saldo tidak akan terkonfirmasi oleh sistem' },
    { src: '/storage/payment_method/tutorial/qris_gopay/9.jpg', title: 'Unggah Bukti Bayar', desc: 'Klik tombol unggah bukti pembayaran dan pilih bukti pembayaran yang telah dilakukan.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/10.jpg', title: 'Status Menjadi Confirmed', desc: 'Pastikan status deposit berubah menjadi confirmed.' },
    { src: '/storage/payment_method/tutorial/qris_gopay/11.jpg', title: 'Saldo Masuk', desc: 'Saldo DompetMu (Dompet Muvausa) bertambah sesuai total saldo masuk yang tertera pada halaman detail pembayaran.' },
  ],
  qris_shopeepay: [
    { src: '/storage/payment_method/tutorial/qris_otomatis/1.jpg', title: 'Akses Menu Deposit', desc: 'Akses menu deposit melalui beranda.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/2.jpg', title: 'Masukkan Nominal', desc: 'Minimal menginput nominal 1.000.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/3.jpg', title: 'Pilih QRIS Otomatis', desc: 'Memilih metode pembayaran QRIS Otomatis.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/4.jpg', title: 'Ajukan Deposit', desc: 'Klik tombol ajukan deposit.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/5.jpg', title: 'Pilih Riwayat Teratas', desc: 'Memilih riwayat deposit teratas.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/6.jpg', title: 'Perhatikan Nominal Bayar & Batas Bayar', desc: 'Klik ikon salin pada total bayar dan pastikan belum melewati batas bayar.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/7.jpg', title: 'Scan Kode QR', desc: 'Scan menggunakan aplikasi e-wallet/m-banking apa pun yang mendukung pembayaran QRIS.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/8.jpg', title: 'Bayar Sesuai Total Bayar', desc: 'Lakukan pembayaran senilai total bayar yang tertera pada halaman detail pembayaran. Jika salah nominal, saldo tidak akan terkonfirmasi oleh sistem' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/9.jpg', title: 'Unggah Bukti Bayar', desc: 'Klik tombol unggah bukti pembayaran dan pilih bukti pembayaran yang telah dilakukan.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/10.jpg', title: 'Status Menjadi Confirmed', desc: 'Pastikan status deposit berubah menjadi confirmed.' },
    { src: '/storage/payment_method/tutorial/qris_otomatis/11.jpg', title: 'Saldo Masuk', desc: 'Saldo DompetMu (Dompet Muvausa) bertambah sesuai total saldo masuk yang tertera pada halaman detail pembayaran.' },
  ],
};

export default function DepositTutorial() {
  const { props } = usePage();
  const method = props.method || 'shopeepay';
  const steps = tutorials[method] || [];

  const [step, setStep] = useState(0);
  const { src, title, desc } = steps[step] || {};

  const handlePrev = () => setStep((s) => (s === 0 ? steps.length - 1 : s - 1));
  const handleNext = () => setStep((s) => (s === steps.length - 1 ? 0 : s + 1));

  return (
    <>
      <Head title="Tutorial Deposit" />
      <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">

{/* Header */}
<header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
  <div className="w-full flex flex-row space-x-4 items-center justify-start">
    <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
      </svg>
    </button>
    <div className="font-utama text-white font-bold text-lg">
      Tutorial Deposit
    </div>
  </div>
</header>

    <section className="w-full bg-[#F5F7FA] py-12 px-6 mt-4">
      <div className="max-w-[500px] mx-auto flex flex-col gap-6 items-center relative">
      <h2 className="text-2xl font-bold text-center text-main">
  Cara Deposit Via {method.replace(/_/g, ' ').toUpperCase()}
</h2>
<p className="text-gray-600 text-center text-sm">
  Ikuti langkah berikut ini untuk melakukan deposit via {method.replace(/_/g, ' ').toUpperCase()}.
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
    </div>
    </>
  );
}
