import React from 'react'
import BillingForm from './BillingForm'

const BillingFormContainer = () => {
    return (
        <div className="p-4 border h-screen ">
            <div className='shadow-lg shadow-black rounded-xl p-4 bg-gray-100 '>
                <h1 className='font-serif text-center font-bold text-3xl my-5 text-blue-950'>Billing Form</h1>

                <BillingForm />
            </div>
        </div>
    )
}

export default BillingFormContainer
