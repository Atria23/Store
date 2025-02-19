// import { useState } from "react";
// import { Link, usePage, router } from "@inertiajs/react";

// export default function CategoryList() {
//     const { categories } = usePage().props;
//     const [search, setSearch] = useState("");
//     const [sortOrder, setSortOrder] = useState("asc");
//     const [modal, setModal] = useState(false);
//     const [editCategory, setEditCategory] = useState(null);
//     const [previewImage, setPreviewImage] = useState(null);
//     const [errors, setErrors] = useState({});

//     const [form, setForm] = useState({
//         name: "",
//         image: null,
//     });

//     const handleChange = (e) => {
//         if (e.target.name === "image") {
//             const file = e.target.files[0];
//             if (file) {
//                 setPreviewImage(URL.createObjectURL(file));
//                 setForm({ ...form, image: file });
//             }
//         } else {
//             setForm({ ...form, [e.target.name]: e.target.value });
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setErrors({}); // Reset error

//         const formData = new FormData();
//         formData.append("name", form.name);
//         if (form.image) formData.append("image", form.image);

//         if (editCategory) {
//             router.post(`/categories/${editCategory.id}`, formData, {
//                 onSuccess: () => {
//                     setModal(false);
//                     setEditCategory(null);
//                     setPreviewImage(null);
//                 },
//                 onError: (err) => setErrors(err),
//             });
//         } else {
//             router.post("/categories", formData, {
//                 onSuccess: () => {
//                     setModal(false);
//                     setPreviewImage(null);
//                 },
//                 onError: (err) => setErrors(err),
//             });
//         }
//     };

//     const openEditModal = (category) => {
//         setEditCategory(category);
//         setForm({
//             name: category.name,
//             image: null,
//         });
//         setPreviewImage(category.image);
//         setModal(true);
//     };

//     const handleDelete = (id) => {
//         if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
//             router.delete(`/categories/${id}`);
//         }
//     };

//     const sortedCategories = [...categories]
//         .filter((category) =>
//             category.name.toLowerCase().includes(search.toLowerCase())
//         )
//         .sort((a, b) =>
//             sortOrder === "asc"
//                 ? a.name.localeCompare(b.name)
//                 : b.name.localeCompare(a.name)
//         );

//     return (
//         <div className="w-full max-w-[412px] max-h-[892px] md:h-screen mx-auto overflow-hidden">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-lg font-semibold">Kelola Kategori</h1>
//                 <button
//                     onClick={() => {
//                         setEditCategory(null);
//                         setForm({ name: "", image: null });
//                         setPreviewImage(null);
//                         setModal(true);
//                     }}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                 >
//                     + Tambah
//                 </button>
//             </div>

//             {/* Pencarian & Sortir */}
//             <div className="mb-4 flex gap-2">
//                 <input
//                     type="text"
//                     placeholder="Cari kategori..."
//                     className="w-full p-2 border rounded-lg"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                 />
//                 <button
//                     onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                     {sortOrder === "asc" ? "🔼 A-Z" : "🔽 Z-A"}
//                 </button>
//             </div>

//             {/* Daftar Kategori */}
//             <div className="space-y-4">
//                 {sortedCategories.map((category) => (
//                     <div
//                         key={category.id}
//                         className="flex justify-between items-center border p-4 rounded-lg shadow"
//                     >
//                         <div className="flex items-center space-x-4">
//                             <img
//                                 src={category.image || "storage/categories/default.png"}
//                                 alt={category.name}
//                                 className="w-14 h-14 rounded-full object-cover"
//                             />
//                             <div>
//                                 <p className="font-semibold">{category.name}</p>
//                                 <p className="text-sm text-gray-500">
//                                     Dibuat: {new Date(category.created_at).toLocaleDateString()}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className="flex space-x-2">
//                             <button
//                                 onClick={() => openEditModal(category)}
//                                 className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
//                             >
//                                 ✏ Edit
//                             </button>
//                             <button
//                                 onClick={() => handleDelete(category.id)}
//                                 disabled={category.is_used}
//                                 className={`px-3 py-1 rounded ${category.is_used ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
//                             >
//                                 Hapus
//                             </button>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Modal Tambah/Edit */}
//             {modal && (
//                 <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
//                     <div className="bg-white p-6 rounded-lg w-96 shadow-lg animate-fadeIn">
//                         <h2 className="text-lg font-semibold mb-4">
//                             {editCategory ? "Edit Kategori" : "Tambah Kategori"}
//                         </h2>
//                         <form onSubmit={handleSubmit} encType="multipart/form-data">
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={form.name}
//                                 onChange={handleChange}
//                                 className="w-full p-2 border rounded mb-2"
//                                 placeholder="Nama Kategori"
//                                 required
//                             />
//                             {errors.name && (
//                                 <p className="text-red-500 text-sm">{errors.name}</p>
//                             )}

