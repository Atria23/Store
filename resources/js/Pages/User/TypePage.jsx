// import { usePage, Link, router } from "@inertiajs/react";
// import { Inertia, useState, useEffect } from "react";

// const DynamicInput = ({ formula, onChange }) => {
//     const [inputs, setInputs] = useState([]);
//     const [values, setValues] = useState({});

//     useEffect(() => {
//         if (!formula) return;

//         console.log("Formula:", formula); // Cek formula sebelum diproses


//         const inputFields = [];
//         let match;
//         const regex = /\{(i\d+a?)\}/g; // Menangkap {i1}, {i2}, {i1a}, {i2a}

//         while ((match = regex.exec(formula)) !== null) {
//             if (!inputFields.some((item) => item === match[1])) {
//                 inputFields.push(match[1]);
//             }
//         }

//         setInputs(inputFields);
//         setValues(inputFields.reduce((acc, key) => ({ ...acc, [key]: "" }), {}));
//     }, [formula]);

//     const handleInputChange = (key, value) => {
//         const isNumeric = key.includes("a"); // Jika key mengandung "a", hanya boleh angka
//         const sanitizedValue = isNumeric ? value.replace(/\D/g, "") : value; // Hanya angka jika ada "a"

//         setValues((prev) => {
//             const newValues = { ...prev, [key]: sanitizedValue };

//             // Cek apakah input sudah berubah
//             console.log("Updated Input Values:", newValues);

//             let result = formula;

//             for (const [inputKey, inputValue] of Object.entries(newValues)) {
//                 result = result.replaceAll(`{${inputKey}}`, inputValue);
//             }

//             console.log("Updated Formula:", result); // Cek hasil formula setelah diganti
//             onChange(result);

//             return newValues;
//         });
//     };


//     return (
//         <div className="bg-gray-100 p-4 rounded-lg mb-4">
//             <label className="block font-semibold">Masukkan Data:</label>
//             {inputs.map((key, index) => (
//                 <input
//                     key={index}
//                     type="text"
//                     className="w-full p-2 border rounded mb-2"
//                     placeholder={`Input ${index + 1}`}
//                     value={values[key] || ""}
//                     onChange={(e) => handleInputChange(key, e.target.value)}
//                 />
//             ))}
//         </div>
//     );
// };

// export default function TypePage() {
//     const { category, brand, brands = [], type, types: typeList = [], isPulsaOrData, products = [], inputTypes } = usePage().props;
//     const [phone, setPhone] = useState("");
//     const [typingTimeout, setTypingTimeout] = useState(null);
//     const [detectedBrand, setDetectedBrand] = useState("");
//     const [selectedProduct, setSelectedProduct] = useState(null);
//     const [customerNo, setCustomerNo] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [exampleImage, setExampleImage] = useState(null);
//     const [exampleIdProduct, setExampleIdProduct] = useState(null);
//     const [showExamplePopup, setShowExamplePopup] = useState(false);

//     const goToCheckout = (product) => {
//         Inertia.visit(route("checkout", { product_id: product.id }));
//     };

//     const brandPrefixes = {
//         "Telkomsel": ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853"],
//         "Indosat": ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
//         "XL": ["0817", "0818", "0819", "0859", "0877", "0878"],
//         "Tri": ["0895", "0896", "0897", "0898", "0899"],
//         "Axis": ["0831", "0832", "0833", "0838"],
//         "Smartfren": ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
//         "By.U": ["0851"]
//     };

//     useEffect(() => {
//         if (isPulsaOrData) {
//             const params = new URLSearchParams(window.location.search);
//             const phoneFromUrl = params.get("phone") || "";
//             const cleanedPhone = normalizePhoneNumber(phoneFromUrl);
//             setPhone(cleanedPhone);
//             detectBrandByPrefix(cleanedPhone);
//         }
//     }, []);

//     const handlePhoneChange = (e) => {
//         const rawNumber = e.target.value;
//         const cleanedNumber = normalizePhoneNumber(rawNumber);
//         setPhone(cleanedNumber);

//         if (typingTimeout) clearTimeout(typingTimeout);

