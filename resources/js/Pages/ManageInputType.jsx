import { useState } from "react";
import { useForm } from "@inertiajs/react";

export default function Index({ inputTypes }) {
    const { data, setData, post, put, delete: destroy, reset } = useForm({
        id: "",
        name: "",
        formula: "",
        example: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/manage-input-types/${data.id}`, {
                onSuccess: () => {
                    reset();
                    setIsEditing(false);
                },
            });
        } else {
            post("/manage-input-types", { onSuccess: () => reset() });
        }
    };

    const handleEdit = (inputType) => {
        setData(inputType);
        setIsEditing(true);
    };

    const confirmDelete = (id) => {
        setSelectedId(id);
        setIsPopupOpen(true);
    };

    const handleDelete = () => {
        if (selectedId) {
            destroy(`/manage-input-types/${selectedId}`, {
                onSuccess: () => {
                    setIsPopupOpen(false);
                    setSelectedId(null);
                },
            });
        }
    };

    return (
        <div className="mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen bg-gray-100">
            <div className="sticky top-0 z-10 bg-main">
                {/* Header */}
                <div className="w-full flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <button
                        className="shrink-0 w-6 h-6"
                        onClick={() => window.history.back()}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    <div className="font-utama text-white font-bold text-lg"> Kelola Input Data</div>
                </div>

                {/* Input Section */}
                <div className="w-full flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                    <input
                        type="text"
                        placeholder="Nama"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full h-12 bg-neutral-100 border-2 border-gray-200 rounded-lg px-3 font-utama text-black focus:ring-0 focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Formula"
                        value={data.formula}
                        onChange={(e) => setData("formula", e.target.value)}
                        className="w-full h-12 bg-neutral-100 border-2 border-gray-200 rounded-lg px-3 font-utama text-black focus:ring-0 focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Contoh"
                        value={data.example}
                        onChange={(e) => setData("example", e.target.value)}
                        className="w-full h-12 bg-neutral-100 border-2 border-gray-200 rounded-lg px-3 font-utama text-black focus:ring-0 focus:outline-none"
                    />
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-main text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition"
                    >
                        {isEditing ? "Update Data" : "Simpan Data"}
                    </button>
                    {isEditing && (
                        <button
                            onClick={() => {
                                reset();
                                setIsEditing(false);
                            }}
                            className="w-full white text-main border border-main px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                        >
                            Batal
                        </button>
                    )}
                </div>
            </div>

            {/* Daftar Input Types */}
            <div className="mb-4 min-h-[560px] bg-white">
                <div className="bg-white p-4 rounded-lg shadow">
                    {inputTypes.length === 0 ? (
                        <p className="text-gray-500 text-center">Belum ada data</p>
                    ) : (
                        inputTypes.map((inputType) => (
                            <div
                                key={inputType.id}
                                className="flex justify-between items-center border-b py-3 last:border-none"
                            >
                                <div>
                                    <p className="font-utama font-semibold">{inputType.name}</p>
                                    <p className="font-utama text-gray-500 text-sm">{inputType.formula}</p>
                                    <p className="font-utama text-gray-500 text-sm">{inputType.example}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(inputType)}
                                        className="w-full h-max px-2 py-[2px] font-utama text-xs text-main rounded-3xl bg-blue-50 border border-main flex 
                                        items-center justify-center"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(inputType.id)}
                                        className="w-full h-max px-2 py-[2px] font-utama text-xs rounded-3xl flex items-center justify-center text-red-600 
                                        bg-red-50 border border-red-600"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Popup Konfirmasi Hapus */}
            {isPopupOpen && (
                <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                    <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                        <p className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                            Yakin ingin menghapus?
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