//                             <input
//                                 type="file"
//                                 name="image"
//                                 accept="image/*"
//                                 onChange={handleChange}
//                                 className="w-full p-2 border rounded mb-2"
//                             />
//                             {previewImage && (
//                                 <img
//                                     src={previewImage}
//                                     alt="Preview"
//                                     className="w-20 h-20 object-cover rounded-full mb-2"
//                                 />
//                             )}
//                             {errors.image && (
//                                 <p className="text-red-500 text-sm">{errors.image}</p>
//                             )}

//                             <button
//                                 type="submit"
//                                 className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
//                             >
//                                 Simpan
//                             </button>
//                             <button
//                                 type="button"
//                                 className="w-full mt-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
//                                 onClick={() => setModal(false)}
//                             >
//                                 Batal
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }

















// import { useState } from "react";
// import { Link, usePage, router } from "@inertiajs/react";

// export default function CategoryList() {
//     const { categories } = usePage().props;
//     const [search, setSearch] = useState("");
//     const [sortOrder, setSortOrder] = useState("asc");
//     const [modal, setModal] = useState(false);
//     const [editCategory, setEditCategory] = useState(null);
//     const [previewImage, setPreviewImage] = useState(null);
//     const [errors, setErrors] = useState({});

//     const [form, setForm] = useState({
//         name: "",
//         image: null,
//     });

//     const handleChange = (e) => {
//         if (e.target.name === "image") {
//             const file = e.target.files[0];
//             if (file) {
//                 setPreviewImage(URL.createObjectURL(file));
//                 setForm({ ...form, image: file });
//             }
//         } else {
//             setForm({ ...form, [e.target.name]: e.target.value });
//         }
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         setErrors({}); // Reset error

//         const formData = new FormData();
//         formData.append("name", form.name);
//         if (form.image) formData.append("image", form.image);

//         if (editCategory) {
//             router.post(`/categories/${editCategory.id}`, formData, {
//                 onSuccess: () => {
//                     setModal(false);
//                     setEditCategory(null);
//                     setPreviewImage(null);
//                 },
//                 onError: (err) => setErrors(err),
//             });
//         } else {
//             router.post("/categories", formData, {
//                 onSuccess: () => {
//                     setModal(false);
//                     setPreviewImage(null);
//                 },
//                 onError: (err) => setErrors(err),
//             });
//         }
//     };

//     const openEditModal = (category) => {
//         setEditCategory(category);
//         setForm({
//             name: category.name,
//             image: null,
//         });
//         setPreviewImage(category.image);
//         setModal(true);
//     };

//     const handleDelete = (id) => {
//         if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
//             router.delete(`/categories/${id}`);
//         }
//     };

//     const sortedCategories = [...categories]
//         .filter((category) =>
//             category.name.toLowerCase().includes(search.toLowerCase())
//         )
//         .sort((a, b) =>
//             sortOrder === "asc"
//                 ? a.name.localeCompare(b.name)
//                 : b.name.localeCompare(a.name)
//         );

