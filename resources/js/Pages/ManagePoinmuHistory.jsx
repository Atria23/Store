// import React, { useState, useMemo } from 'react';
// import { Inertia } from '@inertiajs/inertia';

// export default function ManagePoinmuHistory({ poinmuHistory }) {
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');
//   const [sortDesc, setSortDesc] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   const filtered = useMemo(() => {
//     return poinmuHistory
//       .filter((item) => {
//         const name = item.user?.name?.toLowerCase() || '';
//         const id = item.user_id?.toString() || '';
//         return (
//           (name.includes(search.toLowerCase()) || id.includes(search)) &&
//           (statusFilter ? item.status === statusFilter : true)
//         );
//       })
//       .sort((a, b) => {
//         const dateA = new Date(a.created_at);
//         const dateB = new Date(b.created_at);
//         return sortDesc ? dateB - dateA : dateA - dateB;
//       });
//   }, [search, statusFilter, sortDesc, poinmuHistory]);

//   const paginated = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;
//     return filtered.slice(start, start + itemsPerPage);
//   }, [filtered, currentPage]);

//   const totalPages = Math.ceil(filtered.length / itemsPerPage);

//   const updateStatus = (id, status) => {
//     Inertia.put(`/poinmu-history/${id}/status`, { status });
//   };

//   return (
//     <main className="max-w-[500px] mx-auto px-4 py-4">
//       <h1 className="text-lg font-bold mb-4">Kelola Riwayat PoinMu</h1>

//       <div className="flex flex-col gap-2 mb-4">
//         <input
//           type="text"
//           placeholder="Cari ID atau Nama Pengguna"
//           className="p-2 border rounded text-sm"
//           value={search}
//           onChange={(e) => {
//             setCurrentPage(1);
//             setSearch(e.target.value);
//           }}
//         />

//         <select
//           className="p-2 border rounded text-sm"
//           value={statusFilter}
//           onChange={(e) => {
//             setCurrentPage(1);
//             setStatusFilter(e.target.value);
//           }}
//         >
//           <option value="">Semua Status</option>
//           <option value="sukses">Sukses</option>
//           <option value="pending">Pending</option>
//           <option value="gagal">Gagal</option>
//         </select>

//         <button
//           onClick={() => setSortDesc(!sortDesc)}
//           className="text-sm underline self-start text-blue-600"
//         >
//           Urutkan: {sortDesc ? 'Terbaru' : 'Terlama'}
//         </button>
//       </div>

//       <div className="space-y-2">
//         {paginated.map((item) => (
//           <div key={item.id} className="border p-3 rounded bg-white shadow text-sm">
//             <div className="flex justify-between">
//               <div className="font-medium">{item.user?.name || 'Tanpa Nama'}</div>
//               <div className="text-gray-500 text-xs">#{item.user_id}</div>
//             </div>
//             <div className="text-gray-600 mt-1">{item.description}</div>
//             <div className="flex justify-between mt-2 items-center">
//               <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</div>
//               <select
//                 value={item.status}
//                 onChange={(e) => updateStatus(item.id, e.target.value)}
//                 className="text-xs border rounded px-2 py-1"
//               >
//                 <option value="sukses">Sukses</option>
//                 <option value="pending">Pending</option>
//                 <option value="gagal">Gagal</option>
//               </select>
//             </div>
//           </div>
//         ))}

//         {filtered.length === 0 && (
//           <p className="text-center text-gray-500 mt-4">Tidak ada data.</p>
//         )}
//       </div>

//       {totalPages > 1 && (
//         <div className="mt-4 flex justify-center gap-2 flex-wrap">
//           {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//             <button
//               key={page}
//               onClick={() => setCurrentPage(page)}
//               className={`px-3 py-1 text-sm rounded ${
//                 currentPage === page
//                   ? 'bg-main text-white'
//                   : 'bg-gray-100 text-gray-700'
//               }`}
//             >
//               {page}
//             </button>
//           ))}
//         </div>
//       )}
//     </main>
//   );
// }
import { useState, useEffect } from "react";
import { Head, usePage, useForm, router } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";

