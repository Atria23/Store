// import { useState } from 'react';
// import { router } from '@inertiajs/react';

// export default function QrisConverter() {
//   const [qris, setQris] = useState('');
//   const [amount, setAmount] = useState('');
//   const [feeType, setFeeType] = useState('');
//   const [feeValue, setFeeValue] = useState('');
//   const [result, setResult] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const data = {
//       qris,
//       amount,
//       fee_type: feeType || null,
//       fee_value: feeValue || null,
//     };

//     try {
//       const response = await axios.post(route('qris.convert'), data);
//       setResult(response.data.result);
//     } catch (error) {
//       alert('Gagal convert. Periksa input kamu.');
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-4">
//       <h1 className="text-xl font-bold mb-4">QRIS Statis ke Dinamis</h1>
//       <form onSubmit={handleSubmit} className="space-y-3">
//         <div>
//           <label className="block text-sm font-medium">QRIS Statis</label>
//           <textarea
//             className="w-full border p-2 rounded"
//             value={qris}
//             onChange={(e) => setQris(e.target.value)}
//             rows={3}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Nominal</label>
//           <input
//             type="number"
//             className="w-full border p-2 rounded"
//             value={amount}
//             onChange={(e) => setAmount(e.target.value)}
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Biaya Layanan</label>
//           <select
//             className="w-full border p-2 rounded"
//             value={feeType}
//             onChange={(e) => setFeeType(e.target.value)}
//           >
//             <option value="">Tidak ada</option>
//             <option value="r">Rupiah</option>
//             <option value="p">Persen</option>
//           </select>
//         </div>
//         {feeType && (
//           <div>
//             <label className="block text-sm font-medium">
//               Nilai Biaya ({feeType === 'r' ? 'Rupiah' : 'Persen'})
//             </label>
//             <input
//               type="number"
//               className="w-full border p-2 rounded"
//               value={feeValue}
//               onChange={(e) => setFeeValue(e.target.value)}
//             />
//           </div>
//         )}
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white py-2 rounded"
//         >
//           Convert QRIS
//         </button>
//       </form>

//       {result && (
//         <div className="mt-4 p-4 bg-gray-100 rounded break-all">
//           <strong>Hasil:</strong>
//           <div className="mt-2 text-sm">{result}</div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { QRCodeCanvas } from 'qrcode.react';

export default function QrisConverter() {
  const { data, setData, post, processing, errors, wasSuccessful, reset } = useForm({
    qris_string: '',
    qris_image: null, // Field untuk menampung file gambar
    amount: '',
    fee_type: '',
    fee_value: '',
  });

  const fileInputRef = useRef();
  
  // Mengambil hasil dari flash session via props
  const { flash } = usePage().props;
  const result = flash?.result || '';

  // Handler saat textarea berubah: hapus file yang sudah dipilih
  const handleTextChange = (e) => {
    setData({
        ...data,
        qris_string: e.target.value,
        qris_image: null // Hapus file jika user mengetik
    });
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };
  
  // Handler saat file diunggah: hapus teks di textarea
  const handleImageUpload = (e) => {
    setData({
        ...data,
        qris_image: e.target.files[0],
        qris_string: '' // Hapus teks jika user upload file
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('qris.convert'), {
      onSuccess: () => {
        // Form akan ter-reset otomatis oleh Inertia,
        // tapi kita perlu membersihkan file input secara manual
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      },
      // Hapus data form setelah berhasil untuk mencegah resubmit
      preserveState: (page) => Object.keys(page.props.errors).length > 0,
    });
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">QRIS Statis ke Dinamis</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">QRIS Statis (Tempel atau Upload)</label>
          <textarea
            className="w-full border p-2 rounded"
            value={data.qris_string}
            onChange={handleTextChange}
            rows={3}
            placeholder="Tempel kode QRIS di sini..."
          />
          {errors.qris_string && <p className="text-red-500 text-sm mt-2">{errors.qris_string}</p>}
          
          <div className="text-center my-2 text-sm text-gray-500">ATAU</div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleImageUpload}
          />
          {errors.qris_image && <p className="text-red-500 text-sm mt-2">{errors.qris_image}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium">Nominal</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={data.amount}
            onChange={(e) => setData('amount', e.target.value)}
            required
          />
           {errors.amount && <p className="text-red-500 text-sm mt-2">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">Biaya Layanan</label>
          <select
            className="w-full border p-2 rounded"
            value={data.fee_type}
            onChange={(e) => setData('fee_type', e.target.value)}
          >
            <option value="">Tidak ada</option>
            <option value="r">Rupiah</option>
            <option value="p">Persen</option>
          </select>
        </div>
        {data.fee_type && (
          <div>
            <label className="block text-sm font-medium">
              Nilai Biaya ({data.fee_type === 'r' ? 'Rupiah' : 'Persen'})
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={data.fee_value}
              onChange={(e) => setData('fee_value', e.target.value)}
            />
             {errors.fee_value && <p className="text-red-500 text-sm mt-2">{errors.fee_value}</p>}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          disabled={processing}
        >
          {processing ? 'Memproses...' : 'Convert QRIS'}
        </button>
      </form>

      {/* Tampilkan hasil HANYA jika form sukses disubmit DAN ada data result */}
      {wasSuccessful && result && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-center">
          <strong className="block mb-4">Hasil QRIS Dinamis:</strong>
          <div className="p-4 bg-white inline-block rounded-lg shadow">
             <QRCodeCanvas value={result} size={256} />
          </div>
          <div className="mt-4 p-2 bg-gray-200 rounded break-all text-xs">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}