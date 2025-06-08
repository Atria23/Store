import React, { useState, useRef } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Head } from '@inertiajs/react';

export default function Otp({ status = '', errors = {} }) {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);

  function handleChange(index, value) {
    if (!/^\d*$/.test(value)) return; // hanya angka

    const updatedValues = [...otpValues];
    updatedValues[index] = value;
    setOtpValues(updatedValues);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }

    // Auto-submit kalau semua kolom terisi
    if (updatedValues.every(val => val !== '') && updatedValues.join('').length === 6) {
      submitOtp(updatedValues.join(''));
    }
  }

  function handleKeyDown(e, index) {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  }

  function submitOtp(fullOtp) {
    Inertia.post('/otp', { otp: fullOtp });
  }

  function resendOtp() {
    Inertia.post('/otp/resend', {}, {
      onSuccess: () => {
        alert('Kode OTP baru telah dikirim ke email kamu.');
      },
      onError: () => {
        alert('Gagal mengirim ulang OTP. Coba beberapa saat lagi.');
      }
    });
  }

  return (
    <>
      <Head title="Verifikasi OTP" />
      <div className="mx-auto w-full max-w-[500px] min-h-screen md:h-screen">
        <div className="min-h-screen md:min-h-full bg-white px-4 py-6 sm:px-6">
          {/* Header */}
          <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
            <div className="w-full h-max flex flex-row items-center px-4 py-2 space-x-4">
              <button className="shrink-0 w-6 h-6" onClick={() => window.history.back()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M15.41 7.41 14 6 8 12l6 6 1.41-1.41L10.83 12z" />
                </svg>
              </button>
              <div className="font-utama text-white font-bold text-lg">Verifikasi OTP</div>
            </div>
          </header>

          {/* Spacer */}
          <div className="h-11" />

          {/* Section atas */}
          <section className="w-full h-max flex flex-col items-center space-y-4 mb-6 px-4">
            <img
              src="/storage/logo_no_bg.png"
              alt="Logo Muvausa Store"
              className="w-20 p-1.5 border-4 border-white bg-white mx-auto"
            />
            <p className="font-utama text-xl font-bold text-center">Verifikasi OTP</p>
            <p className="font-utama text-base font-medium text-gray-600 text-center">
              Masukkan kode OTP yang dikirim ke email kamu
            </p>
          </section>

          {/* Form */}
          <section className="flex flex-col items-center justify-center gap-4 w-full px-4">
            <form onSubmit={e => e.preventDefault()} className="w-full">
              <div className="w-full flex flex-col space-y-4 mb-6">
                {status && (
                  <div className="font-utama text-base font-medium text-center text-green-600">{status}</div>
                )}

                <div className="flex justify-center gap-2">
                  {otpValues.map((val, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={(el) => inputsRef.current[index] = el}
                      className="w-10 h-12 text-center text-lg font-semibold border border-gray-300 rounded focus:ring-main focus:border-main"
                    />
                  ))}
                </div>
                {errors.otp && <p className="text-red-500 text-sm mt-1 text-center">{errors.otp}</p>}

                <button
                  type="button"
                  onClick={resendOtp}
                  className="w-1/2full text-main border border-main p-2 rounded text-sm bg-white hover:bg-neutral-100 transition"
                >
                  Kirim Ulang Kode OTP
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
