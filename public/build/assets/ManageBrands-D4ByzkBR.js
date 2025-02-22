import{r as a,W as K,j as e}from"./app-BfzjvNbE.js";function q({brands:M,categories:d,inputTypes:x}){var z,B;const[S,o]=a.useState(!1),[h,p]=a.useState(null),[_,c]=a.useState(null),[f,I]=a.useState(""),[m,T]=a.useState("asc"),[r,u]=a.useState({}),[g,P]=a.useState(""),[w,A]=a.useState(""),[E,j]=a.useState(!1),[H,y]=a.useState(!1),[W,v]=a.useState(!1),[D,R]=a.useState(null),b=M.filter(t=>t.name.toLowerCase().includes(f.toLowerCase()));d.filter(t=>t.name.toLowerCase().includes(g.toLowerCase())),x.filter(t=>t.name.toLowerCase().includes(w.toLowerCase()));const{data:l,setData:n,post:k,processing:L,reset:N,delete:O}=K({id:"",name:"",image:null,category_id:"",input_type_id:"",profit_persen:"",profit_tetap:""}),U=t=>{t.preventDefault(),u({});const s=new FormData;s.append("name",l.name),s.append("category_id",l.category_id),s.append("input_type_id",l.input_type_id),s.append("profit_persen",l.profit_persen),s.append("profit_tetap",l.profit_tetap),l.image&&s.append("image",l.image),h?k(route("brands.update",l.id),{data:s,onSuccess:()=>{N(),c(null),p(null),setTimeout(()=>o(!1),300)},onError:i=>{u(i)}}):k(route("brands.store"),{data:s,onSuccess:()=>{N(),c(null),setTimeout(()=>o(!1),300)},onError:i=>{u(i)}})},V=t=>{p(t),n({id:t.id,name:t.name,image:null,category_id:t.category_id,input_type_id:t.input_type_id,profit_persen:t.profit_persen,profit_tetap:t.profit_tetap}),c(t.image),o(!0)},$=t=>{const s=t.target.files[0];s&&(n("image",s),c(URL.createObjectURL(s)))},F=t=>{R(t),v(!0)},G=t=>{v(!1),O(route("brands.destroy",t))};return[...b].sort((t,s)=>m==="asc"?t.name.localeCompare(s.name):s.name.localeCompare(t.name)),e.jsxs("div",{className:"mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen",children:[e.jsxs("div",{className:"fixed top-0 left-1/2 -translate-x-1/2 max-w-[412px] w-full z-10 bg-main",children:[e.jsxs("div",{className:"w-full h-max flex flex-row space-x-4 justify-start items-center px-4 py-2 bg-main",children:[e.jsxs("div",{className:"w-full h-max flex flex-row space-x-4 items-center justify-start",children:[e.jsx("button",{className:"shrink-0 w-6 h-6",onClick:()=>window.history.back(),children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"white",className:"w-6 h-6",children:e.jsx("path",{d:"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"})})}),e.jsx("div",{className:"font-utama text-white font-bold text-lg",children:"Kelola Brand"})]}),e.jsx("button",{onClick:()=>{p(null),N(),c(null),o(!0)},className:"flex items-center w-6 h-6",children:e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor",className:"w-6 h-6 text-white",children:[e.jsx("path",{d:"M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2m0 18a8 8 0 1 1 8-8 8.01 8.01 0 0 1-8 8"}),e.jsx("path",{d:"M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4z"})]})})]}),e.jsxs("div",{className:"w-full h-max flex flex-col space-y-4 items-center justify-start p-4 bg-white shadow-lg",children:[e.jsxs("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200",children:[e.jsx("input",{id:"searchInput",type:"text",className:"bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",placeholder:"Cari brand",value:f,onChange:t=>I(t.target.value)}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor",stroke:"currentColor",strokeWidth:"0.3",className:"w-5 h-5 text-main",children:e.jsx("path",{d:"M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z"})})]}),e.jsxs("div",{className:"w-full h-max flex flex-row space-x-4 items-center justify-start",children:[e.jsxs("button",{onClick:()=>T(m==="asc"?"desc":"asc"),className:"w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2",children:[m==="asc"?e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",className:"w-4 h-4 text-main",children:[e.jsx("path",{fillRule:"evenodd",d:"M10.082 5.629 9.664 7H8.598l1.789-5.332h1.234L13.402 7h-1.12l-.419-1.371zm1.57-.785L11 2.687h-.047l-.652 2.157z"}),e.jsx("path",{d:"M12.96 14H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645zM4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293z"})]}):e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",className:"w-4 h-4 text-main",children:[e.jsx("path",{d:"M12.96 7H9.028v-.691l2.579-3.72v-.054H9.098v-.867h3.785v.691l-2.567 3.72v.054h2.645z"}),e.jsx("path",{fillRule:"evenodd",d:"M10.082 12.629 9.664 14H8.598l1.789-5.332h1.234L13.402 14h-1.12l-.419-1.371zm1.57-.785L11 9.688h-.047l-.652 2.156z"}),e.jsx("path",{d:"M4.5 2.5a.5.5 0 0 0-1 0v9.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L4.5 12.293z"})]}),e.jsx("span",{className:"text-utama text-sm font-thin text-left align-middle text-blue-600",children:"Urutkan"})]}),e.jsx("div",{className:"shrink-0 w-8 text-main",children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1",className:"w-full h-full",children:e.jsx("line",{x1:"12",y1:"4",x2:"12",y2:"20"})})}),e.jsxs("button",{className:"w-full h-max flex flex-row space-x-2 items-center justify-center px-4 py-2",children:[e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",className:"w-4 h-4 text-main",children:e.jsx("path",{d:"M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z"})}),e.jsx("span",{className:"text-utama text-sm font-thin text-left align-middle text-blue-600",children:"Filter"})]})]})]})]}),e.jsx("div",{className:"mb-4 min-h-[756px] pt-[163px] bg-white",children:e.jsx("div",{className:"mb-4 min-h-[756px] bg-white",children:b.length>0?[...b].filter(t=>t.name.toLowerCase().includes(f.toLowerCase())).sort((t,s)=>m==="asc"?t.name.localeCompare(s.name):s.name.localeCompare(t.name)).map(t=>{var s,i;return e.jsxs("div",{className:"flex justify-between items-center p-4 border-b-2 border-b-neutral-100",children:[e.jsxs("div",{className:"w-full h-max flex items-center space-x-3 content-start",children:[e.jsx("div",{className:"w-13 h-13 space-x-2 flex items-center justify center p-1 rounded-xl bg-white shadow",children:e.jsx("img",{src:t.image||"storage/categories/default.png",alt:t.name,className:"w-10 h-10 rounded-xl object-cover"})}),e.jsxs("div",{className:"max-w-[200px] flex flex-col items-start space-y-[2px]",children:[e.jsx("p",{className:"font-utama font-semibold text-sm truncate w-full",children:t.name}),e.jsxs("p",{className:"font-utama text-xs text-gray-500",children:[((s=d.find(C=>C.id===t.category_id))==null?void 0:s.name)||"Tidak ada kategori"," / ",((i=x.find(C=>C.id===t.input_type_id))==null?void 0:i.name)||"Tidak ada tipe input"]}),e.jsxs("div",{className:"w-[200px] h-max px-2 py-[2px] text-xs text-green-600 rounded-3xl bg-green-50 border border-green-600 flex items-center justify-center",children:[t.profit_persen,"% + Rp",t.profit_tetap]})]})]}),e.jsxs("div",{className:"w-12 h-full flex flex-col items-center space-y-2",children:[e.jsx("button",{onClick:()=>V(t),className:"w-full h-max px-2 py-[2px] text-xs text-main rounded-3xl bg-blue-50 border border-main flex items-center justify-center",children:"Edit"}),e.jsx("button",{onClick:()=>F(t.id),disabled:t.is_used,className:`w-full h-max px-2 py-[2px] text-xs rounded-3xl flex items-center justify-center ${t.is_used?"text-gray-400 bg-gray-50 border border-gray-400 cursor-not-allowed":"text-red-600 bg-red-50 border border-red-600"}`,children:"Hapus"})]})]},t.id)}):e.jsx("p",{className:"p-4 text-center",children:"Brand tidak ditemukan"})})}),W&&e.jsx("div",{className:"fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center",children:e.jsxs("div",{className:"w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white",children:[e.jsx("p",{className:"w-full h-max text-utama text-lg font-medium text-center align-middle",children:"Yakin ingin menghapus brand ini?"}),e.jsxs("div",{className:"w-full h-max flex flex-row space-x-2",children:[e.jsx("button",{onClick:()=>G(D),className:"w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700",children:"Ya"}),e.jsx("button",{onClick:()=>v(!1),className:"w-full h-10 flex items-center justify-center px-4 py-2 text-white bg-main rounded-md hover:bg-blue-700",children:"Tidak"})]})]})}),S&&e.jsx("div",{className:"fixed z-20 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center",children:e.jsxs("div",{className:"w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white",children:[e.jsxs("div",{className:"w-full h-max flex flex-col",children:[e.jsx("button",{className:"w-full flex items-end justify-end",onClick:()=>{o(!1),u({})},children:e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",className:"w-7 h-7 text-red-500",children:e.jsx("path",{d:"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"})})}),e.jsx("h2",{className:"w-full h-max text-utama text-lg font-medium text-center align-middle",children:h?"Edit Brand":"Tambah Brand"})]}),e.jsxs("form",{onSubmit:U,children:[e.jsxs("div",{className:"w-full h-max flex flex-col space-y-2 items-center justify-center",children:[e.jsxs("div",{className:"w-full h-max flex flex-col space-y-2 items-center justify-center",children:[e.jsxs("label",{className:"w-20 h-20 rounded-full cursor-pointer overflow-hidden relative border-2 border-gray-200",children:[e.jsx("input",{type:"file",name:"image",accept:"image/*",onChange:$,className:"absolute inset-0 w-full h-full opacity-0 cursor-pointer"}),_?e.jsx("img",{src:_,alt:"Preview",className:"w-full h-full object-cover"}):e.jsx("span",{className:"absolute inset-0 flex items-center justify-center text-xs text-gray-500",children:"Pilih Gambar"})]}),r.image&&e.jsx("p",{className:"text-red-500 text-sm",children:r.image}),e.jsx("p",{className:"w-full h-max text-utama font-medium text-sm text-center align-middle",children:"Gambar Brand"})]}),e.jsxs("div",{className:"w-[294px] h-max flex flex-col space-y-2",children:[e.jsx("p",{className:"w-full h-max text-utama font-medium text-sm text-left align-middle",children:"Nama Brand"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{type:"text",name:"name",value:l.name,onChange:t=>n("name",t.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",placeholder:"Contoh: Mobile Legends",required:!0})}),r.name&&e.jsx("p",{className:"text-red-600 text-sm",children:r.name}),e.jsx("p",{className:"w-full h-max text-utama font-medium text-sm text-left align-middle",children:"Kategori"}),e.jsxs("div",{className:"relative w-full",children:[e.jsxs("div",{className:"flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer",onClick:()=>j(!0),children:[e.jsx("span",{children:((z=d.find(t=>t.id===l.category_id))==null?void 0:z.name)||"Pilih kategori"}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"w-5 h-5 text-gray-500",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M6 9l6 6 6-6"})})]}),E&&e.jsx("div",{className:"fixed z-30 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center",children:e.jsxs("div",{className:"w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white",children:[e.jsxs("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200",children:[e.jsx("input",{id:"searchInput",type:"text",className:"bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",placeholder:"Cari kategori",value:g,onChange:t=>P(t.target.value)}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor",stroke:"currentColor",strokeWidth:"0.3",className:"w-5 h-5 text-main",children:e.jsx("path",{d:"M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z"})})]}),e.jsx("div",{className:"w-full max-h-[342px] flex flex-col items-start justify-start overflow-y-auto",children:d.filter(t=>t.name.toLowerCase().includes(g.toLowerCase())).map(t=>e.jsxs("div",{className:"w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer",onClick:()=>{n("category_id",t.id),j(!1)},children:[e.jsx("img",{src:t.image?`/storage/${t.image}`:"storage/categories/default.png",alt:t.name,className:"w-8 h-8 border border-gray-300 rounded-full object-cover"}),e.jsx("p",{className:"text-utama text-sm text-left align-middle",children:t.name})]},t.id))}),e.jsx("button",{onClick:()=>j(!1),className:"w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition",children:"Tutup"})]})})]}),e.jsx("p",{className:"w-full h-max text-utama font-medium text-sm text-left align-middle",children:"Tipe Input"}),e.jsxs("div",{className:"relative w-full",children:[e.jsxs("div",{className:"flex items-center justify-between w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer",onClick:()=>y(!0),children:[e.jsx("span",{children:((B=x.find(t=>t.id===l.input_type_id))==null?void 0:B.name)||"Pilih tipe input"}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",className:"w-5 h-5 text-gray-500",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M6 9l6 6 6-6"})})]}),H&&e.jsx("div",{className:"fixed z-30 inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center",children:e.jsxs("div",{className:"w-[328px] h-max flex flex-col space-y-2 items-center justify-center p-4 rounded-lg bg-white",children:[e.jsxs("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center pr-2 py-2 rounded-lg bg-neutral-100 border-2 border-gray-200",children:[e.jsx("input",{id:"searchInput",type:"text",className:"bg-transparent border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",placeholder:"Cari Input Type...",value:w,onChange:t=>A(t.target.value)}),e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"currentColor",stroke:"currentColor",strokeWidth:"0.3",className:"w-5 h-5 text-main",children:e.jsx("path",{d:"M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zM9.5 14A4.5 4.5 0 1 1 14 9.5 4.505 4.505 0 0 1 9.5 14z"})})]}),e.jsx("div",{className:"w-full max-h-[342px] flex flex-col items-start justify-start overflow-y-auto",children:x.filter(t=>t.name.toLowerCase().includes(w.toLowerCase())).map(t=>e.jsx("div",{className:"w-full h-max flex flex-row space-x-2 items-center justify-start py-2 border-b border-b-gray-300 cursor-pointer",onClick:()=>{n("input_type_id",t.id),y(!1)},children:e.jsx("p",{className:"text-utama text-sm text-left align-middle",children:t.name})},t.id))}),e.jsx("button",{onClick:()=>y(!1),className:"w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition",children:"Tutup"})]})})]}),e.jsx("p",{className:"w-full h-max text-utama font-medium text-sm text-left align-middle",children:"Profit Persen"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{type:"text",name:"name",value:l.profit_persen,onChange:t=>n("profit_persen",t.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",placeholder:"Contoh: 2.5"})}),r.name&&e.jsx("p",{className:"text-red-600 text-sm",children:r.name}),e.jsx("p",{className:"w-full h-max text-utama font-medium text-sm text-left align-middle",children:"Profit Tetap"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{type:"text",name:"name",value:l.profit_tetap,onChange:t=>n("profit_tetap",t.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",placeholder:"Contoh: 1000"})}),r.name&&e.jsx("p",{className:"text-red-600 text-sm",children:r.name})]})]}),e.jsx("div",{className:"w-full h-max mt-2 flex flex-col items-center justify-center",children:e.jsx("button",{type:"submit",disabled:L||!l.name||!l.category_id||!l.input_type_id,className:`w-full p-2 rounded transition ${L||!l.name||!l.category_id||!l.input_type_id?"bg-gray-300 cursor-not-allowed":"bg-blue-600 text-white hover:bg-blue-700"}`,children:h?"Update":"Tambah"})})]})]})})]})}export{q as default};
