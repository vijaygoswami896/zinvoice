// import React, { useEffect, useState } from 'react'
// import { setFormData, setProduct, setError, setLoaded, setLoading, removeProduct, setIsModalLoading, selectFormData, selectError, selectLoaded, selectLoading, selectProduct, selectIsModalLoading, clearProductData } from '../store/formSlice';
// import { useSelector, useDispatch } from 'react-redux';
// import UpdateProductForm from './UpdateProductForm';

// const ProductList = () => {

//     const [selectedProductIndex, setSelectedProductIndex] = useState(null);
//     const [isDeleteModelOpen, setIsDeleteModelOpen] = useState(false);

//     const dispatch = useDispatch();

//     const formData = useSelector(selectFormData);
//     const products = formData.data;
//     const isModalLoading = useSelector(selectIsModalLoading);
//     const product = useSelector(selectProduct);

//     const totalAmount = formData.data.reduce((acc, item) => {
//         return acc += (Number(item.rate) * Number(item.quantity));
//     }, 0);

//     const handleUpdateButton = (e, index) => {
//         e.preventDefault();

//         dispatch(setIsModalLoading(true));
//         setSelectedProductIndex(index);
//         // dispatch(setProduct(selectedProduct))
//         //console.log(index);
//     }

//     useEffect(() => {
//         if (selectedProductIndex !== null) {
//             const selectedProduct = products[selectedProductIndex];
//             //console.log("selectedProduct : ", selectedProduct);
//             dispatch(setProduct(selectedProduct));
//         }
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [selectedProductIndex]);

//     const handleNoButton = (e) => {
//         e.preventDefault();

//         const { name } = e.target;

//         //console.log("name : ", name);

//         if (name === "no-button-from-update") {
//             dispatch(clearProductData());
//             dispatch(setIsModalLoading(false));
//             setSelectedProductIndex(null);
//         } else if (name === "no-button-from-dlt") {
//             //console.log(name);
//             setIsDeleteModelOpen(false);  // Close delete modal
//             setSelectedProductIndex(null);
//             dispatch(clearProductData());
//         }
//     }

//     const handleProductChange = (e) => {
//         const { name, value } = e.target;
//         dispatch(setProduct({ ...product, [name]: value }));
//     }

//     const handleUpdateProduct = () => {
//         const updatedData = products.map((item, index) =>
//             index === selectedProductIndex ? product : item);
//         dispatch(setFormData({ ...formData, data: updatedData }));
//         dispatch(setIsModalLoading(false));
//         dispatch(clearProductData());
//         setSelectedProductIndex(null);
//     }

//     const handleDeleteButton = (index) => {
//         setIsDeleteModelOpen(true);
//         // You should store the index of the product you want to delete
//         setSelectedProductIndex(index);
//     }

//     const handleConfirmDelete = (e) => {
//         e.preventDefault();
//         dispatch(removeProduct(selectedProductIndex));  // Perform delete operation
//         setIsDeleteModelOpen(false);  // Close the modal
//         setSelectedProductIndex(null);  // Clear selection
//         dispatch(clearProductData());
//     }

//     return (
//         <div className='mt-1'>
//             <h2 className='font-bold text-lg ml-3'>Product List</h2>

//             <div className='ml-2 mr-4'>

//                 {/* ── Desktop table ── */}
//                 <div className='hidden md:block'>
//                     <table className='w-full mt-1 custom-table'>
//                         <thead className=''>
//                             <tr className=''>
//                                 <th className='custom-table-header-cell'>Product</th>
//                                 <th className='custom-table-header-cell'>Qty</th>
//                                 <th className='custom-table-header-cell'>Unit</th>
//                                 <th className='custom-table-header-cell'>Rate</th>
//                                 <th className='custom-table-header-cell'>Total</th>
//                                 <th className='custom-table-header-cell'>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className=''>
//                             {products.map((item, index) => (
//                                 <tr key={index}>
//                                     <td className='text-left! custom-cell w-2/5'>{item.name}</td>
//                                     <td className='custom-cell'>{item.quantity}</td>
//                                     <td className='custom-cell'>{item.unit}</td>
//                                     <td className='custom-cell'>{item.rate}</td>
//                                     <td className='custom-cell'>{(item.rate * item.quantity)}</td>
//                                     <td className='custom-cell'>
//                                         <div className='flex justify-center items-center gap-1'>
//                                             <button
//                                                 type='button'
//                                                 onClick={(e) => handleUpdateButton(e, index)}
//                                                 className=' text-green-700'
//                                             >
//                                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
//                                                     <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
//                                                     <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
//                                                 </svg>

//                                             </button>

//                                             <button
//                                                 type='button'
//                                                 onClick={() => handleDeleteButton(index)}
//                                                 className='text-red-700'>

//                                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
//                                                     <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
//                                                 </svg>

//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* ── Mobile cards ── */}
//                 <div className='md:hidden mt-2 flex flex-col gap-2'>
//                     {products.length === 0 ? (
//                         <p className='text-center text-gray-400 py-8'>No products added yet.</p>
//                     ) : (
//                         products.map((item, index) => (
//                             <div key={index} className='border border-gray-200 rounded-lg p-3 bg-white shadow-xs'>
//                                 {/* Name + actions row */}
//                                 <div className='flex justify-between items-start gap-2 mb-2'>
//                                     <span className='font-semibold text-blue-950 text-sm leading-tight'>{item.name}</span>
//                                     <div className='flex gap-2 shrink-0'>
//                                         <button type='button' onClick={(e) => handleUpdateButton(e, index)}
//                                             className='text-green-700'>
//                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
//                                                 <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
//                                                 <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
//                                             </svg>
//                                         </button>
//                                         <button type='button' onClick={() => handleDeleteButton(index)}
//                                             className='text-red-700'>
//                                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
//                                                 <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
//                                             </svg>
//                                         </button>
//                                     </div>
//                                 </div>