const History = () => {
    const { poinmuHistory: initialData } = usePage().props;
    const [data, setData] = useState(initialData);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const filteredData = data
        .filter((item) => {
            const searchLower = searchQuery.toLowerCase();
            return (
                item.id.toString().includes(searchLower) ||
                (item.user?.name || "").toLowerCase().includes(searchLower)
            );
        })
        .filter((item) => {
            return filterStatus ? item.status === filterStatus : true;
        })
        .sort((a, b) => {
            const timeA = new Date(a.created_at).getTime();
            const timeB = new Date(b.created_at).getTime();
            return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
        });

    const paginated = filteredData.slice(
        (currentPage - 1) * perPage,
        currentPage * perPage
    );

    const totalPages = Math.ceil(filteredData.length / perPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, sortOrder]);

    const updateStatus = (id, status) => {
        Inertia.put(`/poinmu-history/${id}/status`, { status });
    };

    return (
        <>
            <Head title="Manage History" />
            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    {/* Header */}
                    <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        {/* Left Section (Back Icon + Title) */}
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                </svg>
                            </button>
                            {/* Title */}
                            <div className="font-utama text-white font-bold text-lg">
                                Kelola Riwayat Poinmu
                            </div>
                        </div>
                    </div>
                    {/* Search & Filter */}
                    <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                        {/* Search Bar */}
                        <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                            <input
                                id="searchInput"
                                type="text"
                                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                placeholder="Cari berdasarkan ID atau nama user"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="0.3"
                                className="w-5 h-5 text-main"
                            >
                                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                            </svg>
                        </div>

                        {/* Sorting & Status Filter */}
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            {/* Tombol Urutkan */}
                            <button
                                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                                className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    className="w-4 h-4 text-main"
                                    viewBox="0 0 16 16"
                                >
                                    <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1" />
                                </svg>
                                <span className="text-utama text-sm font-thin text-left align-middle text-blue-600">
                                    {sortOrder === "desc" ? "Terbaru" : "Terlama"}
                                </span>
                            </button>

                            <div className="shrink-0 w-px bg-main h-6" />

                            {/* Filter Status */}
                            <div className="w-full">
                                <select
                                    className="w-full px-4 py-2 rounded-md border border-gray-300 text-sm text-gray-700 bg-white"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    <option value="sukses">Sukses</option>
                                    <option value="pending">Pending</option>
                                    <option value="gagal">Gagal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mb-4 min-h-[756px] pt-[163px] bg-white">
                    {paginated.length > 0 ? (
                        paginated.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center p-3 border-b-2 border-b-neutral-100 w-full gap-2"
                            >
                                {/* Kiri: Info User */}
                                <div className="flex flex-col w-full space-y-1">
                                    <p className="font-utama font-semibold text-sm truncate w-full max-w-[200px]">
                                        ID #{item.id}
                                    </p>
                                    <p className="font-utama text-sm text-gray-600 truncate">
                                        User: {item.user?.name || "-"}
                                    </p>
                                    <p className="font-utama text-xs text-gray-400">
                                        {new Date(item.created_at).toLocaleString("id-ID")}
                                    </p>
                                </div>

                                {/* Kanan: Status */}
                                <div className="w-max">
                                    <select
                                        value={item.status || ""}
                                        onChange={(e) => updateStatus(item.id, e.target.value || null)}
                                        className={`px-4 pr-8 py-[2px] rounded-full text-[11px] font-medium w-fit
                                                    ${item.status === "pending"
                                                                                                ? "border border-yellow-600 bg-yellow-100 text-yellow-600"
                                                                                                : item.status === "sukses"
                                                                                                    ? "border border-green-600 bg-green-100 text-green-600"
                                                                                                    : item.status === "gagal"
                                                                                                        ? "border border-red-600 bg-red-100 text-red-600"
                                                                                                        : "border border-gray-300 bg-gray-100 text-gray-500"
                                                                                            }
                                                    `}
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        <option value="sukses">Sukses</option>
                                        <option value="pending">Pending</option>
                                        <option value="gagal">Gagal</option>
                                    </select>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full mt-6">
                            <p className="text-gray-500">Tidak ada data ditemukan.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
  <div className="w-full px-4 pb-8 flex justify-center items-center flex-wrap gap-2">
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i}
        onClick={() => {
          setCurrentPage(i + 1);
          window.scrollTo({ top: 0, behavior: "smooth" }); // opsional biar scroll ke atas
        }}
        className={`px-3 py-1 text-sm rounded-md border transition-all
          ${currentPage === i + 1
            ? 'bg-main text-white border-main'
            : 'bg-white text-gray-700 border-gray-300 hover:border-main hover:text-main'
          }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
)}

            </div>
        </>
    );
};

export default History;
