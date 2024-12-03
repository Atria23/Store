import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

export default function Wallet({ wallet }) {
    const { data, setData, post, processing, errors } = useForm({
        shopeepay: wallet?.shopeepay || "",
        dana: wallet?.dana || "",
        gopay: wallet?.gopay || "",
        ovo: wallet?.ovo || "",
        linkaja: wallet?.linkaja || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("wallet.update"));
    };

    return (
        <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Edit Wallet</h1>
            <form onSubmit={handleSubmit}>
                {["shopeepay", "dana", "gopay", "ovo", "linkaja"].map((field) => (
                    <div className="mb-4" key={field}>
                        <label htmlFor={field} className="block text-sm font-medium capitalize">
                            {field}
                        </label>
                        <input
                            type="text"
                            id={field}
                            value={data[field]}
                            onChange={(e) => setData(field, e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                        />
                        {errors[field] && <div className="text-red-600 text-sm">{errors[field]}</div>}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    {processing ? "Processing..." : "Update Wallet"}
                </button>
            </form>
        </div>
    );
}
