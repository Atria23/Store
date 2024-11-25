import{W as m,j as e}from"./app-BYCSCgBu.js";const x=({deposits:t})=>{const{data:r,setData:d,post:n,processing:s}=m({depositId:null}),o=a=>{confirm("Apakah Anda yakin ingin mengonfirmasi deposit ini?")&&(d("depositId",a),n(`/admin/deposit/confirm/${a}`,{onSuccess:()=>{alert("Deposit berhasil dikonfirmasi.")},onError:()=>{alert("Gagal mengonfirmasi deposit.")}}))},c=a=>{confirm("Apakah Anda yakin ingin membatalkan konfirmasi deposit ini?")&&(d("depositId",a),n(`/admin/deposit/cancel-confirm/${a}`,{onSuccess:()=>{alert("Konfirmasi deposit berhasil dibatalkan.")},onError:()=>{alert("Gagal membatalkan konfirmasi deposit.")}}))};return e.jsxs("div",{className:"container mx-auto p-6",children:[e.jsx("h1",{className:"text-2xl font-bold mb-4",children:"Manajemen Deposit"}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"table-auto w-full border-collapse border border-gray-200",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100",children:[e.jsx("th",{className:"border px-4 py-2",children:"#"}),e.jsx("th",{className:"border px-4 py-2",children:"User ID"}),e.jsx("th",{className:"border px-4 py-2",children:"Nama Pengguna"}),e.jsx("th",{className:"border px-4 py-2",children:"Saldo Masuk"}),e.jsx("th",{className:"border px-4 py-2",children:"Total Bayar"}),e.jsx("th",{className:"border px-4 py-2",children:"Metode Pembayaran"}),e.jsx("th",{className:"border px-4 py-2",children:"Status"}),e.jsx("th",{className:"border px-4 py-2",children:"Bukti Pembayaran"}),e.jsx("th",{className:"border px-4 py-2",children:"Aksi"})]})}),e.jsx("tbody",{children:t.map(a=>{var i,l;return e.jsxs("tr",{className:"text-center",children:[e.jsx("td",{className:"border px-4 py-2",children:a.id}),e.jsx("td",{className:"border px-4 py-2",children:((i=a.user)==null?void 0:i.id)||"N/A"}),e.jsx("td",{className:"border px-4 py-2",children:((l=a.user)==null?void 0:l.name)||"N/A"}),e.jsx("td",{className:"border px-4 py-2",children:a.get_saldo}),e.jsx("td",{className:"border px-4 py-2",children:a.total_pay}),e.jsx("td",{className:"border px-4 py-2",children:a.payment_method||"Tidak Ada"}),e.jsx("td",{className:`border px-4 py-2 font-semibold ${a.status==="pending"?"text-yellow-600":"text-green-600"}`,children:a.status}),e.jsx("td",{className:"border px-4 py-2",children:a.proof_of_payment?e.jsx("a",{href:`/proof-of-payment/${a.id}`,target:"_blank",rel:"noopener noreferrer",className:"text-blue-500 hover:underline",children:"Lihat"}):"Tidak Ada"}),e.jsx("td",{className:"border px-4 py-2",children:a.status==="pending"?e.jsx("button",{onClick:()=>o(a.id),className:"bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50",disabled:s&&r.depositId===a.id,children:s&&r.depositId===a.id?"Memproses...":"Konfirmasi"}):e.jsx("button",{onClick:()=>c(a.id),className:"bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50",disabled:s&&r.depositId===a.id,children:s&&r.depositId===a.id?"Memproses...":"Batalkan Konfirmasi"})})]},a.id)})})]})})]})};export{x as default};
