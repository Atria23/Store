import { Head } from "@inertiajs/react";

export default function AffiliateProductDetail({ affiliateProduct }) {
    return (
        <>
            <Head title="Detail Produk Affiliate" />
            <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
                {/* Header */}
                <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row items-center px-4 py-2 bg-main">
                    <button className="w-6 h-6" onClick={() => window.history.back()}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                    </button>
                    <div className="ml-4 font-utama text-white font-bold text-lg">
                        Detail Produk Affiliasi
                    </div>
                </header>

                {/* Main Card */}
                <main className="flex flex-col space-y-6 mt-12 [@media(max-width:277px)]:mt-[76px] p-4 bg-main-white">
                    <div className="w-full p-6 rounded-3xl bg-white shadow-md flex flex-col space-y-4">
                        <div className="w-full flex justify-center">
                            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-14 h-14 text-blue-500"
                                            viewBox="0 0 16 16"
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.01-.003.268-.108a.75.75 0 0 1 .558 0l.269.108.01.003zM10.404 2 4.25 4.461 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339L8 5.961 5.596 5l6.154-2.461z" />
                                        </svg>
                            </div>
                        </div>
                        <h2 className="text-center font-utama text-xl font-semibold break-words">{affiliateProduct.product_name}</h2>

                        <div className="w-full flex items-center justify-center">
                                <p className="w-max text-center text-xl font-medium px-4 py-1 rounded-full text-blue-700 bg-blue-100 border border-blue-700">
                                    {affiliateProduct.commission.toLocaleString("id-ID")}<span className="text-sm"> PoinMu</span>
                                </p>
                            </div>
                        <div className="h-px w-full bg-gray-300" />

                        <div className="flex flex-col space-y-3 text-sm font-utama">
                            <div className="flex justify-between">
                                <span className="text-gray-700">Kategori</span>
                                <span className="font-medium">{affiliateProduct.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Brand</span>
                                <span className="font-medium">{affiliateProduct.brand?.split(" - ")[0]}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Tipe</span>
                                <span className="font-medium">{affiliateProduct.type?.split(" - ")[0]}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-700">Komisi</span>
                                <span className="font-medium">{affiliateProduct.commission.toLocaleString("id-ID")} PoinMu</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