//     return (
//         <div className="mx-auto w-full max-w-[412px] max-h-[892px] h-screen">
//             {/* fixed position */}
//             <div className="sticky top-0 z-10 bg-main">
//                 {/* Header */}
//                 <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
//                     {/* Left Section (Back Icon + Title) */}
//                     <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
//                         {/* Back Icon */}
//                         <button className="shrink-0 w-6 h-6">
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
//                                 <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
//                             </svg>
//                         </button>
//                         {/* Title */}
//                         <div className="font-utama text-white font-bold text-lg">
//                             Kelola Kategori
//                         </div>
//                     </div>
//                     {/* Plus Icon */}
//                     <button
//                         onClick={() => {
//                             setEditCategory(null);
//                             setForm({ name: "", image: null });
//                             setPreviewImage(null);
//                             setModal(true);
//                         }}
//                         className="flex items-center w-6 h-6">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
//                             <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8" />
//                             <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z" />
//                         </svg>
//                     </button>
//                 </div>
//                 {/* Search & Filter */}
//                 <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
//                     <div className="w-full h-9 flex flex-row mx-auto items-center justify-center px-4 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
//                         {/* Search Bar */}
//                         <input
//                             id="searchInput"
//                             type="text"
//                             className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
//                             placeholder="Cari kategori"
//                             value={search}
//                             onChange={(e) => setSearch(e.target.value)}
//                         />
//                         {/* Search Icon */}
//                         <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             viewBox="0 0 24 24"
//                             fill="currentColor"
//                             stroke="currentColor"
//                             strokeWidth="1"  // Ubah ketebalan stroke di sini
//                             className="w-5 h-5 text-main"
//                         >
//                             <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
//                         </svg>
//                     </div>
//                     {/* Sorting & Filter */}
//                     <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
//                         {/* Sort Button */}
//                         <button
//                             onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
//                             className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2">
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 24 24"
//                                 fill="currentColor"
//                                 className="w-4 h-4 text-main"
//                             >
//                                 <path d="M3 6h8v2H3zm0 5h5v2H3zm0 5h3v2H3zM15 5l-4 4h3v8h2V9h3z" />
//                             </svg>
//                             <span className="text-utama text-xs font-thin text-left align-middle text-blue-600">Urutkan</span>
//                         </button>
//                         <div className="shrink-0 w-8 text-main">
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeWidth="1"
//                                 className="w-full h-full"
//                             >
//                                 <line x1="12" y1="4" x2="12" y2="20" />
//                             </svg>
//                         </div>
//                         {/* Filter Button */}
//                         <button className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2">
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 viewBox="0 0 24 24"
//                                 fill="currentColor"
//                                 className="w-4 h-4 text-main"
//                             >
//                                 <path d="M10 18h4v-2h-4zm-7-6h18v-2H3zm4-6v2h10V6z" />
//                             </svg>
//                             <span className="text-utama text-xs font-thin text-left align-middle text-blue-600">Filter</span>
//                         </button>
//                     </div>
//                 </div>
//             </div>
//             {/* Daftar Kategori */}
//             <div className="mb-4 bg-white">
//                 {sortedCategories.map((category) => (
//                     <div
//                         key={category.id}
//                         className="flex justify-between items-center p-4 border-b-2 border-b-neutral-100"
//                     >

//                         <div className="w-full h-max flex items-center space-x-3 content-start">
//                             <div className="w-13 h-13 space-x-2 flex items-center justify center p-1 rounded-xl bg-white shadow">
//                                 <img
//                                     src={category.image || "storage/categories/default.png"}
//                                     alt={category.name}
//                                     className="w-10 h-10 rounded-xl object-cover"
//                                 />
//                             </div>

//                             <div className="max-w-[200px] flex flex-col items-start space-y-[2px]">
//                                 <p className="font-utama font-semibold text-xs truncate w-full">{category.name}</p>
//                                 <p className="font-utama text-[10px] text-gray-500">
//                                     Update Terakhir: {new Date(category.updated_at).toLocaleDateString()}
//                                 </p>
//                                 <p className="font-utama text-[10px] text-gray-500">
//                                     Tanggal Dibuat: {new Date(category.created_at).toLocaleDateString()}
//                                 </p>
//                             </div>
//                         </div>

//                         <div className="w-12 h-full flex flex-col items-center space-y-1">
//                             <button
//                                 onClick={() => openEditModal(category)}
//                                 className="w-full h-max px-2 py-[2px] text-[10px] text-main rounded-3xl bg-blue-50 border border-main flex items-center justify-center"
//                             >
//                                 Edit
//                             </button>
//                             <button
//                                 onClick={() => handleDelete(category.id)}
//                                 disabled={category.is_used}
//                                 className={`w-full h-max px-2 py-[2px] text-[10px] rounded-3xl flex items-center justify-center ${category.is_used ? 'text-gray-400 bg-gray-50 border border-gray-400 cursor-not-allowed' : 'text-red-600 bg-red-50 border border-red-600'}`}
//                             >
//                                 Hapus
//                             </button>
//                         </div>

//                     </div>
//                 ))}
//             </div>

