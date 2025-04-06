import{W as h,r as n,j as e,a as f,d as b}from"./app-BLuH1zmA.js";function j({canResetPassword:c}){const{data:s,setData:t,post:i,processing:l,errors:r,reset:u}=h({email:"",password:"",remember:!1}),o=s.email&&s.password,[m,d]=n.useState(!1),x=()=>{t({email:"guest@muvausa.com",password:"guest",remember:!1}),d(!0)};n.useEffect(()=>{m&&s.email==="guest@muvausa.com"&&(i(route("login")),d(!1))},[s,m]),n.useEffect(()=>()=>{u("password")},[]);const g=a=>{a.preventDefault(),i(route("login"))};return e.jsxs(e.Fragment,{children:[e.jsx(f,{title:"Login"}),e.jsx("div",{className:"mx-auto w-full max-w-[412px] max-h-[892px] min-h-screen md:h-screen",children:e.jsxs("div",{className:"min-h-[892px] md:min-h-full bg-white p-4",children:[e.jsx("form",{onSubmit:g,children:e.jsxs("div",{className:"flex flex-col items-center justify-center",children:[e.jsxs("div",{className:"w-[380px] h-max flex flex-col items-center space-y-4 mb-6",children:[e.jsx("img",{src:"/storage/logo_no_bg.png",alt:"Logo Muvausa Store",className:"w-20 p-1.5 border-4 border-white bg-white mx-auto"}),e.jsx("p",{className:"font-utama text-xl font-bold text-center",children:"Login"}),e.jsx("p",{className:"font-utama text-base font-medium text-gray-600 text-center",children:"Khusus buat kamu yang udah daftar"})]}),e.jsxs("div",{className:"w-[380px] h-max flex flex-col space-y-4 mb-6",children:[e.jsxs("div",{children:[e.jsx("label",{className:"w-full h-max text-gray-700 text-left align-middle",children:"Email"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{id:"email",type:"email",name:"email",value:s.email,placeholder:"Jangan isi email palsu lho ya, kita tahu kok!",onChange:a=>t("email",a.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",required:!0})}),r.email&&e.jsx("p",{className:"text-red-500",children:r.email})]}),e.jsxs("div",{children:[e.jsx("label",{className:"w-full h-max text-gray-700 text-left align-middle",children:"Password"}),e.jsx("div",{className:"w-full h-9 flex flex-row mx-auto items-center justify-center rounded-lg bg-neutral-100 border-2 border-gray-200",children:e.jsx("input",{id:"password",type:"password",name:"password",value:s.password,placeholder:"janji nggak kita kasih password kamu ke kucing",onChange:a=>t("password",a.target.value),className:"bg-transparent text-sm border-none flex-grow focus:ring-0 focus:outline-none placeholder-gray-400",required:!0})}),r.password&&e.jsx("p",{className:"text-red-500",children:r.password})]}),e.jsxs("div",{className:"flex items-center justify-between mt-4",children:[e.jsxs("label",{className:"flex items-center",children:[e.jsx("input",{type:"checkbox",name:"remember",checked:s.remember,onChange:a=>t("remember",a.target.checked),className:"h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"}),e.jsx("span",{className:"ml-2 text-sm text-gray-600",children:"Ingetin Saya"})]}),c&&e.jsx(b,{href:route("password.request"),className:"text-sm text-blue-500 hover:underline",children:"Lupa Password?"})]}),e.jsx("button",{type:"submit",className:`w-full text-white p-2 rounded transition ${o?l?"bg-gray-400":"bg-main hover:bg-blue-700":"bg-gray-400 cursor-not-allowed"}`,disabled:!o||l,children:l?"Validasi data...":"Masuk"})]})]})}),e.jsxs("div",{className:"flex items-center w-full mb-6",children:[e.jsx("div",{className:"flex-grow border-t border-gray-300"}),e.jsx("span",{className:"px-3 text-gray-500 text-sm",children:"atau"}),e.jsx("div",{className:"flex-grow border-t border-gray-300"})]}),e.jsx("button",{type:"button",onClick:x,className:"w-full text-white p-2 rounded transition bg-main hover:bg-blue-700",children:"Login sebagai Tamu"}),e.jsxs("p",{className:"absolute bottom-20 left-1/2 -translate-x-1/2 md:bottom-14 font-utama font-normal text-center text-sm text-gray-600",children:["Belum punya akun?"," ",e.jsx("a",{href:"register",className:"text-blue-500 font-semibold hover:underline",children:"Daftar dulu"})]})]})})]})}export{j as default};
