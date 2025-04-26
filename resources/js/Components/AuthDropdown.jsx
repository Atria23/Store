// import React, { useState, useRef, useEffect } from 'react'
// import { Menu, Transition } from '@headlessui/react'
// import { Link, usePage } from '@inertiajs/react'
// import { IconLogout, IconUserCog } from '@tabler/icons-react'
// import { useForm } from '@inertiajs/react'
// import MenuLink from '@/Utils/Menu'
// import LinkItem from './LinkItem'
// import LinkItemDropdown from './LinkItemDropdown'
// export default function AuthDropdown({ auth, isMobile }) {

//     // define usefrom
//     const { post } = useForm();
//     // define url from usepage
//     const { url } = usePage();

//     // define state isToggle
//     const [isToggle, setIsToggle] = useState(false);
//     // define state isOpen
//     const [isOpen, setIsOpen] = useState(false);
//     // define ref dropdown
//     const dropdownRef = useRef(null);

//     // define method handleClickOutside
//     const handleClickOutside = (event) => {
//         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//             setIsToggle(false);
//         }
//     };

//     // get menu from utils
//     const menuNavigation = MenuLink();

//     // define useEffect
//     useEffect(() => {
//         // add event listener
//         window.addEventListener("mousedown", handleClickOutside);

//         // remove event listener
//         return () => {
//             window.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     // define function logout
//     const logout = async (e) => {
//         e.preventDefault();

//         post(route('logout'));
//     }

//     return (
//         <>
            
//         </>
//     )
// }
