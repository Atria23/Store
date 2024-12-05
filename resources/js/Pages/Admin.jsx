import React from "react";
import { useForm } from "@inertiajs/react";

const Admin = ({ admin }) => {
    const { data, setData, post, processing, errors } = useForm({
        shopeepay: admin?.shopeepay?.toString() || "",
        shopeepay_status: admin?.shopeepay_status || false,
        dana: admin?.dana?.toString() || "",
        dana_status: admin?.dana_status || false,
        gopay: admin?.gopay?.toString() || "",
        gopay_status: admin?.gopay_status || false,
        ovo: admin?.ovo?.toString() || "",
        ovo_status: admin?.ovo_status || false,
        linkaja: admin?.linkaja?.toString() || "",
        linkaja_status: admin?.linkaja_status || false,
        wallet_is_active: admin?.wallet_is_active || false,
        admin_status: admin?.admin_status || false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("admin.update")); // Gunakan metode POST
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {[ // Input e-wallet
                    { name: "shopeepay", label: "ShopeePay" },
                    { name: "dana", label: "Dana" },
                    { name: "gopay", label: "GoPay" },
                    { name: "ovo", label: "OVO" },
                    { name: "linkaja", label: "LinkAja" },
                ].map(({ name, label }) => (
                    <div key={name}>
                        <label htmlFor={name} className="block font-medium">
                            {label}
                        </label>
                        <input
                            type="number"
                            id={name}
                            value={data[name]}
                            onChange={(e) => {
                                const value = e.target.value;
                                setData(name, value === "" ? "" : value.toString());
                            }}
                            className="w-full mt-1 p-2 border rounded"
                        />
                        {errors[name] && (
                            <div className="text-red-500 text-sm">
                                {errors[name]}
                            </div>
                        )}
                    </div>
                ))}

                {[ // Checkbox status
                    { name: "shopeepay_status", label: "ShopeePay Status" },
                    { name: "dana_status", label: "Dana Status" },
                    { name: "gopay_status", label: "GoPay Status" },
                    { name: "ovo_status", label: "OVO Status" },
                    { name: "linkaja_status", label: "LinkAja Status" },
                    { name: "wallet_is_active", label: "Wallet Active" },
                    { name: "admin_status", label: "Admin Status" },
                ].map(({ name, label }) => (
                    <div key={name} className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id={name}
                            checked={data[name]}
                            onChange={(e) => setData(name, e.target.checked)}
                            className="h-4 w-4"
                        />
                        <label htmlFor={name} className="font-medium">
                            {label}
                        </label>
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    {processing ? "Processing..." : "Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default Admin;