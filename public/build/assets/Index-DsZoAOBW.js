import{j as e,d as a}from"./app-BVr7HSRu.js";function l({affiliateProducts:r}){return e.jsxs("div",{className:"max-w-4xl mx-auto p-6 bg-white rounded-lg shadow",children:[e.jsx("h2",{className:"text-xl font-bold mb-4",children:"Produk Afiliasi"}),e.jsxs("table",{className:"w-full border-collapse border border-gray-200",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"bg-gray-100",children:[e.jsx("th",{className:"border px-4 py-2",children:"Nama Produk"}),e.jsx("th",{className:"border px-4 py-2",children:"Kategori"}),e.jsx("th",{className:"border px-4 py-2",children:"Brand"}),e.jsx("th",{className:"border px-4 py-2",children:"Tipe"}),e.jsx("th",{className:"border px-4 py-2",children:"Komisi"}),e.jsx("th",{className:"border px-4 py-2",children:"Aksi"})]})}),e.jsx("tbody",{children:r.map(s=>e.jsxs("tr",{className:"hover:bg-gray-50",children:[e.jsx("td",{className:"border px-4 py-2",children:s.product_name}),e.jsx("td",{className:"border px-4 py-2",children:s.category}),e.jsx("td",{className:"border px-4 py-2",children:s.brand}),e.jsx("td",{className:"border px-4 py-2",children:s.type}),e.jsxs("td",{className:"border px-4 py-2",children:["Rp ",s.komisi.toLocaleString()]}),e.jsx("td",{className:"border px-4 py-2",children:e.jsx(a,{href:route("affiliate.products.show",s.id),className:"text-blue-500 hover:underline",children:"Detail"})})]},s.id))})]})]})}export{l as default};
