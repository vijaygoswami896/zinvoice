import React from 'react'

const ProductList = ({ products, removeProduct }) => {
    return (
        <div>
            <h2>Product List</h2>

            <table className='product-table'>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Rate</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => (
                        <tr key={index}>
                            <td>{product.name}</td>
                            <td>{product.quantity}</td>
                            <td>{product.rate}</td>
                            <td>
                                <button type='button' onClick={() => removeProduct(index)} className='remove-button'>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default ProductList