//             {/* Modal Tambah/Edit */}
//             {modal && (
//                 <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
//                     <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
//                         <div className="w-full h-max flex flex-col">
//                             {/* Ikon silang di kanan atas */}
//                             <button className="w-full flex items-end justify-end" onClick={() => setModal(false)}>
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     viewBox="0 0 24 24"
//                                     fill="currentColor"
//                                     className="w-7 h-7 text-red-500"
//                                 >
//                                     <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
//                                 </svg>
//                             </button>
//                             {/* Judul di tengah */}
//                             <h2 className="w-full h-max text-utama text-lg font-medium text-center align-middle">
//                                 {editCategory ? "Edit Kategori" : "Tambah Kategori"}
//                             </h2>
//                         </div>
//                         <form onSubmit={handleSubmit} encType="multipart/form-data">
//                             <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
//                                 <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
//                                     <label className="w-20 h-20 rounded-full cursor-pointer overflow-hidden relative border-2 border-gray-200">
//                                         {/* Input file transparan di atas lingkaran */}
//                                         <input
//                                             type="file"
//                                             name="image"
//                                             accept="image/*"
//                                             onChange={handleChange}
//                                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                                         />
//                                         {/* Preview gambar atau placeholder */}
//                                         {previewImage ? (
//                                             <img
//                                                 src={previewImage}
//                                                 alt="Preview"
//                                                 className="w-full h-full object-cover"
//                                             />
//                                         ) : (
//                                             <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
//                                                 Pilih Gambar
//                                             </span>
//                                         )}
//                                     </label>
//                                     {/* Error message */}
//                                     {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
//                                     <p className="w-full h-max text-utama font-medium text-xs text-center align-middle">Gambar Kategori</p>
//                                 </div>
//                                 <div className="w-[294px] h-max flex flex-col space-y-2">
//                                     <p className="w-full h-max text-utama font-medium text-s text-left align-middle">Nama</p>
//                                     <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
//                                         {/* Search Bar */}
//                                         <input
//                                             type="text"
//                                             name="name"
//                                             value={form.name}
//                                             onChange={handleChange}
//                                             className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
//                                             placeholder="Nama Kategori"
//                                             required
//                                         />
//                                         {errors.name && (
//                                             <p className="text-red-500 text-sm">{errors.name}</p>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
//                                 <button
//                                     type="submit"
//                                     className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
//                                 >
//                                     Simpan
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }





























import { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";

export default function CategoryList() {
    const { categories } = usePage().props;
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [modal, setModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        image: null,
    });

    const handleChange = (e) => {
        if (e.target.name === "image") {
            const file = e.target.files[0];
            if (file) {
                setPreviewImage(URL.createObjectURL(file));
                setForm({ ...form, image: file });
            }
        } else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({}); // Reset error

        const formData = new FormData();
        formData.append("name", form.name);
        if (form.image) formData.append("image", form.image);

        if (editCategory) {
            router.post(`/manage-categories/${editCategory.id}`, formData, {
                onSuccess: () => {
                    setModal(false);
                    setEditCategory(null);
                    setPreviewImage(null);
                },
                onError: (err) => setErrors(err),
            });
        } else {
            router.post("/manage-categories", formData, {
                onSuccess: () => {
                    setModal(false);
                    setPreviewImage(null);
                },
                onError: (err) => setErrors(err),
            });
        }
    };

    const openEditModal = (category) => {
        setEditCategory(category);
        setForm({
            name: category.name,
            image: null,
        });
        setPreviewImage(category.image);
        setModal(true);
    };

    const handleDelete = () => {
        if (selectedCategoryId) {
            router.delete(`/manage-categories/${selectedCategoryId}`, {
                onSuccess: () => {
                    setIsPopupOpen(false);
                    setSelectedCategoryId(null);
                },
            });
        }
    };

    const sortedCategories = [...categories]
        .filter((category) =>
            category.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
            sortOrder === "asc"
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        );

    return (
        <div className="mx-auto w-full max-w-[412px] max-h-[892px] h-screen">
            {/* fixed position */}
            <div className="sticky top-0 z-10 bg-main">
                {/* Header */}
                <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    {/* Left Section (Back Icon + Title) */}
                    <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                        {/* Back Icon */}
                        <button className="shrink-0 w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        {/* Title */}
                        <div className="font-utama text-white font-bold text-lg">
                            Kelola Kategori
                        </div>
                    </div>
                    {/* Plus Icon */}
                    <button
                        onClick={() => {
                            setEditCategory(null);
                            setForm({ name: "", image: null });
                            setPreviewImage(null);
                            setModal(true);
                        }}
                        className="flex items-center w-6 h-6">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                            <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8" />
                            <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z" />
                        </svg>
                    </button>
                </div>
                {/* Search & Filter */}
                <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                        {/* Search Bar */}
                        <input
                            id="searchInput"
                            type="text"
                            className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                            placeholder="Cari kategori"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {/* Search Icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth="1"  // Ubah ketebalan stroke di sini
                            className="w-5 h-5 text-main"
                        >
                            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                        </svg>
                    </div>
                    {/* Sorting & Filter */}
                    <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                        {/* Sort Button */}
                        <button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 text-main"
                            >
                                <path d="M3 6h8v2H3zm0 5h5v2H3zm0 5h3v2H3zM15 5l-4 4h3v8h2V9h3z" />
                            </svg>
                            <span className="text-utama text-xs font-thin text-left align-middle text-blue-600">Urutkan</span>
                        </button>
                        <div className="shrink-0 w-8 text-main">
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
                        {/* Filter Button */}
                        <button className="w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-4 h-4 text-main"
                            >
                                <path d="M10 18h4v-2h-4zm-7-6h18v-2H3zm4-6v2h10V6z" />
                            </svg>
                            <span className="text-utama text-xs font-thin text-left align-middle text-blue-600">Filter</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Daftar Kategori */}
            <div className="mb-4 min-h-[756px] bg-white">
                {sortedCategories.map((category) => (
                    <div
                        key={category.id}
                        className="flex justify-between items-center p-4 border-b-2 border-b-neutral-100"
                    >

                        <div className="w-full h-max flex items-center space-x-3 content-start">
                            <div className="w-13 h-13 space-x-2 flex items-center justify center p-1 rounded-xl bg-white shadow">
                                <img
                                    src={category.image || "storage/categories/default.png"}
                                    alt={category.name}
                                    className="w-10 h-10 rounded-xl object-cover"
                                />
                            </div>

                            <div className="max-w-[200px] flex flex-col items-start space-y-[2px]">
                                <p className="font-utama font-semibold text-xs truncate w-full">{category.name}</p>
                                <p className="font-utama text-[10px] text-gray-500">
                                    Update Terakhir: {new Date(category.updated_at).toLocaleDateString()}
                                </p>
                                <p className="font-utama text-[10px] text-gray-500">
                                    Tanggal Dibuat: {new Date(category.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="w-12 h-full flex flex-col items-center space-y-1">
                            <button
                                onClick={() => openEditModal(category)}
                                className="w-full h-max px-2 py-[2px] text-[10px] text-main rounded-3xl bg-blue-50 border border-main flex items-center justify-center"
                            >
                                Edit
                            </button>
                            <button
                        onClick={() => {
                            setSelectedCategoryId(category.id);
                            setIsPopupOpen(true);
                        }}
                        disabled={category.is_used}
                        className={`w-full h-max px-2 py-[2px] text-[10px] rounded-3xl flex items-center justify-center ${
                            category.is_used
                                ? "text-gray-400 bg-gray-50 border border-gray-400 cursor-not-allowed"
                                : "text-red-600 bg-red-50 border border-red-600"
                        }`}
                    >
                        Hapus
                    </button>
                        </div>

                    </div>
                ))}
            </div>

            {/* Modal Tambah/Edit */}
            {modal && (
                <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                        <div className="w-full h-max flex flex-col">
                            {/* Ikon silang di kanan atas */}
                            <button className="w-full flex items-end justify-end" onClick={() => setModal(false)}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-7 h-7 text-red-500"
                                >
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                </svg>
                            </button>
                            {/* Judul di tengah */}
                            <h2 className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                                {editCategory ? "Edit Kategori" : "Tambah Kategori"}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                                <div className="w-full h-max flex flex-col space-y-2 items-center justify-center">
                                    <label className="w-20 h-20 rounded-full cursor-pointer overflow-hidden relative border-2 border-gray-200">
                                        {/* Input file transparan di atas lingkaran */}
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {/* Preview gambar atau placeholder */}
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                                                Pilih Gambar
                                            </span>
                                        )}
                                    </label>
                                    {/* Error message */}
                                    {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                                    <p className="w-full h-max text-utama font-medium text-xs text-center align-middle">Gambar Kategori</p>
                                </div>
                                <div className="w-[294px] h-max flex flex-col space-y-2">
                                    <p className="w-full h-max text-utama font-medium text-s text-left align-middle">Nama</p>
                                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200">
                                        {/* Search Bar */}
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                            placeholder="Nama Kategori"
                                            required
                                        />
                                        {errors.name && (
                                            <p className="text-red-600 text-sm">{errors.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Popup Konfirmasi Hapus */}
            {isPopupOpen && (
                <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                        <p className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                        Yakin Hapus Kategori?
                        </p>
                        <div className="w-full h-max flex flex-row space-x-2">
                            <button
                                onClick={handleDelete}
                                className="w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Ya
                            </button>
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-main rounded-md hover:bg-blue-700"
                            >
                                Tidak
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
