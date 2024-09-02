import React from 'react'

const FormGroup = ({ label, type, name, value, onChange }) => {
    return (
        <div className='form-group'>
            <label htmlFor="">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className='form-input'
            />
        </div>
    )
}

export default FormGroup
