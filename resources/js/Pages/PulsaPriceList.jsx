import React from 'react';
import { usePage } from '@inertiajs/react';

export default function PulsaPriceList() {
    const { products } = usePage().props; // Data dikirim dari Laravel

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Daftar Produk Pulsa</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="border p-4 rounded shadow">
                            <h2 className="font-semibold">{product.product_name}</h2>
                            <p>Kategori: {product.category}</p>
                            <p>Brand: {product.brand}</p>
                            <p>Harga: Rp{product.price.toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Tidak ada produk tersedia.</p>
                )}
            </div>
        </div>
    );
}
