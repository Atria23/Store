import{W as f,r as c,j as e}from"./app-qWG3QkvC.js";const y=({isOpen:d,onClose:n,store:a})=>{const{data:s,setData:l,post:u,processing:r}=f({name:(a==null?void 0:a.name)||"Nama Toko Default",address:(a==null?void 0:a.address)||"Alamat Toko Default",phone_number:(a==null?void 0:a.phone_number)||"0812"}),[m,b]=c.useState(a!=null&&a.image?`${a.image}`:null),o=c.useRef(null);if(!d)return null;const g=t=>{const i=t.target.files[0];if(i){l("image",i);const h=URL.createObjectURL(i);b(h)}},p=()=>{o.current.click()},x=t=>{t.preventDefault(),u("/store/update",{onSuccess:()=>{console.log("Data berhasil diperbarui."),n()}})};return e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50",children:e.jsxs("div",{className:"bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative",children:[e.jsx("button",{onClick:n,className:"absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl",children:"×"}),e.jsx("h2",{className:"text-2xl font-semibold text-gray-700 mb-4 text-center",children:"Edit Toko"}),e.jsxs("form",{onSubmit:x,className:"space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"relative inline-block cursor-pointer",onClick:p,children:[e.jsx("img",{src:m||"https://i.ibb.co/YRD8yDC/logo-muvausa-store-lingkaran-putih.webp",alt:"Foto Toko",className:"w-32 h-32 object-cover rounded-full shadow-lg border"}),e.jsx("span",{className:"absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 text-white text-sm rounded-full opacity-0 hover:opacity-100 transition",children:"Ganti Foto"})]}),e.jsx("input",{type:"file",accept:"image/*",onChange:g,ref:o,className:"hidden"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-gray-600 font-medium",children:"Nama Toko"}),e.jsx("input",{type:"text",value:s.name,onChange:t=>l("name",t.target.value),className:"border border-gray-300 rounded-lg w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400",placeholder:"Masukkan nama toko"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-gray-600 font-medium",children:"Nomor Telepon Toko"}),e.jsx("input",{type:"number",value:s.phone_number,onChange:t=>l("phone_number",t.target.value),className:"border border-gray-300 rounded-lg w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400",placeholder:"Masukkan nomor telepon toko"})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-gray-600 font-medium",children:"Alamat"}),e.jsx("textarea",{value:s.address,onChange:t=>l("address",t.target.value),className:"border border-gray-300 rounded-lg w-full p-2 mt-1 focus:ring-2 focus:ring-blue-400",placeholder:"Tambahkan alamat"})]}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx("button",{type:"button",onClick:n,className:"text-gray-500 hover:text-gray-700 px-4 py-2",children:"Batal"}),e.jsx("button",{type:"submit",className:"bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700",disabled:r,children:r?"Menyimpan...":"Simpan"})]})]})]})})};export{y as default};