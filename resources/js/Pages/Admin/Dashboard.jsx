import { useState } from "react";
import { useForm } from "@inertiajs/react";

const Dashboard = ({ admin, transactions, topups, points }) => {
  const { post } = useForm();
  const [isHidden, setIsHidden] = useState(true);

  const handleLogout = () => {
    post("/logout");
  };

  const toggleBalance = () => {
    setIsHidden(!isHidden);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-4">Welcome, {admin.name}!</p>

        {/* Balance Toggle Section */}
        <div className="mt-4">
          <button
            onClick={toggleBalance}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            {isHidden ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.875 18.825l-2.25-2.25m0 0a6 6 0 118.485-8.485 6 6 0 01-8.485 8.485zm0 0L9.75 13.875m7.5-6.375a3 3 0 100 6 3 3 0 000-6z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M9.75 9.75a6 6 0 018.485-8.485m-2.5 10.485l-2.25-2.25m-2.485 2.485L9.75 9.75m2.25 6.375a6 6 0 01-8.485-8.485m2.485 2.485L6.375 6.375"
                />
              </svg>
            )}
            <span className="text-lg">
              {isHidden ? (
                <strong>Balance: ******</strong>
              ) : (
                <>
                  <strong>Balance:</strong> ${admin.balance}
                </>
              )}
            </span>
          </button>
        </div>

        {/* Menu Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Menu</h2>
          <ul className="space-y-4">
            <li>
              <a
                href="/transactions"
                className="block px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
              >
                View Transactions
              </a>
            </li>
            <li>
              <a
                href="/deposit"
                className="block px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Riwayat Deposit
              </a>
            </li>
            <li>
              <a
                href="/point-history"
                className="block px-4 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition"
              >
                View Point History
              </a>
            </li>
          </ul>
        </div>

        {/* Logout Section */}
        <div className="mt-8">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
