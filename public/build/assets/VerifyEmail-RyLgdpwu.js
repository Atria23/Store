import{W as o,j as e,a as i}from"./app-BNaqSbXk.js";function d({status:s,isVerified:t}){const{post:r,processing:a}=o({}),n=l=>{l.preventDefault(),r(route("verification.send"))};return t?e.jsxs(e.Fragment,{children:[e.jsx(i,{title:"Email Verified"}),e.jsx("div",{className:"min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6",children:e.jsxs("div",{className:"bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center",children:[e.jsx("img",{src:"/storage/logo.webp",alt:"Logo Muvausa Store",className:"w-20 h-20 flex mx-auto mb-4"}),e.jsx("h1",{className:"text-2xl font-bold text-gray-800 mb-4",children:"Email Anda Sudah Terverifikasi"}),e.jsx("p",{className:"text-gray-600 text-sm mb-6",children:"Terima kasih telah memverifikasi email Anda! Anda sekarang dapat menggunakan semua fitur di Muvausa Store."}),e.jsx("a",{href:"/user/dashboard",className:"px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:"Lanjutkan ke Dashboard"})]})})]}):e.jsxs(e.Fragment,{children:[e.jsx(i,{title:"Email Verification"}),e.jsx("div",{className:"min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6",children:e.jsxs("div",{className:"bg-white shadow-md rounded-lg p-8 max-w-md w-full",children:[e.jsx("img",{src:"/storage/logo.webp",alt:"Logo Muvausa Store",className:"w-20 h-20 flex mx-auto mb-4"}),e.jsx("h1",{className:"text-2xl font-bold text-gray-800 text-center mb-6",children:"Verifikasi Email"}),s==="verification-link-sent"&&e.jsx("div",{className:"mb-6 text-sm text-green-600 bg-green-100 p-4 rounded-lg text-center border border-green-300",children:"Link verifikasi baru telah dikirim ke email kamu lho, buruan dicek yaps."}),e.jsx("p",{className:"text-gray-600 text-sm text-center mb-6",children:"Coba cek email kamu buat nemuin link verifikasinya. Kalo belum ada, klik tombol di bawah ini yaps."}),e.jsx("form",{onSubmit:n,className:"flex justify-center",children:e.jsx("button",{className:"px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50",disabled:a,children:a?"Mengirim...":"Kirim Ulang Link Verifikasi"})})]})})]})}export{d as default};