//         setTypingTimeout(setTimeout(() => {
//             detectBrandByPrefix(cleanedNumber);
//             updateUrl({ phone: cleanedNumber });
//         }, 1000));
//     };

//     const normalizePhoneNumber = (number) => {
//         if (!number) return "";
//         let cleaned = number.replace(/[^0-9]/g, ""); // Hapus semua karakter kecuali angka

//         if (cleaned.startsWith("62")) {
//             cleaned = "0" + cleaned.substring(2); // Ubah "62" menjadi "0"
//         } else if (cleaned.startsWith("+62")) {
//             cleaned = "0" + cleaned.substring(3); // Ubah "+62" menjadi "0"
//         }

//         return cleaned;
//     };

//     const detectBrandByPrefix = (number) => {
//         if (!number || number.length < 4) {
//             setDetectedBrand("");
//             return;
//         }

//         const prefix = number.substring(0, 4);
//         let detected = null;

//         Object.entries(brandPrefixes).forEach(([brandName, prefixes]) => {
//             if (prefixes.includes(prefix)) {
//                 detected = brandName;
//             }
//         });

//         if (!detected) {
//             setDetectedBrand("Tidak Diketahui");
//             return;
//         }

//         const matchedBrand = brands.find(b => b.name.toLowerCase().includes(detected.toLowerCase()));

//         const finalBrand = matchedBrand ? matchedBrand.name : detected;
//         setDetectedBrand(finalBrand);

//         if (finalBrand !== brand?.name) {
//             updateUrl({ phone: number, brand: finalBrand });
//         }
//     };

//     const updateUrl = (updatedValues) => {
//         const params = new URLSearchParams(window.location.search);
//         Object.entries(updatedValues).forEach(([key, value]) => {
//             if (value) {
//                 params.set(key, value);
//             } else {
//                 params.delete(key);
//             }
//         });

//         const newUrl = `/c=${category?.name}/b=${updatedValues.brand || brand?.name}` +
//             (updatedValues.type || type?.name ? `/t=${updatedValues.type || type?.name}` : '') +
//             `?${params.toString()}`;

