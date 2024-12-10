// import React from "react";

// const categories = [
//   { name: "Elektronik", icon: "💻" },
//   { name: "Fashion", icon: "👗" },
//   { name: "Makanan", icon: "🍔" },
//   { name: "Buku", icon: "📚" },
//   { name: "Olahraga", icon: "⚽" },
// ];

// const ProductCategories = () => {
//   return (
//     <div className="grid grid-cols-4 gap-4">
//       {categories.map((category, index) => (
//         <div
//           key={index}
//           className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition"
//         >
//           <div className="text-4xl mb-2">{category.icon}</div>
//           <p className="text-lg font-semibold text-gray-700">{category.name}</p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ProductCategories;









import React from "react";

const ProductCategories = () => {
  return (
    <>
      <div className="">
        <div className="grid grid-cols-4 gap-4">
          {/* Deposit */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
                <img
                  src="/storage/ikon_home/pulsa.png"
                  alt="Description of the image"
                  className="w-12 h-12"
                />
              </div>
            </div>
            <p className="mt-2 text-sm text-center">Pulsa</p>
          </div>

          {/* Mutasi */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/paket-data.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Paket Data</p>
          </div>

          {/* Riwayat Deposit */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/games.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Games</p>
          </div>

          {/* Riwayat Transaksi */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/inject-voucher.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Inject Voucher</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/voucher-wifi.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Voucher Wifi</p>
          </div>

          {/* Deposit */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/voucher.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Voucher</p>
          </div>

          {/* Mutasi */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/telepon-sms.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Telepon SMS</p>
          </div>

          {/* Riwayat Deposit */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/token-listrik.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Token Listrik</p>
          </div>

          {/* Riwayat Transaksi */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/tagihan.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Tagihan</p>
          </div>

          {/* Mutasi */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/hiburan.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Hiburan</p>
          </div>
          {/* Deposit */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-md hover:shadow-xl transform hover:scale-105 transition">
              <img
                src="/storage/ikon_home/masa-aktif.png"
                alt="Description of the image"
                className="w-12 h-12"
              />
            </div>
            <p className="mt-2 text-sm text-center">Masa Aktif</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductCategories;
