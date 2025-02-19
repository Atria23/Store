import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";

const AdminDeposits = ({ deposits: initialDeposits }) => {
  const [deposits, setDeposits] = useState(initialDeposits); // initialDeposits adalah data awal
  const { data, setData, post, processing } = useForm({
    depositId: null,
  });

  const [isImageOpen, setIsImageOpen] = useState(false); // State untuk mengontrol tampilan gambar besar
  const [imageSrc, setImageSrc] = useState(""); // Menyimpan URL gambar yang ingin diperbesar

  // Fungsi untuk memperbarui status deposit di state
  const updateDepositStatus = (id, newStatus) => {
    setDeposits((prevDeposits) =>
      prevDeposits.map((deposit) =>
        deposit.id === id ? { ...deposit, status: newStatus } : deposit
      )
    );
  };


  // Fungsi untuk konfirmasi deposit
  const handleConfirm = (id) => {
    if (!confirm("Apakah Anda yakin ingin mengonfirmasi deposit ini?")) return;

    setData("depositId", id);

    post(`/admin/deposit/confirm/${id}`, {
      onSuccess: () => {
        updateDepositStatus(id, "confirmed"); // Perbarui status menjadi "confirmed"
      },
      onError: () => {
        console.error("Gagal mengonfirmasi deposit.");
      },
    });
  };

  const handleCancelConfirm = (id) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan konfirmasi deposit ini?")) return;

    setData("depositId", id);

    post(`/admin/deposit/cancel-confirm/${id}`, {
      onSuccess: () => {
        updateDepositStatus(id, "pending"); // Perbarui status menjadi "pending"
      },
      onError: () => {
        console.error("Gagal membatalkan konfirmasi deposit.");
      },
    });
  };

  const handleImageClick = (src) => {
    setImageSrc(src);
    setIsImageOpen(true); // Tampilkan modal gambar
  };

  const closeImage = () => {
    setIsImageOpen(false); // Tutup modal gambar
    setImageSrc("");
  };


  // useEffect untuk memantau perubahan state deposits
  useEffect(() => {
    console.log("Status deposit telah diperbarui:", deposits);
  }, [deposits]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Deposit</h1>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">User ID</th>
              <th className="border px-4 py-2">Nama Pengguna</th>
              <th className="border px-4 py-2">Saldo Masuk</th>
              <th className="border px-4 py-2">Total Bayar</th>
              <th className="border px-4 py-2">Metode Pembayaran</th>
              <th className="border px-4 py-2">Rekening</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Bukti Pembayaran</th>
              <th className="border px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="text-center">
                <td className="border px-4 py-2">{deposit.id}</td>
                <td className="border px-4 py-2">{deposit.user?.id || "N/A"}</td>
                <td className="border px-4 py-2">{deposit.user?.name || "N/A"}</td>
                <td className="border px-4 py-2">{deposit.get_saldo}</td>
                <td className="border px-4 py-2">{deposit.total_pay}</td>
                <td className="border px-4 py-2">{deposit.payment_method || "Tidak Ada"}</td>
                <td className="border px-4 py-2">
                  {deposit.payment_method === "qris" && deposit.admin_account ? (
                    <div>
                      <img
                        src={`/storage/${deposit.admin_account}`}
                        alt="QRIS"
                        className="w-20 h-20 object-cover cursor-pointer"
                        onClick={() => handleImageClick(`/storage/${deposit.admin_account}`)}
                      />
                      <button
                        onClick={() => handleImageClick(`/storage/${deposit.admin_account}`)}
                        className="text-blue-500 underline text-sm mt-2"
                      >
                        Perbesar
                      </button>
                    </div>
                  ) : deposit.payment_method === "qris_manual" && deposit.admin_account ? (
                    <div>
                      <img
                        src={`/storage/${deposit.admin_account}`}
                        alt="QRIS Manual"
                        className="w-20 h-20 object-cover cursor-pointer"
                        onClick={() => handleImageClick(`/storage/${deposit.admin_account}`)}
                      />
                      <button
                        onClick={() => handleImageClick(`/storage/${deposit.admin_account}`)}
                        className="text-blue-500 underline text-sm mt-2"
                      >
                        Perbesar
                      </button>
                    </div>
                  ) : (
                    deposit.admin_account || "N/A"
                  )}
                </td>
                {/* Modal untuk memperbesar gambar */}
                {isImageOpen && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeImage}
                  >
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()} // Mencegah penutupan modal saat klik dalam gambar
                    >
                      <img
                        src={imageSrc}
                        alt="Full View"
                        className="max-h-screen"
                      />
                      <button
                        onClick={closeImage}
                        className="absolute top-2 right-2 text-white bg-red-600 px-3 py-1 rounded"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                )}
                <td
                  className={`border px-4 py-2 font-semibold ${deposit.status === "pending"
                      ? "text-yellow-600"
                      : "text-green-600"
                    }`}
                >
                  {deposit.status}
                </td>
                <td className="border px-4 py-2">
                  {deposit.proof_of_payment ? (
                    <a
                      href={`/proof-of-payment/${deposit.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Lihat
                    </a>
                  ) : (
                    "Tidak Ada"
                  )}
                </td>
                <td className="border px-4 py-2">
                  {deposit.status === "pending" ? (
                    <button
                      onClick={() => handleConfirm(deposit.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      disabled={processing && data.depositId === deposit.id}
                    >
                      {processing && data.depositId === deposit.id
                        ? "Memproses..."
                        : "Konfirmasi"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCancelConfirm(deposit.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                      disabled={processing && data.depositId === deposit.id}
                    >
                      {processing && data.depositId === deposit.id
                        ? "Memproses..."
                        : "Batalkan Konfirmasi"}
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDeposits;
