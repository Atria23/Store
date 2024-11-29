import{c as t}from"./AppLayout-CXixk7xw.js";import{W as d,j as a}from"./app-CSB-8q_0.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var u=t("outline","database-off","IconDatabaseOff",[["path",{d:"M12.983 8.978c3.955 -.182 7.017 -1.446 7.017 -2.978c0 -1.657 -3.582 -3 -8 -3c-1.661 0 -3.204 .19 -4.483 .515m-2.783 1.228c-.471 .382 -.734 .808 -.734 1.257c0 1.22 1.944 2.271 4.734 2.74",key:"svg-0"}],["path",{d:"M4 6v6c0 1.657 3.582 3 8 3c.986 0 1.93 -.067 2.802 -.19m3.187 -.82c1.251 -.53 2.011 -1.228 2.011 -1.99v-6",key:"svg-1"}],["path",{d:"M4 12v6c0 1.657 3.582 3 8 3c3.217 0 5.991 -.712 7.261 -1.74m.739 -3.26v-4",key:"svg-2"}],["path",{d:"M3 3l18 18",key:"svg-3"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var h=t("outline","search","IconSearch",[["path",{d:"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0",key:"svg-0"}],["path",{d:"M21 21l-6 -6",key:"svg-1"}]]);function f({url:s,placeholder:c}){const{data:r,setData:o,get:n}=d({search:""}),g=e=>{e.preventDefault(),n(`${s}?search=${r.search}`)};return a.jsx("form",{onSubmit:g,children:a.jsxs("div",{className:"relative",children:[a.jsx("input",{type:"text",value:r.search,onChange:e=>o("search",e.target.value),className:"py-2 px-4 pr-11 block w-full rounded-lg text-sm border focus:outline-none focus:ring-0 focus:ring-gray-400 text-gray-700 bg-white border-gray-200 focus:border-gray-200 dark:focus:ring-gray-500 dark:focus:border-gray-800 dark:text-gray-200 dark:bg-gray-950 dark:border-gray-900",placeholder:c}),a.jsx("div",{className:"absolute inset-y-0 right-0 flex items-center pointer-events-none pr-4",children:a.jsx(h,{className:"text-gray-500 w-5 h-5"})})]})})}export{u as I,f as S};
