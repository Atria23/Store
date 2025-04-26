import React from 'react'
import { Head, usePage, useForm } from '@inertiajs/react'

export default function Edit() {
    const { roles, user } = usePage().props;

    const { data, setData, post, errors } = useForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        balance: user.balance || '',
        phone_number: user.phone_number || '',
        points: user.points || '',
        selectedRoles: user.roles.map(role => role.name),
        _method: 'PUT',
    });

    const updateUser = (e) => {
        e.preventDefault();
        post(route('manage-users.update', { user: user.id }));
    }

    return (
        <>
            <Head title="Manage User Detail" />
            <div className="mx-auto w-full max-w-[500px] min-h-screen text-white">
                {/* Header */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 max-w-[500px] w-full z-10 bg-main">
                    <div className="flex items-center space-x-4 px-4 py-2 text-white">
                        <button
                            onClick={() => window.history.back()}
                            className="w-6 h-6"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-6 h-6">
                                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                            </svg>
                        </button>
                        <h1 className="font-bold text-lg">Detail Manajemen Pengguna</h1>
                    </div>
                </div>

                {/* Form */}
                <div className="pt-[60px] pb-8 px-4 bg-white">
                    <form onSubmit={updateUser} className="space-y-5">
                        {/* Nama */}
                        <div>
                            <label className="w-full text-gray-700">Nama Pengguna</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="w-full text-gray-700">Username</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={data.username}
                                onChange={e => setData('username', e.target.value)}
                            />
                            {errors.username && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                        </div>

                        {/* Email + Verifikasi */}
                        <div>
                            <label className="w-full text-gray-700">Email Pengguna</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 pr-10 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                {user.email_verified_at ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="green"
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        viewBox="0 0 16 16"
                                        title="Terverifikasi"
                                    >
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 
                                                0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 
                                                0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 
                                                0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="#facc15"
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                        viewBox="0 0 16 16"
                                        title="Belum Verifikasi"
                                    >
                                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 
                                                0L.165 13.233c-.457.778.091 1.767.98 
                                                1.767h13.713c.889 0 1.438-.99.98-1.767zM8 
                                                5c.535 0 .954.462.9.995l-.35 3.507a.552.552 
                                                0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 
                                                5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
                                    </svg>
                                )}
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                        </div>

                        {/* Nomor HP */}
                        <div>
                            <label className="w-full text-gray-700">Nomor HP</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={data.phone_number}
                                onChange={(e) => {
                                    const onlyNumbers = e.target.value.replace(/\D/g, ''); // Hapus semua non-digit
                                    setData('phone_number', onlyNumbers);
                                }}
                            />
                            {errors.phone_number && (
                                <p className="text-xs text-red-400 mt-1">{errors.phone_number}</p>
                            )}
                        </div>

                        {/* Points */}
                        <div>
                            <label className="w-full text-gray-700">Points</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={data.points !== null ? Number(data.points).toLocaleString('id-ID') : ''}
                                onChange={e => {
                                    const raw = e.target.value.replace(/\D/g, ''); // hanya angka
                                    setData('points', raw); // jangan pakai Number biar fleksibel dan tidak NaN saat kosong
                                }}
                            />
                            {errors.points && <p className="text-xs text-red-400 mt-1">{errors.points}</p>}
                        </div>


                        {/* Saldo */}
                        <div>
                            <label className="w-full text-gray-700">Saldo</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={
                                    data.balance
                                        ? `Rp${Number(data.balance).toLocaleString('id-ID', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        })}`
                                        : ''
                                }
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, ''); // Hilangkan semua non-digit
                                    setData('balance', raw ? parseInt(raw) : '');
                                }}
                            />
                            {errors.balance && <p className="text-xs text-red-400 mt-1">{errors.balance}</p>}
                        </div>


                        {/* Password */}
                        <div>
                            <label className="w-full text-gray-700">Kata Sandi Baru</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                        </div>

                        {/* Konfirmasi */}
                        <div>
                            <label className="w-full text-gray-700">Konfirmasi Kata Sandi</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 bg-neutral-100 text-black border border-gray-300 rounded-lg text-sm"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                            />
                            {errors.password_confirmation && <p className="text-xs text-red-400 mt-1">{errors.password_confirmation}</p>}
                        </div>

                        {/* Akses Role */}
                        <div>
                            <label className="w-full text-gray-700 mb-1">Akses Grup</label>
                            <div className="flex flex-wrap gap-3">
                                {roles.map((role, i) => (
                                    <label key={i} className="inline-flex items-center space-x-2 text-sm">
                                        <input
                                            type="checkbox"
                                            value={role.name}
                                            checked={data.selectedRoles[0] === role.name}
                                            onChange={(e) => {
                                                setData('selectedRoles', [e.target.value]);
                                            }}
                                            className="w-4 h-4 text-main border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-gray-700 text-sm">{role.name}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.selectedRoles && <p className="text-xs text-red-400 mt-1">{errors.selectedRoles}</p>}
                        </div>

                        {/* Tombol Simpan */}
                        <button
                            type="submit"
                            className="w-full py-3 rounded-lg px-4 text-white bg-main hover:bg-blue-700"
                        >
                            Simpan Perubahan
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
