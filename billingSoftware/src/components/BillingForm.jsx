import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormGroup from './FormGroup';
import ProductForm from './ProductForm';
import ProductList from './ProductList';
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
    const [loaded, setLoaded] = useState(false);  // Track if initial data is loaded

    const date = new Date(formData.date);
    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();


    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });

        //sessionStorage.setItem('formData', JSON.stringify({ ...formData }));
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
            data: updatedData
        });

        setProduct({ name: '', quantity: '', rate: '' });
        setError(null);

        //sessionStorage.setItem('formData', JSON.stringify({ ...formData, data: updatedData }));
    };

    const removeProduct = (index) => {
        const updatedData = formData.data.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            data: updatedData
        });

        //sessionStorage.setItem('formData', JSON.stringify({ ...formData, data: updatedData }));
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

    const apiURI = import.meta.env.VITE_API_URL;

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
            const response = await axios.post(`${apiURI}/write-to-file`, formData, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${formData.partyName}_${day}_${month}_${year}.docx`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            setError('Failed to generate the report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    /* useEffect(() => {
        const savedData = sessionStorage.getItem('formData');
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
    }, []); */

    // Load data from sessionStorage when component mounts
    useEffect(() => {
        const savedData = sessionStorage.getItem('formData');
        if (savedData) {
            setFormData(JSON.parse(savedData));
        }
        setLoaded(true);  // Mark data as loaded
    }, []);

    // Update sessionStorage whenever formData changes, but only after initial load
    useEffect(() => {
        if (loaded) {
            sessionStorage.setItem('formData', JSON.stringify(formData));
        }
    }, [formData, loaded]);

    return (
        <form onSubmit={handleSubmit} className="billing-form">
            <FormGroup label="Date:" type="date" name="date" value={formData.date} onChange={handleInputChange} />

            <FormGroup label="Party Name:" type="text" name="partyName" value={formData.partyName} onChange={handleInputChange} />

            <FormGroup label="Party Address:" type="text" name="partyAddress" value={formData.partyAddress} onChange={handleInputChange} />

            <ProductForm product={product} handleProductChange={handleProductChange} addProduct={addProduct} error={error} />

            <ProductList products={formData.data} removeProduct={removeProduct} />
            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={loading} className="submit-button">
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </form>
    );
};

export default BillingForm;