//                                 {/* Details grid */}
//                                 <div className='grid grid-cols-3 gap-1 text-xs'>
//                                     <div className='bg-gray-50 rounded-sm p-2'>
//                                         <p className='text-gray-400 uppercase tracking-wide text-[10px] mb-0.5'>Qty</p>
//                                         <p className='font-medium text-blue-950'>{item.quantity}</p>
//                                     </div>
//                                     <div className='bg-gray-50 rounded-sm p-2'>
//                                         <p className='text-gray-400 uppercase tracking-wide text-[10px] mb-0.5'>Unit</p>
//                                         <p className='font-medium text-blue-950'>{item.unit}</p>
//                                     </div>
//                                     <div className='bg-gray-50 rounded-sm p-2'>
//                                         <p className='text-gray-400 uppercase tracking-wide text-[10px] mb-0.5'>Rate</p>
//                                         <p className='font-medium text-blue-950'>{item.rate}</p>
//                                     </div>
//                                 </div>

//                                 {/* Total */}
//                                 <div className='mt-2 flex justify-end items-center gap-1 text-sm font-semibold text-blue-950'>
//                                     <span className='text-gray-400 font-normal text-xs'>Total:</span>
//                                     <span>₹{(item.rate * item.quantity).toLocaleString('en-IN')}</span>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>

//                 {isDeleteModelOpen && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto mt-15">
//                         <div className="bg-white p-6 rounded-lg md:w-5/12 w-10/12 max-h-screen overflow-y-auto mt-20">

//                             <h3 className="text-2xl font-bold mb-2 text-red-700">Delete Product</h3>

//                             <h4 className="text-lg font-semibold mb-4">Are you sure you want to Delete this product.</h4>

//                             <div>
//                                 <button
//                                     type="button"

//                                     className="bg-red-700 text-white px-5 py-2 rounded-lg hover:cursor-pointer hover:bg-red-600"
//                                     onClick={(e) => handleConfirmDelete(e)}
//                                 >
//                                     Yes
//                                 </button>

//                                 <button
//                                     className="bg-blue-950 text-white px-5 py-2 rounded-lg mx-2 hover:cursor-pointer hover:bg-blue-800"
//                                     name='no-button-from-dlt'
//                                     onClick={(e) => handleNoButton(e)}
//                                 >
//                                     No
//                                 </button>
//                             </div>

//                         </div>
//                     </div>
//                 )}

//                 <div className='flex justify-center'>
//                     <div className='w-9/12 mt-4 p-2 shadow-lg text-blue-950 flex justify-center items-center gap-2 text-xl font-serif font-bold'>
//                         <h2 className=''>Total</h2>
//                         <h2 className=''>:</h2>
//                         <h2 className=''>{totalAmount}</h2>
//                     </div>
//                 </div>
//             </div>


//             {isModalLoading && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto mt-15">
//                     <div className="bg-white p-6 rounded-lg md:w-5/12 w-10/12 max-h-screen overflow-y-auto mt-20">

//                         <h3 className="text-2xl font-bold mb-2 text-blue-700">
//                             Update Product
//                         </h3>

//                         <div className='my-4 flex flex-col'>
//                             <UpdateProductForm
//                                 label='Product Name'
//                                 type='text'
//                                 placeholderText='Enter Product Name'
//                                 name='name'
//                                 value={product.name}
//                                 onChange={handleProductChange}
//                             />

//                             <UpdateProductForm
//                                 label='Quantity'
//                                 type='number'
//                                 placeholderText='Enter Product Quantity'
//                                 name='quantity'
//                                 value={product.quantity}
//                                 onChange={handleProductChange}
//                             />

//                             <UpdateProductForm
//                                 label='Unit (mtr, ft, pcs etc.)'
//                                 type='text'
//                                 placeholderText='Enter Product Unit (mtr, ft, pcs)'
//                                 name='unit'
//                                 value={product.unit}
//                                 onChange={handleProductChange}
//                             />

//                             <UpdateProductForm
//                                 label='Rate'
//                                 type='number'
//                                 placeholderText='Enter Product Rate'
//                                 name='rate'
//                                 value={product.rate}
//                                 onChange={handleProductChange}
//                             />
//                         </div>

//                         <div>
//                             <button
//                                 className="bg-green-700  text-white px-5 py-2 rounded-lg hover:cursor-pointer hover:bg-green-600"
//                                 onClick={() => handleUpdateProduct()}
//                             >
//                                 Update
//                             </button>

//                             <button
//                                 className="bg-blue-950 text-white px-5 py-2 rounded-lg mx-2 hover:cursor-pointer hover:bg-blue-800"
//                                 name='no-button-from-update'
//                                 onClick={(e) => handleNoButton(e)}

//                             >
//                                 Cancel
//                             </button>
//                         </div>

//                     </div>
//                 </div>
//             )}



//         </div >
//     )
// }

// export default ProductList
