import { FaWhatsapp } from 'react-icons/fa';

const ContactMe = () => {
    return (
        <div className='max-w-full  flex-grow mb-4  flex justify-center bg-blue-50'>
            <div className="container mx-auto p-6 mt-4 max-w-10/12 w-10/12 shadow-lg shadow-gray-600 rounded-lg ">

                {/* Heading */}
                <h1
                    className="text-2xl font-bold text-center mb-4 p-2  shadow-md shadow-gray-500 rounded-2xl bg-gradient-to-l from-blue-800 to-blue-950 text-white"
                >
                    Contact Us
                </h1>

                <div className=' mb-4 flex justify-center border border-blue-950 shadow-md shadow-gray-500 rounded-2xl bg-gradient-to-tl from-blue-50 to-blue-100 text-blue-950'>
                    {/* Services Section */}
                    <section className=" w-11/12 p-2 mt-2 mb-2">
                        <h2 className="text-2xl font-semibold mb-2">Services We Provide</h2>
                        <ul className="list-disc ml-6 space-y-1 md:grid md:grid-cols-3 items-center ">
                            <li>Custom Software Solutions</li>
                            <li>Website Development</li>
                            <li>Final Year Projects for Students</li>
                            <li>Training on MERN Stack</li>
                            <li>Web Designing</li>
                            <li>HTML, CSS and JavaScript</li>
                            <li>React.js</li>
                            <li>Node.js</li>
                            <li>Express.js</li>
                            <li>MongoDB</li>
                        </ul>
                    </section>

                </div>

                <div className='mb-6 flex justify-center border border-blue-950 shadow-md shadow-gray-500 rounded-2xl bg-gradient-to-tl from-blue-50 to-blue-100'>
                    <div className='flex flex-col md:flex-row md:gap-x-64 md:items-center w-11/12 mt-4 mb-6 '>

                        {/* Contact Details Section */}
                        <section className="md:mb-0 mb-5">
                            <h2 className="text-2xl font-semibold mb-2">Contact Details</h2>
                            <p><b>Email :</b> gurusacademy2021@gmail.com</p>
                            <p><b>Mobile :</b> +91 92659 99628</p>
                        </section>

                    </div>
                </div>

                <div className='mb-6 flex justify-center border border-blue-950 shadow-md shadow-gray-500 rounded-2xl bg-gradient-to-tl from-blue-50 to-blue-100'>
                    <div className='flex flex-col md:flex-row md:gap-x-64 md:items-center w-11/12 mt-4 mb-6 '>
                        {/* Class Location */}
                        <section className="mb-0  max-w-md">
                            <h2 className="text-2xl font-semibold mb-2">Address</h2>
                            <p> 1943, Taliya Ni Pol, nr. Goverdhan Temple, Old City, Khadia, Ahmedabad, Gujarat 380001</p>
                        </section>

                    </div>
                </div>

                <div className='px-5 py-2 mt-0 mb-10 flex flex-col  justify-center border border-blue-950 shadow-md shadow-gray-500 rounded-2xl'>
                    <h3 className="text-2xl font-semibold mb-4 text-blue-950">Location on Google Map</h3>
                    <iframe
                        className='focus:outline-none rounded-xl'
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3672.0402471780376!2d72.5940735744632!3d23.022294416340213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e8515b2a3928f%3A0xa2aa6781080787b3!2sGuru&#39;s%20Academy%20Computer%20Education!5e0!3m2!1sen!2sin!4v1727795556016!5m2!1sen!2sin"
                        width="100%"
                        height="400"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    >

                    </iframe>
                </div>

                <div className='flex md:justify-end justify-center'>
                    {/* WhatsApp Button */}
                    <section className="text-center">
                        <a
                            href="https://wa.me/919265999628"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-6 py-3 rounded-full flex justify-center items-center"
                        >
                            <FaWhatsapp className="mr-2" /> Chat with us
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ContactMe;
