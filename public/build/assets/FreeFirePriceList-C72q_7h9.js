import{q as C,r as a,j as e}from"./app-liPiSU_Z.js";function O(){const{products:f}=C().props,[o,b]=a.useState(""),[t,i]=a.useState(null),[j,d]=a.useState(!1),[u,N]=a.useState(f),[c,k]=a.useState("asc"),[m,T]=a.useState({}),[p,I]=a.useState(""),[l,h]=a.useState(!1),[n,S]=a.useState(0),y=async()=>{try{const r=await(await fetch("/balance")).json();S(r.balance)}catch(s){console.error("Failed to fetch balance:",s)}};a.useEffect(()=>{y()},[]);const w=()=>{const s=[...u].sort((r,x)=>c==="asc"?parseInt(r.price)-parseInt(x.price):parseInt(x.price)-parseInt(r.price));N(s),k(c==="asc"?"desc":"asc")},v=s=>parseInt(s,10).toLocaleString("id-ID").replace(/,/g,"."),P=s=>{i(s),d(!0)},g=()=>{d(!1),i(null)},_=s=>{if(s.preventDefault(),!t||!o){alert("Mohon lengkapi nomor pelanggan dan pilih produk.");return}h(!0),fetch("/transactions",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({buyer_sku_code:t.buyer_sku_code,customer_no:o,max_price:t.price,price_product:t.price,testing:!1})}).then(r=>r.json()).then(r=>{r.success?alert(`${r.message}`):alert(`Transaksi gagal: ${r.message}`)}).catch(r=>{alert("Terjadi kesalahan saat mengirim permintaan transaksi.")}).finally(()=>{h(!1)})};return e.jsxs("div",{className:"p-4",children:[p&&e.jsx("p",{className:"text-red-500 text-sm mt-2",children:p}),e.jsxs("div",{className:"text-lg mt-2",children:[e.jsx("strong",{children:"Saldo Anda:"})," Rp",n.toLocaleString("id-ID").replace(/,/g,".")]}),e.jsx("h1",{className:"text-2xl font-bold",children:"Daftar Produk Free Fire"}),e.jsx("div",{className:"flex justify-end mb-4",children:e.jsxs("button",{onClick:w,className:"bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600",children:["Sort Harga: ",c==="asc"?"Terendah":"Termahal"]})}),e.jsxs("div",{className:"my-4",children:[e.jsx("label",{htmlFor:"customerNo",className:"block text-sm font-medium text-gray-700",children:"Nomor Pelanggan"}),e.jsx("input",{type:"text",id:"customerNo",value:o,onChange:s=>b(s.target.value),className:"mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm",placeholder:"Masukkan nomor pelanggan"}),m.customer_no&&e.jsx("p",{className:"text-red-500 text-sm",children:m.customer_no})]}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4",children:u.map(s=>e.jsxs("div",{className:"border p-4 rounded shadow bg-white hover:shadow-md",children:[e.jsx("h2",{className:"font-semibold",children:s.product_name}),e.jsxs("p",{children:["Harga: Rp",v(s.price)]}),e.jsx("button",{onClick:()=>P(s),className:"mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600",children:"Detail Produk"})]},s.buyer_sku_code))}),j&&t&&e.jsxs("div",{className:"fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4",onClick:s=>{s.target===s.currentTarget&&g()},children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("h2",{className:"text-lg font-bold",children:t.product_name}),e.jsx("button",{onClick:g,className:"text-red-500 font-bold",children:"Tutup"})]}),e.jsx("p",{className:"mt-2",children:t.desc}),e.jsx("p",{className:"text-red-500 mt-2",children:n<t.price&&"Saldo Anda tidak mencukupi untuk transaksi ini."}),e.jsx("div",{className:"flex justify-between mt-4",children:e.jsx("button",{onClick:_,disabled:l||t&&n<t.price,className:`bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 ${(l||t&&n<t.price)&&"bg-gray-400 cursor-not-allowed"}`,children:l?"Processing...":"Lanjutkan"})})]})]})}export{O as default};
