import React from "react";
import { useForm } from "@inertiajs/react";

const AdminDeposits = ({ deposits }) => {
  const { data, setData, post, processing } = useForm({
    depositId: null,
  });

  const handleConfirm = (id) => {
    if (!confirm("Apakah Anda yakin ingin mengonfirmasi deposit ini?")) return;

    setData("depositId", id);

    post(`/admin/deposit/confirm/${id}`, {
      onSuccess: () => {
        alert("Deposit berhasil dikonfirmasi.");
      },
      onError: () => {
        alert("Gagal mengonfirmasi deposit.");
      },
    });
  };

  const handleCancelConfirm = (id) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan konfirmasi deposit ini?")) return;

    setData("depositId", id);

    post(`/admin/deposit/cancel-confirm/${id}`, {
      onSuccess: () => {
        alert("Konfirmasi deposit berhasil dibatalkan.");
      },
      onError: () => {
        alert("Gagal membatalkan konfirmasi deposit.");
      },
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Manajemen Deposit</h1>

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
                <td
                  className={`border px-4 py-2 font-semibold ${
                    deposit.status === "pending"
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
