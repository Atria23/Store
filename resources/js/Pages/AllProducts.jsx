import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";

export default function AllProducts({ products }) {
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) =>
        product.product_name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, products]);

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <Head title="All Products" />
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-5">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Products</h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search products..."
          className="w-full p-2 border border-gray-300 rounded mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Product List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700">
                {product.product_name}
              </h2>
              <p className="text-gray-500 text-sm">{product.category}</p>
              <p className="text-blue-600 font-bold">Rp {product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
