import{W as d,r as m,j as e}from"./app-DlWXbQDw.js";function u(){const{data:r,setData:t,post:l,processing:o,errors:a,reset:n}=d({name:"",email:"",password:"",password_confirmation:""});m.useEffect(()=>()=>{n("password","password_confirmation")},[]);const i=s=>{s.preventDefault(),l(route("register"))};return e.jsx("div",{className:"min-h-screen bg-gray-100 flex items-center justify-center px-6",children:e.jsxs("div",{className:"w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden",children:[e.jsx("div",{className:"relative bg-blue-600 text-center p-8 mb-8",children:e.jsx("div",{className:"absolute inset-x-0 -bottom-10 flex justify-center",children:e.jsx("img",{src:"/storage/logo.webp",alt:"Logo Muvausa Store",className:"w-20 h-20 p-1.5 border-4 border-white rounded-full shadow-lg bg-white"})})}),e.jsxs("div",{className:"p-6",children:[e.jsx("h2",{className:"text-2xl font-bold text-gray-900 text-center",children:"Halaman Register"}),e.jsx("p",{className:"text-gray-500 text-sm text-center mb-8",children:"Daftar dulu, baru login"}),e.jsxs("form",{onSubmit:i,children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"name",className:"block text-sm font-medium text-gray-700",children:"Nama Lengkap"}),e.jsx("input",{id:"name",type:"text",name:"name",value:r.name,placeholder:"Diisi bebas, yang penting inget",onChange:s=>t("name",s.target.value),className:"mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",required:!0}),a.name&&e.jsx("div",{className:"text-sm text-red-500 mt-1",children:a.name})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("label",{htmlFor:"email",className:"block text-sm font-medium text-gray-700",children:"Email"}),e.jsx("input",{id:"email",type:"email",name:"email",value:r.email,placeholder:"Wajib banget email aktif",onChange:s=>t("email",s.target.value),className:"mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",required:!0}),a.email&&e.jsx("div",{className:"text-sm text-red-500 mt-1",children:a.email})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("label",{htmlFor:"password",className:"block text-sm font-medium text-gray-700",children:"Password"}),e.jsx("input",{id:"password",type:"password",name:"password",value:r.password,placeholder:"Bikin yang susah tebak",onChange:s=>t("password",s.target.value),className:"mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",required:!0}),a.password&&e.jsx("div",{className:"text-sm text-red-500 mt-1",children:a.password})]}),e.jsxs("div",{className:"mt-4",children:[e.jsx("label",{htmlFor:"password_confirmation",className:"block text-sm font-medium text-gray-700",children:"Konfirmasi Password"}),e.jsx("input",{id:"password_confirmation",type:"password",name:"password_confirmation",value:r.password_confirmation,placeholder:"Samain kayak kolom password",onChange:s=>t("password_confirmation",s.target.value),className:"mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",required:!0}),a.password_confirmation&&e.jsx("div",{className:"text-sm text-red-500 mt-1",children:a.password_confirmation})]}),e.jsx("div",{className:"mt-4",children:e.jsx("button",{type:"submit",disabled:o,className:"w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",children:o?"Registering...":"Daftar"})})]}),e.jsxs("p",{className:"mt-4 text-center text-sm text-gray-600",children:["Udah punya akun?"," ",e.jsx("a",{href:"login",className:"text-blue-500 hover:underline",children:"Login di sini"})]})]})]})})}export{u as default};