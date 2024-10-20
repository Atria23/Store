import{q as j,W as f,j as e,a as k}from"./app-BgroGuXW.js";import{B as d,S as o}from"./Button-B7b1mLpp.js";import{S as y,I as T}from"./Search-BPa5KwKp.js";import{T as s}from"./Table-DW6C14NZ.js";import{C as h}from"./Checkbox-u8QKOXsl.js";import{h as c,e as b,A as v}from"./AppLayout-KI4f-MJL.js";import{a as x,I as N}from"./IconTrash-C8rkXzaj.js";import"./transition-DudJ7-Ae.js";import"./keyboard-DWLaaaW8.js";function C(){const{users:r}=j().props,{data:i,setData:l,delete:m,reset:w}=f({selectedUser:[]}),p=a=>{let t=i.selectedUser;t.some(n=>n===a.target.value)?t=t.filter(n=>n!==a.target.value):t.push(a.target.value),l("selectedUser",t)},u=async a=>{o.fire({title:"Apakah kamu yakin ingin menghapus data ini ?",text:"Data yang dihapus tidak dapat dikembalikan!",icon:"warning",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Ya, tolong hapus!",cancelButtonText:"Tidak"}).then(t=>{t.isConfirmed&&(m(route("apps.users.destroy",[a])),o.fire({title:"Success!",text:"Data berhasil dihapus!",icon:"success",showConfirmButton:!1,timer:1500}),l("selectedUser",[]))})};return e.jsxs(e.Fragment,{children:[e.jsx(k,{title:"Pengguna"}),e.jsx("div",{className:"mb-2",children:e.jsxs("div",{className:"flex justify-between items-center gap-2",children:[e.jsxs("div",{className:"flex flex-row gap-2 items-center",children:[c(["users-create"])&&e.jsx(d,{type:"link",href:route("apps.users.create"),icon:e.jsx(b,{size:20,strokeWidth:1.5}),variant:"gray",label:"Tambah Data Pengguna",onClick:()=>l("isOpen",!0)}),c(["users-delete"])&&i.selectedUser.length>0&&e.jsx(d,{type:"bulk",icon:e.jsx(x,{size:20,strokeWidth:1.5}),variant:"roseBlack",label:`Hapus ${i.selectedUser.length} data yang dipilih`,onClick:()=>u(i.selectedUser)})]}),e.jsx("div",{className:"w-full md:w-4/12",children:e.jsx(y,{url:route("apps.users.index"),placeholder:"Cari data berdasarkan nama pengguna atau email"})})]})}),e.jsx(s.Card,{title:"Data Pengguna",children:e.jsxs(s,{children:[e.jsx(s.Thead,{children:e.jsxs("tr",{children:[e.jsx(s.Th,{className:"w-10",children:e.jsx(h,{onChange:a=>{const t=r.data.map(n=>n.id.toString());l("selectedUser",a.target.checked?t:[])},checked:i.selectedUser.length===r.data.length})}),e.jsx(s.Th,{className:"w-10",children:"No"}),e.jsx(s.Th,{children:"Nama Pengguna"}),e.jsx(s.Th,{children:"Email"}),e.jsx(s.Th,{children:"Group Akses"}),e.jsx(s.Th,{})]})}),e.jsx(s.Tbody,{children:r.data.length?r.data.map((a,t)=>e.jsxs("tr",{className:"hover:bg-gray-100 dark:hover:bg-gray-900",children:[e.jsx(s.Td,{children:e.jsx(h,{value:a.id,onChange:p,checked:i.selectedUser.includes(a.id.toString())},t)}),e.jsx(s.Td,{className:"text-center",children:++t+(r.current_page-1)*r.per_page}),e.jsx(s.Td,{children:a.name}),e.jsx(s.Td,{children:a.email}),e.jsx(s.Td,{children:e.jsx("div",{className:"flex flex-wrap gap-2",children:a.roles.map((n,g)=>e.jsx("span",{className:"rounded-full px-2.5 py-0.5 text-xs tracking-tight font-medium transition-colors focus:outline-none flex items-center gap-1 capitalize border border-teal-500/40 bg-teal-500/10 text-teal-500 hover:bg-teal-500/20",children:n.name},g))})}),e.jsx(s.Td,{children:e.jsxs("div",{className:"flex gap-2",children:[c(["users-edit"])&&e.jsx(d,{type:"edit",icon:e.jsx(N,{size:16,strokeWidth:1.5}),variant:"orange",href:route("apps.users.edit",a.id)}),c(["users-delete"])&&e.jsx(d,{type:"delete",icon:e.jsx(x,{size:16,strokeWidth:1.5}),variant:"rose",url:route("apps.users.destroy",a.id)})]})})]},t)):e.jsx(s.Empty,{colSpan:6,message:e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"flex justify-center items-center text-center mb-2",children:e.jsx(T,{size:24,strokeWidth:1.5,className:"text-gray-500 dark:text-white"})}),e.jsx("span",{className:"text-gray-500",children:"Data pengguna"})," ",e.jsx("span",{className:"text-rose-500 underline underline-offset-2",children:"tidak ditemukan."})]})})})]})})]})}C.layout=r=>e.jsx(v,{children:r});export{C as default};
