import React, { useEffect, useState } from "react";
import { Head, useForm } from "@inertiajs/react";

const ManageDeposits = ({ deposits: initialDeposits }) => {
  const [deposits, setDeposits] = useState(initialDeposits);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showFilter, setShowFilter] = useState(false);
  const { data, setData, post, processing } = useForm({ depositId: null });

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDeposits((prev) =>
        prev.map((deposit) => {
          if (deposit.status === "pending" && deposit.expires_at) {
            const timeLeft = new Date(deposit.expires_at) - new Date();
            if (timeLeft <= 0) return { ...deposit, status: "expired" };
          }
          return deposit;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateDepositStatus = (id, status) => {
    setDeposits((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const handleConfirm = (id) => {
    if (!confirm("Konfirmasi deposit ini?")) return;
    setData("depositId", id);
    post(`/admin/deposit/confirm/${id}`, {
      onSuccess: () => updateDepositStatus(id, "confirmed"),
    });
  };

  const closeImage = () => {
    setIsImageOpen(false); // Tutup modal gambar
    setImageSrc("");
  };

  const handleCancelConfirm = (id) => {
    if (!confirm("Batalkan konfirmasi deposit ini?")) return;
    setData("depositId", id);
    post(`/admin/deposit/cancel-confirm/${id}`, {
      onSuccess: () => updateDepositStatus(id, "pending"),
    });
  };

  const filteredDeposits = deposits
    .filter((d) => {
      const match =
        d.id?.toString().includes(searchQuery.toLowerCase()) || // tambahkan ini
        d.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.total_pay?.toString().includes(searchQuery.toLowerCase());
      const date = new Date(d.created_at);
      const inRange =
        (!dateRange.start || date >= new Date(dateRange.start)) &&
        (!dateRange.end || date <= new Date(dateRange.end));
      return match && inRange;
    })
    .sort((a, b) =>
      sortOrder === "desc"
        ? new Date(b.created_at) - new Date(a.created_at)
        : new Date(a.created_at) - new Date(b.created_at)
    );

  const totalPages = Math.ceil(filteredDeposits.length / 10);
  const paginated = filteredDeposits.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );

  useEffect(() => setCurrentPage(1), [searchQuery, sortOrder, dateRange]);

  const handleImageClick = (src) => {
    setImageSrc(src);
    setIsImageOpen(true);
  };

  return (
    <>
      <Head title="Manage Deposits" />
      <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
        {/* Header tetap */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
          <div className="w-full flex items-center justify-between px-4 py-2 bg-main">
            {/* Kiri: Back + Title */}
            <div className="flex items-center space-x-4">
              <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <div className="font-utama text-white font-bold text-lg">
                Kelola Deposit
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
              {/* Search Bar */}
              <input
                id="searchInput"
                type="text"
                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                placeholder="Cari id/nama/total bayar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* Search Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.3"  // Ubah ketebalan stroke di sini
                className="w-5 h-5 text-main"
              >
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
              </svg>
            </div>

            {/* Sorting & Filter */}
            <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
              <button
                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  className="w-4 h-4 text-main"
                  viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                </svg>
                <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">
                  {sortOrder === "desc" ? "Terbaru" : "Terlama"}
                </span>
              </button>
              <div className="shrink-0 w-px bg-main h-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="w-full h-full"
                >
                  <line x1="12" y1="4" x2="12" y2="20" />
                </svg>
              </div>
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 text-main"
                >
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
                </svg>
                <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">Filter</span>
              </button>
            </div>
          </div>

          {showFilter && (
            <div className="fixed h-screen px-4 inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-full max-w-[328px] p-4 bg-white rounded-lg shadow-lg">
                <div className="w-full h-max flex flex-col space-y-4">
                  {/* Tombol Close */}
                  <button
                    className="w-full flex justify-end"
                    onClick={() => setShowFilter(false)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-7 h-7 text-red-500"
                    >
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                    </svg>
                  </button>

                  {/* Judul */}
                  <h2 className="text-center text-utama text-lg font-medium">Filter Tanggal</h2>

                  {/* Input Tanggal */}
                  <div className="flex flex-col space-y-2">
                    {/* Tanggal Mulai */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-utama">Tanggal Mulai</label>
                      <input
                        type="date"
                        className="text-sm px-3 py-2 border border-gray-200 rounded-md bg-neutral-100"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      />
                    </div>

                    {/* Tanggal Akhir */}
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-utama">Tanggal Akhir</label>
                      <input
                        type="date"
                        className="text-sm px-3 py-2 border border-gray-200 rounded-md bg-neutral-100"
                        value={dateRange.end}
                        min={dateRange.start ? getNextDate(dateRange.start) : ""}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      />
                    </div>
                  </div>


                  {/* Tombol Aksi */}
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <button
                      onClick={() => setDateRange({ start: "", end: "" })}
                      className="w-full border border-red-300 text-red-500 text-sm py-2 rounded hover:bg-red-50 transition"
                    >
                      Reset Tanggal
                    </button>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="w-full bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 transition"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List deposit */}
        <div className="mb-4 min-h-[756px] pt-[163px] bg-white">
          {paginated.length > 0 ? (
            paginated.map((d) => (
              <div
                key={d.id}
                onClick={(e) => {
                  // Jika klik berasal dari tombol atau link, abaikan
                  if (["BUTTON", "A"].includes(e.target.tagName)) return;
                  window.location.href = `/deposit/${d.id}`;
                }}
                className="flex justify-between items-center p-3 border-b border-neutral-200 cursor-pointer"
              >
                {/* kiri */}
                <div className="flex flex-col items-start justify-between w-full h-[120px] py-2">
                  <div className="items-start flex flex-col">
                    <p className="text-xs text-gray-500">
                      ID: {d.id}
                    </p>
                    <p className="font-utama font-semibold text-sm truncate w-full max-w-[200px] [@media(max-width:350px)]:max-w-[215px]">
                      {d.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rp{d.total_pay.toLocaleString()} ({d.payment_method || "Tidak Ada"})
                    </p>
                  </div>
                  <p className="flex items-center text-xs px-2 py-1 text-green-600 bg-green-100 border border-green-600 rounded-lg font-medium whitespace-nowrap">
                    Saldo Masuk: Rp{(d.get_saldo || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* kanan */}
                <div className="flex flex-col justify-between items-end w-full h-[120px] py-2">
                  {/* Komponen 1 - Mepet Atas */}
                  <div className="items-end flex flex-col space-y-2">
                    <span className="text-xs font-semibold px-2 py-[2px] rounded-2xl capitalize bg-yellow-100 text-yellow-600">
                      Exp: {new Date(d.expires_at).toLocaleString("id-ID", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </span>

                    {/* Komponen 2 - Tengah */}
                    <div className={`text-xs font-semibold px-2 py-[2px] rounded-2xl capitalize
    ${d.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : d.status === "confirmed"
                          ? "bg-green-100 text-green-600"
                          : d.status === "expired"
                            ? "bg-red-100 text-red-600"
                            : ""}`}>
                      {d.status}
                    </div>
                  </div>

                  {/* Komponen 3 - Mepet Bawah */}
                  <div className="flex flex-col items-end space-y-1">
                    {d.status !== "confirmed" ? (
                      <button
                        onClick={() => handleConfirm(d.id)}
                        className="text-[11px] bg-blue-500 hover:bg-blue-600 text-white px-2 py-[2px] rounded"
                        disabled={processing && data.depositId === d.id}
                      >
                        {processing && data.depositId === d.id ? "Memproses..." : "Konfirmasi"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelConfirm(d.id)}
                        className="text-[11px] bg-red-500 hover:bg-red-600 text-white px-2 py-[2px] rounded"
                        disabled={processing && data.depositId === d.id}
                      >
                        {processing && data.depositId === d.id ? "Memproses..." : "Batalkan Konfirmasi"}
                      </button>
                    )}
                    {d.proof_of_payment && (
                      <a
                        href={`/proof-of-payment/${d.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs rounded text-blue-600 hover:bg-gray-100 transition"
                      >
                        Lihat Bukti
                      </a>
                    )}
                  </div>
                </div>


              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-full mt-6">
              <p className="text-gray-500">Tidak ada pengguna ditemukan.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4 text-sm">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-2 py-1 rounded ${currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Modal bukti gambar */}
        {isImageOpen && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
            <div className="relative">
              {/* Tombol Close di pojok kanan atas gambar */}
              <button
                onClick={closeImage}
                className="absolute -top-3 -right-3 bg-white text-white rounded-full w-9 h-9 flex items-center justify-center shadow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-7 h-7 text-red-500"
                >
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>
              </button>
              <img
                src={imageSrc}
                alt="Bukti"
                className="max-w-[90vw] max-h-[80vh] rounded shadow-lg"
              />
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ManageDeposits;
