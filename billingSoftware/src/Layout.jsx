import React from 'react'
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer.jsx';

const Layout = () => {
    return (
        <div className='min-h-screen flex flex-col'>
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    )
}

export default Layout
