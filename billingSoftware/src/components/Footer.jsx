import React from 'react'

const Footer = () => {
    return (
        <>
            <footer className="footer footer-center text-white  p-4  bg-gradient-to-l from-blue-950 to-blue-800 mt-auto">
                <div className='md:block hidden'>
                    <p className='font-semibold'>
                        Copyright © {new Date().getFullYear()} - Developed and Managed by VG Tech Solutions
                    </p>
                </div>
                <div className='md:hidden block'>
                    <p className='font-semibold'>
                        Copyright © {new Date().getFullYear()}
                    </p>
                    <p className='font-semibold'>
                        Developed and Managed by VG Tech Solutions
                    </p>
                </div>
            </footer>
        </>
    )
}

export default Footer
