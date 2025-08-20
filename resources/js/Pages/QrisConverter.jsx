import { useState, useRef, useEffect } from 'react'; // Tambahkan useEffect
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5Qrcode } from 'html5-qrcode';

// Asumsi Anda memiliki setup Axios global.
import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const EXAMPLE_QRIS_STRING = '00020101021126570011ID.DANA.WWW011893600915311269207902091126920790303UMI51440014ID.CO.QRIS.WWW0215ID10210629238700303UMI5204594553033605802ID5913Muvausa store6010Kab. Demak610559567630474A6';

export default function QrisConverter() {
  const [qris, setQris] = useState('');
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('');
  const [feeValue, setFeeValue] = useState('');
  const [result, setResult] = useState('');
  const [inputType, setInputType] = useState('image');
  const [imageName, setImageName] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [scanError, setScanError] = useState(null);
  const fileInputRef = useRef(null);
  const resultRef = useRef(null); // 1. Buat ref untuk elemen hasil

  // 2. Gunakan useEffect untuk memantau perubahan pada 'result'
  useEffect(() => {
    // Jika 'result' ada isinya (setelah konversi berhasil) dan ref sudah terpasang
    if (result && resultRef.current) {
      // Gulir ke elemen hasil dengan animasi smooth
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]); // Efek ini akan berjalan setiap kali state 'result' berubah

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    setScanError(null);
    setQris('');

    if (!file) {
      setImageName('');
      setImagePreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setImageName(file.name);
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        setQris(decodedText);
        setScanError(null);
      })
      .catch(err => {
        console.error("QR Scan Error:", err);
        setScanError('QR code tidak terdeteksi. Pastikan gambar jelas, terang, dan tidak buram.');
        setImageName('');
        setImagePreview(null);
      });
  };

  const handleUseExample = () => {
    setQris(EXAMPLE_QRIS_STRING);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qris && inputType === 'text') {
      alert("Input QRIS Teks tidak boleh kosong.");
      return;
    }
    if (!qris && inputType === 'image') {
      alert("Gagal membaca QRIS dari gambar. Silakan unggah gambar yang valid.");
      return;
    }

    const data = { qris, amount, fee_type: feeType || null, fee_value: feeValue || null };
    try {
      const response = await axios.post(route('qris.convert'), data);
      // Cukup set result, useEffect akan menangani scroll
      setResult(response.data.result);
    } catch (error) {
      console.error("Conversion failed:", error.response || error);
      alert('Gagal convert. Periksa input atau lihat console untuk detail.');
    }
  };

  return (
    <>
      <Head title="QRIS Statis Ke Dinamis" />
      <div className="mx-auto w-full max-w-[500px] min-h-screen bg-gray-50">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main shadow-md">
          <div className="w-full h-14 flex flex-row space-x-4 items-center justify-start px-4">
            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div className="font-sans text-white font-bold text-lg">QRIS Statis Ke Dinamis</div>
          </div>
        </div>

        <div id="reader" style={{ display: 'none' }}></div>

        <div className="pt-20 px-4 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Form tidak berubah ... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Input QRIS</label>
              <div className="flex w-full p-1 space-x-1 bg-gray-200 rounded-full">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center space-x-2 ${inputType === 'text' ? 'bg-main text-white shadow' : 'bg-transparent text-gray-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>Teks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('image')}
                  className={`flex-1 py-2 rounded-full text-sm font-semibold transition-colors flex items-center justify-center space-x-2 ${inputType === 'image' ? 'bg-main text-white shadow' : 'bg-transparent text-gray-600'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Gambar</span>
                </button>
              </div>
            </div>

            {inputType === 'text' ? (
              <div>
                <textarea
                  className="w-full bg-neutral-100 border-2 border-gray-200 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={qris}
                  onChange={(e) => setQris(e.target.value)}
                  rows={4}
                  placeholder="Masukkan kode QRIS di sini..."
                />
                <button type="button" onClick={handleUseExample} className="text-sm text-blue-600 hover:underline mt-1">
                  Gunakan contoh
                </button>
              </div>
            ) : (
              <div>
                {imagePreview && (
                  <div className="mb-3 p-2 border border-gray-200 rounded-lg bg-white">
                    <img src={imagePreview} alt="QR Preview" className="w-32 h-32 object-contain rounded-md mx-auto" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full border-2 border-dashed border-gray-300 p-4 rounded-lg text-center text-gray-500 hover:bg-gray-100 transition flex flex-col items-center space-y-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-sm font-medium">{imageName || 'Pilih Gambar QR Code...'}</span>
                </button>
                {scanError && (
                  <p className="text-sm text-red-600 mt-2 text-center">{scanError}</p>
                )}
                <p className="text-xs text-gray-500 mt-2 text-center italic">
                  Tips: Untuk hasil terbaik, unggah gambar QR yang jelas dan tidak buram.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal</label>
                <input
                  type="number"
                  className="w-full bg-neutral-100 border-2 border-gray-200 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={amount ? new Intl.NumberFormat('id-ID').format(amount) : ''}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}

                  placeholder="Contoh: 10000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biaya Layanan (Opsional)</label>
                <select
                  className="w-full bg-neutral-100 border-2 border-gray-200 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition"
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
                >
                  <option value="">Tidak ada</option>
                  <option value="r">Rupiah (Rp)</option>
                  <option value="p">Persen (%)</option>
                </select>
              </div>
              {feeType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Biaya ({feeType === 'r' ? 'Rupiah' : 'Persen'})
                  </label>
                  <input
                    type="number"
                    className="w-full bg-neutral-100 border-2 border-gray-200 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={feeValue}
                    onChange={(e) => setFeeValue(e.target.value)}
                    placeholder="Contoh: 1000 atau 2.5"
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-main text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                Ubah Jadi QRIS Bernominal
              </button>
            </div>
          </form>

          {/* 3. Pasang ref ke elemen hasil */}
          {result && (
            <div ref={resultRef} className="mt-6 p-4 bg-white rounded-lg shadow-md border border-gray-200 scroll-mt-20">
              <h3 className="text-lg font-bold text-gray-800">Hasil Konversi</h3>
              <div className="mt-3 flex flex-col items-center">
                <QRCodeSVG value={result} size={256} className="mb-4 rounded-lg" />
                <p className="text-xs break-all bg-gray-100 p-3 rounded-md w-full text-gray-600 font-mono">
                  {result}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}