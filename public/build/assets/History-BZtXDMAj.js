import{q as n,r as d,j as r}from"./app-DlWXbQDw.js";import i from"./Footer-2l6LdB6v.js";const h=()=>{const{transactions:c}=n().props,[t,p]=d.useState(c),[a,o]=d.useState(!1),l=e=>{o(!0),fetch("/transactions/update-status",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector("meta[name='csrf-token']").getAttribute("content")},body:JSON.stringify({transaction_id:e})}).then(s=>s.json()).then(s=>{s.success,window.location.reload()}).catch(s=>{console.error("Error updating transaction status:",s)}).finally(()=>{o(!1)})};return r.jsxs(r.Fragment,{children:[r.jsxs("div",{className:"p-6",children:[r.jsx("h1",{className:"text-2xl font-bold mb-4",children:"Transaction History"}),r.jsxs("table",{className:"table-auto w-full border-collapse border border-gray-300",children:[r.jsx("thead",{children:r.jsxs("tr",{children:[r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"Transaction ID"}),r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"Product Name"}),r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"Customer Number"}),r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"Price"}),r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"Status"}),r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"SN"}),r.jsx("th",{className:"border border-gray-300 px-4 py-2",children:"Action"})]})}),r.jsx("tbody",{children:t.length===0?r.jsx("tr",{children:r.jsx("td",{colSpan:"6",className:"text-center py-4",children:a?"Loading data...":"No transactions available"})}):t.map(e=>r.jsxs("tr",{children:[r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.ref_id}),r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.product_name}),r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.customer_no}),r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.price}),r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.status}),r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.sn}),r.jsx("td",{className:"border border-gray-300 px-4 py-2",children:e.status==="Pending"?r.jsx("button",{onClick:()=>l(e.ref_id),className:`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ${a?"opacity-50 cursor-not-allowed":""}`,disabled:a,children:a?"Loading...":"Update Status"}):"No Action"})]},e.ref_id))})]})]}),r.jsx(i,{})]})};export{h as default};