import{r as l,W as S,j as e}from"./app-C-Un8MG2.js";const _=({deposits:f})=>{const[d,i]=l.useState(!1),[c,x]=l.useState(null),[h,g]=l.useState(f),[r,p]=l.useState(null),[o,m]=l.useState(null);S(),l.useEffect(()=>{const t=setInterval(()=>{g(s=>s.map(n=>n.status==="pending"&&n.expires_at&&new Date(n.expires_at)-new Date<=0?{...n,status:"expired"}:n))},1e3);return()=>clearInterval(t)},[]);const j=t=>{const s=new Date(t)-new Date;if(s<=0)return"Expired";const n=Math.floor(s/(1e3*60*60)),a=Math.floor(s%(1e3*60*60)/(1e3*60)),w=Math.floor(s%(1e3*60)/1e3);return`${n.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}:${w.toString().padStart(2,"0")}`},y=t=>{confirm("Are you sure you want to confirm this deposit?")&&(i(!0),x(t),fetch(`/deposit/confirm/${t}`,{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({})}).then(s=>s.json()).then(s=>{s.success?window.location.reload():alert("Konfirmasi gagal: tidak ditemukan data yang sesuai")}).catch(s=>{alert("Terjadi kesalahan: "+s.message)}).finally(()=>{i(!1),x(null)}))},b=t=>{p(t)},N=()=>{p(null)},u=(t,s)=>{if(!s)return;m(t);const n=new FormData;n.append("proof_of_payment",s),fetch(`/deposit/upload-proof/${t}`,{method:"POST",body:n,headers:{"X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")}}).then(a=>a.json()).then(a=>{a.success?(alert("Proof of payment uploaded successfully!"),window.location.href="/deposit"):alert("Failed to upload proof of payment.")}).catch(a=>{console.error("Error uploading proof:",a),alert("An error occurred while uploading proof.")}).finally(()=>m(null))};return e.jsxs("div",{className:"container mx-auto p-4",children:[e.jsx("h1",{className:"text-2xl font-bold mb-4",children:"Deposit History"}),e.jsx("a",{href:"/deposit/create",children:e.jsx("span",{className:"px-2 py-1 rounded bg-blue-100 text-blue-600",children:"Create Deposit"})}),h.length===0?e.jsx("p",{children:"No deposits found."}):e.jsxs("table",{className:"min-w-full bg-white border",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{className:"border px-4 py-2",children:"#"}),e.jsx("th",{className:"border px-4 py-2",children:"Get Saldo"}),e.jsx("th",{className:"border px-4 py-2",children:"Total Pay"}),e.jsx("th",{className:"border px-4 py-2",children:"Payment Method"}),e.jsx("th",{className:"border px-4 py-2",children:"Status"}),e.jsx("th",{className:"border px-4 py-2",children:"Expires In"}),e.jsx("th",{className:"border px-4 py-2",children:"Proof of Payment"}),e.jsx("th",{className:"border px-4 py-2",children:"Actions"})]})}),e.jsx("tbody",{children:h.map(t=>e.jsxs("tr",{className:"border-b",children:[e.jsx("td",{className:"border px-4 py-2",children:t.id}),e.jsx("td",{className:"border px-4 py-2",children:t.get_saldo}),e.jsx("td",{className:"border px-4 py-2",children:t.total_pay}),e.jsx("td",{className:"border px-4 py-2",children:t.payment_method}),e.jsx("td",{className:"border px-4 py-2",children:e.jsx("span",{className:`px-2 py-1 rounded ${t.status==="pending"?"bg-yellow-100 text-yellow-600":t.status==="confirmed"?"bg-green-100 text-green-600":"bg-red-100 text-red-600"}`,children:t.status})}),e.jsx("td",{className:"border px-4 py-2",children:t.status==="pending"?j(t.expires_at):"Expired"}),e.jsx("td",{className:"border px-4 py-2",children:t.proof_of_payment?e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx("img",{src:`/proof-of-payment/${t.id}`,alt:"Proof of Payment",className:"w-20 h-20 object-cover mb-2"}),t.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("label",{htmlFor:`upload-proof-${t.id}`,className:"bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer",children:"Change Proof"}),e.jsx("input",{id:`upload-proof-${t.id}`,type:"file",accept:"image/*",onChange:s=>u(t.id,s.target.files[0]),disabled:o===t.id,className:"hidden"})]})]}):t.status==="confirmed"||new Date(t.expires_at)<=new Date?e.jsx("p",{className:"text-grey-400",children:"N/A"}):t.payment_method==="QRIS"?e.jsx("button",{onClick:()=>y(t.id),className:"bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700",disabled:d&&c!==t.id,children:d&&c===t.id?"Loading...":"Confirm"}):e.jsxs("div",{children:[e.jsx("input",{type:"file",accept:"image/*",onChange:s=>u(t.id,s.target.files[0]),disabled:o===t.id,className:"text-sm"}),o===t.id&&e.jsx("p",{children:"Uploading..."})]})}),e.jsx("td",{className:"border px-4 py-2 space-y-2",children:e.jsx("button",{onClick:()=>b(t),className:"bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700",children:"View Details"})})]},t.id))})]}),r&&e.jsx("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:e.jsxs("div",{className:"bg-white p-6 rounded shadow-lg max-w-md w-full",children:[e.jsx("h2",{className:"text-xl font-bold mb-4",children:"Deposit Details"}),e.jsxs("p",{children:[e.jsx("strong",{children:"ID:"})," ",r.id]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Amount:"})," ",r.amount]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Unique Code:"})," ",r.unique_code]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Total Pay:"})," ",r.total_pay]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Payment Method:"})," ",r.payment_method]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Admin Fee:"})," ",r.admin_fee]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Get Saldo:"})," ",r.get_saldo]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Status:"})," ",e.jsx("span",{className:`px-2 py-1 rounded ${r.status==="pending"?"bg-yellow-100 text-yellow-600":r.status==="confirmed"?"bg-green-100 text-green-600":"bg-red-100 text-red-600"}`,children:r.status})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Expires At:"})," ",new Date(r.expires_at).toLocaleString()]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Created At:"})," ",new Date(r.created_at).toLocaleString()]}),r.proof_of_payment&&e.jsxs("p",{children:[e.jsx("strong",{children:"Proof of Payment:"})," ",e.jsx("a",{href:`/proof-of-payment/${r.id}`,target:"_blank",rel:"noopener noreferrer",className:"text-blue-500 hover:underline",children:"View Proof"})]}),e.jsx("button",{onClick:N,className:"bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 mt-4",children:"Close"})]})})]})};export{_ as default};