import React, { useState } from 'react';
import { Link, Head } from '@inertiajs/react';

const MenuItem = ({ href, icon, label }) => (
  <Link
    href={href}
    className="flex items-center gap-3 p-4 min-h-[70px] rounded-lg bg-white border border-gray-300 transition-all"
  >
    <div className="text-main w-5 h-5">{icon}</div>
    <span className="font-medium text-gray-800">{label}</span>
  </Link>
);

const menuItems = [
  {
    label: "Deposit",
    href: route("admin.deposit"),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1zm7 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
        <path d="M0 5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm3 0a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2V7a2 2 0 0 1-2-2z" />
      </svg>

    ),
  },
  {
    label: "Rekening Pembayaran",
    href: route("admin.edit"),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
        <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
];

// Urutkan berdasarkan label
menuItems.sort((a, b) => a.label.localeCompare(b.label));


export default function Dashboard({ title }) {
  const [showBalance, setShowBalance] = useState(false);
  const toggleBalanceVisibility = () => setShowBalance(!showBalance);

  return (
    <>
      <Head title={title} />
      <div className="max-w-[500px] mx-auto min-h-screen bg-white">
        {/* Header */}
        <div className="fixed top-0 z-10 w-full max-w-[500px] bg-main text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <a href={route('user.dashboard')}>
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
        <div className="pt-[60px] px-4 pb-8">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                href={item.href}
                icon={item.icon}
                label={item.label}
              />
            ))}
          </ul>

        </div>
      </div>
    </>
  );
}
