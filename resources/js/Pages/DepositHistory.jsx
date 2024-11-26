import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";

const DepositHistory = ({ deposits }) => {
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [updatedDeposits, setUpdatedDeposits] = useState(deposits);
  const [selectedDeposit, setSelectedDeposit] = useState(null); // For storing selected deposit details
  const [uploadingId, setUploadingId] = useState(null); // For tracking the deposit being uploaded
  const { post } = useForm();

  useEffect(() => {
    const interval = setInterval(() => {
      setUpdatedDeposits((prevDeposits) =>
        prevDeposits.map((deposit) => {
          if (deposit.status === "pending" && deposit.expires_at) {
            const timeLeft = new Date(deposit.expires_at) - new Date();
            if (timeLeft <= 0) {
              return { ...deposit, status: "expired" };
            }
          }
          return deposit;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (expiresAt) => {
    const timeLeft = new Date(expiresAt) - new Date();
    if (timeLeft <= 0) return "Expired";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleConfirm = (id) => {
    if (confirm("Are you sure you want to confirm this deposit?")) {
      setLoading(true);
      setLoadingId(id);

      post(`/deposit/confirm/${id}`, {}, {
        onSuccess: () => {
          alert("Deposit confirmed successfully!");
          setLoading(false);
          setLoadingId(null);
        },
        onError: () => {
          alert("Failed to confirm deposit.");
          setLoading(false);
          setLoadingId(null);
        },
      });
    }
  };

  const handleViewDetails = (deposit) => {
    setSelectedDeposit(deposit); // Set the selected deposit
  };

  const handleCloseDetails = () => {
    setSelectedDeposit(null); // Clear the selected deposit
  };

  const handleUploadProof = (id, file) => {
    if (!file) return;
    
    setUploadingId(id);
  
    const formData = new FormData();
    formData.append("proof_of_payment", file);
  
    fetch(`/deposit/upload-proof/${id}`, {
      method: "POST",
      body: formData,
      headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
      },
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert("Proof of payment uploaded successfully!");
        window.location.href = `/deposit`; // Arahkan ke halaman detail deposit
      } else {
        alert("Failed to upload proof of payment.");
      }
    })
    .catch((error) => {
      console.error("Error uploading proof:", error);
      alert("An error occurred while uploading proof.");
    })
    .finally(() => setUploadingId(null));
  };
  
  
  

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Deposit History</h1>
      <a href="/deposit/create"><span className={`px-2 py-1 rounded bg-blue-100 text-blue-600`}>Create Deposit</span></a>
      {updatedDeposits.length === 0 ? (
        <p>No deposits found.</p>
      ) : (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2">Get Saldo</th>
              <th className="border px-4 py-2">Total Pay</th>
              <th className="border px-4 py-2">Payment Method</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Expires In</th>
              <th className="border px-4 py-2">Proof of Payment</th>
              <th className="border px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {updatedDeposits.map((deposit) => (
              <tr key={deposit.id} className="border-b">
                <td className="border px-4 py-2">{deposit.id}</td>
                <td className="border px-4 py-2">{deposit.get_saldo}</td>
                <td className="border px-4 py-2">{deposit.total_pay}</td>
                <td className="border px-4 py-2">{deposit.payment_method}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded ${
                      deposit.status === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : deposit.status === "confirmed"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {deposit.status}
                  </span>
                </td>
                <td className="border px-4 py-2">
                  {deposit.status === "pending"
                    ? formatTimeLeft(deposit.expires_at)
                    : "Expired"}
                </td>
                
                <td className="border px-4 py-2">
                  {deposit.proof_of_payment ? (
                    <div className="flex flex-col items-center">
                      {/* Display Uploaded Proof */}
                      <img
                        src={`/proof-of-payment/${deposit.id}`}
                        alt="Proof of Payment"
                        className="w-20 h-20 object-cover mb-2"
                      />
                      {deposit.status === "pending" && (
                        <>
                          <label
                            htmlFor={`upload-proof-${deposit.id}`}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
                          >
                            Change Proof
                          </label>
                          <input
                            id={`upload-proof-${deposit.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadProof(deposit.id, e.target.files[0])}
                            disabled={uploadingId === deposit.id}
                            className="hidden"
                          />
                        </>
                      )}
                    </div>
                  ) : deposit.status === "confirmed" || new Date(deposit.expires_at) <= new Date() ? (
                    <p className="text-grey-400">N/A</p>
                  ) : deposit.payment_method === "QRIS" ? (
                    <button
                      onClick={() => handleConfirm(deposit.id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                      disabled={loading && loadingId !== deposit.id}
                    >
                      {loading && loadingId === deposit.id ? "Loading..." : "Confirm"}
                    </button>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadProof(deposit.id, e.target.files[0])}
                        disabled={uploadingId === deposit.id}
                        className="text-sm"
                      />
                      {uploadingId === deposit.id && <p>Uploading...</p>}
                    </div>
                  )}
                </td>


                <td className="border px-4 py-2 space-y-2">
                  <button
                    onClick={() => handleViewDetails(deposit)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal for Deposit Details */}
      {selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Deposit Details</h2>
            <p>
              <strong>ID:</strong> {selectedDeposit.id}
            </p>
            <p>
              <strong>Amount:</strong> {selectedDeposit.amount}
            </p>
            <p>
              <strong>Unique Code:</strong> {selectedDeposit.unique_code}
            </p>
            <p>
              <strong>Total Pay:</strong> {selectedDeposit.total_pay}
            </p>
            <p>
              <strong>Payment Method:</strong> {selectedDeposit.payment_method}
            </p>
            <p>
              <strong>Admin Fee:</strong> {selectedDeposit.admin_fee}
            </p>
            <p>
              <strong>Get Saldo:</strong> {selectedDeposit.get_saldo}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-1 rounded ${
                  selectedDeposit.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : selectedDeposit.status === "confirmed"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {selectedDeposit.status}
              </span>
            </p>
            <p>
              <strong>Expires At:</strong>{" "}
              {new Date(selectedDeposit.expires_at).toLocaleString()}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(selectedDeposit.created_at).toLocaleString()}
            </p>
            {selectedDeposit.proof_of_payment && (
              <p>
                <strong>Proof of Payment:</strong>{" "}
                <a
                  href={`/proof-of-payment/${selectedDeposit.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Proof
                </a>
              </p>
            )}
            <button
              onClick={handleCloseDetails}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositHistory;
