import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function Create() {
    // useForm tetap berguna untuk mengelola state dan error dari Inertia
    const { data, setData, errors, clearErrors } = useForm({
        first_name: 'Budi',
        last_name: 'Fetch',
        email: 'budi.fetch@example.com',
        phone: '089876543210',
        amount: 75000,
    });

    const [processing, setProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const submitPayment = async (e) => {
        e.preventDefault();
        clearErrors();
        setProcessing(true);

        try {
            // Mengambil CSRF token dari meta tag di HTML
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

            // Menggunakan Fetch API bawaan browser
            const response = await fetch(route('payment.process'), {
                method: 'POST',
                headers: {
                    // Header penting untuk request JSON dengan Laravel
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken // Kirim CSRF token
                },
                body: JSON.stringify(data) // Kirim data form sebagai JSON string
            });

            // Cek jika response tidak OK (misal: error 500 atau 422)
            if (!response.ok) {
                // Jika error validasi dari Laravel
                if (response.status === 422) {
                    const errorData = await response.json();
                    // Anda bisa memproses `errorData.errors` di sini jika perlu
                    alert('Data tidak valid. Periksa kembali isian Anda.');
                }
                // Lemparkan error untuk ditangkap oleh blok catch
                throw new Error('Network response was not ok.');
            }

            // Ambil data JSON dari response
            const result = await response.json();
            const snapToken = result.snap_token;

            // Panggil window.snap.pay dari Snap.js (bagian ini tetap sama)
            window.snap.pay(snapToken, {
                onSuccess: (result) => {
                    console.log('Payment Success:', result);
                    alert("Pembayaran berhasil!");
                    router.visit(route('payment.success'));
                },
                onPending: (result) => {
                    console.log('Payment Pending:', result);
                    alert("Menunggu pembayaran Anda!");
                },
                onError: (result) => {
                    console.error('Payment Error:', result);
                    alert("Pembayaran gagal!");
                },
                onClose: () => {
                    alert('Anda menutup popup tanpa menyelesaikan pembayaran.');
                },
            });

        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Head title="Form Pembayaran" />

            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center text-gray-800">Form Pembayaran (React + Fetch)</h1>

                    <form onSubmit={submitPayment}>
                        {/* Form input fields di sini (sama persis dengan contoh sebelumnya) */}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nama Depan</label>
                                <input type="text" id="first_name" name="first_name" value={data.first_name} onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                {errors.first_name && <div className="text-sm text-red-600 mt-1">{errors.first_name}</div>}
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Nama Belakang</label>
                                <input type="text" id="last_name" name="last_name" value={data.last_name} onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" id="email" name="email" value={data.email} onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                {errors.email && <div className="text-sm text-red-600 mt-1">{errors.email}</div>}
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                                <input type="tel" id="phone" name="phone" value={data.phone} onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                                {errors.phone && <div className="text-sm text-red-600 mt-1">{errors.phone}</div>}
                            </div>
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Jumlah Pembayaran (IDR)</label>
                                <input type="number" id="amount" name="amount" value={data.amount} onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required min="1000" />
                                {errors.amount && <div className="text-sm text-red-600 mt-1">{errors.amount}</div>}
                            </div>
                        </div>
                        {/* Tombol submit (sama persis dengan contoh sebelumnya) */}
                        <div className="mt-6">
                            <button type="submit" disabled={processing} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                {processing ? 'Memproses...' : 'Bayar Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}