//         router.get(newUrl, {}, { replace: true });
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         if (!selectedProduct || !(customerNo || phone)) {
//             alert('Mohon lengkapi nomor pelanggan dan pilih produk.');
//             return;
//         }

//         setLoading(true);

//         fetch('/transactions', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//             },
//             body: JSON.stringify({
//                 buyer_sku_code: selectedProduct.buyer_sku_code,
//                 customer_no: customerNo || phone,
//                 max_price: selectedProduct.price,
//                 price_product: selectedProduct.price,
//                 testing: false,
//             }),
//         })
//             .then((response) => response.json())
//             .then((data) => {
//                 if (data.success) {
//                     alert(`${data.message}`);
//                 } else {
//                     alert(`Transaksi gagal: ${data.message}`);
//                 }
//             })
//             .catch(() => {
//                 alert('Terjadi kesalahan saat mengirim permintaan transaksi.');
//             })
//             .finally(() => {
//                 setLoading(false);
//             });
//     };

//     const openExamplePopup = () => {
//         const exampleImage = type?.example_image || brand?.example_image;
//         const exampleId = type?.example_id_product || brand?.example_id_product;

//         if (exampleImage || exampleId) {
//             setExampleImage(exampleImage);
//             setExampleIdProduct(exampleId);
//             setShowExamplePopup(true);
//         }
//     };




//     return (
//         <div className="container mx-auto p-4">
//             <Link href="/" className="text-blue-600 font-bold">&larr; Kembali</Link>
//             <h1 className="text-2xl font-bold my-4">{brand?.name?.split(" - ")[0]}</h1>

//             {/* Input Nomor HP hanya jika kategori adalah Pulsa/Data/Masa Aktif */}
//             {isPulsaOrData && (
//                 <div className="bg-gray-100 p-4 rounded-lg mb-4">
//                     <label className="block font-semibold">Nomor HP:</label>
//                     <input
//                         type="tel"
//                         className="w-full p-2 border rounded"
//                         placeholder="Masukkan nomor HP"
//                         value={phone}
//                         onChange={handlePhoneChange}
//                     />
//                     {phone && (
//                         <p className="text-gray-700 mt-2">
//                             Operator: <strong>{detectedBrand}</strong>
//                         </p>
//                     )}
//                 </div>
//             )}
//             {!isPulsaOrData && (
//                 <>
//                     {/* <div className="bg-gray-100 p-4 rounded-lg mb-4">
//                         <label className="block font-semibold">Nomor Pelanggan:</label>
//                         <input
//                             type="text"
//                             className="w-full p-2 border rounded"
//                             placeholder="Masukkan nomor pelanggan"
//                             value={customerNo}
//                             onChange={(e) => setCustomerNo(e.target.value)}
//                         />
//                     </div> */}
//                     <div>

//                         {inputTypes.length > 0 && (
//                             <DynamicInput
//                                 formula={inputTypes[0]?.formula}
//                                 onChange={(result) => setCustomerNo(result)}
//                             />
//                         )}            <button onClick={handleSubmit} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
//                             {loading ? "Memproses..." : "Kirim Transaksi"}
//                         </button>
//                     </div>
//                 </>
//             )}
//             <button onClick={openExamplePopup}>Lihat Contoh</button>
//             {showExamplePopup && (
//                 <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
//                     <div className="bg-white p-5 rounded-lg shadow-lg max-w-md">
//                         <h2 className="text-lg font-bold mb-3">Contoh Format Pengisian</h2>
//                         {exampleImage && <img src={`/storage/${exampleImage}`} alt="Contoh ID Pelanggan" className="mb-3 rounded-md" />}
//                         {exampleIdProduct && (
//                             <p className="text-gray-700">
//                                 Contoh ID Pelanggan: <span className="font-semibold">{exampleIdProduct}</span>
//                             </p>
//                         )}
//                         <button
//                             onClick={() => setShowExamplePopup(false)}
//                             className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//                         >
//                             Tutup
//                         </button>
//                     </div>
//                 </div>
//             )}


//             {/* Tetap menampilkan daftar Type */}
//             <h2 className="text-xl font-semibold mb-2">List Type</h2>
//             <table className="w-full border-collapse border border-gray-300 mb-4">
//                 <thead>
//                     <tr className="bg-gray-200">
//                         <th className="border p-2">Nama Type</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {typeList.length > 0 ? (
//                         typeList.map((typeItem) => (
//                             <tr key={typeItem.id} className="border">
//                                 <td className="border p-2">
//                                     <Link
//                                         href={`/c=${category?.name}/b=${detectedBrand || brand?.name}/t=${typeItem?.name}?phone=${phone}`}
//                                         className="text-blue-600"
//                                     >
//                                         {typeItem?.name?.split(" - ")[0]}
//                                     </Link>
//                                 </td>
//                             </tr>
//                         ))
//                     ) : (
//                         <tr>
//                             <td className="border p-2 text-center text-gray-500">Tidak ada type tersedia.</td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>

//             <h2 className="text-xl font-semibold mb-2">List Produk</h2>
//             <table className="w-full border-collapse border border-gray-300">
//                 <thead>
//                     <tr className="bg-gray-200">
//                         <th className="border p-2">Nama Produk</th>
//                         <th className="border p-2">Harga</th>
//                         <th className="border p-2">Aksi</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {products.map((product) => (
//                         <tr key={product.buyer_sku_code} className="border">
//                             <td className="border p-2">{product.product_name}</td>
//                             <td className="border p-2">Rp {new Intl.NumberFormat("id-ID").format(product.price)}</td>
//                             <td className="border p-2">
//                                 <button
//                                     onClick={() => setSelectedProduct(product)}
//                                     className="bg-blue-500 text-white px-4 py-2 rounded"
//                                 >
//                                     Pilih
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//             {selectedProduct && (
//                 <form onSubmit={handleSubmit} className="mt-4">
//                     <p className="mb-2">Produk yang dipilih: <strong>{selectedProduct.product_name}</strong></p>
//                     <button
//                         type="submit"
//                         className="bg-green-500 text-white px-4 py-2 rounded"
//                         disabled={loading}
//                     >
//                         {loading ? 'Memproses...' : 'Beli Sekarang'}
//                     </button>
//                 </form>
//             )}
//         </div>
//     );
// }


























import { usePage, Link, router } from "@inertiajs/react";
import { Inertia, useState, useEffect } from "react";

const DynamicInput = ({ formula, onChange }) => {
    const [inputs, setInputs] = useState([]);
    const [values, setValues] = useState({});

    useEffect(() => {
        if (!formula) return;

        console.log("Formula:", formula); // Cek formula sebelum diproses


        const inputFields = [];
        let match;
        const regex = /\{(i\d+a?)\}/g; // Menangkap {i1}, {i2}, {i1a}, {i2a}

        while ((match = regex.exec(formula)) !== null) {
            if (!inputFields.some((item) => item === match[1])) {
                inputFields.push(match[1]);
            }
        }

        setInputs(inputFields);
        setValues(inputFields.reduce((acc, key) => ({ ...acc, [key]: "" }), {}));
    }, [formula]);

    const handleInputChange = (key, value) => {
        const isNumeric = key.includes("a"); // Jika key mengandung "a", hanya boleh angka
        const sanitizedValue = isNumeric ? value.replace(/\D/g, "") : value; // Hanya angka jika ada "a"

        setValues((prev) => {
            const newValues = { ...prev, [key]: sanitizedValue };

            // Cek apakah input sudah berubah
            console.log("Updated Input Values:", newValues);

            let result = formula;

            for (const [inputKey, inputValue] of Object.entries(newValues)) {
                result = result.replaceAll(`{${inputKey}}`, inputValue);
            }

            console.log("Updated Formula:", result); // Cek hasil formula setelah diganti
            onChange(result);

            return newValues;
        });
    };


    return (
        <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <label className="block font-semibold">Masukkan Data:</label>
            {inputs.map((key, index) => (
                <input
                    key={index}
                    type="text"
                    className="w-full p-2 border rounded mb-2"
                    placeholder={`Input ${index + 1}`}
                    value={values[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                />
            ))}
        </div>
    );
};

export default function TypePage() {
    const { category, brand, brands = [], type, types: typeList = [], isPulsaOrData, products = [], inputTypes } = usePage().props;
    const [phone, setPhone] = useState("");
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [detectedBrand, setDetectedBrand] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [customerNo, setCustomerNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [exampleImage, setExampleImage] = useState(null);
    const [exampleIdProduct, setExampleIdProduct] = useState(null);
    const [showExamplePopup, setShowExamplePopup] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTypes = typeList.filter((type) =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const goToCheckout = (product) => {
        if (!customerNo && !phone) {
            alert("Masukkan ID Tujuan terlebih dahulu!");
            return;
        }
    
        router.get(`/checkout`, {
            id: product.id,
            customerNo,
            phone
        });
    };
    


    const brandPrefixes = {
        "Telkomsel": ["0811", "0812", "0813", "0821", "0822", "0823", "0852", "0853"],
        "Indosat": ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
        "XL": ["0817", "0818", "0819", "0859", "0877", "0878"],
        "Tri": ["0895", "0896", "0897", "0898", "0899"],
        "Axis": ["0831", "0832", "0833", "0838"],
        "Smartfren": ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
        "By.U": ["0851"]
    };

    useEffect(() => {
        if (isPulsaOrData) {
            const params = new URLSearchParams(window.location.search);
            const phoneFromUrl = params.get("phone") || "";
            const cleanedPhone = normalizePhoneNumber(phoneFromUrl);
            setPhone(cleanedPhone);
            detectBrandByPrefix(cleanedPhone);
        }
    }, []);

    const handlePhoneChange = (e) => {
        const rawNumber = e.target.value;
        const cleanedNumber = normalizePhoneNumber(rawNumber);
        setPhone(cleanedNumber);

        if (typingTimeout) clearTimeout(typingTimeout);

        setTypingTimeout(setTimeout(() => {
            detectBrandByPrefix(cleanedNumber);
            updateUrl({ phone: cleanedNumber });
        }, 1000));
    };

    const normalizePhoneNumber = (number) => {
        if (!number) return "";
        let cleaned = number.replace(/[^0-9]/g, ""); // Hapus semua karakter kecuali angka

        if (cleaned.startsWith("62")) {
            cleaned = "0" + cleaned.substring(2); // Ubah "62" menjadi "0"
        } else if (cleaned.startsWith("+62")) {
            cleaned = "0" + cleaned.substring(3); // Ubah "+62" menjadi "0"
        }

        return cleaned;
    };

    const detectBrandByPrefix = (number) => {
        if (!number || number.length < 4) {
            setDetectedBrand("");
            return;
        }

        const prefix = number.substring(0, 4);
        let detected = null;

        Object.entries(brandPrefixes).forEach(([brandName, prefixes]) => {
            if (prefixes.includes(prefix)) {
                detected = brandName;
            }
        });

        if (!detected) {
            setDetectedBrand("Tidak Diketahui");
            return;
        }

        const matchedBrand = brands.find(b => b.name.toLowerCase().includes(detected.toLowerCase()));

        const finalBrand = matchedBrand ? matchedBrand.name : detected;
        setDetectedBrand(finalBrand);

        if (finalBrand !== brand?.name) {
            updateUrl({ phone: number, brand: finalBrand });
        }
    };

    const updateUrl = (updatedValues) => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(updatedValues).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        const newUrl = `/c=${category?.name}/b=${updatedValues.brand || brand?.name}` +
            (updatedValues.type || type?.name ? `/t=${updatedValues.type || type?.name}` : '') +
            `?${params.toString()}`;

        router.get(newUrl, {}, { replace: true });
    };

    const handleCheckout = (product) => {
        if (!customerNo) {
            alert("Masukkan ID Tujuan terlebih dahulu!");
            return;
        }

        router.visit(`/checkout`, {
            method: "get",
            data: {
                product,
                customerNo,
                phone
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedProduct || !(customerNo || phone)) {
            alert('Mohon lengkapi nomor pelanggan dan pilih produk.');
            return;
        }

        setLoading(true);

        fetch('/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: JSON.stringify({
                buyer_sku_code: selectedProduct.buyer_sku_code,
                customer_no: customerNo || phone,
                max_price: selectedProduct.price,
                price_product: selectedProduct.price,
                testing: false,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert(`${data.message}`);
                } else {
                    alert(`Transaksi gagal: ${data.message}`);
                }
            })
            .catch(() => {
                alert('Terjadi kesalahan saat mengirim permintaan transaksi.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const openExamplePopup = () => {
        const exampleImage = type?.example_image || brand?.example_image;
        const exampleId = type?.example_id_product || brand?.example_id_product;

        if (exampleImage || exampleId) {
            setExampleImage(exampleImage);
            setExampleIdProduct(exampleId);
            setShowExamplePopup(true);
        }
    };




    return (
        <div className="container mx-auto p-4">
            <Link href="/" className="text-blue-600 font-bold">&larr; Kembali</Link>
            <div className="flex items-center gap-3 my-4">
                {brand?.image && (
                    <img
                        src={brand.image ? `/storage/${brand.image}` : "storage/categories/default.png"}
                        alt={brand.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-300"
                    />
                )}
                <h1 className="text-2xl font-bold">{brand?.name?.split(" - ")[0]}</h1>
            </div>

            {/* Input Nomor HP hanya jika kategori adalah Pulsa/Data/Masa Aktif */}
            {isPulsaOrData && (
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                    <label className="block font-semibold">Nomor HP:</label>
                    <input
                        type="tel"
                        className="w-full p-2 border rounded"
                        placeholder="Masukkan nomor HP"
                        value={phone}
                        onChange={handlePhoneChange}
                    />
                    {phone && (
                        <p className="text-gray-700 mt-2">
                            Operator: <strong>{detectedBrand}</strong>
                        </p>
                    )}
                </div>
            )}

            {!isPulsaOrData && inputTypes.length > 0 && (
                <div className="relative w-full">
                    <DynamicInput
                        formula={inputTypes[0]?.formula}
                        onChange={(result) => setCustomerNo(result)}
                        className="w-full pr-12" // Beri padding kanan agar ikon tidak menutupi teks input
                    />
                    <button
                        onClick={openExamplePopup}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12" y2="8" />
                        </svg>
                    </button>
                </div>
            )}

            {showExamplePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg max-w-md">
                        <h2 className="text-lg font-bold mb-3">Contoh Format Pengisian</h2>
                        {exampleImage && <img src={`/storage/${exampleImage}`} alt="Contoh ID Pelanggan" className="mb-3 rounded-md" />}
                        {exampleIdProduct && (
                            <p className="text-gray-700">
                                Contoh ID Pelanggan: <span className="font-semibold">{exampleIdProduct}</span>
                            </p>
                        )}
                        <button
                            onClick={() => setShowExamplePopup(false)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

            {/* Tetap menampilkan daftar Type */}
            {/* <h2 className="text-xl font-semibold mb-2">List Type</h2>
            <table className="w-full border-collapse border border-gray-300 mb-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Nama Type</th>
                    </tr>
                </thead>
                <tbody>
                    {typeList.length > 0 ? (
                        typeList.map((typeItem) => (
                            <tr key={typeItem.id} className="border">
                                <td className="border p-2">
                                    <Link
                                        href={`/c=${category?.name}/b=${detectedBrand || brand?.name}/t=${typeItem?.name}?phone=${phone}`}
                                        className="text-blue-600"
                                    >
                                        {typeItem?.name?.split(" - ")[0]}
                                    </Link>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="border p-2 text-center text-gray-500">Tidak ada type tersedia.</td>
                        </tr>
                    )}
                </tbody>
            </table> */}
            <div>
                {/* Tombol Pilih Type */}
                <button
                    onClick={() => setShowPopup(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                    Pilih Type
                </button>

                {/* Popup Pilihan Type */}
                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-h-[470px] overflow-y-auto">
                            <h2 className="text-xl font-semibold mb-2 text-center">Pilih Type</h2>

                            {/* Search Input */}
                            <input
                                type="text"
                                placeholder="Cari type..."
                                className="w-full p-2 border rounded mb-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* List Type */}
                            <div className="space-y-2">
                                <Link
                                    href={`/c=${category?.name}/b=${detectedBrand || brand?.name}/t=all?phone=${phone}`}
                                    className="block bg-gray-300 p-2 text-center rounded hover:bg-gray-400"
                                >
                                    Tampilkan Semua
                                </Link>

                                {filteredTypes.length > 0 ? (
                                    filteredTypes.map((typeItem) => (
                                        <Link
                                            key={typeItem.id}
                                            href={`/c=${category?.name}/b=${detectedBrand || brand?.name}/t=${typeItem?.name}?phone=${phone}`}
                                            className="block bg-blue-500 text-white p-2 text-center rounded hover:bg-blue-600"
                                        >
                                            {typeItem?.name?.split(" - ")[0]}
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">Tidak ada type tersedia.</p>
                                )}
                            </div>

                            {/* Tombol Kembali */}
                            <button
                                onClick={() => setShowPopup(false)}
                                className="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
                            >
                                Kembali
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <h2 className="text-xl font-semibold mb-2">List Produk</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 shadow-md bg-white">
                        <h3 className="text-lg font-semibold">{product.product_name}</h3>
                        <p className="text-gray-600">Rp {new Intl.NumberFormat("id-ID").format(product.price)}</p>
                        <button
                            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => setSelectedProduct(product)}
                        >
                            Pilih
                        </button>
                    </div>
                ))}
            </div>

            {selectedProduct && (
                <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-lg border-t max-h-[470px] flex flex-col justify-between">
                    <div className="overflow-y-auto">
                        <h3 className="text-lg font-semibold">{selectedProduct.product_name}</h3>
                        <p className="text-gray-600">{selectedProduct.description}</p>
                    </div>
                    <div className="mt-4">
                        <p className="text-lg font-bold">Rp {new Intl.NumberFormat("id-ID").format(selectedProduct.price)}</p>
                        {/* <button
                            className="mt-2 bg-green-500 text-white px-4 py-2 w-full rounded"
                            onClick={() => goToCheckout(selectedProduct)}
                        >
                            Beli Sekarang
                        </button> */}
                        <button 
    onClick={() => goToCheckout(selectedProduct)} 
    className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
>
    Checkout
</button>


                        <button
                            className="mt-2 bg-gray-500 text-white px-4 py-2 w-full rounded"
                            onClick={() => setSelectedProduct(null)}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
