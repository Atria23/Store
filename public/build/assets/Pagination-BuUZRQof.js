import{j as e,d as t}from"./app-BnwNRiPF.js";import{c as n}from"./AppLayout-BRBZi8ao.js";/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var s=n("outline","chevron-left","IconChevronLeft",[["path",{d:"M15 6l-6 6l6 6",key:"svg-0"}]]);/**
 * @license @tabler/icons-react v3.1.0 - MIT
 *
 * This source code is licensed under the MIT license.
 * See the LICENSE file in the root directory of this source tree.
 */var d=n("outline","chevron-right","IconChevronRight",[["path",{d:"M9 6l6 6l-6 6",key:"svg-0"}]]);function c({links:o}){const l="p-1 text-sm border rounded-md bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:border-gray-900";return e.jsx(e.Fragment,{children:e.jsx("ul",{className:"mt-2 lg:mt-5 justify-end flex items-center gap-1",children:o.map((r,a)=>r.url!=null?r.label.includes("Previous")?e.jsx(t,{className:l,href:r.url,children:e.jsx(s,{size:"20",strokeWidth:"1.5"})},a):r.label.includes("Next")?e.jsx(t,{className:l,href:r.url,children:e.jsx(d,{size:"20",strokeWidth:"1.5"})},a):e.jsx(t,{className:`px-2 py-1 text-sm border  rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 dark:border-gray-900 ${r.active?"bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-50":"bg-white dark:bg-gray-950"}`,href:r.url,children:r.label},a):null)})})}export{c as P};
