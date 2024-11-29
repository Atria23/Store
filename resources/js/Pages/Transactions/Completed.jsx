import React from "react";

const CompletedTransactions = ({ transactions }) => {
    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold my-4">Completed Transactions</h1>
            <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-300">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2 border">ID Transaksi</th>
                            <th className="px-4 py-2 border">Nama Produk</th>
                            <th className="px-4 py-2 border">Nomor Pelanggan</th>
                            <th className="px-4 py-2 border">Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <tr key={transaction.id_transaksi} className="hover:bg-gray-100">
                                    <td className="px-4 py-2 border">{transaction.id_transaksi}</td>
                                    <td className="px-4 py-2 border">{transaction.product_name}</td>
                                    <td className="px-4 py-2 border">{transaction.customer_no}</td>
                                    <td className="px-4 py-2 border">
                                        {transaction.price.toLocaleString("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                        })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    Tidak ada transaksi lunas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CompletedTransactions;
