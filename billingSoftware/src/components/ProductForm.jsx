import React, { useEffect } from 'react'
import FormGroup from './FormGroup'
import { setFormData, setProduct, setError, setLoaded, setLoading, removeProduct, selectFormData, selectError, selectLoaded, selectLoading, selectProduct } from '../store/formSlice';
import { useSelector, useDispatch } from 'react-redux';

const ProductForm = () => {

    const dispatch = useDispatch();

    const formData = useSelector(selectFormData);
    const product = useSelector(selectProduct);
    const error = useSelector(selectError);
    const loaded = useSelector(selectLoaded);

    //console.log("loaded : ", loaded);

    //console.log("product 123: ", product);
    /*console.log("products : ", products); */

    const addProduct = () => {
        if (!product.name || !product.quantity || !product.unit || !product.rate) {
            dispatch(setError('Please fill out all product details.'));
            return;
        }

        const updatedData = [...formData.data, product];
        dispatch(setFormData({ ...formData, data: updatedData }));

        dispatch(setProduct({ name: '', quantity: '', unit: '', rate: '' }));
        dispatch(setError(null));
        //dispatch(setLoaded(true));

        //sessionStorage.setItem('formData', JSON.stringify({ ...formData, data: updatedData }));
    };

    /* useEffect(() => {
        if (loaded) {
            sessionStorage.setItem('formData', JSON.stringify(formData));
            dispatch(setLoaded(false));
        }
    }, []) */

    const handleProductChange = (e) => {
        const { name, value } = e.target;

        dispatch(setProduct({ ...product, [name]: value }));
    };

    return (
        <div className='mt-10'>
            <h2 className='font-serif font-bold text-xl mb-2 p-1 ml-3 text-blue-950 rounded-full'>Add Product</h2>

            <FormGroup
                label='Product Name'
                type='text'
                placeholderText='Enter Product Name'
                name='name'
                value={product?.name}
                onChange={handleProductChange}
            />

            <FormGroup
                label='Quantity'
                type='number'
                placeholderText='Enter Product Quantity'
                name='quantity'
                value={product?.quantity}
                onChange={handleProductChange}
            />

            <FormGroup
                label='Unit (mtr, ft, pcs etc.)'
                type='text'
                placeholderText='Enter Product Unit (mtr, ft, pcs)'
                name='unit'
                value={product?.unit}
                onChange={handleProductChange}
            />

            <FormGroup
                label='Rate'
                type='number'
                placeholderText='Enter Product Rate'
                name='rate'
                value={product?.rate}
                onChange={handleProductChange}
            />

            <div className='flex items-center justify-center mb-4 mt-5'>
                <button
                    type='button'
                    onClick={addProduct}
                    className='p-2 bg-blue-900 text-white font-semibold px-10 rounded-full ' >
                    Add Product
                </button>
            </div>

            {error && <div className='text-red-500 ml-3'>{error}</div>}

        </div>
    )
}

export default ProductForm
