// import React, { useState, useEffect } from "react";
// import { Link, usePage } from "@inertiajs/react";

// const operatorPrefixes = {
//     "Telkomsel": ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853"],
//     "Indosat": ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
//     "XL": ["0817", "0818", "0819", "0859", "0877", "0878"],
//     "Axis": ["0838", "0831", "0832", "0833"],
//     "Tri": ["0895", "0896", "0897", "0898", "0899"],
//     "Smartfren": ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888"],
//     "By.U": ["0851"]
// };

// const detectOperator = (phoneNumber) => {
//     for (const operator in operatorPrefixes) {
//         if (operatorPrefixes[operator].some(prefix => phoneNumber.startsWith(prefix))) {
//             return operator;
//         }
//     }
//     return null;
// };

// const formatBrandName = (brandName) => {
//     return brandName.split(" - ")[0]; // Mengambil bagian sebelum tanda " - "
// };

// const CategoryPage = ({ category, brands, brand}) => {
//     const { url } = usePage();
//     const params = new URLSearchParams(url.split("?")[1]);
//     const initialPhoneNumber = params.get("phone") || "";

//     const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
//     const [searchQuery, setSearchQuery] = useState("");
//     const [detectedOperator, setDetectedOperator] = useState(detectOperator(initialPhoneNumber));

//     useEffect(() => {
//         if (phoneNumber.length >= 4) {
//             const operator = detectOperator(phoneNumber);
//             setDetectedOperator(operator);

//             if (operator) {
//                 window.history.replaceState(null, "", `/c=${category.name}/b=${operator}?phone=${phoneNumber}`);
//             }
//         }
//     }, [phoneNumber, category.name]);

//     useEffect(() => {
//         if (detectedOperator) {
//             // Cari semua brand yang memiliki nama diawali dengan nama operator
//             const matchedBrands = brands.filter(b => b.name.toLowerCase().startsWith(detectedOperator.toLowerCase()));
    
//             if (matchedBrands.length > 0) {
//                 // Pilih brand pertama yang cocok
//                 window.location.href = `/c=${category.name}/b=${matchedBrands[0].name}?phone=${phoneNumber}`;
//             }
//         }
//     }, [detectedOperator, brands, category.name, phoneNumber]);
    

//     return (

//         <div className="mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen">
//             {/* fixed position */}
//             <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[412px] w-full z-10 bg-main">
//                 {/* Header */}
//                 <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
//                     {/* Left Section (Back Icon + Title) */}
//                     <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
//                         {/* Back Icon */}
//                         <button
//                             className="shrink-0 w-6 h-6"
//                             onClick={() => window.history.back()}
//                         >
//                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
//                                 <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
//                             </svg>
//                         </button>
//                         {/* Title */}
//                         <div className="font-utama text-white font-bold text-lg">
//                             List {category.name}
//                         </div>
//                     </div>
//                 </div>
//                 {/* Search & Filter */}
//                 <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
//                     <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">

//                         {/* Input Nomor HP untuk kategori tertentu */}
//                         {(category.name === "Pulsa" || category.name === "Data" || category.name === "Masa Aktif") ? (
//                             <>
//                                 {/* Search Bar */}
//                                 <input
//                                     id="searchInput"
//                                     type="text"
//                                     className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
//                                     value={phoneNumber}
//                                     onChange={(e) => setPhoneNumber(e.target.value)}
//                                     placeholder="Masukkan nomor HP"
//                                 />
//                             </>
//                         ) : (
//                             <>
//                                 {/* Search Bar */}
//                                 <input
//                                     id="searchInput"
//                                     type="text"
//                                     className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Cari brand..."
//                                 />
//                                 {/* Search Icon */}
//                                 <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     viewBox="0 0 24 24"
//                                     fill="currentColor"
//                                     stroke="currentColor"
//                                     strokeWidth="0.3"  // Ubah ketebalan stroke di sini
//                                     className="w-5 h-5 text-main"
//                                 >
//                                     <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z" />
//                                 </svg>
//                             </>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             <section className="w-[412px] min-h-[828px] flex flex-col space-y-7 items-start justify-start pt-32 pb-4">
//                 {/* Daftar Brand */}
//                 <div className="w-full flex flex-col space-y-4 items-center justify-start">
//                     <div className="w-full px-4 grid grid-cols-4 gap-x-5 gap-y-4 flex items-start justify-center">
//                         {!(category.name === "Pulsa" || category.name === "Data" || category.name === "Masa Aktif") && !brand ? (
//                             <>
//                                 {brands
//                                     .filter(brandItem => brandItem.name.toLowerCase().includes(searchQuery.toLowerCase()))
//                                     .map((brandItem) => (
//                                         <Link
//                                             key={brandItem.id}
//                                             href={`/c=${category.name}/b=${brandItem.name}?phone=${phoneNumber}`}
//                                             className="w-full h-full flex flex-col space-y-1 items-center justify-start"
//                                         >
//                                             <div className="relative w-14 h-14 mx-auto">
//                                                 <div className="absolute inset-0 w-14 h-14 bg-white rounded-full border border-blue-50 shadow-md"></div>
//                                                 <img
//                                                     src={brandItem.image ? `storage/${brandItem.image}` : "storage/brands/default.webp"}
//                                                     alt={brandItem.name}
//                                                     className="w-14 h-14 rounded-full object-cover absolute inset-0 p-0.5"
//                                                 />
//                                             </div>
//                                             <p className="text-center text-xs line-clamp-2 break-words">{formatBrandName(brandItem.name)}</p>
//                                         </Link>
//                                     ))}

