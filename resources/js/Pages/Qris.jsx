import React from "react";
import { useForm, usePage } from "@inertiajs/react";

export default function Qris() {
    const { wallet } = usePage().props; // Data wallet yang dikirim dari controller
    const { data, setData, post, processing, errors } = useForm({
        qris: wallet?.qris || "",
        qris_manual: wallet?.qris_manual || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("wallet.qris.update"));
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow rounded">
            <h1 className="text-lg font-bold mb-4">Edit QRIS Information</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="qris" className="block text-sm font-medium">
                        QRIS
                    </label>
                    <input
                        id="qris"
                        type="text"
                        value={data.qris}
                        onChange={(e) => setData("qris", e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                    {errors.qris && (
                        <p className="text-sm text-red-500 mt-1">{errors.qris}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="qris_manual" className="block text-sm font-medium">
                        QRIS Manual
                    </label>
                    <input
                        id="qris_manual"
                        type="text"
                        value={data.qris_manual}
                        onChange={(e) => setData("qris_manual", e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                    {errors.qris_manual && (
                        <p className="text-sm text-red-500 mt-1">{errors.qris_manual}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {processing ? "Saving..." : "Save"}
                </button>
            </form>
        </div>
    );
}
