import React from 'react'

const FormGroup = ({ label, type, name, value, placeholderText, onChange, className = '' }) => {
    return (
        <div className='flex flex-col mb-4 px-5'>
            <label htmlFor="" className='mb-1 font-semibold'>{label}</label>
            <input
                type={type}
                placeholder={placeholderText}
                name={name}
                value={value}
                onChange={onChange}
                className={`p-2 rounded-lg ${className}`}
            />
        </div>
    )
}

export default FormGroup
