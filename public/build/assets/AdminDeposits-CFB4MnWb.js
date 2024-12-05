import{r as o,W as k,j as a}from"./app-CAoGxuFf.js";const I=({deposits:b})=>{const[i,j]=o.useState(b),{data:r,setData:d,post:m,processing:n}=k({depositId:null}),[g,x]=o.useState(!1),[y,p]=o.useState(""),h=(e,c)=>{j(l=>l.map(s=>s.id===e?{...s,status:c}:s))},N=e=>{confirm("Apakah Anda yakin ingin mengonfirmasi deposit ini?")&&(d("depositId",e),m(`/admin/deposit/confirm/${e}`,{onSuccess:()=>{h(e,"confirmed")},onError:()=>{console.error("Gagal mengonfirmasi deposit.")}}))},f=e=>{confirm("Apakah Anda yakin ingin membatalkan konfirmasi deposit ini?")&&(d("depositId",e),m(`/admin/deposit/cancel-confirm/${e}`,{onSuccess:()=>{h(e,"pending")},onError:()=>{console.error("Gagal membatalkan konfirmasi deposit.")}}))},t=e=>{p(e),x(!0)},u=()=>{x(!1),p("")};return o.useEffect(()=>{console.log("Status deposit telah diperbarui:",i)},[i]),a.jsxs("div",{className:"container mx-auto p-6",children:[a.jsx("h1",{className:"text-2xl font-bold mb-4",children:"Manajemen Deposit"}),a.jsx("div",{className:"overflow-x-auto",children:a.jsxs("table",{className:"table-auto w-full border-collapse border border-gray-200",children:[a.jsx("thead",{children:a.jsxs("tr",{className:"bg-gray-100",children:[a.jsx("th",{className:"border px-4 py-2",children:"#"}),a.jsx("th",{className:"border px-4 py-2",children:"User ID"}),a.jsx("th",{className:"border px-4 py-2",children:"Nama Pengguna"}),a.jsx("th",{className:"border px-4 py-2",children:"Saldo Masuk"}),a.jsx("th",{className:"border px-4 py-2",children:"Total Bayar"}),a.jsx("th",{className:"border px-4 py-2",children:"Metode Pembayaran"}),a.jsx("th",{className:"border px-4 py-2",children:"Rekening"}),a.jsx("th",{className:"border px-4 py-2",children:"Status"}),a.jsx("th",{className:"border px-4 py-2",children:"Bukti Pembayaran"}),a.jsx("th",{className:"border px-4 py-2",children:"Aksi"})]})}),a.jsx("tbody",{children:i.map(e=>{var c,l;return a.jsxs("tr",{className:"text-center",children:[a.jsx("td",{className:"border px-4 py-2",children:e.id}),a.jsx("td",{className:"border px-4 py-2",children:((c=e.user)==null?void 0:c.id)||"N/A"}),a.jsx("td",{className:"border px-4 py-2",children:((l=e.user)==null?void 0:l.name)||"N/A"}),a.jsx("td",{className:"border px-4 py-2",children:e.get_saldo}),a.jsx("td",{className:"border px-4 py-2",children:e.total_pay}),a.jsx("td",{className:"border px-4 py-2",children:e.payment_method||"Tidak Ada"}),a.jsx("td",{className:"border px-4 py-2",children:e.payment_method==="qris"&&e.admin_account?a.jsxs("div",{children:[a.jsx("img",{src:`/storage/${e.admin_account}`,alt:"QRIS",className:"w-20 h-20 object-cover cursor-pointer",onClick:()=>t(`/storage/${e.admin_account}`)}),a.jsx("button",{onClick:()=>t(`/storage/${e.admin_account}`),className:"text-blue-500 underline text-sm mt-2",children:"Perbesar"})]}):e.payment_method==="qris_manual"&&e.admin_account?a.jsxs("div",{children:[a.jsx("img",{src:`/storage/${e.admin_account}`,alt:"QRIS Manual",className:"w-20 h-20 object-cover cursor-pointer",onClick:()=>t(`/storage/${e.admin_account}`)}),a.jsx("button",{onClick:()=>t(`/storage/${e.admin_account}`),className:"text-blue-500 underline text-sm mt-2",children:"Perbesar"})]}):e.admin_account||"N/A"}),g&&a.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",onClick:u,children:a.jsxs("div",{className:"relative",onClick:s=>s.stopPropagation(),children:[a.jsx("img",{src:y,alt:"Full View",className:"max-h-screen"}),a.jsx("button",{onClick:u,className:"absolute top-2 right-2 text-white bg-red-600 px-3 py-1 rounded",children:"Tutup"})]})}),a.jsx("td",{className:`border px-4 py-2 font-semibold ${e.status==="pending"?"text-yellow-600":"text-green-600"}`,children:e.status}),a.jsx("td",{className:"border px-4 py-2",children:e.proof_of_payment?a.jsx("a",{href:`/proof-of-payment/${e.id}`,target:"_blank",rel:"noopener noreferrer",className:"text-blue-500 hover:underline",children:"Lihat"}):"Tidak Ada"}),a.jsx("td",{className:"border px-4 py-2",children:e.status==="pending"?a.jsx("button",{onClick:()=>N(e.id),className:"bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50",disabled:n&&r.depositId===e.id,children:n&&r.depositId===e.id?"Memproses...":"Konfirmasi"}):a.jsx("button",{onClick:()=>f(e.id),className:"bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50",disabled:n&&r.depositId===e.id,children:n&&r.depositId===e.id?"Memproses...":"Batalkan Konfirmasi"})})]},e.id)})})]})})]})};export{I as default};
