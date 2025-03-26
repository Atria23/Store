import{q as n,j as s,a as o,d as h}from"./app-DMmN_QQ9.js";function x(){const{transactions:i,params:l,store:r}=n().props,c=e=>e?new Date(e).toLocaleString("id-ID",{year:"numeric",month:"short",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:!1}):"N/A";return s.jsxs("div",{className:"container mx-auto p-4",children:[s.jsx(o,{title:"Affiliate History"}),s.jsxs("h1",{className:"text-2xl font-bold mb-4",children:["Affiliate History - ",l.affiliator_id]}),r&&s.jsxs("div",{className:"bg-gray-100 p-4 rounded-lg mb-4",children:[s.jsx("h2",{className:"text-lg font-semibold",children:"Store Information"}),s.jsxs("p",{children:[s.jsx("strong",{children:"Name:"})," ",r.name]}),s.jsxs("p",{children:[s.jsx("strong",{children:"Address:"})," ",r.address]}),s.jsxs("p",{children:[s.jsx("strong",{children:"Phone:"})," ",r.phone_number]}),r.image&&s.jsx("img",{src:r.image,alt:"Store",className:"w-32 h-32 rounded-md mt-2"})]}),s.jsx("div",{className:"overflow-x-auto",children:s.jsxs("table",{className:"min-w-full bg-white border rounded-lg",children:[s.jsx("thead",{children:s.jsxs("tr",{className:"bg-gray-200 text-gray-700",children:[s.jsx("th",{className:"p-2 border",children:"ID"}),s.jsx("th",{className:"p-2 border",children:"User Name"})," ",s.jsx("th",{className:"p-2 border",children:"Product"}),s.jsx("th",{className:"p-2 border",children:"Commission"}),s.jsx("th",{className:"p-2 border",children:"ID Transaction"}),s.jsx("th",{className:"p-2 border",children:"Status"}),s.jsx("th",{className:"p-2 border",children:"Created At"})]})}),s.jsx("tbody",{children:i.map(e=>{var a,t,d;return s.jsxs("tr",{className:"text-center",children:[s.jsx("td",{className:"p-2 border",children:e.id}),s.jsx("td",{className:"p-2 border",children:((t=(a=e.transaction)==null?void 0:a.user)==null?void 0:t.name)||"N/A"})," ",s.jsx("td",{className:"p-2 border",children:e.affiliate_product?s.jsx(h,{href:`/affiliate-products/${e.affiliate_product.id}`,className:"text-blue-500 hover:underline",children:e.affiliate_product.product_name}):"N/A"}),s.jsxs("td",{className:"p-2 border",children:["Rp",e.commission.toLocaleString()]}),s.jsx("td",{className:"p-2 border",children:((d=e.transaction)==null?void 0:d.id)||"N/A"}),s.jsx("td",{className:"p-2 border",children:e.status}),s.jsx("td",{className:"p-2 border",children:c(e.created_at)})]},e.id)})})]})})]})}export{x as default};
