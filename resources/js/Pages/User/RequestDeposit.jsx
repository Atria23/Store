import React, { useState } from "react";
import { useForm, Head } from "@inertiajs/react";
import { useEffect } from 'react';

const RequestDeposit = () => {
  const paymentMethods = [
    { label: 'ShopeePay (Bebas Biaya Admin)', value: 'shopeepay', logo: '/storage/payment_method/shopeepay.png' },
    { label: 'Dana (Bebas Biaya Admin)', value: 'dana', logo: '/storage/payment_method/dana.png' },
    { label: 'GoPay (Bebas Biaya Admin)', value: 'gopay', logo: '/storage/payment_method/gopay.png' },
    { label: 'OVO (Bebas Biaya Admin)', value: 'ovo', logo: '/storage/payment_method/ovo.png' },
    { label: 'LinkAja (Bebas Biaya Admin)', value: 'linkaja', logo: '/storage/payment_method/linkaja.png' },
    { label: 'QRIS Otomatis (Biaya Admin 0.7%)', value: 'qris_otomatis', logo: '/storage/payment_method/qris_otomatis.png' },
    { label: 'QRIS Dana (Bebas Biaya Admin)', value: 'qris_dana', logo: '/storage/payment_method/qris_dana.png' },
    { label: 'Qris Shopeepay (Bebas Biaya Admin)', value: 'qris_shopeepay', logo: '/storage/payment_method/qris_shopeepay.png' },
    { label: 'Qris Ovo (Biaya Admin 0.7%)', value: 'qris_ovo', logo: '/storage/payment_method/qris_ovo.png' },
    { label: 'Qris Gopay (Biaya Admin 0.3%)', value: 'qris_gopay', logo: '/storage/payment_method/qris_gopay.png' },
  ];

  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);


  const { post, data, setData, processing, errors } = useForm({
    amount: "",
    payment_method: "shopeepay", // Set default payment method
  });

  const [adminFee, setAdminFee] = useState(0); // State untuk Biaya Admin

  useEffect(() => {
    // Kalkulasi biaya admin berdasarkan metode pembayaran
    let fee = 0;
    switch (data.payment_method) {
      case "qris_shopeepay":
        fee = Math.ceil((data.amount || 0) * 0.000); // Biaya Admin 0.3% untuk QRIS ShopeePay
        break;
      case "qris_ovo":
        fee = Math.ceil((data.amount || 0) * 0.007); // Biaya Admin 0.6% untuk QRIS OVO
        break;
      case "qris_gopay":
        fee = Math.ceil((data.amount || 0) * 0.003); // Biaya Admin 0.4% untuk QRIS GoPay
        break;
      case "qris_otomatis":
        fee = Math.ceil((data.amount || 0) * 0.007); // Biaya Admin 0.7% untuk QRIS standar
        break;
      default:
        fee = 0;
        break;
    }
    setAdminFee(fee);
  }, [data.payment_method, data.amount]);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setData("payment_method", method);

    // Recalculate Biaya Admin based on selected payment method
    let fee = 0;

    switch (method) {
      case "qris_shopeepay":
        fee = Math.ceil(data.amount * 0.000); // Biaya Admin 0.3% for QRIS ShopeePay
        break;
      case "qris_ovo":
        fee = Math.ceil(data.amount * 0.007); // Biaya Admin 0.6% for QRIS OVO
        break;
      case "qris_gopay":
        fee = Math.ceil(data.amount * 0.003); // Biaya Admin 0.4% for QRIS GoPay
        break;
      case "qris_otomatis":
        fee = Math.ceil(data.amount * 0.007); // Biaya Admin 0.7% for QRIS
        break;
      default:
        fee = 0; // Bebas Biaya Admin for other methods
        break;
    }

    setAdminFee(fee); // Set calculated Biaya Admin
  };

  const handleAmountChange = (e) => {
    // Remove dots (.) from input because we format in thousands
    const raw = e.target.value.replace(/\./g, "");
    let amount = parseInt(raw, 10);

    // If empty or less than 1, set to 1
    if (isNaN(amount) || amount < 1) {
      amount = 1;
    }

    // Validasi maksimal 450.000
    if (amount > 450000) {
      amount = 450000;
    }

    setData("amount", amount);

    // Recalculate Biaya Admin when amount changes
    let fee = 0;
    switch (data.payment_method) {
      case "qris_shopeepay":
        fee = Math.ceil(amount * 0.000); // Biaya Admin 0.3% for QRIS ShopeePay
        break;
      case "qris_ovo":
        fee = Math.ceil(amount * 0.007); // Biaya Admin 0.6% for QRIS OVO
        break;
      case "qris_gopay":
        fee = Math.ceil(amount * 0.003); // Biaya Admin 0.4% for QRIS GoPay
        break;
      case "qris_otomatis":
        fee = Math.ceil(amount * 0.007); // Biaya Admin 0.7% for QRIS
        break;
      default:
        fee = 0; // Bebas Biaya Admin for other methods
        break;
    }

    setAdminFee(fee); // Set calculated Biaya Admin
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    // Set the success message first (this will show before posting)
    setPopupMessage("Permintaan deposit sedang diproses...");
    setIsPopupOpen(true);

    // Then make the POST request
    post("/deposit", {
      onSuccess: () => {
        setPopupMessage("Permintaan deposit berhasil dikirim!");
        setIsPopupOpen(true);
      },
      onError: () => {
        setPopupMessage("Gagal mengirim permintaan deposit.");
        setIsPopupOpen(true);
      },
    });
  };



  return (
    <>
      <Head title="Deposit" />
      <div className="mx-auto w-full max-w-[500px] flex flex-col min-h-screen">
        {/* fixed position */}

        {/* Header */}
        <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main">
          <div className="w-full flex flex-row space-x-4 items-center justify-start">
            <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div className="font-utama text-white font-bold text-lg">
              Deposit
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="w-full w-max-[500px] flex flex-col space-y-3 mt-10 [@media(max-width:277px)]:mt-[76px] p-4 bg-main-white">

          {/* Nominal */}
          <div className="w-full flex flex-col space-y-4 p-4 rounded-lg bg-white shadow-md">
            <div className="w-full h-max flex flex-row space-x-4 justify-start items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-main" viewBox="0 0 16 16">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z" />
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12" />
              </svg>
              <p className="font-utama font-medium text-gray-700 leading-tight h-6">
                Nominal (Maks 450.000)
              </p>
            </div>

            <div className="w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200">
              <input
                type="text"
                id="amount"
                name="amount"
                value={data.amount === "" ? "" : parseInt(data.amount).toLocaleString("id-ID")}
                onChange={handleAmountChange}
                className="bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400"
                placeholder="Contoh: 5.000"
                required
              />

              {errors.amount && (
                <span className="text-red-500 text-sm">{errors.amount}</span>
              )}
            </div>
          </div>

          {/* payment method */}
          <div className="w-full flex flex-col space-y-4 p-4 rounded-lg bg-white shadow-md">
            <div className="w-full h-max flex flex-row space-x-4 justify-start items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-6 h-6 text-main" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M11 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8m5-4a5 5 0 1 1-10 0 5 5 0 0 1 10 0" />
                <path d="M9.438 11.944c.047.596.518 1.06 1.363 1.116v.44h.375v-.443c.875-.061 1.386-.529 1.386-1.207 0-.618-.39-.936-1.09-1.1l-.296-.07v-1.2c.376.043.614.248.671.532h.658c-.047-.575-.54-1.024-1.329-1.073V8.5h-.375v.45c-.747.073-1.255.522-1.255 1.158 0 .562.378.92 1.007 1.066l.248.061v1.272c-.384-.058-.639-.27-.696-.563h-.668zm1.36-1.354c-.369-.085-.569-.26-.569-.522 0-.294.216-.514.572-.578v1.1zm.432.746c.449.104.655.272.655.569 0 .339-.257.571-.709.614v-1.195z" />
                <path d="M1 0a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h4.083q.088-.517.258-1H3a2 2 0 0 0-2-2V3a2 2 0 0 0 2-2h10a2 2 0 0 0 2 2v3.528c.38.34.717.728 1 1.154V1a1 1 0 0 0-1-1z" />
                <path d="M9.998 5.083 10 5a2 2 0 1 0-3.132 1.65 6 6 0 0 1 3.13-1.567" />
              </svg>
              <p className="font-utama font-medium text-gray-700 leading-tight h-6">
                Metode Pembayaran
              </p>
            </div>

            {/* select modern */}

            <select
              id="payment_method"
              name="payment_method"
              value={data.payment_method}
              onChange={() => { }}
              className="hidden"
            >
              {paymentMethods.map((pm) => (
                <option key={pm.value} value={pm.value}>{pm.label}</option>
              ))}
            </select>

            {/* Visual List */}
            <div className="flex flex-col divide-y divide-gray-300">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.value}
                  onClick={() => handlePaymentMethodChange({ target: { value: pm.value } })}
                  className={`cursor-pointer flex flex-row items-center space-x-4 p-4 transition rounded-md 
                    ${data.payment_method === pm.value ? 'bg-blue-50 border-l-4 border-gray-300' : 'bg-white'}
                  `}
                >
                  <img src={pm.logo} alt="Logo" className="w-[50px] h-auto object-contain" />
                  <div className="flex flex-col space-y-1">
                    <p className="font-utama font-medium text-base text-gray-800">{pm.label.split(' (')[0]}</p>
                    <p className="text-xs text-gray-500">{pm.label.includes('(') ? pm.label.split(' (')[1].replace(')', '') : ''}</p>
                  </div>
                </div>
              ))}
            </div>

            {errors.payment_method && (
              <span className="text-red-500 text-sm">{errors.payment_method}</span>
            )}
          </div>

          <div className="w-full flex flex-col space-y-4 p-4 rounded-lg bg-white shadow-md">
            {adminFee > 0 && (
              <div>
                <p className="text-gray-700">
                  Biaya Admin: <strong>{adminFee.toLocaleString('id-ID')}</strong>
                </p>
              </div>
            )}

            <div>
              <p className="text-gray-700">
                Total:{' '}
                <strong>
                  {(parseInt(data.amount || 0) + adminFee).toLocaleString('id-ID')}
                </strong>
              </p>
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded text-white ${processing ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-700'
                }`}
              disabled={processing}
            >
              {processing ? 'Pengajuan...' : 'Ajukan Deposit'}
            </button>
          </div>


        </form>
        {isPopupOpen && (
          <div className="fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white">
              <p className="w-full h-max text-utama text-lg font-medium text-center align-middle">
                {popupMessage}
              </p>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-main rounded-md hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

      </div>

    </>
  );
};

export default RequestDeposit;
























