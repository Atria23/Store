import { useState } from "react";

export default function PopupSelect({ show, setShow, title, options, selectedId, setData, dataKey, filterKey = null }) {
    const [search, setSearch] = useState("");

    const filteredOptions = options.filter(option =>
        (!filterKey || option[filterKey] === selectedId) &&
        option.name.toLowerCase().includes(search.toLowerCase())
    );

    return show ? (
        <div className="fixed z-30 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
                {/* Search Bar */}
                <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                    <input
                        type="text"
                        className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                        placeholder={`Cari ${title}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.3" className="w-5 h-5 text-main">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
                    </svg>
                </div>

                {/* List Options */}
                <div className="w-full max-h-[342px] flex flex-col items-start justify-start overflow-y-auto">
                    {filteredOptions.map((option) => (
                        <div
                            key={option.id}
                            className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer"
                            onClick={() => {
                                setData(dataKey, option.id);
                                setShow(false);
                            }}
                        >
                            <img
                                src={option.image ? `/storage/${option.image}` : "/storage/logo.webp"}
                                alt={option.name}
                                className="w-8 h-8 border border-gray-300 rounded-full object-cover"
                            />
                            <p className="text-utama text-sm text-left align-middle">{option.name.split(" - ")[0]} {/* Tampilkan hanya bagian sebelum "-" */}</p>
                        </div>
                    ))}

                    {filteredOptions.length === 0 && (
                        <p className="text-gray-500 text-sm text-center w-full py-2">{title} tidak ditemukan</p>
                    )}
                </div>

                {/* Close Button */}
                <button onClick={() => setShow(false)} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
                    Tutup
                </button>
            </div>
        </div>
    ) : null;
}
