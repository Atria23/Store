import { Head, usePage, Link, router } from "@inertiajs/react";
import { useRef, useState, useEffect } from "react";
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const DynamicInput = ({ formula, onChange }) => {

    const [inputs, setInputs] = useState([]);
    const [values, setValues] = useState({});
    const [finalResult, setFinalResult] = useState("");

    useEffect(() => {
        if (!formula) return;

        const inputFields = [];
        let match;
        const regex = /\{(i\d+a?)\}/g;

        while ((match = regex.exec(formula)) !== null) {
            if (!inputFields.includes(match[1])) {
                inputFields.push(match[1]);
            }
        }

        setInputs(inputFields);
        setValues(inputFields.reduce((acc, key) => ({ ...acc, [key]: "" }), {}));
    }, [formula]);

    useEffect(() => {
        if (!formula || inputs.length === 0) return;

        let result = formula;
        for (const key of inputs) {
            result = result.replaceAll(`{${key}}`, values[key] || "");
        }
        setFinalResult(result);
    }, [values, formula, inputs]);

    useEffect(() => {
        if (onChange) {
            onChange(finalResult);
        }
    }, [finalResult]);

    const handleInputChange = (key, value) => {
        const isNumeric = key.includes("a");
        const sanitizedValue = isNumeric ? value.replace(/\D/g, "") : value;

        setValues((prev) => ({ ...prev, [key]: sanitizedValue }));
    };

    const inputCount = inputs.length;

    return (
        <div className={`flex ${inputCount === 1 ? "flex-col" : "flex-row gap-2"}`}>
            {inputs.map((key, index) => (
                <input
                    key={index}
                    type="text"
                    className={`rounded-lg bg-neutral-100 border-2 border-gray-200 px-3 w-full focus:outline-none focus:ring-0 placeholder-gray-400 ${inputCount > 1 ? "flex-1" : ""}`}
                    placeholder={`Input ${index + 1}`}
                    value={values[key] || ""}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                />
            ))}
        </div>
    );
};

