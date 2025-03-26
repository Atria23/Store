import { Link } from "@inertiajs/react";

export default function AffiliateProducts({ affiliateProducts }) {
    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Produk Afiliasi</h2>

            <table className="w-full border-collapse border border-gray-200">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Nama Produk</th>
                        <th className="border px-4 py-2">Kategori</th>
                        <th className="border px-4 py-2">Brand</th>
                        <th className="border px-4 py-2">Tipe</th>
                        <th className="border px-4 py-2">Komisi</th>
                        <th className="border px-4 py-2">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {affiliateProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{product.product_name}</td>
                            <td className="border px-4 py-2">{product.category}</td>
                            <td className="border px-4 py-2">{product.brand}</td>
                            <td className="border px-4 py-2">{product.type}</td>
                            <td className="border px-4 py-2">Rp{product.commission.toLocaleString()}</td>
                            <td className="border px-4 py-2">
                                <Link
                                    href={route("affiliate.products.show", product.id)}
                                    className="text-blue-500 hover:underline"
                                >
                                    Detail
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
