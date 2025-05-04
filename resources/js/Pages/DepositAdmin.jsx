// import React, { useState } from 'react';
// import { useForm } from '@inertiajs/react';

// export default function DepositAdmin({ flash }) {
//   const { data, setData, post, processing, errors } = useForm({
//     amount: 200000,
//     bank: 'BCA',
//     owner_name: 'Danu Trianggoro',
//   });

//   const [formattedAmount, setFormattedAmount] = useState(() =>
//     formatRupiah(data.amount.toString())
//   );

//   const [alert, setAlert] = useState(() => (flash && flash.success ? flash : null));
//   const [result, setResult] = useState(() => (flash && flash.success ? flash.success : null));

//   const handleAmountChange = (e) => {
//     const raw = e.target.value.replace(/[^0-9]/g, '');
//     const intVal = parseInt(raw || '0', 10);

//     setData('amount', intVal);
//     setFormattedAmount(formatRupiah(raw));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setResult(null);
//     post(route('deposit-admin.store'), {
//       onSuccess: ({ props }) => {
//         if (props?.flash?.success) setResult(props.flash.success);
//       },
//     });
//   };

//   return (
//     <div className="max-w-[500px] mx-auto p-4">
//       <h1 className="text-xl font-bold mb-4">Request Deposit Admin</h1>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium">Jumlah Deposit</label>
//           <input
//             type="text"
//             className="w-full border rounded p-2"
//             value={formattedAmount}
//             onChange={handleAmountChange}
//           />
//           {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
//         </div>

//         <div>
//           <label className="block font-medium">Bank Tujuan</label>
//           <select
//             className="w-full border rounded p-2"
//             value={data.bank}
//             onChange={(e) => setData('bank', e.target.value)}
//           >
//             <option value="BCA">BCA</option>
//             <option value="MANDIRI">MANDIRI</option>
//             <option value="BRI">BRI</option>
//             <option value="BNI">BNI</option>
//           </select>
//           {errors.bank && <div className="text-red-500 text-sm">{errors.bank}</div>}
//         </div>

//         <div>
//           <label className="block font-medium">Nama Pemilik Rekening</label>
//           <input
//             type="text"
//             className="w-full border rounded p-2"
//             value={data.owner_name}
//             onChange={(e) => setData('owner_name', e.target.value)}
//           />
//           {errors.owner_name && <div className="text-red-500 text-sm">{errors.owner_name}</div>}
//         </div>

//         <button
//           type="submit"
//           disabled={processing}
//           className="bg-blue-600 text-white py-2 px-4 rounded w-full"
//         >
//           {processing ? 'Mengirim...' : 'Kirim Permintaan Deposit'}
//         </button>
//       </form>

//       {result && (
//   <div className="mt-6 p-4 bg-green-100 border rounded">
//     <h2 className="font-semibold">Permintaan Deposit Diterima</h2>
//     <p>Jumlah yang harus ditransfer: <strong>Rp{Number(result.amount).toLocaleString()}</strong></p>
//     <p>Berita transfer: <strong>{result.notes}</strong></p>
//   </div>
// )}

//       {alert?.success && (
//         <div className="p-3 bg-green-100 text-green-800 rounded mb-4">{alert.success}</div>
//       )}

//       {errors.api && (
//         <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{errors.api}</div>
//       )}
//     </div>
//   );
// }

// function formatRupiah(value) {
//   const number = parseInt(value || '0', 10);
//   return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
//     .format(number)
//     .replace(/^Rp/, 'Rp');
// }
import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';

export default function DepositAdmin() {
  const { props } = usePage();
  const alert = props.alert || null;

  const { data, setData, post, processing, errors } = useForm({
    amount: 200000,
    bank: 'BCA',
    owner_name: 'Danu Trianggoro',
  });

  const [formattedAmount, setFormattedAmount] = useState(() =>
    formatRupiah(data.amount.toString())
  );

  const [result, setResult] = useState(() => (
    alert?.type === 'success' ? alert : null
  ));

  useEffect(() => {
    if (alert?.type === 'success') {
      setResult(alert); // show alert section
    }
  }, [alert]);

  const handleAmountChange = (e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const intVal = parseInt(raw || '0', 10);

    setData('amount', intVal);
    setFormattedAmount(formatRupiah(raw));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult(null);
    post(route('deposit-admin.store'));
  };

  return (
    <div className="max-w-[500px] mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Request Deposit Admin</h1>

      {/* Alert Success */}
      {result && (
        <div className="mt-6 p-4 bg-green-100 border rounded text-green-800">
          <h2 className="font-semibold mb-1">Permintaan Deposit Diterima</h2>
          <p>Jumlah yang harus ditransfer: <strong>Rp{Number(result.amount).toLocaleString()}</strong></p>
          <p>Berita transfer: <strong>{result.notes}</strong></p>
        </div>
      )}

      {/* Alert Error */}
      {alert?.type === 'error' && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded">
          {alert.message}
        </div>
      )}

      {/* API validation error */}
      {errors.api && (
        <div className="p-3 bg-red-100 text-red-800 rounded mb-4">{errors.api}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label className="block font-medium">Jumlah Deposit</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formattedAmount}
            onChange={handleAmountChange}
          />
          {errors.amount && <div className="text-red-500 text-sm">{errors.amount}</div>}
        </div>

        <div>
          <label className="block font-medium">Bank Tujuan</label>
          <select
            className="w-full border rounded p-2"
            value={data.bank}
            onChange={(e) => setData('bank', e.target.value)}
          >
            <option value="BCA">BCA</option>
            <option value="MANDIRI">MANDIRI</option>
            <option value="BRI">BRI</option>
            <option value="BNI">BNI</option>
          </select>
          {errors.bank && <div className="text-red-500 text-sm">{errors.bank}</div>}
        </div>

        <div>
          <label className="block font-medium">Nama Pemilik Rekening</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={data.owner_name}
            onChange={(e) => setData('owner_name', e.target.value)}
          />
          {errors.owner_name && <div className="text-red-500 text-sm">{errors.owner_name}</div>}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white py-2 px-4 rounded w-full"
        >
          {processing ? 'Mengirim...' : 'Kirim Permintaan Deposit'}
        </button>
      </form>
    </div>
  );
}

function formatRupiah(value) {
  const number = parseInt(value || '0', 10);
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(number)
    .replace(/^Rp/, 'Rp');
}
