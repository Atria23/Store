import{j as e,a as n,d as a}from"./app-BVr7HSRu.js";function l({history:s}){return e.jsxs("div",{className:"max-w-2xl mx-auto p-4",children:[e.jsx(n,{title:"Detail Poinmu"}),e.jsx("h1",{className:"text-2xl font-bold mb-4",children:"Detail Riwayat Poinmu"}),e.jsxs("div",{className:"bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4",children:[e.jsxs("p",{className:"mb-2",children:[e.jsx("strong",{children:"Tanggal:"})," ",new Date(s.created_at).toLocaleString()]}),e.jsxs("p",{className:"mb-2",children:[e.jsx("strong",{children:"Tipe:"})," ",s.type]}),e.jsxs("p",{className:`mb-2 ${s.points>0?"text-green-500":"text-red-500"}`,children:[e.jsx("strong",{children:"Poin:"})," ",s.points>0?`+${s.points}`:s.points]}),e.jsxs("p",{className:"mb-2",children:[e.jsx("strong",{children:"Poin Sebelumnya:"})," ",s.previous_points]}),e.jsxs("p",{className:"mb-2",children:[e.jsx("strong",{children:"Poin Sekarang:"})," ",s.new_points]}),s.description&&e.jsxs("p",{className:"mb-2",children:[e.jsx("strong",{children:"Deskripsi:"})," ",s.description]})]}),e.jsx(a,{href:"/poinmu-history",className:"text-blue-500 hover:underline",children:"← Kembali ke Riwayat Poin"})]})}export{l as default};
