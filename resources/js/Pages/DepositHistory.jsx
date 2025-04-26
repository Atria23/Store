import React, { useState, useEffect } from "react";
import { useForm, router, Head } from "@inertiajs/react";

const DepositHistory = ({ deposits }) => {
  const [updatedDeposits, setUpdatedDeposits] = useState(deposits);
  const { post } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'desc' = terbaru, 'asc' = terlama
  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const handleConfirm = (id) => {
    if (confirm("Are you sure you want to confirm this deposit?")) {
      setLoading(true);
      setLoadingId(id);

      fetch(`/deposit/confirm/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({}),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            window.location.reload(); // reload jika sukses
          } else {
            alert(`Konfirmasi gagal: tidak ditemukan data yang sesuai`);
          }
        })
        .catch((error) => {
          alert('Terjadi kesalahan: ' + error.message);
        })
        .finally(() => {
          setLoading(false);
          setLoadingId(null);
        });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatedDeposits((prevDeposits) =>
        prevDeposits.map((deposit) => {
          if (deposit.status === "pending" && deposit.expires_at) {
            const timeLeft = new Date(deposit.expires_at) - new Date();
            if (timeLeft <= 0) {
              return { ...deposit, status: "expired" };
            }
          }
          return deposit;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (expiresAt) => {
    const timeLeft = new Date(expiresAt) - new Date();
    if (timeLeft <= 0) return "Expired";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatPaymentMethod = (method) => {
    if (!method) return "";
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleResetDate = () => {
    setStartDate("");
    setEndDate("");
    setDateRange({ start: "", end: "" });
  };

  const transactionsPerPage = 10;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const isOtomatis = (method) => method === "qris_otomatis";

  const [activeTab, setActiveTab] = useState("semua");

  const filteredDeposits = updatedDeposits
    .filter((d) =>
      activeTab === "manual"
        ? !isOtomatis(d.payment_method)
        : activeTab === "otomatis"
          ? isOtomatis(d.payment_method)
          : true
    )
    .filter((d) => {
      const lowerSearch = searchTerm.toLowerCase();
      return (
        (d.payment_method?.toLowerCase() || "").includes(lowerSearch) ||
        (d.id?.toString() || "").includes(lowerSearch) ||
        (d.total_pay?.toString() || "").includes(lowerSearch)
      );
    })
    .filter((d) => {
      const createdAt = new Date(d.created_at);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && createdAt < start) return false;
      if (end && createdAt > new Date(end.getTime() + 86400000)) return false; // include full day
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
    });

  const totalPages = Math.ceil(filteredDeposits.length / transactionsPerPage);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  return (
    <>
      <Head title="Deposit History" />
      {/* Fixed Header */}
      <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
          {/* Header */}
          <div className="w-full h-max flex flex-row space-x-4 items-center justify-start px-4 py-2 bg-main">
            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div className="font-utama text-white font-bold text-lg">
              Riwayat Deposit
            </div>
          </div>

          {/* Search & Sort */}
          <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
            {/* Tab Filter */}
            <div className="flex w-full space-x-2 bg-main-white rounded-full">
              {["semua", "manual", "otomatis"].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`flex-1 py-1 rounded-full text-sm ${activeTab === type ? "bg-main text-white" : "bg-main-white text-gray-600"}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
              <input
                type="text"
                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                placeholder="Cari ID / nominal / metode"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
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

            {/* Sort & Filter */}
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
        </div>


        {/* Filter Modal */}
        {showFilter && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-[328px] p-4 bg-white rounded-lg shadow-lg">
              <button
                className="w-full flex justify-end"
                onClick={() => setShowFilter(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-7 h-7 text-red-500">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                </svg>
              </button>
              <h2 className="text-center text-main text-lg font-medium mb-4">Filter Tanggal</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-main">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="text-sm px-3 py-2 border border-gray-200 rounded-md bg-neutral-100"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-main">Tanggal Akhir</label>
                  <input
                    type="date"
                    className="text-sm px-3 py-2 border border-gray-200 rounded-md bg-neutral-100"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResetDate}
                    className="border border-red-300 text-red-500 text-sm py-2 rounded hover:bg-red-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilter(false)}
                    className="bg-main text-white text-sm py-2 rounded hover:opacity-90"
                  >
                    Terapkan
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        {/* Konten (bisa pakai component seperti <DepositList />) */}
        <div className="pt-[225px] px-4 pb-8 bg-white">

          {paginatedDeposits.length > 0 ? (
            <div className="space-y-2">
              {paginatedDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  onClick={() => router.visit(`/deposit/${deposit.id}`)}
                  className="flex justify-between items-center p-3 border-b border-gray-100 cursor-pointer w-full gap-2"
                >
                  {/* Kiri: Logo metode bayar + info deposit */}
                  <div className="flex items-center gap-3 w-full">
                    {/* Ikon Metode Pembayaran */}
                    <div className="aspect-square w-14 bg-white rounded-xl shadow hidden min-[406px]:flex items-center justify-center overflow-hidden">
                      {[
                        'ovo',
                        'gopay',
                        'shopeepay',
                        'dana',
                        'linkaja',
                        'qris_otomatis',
                        'qris_dana',
                        'qris_gopay',
                        'qris_shopeepay',
                        'qris_ovo',
                      ].includes(deposit.payment_method) ? (
                        <img
                          src={`/storage/payment_method/${deposit.payment_method}.png`}
                          alt={formatPaymentMethod(deposit.payment_method)}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          className="w-full h-full object-contain text-main"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z"
                          />
                        </svg>
                      )}
                    </div>


                    {/* Info Deposit */}
                    <div className="flex flex-col space-y-0.5 text-sm w-full">
                      <p className="font-semibold text-gray-800 truncate">Rp{Number(deposit.total_pay).toLocaleString("id-ID")}</p>
                      <p className="text-gray-600">{formatPaymentMethod(deposit.payment_method)}</p>
                      <p className="text-gray-500 text-xs">ID: {deposit.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1 items-end justify-center w-full">
                    {/* Unggah Bukti (khusus proof_of_payment yang null dan bukan qris otomatis) */}
                    {deposit.proof_of_payment === null && deposit.payment_method !== "qris_otomatis" && (
                      <div className="flex items-center space-x-1 text-xs text-yellow-500 font-medium">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                          />
                        </svg>
                        <span>Unggah Bukti</span>
                      </div>
                    )}


                    {/* Status badge */}
                    <span
                      className={`text-xs font-semibold px-2 py-[2px] rounded-2xl capitalize
                          ${deposit.status === "pending" && deposit.expires_at
                          ? "bg-yellow-100 text-yellow-600"
                          : deposit.status === "confirmed"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                    >
                      {deposit.status}
                    </span>

                    {deposit.payment_method === "qris_otomatis" && deposit.status === "pending" && (
                      <button
                        onClick={() => handleConfirm(deposit.id)}
                        disabled={loading && loadingId === deposit.id}
                        className="text-[11px] mt-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-[2px] rounded"
                      >
                        {loading && loadingId === deposit.id ? "Memproses..." : "Konfirmasi"}
                      </button>
                    )}

                    {/* Tanggal dibuat */}
                    <span className="text-[10px] text-gray-500 font-medium">
                      {new Date(deposit.created_at).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>


                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-full mt-6">
              <p className="text-gray-500">Deposit tidak ditemukan.</p>
            </div>
          )}


          {totalPages > 1 && (
            <div className="w-full flex justify-center py-4">
              <div className="flex flex-wrap justify-center items-center gap-1 max-w-full px-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-2 py-1 text-xs rounded border transition-all ${currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                    : "bg-white hover:bg-gray-100 text-main border-gray-300"
                    }`}
                >
                  « Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 text-xs rounded border transition-all ${page === currentPage
                      ? "bg-main text-white border-main"
                      : "bg-white hover:bg-gray-100 text-main border-gray-300"
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-2 py-1 text-xs rounded border transition-all ${currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-200"
                    : "bg-white hover:bg-gray-100 text-main border-gray-300"
                    }`}
                >
                  Next »
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </>
  );
};

export default DepositHistory;