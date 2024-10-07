import React from 'react'
import { NavLink } from 'react-router-dom'

const Navbar = () => {

    return (
        <div className="navbar mb-1 sticky top-0 z-50 border-b border-gray-60 bg-gradient-to-tr from-blue-900 to-blue-600 shadow-lg">
            <div className="navbar-start">

                <div className="dropdown">
                    <div tabIndex={0} role="button" className=" btn btn-ghost lg:hidden">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>

                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content rounded-box z-[1] mt-3 w-52 p-2 shadow bg-blue-950 text-white">
                        <li><a href='/'>Generate Invoice</a></li>
                        <li><a href='/contact-me'>Contact Us</a></li>
                    </ul>
                </div>

                <NavLink
                    to='/'
                    className="btn btn-ghost text-sm md:text-xl text-white font-serif"
                >
                    Invoice Generator by VGTS
                </NavLink>

            </div>
            <div className="navbar-end mr-5 hidden lg:flex">
                <ul className="gap-5 menu-horizontal px-1 text-[16px] font-semibold text-white">
                    <li >
                        <NavLink to='/' className={({ isActive }) => `${isActive ? 'bg-white text-blue-950 rounded-lg' : ''} hover:bg-gray-300 hover:text-blue-950 hover:rounded-md transition-all duration-100 p-2`}>
                            Generate Invoice
                        </NavLink>
                    </li>

                    <li>
                        <NavLink to='/contact-me' className={({ isActive }) => `${isActive ? 'bg-white text-blue-950 rounded-lg' : ''} hover:bg-gray-300 hover:text-blue-950 hover:rounded-md transition-all duration-100 p-2`}>
                            Contact Us
                        </NavLink>
                    </li>
                </ul>
            </div>

        </div>
    )
}

export default Navbar
