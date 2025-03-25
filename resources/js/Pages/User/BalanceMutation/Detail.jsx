import React from "react";
import { usePage } from "@inertiajs/react";

const BalanceMutationDetail = () => {
    const { mutation } = usePage().props;

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Detail Mutasi Saldo</h1>
            <div className="border p-4 rounded shadow">
                <p><strong>Tanggal:</strong> {mutation.created_at}</p>
                <p><strong>Tipe:</strong> {mutation.type}</p>
                <p><strong>Jumlah:</strong> {mutation.amount}</p>
                <p><strong>Saldo Sebelumnya:</strong> {mutation.previous_balance}</p>
                <p><strong>Saldo Baru:</strong> {mutation.new_balance}</p>
            </div>
        </div>
    );
};

export default BalanceMutationDetail;
