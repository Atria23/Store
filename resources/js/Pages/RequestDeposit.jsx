import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

const RequestDeposit = () => {
  const { post, data, setData, processing, errors } = useForm({
    amount: "",
    payment_method: "ShopeePay", // Set default payment method
  });

  const [adminFee, setAdminFee] = useState(0); // State untuk admin fee

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setData("payment_method", method); // Update payment method

    // Calculate admin fee if payment method is QRIS
    if (method === "QRIS") {
      const fee = Math.ceil(data.amount * 0.007); // Admin fee 0.7% for QRIS
      setAdminFee(fee);
    } else {
      setAdminFee(0); // No admin fee for other methods
    }
  };

  const handleAmountChange = (e) => {
    const amount = e.target.value;
    setData("amount", amount);

    // Recalculate admin fee when amount changes
    if (data.payment_method === "QRIS") {
      const fee = Math.ceil(amount * 0.007);
      setAdminFee(fee);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post("/deposit", {
      onSuccess: () => alert("Deposit request submitted successfully!"),
      onError: () => alert("Failed to submit deposit request."),
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Request Deposit</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-md rounded p-6">
        <div className="mb-4">
          <label htmlFor="amount" className="block font-medium text-gray-700">
            Deposit Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={data.amount}
            onChange={handleAmountChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            required
          />
          {errors.amount && (
            <span className="text-red-500 text-sm">{errors.amount}</span>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="payment_method" className="block font-medium text-gray-700">
            Payment Method
          </label>
          <select
            id="payment_method"
            name="payment_method"
            value={data.payment_method}
            onChange={handlePaymentMethodChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            required
          >
            <option value="ShopeePay">ShopeePay (No Admin Fee)</option>
            <option value="Dana">Dana (No Admin Fee)</option>
            <option value="GoPay">GoPay (No Admin Fee)</option>
            <option value="OVO">OVO (No Admin Fee)</option>
            <option value="LinkAja">LinkAja (No Admin Fee)</option>
            <option value="QRIS">QRIS (Admin Fee 0.7%)</option>
            <option value="QRIS Manual">QRIS Manual (No Admin Fee)</option>
          </select>
          {errors.payment_method && (
            <span className="text-red-500 text-sm">{errors.payment_method}</span>
          )}
        </div>

        {adminFee > 0 && (
          <div className="mb-4">
            <p className="text-gray-700">
              Admin Fee: <strong>{adminFee}</strong>
            </p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-700">
            Total Amount:{" "}
            <strong>
              {parseInt(data.amount || 0) + adminFee}
            </strong>
          </p>
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded text-white ${
            processing ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-700"
          }`}
          disabled={processing}
        >
          {processing ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
};

export default RequestDeposit;
