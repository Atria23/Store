import React from "react";
import { Head } from '@inertiajs/react';

const PrivacyPolicy = () => {

    return (
        <>
            <Head title="Privacy Policy" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen">
                {/* fixed position */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    {/* Header */}
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            <div className="font-utama text-white font-bold text-lg">
                                Kebijakan Privasi
                            </div>
                        </div>
                    </div>
                </div>

                <section className="w-full flex flex-col space-y-2 pt-[51px] p-4">
                    <div className="w-full flex flex-col space-y-2 items-start justify-start">
                        <p className="font-utama text-sm text-justify text-gray-500">
                            Dengan bertransaksi di Muvausa Store, anda telah dianggap menyetujui semua kebijakan yang berlaku di sini.
                        </p>

                        <ol className="list-[upper-alpha] list-outside pl-4 space-y-3 text-sm font-utama text-gray-500">
                            {[
                                ['Keterangan Umum', 'Muvausa Store berperan dalam menjembatani pembeli dengan penyedia layanan, dan tidak termasuk bagian dari penyedia layanan itu sendiri. Kendala seperti sinyal internet lemah ataupun masalah terkait operator di luar kendali Muvausa Store.'],
                                ['Pembelian Produk', 'Informasi produk yang tertera di situs merupakan informasi dari operator penyedia layanan. Jika ada ketidaksesuaian terhadap produk yang dibeli, anda bisa langsung menghubungi operator penyedia layanan ataupun customer service Muvausa Store. Harga dapat berubah tanpa pemberitahuan, tergantung kebijakan penyedia layanan. Data pesanan diperoleh dari form input yang diisi pelanggan. Kesalahan data input bukan tanggung jawab Muvausa Store.'],
                                ['Pembayaran', 'Untuk menghindari ketidaksesuaian nominal pembayaran yang bisa berpengaruh terhadap kesuksesan pengiriman, pembayaran pesanan hanya bisa menggunakan saldo DompetMu.'],
                                ['Pembatalan Transaksi', 'Pembelian tidak bisa dibatalkan jika sedang dalam proses, dan besar kemungkinan batal secara otomatis apabila sedang maintenance maupun ketika gangguan nasional operator. Muvausa Store berhak membatalkan transaksi jika terindikasi melakukan tindak kejahatan termasuk pencucian uang.'],
                                ['Pengiriman Produk', 'Produk dikirim setelah pembayaran berhasil. Kesalahan pembeli bukan tanggung jawab Muvausa Store.'],
                                ['Deposit', 'Saldo deposit tak bisa diuangkan, kecuali alasan tertentu seperti aplikasi Muvausa Store yang berhenti beroperasi, sisa saldo akan di transfer ke rekening pembeli apabila mencukupi batas minimal transfer. Kesalahan nominal transfer ketika deposit wajib dilaporkan dengan batas waktu maksimal 2 jam setelah pembayaran. Deposit manual hanya diproses ketika admin sedang online.'],
                                ['Garansi dan Komplain', 'Garansi jaminan pengembalian saldo jika Muvausa Store tidak dapat memproses pemesanan. Garansi terkait keaslian dan pengiriman produk. Sesuai dengan kebijakan penyedia layanan yang bekerja sama dengan kami, komplain hanya dapat dilakukan di tanggal yang sama dengan pembelian.'],
                                ['Informasi Produk', 'Perubahan layanan bukan tanggung jawab Muvausa Store.'],
                                ['Hal Tidak Terduga', 'Gangguan koneksi internet dan perubahan layanan provider bukan tanggung jawab Muvausa Store.'],
                                ['Privasi dan Kerahasiaan', 'Informasi pelanggan tak akan dibagi kecuali untuk keperluan hukum atau jika sudah mendapatkan izin dari pelanggan yang bersangkutan.'],
                                ['Perselisihan', 'Perjanjian tunduk pada hukum Indonesia. Perselisihan diselesaikan dengan musyawarah mufakat.'],
                            ].map(([title, desc], idx) => (
                                <li key={idx} className="">
                                    {/* Marker huruf */}

                                    {/* Isi konten */}
                                    <div className="pl-1">
                                        <p className="font-utama text-sm font-bold text-justify">{title}</p>
                                        <p className="font-utama text-sm text-justify text-gray-500">{desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

            </div>
        </>
    );
};

export default PrivacyPolicy;
