import { useState, useEffect } from "react";

export default function CategoryBrandTypeSelect({ data, setData, categories, brands, types, inputTypes }) {
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [filteredTypes, setFilteredTypes] = useState([]);

    // Filter brand berdasarkan kategori yang dipilih
    useEffect(() => {
        if (data.category_id) {
            setFilteredBrands(brands.filter(brand => brand.category_id === parseInt(data.category_id)));
            setData("brand_id", ""); // Reset brand jika kategori berubah
            setData("type_id", "");  // Reset type
        } else {
            setFilteredBrands([]);
        }
    }, [data.category_id]);

    // Filter type berdasarkan brand yang dipilih
    useEffect(() => {
        if (data.brand_id) {
            setFilteredTypes(types.filter(type => type.brand_id === parseInt(data.brand_id)));
            setData("type_id", ""); // Reset type jika brand berubah
        } else {
            setFilteredTypes([]);
        }
    }, [data.brand_id]);

    return (
        <div>
            {/* Pilih Kategori */}
            <div>
                <label className="text-sm font-medium">Kategori*</label>
                <select className="w-full px-4 py-2 border rounded" value={data.category_id} onChange={(e) => setData("category_id", e.target.value)}>
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Pilih Brand */}
            <div>
                <label className="text-sm font-medium">Brand*</label>
                <select className="w-full px-4 py-2 border rounded" value={data.brand_id} onChange={(e) => setData("brand_id", e.target.value)} disabled={!filteredBrands.length}>
                    <option value="">Pilih Brand</option>
                    {filteredBrands.map(brand => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                </select>
            </div>

            {/* Pilih Type */}
            <div>
                <label className="text-sm font-medium">Tipe*</label>
                <select className="w-full px-4 py-2 border rounded" value={data.type_id} onChange={(e) => setData("type_id", e.target.value)} disabled={!filteredTypes.length}>
                    <option value="">Pilih Type</option>
                    {filteredTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
            </div>

            {/* Pilih Input Type */}
            <div>
                <label className="text-sm font-medium">Jenis Input*</label>
                <select className="w-full px-4 py-2 border rounded" value={data.input_type_id} onChange={(e) => setData("input_type_id", e.target.value)}>
                    <option value="">Pilih Jenis Input</option>
                    {inputTypes.map(it => (
                        <option key={it.id} value={it.id}>{it.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
