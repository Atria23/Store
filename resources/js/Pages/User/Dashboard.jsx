import React, { useState } from "react";
import BannerSlider from "@/Components/BannerSlider";
import ProductCategories from "@/Components/ProductCategories";
import Footer from "../Footer";

function Dashboard({ user }) {
  const [showBalance, setShowBalance] = useState(false);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <>
      <div className="relative min-h-screen pb-16">
        <div className="bg-white">
          <div className="relative z-10 bg-[#0055bb] rounded-b-2xl">
            <section className="text-white flex justify-between items-center px-6 py-8">
              <div>
                <h1 className="text-lg opacity-90">Halo,</h1>
                <p className="text-3xl font-bold">{user.name}!</p>
              </div>
              <div className="text-right">
                <p><span className="bg-blue-100 text-blue-800 text-lg font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">{user.transactions} trx</span></p>
                <br />
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Saldo</h2>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-3xl font-bold text-gray-800">
                  {showBalance ? `Rp${user.balance.toLocaleString()}` : "••••••••"}
                </p>
                <button
                  onClick={toggleBalanceVisibility}
                  className="text-blue-500 hover:text-blue-700"
                >
                  {showBalance ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#0055bb" className="bi bi-eye-fill" viewBox="0 0 16 16">
                      <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0" />
                      <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="#0055bb" className="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                      <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z" />
                      <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="flex justify-between items-center mt-2  ">
                <div>
                  <p className="text-gray-600">PoinMu</p>
                  <p className="text-xl font-bold text-green-600">{user.points}</p>
                </div>
                <button className="bg-[#0055bb] hover:bg-blue-500 text-white py-2 px-4 rounded-lg shadow">
                  Tukar
                </button>
              </div>

              {/* akses cepat */}
              <div className="mt-4">
                <div className="w-full h-px bg-gray-300 mb-6"></div>
                <div className="grid grid-cols-4 gap-4">
                  {/* Deposit */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
                      <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 14a3 3 0 0 1 3-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4a3 3 0 0 1-3-3Zm3-1a1 1 0 1 0 0 2h4v-2h-4Z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M12.293 3.293a1 1 0 0 1 1.414 0L16.414 6h-2.828l-1.293-1.293a1 1 0 0 1 0-1.414ZM12.414 6 9.707 3.293a1 1 0 0 0-1.414 0L5.586 6h6.828ZM4.586 7l-.056.055A2 2 0 0 0 3 9v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2h-4a5 5 0 0 1 0-10h4a2 2 0 0 0-1.53-1.945L17.414 7H4.586Z" clip-rule="evenodd" />
                      </svg>

                    </div>
                    <p className="mt-2 text-sm text-center">Deposit</p>
                  </div>

                  {/* Mutasi */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
                      <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 20V7m0 13-4-4m4 4 4-4m4-12v13m0-13 4 4m-4-4-4 4" />
                      </svg>

                    </div>
                    <p className="mt-2 text-sm text-center">Mutasi</p>
                  </div>

                  {/* Riwayat Deposit */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
                      <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M7 6a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2v-4a3 3 0 0 0-3-3H7V6Z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M2 11a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7Zm7.5 1a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" clip-rule="evenodd" />
                        <path d="M10.5 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
                      </svg>
                    </div>
                    <p className="mt-2 text-sm text-center">Riwayat Deposit</p>
                  </div>

                  {/* Riwayat Transaksi */}
                  <div className="flex flex-col items-center">
                    <div className="bg-[#0055bb] text-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg hover:bg-[#003f8a] transition duration-300">
                      <svg class="w-6 h-6 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M5.617 2.076a1 1 0 0 1 1.09.217L8 3.586l1.293-1.293a1 1 0 0 1 1.414 0L12 3.586l1.293-1.293a1 1 0 0 1 1.414 0L16 3.586l1.293-1.293A1 1 0 0 1 19 3v18a1 1 0 0 1-1.707.707L16 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L12 20.414l-1.293 1.293a1 1 0 0 1-1.414 0L8 20.414l-1.293 1.293A1 1 0 0 1 5 21V3a1 1 0 0 1 .617-.924ZM9 7a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Zm0 4a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2H9Z" clip-rule="evenodd" />
                      </svg>

                    </div>
                    <p className="mt-2 text-sm text-center">Riwayat Transaksi</p>
                  </div>
                </div>
              </div>

            </section>

          </div>

          {/* Section 3 */}
          <section className="bg-white p-6 rounded-xl shadow-lg">
            <BannerSlider />
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 rounded-xl shadow-lg">
            {/* <h2 className="text-xl font-bold mb-4 text-gray-800">
              Kategori Produk
            </h2> */}
            <ProductCategories />
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
