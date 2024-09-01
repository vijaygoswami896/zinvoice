import React, { useState,useEffect } from 'react';
import axios from 'axios';
import '../assets/BillingForm.css'; // Import the CSS file for styling

const BillingForm = () => {
    const [formData, setFormData] = useState({
        date: '',
        partyName: '',
        partyAddress: '',
        data: []
    });
    const [product, setProduct] = useState({
        name: '',
        quantity: '',
        rate: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProduct({
            ...product,
            [name]: value
        });
    };

    const addProduct = () => {
        if (!product.name || !product.quantity || !product.rate) {
            setError('Please fill out all product details.');
            return;
        }
        const updatedData = [...formData.data, product];
        setFormData({
            ...formData,
            //data: [...formData.data, product]
            data: updatedData
        });
        setProduct({ name: '', quantity: '', rate: '' });
        setError(null);
        sessionStorage.setItem('formData', JSON.stringify({ ...formData, data: updatedData }))
    };

    const removeProduct = (index) => {
        const updatedData = formData.data.filter((_, i) => i != index);
        setFormData({
            ...formData,
            //data: formData.data.filter((_, i) => i !== index)
            data: updatedData
        });
        sessionStorage.setItem('formData', JSON.stringify({ ...formData, data: updatedData }))
    };

    const validateForm = () => {
        if (!formData.date || !formData.partyName || !formData.partyAddress) {
            return 'Please fill out all required fields.';
        }
        if (formData.data.length === 0) {
            return 'Please add at least one product.';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const response = await axios.post('https://billingsoftware-backend.onrender.com/write-to-file', formData, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'billing_report.docx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error submitting form:', error);
            setError('Failed to generate the report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedData = sessionStorage.getItem('formData');
        if (savedData) {
            setFormData(JSON.parse(savedData));
            console.log("formData 555: ", formData);

        }
    }, []);

    return (
        <div className="billing-form-container">
            <h1>Billing Form</h1>
            <form onSubmit={handleSubmit} className="billing-form">
                <div className="form-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Party Name:</label>
                    <input
                        type="text"
                        name="partyName"
                        value={formData.partyName}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label>Party Address:</label>
                    <input
                        type="text"
                        name="partyAddress"
                        value={formData.partyAddress}
                        onChange={handleInputChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <h2>Add Product</h2>
                    <label>Product Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleProductChange}
                        className="form-input"
                    />
                    <label>Quantity:</label>
                    <input
                        type="number"
                        name="quantity"
                        value={product.quantity}
                        onChange={handleProductChange}
                        className="form-input"
                    />
                    <label>Rate:</label>
                    <input
                        type="number"
                        name="rate"
                        value={product.rate}
                        onChange={handleProductChange}
                        className="form-input"
                    />
                    <button type="button" onClick={addProduct} className="add-button">Add Product</button>
                    {error && <div className="error-message">{error}</div>}
                </div>
                <div>
                    <h2>Product List</h2>
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.data.map((product, index) => (
                                <tr key={index}>
                                    <td>{product.name}</td>
                                    <td>{product.quantity}</td>
                                    <td>{product.rate}</td>
                                    <td>
                                        <button type="button" onClick={() => removeProduct(index)} className="remove-button">
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default BillingForm;
