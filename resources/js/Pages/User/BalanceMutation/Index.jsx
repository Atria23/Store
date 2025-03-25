import React from "react";
import { Link, usePage } from "@inertiajs/react";

const BalanceMutationIndex = () => {
    const { mutations } = usePage().props;

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Mutasi Saldo</h1>
            <table className="w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Tanggal</th>
                        <th className="border p-2">Tipe</th>
                        <th className="border p-2">Jumlah</th>
                        <th className="border p-2">Saldo Sebelumnya</th>
                        <th className="border p-2">Saldo Baru</th>
                        <th className="border p-2">Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {mutations.data.map((mutation) => (
                        <tr key={mutation.id} className="text-center">
                            <td className="border p-2">{mutation.created_at}</td>
                            <td className={`border p-2 ${mutation.type === "pemasukan" ? "text-green-600" : "text-red-600"}`}>
                                {mutation.type}
                            </td>
                            <td className="border p-2">{mutation.amount}</td>
                            <td className="border p-2">{mutation.previous_balance}</td>
                            <td className="border p-2">{mutation.new_balance}</td>
                            <td className="border p-2">
                                <Link href={`/balance-mutation/${mutation.id}`} className="text-blue-500">Detail</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BalanceMutationIndex;