export default function TypePage() {
    const { category, brand, brands = [], type, types: typeList = [], isPulsaOrData, products = [], inputTypes, commission } = usePage().props;
    const [phone, setPhone] = useState("");
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [detectedBrand, setDetectedBrand] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [customerNo, setCustomerNo] = useState("");
    const [exampleImage, setExampleImage] = useState(null);
    const [exampleIdProduct, setExampleIdProduct] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [errors, setErrors] = useState({});
    const [showExamplePopup, setShowExamplePopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const shareRef = useRef(null);
    const [selectedCommission, setSelectedCommission] = useState(0);
    const { user } = usePage().props;

    const [showLottie, setShowLottie] = useState(false);

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                setShowLottie(true);
                setTimeout(() => setShowLottie(false), 2000); // Sembunyikan animasi setelah 2 detik
            })
            .catch((err) => {
                console.error("Gagal menyalin URL: ", err);
            });
    };

    const handleShare = (product) => {
        setSelectedCommission(product.commission ?? 0);
        setSelectedProduct(null)
        setShowSharePopup(true);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setShowSharePopup(false);
            }
        };

        if (showSharePopup) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSharePopup]);


    const filteredTypes = typeList.filter((type) =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const goToCheckout = (product) => {
        if (!user) {
            router.visit('/login');
            return;
        }
    
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

    

    const inputRef = useRef(null);

    useEffect(() => {
    if (inputRef.current) {
        inputRef.current.focus();
    }
    }, []);
    
    // const handlePhoneChange = (e) => {
    //     const rawNumber = e.target.value;
    //     const cleanedNumber = normalizePhoneNumber(rawNumber);
    //     setPhone(cleanedNumber);
    
    //     detectBrandByPrefix(cleanedNumber);
    //     updateUrl({ phone: cleanedNumber });
    //   };

    const lastPrefixRef = useRef("");

    const handlePhoneChange = (e) => {
        const rawNumber = e.target.value;
        const cleanedNumber = normalizePhoneNumber(rawNumber);
        setPhone(cleanedNumber);

        // Cek prefix 4 digit
    const currentPrefix = cleanedNumber.substring(0, 4);

    if (currentPrefix !== lastPrefixRef.current) {
        lastPrefixRef.current = currentPrefix;
        detectBrandByPrefix(cleanedNumber);
        updateUrl({ phone: cleanedNumber });
    }
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

    const openExamplePopup = () => {
        const exampleImage = type?.example_image || brand?.example_image;
        const exampleId = type?.example_id_product || brand?.example_id_product;

        setExampleImage(exampleImage);
        setExampleIdProduct(exampleId);
        setShowExamplePopup(true);
    };


    const [dragOffset, setDragOffset] = useState(0);
    const [startY, setStartY] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e) => {
        setStartY(e.clientY);
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDragging) {
                const currentY = e.clientY;
                const offset = Math.max(0, currentY - startY);
                setDragOffset(offset);
            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                if (dragOffset > 100) {
                    setSelectedProduct(null);
                } else {
                    setDragOffset(0);
                }
                setStartY(null);
                setIsDragging(false);
            }
        };

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

    useEffect(() => {
        setDragOffset(0);
    }, [selectedProduct]);


    const handleTouchStart = (e) => {
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e) => {
        if (startY !== null) {
            const currentY = e.touches[0].clientY;
            const offset = Math.max(0, currentY - startY);
            setDragOffset(offset);
        }
    };

    const handleTouchEnd = () => {
        if (dragOffset > 100) {
            setSelectedProduct(null);
        } else {
            // reset ke posisi semula
            setDragOffset(0);
        }
        setStartY(null);
    };

    useEffect(() => {
        setDragOffset(0);
    }, [selectedProduct]);

    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setSelectedProduct(null); // Tutup modal
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <Head title="Product Page" />

            <div className="mx-auto w-full max-w-[500px] max-h-[892px] min-h-screen">
                {/* fixed position */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    {/* Header */}
                    <section className="w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
                        <div className="w-full h-max flex flex-row space-x-4 items-center justify-start">
                            {isPulsaOrData ? (
                                <Link href={route('user.dashboard')} className="shrink-0 w-6 h-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                    </svg>
                                </Link>
                            ) : (
                                <button
                                    className="shrink-0 w-6 h-6"
                                    onClick={() => window.history.back()}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                                    </svg>
                                </button>
                            )}
                            <div className="font-utama text-white font-bold text-lg">
                                {category.name}
                            </div>
                        </div>
                    </section>

                    <section className="w-full h-max flex flex-col space-y-3 p-4 bg-white shadow-lg">
                        <div className="w-full h-max flex flex-col space-y-3 items-center justify-start">
                            <div className="w-full h-9 flex flex-row space-x-4 items-center justify-start">
                                <img
                                    src={brand?.image ? `/storage/${brand.image}` : "/storage/categories/default.png"}
                                    alt={brand?.name}
                                    className="w-9 h-9 rounded-full object-cover border border-gray-300"
                                />
                                <h1 className="text-utama text-lg font-medium text-center align-middle">
                                    {brand?.name?.split(" - ")[0]}
                                </h1>
                            </div>

                            <div className="w-full flex flex-row mx-auto items-center justify-center">
                                {isPulsaOrData && (
                                    <div className="flex-grow"
                                    >
                                        <input
                                            ref={inputRef}
                                            type="tel"
                                            className="rounded-lg bg-neutral-100 border-2 border-gray-200 px-3 w-full focus:outline-none focus:ring-0 placeholder-gray-400"
                                            placeholder="Masukkan nomor HP"
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            autoComplete="off"
                                        />
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
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-white transition"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-info-circle-fill w-5 h-5 text-main" viewBox="0 0 16 16">
                                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                {showExamplePopup && (
                                    <div className="fixed h-screen px-4 inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                        <div className="w-full max-w-[328px] p-4 bg-white rounded-lg shadow-lg">
                                            <div className="w-full h-max flex flex-col">
                                                <h2 className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                                                    Contoh Format Pengisian
                                                </h2>
                                            </div>

                                            {exampleImage ? (
                                                <img src={`/storage/${exampleImage}`} alt="Contoh ID Pelanggan" className="w-full" />
                                            ) : (
                                                <p className="text-gray-500 italic w-full text-center text-md">
                                                    Gambar contoh ID pelanggan tidak tersedia.
                                                </p>
                                            )}

                                            {exampleIdProduct ? (
                                                <p className="text-gray-700 w-full text-center text-md font-medium">
                                                    Contoh ID Pelanggan:<br />
                                                    <span className="font-semibold">{exampleIdProduct}</span>
                                                </p>
                                            ) : (
                                                <p className="text-gray-500 italic w-full text-center text-md">
                                                    Contoh  ID pelanggan tidak tersedia.
                                                </p>
                                            )}


                                            <div className="w-full h-max mt-2 flex flex-col items-center justify-center">
                                                <button
                                                    onClick={() => {
                                                        setShowExamplePopup(false);
                                                        setErrors({});
                                                    }}
                                                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                                                >
                                                    MENGERTI
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="w-full h-px bg-gray-300 my-4" />

                        <div className="w-full h-max flex flex-col space-y-3 items-center justify-center">
                            <div className="w-full flex flex-row items-center justify-center py-2 rounded bg-main hover:bg-blue-700 text-white">
                                <button
                                    onClick={() => setShowPopup(true)}
                                    type="button"
                                    className="w-full flex flex-row space-x-2 items-center justify-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-grid-fill" viewBox="0 0 16 16">
                                        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5z" />
                                    </svg>
                                    <span className="text-sm font-medium">Kategori</span>
                                </button>
                                {/* Popup Pilihan Type */}

                                {showPopup && (
                                    <div className="fixed h-screen px-4 inset-0 z-20 flex items-center justify-center bg-gray-800 bg-opacity-50">
                                        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-4 bg-white rounded-lg shadow-lg">
                                            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                                                <input
                                                    type="text"
                                                    className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400 text-black"
                                                    placeholder="Cari type..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
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

                                            <div className="w-full max-h-[342px] flex flex-col items-start justify-start overflow-y-auto">
                                                <Link
                                                    href={`/c=${category?.name}/b=${detectedBrand || brand?.name}/t=all?phone=${phone}`}
                                                    className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer text-main"
                                                >
                                                    <p className="text-utama text-sm text-left align-middle">Tampilkan Semua</p>
                                                </Link>
                                                {filteredTypes.length > 0 ? (
                                                    filteredTypes.map((typeItem) => (
                                                        <Link
                                                            key={typeItem.id}
                                                            href={`/c=${category?.name}/b=${detectedBrand || brand?.name}/t=${typeItem?.name}?phone=${phone}`}
                                                            className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer text-black"
                                                        >
                                                            <p className="text-utama text-sm text-left align-middle">{typeItem?.name?.split(" - ")[0]}</p>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer text-main">
                                                        <p className="text-gray-500 text-sm text-left align-middle">Tipe yang dicari tidak tersedia.</p>
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setShowPopup(false)}
                                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
                                <input
                                    id="searchInput"
                                    type="text"
                                    className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    placeholder="Cari produk..."
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
                        </div>

                    </section>
                </div>

                <section className="flex flex-col pt-[294px] gap-5 p-4">
                    {products
                        .filter((product) =>
                            product.product_name?.toLowerCase().includes(productSearch.toLowerCase())
                        )
                        .sort((a, b) => a.price - b.price)
                        .map((product) => {
                            const now = new Date();

                            // ambil tanggal hari ini
                            const todayDate = now.toISOString().split('T')[0];

                            // gabungkan tanggal + jam cut off
                            const startCutOff = new Date(`${todayDate}T${product.start_cut_off}`);
                            const endCutOff = new Date(`${todayDate}T${product.end_cut_off}`);
                            endCutOff.setMinutes(endCutOff.getMinutes() + 1);
                            const isDisabled = product.seller_product_status === 0 || (now >= startCutOff && now <= endCutOff);

                            return (
                                <div
                                    onClick={() => {
                                        if (!isDisabled) {
                                            setSelectedProduct(product);
                                        }
                                    }}
                                    key={product.id}
                                    className={`flex flex-col space-y-2 border py-3 px-4 rounded-lg shadow-md 
                        ${isDisabled ? "bg-gray-200 opacity-70 cursor-not-allowed" : "bg-white cursor-pointer"}
                    `}
                                >
                                    <h3 className="w-full text-utama text-sm font-medium text-justify line-clamp-3">
                                        {product.product_name}
                                    </h3>
                                    <div className="flex flex-row justify-between items-center w-full mt-2">
                                        <div className="flex flex-col">
                                            <p className="text-main text-lg font-semibold">
                                                Rp{new Intl.NumberFormat("id-ID").format(product.price)}
                                            </p>
                                            {isDisabled && (
                                                <p className="text-xs text-red-500 mt-1">Gangguan</p>
                                            )}
                                        </div>
                                        {!isDisabled && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleShare(product);
                                                }}
                                                className="text-blue-500 flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-5 h-5" viewBox="0 0 16 16">
                                                    <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </section>


                {selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-end justify-center">
                        <div
                            ref={modalRef}
                            className="fixed left-1/2 bottom-0 transform -translate-x-1/2 w-full max-w-[500px] px-4 bg-white shadow-lg border-t max-h-[470px] flex flex-col justify-between rounded-t-xl transition-transform duration-200 ease-out z-50"
                            style={{ transform: `translate(-50%, ${dragOffset}px)` }}
                        >

                            <div className="flex justify-center py-3">
                                <div
                                    className="w-12 h-1.5 rounded-full bg-gray-400 hover:bg-gray-500 transition touch-none cursor-pointer"
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    onMouseDown={handleMouseDown} // 👈 versi desktop
                                />
                            </div>

                            <div className="max-h-[420px] flex flex-col space-y-2 items-start justify-start pt-3 border-t border-b border-gray-300">
                                <div className="w-full max-h-[150px] overflow-y-auto">
                                    <p className="w-full text-utama font-medium text-md text-justify break-words pb-2 border-b border-gray-200">
                                        {selectedProduct.product_name}
                                    </p>
                                    <p className="w-full text-gray-600 text-sm font-thin text-justify break-words my-2">
                                        Deskripsi:<br />
                                        {selectedProduct.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between w-full py-3">
                                <p className="text-lg text-utama text-main font-bold">Rp{new Intl.NumberFormat("id-ID").format(selectedProduct.price)}</p>
                                <button
                                    onClick={() => goToCheckout(selectedProduct)}
                                    className="bg-main text-white px-4 py-2 rounded"
                                >
                                    Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showSharePopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-end justify-center">
                        <div
                            ref={shareRef}
                            className="w-full max-w-[500px] px-4 pb-2 bg-white shadow-lg border-t flex flex-col justify-between rounded-t-xl z-50 transition-transform duration-200 ease-out">

                            {/* Tombol Tutup */}
                            <div className="flex justify-center py-3">
                                <button
                                    onClick={() => setShowSharePopup(false)}
                                    className="text-sm font-medium text-red-600 border border-red-600 px-4 py-1 rounded hover:bg-red-50 transition"
                                >
                                    Tutup
                                </button>
                            </div>

                            <p className="w-full text-utama font-medium text-xs text-center break-words py-2 border-b border-gray-200">
                                BAGIKAN DAN RAIH KOMISI
                            </p>

                            {/* Konten Share */}
                            <div className="max-h-[420px] flex flex-col space-y-2 items-start justify-start py-2 border-t border-b border-gray-300">
                                <div className="w-full max-h-[150px] overflow-y-auto">
                                    <div>
                                        <p className="text-gray-600 text-xs font-thin text-justify break-words my-2">
                                        Komisi hanya diberikan untuk setiap pesanan yang berhasil diselesaikan oleh teman yang diundang,
                                        pastikan kamu telah terdaftar sebagai affiliator Muvausa Store.{" "}
                                            <a
                                                href="/affiliator"
                                                className="text-blue-600 hover:text-blue-800 transition"
                                            >
                                                DAFTAR SEBAGAI AFFILIATOR SEKARANG
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between w-full py-3">
                                <div className="text-justify">
                                    <p className="text-sm text-black font-medium">Komisi</p>
                                    <p className="text-lg text-main font-bold">
                                        Rp{new Intl.NumberFormat("id-ID").format(selectedCommission)}
                                    </p>
                                </div>
                                {showLottie ? (
                                    <div className="w-24">
                                        <DotLottieReact
                                            src="https://lottie.host/519fbc9d-1e9b-4ddf-ab6f-14423aabd845/MtxYOaYcV8.lottie"
                                            autoplay
                                            loop={false}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCopyLink}
                                        className="bg-main text-white px-3 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="currentColor"
                                            className="w-5 h-5 font-bold text-white"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                                            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                                        </svg>
                                        <span className="font-semibold text-sm">Salin</span>
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
