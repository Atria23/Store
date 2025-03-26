import { Link } from "@inertiajs/react";

export default function AffiliateProductDetail({ affiliateProduct }) {
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">{affiliateProduct.product_name}</h2>
            
            <div className="mb-4">
                <p><strong>Kategori:</strong> {affiliateProduct.category}</p>
                <p><strong>Brand:</strong> {affiliateProduct.brand}</p>
                <p><strong>Tipe:</strong> {affiliateProduct.type}</p>
                <p><strong>Komisi:</strong> Rp{affiliateProduct.commission.toLocaleString()}</p>
            </div>

            <Link href={route("affiliate.products.index")} className="text-blue-500 hover:underline">
                &larr; Kembali ke daftar produk
            </Link>
        </div>
    );
}
