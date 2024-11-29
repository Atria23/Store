import React from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";

const HistoryPage = () => {
  const { transactions } = usePage().props;

  const updateStatus = (transactionId) => {
    Inertia.post(
      "/transactions/update-status",
      { transaction_id: transactionId },
      {
        onSuccess: () => {
          alert("Transaction status updated successfully");
        },
        onError: (error) => {
          alert(error.message || "Failed to update transaction status");
        },
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Transaction ID</th>
            <th className="border border-gray-300 px-4 py-2">Product Name</th>
            <th className="border border-gray-300 px-4 py-2">Customer Number</th>
            <th className="border border-gray-300 px-4 py-2">Price</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.ref_id}>
              <td className="border border-gray-300 px-4 py-2">{transaction.ref_id}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.product_name}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.customer_no}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.price}</td>
              <td className="border border-gray-300 px-4 py-2">{transaction.status}</td>
              <td className="border border-gray-300 px-4 py-2">
                {transaction.status === "Pending" ? (
                  <button
                    onClick={() => updateStatus(transaction.ref_id)}  // Use ref_id to update status
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Update Status
                  </button>
                ) : (
                  "No Action"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
