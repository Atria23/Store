import { Link } from "@inertiajs/react";

export default function Home({ categories }) {
    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold text-center mb-4">Kategori Produk</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        href={`/${category.name}`}
                        className="block text-center"
                    >
                        <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
                            <img
                                src={`/storage/${category.image}`}
                                alt={category.name}
                                className="w-20 h-20 mx-auto rounded-full object-cover border border-gray-300"
                            />
                            <p className="mt-2 text-sm font-semibold">{category.name}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
