import{q as e,j as s}from"./app-DkQQ0Bdr.js";function l(){const{products:r}=e().props;return s.jsxs("div",{className:"p-4",children:[s.jsx("h1",{className:"text-2xl font-bold",children:"Daftar Semua Produk"}),s.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4",children:r.length>0?r.map(a=>s.jsxs("div",{className:"border p-4 rounded shadow",children:[s.jsx("h2",{className:"font-semibold",children:a.product_name}),s.jsxs("p",{children:["Kategori: ",a.category]}),s.jsxs("p",{children:["Brand: ",a.brand]}),s.jsxs("p",{children:["Harga: Rp",a.price.toLocaleString()]})]},a.id)):s.jsx("p",{className:"text-gray-500",children:"Tidak ada produk tersedia."})})]})}export{l as default};
