import React from 'react'
import FormGroup from './FormGroup'

const ProductForm = ({ product, handleProductChange, addProduct, error }) => {
    return (
        <div className='from-group'>
            <h2>Add Product</h2>

            <FormGroup
                label='Product Name'
                type='text'
                name='name'
                value={product.name}
                onChange={handleProductChange}
            />

            <FormGroup
                label='Quantity'
                type='number'
                name='quantity'
                value={product.quantity}
                onChange={handleProductChange}
            />

            <FormGroup
                label='Rate'
                type='number'
                name='rate'
                value={product.rate}
                onChange={handleProductChange}
            />

            <button type='button' onClick={addProduct} className='add-button' >
                Add Product
            </button>

            {error && <div className='error-message'>{error}</div>}

        </div>
    )
}

export default ProductForm