//                             </>
//                         ) : null}
//                     </div>
//                 </div>
//             </section>


//         </div>
//     );
// };

// export default CategoryPage;
import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";

const operatorPrefixes = {
    "Telkomsel": ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853"],
    "Indosat": ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
    "XL": ["0817", "0818", "0819", "0859", "0877", "0878"],
    "Axis": ["0838", "0831", "0832", "0833"],
    "Tri": ["0895", "0896", "0897", "0898", "0899"],
    "Smartfren": ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888"],
    "By.U": ["0851"]
};

const detectOperator = (phoneNumber) => {
    for (const operator in operatorPrefixes) {
        if (operatorPrefixes[operator].some(prefix => phoneNumber.startsWith(prefix))) {
            return operator;
        }
    }
    return null;
};

const formatPhoneNumber = (input) => {
    let number = input.replace(/\D/g, ""); // Hapus semua karakter selain angka
    if (number.startsWith("62")) {
        number = "0" + number.substring(2);
    } else if (number.startsWith("+62")) {
        number = "0" + number.substring(3);
    }
    return number;
};

const formatBrandName = (brandName) => {
    return brandName.split(" - ")[0]; // Mengambil bagian sebelum tanda " - "
};

const CategoryPage = ({ category, brands, brand }) => {
    const { url } = usePage();
    const params = new URLSearchParams(url.split("?")[1]);
    const initialPhoneNumber = params.get("phone") || "";

    const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(initialPhoneNumber));
    const [searchQuery, setSearchQuery] = useState("");
    const [detectedOperator, setDetectedOperator] = useState(detectOperator(phoneNumber));

    useEffect(() => {
        if (phoneNumber.length >= 4) {
            const operator = detectOperator(phoneNumber);
            setDetectedOperator(operator);

            if (operator) {
                window.history.replaceState(null, "", `/c=${category.name}/b=${operator}?phone=${phoneNumber}`);
            }
        }
    }, [phoneNumber, category.name]);

    useEffect(() => {
        if (detectedOperator) {
            const matchedBrands = brands.filter(b => b.name.toLowerCase().startsWith(detectedOperator.toLowerCase()));
            if (matchedBrands.length > 0) {
                window.location.href = `/c=${category.name}/b=${matchedBrands[0].name}?phone=${phoneNumber}`;
            }
        }
    }, [detectedOperator, brands, category.name, phoneNumber]);

    const handlePhoneInputChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    return (
        <div className="mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen">
            {/* fixed position */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[412px] w-full z-10 bg-main">
                {/* Header */}
                <div className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                    <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                        <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <div className="font-utama text-white font-bold text-lg">
                            List {category.name}
                        </div>
                    </div>
                </div>
                {/* Search & Filter */}
                <div className="w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg">
                    <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                        {(category.name === "Pulsa" || category.name === "Data" || category.name === "Masa Aktif") ? (
                            <input
                                id="searchInput"
                                type="text"
                                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                value={phoneNumber}
                                onChange={handlePhoneInputChange}
                                placeholder="Masukkan nomor HP"
                            />
                        ) : (
                            <>
                                <input
                                    id="searchInput"
                                    type="text"
                                    className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari brand..."
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
                            </>
                        )}
                    </div>
                </div>
            </div>

            <section className="w-[412px] min-h-[828px] flex flex-col space-y-7 items-start justify-start pt-32 pb-4">
                <div className="w-full flex flex-col space-y-4 items-center justify-start">
                    <div className="w-full px-4 grid grid-cols-4 gap-x-5 gap-y-4 flex items-start justify-center">
                        {!(category.name === "Pulsa" || category.name === "Data" || category.name === "Masa Aktif") && !brand ? (
                            brands
                                .filter(brandItem => brandItem.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map((brandItem) => (
                                    <Link
                                        key={brandItem.id}
                                        href={`/c=${category.name}/b=${brandItem.name}?phone=${phoneNumber}`}
                                        className="w-full h-full flex flex-col space-y-1 items-center justify-start"
                                    >
                                        <img 
                                            src={brandItem.image ? `storage/${brandItem.image}` : "storage/brands/default.webp"} 
                                            alt={brandItem.name} 
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                        <p className="text-center text-xs">{formatBrandName(brandItem.name)}</p>
                                    </Link>
                                ))
                        ) : null}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CategoryPage;
