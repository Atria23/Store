import{W as x,r as u,j as e,a as p,d as f}from"./app-BLuH1zmA.js";function h({token:n,email:i}){const{data:s,setData:t,post:d,processing:l,errors:r,reset:m}=x({token:n,email:i,password:"",password_confirmation:""}),o=s.email&&s.password&&s.password_confirmation;u.useEffect(()=>()=>{m("password","password_confirmation")},[]);const c=a=>{a.preventDefault(),d(route("password.store"))};return e.jsxs(e.Fragment,{children:[e.jsx(p,{title:"Reset Password"}),e.jsx("div",{className:"mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen md:h-screen",children:e.jsxs("div",{className:"min-h-[892px] md:min-h-full bg-white p-4",children:[e.jsx("form",{onSubmit:c,children:e.jsxs("div",{className:"flex flex-col items-center justify-center",children:[e.jsxs("div",{className:"w-[380px] h-max flex flex-col items-center space-y-4 mb-6",children:[e.jsx("img",{src:"/storage/logo_no_bg.png",alt:"Logo Muvausa Store",className:"w-20 p-1.5 border-4 border-white bg-white mx-auto"}),e.jsx("p",{className:"font-utama text-xl font-bold text-center",children:"Reset Password"}),e.jsx("p",{className:"font-utama text-base font-medium text-gray-600 text-center",children:"Buat password baru"})]}),e.jsxs("div",{className:"w-[380px] h-max flex flex-col space-y-4 mb-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"w-full h-max text-gray-700 text-left align-middle",children:"Email"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{id:"email",type:"email",name:"email",value:s.email,placeholder:"Wajib banget email aktif",onChange:a=>t("email",a.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",required:!0})}),r.email&&e.jsx("p",{className:"text-red-500",children:r.email})]}),e.jsxs("div",{children:[e.jsx("label",{className:"w-full h-max text-gray-700 text-left align-middle",children:"Password"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{id:"password",type:"password",name:"password",value:s.password,placeholder:"Bikin yang susah ditebak",onChange:a=>t("password",a.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",required:!0})}),r.password&&e.jsx("p",{className:"text-red-500",children:r.password})]}),e.jsxs("div",{children:[e.jsx("label",{className:"w-full h-max text-gray-700 text-left align-middle",children:"Konfirmasi Password"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{id:"password_confirmation",type:"password",name:"password_confirmation",value:s.password_confirmation,placeholder:"Samain kayak kolom password",onChange:a=>t("password_confirmation",a.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",required:!0})}),r.password_confirmation&&e.jsx("p",{className:"text-red-500",children:r.password_confirmation})]}),e.jsx("button",{type:"submit",className:`w-full text-white p-2 rounded transition ${o?l?"bg-gray-400":"bg-main hover:bg-blue-700":"bg-gray-400 cursor-not-allowed"}`,disabled:!o||l,children:l?"Memperbarui data...":"Ubah Password"})]})]})}),e.jsxs("p",{className:"absolute bottom-20 left-1/2 -translate-x-1/2 md:bottom-14 font-utama font-normal text-center text-sm text-gray-600",children:["Inget passwordnya?"," ",e.jsx(f,{href:route("login"),className:"text-blue-500 font-semibold hover:underline",children:"Coba login"})]})]})})]})}export{h as default};
