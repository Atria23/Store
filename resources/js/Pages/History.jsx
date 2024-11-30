// import React, { useState } from "react";
// import { usePage } from "@inertiajs/react";

// const HistoryPage = () => {
//   const { transactions } = usePage().props;
//   const [loading, setLoading] = useState(false); // State untuk menunjukkan loading

//   const updateStatus = (transactionId) => {
//     setLoading(true); // Set loading saat memulai permintaan

//     fetch('/transactions/update-status', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
//       },
//       body: JSON.stringify({
//         transaction_id: transactionId,
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           alert("Transaction status updated successfully");
//         } else {
//           alert(`Failed to update transaction status: ${data.message}`);
//         }
//       })
//       .catch((error) => {
//         console.error(error);
//         alert("An error occurred while updating transaction status.");
//       })
//       .finally(() => {
//         setLoading(false); // Reset loading setelah selesai
//       });
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Transaction History</h1>
//       <table className="table-auto w-full border-collapse border border-gray-300">
//         <thead>
//           <tr>
//             <th className="border border-gray-300 px-4 py-2">Transaction ID</th>
//             <th className="border border-gray-300 px-4 py-2">Product Name</th>
//             <th className="border border-gray-300 px-4 py-2">Customer Number</th>
//             <th className="border border-gray-300 px-4 py-2">Price</th>
//             <th className="border border-gray-300 px-4 py-2">Status</th>
//             <th className="border border-gray-300 px-4 py-2">Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {transactions.map((transaction) => (
//             <tr key={transaction.ref_id}>
//               <td className="border border-gray-300 px-4 py-2">{transaction.ref_id}</td>
//               <td className="border border-gray-300 px-4 py-2">{transaction.product_name}</td>
//               <td className="border border-gray-300 px-4 py-2">{transaction.customer_no}</td>
//               <td className="border border-gray-300 px-4 py-2">{transaction.price}</td>
//               <td className="border border-gray-300 px-4 py-2">{transaction.status}</td>
//               <td className="border border-gray-300 px-4 py-2">
//                 {transaction.status === "Pending" ? (
//                   <button
//                     onClick={() => updateStatus(transaction.ref_id)} // Gunakan ref_id untuk memperbarui status
//                     className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
//                       loading ? "opacity-50 cursor-not-allowed" : ""
//                     }`}
//                     disabled={loading} // Nonaktifkan tombol saat loading
//                   >
//                     {loading ? "Loading..." : "Update Status"}
//                   </button>
//                 ) : (
//                   "No Action"
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default HistoryPage;



















import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";

const HistoryPage = () => {
  const { transactions: initialTransactions } = usePage().props;
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);

  const updateStatus = (transactionId) => {
    // Set loading state to true while processing the update
    setLoading(true);

    fetch("/transactions/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": document.querySelector(
          "meta[name='csrf-token']"
        ).getAttribute("content"),
      },
      body: JSON.stringify({
        transaction_id: transactionId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.reload();// Reload the page after updating the transaction status
        } else {
          window.location.reload();// Reload the page after updating the transaction statusd
        }
      })
      .catch((error) => {
        console.error("Error updating transaction status:", error);
      })
      .finally(() => {
        setLoading(false); // Reset loading state after completion
      });
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
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4">
                {loading ? "Loading data..." : "No transactions available"}
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.ref_id}>
                <td className="border border-gray-300 px-4 py-2">{transaction.ref_id}</td>
                <td className="border border-gray-300 px-4 py-2">{transaction.product_name}</td>
                <td className="border border-gray-300 px-4 py-2">{transaction.customer_no}</td>
                <td className="border border-gray-300 px-4 py-2">{transaction.price}</td>
                <td className="border border-gray-300 px-4 py-2">{transaction.status}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {transaction.status === "Pending" ? (
                    <button
                      onClick={() => updateStatus(transaction.ref_id)}
                      className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? "Loading..." : "Update Status"}
                    </button>
                  ) : (
                    "No Action"
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryPage;
