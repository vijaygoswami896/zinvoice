import React from 'react'

const UpdateProductForm = ({ label, type, name, value, placeholderText, onChange }) => {
    return (
        <div className='flex flex-col mb-2'>
            <label htmlFor="" className='mb-1 font-semibold'>{label}</label>
            <input
                type={type}
                placeholder={placeholderText}
                name={name}
                value={value}
                onChange={onChange}
                className={`p-2 rounded-lg border border-blue-950 focus:outline-none`}
            />
        </div>
    )
}

export default UpdateProductForm
