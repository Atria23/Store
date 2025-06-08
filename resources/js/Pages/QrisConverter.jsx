import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function QrisConverter() {
  const [qris, setQris] = useState('');
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('');
  const [feeValue, setFeeValue] = useState('');
  const [result, setResult] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      qris,
      amount,
      fee_type: feeType || null,
      fee_value: feeValue || null,
    };

    try {
      const response = await axios.post(route('qris.convert'), data);
      setResult(response.data.result);
    } catch (error) {
      alert('Gagal convert. Periksa input kamu.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">QRIS Statis ke Dinamis</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">QRIS Statis</label>
          <textarea
            className="w-full border p-2 rounded"
            value={qris}
            onChange={(e) => setQris(e.target.value)}
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Nominal</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Biaya Layanan</label>
          <select
            className="w-full border p-2 rounded"
            value={feeType}
            onChange={(e) => setFeeType(e.target.value)}
          >
            <option value="">Tidak ada</option>
            <option value="r">Rupiah</option>
            <option value="p">Persen</option>
          </select>
        </div>
        {feeType && (
          <div>
            <label className="block text-sm font-medium">
              Nilai Biaya ({feeType === 'r' ? 'Rupiah' : 'Persen'})
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={feeValue}
              onChange={(e) => setFeeValue(e.target.value)}
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Convert QRIS
        </button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded break-all">
          <strong>Hasil:</strong>
          <div className="mt-2 text-sm">{result}</div>
        </div>
      )}
    </div>
  );
}
